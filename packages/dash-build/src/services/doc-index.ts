/**
 * Doc Index Service — Open WebUI `#` document-attach adoption.
 * ---------------------------------------------------------------------------
 * Scans configured doc roots (Obsidian vault, repo docs, registry rules), and
 * surfaces a flat list of markdown files the composer's `#` autocomplete can
 * filter by filename prefix. On demand, returns the full body of one doc so
 * the orchestrator can inject it into the LLM prompt as a "## Referenced
 * documents" section.
 *
 * Doc roots come from (in order):
 *   1. `DASH_BUILD_DOC_ROOTS` env (comma-separated absolute paths)
 *   2. Default candidates:
 *        - Obsidian vault: `<HOME>/Documents/Obsidian/Irfan-Vault/02-Projects/Product-Design/Dash`
 *        - Repo: `packages/dash-build/docs`
 *        - Registry rules: `apps/docs/registry`
 *
 * Trust boundary: doc IDs are derived from the absolute path via a stable
 * hash so a hostile `?q=` can NOT escape the configured roots. The body
 * endpoint always re-validates the resolved path lives under one of the
 * registered roots before reading.
 *
 * Zero npm deps. Filesystem walk + regex match. Lazy first-request index +
 * 5min TTL cache.
 */

import { promises as fs, existsSync } from "node:fs"
import { createHash } from "node:crypto"
import { homedir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DocIndexEntry {
  /** Stable opaque id (hash of absolute path). Safe to expose to clients. */
  id: string
  /** Basename without extension — what users type after `#`. */
  name: string
  /** Display path relative to its doc root. */
  path: string
  /** Short body excerpt (first ~160 chars, single line). */
  excerpt: string
  /** Original absolute path on disk. NOT exposed via the autocomplete list. */
  absPath: string
  /** Source root index — used for logging/debugging. */
  rootIndex: number
  /** Byte size of the doc on disk. */
  size: number
}

/**
 * Public shape for autocomplete (`/api/docs?q=…`) responses. `absPath` and
 * `rootIndex` are stripped so we don't leak filesystem internals to the
 * browser.
 */
export interface PublicDocIndexEntry {
  id: string
  name: string
  path: string
  excerpt: string
}

export interface DocBody {
  id: string
  name: string
  path: string
  body: string
  size: number
}

export interface DocIndexOptions {
  /** Override doc roots — bypass env + defaults. */
  roots?: string[]
  /** Cache TTL in ms. Defaults to 5 minutes. */
  ttlMs?: number
  /** Walk depth cap. Defaults to 6. */
  maxDepth?: number
  /** Total files scanned ceiling. Defaults to 5000. */
  maxFiles?: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TTL_MS = 5 * 60 * 1000
const DEFAULT_MAX_DEPTH = 6
const DEFAULT_MAX_FILES = 5000
/** Hard cap on body size returned. Anything larger gets truncated with notice. */
const MAX_BODY_BYTES = 256 * 1024

const IGNORED_DIRS = new Set<string>([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  "coverage",
  ".vercel",
  ".obsidian",
])

const MD_EXTENSIONS = new Set<string>([".md", ".mdx"])

// ---------------------------------------------------------------------------
// Default roots
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Resolve the dash-build package root from the compiled location. Mirrors
 * the resolution pattern in themes.ts/preview-template.
 */
function resolveDashBuildRoot(): string {
  // src/services/doc-index.ts → src → packages/dash-build
  // dist/...               → dist → packages/dash-build
  return path.resolve(__dirname, "..", "..")
}

function defaultRoots(): string[] {
  const out: string[] = []

  // Repo: packages/dash-build/docs
  const pkgRoot = resolveDashBuildRoot()
  const pkgDocs = path.join(pkgRoot, "docs")
  if (existsSync(pkgDocs)) out.push(pkgDocs)

  // Registry rules: apps/docs/registry (one up from packages/dash-build)
  const repoRoot = path.resolve(pkgRoot, "..", "..")
  const registryDocs = path.join(repoRoot, "apps", "docs", "registry")
  if (existsSync(registryDocs)) out.push(registryDocs)

  // Obsidian vault — only resolve in dev / non-CI envs where the HOME
  // directory matches the Dash project layout. We probe a known subfolder
  // so test/CI environments never accidentally scan a real vault.
  const home = homedir()
  if (home) {
    const vault = path.join(
      home,
      "Documents",
      "Obsidian",
      "Irfan-Vault",
      "02-Projects",
      "Product-Design",
      "Dash",
    )
    if (existsSync(vault)) out.push(vault)
  }

  return out
}

function envRoots(): string[] | null {
  const raw = process.env.DASH_BUILD_DOC_ROOTS
  if (!raw) return null
  const split = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (split.length === 0) return null
  return split
}

/**
 * Resolve the configured doc roots in priority order:
 *   1. Explicit `opts.roots`
 *   2. `DASH_BUILD_DOC_ROOTS` env
 *   3. Defaults (repo docs + registry + vault)
 *
 * Each root is verified to exist; nonexistent paths are silently dropped so
 * a stale env override doesn't crash the daemon.
 */
export function resolveDocRoots(opts: { roots?: string[] } = {}): string[] {
  const raw = opts.roots ?? envRoots() ?? defaultRoots()
  const out: string[] = []
  for (const r of raw) {
    if (!r) continue
    if (!path.isAbsolute(r)) continue // refuse relative paths — surface in env
    if (!existsSync(r)) continue
    out.push(r)
  }
  return out
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  builtAt: number
  rootsKey: string
  entries: DocIndexEntry[]
  byId: Map<string, DocIndexEntry>
}

let cache: CacheEntry | null = null

function rootsCacheKey(roots: string[]): string {
  return roots.join("|")
}

/**
 * Clear the in-process cache. Exposed for tests so each describe block starts
 * with a fresh scan.
 */
export function resetDocIndexCache(): void {
  cache = null
}

// ---------------------------------------------------------------------------
// Index build
// ---------------------------------------------------------------------------

function hashId(absPath: string): string {
  return createHash("sha1").update(absPath).digest("hex").slice(0, 16)
}

async function walk(
  dir: string,
  rootIndex: number,
  rootPath: string,
  depth: number,
  maxDepth: number,
  budget: { scanned: number; maxFiles: number },
  out: DocIndexEntry[],
): Promise<void> {
  if (depth > maxDepth) return
  if (budget.scanned >= budget.maxFiles) return
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    if (budget.scanned >= budget.maxFiles) return
    if (IGNORED_DIRS.has(entry)) continue
    if (entry.startsWith(".")) continue
    const abs = path.join(dir, entry)
    let st
    try {
      st = await fs.stat(abs)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      await walk(abs, rootIndex, rootPath, depth + 1, maxDepth, budget, out)
      continue
    }
    if (!st.isFile()) continue
    const ext = path.extname(entry).toLowerCase()
    if (!MD_EXTENSIONS.has(ext)) continue
    budget.scanned += 1
    const name = path.basename(entry, path.extname(entry))
    const rel = path.relative(rootPath, abs)
    out.push({
      id: hashId(abs),
      name,
      path: rel,
      excerpt: "", // filled on body-read lazily; keep index light
      absPath: abs,
      rootIndex,
      size: st.size,
    })
  }
}

/**
 * Read the first non-empty paragraph (~160 chars) for the excerpt. Stripped
 * of frontmatter, headings, and code-fence markers so the dropdown line stays
 * scannable.
 */
async function readExcerpt(absPath: string): Promise<string> {
  let raw: string
  try {
    raw = await fs.readFile(absPath, "utf8")
  } catch {
    return ""
  }
  // Strip YAML frontmatter if present.
  if (raw.startsWith("---")) {
    const close = raw.indexOf("\n---", 3)
    if (close >= 0) raw = raw.slice(close + 4)
  }
  const lines = raw.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Skip pure heading + code-fence + html comment lines.
    if (trimmed.startsWith("#")) continue
    if (trimmed.startsWith("```")) continue
    if (trimmed.startsWith("<!--")) continue
    if (trimmed.startsWith(">")) continue // blockquote prefix
    const clean = trimmed.replace(/\s+/g, " ")
    return clean.length > 160 ? `${clean.slice(0, 160)}…` : clean
  }
  return ""
}

