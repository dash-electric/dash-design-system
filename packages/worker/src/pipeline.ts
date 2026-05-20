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
import {
  computeKey as defaultComputeKey,
  defaultStorePath as defaultIdempotencyStorePath,
  getEntry as defaultGetEntry,
  isDisabled as defaultIsDisabled,
  isProcessed as defaultIsProcessed,
  loadStore as defaultLoadStore,
  recordOutcome as defaultRecordOutcome,
  writeStore as defaultWriteStore,
  type IdempotencyEntry,
  type IdempotencyOutcome,
  type IdempotencyStore,
} from "./lib/idempotency.js"
import { createPr, type PrCreatorDeps } from "./pr-creator.js"
import { pickScaffold } from "./scaffold-picker.js"
import { buildSlackPayload, notifySlack, type SlackNotifierDeps } from "./slack-notifier.js"
import {
  defaultLogger,
  type PipelineLogger,
  type PipelineOutcome,
} from "./types.js"
import { validateGenerated, type ValidateOpts } from "./validator.js"

/**
 * Pluggable idempotency surface — pipeline uses this so tests can inject
 * in-memory stores instead of touching the filesystem.
 *
 * Default impl (file-backed at ~/.dash/hermes-idempotency.json) is wired
 * in `defaultIdempotencyDeps` below.
 */
export type IdempotencyDeps = {
  /** Compute the deterministic key for a gap. */
  computeKey: (gap: GapEntry) => string
  /** Load store from disk (or in-memory). Auto-evicts stale on read. */
  loadStore: () => IdempotencyStore
  /** Check key presence. */
  isProcessed: (key: string, store: IdempotencyStore) => boolean
  /** Fetch full entry for prior-outcome replay. */
  getEntry: (key: string, store: IdempotencyStore) => IdempotencyEntry | null
  /** Pure: returns a new store with outcome added. */
  recordOutcome: (
    key: string,
    entry: IdempotencyEntry,
    store: IdempotencyStore,
  ) => IdempotencyStore
  /** Persist store. Atomic write on disk-backed impl. */
  writeStore: (store: IdempotencyStore) => void
  /** Honor env override (`DASH_HERMES_NO_IDEMPOTENCY=1`). */
  isDisabled: () => boolean
}

function defaultIdempotencyDeps(storePath?: string): IdempotencyDeps {
  const sp = storePath ?? defaultIdempotencyStorePath()
  return {
    computeKey: (gap) => defaultComputeKey(gap),
    loadStore: () => defaultLoadStore(sp),
    isProcessed: (k, s) => defaultIsProcessed(k, s),
    getEntry: (k, s) => defaultGetEntry(k, s),
    recordOutcome: (k, e, s) => defaultRecordOutcome(k, e, s),
    writeStore: (s) => defaultWriteStore(s, sp),
    isDisabled: () => defaultIsDisabled(),
  }
}

/** Pipeline outcome.kind → idempotency outcome enum. "skipped" → null (don't record). */
function outcomeKindToIdempotent(
  kind: PipelineOutcome["kind"],
): IdempotencyOutcome | null {
  if (kind === "vendored") return "vendored"
  if (kind === "needs-review") return "needs-review"
  if (kind === "failed") return "failed"
  return null
}

/** Pull token spend off a generator result, if available. */
function tokensFromGen(gen: { usage?: { inputTokens: number; outputTokens: number } } | null): number {
  if (!gen?.usage) return 0
  return (gen.usage.inputTokens ?? 0) + (gen.usage.outputTokens ?? 0)
}

