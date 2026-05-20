/**
 * Hermes pipeline: read gap queue → generate → validate → PR → notify.
 *
 * One pass per pending gap. Each step updates the gap's status in-place so
 * the queue file reflects pipeline progress even if a later step crashes.
 *
 *   pending → processing → vendored
 *                       → synced     (needs-review band — PR draft only)
 *                       → declined   (failed score < MIN_SCORE_REVIEW)
 *
 * Status mapping notes:
 *   - "vendored"  : score ≥ MIN_SCORE_AUTO_MERGE AND gates pass → live PR
 *   - "synced"    : score in review band OR test failure → draft PR
 *   - "declined"  : score < MIN_SCORE_REVIEW → no PR opened
 *
 * (We map needs-review/failed to existing GapStatus values to avoid extending
 *  the queue schema. The Slack message + pipeline outcome carry the richer
 *  state for ops visibility.)
 */
import type { GapEntry, GapQueue, GapStatus } from "./gap-queue.js"
import { defaultQueuePath, readQueue, writeQueue } from "./gap-queue.js"
import type { WorkerConfig } from "./config.js"
import { generateBlock, type GeneratorDeps } from "./generator.js"
import { createPr, type PrCreatorDeps } from "./pr-creator.js"
import { pickScaffold } from "./scaffold-picker.js"
import { buildSlackPayload, notifySlack, type SlackNotifierDeps } from "./slack-notifier.js"
import {
  defaultLogger,
  type PipelineLogger,
  type PipelineOutcome,
} from "./types.js"
import { validateGenerated, type ValidateOpts } from "./validator.js"

export type PipelineDeps = {
  generator?: GeneratorDeps
  prCreator?: PrCreatorDeps
  slackNotifier?: SlackNotifierDeps
  validateOpts?: ValidateOpts
  logger?: PipelineLogger
  /** Override queue path (default `~/.dash/gap-queue.json`). */
  queuePath?: string
  /**
   * Optional health-server tap. When provided, `runWatch` calls these after
   * each iteration so the /health endpoint reflects fresh state.
   */
  health?: {
    recordPoll: (pendingGaps: number) => void
    incrementProcessed: (n?: number) => void
  }
}

function updateGapStatus(
  queuePath: string,
  gapId: string,
  patch: Partial<GapEntry>,
): void {
  const queue = readQueue(queuePath)
  const idx = queue.entries.findIndex((e) => e.id === gapId)
  if (idx < 0) return
  queue.entries[idx] = { ...queue.entries[idx], ...patch }
  writeQueue(queue, queuePath)
}

/** Map a pipeline outcome to a GapStatus persisted in the queue. */
function statusForOutcome(outcome: PipelineOutcome): GapStatus {
  if (outcome.kind === "vendored") return "vendored"
  if (outcome.kind === "needs-review") return "synced"
  if (outcome.kind === "failed") return "declined"
  return "pending"
}

