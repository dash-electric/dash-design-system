import { describe, it, expect, vi } from "vitest"
import { loadDashSkill } from "../index.js"
import type { DashInfoSnapshot, CollectorResult } from "../info-collector.js"

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
    hasToken: false,
    installedItems: [{ name: "button", type: "registry:ui", path: "components/ui/button.tsx" }],
  },
  customHooks: [],
  apiBaseUrl: null,
}

describe("loadDashSkill", () => {
  it("returns full BuiltPrompt when snapshot + rules both load", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi.fn(async (_p: string) => "# Dash AI Rules\nbe nice.")
    const result = await loadDashSkill({ cwd: "/tmp/proj", version: 1 }, { collect, readRules })

    expect(collect).toHaveBeenCalledWith("/tmp/proj")
    expect(result.systemAppend).toContain("# Dash project context")
    expect(result.systemAppend).toContain("framework: next")
    expect(result.systemAppend).toContain("be nice.")
    expect(result.metadata.sources).toEqual(["dash-info", "dash-ai-rules"])
  })

  it("degrades to context-only prompt when rules file missing", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi.fn(async () => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" })
    })
    const result = await loadDashSkill({ cwd: "/tmp/proj", version: 1 }, { collect, readRules })
    expect(result.systemAppend).toContain("project root: /tmp/proj")
    expect(result.systemAppend).not.toContain("## Dash AI rules")
    expect(result.metadata.sources).toEqual(["dash-info"])
  })

  it("degrades to 'no Dash context' when collector fails", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: false, reason: "ENOENT" }),
    )
    const readRules = vi.fn(async () => {
      throw new Error("ENOENT")
    })
    const result = await loadDashSkill({ cwd: "/tmp/proj", version: 1 }, { collect, readRules })
    expect(result.systemAppend).toContain("no Dash context detected")
    expect(result.metadata.sources).toEqual([])
  })

  it("never throws when collector throws", async () => {
    const collect = vi.fn(async () => {
      throw new Error("boom")
    })
    const readRules = vi.fn(async () => {
      throw new Error("ENOENT")
    })
    const result = await loadDashSkill({ cwd: "/tmp/proj", version: 1 }, { collect, readRules })
    expect(result.systemAppend).toContain("no Dash context detected")
  })

  it("honors explicit rulesPath option", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: false, reason: "skip" }),
    )
    const readRules = vi
      .fn<(p: string) => Promise<string>>()
      .mockImplementation(async (p) => {
        if (p === "/custom/rules.md") return "custom rules content"
        throw new Error("not found")
      })
    const result = await loadDashSkill(
      { cwd: "/tmp/proj", rulesPath: "/custom/rules.md", version: 1 },
      { collect, readRules },
    )
    expect(result.systemAppend).toContain("custom rules content")
    expect(result.metadata.sources).toContain("dash-ai-rules")
  })

  it("tries default rules paths under project root from snapshot", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi
      .fn<(p: string) => Promise<string>>()
      .mockImplementation(async (p) => {
        if (p.endsWith("apps/docs/registry/rules/dash-ai-rules.md")) {
          return "docs rules"
        }
        throw new Error("not found")
      })
    const result = await loadDashSkill(
      { cwd: "/somewhere/else", version: 1 },
      { collect, readRules },
    )
    expect(result.systemAppend).toContain("docs rules")
    // First attempt should be against snapshot.project.rootPath
    const firstCall = readRules.mock.calls[0][0]
    expect(firstCall).toContain("/tmp/proj")
  })
})
