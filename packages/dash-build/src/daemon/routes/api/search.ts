/**
 * GET /api/search?q=<query>&limit=<n>
 *
 * Open WebUI-style cross-corpus search endpoint. Delegates to the
 * `searchAll` service which walks Store-resident projects/runs plus the
 * on-disk run artifact bundle. The route layer only validates inputs,
 * defends against abusive limits, and shapes the response envelope.
 *
 * Response shape:
 *
 *   { ok: true, q: string, count: number, results: SearchResult[] }
 *
 * Errors degrade to an empty result list rather than 500 so the modal
 * never shows a broken state for transient IO failures.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { methodNotAllowed, sendJson } from "../_helpers.js"
import { searchAll } from "../../../services/search.js"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const MAX_QUERY_LEN = 256

export async function handleSearchRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)
  // The router strips the query before passing pathname, so we re-parse the
  // original URL for `?q=`/`?limit=`. Using URL with a synthetic origin keeps
  // the parser strict + handles edge cases (missing query, repeated params).
  const url = req.url ?? pathname
  let parsed: URL
  try {
    parsed = new URL(url, "http://internal.invalid")
  } catch {
    return sendJson(res, 200, { ok: true, q: "", count: 0, results: [] })
  }
  const rawQ = parsed.searchParams.get("q") ?? ""
  const q = rawQ.slice(0, MAX_QUERY_LEN).trim()
  const limitParam = parsed.searchParams.get("limit")
  let limit = DEFAULT_LIMIT
  if (limitParam) {
    const n = Number.parseInt(limitParam, 10)
    if (Number.isFinite(n) && n > 0) {
      limit = Math.min(MAX_LIMIT, n)
    }
  }
  if (!q) {
    return sendJson(res, 200, { ok: true, q: "", count: 0, results: [] })
  }
  try {
    const results = await searchAll(store, { query: q, limit })
    return sendJson(res, 200, {
      ok: true,
      q,
      count: results.length,
      results,
    })
  } catch {
    // Defensive — searchAll already swallows expected IO errors, so reaching
    // here means an unexpected exception (corrupt state, etc). Return an
    // empty list so the UI shows "No matches" rather than a network error.
    return sendJson(res, 200, { ok: true, q, count: 0, results: [] })
  }
}

export function isSearchPath(pathname: string): boolean {
  return pathname === "/api/search"
}
