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
import { spawn } from "node:child_process"
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
   * Reset the working tree to origin/main and drop any unmerged branches.
   * Used by the stale sweeper (Agent D3) before deleting / re-shimming.
   */
  async tearDown(): Promise<void> {
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
