/**
 * dash-design-review (stub) — Tier 0 #0N gstack chain.
 *
 * Pure-function post-generation pass that surfaces how well the generated UI
 * files lean on the Dash DS catalog (Layer 1 atoms). Output is advisory: the
 * orchestrator attaches it to the artifact for the dashboard preview panel,
 * but it never flips validation.passed.
 *
 * Why a stub: the doc target ("design brief constrained by design.md") is the
 * input side of design context, which design-loader + ds-catalog-loader
 * already feed into the system prompt before generation. What we lacked was
 * the OUTPUT side — a structured read of which atoms the generated output
 * actually used. This module covers that gap so the chain has visible
 * before/after symmetry.
 *
 * Returns `{ atomsUsed[], coverage, suggestions[] }` (see DesignReviewResult).
 */

import type {
  DesignReviewResult,
  ParsedFile,
  ParsedResponse,
} from "./types.js"
import { measureDSCoverage } from "./validator.js"

const UI_FILE_RE = /\.(tsx|jsx)$/
const DS_IMPORT_BLOCK_RE =
  /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]@dash\/(?:kit|ui|blocks|templates|patterns|hooks|lib)(?:\/[^'"]*)?['"]/g
const DS_IMPORT_DEFAULT_RE =
  /import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]@dash\/(?:kit|ui|blocks|templates|patterns|hooks|lib)(?:\/[^'"]*)?['"]/g

const LOW_COVERAGE_THRESHOLD = 0.4
const STRONG_COVERAGE_THRESHOLD = 0.8

function isUiFile(file: ParsedFile): boolean {
  return (
    file.language === "tsx" ||
    file.language === "jsx" ||
    UI_FILE_RE.test(file.path)
  )
}

/** Extract the atom names imported from `@dash/<pkg>` across all UI files. */
function extractAtomNames(files: ParsedFile[]): string[] {
  const names = new Set<string>()
  for (const f of files) {
    if (!isUiFile(f)) continue

    DS_IMPORT_BLOCK_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = DS_IMPORT_BLOCK_RE.exec(f.content))) {
      const inside = m[1] ?? ""
      for (const raw of inside.split(",")) {
        // Strip `type ` prefixes and `as Alias` parts; keep the source name.
        const cleaned = raw
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          ?.trim()
        if (cleaned && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleaned)) {
          names.add(cleaned)
        }
      }
    }

    DS_IMPORT_DEFAULT_RE.lastIndex = 0
    while ((m = DS_IMPORT_DEFAULT_RE.exec(f.content))) {
      const name = m[1]
      if (name) names.add(name)
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b))
}

function buildSuggestions(input: {
  coverage: number
  dsImports: number
  rawUtilityAntipatterns: number
  hasUiFiles: boolean
}): string[] {
  const out: string[] = []
  if (!input.hasUiFiles) {
    return out
  }
  if (input.dsImports === 0) {
    out.push(
      "No @dash/* imports detected. Generated UI should prefer atoms from " +
        "@dash/kit (Badge / Card / Table / Tabs) before reaching for raw HTML.",
    )
  }
  if (input.rawUtilityAntipatterns > 0) {
    out.push(
      `Found ${input.rawUtilityAntipatterns} raw utility-class status pattern(s). ` +
        "Replace `<div className=\"bg-success-light\">` with " +
        "`<Badge variant=\"success\">` from @dash/kit.",
    )
  }
  if (
    input.dsImports > 0 &&
    input.coverage < LOW_COVERAGE_THRESHOLD
  ) {
    out.push(
      `DS coverage low (${input.coverage.toFixed(2)}). ` +
        "Consider replacing raw `<div>` / `<span>` containers with Dash " +
        "Layer 1 atoms (Card, Stack, Surface).",
    )
  }
  return out
}

/**
 * Run the design review pass against a parsed model response.
 *
 * Pure function — no FS, no network. Safe to call from the orchestrator's
 * generation path or directly in tests.
 */
export function reviewDesignCoverage(parsed: ParsedResponse): DesignReviewResult {
  const files = parsed.files ?? []
  const metrics = measureDSCoverage(files)
  const atomsUsed = extractAtomNames(files)
  const hasUiFiles = files.some(isUiFile)
  const suggestions = buildSuggestions({
    coverage: metrics.ratio,
    dsImports: metrics.dsImports,
    rawUtilityAntipatterns: metrics.rawUtilityAntipatterns,
    hasUiFiles,
  })

  if (
    hasUiFiles &&
    metrics.ratio >= STRONG_COVERAGE_THRESHOLD &&
    suggestions.length === 0
  ) {
    suggestions.push(
      `Strong DS coverage (${metrics.ratio.toFixed(2)}). No design changes recommended.`,
    )
  }

  return {
    atomsUsed,
    coverage: metrics.ratio,
    dsImports: metrics.dsImports,
    rawHtmlElements: metrics.jsxElements,
    rawUtilityAntipatterns: metrics.rawUtilityAntipatterns,
    suggestions,
  }
}
