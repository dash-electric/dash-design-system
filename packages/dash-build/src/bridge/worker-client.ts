/**
 * Dash Build-side client that calls into the Hermes worker daemon.
 *
 * Two use cases (Day 1 stub):
 *   1. missing-block — Skill chain detects DS doesn't have a needed block.
 *      We ask Hermes to generate + register it; Dash Build pauses, then
 *      resumes once the block is available in the registry.
 *   2. promote-to-registry — Dash Build user produced a novel block that
 *      scores 85+ on foundation match. Offer to promote it; if accepted,
 *      hand the files to Hermes which opens a PR into dash-ds.
 *
 * Today the worker route returns 501; this client surfaces that as a typed
 * `{ kind: "error", code: "not_implemented" }`.
 */

import {
  BRIDGE_ROUTES,
  type BridgeRequest,
  type BridgeResponse,
  type FetchLike,
  type ParsedFile,
  type PromoteMetadata,
} from "./types.js"

export interface WorkerClientOpts {
  /** Override the worker URL. Default: env DASH_WORKER_URL or localhost:7787. */
  endpoint?: string
  /** Override fetch (tests inject a mock). */
  fetch?: FetchLike
  /** Per-request timeout in ms. Default 30s. Generation can take longer in
   * Day 4+ (waits for Hermes generate+validate+PR) — bump this then. */
  timeoutMs?: number
}

export class WorkerClient {
  private readonly endpoint: string
  private readonly fetchImpl: FetchLike
  private readonly timeoutMs: number

  constructor(opts: WorkerClientOpts = {}) {
    this.endpoint = (
      opts.endpoint ?? process.env.DASH_WORKER_URL ?? "http://localhost:7787"
    ).replace(/\/+$/, "")
    this.fetchImpl = opts.fetch ?? (globalThis.fetch as unknown as FetchLike)
    this.timeoutMs = opts.timeoutMs ?? 30_000
  }

  /** Returns true when the worker's /health responds 2xx within timeout. */
  async isWorkerAvailable(): Promise<boolean> {
    try {
      const res = await this.request(BRIDGE_ROUTES.health, undefined, "GET")
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Ask Hermes to generate a DS block and register it. Resolves when the
   * worker confirms the block is available (or returns a typed error).
   */
  async requestMissingBlock(opts: {
    blockName: string
    context: string
  }): Promise<BridgeResponse> {
    const body: BridgeRequest = {
      kind: "missing-block",
      blockName: opts.blockName,
      context: opts.context,
    }
    return this.postBridge(BRIDGE_ROUTES.missingBlock, body)
  }

  /**
   * Promote a novel block produced by a Dash Build user into the DS registry.
   * Hermes will open a PR into dash-ds with the supplied files + metadata.
   */
  async promoteToRegistry(opts: {
    sourcePromptId: string
    files: ParsedFile[]
    metadata: PromoteMetadata
  }): Promise<BridgeResponse> {
    const body: BridgeRequest = {
      kind: "promote-to-registry",
      sourcePromptId: opts.sourcePromptId,
      files: opts.files,
      metadata: opts.metadata,
    }
    return this.postBridge(BRIDGE_ROUTES.promote, body)
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
