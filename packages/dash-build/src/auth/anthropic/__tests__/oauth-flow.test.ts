import { describe, expect, it, vi } from "vitest"
import { createHash } from "node:crypto"
import {
  ANTHROPIC_CLIENT_ID,
  ANTHROPIC_OAUTH_BASE,
  callbackUrl,
  exchangeCodeForToken,
  startOAuthFlow,
} from "../oauth-flow.js"

function sha256Base64Url(input: string): string {
  return createHash("sha256")
    .update(input)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

describe("startOAuthFlow", () => {
  it("generates an authorize URL with required PKCE + state params", async () => {
    const result = await startOAuthFlow({
      port: 7777,
      redirectAfter: "/dashboard",
    })
    const url = new URL(result.authUrl)
    expect(url.origin + url.pathname).toBe(`${ANTHROPIC_OAUTH_BASE}/authorize`)
    expect(url.searchParams.get("client_id")).toBe(ANTHROPIC_CLIENT_ID)
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("redirect_uri")).toBe(callbackUrl(7777))
    expect(url.searchParams.get("state")).toBe(result.state)
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("code_challenge")).toBeTruthy()
    expect(url.searchParams.get("scope")).toBeTruthy()
  })

  it("derives the code_challenge as S256(pkceVerifier)", async () => {
    const result = await startOAuthFlow({ port: 7777, redirectAfter: "/" })
    const url = new URL(result.authUrl)
    expect(url.searchParams.get("code_challenge")).toBe(
      sha256Base64Url(result.pkceVerifier),
    )
  })

  it("generates a fresh state + verifier on every call", async () => {
    const a = await startOAuthFlow({ port: 7777, redirectAfter: "/" })
    const b = await startOAuthFlow({ port: 7777, redirectAfter: "/" })
    expect(a.state).not.toBe(b.state)
    expect(a.pkceVerifier).not.toBe(b.pkceVerifier)
  })

  it("echoes redirectAfter back to the caller", async () => {
    const result = await startOAuthFlow({
      port: 7777,
      redirectAfter: "/dashboard?welcome=1",
    })
    expect(result.redirectAfter).toBe("/dashboard?welcome=1")
  })

  it("uses the correct localhost callback URL for arbitrary ports", () => {
    expect(callbackUrl(5555)).toBe(
      "http://localhost:5555/api/auth/anthropic/callback",
    )
    expect(callbackUrl(7777)).toBe(
      "http://localhost:7777/api/auth/anthropic/callback",
    )
  })
})

describe("exchangeCodeForToken", () => {
  it("POSTs token endpoint with grant_type=authorization_code + PKCE verifier", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "at-1",
          refresh_token: "rt-1",
          expires_in: 3600,
          token_type: "Bearer",
          user_email: "irfan@dash.id",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )

    const result = await exchangeCodeForToken(
      {
        code: "auth-code-abc",
        state: "state-xyz",
        pkceVerifier: "verifier-123",
        port: 7777,
      },
      fetchMock as unknown as typeof fetch,
    )

    expect(result.access_token).toBe("at-1")
    expect(result.refresh_token).toBe("rt-1")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl, init] = fetchMock.mock.calls[0]!
    expect(calledUrl).toBe(`${ANTHROPIC_OAUTH_BASE}/token`)
    expect((init as RequestInit).method).toBe("POST")
    const body = new URLSearchParams((init as RequestInit).body as string)
    expect(body.get("grant_type")).toBe("authorization_code")
    expect(body.get("code")).toBe("auth-code-abc")
    expect(body.get("code_verifier")).toBe("verifier-123")
    expect(body.get("redirect_uri")).toBe(callbackUrl(7777))
    expect(body.get("client_id")).toBe(ANTHROPIC_CLIENT_ID)
  })

  it("throws on non-2xx with response body included", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("invalid_grant", { status: 401 }))
    await expect(
      exchangeCodeForToken(
        { code: "x", state: "s", pkceVerifier: "v", port: 7777 },
        fetchMock as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/401/)
  })

  it("throws and surfaces 400 errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("bad_request", { status: 400 }))
    await expect(
      exchangeCodeForToken(
        { code: "x", state: "s", pkceVerifier: "v", port: 7777 },
        fetchMock as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/400/)
  })
})
