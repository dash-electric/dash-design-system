/**
 * BE endpoint catalog scanner.
 *
 * Walks a repo on disk and returns every API endpoint it can detect across
 * three frameworks Dash uses today: Next.js Pages Router (backoffice),
 * Next.js App Router (portal-v2), and Express (Halo-Dash + delivery-service).
 *
 * Hard constraints (kept in line with `skills/repo-introspector`):
 *   - Zero new runtime deps. Heuristic regex parsing.
 *   - Best-effort everywhere. Missing dirs return an empty catalog, never throw.
 *   - Cap output to keep prompt budget sane.
 */

import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"

export type Framework = "next-pages" | "next-app" | "express"
export type CatalogFramework = Framework | "mixed" | "none"

export interface EndpointEntry {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  filePath: string
  framework: Framework
  handlerExport: string
  inputSchema?: unknown
  outputType?: string
}

export interface BeCatalog {
  endpoints: EndpointEntry[]
  framework: CatalogFramework
  totalEndpoints: number
}

const CAP_ENDPOINTS = 500
const MAX_DEPTH = 8

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
  ".git",
  ".cache",
])

// ---------------------------------------------------------------------------
// FS helpers (best-effort)
// ---------------------------------------------------------------------------

async function safeReadFile(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf-8")
  } catch {
    return null
  }
}

