// Anthropic subscription OAuth — DISABLED.
//
// HISTORICAL NOTE: This file previously implemented a raw PKCE flow against
// `claude.ai/oauth/authorize` using Claude Code's public OAuth client_id
// (`9d1c250a-e61b-44d9-88ed-5944d1962f5e`) to obtain Claude Pro/Max
// subscription tokens for third-party use. That pattern was BANNED by
// Anthropic's Consumer Terms of Service update (February 2026, enforced
// April 4 2026):
//
//   "Using OAuth tokens obtained through Claude Free, Pro, or Max accounts
//    in any other product, tool, or service — including the Agent SDK —
//    is not permitted and constitutes a violation of the Consumer Terms
//    of Service."
//
// Tools that continued this pattern (OpenClaw, OpenCode, Roo Code, Goose)
// had their tokens blocked and users risk account suspension.
//
// We keep this file (rather than deleting it) for two reasons:
//   1. Historical reference — git blame stays informative.
//   2. The PKCE helpers below remain useful if Anthropic ever opens a
//      real third-party OAuth program with per-app client registration.
//
// Both `startOAuthFlow` and `exchangeCodeForToken` THROW IMMEDIATELY if
// called. Use BYO API key (see byo-key.ts) or subprocess the official
// `claude` CLI instead.

import { createHash, randomBytes } from "node:crypto"

const DEFAULT_OAUTH_BASE = "https://claude.ai/oauth"

export const ANTHROPIC_OAUTH_BASE =
  process.env.ANTHROPIC_OAUTH_BASE ?? DEFAULT_OAUTH_BASE

// Placeholder. The previous default (Claude Code's public client_id) was
// removed because third-party reuse violates Anthropic ToS. Setting
// ANTHROPIC_CLIENT_ID has no effect — the flow throws regardless.
export const ANTHROPIC_CLIENT_ID =
  process.env.ANTHROPIC_CLIENT_ID ?? "unset-third-party-oauth-banned"

// Scope strings preserved for reference only.
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

const BANNED_MESSAGE =
  "Anthropic subscription OAuth in third-party apps was banned by Anthropic ToS effective April 4 2026. Use BYO API key or subprocess the official `claude` CLI instead."

function sha256Base64Url(input: string): string {
  return createHash("sha256")
    .update(input)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * DISABLED. Throws immediately. See file header.
 *
 * Kept exported so callers fail loud at the call site rather than silently
 * importing an undefined symbol if they were on an older build.
 */
export async function startOAuthFlow(
  _opts: StartOAuthOpts,
): Promise<StartOAuthResult> {
  throw new Error(BANNED_MESSAGE)
  // Unreachable — kept so the PKCE helpers below stay tree-reachable if a
  // future per-app OAuth program ever ships.
  // eslint-disable-next-line no-unreachable
  void sha256Base64Url
  // eslint-disable-next-line no-unreachable
  void randomBytes
}

/**
 * DISABLED. Throws immediately. See file header.
 */
export async function exchangeCodeForToken(
  _opts: CallbackOpts,
  _fetchImpl: typeof fetch = fetch,
): Promise<TokenResponse> {
  throw new Error(BANNED_MESSAGE)
}
