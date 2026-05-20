/**
 * Migration: `rhf-to-vanilla`
 *
 * Scans the consumer repo for `react-hook-form` imports and reports them.
 * Per CLAUDE.md cardinal rule #2 — Dash bans external form libraries.
 *
 * This migration is SCAN-ONLY (no automatic transform). Auto-replacing RHF
 * with `useState` is too risky — control flow, validation, schema bindings,
 * and field arrays vary too widely to mechanically rewrite. We emit a
 * report and point at the canonical pattern doc.
 */
import fs from "node:fs"
import path from "node:path"
import type { Migration, MigrationResult } from "./index.js"

const RHF_IMPORT_RE = /from\s+["']react-hook-form["']/
const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx"])
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  ".dash-backup",
  ".git",
  "coverage",
])

const REPLACEMENT_DOC_URL =
  "https://github.com/dash-tech/dash-ds/blob/main/apps/docs/registry/rules/dash-ai-rules.md#banned-imports"

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && IGNORE_DIRS.has(entry.name)) continue
    if (IGNORE_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (SOURCE_EXTS.has(ext)) out.push(full)
    }
  }
}

export const rhfToVanillaMigration: Migration = {
  name: "rhf-to-vanilla",
  description:
    "Scan for react-hook-form usage and report files needing manual conversion to useState (Dash bans external form libs).",
  version: "0.4.0",
  apply: async (cwd, _opts): Promise<MigrationResult> => {
    const files: string[] = []
    walk(cwd, files)

    const changes: MigrationResult["changes"] = []
    const warnings: string[] = []

    for (const file of files) {
      let content: string
      try {
        content = fs.readFileSync(file, "utf-8")
      } catch {
        continue
      }
      if (!RHF_IMPORT_RE.test(content)) continue
      // Capture the offending line(s) for the report.
      const lines = content.split("\n")
      const hits = lines
        .map((line, idx) => ({ line, idx: idx + 1 }))
        .filter((entry) => RHF_IMPORT_RE.test(entry.line))
      const snippet = hits
        .map((h) => `  L${h.idx}: ${h.line.trim()}`)
        .join("\n")
      changes.push({
        file: path.relative(cwd, file),
        before: snippet,
        after: "// Manual conversion required — replace with useState + hand-rolled validation.",
      })
    }

    if (changes.length > 0) {
      warnings.push(
        `Found ${changes.length} file(s) importing react-hook-form. ` +
          `This migration is SCAN-ONLY — replace manually using the canonical ` +
          `useState pattern: ${REPLACEMENT_DOC_URL}`,
      )
    }

    return {
      filesScanned: files.length,
      filesModified: 0, // scan-only — no writes
      changes,
      warnings,
    }
  },
}
