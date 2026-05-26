/**
 * Publisher — publish a run's generated commit(s) to GitHub (Phase D2).
 *
 * The 9-step flow keeps the preview-shim isolated from the user-visible PR:
 *
 *   1. Resolve the run branch from BranchManager (must exist locally).
 *   2. Extract generated-only commits via revListExclude(shim).
 *   3. Create CLEAN extraction branch from origin/<trunk> in the sandbox clone.
 *   4. Cherry-pick generated SHAs onto extraction branch (shim NEVER picked).
 *   5. Force-push extraction branch to origin as the final dash-build/<...>
 *      branch — this is what the PR head points at.
 *   6. Open the PR via the existing GitHubAppClient (reuses commitFiles? no —
 *      we already have commits, so we call createPullRequest directly, which
 *      submitChanges does not expose. We use the App client to fetch an
 *      Octokit instance and call pulls.create.)
 *   7. Transition state preview_ready → publishing → sweep.
 *   8. Cleanup local extraction branch + patch artefacts.
 *   9. Return { branchName, prUrl, prNumber } so the orchestrator can update
 *      the prompt record.
 *
 * On error before push (1-4) we transition back to preview_ready and leave
 * the run branch intact so the user can retry. After push we leave state at
 * `publishing` so the caller decides whether to retry or sweep manually.
 */

import { splitFullName } from "../integrations/github/client.js"
import type { GitHubAppClient } from "../integrations/github/client.js"
import { createPullRequest } from "../integrations/github/repo-ops.js"
import { BranchManager, extractionBranchFor } from "./branch-manager.js"
import type { Workspace } from "./branch-manager.js"
import { GitOps, GitOpsError } from "./git-ops.js"

export interface PublishOptions {
  /** runId — used to derive branch names + patch dirs. */
  runId: string
  /** Same userId used at startRun() so the branch resolves correctly. */
  userId?: string
  /** GitHub repo full name (owner/repo). */
  fullName: string
  /** PR title. */
  prTitle: string
  /** PR body markdown. */
  prBody: string
  /** Optional draft PR (default false). */
  draft?: boolean
  /** Override the trunk branch (default = workspace.trunkBranch or "main"). */
  baseBranch?: string
}

export interface PublishResult {
  branchName: string
  prUrl: string
  prNumber: number
  commitShas: string[]
}

export interface PublisherDeps {
  workspace: Workspace
  branchManager: BranchManager
  gitOps: GitOps
  githubClient: GitHubAppClient
}

function branchNameFor(repoSlug: string, userId: string, runId: string): string {
  const safe = (s: string) => s.replace(/[^A-Za-z0-9._-]/g, "-")
  // Keep aligned with BranchManager.startRun()'s naming. Duplicated by design
  // — pulling the helper across two modules without circular import.
  void repoSlug
  return `dash-build/${safe(userId)}-${safe(runId)}`
}

export class Publisher {
  private readonly workspace: Workspace
  private readonly branchManager: BranchManager
  private readonly gitOps: GitOps
  private readonly githubClient: GitHubAppClient
  private readonly trunk: string
  private readonly remote: string

  constructor(deps: PublisherDeps) {
    this.workspace = deps.workspace
    this.branchManager = deps.branchManager
    this.gitOps = deps.gitOps
    this.githubClient = deps.githubClient
    this.trunk = deps.workspace.trunkBranch ?? "main"
    this.remote = deps.workspace.remote ?? "origin"
  }

