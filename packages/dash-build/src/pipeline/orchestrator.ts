/**
 * Pipeline orchestrator — wires day-1 building blocks into one flow.
 *
 *   POST /api/prompt → submitPrompt
 *     ↓ store.addPrompt (status=queued)
 *     ↓ broadcast prompts:changed
 *     ↓ void processPrompt() (async)
 *
 *   processPrompt:
 *     status → generating
 *     auth check (OpenAI/Codex)
 *     skill chain runs:
 *       kind=clarify   → store session, status → clarifying, return
 *       kind=generated → store artifact, status → awaiting_approval
 *       kind=error     → status → failed
 *
 *   resumeAfterClarification:
 *     load session answers, merge into prompt, restart processPrompt
 *
 *   approvePR:
 *     auth check (GitHub)
 *     status → pr_created (after submitChanges returns)
 *
 * All external dependencies are injected — see types.ts.
 */

import { randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs"
import { mkdir, stat, writeFile } from "node:fs/promises"
import { join, resolve as resolvePath, sep as pathSep } from "node:path"
import type { Store } from "../daemon/state/store.js"
import type { Broadcaster } from "../daemon/ws/broadcaster.js"
import type { PromptRecord, PromptStatus } from "../daemon/state/types.js"
import type {
  ClarificationAnswer,
  ClarificationQuestion,
} from "../clarification/types.js"
import type { GenerateResult, ParsedFile, ValidationResult } from "../skills/types.js"
import { enforceAuditLogCall } from "../skills/validator.js"
import { reviewDesignCoverage } from "../skills/design-review.js"
import { runDashQa } from "../skills/qa.js"
import type {
  AnthropicProvider,
  ApprovePRInput,
  ApprovePRResult,
  ClarificationGateway,
  GenerationArtifact,
  GithubProvider,
  Logger,
  PreviewBundler,
  SkillChainRunner,
  SubmitPromptInput,
  SubmitPromptResult,
} from "./types.js"
import { classify, describe, PipelineError } from "./error-handling.js"
import { nextStatus, isTerminal } from "./status-transitions.js"
import {
  bundleForPreview,
  bundlePathFor,
  cleanupOne,
  prepareTempDir,
  resolvePreviewDir,
} from "../preview/index.js"
import type { BundleResult } from "../preview/index.js"
import {
  promoteVariantToCanonical,
  resolveRunDir,
  snapshotFromIntake,
  writeIntakeSnapshot,
  writeRunArtifacts,
  writeVariantArtifacts,
  writeVariantsManifest,
  type VariantMetaSummary,
} from "../runs/artifact-store.js"
import { estimateUsage, writeCost } from "../runs/cost-ledger.js"
import type { BranchManager, Workspace } from "../runs/branch-manager.js"
import type { Publisher } from "../runs/publish.js"
import {
  Workspace as WorkspaceImpl,
  defaultClonePathFor,
} from "../runs/workspace.js"
import { getShimForRepo } from "../runs/preview-shim.js"
import {
  resolveRepoPreviewConfig,
  resolveTargetRepoPath,
} from "../daemon/repo-preview.js"
import { PatchApplier } from "../runs/patch-applier.js"
import { GitOps } from "../runs/git-ops.js"
import {
  DEFAULT_PATCH_ALLOWLIST,
  validatePatch,
  summarizeRejection,
  type RejectedPatch,
} from "./patch-validator.js"
import {
  checkAuditTrailRequired,
  classifyPrompt,
  detectMode,
  readDbSchema,
  scanBeCatalog,
  type BeCatalog,
  type DbCatalog,
} from "../intake/index.js"
import type { IntakeContext } from "../skills/types.js"
import {
  applyUnifiedDiff,
  detectDashDsImports,
} from "../services/component-preview.js"
import {
  AOPEmitter,
  NullAOPEmitter,
  normaliseProvider,
  type RunEmitter,
} from "../observability/aop-emitter.js"
import type {
  AOPEventType,
  AOPEventByType,
} from "@dash/aop-schema"

export interface OrchestratorOptions {
  store: Store
  broadcaster: Broadcaster
  clarification: ClarificationGateway
  anthropic: AnthropicProvider
  github: GithubProvider
  skillChain: SkillChainRunner
  /** Override the local repo path used by the skill chain (default cwd). */
  repoPathResolver?: (fullName: string | null) => string
  /** Default base branch when prompt has none. */
  defaultBaseBranch?: string
  logger?: Logger
  /**
   * D2 clone-sandbox wiring. All three are optional — when absent, the
   * orchestrator falls back to the day-1 path (in-memory artifact +
   * submitChanges() via the contents API). When all three are present:
   *   - processPrompt writes generated files into the sandbox clone via
   *     BranchManager.writeGeneratedFiles
   *   - approvePR publishes via Publisher.publish (extract + push + PR)
   * Tests typically inject all three together with a throwaway bare repo.
   */
  workspace?: Workspace
  branchManager?: BranchManager
  publisher?: Publisher
  /**
   * Default user id used when no explicit user is wired through the prompt.
   * Used to compose the dash-build/<userId>-<runId> branch name.
   */
  defaultUserId?: string
  /**
   * Bundler used to produce a sandboxed JS bundle for the iframe preview after
   * generation succeeds. Defaults to a wrapper around `bundleForPreview()`. A
   * bundler failure does NOT block the PR flow — we still mark
   * awaiting_approval, the iframe just skips rendering.
   */
  previewBundler?: PreviewBundler
  /**
   * Hook for scheduling the SessionStore TTL sweep. Exposed for tests that
   * need deterministic timing — production passes a wrapper around
   * `setInterval` over `clarificationStore.expire(ttlMs)`.
   *
   * Pass `null` to disable scheduling entirely.
   */
  ttlScheduler?: ((tick: () => Promise<void>) => () => void) | null
  /** Override the per-tick TTL maxAge passed to SessionStore.expire(). */
  sessionTtlMs?: number
  /** Override the TTL tick interval. */
  sessionSweepIntervalMs?: number
  /**
   * Function the orchestrator calls to perform the actual session expire.
   * Defaults to a no-op so unit tests don't need a real SessionStore.
   */
  expireSessions?: (maxAgeMs: number) => Promise<number>
  /**
   * Best-effort temp-dir cleanup hook called ~5 min after a PR is opened. The
   * delay gives the user time to revisit the preview before bytes vanish.
   * Defaults to `cleanupOne` from preview/temp-dir.
   */
  previewCleanup?: (promptId: string) => Promise<boolean>
  /** Override the post-approve cleanup delay (default 5 min). Tests pass 0. */
  previewCleanupDelayMs?: number
  /**
   * Sprint 2B — factory for building a PatchApplier per run. Tests inject a
   * stub that records `applyPatch` calls; production defaults to a real
   * `PatchApplier` against the workspace clone.
   */
  patchApplierFactory?: (workspaceDir: string) => {
    applyPatch: (filePath: string, patchContent: string) => Promise<{
      ok: boolean
      conflict?: boolean
      missingTarget?: boolean
      error?: string
    }>
  }
  /**
   * Whether to enable the BE-aware intake step before each prompt. Defaults
   * to `true` in the daemon wiring (see daemon/launch.ts). Unit-test fixtures
   * pass `false` to preserve hermetic prompt semantics — empty/vague prompts
   * would otherwise trip the intake classifier's ambiguous gate.
   */
  intakeEnabled?: boolean
  /**
   * Optional AOP emitter. When provided, the orchestrator emits one AOP
   * envelope per pipeline step (`run.start`, `scan`, `thinking`, `cost`,
   * `validate`, `artifact`, `run.end`, `error`) over the broadcaster + the
   * per-run `events.jsonl`. Defaults to a `NullAOPEmitter` so older test
   * fixtures keep working without any wiring.
   */
  aopEmitter?: AOPEmitter
}

const NOOP_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

export class Orchestrator {
  private readonly store: Store
  private readonly broadcaster: Broadcaster
  private readonly clarification: ClarificationGateway
  private readonly anthropic: AnthropicProvider
  private readonly github: GithubProvider
  private readonly skillChain: SkillChainRunner
  private readonly repoPathResolver: (fullName: string | null) => string
  private readonly defaultBaseBranch: string
  private readonly logger: Logger
  private readonly previewBundler: PreviewBundler
  private readonly previewCleanup: (promptId: string) => Promise<boolean>
  private readonly previewCleanupDelayMs: number
  private readonly ttlCancel: (() => void) | null
  private readonly workspace: Workspace | null
  private readonly branchManager: BranchManager | null
  private readonly publisher: Publisher | null
  private readonly defaultUserId: string
  private readonly patchApplierFactory: (workspaceDir: string) => {
    applyPatch: (filePath: string, patchContent: string) => Promise<{
      ok: boolean
      conflict?: boolean
      missingTarget?: boolean
      error?: string
    }>
  }
  private readonly intakeEnabled: boolean
  private readonly aopEmitter: AOPEmitter

  /** In-memory artifact cache, keyed by promptId. Survives process lifetime
   *  only — by-design, since regenerating is cheaper than reloading from disk. */
  private readonly artifacts: Map<string, GenerationArtifact> = new Map()
  /** Per-run AOP emitters — created on first emit, dropped on terminal step. */
  private readonly runEmitters: Map<string, RunEmitter> = new Map()
  /** Sandbox branch state per run — only populated when the D2 sandbox path
   *  is active. Lets approvePR find the branch the publisher needs without
   *  re-deriving it from the prompt id. */
  private readonly sandboxRuns: Map<string, { branchName: string; userId: string }> =
    new Map()
  /** Sprint 1A — in-flight bootstrap promises keyed by repoSlug so concurrent
   *  callers (auto submitPrompt trigger + manual button click) coalesce into
   *  one clone+shim run instead of racing. */
  private readonly bootstrapInflight: Map<string, Promise<void>> = new Map()
  /** Open WebUI #A4 — variant-count override per prompt. Set by submitPrompt
   *  when the caller asks for A/B mode; read by processPrompt before the chain
   *  call. Cleared on terminal transition via forgetRunEmitter. */
  private readonly variantCounts: Map<string, number> = new Map()

  /**
   * Bug 6 (2026-05-29) — per-run AbortController so an in-flight generation can
   * be cancelled. `submitPrompt` registers one before kicking `processPrompt`;
   * `cancelPrompt` aborts it (the codex runner accepts an AbortSignal) and
   * `processPrompt` checks `signal.aborted` at each checkpoint to bail before
   * committing an artifact. Cleaned up when the run settles.
   */
  private readonly runAborters: Map<string, AbortController> = new Map()
  /** Run ids whose clarify round-trip is resolved (answered/skipped). The
   *  chain's clarify gate is suppressed for these on the resume pass so a
   *  skip (no folded answers) doesn't re-trigger the same clarify forever. */
  private readonly clarifyResolved: Set<string> = new Set()

  constructor(opts: OrchestratorOptions) {
    this.store = opts.store
    this.broadcaster = opts.broadcaster
    this.clarification = opts.clarification
    this.anthropic = opts.anthropic
    this.github = opts.github
    this.skillChain = opts.skillChain
    // Default resolver: map prompt.repo (e.g. "dash/backoffice") onto the
    // target repo path via the manifest so intake scans the REAL repo instead
    // of dash-build's own cwd. Falls back to process.cwd() when the slug is
    // unknown / null (legacy/unit-test prompts that don't pick a repo).
    this.repoPathResolver =
      opts.repoPathResolver ??
      ((fullName) => resolveTargetRepoPath(fullName) ?? process.cwd())
    this.defaultBaseBranch = opts.defaultBaseBranch ?? "main"
    this.logger = opts.logger ?? NOOP_LOGGER
    this.previewBundler =
      opts.previewBundler ?? {
        bundle: (input) => bundleForPreview(input),
      }
    this.previewCleanup = opts.previewCleanup ?? ((id) => cleanupOne(id))
    this.previewCleanupDelayMs = opts.previewCleanupDelayMs ?? 5 * 60 * 1000
    this.workspace = opts.workspace ?? null
    this.branchManager = opts.branchManager ?? null
    this.publisher = opts.publisher ?? null
    this.defaultUserId = opts.defaultUserId ?? "local"
    this.patchApplierFactory =
      opts.patchApplierFactory ??
      ((workspaceDir) =>
        new PatchApplier({
          workspaceDir,
          gitOps: new GitOps(workspaceDir),
        }))
    this.intakeEnabled = opts.intakeEnabled ?? false
    this.aopEmitter = opts.aopEmitter ?? new NullAOPEmitter()

    // Sprint 1C: wire sandbox state-machine transitions through Store +
    // Broadcaster for any Workspace passed in via DI (e.g. integration tests
    // that mock a bare repo). S1A's runtime `runBootstrap` calls
    // `wireSandboxBroadcast` directly on the Workspace it constructs, so
    // every transition (bootstrap + run + rollback + sweep) auto-broadcasts.
    // Backward-compat: silently skip when no Workspace is available.
    if (this.workspace) {
      this.wireSandboxBroadcast(this.workspace)
      this.wireDevServerBroadcast(this.workspace)
    }

    // TTL sweep: walk SessionStore every 5 min and expire pending sessions
    // older than 30 min. Disable with ttlScheduler=null (tests).
    const ttlMs = opts.sessionTtlMs ?? 30 * 60 * 1000
    const intervalMs = opts.sessionSweepIntervalMs ?? 5 * 60 * 1000
    const expire = opts.expireSessions ?? (async () => 0)
    const scheduler =
      opts.ttlScheduler === undefined
        ? (tick: () => Promise<void>) => {
            const h = setInterval(() => {
              tick().catch(() => {})
            }, intervalMs)
            // Don't keep the event loop alive — production runs alongside an
            // HTTP server that already holds the loop.
            if (typeof (h as { unref?: () => void }).unref === "function") {
              ;(h as { unref: () => void }).unref()
            }
            return () => clearInterval(h)
          }
        : opts.ttlScheduler
    this.ttlCancel = scheduler
      ? scheduler(async () => {
          await expire(ttlMs).catch(() => 0)
        })
      : null
  }

  /** Shut down background timers — called by daemon.close(). */
  dispose(): void {
    this.ttlCancel?.()
  }

  /**
   * Lazily resolve the per-run AOP emitter so each pipeline step can append
   * an event without remembering whether the emitter has been seeded. Stable
   * per promptId; cleared by `forgetRunEmitter` on terminal transitions.
   */
  private aop(promptId: string): RunEmitter {
    let runEmitter = this.runEmitters.get(promptId)
    if (!runEmitter) {
      runEmitter = this.aopEmitter.forRun(promptId)
      this.runEmitters.set(promptId, runEmitter)
    }
    return runEmitter
  }

  private forgetRunEmitter(promptId: string): void {
    this.runEmitters.delete(promptId)
    this.clarifyResolved.delete(promptId)
    this.aopEmitter.forget(promptId)
  }

  /**
   * Claude-Code-style live narration. Each pipeline milestone calls this with
   * a human-readable string the dashboard renders verbatim as an action line.
   * Fully guarded: a failure building or emitting an event must NEVER break the
   * pipeline (emitter is already fire-and-forget; we also swallow payload-build
   * throws here). Lazily builds the payload via `make()` so callers can compute
   * the narration inline without worrying about exceptions bubbling.
   */
  private narrate<T extends AOPEventType>(
    promptId: string,
    type: T,
    make: () => AOPEventByType[T]["payload"],
  ): void {
    try {
      const payload = make()
      this.aop(promptId).emit(type, payload)
    } catch (err) {
      this.logger.warn("aop narration failed (continuing)", {
        id: promptId,
        type,
        err: (err as Error).message,
      })
    }
  }

  // ── Public surface ───────────────────────────────────────────────────────

  /**
   * Create a prompt record and schedule async generation. Returns immediately
   * with `{ status: "queued" }` — caller (HTTP route) must poll WebSocket or
   * `/api/prompts/:id` for progress.
   */
  async submitPrompt(input: SubmitPromptInput): Promise<SubmitPromptResult> {
    if (!input.text || !input.text.trim()) {
      throw new Error("prompt text required")
    }
    // Sprint 1A — fire-and-forget bootstrap kick. Best-effort: if the clone
    // succeeds the live preview pane can switch to the real codebase; if it
    // fails (offline, repo path missing, etc.) the prompt still flows through
    // the legacy path. We cap our wait at 5s so a slow first clone never
    // blocks the user — the bootstrap keeps running in the background after.
    //
    // Mode-aware gate (2026-05-29): clone ONLY for existing-repo work. A blank-
    // product or design-system prompt has no real repo to clone — booting a
    // dev server there is wasted minutes + a confusing "cloning…" status. We
    // run the (pure, sync) mode detector here to decide. selectedRepo + known
    // manifest → existing-repo at 0.95, so the common "user picked backoffice"
    // path still clones exactly as before. See mode-aware-intake spec.
    const submitMode = detectMode({
      prompt: input.text,
      selectedRepo: input.repo ?? null,
      repoIsKnownDashRepo: input.repo
        ? resolveTargetRepoPath(input.repo) !== null
        : false,
      resolvedExistingFiles: [],
    })
    const shouldClone = input.repo != null && submitMode.mode === "existing-repo"
    if (shouldClone && input.repo) {
      const kicked = this.ensureWorkspaceBootstrap(input.repo)
      try {
        await Promise.race([
          kicked,
          new Promise<void>((resolve) => {
            const t = setTimeout(resolve, 5_000)
            if (typeof (t as { unref?: () => void }).unref === "function") {
              ;(t as { unref: () => void }).unref()
            }
          }),
        ])
      } catch {
        // Swallow — bootstrap failures must never block prompt submission.
      }
    }
    const prompt = this.store.addPrompt({
      text: input.text,
      repo: input.repo ?? null,
      branch: input.branch ?? null,
    })
    // Open WebUI #A4 — opt-in A/B mode. Clamp >2 to 2 so callers can't
    // accidentally fan out 5 parallel LLM calls; <2 is single-variant flow.
    const requestedCount = Math.max(1, Math.min(2, Math.floor(input.variantCount ?? 1)))
    if (requestedCount === 2) {
      this.variantCounts.set(prompt.id, 2)
    }
    const queuedStatus = prompt.status
    // AOP run.start — first live narration line ("Starting…"). The dashboard
    // opens a fresh action stream off this event.
    this.narrate(prompt.id, "run.start", () => ({
      prompt: prompt.text,
      targetRepo: {
        url: prompt.repo ?? "dash-build",
        branch: prompt.branch ?? "main",
        commit: "HEAD",
      },
      model: { provider: "openai", name: "dash-build" },
      budget: { maxUsd: 0, maxDurationMs: 0, maxTokens: 0 },
      initiator: "api",
    }))
    this.broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: queuedStatus,
    })
    this.broadcaster.broadcast("runs:changed", {
      id: prompt.id,
      status: queuedStatus,
    })
    // Bug 6 — register an aborter for this run so cancelPrompt can interrupt
    // the in-flight model call + downstream checkpoints.
    this.runAborters.set(prompt.id, new AbortController())
    // Fire-and-forget — errors surface via prompts:changed.
    // Defer one microtask so callers can await the return value before
    // the worker observes the queued prompt.
    queueMicrotask(() => {
      this.processPrompt(prompt.id).catch((err) => {
        this.logger.error("processPrompt threw", {
          id: prompt.id,
          err: String(err),
        })
      })
    })
    return { promptId: prompt.id, status: queuedStatus }
  }

  /**
   * Bug 6 (2026-05-29) — cancel an in-flight generation. Best-effort:
   *   1. Mark the prompt `cancelled` in the store (a terminal status, so
   *      `processPrompt`'s `isTerminal` checkpoints bail before committing).
   *   2. Abort the run's AbortController so the codex runner's child process
   *      (which accepts `signal`) is killed and any awaiting checkpoint throws.
   *   3. Broadcast prompts:changed / runs:changed so the UI flips out of the
   *      generating state.
   *
   * Returns the resulting status. A no-op (returns the current status) when the
   * prompt is unknown or already terminal — cancelling a finished run is safe.
   */
  async cancelPrompt(promptId: string): Promise<{ status: PromptStatus }> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) {
      throw new Error("prompt not found")
    }
    if (isTerminal(prompt.status)) {
      return { status: prompt.status }
    }
    // Abort the in-flight model call first so the runner stops burning tokens.
    const aborter = this.runAborters.get(promptId)
    if (aborter && !aborter.signal.aborted) {
      try {
        aborter.abort()
      } catch {
        /* AbortController.abort never throws in practice — defensive */
      }
    }
    this.variantCounts.delete(promptId)
    const updated = await this.store.updatePromptStatus(promptId, "cancelled")
    this.runAborters.delete(promptId)
    this.broadcaster.broadcast("prompts:changed", {
      id: promptId,
      status: "cancelled",
    })
    this.broadcaster.broadcast("runs:changed", {
      id: promptId,
      status: "cancelled",
    })
    this.narrate(promptId, "error", () => ({
      code: "cancelled",
      message: "Cancelled by user.",
      recoverable: false,
      severity: "warn" as const,
    }))
    return { status: updated?.status ?? "cancelled" }
  }

  /**
   * Sprint 1A — best-effort workspace bootstrap for a repo.
   *
   * Cheap when state is already past `clean`: returns immediately. Otherwise
   * resolves the local repo dir via the repo-preview manifest, derives an
   * origin URL (env override > `git remote get-url origin` from the local
   * checkout > local dir as fallback), spins up a Workspace, and runs the
   * full clone+shim+install dance. Skips entirely if the shim or local dir
   * is missing — we don't want to crash the daemon on first contact.
   *
   * F3 — once the workspace settles into `idle`, cascades into
   * `workspace.startDevServer({ port })` (the F1 method). The dev server
   * spin-up is best-effort: if it fails (binary missing, port collision,
   * F1 method not present, …) the cascade logs a warning and the prompt
   * submit path keeps running. The clone iframe falls back to the staging
   * URL via the resolver priority that F2 owns.
   *
   * Public so the dashboard's "Activate clone preview" button + the
   * submitPrompt fire-and-forget hook can share the same coalesced run.
   *
   * NEVER throws to the caller — workspace bootstrap is purely additive.
   */
  async ensureWorkspaceBootstrap(
    repo: string,
    opts: { startDevServer?: boolean } = {},
  ): Promise<void> {
    if (!repo) return
    const inflight = this.bootstrapInflight.get(repo)
    if (inflight) return inflight

    const current = this.safeGetSandboxState(repo)
    const needsBoot =
      current === null || current.state === "clean"
    const needsDevServer =
      (opts.startDevServer ?? true) &&
      !!current &&
      (current.state === "idle" || current.state === "shim_applied")
    if (!needsBoot && !needsDevServer) return

    const run = this.runBootstrap(repo, {
      startDevServer: opts.startDevServer ?? true,
      skipClone: !needsBoot,
    })
    this.bootstrapInflight.set(repo, run)
    run.finally(() => {
      this.bootstrapInflight.delete(repo)
    })
    return run
  }

  /**
   * F3 — wrap `workspace.stopDevServer + startDevServer`. Best-effort:
   * returns the latest sandbox snapshot regardless of dev-server outcome.
   * Used by the `/api/sandbox/restart-dev` route after a `dev_server_failed`
   * event so the user can retry without reissuing the whole bootstrap.
   */
  async restartDevServer(repo: string): Promise<unknown> {
    if (!repo) return null
    const workspace = this.findLiveWorkspaceFor(repo)
    if (workspace) {
      const stop = (workspace as unknown as {
        stopDevServer?: () => Promise<void>
      }).stopDevServer
      if (typeof stop === "function") {
        try {
          await stop.call(workspace)
        } catch (err) {
          this.logger.warn("restartDevServer: stop failed", {
            repo,
            err: (err as Error).message,
          })
        }
      }
    }
    await this.runDevServerStartCascade(repo, workspace ?? null).catch(() => {})
    return this.safeGetSandboxState(repo)
  }

  /**
   * F3 — find a live Workspace instance for a repo. Currently only the
   * DI-supplied workspace is tracked (one-per-orchestrator); future work may
   * key by repo. Returns `null` when no live instance is known, which is
   * fine for the dev-server cascade — `runDevServerStartCascade` will
   * lazy-create a fresh one against the existing clone in that case.
   */
  private findLiveWorkspaceFor(repo: string): Workspace | null {
    if (this.workspace && this.workspace.repoSlug === repo) {
      return this.workspace
    }
    return null
  }

  private async runBootstrap(
    repo: string,
    opts: { startDevServer: boolean; skipClone: boolean } = {
      startDevServer: true,
      skipClone: false,
    },
  ): Promise<void> {
    const shim = getShimForRepo(repo)
    if (!shim) {
      this.logger.warn("bootstrap skipped: no shim registered", { repo })
      return
    }
    const config = resolveRepoPreviewConfig(repo)
    if (!config) {
      this.logger.warn("bootstrap skipped: no repo-preview manifest", { repo })
      return
    }
    if (!existsSync(config.dir)) {
      this.logger.warn("bootstrap skipped: local repo dir missing", {
        repo,
        dir: config.dir,
      })
      return
    }

    // Clone source precedence:
    //   1. explicit DASH_BUILD_GIT_ORIGIN_URL
    //   2. DASH_BUILD_CLONE_FROM_LOCAL=1 → the local checkout dir itself
    //      (git clone <localdir> — no network, no auth). This is the
    //      local-first / first-run-test path: the dev already has the repo
    //      checked out, and the GitHub remote would need credentials the
    //      local daemon doesn't have (that's what made bootstrap silently
    //      reach state=failed). Filesystem clone is also far faster.
    //   3. the checkout's GitHub origin (production / fresh-machine path)
    //   4. the local dir as a last resort
    const cloneFromLocal = process.env.DASH_BUILD_CLONE_FROM_LOCAL === "1"
    const originUrl =
      process.env.DASH_BUILD_GIT_ORIGIN_URL?.trim() ||
      (cloneFromLocal ? config.dir : null) ||
      (await detectOriginUrl(config.dir)) ||
      config.dir
    const clonePath = defaultClonePathFor(repo)

    let workspace: Workspace | null = null
    try {
      if (!opts.skipClone) {
        await this.setSafeSandboxState(repo, {
          state: "clean",
          clonePath,
        })
      }
      const ws = new WorkspaceImpl({
        repoSlug: repo,
        originUrl,
        clonePath,
        shim,
      })
      workspace = ws
      // Sprint 1C: wire per-transition Store persistence + WS broadcast.
      // S1A's coarser end-of-bootstrap broadcast below still fires for
      // back-compat with code that listens for the final transition only.
      this.wireSandboxBroadcast(ws)
      // F1 — also subscribe to async dev-server lifecycle events so a crash
      // (child exit !== 0) translates into a UI-visible broadcast + state
      // reset. Defensive: older Workspace builds without the setter just
      // silently skip — orchestrator broadcasts still flow for transitions.
      this.wireDevServerBroadcast(ws)
      if (!opts.skipClone) {
        await ws.bootstrap()
        const info = ws.info()
        await this.setSafeSandboxState(repo, {
          state: info.state,
          clonePath: info.clonePath,
          shimCommitSha: info.shimCommitSha,
        })
        this.broadcaster.broadcast("sandbox:state_changed", {
          repo,
          repoSlug: repo,
          to: info.state,
          state: info.state,
        })
        this.logger.info("bootstrap complete", {
          repo,
          state: info.state,
          clonePath: info.clonePath,
        })
      }
    } catch (err) {
      this.logger.warn("bootstrap failed (continuing)", {
        repo,
        err: (err as Error).message,
      })
      // Force-mark failed so the dashboard badge reflects reality.
      await this.setSafeSandboxState(repo, { state: "failed" }).catch(() => {})
      this.broadcaster.broadcast("sandbox:state_changed", {
        repo,
        repoSlug: repo,
        to: "failed",
        state: "failed",
        error: (err as Error).message,
      })
      return
    }

    // F3 — cascade into dev server start. Best-effort: never throws to
    // caller; failures degrade gracefully and keep prompt submit unblocked.
    if (opts.startDevServer) {
      await this.runDevServerStartCascade(repo, workspace).catch(() => {})
    }
  }

  /**
   * F3 — start the workspace dev server and broadcast lifecycle events:
   *   sandbox:dev_server_starting → before spawn
   *   sandbox:dev_server_ready    → on listening
   *   sandbox:dev_server_failed   → on timeout / spawn failure
   *
   * Defensive: tolerates a Workspace that hasn't yet grown
   * `startDevServer()` (F1 lands in parallel). When the method is missing,
   * logs a warning and returns — clone state stays idle and the canvas
   * falls back to staging.
   */
  private async runDevServerStartCascade(
    repo: string,
    workspace: Workspace | null,
  ): Promise<void> {
    const config = resolveRepoPreviewConfig(repo)
    const port = config?.port
    if (!workspace) {
      this.logger.warn("dev server cascade skipped: no workspace handle", {
        repo,
      })
      return
    }
    const startDev = (workspace as unknown as {
      startDevServer?: (input: { port?: number }) => Promise<unknown>
    }).startDevServer
    if (typeof startDev !== "function") {
      this.logger.warn("dev server cascade skipped: Workspace.startDevServer unavailable", {
        repo,
      })
      return
    }

    this.broadcaster.broadcast("sandbox:dev_server_starting", {
      repo,
      repoSlug: repo,
      port: port ?? null,
    })

    // Match Workspace.DEV_SERVER_READY_TIMEOUT_MS (raised 60s → 420s on
    // 2026-05-29). A cold `next dev` first-compile on backoffice takes 5-7 min;
    // the old 60s cap was the "scheduler silent fail" that dropped the iframe
    // to staging mid-boot. Same env override as the Workspace constant.
    const startupTimeoutMs = Number(
      process.env.DASH_BUILD_DEV_SERVER_TIMEOUT_MS ?? 420_000,
    )
    try {
      await Promise.race([
        Promise.resolve(startDev.call(workspace, { port })),
        new Promise<never>((_, reject) => {
          const t = setTimeout(() => {
            reject(new Error(`dev server startup timed out after ${startupTimeoutMs}ms`))
          }, startupTimeoutMs)
          if (typeof (t as { unref?: () => void }).unref === "function") {
            ;(t as { unref: () => void }).unref()
          }
        }),
      ])
      this.broadcaster.broadcast("sandbox:dev_server_ready", {
        repo,
        repoSlug: repo,
        port: port ?? null,
      })
      this.logger.info("dev server ready", { repo, port })
    } catch (err) {
      const message = (err as Error).message ?? String(err)
      this.logger.warn("dev server start failed (continuing in idle)", {
        repo,
        err: message,
      })
      this.broadcaster.broadcast("sandbox:dev_server_failed", {
        repo,
        repoSlug: repo,
        port: port ?? null,
        error: message,
      })
    }
  }

  /** Defensive read so Store extensions can land independently in tests. */
  private safeGetSandboxState(repo: string): { state: string } | null {
    const get = (this.store as unknown as {
      getSandboxState?: (r: string) => { state: string } | null
    }).getSandboxState
    if (typeof get !== "function") return null
    try {
      return get.call(this.store, repo) ?? null
    } catch {
      return null
    }
  }

  /** Defensive write — silently no-ops if the Store hasn't gained the API. */
  private async setSafeSandboxState(
    repo: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const update = (this.store as unknown as {
      updateSandboxState?: (r: string, patch: Record<string, unknown>) => Promise<unknown>
    }).updateSandboxState
    if (typeof update !== "function") return
    try {
      await update.call(this.store, repo, patch)
    } catch (err) {
      this.logger.warn("sandbox persist failed", {
        repo,
        err: (err as Error).message,
      })
    }
  }

  /**
   * Sprint 1C — subscribe to SandboxStateMachine transitions for one
   * Workspace. Every successful transition:
   *   1. Broadcasts `sandbox:state_changed` over WS so the dashboard topbar
   *      badge updates without a poll.
   *   2. Persists the new state into Store (defensive — Store API may not
   *      exist in older test fixtures).
   *
   * Callable from both the DI path (Workspace passed via constructor) and
   * the runtime path (Workspace built inside `runBootstrap`). Safe to call
   * multiple times on the same Workspace — the latest callback wins.
   * Backward-compat: silently skips when the machine has no setter (older
   * SandboxStateMachine builds).
   */
  private wireSandboxBroadcast(workspace: Workspace): void {
    const setter = workspace.state?.setOnTransition?.bind(workspace.state)
    if (typeof setter !== "function") return
    setter((event) => {
      // Broadcast first so the UI updates even if disk persistence is slow.
      this.broadcaster.broadcast("sandbox:state_changed", {
        repo: event.repoSlug,
        from: event.from,
        to: event.to,
        at: event.at,
        runId: event.runId,
      })
      // F1 — when transitioning into clone_running, surface the live dev
      // server port the resolver needs. devServer() is best-effort: it may
      // not exist on older Workspace builds in which case the field stays
      // null and the resolver falls through to staging.
      const devSnap = (workspace as unknown as {
        devServer?: () => { port: number } | null
      }).devServer?.call(workspace) ?? null
      const portForPersist =
        event.to === "clone_running" && devSnap ? devSnap.port : null
      // Fire-and-forget persistence. Defensive — Store extensions may land
      // independently in older test rigs.
      void this.setSafeSandboxState(event.repoSlug, {
        state: event.to,
        runId: event.runId,
        clonePath: workspace.clonePath,
        shimCommitSha: workspace.info().shimCommitSha,
        history: workspace.state.history(),
        devServerPort: portForPersist,
      })
    })
  }

  /**
   * F1 — subscribe to Workspace.onDevServerEvent. Currently fires only on
   * "crashed" (child exited unexpectedly post-ready). We broadcast
   * `sandbox:dev_server_crashed` so the dashboard client can:
   *   1. Refresh the badge (state will already have stepped clone_running →
   *      idle via the state-machine transition hook above).
   *   2. Show an actionable toast: "Dev server crashed (port: 3101) — click
   *      to retry".
   *   3. Persist the failure tag so a daemon restart can still show the
   *      red badge instead of "idle" pretending everything is fine.
   */
  private wireDevServerBroadcast(workspace: Workspace): void {
    const setter = (workspace as unknown as {
      setOnDevServerEvent?: (cb: ((event: unknown) => void) | null) => void
    }).setOnDevServerEvent
    if (typeof setter !== "function") return
    setter.call(workspace, (event: unknown) => {
      const ev = event as {
        kind: string
        repoSlug: string
        port: number | null
        stderr: string
        exit: { code: number | null; signal: string | null }
      }
      if (ev.kind !== "crashed") return
      this.broadcaster.broadcast("sandbox:dev_server_crashed", {
        repo: ev.repoSlug,
        repoSlug: ev.repoSlug,
        port: ev.port,
        exit: ev.exit,
        // Cap stderr tail in the broadcast so 8KB messages don't choke the
        // WS layer; UI just needs a hint, full log lives in daemon stderr.
        stderr: ev.stderr.slice(-1024),
      })
      this.logger.warn("dev server crashed", {
        repo: ev.repoSlug,
        port: ev.port,
        exit: ev.exit,
      })
      void this.setSafeSandboxState(ev.repoSlug, {
        // State already transitioned back to idle inside Workspace; we
        // persist the lastAction tag so the badge renders the error variant
        // until the next successful start.
        lastAction: "dev_server_crashed",
        devServerPort: null,
        devServerError: `Exited with code=${ev.exit.code ?? "null"}, signal=${ev.exit.signal ?? "null"}`,
      })
    })
  }

  /**
   * Run skill chain → clarify or awaiting_approval. Idempotent — calling on
   * a terminal prompt is a no-op.
   */
  async processPrompt(promptId: string): Promise<void> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) {
      this.logger.warn("processPrompt: unknown id", { id: promptId })
      return
    }
    if (isTerminal(prompt.status)) {
      this.logger.info("processPrompt: terminal, skipping", { id: promptId })
      return
    }

    // P11 — capture wall-clock start so run.end + the cost ledger carry a
    // real durationMs instead of the hardcoded 0. The codex runner doesn't
    // surface its own duration through GenerateResult.meta yet (would be a
    // SkillChainRunner interface change), so we measure end-to-end here.
    const startedAt = Date.now()

    await this.setStatus(prompt, "generating")

    // 1. Auth check
    try {
      if (!(await this.anthropic.isConnected())) {
        throw new PipelineError(
          "auth-missing-openai",
          "OpenAI not connected",
        )
      }
    } catch (err) {
      return this.failPrompt(prompt, err)
    }

    // 2. BE-aware intake — scan catalogs + classify scenario + audit-trail
    //    gate. Run BEFORE the skill chain so the model gets BE/DB context and
    //    we can short-circuit ambiguous prompts without burning an LLM call.
    //    All four scanners are best-effort by design (see intake/INTEGRATION-
    //    TODO.md "Error handling") — failures degrade gracefully.
    //    Gated by intakeEnabled (default off) so legacy/unit-test prompts
    //    don't trip the ambiguous-clarify gate; daemon turns it on.
    const repoPath = this.repoPathResolver(prompt.repo)
    let intake: IntakeContext | undefined
    if (this.intakeEnabled) {
      const repoLabel = prompt.repo ?? "workspace"
      // AOP scan (begin) — "Reading <repo> context…"
      this.narrate(prompt.id, "scan", () => ({
        kind: "registry",
        paths: [repoLabel],
        snippet: `Reading ${repoLabel} context…`,
        bytesRead: 0,
      }))
      intake = await this.runIntake(prompt.text, repoPath, prompt.repo)

      // AOP scan (done) — "Found N endpoints, M tables" + mode + scenario.
      this.narrate(prompt.id, "scan", () => {
        const nEndpoints = intake!.beCatalog.totalEndpoints ?? 0
        const nTables = intake!.dbCatalog.tables.length
        const scenario = intake!.classification.scenario
        const modeName = intake!.mode?.mode
        const summary =
          `Found ${nEndpoints} API endpoint${nEndpoints === 1 ? "" : "s"}, ` +
          `${nTables} matching table${nTables === 1 ? "" : "s"}` +
          (modeName ? ` · mode ${modeName}` : "") +
          ` · scenario ${scenario}`
        return {
          kind: "registry",
          paths: [repoLabel],
          snippet: summary,
          bytesRead: 0,
        }
      })

      // AOP plan — "Plan: <scenario> in <repo>" / "New standalone component".
      this.narrate(prompt.id, "thinking", () => {
        const scenario = intake!.classification.scenario
        const modeName = intake!.mode?.mode
        const planText =
          modeName === "blank-product" || modeName === "design-system"
            ? "Plan: new standalone component"
            : `Plan: ${scenario.replace(/_/g, " ")} in ${repoLabel}`
        return { kind: "hypothesis", md: planText }
      })

      // Persist the intake snapshot to <runDir>/intake.json so the workspace
      // cold-load (`loadInitialPreview`) can surface BE endpoints / DB tables /
      // audit reason in the context map without waiting for the SSE event. We
      // write BEFORE the clarify gate short-circuits so even clarifying prompts
      // expose the intake context in the UI.
      try {
        await writeIntakeSnapshot(prompt.id, snapshotFromIntake(intake))
      } catch (err) {
        this.logger.warn("intake snapshot persist failed", {
          id: prompt.id,
          err: (err as Error).message,
        })
      }

      // 2a. Intake-driven clarify gate — short-circuit ambiguous prompts so
      //     the user can disambiguate before we generate. The chain has its
      //     own gate too, but doing it here avoids the SDK client build +
      //     model call.
      if (
        intake.classification.scenario === "ambiguous" &&
        intake.classification.confidence < 0.5
      ) {
        const question = intake.classification.needsClarify ??
          "We couldn't classify this prompt — is it a visual change, a new BE endpoint, or a DB-schema change?"
        // AOP thinking — "Need to clarify: <question>"
        this.narrate(prompt.id, "thinking", () => ({
          kind: "risk",
          md: `Need to clarify: ${question}`,
        }))
        return this.beginClarification(
          prompt,
          [
            {
              id: "intake-scenario",
              text: question,
              type: "free-text",
              rationale:
                "Intake classifier returned ambiguous scenario at confidence " +
                `${intake.classification.confidence.toFixed(2)}. ` +
                "Need user disambiguation before generating.",
              required: true,
            },
          ],
          prompt.text,
        )
      }
    }

    // 3. Build SDK client + run skill chain
    //
    // Open WebUI #A4 — when the prompt was submitted with variantCount=2, fan
    // out two parallel chain calls with slight temperature variation (0.7 vs
    // 0.9). Both must succeed (or at least one — the surviving one wins) for
    // the run to surface; clarify on EITHER short-circuits the run because
    // the user can't compare against an empty pane.
    let result: GenerateResult
    let variantResults: Array<{
      id: string
      temperature: number
      result: GenerateResult
    }> = []
    const variantCount = this.variantCounts.get(prompt.id) ?? 1
    // AOP thinking — "Generating component…" (chain dispatch).
    this.narrate(prompt.id, "thinking", () => ({
      kind: "reason",
      md:
        variantCount === 2
          ? "Generating component… (2 variants)"
          : "Generating component…",
    }))
    try {
      const sdk = await this.anthropic.buildSdkClient()
      if (variantCount === 2) {
        const settled = await Promise.allSettled([
          this.skillChain.run({
            prompt: prompt.text,
            repoPath,
            selectedRepo: prompt.repo,
            anthropic: sdk,
            intake,
            runId: prompt.id,
            suppressClarify: this.clarifyResolved.has(prompt.id),
            variantId: "a",
            temperature: 0.7,
          }),
          this.skillChain.run({
            prompt: prompt.text,
            repoPath,
            selectedRepo: prompt.repo,
            anthropic: sdk,
            intake,
            runId: prompt.id,
            suppressClarify: this.clarifyResolved.has(prompt.id),
            variantId: "b",
            temperature: 0.9,
          }),
        ])
        const tempByIdx = [0.7, 0.9]
        const ids = ["a", "b"]
        for (let i = 0; i < settled.length; i++) {
          const s = settled[i]!
          if (s.status === "fulfilled") {
            variantResults.push({
              id: ids[i]!,
              temperature: tempByIdx[i]!,
              result: s.value,
            })
          } else {
            this.logger.warn("variant chain call failed", {
              id: prompt.id,
              variant: ids[i],
              err:
                s.reason instanceof Error
                  ? s.reason.message
                  : String(s.reason),
            })
          }
        }
        if (variantResults.length === 0) {
          // Both failed — bubble the first rejection through the standard
          // failPrompt path so error semantics match single-variant.
          const firstReject = settled.find((s) => s.status === "rejected")
          throw firstReject
            ? (firstReject as PromiseRejectedResult).reason
            : new Error("variant chain run produced no results")
        }
        // Pick the winning result for downstream pipeline (validation /
        // bundle / sandbox). "generated" beats "clarify" beats "error";
        // among "generated" the higher score wins.
        const winner = pickWinnerResult(variantResults)
        result = winner.result
      } else {
        result = await this.skillChain.run({
          prompt: prompt.text,
          repoPath,
          selectedRepo: prompt.repo,
          anthropic: sdk,
          intake,
          runId: prompt.id,
          suppressClarify: this.clarifyResolved.has(prompt.id),
        })
      }
    } catch (err) {
      this.variantCounts.delete(prompt.id)
      return this.failPrompt(prompt, err)
    }

    // Bug 6 — cancellation checkpoint. If the user hit Stop while the chain was
    // running, the prompt is already `cancelled` (terminal). Bail before we
    // commit any artifact or advance to awaiting_approval so a stopped run
    // doesn't silently finish.
    if (this.wasCancelled(prompt.id)) {
      this.variantCounts.delete(prompt.id)
      this.runAborters.delete(prompt.id)
      this.logger.info("processPrompt: cancelled after chain, bailing", {
        id: prompt.id,
      })
      return
    }

    // 4. Branch on chain result
    if (result.kind === "clarify") {
      this.variantCounts.delete(prompt.id)
      const q = result.questions[0]?.text ?? result.summary ?? "more detail"
      // AOP thinking — "Need to clarify: <question>"
      this.narrate(prompt.id, "thinking", () => ({
        kind: "risk",
        md: `Need to clarify: ${q}`,
      }))
      return this.beginClarification(prompt, result.questions, prompt.text)
    }
    if (result.kind === "error") {
      this.variantCounts.delete(prompt.id)
      return this.failPrompt(
        prompt,
        new PipelineError("skill-chain-failed", result.reason, result.details),
      )
    }

    // 5. Generated — capture artifact + mark awaiting approval
    const artifact: GenerationArtifact = {
      promptId: prompt.id,
      files: result.response.files,
      patches: result.response.patches ?? [],
      explanation: result.response.explanation,
      validation: result.validation,
      generatedAt: new Date().toISOString(),
      contextPack: result.meta.repoContext,
      ...(intake ? { intake } : {}),
    }

    // AOP validate — "Validating against Dash DS…" then pass/warn/fail + score.
    {
      const v = result.validation
      const overall = v.passed ? "pass" : v.errors.length > 0 ? "fail" : "warn"
      const topError = v.errors[0]
      this.narrate(prompt.id, "validate", () => ({
        scope: "package" as const,
        overall: overall as "pass" | "fail" | "warn",
        target: `Validating against Dash DS — score ${v.score}/100`,
        checks: [
          {
            name: "Dash DS foundation match",
            status: overall as "pass" | "fail" | "warn",
            durationMs: 0,
            output: `score ${v.score}/100`,
          },
        ],
      }))
      // Second beat — narrate the top issue + whether we revise / accept, to
      // mimic Claude's "found a bug, here's why" moment. Only when not a clean
      // pass.
      if (!v.passed && topError) {
        this.narrate(prompt.id, "thinking", () => ({
          kind: "risk" as const,
          md:
            `⚠ Found issue: ${topError.message}` +
            (topError.file ? ` (${topError.file})` : "") +
            ` — ${v.errors.length > 0 ? "revising" : "acceptable, continuing"}`,
        }))
      }
    }

    // AOP artifact — one line per generated file ("Wrote <path> (<size>)").
    for (const file of artifact.files) {
      this.narrate(prompt.id, "artifact", () => {
        const lines = file.content ? file.content.split("\n").length : 0
        const bytes = file.content ? Buffer.byteLength(file.content, "utf8") : 0
        return {
          path: file.path,
          op: "create" as const,
          diff: `Wrote ${file.path} (${bytes} bytes)`,
          loc: { added: lines, removed: 0 },
          ...(file.language ? { language: file.language } : {}),
        }
      })
    }

    // 5a. CR-3 OUTPUT enforcement — independent of intake.auditTrail.
    //     When the generated artifact ships a sensitive field name (payment /
    //     KYC / signature / image-proof) WITHOUT an audit-log call, mark the
    //     validation failed + push a high-severity error onto the artifact so
    //     the UI surfaces a rejection. We do NOT short-circuit to failed status
    //     — keeping awaiting_approval lets the user inspect the artifact and
    //     re-prompt. The dashboard hides the merge button while passed=false,
    //     and approvePR() ALSO refuses to open a PR for a passed=false artifact
    //     server-side (see P5 gate) unless an explicit force flag is passed —
    //     so the client guard is defence-in-depth, not the only check.
    const auditEnforcement = enforceAuditLogCall(result.response)
    if (!auditEnforcement.ok && auditEnforcement.sensitiveField) {
      const focusFile = auditEnforcement.files[0] ?? "(unknown)"
      const enforcedError = {
        severity: "high" as const,
        message:
          `Output ships sensitive field "${auditEnforcement.sensitiveField}" ` +
          `without an audit-log call. CR-3 requires auditLog.create({...}) ` +
          "(or writeAuditLog / logAudit / audit.create) for payment / KYC / " +
          "signature / image-proof fields. Re-prompt with explicit audit " +
          "logging or use a @dash/blocks audit-bearing component.",
        file: focusFile,
        ruleId: "CR-3-OUTPUT",
      }
      artifact.validation = {
        ...artifact.validation,
        errors: [...artifact.validation.errors, enforcedError],
        passed: false,
        score: Math.max(0, artifact.validation.score - 20),
      }
      this.broadcaster.broadcast("validation:rejected", {
        promptId: prompt.id,
        ruleId: "CR-3-OUTPUT",
        sensitiveField: auditEnforcement.sensitiveField,
        file: focusFile,
        message: enforcedError.message,
      })
      this.logger.warn("CR-3 output enforcement rejected artifact", {
        id: prompt.id,
        sensitiveField: auditEnforcement.sensitiveField,
        file: focusFile,
      })
    }

    // 5b. Tier 0 #0N gstack stubs — dash-design-review + dash-qa. Both are
    //     deterministic post-generation passes; failure here is non-fatal.
    //     Results live on the artifact for the dashboard but do NOT flip
    //     validation.passed or block PR creation.
    try {
      artifact.designReview = reviewDesignCoverage(result.response)
    } catch (err) {
      this.logger.warn("design review pass threw (continuing)", {
        id: prompt.id,
        err: (err as Error).message,
      })
    }
    try {
      artifact.qa = runDashQa({
        parsed: result.response,
        repoContext: artifact.contextPack ?? null,
        intake: intake ?? null,
      })
    } catch (err) {
      this.logger.warn("dash-qa pass threw (continuing)", {
        id: prompt.id,
        err: (err as Error).message,
      })
    }

    // 5c. Tier 0 #0O — capture provider mode (codex-cli vs byo-key) so the
    //     run.json metadata can show "powered by Codex" vs "powered by BYO
    //     OPENAI key". Optional API on the provider — stub providers return
    //     undefined which we record as null.
    try {
      artifact.providerMode = this.anthropic.getMode
        ? await this.anthropic.getMode()
        : null
    } catch (err) {
      this.logger.warn("provider mode probe threw (continuing)", {
        id: prompt.id,
        err: (err as Error).message,
      })
      artifact.providerMode = null
    }

    // 4b. Best-effort sandbox bundle for the iframe preview. Failure is
    // explicitly non-fatal — the PR flow doesn't need it and we don't want
    // an esbuild miss / oversized bundle to wedge the user mid-flow.
    try {
      const bundleResult = await this.previewBundler.bundle({
        files: artifact.files,
        promptId: prompt.id,
        repoContext: artifact.contextPack,
      })
      artifact.bundleResult = bundleResult
      artifact.previewMode = "component"
    } catch (err) {
      this.logger.warn("preview bundle failed (continuing without iframe)", {
        id: prompt.id,
        err: (err as Error).message,
      })
      artifact.bundleResult = await writeFallbackPreviewBundle(prompt.id, artifact, err)
      artifact.previewMode = "fallback"
    }

    // Bug 6 — second cancellation checkpoint. Bundling can take a beat; if the
    // user stopped during it, drop the artifact instead of advancing to
    // awaiting_approval.
    if (this.wasCancelled(prompt.id)) {
      this.variantCounts.delete(prompt.id)
      this.runAborters.delete(prompt.id)
      this.logger.info("processPrompt: cancelled before commit, bailing", {
        id: prompt.id,
      })
      return
    }

    this.artifacts.set(prompt.id, artifact)
    await persistArtifact(prompt.id, artifact)
    await this.persistRunArtifact(prompt, artifact)

    // 4b'. Open WebUI #A4 — persist surviving variants under <runDir>/variants/
    //      and emit a variants.json manifest. The active variant points at
    //      the chosen "winner" (highest score among generated variants).
    //      Single-variant runs skip this whole block.
    if (variantResults.length > 0 && variantCount === 2) {
      try {
        const summaries: VariantMetaSummary[] = []
        let activeId: string | null = null
        let bestScore = -1
        for (const v of variantResults) {
          if (v.result.kind !== "generated") continue
          const picked = pickComponentSource({
            promptId: prompt.id,
            files: v.result.response.files,
            patches: v.result.response.patches ?? [],
            explanation: v.result.response.explanation,
            validation: v.result.validation,
            generatedAt: artifact.generatedAt,
          } as GenerationArtifact)
          await writeVariantArtifacts({
            runId: prompt.id,
            variantId: v.id,
            files: v.result.response.files,
            componentSource: picked?.content ?? null,
            componentPath: picked?.path ?? null,
            meta: {
              score: v.result.validation.score,
              passed: v.result.validation.passed,
              explanation: v.result.response.explanation,
              temperature: v.temperature,
            },
          })
          summaries.push({
            id: v.id,
            summary: summariseVariant(v.result),
            score: v.result.validation.score,
            passed: v.result.validation.passed,
            fileCount: v.result.response.files.length,
            componentPath: picked?.path ?? null,
            temperature: v.temperature,
          })
          if (v.result.validation.score > bestScore) {
            bestScore = v.result.validation.score
            activeId = v.id
          }
        }
        if (summaries.length > 0 && activeId) {
          await writeVariantsManifest(prompt.id, {
            active: activeId,
            list: summaries,
          })
          artifact.variants = {
            active: activeId,
            list: summaries,
          }
          this.broadcaster.broadcast("variants:ready", {
            runId: prompt.id,
            promptId: prompt.id,
            active: activeId,
            list: summaries,
          })
        }
      } catch (err) {
        this.logger.warn("variant persistence failed (continuing)", {
          id: prompt.id,
          err: (err as Error).message,
        })
      }
    }
    this.variantCounts.delete(prompt.id)

    // 4c. D2 clone-sandbox: start a run branch (or reuse one) and write the
    //     generated output there so approvePR can publish via extract+push.
    //     Sprint 2B — output is now a mix of NEW files (mode=new-file) and
    //     PATCHES (mode=patch). Patches go through PatchApplier (git apply);
    //     new files go through BranchManager.writeGeneratedFiles. Any patch
    //     failure triggers an all-or-nothing rollback before commit.
    //     All failures are non-fatal at the pipeline level — we degrade to
    //     the legacy submitChanges path.
    if (this.workspace && this.branchManager) {
      try {
        const { branchName } = await this.branchManager.startRun(
          prompt.id,
          this.defaultUserId,
        )

        const patches = artifact.patches ?? []
        // Sprint 2C — additive-only gate. Validate each patch against the
        // cardinal-rule allowlist BEFORE handing it to `git apply`. Rejected
        // patches are recorded on the artifact for the UI surface; the
        // remaining safe patches still flow through the existing applier.
        const safePatches: typeof patches = []
        const rejectedPatches: RejectedPatch[] = []
        for (const patch of patches) {
          const validation = validatePatch(patch, DEFAULT_PATCH_ALLOWLIST)
          if (!validation.ok) {
            const rejection: RejectedPatch = {
              path: patch.path,
              reason: validation.reason,
              details: validation.details,
            }
            rejectedPatches.push(rejection)
            this.logger.warn("patch rejected by additive-only validator", {
              id: prompt.id,
              path: patch.path,
              reason: validation.reason,
            })
            continue
          }
          safePatches.push(patch)
        }

        // P4 — additive-only gate for NEW FILES (mode=new-file, the DEFAULT
        // path). Previously only `artifact.patches` were policed; new files at
        // protected paths (middleware, .env*, auth/**, payment/**) were
        // committed with ZERO policy check. Two rejection shapes:
        //   1. protected path → reuses patch-validator's protectedFilePatterns
        //      so the rule set stays single-sourced.
        //   2. overwrite of an existing trunk file → a "new file" whose path
        //      already exists in the clone is a covert modification (violates
        //      cardinal rule #1, additive-only).
        // Best-effort: existence probes are wrapped so an FS error degrades to
        // "treat as new" rather than crashing the pipeline.
        const safeFiles: typeof artifact.files = []
        for (const file of artifact.files) {
          if (matchesProtectedPath(file.path)) {
            rejectedPatches.push({
              path: file.path,
              reason: "touches-protected-path",
              details: `New file ${file.path} lands at a protected path (auth/payment/middleware/env). New files here are forbidden — escalate to a human reviewer.`,
            })
            this.logger.warn("new-file rejected: protected path", {
              id: prompt.id,
              path: file.path,
            })
            continue
          }
          if (this.fileExistsInClone(this.workspace.clonePath, file.path)) {
            rejectedPatches.push({
              path: file.path,
              reason: "modifies-existing-logic",
              details: `New file ${file.path} would overwrite an existing trunk file — that is a covert modification, not an additive change. Emit a mode=patch fragment or a new path instead.`,
            })
            this.logger.warn("new-file rejected: overwrites existing trunk file", {
              id: prompt.id,
              path: file.path,
            })
            continue
          }
          safeFiles.push(file)
        }

        if (rejectedPatches.length > 0) {
          artifact.rejectedPatches = rejectedPatches
          this.broadcaster.broadcast("patches:rejected", {
            promptId: prompt.id,
            count: rejectedPatches.length,
            rejected: rejectedPatches.map((r) => ({
              path: r.path,
              reason: r.reason,
              summary: summarizeRejection(r.reason),
            })),
          })
        }
        if (safePatches.length > 0) {
          const applier = this.patchApplierFactory(this.workspace.clonePath)
          const applied: Array<{ path: string }> = []
          let conflicted: { path: string; error: string } | null = null
          for (const patch of safePatches) {
            const outcome = await applier.applyPatch(patch.path, patch.patchContent)
            if (!outcome.ok) {
              conflicted = {
                path: patch.path,
                error: outcome.error ?? "unknown patch failure",
              }
              break
            }
            applied.push({ path: patch.path })
          }
          if (conflicted) {
            // All-or-nothing: roll back the run branch entirely so the working
            // tree returns to clean trunk. BranchManager.rollback handles the
            // git-level cleanup; we let the user know via prompt error state.
            await this.branchManager.rollback(branchName).catch((rollErr) => {
              this.logger.warn("rollback after patch conflict failed", {
                id: prompt.id,
                err: (rollErr as Error).message,
              })
            })
            throw new Error(
              `patch failed for ${conflicted.path} (applied ${applied.length}/${safePatches.length}): ${conflicted.error}`,
            )
          }
        }

        // New files (mode=new-file) — write + commit in a single shot. Only
        // the P4-gated `safeFiles` are committed; protected-path / overwrite
        // attempts were dropped above. Empty file list is OK if we only had
        // patches; in that case stage the patch deltas via a dummy commit so
        // extractGeneratedOnly has a single commit to format-patch over.
        if (safeFiles.length > 0) {
          await this.branchManager.writeGeneratedFiles(branchName, safeFiles, {
            commitMessage:
              this.buildCommitMessage(prompt) + ` [run ${prompt.id}]`,
          })
        } else if (safePatches.length > 0) {
          // Patches mutated the working tree; commit them so the branch has
          // history before publish.
          const git = new GitOps(this.workspace.clonePath)
          await git.commit(
            this.buildCommitMessage(prompt) + ` [run ${prompt.id}]`,
            { addAll: true },
          )
        }

        this.sandboxRuns.set(prompt.id, {
          branchName,
          userId: this.defaultUserId,
        })
        this.workspace.state.setRunIdForNextTransition(prompt.id)
        this.workspace.state.transition("preview_ready")
      } catch (err) {
        this.logger.warn("sandbox write failed (continuing without sandbox)", {
          id: prompt.id,
          err: (err as Error).message,
        })
      }
    }

    // P11 — write the per-run cost ledger with REAL numbers. durationMs is
    // wall-clock from startedAt. Tokens are still estimated (the SDK layer
    // throws away the API `usage` block — see cost-ledger.ts HONESTY NOTE), so
    // we mark `estimated: true` and derive them from the prompt + completion
    // text rather than fabricating a count. Best-effort: a writeCost failure
    // must never wedge the pipeline (writeCost already swallows FS errors).
    const durationMs = Date.now() - startedAt
    const completionText =
      artifact.files.map((f) => f.content).join("\n") +
      (artifact.explanation ?? "")
    const usage = estimateUsage(prompt.text, completionText)
    const modelId =
      result.kind === "generated" ? result.meta.modelId : "codex-default"
    const costRecord = await writeCost({
      runId: prompt.id,
      model: modelId,
      usage,
      estimated: true,
    }).catch((err) => {
      this.logger.warn("cost ledger write failed (continuing)", {
        id: prompt.id,
        err: (err as Error).message,
      })
      return null
    })

    // AOP run.end — "Done — N files, score X". Closes the live action stream.
    this.narrate(prompt.id, "run.end", () => {
      const v = result.validation
      const nFiles = artifact.files.length
      return {
        status: "success" as const,
        durationMs,
        reason: `Done — ${nFiles} file${nFiles === 1 ? "" : "s"}, score ${v.score}/100`,
        summary: {
          artifacts: nFiles,
          decisions: 0,
          validations: { pass: v.passed ? 1 : 0, fail: v.passed ? 0 : 1 },
          totalUsd: costRecord?.costUsd ?? 0,
          totalTokens: costRecord?.totalTokens ?? usage.promptTokens + usage.completionTokens,
        },
      }
    })
    this.forgetRunEmitter(prompt.id)

    await this.setStatus(prompt, "awaiting_approval")
    this.broadcaster.broadcast("generation:complete", {
      promptId: prompt.id,
      score: result.validation.score,
      fileCount: result.response.files.length,
      patchCount: artifact.patches?.length ?? 0,
      rejectedPatchCount: artifact.rejectedPatches?.length ?? 0,
      passed: result.validation.passed,
      errorCount: result.validation.errors.length,
      previewAvailable: Boolean(artifact.bundleResult),
      previewMode: artifact.previewMode ?? null,
    })

    // 6. SSE component:updated — feeds preview-mount.ts on the dashboard so
    //    the Sandpack iframe re-mounts with the freshly generated component
    //    source. Best-effort: skip silently when we cannot find a component
    //    source candidate (e.g. patch-only output, JSON-only generation).
    this.emitComponentUpdated(prompt, artifact, intake ?? null)
  }

  // ── BE-aware intake helpers ──────────────────────────────────────────────

  /**
   * Run the four intake scanners (BE catalog + DB schema + classifier + audit
   * enforcer). Returns an IntakeContext even on partial failure — empty
   * catalogs + an "ambiguous" classification is a valid baseline.
   */
  private async runIntake(
    promptText: string,
    repoPath: string,
    selectedRepo?: string | null,
  ): Promise<IntakeContext> {
    // Defensive: if the resolved target path doesn't exist, log + scan anyway
    // (scanners return empty catalogs gracefully). This surfaces config drift
    // — e.g. DASH_BUILD_DASH_ROOT pointing at a stale ~/Dash folder.
    if (!existsSync(repoPath)) {
      this.logger.warn(
        "intake: target repo path does not exist — scanning empty catalogs",
        { repoPath },
      )
    }
    const [beCatalog, dbCatalog] = await Promise.all([
      scanBeCatalog(repoPath).catch((err): BeCatalog => {
        this.logger.warn("intake.scanBeCatalog failed", {
          repoPath,
          err: (err as Error).message,
        })
        return { endpoints: [], framework: "none", totalEndpoints: 0 }
      }),
      readDbSchema(repoPath).catch((err): DbCatalog => {
        this.logger.warn("intake.readDbSchema failed", {
          repoPath,
          err: (err as Error).message,
        })
        return { tables: [], source: "none" }
      }),
    ])

    let classification
    try {
      classification = await classifyPrompt(promptText, {
        beCatalog,
        dbCatalog,
        // Existing-file context arrives later in the chain (existing-file-
        // reader); the classifier only needs a flat list of paths to detect
        // "greenfield vs update". We pass [] here and rely on BE/DB keywords
        // + catalog hits for the strong signals.
        //
        // Tier 0I caveat: this [] means a "tambahin tab di detail mitra"-style
        // prompt with no matching /api endpoint mis-routes to `new_product`.
        // `reconcileScenario()` in skills/chain.ts corrects that downstream,
        // once the path resolver has surfaced the real on-disk FE files.
        existingFiles: [],
      })
    } catch (err) {
      this.logger.warn("intake.classifyPrompt failed", { err: (err as Error).message })
      classification = {
        scenario: "ambiguous" as const,
        confidence: 0,
        reasoning: "Classifier threw; treating as ambiguous.",
        affectedFiles: { fe: [], be: [], db: [] },
      }
    }

    let auditTrail
    try {
      auditTrail = checkAuditTrailRequired(
        promptText,
        classification.affectedFiles?.fe ?? [],
      )
    } catch (err) {
      this.logger.warn("intake.checkAuditTrailRequired failed", {
        err: (err as Error).message,
      })
      auditTrail = {
        required: false,
        reason: "Audit-trail enforcer threw; defaulting to not required.",
        pattern: "inline-edit-with-audit" as const,
        fieldsToLog: [],
      }
    }

    // PROJECT MODE detection (2026-05-29) — sits above the scenario classifier.
    // Drives clone/preview behavior downstream. Heuristic-only, never throws.
    // selectedRepo present + resolvable → existing-repo (strongest signal, no
    // clarify). resolveTargetRepoPath returns a path for any manifest-known
    // repo, so a non-null result === known Dash repo. existingFiles arrive
    // later in the chain; runIntake passes [] here (same blind-spot the
    // scenario reconcile handles), so mode leans on selectedRepo + keywords.
    let mode
    try {
      mode = detectMode({
        prompt: promptText,
        selectedRepo: selectedRepo ?? null,
        repoIsKnownDashRepo: selectedRepo
          ? resolveTargetRepoPath(selectedRepo) !== null
          : false,
        resolvedExistingFiles: [],
      })
    } catch (err) {
      this.logger.warn("intake.detectMode failed", { err: (err as Error).message })
      mode = undefined
    }

    return { beCatalog, dbCatalog, classification, auditTrail, mode }
  }

  /**
   * Emit the `component:updated` SSE event consumed by
   * `daemon/templates/client/preview-mount.ts`. The browser script picks the
   * source out of `detail.componentSource` and re-mounts the Sandpack iframe.
   *
   * For new-file artifacts we pass the generated source straight through. For
   * patch-only artifacts (mode=patch) we read the target file from the
   * sandbox clone, apply the unified diff in-memory, and emit the RESULTING
   * source — so the browser preview shows the post-patch component visually
   * instead of dumping the raw diff.
   *
   * Best-effort: any failure (no clone, file missing, diff malformed, …)
   * skips the broadcast silently. Patch-mode preview is additive; the diff
   * tab still works regardless.
   */
  private emitComponentUpdated(
    prompt: PromptRecord,
    artifact: GenerationArtifact,
    intake: IntakeContext | null,
  ): void {
    const newFileCandidate = pickComponentSource(artifact)
    if (newFileCandidate) {
      const componentSource = newFileCandidate.content
      this.broadcaster.broadcast("component:updated", {
        runId: prompt.id,
        componentId: prompt.id,
        componentSource,
        contextMap: {
          landsAt: newFileCandidate.path,
          uses: detectDashDsImports(componentSource),
          be: intake?.classification.affectedFiles?.be ?? [],
          audit: intake?.auditTrail.required ? intake.auditTrail.reason : null,
        },
      })
      return
    }

    // Patch-mode fallback — find the first .tsx/.jsx patch and try to apply
    // it against the workspace clone so we can preview the visual result.
    const patchCandidate = pickPatchComponentSource(artifact)
    if (!patchCandidate) return

    const clonePath = this.workspace?.clonePath
    if (!clonePath) {
      this.logger.info("preview: skipping patch-mode broadcast (no clone)", {
        id: prompt.id,
        path: patchCandidate.path,
      })
      return
    }

    let originalSource: string
    try {
      originalSource = readFileSync(join(clonePath, patchCandidate.path), "utf8")
    } catch (err) {
      this.logger.warn("preview: failed to read patch target", {
        id: prompt.id,
        path: patchCandidate.path,
        err: (err as Error).message,
      })
      return
    }

    const applied = applyUnifiedDiff(originalSource, patchCandidate.patchContent)
    if (!applied.ok) {
      this.logger.warn("preview: in-memory diff apply failed", {
        id: prompt.id,
        path: patchCandidate.path,
        reason: applied.reason,
      })
      return
    }

    const componentSource = applied.result

    // Bug 2 fix (2026-05-28): persist the post-patch component source under
    // <runDir>/files/<patchpath> so the next /workspace/<runId> cold load can
    // pick it up via the existing pickComponentFile() walk. Without this the
    // patch-mode preview goes blank after a process restart because the
    // SSE-only path never re-fires and loadInitialPreview returns null for
    // patch-only artifacts (no .tsx in <runDir>/files/).
    //
    // Best-effort: a write failure does NOT block the live SSE broadcast.
    void persistPatchedComponentSource({
      runId: prompt.id,
      patchPath: patchCandidate.path,
      content: componentSource,
    }).catch((err) => {
      this.logger.warn("preview: failed to persist patched component source", {
        id: prompt.id,
        path: patchCandidate.path,
        err: (err as Error).message,
      })
    })

    this.broadcaster.broadcast("component:updated", {
      runId: prompt.id,
      componentId: prompt.id,
      componentSource,
      contextMap: {
        landsAt: patchCandidate.path,
        uses: detectDashDsImports(componentSource),
        be: intake?.classification.affectedFiles?.be ?? [],
        audit: intake?.auditTrail.required ? intake.auditTrail.reason : null,
      },
    })
  }

  /**
   * Called by the clarification API route after the user answers all
   * required questions. Merges answers into the original prompt and
   * restarts processPrompt.
   */
  async resumeAfterClarification(
    promptId: string,
    outcome: "answered" | "skipped" = "answered",
  ): Promise<void> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) return
    if (prompt.status !== "clarifying") {
      this.logger.warn("resume: prompt not in clarifying", {
        id: promptId,
        status: prompt.status,
      })
      return
    }

    // Mark this run as clarify-resolved so the chain's clarify gate does NOT
    // re-fire on the resume pass (on skip there are no answers folded in, so
    // the same ambiguity would otherwise re-trigger an infinite clarify loop).
    this.clarifyResolved.add(promptId)

    if (outcome === "skipped") {
      // User opted out — generate with the ORIGINAL prompt, no answers folded.
      // (The session store has no "skipped" status; the route signals it via
      // the onComplete outcome, so we trust that rather than re-reading.)
      await this.setStatus(prompt, "generating")
      return this.processPrompt(promptId)
    }

    const resolved = await this.clarification.resolved(promptId)
    if (!resolved || resolved.status !== "answered") {
      this.logger.warn("resume: no answered session yet", { id: promptId })
      this.clarifyResolved.delete(promptId)
      return
    }

    // Direct in-place mutation of the PromptRecord (same pattern the store
    // uses for status) to carry the merged prompt forward.
    prompt.text = resolved.mergedPrompt

    await this.setStatus(prompt, "generating")
    return this.processPrompt(promptId)
  }

  /**
   * Approve the generated PR. Calls submitChanges → status → pr_created.
   */
  async approvePR(input: ApprovePRInput): Promise<ApprovePRResult> {
    const prompt = this.store.getPrompt(input.promptId)
    if (!prompt) throw new Error(`Unknown prompt ${input.promptId}`)
    if (prompt.status !== "awaiting_approval") {
      throw new Error(
        `Prompt ${input.promptId} not ready for PR (status=${prompt.status})`,
      )
    }
    const artifact = this.artifacts.get(input.promptId)
    if (!artifact) {
      throw new Error(`No generated artifact for prompt ${input.promptId}`)
    }
    if (!prompt.repo) {
      throw new Error(`Prompt ${input.promptId} has no repo set`)
    }

    // P5 — SERVER-SIDE validation gate. The dashboard hides the merge button
    // when validation.passed === false (e.g. a CR-3 audit-log rejection on a
    // payment/KYC field), but that guard is client-only — a direct POST
    // /approve could still ship an unvalidated artifact. Refuse here unless the
    // caller passes an explicit `force: true`, which we log + broadcast so the
    // override is auditable.
    if (artifact.validation.passed === false) {
      if (!input.force) {
        const topError = artifact.validation.errors[0]
        this.logger.warn("approvePR refused: validation failed", {
          id: input.promptId,
          score: artifact.validation.score,
          errorCount: artifact.validation.errors.length,
          topRule: topError?.ruleId,
        })
        this.broadcaster.broadcast("validation:rejected", {
          promptId: input.promptId,
          ruleId: topError?.ruleId ?? "validation-failed",
          file: topError?.file ?? null,
          message:
            "PR approval refused — generated artifact failed validation. " +
            "Re-prompt to fix the flagged issue, or pass force=true to override.",
        })
        throw new PipelineError(
          "validation-failed",
          `Cannot open PR for prompt ${input.promptId}: artifact failed validation ` +
            `(score ${artifact.validation.score}/100, ${artifact.validation.errors.length} error(s)` +
            (topError ? `, first: ${topError.ruleId ?? topError.message}` : "") +
            "). Re-prompt to fix, or pass force=true to override.",
        )
      }
      this.logger.warn("approvePR FORCED past failed validation", {
        id: input.promptId,
        score: artifact.validation.score,
        errorCount: artifact.validation.errors.length,
      })
      this.broadcaster.broadcast("validation:forced", {
        promptId: input.promptId,
        score: artifact.validation.score,
        errorCount: artifact.validation.errors.length,
      })
    }

    if (!(await this.github.isConnected())) {
      const err = new PipelineError(
        "auth-missing-github",
        "GitHub App not installed",
      )
      await this.failPrompt(prompt, err)
      throw err
    }

    const baseBranch = prompt.branch || this.defaultBaseBranch
    const newBranch = input.branch ?? `dash-build/${input.promptId.slice(0, 12)}`
    const commitMessage = input.commitMessage ?? this.buildCommitMessage(prompt)
    const sandbox = this.sandboxRuns.get(input.promptId)

    try {
      let prUrl: string
      let prNumber: number

      if (this.publisher && sandbox) {
        // D2 path — extract generated-only commits from the sandbox clone,
        // push as the canonical run branch, open PR via GitHub App.
        const published = await this.publisher.publish({
          runId: input.promptId,
          userId: sandbox.userId,
          fullName: prompt.repo,
          baseBranch,
          prTitle: input.prTitle ?? this.buildPRTitle(prompt),
          prBody: input.prBody ?? this.buildPRBody(prompt, artifact),
        })
        prUrl = published.prUrl
        prNumber = published.prNumber

        // Best-effort: reset sandbox to idle so the next run starts clean.
        // Failure here doesn't roll back the PR.
        try {
          await this.publisher.cleanup({
            runId: input.promptId,
            userId: sandbox.userId,
          })
        } catch (cleanupErr) {
          this.logger.warn("sandbox cleanup failed (PR succeeded)", {
            id: input.promptId,
            err: (cleanupErr as Error).message,
          })
        }
        this.sandboxRuns.delete(input.promptId)
      } else {
        const submitted = await this.github.submitChanges({
          fullName: prompt.repo,
          baseBranch,
          newBranch,
          files: artifact.files.map((f) => ({ path: f.path, content: f.content })),
          commitMessage,
          prTitle: input.prTitle ?? this.buildPRTitle(prompt),
          prBody: input.prBody ?? this.buildPRBody(prompt, artifact),
        })
        prUrl = submitted.prUrl
        prNumber = submitted.prNumber
      }

      await this.store.updatePromptStatus(input.promptId, "pr_created", {
        prUrl,
      })
      this.broadcaster.broadcast("pr:created", {
        promptId: input.promptId,
        prUrl,
        prNumber,
      })

      // Schedule preview cleanup after a delay so the user can still revisit
      // the iframe right after the PR opens. Failure is swallowed — the
      // cleanupOld() sweeper will catch orphans eventually.
      this.schedulePreviewCleanup(input.promptId)

      return { prUrl, prNumber }
    } catch (err) {
      const classified = classify(err)
      await this.failPrompt(prompt, classified)
      throw classified
    }
  }

  private schedulePreviewCleanup(promptId: string): void {
    if (this.previewCleanupDelayMs <= 0) {
      // Test path — run immediately, swallow errors.
      void this.previewCleanup(promptId).catch(() => false)
      return
    }
    const h = setTimeout(() => {
      this.previewCleanup(promptId).catch(() => false)
    }, this.previewCleanupDelayMs)
    if (typeof (h as { unref?: () => void }).unref === "function") {
      ;(h as { unref: () => void }).unref()
    }
  }

  // ── Inspection helpers (used by HTTP routes + tests) ─────────────────────

  getArtifact(promptId: string): GenerationArtifact | undefined {
    const cached = this.artifacts.get(promptId)
    if (cached) return cached
    const recovered = readPersistedArtifact(promptId)
    if (recovered) this.artifacts.set(promptId, recovered)
    return recovered
  }

  /**
   * Open WebUI #A4 — record the user's variant pick. Promotes the chosen
   * variant's files to the canonical `<runDir>/files/` location, updates
   * the persisted variants.json `active` field, and broadcasts so any
   * watching dashboard pane can collapse the split view.
   *
   * Returns `{ ok: true, active }` on success, or `{ ok: false, error }`
   * when the run / variant is unknown.
   */
  async pickVariant(
    promptId: string,
    variantId: string,
  ): Promise<{ ok: true; active: string } | { ok: false; error: string }> {
    if (!/^[a-z]$/.test(variantId)) {
      return { ok: false, error: "invalid_variant_id" }
    }
    const artifact = this.getArtifact(promptId)
    if (!artifact) return { ok: false, error: "unknown_prompt" }
    if (!artifact.variants) return { ok: false, error: "no_variants_for_run" }
    const known = artifact.variants.list.some((v) => v.id === variantId)
    if (!known) return { ok: false, error: "unknown_variant_id" }

    try {
      await promoteVariantToCanonical(promptId, variantId)
      await writeVariantsManifest(promptId, {
        active: variantId,
        list: artifact.variants.list,
      })
      artifact.variants = {
        active: variantId,
        list: artifact.variants.list,
      }
      this.broadcaster.broadcast("variants:picked", {
        runId: promptId,
        promptId,
        active: variantId,
      })
      return { ok: true, active: variantId }
    } catch (err) {
      this.logger.warn("pickVariant failed", {
        id: promptId,
        variantId,
        err: (err as Error).message,
      })
      return { ok: false, error: (err as Error).message }
    }
  }

  // ── Internals ────────────────────────────────────────────────────────────

  /**
   * Bug 6 — true when the run has been cancelled out from under processPrompt
   * (status flipped to `cancelled`, or the AbortController fired). Read at each
   * pipeline checkpoint so a Stop click takes effect at the next safe boundary.
   */
  private wasCancelled(promptId: string): boolean {
    const current = this.store.getPrompt(promptId)
    if (current?.status === "cancelled") return true
    const aborter = this.runAborters.get(promptId)
    return aborter?.signal.aborted ?? false
  }

  /**
   * P4 — true when a NEW-file path already exists inside the sandbox clone,
   * i.e. committing it as a "new file" would silently overwrite trunk code.
   * Best-effort: any FS / path error resolves to `false` (treat as a genuine
   * new file) so the gate never crashes the pipeline. Path traversal is
   * contained by resolving against the clone root and requiring the result to
   * stay under it — a `../` escape resolves outside and is treated as new.
   */
  private fileExistsInClone(clonePath: string, relPath: string): boolean {
    if (!clonePath || !relPath) return false
    try {
      const base = resolvePath(clonePath)
      const target = resolvePath(join(clonePath, relPath))
      if (target !== base && !target.startsWith(base + pathSep)) return false
      return existsSync(target)
    } catch {
      return false
    }
  }

  private async setStatus(prompt: PromptRecord, to: PromptStatus): Promise<void> {
    const target = nextStatus(prompt.status, to)
    if (target === prompt.status) return
    await this.store.updatePromptStatus(prompt.id, target)
    this.broadcaster.broadcast("prompts:changed", { id: prompt.id, status: target })
    this.broadcaster.broadcast("runs:changed", { id: prompt.id, status: target })
    // Bug 6 — once a run settles into a terminal/awaiting state, its aborter is
    // no longer useful; drop it so the map doesn't grow unbounded.
    if (
      target === "awaiting_approval" ||
      target === "completed" ||
      target === "failed" ||
      target === "cancelled" ||
      target === "pr_created"
    ) {
      this.runAborters.delete(prompt.id)
    }
  }

  private async persistRunArtifact(
    prompt: PromptRecord,
    artifact: GenerationArtifact,
  ): Promise<void> {
    try {
      const written = await writeRunArtifacts({
        runId: prompt.id,
        prompt: prompt.text,
        repo: prompt.repo,
        branch: prompt.branch,
        generatedAt: artifact.generatedAt,
        files: artifact.files,
        // Tier 2 #4 — persist patches so the Diff tab can render on cold load.
        patches: artifact.patches ?? [],
        validation: artifact.validation,
        explanation: artifact.explanation,
        contextPack: artifact.contextPack,
        // Tier 0 #0O — persist auth mode alongside the run summary.
        providerMode: artifact.providerMode ?? null,
      })
      await this.store.setRunArtifact(prompt.id, {
        artifactDir: written.runDir,
        contextPackRef: written.contextPackRef,
        validationScore: artifact.validation.score,
      })
    } catch (err) {
      this.logger.warn("run artifact persist failed", {
        id: prompt.id,
        err: (err as Error).message,
      })
    }
  }

  private async beginClarification(
    prompt: PromptRecord,
    questions: ClarificationQuestion[],
    originalPrompt: string,
  ): Promise<void> {
    await this.clarification.create(prompt.id, originalPrompt, questions)
    await this.setStatus(prompt, "clarifying")
    this.broadcaster.broadcast("clarification:needed", {
      promptId: prompt.id,
      sessionId: prompt.id,
      questionsCount: questions.length,
    })
  }

  private async failPrompt(prompt: PromptRecord, err: unknown): Promise<void> {
    const classified = classify(err)
    const summary = describe(classified)
    this.logger.error("pipeline failed", {
      id: prompt.id,
      kind: classified.kind,
      message: classified.message,
    })
    // AOP error — "Failed: <reason>" — then a terminal run.end so the live
    // stream resolves the in-flight spinner into a failure state.
    this.narrate(prompt.id, "error", () => ({
      code: classified.kind ?? "pipeline-error",
      message: `Failed: ${classified.message ?? summary}`,
      recoverable: false,
      severity: "error" as const,
    }))
    this.narrate(prompt.id, "run.end", () => ({
      status: "failed" as const,
      durationMs: 0,
      reason: classified.message ?? summary,
      summary: {
        artifacts: 0,
        decisions: 0,
        validations: { pass: 0, fail: 1 },
        totalUsd: 0,
        totalTokens: 0,
      },
    }))
    this.forgetRunEmitter(prompt.id)
    await this.store.updatePromptStatus(prompt.id, "failed", { error: summary })
    this.broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: "failed",
      error: summary,
    })
    this.broadcaster.broadcast("runs:changed", {
      id: prompt.id,
      status: "failed",
      error: summary,
    })
  }

  private buildCommitMessage(prompt: PromptRecord): string {
    const head = prompt.text.split(/\r?\n/)[0]?.slice(0, 60) ?? "dash-build change"
    return `feat: ${head}`
  }

  private buildPRTitle(prompt: PromptRecord): string {
    return prompt.text.slice(0, 80)
  }

  private buildPRBody(prompt: PromptRecord, artifact: GenerationArtifact): string {
    const fileList = artifact.files
      .map((f) => `- \`${f.path}\``)
      .join("\n")
    const errors = artifact.validation.errors
      .map((e) => `- [${e.severity}] ${e.message} (${e.file})`)
      .join("\n")
    const errorsBlock = errors
      ? `\n**Validation flags:**\n${errors}\n`
      : ""
    return `## Dash Build Generated PR

**Prompt:** ${prompt.text}

**Foundation match score:** ${artifact.validation.score}/100 (${artifact.validation.passed ? "passed" : "review needed"})

**Files generated:**
${fileList}
${errorsBlock}
**Explanation:**
${artifact.explanation}

---
🤖 Generated via Dash Build (Lovable-for-Dash) — run id ${prompt.id}
`
  }
}

