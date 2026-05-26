/**
 * BranchAutoReview — Surface 3 Owner Co-pilot: auto-review branch diffs
 * before they hit the merge queue.
 *
 * The Owner Dashboard surfaces a green/yellow/red chip next to each
 * `dash-build/*` branch. This module is the AI brain behind that chip —
 * fetches the branch diff via GitHub API, runs cardinal rules check,
 * detects merge conflicts, sanity-checks scope, and confirms the
 * preview-shim leak gate has not been bypassed.
 *
 * Verdict logic:
 *   - any "high" severity check → red
 *   - any "medium" severity check (no high) → yellow
 *   - clean → green
 *
 * Caching is handled in the route layer (5 min TTL) — this module performs
 * a fresh review each call so it can be invoked imperatively from any
 * Owner workflow (queue refresh, manual override, etc.).
 *
 * Coordination with S3A (UI shell): the route at
 * `/api/owner/branches` accepts `mode=mock` so the UI can render the panel
 * without a live GitHub install during development.
 */

import type { GitHubAppClient } from "../../integrations/github/client.js"
import { splitFullName } from "../../integrations/github/client.js"
import { BANNED_IMPORTS } from "../../skills/prompt-composer.js"

export type ReviewVerdict = "green" | "yellow" | "red"
export type ReviewSeverity = "high" | "medium" | "low"

export interface ReviewCheck {
  /** Stable identifier so the UI can render an icon / link to docs. */
  name: string
  severity: ReviewSeverity
  /** Human-readable explanation surfaced in the dashboard. */
  message: string
}

export interface BranchReviewResult {
  branch: string
  repo: string
  verdict: ReviewVerdict
  checks: ReviewCheck[]
  suggestions: string[]
  /** Number of files changed (for the diff-scope sanity heuristic). */
  filesChanged: number
  /** Number of commits ahead of the base branch. */
  commitsAhead: number
  /** Number of commits behind the base branch (conflict proxy). */
  commitsBehind: number
  generatedAt: string
}

export interface BranchAutoReviewOptions {
  githubClient: GitHubAppClient
  /**
   * Override the cardinal rule scanner. Default uses the inline check that
   * mirrors validator.ts CR-3/CR-5 — kept inline to avoid the heavy
   * design-loader dependency this layer doesn't need.
   */
  scanDiff?: (diff: BranchDiffSummary) => ReviewCheck[]
  /**
   * Files-changed soft cap before we suggest manual review. Default 50.
   */
  largeDiffThreshold?: number
}

export interface BranchDiffSummary {
  /** Names of files changed in this branch vs the base. */
  files: string[]
  /** Additions text concatenated across files (best-effort, may be truncated). */
  additionsText: string
  /** Commits unique to the branch, in chronological order. */
  commits: Array<{ sha: string; message: string }>
}

/**
 * Paths that should trigger manual review when touched. Mirrors the
 * "sensitive paths" list used by the gstack ship workflow.
 */
const SENSITIVE_PATH_RE =
  /^(prisma\/|migrations?\/|.*\.lock$|.*\.env(\..+)?$|\.github\/workflows\/)/i

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const CASUAL_VOICE_RE = /\b(kamu|yaa|lewatin|bakal|udah|yuk|ayo|dong|deh|sih|kok|plis)\b/i
const MITRA_KEYWORD_RE = /\b(mitra|driver|kurir|pengemudi)\b/i
const PREVIEW_SHIM_COMMIT_RE = /^preview-shim apply v/i
const COMPONENT_PATH_RE = /^(?:apps\/[^/]+\/)?src\/components\//
const TEST_PATH_RE = /(__tests__\/|\.(test|spec)\.[tj]sx?$)/

export class BranchAutoReview {
  private readonly client: GitHubAppClient
  private readonly scanDiff: (diff: BranchDiffSummary) => ReviewCheck[]
  private readonly largeDiffThreshold: number

  constructor(opts: BranchAutoReviewOptions) {
    this.client = opts.githubClient
    this.scanDiff = opts.scanDiff ?? defaultScanDiff
    this.largeDiffThreshold = opts.largeDiffThreshold ?? 50
  }

