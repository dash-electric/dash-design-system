/**
 * `dashkit audit` — scan a consumer repo for drift against Dash design-system
 * rules (banned deps, off-token colors, etc.).
 *
 * Complements `apps/docs/scripts/validate-patterns.ts`, which validates the
 * docs repo's own pattern blocks. This command runs INSIDE user consumer repos
 * (halo-dash-fe, react-fleet-management-web-main, basecamp, …) to catch drift
 * that ships in feature PRs.
 *
 * Designed for CI: `dashkit audit --fail-on-error` exits 1 if any HIGH severity
 * drift is found. `--json` for tooling consumption.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import {
  AUDIT_CATEGORIES,
  AUDIT_RULES,
  LAYER_RULE_IDS,
  type AuditCategory,
  type AuditRule,
  type AuditSeverity,
} from "../lib/audit-rules.js"

export type AuditOpts = {
  path?: string
  json?: boolean
  failOnError?: boolean
  only?: string
  /** Override cwd resolution for tests. */
  cwd?: string
  /** Layer-2 theme override (`ride` | `logistic` | …). Currently advisory. */
  theme?: string
  /** Run only Layered Architecture rules (L-1 … L-7). */
  layerOnly?: boolean
  /** Print Layered Architecture summary and exit without scanning. */
  explainLayer?: boolean
}

export type AuditFinding = {
  severity: AuditSeverity
  rule: string
  label: string
  file: string
  line: number
  match: string
}

export type AuditReport = {
  schemaVersion: 1
  repo: string
  scannedFiles: number
  scanRoot: string
  findings: AuditFinding[]
  summary: { high: number; medium: number }
}

/**
 * Skip-directory list. Mirrors what every realistic JS repo wants to ignore;
 * keeps the walker fast on large monorepos (halo-dash-fe ~3k files).
 */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  ".turbo",
  ".cache",
  ".vercel",
  "out",
])

function isSourceFile(name: string, exts: Set<string>): boolean {
  for (const ext of exts) {
    if (name.endsWith(ext)) return true
  }
  return false
}

/**
 * Depth-first walk yielding files whose extension matches any rule. We collect
 * up-front (rather than streaming) so the per-rule scan can iterate once.
 * Hard cap = 20k files to protect against accidentally pointing this at `/`.
 */
function walkSourceFiles(root: string, exts: Set<string>): string[] {
  const out: string[] = []
  const stack: string[] = [root]
  const MAX = 20_000
  while (stack.length > 0 && out.length < MAX) {
    const cur = stack.pop()!
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      const p = path.join(cur, e.name)
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue
        // Skip dotted dirs except a few common project ones (none in our case).
        if (e.name.startsWith(".") && e.name !== ".") continue
        stack.push(p)
      } else if (e.isFile() && isSourceFile(e.name, exts)) {
        out.push(p)
      }
    }
  }
  return out
}

function pathAllowlisted(file: string, rule: AuditRule): boolean {
  if (!rule.allowlistPathContains) return false
  // Use posix-style path for substring match so rules are portable.
  const normalized = file.split(path.sep).join("/")
  return rule.allowlistPathContains.some((tok) => normalized.includes(tok))
}

function pathMatchesScope(file: string, rule: AuditRule): boolean {
  if (!rule.pathMustContain || rule.pathMustContain.length === 0) return true
  const normalized = file.split(path.sep).join("/")
  return rule.pathMustContain.some((tok) => normalized.includes(tok))
}

function ruleAppliesToFile(file: string, rule: AuditRule): boolean {
  if (!rule.fileExt.some((ext) => file.endsWith(ext))) return false
  if (pathAllowlisted(file, rule)) return false
  if (!pathMatchesScope(file, rule)) return false
  return true
}

/**
 * Scan a single file against all applicable rules. Lines are 1-indexed in
 * findings so they're click-through in editors.
 */
