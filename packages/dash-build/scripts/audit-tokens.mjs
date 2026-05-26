#!/usr/bin/env node
/**
 * audit-tokens.mjs — extra design-system token guard for Dash Build daemon CSS.
 *
 * Complements audit-css.mjs (which only catches raw hex). This script catches
 * other token-leak categories that appear inside template-literal CSS shipped
 * by the daemon UI:
 *
 *   1. Hard-coded font-size in px > 14px — should use semantic text tokens
 *      (--text-md / --text-lg / --text-xl). Heuristic: anything <= 14px is
 *      treated as body text and ignored to keep noise low.
 *   2. Hard-coded border-radius in px > 12px — should use --radius-lg, --radius-pill.
 *   3. Hard-coded box-shadow with raw rgba(...) or px offsets — should use
 *      semantic shadow vars (--shadow-sm, --shadow-md, --shadow-focus).
 *   4. Hard-coded color keywords (white / black) outside CSS variable defs —
 *      hex is covered by audit-css, but bare keywords slip through.
 *
 * The script scans ALL *.ts files under src/, but only LINES that look like
 * CSS rules (semicolon-terminated property: value pairs) are inspected. This
 * keeps false positives low for normal TS code that mentions `12px` in a
 * comment or string unrelated to CSS.
 *
 * Usage:
 *   node scripts/audit-tokens.mjs            # warn-only (exit 0)
 *   node scripts/audit-tokens.mjs --strict   # fail on any finding (exit 1)
 *   node scripts/audit-tokens.mjs --report   # full breakdown
 *
 * Zero npm dependencies. Pure ESM, Node >= 20.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PACKAGE_ROOT = join(__dirname, "..")
const SRC_ROOT = join(PACKAGE_ROOT, "src")
const ALLOWLIST_PATH = join(__dirname, "audit-tokens.allowlist.json")

const ARGS = new Set(process.argv.slice(2))
const STRICT_MODE = ARGS.has("--strict")
const REPORT_MODE = ARGS.has("--report")

// Heuristic thresholds — anything at or below is "body-tier" and tolerated.
const FONT_SIZE_THRESHOLD_PX = 14
const BORDER_RADIUS_THRESHOLD_PX = 12

const COMMENT_LINE_REGEX = /^\s*(\/\/|\/\*|\*)/
const VAR_DEFINITION_REGEX = /--[a-z0-9-]+\s*:/i

// CSS property detectors (run against trimmed line content).
const FONT_SIZE_RE = /\bfont-size\s*:\s*(\d+(?:\.\d+)?)px\b/
const BORDER_RADIUS_RE = /\bborder-radius\s*:\s*(\d+(?:\.\d+)?)px\b/
const BOX_SHADOW_RE = /\bbox-shadow\s*:\s*(.+?);/
// Color keywords (word boundary) — only on lines that look like CSS props.
const COLOR_KEYWORD_RE = /\b(?:color|background|background-color|border|border-color|outline|outline-color|fill|stroke)\s*:\s*[^;]*\b(white|black)\b/i

function collectTsFiles(dir) {
  const out = []
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

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return { allowed: [] }
  try {
    const raw = readFileSync(ALLOWLIST_PATH, "utf8")
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.allowed)) return { allowed: [] }
    return data
  } catch (err) {
    process.stderr.write(
      `[audit-tokens] WARN: failed to parse allowlist (${err.message}). Treating as empty.\n`,
    )
    return { allowed: [] }
  }
}

function buildAllowKey(file, line, category) {
  return `${file}::${line}::${category}`
}

function buildAllowedSet(allowlist) {
  const set = new Set()
  for (const entry of allowlist.allowed) {
    if (!entry || typeof entry.file !== "string" || typeof entry.category !== "string") continue
    // line is optional — file+category alone allowed (covers refactor-safe match).
    if (typeof entry.line === "number") {
      set.add(buildAllowKey(entry.file, entry.line, entry.category))
    }
    set.add(`${entry.file}::*::${entry.category}`)
  }
  return set
}

function isAllowed(allowedSet, file, line, category) {
  return (
    allowedSet.has(buildAllowKey(file, line, category)) ||
    allowedSet.has(`${file}::*::${category}`)
  )
}

/**
 * Decide whether a box-shadow value is "raw" (uses rgba / px offsets with raw
 * colors) vs already token-driven (`var(--shadow-...)` or var-only color).
 *
 * A shadow like `0 0 0 3px var(--primary-ring)` is clean — px offsets are
 * fine as long as the color comes from a semantic token. Only flag when the
 * shadow brings raw rgba(...) or a hex value to the party.
 */
