/**
 * Sprint 1A — sandbox bootstrap + status routes.
 *
 *   POST /api/sandbox/bootstrap?repo=<full_name>
 *     Trigger a best-effort workspace bootstrap (clone + shim + npm install)
 *     for the given consumer repo. Returns the current sandbox state once
 *     the bootstrap kick has been scheduled. The actual clone work happens
 *     asynchronously; clients should subscribe to `sandbox:changed`
 *     broadcasts (or poll GET /api/sandbox/status) for the terminal state.
 *
 *   GET  /api/sandbox/status?repo=<full_name>
 *     Read the persisted SandboxStatePersisted snapshot for one repo. Returns
 *     `{ ok: true, state: null }` if no entry exists yet (i.e. clean).
 *
 *   POST /api/sandbox/restart-dev?repo=<full_name>
 *     F3 — stop + restart the workspace dev server (idle → clone_running).
 *     Used by the UI retry button after a `sandbox:dev_server_failed`
 *     broadcast. Fire-and-forget; the orchestrator broadcasts dev-server
 *     lifecycle events the dashboard listens to.
 *
 * All routes treat the orchestrator as optional — if the daemon hasn't
 * mounted an orchestrator yet (extremely rare boot path) we 503 instead of
 * crashing. Repo arg is validated via the repo-preview manifest so callers
 * can't trigger arbitrary clones.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import type { Orchestrator } from "../../../pipeline/orchestrator.js"
import { isRepoPreviewAllowed } from "../../repo-preview.js"
import {
  badRequest,
  methodNotAllowed,
  sendJson,
} from "../_helpers.js"

export function isSandboxPath(pathname: string): boolean {
  return (
    pathname === "/api/sandbox/bootstrap" ||
    pathname === "/api/sandbox/status" ||
    pathname === "/api/sandbox/restart-dev"
  )
}

export async function handleSandboxRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  orchestrator?: Orchestrator,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost")
  const repoRaw = url.searchParams.get("repo")
  const repo = repoRaw?.trim() || null

  if (pathname === "/api/sandbox/status") {
    if (req.method !== "GET") return methodNotAllowed(res)
    if (!repo) return badRequest(res, "repo_required")
    if (!isRepoPreviewAllowed(repo)) return badRequest(res, "unsupported_repo")
    const state = readSandboxStateSafe(store, repo)
    return sendJson(res, 200, { ok: true, repo, state })
  }

  if (pathname === "/api/sandbox/bootstrap") {
    if (req.method !== "POST") return methodNotAllowed(res)
    if (!repo) return badRequest(res, "repo_required")
    if (!isRepoPreviewAllowed(repo)) return badRequest(res, "unsupported_repo")
    if (!orchestrator) {
      return sendJson(res, 503, {
        ok: false,
        error: "orchestrator_not_ready",
      })
    }
    // Fire-and-forget — the bootstrap is best-effort and broadcasts state via
    // `sandbox:changed`. We immediately return the current snapshot so the
    // UI can flip to a busy state without waiting for the (potentially long)
    // clone+install to complete.
    void orchestrator.ensureWorkspaceBootstrap(repo).catch(() => {
      /* errors surface via sandbox:changed + persisted state */
    })
    const state = readSandboxStateSafe(store, repo)
    return sendJson(res, 202, { ok: true, repo, state, scheduled: true })
  }

  if (pathname === "/api/sandbox/restart-dev") {
    if (req.method !== "POST") return methodNotAllowed(res)
    if (!repo) return badRequest(res, "repo_required")
    if (!isRepoPreviewAllowed(repo)) return badRequest(res, "unsupported_repo")
    if (!orchestrator) {
      return sendJson(res, 503, {
        ok: false,
        error: "orchestrator_not_ready",
      })
    }
    // Fire-and-forget — restart broadcasts sandbox:dev_server_starting /
    // _ready / _failed lifecycle events the UI listens to. We immediately
    // return the current snapshot so the badge can swap into the loading
    // tone without waiting for the dev server spin-up.
    const restart = (orchestrator as unknown as {
      restartDevServer?: (r: string) => Promise<unknown>
    }).restartDevServer
    if (typeof restart === "function") {
      void restart.call(orchestrator, repo).catch(() => {
        /* errors surface via sandbox:dev_server_failed broadcast */
      })
    }
    const state = readSandboxStateSafe(store, repo)
    return sendJson(res, 202, { ok: true, repo, state, scheduled: true })
  }

  return sendJson(res, 404, { ok: false, error: "not_found" })
}

function readSandboxStateSafe(
  store: Store,
  repo: string,
): unknown | null {
  const get = (store as unknown as {
    getSandboxState?: (r: string) => unknown
  }).getSandboxState
  if (typeof get !== "function") return null
  try {
    return get.call(store, repo) ?? null
  } catch {
    return null
  }
}
