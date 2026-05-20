/**
 * Smoke test that exercises composeV3Prompt across the 5 canonical tenants
 * using real themes/manifest.json + registry.json files. Surfaces token
 * budget per scenario in the test output via expect snapshots.
 */
import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { composeV3Prompt } from "../prompt-builder.js"
import {
  loadBlocksForTenant,
  loadThemeManifest,
  loadVoiceOverrides,
} from "../lib/tenant-detector.js"
import type { DashInfoSnapshot } from "../info-collector.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, "../../../../")
const RULES = fs.readFileSync(
  path.join(DS_ROOT, "apps/docs/registry/rules/dash-ai-rules.md"),
  "utf8",
)

function snap(id: string, productLine: "internal" | "external"): DashInfoSnapshot {
  return {
    schemaVersion: 1,
    project: {
      framework: "next",
      typescript: true,
      packageManager: "pnpm",
      rootPath: DS_ROOT,
    },
    aliases: { components: "@/components" },
    dash: {
      registryUrl: "https://registry.example.com",
      hasToken: false,
      installedItems: [],
    },
    customHooks: [],
    apiBaseUrl: null,
    detectedTenant: { id, theme: id, productLine, source: "explicit-override" },
  }
}

const SCENARIOS: Array<{ id: string; productLine: "internal" | "external" }> = [
  { id: "ride", productLine: "internal" },
  { id: "logistic", productLine: "internal" },
  { id: "travel", productLine: "internal" },
  { id: "marketplace", productLine: "internal" },
  { id: "trellis-acme", productLine: "external" },
]

describe("v3 smoke — 5 tenants, real fs", () => {
  for (const { id, productLine } of SCENARIOS) {
    it(`builds prompt for tenant=${id} under default budget`, () => {
      const s = snap(id, productLine)
      const theme = loadThemeManifest(id, { dsRoot: DS_ROOT })
      const voice = loadVoiceOverrides(id, { dsRoot: DS_ROOT })
      const blocks = loadBlocksForTenant(id, { dsRoot: DS_ROOT })
      const out = composeV3Prompt({
        snapshot: s,
        aiRules: RULES,
        glossary: null,
        tenantContext: { theme, voiceOverrides: voice, blocks },
      })
      // Surface budgets — pinned blocks alone are ~14K from real rules file,
      // so default 7K budget WILL drop summary / blocks / voice; that's OK,
      // the assertion is just that core scaffolding is present.
      expect(out.systemAppend).toContain("# Dash project context")
      expect(out.metadata.tenantId).toBe(id)
      expect(out.metadata.charCount).toBeGreaterThan(500)
      // Log for human inspection (vitest prints `console.log` output on -v)
      // eslint-disable-next-line no-console
      console.log(
        `[v3 smoke] tenant=${id} chars=${out.metadata.charCount} ` +
          `pinned=${out.metadata.pinned?.length ?? 0} ` +
          `blocks(t/s)=${out.metadata.blockCounts?.tenant}/${out.metadata.blockCounts?.shared} ` +
          `notes="${out.metadata.notes}"`,
      )
    })
  }
})
