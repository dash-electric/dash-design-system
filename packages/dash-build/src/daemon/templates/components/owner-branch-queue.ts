/**
 * Owner Dashboard — Branch Merge Queue panel (Sprint 3A).
 *
 * Renders the cross-repo list of `dash-build/*` branches awaiting Owner
 * triage. Each row carries metadata derived server-side (status pill, author
 * extracted from the branch name pattern `dash-build/<userId>-<runId>`,
 * commit age, CI status) plus a trio of placeholder action buttons.
 *
 * Mutations (approve / request change / reject) are intentionally **inert**
 * in S3A — Sprint 3B owns the Owner AI triage backend that turns these into
 * real verbs. Buttons keep `disabled` + `aria-disabled` so screen readers
 * surface "available but not implemented yet".
 *
 * Layer 0 / CR-5 contract: ONLY Dash semantic vars. No raw hex. The
 * matching CSS lives in `styles/dashboard.ts` under the
 * `=== Sprint 3 Owner ===` marker.
 */

import { escapeHtml } from "../layout.js"

export type OwnerBranchStatus =
  | "pending-review"
  | "auto-review-pending"
  | "approved"
  | "blocked"
  | "needs-changes"

export type OwnerBranchCiStatus = "passing" | "failing" | "running" | "unknown"

export interface OwnerBranchRow {
  /** Full branch name as it appears on the remote, e.g. `dash-build/irfan-abc123`. */
  branch: string
  /** `owner/repo` slug. Used for the repo chip and grouping. */
  repo: string
  status: OwnerBranchStatus
  /** Optional reviewer label — "Owner AI", "Irfan", or null when not yet assigned. */
  reviewer?: string | null
  /** Author derived from the branch suffix or commit metadata; nullable when unknown. */
  author?: string | null
  /** Age in human form, e.g. "2h", "3d". Pre-formatted server-side. */
  age?: string
  ci?: OwnerBranchCiStatus
  /** Optional last-commit SHA (short) for the row meta line. */
  lastCommit?: string | null
}

export interface OwnerBranchQueueOptions {
  rows: OwnerBranchRow[]
  /** Empty-state hint when no rows. */
  emptyHint?: string
}

const STATUS_LABEL: Record<OwnerBranchStatus, string> = {
  "pending-review": "Pending review",
  "auto-review-pending": "Auto-review running",
  approved: "Approved",
  blocked: "Blocked",
  "needs-changes": "Needs changes",
}

const STATUS_TONE: Record<OwnerBranchStatus, "good" | "primary" | "warn" | "error" | "mute"> = {
  approved: "good",
  "auto-review-pending": "primary",
  "pending-review": "warn",
  "needs-changes": "warn",
  blocked: "error",
}

const CI_LABEL: Record<OwnerBranchCiStatus, string> = {
  passing: "CI ✓",
  failing: "CI ✗",
  running: "CI …",
  unknown: "CI —",
}

const CI_TONE: Record<OwnerBranchCiStatus, "good" | "error" | "primary" | "mute"> = {
  passing: "good",
  failing: "error",
  running: "primary",
  unknown: "mute",
}

/**
 * Parse a Dash Build branch name and extract the userId segment.
 *
 * Pattern: `dash-build/<userId>-<runId>` where `<userId>` is alphanum +
 * dashes and `<runId>` is the trailing token (alphanum + underscore).
 * Returns null when the branch does not match the convention.
 */
export function parseUserIdFromBranch(branch: string): string | null {
  if (!branch.startsWith("dash-build/")) return null
  const tail = branch.slice("dash-build/".length)
  if (!tail) return null
  // Split on the last `-` so the run id can carry digits while the user id
  // can carry dashes (irfan-prima → irfan-prima ; prm_abc-xyz → prm_abc).
  const lastDash = tail.lastIndexOf("-")
  if (lastDash <= 0) return tail
  const userPart = tail.slice(0, lastDash)
  return userPart || null
}

export function renderOwnerBranchQueue(opts: OwnerBranchQueueOptions): string {
  if (!opts.rows.length) {
    return `<div class="db-branch-queue-empty" role="status">
      <p class="db-body-sm db-muted">${escapeHtml(opts.emptyHint ?? "No dash-build branches awaiting review.")}</p>
    </div>`
  }

  const rows = opts.rows
    .map((r) => {
      const statusTone = STATUS_TONE[r.status] ?? "mute"
      const statusLabel = STATUS_LABEL[r.status] ?? r.status
      const ciKey = r.ci ?? "unknown"
      const ciTone = CI_TONE[ciKey]
      const ciLabel = CI_LABEL[ciKey]
      const author = r.author ?? parseUserIdFromBranch(r.branch) ?? "—"
      const reviewer = r.reviewer ?? "Unassigned"
      const lastCommit = r.lastCommit ? r.lastCommit.slice(0, 7) : "—"
      return `<tr class="db-branch-queue-row" data-branch="${escapeHtml(r.branch)}" data-repo="${escapeHtml(r.repo)}">
        <td class="db-branch-queue-cell db-branch-queue-cell--branch">
          <span class="db-branch-queue-branch-name" title="${escapeHtml(r.branch)}">${escapeHtml(r.branch)}</span>
          <span class="db-branch-queue-branch-sha db-mono">@${escapeHtml(lastCommit)}</span>
        </td>
        <td class="db-branch-queue-cell db-branch-queue-cell--repo">
          <span class="db-branch-queue-repo-chip" title="${escapeHtml(r.repo)}">${escapeHtml(r.repo)}</span>
        </td>
        <td class="db-branch-queue-cell">
          <span class="db-status-pill" data-tone="${statusTone}">${escapeHtml(statusLabel)}</span>
        </td>
        <td class="db-branch-queue-cell db-branch-queue-cell--reviewer">${escapeHtml(reviewer)}</td>
        <td class="db-branch-queue-cell db-branch-queue-cell--author">${escapeHtml(author)}</td>
        <td class="db-branch-queue-cell db-branch-queue-cell--age">${escapeHtml(r.age ?? "—")}</td>
        <td class="db-branch-queue-cell db-branch-queue-cell--ci">
          <span class="db-branch-queue-ci-chip" data-tone="${ciTone}">${escapeHtml(ciLabel)}</span>
        </td>
        <td class="db-branch-queue-cell db-branch-queue-cell--actions">
          <button type="button" class="db-button db-button-ghost db-button-compact" disabled aria-disabled="true" data-owner-action="approve" data-branch="${escapeHtml(r.branch)}" title="Approve (Sprint 3B)">Approve</button>
          <button type="button" class="db-button db-button-ghost db-button-compact" disabled aria-disabled="true" data-owner-action="request-changes" data-branch="${escapeHtml(r.branch)}" title="Request changes (Sprint 3B)">Changes</button>
          <button type="button" class="db-button db-button-ghost db-button-compact" disabled aria-disabled="true" data-owner-action="reject" data-branch="${escapeHtml(r.branch)}" title="Reject (Sprint 3B)">Reject</button>
        </td>
      </tr>`
    })
    .join("")

  return `<table class="db-branch-queue-table" role="table" aria-label="Branch merge queue">
    <thead>
      <tr>
        <th scope="col">Branch</th>
        <th scope="col">Repo</th>
        <th scope="col">Status</th>
        <th scope="col">Reviewer</th>
        <th scope="col">Author</th>
        <th scope="col">Age</th>
        <th scope="col">CI</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`
}
