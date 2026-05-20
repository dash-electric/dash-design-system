/**
 * Shared formatters + token maps for the CEO Requests dashboard.
 * Keep this file pure (no React, no Node fs) so both server and client
 * components can import it freely.
 */
import type { GapSeverity, GapStatus } from "@/lib/dashboard-data"

/** Badge color token for each severity tier. */
export function severityTone(
  sev: GapSeverity,
): "error" | "warning" | "neutral" {
  if (sev === "high") return "error"
  if (sev === "medium") return "warning"
  return "neutral"
}

/** Badge color token for each lifecycle status. */
export function statusTone(
  status: GapStatus,
): "success" | "information" | "warning" | "faded" {
  if (status === "vendored") return "success"
  if (status === "synced") return "information"
  if (status === "declined") return "faded"
  return "warning" // pending
}

/** Trim a UUID/random id to the first 8 chars for compact tables. */
export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

/**
 * Render an ISO timestamp as an age string like "3h", "2d", "5m".
 * Returns "?" for anything we can't parse — never throws. The unit
 * coarsens monotonically (sec → min → hour → day) so the column sorts
 * naturally when grouped by created_at.
 */
export function formatAge(createdAt: string): string {
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return "?"
  const diffMs = Math.max(0, Date.now() - t)
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  return `${day}d`
}

/**
 * Coarse age bucket used by the filter dropdown. Buckets line up with
 * intuitive triage windows: "today", "this week", "older than a week",
 * "older than a month". `null` returned for unparseable timestamps so
 * the caller can treat them as their own bucket.
 */
export type AgeBucket = "today" | "week" | "older" | "stale"

export function ageBucket(createdAt: string): AgeBucket | null {
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return null
  const days = (Date.now() - t) / (1000 * 60 * 60 * 24)
  if (days < 1) return "today"
  if (days < 7) return "week"
  if (days < 30) return "older"
  return "stale"
}
