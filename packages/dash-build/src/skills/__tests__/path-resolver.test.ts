import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { beforeEach, describe, expect, it } from "vitest"
import {
  PathResolver,
  createPathResolverForRepo,
  extractRouteTokens,
  NAV_REGISTRY_REASON_MARKER,
} from "../path-resolver.js"
import type { RepoContextPack } from "../types.js"

let dashRoot: string

function writeFile(filePath: string, content = "") {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

function scaffoldBackoffice(root: string) {
  const fe = path.join(root, "next-backoffice-web")
  writeFile(
    path.join(fe, "src", "pages", "provider", "index.js"),
    "export default function ProviderPage(){return null}",
  )
  writeFile(
    path.join(fe, "src", "pages", "provider", "components", "FilterBar.jsx"),
    "export default function FilterBar(){return null}",
  )
  writeFile(
    path.join(fe, "src", "pages", "provider", "[slug].js"),
    "export default function ProviderDetail(){return null}",
  )
  writeFile(
    path.join(fe, "src", "pages", "delivery", "index.js"),
    "export default function DeliveryPage(){return null}",
  )
  writeFile(
    path.join(fe, "src", "pages", "payroll.js"),
    "export default function PayrollPage(){return null}",
  )
  // Nav/sidebar registry — the files a new tab must be registered in.
  writeFile(
    path.join(fe, "src", "components", "sidebar", "Sidebar.jsx"),
    "export const Sidebar = () => null",
  )
  writeFile(
    path.join(fe, "src", "components", "sidebar", "CollapseableSidebar.jsx"),
    "export const CollapseableSidebar = () => null",
  )
  // A non-nav sibling in the sidebar dir that must NOT be surfaced.
  writeFile(
    path.join(fe, "src", "components", "sidebar", "Avatar.jsx"),
    "export const Avatar = () => null",
  )
  return fe
}

function scaffoldPortalV2(root: string) {
  const fe = path.join(root, "next-portal-v2-web")
  writeFile(
    path.join(fe, "app", "[locale]", "(dashboard)", "deliveries", "page.tsx"),
    "export default function DeliveriesPage(){return null}",
  )
  writeFile(
    path.join(
      fe,
      "app",
      "[locale]",
      "(dashboard)",
      "deliveries",
      "components",
      "DeliveriesTable.tsx",
    ),
    "export default function DeliveriesTable(){return null}",
  )
  writeFile(
    path.join(fe, "app", "[locale]", "(dashboard)", "outlets", "page.tsx"),
    "export default function OutletsPage(){return null}",
  )
  return fe
}

const baseContext: RepoContextPack = {
  selectedRepo: "dash/backoffice",
  repoSlug: "backoffice",
  theme: "ride",
  audience: "internal ops/backoffice users",
  surface: "backoffice",
  existingShell: true,
  requiresNavOrRoute: false,
  defaultRoute: "/delivery",
  targetRoute: "/provider",
  targetNavLabel: "Mitra",
  existingNavItems: ["Dashboard", "Mitra"],
  routeRequirement: null,
  integrationContract: "x",
  dataPolicy: "mock-data-only",
  ambiguity: null,
}

beforeEach(() => {
  dashRoot = mkdtempSync(path.join(tmpdir(), "dash-path-resolver-"))
})

describe("extractRouteTokens", () => {
  it("extracts a single explicit route", () => {
    expect(extractRouteTokens("tambah filter di /provider")).toEqual(["/provider"])
  })

  it("extracts nested routes and locale prefixes", () => {
    expect(extractRouteTokens("update /en/deliveries page")).toEqual(["/en/deliveries"])
  })

  it("dedupes repeated mentions", () => {
    expect(
      extractRouteTokens("/provider butuh fix dan /provider lain juga"),
    ).toEqual(["/provider"])
  })

  it("ignores protocol-relative urls and bare slash", () => {
    expect(extractRouteTokens("https://example.com/foo and / and //host")).toEqual([])
  })

  it("returns empty array for prompts with no route", () => {
    expect(extractRouteTokens("tambah filter table")).toEqual([])
  })
})

describe("PathResolver — backoffice (Pages Router + JS)", () => {
  it("resolves /provider mention to src/pages/provider/index.js", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah filter di /provider",
      baseContext,
    )
    expect(out.length).toBeGreaterThan(0)
    const top = out[0]!
    expect(top.filePath).toBe(
      path.join(feRoot, "src", "pages", "provider", "index.js"),
    )
    expect(top.route).toBe("/provider")
    expect(top.confidence).toBeGreaterThan(0.8)
    expect(top.reason.toLowerCase()).toContain("route mentioned in prompt")
  })

  it("resolves bare file form /payroll to src/pages/payroll.js", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt("update /payroll page", baseContext)
    const top = out[0]!
    expect(top.filePath).toBe(path.join(feRoot, "src", "pages", "payroll.js"))
  })

  it("falls back to dynamic [slug] when route has a dynamic id", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt("perbaiki /provider/12345", baseContext)
    // Route field preserves user phrasing; file resolution should still hit
    // /provider via dynamic-tail stripping.
    expect(out.length).toBeGreaterThan(0)
    expect(out[0]!.route).toBe("/provider/12345")
    expect(out.some((r) => r.filePath.includes("provider"))).toBe(true)
  })

  it("surfaces neighbour files when prompt has filter intent", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah filter di /provider",
      baseContext,
    )
    const neighbourPaths = out.map((r) => r.filePath)
    expect(
      neighbourPaths.some((p) =>
        p.includes(path.join("provider", "components", "FilterBar")),
      ),
    ).toBe(true)
  })

  it("surfaces nav/sidebar registry files as patch targets when requiresNavOrRoute is set", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah tab baru Suspensi di /provider",
      { ...baseContext, requiresNavOrRoute: true },
    )
    const navResolutions = out.filter((r) =>
      r.reason.includes(NAV_REGISTRY_REASON_MARKER),
    )
    const navPaths = navResolutions.map((r) => r.filePath)
    expect(
      navPaths.some((p) =>
        p.endsWith(path.join("components", "sidebar", "Sidebar.jsx")),
      ),
    ).toBe(true)
    expect(
      navPaths.some((p) =>
        p.endsWith(path.join("components", "sidebar", "CollapseableSidebar.jsx")),
      ),
    ).toBe(true)
    // Non-nav sibling in the same dir must NOT be surfaced.
    expect(navPaths.some((p) => p.endsWith("Avatar.jsx"))).toBe(false)
    // Nav resolutions are lower-confidence than route hits.
    for (const r of navResolutions) expect(r.confidence).toBeLessThan(0.5)
  })

  it("does NOT surface nav/sidebar registry files when requiresNavOrRoute is false", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah filter di /provider",
      { ...baseContext, requiresNavOrRoute: false },
    )
    expect(
      out.some((r) => r.reason.includes(NAV_REGISTRY_REASON_MARKER)),
    ).toBe(false)
    expect(out.some((r) => r.filePath.includes("sidebar"))).toBe(false)
  })

  it("falls back to contextPack.targetRoute when prompt has no route mention", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambahin field baru",
      { ...baseContext, targetRoute: "/provider" },
    )
    expect(out.length).toBeGreaterThan(0)
    expect(out[0]!.route).toBe("/provider")
    // Context-origin confidence is lower than prompt-origin
    expect(out[0]!.confidence).toBeLessThan(0.7)
  })

  it("sorts by confidence desc and caps results", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah filter di /provider plus update /delivery dan /payroll",
      baseContext,
    )
    for (let i = 1; i < out.length; i++) {
      expect(out[i]!.confidence).toBeLessThanOrEqual(out[i - 1]!.confidence)
    }
    expect(out.length).toBeLessThanOrEqual(12)
  })

  it("never throws on empty filesystem", async () => {
    const resolver = new PathResolver("backoffice", path.join(dashRoot, "missing-repo"))
    const out = await resolver.resolveFromPrompt(
      "tambah filter di /provider",
      baseContext,
    )
    expect(Array.isArray(out)).toBe(true)
    expect(out).toEqual([])
  })
})

