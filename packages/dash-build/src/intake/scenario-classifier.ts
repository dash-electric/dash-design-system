/**
 * Scenario classifier.
 *
 * Given a prompt + the BE/DB catalogs + a list of existing files, decide
 * which of six change shapes we're in. Heuristic-only (no LLM call). The
 * orchestrator may stack a higher-confidence LLM pass on top later — keeping
 * this hermetic keeps unit tests deterministic.
 *
 * Decision precedence (highest impact wins on ties):
 *   1. db_signal     → extend_fe_be_db
 *   2. be_signal     → update_existing OR extend_fe_be
 *   3. greenfield    → new_product
 *   4. fe_only       → fe_only
 *   5. default       → ambiguous
 */

import type { BeCatalog, EndpointEntry } from "./be-endpoint-catalog.js"
import type { DbCatalog, TableSchema } from "./db-schema-reader.js"

export type Scenario =
  | "update_existing"
  | "new_product"
  | "extend_fe_be"
  | "extend_fe_be_db"
  | "fe_only"
  | "ambiguous"

export interface ClassificationResult {
  scenario: Scenario
  confidence: number // 0..1
  reasoning: string
  affectedFiles?: { fe: string[]; be: string[]; db: string[] }
  needsClarify?: string
}

export interface ClassificationContext {
  beCatalog: BeCatalog
  dbCatalog: DbCatalog
  existingFiles: string[]
}

// ---------------------------------------------------------------------------
// Lexicons (case-insensitive)
// ---------------------------------------------------------------------------

const FE_ONLY_KEYWORDS = [
  "color",
  "colour",
  "spacing",
  "padding",
  "margin",
  "layout",
  "font",
  "typography",
  "animation",
  "animate",
  "hover",
  "transition",
  "copy",
  "wording",
  "label text",
  "rename button",
  "tooltip text",
  "icon",
  "responsive",
  "breakpoint",
  "dark mode",
  "skeleton",
  "loading state",
]

const BE_KEYWORDS = [
  "endpoint",
  "api",
  "route",
  "handler",
  "fetch",
  "request",
  "response",
  "controller",
  "post to",
  "call api",
  "backend",
  "server",
]

const DB_KEYWORDS = [
  "field",
  "column",
  "table",
  "schema",
  "migrate",
  "migration",
  "store",
  "persist",
  "save to db",
  "save to database",
  "prisma",
  "drizzle",
  "model",
  "new entity",
]

const GREENFIELD_KEYWORDS = [
  "from scratch",
  "greenfield",
  "new product",
  "new module",
  "brand new",
  "blank slate",
  "build a new",
  "scaffold",
  "bootstrap a new",
]

const UPDATE_VERBS = [
  "update",
  "tweak",
  "adjust",
  "rename",
  "refactor",
  "modify",
  "change",
  "edit",
  "polish",
]

/**
 * "New addition" keywords — phrases that strongly signal the user wants a NEW
 * surface (page/tab/section/module/dashboard) rather than to modify existing
 * code. When detected, we bias AWAY from `update_existing` and toward
 * `new_product` (nothing existing) or `extend_fe_be` (BE endpoint/table
 * exists for the noun → new FE + extend BE).
 *
 * Lexicon mixes EN + ID since prompts come from a bilingual team. Multi-word
 * phrases are matched as substrings; single tokens use word-boundary.
 */
const NEW_ADDITION_KEYWORDS = [
  // English — new surface
  "new page",
  "new dashboard",
  "new tab",
  "new section",
  "new module",
  "new feature",
  "new screen",
  "new view",
  "add page",
  "add a page",
  "add dashboard",
  "add a dashboard",
  "add a new",
  "add new",
  "create page",
  "create a page",
  "create dashboard",
  "create a dashboard",
  // Indonesian — new surface
  "halaman baru",
  "dashboard baru",
  "tab baru",
  "section baru",
  "modul baru",
  "module baru",
  "fitur baru",
  "buat halaman",
  "buat dashboard",
  "tambahin halaman",
  "tambahin dashboard",
  "tambahin tab",
  "tambahin section",
  "tambahin modul",
  "tambahin module",
  "tambahin fitur",
  "tambah halaman",
  "tambah dashboard",
  "tambah tab",
  "tambah section",
  "tambah modul",
  "tambah fitur",
  "bikin halaman",
  "bikin dashboard",
]

