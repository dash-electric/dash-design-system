/**
 * Path resolver — Phase C / Sprint 2A.
 *
 * Given a user prompt + RepoContextPack, walks the selected Dash repo on disk
 * and resolves route mentions (e.g. "/provider", "/en/deliveries") to REAL
 * file paths. Output feeds existing-file-reader, which injects file contents
 * into the system prompt so the model edits the existing file instead of
 * generating an orphan greenfield page.
 *
 * Hard constraints:
 *   - Zero new npm deps. Regex + filesystem heuristic only.
 *   - Never throw. Missing files / unknown repos return an empty array.
 *   - Heuristic-grade: backoffice (Next Pages Router + JS) and portal-v2
 *     (Next App Router + TS) are first-class. Other repos fall back to a
 *     best-effort scan.
 *   - Capped output (top-N candidates) so the prompt budget stays sane.
 */

import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import { resolveDashRoot, resolveRepoPaths } from "./repo-introspector.js"
import type {
  PathResolution,
  RepoContextPack,
  RepoSurface,
} from "./types.js"

// ---------------------------------------------------------------------------
// Caps
// ---------------------------------------------------------------------------

const MAX_RESOLUTIONS = 12
const MAX_CANDIDATES_PER_ROUTE = 6
const SCAN_DEPTH_LIMIT = 6

// Directories that are never traversed for path resolution
const IGNORED_DIRS = new Set<string>([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  "coverage",
  ".cache",
])

// Filter / table / list intent keywords surface neighbour files near the route
const INTENT_FILTER = /\b(filter|filters|search|column|columns|sort|table|list|date.?range|kolom|cari|saring)\b/i
const INTENT_DETAIL = /\b(detail|detail page|edit|view|info|profile)\b/i

// Cap on how many nav-registry files we surface as patch targets per repo.
const MAX_NAV_REGISTRY_FILES = 6

/**
 * Stable marker embedded in a nav-registry PathResolution.reason. Downstream
 * consumers (validator) match on this to recognise a nav-registry resolution
 * as a valid additive patch target without depending on prose wording.
 */
export const NAV_REGISTRY_REASON_MARKER = "[nav-registry]"

// Best-effort nav/sidebar registry dir candidates for repos without a hand-coded
// layout. Relative to repoRoot. Walked only when requiresNavOrRoute is set.
const NAV_REGISTRY_CANDIDATE_DIRS: string[][] = [
  ["src", "components", "sidebar"],
  ["src", "components", "navigation"],
  ["components", "sidebar"],
  ["components", "navigation"],
]

// A file looks like a nav/sidebar registry when its name carries a nav/menu
// signal. Keeps us from surfacing every component in the sidebar dir.
const NAV_FILE_NAME_RE = /(sidebar|nav|navigation|menu|route)/i

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PathResolverOptions {
  /** Override Dash workspace root. Defaults to DASH_BUILD_DASH_ROOT or ~/Work/dash. */
  dashRoot?: string
}

export class PathResolver {
  private readonly repoSlug: RepoSurface | string
  private readonly repoRoot: string

  constructor(repoSlug: RepoSurface | string, repoRoot: string) {
    this.repoSlug = repoSlug
    this.repoRoot = repoRoot
  }

