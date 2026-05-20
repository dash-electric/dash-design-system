import { describe, it, expect } from "vitest"
import {
  detectTenant,
  isValidTenantId,
  tenantFromPackageName,
  tenantFromComponentsJson,
  tenantFromPackageJson,
  tenantFromSnapshotImports,
  classifyProductLine,
  KNOWN_INTERNAL_TENANTS,
} from "../lib/tenant-detector.js"
import type { DashInfoSnapshot } from "../info-collector.js"

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
      installedItems: [],
    },
    customHooks: [],
    apiBaseUrl: null,
    ...overrides,
  }
}

function mockFs(map: Record<string, string>) {
  return (p: string) => (p in map ? map[p] : null)
}

describe("isValidTenantId", () => {
  it("accepts known internal tenants", () => {
    for (const t of KNOWN_INTERNAL_TENANTS) {
      expect(isValidTenantId(t)).toBe(true)
    }
  })

  it("accepts trellis-<id> patterns", () => {
    expect(isValidTenantId("trellis-foo")).toBe(true)
    expect(isValidTenantId("trellis-acme-corp")).toBe(true)
    expect(isValidTenantId("trellis-tenant")).toBe(true)
  })

  it("rejects malformed values", () => {
    expect(isValidTenantId("")).toBe(false)
    expect(isValidTenantId(null)).toBe(false)
    expect(isValidTenantId(123)).toBe(false)
    expect(isValidTenantId("TRELLIS-FOO")).toBe(false)
    expect(isValidTenantId("random-product")).toBe(false)
    expect(isValidTenantId("trellis-")).toBe(false)
  })
})

describe("classifyProductLine", () => {
  it("classifies trellis as external, others as internal", () => {
    expect(classifyProductLine("ride")).toBe("internal")
    expect(classifyProductLine("logistic")).toBe("internal")
    expect(classifyProductLine("trellis-acme")).toBe("external")
  })
})

describe("tenantFromPackageName", () => {
  it("matches @dash-<tenant>/* scoped names", () => {
    expect(tenantFromPackageName("@dash-ride/portal")).toBe("ride")
    expect(tenantFromPackageName("@dash-logistic/router")).toBe("logistic")
  })

  it("matches dash-<tenant>-* names", () => {
    expect(tenantFromPackageName("dash-travel-web")).toBe("travel")
  })

  it("matches @dash/<tenant>-* names", () => {
    expect(tenantFromPackageName("@dash/marketplace-buyer")).toBe("marketplace")
  })

  it("matches trellis-<tenantId> patterns", () => {
    expect(tenantFromPackageName("@trellis-acmecorp/app")).toBe("trellis-acmecorp")
    expect(tenantFromPackageName("@dash/trellis-globex")).toBe("trellis-globex")
  })

  it("returns null when no tenant is detectable", () => {
    expect(tenantFromPackageName("my-random-app")).toBeNull()
    expect(tenantFromPackageName("")).toBeNull()
  })
})

describe("tenantFromComponentsJson", () => {
  it("reads dashTheme from components.json", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ dashTheme: "logistic" }),
    })
    expect(tenantFromComponentsJson("/proj", read)).toBe("logistic")
  })

  it("returns null when dashTheme missing", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ style: "default" }),
    })
    expect(tenantFromComponentsJson("/proj", read)).toBeNull()
  })

  it("rejects invalid dashTheme value", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ dashTheme: "not-a-real-tenant" }),
    })
    expect(tenantFromComponentsJson("/proj", read)).toBeNull()
  })

  it("handles unreadable/invalid file gracefully", () => {
    expect(tenantFromComponentsJson("/proj", () => null)).toBeNull()
    expect(tenantFromComponentsJson("/proj", () => "not-json")).toBeNull()
  })
})

describe("tenantFromPackageJson", () => {
  it("falls back to package name heuristic", () => {
    const read = mockFs({
      "/proj/package.json": JSON.stringify({ name: "@dash-travel/web" }),
    })
    expect(tenantFromPackageJson("/proj", read)).toBe("travel")
  })

  it("returns null when no name field", () => {
    const read = mockFs({
      "/proj/package.json": JSON.stringify({ version: "1.0.0" }),
    })
    expect(tenantFromPackageJson("/proj", read)).toBeNull()
  })
})