const ARTIFACT_MANIFEST = "artifact.json"
const GENERATED_ENTRY_FILE = "__dash_preview_entry.tsx"

/**
 * Open WebUI #A4 — pick the "best" variant for the canonical pipeline. We
 * prefer:
 *   1. Any `generated` result (over clarify / error).
 *   2. Among generated results, the higher `validation.score`.
 *   3. Ties broken by lexical variant id ('a' beats 'b') — deterministic.
 *
 * Returns the first entry when no generated result exists, so the caller can
 * still propagate clarify / error semantics through the normal branches.
 */
function pickWinnerResult<
  T extends { id: string; temperature: number; result: GenerateResult },
>(variants: T[]): T {
  if (variants.length === 0) {
    throw new Error("pickWinnerResult: empty variants")
  }
  const generated = variants.filter((v) => v.result.kind === "generated")
  if (generated.length === 0) return variants[0]!
  return generated
    .slice()
    .sort((a, b) => {
      const aScore =
        a.result.kind === "generated" ? a.result.validation.score : 0
      const bScore =
        b.result.kind === "generated" ? b.result.validation.score : 0
      if (aScore !== bScore) return bScore - aScore
      return a.id.localeCompare(b.id)
    })[0]!
}

/**
 * Open WebUI #A4 — derive a short human-readable summary for a variant. We
 * pull the first non-empty line of the explanation (clamped to 120 chars)
 * so the UI can render "Variant A · added Card with Suspend CTA" style
 * captions next to each iframe.
 */
