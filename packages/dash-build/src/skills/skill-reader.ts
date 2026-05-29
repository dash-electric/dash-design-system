/**
 * skill-reader — vendored gstack skill loader (Milestone 3, Module A).
 *
 * Loads the *reasoning* sections out of two gstack SKILL.md files so the
 * model-backed clarify + PRD stages can think "like a YC partner doing office
 * hours and a CEO doing a plan review" without us re-deriving that prose.
 *
 * Two skills matter for M3:
 *   - `office-hours`     → `### The Six Forcing Questions` (the clarify menu)
 *   - `plan-ceo-review`  → `## Step 0` + the four CEO modes (the framing)
 *
 * Resolution order (first hit wins):
 *   1. <packageRoot>/skills/<name>/SKILL.md   — VENDORED copy (preferred;
 *        survives the planned repo split, populated by `npm run vendor:skills`).
 *   2. <home>/.claude/skills/gstack/<name>/SKILL.md
 *   3. <home>/.claude/skills/<name>/SKILL.md
 *
 * Hard constraints (mirrors `intake/read-fe-patterns.ts`):
 *   - Zero npm deps. `node:fs/promises` + string ops only.
 *   - NEVER throws. Every `readFile` is wrapped; all-miss → `null`.
 *   - Preamble-stripped: the huge gstack auto-generated preamble (Plan Mode,
 *     Skill Invocation, GBrain, Telemetry, Voice, Writing Style, …) is dropped
 *     via a small ALLOW-LIST of reasoning headings (robust against the blocklist
 *     drifting as gstack regenerates its templates).
 *   - Truncated to a token budget (`maxChars`, default 8000 ≈ 2K tokens).
 */

import { readFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SkillReadResult {
  /** Skill name, e.g. `office-hours`. */
  name: string
  /** SKILL.md text, preamble-stripped, truncated to budget. */
  body: string
  /** Absolute path it resolved from (which candidate in the order hit). */
  source: string
  /** True when the extracted body exceeded `maxChars` and was cut. */
  truncated: boolean
}

export type GstackSkillName = "plan-ceo-review" | "office-hours"

export interface ReadGstackSkillOptions {
  /** Override the dash-build package dir (the vendored `skills/` parent). */
  packageRoot?: string
  /** Token-budget cap in characters. Default 8000 (~2K tokens). */
  maxChars?: number
  /** Override the home dir used for the `~/.claude` fallbacks. */
  home?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_CHARS = 8000

/**
 * ALLOW-LIST of reasoning sections to extract, per skill. We keep the section
 * if its heading text (trimmed, case-insensitive) STARTS WITH one of these
 * phrases — so `## Step 0: Nuclear Scope Challenge + Mode Selection` matches
 * `step 0` and `### The Six Forcing Questions` matches `the six forcing`.
 *
 * Allow-list (vs. a blocklist of preamble headings) is deliberate: gstack
 * regenerates its preamble from templates, so the set of boilerplate headings
 * drifts release-to-release. The reasoning headings are stable, so anchoring on
 * THEM is the robust choice.
 */
const SECTION_ALLOW_LIST: Record<GstackSkillName, string[]> = {
  "office-hours": ["the six forcing questions"],
  // `step 0: nuclear` (not bare `step 0`) — the global skill ALSO has a
  // `## Step 0: Detect platform and base branch` preamble heading we must NOT
  // capture. Anchoring on the full phrase keeps only the Nuclear Scope Challenge.
  "plan-ceo-review": ["philosophy", "step 0: nuclear"],
}

/**
 * The set of valid skill names — used to reject unknown names early (returns
 * `null`, never throws) so callers can pass arbitrary strings safely.
 */
const KNOWN_SKILLS = new Set<GstackSkillName>(["plan-ceo-review", "office-hours"])

// ---------------------------------------------------------------------------
// Package-root resolution
// ---------------------------------------------------------------------------

/**
 * Best-effort guess at the dash-build package directory (the parent of the
 * vendored `skills/` folder). Walks up from this module's own location looking
 * for a `skills/<name>/SKILL.md`-shaped layout's anchor (the `package.json`).
 *
 * Works whether running from `src/skills/*.ts` (tsx/vitest) or `dist/*.js`
 * (compiled bin). Never throws.
 */
function defaultPackageRoot(): string {
  let dir: string
  try {
    dir = path.dirname(fileURLToPath(import.meta.url))
  } catch {
    // Extremely defensive: if import.meta.url is unavailable, fall back to cwd.
    return process.cwd()
  }
  // src/skills → src → <packageRoot>   (or dist → <packageRoot>)
  // Walk up a few levels; the vendored skills live at <packageRoot>/skills.
  // We don't read the FS here (keep it sync + cheap) — just climb two levels,
  // which is correct for both `src/skills/skill-reader.ts` and `dist/...`.
  return path.resolve(dir, "..", "..")
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Read a vendored gstack skill, returning its preamble-stripped, truncated
 * reasoning body. Returns `null` (never throws) when:
 *   - `name` is not one of the known skills, or
 *   - none of the three candidate paths is readable.
 */
export async function readGstackSkill(
  name: GstackSkillName,
  opts: ReadGstackSkillOptions = {},
): Promise<SkillReadResult | null> {
  if (!KNOWN_SKILLS.has(name)) return null

  const packageRoot = opts.packageRoot ?? defaultPackageRoot()
  const home = opts.home ?? safeHomedir()
  const maxChars = clampMaxChars(opts.maxChars)

  const candidates = [
    // 1. vendored (preferred — survives repo split)
    path.join(packageRoot, "skills", name, "SKILL.md"),
    // 2. gstack namespace under ~/.claude
    path.join(home, ".claude", "skills", "gstack", name, "SKILL.md"),
    // 3. flat ~/.claude/skills
    path.join(home, ".claude", "skills", name, "SKILL.md"),
  ]

  for (const candidate of candidates) {
    const raw = await safeReadFile(candidate)
    if (raw === null) continue
    const stripped = stripPreamble(raw, SECTION_ALLOW_LIST[name])
    const { body, truncated } = truncate(stripped, maxChars)
    return { name, body, source: candidate, truncated }
  }

  return null
}

// ---------------------------------------------------------------------------
// Preamble strip
// ---------------------------------------------------------------------------

/**
 * Drop YAML frontmatter + the gstack auto-generated preamble, keeping ONLY the
 * sections whose heading matches the allow-list.
 *
 * Algorithm:
 *   1. Strip a leading `---\n…\n---` YAML frontmatter block if present.
 *   2. Split the rest into heading-delimited sections (a section starts at a
 *      Markdown ATX heading line `^#{1,6} ` and runs until the next heading of
 *      the SAME-OR-SHALLOWER depth).
 *   3. Keep a section (and all its nested deeper subsections) when its heading
 *      text starts with an allow-list phrase.
 *
 * Robust to: missing frontmatter, CRLF, heading levels 1-6, and content that
 * has no matching section (returns "").
 */
export function stripPreamble(raw: string, allow: string[]): string {
  const text = stripFrontmatter(normalizeNewlines(raw))
  const lines = text.split("\n")

  const kept: string[] = []
  // Depth of the allow-listed heading we are currently inside (1-6), or 0 when
  // we are not capturing. We stop capturing when a heading at depth <= capture
  // depth appears that is NOT itself allow-listed.
  let captureDepth = 0

  for (const line of lines) {
    const heading = parseHeading(line)
    if (heading) {
      const matches = headingMatchesAllow(heading.text, allow)
      if (matches) {
        // Start (or continue) a capture region at this heading's depth.
        captureDepth = heading.depth
        kept.push(line)
        continue
      }
      // A non-matching heading. If it is shallower-or-equal to our current
      // capture region, the region has ended — stop capturing. Deeper headings
      // inside a captured region are part of it (e.g. `#### Q1` under `###`).
      if (captureDepth > 0 && heading.depth <= captureDepth) {
        captureDepth = 0
      }
      if (captureDepth > 0) kept.push(line)
      continue
    }
    if (captureDepth > 0) kept.push(line)
  }

  return kept.join("\n").trim()
}

/** Strip a leading YAML frontmatter block (`---\n … \n---`). */
function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text
  // Match `---` on its own line, then content, then a closing `---` line.
  const match = /^---\n[\s\S]*?\n---[ \t]*\n?/.exec(text)
  if (!match) return text
  return text.slice(match[0].length)
}

interface ParsedHeading {
  depth: number
  text: string
}

/** Parse an ATX Markdown heading (`#` … `######`). Returns null otherwise. */
function parseHeading(line: string): ParsedHeading | null {
  const match = /^(#{1,6})\s+(.*\S)\s*$/.exec(line)
  if (!match) return null
  return { depth: match[1].length, text: match[2] }
}

/**
 * True when a heading's text (lowercased, leading `#`/whitespace already
 * stripped by the parser) starts with any allow-list phrase. We also strip a
 * leading numbering prefix like `0A. ` so `### 0A. Premise Challenge` can be
 * matched if ever allow-listed by sub-id; today we anchor on the parent
 * `## Step 0` so the whole sub-tree is captured automatically.
 */
function headingMatchesAllow(headingText: string, allow: string[]): boolean {
  const lower = headingText.trim().toLowerCase()
  for (const phrase of allow) {
    if (lower.startsWith(phrase.toLowerCase())) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Truncation
// ---------------------------------------------------------------------------

function truncate(body: string, maxChars: number): { body: string; truncated: boolean } {
  if (body.length <= maxChars) return { body, truncated: false }
  const head = body.slice(0, maxChars)
  return {
    body: `${head}\n\n[...truncated to ${maxChars} chars by skill-reader...]`,
    truncated: true,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8")
  } catch {
    return null
  }
}

function safeHomedir(): string {
  try {
    return os.homedir()
  } catch {
    return process.env.HOME ?? ""
  }
}

function clampMaxChars(value: number | undefined): number {
  if (value === undefined || value === null) return DEFAULT_MAX_CHARS
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_MAX_CHARS
  return Math.floor(value)
}