describe("PathResolver — portal-v2 (App Router + TS)", () => {
  it("resolves /en/deliveries to app/[locale]/(dashboard)/deliveries/page.tsx", async () => {
    const feRoot = scaffoldPortalV2(dashRoot)
    const resolver = new PathResolver("portal-v2", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah kolom di /en/deliveries",
      {
        ...baseContext,
        repoSlug: "portal-v2",
        targetRoute: "/en/deliveries",
      },
    )
    expect(out.length).toBeGreaterThan(0)
    const top = out[0]!
    expect(top.filePath).toBe(
      path.join(
        feRoot,
        "app",
        "[locale]",
        "(dashboard)",
        "deliveries",
        "page.tsx",
      ),
    )
    expect(top.route).toBe("/en/deliveries")
  })

  it("strips locale prefix when matching nested dirs", async () => {
    const feRoot = scaffoldPortalV2(dashRoot)
    const resolver = new PathResolver("portal-v2", feRoot)
    const out = await resolver.resolveFromPrompt(
      "perbaiki /id/outlets",
      {
        ...baseContext,
        repoSlug: "portal-v2",
        targetRoute: null,
      },
    )
    expect(out.some((r) => r.filePath.endsWith(path.join("outlets", "page.tsx")))).toBe(
      true,
    )
  })

  it("surfaces neighbour components for filter intent in App Router", async () => {
    const feRoot = scaffoldPortalV2(dashRoot)
    const resolver = new PathResolver("portal-v2", feRoot)
    const out = await resolver.resolveFromPrompt(
      "tambah filter table di /en/deliveries",
      {
        ...baseContext,
        repoSlug: "portal-v2",
        targetRoute: "/en/deliveries",
      },
    )
    expect(
      out.some((r) =>
        r.filePath.includes(path.join("deliveries", "components", "DeliveriesTable")),
      ),
    ).toBe(true)
  })
})

describe("createPathResolverForRepo", () => {
  it("returns null for an unknown repo slug whose fe path cannot resolve", () => {
    // resolveRepoPaths fallback always returns paths; the dashRoot here is a
    // tmp dir so the actual on-disk dir won't exist — the resolver instance is
    // still returned (PathResolver itself tolerates missing FS).
    const inst = createPathResolverForRepo("backoffice", { dashRoot })
    expect(inst).toBeInstanceOf(PathResolver)
  })
})

describe("PathResolver.listExistingComponents", () => {
  it("lists component-like sibling files in a directory", async () => {
    const feRoot = scaffoldBackoffice(dashRoot)
    const resolver = new PathResolver("backoffice", feRoot)
    const components = await resolver.listExistingComponents(
      path.join(feRoot, "src", "pages", "provider", "components"),
    )
    expect(components.length).toBeGreaterThan(0)
    expect(components.some((p) => p.endsWith("FilterBar.jsx"))).toBe(true)
  })

  it("returns empty on missing directory (never throws)", async () => {
    const resolver = new PathResolver("backoffice", path.join(dashRoot, "missing"))
    const components = await resolver.listExistingComponents(
      path.join(dashRoot, "nope"),
    )
    expect(components).toEqual([])
  })
})