function scanFile(
  absFile: string,
  scanRoot: string,
  rules: readonly AuditRule[],
): AuditFinding[] {
  let raw: string
  try {
    raw = fs.readFileSync(absFile, "utf-8")
  } catch {
    return []
  }
  const lines = raw.split(/\r?\n/)
  const rel = path.relative(scanRoot, absFile) || path.basename(absFile)
  const findings: AuditFinding[] = []

  for (const rule of rules) {
    if (!ruleAppliesToFile(absFile, rule)) continue

    const hits: Array<{ line: number; match: string }> = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const m = rule.regex.exec(line)
      if (!m) continue
      if (rule.lineFilter && !rule.lineFilter(line)) continue
      hits.push({ line: i + 1, match: m[0] })
    }

    if (hits.length === 0) continue

    // warnAboveCount: only emit once per file IF over threshold. Single finding
    // anchored on the first match — keeps the report scannable.
    if (rule.warnAboveCount !== undefined) {
      if (hits.length <= rule.warnAboveCount) continue
      const first = hits[0]
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        label: `${rule.label} (${hits.length} occurrences in file)`,
        file: rel,
        line: first.line,
        match: first.match,
      })
      continue
    }

    for (const h of hits) {
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        label: rule.label,
        file: rel,
        line: h.line,
        match: h.match,
      })
    }
  }

  return findings
}

function selectRules(
  only: string | undefined,
  layerOnly: boolean | undefined,
): readonly AuditRule[] {
  let rules: readonly AuditRule[] = AUDIT_RULES
  if (layerOnly) {
    rules = rules.filter((r) => r.layerCompliance === true)
  }
  if (only) {
    rules = rules.filter((r) => r.category === only || r.id === only)
  }
  return rules
}

/**
 * Locate the canonical registry.json for L-6/L-7 metadata checks.
 *
 * Prefers `apps/docs/registry.json` (DS monorepo layout) and falls back to a
 * top-level `registry.json` (consumer repos that vendored one). Returns null
 * if neither exists — the layer-metadata checks then simply no-op so we don't
 * false-positive on repos that just don't ship a registry.
 */
function findRegistryJson(scanRoot: string): string | null {
  const candidates = [
    path.join(scanRoot, "apps", "docs", "registry.json"),
    path.join(scanRoot, "registry.json"),
  ]
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c
    } catch {
      // try next
    }
  }
  return null
}

type RegistryItem = {
  name?: unknown
  type?: unknown
  // The task spec mandates `meta.layer` / `meta.theme` — we read those fields
  // explicitly even if the current schema also surfaces `theme` at top level.
  meta?: { layer?: unknown; theme?: unknown } | unknown
  files?: Array<{ path?: unknown }> | unknown
}

function getMeta(item: RegistryItem): { layer?: unknown; theme?: unknown } {
  if (item && typeof item.meta === "object" && item.meta !== null) {
    return item.meta as { layer?: unknown; theme?: unknown }
  }
  return {}
}

/**
 * L-6 + L-7: parse registry.json and validate per-block layer metadata.
 *
 *  - L-6: every block-typed entry must declare `meta.layer`.
 *  - L-7: blocks whose source file lives under `blocks/<product>/` must have
 *    `meta.theme === "<product>"` (mismatch = silent drift).
 *
 * Findings reference the registry.json file with a best-effort line lookup
 * via the entry's `name` field, so editors can jump straight to the item.
 */
