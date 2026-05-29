/**
 * Workspace orchestrator (Phase D1).
 *
 * Bootstraps + maintains the long-lived clone for ONE consumer repo:
 *   ~/Work/dash-build-clones/<repoSlug>/
 *
 * Responsibilities:
 *   - Clone bare-from-origin on first contact, else validate existing clone.
 *   - Reset --hard to origin/main on every bootstrap so we never drift.
 *   - Apply preview-shim as a single commit on top of main.
 *   - Run `npm install` if node_modules is missing.
 *   - Drive a SandboxStateMachine through `clean → cloned → shim_applied → idle`.
 *
 * NOT in scope for D1:
 *   - Branch creation per run, cherry-pick, push to prod-bare → Agent D2.
 *   - CI gate, conflict resolution, stale sweeper, topbar badge → Agent D3.
 *
 * Subprocess strategy: bare child_process.spawn for git + npm. ZERO npm deps
 * added by this module. D2 will extract `runGit` to `src/runs/git-ops.ts`.
 */

import { existsSync } from "node:fs"
import { mkdir, stat } from "node:fs/promises"
import { spawn, type ChildProcess } from "node:child_process"
import { createServer } from "node:net"
import http from "node:http"
import { dirname, isAbsolute, join } from "node:path"
import {
  type PreviewShim,
  applyShim,
  getShimForRepo,
} from "./preview-shim.js"
import {
  type SandboxState,
  type SandboxTransition,
  type SandboxTransitionEvent,
  SandboxStateMachine,
} from "./sandbox-state.js"

/**
 * One-second-resolution staleness threshold for `sync()`. If the clone's main
 * branch was last fetched > 1h ago, the orchestrator re-fetches before
 * applying the shim again.
 */
export const SYNC_STALENESS_MS = 60 * 60 * 1000

/**
 * F1 — readiness poll deadline for `startDevServer`. Beyond this, the dev
 * server is considered stuck and we reject; the orchestrator broadcasts
 * `sandbox:dev_server_failed` so the dashboard can offer a retry.
 *
 * Raised 60s → 420s on 2026-05-29. The 60s deadline was the pivot doc's
 * "scheduler silent fail": a cold `next dev` first-compile on the heavy
 * backoffice app takes 5-7 min, far past 60s, so the watchdog gave up and the
 * iframe fell back to staging while the dev server was in fact still booting.
 * 420s (7 min) covers a cold backoffice compile; warm boots resolve in
 * seconds (we resolve on TCP connect, not HTTP 200). Override with
 * DASH_BUILD_DEV_SERVER_TIMEOUT_MS for slower machines / pre-warmed clones.
 */
export const DEV_SERVER_READY_TIMEOUT_MS = Number(
  process.env.DASH_BUILD_DEV_SERVER_TIMEOUT_MS ?? 420 * 1000,
)

/**
 * F1 — when the requested port is occupied, we probe upward this many ports
 * before giving up (3101 → 3102 → … → 3110). Returning a clear error after
 * 10 shifts is better than silently scanning ephemeral ranges forever.
 */
export const DEV_SERVER_PORT_PROBE_LIMIT = 10

