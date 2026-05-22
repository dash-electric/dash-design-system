import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { badRequest, methodNotAllowed, readJsonBody, sendJson } from "../_helpers.js"

const DEFAULT_LOCAL_REPOS = ["dash/portal-v2", "dash/backoffice"] as const

/**
 * GET  /api/repos — list connected GitHub repos or local test targets.
 * POST /api/repos — persist the active local target repo/branch.
 *
 * STUB: Agent D wires the real GitHub App installation list. For now we
 * return what's persisted in the store (set via Agent D's auth callback) and
 * fall back to a curated default list for the demo flow.
 */
export function handleReposRoute(
  req: IncomingMessage,
  res: ServerResponse,
  store: Store,
): void {
  if (req.method === "POST") {
    void (async () => {
      let body: { repo?: string | null; branch?: string | null }
      try {
        body = await readJsonBody<{ repo?: string | null; branch?: string | null }>(req)
      } catch {
        return badRequest(res, "invalid_json_body")
      }
      const repo = typeof body.repo === "string" && body.repo.trim()
        ? body.repo.trim()
        : null
      const branch = typeof body.branch === "string" && body.branch.trim()
        ? body.branch.trim()
        : "main"
      await store.setActiveRepo(repo, branch)
      return sendJson(res, 200, { ok: true, repo, branch })
    })()
    return
  }

  if (req.method !== "GET") return methodNotAllowed(res)
  const auth = store.getAuth()
  const repos = auth.github.repos.length > 0
    ? auth.github.repos
    : [...DEFAULT_LOCAL_REPOS]
  sendJson(res, 200, {
    ok: true,
    connected: auth.github.connected,
    mode: auth.github.connected ? "github-app" : "local-test",
    repos: repos.map((full_name) => ({ full_name })),
  })
}
