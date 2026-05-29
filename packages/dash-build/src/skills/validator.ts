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
import { NAV_REGISTRY_REASON_MARKER } from "./path-resolver.js"
import { looksLikeUnifiedDiff } from "../runs/patch-applier.js"
import type {
  DesignContext,
  ExistingFilesContext,
  IntakeContext,
  ParsedFile,
  ParsedPatch,
  ParsedResponse,
  RepoContextPack,
  RepoSurface,
  ValidationError,
  ValidationResult,
} from "./types.js"

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const DASH_TOKEN_RE =
  /bg-(primary|bg-white|bg-weak|bg-strong|bg-surface|bg-soft|bg-sub)-|text-text-(strong|sub|disabled|white|soft)-|border-(stroke|error|state)-/
// Voice register is PER-SURFACE (CLAUDE.md cardinal rule 5 + dash-ai-rules.md
// refuse-list #6). portal-v2 mitra-facing DEFAULT is informal "kamu"; "Anda" is
// a per-feature override only. backoffice / basecamp / react-fleet / other
// internal surfaces stay formal "Anda". So we split the casual lexicon:
//
//   SLANG_PARTICLE_RE  — never acceptable on ANY Dash surface (slang/jokey).
//   INFORMAL_PRONOUN_RE — acceptable on portal-v2 (the informal-default repo),
//                         flagged everywhere else.
//
// CASUAL_VOICE_RE = the union, used as the formal-surface gate (kamu flagged).
const SLANG_PARTICLE_RE = /\b(yaa|lewatin|bakal|udah|yuk|ayo|dong|deh|sih|kok|plis|banget|nih)\b/i
const INFORMAL_PRONOUN_RE = /\b(kamu|kalian|km|lo|lu)\b/i
const CASUAL_VOICE_RE = /\b(kamu|yaa|lewatin|bakal|udah|yuk|ayo|dong|deh|sih|kok|plis|kalian|km)\b/i
const MITRA_KEYWORD_RE = /\b(mitra|driver|kurir|pengemudi)\b/i

/**
 * Repos whose mitra-facing default register is INFORMAL "kamu". Today only
 * portal-v2 (per CLAUDE.md cardinal rule 5). For these, casual pronouns are
 * CORRECT and must not be penalized — only true slang particles are flagged.
 * Every other surface (backoffice, basecamp, react-fleet, unknown, …) keeps
 * the formal-"Anda" enforcement.
 */
function isInformalDefaultRepo(repoSlug: RepoSurface | null | undefined): boolean {
  return repoSlug === "portal-v2"
}

// ---------------------------------------------------------------------------
// Phase B (Tier 0C / 0J / 0K) — DS coverage + stack mandate + voice helpers.
// ---------------------------------------------------------------------------

/** Match any `import … from "@dash/<pkg>"` (ui, blocks, templates, etc.). */
const DS_IMPORT_RE = /from\s+['"]@dash\/(?:ui|blocks|templates|patterns|hooks|lib)(?:\/[^'"]*)?['"]/g
/** Lightweight JSX element counter — matches `<Tag ` or `<Tag>` or `<Tag/>`. */
const JSX_ELEMENT_RE = /<([A-Za-z][A-Za-z0-9.-]*)[\s/>]/g
/** UI-shaped prompt keywords — table / dashboard / form / list / modal / etc. */
const UI_SHAPED_PROMPT_RE =
  /\b(table|dashboard|form|list|modal|drawer|tabs?|card|chart|filter|panel|sidebar|topbar|nav|menu|toast|badge|button|input|page|screen|surface|tile|widget)\b/i
