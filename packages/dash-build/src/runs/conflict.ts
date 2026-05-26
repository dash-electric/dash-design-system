/**
 * ConflictResolver — auto-rebase + auto-resolve trivial conflicts + escalate
 * (Phase D3).
 *
 * Flow:
 *   1. `checkBranchFresh` — fetch + count ahead/behind vs base. UI uses this
 *      to surface "branch is N commits behind main" before publish.
 *   2. `autoRebase` — try `git rebase <base>`. On conflict, inspect files:
 *      - lockfiles (pnpm-lock, package-lock, yarn.lock) → `git checkout --theirs`
 *      - generated-only files (.dist, .next/cache) → same
 *      - whitespace-only diffs → `git rebase --skip` for that commit
 *      Then re-attempt rebase. Anything left = real conflict, abort + report.
 *   3. `escalateToUser` — STUB for the interactive prompt slice. Emits an
 *      event payload that the dashboard will eventually mount as a modal;
 *      for now it just throws `ConflictNeedsResolution`.
 *
 * Depends on D2's GitOps wrapper (~/runs/git-ops.ts) — type-imported to keep
 * D3 independent. If the runtime GitOps API drifts the type compile will
 * surface it before we ship.
 */

import { GitOps } from "./git-ops.js"

export type ConflictResolution = "regenerate" | "manual"

export interface BranchFreshness {
  /** True when branch is behind base by 1+ commits. */
  stale: boolean
  /** Commits on base that branch lacks. */
  behind: number
  /** Commits on branch that base lacks. */
  ahead: number
}

export interface AutoRebaseResult {
  ok: boolean
  /** Files with unresolved conflicts (when ok=false). */
  conflictFiles?: string[]
  /** True when at least one auto-resolution was applied (lockfile / whitespace). */
  hadAutoResolve?: boolean
}

export interface EscalateResult {
  resolution: ConflictResolution
}

/**
 * Thrown by `escalateToUser` until the interactive resolution flow is wired.
 * Callers can catch and surface a UI prompt themselves.
 */
export class ConflictNeedsResolution extends Error {
  readonly runId: string
  readonly conflictFiles: string[]
  constructor(runId: string, conflictFiles: string[]) {
    super(
      `Conflict needs user resolution for run ${runId}: ${conflictFiles.join(", ") || "(no files reported)"}`,
    )
    this.name = "ConflictNeedsResolution"
    this.runId = runId
    this.conflictFiles = conflictFiles
  }
}

export interface ConflictEvent {
  type: "conflict:needs_resolution"
  runId: string
  conflictFiles: string[]
  at: string
}

export type ConflictBroadcaster = (event: ConflictEvent) => void

export interface ConflictResolverOptions {
  /** Inject a broadcaster (e.g. WS broadcaster) so the UI can react. */
  broadcaster?: ConflictBroadcaster
}

// Auto-resolve heuristics — kept narrow on purpose. Anything not in this list
// requires a human eye.
const LOCKFILE_BASENAMES = new Set([
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "npm-shrinkwrap.json",
])

const GENERATED_PATH_RE = /(^|\/)(dist|build|\.next|coverage|\.cache)\//

export class ConflictResolver {
  private readonly git: GitOps
  private readonly broadcaster?: ConflictBroadcaster

  constructor(gitOps: GitOps, opts: ConflictResolverOptions = {}) {
    this.git = gitOps
    this.broadcaster = opts.broadcaster
  }

  /**
   * Compare `branchName` to `baseRemote`. Fetches first so the answer is fresh.
   * Note: branch must exist locally; we use `rev-list --left-right --count`.
   */
  async checkBranchFresh(
    branchName: string,
    baseRemote: string = "origin/main",
  ): Promise<BranchFreshness> {
    await this.git.fetch("origin")
    const { stdout } = await this.git.run([
      "rev-list",
      "--left-right",
      "--count",
      `${baseRemote}...${branchName}`,
    ])
    // Output: "<behind>\t<ahead>"
    const [behindStr = "0", aheadStr = "0"] = stdout.trim().split(/\s+/)
    const behind = Number(behindStr) || 0
    const ahead = Number(aheadStr) || 0
    return { stale: behind > 0, behind, ahead }
  }

