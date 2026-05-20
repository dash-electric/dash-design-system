/**
 * `dash audit` — scan a consumer repo for drift against Dash design-system
 * rules (banned deps, off-token colors, etc.).
 *
 * Complements `apps/docs/scripts/validate-patterns.ts`, which validates the
 * docs repo's own pattern blocks. This command runs INSIDE PE consumer repos
 * (halo-dash-fe, react-fleet-management-web-main, basecamp, …) to catch drift
 * that ships in feature PRs.
 *
 * Designed for CI: `dash audit --fail-on-error` exits 1 if any HIGH severity
 * drift is found. `--json` for tooling consumption.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import {
  AUDIT_CATEGORIES,
  AUDIT_RULES,
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

function ruleAppliesToFile(file: string, rule: AuditRule): boolean {
  if (!rule.fileExt.some((ext) => file.endsWith(ext))) return false
  if (pathAllowlisted(file, rule)) return false
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

function selectRules(only: string | undefined): readonly AuditRule[] {
  if (!only) return AUDIT_RULES
  return AUDIT_RULES.filter((r) => r.category === only || r.id === only)
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

  const rules = selectRules(opts.only)
  const allExts = new Set<string>()
  for (const r of rules) for (const ext of r.fileExt) allExts.add(ext)

  const files = walkSourceFiles(finalRoot, allExts)
  const findings: AuditFinding[] = []
  for (const f of files) {
    findings.push(...scanFile(f, finalRoot, rules))
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

export function runAudit(opts: AuditOpts): void {
  // Validate --only early so users get a useful error.
  if (opts.only) {
    const known = new Set<string>([
      ...AUDIT_CATEGORIES,
      ...AUDIT_RULES.map((r) => r.id),
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