export interface WorkspaceOptions {
  repoSlug: string
  originUrl: string
  clonePath: string
  /** Optional shim override (defaults to getShimForRepo(repoSlug)). */
  shim?: PreviewShim
  /** Override the initial state when rehydrating from Store. */
  initialState?: SandboxState
  /** Optional pre-existing transition history (for Store rehydration). */
  initialHistory?: SandboxTransition[]
  /** Override subprocess runner (used by tests to avoid real git/npm). */
  runner?: SubprocessRunner
  /** Override default branch name (rare; default "main"). */
  defaultBranch?: string
  /** Skip `npm install` (useful in tests). */
  skipInstall?: boolean
  /** Override Date.now for deterministic staleness checks. */
  now?: () => Date
  /**
   * Optional hook fired AFTER each successful sandbox state transition.
   * Wired by the orchestrator to persist into Store + broadcast over WS so
   * the dashboard topbar reflects realtime state. Backward-compat: when
   * omitted, Workspace behaves exactly as before.
   */
  onStateChange?: (event: SandboxTransitionEvent) => void
  /**
   * F1 — fire-on-event hook for dev-server lifecycle. Wired by the
   * orchestrator to broadcast `sandbox:dev_server_crashed` (and any future
   * runtime signal) so the dashboard can refresh the badge + toast the user.
   * Backward-compat: omitting it leaves crash handling as pure local state
   * mutation (transition back to idle + clear devServerPort).
   *
   * Crashes are inherently async — the child can die long after
   * `startDevServer()` resolved — so the hook is the only way for the
   * orchestrator to learn about them.
   */
  onDevServerEvent?: (event: DevServerEvent) => void
  /**
   * F1 test seam — replace the real child_process.spawn for dev-server. Tests
   * inject a fake that emits stdout/exit events on demand so we don't run
   * `npm run dev` for real.
   */
  devServerSpawn?: DevServerSpawn
}

/**
 * F1 — dev-server lifecycle event. Currently only "crashed" fires after the
 * dev server died unexpectedly (exit code !== 0 or non-SIGTERM signal); the
 * orchestrator translates it into a `sandbox:dev_server_crashed` broadcast.
 * Normal `starting`/`ready`/`failed` lifecycle is owned by the orchestrator
 * cascade — Workspace only sees the post-ready window.
 */
export interface DevServerEvent {
  kind: "crashed"
  repoSlug: string
  port: number | null
  /** Best-effort tail of stderr captured before exit (8KB cap). */
  stderr: string
  /** Exit code, signal, or null when neither is known. */
  exit: { code: number | null; signal: NodeJS.Signals | null }
}

/**
 * F1 spawn seam — must return a ChildProcess-like surface the workspace can
 * subscribe to. Defaults to `node:child_process.spawn("npm", ["run", "dev",
 * …])`. Tests inject a fake to avoid invoking npm.
 */
export type DevServerSpawn = (input: {
  cwd: string
  port: number
  env: NodeJS.ProcessEnv
}) => ChildProcess

/**
 * F1 — snapshot of a running dev server. Exposed via `Workspace.devServer()`
 * so the orchestrator can hand the port to downstream callers without going
 * through state.json (the snapshot is the source of truth for the in-process
 * Workspace; state.json reflects it after the next broadcast).
 */
export interface DevServerInfo {
  pid: number | null
  port: number
  startedAt: string
  /** True after the readiness TCP probe succeeded. */
  ready: boolean
  /** True if the requested port was occupied and we shifted upward. */
  portShifted: boolean
  /** The port the manifest originally asked for, when portShifted is true. */
  requestedPort: number
}

export interface WorkspaceInfo {
  repoSlug: string
  clonePath: string
  shimCommitSha: string | null
  state: SandboxState
  lastSync: string
}

export interface SubprocessResult {
  stdout: string
  stderr: string
  code: number
}

export type SubprocessRunner = (
  bin: string,
  args: string[],
  cwd: string,
) => Promise<SubprocessResult>

/**
 * Default base directory for clones: ~/Work/dash-build-clones/.
 * Resolved lazily so HOME can be set under test.
 */
export function defaultClonesRoot(): string {
  return join(process.env.HOME ?? "/tmp", "Work", "dash-build-clones")
}

export function defaultClonePathFor(repoSlug: string): string {
  // Normalize "dash/backoffice" → "dash__backoffice" to avoid nested dirs that
  // would confuse `git rev-parse --show-toplevel`.
  const safe = repoSlug.replace(/[^A-Za-z0-9._-]/g, "__")
  return join(defaultClonesRoot(), safe)
}

