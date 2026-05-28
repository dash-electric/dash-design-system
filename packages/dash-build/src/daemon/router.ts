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
import { handleOwnerHealth } from "./routes/owner-health.js"
import { handleHealth } from "./routes/health.js"
import { handleStatus } from "./routes/status.js"
import { handleStatic } from "./routes/static.js"
import { handlePromptsRoute } from "./routes/api/prompts.js"
import { handleReposRoute } from "./routes/api/repos.js"
import { handleAuthRoute } from "./routes/api/auth.js"
import { handleOpenAIReconnectRoute } from "./routes/api/auth/reconnect.js"
import { handleRepoPreviewRoute } from "./routes/api/repo-preview.js"
import { handleProjectsRoute, isProjectsPath } from "./routes/api/projects.js"
import {
  handleRunsMutationRoute,
  isRunsMutationPath,
} from "./routes/api/runs.js"
import { handleSearchRoute, isSearchPath } from "./routes/api/search.js"
import { handleSandboxRoute, isSandboxPath } from "./routes/api/sandbox.js"
import {
  handlePreviewApiRoute,
  isPreviewApiPath,
} from "./routes/api/preview.js"
import { notFound, sendJson, sendRedirect } from "./routes/_helpers.js"
import { handlePreviewRoute } from "../preview/api-routes.js"
import { handleBridgeRoute, isBridgePath } from "./routes/api/bridge.js"
import { handleOwnerBranches } from "./routes/api/owner/branches.js"
import { handleOwnerCost } from "./routes/api/owner/cost.js"
import { handleOwnerDSCandidates } from "./routes/api/owner/ds-candidates.js"
import { handleOwnerActivity } from "./routes/api/owner/activity.js"
import { handleDSCandidates } from "./routes/api/ds-candidates.js"
import { handleExportRoute, isExportPath } from "./routes/api/export.js"
import { handleThemesRoute, isThemesPath } from "./routes/api/themes.js"
import { handleDocsRoute, isDocsApiPath } from "./routes/api/docs.js"
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
      return await handleWorkspace(res, deps.store, workspaceRunId(pathname))
    }
    if (pathname === "/dashboard") {
      // Tier 2 #6 — legacy `/dashboard` redirect. The 2026-05-28 pivot moved
      // the canonical builder surface to `/` (home) + `/workspace/:runId`.
      // Legacy callers that still GET `/dashboard` directly land on home.
      // Internal `?legacy=1` escape hatch keeps the classic prompt-list page
      // reachable for the owner-page "Build" tab and ad-hoc debugging.
      const qs = url.indexOf("?") >= 0 ? url.slice(url.indexOf("?") + 1) : ""
      if (qs.split("&").includes("legacy=1")) {
        return handleDashboard(res, deps.store, deps.orchestrator)
      }
      return sendRedirect(res, "/")
    }
    if (pathname === "/owner") {
      return await handleOwner(res, deps.store)
    }
    // Tier 6 — Owner standalone health probe. Lives under `/owner/*` so a
    // reverse proxy that only forwards the Owner surface still gets a
    // liveness endpoint.
    if (pathname === "/owner/health") {
      return handleOwnerHealth(res, deps.store)
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
    // Open WebUI #A4 — variant picker mutation. MUST come before isProjectsPath
    // because that handler matches any GET /api/runs/* — without this guard
    // POST /api/runs/:id/pick-variant would 405 from the projects handler.
    if (isRunsMutationPath(pathname)) {
      return await handleRunsMutationRoute(
        req,
        res,
        pathname,
        deps.orchestrator,
      )
    }
    if (isProjectsPath(pathname)) {
      return handleProjectsRoute(req, res, pathname, deps.store)
    }
    if (isSearchPath(pathname)) {
      return await handleSearchRoute(req, res, pathname, deps.store)
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
    // Tier 6 — content-based DS candidate scanner (complements the
    // name-based `/api/owner/ds-candidates` surface above).
    if (pathname === "/api/ds-candidates") {
      return await handleDSCandidates(req, res, { store: deps.store })
    }
    // Tier 6 — PPT/HTML deck export per run.
    if (isExportPath(pathname)) {
      return await handleExportRoute(req, res, pathname, deps.store)
    }
    // Tier 6 — Layer 2 theme runtime switcher endpoints.
    if (isThemesPath(pathname)) {
      return await handleThemesRoute(req, res, pathname)
    }
    // Open WebUI #A2 — `#` document-attach autocomplete + body endpoints.
    // Surfaces indexed markdown docs (vault + repo) so the composer can
    // inject them into the LLM prompt as referenced context.
    if (isDocsApiPath(pathname)) {
      return await handleDocsRoute(req, res, pathname, url)
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