/** Casual / shouting raw-HTML utility class pattern (used to detect anti-pattern). */
const RAW_BG_UTILITY_RE = /className=["'][^"']*\bbg-(?:success|warning|error|info|neutral)-[a-z]+\b/i

const UI_FILE_RE = /\.(tsx|jsx)$/

function isUiContent(file: ParsedFile): boolean {
  return TSX_LIKE.has(file.language) || UI_FILE_RE.test(file.path)
}

export interface DsCoverageMetrics {
  dsImports: number
  jsxElements: number
  rawUtilityAntipatterns: number
  ratio: number
}

/**
 * Tier 0C — count Dash DS imports vs raw JSX HTML elements across UI files.
 *
 * `ratio` = dsImports / max(1, lowercase-first-letter-jsx-elements). Lowercase
 * elements are the proxy for raw HTML (`<div>` / `<span>` / `<button>`); we
 * exclude `<Capitalized>` because those are themselves React components and
 * may already be DS-backed even when not directly imported.
 */
export function measureDSCoverage(files: ParsedFile[]): DsCoverageMetrics {
  let dsImports = 0
  let rawHtmlElements = 0
  let rawUtility = 0
  for (const file of files) {
    if (!isUiContent(file)) continue
    DS_IMPORT_RE.lastIndex = 0
    const dsMatches = file.content.match(DS_IMPORT_RE)
    if (dsMatches) dsImports += dsMatches.length

    // Count raw HTML elements as the denominator. Walk all JSX elements and
    // include only those whose tag starts with a lowercase letter (HTML).
    JSX_ELEMENT_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = JSX_ELEMENT_RE.exec(file.content))) {
      const tag = m[1]
      if (!tag) continue
      const first = tag[0]
      if (first && first >= "a" && first <= "z") rawHtmlElements += 1
    }

    if (RAW_BG_UTILITY_RE.test(file.content)) rawUtility += 1
  }
  const denom = Math.max(1, rawHtmlElements)
  return {
    dsImports,
    jsxElements: rawHtmlElements,
    rawUtilityAntipatterns: rawUtility,
    ratio: dsImports / denom,
  }
}

export function isUiShapedPrompt(prompt: string | null | undefined): boolean {
  if (!prompt) return false
  return UI_SHAPED_PROMPT_RE.test(prompt)
}

// ---------------------------------------------------------------------------
// Stack-mandate enforcement (Tier 0J)
// ---------------------------------------------------------------------------

interface StackMandate {
  /** Allowed file extensions (lowercase, no dot). */
  fileExtensions: string[]
  /** Forbidden state-management/library imports for this surface. */
  forbiddenImports: string[]
  /** Human-readable description for error messages. */
  description: string
}

const STACK_MANDATE: Partial<Record<RepoSurface, StackMandate>> = {
  backoffice: {
    fileExtensions: ["js", "jsx"],
    forbiddenImports: ["jotai", "zustand", "@reduxjs/toolkit", "redux"],
    description: "backoffice uses Pages Router + JavaScript (.js) + useState + axios + NextAuth",
  },
  "portal-v2": {
    fileExtensions: ["ts", "tsx"],
    forbiddenImports: ["zustand", "@reduxjs/toolkit"],
    description: "portal-v2 uses App Router + TypeScript (.tsx) + Jotai + axios",
  },
  basecamp: {
    fileExtensions: ["ts", "tsx"],
    forbiddenImports: ["jotai", "@reduxjs/toolkit"],
    description: "basecamp uses App Router + TypeScript (.tsx) + Zustand 5 + Firebase + shadcn",
  },
  "react-fleet": {
    fileExtensions: ["ts", "tsx"],
    forbiddenImports: ["jotai", "zustand", "next", "@reduxjs/toolkit"],
    description: "react-fleet uses CRA + CRACO + TypeScript (.tsx) + useState + useFormValidation",
  },
}

function fileExtension(p: string): string {
  const idx = p.lastIndexOf(".")
  if (idx < 0) return ""
  return p.slice(idx + 1).toLowerCase()
}

function findForbiddenImports(content: string, forbidden: string[]): string[] {
  const hits = new Set<string>()
  for (const lib of forbidden) {
    const escaped = lib.replace(/[/\\$.*+?()[\]{}|^]/g, "\\$&")
    const re = new RegExp(`(?:from\\s+|require\\(\\s*)['"]${escaped}(?:['"]|/)`, "g")
    if (re.test(content)) hits.add(lib)
  }
  return Array.from(hits)
}

interface StackMandateViolation {
  file: string
  reason: string
}

