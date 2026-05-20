import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { methodNotAllowed, sendJson } from "../_helpers.js"

/**
 * GET /api/repos — list connected GitHub repos.
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
  if (req.method !== "GET") return methodNotAllowed(res)
  const auth = store.getAuth()
  const repos = auth.github.repos.length > 0
    ? auth.github.repos
    : [
        // demo-only fallback; replaced once Agent D ships GitHub App install flow
        "dash/halo-dash-fe",
        "dash/portal-v2",
        "dash/backoffice",
      ]
  sendJson(res, 200, {
    ok: true,
    connected: auth.github.connected,
    repos: repos.map((full_name) => ({ full_name })),
  })
}
