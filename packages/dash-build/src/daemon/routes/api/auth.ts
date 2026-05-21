import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import type { Broadcaster } from "../../ws/broadcaster.js"
import {
  badRequest,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendJson,
  sendRedirect,
} from "../_helpers.js"
import {
  exchangeCodeForToken,
  startOAuthFlow,
} from "../../../auth/anthropic/oauth-flow.js"
import { AnthropicTokenStore } from "../../../auth/anthropic/token-store.js"

/**
 * Auth routes.
 *
 * Anthropic OAuth = raw PKCE S256 flow against `claude.ai/oauth/authorize`,
 * reusing Claude Code's public client_id. This mirrors the 9router pattern
 * for subscription-based auth — no per-app client registration with
 * Anthropic is required.
 *
 * Two callback paths are supported:
 *   1. Automatic — Anthropic redirects browser back to
 *      /api/auth/anthropic/callback with ?code= and ?state= query params.
 *   2. Manual — user copies the post-authorize URL from their browser and
 *      pastes it into the dashboard. POST /api/auth/anthropic/manual-callback
 *      with body { url }. Same code/state parsed out of the URL.
 *
 * GitHub App flow remains a stub for Wave 5 (per-user pilot grant).
 */

const PORT = Number(process.env.DASH_BUILD_PORT ?? 7777)

/**
 * Pending OAuth state map. Key = CSRF state string, value = { pkceVerifier,
 * expiresAt }. Lives in memory — daemon restart kills any in-flight login
 * and the user just clicks "Sign in" again.
 */
const pending = new Map<string, { pkceVerifier: string; expiresAt: number }>()
const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function gcPending(): void {
  const now = Date.now()
  for (const [k, v] of pending) {
    if (v.expiresAt < now) pending.delete(k)
  }
}

function makeTokenStore(): AnthropicTokenStore {
  return new AnthropicTokenStore()
}

async function completeOAuth(
  params: { code: string; state: string },
  store: Store,
  broadcaster: Broadcaster,
): Promise<{ ok: true; email?: string } | { ok: false; error: string }> {
  gcPending()
  const slot = pending.get(params.state)
  if (!slot) {
    return { ok: false, error: "unknown_or_expired_state" }
  }
  pending.delete(params.state)

  let token: Awaited<ReturnType<typeof exchangeCodeForToken>>
  try {
    token = await exchangeCodeForToken({
      code: params.code,
      state: params.state,
      pkceVerifier: slot.pkceVerifier,
      port: PORT,
    })
  } catch (err) {
    return {
      ok: false,
      error: `token_exchange_failed: ${(err as Error).message}`,
    }
  }

  const tokenStore = makeTokenStore()
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()
  await tokenStore.save({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    user_email: token.user_email ?? "",
  })

  await store.setAuth("anthropic", {
    connected: true,
    user: token.user_email ?? null,
  })
  broadcaster.broadcast("auth:changed", { provider: "anthropic" })

  return { ok: true, email: token.user_email }
}

export function handleAuthRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  broadcaster: Broadcaster,
): void {
  // ── Status ─────────────────────────────────────────────────────────────
  if (pathname === "/api/auth/status") {
    if (req.method !== "GET") return methodNotAllowed(res)
    return sendJson(res, 200, { ok: true, auth: store.getAuth() })
  }

  // ── Anthropic: start OAuth ─────────────────────────────────────────────
  // Default behaviour: 302 the browser straight to claude.ai. Programmatic
  // clients that want the authUrl as JSON (e.g. tests, custom UIs that want
  // to open a popup) can pass `?format=json`.
  if (pathname === "/api/auth/anthropic") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    const reqUrl = new URL(req.url ?? "/", `http://localhost:${PORT}`)
    const wantsJson = reqUrl.searchParams.get("format") === "json"
    void (async () => {
      const flow = await startOAuthFlow({
        port: PORT,
        redirectAfter: "/dashboard",
      })
      pending.set(flow.state, {
        pkceVerifier: flow.pkceVerifier,
        expiresAt: Date.now() + STATE_TTL_MS,
      })
      if (wantsJson) {
        sendJson(res, 200, {
          ok: true,
          provider: "anthropic",
          authUrl: flow.authUrl,
          state: flow.state,
          manualCallbackHint:
            "If the redirect lands somewhere other than this dashboard, copy the full URL and POST it to /api/auth/anthropic/manual-callback as { url }.",
        })
      } else {
        sendRedirect(res, flow.authUrl)
      }
    })()
    return
  }

  // ── Anthropic: automatic browser callback ──────────────────────────────
  if (pathname === "/api/auth/anthropic/callback") {
    if (req.method !== "GET") return methodNotAllowed(res)
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    if (!code || !state) {
      return sendRedirect(res, "/dashboard?auth_error=missing_code_or_state")
    }
    void completeOAuth({ code, state }, store, broadcaster).then((result) => {
      if (result.ok) {
        sendRedirect(res, "/dashboard?auth=anthropic_ok")
      } else {
        sendRedirect(
          res,
          `/dashboard?auth_error=${encodeURIComponent(result.error)}`,
        )
      }
    })
    return
  }

  // ── Anthropic: manual callback paste (fallback) ────────────────────────
  if (pathname === "/api/auth/anthropic/manual-callback") {
    if (req.method !== "POST") return methodNotAllowed(res)
    void (async () => {
      let body: { url?: string }
      try {
        body = await readJsonBody<{ url?: string }>(req)
      } catch {
        return badRequest(res, "invalid_json_body")
      }
      if (!body.url) return badRequest(res, "missing_url_field")
      let parsed: URL
      try {
        parsed = new URL(body.url)
      } catch {
        return badRequest(res, "invalid_url")
      }
      const code = parsed.searchParams.get("code")
      const state = parsed.searchParams.get("state")
      if (!code || !state) {
        return badRequest(res, "url_missing_code_or_state")
      }
      const result = await completeOAuth({ code, state }, store, broadcaster)
      if (result.ok) {
        sendJson(res, 200, { ok: true, email: result.email ?? null })
      } else {
        sendJson(res, 400, { ok: false, error: result.error })
      }
    })()
    return
  }

  // ── Anthropic: sign-out ────────────────────────────────────────────────
  if (pathname === "/api/auth/anthropic/signout") {
    if (req.method !== "POST") return methodNotAllowed(res)
    void (async () => {
      await makeTokenStore().clear().catch(() => undefined)
      await store.setAuth("anthropic", { connected: false, user: null })
      broadcaster.broadcast("auth:changed", { provider: "anthropic" })
      sendJson(res, 200, { ok: true })
    })()
    return
  }

  // ── GitHub: still stub (Wave 5 = per-user pilot grant) ─────────────────
  if (pathname === "/api/auth/github") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    return sendRedirect(res, "/api/auth/github/callback?stub=1")
  }

  if (pathname === "/api/auth/github/callback") {
    void store
      .setAuth("github", { connected: false, repos: [] })
      .then(() => broadcaster.broadcast("auth:changed", { provider: "github" }))
    return sendJson(res, 200, {
      ok: true,
      provider: "github",
      message: "github_app_stub_pending_per_user_pilot_grant",
    })
  }

  return notFound(res)
}

// Test hook — clears in-memory pending state.
export function __resetAuthPendingStateForTests(): void {
  pending.clear()
}