export function checkStackMandate(
  files: ParsedFile[],
  repoSlug: RepoSurface | null,
): StackMandateViolation[] {
  if (!repoSlug) return []
  const mandate = STACK_MANDATE[repoSlug]
  if (!mandate) return []
  const violations: StackMandateViolation[] = []
  for (const file of files) {
    if (!isUiContent(file) && !/\.(js|jsx|ts|tsx)$/.test(file.path)) continue
    const ext = fileExtension(file.path)
    // Allow preview.tsx escape hatch — it's a Dash Build sandbox artifact, not
    // a production file in the target repo.
    const isPreview = /(?:^|\/)preview\.tsx?$/.test(file.path)
    if (ext && !mandate.fileExtensions.includes(ext) && !isPreview) {
      violations.push({
        file: file.path,
        reason: `${mandate.description} — but file extension is .${ext} (expected one of: ${mandate.fileExtensions.map((e) => "." + e).join(", ")})`,
      })
    }
    const forbidden = findForbiddenImports(file.content, mandate.forbiddenImports)
    for (const lib of forbidden) {
      violations.push({
        file: file.path,
        reason: `${mandate.description} — but ${lib} import detected. Use the mandated state primitive instead.`,
      })
    }
  }
  return violations
}

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
  /**
   * Intake context from the orchestrator. When `intake.auditTrail.required`
   * is true, the validator enforces that the generated output references one
   * of the known audit-bearing blocks. Missing reference → high-severity
   * validation error.
   */
  intake?: IntakeContext | null
  /**
   * Phase B/0D — original user prompt. Used by the DS-coverage gate to
   * detect UI-shaped prompts (`dashboard`, `form`, `table`, `button`, `page`,
   * `tab` keywords). When omitted, the gate falls back to scanning generated
   * file contents only.
   */
  prompt?: string
  /**
   * Phase B Tier 0J — repo context. Enables stack-mandate enforcement: the
   * validator flags wrong file extensions and forbidden state-mgmt imports
   * for the resolved surface (backoffice → .js + useState, portal-v2 → .tsx
   * + Jotai, etc.). Backwards-compatible: omit to skip the check entirely.
   */
  repoContext?: RepoContextPack | null
}

// ---------------------------------------------------------------------------
// Phase 0D — DS coverage gate
//
// Scores how much the generated TSX leans on Dash DS imports vs raw HTML.
// When ratio is low AND the prompt is UI-shaped, the validator emits a
// high-severity error so the chain can retry with a stronger DS-first
// directive (composer adds "PREFER @dash/ui imports" hint on retry).
//
// The full scorer ships in Phase B as `src/skills/ds-coverage-scorer.ts`.
// Until that lands we compute a minimal in-line stub so 0D wiring is testable
// independently. When the real scorer file appears, swap the `computeStub`
// call for the dynamic import — see TODO below.
// ---------------------------------------------------------------------------

/** Heuristic keywords — if the prompt mentions any of these, output that ignores
 *  the DS becomes a high-severity finding. */
const UI_SHAPED_PROMPT_KEYWORDS: readonly string[] = [
  "dashboard",
  "form",
  "table",
  "button",
  "page",
  "tab",
  "modal",
  "card",
  "list",
  "badge",
  "input",
  "select",
  "alert",
  "banner",
  "drawer",
] as const

/** Below this ratio AND a UI-shaped prompt → DS-coverage violation. */
const DS_IMPORT_RATIO_THRESHOLD = 0.3

interface DsCoverageScore {
  /** 0..1 — share of imports that are Dash DS imports. */
  dsImportRatio: number
  /** Total imports counted in TSX/JSX files. */
  totalImports: number
  /** Total @dash/* imports counted. */
  dashImports: number
}

/** In-line scorer stub. When `src/skills/ds-coverage-scorer.ts` lands this
 *  function is replaced by a dynamic import of the real implementation. */
function computeDsCoverageStub(parsed: ParsedResponse): DsCoverageScore {
  let totalImports = 0
  let dashImports = 0
  const importRe = /^\s*import\s[^"']*from\s+["']([^"']+)["']/gm
  for (const f of parsed.files) {
    if (!isUIFile(f)) continue
    let m: RegExpExecArray | null
    importRe.lastIndex = 0
    while ((m = importRe.exec(f.content)) !== null) {
      totalImports += 1
      const spec = m[1]!
      if (spec.startsWith("@dash/")) dashImports += 1
    }
  }
  const dsImportRatio = totalImports === 0 ? 0 : dashImports / totalImports
  return { dsImportRatio, totalImports, dashImports }
}

function isPromptUiShaped(prompt: string | undefined, _parsed: ParsedResponse): boolean {
  // Strict: only fire when the prompt explicitly contains a UI keyword. The
  // fallback "any TSX file is UI-shaped" path triggers too aggressively on
  // small util TSX exports and on legacy test fixtures. Phase B's real scorer
  // will own the heuristic — for now stay conservative.
  const haystack = (prompt ?? "").toLowerCase()
  if (haystack.length === 0) return false
  for (const kw of UI_SHAPED_PROMPT_KEYWORDS) {
    if (haystack.includes(kw)) return true
  }
  return false
}

