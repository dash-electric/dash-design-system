/**
 * CostMonitor — Surface 3 Owner Co-pilot: token spend snapshot + anomaly
 * detection.
 *
 * The Owner Dashboard exposes a "Cost Monitor" panel showing weekly spend,
 * per-user / per-project breakdown, and a 7-day sparkline. This module
 * is the AI brain behind the anomaly chips.
 *
 * Real telemetry wiring is DEFERRED — the orchestrator / skill chain does
 * not yet capture per-call token counts. For Sprint 3B we ship the shape
 * + interface + anomaly logic, fed by a PROXY computed from
 * `Run.validationScore`:
 *
 *   tokensProxy(run) = (failed runs ≈ 8K, low score ≈ 5K, high score ≈ 3K)
 *
 * When real telemetry lands (Phase 4 — see TODO in orchestrator.ts), the
 * proxy table here can be swapped for an actual `costLedger.query()`
 * call without touching the anomaly detection or route surface.
 *
 * Coordination with S3A: route `/api/owner/cost` returns the snapshot +
 * anomalies wrapped in `{ ok: true, snapshot, anomalies }` so the UI can
 * render both panels from a single request.
 */

import type { Store } from "../../daemon/state/store.js"
import type { Run } from "../../daemon/state/types.js"

export type AnomalyKind =
  | "user-daily-spike"
  | "project-over-threshold"
  | "burst"

export interface CostAnomaly {
  kind: AnomalyKind
  severity: "high" | "medium" | "low"
  user: string | null
  project: string | null
  message: string
  /** Suggested operator action surfaced in the dashboard banner. */
  suggestedAction: string
}

export interface DayBucket {
  /** ISO date (YYYY-MM-DD). */
  date: string
  tokens: number
  /** Approximate USD spend using a fixed $5/1M proxy rate. */
  usd: number
}

export interface UserSpend {
  user: string
  tokens: number
  usd: number
  runs: number
}

export interface ProjectSpend {
  project: string
  tokens: number
  usd: number
  runs: number
}

export interface CostSnapshot {
  /** Tokens consumed in the trailing 7-day window. */
  weeklyTokens: number
  weeklyUsd: number
  perUser: UserSpend[]
  perProject: ProjectSpend[]
  /** Oldest-first 7 entries — UI sparkline. */
  trend: DayBucket[]
  /** Inclusive bounds the snapshot was computed for. */
  windowStart: string
  windowEnd: string
  /** True until real telemetry replaces the validation-score proxy. */
  proxy: boolean
}

export interface CostMonitorOptions {
  store: Store
  /**
   * Project spend (in USD) that triggers a high-severity alert. Default $50
   * — chosen so a single runaway project shows up within a normal week.
   */
  projectAlertThresholdUsd?: number
  /**
   * User daily spend multiplier vs trailing average that triggers an alert.
   * Default 3 — matches the spec's "single-day spend > 3x avg" rule.
   */
  userDailySpikeMultiplier?: number
  /**
   * Hour-over-hour multiplier that triggers a burst alert. Default 5.
   */
  burstMultiplier?: number
  /** Test seam — inject a fixed clock for reproducible windows. */
  now?: () => Date
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const USD_PER_TOKEN = 5 / 1_000_000 // $5 per 1M tokens (Claude Sonnet 4.6 proxy rate)
const WINDOW_DAYS = 7

export class CostMonitor {
  private readonly store: Store
  private readonly projectAlertThresholdUsd: number
  private readonly userDailySpikeMultiplier: number
  private readonly burstMultiplier: number
  private readonly now: () => Date

  constructor(opts: CostMonitorOptions) {
    this.store = opts.store
    this.projectAlertThresholdUsd = opts.projectAlertThresholdUsd ?? 50
    this.userDailySpikeMultiplier = opts.userDailySpikeMultiplier ?? 3
    this.burstMultiplier = opts.burstMultiplier ?? 5
    this.now = opts.now ?? (() => new Date())
  }

  /**
   * Aggregate runs in the trailing window into a CostSnapshot. The result
   * is safe to serialize and ship to the UI as-is.
   */
  async snapshot(): Promise<CostSnapshot> {
    const end = this.now()
    const start = new Date(end.getTime() - WINDOW_DAYS * MS_PER_DAY)
    const runs = collectRecentRuns(this.store, start)

    const perUserMap = new Map<string, UserSpend>()
    const perProjectMap = new Map<string, ProjectSpend>()
    const dayBuckets = new Map<string, DayBucket>()

    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(end.getTime() - i * MS_PER_DAY)
      const key = isoDate(d)
      dayBuckets.set(key, { date: key, tokens: 0, usd: 0 })
    }

    let weeklyTokens = 0
    for (const run of runs) {
      const tokens = proxyTokensFor(run)
      const usd = tokens * USD_PER_TOKEN
      weeklyTokens += tokens

      const userKey = userKeyFor(run)
      const userBucket = perUserMap.get(userKey) ?? {
        user: userKey,
        tokens: 0,
        usd: 0,
        runs: 0,
      }
      userBucket.tokens += tokens
      userBucket.usd += usd
      userBucket.runs += 1
      perUserMap.set(userKey, userBucket)

      const projectKey = run.repo ?? "(unassigned)"
      const projectBucket = perProjectMap.get(projectKey) ?? {
        project: projectKey,
        tokens: 0,
        usd: 0,
        runs: 0,
      }
      projectBucket.tokens += tokens
      projectBucket.usd += usd
      projectBucket.runs += 1
      perProjectMap.set(projectKey, projectBucket)

      const dayKey = isoDate(new Date(run.createdAt))
      const dayBucket = dayBuckets.get(dayKey)
      if (dayBucket) {
        dayBucket.tokens += tokens
        dayBucket.usd += usd
      }
    }

