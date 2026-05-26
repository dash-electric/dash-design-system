/**
 * BranchManager — per-run branch lifecycle (Phase D2).
 *
 * Owns the short-lived `dash-build/<userId>-<runId>` branch in a sandbox
 * clone. Each run:
 *
 *   1. startRun()              → fetch + checkout new branch from origin/main +
 *                                 cherry-pick preview-shim → state generating
 *   2. writeGeneratedFiles()   → write parsed files + commit (the ONLY commit
 *                                 that will land trunk after extraction)
 *   3. extractGeneratedOnly()  → rev-list base..branch ^shim, then format-patch
 *                                 so Publisher can apply on a clean main branch
 *   4. rollback()              → checkout main + delete branch (failure path)
 *
 * Workspace is a thin interface defined here — D1's Workspace class
 * (sandbox clone manager) satisfies it via structural typing. Until D1
 * lands, tests can pass a hand-rolled Workspace pointing at a throwaway
 * clone.
 */

import { writeFile, mkdir, rm } from "node:fs/promises"
import { dirname, join, resolve, sep } from "node:path"
import type { ParsedFile } from "../skills/types.js"
import { GitOps, GitOpsError } from "./git-ops.js"
import { SandboxStateMachine } from "./sandbox-state.js"

/**
 * Minimal Workspace contract — what BranchManager actually needs.
 *
 * D1 owns the real `Workspace` class (clone setup + preview-shim apply).
 * This narrow interface lets D2 ship without blocking on D1 and survives
 * structural typing once D1 lands. D1's Workspace satisfies it via `info()`
 * — we read `shimCommitSha` through that method so we don't depend on a
 * private field.
 */
export interface Workspace {
  /** Absolute path to the sandbox clone (e.g. ~/Work/dash-build-clones/dash-backoffice). */
  readonly clonePath: string
  /** Slug used in branch names / state keys (e.g. "dash-backoffice"). */
  readonly repoSlug: string
  /** State machine for this clone. */
  readonly state: SandboxStateMachine
  /** Remote name (default "origin"). */
  readonly remote?: string
  /** Trunk branch on the remote (default "main"). */
  readonly trunkBranch?: string
  /**
   * Read-only snapshot — must expose the current `shimCommitSha` so the
   * publisher knows which commit to exclude from the PR.
   */
  info(): { shimCommitSha: string | null }
}

export interface StartRunResult {
  branchName: string
  baseCommit: string
}

export interface ExtractGeneratedOnlyResult {
  generatedShas: string[]
  patchPaths: string[]
  /** Directory containing the .patch files (caller cleans up when done). */
  patchDir: string
}

export interface BranchManagerOptions {
  workspace: Workspace
  gitOps: GitOps
  /** Override for tests; defaults to writing under <clone>/.dash-build/patches/. */
  patchRootResolver?: (runId: string) => string
}

function branchNameFor(repoSlug: string, userId: string, runId: string): string {
  // Branch path must be filesystem-safe — sanitize aggressively.
  const safe = (s: string) => s.replace(/[^A-Za-z0-9._-]/g, "-")
  return `dash-build/${safe(userId)}-${safe(runId)}`
}

function extractionBranchFor(runId: string): string {
  return `dash-build-extract/${runId.replace(/[^A-Za-z0-9._-]/g, "-")}`
}

function safeWritePath(repoRoot: string, filePath: string): string | null {
  if (filePath.includes("\0")) return null
  const joined = resolve(repoRoot, filePath)
  const baseResolved = resolve(repoRoot)
  if (joined !== baseResolved && !joined.startsWith(baseResolved + sep)) {
    return null
  }
  return joined
}

export class BranchManager {
  private readonly workspace: Workspace
  private readonly gitOps: GitOps
  private readonly patchRootResolver: (runId: string) => string
  private readonly trunk: string
  private readonly remote: string

  constructor(opts: BranchManagerOptions) {
    this.workspace = opts.workspace
    this.gitOps = opts.gitOps
    this.trunk = opts.workspace.trunkBranch ?? "main"
    this.remote = opts.workspace.remote ?? "origin"
    this.patchRootResolver =
      opts.patchRootResolver ??
      ((runId) => join(opts.workspace.clonePath, ".dash-build", "patches", runId))
  }

