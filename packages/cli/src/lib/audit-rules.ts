/**
 * Dash audit — rule definitions for consumer-repo drift detection.
 *
 * v1: hardcoded catalog mirroring the Adaptation Layer ban list from
 * `apps/docs/scripts/validate-patterns.ts` + a couple of style-drift heuristics.
 * v2 will load this from `registry/rules/audit-rules.json` published by the
 * docs repo so PEs always get the freshest catalog without bumping the CLI.
 *
 * A rule fires when its regex matches a line in a file under `fileGlob`
 * (filename suffix match, since we don't take a glob dep). HIGH severity is
 * "blocks PR" (used by --fail-on-error); MEDIUM is informational.
 *
 * The `allowlist` field skips files whose path contains any of the listed
 * substrings — used for "no hex outside tokens/" style rules.
 */

export type AuditSeverity = "high" | "medium"

export type AuditRule = {
  id: string
  severity: AuditSeverity
  /** Short human label printed in reports. */
  label: string
  /** Category bucket for the --only filter. */
  category: "imports" | "style"
  /** Filename suffixes the rule applies to (e.g. [".tsx", ".ts"]). */
  fileExt: readonly string[]
  /** Pattern matched per-line; must be a fresh regex per call (no /g). */
  regex: RegExp
  /** If the file path contains any of these substrings, skip the rule. */
  allowlistPathContains?: readonly string[]
  /** If set, only fail when the per-file match count exceeds the threshold. */
  warnAboveCount?: number
  /** Per-line extra filter: return true to count the match as drift. */
  lineFilter?: (line: string) => boolean
}

/**
 * Detect a `from "<pkg>"` import that is NOT type-only.
 *
 * Type-only imports (`import type { Foo } from "zod"`) are allowed for `zod`
 * because some repos still use `z.infer<>` against schemas defined elsewhere.
 * Anything else (value imports) counts as drift.
 */
function isValueImportLine(line: string): boolean {
  // strip leading whitespace
  const t = line.replace(/^\s+/, "")
  if (!t.startsWith("import")) return false
  // `import type { ... } from "..."` — type-only, skip
  if (/^import\s+type\b/.test(t)) return false
  return true
}

export const AUDIT_RULES: readonly AuditRule[] = [
  {
    id: "no-rhf",
    severity: "high",
    label: "react-hook-form import",
    category: "imports",
    fileExt: [".ts", ".tsx", ".js", ".jsx"],
    regex: /from\s+['"]react-hook-form['"]/,
    lineFilter: isValueImportLine,
  },
  {
    id: "no-hookform-resolvers",
    severity: "high",
    label: "@hookform/resolvers import",
    category: "imports",
    fileExt: [".ts", ".tsx", ".js", ".jsx"],
    regex: /from\s+['"]@hookform\/resolvers(?:\/[^'"]*)?['"]/,
    lineFilter: isValueImportLine,
  },
  {
    id: "no-zod",
    severity: "high",
    label: "zod value import (type-only allowed)",
    category: "imports",
    fileExt: [".ts", ".tsx", ".js", ".jsx"],
    regex: /from\s+['"]zod(?:\/[^'"]*)?['"]/,
    lineFilter: isValueImportLine,
  },
  {
    id: "no-tanstack-query",
    severity: "high",
    label: "@tanstack/react-query import",
    category: "imports",
    fileExt: [".ts", ".tsx", ".js", ".jsx"],
    regex: /from\s+['"]@tanstack\/react-query(?:\/[^'"]*)?['"]/,
    lineFilter: isValueImportLine,
  },
  {
    id: "no-swr",
    severity: "high",
    label: "swr import",
    category: "imports",
    fileExt: [".ts", ".tsx", ".js", ".jsx"],
    regex: /from\s+['"]swr(?:\/[^'"]*)?['"]/,
    lineFilter: isValueImportLine,
  },
  {
    id: "off-token-hex",
    severity: "medium",
    label: "Inline hex color outside tokens/ or styles/",
    category: "style",
    fileExt: [".tsx"],
    // 3-, 4-, 6- or 8-digit hex, must be word-bounded so we don't match e.g.
    // "#fragment" or "abc123def"
    regex: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/,
    allowlistPathContains: [
      "/tokens/",
      "/styles/",
      "/theme/",
      // never lint dist/build/test fixture output
      "/__tests__/",
    ],
  },
  {
    id: "inline-style-prop",
    severity: "medium",
    label: "Inline `style={{...}}` prop (prefer Tailwind / token class)",
    category: "style",
    fileExt: [".tsx"],
    regex: /\bstyle=\{\{/,
    // Only warn when a file accumulates more than 10 — single uses are common
    // for dynamic transforms and not worth flagging.
    warnAboveCount: 10,
  },
] as const

export const AUDIT_CATEGORIES = ["imports", "style"] as const
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number]