/**
 * Phase 0D — DS coverage check. Returns a validation error when generated TSX
 * is mostly raw HTML on a UI-shaped prompt, or null when output is fine /
 * the gate doesn't apply (e.g. non-UI prompt, no TSX files).
 *
 * Designed to be a clean stub today — when Phase B publishes the real scorer
 * (`src/skills/ds-coverage-scorer.ts`), swap `computeDsCoverageStub` for the
 * dynamic import without touching the call site.
 */
export function checkDsCoverage(
  parsed: ParsedResponse,
  opts: { prompt?: string } = {},
): ValidationError | null {
  if (parsed.files.length === 0) return null
  const uiShaped = isPromptUiShaped(opts.prompt, parsed)
  if (!uiShaped) return null

  const score = computeDsCoverageStub(parsed)
  // Need enough imports to make a confident judgment. A 1-import file
  // (commonly just `import { useState } from "react"`) is too sparse for a
  // meaningful ratio. Phase B's real scorer will look at JSX shape too;
  // for the stub, require ≥2 imports before firing.
  const isMiss =
    score.totalImports < 2
      ? false
      : score.dsImportRatio < DS_IMPORT_RATIO_THRESHOLD
  if (!isMiss) return null

  const focusFile = parsed.files.find(isUIFile)?.path ?? "(unknown)"
  return {
    severity: "high",
    message:
      `Output uses ${score.dashImports}/${score.totalImports} Dash DS imports ` +
      `(ratio ${(score.dsImportRatio * 100).toFixed(0)}% < threshold ${DS_IMPORT_RATIO_THRESHOLD * 100}%). ` +
      `UI-shaped prompts must prefer @dash/ui atoms (Badge, Card, Table, Tabs, Button, Input, …) ` +
      `over raw <div>/<span>/<button> markup. Retry with stronger DS-first directive.`,
    file: focusFile,
    ruleId: "DS-COVERAGE",
  }
}

/** Patterns that satisfy CR-3 audit-trail enforcement. The pipeline composer
 *  hints these to the model; the validator accepts either an import OR a JSX
 *  reference to the same block name. */
const AUDIT_BEARING_TOKENS: readonly string[] = [
  "inline-edit-with-audit",
  "image-editor-with-audit",
  "InlineEditWithAudit",
  "ImageEditorWithAudit",
] as const

export function outputReferencesAuditBlock(parsed: ParsedResponse): boolean {
  const haystacks: string[] = []
  for (const f of parsed.files) haystacks.push(f.content)
  for (const p of parsed.patches ?? []) haystacks.push(p.patchContent)
  if (haystacks.length === 0) return false
  return haystacks.some((text) =>
    AUDIT_BEARING_TOKENS.some((token) => text.includes(token)),
  )
}

// Patterns that hint the OUTPUT itself ships an audit log call — not just an
// audit-bearing block reference. Used by `enforceAuditLogCall()` for the
// post-generation rejection gate (CR-3).
//   - `auditLog.create({…})`         — Prisma / direct call
//   - `writeAuditLog(`               — helper convention
//   - `logAudit(`                    — helper convention
//   - `audit.create(` / `audit.log(` — alternative namespacing
const AUDIT_CALL_RE = new RegExp(
  [
    "\\bauditLog\\s*\\.\\s*create\\s*\\(",
    "\\bwriteAuditLog\\s*\\(",
    "\\blogAudit\\s*\\(",
    "\\baudit\\s*\\.\\s*(?:create|log)\\s*\\(",
    "\\baudit_log\\s*\\.\\s*create\\s*\\(",
  ].join("|"),
)

/**
 * Lexicon of input / field names that, when written by user-editable code,
 * MUST be accompanied by an audit log. Mirrors the CR-3 watch list in
 * `intake/audit-trail-enforcer.ts` but operates against the GENERATED output
 * rather than the prompt.
 */
const AUDIT_SENSITIVE_KEYWORDS = [
  "payment",
  "payout",
  "topup",
  "withdraw",
  "withdrawal",
  "refund",
  "balance",
  "transfer",
  "invoice",
  "saldo",
  "kyc",
  "ktp",
  "npwp",
  "signature",
  "ttd",
  "image_proof",
  "imageproof",
  "photo_proof",
  "photoproof",
  "selfie",
  "passport",
  "bukti_foto",
  "buktifoto",
  "bukti_gambar",
  "buktigambar",
]

