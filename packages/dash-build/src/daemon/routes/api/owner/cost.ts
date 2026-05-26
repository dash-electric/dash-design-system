/**
 * Sprint 3B — `/api/owner/cost`
 *
 * Returns the weekly cost snapshot + anomaly list for the Owner
 * Dashboard "Cost Monitor" panel.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     snapshot: CostSnapshot,
 *     anomalies: CostAnomaly[],
 *     proxy: true,   // until real telemetry lands (Phase 4)
 *   }
 *
 * Coordination with S3A: the panel renders snapshot.trend as a sparkline,
 * perUser/perProject as tables, and anomalies as a banner stack. Order is
 * fixed by this module — UI does not re-sort.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../../state/store.js"
import { methodNotAllowed, sendJson } from "../../_helpers.js"
import { CostMonitor } from "../../../../owner/ai/cost-monitor.js"

export interface OwnerCostDeps {
  store: Store
  monitor?: CostMonitor
}

export async function handleOwnerCost(
  req: IncomingMessage,
  res: ServerResponse,
  deps: OwnerCostDeps,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  const monitor = deps.monitor ?? new CostMonitor({ store: deps.store })
  try {
    const snapshot = await monitor.snapshot()
    const anomalies = await monitor.detectAnomalies(snapshot)
    // S3A's renderer expects { weekSpendUsd, series[7], topUsers[], budgetUsd }.
    // Materialize that view here so the SSR can swap mock → real without churn.
    const cost = {
      weekSpendUsd: snapshot.weeklyUsd,
      series: snapshot.trend.map((d) => d.usd),
      topUsers: snapshot.perUser.slice(0, 5).map((u) => ({
        user: u.user,
        spendUsd: u.usd,
        runs: u.runs,
      })),
      budgetUsd: 100,
    }
    return sendJson(res, 200, {
      ok: true,
      cost,
      snapshot,
      anomalies,
      proxy: snapshot.proxy,
    })
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "cost_snapshot_failed",
      message: (err as Error).message,
    })
  }
}
