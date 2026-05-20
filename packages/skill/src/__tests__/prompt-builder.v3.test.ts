import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildPrompt, composeV3Prompt } from "../prompt-builder.js"
import type { DashInfoSnapshot } from "../info-collector.js"
import type {
  BlockMetadata,
  ThemeManifest,
} from "../lib/tenant-detector.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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

const RIDE_THEME: ThemeManifest = {
  name: "ride",
  title: "Dash Ride",
  primary: "#5e2aac",
  accent: { name: "mobility-green", hex: "#16a34a" },
  audience: ["driver", "dispatcher", "ride-ops"],
}

const LOGISTIC_THEME: ThemeManifest = {
  name: "logistic",
  title: "Dash Logistic",
  primary: "#5e2aac",
  accent: { name: "delivery-orange", hex: "#ea580c" },
  audience: ["warehouse", "courier"],
}

const SAMPLE_BLOCKS: BlockMetadata[] = [
  {
    name: "surge-multiplier-card",
    type: "registry:block",
    title: "Surge multiplier",
    description: "Driver-facing surge boost indicator",
    theme: "ride",
    products: ["ride"],
  },
  {
    name: "route-planner",
    type: "registry:block",
    title: "Route planner",
    description: "Courier multi-stop sequencer",
    theme: "logistic",
    products: ["logistic"],
  },
  {
    name: "audit-history-table",
    type: "registry:block",
    title: "Audit history",
    description: "Generic audit trail viewer",
    theme: "shared",
    products: ["ride", "logistic"],
  },
]

describe("composeV3Prompt", () => {
  it("injects ride theme + voice + ride blocks when tenant=ride", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "ride",
        theme: "ride",
        productLine: "internal",
        source: "components.json",
      },
    })
    const out = composeV3Prompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: RIDE_THEME,
          voiceOverrides: "## Pace\nshorter sentences for driver in motion.",
          blocks: SAMPLE_BLOCKS,
        },
      },
      { charBudget: 50_000 },
    )
    expect(out.metadata.schemaVersion).toBe(3)
    expect(out.metadata.tenantId).toBe("ride")
    expect(out.metadata.tenantProductLine).toBe("internal")
    expect(out.systemAppend).toContain("Tenant context — `ride`")
    expect(out.systemAppend).toContain("Tenant theme — `ride`")
    expect(out.systemAppend).toContain("mobility-green")
    expect(out.systemAppend).toContain("Tenant voice overrides")
    expect(out.systemAppend).toContain("Tenant blocks — `ride`")
    expect(out.systemAppend).toContain("surge-multiplier-card")
    // logistic block should NOT appear in the tenant section (theme=logistic)
    const tenantBlocksSection = out.systemAppend.split("## Tenant blocks")[1] ?? ""
    expect(tenantBlocksSection).not.toContain("route-planner")
    // shared blocks live under their own heading
    expect(out.systemAppend).toContain("Shared blocks (cross-tenant)")
    expect(out.systemAppend).toContain("audit-history-table")
    expect(out.metadata.blockCounts).toEqual({ tenant: 1, shared: 1 })
    expect(out.metadata.pinned).toContain("refuse-list")
  })

  it("scopes logistic theme — ride blocks must NOT appear", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "logistic",
        theme: "logistic",
        productLine: "internal",
        source: "package.json",
      },
    })
    const out = composeV3Prompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: LOGISTIC_THEME,
          voiceOverrides: null,
          blocks: SAMPLE_BLOCKS,
        },
      },
      { charBudget: 50_000 },
    )
    expect(out.systemAppend).toContain("Tenant theme — `logistic`")
    expect(out.systemAppend).toContain("delivery-orange")
    const tenantBlocksSection = out.systemAppend.split("## Tenant blocks")[1] ?? ""
    expect(tenantBlocksSection).toContain("route-planner")
    expect(tenantBlocksSection).not.toContain("surge-multiplier-card")
    // ride theme metadata must be absent
    expect(out.systemAppend).not.toContain("mobility-green")
  })

  it("supports trellis-<id> as external product line", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "trellis-acme",
        theme: "trellis-acme",
        productLine: "external",
        source: "explicit-override",
      },
    })
    const out = composeV3Prompt({
      snapshot: snap,
      aiRules: REAL_RULES,
      glossary: null,
      tenantContext: {
        theme: { name: "trellis-tenant", title: "Trellis Tenant Template" },
        voiceOverrides: null,
        blocks: SAMPLE_BLOCKS,
      },
    })
    expect(out.systemAppend).toContain("Tenant context — `trellis-acme` (external")
    expect(out.metadata.tenantProductLine).toBe("external")
  })

  it("falls back to shared-only blocks when no tenant detected", () => {
    const snap = mkSnap()
    const out = composeV3Prompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: null,
          voiceOverrides: null,
          blocks: SAMPLE_BLOCKS,
        },
      },
      { charBudget: 50_000 },
    )
    expect(out.metadata.tenantId).toBeNull()
    expect(out.systemAppend).not.toContain("Tenant theme")
    expect(out.systemAppend).toContain("Shared blocks (no tenant detected)")
    expect(out.systemAppend).toContain("audit-history-table")
    // tenant-only blocks should NOT appear
    expect(out.systemAppend).not.toContain("surge-multiplier-card")
    expect(out.systemAppend).not.toContain("route-planner")
  })

  it("always retains pinned Layer-0 rules regardless of tenant", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "marketplace",
        theme: "marketplace",
        productLine: "internal",
        source: "env",
      },
    })
    const out = composeV3Prompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: { name: "marketplace", title: "Marketplace" },
          voiceOverrides: null,
          blocks: [],
        },
      },
      { charBudget: 50_000 },
    )
    expect(out.systemAppend).toContain("[PIN:refuse-list]")
    expect(out.systemAppend).toContain("[PIN:envelope-discriminator]")
    expect(out.systemAppend).toContain("[PIN:audit-trail-mandatory]")
    expect(out.systemAppend).toContain("[PIN:external-lib-policy]")
  })

  it("drops tenant block list before voice overrides under tight budget", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "ride",
        theme: "ride",
        productLine: "internal",
        source: "components.json",
      },
    })
    const out = composeV3Prompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: RIDE_THEME,
          voiceOverrides: "voice deltas",
          blocks: SAMPLE_BLOCKS,
        },
      },
      { charBudget: 50 },
    )
    // budget so tight everything optional drops; pinned + tenant header remain
    expect(out.systemAppend).toContain("[PIN:refuse-list]")
    expect(out.systemAppend).not.toContain("## Tenant blocks")
    expect(out.metadata.notes ?? "").toMatch(/dropped/)
  })
})

describe("buildPrompt dispatcher — v3", () => {
  it("opts.version=3 routes to v3 composer", () => {
    const snap = mkSnap({
      detectedTenant: {
        id: "ride",
        theme: "ride",
        productLine: "internal",
        source: "components.json",
      },
    })
    const out = buildPrompt(
      {
        snapshot: snap,
        aiRules: REAL_RULES,
        glossary: null,
        tenantContext: {
          theme: RIDE_THEME,
          voiceOverrides: null,
          blocks: SAMPLE_BLOCKS,
        },
      },
      { version: 3, charBudget: 50_000 },
    )
    expect(out.metadata.schemaVersion).toBe(3)
    expect(out.metadata.tenantId).toBe("ride")
  })

  it("opts.version unset → still defaults to v2 (backward compat)", () => {
    const out = buildPrompt({
      snapshot: mkSnap(),
      aiRules: REAL_RULES,
      glossary: null,
    })
    expect(out.metadata.schemaVersion).toBe(2)
  })
})
