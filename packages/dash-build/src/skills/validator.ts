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
 *
 * Modes:
 *   - "generated"          (default) — validate Claude-generated parsed output.
 *                          Backward-compatible signature.
 *   - "daemon-self-audit"  — scan the daemon's own template-literal CSS for
 *                          raw hex (CR-5-DAEMON). This stops Dash Build from
 *                          enforcing rules it itself violates. Mirrors the
 *                          regex used by scripts/audit-css.mjs so the two
 *                          checkers stay in lock-step.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { BANNED_IMPORTS } from "./prompt-composer.js"
import { looksLikeUnifiedDiff } from "../runs/patch-applier.js"
import type {
  DesignContext,
  ExistingFilesContext,
  ParsedFile,
  ParsedPatch,
  ParsedResponse,
  ValidationError,
  ValidationResult,
} from "./types.js"

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const DASH_TOKEN_RE =
  /bg-(primary|bg-white|bg-weak|bg-strong|bg-surface|bg-soft|bg-sub)-|text-text-(strong|sub|disabled|white|soft)-|border-(stroke|error|state)-/
const CASUAL_VOICE_RE = /\b(kamu|yaa|lewatin|bakal|udah|yuk|ayo|dong|deh|sih|kok|plis)\b/i
const MITRA_KEYWORD_RE = /\b(mitra|driver|kurir|pengemudi)\b/i

