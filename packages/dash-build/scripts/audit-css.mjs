#!/usr/bin/env node
/**
 * audit-css.mjs — pre-commit guard against raw hex color values in Dash Build.
 *
 * Enforces design.md CR-5 ("Never raw hex — use Dash semantic tokens only").
 *
 * Scans all *.ts files under packages/dash-build/src/ for raw hex color
 * literals. A line is reported as a violation unless one of these is true:
 *   1. The hex appears inside a CSS variable definition (--foo: #abc) — those
 *      are sanctioned token declarations, not consumer usage.
 *   2. The hex appears inside a var() fallback, e.g. var(--token, #fff).
 *   3. The line is a comment (// ..., or block-comment lines).
 *   4. The (file, hex) pair appears in scripts/audit-css.allowlist.json with
 *      a human-written reason explaining why it predates the rule.
 *
 * Usage:
 *   node scripts/audit-css.mjs                 # check; exits 1 on violation
 *   node scripts/audit-css.mjs --fix-allowlist # append findings to allowlist
 *   node scripts/audit-css.mjs --strict        # ignore allowlist; ANY hex fails
 *   node scripts/audit-css.mjs --report        # summary report (no exit fail)
 *
 * Zero npm dependencies. Pure ESM, Node >= 20.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PACKAGE_ROOT = join(__dirname, "..")
const SRC_ROOT = join(PACKAGE_ROOT, "src")
const ALLOWLIST_PATH = join(__dirname, "audit-css.allowlist.json")

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g
// Match any CSS-variable declaration anywhere on the line. Originally required
// the hex to come immediately after the colon, which missed multi-value vars
// like `--shadow-x: 0px 96px 96px -32px #abc, ...;`. Broader match: if the line
// declares ANY `--name:` token (with semicolon further down or on its own line),
// it is sanctioned regardless of where the hex sits inside the value list.
const VAR_DEFINITION_REGEX = /--[a-z0-9-]+\s*:/i
const VAR_FALLBACK_REGEX = /var\(--/
const COMMENT_LINE_REGEX = /^\s*(\/\/|\/\*|\*)/

const ARGS = new Set(process.argv.slice(2))
const FIX_MODE = ARGS.has("--fix-allowlist")
const STRICT_MODE = ARGS.has("--strict")
const REPORT_MODE = ARGS.has("--report")

/** Recursively collect all *.ts files under a directory. */
function collectTsFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      // Skip generated / vendored directories defensively.
      if (entry === "node_modules" || entry === "dist") continue
      out.push(...collectTsFiles(full))
    } else if (stat.isFile() && entry.endsWith(".ts")) {
      out.push(full)
    }
  }
  return out
}

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) {
    return { allowed: [] }
  }
  try {
    const raw = readFileSync(ALLOWLIST_PATH, "utf8")
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.allowed)) {
      return { allowed: [] }
    }
    return data
  } catch (err) {
    process.stderr.write(
      `[audit-css] WARN: failed to parse allowlist (${err.message}). Treating as empty.\n`,
    )
    return { allowed: [] }
  }
}

function saveAllowlist(data) {
  writeFileSync(ALLOWLIST_PATH, JSON.stringify(data, null, 2) + "\n", "utf8")
}

/** Build a Set of "file::hex" keys for O(1) lookup. */
function buildAllowKey(file, hex) {
  return `${file}::${hex.toLowerCase()}`
}

function buildAllowedSet(allowlist) {
  const set = new Set()
  for (const entry of allowlist.allowed) {
    if (!entry || typeof entry.file !== "string" || typeof entry.hex !== "string") continue
    set.add(buildAllowKey(entry.file, entry.hex))
  }
  return set
}

/**
 * Classify an allowlist entry as "intentional literal" (canonical brand,
 * ANSI banner, prompt body, test fixture) vs "TODO refactor" (legacy hex
 * waiting on token migration). Used by --report mode.
 */
