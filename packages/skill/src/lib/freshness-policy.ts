/**
 * Freshness policy — decides whether a cached snapshot is still authoritative
 * or should be re-scanned.
 *
 * Three invalidation triggers, in priority order:
 *   1. forceRefresh flag (explicit `dash skill refresh` or programmatic opt-in)
 *   2. fingerprint mismatch (consumer repo files changed)
 *   3. TTL expired (default 4h — long enough to amortize scan cost, short
 *      enough that "I forgot to refresh after a git pull" recovers within
 *      half a workday)
 *
 * Returning `{ refresh: false }` is the hot path — callers serve from cache.
 */
import type { CachedSnapshot } from "./snapshot-cache.js"

/** Default TTL: 4 hours. Tuned for active-development cadence. */
export const DEFAULT_CACHE_TTL_MS = 4 * 60 * 60 * 1000

export type FreshnessReason =
  | "valid-cache"
  | "no-cache"
  | "fingerprint-changed"
  | "ttl-expired"
  | "forced"
  | "schema-mismatch"

export type FreshnessDecision = {
  refresh: boolean
  reason: FreshnessReason
  ageMs: number
}

export type FreshnessInput = {
  cache: CachedSnapshot | null
  currentFingerprint: string
  forceRefresh?: boolean
  ttlMs?: number
  now?: number
}

/**
 * Decide whether the cached snapshot is fresh enough to serve, or stale and
 * needs a re-scan. Pure function — no I/O.
 */
export function shouldRefresh(input: FreshnessInput): FreshnessDecision {
  const ttl = input.ttlMs ?? DEFAULT_CACHE_TTL_MS
  const now = input.now ?? Date.now()

  if (input.forceRefresh) {
    return { refresh: true, reason: "forced", ageMs: 0 }
  }

  if (!input.cache) {
    return { refresh: true, reason: "no-cache", ageMs: 0 }
  }

  const ageMs = Math.max(0, now - input.cache.cachedAt)

  if (input.cache.fingerprint !== input.currentFingerprint) {
    return { refresh: true, reason: "fingerprint-changed", ageMs }
  }

  if (ageMs > ttl) {
    return { refresh: true, reason: "ttl-expired", ageMs }
  }

  return { refresh: false, reason: "valid-cache", ageMs }
}

/**
 * Human-readable summary used by `dash skill status`. Shows whether the next
 * `loadDashSkill` call will hit cache or re-scan, and why.
 */
export function describeFreshness(decision: FreshnessDecision): string {
  const ageMin = Math.round(decision.ageMs / 60000)
  switch (decision.reason) {
    case "valid-cache":
      return `fresh (age ${ageMin}m, cache will be served)`
    case "no-cache":
      return "no cache yet (next call will scan)"
    case "fingerprint-changed":
      return `STALE — repo files changed since cache (age ${ageMin}m), next call will re-scan`
    case "ttl-expired":
      return `STALE — TTL expired (age ${ageMin}m), next call will re-scan`
    case "forced":
      return "force-refresh requested"
    case "schema-mismatch":
      return "STALE — cache schema mismatch, next call will re-scan"
  }
}