export class Workspace {
  readonly repoSlug: string
  readonly originUrl: string
  readonly clonePath: string
  readonly shim: PreviewShim | null
  readonly state: SandboxStateMachine
  private shimCommitSha: string | null = null
  private lastSyncAt: number = 0
  private readonly runner: SubprocessRunner
  private readonly defaultBranch: string
  private readonly skipInstall: boolean
  private readonly now: () => Date
  /** F1 — dev-server child handle. null when no dev server is running. */
  private devServerChild: ChildProcess | null = null
  /** F1 — snapshot exposed via `devServer()` for the orchestrator. */
  private devServerSnapshot: DevServerInfo | null = null
  /** F1 — last 8KB of stderr; surfaced in the crash event payload. */
  private devServerStderr = ""
  /** F1 — hook fired on async dev-server runtime events (currently crashes). */
  private onDevServerEvent: ((event: DevServerEvent) => void) | null
  /** F1 — replaceable spawn for tests. */
  private readonly devServerSpawn: DevServerSpawn

  constructor(opts: WorkspaceOptions) {
    if (!opts.repoSlug) throw new Error("Workspace: repoSlug required")
    if (!opts.originUrl) throw new Error("Workspace: originUrl required")
    if (!isAbsolute(opts.clonePath)) {
      throw new Error(`Workspace: clonePath must be absolute, got ${opts.clonePath}`)
    }
    this.repoSlug = opts.repoSlug
    this.originUrl = opts.originUrl
    this.clonePath = opts.clonePath
    this.shim = opts.shim ?? getShimForRepo(opts.repoSlug)
    this.state = new SandboxStateMachine({
      repoSlug: opts.repoSlug,
      initial: opts.initialState ?? "clean",
      history: opts.initialHistory,
      now: opts.now,
      onTransition: opts.onStateChange,
    })
    this.runner = opts.runner ?? defaultRunner
    this.defaultBranch = opts.defaultBranch ?? "main"
    this.skipInstall = opts.skipInstall ?? false
    this.now = opts.now ?? (() => new Date())
    this.onDevServerEvent = opts.onDevServerEvent ?? null
    this.devServerSpawn = opts.devServerSpawn ?? defaultDevServerSpawn
  }

  /**
   * Late-bind the dev-server event hook. The orchestrator may receive a
   * Workspace constructed before its Broadcaster was available (DI ordering
   * in some test rigs). Overwrites the previous hook; pass `null` to detach.
   */
  setOnDevServerEvent(cb: ((event: DevServerEvent) => void) | null): void {
    this.onDevServerEvent = cb
  }

  /** F1 — public snapshot of the in-process dev server (null when stopped). */
  devServer(): DevServerInfo | null {
    return this.devServerSnapshot
      ? JSON.parse(JSON.stringify(this.devServerSnapshot)) as DevServerInfo
      : null
  }

  /** Public read-only snapshot for the daemon UI / Store persistence. */
  info(): WorkspaceInfo {
    return {
      repoSlug: this.repoSlug,
      clonePath: this.clonePath,
      shimCommitSha: this.shimCommitSha,
      state: this.state.current(),
      lastSync:
        this.lastSyncAt > 0
          ? new Date(this.lastSyncAt).toISOString()
          : new Date(0).toISOString(),
    }
  }

