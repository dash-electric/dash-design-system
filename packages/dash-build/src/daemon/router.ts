import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "./state/store.js"
import type { Broadcaster } from "./ws/broadcaster.js"
import type { Orchestrator } from "../pipeline/orchestrator.js"
import { handleDashboard } from "./routes/dashboard.js"
import {
  handleHome,
  handleWorkspace,
  isWorkspacePath,
  workspaceRunId,
} from "./routes/home.js"
import { handleOwner } from "./routes/owner.js"
import { handleHealth } from "./routes/health.js"
import { handleStatus } from "./routes/status.js"
import { handleStatic } from "./routes/static.js"
import { handlePromptsRoute } from "./routes/api/prompts.js"
import { handleReposRoute } from "./routes/api/repos.js"
import { handleAuthRoute } from "./routes/api/auth.js"
import { handleOpenAIReconnectRoute } from "./routes/api/auth/reconnect.js"
import { handleRepoPreviewRoute } from "./routes/api/repo-preview.js"
import { handleProjectsRoute, isProjectsPath } from "./routes/api/projects.js"
import { handleSandboxRoute, isSandboxPath } from "./routes/api/sandbox.js"
import {
  handlePreviewApiRoute,
  isPreviewApiPath,
} from "./routes/api/preview.js"
import { notFound, sendJson } from "./routes/_helpers.js"
import { handlePreviewRoute } from "../preview/api-routes.js"
import { handleBridgeRoute, isBridgePath } from "./routes/api/bridge.js"
import { handleOwnerBranches } from "./routes/api/owner/branches.js"
import { handleOwnerCost } from "./routes/api/owner/cost.js"
import { handleOwnerDSCandidates } from "./routes/api/owner/ds-candidates.js"
import { handleOwnerActivity } from "./routes/api/owner/activity.js"
import type { AutoReconnect } from "../auth/openai/auto-reconnect.js"

export interface RouterDeps {
  store: Store
  broadcaster: Broadcaster
  orchestrator?: Orchestrator
  autoReconnect?: AutoReconnect | null
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
      return handleHome(res, deps.store)
    }
    if (pathname === "/home") {
      return handleHome(res, deps.store)
    }
    if (isWorkspacePath(pathname)) {
      return handleWorkspace(res, deps.store, workspaceRunId(pathname))
    }
    if (pathname === "/dashboard") {
      return handleDashboard(res, deps.store, deps.orchestrator)
    }
    if (pathname === "/owner") {
      return await handleOwner(res, deps.store)
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
    if (
      pathname === "/api/prompt" ||
      pathname === "/api/prompts/reset" ||
      pathname.startsWith("/api/prompts/")
    ) {
      return await handlePromptsRoute(
        req,
        res,
        pathname,
        deps.store,
        deps.broadcaster,
        deps.orchestrator,
      )
    }
    if (pathname === "/api/auth/openai/reconnect") {
      return await handleOpenAIReconnectRoute(req, res, deps.autoReconnect ?? null)
    }
    if (pathname.startsWith("/api/auth/")) {
      return handleAuthRoute(req, res, pathname, deps.store, deps.broadcaster)
    }
    if (pathname === "/api/repo-preview" || pathname === "/api/repo-preview/start") {
      return await handleRepoPreviewRoute(req, res, pathname, deps.store)
    }
    if (isProjectsPath(pathname)) {
      return handleProjectsRoute(req, res, pathname, deps.store)
    }
    if (isSandboxPath(pathname)) {
      return await handleSandboxRoute(
        req,
        res,
        pathname,
        deps.store,
        deps.orchestrator,
      )
    }
    if (isPreviewApiPath(pathname)) {
      return await handlePreviewApiRoute(req, res, pathname)
    }
    if (pathname.startsWith("/preview/")) {
      return await handlePreviewRoute(req, res, pathname)
    }
    if (isBridgePath(pathname)) {
      return handleBridgeRoute(req, res, pathname)
    }
    // Sprint 3B — Owner Co-pilot AI triage endpoints.
    // S3A's UI shell consumes these — keep response shapes stable.
    if (pathname === "/api/owner/branches") {
      return await handleOwnerBranches(req, res, { store: deps.store })
    }
    if (pathname === "/api/owner/cost") {
      return await handleOwnerCost(req, res, { store: deps.store })
    }
    if (pathname === "/api/owner/ds-candidates") {
      return await handleOwnerDSCandidates(req, res, { store: deps.store })
    }
    if (pathname === "/api/owner/activity") {
      return await handleOwnerActivity(req, res, { store: deps.store })
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