  /**
   * Attempt to rebase `branchName` onto `base`. Always checks out `branchName`
   * first. Auto-resolves lockfile + whitespace conflicts before declaring
   * defeat. On any unrecoverable conflict, runs `rebase --abort` so the
   * working tree is left clean for the caller.
   */
  async autoRebase(
    branchName: string,
    base: string = "origin/main",
  ): Promise<AutoRebaseResult> {
    await this.git.fetch("origin")
    // Best-effort branch checkout; if branch isn't local fall back to current
    // (caller is expected to have it checked out).
    try {
      await this.git.checkout(branchName)
    } catch {
      // ignore — assume already on this branch
    }

    let hadAutoResolve = false

    const attempt = async (): Promise<{ done: boolean; conflicts: string[] }> => {
      const result = await this.git.run(["rebase", base])
      if (result.code === 0) return { done: true, conflicts: [] }
      // Detect conflicts via status.
      const conflicts = await this.unmergedFiles()
      return { done: false, conflicts }
    }

    let res = await attempt()
    if (res.done) return { ok: true, hadAutoResolve }

    // Try auto-resolution loop. Max 5 iterations to bound runtime.
    for (let i = 0; i < 5 && !res.done; i++) {
      const remaining = await this.applyAutoResolutions(res.conflicts)
      if (remaining.length === res.conflicts.length) {
        // Nothing resolved — give up.
        break
      }
      hadAutoResolve = true
      // Stage + continue.
      const cont = await this.git.run(["rebase", "--continue"])
      if (cont.code === 0) {
        return { ok: true, hadAutoResolve }
      }
      // Likely another commit in the rebase chain has its own conflicts.
      const conflicts = await this.unmergedFiles()
      if (conflicts.length === 0) {
        // No conflicts but continue failed — abort to be safe.
        await this.git.run(["rebase", "--abort"])
        return {
          ok: false,
          conflictFiles: [],
          hadAutoResolve,
        }
      }
      res = { done: false, conflicts }
    }

    if (!res.done) {
      await this.git.run(["rebase", "--abort"])
      return {
        ok: false,
        conflictFiles: res.conflicts,
        hadAutoResolve,
      }
    }
    return { ok: true, hadAutoResolve }
  }

  /**
   * Stub interactive escalation. Broadcasts the conflict so the UI can render
   * a resolution prompt, then throws. The full poll-state interactive flow
   * lands in a follow-up slice.
   */
  async escalateToUser(
    runId: string,
    conflictFiles: string[],
  ): Promise<EscalateResult> {
    const event: ConflictEvent = {
      type: "conflict:needs_resolution",
      runId,
      conflictFiles,
      at: new Date().toISOString(),
    }
    if (this.broadcaster) {
      try {
        this.broadcaster(event)
      } catch {
        // Broadcaster failures shouldn't mask the conflict.
      }
    }
    throw new ConflictNeedsResolution(runId, conflictFiles)
  }

  // ── Internals ──────────────────────────────────────────────────────────

  /**
   * Return the list of unmerged file paths via `git diff --name-only
   * --diff-filter=U`. Empty when the tree has no conflicts.
   */
  private async unmergedFiles(): Promise<string[]> {
    const { stdout } = await this.git.run([
      "diff",
      "--name-only",
      "--diff-filter=U",
    ])
    return stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  }

  /**
   * For each conflict file, apply an auto-resolution if we can:
   *   - lockfile basename → `git checkout --theirs <file>` (prefer incoming base)
   *   - generated path (dist/, build/, .next/) → same
   *   - whitespace-only diff → `git checkout --theirs <file>`
   *
   * Returns the still-unresolved files.
   */
  private async applyAutoResolutions(files: string[]): Promise<string[]> {
    const stillBad: string[] = []
    for (const file of files) {
      if (await this.isTrivialConflict(file)) {
        await this.git.run(["checkout", "--theirs", "--", file])
        await this.git.run(["add", "--", file])
      } else {
        stillBad.push(file)
      }
    }
    return stillBad
  }

  private async isTrivialConflict(file: string): Promise<boolean> {
    const basename = file.split("/").pop() ?? file
    if (LOCKFILE_BASENAMES.has(basename)) return true
    if (GENERATED_PATH_RE.test(file)) return true
    if (await this.isWhitespaceOnly(file)) return true
    return false
  }

  /**
   * Detect whitespace-only diff between the conflict sides by inspecting
   * `git diff --ignore-all-space` against HEAD. A clean diff = whitespace
   * is the only difference.
   */
  private async isWhitespaceOnly(file: string): Promise<boolean> {
    const result = await this.git.run([
      "diff",
      "--ignore-all-space",
      "--ignore-blank-lines",
      "--",
      file,
    ])
    if (result.code !== 0) return false
    // Empty diff after ignoring whitespace = trivial.
    return result.stdout.trim().length === 0
  }
}