function isRawBoxShadow(value) {
  if (/var\(--shadow/.test(value)) return false
  const trimmed = value.trim()
  if (trimmed === "none" || trimmed === "inherit" || trimmed === "initial") return false
  // Raw if it contains rgba(...) or hex color literal in the shadow value.
  if (/rgba?\s*\(/i.test(trimmed)) return true
  if (/#[0-9a-fA-F]{3,8}\b/.test(trimmed)) return true
  return false
}

function scanFile(absPath, allowedSet) {
  const relPath = relative(PACKAGE_ROOT, absPath).split(sep).join("/")
  const text = readFileSync(absPath, "utf8")
  const lines = text.split("\n")
  const findings = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    if (COMMENT_LINE_REGEX.test(line)) continue
    // Skip CSS variable definitions — those are the sanctioned token store.
    if (VAR_DEFINITION_REGEX.test(line)) continue

    // font-size detection
    const fs = line.match(FONT_SIZE_RE)
    if (fs) {
      const px = Number(fs[1])
      if (px > FONT_SIZE_THRESHOLD_PX) {
        if (!isAllowed(allowedSet, relPath, lineNum, "font-size")) {
          findings.push({
            relPath,
            line: lineNum,
            category: "font-size",
            value: `${px}px`,
            hint: "consider var(--text-lg) or var(--text-xl)",
            lineText: line.trim(),
          })
        }
      }
    }

    // border-radius detection
    const br = line.match(BORDER_RADIUS_RE)
    if (br) {
      const px = Number(br[1])
      if (px > BORDER_RADIUS_THRESHOLD_PX) {
        if (!isAllowed(allowedSet, relPath, lineNum, "border-radius")) {
          findings.push({
            relPath,
            line: lineNum,
            category: "border-radius",
            value: `${px}px`,
            hint: "consider var(--radius-lg) or var(--radius-pill)",
            lineText: line.trim(),
          })
        }
      }
    }

    // box-shadow detection
    const bs = line.match(BOX_SHADOW_RE)
    if (bs && isRawBoxShadow(bs[1])) {
      if (!isAllowed(allowedSet, relPath, lineNum, "box-shadow")) {
        findings.push({
          relPath,
          line: lineNum,
          category: "box-shadow",
          value: bs[1].trim().slice(0, 60),
          hint: "consider var(--shadow-sm), var(--shadow-md), var(--shadow-focus)",
          lineText: line.trim(),
        })
      }
    }

    // color keyword detection (white/black)
    const kw = line.match(COLOR_KEYWORD_RE)
    if (kw) {
      if (!isAllowed(allowedSet, relPath, lineNum, "color-keyword")) {
        findings.push({
          relPath,
          line: lineNum,
          category: "color-keyword",
          value: kw[1],
          hint: "use var(--bg-white) / var(--text-strong) / semantic token",
          lineText: line.trim(),
        })
      }
    }
  }
  return findings
}

function summarize(findings) {
  const byCategory = new Map()
  for (const f of findings) {
    byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + 1)
  }
  return byCategory
}

function main() {
  if (!existsSync(SRC_ROOT)) {
    process.stderr.write(`[audit-tokens] ERROR: src root not found at ${SRC_ROOT}\n`)
    process.exit(2)
  }
  const files = collectTsFiles(SRC_ROOT)
  const allowlist = loadAllowlist()
  const allowedSet = buildAllowedSet(allowlist)

  process.stdout.write(`[audit-tokens] scanning ${files.length} files...\n`)
  const all = []
  for (const file of files) {
    all.push(...scanFile(file, allowedSet))
  }

  if (REPORT_MODE) {
    const byCategory = summarize(all)
    process.stdout.write(`[audit-tokens] REPORT — Dash Build token-leak audit\n`)
    process.stdout.write(`  files scanned       : ${files.length}\n`)
    process.stdout.write(`  total findings      : ${all.length}\n`)
    process.stdout.write(`  allowlist entries   : ${allowlist.allowed.length}\n`)
    process.stdout.write(`  by category:\n`)
    if (byCategory.size === 0) {
      process.stdout.write(`    (none)\n`)
    } else {
      for (const [cat, count] of byCategory) {
        process.stdout.write(`    ${cat.padEnd(16)} : ${count}\n`)
      }
    }
    if (all.length > 0) {
      process.stdout.write(`\n  findings:\n`)
      for (const f of all) {
        process.stdout.write(
          `    ${f.relPath}:${f.line} — ${f.category}: ${f.value} (${f.hint})\n`,
        )
      }
    }
    process.stdout.write(
      `\nhint: add legit exceptions to scripts/audit-tokens.allowlist.json; otherwise migrate to a semantic token.\n`,
    )
    process.exit(0)
  }

  if (all.length === 0) {
    process.stdout.write(`[audit-tokens] OK: 0 token-leak findings.\n`)
    process.exit(0)
  }

  const label = STRICT_MODE ? "FAIL" : "WARN"
  process.stdout.write(`[audit-tokens] ${label}: ${all.length} potential token violations\n`)
  for (const f of all) {
    process.stdout.write(
      `  ${f.relPath}:${f.line} — ${f.category}: ${f.value} (${f.hint})\n`,
    )
  }
  process.stdout.write(
    `hint: replace with a semantic token from globals.css/dashboard.ts, or add to scripts/audit-tokens.allowlist.json with reason.\n`,
  )
  process.exit(STRICT_MODE ? 1 : 0)
}

main()
