import type { Store } from "../../state/store.js"
import {
  flagAnomalies,
  type OwnerActivityEvent,
  type OwnerActivityRow,
} from "../../templates/components/owner-activity-feed.js"
import {
  parseUserIdFromBranch,
  type OwnerBranchRow,
} from "../../templates/components/owner-branch-queue.js"
import type { OwnerCostCardOptions } from "../../templates/components/owner-cost-card.js"
import type { PromptStatus, Run } from "../../state/types.js"

/**
 * Owner Dashboard data builders (Sprint 3A).
 *
 * These helpers feed the server-side render of `/owner` (see routes/owner.ts)
 * with placeholder data sourced from the local Store. They are intentionally
 * pure — no HTTP, no IO — so the same payloads can be assembled by either
 * the renderer or by Sprint 3B's `/api/owner/*` JSON handlers (which live
 * under `routes/api/owner/`).
 *
 * Sprint 3B owns the JSON endpoints + Owner AI triage. S3A's contract here
 * is the shape of the renderer-side payloads only.
 */

// ── Branch list ─────────────────────────────────────────────────────────────

/**
 * Build the Owner branch queue from the local run history. Every run that
 * reached `awaiting_approval` / `pr_created` implies a
 * `dash-build/<userId>-<runId>` branch lives on the remote (or will
 * momentarily). Synthesizing locally keeps the surface observable without
 * GitHub App credentials.
 *
 * Sprint 3B's `/api/owner/branches` route swaps in a live
 * `GitHubAppClient.listBranches` fetch with auto-review verdicts.
 */
export async function buildOwnerBranchRows(store: Store): Promise<OwnerBranchRow[]> {
  const allRuns = collectAllRuns(store)
  const rows: OwnerBranchRow[] = []
  const now = Date.now()
  for (const run of allRuns) {
    if (!run.repo) continue
    const branch = synthesizeBranchName(run)
    if (!branch) continue
    const status = mapRunToBranchStatus(run.status)
    const ageMs = Math.max(0, now - Date.parse(run.updatedAt || run.createdAt))
    rows.push({
      branch,
      repo: run.repo,
      status,
      reviewer: status === "approved" ? "Owner AI" : "Unassigned",
      author: parseUserIdFromBranch(branch),
      age: formatAgo(ageMs),
      ci: status === "blocked" ? "failing" : status === "approved" ? "passing" : "unknown",
      lastCommit: run.id,
    })
  }
  // Newest first.
  rows.sort((a, b) => (a.age ?? "").localeCompare(b.age ?? ""))
  return rows
}

function collectAllRuns(store: Store): Run[] {
  const projects = store.getProjects()
  const out: Run[] = []
  for (const p of projects) {
    const threads = store.getThreads(p.id)
    for (const t of threads) {
      for (const r of store.getRuns(t.id)) out.push(r)
    }
  }
  return out
}

function synthesizeBranchName(run: Run): string | null {
  if (!run.id) return null
  // Per-user attribution lands with Sprint 3B; for now everything is the
  // local pilot user so the branch convention is still observable.
  const user = "local-pilot"
  return `dash-build/${user}-${run.id}`
}

function mapRunToBranchStatus(status: PromptStatus): OwnerBranchRow["status"] {
  switch (status) {
    case "pr_created":
    case "completed":
      return "approved"
    case "awaiting_approval":
      return "pending-review"
    case "generating":
    case "queued":
      return "auto-review-pending"
    case "failed":
      return "blocked"
    case "clarifying":
      return "needs-changes"
    case "cancelled":
    default:
      return "needs-changes"
  }
}

function formatAgo(ms: number): string {
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.round(hr / 24)
  return `${day}d`
}

// ── Activity feed ───────────────────────────────────────────────────────────

export function buildOwnerActivityRows(store: Store, limit: number): OwnerActivityRow[] {
  const allRuns = collectAllRuns(store)
  // Sort DESC by updatedAt.
  allRuns.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
  const projectNameById = new Map<string, string>()
  for (const p of store.getProjects()) projectNameById.set(p.id, p.name)

  const rows: OwnerActivityRow[] = []
  for (const run of allRuns) {
    const event = mapRunToActivityEvent(run.status)
    if (!event) continue
    const project = projectNameById.get(run.projectId) ?? run.repo ?? "—"
    rows.push({
      id: run.id,
      event,
      at: run.updatedAt ?? run.createdAt,
      user: "local-pilot",
      project,
      prompt: previewPrompt(run.prompt, 80),
      duration: computeDuration(run.createdAt, run.updatedAt),
    })
  }
  // Anomaly flagging mutates rows in-place — `flagAnomalies` returns the
  // same reference for chainability.
  flagAnomalies(rows)
  return rows.slice(0, limit)
}

function mapRunToActivityEvent(status: PromptStatus): OwnerActivityEvent | null {
  switch (status) {
    case "queued":
    case "generating":
      return "run_started"
    case "clarifying":
      return "run_clarifying"
    case "awaiting_approval":
      return "run_preview_ready"
    case "pr_created":
      return "run_publishing"
    case "completed":
      return "run_published"
    case "failed":
      return "run_failed"
    case "cancelled":
      return "run_cancelled"
    default:
      return null
  }
}

function previewPrompt(text: string | null | undefined, max: number): string | null {
  if (!text) return null
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return null
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…"
}

function computeDuration(start: string, end: string): string | null {
  try {
    const s = Date.parse(start)
    const e = Date.parse(end)
    if (!Number.isFinite(s) || !Number.isFinite(e)) return null
    const ms = Math.max(0, e - s)
    if (ms < 1000) return `${ms}ms`
    const sec = Math.round(ms / 1000)
    if (sec < 60) return `${sec}s`
    const min = Math.floor(sec / 60)
    const rem = sec % 60
    return rem === 0 ? `${min}m` : `${min}m ${rem}s`
  } catch {
    return null
  }
}

// ── Cost fixture ────────────────────────────────────────────────────────────

export function buildOwnerCostFixture(): OwnerCostCardOptions {
  // Mock distribution loosely matching what a small Dash pilot week looks
  // like. Sprint 3B replaces with a real usage tracker; the shape is the
  // contract callers depend on.
  return {
    weekSpendUsd: 65.4,
    series: [4.2, 7.1, 9.8, 12.3, 11.5, 14.8, 5.7],
    topUsers: [
      { user: "irfan", spendUsd: 28.4, runs: 14 },
      { user: "fayzul", spendUsd: 15.9, runs: 9 },
      { user: "aditya", spendUsd: 11.2, runs: 6 },
      { user: "design-team", spendUsd: 7.3, runs: 4 },
      { user: "ops", spendUsd: 2.6, runs: 2 },
    ],
    budgetUsd: 100,
  }
}

// ── DS candidates fixture ───────────────────────────────────────────────────

export function buildOwnerDsCandidatesFixture(): Array<{
  id: string
  title: string
  kind: string
  from: string
}> {
  // Empty in S3A — keeps the panel honest about its mock status. Sprint 3B
  // populates from Build AI's component-candidate signal.
  return []
}
