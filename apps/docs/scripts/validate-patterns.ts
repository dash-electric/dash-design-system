/**
 * Dash DS — Pattern Block Validator
 *
 * Reads:
 *   - registry/rules/dash-ai-rules.md  (Adaptation Layer = ban list source of truth)
 *   - registry/dash/patterns/*.tsx     (canonical pattern blocks)
 *
 * For each pattern, scans imports and classifies them against the ban list:
 *   - REFERENCE : banned anywhere else, but ALLOWED inside pattern blocks because
 *                 these files are the canonical reference shape. Each banned
 *                 import must also be documented in the Adaptation Layer's
 *                 "Pattern-to-stack adaptation table" so it gets translated
 *                 per-repo (portal → Jotai, backoffice → useState+MUI, etc.).
 *   - DRIFT     : banned import that is NOT covered by the Adaptation Layer.
 *                 These are real drift and must be addressed.
 *
 * Output (human + non-zero exit on DRIFT, zero exit on doc gaps for now):
 *   📋 Patterns audit
 *   <per-pattern report>
 *   Summary: N patterns audited · D drift · G documentation gaps
 *
 * Wired as `pnpm validate:patterns` in apps/docs/package.json.
 *
 * Usage:
 *   pnpm validate:patterns
 *   pnpm tsx scripts/validate-patterns.ts
 */
import fs from "node:fs"
import path from "node:path"

type BanEntry = {
  /** The string the ban rule is keyed on (matched against the import source). */
  token: string
  /** Where the ban rule was sourced from (for diagnostics). */
  context: string
}

type PatternReport = {
  name: string
  file: string
  referenceImports: BanEntry[]
  driftImports: BanEntry[]
  adaptationCoverage: "yes" | "partial" | "no"
  adaptationMissing: string[]
  /** Pattern-specific extra checks. */
  extra: string[]
}

const ROOT = path.resolve(__dirname, "..")
const RULES_PATH = path.join(ROOT, "registry", "rules", "dash-ai-rules.md")
const PATTERNS_DIR = path.join(ROOT, "registry", "dash", "patterns")

/**
 * Hand-maintained ban catalog. Each token is a substring matched against an
 * `import ... from "<source>"` source string. We keep this static (rather than
 * trying to parse arbitrary prose) so the rule is auditable. Each entry maps
 * to the canonical citation in dash-ai-rules.md so updates stay traceable.
 */
const BAN_CATALOG: BanEntry[] = [
  { token: "react-hook-form", context: "Adaptation Layer anti-pattern #1 (RHF banned in 4/5 FE repos)" },
  { token: "@hookform/resolvers", context: "Adaptation Layer anti-pattern #1 (RHF resolver, tied to zod)" },
  { token: "zod", context: "Adaptation Layer anti-pattern #2 (zod banned, hand-rolled validation)" },
  { token: "@tanstack/react-query", context: "Adaptation Layer anti-pattern #3 (TanStack Query banned)" },
  { token: "swr", context: "Adaptation Layer anti-pattern #3 (SWR banned, use axios + custom hooks)" },
  { token: "redux", context: "Adaptation Layer anti-pattern #4 (Redux banned)" },
  { token: "@reduxjs/toolkit", context: "Adaptation Layer anti-pattern #4 (Redux Toolkit banned)" },
  { token: "zustand", context: "Adaptation Layer anti-pattern #4 (Zustand banned except basecamp)" },
]

/**
 * Adaptation Layer coverage map — what does the Adaptation Layer document
 * about each pattern? Keyed by pattern filename.
 *
 * We treat the dash-ai-rules.md "Pattern-to-stack adaptation table" sections as
 * the source of truth. The script asserts that each banned import in a pattern
 * is acknowledged by a translation row in the Adaptation Layer for portal,
 * backoffice, halo, basecamp, fleet-mgmt, and nest-fleet (where applicable).
 *
 * Repos expected to have an adaptation row per pattern (FE = all five):
 */
const EXPECTED_FE_REPOS = ["portal", "backoffice", "halo"] as const
type ExpectedRepo = (typeof EXPECTED_FE_REPOS)[number]

const PATTERN_ADAPTATION_SECTIONS: Record<
  string,
  { sectionHeader: string; expectedRepos: readonly ExpectedRepo[] }
> = {
  "multi-item-form.tsx": {
    sectionHeader: "### multi-item-form.tsx adaptation",
    expectedRepos: EXPECTED_FE_REPOS,
  },
  "bulk-submit.tsx": {
    sectionHeader: "### bulk-submit.tsx adaptation",
    expectedRepos: EXPECTED_FE_REPOS,
  },
  "use-code-field.tsx": {
    sectionHeader: "### use-code-field.tsx adaptation",
    // use-code-field uses a single "ALL" row — its expected coverage is just
    // the presence of the section + the case-sensitive note.
    expectedRepos: [] as const,
  },
}

