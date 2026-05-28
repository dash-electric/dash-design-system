/**
 * read-fe-patterns — Tier 0 Phase C / 0G (sub-task 2).
 *
 * Given a target Dash repo + a user prompt, surfaces 1-3 EXISTING component
 * files whose names are semantically close to what the prompt asks for, and
 * returns truncated bodies (head-only, ~200 lines) so the LLM can reference
 * them as "style + import pattern" anchors.
 *
 * Why a separate helper?
 *   - `repo-introspector` already lists reusable components by NAME only
 *     (import path), but never reads the bodies.
 *   - `path-resolver` + `existing-file-reader` deeply resolve a SPECIFIC file
 *     the user mentioned (so the LLM can edit it surgically), which is a
 *     DIFFERENT problem from "show me how dashboards in this repo usually
 *     look". This helper handles the latter.
 *
 * Output shape is shipped through:
 *   - prompt-composer.ts → `## Existing FE patterns in target repo` section
 *   - persisted to `runs/<runId>/intake.json` as `fePatterns: [...]` so
 *     cold-load can replay it without rescanning the repo.
 *
 * Hard constraints:
 *   - Zero npm deps. Filesystem walk + regex scoring only.
 *   - Never throw. Missing/unreadable directories return [].
 *   - Capped output (top 3 files, ~200 lines each) so prompt budget stays sane.
 *   - Skip junk dirs (node_modules / dist / .next / .git / build).
 */

import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import type { Scenario } from "./scenario-classifier.js"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * One reference component the LLM should treat as a style anchor. Excerpts
 * are head-only (the imports + the first component declaration matter most).
 */
export interface FePattern {
  /** Component name guessed from the filename (e.g. `MitraPerformanceDashboard`). */
  name: string
  /** Absolute path on disk. */
  path: string
  /** Truncated body (first N lines). */
  excerpt: string
  /** Total line count of the source file pre-truncation. */
  fullLineCount: number
  /** Match-score (higher = more relevant). Diagnostic; not consumed by the prompt. */
  score: number
}

export interface ReadFePatternsInput {
  /** User prompt — drives keyword scoring. */
  prompt: string
  /** Absolute path to the FE repo root (e.g. `/Users/foo/Work/dash/next-backoffice-web`). */
  repoRoot: string | null | undefined
  /** Intake scenario — used to skip the helper entirely for pure BE/DB work. */
  scenario?: Scenario | null
}

export interface ReadFePatternsOptions {
  /** Max number of patterns to return. Default 3. */
  topN?: number
  /** Excerpt cap in lines per file. Default 200. */
  maxLines?: number
  /** Walk depth cap. Default 6. */
  maxDepth?: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TOP_N = 3
const DEFAULT_MAX_LINES = 200
const DEFAULT_MAX_DEPTH = 6
/** Hard ceiling on files scanned per run — protects against monorepo crawls. */
const MAX_FILES_SCANNED = 800

const IGNORED_DIRS = new Set<string>([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  "coverage",
  "public",
  "static",
  "out",
  ".vercel",
])

const FE_EXTENSIONS = new Set<string>([".tsx", ".jsx", ".ts", ".js"])

/**
 * Stop-words pulled out of the prompt before keyword scoring so the noise
 * doesn't dominate. We keep it short — the goal is component-name matching,
 * not full NLP.
 */
const STOP_WORDS = new Set<string>([
  "the", "a", "an", "and", "or", "but", "of", "to", "for", "in", "on", "at",
  "with", "without", "by", "from", "is", "are", "be", "as", "this", "that",
  "these", "those", "it", "its", "page", "component", "new", "tambahin",
  "tambah", "buat", "bikin", "buatin", "di", "ke", "untuk", "dari", "yang",
  "yg", "biar", "kalo", "kalau", "bila", "saja", "aja", "juga", "biar",
])

/**
 * Filename hints we GIVE WEIGHT to even when the prompt doesn't mention
 * them — these are the canonical "this is a feature surface" suffixes the
 * Dash team uses across backoffice + portal-v2.
 */
const PATTERN_SUFFIXES = [
  "Page",
  "Dashboard",
  "List",
  "Table",
  "Detail",
  "Form",
  "Modal",
  "Drawer",
  "Card",
  "Panel",
  "Section",
  "View",
  "Index",
]

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Walk the FE repo, score every TSX/JSX/TS/JS file by relevance to the prompt,
 * read the top-N candidate bodies, and return truncated excerpts.
 *
 * Returns `[]` when:
 *   - `repoRoot` is missing / unreadable
 *   - scenario is FE-irrelevant (BE-only / DB-only schemes)
 *   - no file matched (all scores 0)
 *
 * Designed to be called BEFORE the skill chain — orchestrator threads result
 * into `ComposeInput.fePatterns`.
 */
export async function readFePatterns(
  input: ReadFePatternsInput,
  opts: ReadFePatternsOptions = {},
): Promise<FePattern[]> {
  if (!input.repoRoot) return []
  if (!input.prompt || input.prompt.trim().length === 0) return []
  if (isFeIrrelevantScenario(input.scenario)) return []

  const root = input.repoRoot
  let rootStat
  try {
    rootStat = await stat(root)
  } catch {
    return []
  }
  if (!rootStat.isDirectory()) return []

  const topN = clampPositive(opts.topN, DEFAULT_TOP_N, 8)
  const maxLines = clampPositive(opts.maxLines, DEFAULT_MAX_LINES, 1000)
  const maxDepth = clampPositive(opts.maxDepth, DEFAULT_MAX_DEPTH, 12)

  const keywords = extractKeywords(input.prompt)
  if (keywords.length === 0) {
    // Even with zero keywords we still surface the canonical "Page/Dashboard"
    // patterns — they at least teach style + import shape. But cap to topN.
  }

  const candidates: Array<{ filePath: string; score: number }> = []
  let scanned = 0

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return
    if (scanned >= MAX_FILES_SCANNED) return
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (scanned >= MAX_FILES_SCANNED) return
      if (IGNORED_DIRS.has(entry)) continue
      if (entry.startsWith(".")) continue
      const abs = path.join(dir, entry)
      let st
      try {
        st = await stat(abs)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        await walk(abs, depth + 1)
        continue
      }
      if (!st.isFile()) continue
      const ext = path.extname(entry)
      if (!FE_EXTENSIONS.has(ext)) continue
      // Skip test files + storybook stories — they pollute pattern signal.
      if (/\.(test|spec|stories)\.[tj]sx?$/.test(entry)) continue
      scanned += 1
      const score = scoreFilename(entry, keywords)
      if (score > 0) candidates.push({ filePath: abs, score })
    }
  }

  await walk(root, 0)

  if (candidates.length === 0) return []

  candidates.sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath))
  const picked = candidates.slice(0, topN)

  const patterns: FePattern[] = []
  for (const c of picked) {
    const excerpt = await readExcerpt(c.filePath, maxLines)
    if (!excerpt) continue
    patterns.push({
      name: deriveComponentName(c.filePath),
      path: c.filePath,
      excerpt: excerpt.body,
      fullLineCount: excerpt.fullLineCount,
      score: c.score,
    })
  }
  return patterns
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Pull lowercase alpha tokens out of the prompt, drop stop-words + very-short
 * tokens. Order doesn't matter — we use a set during scoring.
 */
