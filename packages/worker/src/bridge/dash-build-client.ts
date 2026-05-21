/**
 * Worker-side client that calls into the Dash Build daemon.
 *
 * Use case (Day 1 stub): Hermes processes a gap autonomously, the skill chain
 * decides the scope is ambiguous, and instead of bailing we ask the user via
 * the Dash Build browser UI. The client POSTs the questions and resolves with
 * the answers once the user submits them in the browser.
 *
 * Today the daemon route returns 501; this client surfaces that as a typed
 * `{ kind: "error", code: "not_implemented" }` so callers can degrade
 * gracefully (e.g. fall back to "skip gap, requeue later").
 */

import {
  BRIDGE_ROUTES,
  type BridgeRequest,
  type BridgeResponse,
  type ClarificationQuestion,
  type FetchLike,
} from "./types.js"

export interface DashBuildClientOpts {
  /** Override the daemon URL. Default: env DASH_BUILD_URL or localhost:7777. */
  endpoint?: string
  /** Override fetch (tests inject a mock). */
  fetch?: FetchLike
  /** Per-request timeout in ms. Default 30s. Clarification can take longer in
   * Day 4+ (waits for user input) — bump this then. */
  timeoutMs?: number
}

export class DashBuildClient {
  private readonly endpoint: string
  private readonly fetchImpl: FetchLike
  private readonly timeoutMs: number

  constructor(opts: DashBuildClientOpts = {}) {
    this.endpoint = (
      opts.endpoint ?? process.env.DASH_BUILD_URL ?? "http://localhost:7777"
    ).replace(/\/+$/, "")
    this.fetchImpl = opts.fetch ?? (globalThis.fetch as unknown as FetchLike)
    this.timeoutMs = opts.timeoutMs ?? 30_000
  }

  /** Returns true when the daemon's /health responds 2xx within timeout. */
  async isDashBuildAvailable(): Promise<boolean> {
    try {
      const res = await this.request(BRIDGE_ROUTES.health, undefined, "GET")
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Ask the user a set of clarification questions via the Dash Build UI.
   * Returns a `{ kind: "clarified", answers }` response or a typed error.
   */
  async requestClarification(opts: {
    gapId: string
    questions: ClarificationQuestion[]
  }): Promise<BridgeResponse> {
    const body: BridgeRequest = {
      kind: "request-clarification",
      gapId: opts.gapId,
      questions: opts.questions,
    }
    return this.postBridge(BRIDGE_ROUTES.clarify, body)
  }

  // ── internals ──────────────────────────────────────────────────────────

  private async postBridge(
    path: string,
    body: BridgeRequest,
  ): Promise<BridgeResponse> {
    let res: Awaited<ReturnType<FetchLike>>
    try {
      res = await this.request(path, JSON.stringify(body), "POST")
    } catch (err) {
      return {
        kind: "error",
        reason: (err as Error).message ?? "network error",
        code: "network_error",
      }
    }
    if (res.status === 501) {
      return {
        kind: "error",
        reason: "Bridge endpoint scaffolded, full implementation pending",
        code: "not_implemented",
      }
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        kind: "error",
        reason: `HTTP ${res.status}${text ? `: ${text}` : ""}`,
        code: res.status === 400 ? "bad_request" : "unavailable",
      }
    }
    try {
      const parsed = (await res.json()) as BridgeResponse
      if (!parsed || typeof parsed !== "object" || typeof parsed.kind !== "string") {
        return { kind: "error", reason: "malformed response", code: "invalid_response" }
      }
      return parsed
    } catch {
      return { kind: "error", reason: "invalid JSON", code: "invalid_response" }
    }
  }

  private async request(
    path: string,
    body: string | undefined,
    method: "GET" | "POST",
  ): Promise<Awaited<ReturnType<FetchLike>>> {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      return await this.fetchImpl(`${this.endpoint}${path}`, {
        method,
        headers: body
          ? { "content-type": "application/json", accept: "application/json" }
          : { accept: "application/json" },
        body,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(t)
    }
  }
}
