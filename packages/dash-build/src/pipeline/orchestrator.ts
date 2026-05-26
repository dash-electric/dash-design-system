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
import { stat, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { Store } from "../daemon/state/store.js"
import type { Broadcaster } from "../daemon/ws/broadcaster.js"
import type { PromptRecord, PromptStatus } from "../daemon/state/types.js"
import type {
  ClarificationAnswer,
  ClarificationQuestion,
} from "../clarification/types.js"
import type { GenerateResult, ParsedFile, ValidationResult } from "../skills/types.js"
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
import { writeRunArtifacts } from "../runs/artifact-store.js"
import type { BranchManager, Workspace } from "../runs/branch-manager.js"
import type { Publisher } from "../runs/publish.js"
import {
  Workspace as WorkspaceImpl,
  defaultClonePathFor,
} from "../runs/workspace.js"
import { getShimForRepo } from "../runs/preview-shim.js"
import { resolveRepoPreviewConfig } from "../daemon/repo-preview.js"
import { PatchApplier } from "../runs/patch-applier.js"
import { GitOps } from "../runs/git-ops.js"

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

  /** In-memory artifact cache, keyed by promptId. Survives process lifetime
   *  only — by-design, since regenerating is cheaper than reloading from disk. */
  private readonly artifacts: Map<string, GenerationArtifact> = new Map()
  /** Sandbox branch state per run — only populated when the D2 sandbox path
   *  is active. Lets approvePR find the branch the publisher needs without
   *  re-deriving it from the prompt id. */
  private readonly sandboxRuns: Map<string, { branchName: string; userId: string }> =
    new Map()
  /** Sprint 1A — in-flight bootstrap promises keyed by repoSlug so concurrent
   *  callers (auto submitPrompt trigger + manual button click) coalesce into
   *  one clone+shim run instead of racing. */
  private readonly bootstrapInflight: Map<string, Promise<void>> = new Map()

  constructor(opts: OrchestratorOptions) {
    this.store = opts.store
    this.broadcaster = opts.broadcaster
    this.clarification = opts.clarification
    this.anthropic = opts.anthropic
    this.github = opts.github
    this.skillChain = opts.skillChain
    this.repoPathResolver = opts.repoPathResolver ?? (() => process.cwd())
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

    // Sprint 1C: wire sandbox state-machine transitions through Store +
    // Broadcaster for any Workspace passed in via DI (e.g. integration tests
    // that mock a bare repo). S1A's runtime `runBootstrap` calls
    // `wireSandboxBroadcast` directly on the Workspace it constructs, so
    // every transition (bootstrap + run + rollback + sweep) auto-broadcasts.
    // Backward-compat: silently skip when no Workspace is available.
    if (this.workspace) {
      this.wireSandboxBroadcast(this.workspace)
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
    if (input.repo) {
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
    const queuedStatus = prompt.status
    this.broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: queuedStatus,
    })
    this.broadcaster.broadcast("runs:changed", {
      id: prompt.id,
      status: queuedStatus,
    })
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

    const originUrl =
      process.env.DASH_BUILD_GIT_ORIGIN_URL?.trim() ||
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

    const startupTimeoutMs = 60_000
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
      // Fire-and-forget persistence. Defensive — Store extensions may land
      // independently in older test rigs.
      void this.setSafeSandboxState(event.repoSlug, {
        state: event.to,
        runId: event.runId,
        clonePath: workspace.clonePath,
        shimCommitSha: workspace.info().shimCommitSha,
        history: workspace.state.history(),
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

    // 2. Build SDK client + run skill chain
    let result: GenerateResult
    try {
      const sdk = await this.anthropic.buildSdkClient()
      result = await this.skillChain.run({
        prompt: prompt.text,
        repoPath: this.repoPathResolver(prompt.repo),
        selectedRepo: prompt.repo,
        anthropic: sdk,
      })
    } catch (err) {
      return this.failPrompt(prompt, err)
    }

    // 3. Branch on chain result
    if (result.kind === "clarify") {
      return this.beginClarification(prompt, result.questions, prompt.text)
    }
    if (result.kind === "error") {
      return this.failPrompt(
        prompt,
        new PipelineError("skill-chain-failed", result.reason, result.details),
      )
    }

    // 4. Generated — capture artifact + mark awaiting approval
    const artifact: GenerationArtifact = {
      promptId: prompt.id,
      files: result.response.files,
      patches: result.response.patches ?? [],
      explanation: result.response.explanation,
      validation: result.validation,
      generatedAt: new Date().toISOString(),
      contextPack: result.meta.repoContext,
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

    this.artifacts.set(prompt.id, artifact)
    await persistArtifact(prompt.id, artifact)
    await this.persistRunArtifact(prompt, artifact)

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
        if (patches.length > 0) {
          const applier = this.patchApplierFactory(this.workspace.clonePath)
          const applied: Array<{ path: string }> = []
          let conflicted: { path: string; error: string } | null = null
          for (const patch of patches) {
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
              `patch failed for ${conflicted.path} (applied ${applied.length}/${patches.length}): ${conflicted.error}`,
            )
          }
        }

        // New files (mode=new-file) — write + commit in a single shot. Empty
        // file list is OK if we only had patches; in that case stage the
        // patch deltas via a dummy commit so extractGeneratedOnly has a
        // single commit to format-patch over.
        if (artifact.files.length > 0) {
          await this.branchManager.writeGeneratedFiles(branchName, artifact.files, {
            commitMessage:
              this.buildCommitMessage(prompt) + ` [run ${prompt.id}]`,
          })
        } else if (patches.length > 0) {
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

    await this.setStatus(prompt, "awaiting_approval")
    this.broadcaster.broadcast("generation:complete", {
      promptId: prompt.id,
      score: result.validation.score,
      fileCount: result.response.files.length,
      patchCount: artifact.patches?.length ?? 0,
      passed: result.validation.passed,
      errorCount: result.validation.errors.length,
      previewAvailable: Boolean(artifact.bundleResult),
      previewMode: artifact.previewMode ?? null,
    })
  }

  /**
   * Called by the clarification API route after the user answers all
   * required questions. Merges answers into the original prompt and
   * restarts processPrompt.
   */
  async resumeAfterClarification(promptId: string): Promise<void> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) return
    if (prompt.status !== "clarifying") {
      this.logger.warn("resume: prompt not in clarifying", {
        id: promptId,
        status: prompt.status,
      })
      return
    }

    const resolved = await this.clarification.resolved(promptId)
    if (!resolved || resolved.status !== "answered") {
      this.logger.warn("resume: no answered session yet", { id: promptId })
      return
    }

    // Persist merged prompt text. We don't have setText on the store, so
    // we use a small in-place mutation via snapshot+addPrompt? No — the
    // store API mutates records in place via updatePromptStatus. We store
    // the merged prompt in `error` to surface it, then transition.
    //
    // Cleaner: we replace prompt.text by direct mutation via the
    // PromptRecord reference returned by getPrompt — see store.ts which
    // mutates `prompt.status` directly. Same pattern works for text.
    prompt.text = resolved.mergedPrompt

    await this.setStatus(prompt, "generating")
    // Re-run skill chain with the merged prompt (no longer triggers clarify
    // path because answers fold the missing surface/scope in).
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

  // ── Internals ────────────────────────────────────────────────────────────

  private async setStatus(prompt: PromptRecord, to: PromptStatus): Promise<void> {
    const target = nextStatus(prompt.status, to)
    if (target === prompt.status) return
    await this.store.updatePromptStatus(prompt.id, target)
    this.broadcaster.broadcast("prompts:changed", { id: prompt.id, status: target })
    this.broadcaster.broadcast("runs:changed", { id: prompt.id, status: target })
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
        validation: artifact.validation,
        explanation: artifact.explanation,
        contextPack: artifact.contextPack,
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
      .dash-preview-fallback { max-width: 980px; margin: 0 auto; display: grid; gap: 18px; }
      .dash-preview-hero { padding: 28px; border: 1px solid var(--stroke-soft-200); border-radius: 14px; background: var(--bg-white-0); box-shadow: 0 18px 50px rgba(26,20,36,.08); }
      .dash-preview-kicker { margin: 0 0 8px; color: var(--primary-base); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
      .dash-preview-title { margin: 0; font-size: 28px; line-height: 1.15; color: var(--text-strong-950); }
      .dash-preview-sub { margin: 12px 0 0; color: var(--text-sub-600); line-height: 1.6; max-width: 760px; }
      .dash-preview-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
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
 */
export function defaultSkillChainRunner(): SkillChainRunner {
  return {
    async run(input) {
      return generateWithSkillChain(
        {
          prompt: input.prompt,
          repoPath: input.repoPath,
          selectedRepo: input.selectedRepo ?? null,
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
