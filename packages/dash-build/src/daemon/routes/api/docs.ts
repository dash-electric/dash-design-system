/**
 * Doc autocomplete + body endpoints — Open WebUI `#` adoption (Sub-task 1).
 *
 *   GET /api/docs?q=<prefix>&limit=10  → autocomplete list
 *   GET /api/docs/:id                  → full doc body
 *
 * Wired from `router.ts`:
 *
 *   if (isDocsApiPath(pathname)) {
 *     return await handleDocsRoute(req, res, pathname, url)
 *   }
 *
 * Roots are resolved via `DASH_BUILD_DOC_ROOTS` env (comma-separated abs
 * paths) or defaults baked into `doc-index.ts`. The index is built lazily
 * on the first request and cached for 5min.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import { methodNotAllowed, notFound, sendJson } from "../_helpers.js"
import { queryDocs, readDocBody } from "../../../services/doc-index.js"

const DOC_ID_RE = /^[a-f0-9]{8,64}$/

export function isDocsApiPath(pathname: string): boolean {
  return pathname === "/api/docs" || /^\/api\/docs\/[a-f0-9]{8,64}$/.test(pathname)
}

function parseQuery(url: string): { q: string; limit: number } {
  const qIdx = url.indexOf("?")
  if (qIdx < 0) return { q: "", limit: 10 }
  const search = url.slice(qIdx + 1)
  const params = new URLSearchParams(search)
  const q = (params.get("q") ?? "").trim()
  const rawLimit = params.get("limit")
  const parsed = rawLimit ? Number(rawLimit) : NaN
  const limit = Number.isFinite(parsed) ? Math.max(1, Math.min(50, parsed)) : 10
  return { q, limit }
}

/**
 * Main handler. `url` carries the query string; `pathname` is pre-stripped
 * by the router. Both are required because the autocomplete endpoint reads
 * the query and the body endpoint needs only the id from the path.
 */
export async function handleDocsRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  url: string,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  if (pathname === "/api/docs") {
    const { q, limit } = parseQuery(url)
    try {
      const docs = await queryDocs({ q, limit })
      return sendJson(res, 200, { ok: true, docs })
    } catch (err) {
      return sendJson(res, 500, {
        ok: false,
        error: "doc_index_failed",
        message: (err as Error).message,
      })
    }
  }

  const match = pathname.match(/^\/api\/docs\/([a-f0-9]{8,64})$/)
  if (!match) return notFound(res)
  const id = match[1]!
  if (!DOC_ID_RE.test(id)) return notFound(res)
  try {
    const doc = await readDocBody(id)
    if (!doc) return notFound(res)
    return sendJson(res, 200, { ok: true, doc })
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "doc_read_failed",
      message: (err as Error).message,
    })
  }
}