function classifyAllowEntry(entry) {
  const reason = String(entry.reason ?? "").toLowerCase()
  const isIntentional =
    reason.includes("intentional") ||
    reason.includes("canonical") ||
    reason.includes("ansi") ||
    reason.includes("prompt body") ||
    reason.includes("forbidden-example") ||
    reason.includes("test fixture") ||
    reason.includes("test asserts")
  return isIntentional ? "intentional" : "todo"
}

/**
 * Scan one file. Returns array of { relPath, line, hex, lineText } violations.
 * When `respectAllowlist` is true, allowlisted entries are filtered out; when
 * false (strict mode), every hex is reported.
 */
function scanFile(absPath, allowedSet, respectAllowlist) {
  const relPath = relative(PACKAGE_ROOT, absPath).split(sep).join("/")
  const text = readFileSync(absPath, "utf8")
  const lines = text.split("\n")
  const found = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip comment-only lines.
    if (COMMENT_LINE_REGEX.test(line)) continue

    // Reset regex state per line (regex has /g flag).
    HEX_REGEX.lastIndex = 0
    const matches = line.match(HEX_REGEX)
    if (!matches) continue

    // Skip whole line if it's a CSS variable definition or contains var() fallback.
    // (Token declarations are sanctioned; var() fallbacks are explicit overrides.)
    const isVarDefinition = VAR_DEFINITION_REGEX.test(line)
    const isVarFallback = VAR_FALLBACK_REGEX.test(line)
    if (isVarDefinition || isVarFallback) continue

    for (const hex of matches) {
      const key = buildAllowKey(relPath, hex)
      if (respectAllowlist && allowedSet.has(key)) continue
      found.push({
        relPath,
        line: i + 1,
        hex,
        lineText: line.trim(),
        allowlisted: allowedSet.has(key),
      })
    }
  }
  return found
}

function runReport(files, allowlist, allowedSet) {
  // Strict scan: collect EVERY hex occurrence regardless of allowlist.
  const allFindings = []
  for (const file of files) {
    allFindings.push(...scanFile(file, allowedSet, false))
  }

  // Bucket allowlist entries by intent.
  const buckets = { intentional: [], todo: [] }
  for (const entry of allowlist.allowed) {
    buckets[classifyAllowEntry(entry)].push(entry)
  }

  // Bucket findings: which are covered by allowlist, which are unsanctioned.
  const allowlistedFindings = allFindings.filter((v) => v.allowlisted)
  const unsanctionedFindings = allFindings.filter((v) => !v.allowlisted)

  // Per-file aggregation of unsanctioned hits.
  const perFile = new Map()
  for (const v of allFindings) {
    const cur = perFile.get(v.relPath) ?? { total: 0, allowlisted: 0, unsanctioned: 0 }
    cur.total++
    if (v.allowlisted) cur.allowlisted++
    else cur.unsanctioned++
    perFile.set(v.relPath, cur)
  }

  const out = []
  out.push(`[audit-css] REPORT — Dash Build CSS hex audit`)
  out.push(`  files scanned             : ${files.length}`)
  out.push(`  total hex occurrences     : ${allFindings.length}`)
  out.push(`  allowlist entries         : ${allowlist.allowed.length}`)
  out.push(`    intentional literal     : ${buckets.intentional.length}`)
  out.push(`    TODO refactor (legacy)  : ${buckets.todo.length}`)
  out.push(`  findings covered          : ${allowlistedFindings.length}`)
  out.push(`  unsanctioned (would fail) : ${unsanctionedFindings.length}`)
  out.push(``)
  out.push(`  per-file breakdown (files with hex):`)
  const sortedFiles = Array.from(perFile.entries()).sort((a, b) => b[1].total - a[1].total)
  for (const [file, counts] of sortedFiles) {
    out.push(
      `    ${file}: ${counts.total} hex (allowlisted=${counts.allowlisted}, unsanctioned=${counts.unsanctioned})`,
    )
  }
  if (sortedFiles.length === 0) {
    out.push(`    (none — all hex live inside --token: defs or var() fallbacks)`)
  }
  out.push(``)
  out.push(`  strict-mode preview (--strict): ${allFindings.length} would-fail`)
  if (unsanctionedFindings.length > 0) {
    out.push(``)
    out.push(`  unsanctioned hex (NOT in allowlist):`)
    for (const v of unsanctionedFindings) {
      out.push(`    ${v.relPath}:${v.line} — ${v.hex}`)
    }
  }
  out.push(``)
  out.push(`hint: run --strict to fail on ANY hex (target state once Agent A2 finishes refactor).`)

  process.stdout.write(out.join("\n") + "\n")
  process.exit(0)
}

