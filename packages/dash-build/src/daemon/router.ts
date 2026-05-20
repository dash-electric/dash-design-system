import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "./state/store.js"
import type { Broadcaster } from "./ws/broadcaster.js"
import type { Orchestrator } from "../pipeline/orchestrator.js"
import { handleDashboard } from "./routes/dashboard.js"
import { handleHealth } from "./routes/health.js"
import { handleStatus } from "./routes/status.js"
import { handleStatic } from "./routes/static.js"
import { handlePromptsRoute } from "./routes/api/prompts.js"
import { handleReposRoute } from "./routes/api/repos.js"
import { handleAuthRoute } from "./routes/api/auth.js"
import { notFound, sendJson, sendRedirect } from "./routes/_helpers.js"

export interface RouterDeps {
  store: Store
  broadcaster: Broadcaster
  orchestrator?: Orchestrator
}

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RouterDeps,
): Promise<void> {
  const url = req.url ?? "/"
  const queryStart = url.indexOf("?")
  const pathname = queryStart >= 0 ? url.slice(0, queryStart) : url

  try {
    if (pathname === "/") {
      return sendRedirect(res, "/dashboard")
    }
    if (pathname === "/dashboard") {
      return handleDashboard(res, deps.store)
    }
    if (pathname === "/health") {
      return handleHealth(res, deps.store)
    }
    if (pathname === "/api/status") {
      return handleStatus(res, deps.store)
    }
    if (pathname.startsWith("/static/")) {
      return handleStatic(res, pathname)
    }
    if (pathname === "/api/repos") {
      return handleReposRoute(req, res, deps.store)
    }
    if (pathname === "/api/prompt" || pathname.startsWith("/api/prompts/")) {
      return await handlePromptsRoute(
        req,
        res,
        pathname,
        deps.store,
        deps.broadcaster,
        deps.orchestrator,
      )
    }
    if (pathname.startsWith("/api/auth/")) {
      return handleAuthRoute(req, res, pathname, deps.store, deps.broadcaster)
    }
    return notFound(res)
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "internal_error",
      message: (err as Error).message,
    })
  }
}
