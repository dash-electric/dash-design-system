import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { sendJson } from "./_helpers.js"

export function handleStatus(res: ServerResponse, store: Store): void {
  const startedAt = new Date(store.getStartedAt()).getTime()
  const uptime = Math.floor((Date.now() - startedAt) / 1000)
  sendJson(res, 200, {
    ok: true,
    version: store.getVersion(),
    uptime,
    startedAt: store.getStartedAt(),
    auth: store.getAuth(),
    workspace: store.getWorkspace(),
    prompts: {
      total: store.getPrompts(1000).length,
      recent: store.getPrompts(5),
    },
  })
}
