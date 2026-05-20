import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { sendJson } from "./_helpers.js"

export function handleHealth(res: ServerResponse, store: Store): void {
  const startedAt = new Date(store.getStartedAt()).getTime()
  const uptime = Math.floor((Date.now() - startedAt) / 1000)
  const auth = store.getAuth()
  const prompts = store.getPrompts(1000)
  const today = new Date().toISOString().slice(0, 10)
  const completedToday = prompts.filter(
    (p) =>
      (p.status === "pr_created" || p.status === "completed") &&
      p.updatedAt.slice(0, 10) === today,
  ).length
  const pending = prompts.filter(
    (p) =>
      p.status === "queued" ||
      p.status === "clarifying" ||
      p.status === "generating" ||
      p.status === "awaiting_approval",
  ).length

  sendJson(res, 200, {
    ok: true,
    version: store.getVersion(),
    uptime,
    auth: {
      anthropic: auth.anthropic.connected ? "connected" : "disconnected",
      github: auth.github.connected ? "connected" : "disconnected",
    },
    prompts: {
      pending,
      completed_today: completedToday,
    },
  })
}