  /**
   * Review a branch against its base branch. Returns a verdict + checks
   * list ready for the Owner Dashboard chip.
   *
   * `baseRef` defaults to the repo's default branch. Pass it explicitly
   * when the consumer repo uses something other than `main`.
   */
  async review(
    branchName: string,
    repoFullName: string,
    baseRef?: string,
  ): Promise<BranchReviewResult> {
    const [owner, repo] = splitFullName(repoFullName)
    const octokit = await this.client.getOctokitForRepo(repoFullName)

    const base = baseRef ?? (await this.resolveDefaultBranch(octokit, owner, repo))
    const compare = await safeCompare(octokit, owner, repo, base, branchName)

    const checks: ReviewCheck[] = []
    const suggestions: string[] = []

    // ── 1. Preview-shim leak — must NEVER ship to a PR. ──────────────────
    const shimCommit = compare.commits.find((c) =>
      PREVIEW_SHIM_COMMIT_RE.test(c.message.trim()),
    )
    if (shimCommit) {
      checks.push({
        name: "preview-shim-leak",
        severity: "high",
        message: `Branch contains a preview-shim commit (${shimCommit.sha.slice(0, 7)}). Re-publish via the sandbox to filter it out.`,
      })
      suggestions.push(
        "Run the Publish flow again — preview-shim commits must stay sandbox-local.",
      )
    }

    // ── 2. Conflict / divergence detection. ──────────────────────────────
    if (compare.status === "diverged" && compare.behindBy > 0) {
      checks.push({
        name: "potential-conflict",
        severity: "medium",
        message: `Branch is ${compare.behindBy} commit(s) behind ${base}. Rebase may be required to merge cleanly.`,
      })
      suggestions.push(
        `Rebase onto origin/${base} before merging to surface conflicts early.`,
      )
    }
    if (compare.status === "behind") {
      checks.push({
        name: "stale-branch",
        severity: "low",
        message: `Branch is purely behind ${base} (${compare.behindBy} commits) — likely already merged or stale.`,
      })
    }

    // ── 3. Diff scope sanity. ───────────────────────────────────────────
    if (compare.files.length > this.largeDiffThreshold) {
      checks.push({
        name: "large-diff",
        severity: "medium",
        message: `${compare.files.length} files changed (>${this.largeDiffThreshold}). Manual review recommended.`,
      })
      suggestions.push("Consider splitting into smaller PRs for reviewability.")
    }

    const sensitiveHits = compare.files.filter((f) => SENSITIVE_PATH_RE.test(f))
    if (sensitiveHits.length > 0) {
      checks.push({
        name: "sensitive-paths",
        severity: "medium",
        message: `Diff touches sensitive paths (${sensitiveHits.slice(0, 3).join(", ")}${sensitiveHits.length > 3 ? "…" : ""}). Verify migrations + locks are intentional.`,
      })
      suggestions.push("Confirm with the platform owner before merging schema/lock changes.")
    }

    // ── 4. Test coverage heuristic — new component, no new test. ────────
    const newComponents = compare.files.filter(
      (f) => COMPONENT_PATH_RE.test(f) && !TEST_PATH_RE.test(f),
    )
    const newTests = compare.files.filter((f) => TEST_PATH_RE.test(f))
    if (newComponents.length > 0 && newTests.length === 0) {
      checks.push({
        name: "missing-test",
        severity: "low",
        message: `${newComponents.length} component file(s) changed without an accompanying test.`,
      })
      suggestions.push(
        "Add at least a smoke test under `__tests__/` for the new component(s).",
      )
    }

    // ── 5. Cardinal rules recheck on the diff additions. ────────────────
    const diffSummary: BranchDiffSummary = {
      files: compare.files,
      additionsText: compare.additionsText,
      commits: compare.commits,
    }
    checks.push(...this.scanDiff(diffSummary))

    const verdict = computeVerdict(checks)

    return {
      branch: branchName,
      repo: repoFullName,
      verdict,
      checks,
      suggestions,
      filesChanged: compare.files.length,
      commitsAhead: compare.aheadBy,
      commitsBehind: compare.behindBy,
      generatedAt: new Date().toISOString(),
    }
  }