  /**
   * Resolve any route-like tokens in the prompt to concrete file paths.
   *
   * Order:
   *   1. Detect explicit route tokens via regex.
   *   2. Add contextPack.targetRoute (composer-inferred default) as a fallback.
   *   3. For each route, walk the repo's pages/app directory to find the file.
   *   4. If intent keywords (filter / list / column) present, surface
   *      neighbour files (siblings in the same route dir) as lower-confidence
   *      candidates.
   *
   * Returns: sorted desc by confidence, capped at MAX_RESOLUTIONS.
   */
  async resolveFromPrompt(
    prompt: string,
    contextPack: RepoContextPack,
  ): Promise<PathResolution[]> {
    const out: PathResolution[] = []
    if (!prompt) return out

    const seenPaths = new Set<string>()
    const layout = detectRepoLayout(this.repoSlug, this.repoRoot)
    if (!layout) return out

    // 1. Explicit routes from prompt + composer-inferred targetRoute
    const promptRoutes = extractRouteTokens(prompt)
    const candidateRoutes: Array<{ route: string; origin: "prompt" | "context" }> = []
    for (const r of promptRoutes) candidateRoutes.push({ route: r, origin: "prompt" })
    if (contextPack.targetRoute) {
      candidateRoutes.push({ route: contextPack.targetRoute, origin: "context" })
    }
    if (
      contextPack.defaultRoute &&
      contextPack.defaultRoute !== contextPack.targetRoute
    ) {
      candidateRoutes.push({ route: contextPack.defaultRoute, origin: "context" })
    }

    // De-dupe routes (case-insensitive)
    const dedupedRoutes = dedupeRoutes(candidateRoutes)

    // 2. For each route, walk the repo layout
    for (const { route, origin } of dedupedRoutes) {
      const found = await locateRouteFiles(route, layout)
      for (const candidate of found.slice(0, MAX_CANDIDATES_PER_ROUTE)) {
        if (seenPaths.has(candidate.filePath)) continue
        seenPaths.add(candidate.filePath)
        const baseConfidence = origin === "prompt" ? 0.9 : 0.55
        out.push({
          filePath: candidate.filePath,
          route,
          confidence: Math.min(1, baseConfidence * candidate.matchStrength),
          reason: `${origin === "prompt" ? "Route mentioned in prompt" : "Route inferred from repo context"} (${route}) → ${candidate.kind}`,
        })
      }

      // 3. Intent-based neighbour surfacing
      if (INTENT_FILTER.test(prompt) || INTENT_DETAIL.test(prompt)) {
        const intentKind = INTENT_FILTER.test(prompt) ? "filter/table" : "detail/edit"
        const neighbours = await listNeighbourFiles(route, layout)
        for (const n of neighbours.slice(0, MAX_CANDIDATES_PER_ROUTE)) {
          if (seenPaths.has(n)) continue
          seenPaths.add(n)
          out.push({
            filePath: n,
            route,
            confidence: 0.45,
            reason: `Neighbour file near ${route} (prompt intent: ${intentKind})`,
          })
        }
      }
    }

    // 4. Nav / sidebar registry surfacing.
    //    When the prompt asks for a page/tab/route surface (requiresNavOrRoute),
    //    the generated feature must be REGISTERED in the repo's sidebar so it
    //    ships REACHABLE. Surface those nav-registry files as valid (lower-
    //    confidence) patch targets so a correct additive nav diff isn't hard-
    //    rejected by the validator's PATCH-UNKNOWN-TARGET rule. The additive
    //    patch-validator gate still enforces additive-only safety.
    if (contextPack.requiresNavOrRoute) {
      const navFiles = await listNavRegistryFiles(layout)
      for (const navPath of navFiles.slice(0, MAX_NAV_REGISTRY_FILES)) {
        if (seenPaths.has(navPath)) continue
        seenPaths.add(navPath)
        out.push({
          filePath: navPath,
          route: contextPack.targetRoute ?? contextPack.defaultRoute ?? "(nav)",
          confidence: 0.4,
          reason: `${NAV_REGISTRY_REASON_MARKER} Nav/sidebar registry file — register the new tab here so the feature is reachable (requiresNavOrRoute)`,
        })
      }
    }

    out.sort((a, b) => b.confidence - a.confidence)
    return out.slice(0, MAX_RESOLUTIONS)
  }

  /**
   * Lightweight directory listing used by S2B / Output Mode Detector to know
   * which sibling components already exist near a target file.
   *
   * Returns file paths (absolute), capped, never throws.
   */
  async listExistingComponents(dir: string): Promise<string[]> {
    return safeListComponentLikeFiles(dir)
  }
}

