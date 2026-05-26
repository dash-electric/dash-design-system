/**
 * Sprint 3B — `/api/owner/branches`
 *
 * Returns the list of `dash-build/*` branches across the connected repos
 * with an auto-review chip per branch (green / yellow / red) computed by
 * `BranchAutoReview`.
 *
 * Coordination with S3A:
 *   - S3A renders the OwnerBranchRow table shell + chip pill (see
 *     `templates/components/owner-branch-queue.ts`). This route's response
 *     EXTENDS that shape — every row carries the S3A fields (branch, repo,
 *     status, reviewer, author, age, ci, lastCommit) PLUS the AI fields
 *     (verdict, checks, suggestions, filesChanged, commitsAhead,
 *     commitsBehind).
 *   - When the daemon has no GitHub install (early dev) the route falls
 *     back to S3A's local-synth rows so the UI is observable without
 *     credentials. AI fields are zeroed in that path.
 *
 * Cache: in-memory 5-minute TTL keyed by (repo, branch). The Owner panel
 * polls every ~30s; the cache avoids hammering GitHub's REST quota
 * (5K/hour per installation).
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import {
  methodNotAllowed,
  sendJson,
} from "../../_helpers.js"
import { GitHubAppClient } from "../../../../integrations/github/client.js"
import type { Store } from "../../../state/store.js"
import {
  BranchAutoReview,
  type BranchReviewResult,
} from "../../../../owner/ai/branch-review.js"
import {
  buildOwnerBranchRows,
} from "../owner.js"
import type {
  OwnerBranchRow,
} from "../../../templates/components/owner-branch-queue.js"

interface CacheEntry {
  expiresAt: number
  result: BranchReviewResult
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

function cacheKey(repo: string, branch: string): string {
  return `${repo}::${branch}`
}

function getCached(repo: string, branch: string): BranchReviewResult | null {
  const entry = cache.get(cacheKey(repo, branch))
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(cacheKey(repo, branch))
    return null
  }
  return entry.result
}

function setCached(repo: string, branch: string, result: BranchReviewResult): void {
  cache.set(cacheKey(repo, branch), {
    expiresAt: Date.now() + TTL_MS,
    result,
  })
}

/** Test seam — drop the cache between tests so polling specs are deterministic. */
export function _resetBranchReviewCache(): void {
  cache.clear()
}

/** Row shape returned by `/api/owner/branches` — extends S3A's OwnerBranchRow
 *  with the AI verdict + checks. UI may rely on the S3A fields for the table
 *  render today and progressively layer in the AI verdict pill. */
export interface OwnerBranchRowWithReview extends OwnerBranchRow {
  verdict: BranchReviewResult["verdict"] | "unknown"
  checks: BranchReviewResult["checks"]
  suggestions: BranchReviewResult["suggestions"]
  filesChanged: number
  commitsAhead: number
  commitsBehind: number
  /** True when the row came from the local-synth fallback (no GitHub). */
  synthetic: boolean
}

export interface OwnerBranchesDeps {
  store: Store
  githubClient?: GitHubAppClient
  reviewer?: BranchAutoReview
  branchPrefix?: string
  /** Override the per-repo branch list source — test seam. */
  listBranches?: (repo: string) => Promise<string[]>
}

export async function handleOwnerBranches(
  req: IncomingMessage,
  res: ServerResponse,
  deps: OwnerBranchesDeps,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  const url = new URL(req.url ?? "/", "http://localhost")
  const repoFilter = url.searchParams.get("repo")?.trim() || null
  const prefix = deps.branchPrefix ?? "dash-build/"

  // Bring up a default client when the daemon didn't inject one. Falling
  // back keeps the route usable in isolation (tests, ad-hoc curl).
  const client = deps.githubClient ?? new GitHubAppClient()

  // Local-synth fallback (S3A pattern) — observable without GitHub creds.
  if (!(await client.isConnected())) {
    const rows = await buildOwnerBranchRows(deps.store)
    const filtered = repoFilter ? rows.filter((r) => r.repo === repoFilter) : rows
    const branches: OwnerBranchRowWithReview[] = filtered.map((row) => ({
      ...row,
      verdict: "unknown",
      checks: [],
      suggestions: [],
      filesChanged: 0,
      commitsAhead: 0,
      commitsBehind: 0,
      synthetic: true,
    }))
    return sendJson(res, 200, {
      ok: true,
      branches,
      reason: "no_github_install",
      ttlMs: TTL_MS,
    })
  }

  const reviewer = deps.reviewer ?? new BranchAutoReview({ githubClient: client })

  let repos: string[]
  try {
    repos = repoFilter
      ? [repoFilter]
      : (await client.listRepos()).map((r) => r.fullName)
  } catch (err) {
    return sendJson(res, 502, {
      ok: false,
      error: "github_list_repos_failed",
      message: (err as Error).message,
    })
  }

  // Local rows keyed by branch for S3A field carry-over (reviewer, author, ci…).
  const localRows = await buildOwnerBranchRows(deps.store)
  const localByBranch = new Map<string, OwnerBranchRow>(
    localRows.map((r) => [`${r.repo}::${r.branch}`, r]),
  )

  const results: OwnerBranchRowWithReview[] = []
  const errors: Array<{ repo: string; branch?: string; message: string }> = []

  for (const repo of repos) {
    let branches: string[]
    try {
      branches = deps.listBranches
        ? await deps.listBranches(repo)
        : await listDashBuildBranches(client, repo, prefix)
    } catch (err) {
      errors.push({ repo, message: (err as Error).message })
      continue
    }
    for (const branch of branches) {
      let review = getCached(repo, branch)
      if (!review) {
        try {
          review = await reviewer.review(branch, repo)
          setCached(repo, branch, review)
        } catch (err) {
          errors.push({ repo, branch, message: (err as Error).message })
          continue
        }
      }
      const baseRow = localByBranch.get(`${repo}::${branch}`) ?? {
        branch,
        repo,
        status:
          review.verdict === "red"
            ? "blocked"
            : review.verdict === "yellow"
              ? "pending-review"
              : "approved",
        reviewer: "Owner AI",
        author: null,
        age: undefined,
        ci: "unknown" as const,
        lastCommit: null,
      }
      results.push({
        ...baseRow,
        verdict: review.verdict,
        checks: review.checks,
        suggestions: review.suggestions,
        filesChanged: review.filesChanged,
        commitsAhead: review.commitsAhead,
        commitsBehind: review.commitsBehind,
        synthetic: false,
      })
    }
  }

  return sendJson(res, 200, {
    ok: true,
    branches: results,
    errors,
    ttlMs: TTL_MS,
  })
}

async function listDashBuildBranches(
  client: GitHubAppClient,
  repoFullName: string,
  prefix: string,
): Promise<string[]> {
  const [owner, repo] = repoFullName.includes("/")
    ? (repoFullName.split("/") as [string, string])
    : ["", repoFullName]
  if (!owner) return []
  const octokit = (await client.getOctokitForRepo(repoFullName)) as unknown as {
    rest: {
      repos: {
        listBranches: (args: {
          owner: string
          repo: string
          per_page: number
          page: number
        }) => Promise<{ data: Array<{ name: string }> }>
      }
    }
  }
  const out: string[] = []
  let page = 1
  for (let i = 0; i < 10; i++) {
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
      page,
    })
    for (const b of data) {
      if (b.name.startsWith(prefix)) out.push(b.name)
    }
    if (data.length < 100) break
    page += 1
  }
  return out
}