export function extractKeywords(prompt: string): string[] {
  const out = new Set<string>()
  const tokens = prompt.toLowerCase().match(/[a-z]{3,}/g) ?? []
  for (const t of tokens) {
    if (STOP_WORDS.has(t)) continue
    out.add(t)
  }
  return [...out]
}

/**
 * Score a candidate filename. Higher = more relevant.
 *
 * Heuristics:
 *   - Each prompt keyword found inside the filename (lowercase) = +5
 *   - Filename ends with a PATTERN_SUFFIXES word (Page / Dashboard / …) = +3
 *   - `index` filenames get a small bonus (+1) because they typically hold
 *     the canonical page/feature root.
 *   - Files inside a "page"/"pages"/"app" dir get +2 (route surfaces).
 */
export function scoreFilename(filename: string, keywords: string[]): number {
  const base = path.basename(filename, path.extname(filename))
  const lower = base.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 5
  }
  for (const suffix of PATTERN_SUFFIXES) {
    if (base.endsWith(suffix)) {
      score += 3
      break
    }
  }
  if (lower === "index") score += 1
  // Note: we don't score by parent directory here because we don't have it
  // in this helper — main `walk` could add it but we keep scoring local.
  return score
}

// ---------------------------------------------------------------------------
// Excerpt reader
// ---------------------------------------------------------------------------

async function readExcerpt(
  filePath: string,
  maxLines: number,
): Promise<{ body: string; fullLineCount: number } | null> {
  let raw: string
  try {
    raw = await readFile(filePath, "utf8")
  } catch {
    return null
  }
  const lines = raw.split("\n")
  if (lines.length <= maxLines) {
    return { body: raw, fullLineCount: lines.length }
  }
  const head = lines.slice(0, maxLines).join("\n")
  const body = `${head}\n// ...[truncated ${lines.length - maxLines} more lines]...`
  return { body, fullLineCount: lines.length }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map common scenarios to whether FE patterns help.
 *   - extend_fe_be_db / new_product / extend_fe_be / fe_only / update_existing → YES
 *   - (none today exclude FE patterns since every change touches a UI eventually)
 *
 * We keep the function around so the orchestrator can short-circuit later if
 * a "pure BE migration" scenario is added.
 */
function isFeIrrelevantScenario(scenario: Scenario | null | undefined): boolean {
  if (!scenario) return false
  // Today all scenarios touch FE somewhere; reserve for future expansion.
  return false
}

function deriveComponentName(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath))
  if (base === "index") {
    // Use the parent dir name capitalised so "providers/index.tsx" → "Providers".
    const parent = path.basename(path.dirname(filePath))
    if (parent && parent !== "/") return capitalise(parent)
    return "Index"
  }
  return base
}

function capitalise(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function clampPositive(value: number | undefined, fallback: number, max: number): number {
  if (value === undefined || value === null) return fallback
  if (!Number.isFinite(value)) return fallback
  if (value <= 0) return fallback
  return Math.min(value, max)
}