// ---------------------------------------------------------------------------
// Module-level helpers (also re-used by existing-file-reader entry point)
// ---------------------------------------------------------------------------

/**
 * Convenience factory that derives the on-disk repo root from the slug. When
 * the slug is unknown or the directory does not resolve, returns null.
 */
export function createPathResolverForRepo(
  repoSlug: RepoSurface | string,
  opts: PathResolverOptions = {},
): PathResolver | null {
  const dashRoot = resolveDashRoot({ dashRoot: opts.dashRoot })
  const paths = resolveRepoPaths(repoSlug, dashRoot)
  if (!paths.fe) return null
  return new PathResolver(repoSlug, paths.fe)
}

/**
 * Pure regex extractor — matches route-like tokens in free-form prompt text.
 *
 * Pattern: leading slash, then 1+ url path segments (lowercase letters /
 * digits / `-` / `_`). Skips bare `/` and protocol-relative `//host` patterns.
 *
 * Example matches: /provider, /en/deliveries, /provider/123 (treated as
 * dynamic shape — see normalizeDynamicSegments).
 */
export function extractRouteTokens(prompt: string): string[] {
  const re = /(?<![A-Za-z0-9_:/])\/[a-z][a-z0-9_-]*(?:\/[a-z0-9_-]+)*/g
  const matches = prompt.match(re) ?? []
  const out: string[] = []
  for (const raw of matches) {
    if (raw === "/" || raw.startsWith("//")) continue
    // Normalize trailing slash
    const trimmed = raw.replace(/\/+$/, "")
    if (!trimmed) continue
    out.push(trimmed)
  }
  return Array.from(new Set(out))
}

// ---------------------------------------------------------------------------
// Repo layout detection
// ---------------------------------------------------------------------------

type RouterStyle = "pages-router-js" | "app-router-ts" | "generic"

interface RepoLayout {
  repoSlug: RepoSurface | string
  repoRoot: string
  router: RouterStyle
  pageRoots: string[]
  /** When true, App Router and a [locale] segment is expected for route shaping. */
  localePrefixed: boolean
  /**
   * Directories that hold the repo's nav / sidebar registry — the files a new
   * tab/page must be registered in to be REACHABLE. Surfaced as lower-confidence
   * patch targets only when contextPack.requiresNavOrRoute is set, so a correct
   * additive nav diff is not rejected as PATCH-UNKNOWN-TARGET. Empty = repo has
   * no known nav registry (resolver stays route-only, prior behaviour).
   */
  navRegistryDirs: string[]
}

function detectRepoLayout(
  repoSlug: RepoSurface | string,
  repoRoot: string,
): RepoLayout | null {
  if (!repoRoot) return null
  switch (repoSlug) {
    case "backoffice":
      return {
        repoSlug,
        repoRoot,
        router: "pages-router-js",
        pageRoots: [path.join(repoRoot, "src", "pages")],
        localePrefixed: false,
        // Backoffice registers nav tabs in src/components/sidebar/*.jsx
        // (Sidebar.jsx / CollapseableSidebar.jsx / DeliverySidebar.jsx).
        navRegistryDirs: [path.join(repoRoot, "src", "components", "sidebar")],
      }
    case "portal-v2":
      return {
        repoSlug,
        repoRoot,
        router: "app-router-ts",
        pageRoots: [path.join(repoRoot, "app")],
        localePrefixed: true,
        navRegistryDirs: NAV_REGISTRY_CANDIDATE_DIRS.map((d) =>
          path.join(repoRoot, ...d),
        ),
      }
    default:
      // Best-effort fallback — try both common shapes.
      return {
        repoSlug,
        repoRoot,
        router: "generic",
        pageRoots: [
          path.join(repoRoot, "src", "pages"),
          path.join(repoRoot, "app"),
          path.join(repoRoot, "src", "app"),
        ],
        localePrefixed: false,
        navRegistryDirs: NAV_REGISTRY_CANDIDATE_DIRS.map((d) =>
          path.join(repoRoot, ...d),
        ),
      }
  }
}