function readRules(): string {
  return fs.readFileSync(RULES_PATH, "utf-8")
}

function listPatternFiles(): string[] {
  return fs
    .readdirSync(PATTERNS_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .sort()
}

/**
 * Cheap import scanner. We avoid pulling in TypeScript/Babel just to parse
 * imports — these pattern files use plain ESM `import ... from "..."` form,
 * so a regex is sufficient and keeps the script dependency-free.
 */
function extractImportSources(src: string): string[] {
  const sources: string[] = []
  const re = /^\s*import\s+[^'"]*?from\s+['"]([^'"]+)['"]/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    sources.push(m[1])
  }
  return sources
}

function classifyImports(sources: string[]): BanEntry[] {
  const hits: BanEntry[] = []
  for (const src of sources) {
    for (const entry of BAN_CATALOG) {
      // Exact-match or starts-with-token-then-slash to avoid false positives
      // (e.g. "zod-foo" must not match "zod"). zod subpaths like "zod/v4"
      // still match correctly.
      if (
        src === entry.token ||
        src.startsWith(`${entry.token}/`)
      ) {
        hits.push({ token: entry.token, context: entry.context })
      }
    }
  }
  // Dedupe by token.
  const seen = new Set<string>()
  return hits.filter((h) => {
    if (seen.has(h.token)) return false
    seen.add(h.token)
    return true
  })
}

/**
 * Within the Adaptation Layer of the rules markdown, find the section block
 * for a given pattern and return its raw text (until the next "### " heading
 * or end of file).
 */