/** Process exactly one gap through the full pipeline. */
export async function processGap(
  gap: GapEntry,
  config: WorkerConfig,
  deps: PipelineDeps = {},
): Promise<PipelineOutcome> {
  const log = deps.logger ?? defaultLogger()
  const queuePath = deps.queuePath ?? defaultQueuePath()

  // Mark processing — survives crashes for visibility, even though we don't
  // have a real "processing" enum value in the queue schema (we leave the
  // status as "pending" but the dashboard can read `generated_block_path` as
  // a soft signal once we touch it below).
  log.info("gap.start", { id: gap.id, desc: gap.description })

  let gen
  try {
    gen = await generateBlock(gap, config, deps.generator)
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    log.error("gap.generate.failed", { id: gap.id, reason })
    const outcome: PipelineOutcome = {
      kind: "failed",
      gap,
      score: null,
      reason: `generator threw: ${reason}`,
    }
    updateGapStatus(queuePath, gap.id, { status: statusForOutcome(outcome) })
    await notifySlack(buildSlackPayload(outcome, null), config, deps.slackNotifier)
    return outcome
  }

  const scaffold = pickScaffold(gap.description)
  const validation = await validateGenerated(gap, gen.source, deps.validateOpts)
  const gatesPassed =
    validation.typecheckPassed && validation.testsPassed && validation.auditClean

  log.info("gap.scored", {
    id: gap.id,
    score: validation.score,
    gatesPassed,
  })

  let outcome: PipelineOutcome

  if (validation.score < config.minScoreReview) {
    outcome = {
      kind: "failed",
      gap,
      score: validation.score,
      reason: `score ${validation.score} < MIN_SCORE_REVIEW (${config.minScoreReview})`,
    }
  } else if (validation.score >= config.minScoreAutoMerge && gatesPassed) {
    const pr = await createPr(
      {
        gap,
        blockName: scaffold.name,
        blockPath: gen.writtenTo ?? "(stubbed)",
        validation,
        draft: false,
      },
      config,
      deps.prCreator,
    )
    outcome = { kind: "vendored", gap, score: validation.score, pr }
  } else {
    const reason = !gatesPassed
      ? `validation gates failed (tc=${validation.typecheckPassed} test=${validation.testsPassed} audit=${validation.auditClean})`
      : `score ${validation.score} in review band [${config.minScoreReview}-${config.minScoreAutoMerge})`
    const pr = await createPr(
      {
        gap,
        blockName: scaffold.name,
        blockPath: gen.writtenTo ?? "(stubbed)",
        validation,
        draft: true,
      },
      config,
      deps.prCreator,
    )
    outcome = { kind: "needs-review", gap, score: validation.score, pr, reason }
  }

  updateGapStatus(queuePath, gap.id, {
    status: statusForOutcome(outcome),
    generated_block_path: gen.writtenTo,
  })
  await notifySlack(
    buildSlackPayload(outcome, scaffold.name),
    config,
    deps.slackNotifier,
  )
  log.info("gap.done", { id: gap.id, kind: outcome.kind })
  return outcome
}

/**
 * One-shot run: process every `pending` gap, then return outcomes.
 */
export async function runOnce(
  config: WorkerConfig,
  deps: PipelineDeps = {},
): Promise<PipelineOutcome[]> {
  const queuePath = deps.queuePath ?? defaultQueuePath()
  const queue: GapQueue = readQueue(queuePath)
  const pending = queue.entries.filter((e) => e.status === "pending")
  const outcomes: PipelineOutcome[] = []
  for (const gap of pending) {
    const outcome = await processGap(gap, config, { ...deps, queuePath })
    outcomes.push(outcome)
  }
  return outcomes
}

/**
 * Daemon: poll every `config.pollIntervalMs` and process pending gaps. Exits
 * when `signal` aborts.
 */
export async function runWatch(
  config: WorkerConfig,
  deps: PipelineDeps & { signal?: AbortSignal } = {},
): Promise<void> {
  const log = deps.logger ?? defaultLogger()
  log.info("watch.start", { intervalMs: config.pollIntervalMs })
  while (!deps.signal?.aborted) {
    try {
      const outcomes = await runOnce(config, deps)
      if (deps.health) {
        // Pending gaps remaining = whatever's still pending after this pass.
        const queue = readQueue(deps.queuePath ?? defaultQueuePath())
        const pending = queue.entries.filter((e) => e.status === "pending").length
        deps.health.recordPoll(pending)
        deps.health.incrementProcessed(outcomes.length)
      }
    } catch (err) {
      log.error("watch.iteration.error", {
        reason: err instanceof Error ? err.message : String(err),
      })
      // Still record the poll attempt — operationally we want /health to
      // distinguish "stuck" (no polls landing) from "iteration errored".
      if (deps.health) deps.health.recordPoll(-1)
    }
    await sleep(config.pollIntervalMs, deps.signal)
  }
  log.info("watch.stop")
}

/** Trigger a single gap by id (CLI helper). */
export async function processGapById(
  gapId: string,
  config: WorkerConfig,
  deps: PipelineDeps = {},
): Promise<PipelineOutcome | null> {
  const queuePath = deps.queuePath ?? defaultQueuePath()
  const queue = readQueue(queuePath)
  const gap = queue.entries.find((e) => e.id === gapId || e.id.startsWith(gapId))
  if (!gap) return null
  return processGap(gap, config, { ...deps, queuePath })
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(t)
      resolve()
    }
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}
