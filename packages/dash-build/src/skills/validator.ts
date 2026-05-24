/**
 * Validates parsed Claude output against Dash cardinal rules + audit + voice.
 *
 * Severity model:
 *   - high   : banned import, blocks generation (-20 score each)
 *   - medium : raw hex / missing tokens / casual voice on mitra surface (-5 to -10)
 *   - low    : style / TODO smell                                       (-2)
 *
 * `passed` flips to false on ANY high error or CR-5 token violation. Score is
 * clamped 0..100.
 */

import { BANNED_IMPORTS } from "./prompt-composer.js"
import type {
  DesignContext,
  ParsedFile,
  ParsedResponse,
  ValidationError,
  ValidationResult,
} from "./types.js"

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const DASH_TOKEN_RE =
  /bg-(primary|bg-white|bg-weak|bg-strong|bg-surface|bg-soft|bg-sub)-|text-text-(strong|sub|disabled|white|soft)-|border-(stroke|error|state)-/
const CASUAL_VOICE_RE = /\b(kamu|yaa|lewatin|bakal|udah|yuk|ayo|dong|deh|sih|kok|plis)\b/i
const MITRA_KEYWORD_RE = /\b(mitra|driver|kurir|pengemudi)\b/i

const TSX_LIKE = new Set(["tsx", "jsx", "ts", "js"])

/** Detect a banned import in a single file. Matches either `from "<lib>"` or `require("<lib>")`. */
function findBannedImports(content: string): string[] {
  const hits = new Set<string>()
  for (const lib of BANNED_IMPORTS) {
    const escaped = lib.replace(/[/\\$.*+?()[\]{}|^]/g, "\\$&")
    const re = new RegExp(`(?:from\\s+|require\\(\\s*)['"]${escaped}(?:['"]|/)`, "g")
    if (re.test(content)) hits.add(lib)
  }
  return Array.from(hits)
}

/** Detect raw hex colors outside of comment-only contexts. */
function findRawHex(content: string): string[] {
  const matches = content.match(HEX_RE) ?? []
  // Filter out hex-in-comment edge cases — keep them as warnings only when
  // they appear in a JSX/CSS context. For simplicity, treat ALL hex as findings.
  return matches
}

/** Heuristic: is this file likely user-facing UI? (drives voice check) */
function isUIFile(file: ParsedFile): boolean {
  return TSX_LIKE.has(file.language) || /\.(tsx|jsx)$/.test(file.path)
}

export function validateOutput(
  parsed: ParsedResponse,
  design: DesignContext,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []
  let score = 100

  if (parsed.files.length === 0) {
    warnings.push("Response contained no parseable file blocks")
  }

  for (const file of parsed.files) {
    // Banned imports — high severity
    for (const banned of findBannedImports(file.content)) {
      errors.push({
        severity: "high",
        message: `Banned import: ${banned}`,
        file: file.path,
        ruleId: "CR-3",
      })
      score -= 20
    }

    // Raw hex — medium severity
    const hexHits = findRawHex(file.content)
    if (hexHits.length > 0) {
      errors.push({
        severity: "medium",
        message: `Raw hex colors found (${hexHits.length}): use Dash tokens`,
        file: file.path,
        ruleId: "CR-5",
      })
      score -= Math.min(20, 5 * hexHits.length)
    }

    // Casual voice on UI files — medium severity
    if (isUIFile(file) && CASUAL_VOICE_RE.test(file.content)) {
      const isMitra = MITRA_KEYWORD_RE.test(file.content)
      errors.push({
        severity: isMitra ? "medium" : "low",
        message: `Casual voice particle detected — Dash voice rule requires formal "Anda" mitra-facing`,
        file: file.path,
        ruleId: "CR-4",
      })
      score -= isMitra ? 10 : 3
    }

    // TODO / FIXME smell — low severity warning, no score deduction
    if (/\b(TODO|FIXME|XXX)\b/.test(file.content)) {
      warnings.push(`${file.path}: contains TODO/FIXME marker`)
    }
  }

  // Cross-file check: any TSX file but zero Dash tokens used anywhere?
  const hasTsx = parsed.files.some(isUIFile)
  const hasDashTokens = parsed.files.some((f) => DASH_TOKEN_RE.test(f.content))
  if (hasTsx && !hasDashTokens) {
    errors.push({
      severity: "medium",
      message: "No Dash semantic tokens detected — verify token usage",
      file: parsed.files.find(isUIFile)?.path ?? "(unknown)",
      ruleId: "CR-5",
    })
    score -= 10
  }

  // Surface a warning when design context loaded degraded — caller may want
  // to retry with --force-refresh.
  if (design.missingSources.length > 0) {
    warnings.push(
      `Design context degraded — ${design.missingSources.length} foundation file(s) missing`,
    )
  }

  const highCount = errors.filter((e) => e.severity === "high").length
  const tokenViolationCount = errors.filter((e) => e.ruleId === "CR-5").length
  return {
    passed: highCount === 0 && tokenViolationCount === 0,
    score: Math.max(0, Math.min(100, score)),
    errors,
    warnings,
  }
}
