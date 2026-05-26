/**
 * Sprint 3B — `/api/owner/activity`
 *
 * Returns the trailing-7d activity feed + anomaly flags for the Owner
 * Dashboard "Activity Log" panel.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     activity: OwnerActivityRow[],  // S3A shape, anomaly flag attached
 *     anomalies: ActivityAnomaly[],  // structured AI findings
 *     runs: Run[],                   // raw runs for clients that need them
 *   }
 *
 * Coordination with S3A: extends `buildOwnerActivityRows()` from S3A so
 * the existing SSR panel keeps working; layers the structured anomaly
 * detector on top for the banner stack.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../../state/store.js"
import { methodNotAllowed, sendJson } from "../../_helpers.js"
import { ActivityAnomalyDetector } from "../../../../owner/ai/activity-anomaly.js"
import { buildOwnerActivityRows } from "../owner.js"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DEFAULT_WINDOW_DAYS = 7
const MAX_RUNS = 100

export interface OwnerActivityDeps {
  store: Store
  detector?: ActivityAnomalyDetector
  /** Test seam — inject a fixed clock so window cutoffs are reproducible. */
  now?: () => Date
}

export async function handleOwnerActivity(
  req: IncomingMessage,
  res: ServerResponse,
  deps: OwnerActivityDeps,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  const url = new URL(req.url ?? "/", "http://localhost")
  const windowDays = parsePositiveInt(
    url.searchParams.get("windowDays"),
    DEFAULT_WINDOW_DAYS,
  )

  const now = deps.now ?? (() => new Date())
  const cutoff = now().getTime() - windowDays * MS_PER_DAY
  const allRuns = deps.store.snapshot().runs
  const recent = allRuns
    .filter((r) => {
      const t = Date.parse(r.createdAt)
      return Number.isFinite(t) && t >= cutoff
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_RUNS)

  const detector = deps.detector ?? new ActivityAnomalyDetector()
  try {
    const anomalies = detector.detect(recent)
    // Cross-reference structured anomalies back into S3A's flat row list so
    // existing UI chips light up. anomaly.runIds[] map → rows whose `id`
    // matches gain `anomaly: true` + a reason.
    const activity = buildOwnerActivityRows(deps.store, MAX_RUNS)
    const reasonByRunId = new Map<string, string>()
    for (const a of anomalies) {
      for (const id of a.runIds) {
        const existing = reasonByRunId.get(id)
        reasonByRunId.set(
          id,
          existing ? `${existing}; ${a.message}` : a.message,
        )
      }
    }
    for (const row of activity) {
      const reason = reasonByRunId.get(row.id)
      if (reason) {
        row.anomaly = true
        row.anomalyReason = reason
      }
    }
    return sendJson(res, 200, {
      ok: true,
      activity,
      anomalies,
      runs: recent,
      windowDays,
    })
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "activity_detect_failed",
      message: (err as Error).message,
    })
  }
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}