  /**
   * Begin a run:
   *   1. fetch latest origin/<trunk>
   *   2. checkout dash-build/<userId>-<runId> from origin/<trunk>
   *   3. cherry-pick the preview-shim commit so the workspace renders the iframe
   *   4. transition state idle → generating
   *
   * The preview-shim is intentionally NOT on trunk and will be excluded from
   * the eventual PR (see extractGeneratedOnly).
   */
  async startRun(runId: string, userId: string = "local"): Promise<StartRunResult> {
    const branchName = branchNameFor(this.workspace.repoSlug, userId, runId)

    await this.gitOps.fetch(this.remote)

    // Checkout from the remote tip so we never inherit stray local commits
    // (e.g. a previous run's shim still sitting on main).
    await this.gitOps.checkout(branchName, {
      create: true,
      from: `${this.remote}/${this.trunk}`,
    })

    // Cherry-pick the shim. If the shim is missing we let the error bubble —
    // the caller can decide to re-shim and retry.
    const shimSha = this.workspace.info().shimCommitSha
    if (!shimSha) {
      throw new Error(
        `BranchManager.startRun: workspace has no shim commit applied — bootstrap the workspace first`,
      )
    }
    const pick = await this.gitOps.cherryPick(shimSha)
    if (!pick.ok) {
      // Roll back partial state so the clone stays usable.
      await this.gitOps.checkout(this.trunk).catch(() => undefined)
      await this.gitOps
        .deleteBranch(branchName, { force: true })
        .catch(() => undefined)
      throw new GitOpsError({
        message: `failed to cherry-pick shim ${shimSha}: ${pick.error ?? "unknown error"}`,
        kind: pick.conflict ? "conflict" : "unknown",
        code: 1,
        stderr: pick.error ?? "",
        args: ["cherry-pick", shimSha],
      })
    }

    const baseCommit = (await this.gitOps.run(["rev-parse", "HEAD"])).stdout.trim()

    // Stamp the run id onto the next transition event so subscribers
    // (Store/Broadcaster wired via Workspace.onStateChange) can correlate.
    this.workspace.state.setRunIdForNextTransition(runId)
    const transition = this.workspace.state.transition("generating")
    if (!transition.ok) {
      // Don't unwind git — the operator may want to recover from a stuck
      // state machine without losing the freshly-applied shim. Just surface.
      throw new Error(
        `BranchManager.startRun: state transition rejected — ${transition.error}`,
      )
    }

    return { branchName, baseCommit }
  }

  /**
   * Write all generated files to the clone, then `git add -A` + commit. The
   * resulting commit is the ONLY commit that will be cherry-picked back onto
   * trunk by the Publisher.
   */
  async writeGeneratedFiles(
    branchName: string,
    files: ParsedFile[],
    opts: { commitMessage?: string } = {},
  ): Promise<string> {
    // Defensive: ensure we're on the run branch before writing.
    const current = await this.gitOps.currentBranch()
    if (current !== branchName) {
      await this.gitOps.checkout(branchName)
    }

    let written = 0
    for (const file of files) {
      const dest = safeWritePath(this.workspace.clonePath, file.path)
      if (!dest) continue
      await mkdir(dirname(dest), { recursive: true })
      await writeFile(dest, file.content, "utf8")
      written += 1
    }

    if (written === 0) {
      throw new Error(
        `BranchManager.writeGeneratedFiles: refused to commit — no writable files (received ${files.length})`,
      )
    }

    const message =
      opts.commitMessage ?? `feat: dash-build run ${runIdFromBranch(branchName)}`
    return this.gitOps.commit(message, { addAll: true })
  }

  /**
   * Roll back the run branch — used when generation fails or the user
   * discards the preview. Returns the workspace to the trunk so subsequent
   * runs start clean.
   *
   * State transitions back to `idle` via `generating → idle` (allowed by
   * SandboxStateMachine).
   */
  async rollback(branchName: string): Promise<void> {
    // best-effort checkout of trunk + delete; we don't want a failure here
    // to mask the original generation error.
    await this.gitOps.checkout(this.trunk).catch(() => undefined)
    await this.gitOps
      .deleteBranch(branchName, { force: true })
      .catch(() => undefined)

    // Stamp the runId recovered from the branch name so subscribers can
    // correlate the rollback event. Best-effort — if extraction fails the
    // event simply carries null and the badge still updates correctly.
    this.workspace.state.setRunIdForNextTransition(runIdFromBranch(branchName))
    // SandboxStateMachine.transition() returns ok:false instead of throwing,
    // so we silently ignore unsupported transitions (e.g. already at idle).
    this.workspace.state.transition("idle")
  }

  /**
   * Extract the generated-only commits from the run branch (excluding the
   * preview-shim) and emit them as patch files. The patches are what the
   * Publisher applies to a clean extraction branch built from origin/main,
   * guaranteeing the shim never lands trunk.
   */
  async extractGeneratedOnly(
    branchName: string,
    shimCommitSha: string,
    runId?: string,
  ): Promise<ExtractGeneratedOnlyResult> {
    const id = runId ?? runIdFromBranch(branchName)
    const base = `${this.remote}/${this.trunk}`

    const generatedShas = await this.gitOps.revListExclude(base, branchName, [
      shimCommitSha,
    ])
    if (generatedShas.length === 0) {
      throw new Error(
        `BranchManager.extractGeneratedOnly: no generated commits on ${branchName} after excluding shim ${shimCommitSha}`,
      )
    }

    const patchDir = this.patchRootResolver(id)
    await mkdir(patchDir, { recursive: true })
    const patchPaths = await this.gitOps.formatPatch(generatedShas, patchDir)

    return { generatedShas, patchPaths, patchDir }
  }

  /**
   * Clean up patch artefacts for a run. Safe to call multiple times.
   */
  async cleanupPatches(runId: string): Promise<void> {
    const patchDir = this.patchRootResolver(runId)
    await rm(patchDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

function runIdFromBranch(branchName: string): string {
  // dash-build/<userId>-<runId> → recover runId by trimming the prefix +
  // first segment. Best-effort — used for cosmetic commit messages.
  const tail = branchName.startsWith("dash-build/")
    ? branchName.slice("dash-build/".length)
    : branchName
  const dash = tail.indexOf("-")
  return dash >= 0 ? tail.slice(dash + 1) : tail
}

export { branchNameFor, extractionBranchFor }
