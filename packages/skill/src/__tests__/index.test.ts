import { describe, it, expect, vi } from "vitest"
import { loadDashSkill, getTenantContext } from "../index.js"
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

    expect(collect).toHaveBeenCalledWith(
      "/tmp/proj",
      undefined,
      expect.any(Object),
    )
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

  it("v3: scopes to ride tenant when opts.tenantId=ride", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi.fn(async () => "# rules")
    const result = await loadDashSkill(
      {
        cwd: "/tmp/proj",
        version: 3,
        tenantId: "ride",
        dsRoot: "/nonexistent-ds-root",
      },
      { collect, readRules },
    )
    expect(result.metadata.schemaVersion).toBe(3)
    expect(result.metadata.tenantId).toBe("ride")
    expect(result.metadata.tenantProductLine).toBe("internal")
    expect(result.systemAppend).toContain("Tenant context — `ride`")
  })

  it("v3: undefined tenant → schemaVersion 3 but tenantId=null", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi.fn(async () => "# rules")
    const result = await loadDashSkill(
      { cwd: "/tmp/proj", version: 3, dsRoot: "/nowhere" },
      { collect, readRules },
    )
    expect(result.metadata.schemaVersion).toBe(3)
    expect(result.metadata.tenantId).toBeNull()
  })

  it("v3: backward compat — opts.version unset still routes v2 + ignores tenant", async () => {
    const collect = vi.fn(
      async (): Promise<CollectorResult> => ({ ok: true, snapshot }),
    )
    const readRules = vi.fn(async () => "# rules")
    const result = await loadDashSkill(
      { cwd: "/tmp/proj", tenantId: "ride" },
      { collect, readRules },
    )
    expect(result.metadata.schemaVersion).toBe(2)
    expect(result.metadata.tenantId).toBeUndefined()
  })

  it("getTenantContext helper resolves explicit override without prompt build", () => {
    const result = getTenantContext(snapshot, {
      explicit: "logistic",
      dsRoot: "/nowhere",
    })
    expect(result.tenantId).toBe("logistic")
    expect(result.tenant?.source).toBe("explicit-override")
    expect(result.tenant?.productLine).toBe("internal")
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
