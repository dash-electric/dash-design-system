import { describe, expect, it } from "vitest"
import {
  ANTHROPIC_CLIENT_ID,
  ANTHROPIC_OAUTH_BASE,
  callbackUrl,
  exchangeCodeForToken,
  startOAuthFlow,
} from "../oauth-flow.js"

// As of May 2026 the subscription OAuth flow is BANNED by Anthropic ToS
// (Feb 2026 update, enforced April 4 2026). These tests pin that
// `startOAuthFlow` and `exchangeCodeForToken` fail loud rather than
// silently returning a working URL/token. PKCE helpers remain in the
// file but the entry points throw — see oauth-flow.ts header.

describe("startOAuthFlow — disabled (ToS ban)", () => {
  it("throws with the ToS-ban message", async () => {
    await expect(
      startOAuthFlow({ port: 7777, redirectAfter: "/dashboard" }),
    ).rejects.toThrow(/banned by Anthropic ToS/i)
  })
})

describe("exchangeCodeForToken — disabled (ToS ban)", () => {
  it("throws with the ToS-ban message", async () => {
    await expect(
      exchangeCodeForToken({
        code: "x",
        state: "s",
        pkceVerifier: "v",
        port: 7777,
      }),
    ).rejects.toThrow(/banned by Anthropic ToS/i)
  })
})

describe("module surface", () => {
  it("does NOT default to the banned Claude Code public OAuth client_id", () => {
    // The previous default was `9d1c250a-e61b-44d9-88ed-5944d1962f5e`.
    // We only assert the default — env-var overrides are a user opt-in.
    const envOverride = process.env.ANTHROPIC_CLIENT_ID
    if (envOverride === undefined) {
      expect(ANTHROPIC_CLIENT_ID).toBe("unset-third-party-oauth-banned")
    } else {
      expect(ANTHROPIC_CLIENT_ID).toBe(envOverride)
    }
  })

  it("preserves OAuth base + callbackUrl helpers for future use", () => {
    expect(ANTHROPIC_OAUTH_BASE).toMatch(/^https?:\/\//)
    expect(callbackUrl(7777)).toBe(
      "http://localhost:7777/api/auth/anthropic/callback",
    )
  })
})
