// Authenticated Anthropic client wrapper.
//
// Resolution order (post-May 2026 ToS fix):
//   1. BYO API key (sk-ant-*) — official, ToS-safe. Uses HTTP API.
//   2. Claude Code CLI subprocess — official, ToS-safe. Spawns `claude -p`.
//      The user runs `claude login` once; their subscription token stays
//      inside Claude Code. Dash Build only reads stdout.
//   3. None — throws with clear instructions.
//
// The legacy OAuth (Pro/Max subscription token extraction) path was removed
// because reusing Claude Code's public OAuth client_id in third-party apps
// was banned by Anthropic ToS effective April 4 2026. See oauth-flow.ts.
//
// We keep `@anthropic-ai/sdk` as an OPTIONAL peer dep. The wrapper returns
// credentials + headers that the caller can plug into any Anthropic SDK
// version it uses. If the SDK is installed, `buildSdkClient()` constructs one
// via dynamic import so this package doesn't force a transitive dep.

import { BYOKeyStore, type BYOKeyStoreOptions } from "./byo-key.js"
import { ClaudeCliRunner } from "../claude-cli/runner.js"

export type AnthropicCredentials = {
  kind: "api-key"
  apiKey: string
  headers: Record<string, string>
}

export type AnthropicAuthMode = "byo-key" | "claude-cli" | "none"

export type AuthenticatedClientOptions = BYOKeyStoreOptions & {
  /** Inject custom fetch (kept for test parity; currently unused). */
  fetchImpl?: typeof fetch
  /** Inject custom BYO key store (used in tests). */
  byoStore?: BYOKeyStore
  /** Inject a custom Claude CLI runner (used in tests). */
  claudeCli?: ClaudeCliRunner
}

export class AuthenticatedAnthropicClient {
  private readonly byoStore: BYOKeyStore
  private readonly fetchImpl: typeof fetch
  private readonly claudeCli: ClaudeCliRunner

  constructor(opts: AuthenticatedClientOptions = {}) {
    this.byoStore = opts.byoStore ?? new BYOKeyStore(opts)
    this.fetchImpl = opts.fetchImpl ?? fetch
    this.claudeCli = opts.claudeCli ?? new ClaudeCliRunner()
  }

  /** True if a BYO key is stored OR the Claude Code CLI is installed. */
  async isConnected(): Promise<boolean> {
    return (await this.getMode()) !== "none"
  }

  /**
   * Resolve which auth mode is active right now.
   *   - "byo-key" when a BYO key is stored (takes precedence).
   *   - "claude-cli" when no BYO key but the official `claude` CLI is on PATH.
   *   - "none" otherwise.
   */
  async getMode(): Promise<AnthropicAuthMode> {
    const apiKey = await this.byoStore.load().catch(() => null)
    if (apiKey) return "byo-key"
    const probe = await this.claudeCli.probe().catch(() => ({ installed: false }))
    if (probe.installed) return "claude-cli"
    return "none"
  }

  /** Resolve credentials. Throws with a clear message if none configured.
   *  Only valid in `"byo-key"` mode — Claude CLI mode has no exposed token. */
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
      "No Anthropic BYO API key configured. Save a key via POST /api/auth/anthropic, or use Claude Code subprocess mode (see complete()).",
    )
  }

  /**
   * Unified completion helper that routes to whichever mode is active.
   * Callers (pipeline orchestrator, skill chain) should prefer this over
   * `buildSdkClient()` when they don't need the full SDK surface.
   */
  async complete(
    prompt: string,
    opts: { signal?: AbortSignal; onToken?: (chunk: string) => void } = {},
  ): Promise<string> {
    const mode = await this.getMode()

    if (mode === "claude-cli") {
      const result = await this.claudeCli.complete({
        prompt,
        signal: opts.signal,
        onToken: opts.onToken,
      })
      return result.content
    }

    if (mode === "byo-key") {
      const creds = await this.getCredentials()
      const res = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          ...creds.headers,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: opts.signal,
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`Anthropic API ${res.status}: ${body || res.statusText}`)
      }
      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>
      }
      const text = (data.content ?? [])
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text as string)
        .join("")
      // Best-effort streaming hook for parity with claude-cli path.
      if (opts.onToken && text) opts.onToken(text)
      return text
    }

    throw new Error(
      "No Anthropic credentials. Either POST an API key to /api/auth/anthropic or run `claude login` and ensure `claude` is on PATH.",
    )
  }

  /**
   * Build an Anthropic SDK client if `@anthropic-ai/sdk` is installed.
   * Returns `null` and lets caller decide if the SDK is unavailable.
   *
   * Only valid in `"byo-key"` mode — the SDK needs a real API key.
   * Callers in `"claude-cli"` mode should use `complete()` directly.
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