// ---------------------------------------------------------------------------
// Route normalization + dedupe
// ---------------------------------------------------------------------------

function dedupeRoutes(
  candidates: Array<{ route: string; origin: "prompt" | "context" }>,
): Array<{ route: string; origin: "prompt" | "context" }> {
  const seen = new Set<string>()
  const out: Array<{ route: string; origin: "prompt" | "context" }> = []
  for (const c of candidates) {
    const key = c.route.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
  }
  return out
}

/**
 * Split route to segments and strip trailing dynamic-looking segments
 * (numeric / uuid-ish). The static prefix is what we search for on disk.
 */
function stripDynamicTail(route: string): { static: string; hadDynamic: boolean } {
  const segs = route.split("/").filter(Boolean)
  let hadDynamic = false
  while (segs.length > 0) {
    const last = segs[segs.length - 1]!
    const looksDynamic =
      /^\d+$/.test(last) ||
      /^[0-9a-f]{8,}$/i.test(last) ||
      /^[A-Z0-9_]{6,}$/.test(last)
    if (!looksDynamic) break
    hadDynamic = true
    segs.pop()
  }
  return { static: "/" + segs.join("/"), hadDynamic }
}

// ---------------------------------------------------------------------------
// File location heuristics
// ---------------------------------------------------------------------------

interface RouteFileCandidate {
  filePath: string
  /** 0..1 — how strong the match is (exact > parent-dir > dynamic fallback). */
  matchStrength: number
  kind:
    | "pages-exact-file"
    | "pages-exact-index"
    | "pages-dynamic"
    | "app-page"
    | "app-dynamic"
    | "best-effort"
    | "nav-registry"
}

async function locateRouteFiles(
  route: string,
  layout: RepoLayout,
): Promise<RouteFileCandidate[]> {
  const { static: staticRoute } = stripDynamicTail(route)
  const segs = staticRoute.split("/").filter(Boolean)
  if (segs.length === 0) return []

  const out: RouteFileCandidate[] = []
  for (const root of layout.pageRoots) {
    if (!(await dirExists(root))) continue

    if (layout.router === "pages-router-js") {
      await locatePagesRouterFiles(root, segs, out)
    } else if (layout.router === "app-router-ts") {
      // App Router with [locale] guard — drop a leading "en" / "id" segment to
      // map to the dynamic [locale] dir.
      const baseSegs = stripLeadingLocale(segs)
      await locateAppRouterFiles(root, baseSegs, out)
    } else {
      // Generic: try both
      await locatePagesRouterFiles(root, segs, out).catch(() => {})
      await locateAppRouterFiles(root, stripLeadingLocale(segs), out).catch(
        () => {},
      )
    }
  }
  return out
}

function stripLeadingLocale(segs: string[]): string[] {
  if (segs.length === 0) return segs
  const head = segs[0]!.toLowerCase()
  if (/^(en|id|in|ms|zh|ja)$/.test(head)) return segs.slice(1)
  return segs
}

// ── Next Pages Router (backoffice) ────────────────────────────────────────

