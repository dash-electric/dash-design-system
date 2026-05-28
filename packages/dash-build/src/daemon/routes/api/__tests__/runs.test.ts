/**
 * Open WebUI #A4 — POST /api/runs/:runId/pick-variant route handler.
 *
 * Uses a stubbed orchestrator (no real pipeline) so we can verify HTTP-layer
 * semantics: method gating, body validation, success / error mapping.
 */

import { describe, expect, it, vi } from "vitest"
import type { IncomingMessage, ServerResponse } from "node:http"
import { Readable } from "node:stream"
import {
  handleRunsMutationRoute,
  isRunsMutationPath,
} from "../runs.js"

interface FakeResponse {
  statusCode: number
  body: string
  finished: boolean
}

function fakeRes(): { res: ServerResponse; sink: FakeResponse } {
  const sink: FakeResponse = { statusCode: 0, body: "", finished: false }
  const headers: Record<string, string | number> = {}
  const res: Partial<ServerResponse> = {
    writeHead(code: number, hdrs?: Record<string, string | number>) {
      sink.statusCode = code
      if (hdrs) Object.assign(headers, hdrs)
      return res as ServerResponse
    },
    end(payload?: string | Uint8Array) {
      if (typeof payload === "string") sink.body = payload
      else if (payload) sink.body = Buffer.from(payload).toString("utf8")
      sink.finished = true
      return res as ServerResponse
    },
  }
  return { res: res as ServerResponse, sink }
}

function fakeReq(method: string, body: unknown): IncomingMessage {
  // readJsonBody (_helpers.ts) calls Buffer.concat on the chunk list, so we
  // MUST emit Buffer chunks (not strings) or Node throws ERR_INVALID_ARG_TYPE.
  const stream = Readable.from([
    Buffer.from(JSON.stringify(body), "utf8"),
  ]) as unknown as IncomingMessage
  ;(stream as { method: string }).method = method
  return stream
}

function pickPath(runId: string): string {
  return `/api/runs/${runId}/pick-variant`
}

describe("runs.ts route matchers", () => {
  it("isRunsMutationPath matches /api/runs/:id/pick-variant", () => {
    expect(isRunsMutationPath("/api/runs/prm_abc/pick-variant")).toBe(true)
    expect(isRunsMutationPath("/api/runs/prm_abc")).toBe(false)
    expect(isRunsMutationPath("/api/runs/")).toBe(false)
    expect(isRunsMutationPath("/api/projects")).toBe(false)
  })
})

describe("POST /api/runs/:id/pick-variant", () => {
  it("returns 503 when orchestrator is missing", async () => {
    const { res, sink } = fakeRes()
    await handleRunsMutationRoute(
      fakeReq("POST", { id: "a" }),
      res,
      pickPath("prm_x"),
      undefined,
    )
    expect(sink.statusCode).toBe(503)
    expect(sink.body).toContain("orchestrator_unavailable")
  })

  it("returns 405 for non-POST methods", async () => {
    const { res, sink } = fakeRes()
    const orchestrator = {
      pickVariant: vi.fn(async () => ({ ok: true as const, active: "a" })),
    }
    await handleRunsMutationRoute(
      fakeReq("GET", {}),
      res,
      pickPath("prm_x"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orchestrator as any,
    )
    expect(sink.statusCode).toBe(405)
  })

  it("returns 400 when id field is missing or empty", async () => {
    const { res, sink } = fakeRes()
    const orchestrator = {
      pickVariant: vi.fn(async () => ({ ok: true as const, active: "a" })),
    }
    await handleRunsMutationRoute(
      fakeReq("POST", { id: "  " }),
      res,
      pickPath("prm_x"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orchestrator as any,
    )
    expect(sink.statusCode).toBe(400)
    expect(sink.body).toContain("id_required")
  })

  it("returns 200 + active on successful pick", async () => {
    const { res, sink } = fakeRes()
    const pickVariant = vi.fn(async () => ({ ok: true as const, active: "b" }))
    const orchestrator = { pickVariant }
    await handleRunsMutationRoute(
      fakeReq("POST", { id: "b" }),
      res,
      pickPath("prm_run"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orchestrator as any,
    )
    expect(sink.statusCode).toBe(200)
    const parsed = JSON.parse(sink.body)
    expect(parsed).toEqual({ ok: true, active: "b" })
    expect(pickVariant).toHaveBeenCalledWith("prm_run", "b")
  })

  it("returns 404 when orchestrator reports unknown_prompt / no_variants_for_run / unknown_variant_id", async () => {
    for (const error of [
      "unknown_prompt",
      "no_variants_for_run",
      "unknown_variant_id",
    ]) {
      const { res, sink } = fakeRes()
      const orchestrator = {
        pickVariant: vi.fn(async () => ({ ok: false as const, error })),
      }
      await handleRunsMutationRoute(
        fakeReq("POST", { id: "a" }),
        res,
        pickPath("prm_run"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orchestrator as any,
      )
      expect(sink.statusCode).toBe(404)
      expect(sink.body).toContain(error)
    }
  })

  it("returns 400 when orchestrator reports invalid_variant_id", async () => {
    const { res, sink } = fakeRes()
    const orchestrator = {
      pickVariant: vi.fn(async () => ({
        ok: false as const,
        error: "invalid_variant_id",
      })),
    }
    await handleRunsMutationRoute(
      fakeReq("POST", { id: "AA" }),
      res,
      pickPath("prm_run"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orchestrator as any,
    )
    expect(sink.statusCode).toBe(400)
    expect(sink.body).toContain("invalid_variant_id")
  })
})
