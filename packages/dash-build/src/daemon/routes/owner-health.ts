/**
 * Tier 6 — Owner Dashboard standalone health probe.
 *
 * Mirrors the shape of `/health` but scoped to the Owner surface so admins
 * who deploy `/owner` at a different port / behind a reverse proxy can hit
 * a dedicated liveness endpoint. Useful for status-page or uptime checks
 * that should NOT include Build-side pipeline state.
 *
 * Response:
 *   {
 *     ok: true,
 *     surface: "owner",
 *     uptime: number,        // seconds
 *     version: string,
 *     ownerRootUrl: string | null,
 *     branches: number,      // count of `dash-build/*` branches in queue
 *     activity: number,      // recent activity events
 *   }
 *
 * The exact metric mix is intentionally small — health endpoints should be
 * cheap. Heavier diagnostics belong on `/owner` itself.
 */

import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { sendJson } from "./_helpers.js"
import { loadOwnerRuntimeConfig } from "../../constants/owner.js"

export function handleOwnerHealth(res: ServerResponse, store: Store): void {
  const startedAt = new Date(store.getStartedAt()).getTime()
  const uptime = Math.floor((Date.now() - startedAt) / 1000)
  const snapshot = store.snapshot()
  const cfg = loadOwnerRuntimeConfig()

  // Branches count = the number of completed/awaiting-review runs that
  // could surface in the Owner queue. We deliberately use the runs feed
  // rather than computing fresh PR queries — the health probe must NOT
  // make outbound network calls.
  const branches = snapshot.runs.filter(
    (r) =>
      r.status === "completed" ||
      r.status === "pr_created" ||
      r.status === "awaiting_approval",
  ).length

  sendJson(res, 200, {
    ok: true,
    surface: "owner",
    uptime,
    version: store.getVersion(),
    ownerRootUrl: cfg.ownerRootUrl,
    branches,
    activity: snapshot.runs.length,
  })
}
