/**
 * StaleSweeper — background job that deletes stale `dash-build/*` branches
 * (Phase D3).
 *
 * Trunk-based contract:
 *   - Every Dash Build run pushes a short-lived branch under `dash-build/`.
 *   - When the PR merges, GitHub deletes the branch automatically.
 *   - Abandoned branches (PR closed without merge, run failed pre-PR) linger.
 *
 * This sweeper scans the remote, looks at the last commit date for each
 * `dash-build/*` branch, and deletes anything older than `maxAgeDays`
 * (default 7). Runs in dryRun mode by default so the first deployment can
 * inspect the report before flipping the switch.
 *
 * No new npm deps — uses the existing GitHubAppClient (Octokit under the hood).
 */

import type { Octokit } from "@octokit/rest"
import { GitHubAppClient, splitFullName } from "../integrations/github/client.js"

export interface SweepCandidate {
  branch: string
  ageDays: number
  lastCommit: string
  sha: string
}

export interface SweepReport {
  repo: string
  scanned: number
  stale: SweepCandidate[]
  deleted: number
  kept: number
  errors: Array<{ branch: string; message: string }>
  dryRun: boolean
}

export type SweepEvent =
  | { type: "sweep:started"; repo: string; at: string }
  | {
      type: "sweep:branch_deleted"
      repo: string
      branch: string
      ageDays: number
      at: string
    }
  | {
      type: "sweep:branch_kept"
      repo: string
      branch: string
      ageDays: number
      at: string
    }
  | {
      type: "sweep:completed"
      repo: string
      deleted: number
      scanned: number
      at: string
    }

export type SweepBroadcaster = (event: SweepEvent) => void

export interface StaleSweeperOptions {
  gitOps?: unknown // reserved for symmetry with D2; not used today
  githubClient: GitHubAppClient
  /** If true, report what would happen but don't delete. Default true. */
  dryRun?: boolean
  /** Branches older than this are stale. Default 7. */
  maxAgeDays?: number
  /** Branch prefix to scan. Default "dash-build/". */
  branchPrefix?: string
  /** Test seam — supply a clock so unit tests aren't flaky. */
  now?: () => Date
  /** Emit progress events (started, per-branch, completed). */
  broadcaster?: SweepBroadcaster
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export class StaleSweeper {
  private readonly client: GitHubAppClient
  private readonly dryRun: boolean
  private readonly maxAgeDays: number
  private readonly branchPrefix: string
  private readonly now: () => Date
  private readonly broadcaster?: SweepBroadcaster

  constructor(opts: StaleSweeperOptions) {
    this.client = opts.githubClient
    this.dryRun = opts.dryRun ?? true
    this.maxAgeDays = opts.maxAgeDays ?? 7
    this.branchPrefix = opts.branchPrefix ?? "dash-build/"
    this.now = opts.now ?? (() => new Date())
    this.broadcaster = opts.broadcaster
  }

  /**
   * Scan + delete-when-applicable. Safe to call ad-hoc (cron, manual button).
   */
  async sweep(repoFullName: string): Promise<SweepReport> {
    return this.runOnce(repoFullName)
  }

  /**
   * Alias of `sweep()` for callers that want the cron-friendly name explicitly.
   */
  async runOnce(repoFullName: string): Promise<SweepReport> {
    const [owner, repo] = splitFullName(repoFullName)
    const octokit = await this.client.getOctokitForRepo(repoFullName)
    const startedAt = this.now().toISOString()
    this.emit({ type: "sweep:started", repo: repoFullName, at: startedAt })

    const branches = await this.listMatchingBranches(octokit, owner, repo)
    const stale: SweepCandidate[] = []
    const errors: Array<{ branch: string; message: string }> = []
    let deleted = 0
    let kept = 0

    for (const b of branches) {
      let lastCommit: string
      try {
        lastCommit = await this.lastCommitDate(octokit, owner, repo, b.sha)
      } catch (err) {
        errors.push({ branch: b.name, message: (err as Error).message })
        continue
      }
      const ageDays = this.ageInDays(lastCommit)
      const candidate: SweepCandidate = {
        branch: b.name,
        ageDays,
        lastCommit,
        sha: b.sha,
      }
      if (ageDays >= this.maxAgeDays) {
        stale.push(candidate)
        if (this.dryRun) {
          kept += 1
          this.emit({
            type: "sweep:branch_kept",
            repo: repoFullName,
            branch: b.name,
            ageDays,
            at: this.now().toISOString(),
          })
        } else {
          try {
            await this.deleteBranch(octokit, owner, repo, b.name)
            deleted += 1
            this.emit({
              type: "sweep:branch_deleted",
              repo: repoFullName,
              branch: b.name,
              ageDays,
              at: this.now().toISOString(),
            })
          } catch (err) {
            errors.push({ branch: b.name, message: (err as Error).message })
          }
        }
      } else {
        kept += 1
      }
    }

    this.emit({
      type: "sweep:completed",
      repo: repoFullName,
      scanned: branches.length,
      deleted,
      at: this.now().toISOString(),
    })

    return {
      repo: repoFullName,
      scanned: branches.length,
      stale,
      deleted,
      kept,
      errors,
      dryRun: this.dryRun,
    }
  }

  /**
   * Start an interval timer that calls `runOnce(repoFullName)` every
   * `intervalHours`. Returns a cancel function. Default interval = 24h.
   *
   * NOTE: the first sweep does NOT run immediately — caller is expected to
   * invoke `runOnce()` once on boot if a startup sweep is desired.
   */
  schedule(repoFullName: string, intervalHours: number = 24): () => void {
    const ms = Math.max(1, intervalHours) * 60 * 60 * 1000
    const handle = setInterval(() => {
      this.runOnce(repoFullName).catch(() => {
        /* swept errors live in the report.errors[]; interval keeps going */
      })
    }, ms)
    // Don't keep the event loop alive purely for this timer.
    if (typeof handle === "object" && handle && "unref" in handle) {
      ;(handle as { unref: () => void }).unref()
    }
    return () => clearInterval(handle)
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private emit(event: SweepEvent): void {
    if (!this.broadcaster) return
    try {
      this.broadcaster(event)
    } catch {
      /* broadcaster failures must not derail the sweep */
    }
  }

  private async listMatchingBranches(
    octokit: Octokit,
    owner: string,
    repo: string,
  ): Promise<Array<{ name: string; sha: string }>> {
    // Octokit pagination — `listBranches` returns max 100 per page.
    const out: Array<{ name: string; sha: string }> = []
    let page = 1
    // Hard cap pages so a misconfigured repo can't loop forever.
    for (let i = 0; i < 50; i++) {
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
        page,
      })
      for (const b of data) {
        if (b.name.startsWith(this.branchPrefix)) {
          out.push({ name: b.name, sha: b.commit.sha })
        }
      }
      if (data.length < 100) break
      page += 1
    }
    return out
  }

  private async lastCommitDate(
    octokit: Octokit,
    owner: string,
    repo: string,
    sha: string,
  ): Promise<string> {
    const { data } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: sha,
    })
    return data.author?.date ?? data.committer?.date ?? new Date(0).toISOString()
  }

  private ageInDays(iso: string): number {
    const t = Date.parse(iso)
    if (!Number.isFinite(t)) return 0
    const ms = this.now().getTime() - t
    return ms / MS_PER_DAY
  }

  private async deleteBranch(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<void> {
    await octokit.rest.git.deleteRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    })
  }
}
