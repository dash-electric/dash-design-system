/**
 * Patch validator — enforces the cardinal "additive-only" rule for Dash Build.
 *
 * Cardinal rule #1 (CLAUDE.md): "Existing Dash production code is NEVER
 * modified. This repo is purely ADDITIVE." Dash Build's Sprint 2B introduced
 * mode=patch unified-diff fragments. Without a gate, the AI agent can emit
 * any patch (refactor, rename, delete) and `git apply` will silently mutate
 * existing logic — violating the cardinal rule.
 *
 * This validator is **lenient by design**: it ALLOWS the common safe-additive
 * patterns we actually want (route register, nav append, new barrel export,
 * new enum case, new switch case) and REJECTS structural modifications
 * (function body change, identifier rename, export removal, anything inside
 * a protected path like `**\/auth\/**`).
 *
 * The algorithm is intentionally regex-only — no AST parser, no extra deps.
 * The trade-off: we accept some over-permissiveness on append-style edits in
 * exchange for zero parse-failure risk on TSX / config / JSON files. The
 * orchestrator still runs `git apply --check` after this gate, so malformed
 * diffs are caught downstream.
 */

import type { ParsedPatch } from "../skills/types.js"

export type PatchValidationResult =
  | { ok: true; reason: "pure-additive" | "safe-append" | "allowlisted-pattern" }
  | { ok: false; reason: PatchRejectionReason; details: string }

export type PatchRejectionReason =
  | "modifies-existing-logic"
  | "renames-identifier"
  | "deletes-code"
  | "removes-export"
  | "touches-protected-path"
  | "malformed-patch"

export interface PatchAllowlist {
  /** File-path patterns whose patches are allowed even with structural
   *  re-indent deletions (registry-style files where appending an entry
   *  legitimately re-formats a trailing comma / bracket). */
  safeFilePatterns: RegExp[]
  /** File-path patterns that are NEVER patchable — auth, payment, env, etc.
   *  A match here is an immediate reject, regardless of patch shape. */
  protectedFilePatterns: RegExp[]
}

export const DEFAULT_PATCH_ALLOWLIST: PatchAllowlist = {
  safeFilePatterns: [
    /\/routes\.[jt]sx?$/,
    /\/nav-config\.[jt]sx?$/,
    /\/index\.[jt]sx?$/,
    /\/menu\.[jt]sx?$/,
    /\/registry\.json$/,
    /\.config\.[jt]sx?$/,
  ],
  protectedFilePatterns: [
    /\/auth\//,
    /\/payment\//,
    /\/middleware\.[jt]sx?$/,
    /\/lib\/api\./,
    /\.env(\.|$)/,
  ],
}

// ── Internal helpers ──────────────────────────────────────────────────────

/** Identifier-binding deletions that imply "real" logic change. We look for
 *  the keyword at the start of the trimmed body so that comments mentioning
 *  these words are ignored. */
const LOGIC_KEYWORDS_RE =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+[A-Za-z_$]/

/** Pure export-line removal — exposes the public surface change. */
const EXPORT_LINE_RE = /^\s*export\b/

/** Lines that are "structural punctuation only" — closing brace/bracket/paren,
 *  comma, semicolon, or empty. Deletions of these are safe when re-emitted
 *  elsewhere in the same patch (typical for appending an entry to a literal). */
const STRUCTURAL_ONLY_RE = /^\s*[\]\}\)\,;]*\s*$/

interface DiffLines {
  additions: string[]
  deletions: string[]
  contextCount: number
  hunkCount: number
}

function splitDiff(patchContent: string): DiffLines {
  const out: DiffLines = {
    additions: [],
    deletions: [],
    contextCount: 0,
    hunkCount: 0,
  }
  for (const raw of patchContent.split("\n")) {
    if (raw.startsWith("+++") || raw.startsWith("---")) continue
    if (raw.startsWith("@@")) {
      out.hunkCount += 1
      continue
    }
    if (raw.startsWith("+")) {
      out.additions.push(raw.slice(1))
    } else if (raw.startsWith("-")) {
      out.deletions.push(raw.slice(1))
    } else {
      out.contextCount += 1
    }
  }
  return out
}

function looksLikeUnifiedDiff(patchContent: string): boolean {
  return /(^|\n)@@\s/.test(patchContent)
}

function matchesAny(path: string, patterns: RegExp[]): boolean {
  for (const re of patterns) {
    if (re.test(path)) return true
  }
  return false
}

/** Heuristic: was this hunk an "append at end of file" pattern? We treat any
 *  hunk that emits only additions after its context anchor as append-safe. */
function isAppendOnly(diff: DiffLines): boolean {
  return diff.deletions.length === 0 && diff.additions.length > 0
}

/** True when every deleted line is structural punctuation only (closing
 *  brace, comma, semicolon, blank). Common when appending to an array /
 *  object literal — the trailing `}` or `]` gets re-emitted lower down. */
function allDeletionsStructural(diff: DiffLines): boolean {
  if (diff.deletions.length === 0) return true
  for (const line of diff.deletions) {
    if (!STRUCTURAL_ONLY_RE.test(line)) return false
  }
  return true
}

/** Inspect deletions for identifier-level edits. Returns the first offending
 *  line, or null when clean. */
function findLogicDeletion(diff: DiffLines): string | null {
  for (const line of diff.deletions) {
    if (LOGIC_KEYWORDS_RE.test(line)) return line
  }
  return null
}

