#!/usr/bin/env node
/**
 * vendor-skills — copy the load-bearing reasoning sections of the two gstack
 * skills into <packageRoot>/skills/<name>/SKILL.md so the vendored path that
 * `src/skills/skill-reader.ts` prefers stays populated (and survives the
 * planned repo split — the global ~/.claude install won't follow us).
 *
 * Source of truth: ~/.claude/skills/gstack/<name>/SKILL.md
 * We extract ONLY the allow-listed sections (matching skill-reader's strip
 * logic) plus a vendoring header, so the vendored file is small + stable and
 * yields an identical extracted body to the global copy.
 *
 * Run: `npm run vendor:skills`  (or `node scripts/vendor-skills.mjs`)
 *
 * If a source skill is missing (e.g. gstack not installed), we leave the
 * existing vendored copy untouched and warn — never clobber with empty.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** Same allow-list as src/skills/skill-reader.ts SECTION_ALLOW_LIST. */
const SKILLS = {
  "office-hours": ["the six forcing questions"],
  // `step 0: nuclear` (not bare `step 0`) so we skip the global skill's
  // `## Step 0: Detect platform and base branch` preamble heading.
  "plan-ceo-review": ["philosophy", "step 0: nuclear"],
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

function stripFrontmatter(text) {
  if (!text.startsWith("---")) return text
  const match = /^---\n[\s\S]*?\n---[ \t]*\n?/.exec(text)
  return match ? text.slice(match[0].length) : text
}

function parseHeading(line) {
  const match = /^(#{1,6})\s+(.*\S)\s*$/.exec(line)
  return match ? { depth: match[1].length, text: match[2] } : null
}

function matches(headingText, allow) {
  const lower = headingText.trim().toLowerCase()
  return allow.some((p) => lower.startsWith(p.toLowerCase()))
}

/** Extract allow-listed sections (mirrors skill-reader.stripPreamble). */
function extractSections(raw, allow) {
  const lines = stripFrontmatter(normalizeNewlines(raw)).split("\n")
  const kept = []
  let captureDepth = 0
  for (const line of lines) {
    const heading = parseHeading(line)
    if (heading) {
      if (matches(heading.text, allow)) {
        captureDepth = heading.depth
        kept.push(line)
        continue
      }
      if (captureDepth > 0 && heading.depth <= captureDepth) captureDepth = 0
      if (captureDepth > 0) kept.push(line)
      continue
    }
    if (captureDepth > 0) kept.push(line)
  }
  return kept.join("\n").trim()
}

function frontmatterOf(raw) {
  const text = normalizeNewlines(raw)
  if (!text.startsWith("---")) return ""
  const match = /^---\n[\s\S]*?\n---[ \t]*\n?/.exec(text)
  return match ? match[0].trimEnd() + "\n" : ""
}

function vendorHeader(name) {
  return [
    `<!-- VENDORED into @dash/build from ~/.claude/skills/gstack/${name}/SKILL.md -->`,
    `<!-- Source of truth: gstack ${name} skill. Re-vendor via \`npm run vendor:skills\`. -->`,
    `<!-- Only the load-bearing reasoning sections are vendored; the auto-generated -->`,
    `<!-- gstack preamble is intentionally dropped. dash-build's skill-reader -->`,
    `<!-- preamble-strips to the same sections, so vendored and global copies match. -->`,
    "",
  ].join("\n")
}

async function main() {
  const home = os.homedir()
  let ok = 0
  for (const [name, allow] of Object.entries(SKILLS)) {
    const src = path.join(home, ".claude", "skills", "gstack", name, "SKILL.md")
    let raw
    try {
      raw = await readFile(src, "utf8")
    } catch {
      console.warn(`[vendor-skills] SKIP ${name}: source not found at ${src} (left existing vendored copy)`)
      continue
    }
    const body = extractSections(raw, allow)
    if (!body) {
      console.warn(`[vendor-skills] SKIP ${name}: no allow-listed section found in source (left existing vendored copy)`)
      continue
    }
    const out = `${frontmatterOf(raw)}${vendorHeader(name)}\n${body}\n`
    const destDir = path.join(PACKAGE_ROOT, "skills", name)
    await mkdir(destDir, { recursive: true })
    const dest = path.join(destDir, "SKILL.md")
    await writeFile(dest, out, "utf8")
    console.log(`[vendor-skills] wrote ${dest} (${out.length} chars)`)
    ok += 1
  }
  console.log(`[vendor-skills] done — ${ok}/${Object.keys(SKILLS).length} vendored.`)
}

main().catch((err) => {
  console.error("[vendor-skills] failed:", err)
  process.exitCode = 1
})