function summariseVariant(result: GenerateResult): string {
  if (result.kind !== "generated") return ""
  const exp = (result.response.explanation ?? "").trim()
  if (!exp) return ""
  const firstLine = exp.split(/\r?\n/).find((l) => l.trim().length > 0) ?? exp
  const trimmed = firstLine.trim()
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed
}

/**
 * Pick the "main" generated component file for the SSE preview event.
 *
 * Priority:
 *   1. `preview.tsx`  (canonical Dash Build canvas — always exported when UI
 *      changes per the composer's contract).
 *   2. First .tsx file that has a `export default` (likely the real component).
 *   3. First .tsx / .jsx file found.
 *
 * Returns null when nothing matches (patch-only or non-UI output) — caller
 * skips the broadcast in that case.
 */
function pickComponentSource(
  artifact: GenerationArtifact,
): { path: string; content: string } | null {
  const tsxLike = artifact.files.filter(
    (f) => /\.(tsx|jsx)$/.test(f.path) || f.language === "tsx" || f.language === "jsx",
  )
  if (tsxLike.length === 0) return null

  const preview = tsxLike.find((f) => f.path.endsWith("preview.tsx"))
  if (preview) return { path: preview.path, content: preview.content }

  const withDefault = tsxLike.find((f) => /export\s+default/.test(f.content))
  if (withDefault) return { path: withDefault.path, content: withDefault.content }

  const first = tsxLike[0]!
  return { path: first.path, content: first.content }
}

