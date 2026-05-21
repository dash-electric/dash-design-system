// Authenticated Anthropic client wrapper.
//
// Resolution order (post-May 2026 ToS fix):
//   1. BYO API key (sk-ant-*) — official, ToS-safe.
//   2. Throw with clear instructions — caller must save a key or use the
//      Claude Code subprocess path (orchestrator wiring = Wave 6).
//
// The legacy OAuth (Pro/Max subscription) path was removed because reusing
// Claude Code's public OAuth client_id in third-party apps was banned by
// Anthropic ToS effective April 4 2026. See oauth-flow.ts header.
//
// We keep `@anthropic-ai/sdk` as an OPTIONAL peer dep. The wrapper returns
// credentials + headers that the caller can plug into any Anthropic SDK
// version it uses. If the SDK is installed, `buildSdkClient()` constructs one
// via dynamic import so this package doesn't force a transitive dep.

import { BYOKeyStore, type BYOKeyStoreOptions } from "./byo-key.js"

export type AnthropicCredentials = {
  kind: "api-key"
  apiKey: string
  headers: Record<string, string>
}

export type AuthenticatedClientOptions = BYOKeyStoreOptions & {
  /** Inject custom fetch (kept for test parity; currently unused). */
  fetchImpl?: typeof fetch
  /** Inject custom BYO key store (used in tests). */
  byoStore?: BYOKeyStore
}

export class AuthenticatedAnthropicClient {
  private readonly byoStore: BYOKeyStore
  private readonly fetchImpl: typeof fetch

  constructor(opts: AuthenticatedClientOptions = {}) {
    this.byoStore = opts.byoStore ?? new BYOKeyStore(opts)
    this.fetchImpl = opts.fetchImpl ?? fetch
  }

  /** True if a BYO key is stored. */
  async isConnected(): Promise<boolean> {
    const key = await this.byoStore.load().catch(() => null)
    return key !== null
  }

  /** Resolve credentials. Throws with a clear message if none configured. */
  async getCredentials(): Promise<AnthropicCredentials> {
    const apiKey = await this.byoStore.load().catch(() => null)
    if (apiKey) {
      return {
        kind: "api-key",
        apiKey,
        headers: { "x-api-key": apiKey },
      }
    }

    throw new Error(
      "No Anthropic credentials configured. Save a BYO API key via POST /api/auth/anthropic, or use Claude Code subprocess mode.",
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
    return new Ctor({ apiKey: creds.apiKey })
  }

  /** Quiet fetchImpl reference — preserved for tests that pass it in. */
  protected getFetchImpl(): typeof fetch {
    return this.fetchImpl
  }
}
