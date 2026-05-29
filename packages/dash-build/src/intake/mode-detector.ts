/**
 * mode-detector — Tier 0 PROJECT MODE detector.
 *
 * Sits ABOVE the scenario-classifier. Before we decide WHICH change shape we're
 * in (update_existing / extend_fe_be / …), we first decide WHICH PROJECT MODE the
 * prompt lives in. Mode drives clone/preview behavior:
 *
 *   - "existing-repo"   → improve a real Dash repo (backoffice / portal-v2).
 *                         Triggers clone + baseline. The scenario-classifier then
 *                         refines the change shape inside that repo.
 *   - "blank-product"   → build a brand-new product from scratch, no existing repo.
 *   - "design-system"   → evolve the DS itself (token swap / new theme / new
 *                         component variant).
 *   - "ambiguous"       → cannot decide; must ask the user.
 *
 * Heuristic-only (no LLM call) so unit tests stay deterministic. The orchestrator
 * may stack a higher-confidence LLM pass on top later.
 *
 * Decision precedence (highest confidence wins, early-return):
 *   1. selectedRepo + repoIsKnownDashRepo → existing-repo (0.95, never ask)
 *   2. resolvedExistingFiles non-empty     → existing-repo (0.85)
 *   3. design-system keywords (no repo)    → design-system (0.7, confirm)
 *   4. blank-product keywords (no repo, no files) → blank-product (0.7, confirm)
 *   5. default                             → ambiguous (0.3, needsClarify)
 *
 * Hard constraints:
 *   - Zero npm deps. Pure functions only.
 *   - Never throw. Empty/whitespace prompt → ambiguous, confidence 0.
 *   - Bilingual EN + ID lexicons.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ProjectMode =
  | "existing-repo"
  | "blank-product"
  | "design-system"
  | "ambiguous"

export interface ModeDetectionInput {
  /** User prompt — drives keyword scoring. Required. */
  prompt: string
  /**
   * Repo the user explicitly picked in the dropdown (e.g. "dash/backoffice").
   * STRONGEST signal — when present and known, never ask.
   */
  selectedRepo: string | null
  /**
   * File paths the path-resolver matched, if any. Optional, may be empty —
   * a non-empty list means the prompt resolved to real files in a repo.
   */
  resolvedExistingFiles?: string[]
  /** True if `selectedRepo` maps to a real manifest entry. */
  repoIsKnownDashRepo?: boolean
}

export interface ModeDetectionResult {
  mode: ProjectMode
  confidence: number // 0..1
  reasoning: string
  /** The question to ask the user when ambiguous (or confirming a soft mode). */
  needsClarify?: string
  /** Outcome-framed options to surface alongside `needsClarify`. */
  clarifyOptions?: string[]
}

// ---------------------------------------------------------------------------
// Lexicons (case-insensitive). Bilingual EN + ID since prompts come from a
// bilingual team. Multi-word phrases match as substrings; single tokens use
// word-boundary (see containsAny).
// ---------------------------------------------------------------------------

const DESIGN_SYSTEM_KEYWORDS = [
  // English
  "design system",
  "token",
  "theme",
  "foundation",
  "accent color",
  "accent colour",
  "swap color",
  "swap colour",
  "rebrand",
  "rebranding",
  "component library",
  "variant",
  // Indonesian
  "ganti warna",
  "ganti tema",
  "ganti foundation",
  "ubah token",
  "tema baru",
  "varian komponen",
]

const BLANK_PRODUCT_KEYWORDS = [
  // English
  "from scratch",
  "new product",
  "brand new app",
  "greenfield",
  "start fresh",
  "blank",
  // Indonesian
  "dari nol",
  "produk baru",
  "aplikasi baru",
  "mulai baru",
  "dari awal",
  "bikin produk",
]

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

const CLARIFY_OPTIONS = [
  "Repo existing (improve yang udah live)",
  "Produk baru (dari nol)",
  "Design system (token/tema)",
]

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Detect the PROJECT MODE of a Dash Build prompt. Pure + synchronous; never
 * throws. See file header for the decision precedence.
 */
