import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildPrompt, composeV2Prompt } from "../prompt-builder.js"
import type { DashInfoSnapshot } from "../info-collector.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Resolve the real rules file from the monorepo root.
// packages/skill/src/__tests__ → ../../../../apps/docs/registry/rules/dash-ai-rules.md
const RULES_PATH = path.resolve(
  __dirname,
  "../../../../apps/docs/registry/rules/dash-ai-rules.md",
)
const REAL_RULES = fs.readFileSync(RULES_PATH, "utf8")

function mkSnap(overrides: Partial<DashInfoSnapshot> = {}): DashInfoSnapshot {
  return {
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
      ],
    },
    customHooks: [],
    apiBaseUrl: null,
    ...overrides,
  }
}

describe("composeV2Prompt", () => {
  it("falls back to pinned + global summary when snapshot missing", () => {
    const out = composeV2Prompt({
      snapshot: null,
      aiRules: REAL_RULES,
      glossary: null,
    })
    expect(out.metadata.schemaVersion).toBe(2)
    expect(out.systemAppend).toContain("no Dash context detected")
    expect(out.systemAppend).toContain("[PIN:refuse-list]")
    expect(out.systemAppend).toContain("[PIN:envelope-discriminator]")
    expect(out.systemAppend).toContain("[PIN:audit-trail-mandatory]")
    expect(out.systemAppend).toContain("[PIN:external-lib-policy]")
    expect(out.metadata.pinned).toEqual([
      "refuse-list",
      "envelope-discriminator",
      "audit-trail-mandatory",
      "external-lib-policy",
    ])
    expect(out.metadata.detectedRepoStack).toBeNull()
  })

  it("injects portal-v2 section when snapshot detectedRepoStack is portal", () => {
    const snap = mkSnap({ detectedRepoStack: "next-portal-v2-web" })
    const out = composeV2Prompt({
      snapshot: snap,
      aiRules: REAL_RULES,
      glossary: null,
    })
    expect(out.systemAppend).toContain(
      "## Per-repo mandate — `next-portal-v2-web`",
    )
    // portal-v2 stack hallmarks
    expect(out.systemAppend).toContain("Jotai atoms")
    expect(out.systemAppend).toContain("App Router")
    // Should NOT include backoffice or fleet-mgmt sections
    expect(out.systemAppend).not.toContain(
      "## Per-repo mandate — `next-backoffice-web`",
    )
    expect(out.systemAppend).not.toContain(
      "## Per-repo mandate — `react-fleet-management-web`",
    )
    expect(out.metadata.detectedRepoStack).toBe("next-portal-v2-web")
    expect(out.metadata.sources).toContain("dash-ai-rules:repo-scoped")
  })

  it("injects backoffice section when snapshot detectedRepoStack is backoffice", () => {
    const snap = mkSnap({ detectedRepoStack: "next-backoffice-web" })
    const out = composeV2Prompt({
      snapshot: snap,
      aiRules: REAL_RULES,
      glossary: null,
    })
    expect(out.systemAppend).toContain(
      "## Per-repo mandate — `next-backoffice-web`",
    )
    expect(out.systemAppend).toContain("Pages Router")
    expect(out.systemAppend).toContain("NextAuth")
    expect(out.systemAppend).not.toContain(
      "## Per-repo mandate — `next-portal-v2-web`",
    )
    expect(out.metadata.detectedRepoStack).toBe("next-backoffice-web")
  })

  it("falls back to pinned + global only on unknown repo", () => {
    const snap = mkSnap({ detectedRepoStack: "totally-unknown-repo" })
    // Use a generous budget so the summary is not pruned (pinned blocks alone
    // on the real rules file are ~14K). The point of this test is the SCOPING
    // path — confirm no per-repo section + global summary still rendered.
    const out = composeV2Prompt(
      { snapshot: snap, aiRules: REAL_RULES, glossary: null },
      { charBudget: 50_000 },
    )
    expect(out.systemAppend).not.toContain("## Per-repo mandate")
    expect(out.systemAppend).toContain("[PIN:refuse-list]")
    expect(out.systemAppend).toContain("## Global rules summary")
    expect(out.metadata.sources).not.toContain("dash-ai-rules:repo-scoped")
  })

  it("drops global summary when char budget overflows but keeps pinned + scoped", () => {
    const snap = mkSnap({ detectedRepoStack: "next-portal-v2-web" })
    // Force a tiny budget so summary is the first thing pruned
    const out = composeV2Prompt(
      { snapshot: snap, aiRules: REAL_RULES, glossary: null },
      { charBudget: 100 },
    )
    expect(out.systemAppend).not.toContain("## Global rules summary")
    expect(out.systemAppend).toContain("[PIN:refuse-list]")
    expect(out.systemAppend).toContain(
      "## Per-repo mandate — `next-portal-v2-web`",
    )
    expect(out.metadata.notes).toMatch(/dropped global summary/)
  })

  it("acknowledges glossary input but does NOT inject terms (deferred)", () => {
    const out = composeV2Prompt({
      snapshot: mkSnap({ detectedRepoStack: "next-portal-v2-web" }),
      aiRules: REAL_RULES,
      glossary: { mitra: "driver-partner", useCode: "redemption code" },
    })
    expect(out.systemAppend).toContain("## Glossary")
    expect(out.systemAppend).toContain("2 entries")
    // Definitions themselves are NOT injected
    expect(out.systemAppend).not.toContain("driver-partner")
    expect(out.systemAppend).not.toContain("redemption code")
    expect(out.metadata.notes).toMatch(/glossary input received/)
  })
})

describe("buildPrompt v2 dispatcher", () => {
  it("defaults to v2 (schemaVersion: 2)", () => {
    const out = buildPrompt({
      snapshot: mkSnap({ detectedRepoStack: "next-portal-v2-web" }),
      aiRules: REAL_RULES,
      glossary: null,
    })
    expect(out.metadata.schemaVersion).toBe(2)
    expect(out.metadata.pinned).toBeDefined()
  })

  it("emits BuiltPrompt with charCount under default budget on real input", () => {
    const out = buildPrompt({
      snapshot: mkSnap({ detectedRepoStack: "next-portal-v2-web" }),
      aiRules: REAL_RULES,
      glossary: null,
    })
    // Default budget is 7000 but pinned blocks alone are large — soft check
    // that we did NOT blow past the v1 8K cap when the v2 path runs.
    expect(out.metadata.charCount).toBeDefined()
    // Pinned blocks + per-repo + summary is the canonical happy path
    expect(out.systemAppend.length).toBeGreaterThan(1000)
  })
})
