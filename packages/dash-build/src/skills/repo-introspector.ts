/**
 * Repo introspector — Layer A schema injection.
 *
 * Reads REAL Prisma models, enums, FE enums, endpoint signatures, and reusable
 * components from existing Dash repos on disk. Output is fed into the system
 * prompt so the generator stops hallucinating field names, enum values,
 * endpoints, and component names.
 *
 * Hard constraints:
 *   - Zero new npm deps. Heuristic regex parse only.
 *   - Best-effort everywhere. Missing files = push to `missingSources`, never throw.
 *   - Heuristic-grade, not a full TS/Prisma parser. Designed for the patterns
 *     Dash repos use today (Pages Router + JS in backoffice, App Router + TS in
 *     portal-v2, Express + Prisma in delivery-service).
 */

import { readFile, readdir, stat } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrismaField {
  name: string
  type: string
  optional: boolean
  isList: boolean
}

export interface PrismaModel {
  name: string
  fields: PrismaField[]
  enums?: string[]
}

export interface PrismaEnum {
  name: string
  values: string[]
}

export interface FEEnum {
  file: string
  name: string
  values: string[]
}

export interface EndpointSignature {
  method: string
  path: string
  functionName: string
  file: string
}

export interface ReusableComponent {
  name: string
  importPath: string
  file: string
}

export interface RepoIntrospection {
  repoSlug: string
  prismaModels: PrismaModel[]
  prismaEnums: PrismaEnum[]
  feEnums: FEEnum[]
  endpointSignatures: EndpointSignature[]
  reusableComponents: ReusableComponent[]
  sources: string[]
  missingSources: string[]
}

export interface IntrospectOptions {
  /** Override Dash workspace root. Defaults to DASH_BUILD_DASH_ROOT or ~/Work/dash. */
  dashRoot?: string
}

// ---------------------------------------------------------------------------
// Caps (truncate to keep prompt budget sane)
// ---------------------------------------------------------------------------

const CAP_MODELS = 200
const CAP_ENUMS = 100
const CAP_FE_ENUMS = 100
const CAP_ENDPOINTS = 200
const CAP_COMPONENTS = 150

// ---------------------------------------------------------------------------
// Repo path resolution
// ---------------------------------------------------------------------------

export interface RepoPaths {
  fe: string | null
  be: string | null
  feStyle: "backoffice-js-pages" | "portal-ts-app" | "generic"
}

export function resolveDashRoot(opts?: IntrospectOptions): string {
  return (
    opts?.dashRoot ??
    process.env.DASH_BUILD_DASH_ROOT ??
    path.join(homedir(), "Work", "dash")
  )
}

export function resolveRepoPaths(repoSlug: string, dashRoot: string): RepoPaths {
  switch (repoSlug) {
    case "backoffice":
      return {
        fe: path.join(dashRoot, "next-backoffice-web"),
        be: path.join(dashRoot, "ts-delivery-service-main"),
        feStyle: "backoffice-js-pages",
      }
    case "portal-v2":
      return {
        fe: path.join(dashRoot, "next-portal-v2-web"),
        be: path.join(dashRoot, "ts-delivery-service-main"),
        feStyle: "portal-ts-app",
      }
    default:
      // Unknown slug — caller passed a freeform string. Try to use it as the
      // FE directory directly (best-effort).
      return {
        fe: path.join(dashRoot, repoSlug),
        be: path.join(dashRoot, "ts-delivery-service-main"),
        feStyle: "generic",
      }
  }
}

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

// ---------------------------------------------------------------------------
// Prisma parser (regex)
// ---------------------------------------------------------------------------

const MODEL_BLOCK_RE = /^model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)^\}/gm
const ENUM_BLOCK_RE = /^enum\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)^\}/gm

function parsePrismaSchema(content: string): {
  models: PrismaModel[]
  enums: PrismaEnum[]
} {
  const models: PrismaModel[] = []
  const enums: PrismaEnum[] = []

  // Reset regex state (global flag preserves lastIndex across calls)
  MODEL_BLOCK_RE.lastIndex = 0
  ENUM_BLOCK_RE.lastIndex = 0

  let modelMatch: RegExpExecArray | null
  while ((modelMatch = MODEL_BLOCK_RE.exec(content)) !== null) {
    const [, name, body] = modelMatch
    if (!name || !body) continue
    const fields = parsePrismaFields(body)
    models.push({ name, fields })
  }

  let enumMatch: RegExpExecArray | null
  while ((enumMatch = ENUM_BLOCK_RE.exec(content)) !== null) {
    const [, name, body] = enumMatch
    if (!name || !body) continue
    const values = parsePrismaEnumValues(body)
    enums.push({ name, values })
  }

  return { models, enums }
}