/**
 * Pick the "main" patch to render for the SSE preview event when the
 * generation has NO new files (patch-only output). Mirrors the .tsx/.jsx
 * preference of `pickComponentSource` so the preview tracks the same kind
 * of component file.
 *
 * Returns null when no patch targets a UI file — caller skips broadcast.
 */
function pickPatchComponentSource(
  artifact: GenerationArtifact,
): { path: string; patchContent: string } | null {
  const patches = artifact.patches ?? []
  if (patches.length === 0) return null
  const uiPatch = patches.find((p) => /\.(tsx|jsx)$/.test(p.path))
  if (uiPatch) return { path: uiPatch.path, patchContent: uiPatch.patchContent }
  return null
}

/**
 * P4 — does this path land at a protected location (auth/payment/middleware/
 * env)? Single-sourced from the patch-validator's `protectedFilePatterns` so
 * the new-file gate and the patch gate enforce exactly the same rule set.
 */
function matchesProtectedPath(path: string): boolean {
  return DEFAULT_PATCH_ALLOWLIST.protectedFilePatterns.some((re) => re.test(path))
}

function detectLanguage(filePath: string): string {
  if (filePath.endsWith(".tsx")) return "tsx"
  if (filePath.endsWith(".ts")) return "ts"
  if (filePath.endsWith(".jsx")) return "jsx"
  if (filePath.endsWith(".js")) return "js"
  if (filePath.endsWith(".json")) return "json"
  if (filePath.endsWith(".css")) return "css"
  if (filePath.endsWith(".md")) return "md"
  return "text"
}

