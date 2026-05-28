/**
 * dash-qa (stub) — Tier 0 #0N gstack chain.
 *
 * Deterministic post-validation lint over the parsed model response. NOT a
 * browser QA pass — the doc target ("browser QA + runbook verification")
 * still requires a real harness (see docs/gstack-codex-audit-2026-05-28.md).
 *
 * What this stub catches that the validator might miss (defense in depth):
 *   1. Banned imports re-scan (composer drift / patch-only output).
 *   2. File extension parity with the resolved per-surface stack mandate.
 *   3. Audit-trail block reference when intake flagged it required.
 *   4. Basic syntax sanity (unbalanced braces or backticks in generated files).
 *   5. Patch-shape sanity (every ParsedPatch must contain a `@@` hunk header).
 *
 * Output: `{ passed: boolean, issues: QaIssue[] }`. High-severity issues set
 * `passed=false`; medium/low are advisory. Mirrors validator's ruleId scheme
 * so the dashboard can group/sort findings consistently.
 */

import { BANNED_IMPORTS } from "./prompt-composer.js"
import { checkStackMandate, outputReferencesAuditBlock } from "./validator.js"
import type {
  IntakeContext,
  ParsedFile,
  ParsedPatch,
  ParsedResponse,
  QaIssue,
  QaResult,
  RepoContextPack,
} from "./types.js"

const UI_FILE_RE = /\.(tsx|jsx)$/
const HUNK_HEADER_RE = /^@@\s+-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s+@@/m
const STRIP_COMMENTS_RE = /\/\*[\s\S]*?\*\/|\/\/[^\n]*$/gm
const STRIP_STRINGS_RE = /(["'`])(?:\\.|(?!\1).)*\1/g

function isProbablyCode(file: ParsedFile): boolean {
  return (
    file.language === "ts" ||
    file.language === "tsx" ||
    file.language === "js" ||
    file.language === "jsx" ||
    /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file.path) ||
    UI_FILE_RE.test(file.path)
  )
}

function findBannedImports(content: string): string[] {
  const hits = new Set<string>()
  for (const lib of BANNED_IMPORTS) {
    const escaped = lib.replace(/[/\\$.*+?()[\]{}|^]/g, "\\$&")
    const re = new RegExp(
      `(?:from\\s+|require\\(\\s*)['"]${escaped}(?:['"]|/)`,
      "g",
    )
    if (re.test(content)) hits.add(lib)
  }
  return Array.from(hits)
}

/**
 * Cheap brace-balance check. Strips strings and comments first so an
 * intentional `}` inside a string literal is not counted. Returns the (open,
 * close) delta as a single signed integer; nonzero indicates an unbalanced
 * file. False positives are accepted in template-literal-heavy code; we
 * surface medium severity so it doesn't block merge.
 */
function braceDelta(content: string): number {
  const stripped = content
    .replace(STRIP_COMMENTS_RE, "")
    .replace(STRIP_STRINGS_RE, "")
  let open = 0
  let close = 0
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped.charCodeAt(i)
    if (ch === 123) open++ // {
    else if (ch === 125) close++ // }
  }
  return open - close
}

export interface RunDashQaInput {
  parsed: ParsedResponse
  /** Repo context — used to enforce per-surface stack mandate. Optional. */
  repoContext?: RepoContextPack | null
  /** Intake context — when present, audit-trail enforcement re-fires. */
  intake?: IntakeContext | null
}

/**
 * Run the deterministic QA lint. Pure function; safe to call from the
 * orchestrator after validateOutput, or directly in tests.
 */
export function runDashQa(input: RunDashQaInput): QaResult {
  const { parsed } = input
  const issues: QaIssue[] = []
  const files = parsed.files ?? []
  const patches = parsed.patches ?? []

  // 1. Banned imports re-scan.
  for (const f of files) {
    if (!isProbablyCode(f)) continue
    const banned = findBannedImports(f.content)
    for (const lib of banned) {
      issues.push({
        severity: "high",
        message: `QA: banned import "${lib}" present in generated file.`,
        file: f.path,
        ruleId: "QA-BANNED-IMPORT",
      })
    }
  }
  for (const p of patches) {
    const banned = findBannedImports(p.patchContent)
    for (const lib of banned) {
      issues.push({
        severity: "high",
        message: `QA: banned import "${lib}" introduced by patch.`,
        file: p.path,
        ruleId: "QA-BANNED-IMPORT",
      })
    }
  }

  // 2. Stack mandate parity (re-run; cheap + catches composer drift).
  if (input.repoContext) {
    const violations = checkStackMandate(files, input.repoContext.repoSlug)
    for (const v of violations) {
      issues.push({
        severity: "high",
        message: `QA: ${v.reason}`,
        file: v.file,
        ruleId: "QA-STACK-MANDATE",
      })
    }
  }

  // 3. Audit-trail enforcement (re-run when intake flagged it).
  if (input.intake?.auditTrail.required) {
    if (!outputReferencesAuditBlock(parsed)) {
      const focusFile = files[0]?.path ?? patches[0]?.path ?? "(unknown)"
      issues.push({
        severity: "high",
        message:
          "QA: intake flagged audit-trail required but the generated output " +
          `does not reference an audit-bearing block (pattern: ${input.intake.auditTrail.pattern}).`,
        file: focusFile,
        ruleId: "QA-AUDIT-TRAIL",
      })
    }
  }

  // 4. Brace-balance sanity per code file. Medium severity — heuristic only,
  //    template-literal-heavy code may trip the strip-strings step.
  for (const f of files) {
    if (!isProbablyCode(f)) continue
    const delta = braceDelta(f.content)
    if (delta !== 0) {
      issues.push({
        severity: "medium",
        message:
          `QA: brace balance off by ${delta} (heuristic, may be a false positive ` +
          "in template-literal-heavy code).",
        file: f.path,
        ruleId: "QA-BRACE-BALANCE",
      })
    }
  }

  // 5. Patch shape sanity — every patch must contain a `@@` hunk header.
  for (const p of patches) {
    if (!HUNK_HEADER_RE.test(p.patchContent)) {
      issues.push({
        severity: "high",
        message:
          "QA: patch contains no `@@` hunk header. PatchApplier will reject.",
        file: p.path,
        ruleId: "QA-PATCH-SHAPE",
      })
    }
  }

  const passed = issues.every((i) => i.severity !== "high")
  return { passed, issues }
}
