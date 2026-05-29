/**
 * MCP-boundary §4 — loader dual-read branch.
 *
 * Verifies the MCP-first branch in loadDesignContext + loadDSContext:
 *   (a) injected client → context mapped from MCP, FS untouched
 *   (b) client throws  → falls back to the FS reads
 *   (c) no client + DASH_DS_MCP_URL unset → MCP skipped, FS path runs
 *
 * The branch is gated on opts.mcpClient (test injection) or DASH_DS_MCP_URL.
 * Tests never set the env var, so the default-path assertions stay hermetic.
 */

import { describe, it, expect, vi } from "vitest"
import { loadDesignContext } from "../design-loader.js"
import { loadDSContext } from "../ds-catalog-loader.js"
import type { DashDsMcpClient } from "../mcp-client.js"

function fakeClient(over: Partial<DashDsMcpClient> = {}): DashDsMcpClient {
  return {
    source: "mcp:http://test",
    getCatalogRaw: async () => ({
      items: [
        { name: "button", title: "Button", description: "Primary action", type: "registry:ui" },
        { name: "ride-board", title: "Ride Board", description: "Dispatch", type: "registry:block" },
      ],
    }),
    getCompressedRules: async () => "COMPRESSED RULES FROM MCP",
    getGlossary: async () => "GLOSSARY FROM MCP",
    getDesignContext: async () => ({
      designContract: "DESIGN CONTRACT FROM MCP",
      layeredArchitecture: "LAYERED FROM MCP",
      cardinalRules: "CARDINAL FROM MCP",
      voiceRules: "VOICE FROM MCP",
      manifest: { brand: { name: "Dash" } } as never,
    }),
    ...over,
  }
}

describe("loadDesignContext — MCP branch", () => {
  it("(a) maps the MCP design-context bundle and marks the MCP source", async () => {
    const ctx = await loadDesignContext({ mcpClient: fakeClient() })
    expect(ctx.designContract).toBe("DESIGN CONTRACT FROM MCP")
    expect(ctx.layeredArchitecture).toBe("LAYERED FROM MCP")
    expect(ctx.cardinalRules).toBe("CARDINAL FROM MCP")
    expect(ctx.voiceRules).toBe("VOICE FROM MCP")
    expect(ctx.loadedSources).toEqual(["mcp:http://test"])
    expect(ctx.missingSources).toEqual([])
  })

  it("falls back to FALLBACK_LAYERED when MCP returns null layered", async () => {
    const ctx = await loadDesignContext({
      mcpClient: fakeClient({ getDesignContext: async () => ({
        designContract: "DC",
        layeredArchitecture: null,
        cardinalRules: "",
        voiceRules: "",
        manifest: null,
      }) }),
    })
    expect(ctx.layeredArchitecture).toContain("Layered Architecture (fallback summary)")
  })

  it("(b) falls back to FS reads when the MCP client throws", async () => {
    const throwing = fakeClient({
      getDesignContext: async () => {
        throw new Error("transport down")
      },
    })
    // Resolve against the real monorepo root so the FS path finds design.md.
    const ctx = await loadDesignContext({ mcpClient: throwing })
    // FS path loaded the real contract (not the MCP sentinel).
    expect(ctx.designContract).not.toBe("DESIGN CONTRACT FROM MCP")
    expect(ctx.loadedSources.some((s) => s.endsWith("design.md"))).toBe(true)
  })

  it("(c) skips MCP when no client injected and env unset", async () => {
    expect(process.env.DASH_DS_MCP_URL).toBeUndefined()
    const ctx = await loadDesignContext({})
    // FS path → real sources, never the MCP sentinel.
    expect(ctx.loadedSources.every((s) => !s.startsWith("mcp:"))).toBe(true)
  })

  it("explicit mcpClient:null forces the FS path even if env were set", async () => {
    const ctx = await loadDesignContext({ mcpClient: null })
    expect(ctx.loadedSources.every((s) => !s.startsWith("mcp:"))).toBe(true)
  })
})

describe("loadDSContext — MCP branch", () => {
  it("(a) maps catalog + rules + glossary from MCP", async () => {
    const ctx = await loadDSContext({ mcpClient: fakeClient() })
    expect(ctx.catalog.source).toBe("mcp:http://test")
    expect(ctx.catalog.atoms.map((a) => a.name)).toContain("button")
    expect(ctx.catalog.blocks.map((b) => b.name)).toContain("ride-board")
    expect(ctx.compressedRules).toBe("COMPRESSED RULES FROM MCP")
    expect(ctx.domainGlossary).toBe("GLOSSARY FROM MCP")
    expect(ctx.loadedSources).toEqual(["mcp:http://test"])
  })

  it("truncates the MCP glossary to the char budget", async () => {
    const big = "x".repeat(50_000)
    const ctx = await loadDSContext({
      mcpClient: fakeClient({ getGlossary: async () => big }),
      glossaryCharBudget: 1_000,
    })
    expect(ctx.domainGlossary.length).toBeLessThan(2_000)
    expect(ctx.domainGlossary).toContain("glossary truncated")
  })

  it("(b) falls back to FS when any MCP call throws", async () => {
    const throwing = fakeClient({
      getCompressedRules: async () => {
        throw new Error("rules 404")
      },
    })
    const ctx = await loadDSContext({ mcpClient: throwing })
    expect(ctx.catalog.source).not.toBe("mcp:http://test")
    expect(ctx.loadedSources.every((s) => !s.startsWith("mcp:"))).toBe(true)
  })

  it("(c) skips MCP when no client injected and env unset", async () => {
    expect(process.env.DASH_DS_MCP_URL).toBeUndefined()
    const ctx = await loadDSContext({})
    expect(ctx.loadedSources.every((s) => !s.startsWith("mcp:"))).toBe(true)
  })

  it("does not call the FS path when MCP succeeds (single source)", async () => {
    const spy = vi.fn(async () => ({ items: [] }))
    const ctx = await loadDSContext({ mcpClient: fakeClient({ getCatalogRaw: spy }) })
    expect(spy).toHaveBeenCalledOnce()
    expect(ctx.loadedSources).toEqual(["mcp:http://test"])
  })
})