  async publish(opts: PublishOptions): Promise<PublishResult> {
    const userId = opts.userId ?? "local"
    const runBranchName = branchNameFor(this.workspace.repoSlug, userId, opts.runId)
    const extractionBranch = extractionBranchFor(opts.runId)
    const baseBranch = opts.baseBranch ?? this.trunk

    // Step 1-2: extract generated commits, excluding the shim.
    const shimSha = this.workspace.info().shimCommitSha
    if (!shimSha) {
      throw new Error(
        `Publisher.publish: workspace has no shim commit applied — cannot extract generated-only commits`,
      )
    }
    const extracted = await this.branchManager.extractGeneratedOnly(
      runBranchName,
      shimSha,
      opts.runId,
    )

    // Transition preview_ready → publishing as soon as we begin remote work.
    const t1 = this.workspace.state.transition("publishing")
    if (!t1.ok) {
      // Tolerate when already in publishing (e.g. retry) — only throw on
      // truly unexpected source state.
      if (this.workspace.state.current() !== "publishing") {
        throw new Error(
          `Publisher.publish: state machine refused publishing transition — ${t1.error}`,
        )
      }
    }

    // Step 3: clean extraction branch from origin/<trunk>.
    try {
      await this.gitOps.fetch(this.remote)
      await this.gitOps.checkout(extractionBranch, {
        create: true,
        from: `${this.remote}/${this.trunk}`,
      })
    } catch (err) {
      await this.rollbackBeforePush(extractionBranch)
      throw err
    }

    // Step 4: cherry-pick each generated commit onto the clean branch.
    const cherryPicked: string[] = []
    try {
      for (const sha of extracted.generatedShas) {
        const result = await this.gitOps.cherryPick(sha)
        if (!result.ok) {
          throw new GitOpsError({
            message: `cherry-pick of generated commit ${sha} failed: ${result.error ?? "unknown error"}`,
            kind: result.conflict ? "conflict" : "unknown",
            code: 1,
            stderr: result.error ?? "",
            args: ["cherry-pick", sha],
          })
        }
        cherryPicked.push(sha)
      }
    } catch (err) {
      await this.rollbackBeforePush(extractionBranch)
      throw err
    }

    // Step 5: push to origin AS the final run-branch name. We use a refspec
    // so the local "extraction" branch lands as the canonical
    // dash-build/<...> ref on the remote, no matter what the local name was.
    // Force is OK because we own this branch namespace and may be republishing.
    try {
      await this.gitOps.push(runBranchName, {
        refspec: `${extractionBranch}:refs/heads/${runBranchName}`,
        force: true,
      })
    } catch (err) {
      await this.rollbackBeforePush(extractionBranch)
      throw err
    }

    // Step 6: open the PR via the existing App client. We call pulls.create
    // directly because submitChanges() would re-create the branch + a commit
    // — we already pushed real commits.
    const [owner, repo] = splitFullName(opts.fullName)
    const octokit = await this.githubClient.getOctokitForRepo(opts.fullName)
    let prResult: { prNumber: number; prUrl: string }
    try {
      prResult = await createPullRequest({
        octokit,
        owner,
        repo,
        base: baseBranch,
        head: runBranchName,
        title: opts.prTitle,
        body: opts.prBody,
        draft: opts.draft ?? false,
      })
    } catch (err) {
      // Push already happened — we deliberately don't auto-delete the remote
      // branch on PR failure so the user can retry creating the PR by hand
      // or via a re-publish. We DO clean up local state.
      await this.cleanupLocalOnly(extractionBranch, opts.runId)
      throw err
    }

    // Step 7-8: cleanup local artefacts. State transitions publishing → sweep
    // here; the caller (Orchestrator.approvePR) finalises sweep → idle once
    // it has reset the workspace to trunk + re-applied the shim.
    const t2 = this.workspace.state.transition("sweep")
    if (!t2.ok && this.workspace.state.current() !== "sweep") {
      // Don't unwind a successful PR over a state-machine quirk; log only via
      // throw-after-cleanup would be worse than continuing.
    }
    await this.cleanupLocalOnly(extractionBranch, opts.runId)

    return {
      branchName: runBranchName,
      prUrl: prResult.prUrl,
      prNumber: prResult.prNumber,
      commitShas: cherryPicked,
    }
  }

  /**
   * Reset the sandbox clone back to a usable `idle` state after publish.
   *
   *   - Checkout trunk
   *   - Delete the local run branch (the remote copy lives on as the PR head)
   *   - Re-apply the preview-shim so the iframe still works for the next run
   *   - Transition state sweep → idle
   *
   * Re-applying the shim is a cherry-pick — D1's Workspace owns the original
   * shim commit, so we just pick the same SHA back onto trunk locally.
   */
  async cleanup(opts: { runId: string; userId?: string }): Promise<void> {
    const userId = opts.userId ?? "local"
    const runBranchName = branchNameFor(this.workspace.repoSlug, userId, opts.runId)
    const extractionBranch = extractionBranchFor(opts.runId)

    await this.gitOps.checkout(this.trunk).catch(() => undefined)
    await this.gitOps
      .deleteBranch(runBranchName, { force: true })
      .catch(() => undefined)
    await this.gitOps
      .deleteBranch(extractionBranch, { force: true })
      .catch(() => undefined)
    await this.branchManager.cleanupPatches(opts.runId)

    // Reapply the shim onto trunk so the next run starts from the same
    // shim-enabled HEAD that the workspace was originally bootstrapped with.
    // If trunk has moved past the shim we silently skip — the next startRun()
    // re-bases from origin/main anyway.
    const shimSha = this.workspace.info().shimCommitSha
    if (shimSha) {
      const reapply = await this.gitOps.cherryPick(shimSha)
      if (!reapply.ok) {
        // best-effort — startRun() does its own checkout from origin/<trunk>
        // and re-picks the shim, so a missed reapply here doesn't break the
        // next run.
        await this.gitOps.run(["cherry-pick", "--abort"]).catch(() => undefined)
      }
    }

    this.workspace.state.transition("idle")
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private async rollbackBeforePush(extractionBranch: string): Promise<void> {
    await this.gitOps.run(["cherry-pick", "--abort"]).catch(() => undefined)
    await this.gitOps.checkout(this.trunk).catch(() => undefined)
    await this.gitOps
      .deleteBranch(extractionBranch, { force: true })
      .catch(() => undefined)
    // Roll the state machine back to preview_ready so the user can retry.
    // SandboxStateMachine doesn't allow publishing → preview_ready, so we
    // only nudge when we're still in publishing; otherwise leave as-is.
    if (this.workspace.state.current() === "publishing") {
      // Force via rehydrate would skip validation but burns the audit trail.
      // Instead: move publishing → sweep → idle, accepting one extra hop.
      this.workspace.state.transition("sweep")
      this.workspace.state.transition("idle")
    }
  }

  private async cleanupLocalOnly(
    extractionBranch: string,
    runId: string,
  ): Promise<void> {
    await this.gitOps.checkout(this.trunk).catch(() => undefined)
    await this.gitOps
      .deleteBranch(extractionBranch, { force: true })
      .catch(() => undefined)
    await this.branchManager.cleanupPatches(runId)
  }
}