async function locatePagesRouterFiles(
  pagesRoot: string,
  segs: string[],
  out: RouteFileCandidate[],
): Promise<void> {
  // For route `/provider`:
  //   - src/pages/provider.{js,jsx,ts,tsx}    (file form)
  //   - src/pages/provider/index.{js,jsx,ts,tsx}  (dir form)
  // For `/provider/settings`:
  //   - src/pages/provider/settings.{js,...}
  //   - src/pages/provider/settings/index.{js,...}
  //   - src/pages/provider/[slug].{js,...}  (dynamic — if no exact match)
  const head = segs.slice(0, segs.length - 1)
  const tail = segs[segs.length - 1]!
  const dir = path.join(pagesRoot, ...head)

  // File form
  for (const ext of ["js", "jsx", "ts", "tsx"]) {
    const p = path.join(dir, `${tail}.${ext}`)
    if (await fileExists(p)) {
      out.push({ filePath: p, matchStrength: 1.0, kind: "pages-exact-file" })
    }
  }

  // Index form
  for (const ext of ["js", "jsx", "ts", "tsx"]) {
    const p = path.join(dir, tail, `index.${ext}`)
    if (await fileExists(p)) {
      out.push({ filePath: p, matchStrength: 1.0, kind: "pages-exact-index" })
    }
  }

  // Dynamic segment fallback (e.g. /provider/123 → /provider/[slug].js)
  if (await dirExists(path.join(dir, tail))) {
    const dynamicCandidates = await safeReadDir(path.join(dir, tail))
    for (const entry of dynamicCandidates) {
      if (!/^\[[^\]]+\]\.(js|jsx|ts|tsx)$/.test(entry)) continue
      out.push({
        filePath: path.join(dir, tail, entry),
        matchStrength: 0.55,
        kind: "pages-dynamic",
      })
    }
  }
}

// ── Next App Router (portal-v2) ───────────────────────────────────────────

async function locateAppRouterFiles(
  appRoot: string,
  segs: string[],
  out: RouteFileCandidate[],
): Promise<void> {
  // app/[locale]/(dashboard)/deliveries/page.tsx
  // We don't know the route-group ("(dashboard)" etc) — walk depth ≤ 4 from
  // /app/[locale] looking for a dir matching segs[0..n] (possibly nested under
  // a route group "(group)/").
  const localeDir = await pickAppRouterLocaleDir(appRoot)
  if (!localeDir) return

  if (segs.length === 0) {
    // Root page under locale
    for (const ext of ["tsx", "ts", "jsx", "js"]) {
      const p = path.join(localeDir, `page.${ext}`)
      if (await fileExists(p)) {
        out.push({ filePath: p, matchStrength: 1.0, kind: "app-page" })
      }
    }
    return
  }

  // Walk into each route group dir + direct children
  const found = await walkAppRouter(localeDir, segs, 0)
  for (const f of found) out.push(f)
}

async function pickAppRouterLocaleDir(appRoot: string): Promise<string | null> {
  const localeCandidate = path.join(appRoot, "[locale]")
  if (await dirExists(localeCandidate)) return localeCandidate
  return appRoot
}

async function walkAppRouter(
  cursor: string,
  remainingSegs: string[],
  depth: number,
): Promise<RouteFileCandidate[]> {
  if (depth > SCAN_DEPTH_LIMIT) return []
  if (remainingSegs.length === 0) {
    // Look for page.{tsx,ts,jsx,js} here
    const out: RouteFileCandidate[] = []
    for (const ext of ["tsx", "ts", "jsx", "js"]) {
      const p = path.join(cursor, `page.${ext}`)
      if (await fileExists(p)) {
        out.push({ filePath: p, matchStrength: 1.0, kind: "app-page" })
      }
    }
    return out
  }

  const [head, ...rest] = remainingSegs
  if (!head) return []
  const out: RouteFileCandidate[] = []
  const entries = await safeReadDir(cursor)
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = path.join(cursor, entry)
    if (!(await dirExists(full))) continue

    // Pass-through: route groups like "(dashboard)" + parallel "@slot"
    if (entry.startsWith("(") || entry.startsWith("@")) {
      const sub = await walkAppRouter(full, remainingSegs, depth + 1)
      out.push(...sub)
      continue
    }

    // Exact match
    if (entry.toLowerCase() === head.toLowerCase()) {
      const sub = await walkAppRouter(full, rest, depth + 1)
      out.push(...sub)
    }

    // Dynamic match [slug] / [...slug]
    if (/^\[.+\]$/.test(entry) && rest.length === 0) {
      const sub = await walkAppRouter(full, rest, depth + 1)
      for (const s of sub) {
        out.push({ ...s, matchStrength: 0.55, kind: "app-dynamic" })
      }
    }
  }
  return out
}

// ── Neighbour file surfacing (intent: filter / table) ─────────────────────

