import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { renderDashboard } from "../templates/dashboard.js"
import { sendHtml } from "./_helpers.js"

export function handleDashboard(res: ServerResponse, store: Store): void {
  sendHtml(res, 200, renderDashboard(store))
}
