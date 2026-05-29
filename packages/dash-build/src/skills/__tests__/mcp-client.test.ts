/**
 * MCP-boundary §4 — HTTP client transport.
 *
 * Stubs global fetch to verify createHttpMcpClient maps the registry r/*.json
 * bundles correctly and throws on non-OK responses (so the loader fallback
 * fires). createMcpClientFromEnv returns null when DASH_DS_MCP_URL is unset.
 */

import { describe, it, expect, vi, afterEach } from "vitest"
import {
  createHttpMcpClient,
  createMcpClientFromEnv,
} from "../mcp-client.js"

const DESIGN_BUNDLE = {
  files: [
    { path: "../../design.md", content: "DC" },
    { path: "../../LAYERED-ARCHITECTURE.md", content: "LA" },
    { path: "registry/dash/foundation/rules/cardinal-rules.md", content: "CR" },
    { path: "registry/dash/foundation/voice/voice-rules.md", content: "VR" },
    { path: "registry/dash/foundation/manifest.json", content: '{"brand":{"name":"Dash"}}' },
  ],
}

function stubFetch(map: Record<string, { ok?: boolean; status?: number; body?: unknown }>) {
  return vi.fn(async (url: string) => {
    const entry = Object.entries(map).find(([k]) => url.endsWith(k))?.[1]
    if (!entry) return { ok: false, status: 404, json: async () => ({}) } as Response
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      json: async () => entry.body ?? {},
    } as Response
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("createHttpMcpClient", () => {
  it("maps design-context bundle by basename + parses manifest", async () => {
    vi.stubGlobal("fetch", stubFetch({ "/r/design-context.json": { body: DESIGN_BUNDLE } }))
    const c = createHttpMcpClient("http://ds.test/")
    const dc = await c.getDesignContext()
    expect(dc.designContract).toBe("DC")
    expect(dc.layeredArchitecture).toBe("LA")
    expect(dc.cardinalRules).toBe("CR")
    expect(dc.voiceRules).toBe("VR")
    expect(dc.manifest).toEqual({ brand: { name: "Dash" } })
  })

  it("strips trailing slash from base url", async () => {
    const f = stubFetch({ "/r/index.json": { body: { items: [] } } })
    vi.stubGlobal("fetch", f)
    await createHttpMcpClient("http://ds.test///").getCatalogRaw()
    expect(f).toHaveBeenCalledWith("http://ds.test/r/index.json")
  })

  it("throws on non-OK HTTP (loader fallback fires)", async () => {
    vi.stubGlobal("fetch", stubFetch({ "/r/index.json": { ok: false, status: 503 } }))
    await expect(createHttpMcpClient("http://ds.test").getCatalogRaw()).rejects.toThrow(/HTTP 503/)
  })

  it("throws when a content-bearing bundle is missing content", async () => {
    vi.stubGlobal("fetch", stubFetch({ "/r/dash-domain-glossary.json": { body: { files: [{}] } } }))
    await expect(createHttpMcpClient("http://ds.test").getGlossary()).rejects.toThrow(/missing content/)
  })

  it("getCompressedRules returns files[0].content", async () => {
    vi.stubGlobal("fetch", stubFetch({
      "/r/dash-ai-rules.compressed.json": { body: { files: [{ content: "RULES" }] } },
    }))
    expect(await createHttpMcpClient("http://ds.test").getCompressedRules()).toBe("RULES")
  })
})

describe("createMcpClientFromEnv", () => {
  it("returns null when DASH_DS_MCP_URL unset", () => {
    expect(process.env.DASH_DS_MCP_URL).toBeUndefined()
    expect(createMcpClientFromEnv()).toBeNull()
  })

  it("builds a client when DASH_DS_MCP_URL set", () => {
    vi.stubEnv("DASH_DS_MCP_URL", "http://ds.test")
    const c = createMcpClientFromEnv()
    expect(c?.source).toBe("mcp:http://ds.test")
    vi.unstubAllEnvs()
  })
})