  /**
   * Full one-shot bootstrap. Idempotent — calling twice with an already-cloned
   * workspace re-runs fetch/reset/shim/install and re-drives state.
   */
  async bootstrap(): Promise<WorkspaceInfo> {
    if (!this.shim) {
      throw new Error(`Workspace: no shim registered for ${this.repoSlug}`)
    }

    await mkdir(dirname(this.clonePath), { recursive: true })

    // Step 1: ensure clone exists (clone if missing, validate origin if present).
    const cloneExists = await this.hasGitDir()
    if (!cloneExists) {
      const cloneRes = await this.runner(
        "git",
        ["clone", "--no-tags", this.originUrl, this.clonePath],
        dirname(this.clonePath),
      )
      if (cloneRes.code !== 0) {
        throw new Error(
          `git clone failed (${cloneRes.code}): ${cloneRes.stderr.trim() || cloneRes.stdout.trim()}`,
        )
      }
    } else {
      const originRes = await this.runner(
        "git",
        ["remote", "get-url", "origin"],
        this.clonePath,
      )
      if (originRes.code !== 0) {
        throw new Error(
          `git remote get-url origin failed (${originRes.code}): ${originRes.stderr.trim()}`,
        )
      }
      const current = originRes.stdout.trim()
      if (current !== this.originUrl) {
        throw new Error(
          `Workspace: clone at ${this.clonePath} has wrong origin (${current}, expected ${this.originUrl})`,
        )
      }
    }

    // After step 1, state should be `clean → cloned`. If we're rehydrating
    // from a later state (e.g. `idle` post-restart) we step back to `clean`
    // first via the persistence layer; here we just attempt the transition.
    this.driveStateForward("cloned")

    // Step 2: fetch + reset to origin/<defaultBranch>. This wipes any
    // half-applied shim from a prior crash so we always start from a clean
    // base before re-applying.
    const fetchRes = await this.runner(
      "git",
      ["fetch", "origin", this.defaultBranch],
      this.clonePath,
    )
    if (fetchRes.code !== 0) {
      throw new Error(`git fetch failed (${fetchRes.code}): ${fetchRes.stderr.trim()}`)
    }
    const checkoutRes = await this.runner(
      "git",
      ["checkout", this.defaultBranch],
      this.clonePath,
    )
    if (checkoutRes.code !== 0) {
      // Branch may not exist locally yet — create from origin/<branch>.
      const trackRes = await this.runner(
        "git",
        ["checkout", "-B", this.defaultBranch, `origin/${this.defaultBranch}`],
        this.clonePath,
      )
      if (trackRes.code !== 0) {
        throw new Error(
          `git checkout ${this.defaultBranch} failed (${trackRes.code}): ${trackRes.stderr.trim()}`,
        )
      }
    }
    const resetRes = await this.runner(
      "git",
      ["reset", "--hard", `origin/${this.defaultBranch}`],
      this.clonePath,
    )
    if (resetRes.code !== 0) {
      throw new Error(`git reset --hard failed (${resetRes.code}): ${resetRes.stderr.trim()}`)
    }
    const cleanRes = await this.runner(
      "git",
      ["clean", "-fd"],
      this.clonePath,
    )
    if (cleanRes.code !== 0) {
      throw new Error(`git clean -fd failed (${cleanRes.code}): ${cleanRes.stderr.trim()}`)
    }

    // Step 3: apply preview-shim. applyShim() does its own git add + commit.
    const shimResult = await applyShim(this.clonePath, this.shim)
    if (!shimResult.ok || !shimResult.commitSha) {
      throw new Error(`applyShim failed: ${shimResult.error ?? "unknown"}`)
    }
    this.shimCommitSha = shimResult.commitSha
    this.driveStateForward("shim_applied")

    // Step 4: npm install if node_modules missing.
    if (!this.skipInstall) {
      const nm = join(this.clonePath, "node_modules")
      if (!existsSync(nm)) {
        const installRes = await this.runner("npm", ["install"], this.clonePath)
        if (installRes.code !== 0) {
          throw new Error(
            `npm install failed (${installRes.code}): ${installRes.stderr.slice(-400).trim()}`,
          )
        }
      }
    }

    this.driveStateForward("idle")
    this.lastSyncAt = this.now().getTime()
    return this.info()
  }

  /**
   * Re-fetch origin + reset + re-apply shim. Called by the orchestrator
   * before each `generating` transition if `now - lastSync > 1h`.
   */
  async sync(): Promise<void> {
    if (this.now().getTime() - this.lastSyncAt < SYNC_STALENESS_MS) return
    if (!this.shim) {
      throw new Error(`Workspace.sync: no shim registered for ${this.repoSlug}`)
    }

    // We don't drive the state machine through cloned → shim_applied → idle
    // here — sync() is invoked WHILE the sandbox is in `idle`. Mutating state
    // would tangle with concurrent run tracking; we just refresh the working
    // tree underneath.
    const fetchRes = await this.runner(
      "git",
      ["fetch", "origin", this.defaultBranch],
      this.clonePath,
    )
    if (fetchRes.code !== 0) {
      throw new Error(`sync: git fetch failed: ${fetchRes.stderr.trim()}`)
    }
    const resetRes = await this.runner(
      "git",
      ["reset", "--hard", `origin/${this.defaultBranch}`],
      this.clonePath,
    )
    if (resetRes.code !== 0) {
      throw new Error(`sync: git reset failed: ${resetRes.stderr.trim()}`)
    }
    const cleanRes = await this.runner("git", ["clean", "-fd"], this.clonePath)
    if (cleanRes.code !== 0) {
      throw new Error(`sync: git clean failed: ${cleanRes.stderr.trim()}`)
    }
    const shimResult = await applyShim(this.clonePath, this.shim)
    if (!shimResult.ok || !shimResult.commitSha) {
      throw new Error(`sync: applyShim failed: ${shimResult.error ?? "unknown"}`)
    }
    this.shimCommitSha = shimResult.commitSha
    this.lastSyncAt = this.now().getTime()
  }

