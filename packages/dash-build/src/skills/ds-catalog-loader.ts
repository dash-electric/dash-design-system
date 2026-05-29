/**
 * Dash Design System catalog loader.
 *
 * Reads `apps/docs/registry.json` to surface the canonical list of `@dash/kit`
 * atoms (Layer 1 components) and Layer 3 blocks the model can `import` from.
 * Also loads the compressed AI rules + domain glossary so the system prompt
 * has the full context block — not just the Layer 0 cardinal rules.
 *
 * Why this exists: end-to-end testing 2026-05-28 confirmed the generator was
 * emitting raw `<div className="bg-success-light">` markup instead of
 * `<Badge variant="success">…</Badge>` because the model had NO idea the
 * Badge atom existed. The skill chain only loaded design.md + Layer 0 rules
 * — never the registry catalog. This module closes that gap.
 *
 * Token-conscious: cap the inline catalog block to ~80 atoms + ~30 blocks so
 * the prompt stays under budget. Domain glossary is large (1982 lines) so we
 * truncate to the top-N entries by default and let the caller opt into full.
 *
 * Best-effort: every read is independently optional. Missing files degrade
 * gracefully to empty strings so legacy callers (CLI smoke / direct chain
 * tests / non-dash-ds clones) keep working.
 */

import { promises as fs, existsSync } from "node:fs"
import path from "node:path"
import { findRepoRoot } from "./design-loader.js"
import { createMcpClientFromEnv, type DashDsMcpClient } from "./mcp-client.js"

export interface DSCatalogAtom {
  /** Registry name as it appears in registry.json (kebab-case). */
  name: string
  /** Human-readable title. */
  title: string
  /** Short description — usually includes variant/style/size enumeration. */
  description: string
  /** Categories tags from registry (e.g. ["component","displaying-data"]). */
  categories: string[]
  /** Registry type — "registry:ui" | "registry:block" | "registry:page" | … */
  type: string
}

export interface DSCatalog {
  /** Layer 1 atoms (registry:ui). */
  atoms: DSCatalogAtom[]
  /** Layer 3 blocks (registry:block). */
  blocks: DSCatalogAtom[]
  /** Layer 3 templates / page layouts (registry:page). */
  templates: DSCatalogAtom[]
  /** Total raw count across all types. */
  total: number
  /** Source file actually read. */
  source: string | null
}

export interface DSContext {
  catalog: DSCatalog
  /** Compressed AI rules content (from dash-ai-rules.compressed.md). */
  compressedRules: string
  /** Domain glossary content (truncated to the entries section). */
  domainGlossary: string
  /** Source paths that were actually loaded. */
  loadedSources: string[]
  /** Source paths that could not be read (warnings, not errors). */
  missingSources: string[]
}

export interface LoadDSContextOpts {
  /** Repo root override. Defaults to walking up from cwd. */
  repoRoot?: string
  /** cwd to start search from when `repoRoot` is unset. */
  cwd?: string
  /** Cap atoms rendered in the catalog block. Defaults to 80 (covers all today). */
  maxAtoms?: number
  /** Cap blocks rendered. Defaults to 30. */
  maxBlocks?: number
  /** Cap templates rendered. Defaults to 20. */
  maxTemplates?: number
  /** Cap domain glossary character budget. Defaults to ~12K chars. */
  glossaryCharBudget?: number
  /**
   * MCP client override (test injection). When omitted, the default client is
   * built from `DASH_DS_MCP_URL`; unset → MCP branch skipped, FS path runs.
   */
  mcpClient?: DashDsMcpClient | null
}

interface RawRegistryItem {
  name?: string
  title?: string
  description?: string
  type?: string
  categories?: string[]
}

interface RawRegistry {
  items?: RawRegistryItem[]
}

const EMPTY_CATALOG: DSCatalog = {
  atoms: [],
  blocks: [],
  templates: [],
  total: 0,
  source: null,
}

async function tryReadText(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8")
  } catch {
    return null
  }
}