export function detectMode(input: ModeDetectionInput): ModeDetectionResult {
  const prompt = typeof input.prompt === "string" ? input.prompt : ""
  const lower = prompt.toLowerCase().trim()
  const selectedRepo =
    typeof input.selectedRepo === "string" && input.selectedRepo.trim().length > 0
      ? input.selectedRepo.trim()
      : null
  const resolvedFiles = input.resolvedExistingFiles ?? []
  const repoIsKnown = input.repoIsKnownDashRepo === true

  // ── 1. Explicit known repo selected ──────────────────────────────────────
  //     User picked a real Dash repo in the dropdown. This ALWAYS wins, even
  //     if the prompt says "new"/"from scratch" — "add a brand-new module to
  //     backoffice" (repo selected) is STILL existing-repo, because the new
  //     surface lives INSIDE an existing repo. Never ask in this case.
  if (selectedRepo && repoIsKnown) {
    return {
      mode: "existing-repo",
      confidence: 0.95,
      reasoning:
        `User explicitly selected a known Dash repo ("${selectedRepo}") — ` +
        "work targets an existing repo regardless of prompt wording (a new " +
        "surface inside an existing repo is still existing-repo).",
    }
  }

  // ── 2. Prompt resolved to real existing files ────────────────────────────
  //     The path-resolver matched concrete files in a repo, so we're editing
  //     something live even without an explicit dropdown selection.
  if (resolvedFiles.length > 0) {
    return {
      mode: "existing-repo",
      confidence: 0.85,
      reasoning:
        `Prompt resolved to ${resolvedFiles.length} existing file(s) ` +
        `(${resolvedFiles.slice(0, 3).join(", ")}${resolvedFiles.length > 3 ? ", …" : ""}) ` +
        "— treat as work on an existing repo.",
    }
  }

  // From here down there is no selectedRepo and no resolved files. (If a repo
  // WAS selected but unknown, we still fall through — but a design-system or
  // blank-product keyword with a selected repo is handled below.)
  const dsHits = containsAny(lower, DESIGN_SYSTEM_KEYWORDS)
  const blankHits = containsAny(lower, BLANK_PRODUCT_KEYWORDS)

  // ── 3. Design-system keywords (no repo selected) ─────────────────────────
  //     DS work (token swap / theme / variant) can overlap with repo work, so
  //     we confirm. If a repo WAS selected, existing-repo already won above
  //     (when known); when selected-but-unknown we still bias to existing-repo
  //     here because editing DS *inside a repo context* is repo work.
  if (dsHits.length > 0 && !selectedRepo) {
    return {
      mode: "design-system",
      confidence: 0.7,
      reasoning:
        `Design-system keyword(s) detected (${dsHits.join(", ")}) with no ` +
        "repo selected — likely evolving the DS itself (tokens / theme / variant).",
      needsClarify:
        "Ini kelihatannya perubahan design system (token / tema / varian " +
        "komponen baru). Kita lagi ngembangin design system, atau nerapin ini " +
        "di dalam repo produk tertentu?",
      clarifyOptions: CLARIFY_OPTIONS,
    }
  }

  // ── 3b. Keyword present BUT a repo was selected (even if unknown) ─────────
  //     They're editing DS-ish things inside a repo context → existing-repo.
  if ((dsHits.length > 0 || blankHits.length > 0) && selectedRepo) {
    return {
      mode: "existing-repo",
      confidence: 0.7,
      reasoning:
        `A repo was selected ("${selectedRepo}") alongside ` +
        (dsHits.length > 0 ? `design-system keyword(s) (${dsHits.join(", ")})` : `blank-product keyword(s) (${blankHits.join(", ")})`) +
        " — the work is scoped to that repo, so treat as existing-repo.",
    }
  }

  // ── 4. Blank-product keywords (no repo, no resolved files) ───────────────
  if (blankHits.length > 0 && !selectedRepo && resolvedFiles.length === 0) {
    return {
      mode: "blank-product",
      confidence: 0.7,
      reasoning:
        `Blank-product keyword(s) detected (${blankHits.join(", ")}) with no ` +
        "repo selected and no resolved files — likely a brand-new product from scratch.",
      needsClarify:
        "Ini kedengarannya produk baru dari nol. Konfirmasi — kita mulai " +
        "produk fresh, atau nambah ke repo yang udah ada?",
      clarifyOptions: CLARIFY_OPTIONS,
    }
  }

  // ── 5. Ambiguous ─────────────────────────────────────────────────────────
  //     Empty/whitespace prompt → confidence 0. Otherwise a bare prompt with
  //     no strong signal → confidence 0.3. Either way we ask.
  const isEmpty = lower.length === 0
  return {
    mode: "ambiguous",
    confidence: isEmpty ? 0 : 0.3,
    reasoning: isEmpty
      ? "Empty prompt and no repo / files in scope — cannot infer a project mode."
      : "No strong signal for existing-repo, blank-product, or design-system. Need user clarification.",
    needsClarify:
      "Kita lagi bikin apa nih — improve yang udah live, mulai produk baru " +
      "dari nol, atau ngembangin design system (token / tema)?",
    clarifyOptions: CLARIFY_OPTIONS,
  }
}