/**
 * Bug 2 fix (2026-05-28): mirror the post-patch component source under
 * `<runDir>/files/<patchPath>` so cold-load (`loadInitialPreview`) can pick
 * it up via the standard pickComponentFile() walk. Used for patch-only
 * generations where `artifact.files` is empty.
 *
 * Best-effort: silent fail if the run dir does not exist yet (caller already
 * persisted run.json before reaching this codepath in normal flow). Path
 * traversal is prevented by joining against the resolved runDir + checking
 * the result still starts with the runDir prefix — mirrors the safeRelative
 * guard in artifact-store.ts.
 */
async function persistPatchedComponentSource(input: {
  runId: string
  patchPath: string
  content: string
}): Promise<void> {
  if (!input.runId || !input.patchPath) return
  const runDir = resolveRunDir(input.runId)
  if (!existsSync(runDir)) return
  const filesDir = join(runDir, "files")
  const target = join(filesDir, input.patchPath)
  const resolvedTarget = resolvePath(target)
  const base = resolvePath(filesDir)
  if (resolvedTarget !== base && !resolvedTarget.startsWith(base + pathSep)) return
  await mkdir(join(target, ".."), { recursive: true })
  await writeFile(target, input.content, "utf8")
}

async function persistArtifact(
  promptId: string,
  artifact: GenerationArtifact,
): Promise<void> {
  const tempDir = await prepareTempDir(promptId)
  await writeFile(
    join(tempDir, ARTIFACT_MANIFEST),
    JSON.stringify(
      {
        ...artifact,
        bundleResult: artifact.bundleResult
          ? {
              ...artifact.bundleResult,
              bundlePath: "bundle.js",
              tempDir: ".",
            }
          : undefined,
      },
      null,
      2,
    ),
    "utf8",
  )
}

