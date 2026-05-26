import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { methodNotAllowed, notFound, sendJson } from "../_helpers.js"

/**
 * Read-only Project / Thread / Run inspection endpoints (P1.0 slice).
 *
 *   GET /api/projects                       — list all projects
 *   GET /api/projects/:id                   — project + threads + recent runs
 *   GET /api/projects/:id/threads           — threads for project
 *   GET /api/threads/:id                    — thread + runs
 *   GET /api/threads/:id/runs               — runs for thread
 *   GET /api/runs/:id                       — single run record
 *
 * Mutations still flow through /api/prompt + /api/prompts/:id endpoints.
 */
export function handleProjectsRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
): void {
  if (req.method !== "GET") return methodNotAllowed(res)

  if (pathname === "/api/projects") {
    return sendJson(res, 200, {
      ok: true,
      projects: store.getProjects(),
    })
  }

  const projectMatch = pathname.match(/^\/api\/projects\/([A-Za-z0-9_-]+)(\/threads)?$/)
  if (projectMatch) {
    const id = projectMatch[1]!
    const project = store.getProject(id)
    if (!project) return notFound(res)
    const threads = store.getThreads(id)
    if (projectMatch[2] === "/threads") {
      return sendJson(res, 200, { ok: true, threads })
    }
    const runs = threads.flatMap((t) => store.getRuns(t.id))
    return sendJson(res, 200, {
      ok: true,
      project,
      threads,
      runs,
    })
  }

  const threadMatch = pathname.match(/^\/api\/threads\/([A-Za-z0-9_-]+)(\/runs)?$/)
  if (threadMatch) {
    const id = threadMatch[1]!
    const thread = store.getThread(id)
    if (!thread) return notFound(res)
    const runs = store.getRuns(id)
    if (threadMatch[2] === "/runs") {
      return sendJson(res, 200, { ok: true, runs })
    }
    return sendJson(res, 200, { ok: true, thread, runs })
  }

  const runMatch = pathname.match(/^\/api\/runs\/([A-Za-z0-9_-]+)$/)
  if (runMatch) {
    const run = store.getRun(runMatch[1]!)
    if (!run) return notFound(res)
    return sendJson(res, 200, { ok: true, run })
  }

  return notFound(res)
}

export function isProjectsPath(pathname: string): boolean {
  return (
    pathname === "/api/projects" ||
    pathname.startsWith("/api/projects/") ||
    pathname.startsWith("/api/threads/") ||
    pathname.startsWith("/api/runs/")
  )
}
