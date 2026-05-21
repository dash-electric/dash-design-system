import { describe, expect, it } from "vitest"
import { DashBuildClient } from "../dash-build-client.js"
import { BRIDGE_ROUTES, type FetchLike } from "../types.js"

/** Build a fake FetchLike that records calls and returns a canned response. */
function fakeFetch(
  responder: (
    url: string,
    init: Parameters<FetchLike>[1],
  ) => { ok: boolean; status: number; body: unknown } | Error,
): { fetch: FetchLike; calls: Array<{ url: string; init: Parameters<FetchLike>[1] }> } {
  const calls: Array<{ url: string; init: Parameters<FetchLike>[1] }> = []
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init })
    const r = responder(url, init)
    if (r instanceof Error) throw r
    const text = typeof r.body === "string" ? r.body : JSON.stringify(r.body)
    return {
      ok: r.ok,
      status: r.status,
      json: async () => (typeof r.body === "string" ? JSON.parse(text) : r.body),
      text: async () => text,
    }
  }
  return { fetch: fetchImpl, calls }
}

describe("DashBuildClient", () => {
  it("connects to /health and reports availability", async () => {
    const { fetch, calls } = fakeFetch(() => ({ ok: true, status: 200, body: { status: "ok" } }))
    const client = new DashBuildClient({ endpoint: "http://example.test", fetch })
    const ok = await client.isDashBuildAvailable()
    expect(ok).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe(`http://example.test${BRIDGE_ROUTES.health}`)
    expect(calls[0]!.init?.method).toBe("GET")
  })

  it("serializes clarification request body correctly", async () => {
    const { fetch, calls } = fakeFetch(() => ({
      ok: true,
      status: 200,
      body: { kind: "clarified", gapId: "gap-1", answers: { scope: "minimal" } },
    }))
    const client = new DashBuildClient({ endpoint: "http://example.test/", fetch })
    const res = await client.requestClarification({
      gapId: "gap-1",
      questions: [
        { id: "q1", prompt: "Which scope?", type: "single", options: ["minimal", "full"] },
      ],
    })
    expect(res).toEqual({
      kind: "clarified",
      gapId: "gap-1",
      answers: { scope: "minimal" },
    })
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe(`http://example.test${BRIDGE_ROUTES.clarify}`)
    expect(calls[0]!.init?.method).toBe("POST")
    expect(calls[0]!.init?.headers?.["content-type"]).toBe("application/json")
    const parsed = JSON.parse(calls[0]!.init!.body as string) as Record<string, unknown>
    expect(parsed.kind).toBe("request-clarification")
    expect(parsed.gapId).toBe("gap-1")
    expect(Array.isArray(parsed.questions)).toBe(true)
  })

  it("parses 501 stub as not_implemented error", async () => {
    const { fetch } = fakeFetch(() => ({ ok: false, status: 501, body: "stub" }))
    const client = new DashBuildClient({ endpoint: "http://example.test", fetch })
    const res = await client.requestClarification({ gapId: "g", questions: [] })
    expect(res.kind).toBe("error")
    if (res.kind === "error") {
      expect(res.code).toBe("not_implemented")
    }
  })

  it("returns network_error on fetch throw without raising", async () => {
    const { fetch } = fakeFetch(() => new Error("ECONNREFUSED"))
    const client = new DashBuildClient({ endpoint: "http://example.test", fetch })
    const res = await client.requestClarification({ gapId: "g", questions: [] })
    expect(res.kind).toBe("error")
    if (res.kind === "error") {
      expect(res.code).toBe("network_error")
      expect(res.reason).toContain("ECONNREFUSED")
    }
    // And health probe should swallow as false, not throw
    const ok = await client.isDashBuildAvailable()
    expect(ok).toBe(false)
  })
})