  /**
   * F1 — spawn `npm run dev -- -p <port>` against the clone and wait for the
   * port to be listening before resolving. On success transitions the
   * sandbox state idle → clone_running and stores a DevServerInfo snapshot
   * the resolver can read.
   *
   * Port shifting: when the requested port (manifest default or env override)
   * is busy, we probe upward up to DEV_SERVER_PORT_PROBE_LIMIT ports. The
   * snapshot records `portShifted: true` so the dashboard can explain to the
   * user why the iframe URL doesn't match the manifest.
   *
   * Crash handling: subscribes `child.on("exit")`. On unexpected exit (code
   * !== 0 AND signal !== "SIGTERM") clears the snapshot, transitions
   * clone_running → idle, and fires `onDevServerEvent({ kind: "crashed" })`.
   * The orchestrator translates that into a `sandbox:dev_server_crashed`
   * broadcast + auto-toast.
   *
   * Idempotent: calling twice while a dev server is already up is a no-op
   * and returns the existing snapshot.
   */
  async startDevServer(opts: { port?: number } = {}): Promise<DevServerInfo> {
    if (this.devServerSnapshot && this.devServerChild) {
      return this.devServer() as DevServerInfo
    }

    const requestedPort = opts.port ?? 0
    if (!Number.isFinite(requestedPort) || requestedPort <= 0) {
      throw new Error(
        `Workspace.startDevServer: explicit port required (got ${opts.port})`,
      )
    }
    const port = await findAvailablePort(requestedPort)
    const portShifted = port !== requestedPort

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PORT: String(port),
      BROWSER: "none",
      // Mitigates Next.js noisy console + watchdog; harmless when the script
      // ignores them.
      FORCE_COLOR: "0",
      // Baseline-preview flag. The preview-shim's axios interceptor only
      // returns mock fixtures (instead of hitting a real/absent API and 401-ing
      // every request) when this is "true". Without it, the auth-strip still
      // works (firebase/AuthContext stubs are unconditional) but data calls
      // fail — leaving the cloned backoffice rendering empty tables. Setting it
      // here means the booted clone shows populated mock data out of the box.
      NEXT_PUBLIC_DASH_BUILD_PREVIEW: "true",
    }
    const child = this.devServerSpawn({
      cwd: this.clonePath,
      port,
      env,
    })
    this.devServerChild = child
    this.devServerStderr = ""

    // Capture stderr tail for crash diagnostics. We keep only the last 8KB so
    // long-running noisy dev servers don't grow this unbounded.
    const stderrStream = (child as { stderr?: NodeJS.ReadableStream | null }).stderr
    if (stderrStream && typeof stderrStream.on === "function") {
      stderrStream.on("data", (d: Buffer | string) => {
        const chunk = typeof d === "string" ? d : d.toString("utf8")
        const combined = this.devServerStderr + chunk
        this.devServerStderr = combined.slice(-8 * 1024)
      })
    }

    // Wire crash handler BEFORE the readiness probe so a crash during
    // startup also flows through here (we just translate it into a
    // start-time error too).
    let earlyExit: { code: number | null; signal: NodeJS.Signals | null } | null = null
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      // Only act for the currently-tracked child; stale handlers from
      // restarted servers should no-op.
      if (this.devServerChild !== child) return
      const snapshot = this.devServerSnapshot
      const wasReady = snapshot?.ready ?? false
      this.devServerChild = null
      this.devServerSnapshot = null