function parsePrismaFields(body: string): PrismaField[] {
  const fields: PrismaField[] = []
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim()
    // Skip comments, attributes, empty lines, block decls
    if (!line) continue
    if (line.startsWith("//")) continue
    if (line.startsWith("@@")) continue
    if (line.startsWith("@")) continue
    // Field line shape: `name  Type[?|[]]  @attr ...`
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)(\[\])?(\?)?/)
    if (!m) continue
    const [, name, type, listMark, optMark] = m
    if (!name || !type) continue
    fields.push({
      name,
      type,
      optional: Boolean(optMark),
      isList: Boolean(listMark),
    })
  }
  return fields
}

function parsePrismaEnumValues(body: string): string[] {
  const values: string[] = []
  for (const rawLine of body.split("\n")) {
    // Strip inline comments
    const line = rawLine.replace(/\/\/.*$/, "").trim()
    if (!line) continue
    if (line.startsWith("@")) continue
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)/)
    if (m?.[1]) values.push(m[1])
  }
  return values
}

// ---------------------------------------------------------------------------
// FE enum parser (regex)
// ---------------------------------------------------------------------------

/**
 * Matches:
 *   export const X = { KEY: "VAL", ... }
 *   export const X = "literal"
 * For object form, extracts the keys as enum values.
 * For string literal form, extracts the literal as the single value.
 */
