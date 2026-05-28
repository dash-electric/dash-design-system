/**
 * Tests for the Dash DS catalog loader (Tier 0B/0L).
 *
 * Verifies:
 *   - registry.json is parsed into atoms / blocks / templates
 *   - the markdown rendering surfaces @dash/ui atom names
 *   - missing / malformed registries degrade gracefully (no throw)
 *   - the domain glossary truncation respects budgets and inserts a marker
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  loadDSContext,
  parseRegistry,
  renderDSCatalogBlock,
  truncateGlossary,
} from "../ds-catalog-loader.js"

describe("parseRegistry", () => {
  it("buckets items by registry type", () => {
    const cat = parseRegistry({
      items: [
        { name: "badge", title: "Badge", description: "Inline tag", type: "registry:ui" },
        { name: "login-01", title: "Login", description: "Auth scaffold", type: "registry:block" },
        { name: "dashboard-shell", title: "Shell", description: "Layout", type: "registry:page" },
        { name: "utils", title: "Utils", description: "lib", type: "registry:lib" },
      ],
    })
    expect(cat.atoms.map((a) => a.name)).toEqual(["badge"])
    expect(cat.blocks.map((b) => b.name)).toEqual(["login-01"])
    expect(cat.templates.map((t) => t.name)).toEqual(["dashboard-shell"])
    expect(cat.total).toBe(3) // libs are intentionally excluded
  })

  it("returns an empty catalog when given null / malformed input", () => {
    expect(parseRegistry(null).total).toBe(0)
    expect(parseRegistry({}).total).toBe(0)
    expect(parseRegistry({ items: [] }).total).toBe(0)
  })

  it("sorts atoms alphabetically for deterministic prompts", () => {
    const cat = parseRegistry({
      items: [
        { name: "card", type: "registry:ui", description: "" },
        { name: "alert", type: "registry:ui", description: "" },
        { name: "button", type: "registry:ui", description: "" },
      ],
    })
    expect(cat.atoms.map((a) => a.name)).toEqual(["alert", "button", "card"])
  })
})

describe("renderDSCatalogBlock", () => {
  it("emits the @dash/ui import directive and per-atom lines", () => {
    const cat = parseRegistry({
      items: [
        {
          name: "badge",
          title: "Badge",
          description: "Inline tag for status, count, label.",
          type: "registry:ui",
        },
        {
          name: "button",
          title: "Button",
          description: "Primary CTA.",
          type: "registry:ui",
        },
      ],
    })
    const out = renderDSCatalogBlock(cat)
    expect(out).toContain('import { X } from "@dash/ui"')
    expect(out).toContain("`badge` (Badge)")
    expect(out).toContain("`button` (Button)")
    expect(out).toContain("Inline tag for status")
  })

  it("respects maxAtoms cap and appends a truncation marker", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      name: `atom-${String(i).padStart(2, "0")}`,
      type: "registry:ui",
      description: "",
    }))
    const cat = parseRegistry({ items })
    const out = renderDSCatalogBlock(cat, { maxAtoms: 5 })
    expect(out).toContain("atom-00")
    expect(out).toContain("atom-04")
    expect(out).not.toContain("atom-05")
    expect(out).toMatch(/\+15 more atoms/)
  })
})

describe("truncateGlossary", () => {
  it("returns input unchanged when under budget", () => {
    expect(truncateGlossary("short", 100)).toBe("short")
  })

  it("cuts at a paragraph boundary when over budget", () => {
    const long = "head\n\nentry-1\n\nentry-2\n\nentry-3\n\nentry-4\n\nentry-5"
    const out = truncateGlossary(long, 20)
    expect(out.length).toBeLessThan(long.length + 60)
    expect(out).toContain("glossary truncated")
  })
})

describe("loadDSContext", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "dash-ds-catalog-"))
    mkdirSync(join(root, "apps", "docs", "registry", "rules"), { recursive: true })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("loads registry + rules + glossary when all are present", async () => {
    writeFileSync(
      join(root, "apps", "docs", "registry.json"),
      JSON.stringify({
        items: [{ name: "badge", title: "Badge", description: "x", type: "registry:ui" }],
      }),
      "utf8",
    )
    writeFileSync(
      join(root, "apps", "docs", "registry", "rules", "dash-ai-rules.compressed.md"),
      "# rules",
      "utf8",
    )
    writeFileSync(
      join(root, "apps", "docs", "registry", "rules", "dash-domain-glossary.md"),
      "# glossary\n\nDRV- prefix for drivers",
      "utf8",
    )

    const ctx = await loadDSContext({ repoRoot: root })
    expect(ctx.catalog.atoms).toHaveLength(1)
    expect(ctx.catalog.source).toContain("registry.json")
    expect(ctx.compressedRules).toContain("rules")
    expect(ctx.domainGlossary).toContain("DRV-")
    expect(ctx.loadedSources.length).toBe(3)
    expect(ctx.missingSources).toHaveLength(0)
  })

  it("degrades gracefully when registry.json is missing", async () => {
    const ctx = await loadDSContext({ repoRoot: root })
    expect(ctx.catalog.total).toBe(0)
    expect(ctx.catalog.source).toBeNull()
    expect(ctx.missingSources.length).toBeGreaterThan(0)
  })

  it("never throws when the registry.json body is invalid JSON", async () => {
    writeFileSync(join(root, "apps", "docs", "registry.json"), "not-json", "utf8")
    const ctx = await loadDSContext({ repoRoot: root })
    expect(ctx.catalog.total).toBe(0)
  })
})