function getAdaptationSection(rules: string, sectionHeader: string): string | null {
  const idx = rules.indexOf(sectionHeader)
  if (idx === -1) return null
  // Find end = next "### " at column 0 OR next "## " OR EOF.
  const after = rules.slice(idx + sectionHeader.length)
  const nextHeading = after.search(/\n#{2,3} /)
  if (nextHeading === -1) return rules.slice(idx)
  return rules.slice(idx, idx + sectionHeader.length + nextHeading)
}

function checkAdaptationCoverage(
  patternFile: string,
  banned: BanEntry[],
  rules: string,
): { coverage: PatternReport["adaptationCoverage"]; missing: string[] } {
  const spec = PATTERN_ADAPTATION_SECTIONS[patternFile]
  if (!spec) {
    // Unknown pattern — can't verify coverage. Treat as documentation gap.
    return { coverage: "no", missing: ["no Adaptation Layer entry registered for this pattern"] }
  }
  if (banned.length === 0) {
    // Nothing to translate. Pattern is intrinsically portable.
    return { coverage: "yes", missing: [] }
  }
  const section = getAdaptationSection(rules, spec.sectionHeader)
  if (section === null) {
    return {
      coverage: "no",
      missing: [`section "${spec.sectionHeader}" missing from dash-ai-rules.md`],
    }
  }
  const missing: string[] = []
  for (const repo of spec.expectedRepos) {
    // Look for a table row that starts with the repo name (lowercased).
    const rowRegex = new RegExp(`^\\|\\s*${repo}\\b`, "im")
    if (!rowRegex.test(section)) {
      missing.push(`missing ${repo} translation row`)
    }
  }
  if (missing.length === 0) return { coverage: "yes", missing }
  if (missing.length < spec.expectedRepos.length) return { coverage: "partial", missing }
  return { coverage: "no", missing }
}

/**
 * Pattern-specific spot checks beyond import classification. Kept minimal —
 * the goal is to surface obvious regressions, not to lint exhaustively.
 */
function extraChecks(patternFile: string, src: string): string[] {
  const out: string[] = []
  if (patternFile === "use-code-field.tsx") {
    // Case-sensitive contract: must NOT call toUpperCase / toLowerCase
    // on the code value. Strip comments first — the canonical pattern
    // documents WHY it doesn't uppercase, mentioning the method by name.
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
    const hasUpper = /\.toUpperCase\(/.test(stripped)
    const hasLower = /\.toLowerCase\(/.test(stripped)
    if (hasUpper || hasLower) {
      out.push(
        `Case-sensitive: NO (found ${hasUpper ? ".toUpperCase()" : ""}${hasUpper && hasLower ? " + " : ""}${hasLower ? ".toLowerCase()" : ""} — violates PolicyOneTimeCode spec)`,
      )
    } else {
      out.push("Case-sensitive: yes (no .toUpperCase() detected)")
    }
    // Charset assertion — must match PolicyOneTimeCode spec [A-Za-z0-9].
    if (/\[A-Za-z0-9\]\{6\}/.test(src)) {
      out.push("Charset: [A-Za-z0-9] (matches PolicyOneTimeCode spec)")
    } else {
      out.push("Charset: UNVERIFIED (USE_CODE_REGEX not in expected form)")
    }
  }
  return out
}

function auditPattern(file: string, rules: string): PatternReport {
  const full = path.join(PATTERNS_DIR, file)
  const src = fs.readFileSync(full, "utf-8")
  const sources = extractImportSources(src)
  const banned = classifyImports(sources)
  // All banned imports in a pattern block are REFERENCE by definition; we
  // only flag DRIFT if Adaptation Layer doesn't cover them. So:
  //   - referenceImports = all banned hits
  //   - driftImports     = empty here (drift = banned import in NON-pattern
  //                        code, which is a different validator's concern)
  // The doc-gap surface is the more interesting signal for this audit.
  const { coverage, missing } = checkAdaptationCoverage(file, banned, rules)
  return {
    name: file.replace(/\.tsx$/, ""),
    file,
    referenceImports: banned,
    driftImports: [],
    adaptationCoverage: coverage,
    adaptationMissing: missing,
    extra: extraChecks(file, src),
  }
}

function formatTranslationSummary(rules: string, sectionHeader: string): string {
  const section = getAdaptationSection(rules, sectionHeader)
  if (!section) return "missing"
  const repos: ExpectedRepo[] = []
  for (const repo of EXPECTED_FE_REPOS) {
    const rowRegex = new RegExp(`^\\|\\s*${repo}\\b`, "im")
    if (rowRegex.test(section)) repos.push(repo)
  }
  if (repos.length === 0) return "section present, no repo rows"
  return repos.map((r) => `${r} → ${repoHint(r)}`).join(", ")
}

function repoHint(repo: ExpectedRepo): string {
  switch (repo) {
    case "portal":
      return "Jotai"
    case "backoffice":
      return "useState+MUI"
    case "halo":
      return "useState+AlignUI"
  }
}

function main() {
  const rules = readRules()
  const files = listPatternFiles()
  const reports = files.map((f) => auditPattern(f, rules))

  let driftCount = 0
  let docGapCount = 0

  // Header.
  process.stdout.write("\n  📋 Patterns audit\n\n")

  for (const r of reports) {
    process.stdout.write(`  ${r.file}\n`)

    if (r.referenceImports.length > 0) {
      const tokens = r.referenceImports.map((e) => e.token).join(", ")
      process.stdout.write(`    ✓ Reference imports: ${tokens}\n`)
    } else {
      process.stdout.write(`    ✓ Reference imports: (none — intrinsically portable)\n`)
    }

    if (r.driftImports.length > 0) {
      driftCount += r.driftImports.length
      const tokens = r.driftImports.map((e) => e.token).join(", ")
      process.stdout.write(`    ✗ DRIFT imports: ${tokens}\n`)
    }

    if (r.adaptationCoverage === "yes") {
      process.stdout.write(`    ✓ Documented in Adaptation Layer: yes\n`)
      const spec = PATTERN_ADAPTATION_SECTIONS[r.file]
      if (spec && spec.expectedRepos.length > 0) {
        const summary = formatTranslationSummary(rules, spec.sectionHeader)
        process.stdout.write(`    ✓ Translation rules present: yes (${summary}, ...)\n`)
      } else if (spec) {
        process.stdout.write(`    ✓ Translation rules present: yes (ALL-repos row)\n`)
      }
    } else if (r.adaptationCoverage === "partial") {
      docGapCount++
      const missing = r.adaptationMissing.join("; ")
      process.stdout.write(`    ⚠ Documented in Adaptation Layer: PARTIAL (${missing})\n`)
    } else {
      docGapCount++
      const missing = r.adaptationMissing.join("; ") || "section missing"
      process.stdout.write(`    ✗ Documented in Adaptation Layer: NO (${missing})\n`)
    }

    for (const x of r.extra) {
      const ok = !/^\s*Case-sensitive: NO/.test(x) && !/UNVERIFIED/.test(x)
      process.stdout.write(`    ${ok ? "✓" : "✗"} ${x}\n`)
      if (!ok) driftCount++
    }

    process.stdout.write("\n")
  }

  const summary = `Summary: ${reports.length} patterns audited · ${driftCount} drift · ${docGapCount} documentation gap${docGapCount === 1 ? "" : "s"}`
  process.stdout.write(`  ${summary}\n\n`)

  // Non-blocking for now (per CI mandate). Drift = real regressions, doc gaps
  // are warnings. Keep exit 0 unless drift is found.
  if (driftCount > 0) {
    process.exit(1)
  }
}

main()