export function checkRegistryLayerMetadata(scanRoot: string): AuditFinding[] {
  const registryPath = findRegistryJson(scanRoot)
  if (!registryPath) return []

  let raw: string
  try {
    raw = fs.readFileSync(registryPath, "utf-8")
  } catch {
    return []
  }
  let parsed: { items?: unknown } | unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!parsed || typeof parsed !== "object") return []
  const items = (parsed as { items?: unknown }).items
  if (!Array.isArray(items)) return []

  const rawLines = raw.split(/\r?\n/)
  const findLineForName = (name: string): number => {
    const needle = `"name": "${name}"`
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].includes(needle)) return i + 1
    }
    return 1
  }

  const rel = path.relative(scanRoot, registryPath) || path.basename(registryPath)
  const findings: AuditFinding[] = []

  // Product subdirs we recognize under blocks/.
  const KNOWN_PRODUCTS = new Set(["ride", "logistic", "travel", "marketplace"])

  for (const item of items as RegistryItem[]) {
    if (!item || typeof item !== "object") continue
    const type = item.type
    if (typeof type !== "string" || !type.startsWith("registry:block")) continue
    if (type !== "registry:block") continue

    const name = typeof item.name === "string" ? item.name : "<unnamed>"
    const meta = getMeta(item)
    const line = findLineForName(name)

    // L-6: meta.layer required.
    if (meta.layer === undefined) {
      findings.push({
        severity: "high",
        rule: "L-6",
        label: "Block registry entry missing meta.layer",
        file: rel,
        line,
        match: name,
      })
    }

    // L-7: block file under blocks/<product>/ → meta.theme must match.
    const files = Array.isArray(item.files) ? item.files : []
    for (const f of files) {
      if (!f || typeof f !== "object") continue
      const fp = (f as { path?: unknown }).path
      if (typeof fp !== "string") continue
      // Normalize to posix for substring scan.
      const norm = fp.split(path.sep).join("/")
      const m = norm.match(/registry\/dash\/blocks\/([^/]+)\//)
      if (!m) continue
      const product = m[1]
      if (!KNOWN_PRODUCTS.has(product)) continue
      const themeVal = meta.theme
      if (themeVal !== product) {
        findings.push({
          severity: "high",
          rule: "L-7",
          label: `Block in blocks/${product}/ has meta.theme="${
            themeVal === undefined ? "missing" : String(themeVal)
          }" (expected "${product}")`,
          file: rel,
          line,
          match: name,
        })
      }
    }
  }

  return findings
}

export function collectAudit(opts: AuditOpts = {}): AuditReport {
  const scanRoot = path.resolve(opts.cwd ?? opts.path ?? process.cwd())
  if (opts.path && !opts.cwd) {
    // path takes precedence over cwd when both omitted
  }
  // If `--path` was supplied via the CLI, override.
  const finalRoot = opts.path
    ? path.resolve(opts.cwd ?? process.cwd(), opts.path)
    : scanRoot

  const rules = selectRules(opts.only, opts.layerOnly)
  const allExts = new Set<string>()
  for (const r of rules) for (const ext of r.fileExt) allExts.add(ext)

  const files = walkSourceFiles(finalRoot, allExts)
  const findings: AuditFinding[] = []
  for (const f of files) {
    findings.push(...scanFile(f, finalRoot, rules))
  }

  // L-6 / L-7 — registry.json metadata. Run when layer rules are in scope:
  //  - default (no filters) → run
  //  - --layer-only → run
  //  - --only layer | --only L-6 | --only L-7 → run
  //  - otherwise (e.g. --only imports) → skip
  const registryCheckActive = (() => {
    if (opts.layerOnly) return true
    if (!opts.only) return true
    if (opts.only === "layer") return true
    if (opts.only === "L-6" || opts.only === "L-7") return true
    return false
  })()
  if (registryCheckActive) {
    const registryFindings = checkRegistryLayerMetadata(finalRoot).filter((f) => {
      if (!opts.only) return true
      if (opts.only === "layer") return true
      return f.rule === opts.only
    })
    findings.push(...registryFindings)
  }

  const summary = findings.reduce(
    (acc, f) => {
      acc[f.severity]++
      return acc
    },
    { high: 0, medium: 0 },
  )

  return {
    schemaVersion: 1,
    repo: path.basename(finalRoot),
    scanRoot: finalRoot,
    scannedFiles: files.length,
    findings,
    summary,
  }
}

function severityGlyph(sev: AuditSeverity): string {
  return sev === "high" ? kleur.red("✗") : kleur.yellow("⚠")
}

function severityHeader(sev: AuditSeverity, count: number): string {
  const label = sev === "high" ? "HIGH" : "MEDIUM"
  const color = sev === "high" ? kleur.red : kleur.yellow
  return color().bold(`${label} (${count})`)
}

