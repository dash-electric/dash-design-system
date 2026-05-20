// Refresh logic: auto-rotate access tokens before they expire.
// On refresh failure, the store is cleared so the next call forces re-auth.

import {
  ANTHROPIC_CLIENT_ID,
  ANTHROPIC_OAUTH_BASE,
  type TokenResponse,
} from "./oauth-flow.js"
import type { AnthropicTokenStore, StoredTokens } from "./token-store.js"

/** Refresh if access_token expires within REFRESH_BUFFER_MS. */
export const REFRESH_BUFFER_MS = 5 * 60 * 1000

export async function refreshIfExpired(
  tokens: StoredTokens,
  store: AnthropicTokenStore,
  fetchImpl: typeof fetch = fetch,
): Promise<StoredTokens> {
  const expiresAt = new Date(tokens.expires_at).getTime()
  if (Number.isFinite(expiresAt) && expiresAt - Date.now() > REFRESH_BUFFER_MS) {
    return tokens
  }

  let response: Response
  try {
    response = await fetchImpl(`${ANTHROPIC_OAUTH_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        client_id: ANTHROPIC_CLIENT_ID,
      }).toString(),
    })
  } catch (err) {
    // Network failure: don't wipe the store — caller can retry.
    throw new Error(
      `Token refresh network error: ${(err as Error).message}. Will retry on next call.`,
    )
  }

  if (!response.ok) {
    await store.clear()
    const body = await response.text().catch(() => "")
    throw new Error(
      `Token refresh failed: ${response.status} ${response.statusText} ${body}. Re-authentication required.`,
    )
  }

  const fresh = (await response.json()) as TokenResponse
  const stored: StoredTokens = {
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token ?? tokens.refresh_token,
    expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
    user_email: fresh.user_email ?? tokens.user_email,
  }
  await store.save(stored)
  return stored
}
