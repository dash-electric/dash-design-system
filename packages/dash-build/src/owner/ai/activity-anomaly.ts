/**
 * ActivityAnomalyDetector — Surface 3 Owner Co-pilot: flag suspicious
 * patterns in the run log so the owner can intervene without scrolling.
 *
 * Three rules:
 *   1. stuck-user        — 3+ consecutive failures for the same user on
 *                          the same project. Suggests context loss or
 *                          tooling break.
 *   2. slow-run          — run duration > 5x median (per-project). Catches
 *                          orchestrator hangs and oversized prompts.
 *   3. repeated-prompt   — 4+ similar prompts in a row from the same user.
 *                          Often signals an ambiguous spec or a model that
 *                          can't satisfy the constraints.
 *
 * Pure function — no I/O. Caller supplies the Run[] slice it cares about
 * (typically `store.snapshot().runs` filtered to the trailing 7 days).
 */

import type { Run, PromptStatus } from "../../daemon/state/types.js"

export type ActivityAnomalyKind = "stuck-user" | "slow-run" | "repeated-prompt"

export interface ActivityAnomaly {
  kind: ActivityAnomalyKind
  severity: "high" | "medium" | "low"
  /** User key (matches CostMonitor's userKeyFor partitioning). */
  user: string | null
  project: string | null
  message: string
  /** Run ids that contributed to the anomaly — clickable in the UI. */
  runIds: string[]
}

export interface ActivityAnomalyDetectorOptions {
  /** Threshold for consecutive failures. Default 3. */
  stuckFailureCount?: number
  /** Slow-run multiplier vs project median. Default 5. */
  slowRunMultiplier?: number
  /** Threshold for repeated similar prompts. Default 4. */
  repeatedPromptCount?: number
  /** Similarity threshold (0..1) for prompt clustering. Default 0.75. */
  promptSimilarity?: number
}

const FAILED_STATUSES: ReadonlySet<PromptStatus> = new Set(["failed", "cancelled"])

export class ActivityAnomalyDetector {
  private readonly stuckFailureCount: number
  private readonly slowRunMultiplier: number
  private readonly repeatedPromptCount: number
  private readonly promptSimilarity: number

  constructor(opts: ActivityAnomalyDetectorOptions = {}) {
    this.stuckFailureCount = opts.stuckFailureCount ?? 3
    this.slowRunMultiplier = opts.slowRunMultiplier ?? 5
    this.repeatedPromptCount = opts.repeatedPromptCount ?? 4
    this.promptSimilarity = opts.promptSimilarity ?? 0.75
  }

  /**
   * Detect anomalies in a runs list. The runs may be in any order — the
   * detector sorts internally per-user / per-project so callers don't have
   * to think about it.
   */
  detect(runs: Run[]): ActivityAnomaly[] {
    const anomalies: ActivityAnomaly[] = []
    anomalies.push(...this.detectStuck(runs))
    anomalies.push(...this.detectSlow(runs))
    anomalies.push(...this.detectRepeated(runs))
    return anomalies
  }

  // ── Rule 1 — stuck user on project ────────────────────────────────────
  private detectStuck(runs: Run[]): ActivityAnomaly[] {
    const out: ActivityAnomaly[] = []
    const grouped = groupBy(runs, (r) => `${userKey(r)}::${r.projectId}`)
    for (const [, list] of grouped) {
      const ordered = list
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      let streak: Run[] = []
      const fire = () => {
        if (streak.length >= this.stuckFailureCount) {
          const last = streak[streak.length - 1]
          out.push({
            kind: "stuck-user",
            severity:
              streak.length >= this.stuckFailureCount + 2 ? "high" : "medium",
            user: userKey(last),
            project: last.projectId,
            message: `User ${userKey(last)} hit ${streak.length} consecutive failures on ${last.projectId}.`,
            runIds: streak.map((r) => r.id),
          })
        }
        streak = []
      }
      for (const run of ordered) {
        if (FAILED_STATUSES.has(run.status)) {
          streak.push(run)
        } else {
          fire()
        }
      }
      fire()
    }
    return out
  }

  // ── Rule 2 — slow run vs project median. ─────────────────────────────
  private detectSlow(runs: Run[]): ActivityAnomaly[] {
    const out: ActivityAnomaly[] = []
    const byProject = groupBy(runs, (r) => r.projectId)
    for (const [project, list] of byProject) {
      const durations = list
        .map((r) => durationMs(r))
        .filter((n): n is number => n !== null && n > 0)
      if (durations.length < 3) continue
      const med = median(durations)
      if (med <= 0) continue
      for (const run of list) {
        const d = durationMs(run)
        if (d === null) continue
        if (d >= med * this.slowRunMultiplier) {
          out.push({
            kind: "slow-run",
            severity: d >= med * (this.slowRunMultiplier + 5) ? "high" : "medium",
            user: userKey(run),
            project,
            message: `Run ${run.id} took ${formatDuration(d)} (project median ${formatDuration(med)}).`,
            runIds: [run.id],
          })
        }
      }
    }
    return out
  }

  // ── Rule 3 — repeated similar prompts from same user. ────────────────
  private detectRepeated(runs: Run[]): ActivityAnomaly[] {
    const out: ActivityAnomaly[] = []
    const byUser = groupBy(runs, (r) => userKey(r))
    for (const [user, list] of byUser) {
      const ordered = list
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const buckets: Run[][] = []
      for (const run of ordered) {
        const placed = buckets.find((b) =>
          b.some((r) => similarity(r.prompt, run.prompt) >= this.promptSimilarity),
        )
        if (placed) {
          placed.push(run)
        } else {
          buckets.push([run])
        }
      }
      for (const bucket of buckets) {
        if (bucket.length >= this.repeatedPromptCount) {
          out.push({
            kind: "repeated-prompt",
            severity: "medium",
            user,
            project: bucket[0].projectId,
            message: `User ${user} submitted ${bucket.length} similar prompts — consider clarifying or pairing.`,
            runIds: bucket.map((r) => r.id),
          })
        }
      }
    }
    return out
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function userKey(run: Run): string {
  return run.repo ?? "(local)"
}

function durationMs(run: Run): number | null {
  const start = Date.parse(run.createdAt)
  const end = Date.parse(run.updatedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return Math.max(0, end - start)
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = nums.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = out.get(k) ?? []
    list.push(item)
    out.set(k, list)
  }
  return out
}

/**
 * Jaccard similarity over token sets. Cheap and good enough to cluster
 * prompts like "build a button" vs "build me a button". Not a Levenshtein
 * substitute — the goal is detecting repeated INTENT, not exact text.
 */
function similarity(a: string, b: string): number {
  const ta = tokenSet(a)
  const tb = tokenSet(b)
  if (ta.size === 0 && tb.size === 0) return 1
  if (ta.size === 0 || tb.size === 0) return 0
  let intersect = 0
  for (const tok of ta) if (tb.has(tok)) intersect += 1
  const union = ta.size + tb.size - intersect
  return intersect / union
}

function tokenSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  )
}

function formatDuration(ms: number): string {
  if (ms < 1_000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}min`
}
