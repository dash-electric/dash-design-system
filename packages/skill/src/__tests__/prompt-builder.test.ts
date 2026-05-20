import { describe, it, expect } from "vitest"
import { buildPrompt } from "../prompt-builder.js"
import type { DashInfoSnapshot } from "../info-collector.js"

// These tests pin v1 explicitly to lock the legacy contract. v2 has its own
// suite in prompt-builder.v2.test.ts.
const V1 = { version: 1 as const }

const snapshot: DashInfoSnapshot = {
  schemaVersion: 1,
  project: {
    framework: "next",
    typescript: true,
    packageManager: "pnpm",
    rootPath: "/tmp/proj",
  },
  aliases: { components: "@/components" },
  dash: {
    registryUrl: "https://registry.example.com",
    hasToken: true,
    installedItems: [
      { name: "button", type: "registry:ui", path: "components/ui/button.tsx" },
      { name: "card", type: "registry:ui", path: "components/ui/card.tsx" },
    ],
  },
  customHooks: ["useDashAuth"],
  apiBaseUrl: "https://api.example.com",
}

describe("buildPrompt", () => {
  it("includes snapshot and rules when both supplied", () => {
    const out = buildPrompt(
      {
        snapshot,
        aiRules: "Always prefer @dash/* primitives.",
        glossary: null,
      },
      V1,
    )
    expect(out.systemAppend).toContain("# Dash project context")
    expect(out.systemAppend).toContain("project root: /tmp/proj")
    expect(out.systemAppend).toContain("framework: next")
    expect(out.systemAppend).toContain("next / typescript / pnpm")
    expect(out.systemAppend).toContain("installed @dash components: 2")
    expect(out.systemAppend).toContain("button (registry:ui)")
    expect(out.systemAppend).toContain("custom hooks: useDashAuth")
    expect(out.systemAppend).toContain("## Dash AI rules")
    expect(out.systemAppend).toContain("Always prefer @dash/* primitives.")
    expect(out.metadata.schemaVersion).toBe(1)
    expect(out.metadata.sources).toEqual(["dash-info", "dash-ai-rules"])
    expect(() => new Date(out.metadata.builtAt).toISOString()).not.toThrow()
  })

  it("emits 'no Dash context' note when snapshot is null", () => {
    const out = buildPrompt(
      { snapshot: null, aiRules: null, glossary: null },
      V1,
    )
    expect(out.systemAppend).toContain("# Dash project context")
    expect(out.systemAppend).toContain("no Dash context detected")
    expect(out.metadata.sources).toEqual([])
  })

  it("includes snapshot but no rules section when aiRules is null", () => {
    const out = buildPrompt(
      { snapshot, aiRules: null, glossary: null },
      V1,
    )
    expect(out.systemAppend).toContain("project root: /tmp/proj")
    expect(out.systemAppend).not.toContain("## Dash AI rules")
    expect(out.metadata.sources).toEqual(["dash-info"])
  })

  it("degrades gracefully when both snapshot and rules missing", () => {
    const out = buildPrompt(
      { snapshot: null, aiRules: null, glossary: null },
      V1,
    )
    expect(out.systemAppend).toContain("# Dash project context")
    expect(out.systemAppend).toContain("no Dash context detected")
    expect(out.systemAppend).not.toContain("## Dash AI rules")
    expect(out.metadata.sources).toEqual([])
  })

  it("truncates rules longer than 8000 chars", () => {
    const huge = "x".repeat(9000)
    const out = buildPrompt(
      { snapshot, aiRules: huge, glossary: null },
      V1,
    )
    expect(out.systemAppend).toContain("[...truncated")
    expect(out.systemAppend).toContain("original length 9000")
    // The truncated body itself is ≤ 8000 chars
    const rulesIdx = out.systemAppend.indexOf("## Dash AI rules")
    const tail = out.systemAppend.slice(rulesIdx)
    const truncatedSegment = tail.split("[...truncated")[0]
    expect(truncatedSegment.length).toBeLessThanOrEqual(8000 + 200)
  })

  it("notes glossary deferral when glossary input provided", () => {
    const out = buildPrompt(
      {
        snapshot,
        aiRules: null,
        glossary: { foo: "bar" },
      },
      V1,
    )
    expect(out.metadata.notes).toMatch(/glossary input ignored in v1/)
  })

  it("skips rules section when aiRules is whitespace only", () => {
    const out = buildPrompt(
      { snapshot, aiRules: "   \n\n  ", glossary: null },
      V1,
    )
    expect(out.systemAppend).not.toContain("## Dash AI rules")
    expect(out.metadata.sources).toEqual(["dash-info"])
  })
})