async function listNeighbourFiles(
  route: string,
  layout: RepoLayout,
): Promise<string[]> {
  // Find the dir that holds the route page, then list component-like siblings.
  const { static: staticRoute } = stripDynamicTail(route)
  const segs = staticRoute.split("/").filter(Boolean)
  if (segs.length === 0) return []

  const collected: string[] = []
  for (const root of layout.pageRoots) {
    if (!(await dirExists(root))) continue

    if (layout.router === "pages-router-js") {
      const dir = path.join(root, ...segs)
      if (await dirExists(dir)) {
        collected.push(...(await safeListComponentLikeFiles(dir)))
        // Also components subdir if present
        const compDir = path.join(dir, "components")
        if (await dirExists(compDir)) {
          collected.push(...(await safeListComponentLikeFiles(compDir)))
        }
      }
    } else if (layout.router === "app-router-ts") {
      const localeDir = await pickAppRouterLocaleDir(root)
      if (!localeDir) continue
      const baseSegs = stripLeadingLocale(segs)
      const dirs = await findAppRouterRouteDir(localeDir, baseSegs, 0)
      for (const d of dirs) {
        collected.push(...(await safeListComponentLikeFiles(d)))
        const compDir = path.join(d, "components")
        if (await dirExists(compDir)) {
          collected.push(...(await safeListComponentLikeFiles(compDir)))
        }
      }
    }
  }

  return Array.from(new Set(collected))
}

async function findAppRouterRouteDir(
  cursor: string,
  remainingSegs: string[],
  depth: number,
): Promise<string[]> {
  if (depth > SCAN_DEPTH_LIMIT) return []
  if (remainingSegs.length === 0) return [cursor]
  const [head, ...rest] = remainingSegs
  if (!head) return []
  const out: string[] = []
  const entries = await safeReadDir(cursor)
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = path.join(cursor, entry)
    if (!(await dirExists(full))) continue
    if (entry.startsWith("(") || entry.startsWith("@")) {
      out.push(...(await findAppRouterRouteDir(full, remainingSegs, depth + 1)))
      continue
    }
    if (entry.toLowerCase() === head.toLowerCase()) {
      out.push(...(await findAppRouterRouteDir(full, rest, depth + 1)))
    }
  }
  return out
}

// ── Nav / sidebar registry surfacing (requiresNavOrRoute) ─────────────────

/**
 * List the repo's nav/sidebar registry files — the files a new tab must be
 * registered in to be reachable. Walks each known nav-registry dir and keeps
 * only files whose name carries a nav/menu signal (sidebar/nav/menu/route),
 * so we surface Sidebar.jsx / CollapseableSidebar.jsx but not every unrelated
 * component that happens to live alongside them.
 *
 * Best-effort, never throws. Returns absolute paths, de-duped.
 */
async function listNavRegistryFiles(layout: RepoLayout): Promise<string[]> {
  const collected: string[] = []
  for (const dir of layout.navRegistryDirs) {
    if (!(await dirExists(dir))) continue
    const entries = await safeReadDir(dir)
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue
      if (!/\.(jsx?|tsx?)$/.test(entry)) continue
      if (/^_/.test(entry)) continue
      if (!NAV_FILE_NAME_RE.test(entry)) continue
      collected.push(path.join(dir, entry))
    }
  }
  return Array.from(new Set(collected))
}

async function safeListComponentLikeFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await safeReadDir(dir)
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue
    if (!/\.(jsx?|tsx?)$/.test(entry)) continue
    if (/^_/.test(entry)) continue
    out.push(path.join(dir, entry))
  }
  return out
}

// ---------------------------------------------------------------------------
// FS helpers (best-effort, never throw)
// ---------------------------------------------------------------------------

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isDirectory()
  } catch {
    return false
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isFile()
  } catch {
    return false
  }
}

async function safeReadDir(p: string): Promise<string[]> {
  try {
    return await readdir(p)
  } catch {
    return []
  }
}