// Mirrors audit-css.mjs so daemon-self-audit and the CLI script never drift.
// Matches any CSS-variable declaration on the line; broader form supports
// multi-value tokens like `--shadow-x: 0px 96px ... #abc, ...`.
const DAEMON_VAR_DEFINITION_RE = /--[a-z0-9-]+\s*:/i
const DAEMON_VAR_FALLBACK_RE = /var\(--/
const DAEMON_COMMENT_LINE_RE = /^\s*(\/\/|\/\*|\*)/

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

export interface ValidateOptions {
  /**
   * "generated"          — validate Claude-generated parsed output (default).
   * "daemon-self-audit"  — scan the daemon's own template literals for raw hex.
   */
  mode?: "generated" | "daemon-self-audit"
  /** Override the daemon scan root. Defaults to the package's src/daemon. */
  daemonRoot?: string
  /**
   * Allowlist of (file, hex) pairs that are sanctioned legacy hex. Mirrors the
   * structure of scripts/audit-css.allowlist.json. When omitted, every hex is
   * a finding (strict semantics).
   */
  allowlist?: Array<{ file: string; hex: string }>
  /**
   * Sprint 2B — when present, ParsedPatch entries are validated against
   * this context. Patches whose path is not in `files` get flagged because
   * the model invented an edit target the path-resolver never surfaced.
   */
  existingFiles?: ExistingFilesContext | null
}

/**
 * Default — validates Claude-generated parsed output. Backward-compatible.
 * Pass `opts.mode === "daemon-self-audit"` to switch into daemon-scanning mode;
 * in that case `parsed` is ignored.
 */
export function validateOutput(
  parsed: ParsedResponse,
  design: DesignContext,
  opts: ValidateOptions = {},
): ValidationResult {
  const mode = opts.mode ?? "generated"
  if (mode === "daemon-self-audit") {
    return validateDaemonSelfAudit(design, opts)
  }
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

  // ── Sprint 2B — patch validation ────────────────────────────────────────
  const patches: ParsedPatch[] = parsed.patches ?? []
  if (patches.length > 0) {
    const knownPaths = new Set(
      (opts.existingFiles?.files ?? []).map((f) => f.filePath),
    )
    for (const patch of patches) {
      const patchErrors = validatePatch(patch, knownPaths, opts.existingFiles ?? null)
      for (const e of patchErrors) {
        errors.push(e)
        score -= severityWeight(e.severity)
      }
      for (const w of checkAstIntegrity(patch)) {
        warnings.push(w)
      }
    }
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

// ---------------------------------------------------------------------------
// Sprint 2B — patch validator
// ---------------------------------------------------------------------------

const HUNK_HEADER_RE = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/

interface HunkSummary {
  oldStart: number
  oldLen: number
  newStart: number
  newLen: number
  contextLines: number
  additions: number
  deletions: number
}

function parseHunks(patchContent: string): HunkSummary[] {
  const out: HunkSummary[] = []
  const lines = patchContent.split("\n")
  let current: HunkSummary | null = null
  for (const line of lines) {
    const headerMatch = line.match(HUNK_HEADER_RE)
    if (headerMatch) {
      if (current) out.push(current)
      current = {
        oldStart: Number(headerMatch[1]),
        oldLen: headerMatch[2] !== undefined ? Number(headerMatch[2]) : 1,
        newStart: Number(headerMatch[3]),
        newLen: headerMatch[4] !== undefined ? Number(headerMatch[4]) : 1,
        contextLines: 0,
        additions: 0,
        deletions: 0,
      }
      continue
    }
    if (!current) continue
    // Skip per-file headers if present.
    if (line.startsWith("--- ") || line.startsWith("+++ ")) continue
    if (line.startsWith("+") && !line.startsWith("+++")) {
      current.additions += 1
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      current.deletions += 1
    } else if (line.startsWith(" ") || line.length === 0) {
      current.contextLines += 1
    }
    // Any other prefix is treated as out-of-hunk noise; `git apply --check`
    // would catch it for real at apply time.
  }
  if (current) out.push(current)
  return out
}

/** Lightweight AST integrity — counts import/export keywords on additions
 *  vs deletions. Large negative deltas warn that the patch is gutting the
 *  file (likely a "rewrite-as-patch" hallucination). Regex only — no parser. */
function checkAstIntegrity(patch: ParsedPatch): string[] {
  const warnings: string[] = []
  const lines = patch.patchContent.split("\n")
  let importDelta = 0
  let exportDelta = 0
  for (const line of lines) {
    if (line.startsWith("+++") || line.startsWith("---")) continue
    const isAdd = line.startsWith("+")
    const isDel = line.startsWith("-")
    if (!isAdd && !isDel) continue
    const body = line.slice(1)
    if (/^\s*import\b/.test(body)) {
      importDelta += isAdd ? 1 : -1
    }
    if (/^\s*export\b/.test(body)) {
      exportDelta += isAdd ? 1 : -1
    }
  }
  if (importDelta <= -3) {
    warnings.push(
      `${patch.path}: patch removes ${-importDelta} import statements — possible accidental gutting`,
    )
  }
  if (exportDelta <= -2) {
    warnings.push(
      `${patch.path}: patch removes ${-exportDelta} export statements — verify public surface intact`,
    )
  }
  return warnings
}

function validatePatch(
  patch: ParsedPatch,
  knownPaths: Set<string>,
  existingFiles: ExistingFilesContext | null,
): ValidationError[] {
  const errors: ValidationError[] = []

  // 1. Body must look like a valid unified diff.
  if (!looksLikeUnifiedDiff(patch.patchContent)) {
    errors.push({
      severity: "high",
      message: "Patch body is not a valid unified diff (missing @@ hunk header or no +/- lines)",
      file: patch.path,
      ruleId: "PATCH-FORMAT",
    })
    return errors
  }

  // 2. Path must exist in CURRENT FILE STATE (when one was provided).
  if (existingFiles) {
    if (!isKnownExistingPath(patch.path, knownPaths)) {
      errors.push({
        severity: "high",
        message: `Patch targets a path that was not in CURRENT FILE STATE: ${patch.path}`,
        file: patch.path,
        ruleId: "PATCH-UNKNOWN-TARGET",
      })
    }
  }

  // 3. Hunks must parse + have at least one context line per hunk so
  //    `git apply --check` has anchor points.
  const hunks = parseHunks(patch.patchContent)
  if (hunks.length === 0) {
    errors.push({
      severity: "high",
      message: "Patch contains no parseable hunks",
      file: patch.path,
      ruleId: "PATCH-FORMAT",
    })
  } else {
    for (const h of hunks) {
      // Verify declared lengths match observed counts. Allow off-by-one for
      // trailing newline quirks — git is tolerant.
      const obsOld = h.contextLines + h.deletions
      const obsNew = h.contextLines + h.additions
      if (Math.abs(obsOld - h.oldLen) > 1 || Math.abs(obsNew - h.newLen) > 1) {
        errors.push({
          severity: "medium",
          message: `Patch hunk header lengths do not match observed lines (declared -${h.oldLen}/+${h.newLen}, observed -${obsOld}/+${obsNew})`,
          file: patch.path,
          ruleId: "PATCH-HUNK-LENGTHS",
        })
      }
    }
  }

  // 4. CR-3 — additions must not introduce banned imports.
  const additionsText = extractAdditionsText(patch.patchContent)
  for (const banned of findBannedImports(additionsText)) {
    errors.push({
      severity: "high",
      message: `Patch introduces banned import: ${banned}`,
      file: patch.path,
      ruleId: "CR-3",
    })
  }

  // 5. CR-5 — additions must not introduce raw hex.
  const hexHits = findRawHex(additionsText)
  if (hexHits.length > 0) {
    errors.push({
      severity: "medium",
      message: `Patch introduces ${hexHits.length} raw hex value(s): use Dash tokens`,
      file: patch.path,
      ruleId: "CR-5",
    })
  }

  return errors
}

function isKnownExistingPath(target: string, known: Set<string>): boolean {
  if (known.has(target)) return true
  // Existing-file-reader returns absolute paths; the model may quote a path
  // relative to the repo root. Accept either when one is a suffix of the other.
  for (const known1 of known) {
    if (known1.endsWith("/" + target) || target.endsWith("/" + known1)) return true
  }
  return false
}

function extractAdditionsText(patchContent: string): string {
  const lines = patchContent.split("\n")
  const additions: string[] = []
  for (const line of lines) {
    if (line.startsWith("+++") || line.startsWith("---")) continue
    if (line.startsWith("+")) additions.push(line.slice(1))
  }
  return additions.join("\n")
}

function severityWeight(s: "high" | "medium" | "low"): number {
  if (s === "high") return 20
  if (s === "medium") return 8
  return 2
}

// ---------------------------------------------------------------------------
// Daemon-self-audit — scans Dash Build's OWN daemon template literals for raw
// hex. Used by pre-commit / CI to keep the AI builder honest: it cannot ship
// rules to consumer repos that its own daemon UI violates.
// ---------------------------------------------------------------------------

/** Resolve the daemon source root relative to this compiled file. */
function defaultDaemonRoot(): string {
  // This file lives under src/skills/ at source time and dist/ at build time.
  // Walk up until we find the package root (where package.json lives), then join
  // src/daemon. Best-effort, with a graceful empty-finding return when missing.
  const here = dirname(fileURLToPath(import.meta.url))
  // Try a couple of candidate roots so test + production layouts both work.
  const candidates = [
    join(here, "..", "daemon"),
    join(here, "..", "..", "src", "daemon"),
    join(here, "..", "..", "..", "src", "daemon"),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  return candidates[0]
}

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue
      out.push(...collectTsFiles(full))
    } else if (stat.isFile() && entry.endsWith(".ts")) {
      out.push(full)
    }
  }
  return out
}

function validateDaemonSelfAudit(
  design: DesignContext,
  opts: ValidateOptions,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []
  let score = 100

  const root = opts.daemonRoot ?? defaultDaemonRoot()
  const allowSet = new Set(
    (opts.allowlist ?? []).map((e) => `${e.file}::${e.hex.toLowerCase()}`),
  )

  const files = collectTsFiles(root)
  if (files.length === 0) {
    warnings.push(`Daemon self-audit: no files found under ${root}`)
  }

  // Walk-up to package root to produce stable relative paths for allowlist keys.
  const packageRootGuess = (() => {
    let cur = root
    for (let i = 0; i < 5; i++) {
      const parent = dirname(cur)
      if (parent === cur) break
      if (existsSync(join(parent, "package.json"))) return parent
      cur = parent
    }
    return dirname(root)
  })()

  for (const abs of files) {
    const relPath = relative(packageRootGuess, abs).split(sep).join("/")
    const text = readFileSync(abs, "utf8")
    const lines = text.split("\n")
    let hexCount = 0

    for (const line of lines) {
      if (DAEMON_COMMENT_LINE_RE.test(line)) continue
      HEX_RE.lastIndex = 0
      const matches = line.match(HEX_RE)
      if (!matches) continue
      if (DAEMON_VAR_DEFINITION_RE.test(line) || DAEMON_VAR_FALLBACK_RE.test(line)) continue
      for (const hex of matches) {
        const key = `${relPath}::${hex.toLowerCase()}`
        if (allowSet.has(key)) continue
        hexCount++
      }
    }

    if (hexCount > 0) {
      errors.push({
        severity: "medium",
        message: `Daemon CSS contains ${hexCount} raw hex literal(s) — use semantic var() tokens`,
        file: relPath,
        ruleId: "CR-5-DAEMON",
      })
      score -= Math.min(20, 5 * hexCount)
    }
  }

  if (design.missingSources.length > 0) {
    warnings.push(
      `Design context degraded — ${design.missingSources.length} foundation file(s) missing`,
    )
  }

  const tokenViolationCount = errors.filter(
    (e) => e.ruleId === "CR-5" || e.ruleId === "CR-5-DAEMON",
  ).length
  return {
    passed: tokenViolationCount === 0,
    score: Math.max(0, Math.min(100, score)),
    errors,
    warnings,
  }
}
