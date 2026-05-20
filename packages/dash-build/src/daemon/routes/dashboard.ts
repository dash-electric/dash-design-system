import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import { renderDashboard } from "../templates/dashboard.js"
import { sendHtml } from "./_helpers.js"

export function handleDashboard(
  res: ServerResponse,
  store: Store,
  orchestrator?: Orchestrator,
): void {
  sendHtml(res, 200, renderDashboard(store, orchestrator))
}