/**
 * Bare nouns that hint "new surface" when paired with an add/tambahin verb
 * even without the explicit "baru/new" qualifier. E.g. "tambahin dashboard
 * mitra performance" — the noun "dashboard" alone signals new addition.
 */
const NEW_ADDITION_BARE_NOUNS = [
  "dashboard",
  "halaman",
  "page",
]

const ID_ADD_VERBS = ["tambahin", "tambah", "bikin", "buat"]
const EN_ADD_VERBS = ["add", "create", "build"]

/**
 * Detect bare noun + add-verb pattern: e.g. "tambahin dashboard …" or
 * "add a dashboard for …". Returns the matched phrase, or null.
 */
function detectBareAddNoun(lower: string): string | null {
  for (const noun of NEW_ADDITION_BARE_NOUNS) {
    for (const v of ID_ADD_VERBS) {
      const re = new RegExp(`\\b${v}\\b[^.\\n]{0,40}\\b${noun}\\b`, "i")
      if (re.test(lower)) return `${v} ${noun}`
    }
    for (const v of EN_ADD_VERBS) {
      const re = new RegExp(`\\b${v}\\b\\s+(?:a\\s+|an\\s+|the\\s+)?${noun}\\b`, "i")
      if (re.test(lower)) return `${v} ${noun}`
    }
  }
  return null
}

/**
 * Existing-page hints — multi-word path-like or known-section tokens. When the
 * prompt mentions "settings page" / "/mitra/list" / a route-shaped string AND
 * a new-addition keyword (e.g. "tab baru di settings"), we treat the change
 * as `extend_fe_be` (extend an existing surface with a new piece) rather than
 * a from-scratch `new_product`. Heuristic — caller can override later.
 */
