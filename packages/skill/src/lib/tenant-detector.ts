/**
 * Tenant detector for Skill v3.
 *
 * Resolves which Layer-2 theme/tenant a consumer repo belongs to so the prompt
 * builder can scope context (theme manifest, voice overrides, block list).
 *
 * Detection priority (first hit wins):
 *   1. `components.json` field `dashTheme` (set by `dashkit init --theme <name>`).
 *   2. `package.json` `name` heuristic (e.g. `@dash-ride/foo` → `ride`).
 *   3. Env var `DASH_TENANT`.
 *   4. Auto-detect from imports — installed-items + customHooks containing a
 *      block path under `blocks/<theme>/*`.
 *   5. Returns `undefined` (caller falls back to shared/generic context).
 *
 * No external dependencies. Pure functions + a small fs reader. Validation is
 * hand-rolled — no zod, no schema deps. v2 callers that don't pass a snapshot
 * or env still get a sane `undefined` result.
 */
import fs from "node:fs"
import path from "node:path"
import type { DashInfoSnapshot } from "../info-collector.js"

export type ProductLine = "internal" | "external"

export type DetectedTenant = {
  /** Canonical tenant id — matches a theme name in themes/manifest.json. */
  id: string
  /** Theme name (usually identical to id; kept for forward compat). */
  theme: string
  /** Internal = Dash products. External = Trellis SaaS tenants. */
  productLine: ProductLine
  /** Where the id was derived from. */
  source:
    | "components.json"
    | "package.json"
    | "env"
    | "auto-detect"
    | "explicit-override"
}

/**
 * Canonical internal tenant ids. Trellis tenants use prefix `trellis-` and
 * are validated by pattern rather than enumeration so new SaaS customers
 * don't require a Skill release.
 */
export const KNOWN_INTERNAL_TENANTS = [
  "ride",
  "logistic",
  "travel",
  "marketplace",
] as const

/** Bare template id used when scaffolding a new Trellis tenant. */
export const TRELLIS_TEMPLATE = "trellis-tenant"

const TRELLIS_PATTERN = /^trellis-[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

/** Validate a tenant id string. Hand-rolled — no zod. */
export function isValidTenantId(value: unknown): value is string {
  if (typeof value !== "string") return false
  const v = value.trim()
  if (!v) return false
  if ((KNOWN_INTERNAL_TENANTS as readonly string[]).includes(v)) return true
  if (v === TRELLIS_TEMPLATE) return true
  if (TRELLIS_PATTERN.test(v)) return true
  return false
}

export function classifyProductLine(id: string): ProductLine {
  return id.startsWith("trellis-") ? "external" : "internal"
}

export type TenantDetectorDeps = {
  /** Override fs.readFileSync (testing). */
  readFile?: (p: string) => string | null
  /** Env var lookup (testing). */
  env?: Record<string, string | undefined>
}

function defaultReadFile(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8")
  } catch {
    return null
  }
}

/**
 * package.json name heuristic. Maps scoped names to a tenant id when possible.
 *
 * Accepts both `@dash-ride/foo` and `@dash/ride-portal` style names. Returns
 * the first matching internal tenant, else null.
 */
export function tenantFromPackageName(name: string): string | null {
  if (typeof name !== "string" || !name) return null
  const lower = name.toLowerCase()
  for (const t of KNOWN_INTERNAL_TENANTS) {
    // matches: @dash-<t>/anything, dash-<t>-anything, <t>-portal, @dash/<t>-...
    const patterns = [
      new RegExp(`(^|/|-)${t}([-/]|$)`),
      new RegExp(`@dash-${t}([-/]|$)`),
    ]
    if (patterns.some((re) => re.test(lower))) return t
  }
  // trellis tenants: @trellis-<tenantId>/foo OR @dash/trellis-<tenantId>
  const trellisScopeMatch = lower.match(/@trellis-([a-z0-9][a-z0-9-]{0,62})/)
  if (trellisScopeMatch) {
    const candidate = `trellis-${trellisScopeMatch[1]}`
    if (TRELLIS_PATTERN.test(candidate)) return candidate
  }
  const trellisInnerMatch = lower.match(/trellis-([a-z0-9][a-z0-9-]{0,62})/)
  if (trellisInnerMatch) {
    const candidate = `trellis-${trellisInnerMatch[1]}`
    if (TRELLIS_PATTERN.test(candidate)) return candidate
  }
  return null
}

