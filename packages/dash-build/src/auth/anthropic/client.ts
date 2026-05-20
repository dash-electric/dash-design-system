// Authenticated Anthropic client wrapper.
//
// Resolution order:
//   1. OAuth tokens (Pro/Team subscription) — preferred, zero API key.
//   2. BYO API key — fallback when OAuth not connected.
//   3. Throw — caller must run OAuth flow or paste API key.
//
// We keep `@anthropic-ai/sdk` as an OPTIONAL peer dep. The wrapper returns
// credentials + headers that the caller can plug into any Anthropic SDK
// version it uses. If the SDK is installed, `buildSdkClient()` constructs one
// via dynamic import so this package doesn't force a transitive dep.

import { BYOKeyStore } from "./byo-key.js"
import { refreshIfExpired } from "./refresh.js"
import {
  AnthropicTokenStore,
  type AnthropicTokenStoreOptions,
  type StoredTokens,
} from "./token-store.js"

export type AnthropicCredentials =
  | {
      kind: "oauth"
      accessToken: string
      userEmail: string
      expiresAt: string
      headers: Record<string, string>
    }
  | {
      kind: "api-key"
      apiKey: string
      headers: Record<string, string>
    }

export type AuthenticatedClientOptions = AnthropicTokenStoreOptions & {
  /** Inject custom fetch (used in tests for refresh). */
  fetchImpl?: typeof fetch
  /** Inject custom BYO key store (used in tests). */
  byoStore?: BYOKeyStore
  /** Inject custom OAuth store (used in tests). */
  oauthStore?: AnthropicTokenStore
}

export class AuthenticatedAnthropicClient {
  private readonly oauthStore: AnthropicTokenStore
  private readonly byoStore: BYOKeyStore
  private readonly fetchImpl: typeof fetch

  constructor(opts: AuthenticatedClientOptions = {}) {
    this.oauthStore = opts.oauthStore ?? new AnthropicTokenStore(opts)
    this.byoStore = opts.byoStore ?? new BYOKeyStore(opts)
    this.fetchImpl = opts.fetchImpl ?? fetch
  }

  /** True if either OAuth tokens or a BYO key are stored. */
  async isConnected(): Promise<boolean> {
    const tokens = await this.oauthStore.load().catch(() => null)
    if (tokens) return true
    const key = await this.byoStore.load().catch(() => null)
    return key !== null
  }

  /** Resolve credentials, refreshing OAuth tokens if needed. */
  async getCredentials(): Promise<AnthropicCredentials> {
    let tokens: StoredTokens | null = null
    try {
      tokens = await this.oauthStore.load()
    } catch {
      // Corrupt store: fall through to BYO key.
      tokens = null
    }

    if (tokens) {
      const fresh = await refreshIfExpired(tokens, this.oauthStore, this.fetchImpl)
      return {
        kind: "oauth",
        accessToken: fresh.access_token,
        userEmail: fresh.user_email,
        expiresAt: fresh.expires_at,
        headers: {
          Authorization: `Bearer ${fresh.access_token}`,
          "anthropic-beta": "oauth-2025-04-20",
        },
      }
    }

    const apiKey = await this.byoStore.load()
    if (apiKey) {
      return {
        kind: "api-key",
        apiKey,
        headers: { "x-api-key": apiKey },
      }
    }

    throw new Error(
      "Anthropic not authenticated. Connect via OAuth (Pro/Team subscription) or paste an API key in dashboard settings.",
    )
  }

  /**
   * Build an Anthropic SDK client if `@anthropic-ai/sdk` is installed.
   * Returns `null` and lets caller decide if the SDK is unavailable.
   */
  async buildSdkClient(): Promise<unknown> {
    const creds = await this.getCredentials()
    type AnthropicCtor = new (config: Record<string, unknown>) => unknown
    let mod: { default?: AnthropicCtor } & { Anthropic?: AnthropicCtor }
    try {
      // Dynamic import keeps @anthropic-ai/sdk optional — it's not declared in
      // package.json dependencies, callers install it themselves if needed.
      // @ts-expect-error optional peer dep not in deps; resolved at runtime.
      mod = (await import("@anthropic-ai/sdk")) as typeof mod
    } catch {
      throw new Error(
        "Optional peer dependency '@anthropic-ai/sdk' is not installed. Install it or use getCredentials() to build your own client.",
      )
    }
    const Ctor = mod.default ?? mod.Anthropic
    if (!Ctor) throw new Error("Could not locate Anthropic constructor on SDK module.")

    if (creds.kind === "oauth") {
      return new Ctor({
        authToken: creds.accessToken,
        defaultHeaders: creds.headers,
      })
    }
    return new Ctor({ apiKey: creds.apiKey })
  }
}