/**
 * Build (or rebuild) the index. Iterates every configured root, fills the
 * in-process cache, and returns the entries.
 *
 * `force=true` bypasses the TTL check. Use sparingly — every rebuild walks
 * the filesystem.
 */
export async function buildDocIndex(
  opts: DocIndexOptions = {},
  force = false,
): Promise<DocIndexEntry[]> {
  const roots = resolveDocRoots({ roots: opts.roots })
  const key = rootsCacheKey(roots)
  const ttl = opts.ttlMs ?? DEFAULT_TTL_MS
  const maxDepth = opts.maxDepth ?? DEFAULT_MAX_DEPTH
  const maxFiles = opts.maxFiles ?? DEFAULT_MAX_FILES

  if (
    !force &&
    cache &&
    cache.rootsKey === key &&
    Date.now() - cache.builtAt < ttl
  ) {
    return cache.entries
  }

  const out: DocIndexEntry[] = []
  const budget = { scanned: 0, maxFiles }
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]!
    await walk(root, i, root, 0, maxDepth, budget, out)
  }
  // Sort deterministically — name first, then path — so identical queries
  // return identical ordering across rebuilds.
  out.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path))
  const byId = new Map<string, DocIndexEntry>()
  for (const e of out) byId.set(e.id, e)
  cache = { builtAt: Date.now(), rootsKey: key, entries: out, byId }
  return out
}

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

export interface QueryDocsInput {
  /** Filter — case-insensitive substring match on filename (without ext). */
  q?: string
  /** Result cap. Defaults to 10. */
  limit?: number
  /** Forwarded to buildDocIndex. */
  options?: DocIndexOptions
}