/**
 * Auto-detect tenant by scanning installed-items + custom-hooks for paths
 * under `blocks/<tenant>/`. Returns the first internal tenant whose namespace
 * has at least one hit. Returns null if no tenant-scoped items are present.
 */
export function tenantFromSnapshotImports(
  snapshot: DashInfoSnapshot,
): string | null {
  const items = snapshot.dash?.installedItems ?? []
  const counts = new Map<string, number>()
  for (const item of items) {
    const haystack = `${item.path ?? ""} ${item.name ?? ""}`.toLowerCase()
    for (const t of KNOWN_INTERNAL_TENANTS) {
      if (
        haystack.includes(`blocks/${t}/`) ||
        haystack.includes(`/blocks/${t}`) ||
        haystack.includes(`${t}-`) && haystack.includes("block")
      ) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
  }
  let best: { id: string; n: number } | null = null
  for (const [id, n] of counts) {
    if (!best || n > best.n) best = { id, n }
  }
  return best?.id ?? null
}

/**
 * Read `dashTheme` from components.json under a project root, without
 * importing the CLI package (skill must not depend on cli). Best-effort.
 */
export function tenantFromComponentsJson(
  rootPath: string,
  read: (p: string) => string | null = defaultReadFile,
): string | null {
  if (!rootPath) return null
  const file = path.join(rootPath, "components.json")
  const raw = read(file)
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null
  const v = (parsed as Record<string, unknown>).dashTheme
  return isValidTenantId(v) ? v : null
}

export function tenantFromPackageJson(
  rootPath: string,
  read: (p: string) => string | null = defaultReadFile,
): string | null {
  if (!rootPath) return null
  const file = path.join(rootPath, "package.json")
  const raw = read(file)
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null
  const name = (parsed as Record<string, unknown>).name
  if (typeof name !== "string") return null
  return tenantFromPackageName(name)
}

export type DetectTenantOpts = {
  /** Explicit override — always wins. Validated. */
  explicit?: string
  /** Snapshot (used for project.rootPath + import scan). */
  snapshot?: DashInfoSnapshot | null
  /** Project root override (defaults to snapshot.project.rootPath). */
  projectRoot?: string
}

/**
 * Resolve the tenant for a given run. Walks the priority list and returns
 * the first hit, or `undefined` when nothing matches.
 */
export function detectTenant(
  opts: DetectTenantOpts = {},
  deps: TenantDetectorDeps = {},
): DetectedTenant | undefined {
  const read = deps.readFile ?? defaultReadFile
  const env = deps.env ?? process.env

  if (opts.explicit !== undefined) {
    if (isValidTenantId(opts.explicit)) {
      const id = opts.explicit
      return {
        id,
        theme: id,
        productLine: classifyProductLine(id),
        source: "explicit-override",
      }
    }
    // explicit but invalid → fall through to detection
  }

  const root =
    opts.projectRoot ?? opts.snapshot?.project?.rootPath ?? undefined

  if (root) {
    const fromCj = tenantFromComponentsJson(root, read)
    if (fromCj) {
      return {
        id: fromCj,
        theme: fromCj,
        productLine: classifyProductLine(fromCj),
        source: "components.json",
      }
    }
    const fromPkg = tenantFromPackageJson(root, read)
    if (fromPkg) {
      return {
        id: fromPkg,
        theme: fromPkg,
        productLine: classifyProductLine(fromPkg),
        source: "package.json",
      }
    }
  }

  const envVal = env.DASH_TENANT
  if (typeof envVal === "string" && isValidTenantId(envVal)) {
    return {
      id: envVal,
      theme: envVal,
      productLine: classifyProductLine(envVal),
      source: "env",
    }
  }

  if (opts.snapshot) {
    const fromImports = tenantFromSnapshotImports(opts.snapshot)
    if (fromImports) {
      return {
        id: fromImports,
        theme: fromImports,
        productLine: classifyProductLine(fromImports),
        source: "auto-detect",
      }
    }
  }

  return undefined
}

// ---------------------------------------------------------------------------
// Theme manifest + block metadata loaders (filesystem-backed, best-effort)
// ---------------------------------------------------------------------------

export type ThemeManifest = {
  name: string
  title: string
  layer?: number
  version?: string
  default?: boolean
  primary?: string
  accent?: {
    name?: string
    hex?: string
    scale?: Record<string, string>
  }
  audience?: string[]
  files?: Record<string, string>
  /** Source path the manifest was loaded from. */
  sourcePath?: string
}

export type BlockMetadata = {
  name: string
  type?: string
  title?: string
  description?: string
  theme: string
  products?: string[]
  categories?: string[]
}

const DEFAULT_THEMES_REL = "apps/docs/registry/dash/themes"
const DEFAULT_REGISTRY_REL = "apps/docs/registry.json"

export type LoadOpts = {
  projectRoot?: string
  /** Where the DS lives (monorepo root). Defaults to projectRoot. */
  dsRoot?: string
  readFile?: (p: string) => string | null
}

function safeJson(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadThemeManifest(
  tenantId: string,
  opts: LoadOpts = {},
): ThemeManifest | null {
  const read = opts.readFile ?? defaultReadFile
  const dsRoot = opts.dsRoot ?? opts.projectRoot
  if (!dsRoot) return null
  // Trellis dynamic tenants reuse the template manifest.
  const themeFolder = tenantId.startsWith("trellis-") ? TRELLIS_TEMPLATE : tenantId
  const file = path.join(dsRoot, DEFAULT_THEMES_REL, themeFolder, "manifest.json")
  const parsed = safeJson(read(file))
  if (!parsed || typeof parsed !== "object") return null
  const m = parsed as ThemeManifest
  // shallow shape check
  if (typeof m.name !== "string" || typeof m.title !== "string") return null
  return { ...m, sourcePath: file }
}

export function loadVoiceOverrides(
  tenantId: string,
  opts: LoadOpts = {},
): string | null {
  const read = opts.readFile ?? defaultReadFile
  const dsRoot = opts.dsRoot ?? opts.projectRoot
  if (!dsRoot) return null
  const themeFolder = tenantId.startsWith("trellis-") ? TRELLIS_TEMPLATE : tenantId
  const file = path.join(
    dsRoot,
    DEFAULT_THEMES_REL,
    themeFolder,
    "voice-overrides.md",
  )
  const raw = read(file)
  return raw && raw.trim().length > 0 ? raw : null
}

/**
 * Load all block metadata for a tenant — registry.json filtered to items whose
 * `theme` matches the tenant id OR whose `products` array contains it OR
 * whose `theme` is `shared`. Returns an empty array on any failure.
 */
export function loadBlocksForTenant(
  tenantId: string | null,
  opts: LoadOpts = {},
): BlockMetadata[] {
  const read = opts.readFile ?? defaultReadFile
  const dsRoot = opts.dsRoot ?? opts.projectRoot
  if (!dsRoot) return []
  const parsed = safeJson(read(path.join(dsRoot, DEFAULT_REGISTRY_REL)))
  if (!parsed || typeof parsed !== "object") return []
  const items = (parsed as { items?: unknown[] }).items
  if (!Array.isArray(items)) return []

  const out: BlockMetadata[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue
    const r = raw as Record<string, unknown>
    const name = r.name
    const type = r.type
    if (typeof name !== "string" || typeof type !== "string") continue
    // Only surface block-like items
    if (!type.includes("block") && !type.includes("registry:block")) continue
    const theme = typeof r.theme === "string" ? r.theme : "shared"
    const products = Array.isArray(r.products)
      ? (r.products.filter((x) => typeof x === "string") as string[])
      : undefined

    let include = false
    if (!tenantId) {
      include = theme === "shared"
    } else {
      if (theme === "shared") include = true
      else if (theme === tenantId) include = true
      else if (products?.includes(tenantId)) include = true
      else if (
        tenantId.startsWith("trellis-") &&
        (theme === TRELLIS_TEMPLATE || products?.includes(TRELLIS_TEMPLATE))
      ) {
        include = true
      }
    }
    if (!include) continue
    out.push({
      name,
      type,
      title: typeof r.title === "string" ? r.title : undefined,
      description:
        typeof r.description === "string" ? r.description : undefined,
      theme,
      products,
      categories: Array.isArray(r.categories)
        ? (r.categories.filter((x) => typeof x === "string") as string[])
        : undefined,
    })
  }
  return out
}