  private async resolveDefaultBranch(
    octokit: unknown,
    owner: string,
    repo: string,
  ): Promise<string> {
    const oct = octokit as {
      rest: {
        repos: {
          get: (a: {
            owner: string
            repo: string
          }) => Promise<{ data: { default_branch?: string } }>
        }
      }
    }
    const { data } = await oct.rest.repos.get({ owner, repo })
    return data.default_branch ?? "main"
  }
}

interface CompareResult {
  status: "ahead" | "behind" | "diverged" | "identical"
  aheadBy: number
  behindBy: number
  files: string[]
  additionsText: string
  commits: Array<{ sha: string; message: string }>
}

/**
 * Wrap `octokit.repos.compareCommits` so callers don't repeat the
 * patch-text aggregation. Truncates additions to keep memory bounded —
 * any single-file diff over 100KB is too big to scan via regex anyway.
 */
async function safeCompare(
  octokit: unknown,
  owner: string,
  repo: string,
  base: string,
  head: string,
): Promise<CompareResult> {
  const oct = octokit as {
    rest: {
      repos: {
        compareCommits: (a: {
          owner: string
          repo: string
          base: string
          head: string
        }) => Promise<{
          data: {
            status: "ahead" | "behind" | "diverged" | "identical"
            ahead_by: number
            behind_by: number
            files?: Array<{ filename: string; patch?: string }>
            commits?: Array<{ sha: string; commit?: { message: string } }>
          }
        }>
      }
    }
  }
  const { data } = await oct.rest.repos.compareCommits({ owner, repo, base, head })
  const files = (data.files ?? []).map((f) => f.filename)
  const additionsText = (data.files ?? [])
    .map((f) => extractAdditions(f.patch ?? ""))
    .join("\n")
    .slice(0, 100_000)
  const commits = (data.commits ?? []).map((c) => ({
    sha: c.sha,
    message: c.commit?.message ?? "",
  }))
  return {
    status: data.status,
    aheadBy: data.ahead_by,
    behindBy: data.behind_by,
    files,
    additionsText,
    commits,
  }
}

function extractAdditions(patch: string): string {
  if (!patch) return ""
  const lines = patch.split("\n")
  const out: string[] = []
  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      out.push(line.slice(1))
    }
  }
  return out.join("\n")
}

/**
 * Default diff scanner — mirrors the same CR-3 (banned imports), CR-5
 * (raw hex), and CR-4 (casual voice) rules the per-file validator uses.
 *
 * Operates on additions-only so the scanner doesn't flag legacy patterns
 * that the branch did not introduce.
 */
function defaultScanDiff(diff: BranchDiffSummary): ReviewCheck[] {
  const checks: ReviewCheck[] = []
  const additions = diff.additionsText

  // CR-3 — banned imports
  for (const lib of BANNED_IMPORTS) {
    const escaped = lib.replace(/[/\\$.*+?()[\]{}|^]/g, "\\$&")
    const re = new RegExp(
      `(?:from\\s+|require\\(\\s*)['"]${escaped}(?:['"]|/)`,
    )
    if (re.test(additions)) {
      checks.push({
        name: "banned-import",
        severity: "high",
        message: `Diff introduces banned import: ${lib} (CR-3)`,
      })
    }
  }

  // CR-5 — raw hex literals (additions only)
  const hex = additions.match(HEX_RE) ?? []
  if (hex.length > 0) {
    checks.push({
      name: "raw-hex",
      severity: "medium",
      message: `Diff introduces ${hex.length} raw hex literal(s) — use Dash semantic tokens (CR-5).`,
    })
  }

  // CR-4 — casual voice on mitra-facing surfaces
  if (CASUAL_VOICE_RE.test(additions) && MITRA_KEYWORD_RE.test(additions)) {
    checks.push({
      name: "casual-voice-mitra",
      severity: "medium",
      message: `Diff uses casual voice particles on mitra-facing copy — Dash voice rule requires formal "Anda" (CR-4).`,
    })
  }

  return checks
}

function computeVerdict(checks: ReviewCheck[]): ReviewVerdict {
  if (checks.some((c) => c.severity === "high")) return "red"
  if (checks.some((c) => c.severity === "medium")) return "yellow"
  return "green"
}