/**
 * Autocomplete query. Empty/missing `q` returns up to `limit` of the head of
 * the index (alphabetical) so the dropdown is useful right after the user
 * types just `#`.
 */
export async function queryDocs(
  input: QueryDocsInput = {},
): Promise<PublicDocIndexEntry[]> {
  const limit = Math.max(1, Math.min(50, input.limit ?? 10))
  const entries = await buildDocIndex(input.options)
  const q = (input.q ?? "").trim().toLowerCase()
  const filtered = q
    ? entries.filter((e) => e.name.toLowerCase().includes(q))
    : entries.slice(0, limit * 4) // generous head so prefix-rank can pick best
  // Re-rank: prefix matches first, then substring, then alphabetical.
  if (q) {
    filtered.sort((a, b) => {
      const an = a.name.toLowerCase()
      const bn = b.name.toLowerCase()
      const aPref = an.startsWith(q) ? 0 : 1
      const bPref = bn.startsWith(q) ? 0 : 1
      if (aPref !== bPref) return aPref - bPref
      return an.localeCompare(bn)
    })
  }
  const picked = filtered.slice(0, limit)
  // Lazy-fill excerpts only for the picked subset — keeps the index light
  // when the user is typing fast.
  const out: PublicDocIndexEntry[] = []
  for (const e of picked) {
    let excerpt = e.excerpt
    if (!excerpt) {
      excerpt = await readExcerpt(e.absPath)
      e.excerpt = excerpt // cache on the index entry
    }
    out.push({ id: e.id, name: e.name, path: e.path, excerpt })
  }
  return out
}

/**
 * Body fetch — returns the full file content (capped at MAX_BODY_BYTES).
 * Returns `null` when the id is unknown or the file disappeared between
 * index + fetch. Always re-validates that the resolved path is under one
 * of the configured roots before reading.
 */
export async function readDocBody(
  id: string,
  opts: DocIndexOptions = {},
): Promise<DocBody | null> {
  if (!id || typeof id !== "string") return null
  if (!/^[a-f0-9]{8,64}$/.test(id)) return null
  await buildDocIndex(opts)
  const entry = cache?.byId.get(id) ?? null
  if (!entry) return null
  const roots = resolveDocRoots({ roots: opts.roots })
  // Defence-in-depth: re-confirm the entry's absPath sits under one of the
  // active roots. This catches stale cache after a root was unset.
  const underRoot = roots.some((r) => {
    const rel = path.relative(r, entry.absPath)
    return rel && !rel.startsWith("..") && !path.isAbsolute(rel)
  })
  if (!underRoot) return null
  let raw: string
  try {
    raw = await fs.readFile(entry.absPath, "utf8")
  } catch {
    return null
  }
  let body = raw
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    body = `${body.slice(0, MAX_BODY_BYTES)}\n\n…[truncated — full doc ${entry.size} bytes]`
  }
  return {
    id: entry.id,
    name: entry.name,
    path: entry.path,
    body,
    size: entry.size,
  }
}

/**
 * Batch-fetch — used by the prompt-composer wiring so it can hydrate
 * multiple attached docs in one shot. Missing ids are silently dropped so a
 * stale chip in the composer doesn't fail the whole submit.
 */
export async function readDocBodies(
  ids: string[],
  opts: DocIndexOptions = {},
): Promise<DocBody[]> {
  if (!Array.isArray(ids) || ids.length === 0) return []
  // De-dupe + cap to a sane upper bound so a malicious payload can't read
  // hundreds of docs.
  const unique = Array.from(new Set(ids)).slice(0, 20)
  const out: DocBody[] = []
  for (const id of unique) {
    const doc = await readDocBody(id, opts)
    if (doc) out.push(doc)
  }
  return out
}

/**
 * Render the "Referenced documents" markdown block for the LLM prompt. Each
 * doc is rendered with its display path + a fenced markdown body so the
 * model can quote it back when relevant.
 *
 * Returns an empty string when no docs were resolved — caller can safely
 * concatenate the result unconditionally.
 */
export function renderReferencedDocsBlock(docs: DocBody[]): string {
  if (!Array.isArray(docs) || docs.length === 0) return ""
  const lines: string[] = []
  lines.push("## Referenced documents")
  lines.push("")
  lines.push(
    `The user attached ${docs.length} document(s) via the composer \`#\` ` +
      `picker. Treat each as authoritative context for the request — do NOT ` +
      `re-derive product/PRD details that conflict with the attached docs.`,
  )
  lines.push("")
  for (const d of docs) {
    lines.push(`### ${d.name}`)
    lines.push(`Path: ${d.path}`)
    lines.push("")
    lines.push("```markdown")
    lines.push(d.body.trimEnd())
    lines.push("```")
    lines.push("")
  }
  return lines.join("\n").trimEnd()
}