async function tryReadJson<T>(p: string): Promise<T | null> {
  const txt = await tryReadText(p)
  if (!txt) return null
  try {
    return JSON.parse(txt) as T
  } catch {
    return null
  }
}

function normalizeItem(raw: RawRegistryItem): DSCatalogAtom | null {
  if (!raw.name || typeof raw.name !== "string") return null
  return {
    name: raw.name,
    title: raw.title ?? raw.name,
    description: raw.description ?? "",
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    type: raw.type ?? "unknown",
  }
}

export function parseRegistry(raw: RawRegistry | null): DSCatalog {
  if (!raw || !Array.isArray(raw.items)) return { ...EMPTY_CATALOG }
  const atoms: DSCatalogAtom[] = []
  const blocks: DSCatalogAtom[] = []
  const templates: DSCatalogAtom[] = []
  for (const item of raw.items) {
    const normalized = normalizeItem(item)
    if (!normalized) continue
    if (normalized.type === "registry:ui") atoms.push(normalized)
    else if (normalized.type === "registry:block") blocks.push(normalized)
    else if (normalized.type === "registry:page") templates.push(normalized)
  }
  // Stable alpha order for deterministic prompts.
  atoms.sort((a, b) => a.name.localeCompare(b.name))
  blocks.sort((a, b) => a.name.localeCompare(b.name))
  templates.sort((a, b) => a.name.localeCompare(b.name))
  return {
    atoms,
    blocks,
    templates,
    total: atoms.length + blocks.length + templates.length,
    source: null,
  }
}

/** Truncate the long domain glossary while preserving the entries section. */
export function truncateGlossary(text: string, charBudget: number): string {
  if (!text) return ""
  if (text.length <= charBudget) return text
  // Try to keep the head (table of contents + first N entries) — that's
  // where DRV-/SUS-/HALO- prefixes + mitra entity get defined.
  const head = text.slice(0, charBudget)
  // Cut at the last newline so we don't break mid-entry.
  const lastNl = head.lastIndexOf("\n\n")
  const safeCut = lastNl > charBudget * 0.6 ? head.slice(0, lastNl) : head
  return safeCut + "\n\n…(glossary truncated to fit prompt budget)"
}

/** Format a single atom as a one-line catalog entry. */
function formatAtomLine(atom: DSCatalogAtom): string {
  // Strip trailing periods / collapse whitespace so the prompt looks clean.
  const desc = atom.description.replace(/\s+/g, " ").trim()
  if (!desc) return `- \`${atom.name}\` (${atom.title})`
  // Cap per-entry desc to ~180 chars — enough to capture variant lists.
  const trimmed = desc.length > 180 ? desc.slice(0, 177) + "…" : desc
  return `- \`${atom.name}\` (${atom.title}) — ${trimmed}`
}

/** Render the catalog as a markdown block suitable for system-prompt injection. */
export function renderDSCatalogBlock(catalog: DSCatalog, opts: LoadDSContextOpts = {}): string {
  const maxAtoms = opts.maxAtoms ?? 80
  const maxBlocks = opts.maxBlocks ?? 30
  const maxTemplates = opts.maxTemplates ?? 20

  const lines: string[] = []
  lines.push(
    `Dash DS registry catalog (Layer 1 atoms + Layer 3 blocks + templates).`,
    `Total registry items: ${catalog.total}. Source: ${catalog.source ?? "(unresolved)"}`,
    "",
    `Layer 1 atoms (\`import { X } from "@dash/kit"\`) — ${catalog.atoms.length} available:`,
    "",
  )
  for (const atom of catalog.atoms.slice(0, maxAtoms)) {
    lines.push(formatAtomLine(atom))
  }
  if (catalog.atoms.length > maxAtoms) {
    lines.push(`- …(+${catalog.atoms.length - maxAtoms} more atoms — run \`dash search\` for the full list)`)
  }

  if (catalog.blocks.length > 0) {
    lines.push("")
    lines.push(`Layer 3 blocks (\`import … from "@dash/blocks/…"\`) — ${catalog.blocks.length} available:`)
    lines.push("")
    for (const block of catalog.blocks.slice(0, maxBlocks)) {
      lines.push(formatAtomLine(block))
    }
    if (catalog.blocks.length > maxBlocks) {
      lines.push(`- …(+${catalog.blocks.length - maxBlocks} more blocks)`)
    }
  }

  if (catalog.templates.length > 0) {
    lines.push("")
    lines.push(`Templates (page-level scaffolds) — ${catalog.templates.length} available:`)
    lines.push("")
    for (const tmpl of catalog.templates.slice(0, maxTemplates)) {
      lines.push(formatAtomLine(tmpl))
    }
    if (catalog.templates.length > maxTemplates) {
      lines.push(`- …(+${catalog.templates.length - maxTemplates} more templates)`)
    }
  }

  return lines.join("\n")
}