function findExportDeletion(diff: DiffLines): string | null {
  for (const line of diff.deletions) {
    if (EXPORT_LINE_RE.test(line)) return line
  }
  return null
}

/** Rename heuristic: same number of additions and deletions, every deletion
 *  pairs to an addition that differs only by identifier text. We approximate
 *  by checking that at least one (delete, add) pair shares the same prefix
 *  whitespace and surrounding tokens but a changed identifier. */
function looksLikeRename(diff: DiffLines): boolean {
  if (diff.deletions.length === 0 || diff.additions.length === 0) return false
  // Pair by index — typical rename patches list del/add lines adjacent.
  const pairs = Math.min(diff.deletions.length, diff.additions.length)
  let renamePairs = 0
  for (let i = 0; i < pairs; i++) {
    const d = diff.deletions[i]
    const a = diff.additions[i]
    if (!d || !a) continue
    // Both must contain a JS identifier-binding keyword.
    if (!LOGIC_KEYWORDS_RE.test(d) || !LOGIC_KEYWORDS_RE.test(a)) continue
    // Extract the identifier after the keyword.
    const idA = a.match(/\b(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/)
    const idD = d.match(/\b(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/)
    if (idA && idD && idA[1] !== idD[1]) renamePairs += 1
  }
  return renamePairs > 0
}

// ── Public API ────────────────────────────────────────────────────────────

export function validatePatch(
  patch: ParsedPatch,
  allowlist: PatchAllowlist = DEFAULT_PATCH_ALLOWLIST,
): PatchValidationResult {
  // Gate 0 — protected paths are never patchable, no matter the shape.
  if (matchesAny(patch.path, allowlist.protectedFilePatterns)) {
    return {
      ok: false,
      reason: "touches-protected-path",
      details: `Path ${patch.path} matches a protected pattern (auth/payment/middleware/env). Patches are forbidden — create a new file or escalate to a human reviewer.`,
    }
  }

  // Gate 1 — must look like a real unified diff. Malformed patches are
  // rejected early so downstream `git apply` doesn't blow up the run.
  if (!looksLikeUnifiedDiff(patch.patchContent)) {
    return {
      ok: false,
      reason: "malformed-patch",
      details: `Patch for ${patch.path} is not a valid unified diff (no @@ hunk header).`,
    }
  }

  const diff = splitDiff(patch.patchContent)

  // Gate 2 — pure additive (zero deletions). Always allowed regardless of
  // file path. This is the happiest path.
  if (isAppendOnly(diff)) {
    return { ok: true, reason: "pure-additive" }
  }

  // Gate 3 — rename detection before logic / export checks. Rename is the
  // most surgical violation and deserves its own reason code.
  if (looksLikeRename(diff)) {
    return {
      ok: false,
      reason: "renames-identifier",
      details: `Patch for ${patch.path} renames at least one identifier. Renames touch every call site — emit a new file with the new name instead of patching the old one.`,
    }
  }

  // Gate 4 — export removal. Public surface change; never silent.
  const exportLine = findExportDeletion(diff)
  if (exportLine) {
    return {
      ok: false,
      reason: "removes-export",
      details: `Patch for ${patch.path} removes an export line: "${exportLine.trim()}". Removing exports breaks downstream consumers — flag the export as deprecated in a new file instead.`,
    }
  }

  // Gate 5 — identifier-binding deletion (function / class / const / type
  // header). Catches the "rewrite the function body" pattern.
  const logicLine = findLogicDeletion(diff)
  if (logicLine) {
    return {
      ok: false,
      reason: "modifies-existing-logic",
      details: `Patch for ${patch.path} deletes a logic-binding line: "${logicLine.trim()}". Modifying existing functions/classes/types violates the additive-only rule.`,
    }
  }

  // Gate 6 — allowlisted file pattern accepts non-trivial deletions as long
  // as logic-level checks above pass. This is where routes.ts / nav-config
  // append patterns live (the trailing `}` or `]` gets re-emitted lower
  // down by the patch).
  if (matchesAny(patch.path, allowlist.safeFilePatterns)) {
    return { ok: true, reason: "allowlisted-pattern" }
  }

  // Gate 7 — structural-only deletions (closing brace / bracket / comma /
  // semicolon). Safe append-an-entry pattern even outside the allowlist —
  // common in enums, switch statements, object literals.
  if (allDeletionsStructural(diff)) {
    return { ok: true, reason: "safe-append" }
  }

  // Default — reject as a generic deletion. We err on the side of refusing
  // unfamiliar deletion shapes; user can broaden the allowlist if needed.
  return {
    ok: false,
    reason: "deletes-code",
    details: `Patch for ${patch.path} deletes ${diff.deletions.length} non-structural line(s) from a file outside the safe-append allowlist. Emit a new file or extend allowlist if the deletion is genuinely additive.`,
  }
}

// ── Reporting helpers (used by the orchestrator UI surface) ───────────────

export interface RejectedPatch {
  path: string
  reason: PatchRejectionReason
  details: string
}

export function summarizeRejection(reason: PatchRejectionReason): string {
  switch (reason) {
    case "modifies-existing-logic":
      return "modifies existing logic"
    case "renames-identifier":
      return "renames an identifier"
    case "deletes-code":
      return "deletes existing code"
    case "removes-export":
      return "removes an export"
    case "touches-protected-path":
      return "touches a protected path (auth/payment/env)"
    case "malformed-patch":
      return "is not a valid unified diff"
    default: {
      const exhaustive: never = reason
      return exhaustive
    }
  }
}
