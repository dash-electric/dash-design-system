import { AuthenticatedOpenAIClient } from "./client.js"
import { BYOKeyStore } from "./byo-key.js"
import { CodexCliRunner } from "../codex-cli/runner.js"
import type { Store } from "../../daemon/state/store.js"
import type { Broadcaster } from "../../daemon/ws/broadcaster.js"

/**
 * Sprint 1B — Auto-reconnect helper for the OpenAI auth surface.
 *
 * Why it exists: when a Codex CLI session expires or the daemon restarts, the
 * dashboard rail currently surfaces a static "not connected" message with no
 * recovery path. AutoReconnect periodically probes both auth backends and
 * attempts to re-hydrate the connection without forcing the user to re-paste
 * a key or re-run device-auth.
 *
 * Fallback chain (run in order on each check):
 *   1. Re-probe Codex CLI via `probe()` — installed + authenticated wins.
 *   2. Re-load BYO API key from disk (encrypted via BYOKeyStore) and
 *      validate via a 1-token cheap call to /v1/models. The Responses API
 *      bills per token, so we hit the cheap models endpoint instead.
 *   3. Mark disconnected + broadcast `auth:reconnect_failed`.
 *
 * Best-effort by design — exceptions never propagate to the daemon boot path
 * or to other callers. Worst case the auth chip stays red; the user can hit
 * the manual reconnect button which calls back into `checkAndReconnect()`.
 */

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void
  warn(msg: string, meta?: Record<string, unknown>): void
  error(msg: string, meta?: Record<string, unknown>): void
}

const NOOP_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

export interface AutoReconnectOptions {
  client: AuthenticatedOpenAIClient
  store: Store
  broadcaster?: Broadcaster
  logger?: Logger
  /** Poll interval in ms. Default 5 min. Set to 0 to disable timer. */
  intervalMs?: number
  /**
   * Optional fetch impl injected for validation pings (mostly for tests). Falls
   * back to global fetch.
   */
  fetchImpl?: typeof fetch
  /** Optional override for the BYO key store (tests). */
  byoStore?: BYOKeyStore
  /** Optional override for the Codex CLI runner (tests). */
  codexCli?: CodexCliRunner
}

export type ReconnectResult =
  | { connected: true; mode: "codex-cli" | "byo-key"; reason?: undefined }
  | { connected: false; mode?: undefined; reason: string }

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

export class AutoReconnect {
  private readonly client: AuthenticatedOpenAIClient
  private readonly store: Store
  private readonly broadcaster: Broadcaster | undefined
  private readonly logger: Logger
  private readonly intervalMs: number
  private readonly fetchImpl: typeof fetch
  private readonly byoStore: BYOKeyStore
  private readonly codexCli: CodexCliRunner
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(opts: AutoReconnectOptions) {
    this.client = opts.client
    this.store = opts.store
    this.broadcaster = opts.broadcaster
    this.logger = opts.logger ?? NOOP_LOGGER
    this.intervalMs = opts.intervalMs ?? DEFAULT_INTERVAL_MS
    this.fetchImpl = opts.fetchImpl ?? fetch
    this.byoStore = opts.byoStore ?? new BYOKeyStore()
    this.codexCli = opts.codexCli ?? new CodexCliRunner()
  }

