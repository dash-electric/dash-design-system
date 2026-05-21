import { describe, expect, it } from "vitest"
import { WorkerClient } from "../worker-client.js"
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

describe("WorkerClient", () => {
  it("connects to /health and reports availability", async () => {
    const { fetch, calls } = fakeFetch(() => ({ ok: true, status: 200, body: { status: "ok" } }))
    const client = new WorkerClient({ endpoint: "http://example.test", fetch })
    const ok = await client.isWorkerAvailable()
    expect(ok).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe(`http://example.test${BRIDGE_ROUTES.health}`)
    expect(calls[0]!.init?.method).toBe("GET")
  })

  it("serializes missing-block request body correctly", async () => {
    const { fetch, calls } = fakeFetch(() => ({
      ok: true,
      status: 200,
      body: {
        kind: "block-generated",
        blockName: "image-editor",
        available: true,
        prUrl: "https://github.com/dash/dash-ds/pull/42",
      },
    }))
    const client = new WorkerClient({ endpoint: "http://example.test/", fetch })
    const res = await client.requestMissingBlock({
      blockName: "image-editor",
      context: "needed by ride-receipt block",
    })
    expect(res.kind).toBe("block-generated")
    if (res.kind === "block-generated") {
      expect(res.available).toBe(true)
      expect(res.prUrl).toContain("github.com")
    }
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe(`http://example.test${BRIDGE_ROUTES.missingBlock}`)
    expect(calls[0]!.init?.method).toBe("POST")
    const parsed = JSON.parse(calls[0]!.init!.body as string) as Record<string, unknown>
    expect(parsed.kind).toBe("missing-block")
    expect(parsed.blockName).toBe("image-editor")
    expect(parsed.context).toContain("ride-receipt")
  })

  it("parses 501 stub as not_implemented error for promote", async () => {
    const { fetch } = fakeFetch(() => ({ ok: false, status: 501, body: "stub" }))
    const client = new WorkerClient({ endpoint: "http://example.test", fetch })
    const res = await client.promoteToRegistry({
      sourcePromptId: "p-1",
      files: [{ path: "blocks/foo.tsx", contents: "export const Foo = () => null" }],
      metadata: {
        suggestedPath: "blocks/foo",
        foundationScore: 92,
        layer: "shared",
        description: "Reusable foo block",
      },
    })
    expect(res.kind).toBe("error")
    if (res.kind === "error") {
      expect(res.code).toBe("not_implemented")
    }
  })

  it("returns network_error on fetch throw without raising", async () => {
    const { fetch } = fakeFetch(() => new Error("ECONNREFUSED"))
    const client = new WorkerClient({ endpoint: "http://example.test", fetch })
    const res = await client.requestMissingBlock({ blockName: "x", context: "" })
    expect(res.kind).toBe("error")
    if (res.kind === "error") {
      expect(res.code).toBe("network_error")
      expect(res.reason).toContain("ECONNREFUSED")
    }
    const ok = await client.isWorkerAvailable()
    expect(ok).toBe(false)
  })
})