function detectExistingSurfaceHint(
  prompt: string,
  existingFiles: string[],
): boolean {
  if (/\b(?:di|at|in|on|inside|within)\s+\w/.test(prompt.toLowerCase())) {
    // "di settings", "in dashboard", "at /mitra/list"
    return true
  }
  if (/\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_[\]:]+)+/.test(prompt)) {
    // path-shaped token like "/mitra/list" or "/api/foo"
    return true
  }
  return existingFiles.length > 0
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function containsAny(haystack: string, needles: string[]): string[] {
  const hits: string[] = []
  for (const needle of needles) {
    // Use word-boundary for short tokens; substring for multi-word phrases.
    if (needle.includes(" ")) {
      if (haystack.includes(needle)) hits.push(needle)
      continue
    }
    const re = new RegExp(`\\b${escapeRegex(needle)}\\b`, "i")
    if (re.test(haystack)) hits.push(needle)
  }
  return hits
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function tokensIn(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter(Boolean)
}

function findMatchingEndpoints(
  prompt: string,
  catalog: BeCatalog,
): EndpointEntry[] {
  const lower = prompt.toLowerCase()
  return catalog.endpoints.filter((ep) => {
    // Match if the prompt contains the endpoint path (minus leading slash and
    // dynamic params), OR the handler export name.
    const cleanedPath = ep.path
      .replace(/^\/api\//, "")
      .replace(/^\//, "")
      .replace(/:[^/]+/g, "")
      .replace(/\/+/g, "/")
      .trim()
    if (cleanedPath && lower.includes(cleanedPath.toLowerCase())) return true
    if (
      ep.handlerExport &&
      ep.handlerExport !== "handler" &&
      lower.includes(ep.handlerExport.toLowerCase())
    ) {
      return true
    }
    return false
  })
}

function findMatchingTables(
  prompt: string,
  catalog: DbCatalog,
): { table: TableSchema; matchedField?: string }[] {
  const tokens = new Set(tokensIn(prompt))
  const hits: { table: TableSchema; matchedField?: string }[] = []
  for (const table of catalog.tables) {
    const tableMatch = tokens.has(table.name.toLowerCase())
    let matchedField: string | undefined
    for (const col of table.columns) {
      if (tokens.has(col.name.toLowerCase())) {
        matchedField = col.name
        break
      }
    }
    if (tableMatch || matchedField) {
      hits.push({ table, ...(matchedField ? { matchedField } : {}) })
    }
  }
  return hits
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function classifyPrompt(
  prompt: string,
  context: ClassificationContext,
): Promise<ClassificationResult> {
  const lower = prompt.toLowerCase()
  const feHits = containsAny(lower, FE_ONLY_KEYWORDS)
  const beHits = containsAny(lower, BE_KEYWORDS)
  const dbHits = containsAny(lower, DB_KEYWORDS)
  const greenHits = containsAny(lower, GREENFIELD_KEYWORDS)
  const updateHits = containsAny(lower, UPDATE_VERBS)
  const newAdditionHits = containsAny(lower, NEW_ADDITION_KEYWORDS)
  const bareAddNoun = detectBareAddNoun(lower)
  const newAddSignal = newAdditionHits.length > 0 || bareAddNoun !== null

  const matchedEndpoints = findMatchingEndpoints(prompt, context.beCatalog)
  const matchedTables = findMatchingTables(prompt, context.dbCatalog)

  const affectedFiles = {
    fe: [] as string[],
    be: matchedEndpoints.map((e) => e.filePath),
    db: matchedTables.map((t) => t.table.filePath),
  }

  // ── 0. NEW-ADDITION bias ─────────────────────────────────────────────────
  //     User wants a NEW page / dashboard / tab / section / module / feature.
  //     This MUST short-circuit before the BE-keyword branch otherwise we'd
  //     classify "tambahin dashboard mitra performance" as update_existing
  //     (matches table `mitra`) and the chain emits patch-mode output
  //     instead of new-file mode. Bias rules:
  //       - DB keyword still wins (schema change is a stronger commitment).
  //       - Existing endpoint OR existing-surface hint → extend_fe_be
  //         (new FE on top of existing BE / inside existing surface).
  //       - Otherwise → new_product.
  if (newAddSignal && dbHits.length === 0) {
    const trigger = bareAddNoun ?? newAdditionHits[0]!
    const hasExistingBe = matchedEndpoints.length > 0
    const hasExistingSurface = detectExistingSurfaceHint(
      prompt,
      context.existingFiles,
    )
    if (hasExistingBe || hasExistingSurface) {
      return {
        scenario: "extend_fe_be",
        confidence: 0.72,
        reasoning:
          `New-addition keyword detected ("${trigger}") and existing ` +
          (hasExistingBe
            ? `endpoint(s) ${matchedEndpoints.map((e) => `${e.method} ${e.path}`).join(", ")}`
            : "surface/files in scope") +
          " — treat as a new FE attached to existing BE / surface (extend_fe_be).",
        affectedFiles,
      }
    }
    return {
      scenario: "new_product",
      confidence: 0.72,
      reasoning:
        `New-addition keyword detected ("${trigger}") and no existing ` +
        "endpoint/surface matches — treat as a new product surface.",
      affectedFiles,
    }
  }

  // ── 1. DB-touching signal ────────────────────────────────────────────────
  if (dbHits.length > 0) {
    // Distinguish "field exists" vs "field missing"
    const hasFieldMatch = matchedTables.some((t) => t.matchedField)
    if (!hasFieldMatch || matchedTables.length === 0) {
      return {
        scenario: "extend_fe_be_db",
        confidence: 0.8,
        reasoning: `DB verbs detected (${dbHits.join(", ")}) but no matching table/column found in the catalog — likely a new migration is required.`,
        affectedFiles,
      }
    }
    return {
      scenario: "extend_fe_be_db",
      confidence: 0.7,
      reasoning: `DB verbs detected (${dbHits.join(", ")}) targeting existing table(s) ${matchedTables
        .map((t) => t.table.name)
        .join(", ")} — schema additions required.`,
      affectedFiles,
    }
  }

  // ── 2. BE-extending signal ───────────────────────────────────────────────
  if (beHits.length > 0) {
    if (matchedEndpoints.length > 0) {
      return {
        scenario: "update_existing",
        confidence: 0.75,
        reasoning: `BE keywords (${beHits.join(", ")}) match existing endpoint(s): ${matchedEndpoints
          .map((e) => `${e.method} ${e.path}`)
          .join(", ")}.`,
        affectedFiles,
      }
    }
    return {
      scenario: "extend_fe_be",
      confidence: 0.7,
      reasoning: `BE keywords (${beHits.join(", ")}) with no matching endpoint — a new route is expected.`,
      affectedFiles,
    }
  }

  // ── 3. Greenfield signal ─────────────────────────────────────────────────
  if (greenHits.length > 0 && context.existingFiles.length === 0) {
    return {
      scenario: "new_product",
      confidence: 0.75,
      reasoning: `Greenfield phrasing (${greenHits.join(", ")}) and no existing files in scope — treat as new product.`,
      affectedFiles,
    }
  }

  // ── 4. Pure-FE signal ────────────────────────────────────────────────────
  if (feHits.length > 0 && beHits.length === 0 && dbHits.length === 0) {
    return {
      scenario: "fe_only",
      confidence: 0.85,
      reasoning: `Visual-only keywords (${feHits.join(", ")}) with zero BE/DB references — pure FE change.`,
      affectedFiles,
    }
  }

  // ── 5. Update-existing fallback ──────────────────────────────────────────
  if (updateHits.length > 0 && context.existingFiles.length > 0) {
    return {
      scenario: "update_existing",
      confidence: 0.55,
      reasoning: `Update verbs (${updateHits.join(", ")}) with existing files in scope — most likely a modification.`,
      affectedFiles,
    }
  }

  // ── 5b. ID add-verb + existing-surface hint (no NEW_ADDITION) ────────────
  //     Patterns like "tambahin filter status di list mitra" carry an add-
  //     verb without a NEW_ADDITION noun (filter/status are not "new pages").
  //     When paired with an existing-surface hint (di X / path / existing
  //     files) treat as modification of that surface (update_existing). This
  //     keeps "tambahin filter di X" out of the ambiguous bucket where the
  //     intake clarify gate would block the user unnecessarily.
  const hasAddVerb = ID_ADD_VERBS.some((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(prompt),
  )
  if (
    hasAddVerb &&
    !newAddSignal &&
    detectExistingSurfaceHint(prompt, context.existingFiles)
  ) {
    return {
      scenario: "update_existing",
      confidence: 0.6,
      reasoning:
        "Add-verb (tambahin/tambah/bikin/buat) without a NEW_ADDITION noun, " +
        "but the prompt references an existing surface (`di …`, a path, or " +
        "existing files in scope) — treat as a modification of that surface.",
      affectedFiles,
    }
  }

  // ── 6. Ambiguous ─────────────────────────────────────────────────────────
  const clarify = buildClarifyQuestion({
    feHits,
    beHits,
    dbHits,
    greenHits,
    matchedEndpoints,
    matchedTables,
  })
  return {
    scenario: "ambiguous",
    confidence: 0.3,
    reasoning:
      "No strong signal for FE-only, BE extension, DB extension, or greenfield. Need user clarification.",
    affectedFiles,
    needsClarify: clarify,
  }
}

function buildClarifyQuestion(input: {
  feHits: string[]
  beHits: string[]
  dbHits: string[]
  greenHits: string[]
  matchedEndpoints: EndpointEntry[]
  matchedTables: { table: TableSchema; matchedField?: string }[]
}): string {
  const parts: string[] = []
  if (input.matchedEndpoints.length > 0) {
    parts.push(
      `You mentioned things that look like existing endpoints (${input.matchedEndpoints
        .map((e) => `${e.method} ${e.path}`)
        .join(", ")}) — should we modify those, or add a new one?`,
    )
  }
  if (input.matchedTables.length > 0) {
    parts.push(
      `Should this change persist to the existing table(s) ${input.matchedTables
        .map((t) => t.table.name)
        .join(", ")}, or do you need a new table?`,
    )
  }
  if (parts.length === 0) {
    parts.push(
      "Is this a visual-only change, a new feature that needs a BE endpoint, or does it require new database fields?",
    )
  }
  return parts.join(" ")
}