  /**
   * Probe current state. If already connected we short-circuit so callers can
   * safely poll without paying the cost of a network roundtrip every tick.
   */
  async checkAndReconnect(): Promise<ReconnectResult> {
    let alreadyConnected = false
    try {
      alreadyConnected = await this.client.isConnected()
    } catch (err) {
      this.logger.warn("auto-reconnect: isConnected probe threw", {
        message: (err as Error).message,
      })
    }

    if (alreadyConnected) {
      const mode = await this.client.getMode().catch(() => "none" as const)
      if (mode === "codex-cli" || mode === "byo-key") {
        await this.persistConnected(mode)
        return { connected: true, mode }
      }
    }

    // Fallback 1 — Codex CLI re-probe (cheap, no network call).
    const codexResult = await this.tryCodex()
    if (codexResult.connected) {
      await this.persistConnected("codex-cli")
      this.broadcaster?.broadcast("auth:reconnected", {
        provider: "openai",
        mode: "codex-cli",
      })
      this.logger.info("auto-reconnect: recovered via codex-cli")
      return codexResult
    }

    // Fallback 2 — BYO key re-load + validation ping.
    const byoResult = await this.tryByoKey()
    if (byoResult.connected) {
      await this.persistConnected("byo-key")
      this.broadcaster?.broadcast("auth:reconnected", {
        provider: "openai",
        mode: "byo-key",
      })
      this.logger.info("auto-reconnect: recovered via byo-key")
      return byoResult
    }

    // Both failed — mark disconnected so the chip + rail stay honest.
    await this.persistDisconnected()
    this.broadcaster?.broadcast("auth:reconnect_failed", {
      provider: "openai",
      reason: byoResult.reason || codexResult.reason || "no_auth_available",
    })
    this.logger.warn("auto-reconnect: both fallbacks failed", {
      codex: codexResult.reason,
      byo: byoResult.reason,
    })
    return {
      connected: false,
      reason: byoResult.reason || codexResult.reason || "no_auth_available",
    }
  }

  /**
   * Start the polling timer. Returns a cancel function. Passing intervalMs=0
   * to the constructor disables polling but leaves `checkAndReconnect()`
   * available for manual triggers (and the manual /reconnect endpoint).
   */
  start(): () => void {
    if (this.intervalMs <= 0) {
      return () => {}
    }
    if (this.timer) {
      return () => this.stop()
    }
    this.timer = setInterval(() => {
      void this.checkAndReconnect().catch((err) => {
        this.logger.error("auto-reconnect: tick threw", {
          message: (err as Error).message,
        })
      })
    }, this.intervalMs)
    // Don't keep the event loop alive solely on the reconnect timer.
    if (typeof this.timer === "object" && this.timer && "unref" in this.timer) {
      ;(this.timer as { unref: () => void }).unref()
    }
    return () => this.stop()
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private async tryCodex(): Promise<ReconnectResult> {
    try {
      const probe = await this.codexCli.probe()
      if (probe.installed && probe.authenticated) {
        return { connected: true, mode: "codex-cli" }
      }
      return {
        connected: false,
        reason: probe.installed ? "codex_not_authenticated" : "codex_not_installed",
      }
    } catch (err) {
      return {
        connected: false,
        reason: `codex_probe_error: ${(err as Error).message}`,
      }
    }
  }

  private async tryByoKey(): Promise<ReconnectResult> {
    let apiKey: string | null = null
    try {
      apiKey = await this.byoStore.load()
    } catch (err) {
      return {
        connected: false,
        reason: `byo_load_error: ${(err as Error).message}`,
      }
    }
    if (!apiKey) {
      return { connected: false, reason: "byo_key_missing" }
    }
    // Cheap validation — /v1/models is free, returns immediately, and a 401
    // here means the key was revoked or rotated upstream.
    try {
      const res = await this.fetchImpl("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      if (res.ok) {
        return { connected: true, mode: "byo-key" }
      }
      return {
        connected: false,
        reason: `byo_validation_failed: ${res.status}`,
      }
    } catch (err) {
      return {
        connected: false,
        reason: `byo_validation_error: ${(err as Error).message}`,
      }
    }
  }

  private async persistConnected(mode: "codex-cli" | "byo-key"): Promise<void> {
    try {
      await this.store.setAuth("openai", {
        connected: true,
        user: mode === "codex-cli" ? "ChatGPT" : "byo-key",
      })
    } catch (err) {
      this.logger.warn("auto-reconnect: persistConnected failed", {
        message: (err as Error).message,
      })
    }
  }

  private async persistDisconnected(): Promise<void> {
    try {
      const current = this.store.getAuth().openai
      if (!current.connected) return
      await this.store.setAuth("openai", { connected: false, user: null })
    } catch (err) {
      this.logger.warn("auto-reconnect: persistDisconnected failed", {
        message: (err as Error).message,
      })
    }
  }
}