function readGeneratedFilesFromPreviewDir(dir: string, prefix = ""): ParsedFile[] {
  const files: ParsedFile[] = []
  let entries: import("node:fs").Dirent[]
  try {
    entries = readdirSync(join(dir, prefix), { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    const rel = prefix ? join(prefix, entry.name) : entry.name
    if (entry.isDirectory()) {
      files.push(...readGeneratedFilesFromPreviewDir(dir, rel))
      continue
    }
    if (
      rel === "bundle.js" ||
      rel === ARTIFACT_MANIFEST ||
      rel === GENERATED_ENTRY_FILE ||
      rel.endsWith(".map")
    ) {
      continue
    }
    try {
      files.push({
        path: rel,
        language: detectLanguage(rel),
        content: readFileSync(join(dir, rel), "utf8"),
      })
    } catch {
      // Best-effort recovery only.
    }
  }
  return files
}

function readPersistedArtifact(promptId: string): GenerationArtifact | undefined {
  const tempDir = resolvePreviewDir(promptId)
  const manifestPath = join(tempDir, ARTIFACT_MANIFEST)
  if (existsSync(manifestPath)) {
    try {
      const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as GenerationArtifact
      if (parsed.bundleResult) {
        parsed.bundleResult = {
          ...parsed.bundleResult,
          bundlePath: bundlePathFor(promptId),
          tempDir,
        }
      }
      return parsed
    } catch {
      // Fall through to file recovery.
    }
  }

  if (!existsSync(tempDir)) return undefined
  const files = readGeneratedFilesFromPreviewDir(tempDir)
  if (files.length === 0) return undefined
  const bundlePath = bundlePathFor(promptId)
  const bundleResult: BundleResult | undefined = existsSync(bundlePath)
    ? {
        bundlePath,
        entryPath: files[0]?.path ?? "preview.tsx",
        byteSize: statSync(bundlePath).size,
        tempDir,
      }
    : undefined

  return {
    promptId,
    files,
    explanation: "Recovered generated files from the local preview workspace after daemon restart.",
    validation: { passed: true, score: 100, errors: [], warnings: [] },
    generatedAt: statSync(tempDir).mtime.toISOString(),
    bundleResult,
    previewMode: "component",
  }
}

async function writeFallbackPreviewBundle(
  promptId: string,
  artifact: GenerationArtifact,
  err: unknown,
): Promise<BundleResult> {
  const tempDir = await prepareTempDir(promptId)
  const bundlePath = join(tempDir, "bundle.js")
  const message = err instanceof Error ? err.message : String(err)
  const data = {
    fileCount: artifact.files.length,
    files: artifact.files.map((f) => ({
      path: f.path,
      language: f.language,
      bytes: f.content.length,
    })),
    score: artifact.validation.score,
    passed: artifact.validation.passed,
    explanation: artifact.explanation,
    message,
  }
  const js = `(() => {
  const data = ${JSON.stringify(data)};
  const root = document.getElementById("root");
  if (!root) return;
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const rows = data.files.map((file) => \`
    <li class="dash-preview-file">
      <span class="dash-preview-file-path">\${escapeHtml(file.path)}</span>
      <span class="dash-preview-file-meta">\${escapeHtml(file.language)} · \${file.bytes}B</span>
    </li>\`).join("");
  root.innerHTML = \`
    <style>
      .dash-preview-fallback { max-width: 980px; margin: 0 auto; display: grid; gap: 16px; }
      .dash-preview-hero { padding: 24px; border: 1px solid var(--stroke-soft-200); border-radius: var(--radius-16); background: var(--bg-white-0); box-shadow: var(--shadow-custom-shadows-medium); }
      .dash-preview-kicker { margin: 0 0 8px; color: var(--primary-base); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
      .dash-preview-title { margin: 0; font-size: var(--text-display-md, 28px); line-height: 1.15; color: var(--text-strong-950); }
      .dash-preview-sub { margin: 12px 0 0; color: var(--text-sub-600); line-height: 1.6; max-width: 760px; }
      .dash-preview-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      .dash-preview-stat { padding: 10px 12px; border-radius: 10px; background: var(--bg-weak-50); color: var(--text-strong-950); font-weight: 700; }
      .dash-preview-files { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
      .dash-preview-file { display: flex; justify-content: space-between; gap: 16px; padding: 12px 14px; border: 1px solid var(--stroke-soft-200); border-radius: 10px; background: var(--bg-white-0); }
      .dash-preview-file-path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--text-strong-950); overflow-wrap: anywhere; }
      .dash-preview-file-meta { color: var(--text-sub-600); white-space: nowrap; }
      .dash-preview-note { padding: 14px 16px; border-radius: 10px; background: var(--state-warning-lighter); color: var(--state-warning-dark); border: 1px solid var(--state-warning-light); font-size: 13px; line-height: 1.5; }
    </style>
    <main class="dash-preview-fallback">
      <section class="dash-preview-hero">
        <p class="dash-preview-kicker">Generated output ready</p>
        <h1 class="dash-preview-title">Review generated Dash files</h1>
        <p class="dash-preview-sub">\${escapeHtml(data.explanation || "Dash Build generated files, but the component bundle could not be mounted directly in the sandbox.")}</p>
        <div class="dash-preview-stats">
          <span class="dash-preview-stat">\${data.fileCount} files</span>
          <span class="dash-preview-stat">Foundation \${data.score}/100</span>
          <span class="dash-preview-stat">\${data.passed ? "Validation passed" : "Needs review"}</span>
        </div>
      </section>
      <ul class="dash-preview-files">\${rows}</ul>
      <div class="dash-preview-note">Sandbox fallback: the generated files are available, but the visual iframe could not bundle the repo-specific imports. Reason: \${escapeHtml(data.message)}</div>
    </main>\`;
})();`
  await writeFile(bundlePath, js, "utf8")
  const info = await stat(bundlePath)
  return {
    bundlePath,
    entryPath: "dash-build-fallback-preview.js",
    byteSize: info.size,
    tempDir,
  }
}

// ── Default skill-chain runner (calls real chain) ──────────────────────────

import { generateWithSkillChain } from "../skills/index.js"

/**
 * Factory for the default runner that delegates to the real skill chain.
 * Tests inject a stub instead.
 *
 * Open WebUI #A4 — when the orchestrator passes a `variantId` / `temperature`,
 * we append a small directive to the prompt so the underlying LLM nudges
 * toward divergent outputs. The chain layer itself stays variant-agnostic
 * — the diversity is encoded purely in the suffix so existing tests / stubs
 * keep working without schema churn.
 */
export function defaultSkillChainRunner(): SkillChainRunner {
  return {
    async run(input) {
      const prompt = input.variantId
        ? `${input.prompt}\n\n---\nVariant ${input.variantId.toUpperCase()} (temperature ${input.temperature ?? "default"}): generate a distinct interpretation from the other variant — prefer different layout / DS component choices where reasonable, while staying within the Dash design system.`
        : input.prompt
      return generateWithSkillChain(
        {
          prompt,
          repoPath: input.repoPath,
          selectedRepo: input.selectedRepo ?? null,
          intake: input.intake,
          runId: input.runId,
          suppressClarify: input.suppressClarify,
        },
        { anthropic: input.anthropic },
      )
    },
  }
}

// ── Default clarification gateway (wraps SessionStore) ─────────────────────

import type { SessionStore } from "../clarification/session-store.js"

export function defaultClarificationGateway(
  store: SessionStore,
): ClarificationGateway {
  return {
    async create(promptId, originalPrompt, questions) {
      await store.create(promptId, originalPrompt, questions)
    },
    async resolved(promptId) {
      const session = await store.get(promptId)
      if (!session) return null
      return {
        status: session.status,
        mergedPrompt: mergeAnswers(session.originalPrompt, session.answers, session.questions),
        answers: session.answers,
      }
    },
  }
}

/** Fold user answers back into the original prompt as appended context. */
export function mergeAnswers(
  original: string,
  answers: Record<string, ClarificationAnswer>,
  questions: ClarificationQuestion[],
): string {
  if (Object.keys(answers).length === 0) return original
  const lines: string[] = []
  for (const q of questions) {
    const a = answers[q.id]
    if (a === undefined) continue
    const formatted = Array.isArray(a) ? a.join(", ") : String(a)
    lines.push(`- ${q.text} → ${formatted}`)
  }
  if (lines.length === 0) return original
  return `${original}\n\n--- Clarifications ---\n${lines.join("\n")}`
}

// ── Default github gateway (wraps GitHubAppClient + submitChanges) ─────────

import type { GitHubAppClient } from "../integrations/github/client.js"
import { submitChanges } from "../integrations/github/repo-ops.js"

export function defaultGithubProvider(client: GitHubAppClient): GithubProvider {
  return {
    async isConnected() {
      return client.isConnected()
    },
    async submitChanges(input) {
      return submitChanges({
        client,
        fullName: input.fullName,
        baseBranch: input.baseBranch,
        newBranch: input.newBranch,
        files: input.files,
        commitMessage: input.commitMessage,
        prTitle: input.prTitle,
        prBody: input.prBody,
      })
    },
  }
}

// ── Default OpenAI/Codex provider ──────────────────────────────────────────

import type { AuthenticatedOpenAIClient } from "../auth/openai/client.js"
import type { AnthropicLike } from "../skills/types.js"

export function defaultOpenAIProvider(
  client: AuthenticatedOpenAIClient,
): AnthropicProvider {
  return {
    async isConnected() {
      return client.isConnected()
    },
    async getMode() {
      return client.getMode()
    },
    async buildSdkClient() {
      return {
        messages: {
          async create(req) {
            const body = req.messages
              .map((m) => `[${m.role}]\n${m.content}`)
              .join("\n\n")
            const prompt = req.system
              ? `[system]\n${req.system}\n\n${body}`
              : body
            const text = await client.complete(prompt, {
              model: process.env.DASH_BUILD_OPENAI_MODEL ? req.model : undefined,
            })
            return { content: [{ type: "text", text }] }
          },
        },
      } satisfies AnthropicLike
    },
  }
}

// Re-export randomUUID-based promptId helper for callers that want their own id.
export function generatePromptId(): string {
  return `prm_${randomUUID().slice(0, 12)}`
}

/**
 * Best-effort `git remote get-url origin` against the local checkout. Returns
 * `null` if git is missing, the dir is not a checkout, or the command fails.
 * Used by `ensureWorkspaceBootstrap` so the clone tracks the canonical
 * GitHub origin instead of a local file-path (which would block PR push).
 */
async function detectOriginUrl(cwd: string): Promise<string | null> {
  return await new Promise<string | null>((resolve) => {
    let stdout = ""
    let stderr = ""
    try {
      const child = spawn("git", ["remote", "get-url", "origin"], {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
      })
      child.stdout.on("data", (d) => {
        stdout += d.toString("utf8")
      })
      child.stderr.on("data", (d) => {
        stderr += d.toString("utf8")
      })
      child.on("error", () => resolve(null))
      child.on("close", (code) => {
        if (code !== 0) {
          void stderr
          return resolve(null)
        }
        const url = stdout.trim()
        resolve(url || null)
      })
    } catch {
      resolve(null)
    }
  })
}