function detectAuditSensitiveField(text: string): string | null {
  // Walk JSX/HTML name= attributes first (highest signal).
  const attrRe = /(?:name|data-field|id)\s*=\s*["'`]([A-Za-z0-9_\-]+)["'`]/gi
  let m: RegExpExecArray | null
  while ((m = attrRe.exec(text)) !== null) {
    const raw = m[1]
    if (!raw) continue
    const normalised = raw
      .toLowerCase()
      .replace(/[-_]+/g, "_")
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    for (const kw of AUDIT_SENSITIVE_KEYWORDS) {
      if (normalised.includes(kw)) return raw
    }
  }
  // Fall-through: look for camelCase / snake_case property keys in object
  // literals that hint persistence of the sensitive field.
  const lower = text.toLowerCase()
  for (const kw of AUDIT_SENSITIVE_KEYWORDS) {
    const propRe = new RegExp(`\\b[a-z_]*${kw}[a-z_]*\\s*[:=]`, "i")
    if (propRe.test(lower)) {
      const verbRe = new RegExp(`\\b([A-Za-z_]*${kw}[A-Za-z_]*)\\s*[:=]`, "i")
      const hit = verbRe.exec(text)
      return hit?.[1] ?? kw
    }
  }
  return null
}

export interface AuditEnforcementOutcome {
  /** False when a sensitive field appears WITHOUT an audit-log call. */
  ok: boolean
  /** The first sensitive field name we found (verbatim from the output). */
  sensitiveField: string | null
  /** Whether the output contained any audit-log call (regardless of `ok`). */
  hasAuditCall: boolean
  /** Files involved in the finding — surfaced to the UI for context. */
  files: string[]
}

/**
 * Output-level audit enforcement. Mirrors the in-prompt watch list but runs
 * AFTER generation — when the model has emitted a payment / KYC / signature /
 * image-proof field name WITHOUT an `auditLog.create({…})`-style call anywhere
 * in the output, reject the artifact. The orchestrator surfaces this rejection
 * to the UI so the user sees why their PR is held back.
 */
export function enforceAuditLogCall(
  parsed: ParsedResponse,
): AuditEnforcementOutcome {
  const haystacks: Array<{ text: string; file: string }> = []
  for (const f of parsed.files) haystacks.push({ text: f.content, file: f.path })
  for (const p of parsed.patches ?? [])
    haystacks.push({ text: p.patchContent, file: p.path })
  if (haystacks.length === 0) {
    return { ok: true, sensitiveField: null, hasAuditCall: false, files: [] }
  }

  let firstSensitive: { field: string; file: string } | null = null
  for (const { text, file } of haystacks) {
    const hit = detectAuditSensitiveField(text)
    if (hit) {
      firstSensitive = { field: hit, file }
      break
    }
  }
  if (!firstSensitive) {
    return { ok: true, sensitiveField: null, hasAuditCall: false, files: [] }
  }

  const hasAuditCall = haystacks.some(({ text }) => AUDIT_CALL_RE.test(text))
  if (hasAuditCall) {
    return {
      ok: true,
      sensitiveField: firstSensitive.field,
      hasAuditCall: true,
      files: haystacks.map((h) => h.file),
    }
  }
  return {
    ok: false,
    sensitiveField: firstSensitive.field,
    hasAuditCall: false,
    files: [firstSensitive.file],
  }
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

    // Casual voice on UI files — PER-SURFACE register (CLAUDE.md cardinal rule
    // 5). portal-v2 mitra-facing default is informal "kamu"; flagging it there
    // contradicts the canonical rule. So on the informal-default repo we only
    // catch true slang particles (yuk/dong/sih/banget…); everywhere else we
    // keep the full formal-"Anda" gate (kamu included).
    if (isUIFile(file)) {
      const informalRepo = isInformalDefaultRepo(opts.repoContext?.repoSlug)
      const voiceRe = informalRepo ? SLANG_PARTICLE_RE : CASUAL_VOICE_RE
      if (voiceRe.test(file.content)) {
        const isMitra = MITRA_KEYWORD_RE.test(file.content)
        const message = informalRepo
          ? `Slang particle detected — portal-v2 mitra voice is informal "kamu" but slang (yuk/dong/sih/banget) is still off-register`
          : `Casual voice particle detected — formal "Anda" register required on this surface`
        errors.push({
          severity: isMitra ? "medium" : "low",
          message,
          file: file.path,
          ruleId: "CR-4",
        })
        score -= isMitra ? 10 : 3
      }
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
    // Nav/sidebar registry files surfaced by PathResolver (requiresNavOrRoute)
    // are valid additive patch targets even when the reader's top-N budget
    // skipped reading them. Registering a new tab in the real sidebar is how a
    // generated feature ships REACHABLE — accept the additive nav diff here and
    // let the additive patch-validator gate enforce the real safety contract.
    for (const r of opts.existingFiles?.resolutions ?? []) {
      if (isNavRegistryResolution(r)) knownPaths.add(r.filePath)
    }
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

  // ── Phase 0D — DS coverage gate ─────────────────────────────────────────
  // UI-shaped prompts (dashboard/form/table/button/page/tab) MUST lean on
  // @dash/ui atoms. Raw HTML + Tailwind utilities is the "Lovable lab demo"
  // anti-pattern user explicitly pushed back on. High-severity finding so
  // `passed` flips false and the chain retries with a stronger directive.
  const dsCoverageError = checkDsCoverage(parsed, { prompt: opts.prompt })
  if (dsCoverageError) {
    errors.push(dsCoverageError)
    score -= 20
  }

  // ── Phase B Tier 0C — DS-coverage METRIC + raw utility anti-pattern ────
  // Separate from Phase 0D's import-ratio gate: this checks for direct raw
  // utility-class patterns (e.g. `<div className="bg-success-light">`) that
  // should always be a `<Badge variant="success">` regardless of prompt
  // shape. Medium severity. Conservative: only fires when caller threaded
  // the prompt through (matches Phase 0D's stance — legacy callers without
  // a prompt context skip the penalty so we don't break direct-chain tests).
  if (opts.prompt) {
    const dsMetrics = measureDSCoverage(parsed.files)
    if (dsMetrics.rawUtilityAntipatterns > 0) {
      const focusFile = parsed.files.find(isUIFile)?.path ?? "(unknown)"
      errors.push({
        severity: "medium",
        message:
          `Raw utility-class status pattern detected (${dsMetrics.rawUtilityAntipatterns} file(s)). ` +
          `Use \`<Badge variant="...">\` from @dash/ui instead of \`<div className="bg-success-light">\`.`,
        file: focusFile,
        // Distinct ruleId from Phase 0D's "DS-COVERAGE" so callers can target
        // each gate independently in tests + dashboards.
        ruleId: "DS-COVERAGE-RAW-UTILITY",
      })
      score -= 5
    }
  }

  // ── Phase B Tier 0J — per-repo stack mandate enforcement ───────────────
  // When the chain knows the target surface (backoffice/portal-v2/etc.) the
  // validator flags wrong file extensions and forbidden state-mgmt imports
  // for that surface. Backwards-compatible: skipped when repoContext omitted.
  if (opts.repoContext) {
    const stackViolations = checkStackMandate(parsed.files, opts.repoContext.repoSlug)
    for (const v of stackViolations) {
      errors.push({
        severity: "high",
        message: v.reason,
        file: v.file,
        ruleId: "STACK-MANDATE",
      })
      score -= 10
    }
  }

  // ── CR-3 audit-trail enforcement ────────────────────────────────────────
  // When intake flagged audit-trail required, the generated output MUST
  // reference one of the known audit-bearing Dash DS blocks. Otherwise the
  // model silently produced raw inline-edit and we'd ship a legal gap.
  if (opts.intake?.auditTrail.required) {
    const found = outputReferencesAuditBlock(parsed)
    if (!found) {
      const focusFile =
        parsed.files[0]?.path ?? parsed.patches?.[0]?.path ?? "(unknown)"
      errors.push({
        severity: "high",
        message:
          "Output skips audit-trail pattern; CR-3 requires logging for legal/financial fields. " +
          `Use @dash/blocks/${opts.intake.auditTrail.pattern} (or the matching JSX component).`,
        file: focusFile,
        ruleId: "CR-3",
      })
      score -= 20
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

/**
 * True when a PathResolution points at the repo's nav/sidebar registry (set by
 * PathResolver under requiresNavOrRoute). Such files are valid additive patch
 * targets — registering a new tab there is how a generated feature ships
 * reachable — so they count as known even if the reader's top-N budget skipped
 * reading their content into existingFiles.files.
 */
function isNavRegistryResolution(r: { reason?: string }): boolean {
  return typeof r.reason === "string" && r.reason.includes(NAV_REGISTRY_REASON_MARKER)
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
