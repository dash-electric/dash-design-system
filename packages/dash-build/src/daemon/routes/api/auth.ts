import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import type { Broadcaster } from "../../ws/broadcaster.js"
import {
  methodNotAllowed,
  notFound,
  sendJson,
  sendRedirect,
} from "../_helpers.js"

/**
 * Auth routes — STUBS owned by Agent C (Anthropic OAuth) and Agent D (GitHub App).
 *
 * Today these return a placeholder redirect URL. Agents C/D will replace the
 * inner handlers with the real OAuth dance. The store mutation + WS broadcast
 * patterns are pre-wired so they only need to fill in the token exchange.
 */
export function handleAuthRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  broadcaster: Broadcaster,
): void {
  if (pathname === "/api/auth/status") {
    if (req.method !== "GET") return methodNotAllowed(res)
    return sendJson(res, 200, { ok: true, auth: store.getAuth() })
  }

  if (pathname === "/api/auth/anthropic") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    // Agent C plugs the real OAuth start URL here.
    return sendRedirect(res, "/api/auth/anthropic/callback?stub=1")
  }

  if (pathname === "/api/auth/anthropic/callback") {
    // Stub callback for Agent C
    void store
      .setAuth("anthropic", { connected: false, user: null })
      .then(() => broadcaster.broadcast("auth:changed", { provider: "anthropic" }))
    return sendJson(res, 200, {
      ok: true,
      provider: "anthropic",
      message: "stub — Agent C wires real OAuth",
    })
  }

  if (pathname === "/api/auth/github") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    // Agent D plugs the GitHub App install URL here.
    return sendRedirect(res, "/api/auth/github/callback?stub=1")
  }

  if (pathname === "/api/auth/github/callback") {
    void store
      .setAuth("github", { connected: false, repos: [] })
      .then(() => broadcaster.broadcast("auth:changed", { provider: "github" }))
    return sendJson(res, 200, {
      ok: true,
      provider: "github",
      message: "stub — Agent D wires real GitHub App",
    })
  }

  return notFound(res)
}