async function safeReadDir(dir: string): Promise<string[]> {
  try {
    return await readdir(dir)
  } catch {
    return []
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function walk(
  root: string,
  matcher: (file: string) => boolean,
  out: string[],
  cap: number,
  depth = 0,
): Promise<void> {
  if (out.length >= cap) return
  if (depth > MAX_DEPTH) return
  const entries = await safeReadDir(root)
  for (const name of entries) {
    if (out.length >= cap) return
    if (SKIP_DIRS.has(name) || name.startsWith(".")) continue
    const full = path.join(root, name)
    let st
    try {
      st = await stat(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      await walk(full, matcher, out, cap, depth + 1)
    } else if (matcher(full)) {
      out.push(full)
    }
  }
}

// ---------------------------------------------------------------------------
// Next.js Pages Router scanner
// ---------------------------------------------------------------------------

const NEXT_PAGES_ROOTS = [
  ["src", "pages", "api"],
  ["pages", "api"],
] as const

/**
 * `src/pages/api/foo/[id].ts` → `/api/foo/:id`
 */
function nextPagesPathFromFile(apiRoot: string, file: string): string {
  const rel = path.relative(apiRoot, file).replace(/\\/g, "/")
  const noExt = rel.replace(/\.(ts|tsx|js|jsx)$/, "")
  const segments = noExt.split("/").map((seg) => {
    // [id] → :id, [...slug] → :slug
    const dyn = seg.match(/^\[\.\.\.(.+)\]$/)
    if (dyn?.[1]) return `:${dyn[1]}`
    const simple = seg.match(/^\[(.+)\]$/)
    if (simple?.[1]) return `:${simple[1]}`
    return seg
  })
  // Strip trailing /index for index files
  const last = segments[segments.length - 1]
  const trimmed = last === "index" ? segments.slice(0, -1) : segments
  return "/api/" + trimmed.join("/")
}

/**
 * Pages Router handlers route every method through one default export. We grep
 * for `req.method === 'POST'` style guards to enumerate supported methods.
 * Fallback: assume GET when no guard is found.
 */
function detectMethodsFromPagesHandler(content: string): EndpointEntry["method"][] {
  const methods = new Set<EndpointEntry["method"]>()
  const methodRe = /req\.method\s*===?\s*['"`](GET|POST|PUT|DELETE|PATCH)['"`]/gi
  let m: RegExpExecArray | null
  while ((m = methodRe.exec(content)) !== null) {
    const found = m[1]
    if (found) methods.add(found.toUpperCase() as EndpointEntry["method"])
  }
  // Also tolerate `switch (req.method) { case "POST":`
  const caseRe = /case\s+['"`](GET|POST|PUT|DELETE|PATCH)['"`]/gi
  while ((m = caseRe.exec(content)) !== null) {
    const found = m[1]
    if (found) methods.add(found.toUpperCase() as EndpointEntry["method"])
  }
  if (methods.size === 0) methods.add("GET")
  return Array.from(methods)
}

function extractDefaultExportName(content: string): string {
  // export default async function handler(...)
  const named = content.match(/export\s+default\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)/)
  if (named?.[1]) return named[1]
  // export default handler
  const ref = content.match(/export\s+default\s+([A-Za-z_][A-Za-z0-9_]*)/)
  if (ref?.[1]) return ref[1]
  return "handler"
}

async function scanNextPages(
  repoRoot: string,
  out: EndpointEntry[],
): Promise<boolean> {
  let found = false
  for (const segs of NEXT_PAGES_ROOTS) {
    const apiRoot = path.join(repoRoot, ...segs)
    if (!(await exists(apiRoot))) continue
    found = true
    const files: string[] = []
    await walk(
      apiRoot,
      (f) => /\.(ts|tsx|js|jsx)$/.test(f) && !f.endsWith(".d.ts"),
      files,
      CAP_ENDPOINTS,
    )
    for (const file of files) {
      if (out.length >= CAP_ENDPOINTS) return found
      const content = await safeReadFile(file)
      if (content === null) continue
      const urlPath = nextPagesPathFromFile(apiRoot, file)
      const handlerExport = extractDefaultExportName(content)
      const methods = detectMethodsFromPagesHandler(content)
      for (const method of methods) {
        if (out.length >= CAP_ENDPOINTS) return found
        out.push({
          method,
          path: urlPath,
          filePath: file,
          framework: "next-pages",
          handlerExport,
        })
      }
    }
  }
  return found
}

// ---------------------------------------------------------------------------
// Next.js App Router scanner
// ---------------------------------------------------------------------------

const NEXT_APP_ROOTS = [
  ["src", "app"],
  ["app"],
] as const

function nextAppPathFromRouteFile(appRoot: string, file: string): string {
  const rel = path.relative(appRoot, file).replace(/\\/g, "/")
  // Drop the trailing /route.{ts,js,…}
  const dir = rel.replace(/\/route\.(ts|tsx|js|jsx)$/, "")
  const segments = dir.split("/").filter((seg) => {
    if (!seg) return false
    // Drop route-groups `(foo)` and parallel routes `@foo`
    if (seg.startsWith("(") && seg.endsWith(")")) return false
    if (seg.startsWith("@")) return false
    return true
  })
  const mapped = segments.map((seg) => {
    const dyn = seg.match(/^\[\.\.\.(.+)\]$/)
    if (dyn?.[1]) return `:${dyn[1]}`
    const simple = seg.match(/^\[(.+)\]$/)
    if (simple?.[1]) return `:${simple[1]}`
    return seg
  })
  return "/" + mapped.join("/")
}

function extractAppRouterMethods(
  content: string,
): { method: EndpointEntry["method"]; handlerExport: string }[] {
  const results: { method: EndpointEntry["method"]; handlerExport: string }[] = []
  const re = /export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|DELETE|PATCH)\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const method = m[1] as EndpointEntry["method"]
    results.push({ method, handlerExport: method })
  }
  return results
}

async function scanNextApp(
  repoRoot: string,
  out: EndpointEntry[],
): Promise<boolean> {
  let found = false
  for (const segs of NEXT_APP_ROOTS) {
    const appRoot = path.join(repoRoot, ...segs)
    if (!(await exists(appRoot))) continue
    const files: string[] = []
    await walk(
      appRoot,
      (f) => /\/route\.(ts|tsx|js|jsx)$/.test(f.replace(/\\/g, "/")),
      files,
      CAP_ENDPOINTS,
    )
    if (files.length > 0) found = true
    for (const file of files) {
      if (out.length >= CAP_ENDPOINTS) return found
      const content = await safeReadFile(file)
      if (content === null) continue
      const urlPath = nextAppPathFromRouteFile(appRoot, file)
      const methods = extractAppRouterMethods(content)
      for (const m of methods) {
        if (out.length >= CAP_ENDPOINTS) return found
        out.push({
          method: m.method,
          path: urlPath,
          filePath: file,
          framework: "next-app",
          handlerExport: m.handlerExport,
        })
      }
    }
  }
  return found
}

// ---------------------------------------------------------------------------
// Express scanner
// ---------------------------------------------------------------------------

const EXPRESS_ROOTS = [
  ["src", "routes"],
  ["routes"],
  ["src", "api"],
  ["api"],
] as const

// router.get("/foo", handler) | app.post('/foo', ...) | router.delete(`/foo/:id`, ...)
const EXPRESS_CALL_RE =
  /\b(?:router|app)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*[`'"]([^`'"]+)[`'"]\s*,\s*(?:[^,)]*?,\s*)?([A-Za-z_][A-Za-z0-9_.]*)?/gi

function parseExpressFile(
  file: string,
  content: string,
): EndpointEntry[] {
  const results: EndpointEntry[] = []
  EXPRESS_CALL_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = EXPRESS_CALL_RE.exec(content)) !== null) {
    const [, method, urlPath, handler] = m
    if (!method || !urlPath) continue
    results.push({
      method: method.toUpperCase() as EndpointEntry["method"],
      path: urlPath,
      filePath: file,
      framework: "express",
      handlerExport: handler ?? "(anonymous)",
    })
  }
  return results
}

async function scanExpress(
  repoRoot: string,
  out: EndpointEntry[],
): Promise<boolean> {
  let found = false
  for (const segs of EXPRESS_ROOTS) {
    const root = path.join(repoRoot, ...segs)
    if (!(await exists(root))) continue
    const files: string[] = []
    await walk(
      root,
      (f) => /\.(ts|tsx|js|jsx)$/.test(f) && !f.endsWith(".d.ts"),
      files,
      CAP_ENDPOINTS,
    )
    for (const file of files) {
      if (out.length >= CAP_ENDPOINTS) return found
      const content = await safeReadFile(file)
      if (content === null) continue
      const parsed = parseExpressFile(file, content)
      if (parsed.length > 0) found = true
      for (const entry of parsed) {
        if (out.length >= CAP_ENDPOINTS) return found
        out.push(entry)
      }
    }
  }
  return found
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export async function scanBeCatalog(repoRoot: string): Promise<BeCatalog> {
  const endpoints: EndpointEntry[] = []

  // Run all three scanners independently — a repo may host more than one.
  const [hasPages, hasApp, hasExpress] = await Promise.all([
    scanNextPages(repoRoot, endpoints).catch(() => false),
    scanNextApp(repoRoot, endpoints).catch(() => false),
    scanExpress(repoRoot, endpoints).catch(() => false),
  ])

  const detected: Framework[] = []
  if (hasPages) detected.push("next-pages")
  if (hasApp) detected.push("next-app")
  if (hasExpress) detected.push("express")

  let framework: CatalogFramework
  if (detected.length === 0) framework = "none"
  else if (detected.length === 1) framework = detected[0]!
  else framework = "mixed"

  // Deduplicate by method+path+file — handles repeated express scans.
  const seen = new Set<string>()
  const deduped: EndpointEntry[] = []
  for (const ep of endpoints) {
    const key = `${ep.method} ${ep.path} ${ep.filePath}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(ep)
  }

  return {
    endpoints: deduped.slice(0, CAP_ENDPOINTS),
    framework,
    totalEndpoints: deduped.length,
  }
}
