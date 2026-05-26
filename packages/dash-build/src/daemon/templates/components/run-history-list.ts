import { escapeHtml } from "../layout.js"
import type { Run } from "../../state/types.js"

/**
 * Phase B2 — RunHistoryList.
 *
 * Renders past runs inside the conversation rail when the user toggles the
 * topbar `🕒 History` tab. Each card shows a sequence index, status pill,
 * prompt preview, and timestamp. Click surfaces a `data-jump-run` attribute
 * so the client can later wire deep-linking back into the run detail view.
 *
 * Layer 0 / CR-5: ONLY Dash semantic vars (no raw hex). Styles live in
 * `styles/dashboard.ts` under the Phase B2 marker.
 */

export interface RunHistoryListOptions {
  /** Runs ordered newest → oldest (Store.getRuns returns this order). */
  runs: Run[]
  /** Currently focused run id; receives `db-history-card--active`. */
  activeRunId?: string | null
  /** Title of the parent thread; shown in the header. */
  threadTitle?: string | null
}

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  clarifying: "Clarifying",
  generating: "Generating",
  awaiting_approval: "Ready",
  pr_created: "PR opened",
  completed: "Done",
  failed: "Failed",
  cancelled: "Cancelled",
}

function statusPillClass(status: string): string {
  // Map prompt-status → existing `db-status-pill-*` modifiers so we share the
  // colour tokens with the live prompt-card chips and don't double-spend on
  // new pill variants.
  const slug = status.replace(/_/g, "-")
  return `db-status-pill db-status-pill-${slug}`
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

function formatDuration(startIso: string, endIso: string): string {
  try {
    const start = new Date(startIso).getTime()
    const end = new Date(endIso).getTime()
    const ms = Math.max(0, end - start)
    if (ms < 1000) return `${ms}ms`
    const sec = Math.round(ms / 1000)
    if (sec < 60) return `${sec}s`
    const min = Math.floor(sec / 60)
    const rem = sec % 60
    return rem === 0 ? `${min}m` : `${min}m ${rem}s`
  } catch {
    return ""
  }
}

function preview(text: string, max = 60): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trimEnd() + "…"
}

function renderCard(run: Run, seq: number, isActive: boolean): string {
  const statusLabel = STATUS_LABEL[run.status] ?? run.status
  const promptPreview = preview(run.prompt, 60) || "(empty prompt)"
  const time = formatTime(run.createdAt)
  const duration = formatDuration(run.createdAt, run.updatedAt)
  const classes = [
    "db-history-card",
    isActive ? "db-history-card--active" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return `<button
    type="button"
    class="${classes}"
    data-jump-run="${escapeHtml(run.id)}"
    data-status="${escapeHtml(run.status)}"
    aria-current="${isActive ? "true" : "false"}"
  >
    <span class="db-history-card-head">
      <span class="db-history-card-seq">Run #${seq}</span>
      <span class="${statusPillClass(run.status)}">
        <span class="db-history-card-pill-label">${escapeHtml(statusLabel)}</span>
      </span>
    </span>
    <span class="db-history-card-prompt">${escapeHtml(promptPreview)}</span>
    <span class="db-history-card-meta">
      ${time ? `<span class="db-history-card-time">${escapeHtml(time)}</span>` : ""}
      ${duration ? `<span class="db-history-card-duration">${escapeHtml(duration)}</span>` : ""}
    </span>
  </button>`
}

export function renderRunHistoryList(opts: RunHistoryListOptions): string {
  const runs = opts.runs ?? []
  const activeRunId = opts.activeRunId ?? null
  const total = runs.length
  const threadTitle = opts.threadTitle?.trim() || "this thread"

  const header = `<header class="db-rail-history-list-head">
    <span class="db-rail-history-list-kicker">History</span>
    <h3 class="db-rail-history-list-title">All runs in ${escapeHtml(threadTitle)}</h3>
    <span class="db-rail-history-list-count">${total} run${total === 1 ? "" : "s"}</span>
  </header>`

  if (total === 0) {
    return `<section class="db-rail-history-list" aria-label="Run history">
      ${header}
      <div class="db-rail-history-list-empty">
        <span class="db-rail-history-list-empty-mark" aria-hidden="true">🕒</span>
        <p class="db-rail-history-list-empty-body">No runs yet — start by typing a prompt below.</p>
      </div>
    </section>`
  }

  // `getRuns` returns newest-first; the sequence label still uses chronological
  // ordering (oldest = #1, newest = #N) to match the runSeq() helper in
  // dashboard.ts so we don't confuse users with two numbering schemes.
  const cards = runs
    .map((run, idx) => renderCard(run, total - idx, run.id === activeRunId))
    .join("")

  return `<section class="db-rail-history-list" aria-label="Run history">
    ${header}
    <ol class="db-rail-history-list-items">${cards}</ol>
  </section>`
}