      // SIGTERM / signal=null with code=0 → we asked it to stop. No crash.
      const cleanExit = (code === 0 || code === null) && signal !== "SIGKILL"
      if (cleanExit && signal !== null && signal !== "SIGTERM" && wasReady) {
        // Unusual but tolerable shutdown (e.g. SIGINT from a debugger). Stay
        // quiet — the user-initiated stop path explicitly sends SIGTERM.
      }

      if (!wasReady) {
        earlyExit = { code, signal }
        return
      }

      // Crash detected post-ready. Step back so the badge stops showing
      // "Clone live" and the resolver falls back to staging.
      if (this.state.current() === "clone_running") {
        this.state.transition("idle")
      }

      if (!cleanExit) {
        try {
          this.onDevServerEvent?.({
            kind: "crashed",
            repoSlug: this.repoSlug,
            port,
            stderr: this.devServerStderr,
            exit: { code, signal },
          })
        } catch {
          // Subscriber bugs must not corrupt workspace state.
        }
      }
    }
    child.on("exit", onExit)
    // Spawn-time errors (binary missing, permission denied, …) come through
    // here BEFORE exit fires. Treat them as start-time failures.
    child.on("error", (err) => {
      if (this.devServerChild !== child) return
      earlyExit = earlyExit ?? { code: 1, signal: null }
      this.devServerStderr =
        (this.devServerStderr + "\n" + (err.message ?? String(err))).slice(-8 * 1024)
    })

    try {
      await waitForPortListening(port, DEV_SERVER_READY_TIMEOUT_MS, () => earlyExit)
    } catch (err) {
      // Best-effort kill; ignore failure if the process is already dead.
      this.devServerChild = null
      this.devServerSnapshot = null
      try {
        if (!child.killed) child.kill("SIGTERM")
      } catch {
        /* swallow */
      }
      throw err
    }

    const snapshot: DevServerInfo = {
      pid: child.pid ?? null,
      port,
      startedAt: this.now().toISOString(),
      ready: true,
      portShifted,
      requestedPort,
    }
    this.devServerSnapshot = snapshot

    // Transition idle → clone_running. Defensive: if we're not in `idle` (e.g.
    // a test bumped us straight to clone_running) skip the transition rather
    // than erroring.
    if (this.state.current() === "idle") {
      const result = this.state.transition("clone_running")
      if (!result.ok) {
        // Roll back the snapshot if we couldn't tell the state machine — the
        // orchestrator depends on (state, snapshot) staying consistent.
        this.devServerSnapshot = null
        try {
          if (!child.killed) child.kill("SIGTERM")
        } catch {
          /* swallow */
        }
        this.devServerChild = null
        throw new Error(`startDevServer state transition failed: ${result.error}`)
      }
    }

    return this.devServer() as DevServerInfo
  }

  /**
   * F1 — graceful shutdown of the dev server. Idempotent: calling when no
   * dev server is running is a no-op. Always clears the snapshot + steps the
   * state machine back to idle before returning.
   *
   * We send SIGTERM and wait up to 5s for the child to exit before falling
   * back to SIGKILL. Most Next.js dev servers respond within ~1s.
   */
  async stopDevServer(): Promise<void> {
    const child = this.devServerChild
    if (!child) {
      this.devServerSnapshot = null
      // Step back to idle if we somehow drifted into clone_running without
      // a child handle (e.g. rehydrate from disk after a daemon crash).
      if (this.state.current() === "clone_running") {
        this.state.transition("idle")
      }
      return
    }

    // Detach event handlers so the crash path doesn't fire during a
    // deliberate stop. Re-clear after exit so a residual reference can't
    // pin the snapshot.
    this.devServerChild = null
    try {
      child.kill("SIGTERM")
    } catch {
      /* already dead */
    }
    const exited = await new Promise<boolean>((resolveOnce) => {
      let done = false
      const finish = (ok: boolean) => {
        if (done) return
        done = true
        resolveOnce(ok)
      }
      child.once("exit", () => finish(true))
      const t = setTimeout(() => {
        try {
          if (!child.killed) child.kill("SIGKILL")
        } catch {
          /* swallow */
        }
        finish(false)
      }, 5_000)
      if (typeof (t as { unref?: () => void }).unref === "function") {
        ;(t as { unref: () => void }).unref()
      }
    })
    void exited

    this.devServerSnapshot = null
    if (this.state.current() === "clone_running") {
      this.state.transition("idle")
    }
  }

  /**
   * Reset the working tree to origin/main and drop any unmerged branches.
   * Used by the stale sweeper (Agent D3) before deleting / re-shimming.
   *
   * F1 — stops the dev server FIRST so the sweep doesn't race against an
   * active port + leave a zombie child.
   */
  async tearDown(): Promise<void> {
    // Stop dev server before mutating the tree underneath it.
    await this.stopDevServer().catch(() => {
      /* swallow — sweep should not be blocked by a stuck child */
    })
    const co = await this.runner(
      "git",
      ["checkout", this.defaultBranch],
      this.clonePath,
    )
    if (co.code !== 0) {
      // If main doesn't exist anymore, force-create from origin/main.
      const forceCo = await this.runner(
        "git",
        ["checkout", "-B", this.defaultBranch, `origin/${this.defaultBranch}`],
        this.clonePath,
      )
      if (forceCo.code !== 0) {
        throw new Error(
          `tearDown: git checkout ${this.defaultBranch} failed: ${forceCo.stderr.trim()}`,
        )
      }
    }
    const resetRes = await this.runner(
      "git",
      ["reset", "--hard", `origin/${this.defaultBranch}`],
      this.clonePath,
    )
    if (resetRes.code !== 0) {
      throw new Error(`tearDown: git reset failed: ${resetRes.stderr.trim()}`)
    }
    const cleanRes = await this.runner("git", ["clean", "-fd"], this.clonePath)
    if (cleanRes.code !== 0) {
      throw new Error(`tearDown: git clean failed: ${cleanRes.stderr.trim()}`)
    }
    // Drop dash-build/* branches; merge logic for those lives in D2.
    const branchList = await this.runner(
      "git",
      ["for-each-ref", "--format=%(refname:short)", "refs/heads/dash-build/"],
      this.clonePath,
    )
    if (branchList.code === 0 && branchList.stdout.trim()) {
      const branches = branchList.stdout
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      for (const b of branches) {
        // -D is unconditional. Acceptable for the sweep path because branches
        // that need preserving are still pinned by the run-record (Store).
        await this.runner("git", ["branch", "-D", b], this.clonePath)
      }
    }
  }

  /**
   * Test-only: synchronously force the workspace into a given state. Real
   * code should always go through transition()/bootstrap().
   */
  _forceState(state: SandboxState): void {
    this.state.rehydrate(state, this.state.history())
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private driveStateForward(to: SandboxState): void {
    const current = this.state.current()
    if (current === to) return
    const result = this.state.transition(to)
    if (!result.ok) {
      // Rehydrating from a non-clean state means bootstrap() retries from
      // wherever we are. Allow the orchestrator to skip ahead by force-setting
      // when the persisted state is already past the requested step.
      const order: SandboxState[] = [
        "clean",
        "cloned",
        "shim_applied",
        "idle",
        "generating",
        "preview_ready",
        "publishing",
        "sweep",
        "stale",
      ]
      const currentIdx = order.indexOf(current)
      const toIdx = order.indexOf(to)
      if (currentIdx > toIdx) {
        // We're already further along; nothing to do.
        return
      }
      throw new Error(`Workspace state transition failed: ${result.error}`)
    }
  }

  private async hasGitDir(): Promise<boolean> {
    try {
      const s = await stat(join(this.clonePath, ".git"))
      return s.isDirectory() || s.isFile() // .git can be a file (worktree)
    } catch {
      return false
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Default subprocess runner (real git / npm)
// ──────────────────────────────────────────────────────────────────────────

const defaultRunner: SubprocessRunner = (bin, args, cwd) =>
  new Promise<SubprocessResult>((resolveProc) => {
    const child = spawn(bin, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8")
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8")
    })
    child.on("error", (err) => {
      resolveProc({ stdout, stderr: stderr + String(err), code: 1 })
    })
    child.on("close", (code) => {
      resolveProc({ stdout, stderr, code: code ?? 1 })
    })
  })

// ──────────────────────────────────────────────────────────────────────────
// F1 — dev-server defaults + helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Default dev-server spawn: `npm run dev -- -p <port>` in the clone dir. We
 * keep stdio piped so the workspace can capture stderr for crash diagnostics
 * (raw npm output is the only signal of a Next.js boot failure). `detached`
 * is FALSE so a daemon SIGTERM cleanly takes the child with it.
 */
const defaultDevServerSpawn: DevServerSpawn = ({ cwd, port, env }) =>
  spawn("npm", ["run", "dev", "--", "-p", String(port)], {
    cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  })

/**
 * F1 — locate the first free TCP port ≥ requested. Uses node:net to bind a
 * throwaway listener; releases it before returning. Returns the requested
 * port unchanged when it's free.
 *
 * Bounded by DEV_SERVER_PORT_PROBE_LIMIT so we don't scan the entire
 * ephemeral range when something pathological is happening (e.g. user has
 * 200 background dev servers somehow).
 */
async function findAvailablePort(requested: number): Promise<number> {
  for (let offset = 0; offset < DEV_SERVER_PORT_PROBE_LIMIT; offset++) {
    const candidate = requested + offset
    if (await isPortFree(candidate)) return candidate
  }
  throw new Error(
    `startDevServer: no free port in [${requested}, ${requested + DEV_SERVER_PORT_PROBE_LIMIT - 1}]`,
  )
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolveCheck) => {
    const server = createServer()
    server.unref()
    server.once("error", () => resolveCheck(false))
    server.once("listening", () => {
      server.close(() => resolveCheck(true))
    })
    try {
      server.listen(port, "127.0.0.1")
    } catch {
      resolveCheck(false)
    }
  })
}