export type PipelineDeps = {
  generator?: GeneratorDeps
  prCreator?: PrCreatorDeps
  slackNotifier?: SlackNotifierDeps
  validateOpts?: ValidateOpts
  logger?: PipelineLogger
  /** Override queue path (default `~/.dash/gap-queue.json`). */
  queuePath?: string
  /**
   * Idempotency: override the full surface for tests, OR just point at a
   * different store file. Leave undefined for default file-backed impl.
   */
  idempotency?: IdempotencyDeps
  /** Override idempotency store path (when not supplying full deps). */
  idempotencyStorePath?: string
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
  const idem =
    deps.idempotency ?? defaultIdempotencyDeps(deps.idempotencyStorePath)

  // Idempotency short-circuit. If this exact gap (id+created_at+desc) has been
  // processed before, replay the prior outcome instead of paying Anthropic
  // tokens again. Bypass when env DASH_HERMES_NO_IDEMPOTENCY=1 — useful for
  // demo / test mode where we deliberately want to re-run.
  const idemDisabled = idem.isDisabled()
  let idemStore: IdempotencyStore | null = null
  let idemKey: string | null = null
  if (!idemDisabled) {
    idemKey = idem.computeKey(gap)
    idemStore = idem.loadStore()
    if (idem.isProcessed(idemKey, idemStore)) {
      const prior = idem.getEntry(idemKey, idemStore)
      log.info("gap.idempotent.skip", {
        id: gap.id,
        key: idemKey.slice(0, 12),
        priorOutcome: prior?.outcome ?? "unknown",
        processedAt: prior?.processedAt ?? "unknown",
      })
      // Reflect prior outcome in queue so dashboard stays consistent.
      if (prior) {
        const replayed: PipelineOutcome =
          prior.outcome === "vendored"
            ? {
                kind: "vendored",
                gap,
                score: 0,
                pr: { url: prior.prUrl, number: null, draft: false, stubbed: prior.prUrl == null },
              }
            : prior.outcome === "needs-review"
              ? {
                  kind: "needs-review",
                  gap,
                  score: 0,
                  pr: { url: prior.prUrl, number: null, draft: true, stubbed: prior.prUrl == null },
                  reason: `idempotent replay of prior needs-review (processed ${prior.processedAt})`,
                }
              : {
                  kind: "failed",
                  gap,
                  score: null,
                  reason: `idempotent replay of prior failure (processed ${prior.processedAt})`,
                }
        updateGapStatus(queuePath, gap.id, { status: statusForOutcome(replayed) })
        return replayed
      }
    }
  }

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
    persistIdempotency(idem, idemDisabled, idemKey, idemStore, gap, outcome, null, log)
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
    // GH 422 (or any failure that returns stubbed PR): downgrade outcome
    // so dashboard ga punya ghost row "vendored without PR url".
    if (pr.stubbed) {
      outcome = {
        kind: "needs-review",
        gap,
        score: validation.score,
        pr,
        reason: `PR creation failed (stubbed). Manual review required.`,
      }
    } else {
      outcome = { kind: "vendored", gap, score: validation.score, pr }
    }
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
  persistIdempotency(idem, idemDisabled, idemKey, idemStore, gap, outcome, gen, log)
  await notifySlack(
    buildSlackPayload(outcome, scaffold.name),
    config,
    deps.slackNotifier,
  )
  log.info("gap.done", { id: gap.id, kind: outcome.kind })
  return outcome
}

/**
 * Write idempotency entry for an outcome. Best-effort: any failure logs but
 * doesn't crash the pipeline — the worst case is a future duplicate, not a
 * lost gap. "skipped" outcomes (currently unreachable from processGap) and
 * disabled mode are no-ops.
 */
function persistIdempotency(
  idem: IdempotencyDeps,
  disabled: boolean,
  key: string | null,
  store: IdempotencyStore | null,
  gap: GapEntry,
  outcome: PipelineOutcome,
  gen: { usage?: { inputTokens: number; outputTokens: number } } | null,
  log: PipelineLogger,
): void {
  if (disabled || !key || !store) return
  const idemOutcome = outcomeKindToIdempotent(outcome.kind)
  if (!idemOutcome) return
  const prUrl =
    outcome.kind === "vendored" || outcome.kind === "needs-review"
      ? outcome.pr.url
      : null
  const entry: IdempotencyEntry = {
    gapId: gap.id,
    processedAt: new Date().toISOString(),
    outcome: idemOutcome,
    prUrl,
    tokenSpent: tokensFromGen(gen),
  }
  try {
    const next = idem.recordOutcome(key, entry, store)
    idem.writeStore(next)
  } catch (err) {
    log.warn("gap.idempotent.write.failed", {
      id: gap.id,
      reason: err instanceof Error ? err.message : String(err),
    })
  }
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