function main() {
  if (!existsSync(SRC_ROOT)) {
    process.stderr.write(`[audit-css] ERROR: src root not found at ${SRC_ROOT}\n`)
    process.exit(2)
  }

  const files = collectTsFiles(SRC_ROOT)
  const allowlist = loadAllowlist()
  const allowedSet = buildAllowedSet(allowlist)

  if (REPORT_MODE) {
    runReport(files, allowlist, allowedSet)
    return
  }

  process.stdout.write(`[audit-css] scanning ${files.length} files...\n`)
  if (STRICT_MODE) {
    process.stdout.write(`[audit-css] STRICT mode — allowlist ignored.\n`)
  }

  const respectAllowlist = !STRICT_MODE
  const allViolations = []
  for (const file of files) {
    const v = scanFile(file, allowedSet, respectAllowlist)
    allViolations.push(...v)
  }

  if (FIX_MODE) {
    if (allViolations.length === 0) {
      process.stdout.write(`[audit-css] no new violations — allowlist unchanged.\n`)
      process.exit(0)
    }
    // De-duplicate (file, hex) pairs before appending.
    const seen = new Set()
    let added = 0
    for (const v of allViolations) {
      const key = buildAllowKey(v.relPath, v.hex)
      if (seen.has(key)) continue
      seen.add(key)
      // Skip if already present (race-safe in case allowlist was edited mid-run).
      if (allowedSet.has(key)) continue
      allowlist.allowed.push({
        file: v.relPath,
        hex: v.hex,
        reason: "TODO: review",
      })
      added++
    }
    // Sort for deterministic diffs: by file, then hex.
    allowlist.allowed.sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file)
      return a.hex.localeCompare(b.hex)
    })
    saveAllowlist(allowlist)
    process.stdout.write(
      `[audit-css] appended ${added} entries to allowlist (${allowlist.allowed.length} total).\n`,
    )
    process.stdout.write(
      `[audit-css] hint: replace each "TODO: review" reason with a real explanation before commit.\n`,
    )
    process.exit(0)
  }

  if (allViolations.length === 0) {
    if (STRICT_MODE) {
      process.stdout.write(`[audit-css] OK (strict): 0 raw hex anywhere in src/.\n`)
    } else {
      process.stdout.write(`[audit-css] OK: 0 raw hex violations.\n`)
    }
    process.exit(0)
  }

  const label = STRICT_MODE ? "FAIL (strict)" : "FAIL"
  process.stdout.write(`[audit-css] ${label}: ${allViolations.length} raw hex violations\n`)
  for (const v of allViolations) {
    const tag = STRICT_MODE && v.allowlisted ? " (allowlisted, ignored in strict)" : " (not in allowlist)"
    process.stdout.write(`  ${v.relPath}:${v.line} — ${v.hex}${tag}\n`)
  }
  if (STRICT_MODE) {
    process.stdout.write(
      `hint: strict mode treats EVERY hex as a violation. Migrate every literal to a semantic token in styles/dashboard.ts, or accept the legacy allowlist by dropping --strict.\n`,
    )
  } else {
    process.stdout.write(
      `hint: replace with a semantic token (var(--primary), var(--mute), etc) or add to scripts/audit-css.allowlist.json with reason.\n`,
    )
  }
  process.exit(1)
}

main()