/**
 * F1 — poll until 127.0.0.1:<port> accepts a TCP connection. Resolves as
 * soon as the dev server binds; rejects after `deadlineMs` OR earlier if
 * the dev server child exited before binding.
 *
 * `earlyExit` is a getter so we can react to a crash that happens DURING
 * the wait without polluting this function with subscription wiring.
 */
async function waitForPortListening(
  port: number,
  deadlineMs: number,
  earlyExit: () => { code: number | null; signal: NodeJS.Signals | null } | null,
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < deadlineMs) {
    const exitInfo = earlyExit()
    if (exitInfo) {
      throw new Error(
        `dev server exited before bind (code=${exitInfo.code ?? "null"}, signal=${exitInfo.signal ?? "null"})`,
      )
    }
    if (await canConnect(port)) return
    await sleep(500)
  }
  // Last-chance HTTP probe — TCP could be listening but the Next.js handshake
  // takes the extra millis. Falling back to HTTP avoids a flake when the port
  // grabs at exactly the deadline boundary.
  if (await canHttpReach(port)) return
  throw new Error(`dev server did not listen on :${port} within ${deadlineMs}ms`)
}

function canConnect(port: number): Promise<boolean> {
  return new Promise((resolveProbe) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method: "HEAD",
        path: "/",
        timeout: 500,
      },
      (res) => {
        res.resume()
        // Any response — even 404/500 — means a server is listening.
        resolveProbe(true)
      },
    )
    req.on("error", () => resolveProbe(false))
    req.on("timeout", () => {
      req.destroy()
      resolveProbe(false)
    })
    req.end()
  })
}

function canHttpReach(port: number): Promise<boolean> {
  return new Promise((resolveProbe) => {
    const req = http.get(
      { host: "127.0.0.1", port, path: "/", timeout: 1_000 },
      (res) => {
        res.resume()
        resolveProbe(true)
      },
    )
    req.on("error", () => resolveProbe(false))
    req.on("timeout", () => {
      req.destroy()
      resolveProbe(false)
    })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}
