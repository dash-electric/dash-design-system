// OAuth flow for Anthropic (Claude Pro/Team subscription auth).
//
// Browser-side flow:
//   1. Daemon generates state + PKCE verifier, returns auth URL.
//   2. Browser redirects user to Anthropic OAuth authorize endpoint.
//   3. Anthropic redirects back to localhost callback with `code`.
//   4. Daemon exchanges code for tokens (access + refresh).
//
// Endpoint base is overridable via ANTHROPIC_OAUTH_BASE env so we can flex when
// the actual Anthropic OAuth URL is finalized. See README + auth/anthropic/REA  DME.

import { createHash, randomBytes } from "node:crypto"

const DEFAULT_OAUTH_BASE = "https://claude.ai/oauth"

export const ANTHROPIC_OAUTH_BASE =
  process.env.ANTHROPIC_OAUTH_BASE ?? DEFAULT_OAUTH_BASE

// Claude Code's official public OAuth client_id. Subscription-auth apps
// (9router, etc.) reuse this — Anthropic exposes it as a public client so
// local-callback PKCE flows work without per-app client registration.
export const ANTHROPIC_CLIENT_ID =
  process.env.ANTHROPIC_CLIENT_ID ?? "9d1c250a-e61b-44d9-88ed-5944d1962f5e"

// Scopes used by Claude Code's own login. `org:create_api_key` lets the
// daemon derive an inference-capable token; `user:inference` is the actual
// model-call grant; `user:profile` returns the signed-in email for UX.
export const ANTHROPIC_OAUTH_SCOPE =
  process.env.ANTHROPIC_OAUTH_SCOPE ?? "org:create_api_key user:profile user:inference"

export const callbackUrl = (port: number): string =>
  `http://localhost:${port}/api/auth/anthropic/callback`

export type StartOAuthOpts = {
  port: number
  /** Dashboard URL to redirect the browser to after callback succeeds. */
  redirectAfter: string
}

export type StartOAuthResult = {
  authUrl: string
  /** Opaque CSRF token. Daemon must persist this and verify on callback. */
  state: string
  /** PKCE verifier. Daemon must persist this and pass to exchangeCodeForToken. */
  pkceVerifier: string
  /** Echoed back so caller can persist redirectAfter against the state. */
  redirectAfter: string
}

export type TokenResponse = {
  access_token: string
  refresh_token: string
  /** Lifetime of access token in seconds. */
  expires_in: number
  token_type: "Bearer" | string
  user_email?: string
}

export type CallbackOpts = {
  code: string
  state: string
  /** PKCE verifier the daemon stored when it called startOAuthFlow. */
  pkceVerifier: string
  port: number
}

function sha256Base64Url(input: string): string {
  return createHash("sha256")
    .update(input)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Generate the Anthropic OAuth authorize URL with PKCE + CSRF state.
 *
 * Caller (daemon) must:
 *   - Persist `{ state -> pkceVerifier, redirectAfter }` keyed by state.
 *   - Issue a 302 to `authUrl`.
 *   - On callback, verify the returned `state`, look up pkceVerifier, and call
 *     `exchangeCodeForToken`.
 */
export async function startOAuthFlow(
  opts: StartOAuthOpts,
): Promise<StartOAuthResult> {
  const state = randomBytes(32).toString("hex")
  const pkceVerifier = randomBytes(64).toString("base64url")
  const pkceChallenge = sha256Base64Url(pkceVerifier)

  // `code=true` first — Claude Code login flow signals authorization-code mode
  // via this query param. Order matters for some intermediary CDN caching, so
  // we keep it leading and let URLSearchParams produce the rest.
  const params = new URLSearchParams({
    code: "true",
    client_id: ANTHROPIC_CLIENT_ID,
    response_type: "code",
    redirect_uri: callbackUrl(opts.port),
    scope: ANTHROPIC_OAUTH_SCOPE,
    state,
    code_challenge: pkceChallenge,
    code_challenge_method: "S256",
  })

  return {
    authUrl: `${ANTHROPIC_OAUTH_BASE}/authorize?${params.toString()}`,
    state,
    pkceVerifier,
    redirectAfter: opts.redirectAfter,
  }
}

/**
 * Exchange an authorization code for access + refresh tokens.
 *
 * The caller is responsible for verifying that `opts.state` matches the state
 * we issued before reaching this function — we don't re-check here because the
 * pkceVerifier lookup at the call site already proves possession of the state.
 */
export async function exchangeCodeForToken(
  opts: CallbackOpts,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenResponse> {
  const response = await fetchImpl(`${ANTHROPIC_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: opts.code,
      redirect_uri: callbackUrl(opts.port),
      client_id: ANTHROPIC_CLIENT_ID,
      code_verifier: opts.pkceVerifier,
    }).toString(),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${response.statusText} ${body}`,
    )
  }

  return (await response.json()) as TokenResponse
}
