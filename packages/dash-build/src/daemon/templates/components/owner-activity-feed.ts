/**
 * Owner Dashboard — Activity Log panel (Sprint 3A).
 *
 * Chronological feed of run lifecycle events aggregated across all
 * projects/threads. Source = `store.getRuns(threadId)` per thread, flattened
 * server-side by the `/api/owner/activity` handler.
 *
 * Anomaly flagging is intentionally tiny in S3A — 3+ consecutive failures by
 * the same author bubble a `data-anomaly="true"` chip. Owner AI (Sprint 3B)
 * extends this with cost spikes, regressed-foundation-scores, etc.
 *
 * Layer 0 / CR-5: ONLY Dash semantic vars. Styles in `styles/dashboard.ts`.
 */

import { escapeHtml } from "../layout.js"

export type OwnerActivityEvent =
  | "run_started"
  | "run_clarifying"
  | "run_preview_ready"
  | "run_publishing"
  | "run_published"
  | "run_failed"
  | "run_cancelled"

export interface OwnerActivityRow {
  id: string
  event: OwnerActivityEvent
  /** ISO timestamp of the event. */
  at: string
  /** Author / submitter — typically the repo owner or run originator. */
  user?: string | null
  /** Project name or `owner/repo` slug. */
  project?: string | null
  /** Short prompt preview, optional. */
  prompt?: string | null
  /** Pre-formatted duration string ("12s", "3m 4s") shown beside the timestamp. */
  duration?: string | null
  /** Marks the row as an anomaly worth Owner attention. */
  anomaly?: boolean
  /** Optional explanation when `anomaly` is true. */
  anomalyReason?: string | null
}

export interface OwnerActivityFeedOptions {
  rows: OwnerActivityRow[]
  /** Override "now" for deterministic day-grouping in tests. */
  now?: Date
  /** Empty-state hint when no rows. */
  emptyHint?: string
}

const EVENT_LABEL: Record<OwnerActivityEvent, string> = {
  run_started: "Started",
  run_clarifying: "Awaiting clarification",
  run_preview_ready: "Preview ready",
  run_publishing: "Publishing",
  run_published: "Published",
  run_failed: "Failed",
  run_cancelled: "Cancelled",
}

const EVENT_ICON: Record<OwnerActivityEvent, string> = {
  run_started: "▶",
  run_clarifying: "?",
  run_preview_ready: "◐",
  run_publishing: "↑",
  run_published: "✓",
  run_failed: "✗",
  run_cancelled: "⊘",
}

const EVENT_TONE: Record<OwnerActivityEvent, "good" | "primary" | "warn" | "error" | "mute"> = {
  run_started: "primary",
  run_clarifying: "warn",
  run_preview_ready: "good",
  run_publishing: "primary",
  run_published: "good",
  run_failed: "error",
  run_cancelled: "mute",
}

function dayKey(date: Date): string {
  // Local-date key (YYYY-MM-DD) so events on the same calendar day group
  // together regardless of how close to midnight they land.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDayLabel(key: string, now: Date): string {
  const today = dayKey(now)
  const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (key === today) return "Today"
  if (key === dayKey(yest)) return "Yesterday"
  return key
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  } catch {
    return ""
  }
}

export function renderOwnerActivityFeed(opts: OwnerActivityFeedOptions): string {
  if (!opts.rows.length) {
    return `<div class="db-activity-feed-empty" role="status">
      <p class="db-body-sm db-muted">${escapeHtml(opts.emptyHint ?? "No activity yet. Runs will surface here once Build prompts are submitted.")}</p>
    </div>`
  }

  const now = opts.now ?? new Date()
  // Group rows by local-day key, preserving the (already-sorted-DESC) order.
  const groups: Array<{ key: string; rows: OwnerActivityRow[] }> = []
  for (const r of opts.rows) {
    let when: Date
    try {
      when = new Date(r.at)
    } catch {
      continue
    }
    const k = dayKey(when)
    let bucket = groups[groups.length - 1]
    if (!bucket || bucket.key !== k) {
      bucket = { key: k, rows: [] }
      groups.push(bucket)
    }
    bucket.rows.push(r)
  }

  const groupHtml = groups
    .map((g) => {
      const items = g.rows
        .map((r) => {
          const tone = EVENT_TONE[r.event] ?? "mute"
          const label = EVENT_LABEL[r.event] ?? r.event
          const icon = EVENT_ICON[r.event] ?? "•"
          const time = formatTime(r.at)
          const user = r.user ?? "—"
          const project = r.project ?? "—"
          const duration = r.duration ? `<span class="db-activity-row-duration db-mono">${escapeHtml(r.duration)}</span>` : ""
          const promptLine = r.prompt
            ? `<p class="db-activity-row-prompt db-body-sm db-muted">${escapeHtml(r.prompt)}</p>`
            : ""
          const anomaly = r.anomaly
            ? `<span class="db-activity-row-anomaly" data-anomaly="true" title="${escapeHtml(r.anomalyReason ?? "Flagged anomaly")}">!</span>`
            : ""
          return `<li class="db-activity-row" data-event="${escapeHtml(r.event)}" data-run-id="${escapeHtml(r.id)}">
            <span class="db-activity-row-icon" data-tone="${tone}" aria-hidden="true">${escapeHtml(icon)}</span>
            <div class="db-activity-row-body">
              <div class="db-activity-row-headline">
                <span class="db-activity-row-event">${escapeHtml(label)}</span>
                ${anomaly}
                <span class="db-activity-row-user">${escapeHtml(user)}</span>
                <span class="db-activity-row-sep" aria-hidden="true">·</span>
                <span class="db-activity-row-project">${escapeHtml(project)}</span>
              </div>
              ${promptLine}
            </div>
            <div class="db-activity-row-meta">
              <span class="db-activity-row-time db-mono">${escapeHtml(time)}</span>
              ${duration}
            </div>
          </li>`
        })
        .join("")
      return `<section class="db-activity-feed-group" aria-labelledby="db-activity-${escapeHtml(g.key)}">
        <h3 class="db-activity-feed-day" id="db-activity-${escapeHtml(g.key)}">${escapeHtml(formatDayLabel(g.key, now))}</h3>
        <ol class="db-activity-feed-list">
          ${items}
        </ol>
      </section>`
    })
    .join("")

  return `<div class="db-activity-feed" role="feed" aria-label="Run activity log">
    ${groupHtml}
  </div>`
}

/**
 * Anomaly helper — flags 3+ consecutive `run_failed` events from the same
 * user. Mutates rows in place by setting `anomaly = true` on the *third*
 * (and later) failure of a streak.
 */
export function flagAnomalies(rows: OwnerActivityRow[]): OwnerActivityRow[] {
  // Streaks are time-ordered ascending for this calculation, so we walk a
  // copy from oldest → newest, then map flags back onto the caller's rows.
  const ordered = [...rows].sort((a, b) => a.at.localeCompare(b.at))
  const streakByUser = new Map<string, number>()
  for (const r of ordered) {
    if (!r.user) continue
    if (r.event === "run_failed") {
      const next = (streakByUser.get(r.user) ?? 0) + 1
      streakByUser.set(r.user, next)
      if (next >= 3) {
        r.anomaly = true
        r.anomalyReason = `${next} consecutive failures by ${r.user}`
      }
    } else {
      streakByUser.set(r.user, 0)
    }
  }
  return rows
}