function printPretty(report: AuditReport): void {
  console.log()
  console.log(kleur.bold().cyan(`Dash Audit — ${report.repo}`))
  console.log(kleur.dim(`Scanned: ${report.scannedFiles} files`))
  console.log(kleur.dim(`Root:    ${report.scanRoot}`))
  console.log()

  if (report.findings.length === 0) {
    console.log(kleur.green("  ✓ No drift detected"))
    console.log()
    console.log(kleur.bold(`Summary: 0 high, 0 medium drift items`))
    console.log()
    return
  }

  // Group findings by severity then by rule id for a tidy report.
  const bySeverity: Record<AuditSeverity, AuditFinding[]> = {
    high: [],
    medium: [],
  }
  for (const f of report.findings) bySeverity[f.severity].push(f)

  for (const sev of ["high", "medium"] as const) {
    const list = bySeverity[sev]
    if (list.length === 0) continue
    console.log(severityHeader(sev, list.length))

    // group by rule id
    const byRule = new Map<string, AuditFinding[]>()
    for (const f of list) {
      if (!byRule.has(f.rule)) byRule.set(f.rule, [])
      byRule.get(f.rule)!.push(f)
    }

    for (const [ruleId, items] of byRule) {
      console.log(`  ${severityGlyph(sev)} ${items[0].label}  ${kleur.dim(`[${ruleId}]`)}`)
      for (const f of items.slice(0, 20)) {
        console.log(kleur.dim(`      ${f.file}:${f.line}`))
      }
      if (items.length > 20) {
        console.log(kleur.dim(`      … ${items.length - 20} more`))
      }
    }
    console.log()
  }

  const { high, medium } = report.summary
  console.log(
    kleur.bold(
      `Summary: ${high} high, ${medium} medium drift item${
        high + medium === 1 ? "" : "s"
      }`,
    ),
  )
  console.log()
}

/**
 * Print a short Layered Architecture summary. Mirrors the schema in
 * LAYERED-ARCHITECTURE.md so PEs can recall the rules without leaving the
 * terminal. Triggered by `dashkit audit --explain-layer`.
 */
function printLayerExplain(): void {
  console.log()
  console.log(kleur.bold().cyan("Dash Layered Architecture — audit rules"))
  console.log()
  console.log("  " + kleur.bold("Layer 0 — Brand Foundation") + " (RFC-gated)")
  console.log("    Type ramp, spacing, radius, motion, semantic tokens, a11y floor.")
  console.log()
  console.log("  " + kleur.bold("Layer 1 — Common Primitives") + " (registry/dash/ui/)")
  console.log("    Always consume Layer 0 tokens. No hard-coded theme accents.")
  console.log()
  console.log("  " + kleur.bold("Layer 2 — Product / Tenant Theme") + " (registry/dash/themes/<name>/)")
  console.log("    Pure CSS + tokens + voice docs. Must NOT import Layer 1 source.")
  console.log()
  console.log("  " + kleur.bold("Layer 3 — Workflow Blocks") + " (registry/dash/blocks/{shared,ride,logistic,…}/)")
  console.log("    Shared blocks upstream of product blocks. No cross-product imports.")
  console.log()
  console.log(kleur.bold("Audit rules"))
  console.log(`  ${kleur.red("L-1")}  Layer 1 primitive references --theme-accent-* var`)
  console.log(`  ${kleur.red("L-2")}  Layer 2 theme imports from registry/dash/ui/`)
  console.log(`  ${kleur.red("L-3")}  Shared block imports product-specific block`)
  console.log(`  ${kleur.red("L-4")}  Cross-product block import (ride ↔ logistic)`)
  console.log(`  ${kleur.yellow("L-5")}  Theme example introduces raw hex outside theme tokens`)
  console.log(`  ${kleur.red("L-6")}  Block registry entry missing meta.layer`)
  console.log(`  ${kleur.red("L-7")}  Block file location mismatches meta.theme`)
  console.log()
}

export function runAudit(opts: AuditOpts): void {
  if (opts.explainLayer) {
    printLayerExplain()
    return
  }

  // Validate --only early so users get a useful error.
  if (opts.only) {
    const known = new Set<string>([
      ...AUDIT_CATEGORIES,
      ...AUDIT_RULES.map((r) => r.id),
      "L-6",
      "L-7",
    ])
    if (!known.has(opts.only)) {
      const choices = [...AUDIT_CATEGORIES].join(", ")
      console.error(
        kleur.red(
          `✗ unknown --only value "${opts.only}". expected category (${choices}) or rule id.`,
        ),
      )
      process.exitCode = 1
      return
    }
  }

  const report = collectAudit(opts)

  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n")
  } else {
    printPretty(report)
  }

  if (opts.failOnError && report.summary.high > 0) {
    process.exitCode = 1
  }
}