/** Locate registry.json starting from a candidate repo root. */
function locateRegistryJson(repoRoot: string): string {
  return path.join(repoRoot, "apps", "docs", "registry.json")
}

function locateCompressedRules(repoRoot: string): string {
  return path.join(repoRoot, "apps", "docs", "registry", "rules", "dash-ai-rules.compressed.md")
}

function locateDomainGlossary(repoRoot: string): string {
  return path.join(repoRoot, "apps", "docs", "registry", "rules", "dash-domain-glossary.md")
}

/**
 * Best-effort loader. Always resolves; never throws. Returns an empty/degraded
 * DSContext when the repo isn't dash-ds (or registry.json was never built).
 */
export async function loadDSContext(opts: LoadDSContextOpts = {}): Promise<DSContext> {
  const budgetMcp = opts.glossaryCharBudget ?? 12_000

  // MCP-first branch (boundary spec §4). Gated on an injected client or
  // DASH_DS_MCP_URL; falls through to the FS reads below on ANY error.
  const mcpClient = opts.mcpClient !== undefined ? opts.mcpClient : createMcpClientFromEnv()
  if (mcpClient) {
    try {
      const [catalogRaw, rulesText, glossaryRaw] = await Promise.all([
        mcpClient.getCatalogRaw(),
        mcpClient.getCompressedRules(),
        mcpClient.getGlossary(),
      ])
      const catalog = parseRegistry(catalogRaw)
      catalog.source = mcpClient.source
      return {
        catalog,
        compressedRules: rulesText,
        domainGlossary: truncateGlossary(glossaryRaw, budgetMcp),
        loadedSources: [mcpClient.source],
        missingSources: [],
      }
    } catch {
      /* fall through to FS — boundary fallback */
    }
  }

  const cwd = opts.cwd ?? process.cwd()
  const repoRoot = opts.repoRoot ?? findRepoRoot(cwd)
  const loaded: string[] = []
  const missing: string[] = []

  const registryPath = locateRegistryJson(repoRoot)
  const rulesPath = locateCompressedRules(repoRoot)
  const glossaryPath = locateDomainGlossary(repoRoot)

  const [registryRaw, rulesText, glossaryText] = await Promise.all([
    tryReadJson<RawRegistry>(registryPath),
    tryReadText(rulesPath),
    tryReadText(glossaryPath),
  ])

  const catalog = parseRegistry(registryRaw)
  if (registryRaw) {
    catalog.source = registryPath
    loaded.push(registryPath)
  } else {
    missing.push(registryPath)
  }

  if (rulesText) loaded.push(rulesPath)
  else missing.push(rulesPath)

  if (glossaryText) loaded.push(glossaryPath)
  else missing.push(glossaryPath)

  const budget = opts.glossaryCharBudget ?? 12_000
  return {
    catalog,
    compressedRules: rulesText ?? "",
    domainGlossary: truncateGlossary(glossaryText ?? "", budget),
    loadedSources: loaded,
    missingSources: missing,
  }
}

/** Convenience: probe whether registry.json exists at the resolved repo root. */
export function hasRegistry(repoRoot: string): boolean {
  return existsSync(locateRegistryJson(repoRoot))
}