describe("tenantFromSnapshotImports", () => {
  it("detects tenant from blocks/<tenant>/* paths", () => {
    const snap = mkSnap({
      dash: {
        registryUrl: "x",
        hasToken: false,
        installedItems: [
          {
            name: "surge-multiplier-card",
            type: "registry:block",
            path: "components/blocks/ride/surge-multiplier-card.tsx",
          },
        ],
      },
    })
    expect(tenantFromSnapshotImports(snap)).toBe("ride")
  })

  it("returns null when no tenant-scoped imports", () => {
    const snap = mkSnap({
      dash: {
        registryUrl: "x",
        hasToken: false,
        installedItems: [
          { name: "button", type: "registry:ui", path: "components/ui/button.tsx" },
        ],
      },
    })
    expect(tenantFromSnapshotImports(snap)).toBeNull()
  })
})

describe("detectTenant — priority resolution", () => {
  it("explicit override wins over everything", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ dashTheme: "ride" }),
    })
    const snap = mkSnap()
    const res = detectTenant(
      { explicit: "marketplace", snapshot: snap, projectRoot: "/proj" },
      { readFile: read, env: { DASH_TENANT: "logistic" } },
    )
    expect(res?.id).toBe("marketplace")
    expect(res?.source).toBe("explicit-override")
  })

  it("falls through when explicit override is invalid", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ dashTheme: "ride" }),
    })
    const res = detectTenant(
      { explicit: "garbage", projectRoot: "/proj" },
      { readFile: read, env: {} },
    )
    expect(res?.id).toBe("ride")
    expect(res?.source).toBe("components.json")
  })

  it("components.json beats package.json + env + imports", () => {
    const read = mockFs({
      "/proj/components.json": JSON.stringify({ dashTheme: "logistic" }),
      "/proj/package.json": JSON.stringify({ name: "@dash-ride/x" }),
    })
    const res = detectTenant(
      { projectRoot: "/proj" },
      { readFile: read, env: { DASH_TENANT: "travel" } },
    )
    expect(res?.id).toBe("logistic")
    expect(res?.source).toBe("components.json")
  })

  it("package.json beats env + imports when no components.json hit", () => {
    const read = mockFs({
      "/proj/package.json": JSON.stringify({ name: "@dash-travel/web" }),
    })
    const res = detectTenant(
      { projectRoot: "/proj" },
      { readFile: read, env: { DASH_TENANT: "ride" } },
    )
    expect(res?.id).toBe("travel")
    expect(res?.source).toBe("package.json")
  })

  it("env beats imports when no fs hits", () => {
    const snap = mkSnap({
      dash: {
        registryUrl: "x",
        hasToken: false,
        installedItems: [
          {
            name: "logistic-thing",
            type: "registry:block",
            path: "components/blocks/logistic/x.tsx",
          },
        ],
      },
    })
    const res = detectTenant(
      { snapshot: snap, projectRoot: "/proj" },
      { readFile: () => null, env: { DASH_TENANT: "marketplace" } },
    )
    expect(res?.id).toBe("marketplace")
    expect(res?.source).toBe("env")
  })

  it("auto-detects from imports as last resort", () => {
    const snap = mkSnap({
      dash: {
        registryUrl: "x",
        hasToken: false,
        installedItems: [
          {
            name: "surge-card",
            type: "registry:block",
            path: "components/blocks/ride/surge-card.tsx",
          },
        ],
      },
    })
    const res = detectTenant(
      { snapshot: snap, projectRoot: "/proj" },
      { readFile: () => null, env: {} },
    )
    expect(res?.id).toBe("ride")
    expect(res?.source).toBe("auto-detect")
  })

  it("returns undefined when no signal is found", () => {
    const snap = mkSnap()
    const res = detectTenant(
      { snapshot: snap, projectRoot: "/proj" },
      { readFile: () => null, env: {} },
    )
    expect(res).toBeUndefined()
  })

  it("supports trellis dynamic ids via explicit override", () => {
    const res = detectTenant(
      { explicit: "trellis-acmecorp" },
      { readFile: () => null, env: {} },
    )
    expect(res?.id).toBe("trellis-acmecorp")
    expect(res?.productLine).toBe("external")
    expect(res?.source).toBe("explicit-override")
  })
})
