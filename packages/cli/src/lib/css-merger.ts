/**
 * PostCSS-based CSS variable merger.
 *
 * Replaces the legacy regex approach in `file-writer.ts`. Properly handles
 * multi-line values (e.g. `oklch(0.5 0.2 30 / 0.5)`) and nested parens that
 * trip up naive `[^}]` regex matchers. Idempotent: re-running the same merge
 * produces identical output (modulo PostCSS's normal formatting).
 *
 * Public API: `mergeCssVars(existingCss, cssVars) → string`.
 *
 *   cssVars shape:
 *     { light: { foreground: "0 0 0" }, dark: { foreground: "1 1 1" } }
 *     // legacy keys "light" → ":root", "dark" → ".dark"
 *
 *     { ":root": { ... }, ".dark": { ... } }  also supported.
 */
import postcss, { type Root, type Rule, type Declaration } from "postcss"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error -- no published types for postcss-safe-parser
import safeParser from "postcss-safe-parser"

export type CssVarsInput = Record<string, Record<string, string>>

const SELECTOR_ALIAS: Record<string, string> = {
  light: ":root",
  dark: ".dark",
}

function resolveSelector(key: string): string {
  return SELECTOR_ALIAS[key] ?? key
}

/**
 * Merge cssVars into an existing CSS string. Returns the updated CSS.
 *
 * - If existing CSS has a matching rule, the declarations are added or replaced
 *   in-place.
 * - If no matching rule exists, a new one is appended.
 * - All other rules, comments, at-rules, etc. are preserved.
 * - Variable names are written as `--<name>: <value>;` (caller may pass keys
 *   with or without the leading `--`; both are normalized).
 */
export function mergeCssVars(existingCss: string, cssVars: CssVarsInput): string {
  const root: Root = safeParser(existingCss)

  for (const [rawSelector, vars] of Object.entries(cssVars)) {
    const selector = resolveSelector(rawSelector)
    const rule = findRuleBySelector(root, selector)

    if (rule) {
      upsertDeclarations(rule, vars)
    } else {
      root.append(buildRule(selector, vars))
    }
  }

  return root.toString()
}

function findRuleBySelector(root: Root, selector: string): Rule | null {
  let found: Rule | null = null
  root.walkRules((rule) => {
    // Normalize whitespace in selector for comparison
    const sel = rule.selector.trim().replace(/\s+/g, " ")
    if (sel === selector) {
      found = rule
      return false // stop walking
    }
    return undefined
  })
  return found
}

function upsertDeclarations(rule: Rule, vars: Record<string, string>): void {
  for (const [rawName, value] of Object.entries(vars)) {
    const prop = normalizeVarName(rawName)
    let existing: Declaration | null = null
    rule.walkDecls(prop, (decl) => {
      existing = decl
      return false
    })
    if (existing) {
      ;(existing as Declaration).value = String(value)
    } else {
      rule.append({ prop, value: String(value) })
    }
  }
}

function buildRule(selector: string, vars: Record<string, string>): Rule {
  const rule = postcss.rule({ selector })
  for (const [rawName, value] of Object.entries(vars)) {
    rule.append({ prop: normalizeVarName(rawName), value: String(value) })
  }
  return rule
}

function normalizeVarName(name: string): string {
  return name.startsWith("--") ? name : `--${name}`
}

/**
 * Generate a fresh CSS block for the given cssVars (used when no globals.css
 * exists yet). Output is deterministic.
 */
export function generateCssBlock(cssVars: CssVarsInput): string {
  const root = postcss.root()
  for (const [rawSelector, vars] of Object.entries(cssVars)) {
    root.append(buildRule(resolveSelector(rawSelector), vars))
  }
  return root.toString() + "\n"
}