    return {
      weeklyTokens,
      weeklyUsd: weeklyTokens * USD_PER_TOKEN,
      perUser: Array.from(perUserMap.values()).sort((a, b) => b.usd - a.usd),
      perProject: Array.from(perProjectMap.values()).sort((a, b) => b.usd - a.usd),
      trend: Array.from(dayBuckets.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      proxy: true,
    }
  }

  /**
   * Scan a snapshot for budget anomalies. Three rules implemented:
   *   1. user-daily-spike   — single-day spend > 3x the user's 7d daily avg
   *   2. project-over-threshold — project total > configured USD threshold
   *   3. burst               — hour-over-hour token rate > 5x prev hour
   *
   * The burst check works directly off the run timeline so the snapshot's
   * daily granularity doesn't hide a single 30-minute spike.
   */
  async detectAnomalies(snapshot: CostSnapshot): Promise<CostAnomaly[]> {
    const anomalies: CostAnomaly[] = []
    const end = this.now()
    const windowStart = new Date(end.getTime() - WINDOW_DAYS * MS_PER_DAY)
    const runs = collectRecentRuns(this.store, windowStart)

    // ── Rule 2 — project over threshold. ───────────────────────────────
    for (const proj of snapshot.perProject) {
      if (proj.usd > this.projectAlertThresholdUsd) {
        anomalies.push({
          kind: "project-over-threshold",
          severity: proj.usd > this.projectAlertThresholdUsd * 2 ? "high" : "medium",
          user: null,
          project: proj.project,
          message: `Project ${proj.project} spent $${proj.usd.toFixed(2)} this week (threshold $${this.projectAlertThresholdUsd}).`,
          suggestedAction:
            "Audit the project's recent prompts for runaway loops or oversized context packs.",
        })
      }
    }

    // ── Rule 1 — per-user daily spike vs trailing average. ─────────────
    const perUserDaily = bucketByUserDay(runs)
    for (const [user, days] of perUserDaily.entries()) {
      if (days.size < 2) continue
      const totals = Array.from(days.values())
      const avg = totals.reduce((a, b) => a + b, 0) / totals.length
      if (avg <= 0) continue
      const max = Math.max(...totals)
      if (max >= avg * this.userDailySpikeMultiplier) {
        anomalies.push({
          kind: "user-daily-spike",
          severity: max >= avg * (this.userDailySpikeMultiplier + 2) ? "high" : "medium",
          user,
          project: null,
          message: `User ${user} spent ${formatTokens(max)} in one day (avg ${formatTokens(avg)}).`,
          suggestedAction: `Check ${user}'s recent runs for a runaway prompt loop.`,
        })
      }
    }

    // ── Rule 3 — burst (hour-over-hour). ───────────────────────────────
    const hourBuckets = bucketByHour(runs)
    const sortedHours = Array.from(hourBuckets.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )
    for (let i = 1; i < sortedHours.length; i++) {
      const [hour, tokens] = sortedHours[i]
      const prevTokens = sortedHours[i - 1][1]
      if (prevTokens > 0 && tokens >= prevTokens * this.burstMultiplier) {
        anomalies.push({
          kind: "burst",
          severity: "medium",
          user: null,
          project: null,
          message: `Token burst at ${hour}: ${formatTokens(tokens)} (prev hour ${formatTokens(prevTokens)}).`,
          suggestedAction: "Investigate the orchestrator queue for parallel/runaway runs.",
        })
      }
    }

    return anomalies
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function collectRecentRuns(store: Store, since: Date): Run[] {
  const snapshot = store.snapshot()
  const sinceMs = since.getTime()
  return snapshot.runs.filter((r) => {
    const t = Date.parse(r.createdAt)
    return Number.isFinite(t) && t >= sinceMs
  })
}

/**
 * Proxy token count per run derived from validation score. Until the
 * orchestrator emits a real token ledger this gives the Owner Dashboard a
 * directionally-correct view: failed / low-score runs spent more because
 * they were retried; high-score runs landed cheap.
 */
function proxyTokensFor(run: Run): number {
  if (run.status === "failed" || run.status === "cancelled") return 8_000
  const score = run.validationScore
  if (score === null || score === undefined) return 4_000
  if (score < 50) return 6_000
  if (score < 80) return 4_500
  return 3_000
}

function userKeyFor(run: Run): string {
  // Until we capture per-user auth on each run, partition by project as a
  // best-effort proxy. Multi-tenant analytics roll up by project anyway.
  if (run.repo) return run.repo
  return "(local)"
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isoHour(d: Date): string {
  return d.toISOString().slice(0, 13) + ":00"
}

function bucketByUserDay(runs: Run[]): Map<string, Map<string, number>> {
  const out = new Map<string, Map<string, number>>()
  for (const run of runs) {
    const user = userKeyFor(run)
    const day = isoDate(new Date(run.createdAt))
    const userMap = out.get(user) ?? new Map<string, number>()
    userMap.set(day, (userMap.get(day) ?? 0) + proxyTokensFor(run))
    out.set(user, userMap)
  }
  return out
}

function bucketByHour(runs: Run[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const run of runs) {
    const hour = isoHour(new Date(run.createdAt))
    out.set(hour, (out.get(hour) ?? 0) + proxyTokensFor(run))
  }
  return out
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tok`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K tok`
  return `${Math.round(n)} tok`
}
