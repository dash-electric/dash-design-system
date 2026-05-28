#!/usr/bin/env node
/**
 * audit-tokens.mjs — design-system token guard for apps/docs.
 *
 * Modeled on packages/dash-build/scripts/audit-tokens.mjs. Catches violations
 * that break the credibility of the docs site (we tell consumers to use Dash
 * tokens, so the DS source itself must comply).
 *
 * Categories scanned (against the Dash spacing ramp + radius ramp + typography):
 *
 *   1. CSS rule spacing — `padding|margin|gap` declarations in *.css or
 *      template-literal CSS with px values OFF the spacing ramp.
 *   2. CSS rule border-radius — values OFF the radius ramp (with 9999 = pill OK).
 *   3. font-size > 14px — should map to --text-* token unless it IS the token def.
 *   4. Tailwind arbitrary values like `p-[5px]`, `gap-[7px]` with off-grid px.
 *   5. Tailwind default classes like `p-5/p-7/p-9/p-11` that resolve to off-grid
 *      values on the Dash ramp (20/28/36/44px are NOT on Dash spacing ramp).
 *   6. Inline styles like `style={{ padding: '7px' }}` with off-grid px.
 *
 * Skipped (heuristic): files under __tests__, *.test.*, *.spec.*, generated
 * output (.next, dist, playwright-report, node_modules), and lines that
 * define CSS variables (`--foo: 13px;` — those ARE the tokens).
 *
 * Usage:
 *   node scripts/audit-tokens.mjs                # warn-only (exit 0)
 *   node scripts/audit-tokens.mjs --strict       # fail on any finding (exit 1)
 *   node scripts/audit-tokens.mjs --report       # full breakdown
 *   node scripts/audit-tokens.mjs --scope=registry  # scan only registry/
 *
 * Zero npm dependencies. Pure ESM, Node >= 20.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PACKAGE_ROOT = join(__dirname, "..")
const ALLOWLIST_PATH = join(__dirname, "audit-tokens.allowlist.json")

const ARGS = process.argv.slice(2)
const STRICT_MODE = ARGS.includes("--strict")
const REPORT_MODE = ARGS.includes("--report")
const SCOPE_ARG = ARGS.find((a) => a.startsWith("--scope="))
const SCOPE = SCOPE_ARG ? SCOPE_ARG.split("=")[1] : "all"

// Dash spacing ramp (must match registry/dash/foundation/tokens/spacing.css).
const SPACING_RAMP = [0, 2, 4, 6, 8, 10, 12, 14, 16, 24, 32, 40, 48]
const SPACING_RAMP_SET = new Set(SPACING_RAMP)

// Dash radius ramp (registry/dash/foundation/tokens/spacing.css). Plus 9999 = pill.
const RADIUS_RAMP = [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28]
const RADIUS_RAMP_SET = new Set(RADIUS_RAMP)

const FONT_SIZE_THRESHOLD_PX = 14

const COMMENT_LINE_REGEX = /^\s*(\/\/|\/\*|\*)/
const VAR_DEFINITION_REGEX = /--[a-z0-9-]+\s*:/i

// CSS property detectors.
const FONT_SIZE_RE = /\bfont-size\s*:\s*(\d+(?:\.\d+)?)px\b/
const BORDER_RADIUS_RE = /\b(border-radius|border-top-left-radius|border-top-right-radius|border-bottom-left-radius|border-bottom-right-radius)\s*:\s*([^;{}]+)/
const SPACING_PROP_RE = /\b(padding|padding-top|padding-right|padding-bottom|padding-left|margin|margin-top|margin-right|margin-bottom|margin-left|gap|row-gap|column-gap)\s*:\s*([^;{}]+)/
const PX_VALUE_RE = /(-?\d+(?:\.\d+)?)px\b/g

// Tailwind detectors (applied per-line on .tsx/.ts only).
const TW_ARBITRARY_RE = /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-\[(\d+(?:\.\d+)?)px\]/g
const TW_OFFGRID_CLASS_RE = /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-(5|7|9|11)(?![\w.-])/g
const INLINE_STYLE_RE = /(padding|margin|gap|rowGap|columnGap)(Top|Right|Bottom|Left)?\s*:\s*['"`](\d+)px['"`]/g

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "playwright-report",
  "test-results",
  "__tests__",
  "coverage",
])

function collectFiles(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      collectFiles(full, out)
    } else if (stat.isFile()) {
      if (/\.(css|tsx|ts)$/.test(entry) && !/\.(test|spec)\.(tsx?|jsx?)$/.test(entry)) {
        out.push(full)
      }
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

function buildAllowedSet(allowlist) {
  const set = new Set()
  for (const entry of allowlist.allowed) {
    if (!entry || typeof entry.file !== "string" || typeof entry.category !== "string") continue
    if (typeof entry.line === "number") {
      set.add(`${entry.file}::${entry.line}::${entry.category}`)
    }
    set.add(`${entry.file}::*::${entry.category}`)
  }
  return set
}

function isAllowed(allowedSet, file, line, category) {
  return (
    allowedSet.has(`${file}::${line}::${category}`) ||
    allowedSet.has(`${file}::*::${category}`)
  )
}

function nearestSpacingToken(px) {
  let best = SPACING_RAMP[0]
  let bestDist = Math.abs(px - best)
  for (const candidate of SPACING_RAMP) {
    const dist = Math.abs(px - candidate)
    if (dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }
  return best
}

function nearestRadiusToken(px) {
  let best = RADIUS_RAMP[0]
  let bestDist = Math.abs(px - best)
  for (const candidate of RADIUS_RAMP) {
    const dist = Math.abs(px - candidate)
    if (dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }
  return best
}

function scanFile(absPath, allowedSet) {
  const relPath = relative(PACKAGE_ROOT, absPath).split(sep).join("/")
  const isCss = relPath.endsWith(".css")
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
      const property = br[1]
      const value = br[2]
      let pxMatch
      const scanner = new RegExp(PX_VALUE_RE.source, "g")
      const seen = new Set()
      while ((pxMatch = scanner.exec(value)) !== null) {
        const px = Number(pxMatch[1])
        if (seen.has(px)) continue
        seen.add(px)
        if (RADIUS_RAMP_SET.has(px) || px === 9999) continue
        if (isAllowed(allowedSet, relPath, lineNum, "radius-off-grid")) continue
        const nearest = nearestRadiusToken(px)
        findings.push({
          relPath,
          line: lineNum,
          category: "radius-off-grid",
          value: `${px}px`,
          hint: `${property} off-grid → nearest var(--radius-${nearest}) or var(--radius-full)`,
          lineText: line.trim(),
        })
      }
    }

    // spacing off-grid detection (CSS property syntax)
    const sp = line.match(SPACING_PROP_RE)
    if (sp) {
      const property = sp[1]
      const value = sp[2]
      const offGridSeen = new Set()
      let pxMatch
      const valueScanner = new RegExp(PX_VALUE_RE.source, "g")
      while ((pxMatch = valueScanner.exec(value)) !== null) {
        const px = Number(pxMatch[1])
        if (SPACING_RAMP_SET.has(px)) continue
        if (offGridSeen.has(px)) continue
        offGridSeen.add(px)
        if (isAllowed(allowedSet, relPath, lineNum, "spacing-off-grid")) continue
        const nearest = nearestSpacingToken(px)
        findings.push({
          relPath,
          line: lineNum,
          category: "spacing-off-grid",
          value: `${px}px`,
          hint: `${property} off-grid → nearest var(--spacing-${nearest})`,
          lineText: line.trim(),
        })
      }
    }

    // Tailwind detectors (TSX/TS only — Tailwind classes don't appear in .css).
    if (!isCss) {
      // Arbitrary px values: p-[5px], gap-[7px]
      const arbitraryScanner = new RegExp(TW_ARBITRARY_RE.source, "g")
      let m
      while ((m = arbitraryScanner.exec(line)) !== null) {
        const px = Number(m[2])
        if (SPACING_RAMP_SET.has(px)) continue
        if (isAllowed(allowedSet, relPath, lineNum, "tw-arbitrary")) continue
        const nearest = nearestSpacingToken(px)
        findings.push({
          relPath,
          line: lineNum,
          category: "tw-arbitrary",
          value: m[0],
          hint: `→ ${m[1]}-[${nearest}px] (or a non-arbitrary class)`,
          lineText: line.trim(),
        })
      }

      // Off-grid Tailwind classes: p-5 (20px), p-7 (28px), p-9 (36px), p-11 (44px)
      const offgridScanner = new RegExp(TW_OFFGRID_CLASS_RE.source, "g")
      while ((m = offgridScanner.exec(line)) !== null) {
        if (isAllowed(allowedSet, relPath, lineNum, "tw-offgrid-class")) continue
        const num = m[2]
        // Map TW class to actual px, then suggest nearest grid TW class.
        // p-5=20→24(p-6), p-7=28→24(p-6) or 32(p-8), p-9=36→32(p-8), p-11=44→48(p-12)
        const suggestion =
          num === "5" ? "6" :
          num === "7" ? "6 or 8" :
          num === "9" ? "8" :
          num === "11" ? "12" : "?"
        findings.push({
          relPath,
          line: lineNum,
          category: "tw-offgrid-class",
          value: m[0],
          hint: `Tailwind ${m[0]} resolves to off-Dash-grid → ${m[1]}-${suggestion}`,
          lineText: line.trim(),
        })
      }

      // Inline styles: style={{ padding: '7px' }}
      const inlineScanner = new RegExp(INLINE_STYLE_RE.source, "g")
      while ((m = inlineScanner.exec(line)) !== null) {
        const px = Number(m[3])
        if (SPACING_RAMP_SET.has(px)) continue
        if (isAllowed(allowedSet, relPath, lineNum, "inline-style")) continue
        const nearest = nearestSpacingToken(px)
        findings.push({
          relPath,
          line: lineNum,
          category: "inline-style",
          value: m[0],
          hint: `inline style off-grid → ${nearest}px (or use a token via className)`,
          lineText: line.trim(),
        })
      }
    }
  }
  return findings
}

function scopeRoots() {
  if (SCOPE === "registry") {
    return [join(PACKAGE_ROOT, "registry")]
  }
  if (SCOPE === "app") {
    return [join(PACKAGE_ROOT, "app")]
  }
  // default — registry + app (avoid scanning ad-hoc folders).
  return [join(PACKAGE_ROOT, "registry"), join(PACKAGE_ROOT, "app")]
}

function summarize(findings) {
  const byCategory = new Map()
  for (const f of findings) {
    byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + 1)
  }
  return byCategory
}

function main() {
  const roots = scopeRoots()
  const allowlist = loadAllowlist()
  const allowedSet = buildAllowedSet(allowlist)

  const files = []
  for (const root of roots) {
    if (!existsSync(root)) continue
    collectFiles(root, files)
  }

  process.stdout.write(`[audit-tokens] scope=${SCOPE} files=${files.length}\n`)
  const all = []
  for (const file of files) {
    all.push(...scanFile(file, allowedSet))
  }

  if (REPORT_MODE) {
    const byCategory = summarize(all)
    process.stdout.write(`[audit-tokens] REPORT — apps/docs token-leak audit\n`)
    process.stdout.write(`  files scanned       : ${files.length}\n`)
    process.stdout.write(`  total findings      : ${all.length}\n`)
    process.stdout.write(`  allowlist entries   : ${allowlist.allowed.length}\n`)
    process.stdout.write(`  by category:\n`)
    if (byCategory.size === 0) {
      process.stdout.write(`    (none)\n`)
    } else {
      for (const [cat, count] of byCategory) {
        process.stdout.write(`    ${cat.padEnd(20)} : ${count}\n`)
      }
    }
    if (all.length > 0) {
      // Group by file for readability.
      const byFile = new Map()
      for (const f of all) {
        if (!byFile.has(f.relPath)) byFile.set(f.relPath, [])
        byFile.get(f.relPath).push(f)
      }
      const topFiles = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 25)
      process.stdout.write(`\n  top 25 worst files:\n`)
      for (const [file, fs] of topFiles) {
        process.stdout.write(`    ${fs.length.toString().padStart(4)}  ${file}\n`)
      }
    }
    process.stdout.write(
      `\nhint: add legit exceptions to scripts/audit-tokens.allowlist.json; otherwise migrate to a token.\n`,
    )
    process.exit(0)
  }

  if (all.length === 0) {
    process.stdout.write(`[audit-tokens] OK: 0 token-leak findings.\n`)
    process.exit(0)
  }

  const label = STRICT_MODE ? "FAIL" : "WARN"
  process.stdout.write(`[audit-tokens] ${label}: ${all.length} potential token violations\n`)
  // Cap output to first 80 findings — the rest go via --report.
  const display = all.slice(0, 80)
  for (const f of display) {
    process.stdout.write(
      `  ${f.relPath}:${f.line} — ${f.category}: ${f.value} (${f.hint})\n`,
    )
  }
  if (all.length > display.length) {
    process.stdout.write(`  ... ${all.length - display.length} more (run with --report for full list)\n`)
  }
  process.stdout.write(
    `hint: replace with a spacing/radius token, or add to scripts/audit-tokens.allowlist.json with reason.\n`,
  )
  process.exit(STRICT_MODE ? 1 : 0)
}

main()