function parseFEEnumsFromFile(
  file: string,
  content: string,
): FEEnum[] {
  const results: FEEnum[] = []
  // Object form
  const objectRe = /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\{([\s\S]*?)\n\}/gm
  let m: RegExpExecArray | null
  while ((m = objectRe.exec(content)) !== null) {
    const [, name, body] = m
    if (!name || !body) continue
    const values: string[] = []
    for (const rawLine of body.split("\n")) {
      const line = rawLine.replace(/\/\/.*$/, "").trim()
      if (!line) continue
      const km = line.match(/^['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?\s*:/)
      if (km?.[1]) values.push(km[1])
    }
    if (values.length > 0) results.push({ file, name, values })
  }
  // String/number literal form (single-value)
  const literalRe = /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*['"]([^'"]+)['"]/g
  let lm: RegExpExecArray | null
  while ((lm = literalRe.exec(content)) !== null) {
    const [, name, value] = lm
    if (!name || !value) continue
    results.push({ file, name, values: [value] })
  }
  return results
}

async function collectFEEnums(
  feRoot: string,
  feStyle: RepoPaths["feStyle"],
  introspection: RepoIntrospection,
): Promise<void> {
  const candidateDirs: string[] =
    feStyle === "backoffice-js-pages"
      ? [path.join(feRoot, "src", "enums")]
      : feStyle === "portal-ts-app"
        ? [path.join(feRoot, "enums")]
        : [path.join(feRoot, "src", "enums"), path.join(feRoot, "enums")]

  for (const dir of candidateDirs) {
    if (!(await exists(dir))) {
      introspection.missingSources.push(dir)
      continue
    }
    const entries = await safeReadDir(dir)
    for (const entry of entries) {
      if (!/\.(js|ts)$/.test(entry)) continue
      const full = path.join(dir, entry)
      const content = await safeReadFile(full)
      if (content === null) {
        introspection.missingSources.push(full)
        continue
      }
      introspection.sources.push(full)
      const parsed = parseFEEnumsFromFile(full, content)
      introspection.feEnums.push(...parsed)
      if (introspection.feEnums.length >= CAP_FE_ENUMS) return
    }
  }
}

// ---------------------------------------------------------------------------
// Endpoint signature parser
// ---------------------------------------------------------------------------

/**
 * Scans FE for axios/ApiService HTTP calls paired with the enclosing
 * `export const|function NAME` declaration.
 */
function parseEndpointsFromFile(
  file: string,
  content: string,
): EndpointSignature[] {
  const lines = content.split("\n")
  const results: EndpointSignature[] = []
  // Track the most recent export name (by line scan)
  let currentName: string | null = null
  const nameRe = /^export\s+(?:const|async\s+function|function)\s+([A-Za-z_][A-Za-z0-9_]*)/
  // axios.get(...) | ApiService.get(...) | api.get(...) | axios.get<T>(...)
  const callRe = /\b(?:axios|ApiService|api|http|client)\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>]+>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/i

  for (const line of lines) {
    const nameMatch = line.match(nameRe)
    if (nameMatch?.[1]) {
      currentName = nameMatch[1]
      continue
    }
    const callMatch = line.match(callRe)
    if (callMatch && currentName) {
      const [, method, urlPath] = callMatch
      if (!method || !urlPath) continue
      results.push({
        method: method.toUpperCase(),
        path: urlPath,
        functionName: currentName,
        file,
      })
    }
  }
  return results
}

async function walkForFiles(
  root: string,
  matcher: (file: string) => boolean,
  out: string[],
  maxFiles: number,
  depth = 0,
): Promise<void> {
  if (out.length >= maxFiles) return
  if (depth > 5) return
  const entries = await safeReadDir(root)
  for (const name of entries) {
    if (out.length >= maxFiles) return
    if (name === "node_modules" || name.startsWith(".")) continue
    const full = path.join(root, name)
    let st
    try {
      st = await stat(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      await walkForFiles(full, matcher, out, maxFiles, depth + 1)
    } else if (matcher(full)) {
      out.push(full)
    }
  }
}

async function collectEndpoints(
  feRoot: string,
  feStyle: RepoPaths["feStyle"],
  introspection: RepoIntrospection,
): Promise<void> {
  if (feStyle === "backoffice-js-pages") {
    const apiService = path.join(feRoot, "src", "services", "apiService.js")
    const content = await safeReadFile(apiService)
    if (content === null) {
      introspection.missingSources.push(apiService)
    } else {
      introspection.sources.push(apiService)
      const parsed = parseEndpointsFromFile(apiService, content)
      introspection.endpointSignatures.push(...parsed)
    }
    // Also scan the broader services dir for additional *Service.js files.
    const servicesDir = path.join(feRoot, "src", "services")
    if (await exists(servicesDir)) {
      const entries = await safeReadDir(servicesDir)
      for (const entry of entries) {
        if (!/Service\.js$/.test(entry)) continue
        if (entry === "apiService.js") continue
        const full = path.join(servicesDir, entry)
        const c = await safeReadFile(full)
        if (c === null) continue
        introspection.sources.push(full)
        introspection.endpointSignatures.push(...parseEndpointsFromFile(full, c))
        if (introspection.endpointSignatures.length >= CAP_ENDPOINTS) break
      }
    }
    return
  }

  if (feStyle === "portal-ts-app") {
    const apiRoot = path.join(feRoot, "infrastructure", "api")
    if (!(await exists(apiRoot))) {
      introspection.missingSources.push(apiRoot)
      return
    }
    const files: string[] = []
    await walkForFiles(apiRoot, (f) => /\.(ts|tsx|js|jsx)$/.test(f), files, CAP_ENDPOINTS)
    for (const file of files) {
      const c = await safeReadFile(file)
      if (c === null) continue
      introspection.sources.push(file)
      introspection.endpointSignatures.push(...parseEndpointsFromFile(file, c))
      if (introspection.endpointSignatures.length >= CAP_ENDPOINTS) break
    }
    return
  }

  // Generic fallback: try both
  for (const guess of [
    path.join(feRoot, "src", "services", "apiService.js"),
    path.join(feRoot, "infrastructure", "api"),
  ]) {
    if (await exists(guess)) {
      // Crude recursive scan
      const files: string[] = []
      const st = await stat(guess)
      if (st.isDirectory()) {
        await walkForFiles(guess, (f) => /\.(ts|tsx|js|jsx)$/.test(f), files, CAP_ENDPOINTS)
      } else {
        files.push(guess)
      }
      for (const file of files) {
        const c = await safeReadFile(file)
        if (c === null) continue
        introspection.sources.push(file)
        introspection.endpointSignatures.push(...parseEndpointsFromFile(file, c))
        if (introspection.endpointSignatures.length >= CAP_ENDPOINTS) break
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Reusable component scanner
// ---------------------------------------------------------------------------

const COMPONENT_FILE_RE = /\/(?:index|[A-Z][A-Za-z0-9]*)\.(tsx|jsx|ts|js)$/
const DEFAULT_EXPORT_NAME_RE =
  /export\s+default\s+(?:function\s+([A-Z][A-Za-z0-9_]*)|([A-Z][A-Za-z0-9_]*))/

function deriveImportPath(repoRoot: string, file: string): string {
  // Express as repo-relative import using `@/` alias when possible.
  const rel = path.relative(repoRoot, file).replace(/\\/g, "/")
  // backoffice + portal both have src/ root typically — keep relative.
  // Drop the extension for cleaner import paths.
  return rel.replace(/\.(tsx|jsx|ts|js)$/, "")
}

function deriveComponentName(file: string, content: string): string | null {
  const m = content.match(DEFAULT_EXPORT_NAME_RE)
  if (m?.[1]) return m[1]
  if (m?.[2]) return m[2]
  // Fallback: use the file name basename (no extension) if PascalCase.
  const base = path.basename(file).replace(/\.(tsx|jsx|ts|js)$/, "")
  if (base === "index") {
    // Use the parent dir name in PascalCase
    const parent = path.basename(path.dirname(file))
    if (/^[A-Z]/.test(parent)) return parent
    // kebab → Pascal
    if (/^[a-z]/.test(parent)) {
      return parent.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase())
    }
    return null
  }
  if (/^[A-Z]/.test(base)) return base
  return null
}

async function collectComponents(
  feRoot: string,
  feStyle: RepoPaths["feStyle"],
  introspection: RepoIntrospection,
): Promise<void> {
  const candidateRoots: string[] =
    feStyle === "backoffice-js-pages"
      ? [path.join(feRoot, "src", "components")]
      : feStyle === "portal-ts-app"
        ? [path.join(feRoot, "components")]
        : [
            path.join(feRoot, "src", "components"),
            path.join(feRoot, "components"),
          ]

  for (const root of candidateRoots) {
    if (!(await exists(root))) {
      introspection.missingSources.push(root)
      continue
    }
    const files: string[] = []
    await walkForFiles(
      root,
      (f) => COMPONENT_FILE_RE.test(f),
      files,
      CAP_COMPONENTS * 3,
    )
    for (const file of files) {
      if (introspection.reusableComponents.length >= CAP_COMPONENTS) break
      const content = await safeReadFile(file)
      if (content === null) continue
      const name = deriveComponentName(file, content)
      if (!name) continue
      introspection.reusableComponents.push({
        name,
        importPath: deriveImportPath(feRoot, file),
        file,
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function introspectRepo(
  repoSlug: "backoffice" | "portal-v2" | string,
  opts: IntrospectOptions = {},
): Promise<RepoIntrospection> {
  const dashRoot = resolveDashRoot(opts)
  const paths = resolveRepoPaths(repoSlug, dashRoot)

  const introspection: RepoIntrospection = {
    repoSlug,
    prismaModels: [],
    prismaEnums: [],
    feEnums: [],
    endpointSignatures: [],
    reusableComponents: [],
    sources: [],
    missingSources: [],
  }

  // Prisma — BE
  if (paths.be) {
    const schemaPath = path.join(paths.be, "prisma", "schema.prisma")
    const schema = await safeReadFile(schemaPath)
    if (schema === null) {
      introspection.missingSources.push(schemaPath)
    } else {
      introspection.sources.push(schemaPath)
      try {
        const { models, enums } = parsePrismaSchema(schema)
        introspection.prismaModels = models.slice(0, CAP_MODELS)
        introspection.prismaEnums = enums.slice(0, CAP_ENUMS)
      } catch {
        // never throw
        introspection.missingSources.push(`${schemaPath} (parse-failed)`)
      }
    }
  }

  // FE — enums + endpoints + components
  if (paths.fe) {
    if (!(await exists(paths.fe))) {
      introspection.missingSources.push(paths.fe)
    } else {
      // Best-effort, independent failures
      await collectFEEnums(paths.fe, paths.feStyle, introspection).catch((err) => {
        introspection.missingSources.push(`fe-enums (error: ${describeError(err)})`)
      })
      await collectEndpoints(paths.fe, paths.feStyle, introspection).catch((err) => {
        introspection.missingSources.push(`fe-endpoints (error: ${describeError(err)})`)
      })
      await collectComponents(paths.fe, paths.feStyle, introspection).catch((err) => {
        introspection.missingSources.push(`fe-components (error: ${describeError(err)})`)
      })
    }
  }

  // Cap (last line of defense; collectors already self-cap)
  introspection.prismaModels = introspection.prismaModels.slice(0, CAP_MODELS)
  introspection.prismaEnums = introspection.prismaEnums.slice(0, CAP_ENUMS)
  introspection.feEnums = introspection.feEnums.slice(0, CAP_FE_ENUMS)
  introspection.endpointSignatures = introspection.endpointSignatures.slice(
    0,
    CAP_ENDPOINTS,
  )
  introspection.reusableComponents = introspection.reusableComponents.slice(
    0,
    CAP_COMPONENTS,
  )

  return introspection
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}
