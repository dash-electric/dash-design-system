/**
 * Migration: `icon-rename`
 *
 * Rewrites legacy Remixicon import paths to the canonical alias used by the
 * Dash design system. Older Dash projects imported from the bare package
 * path; the canonical alias is `@remixicon/react` (matching the Dash CLI
 * scaffold and registry items).
 *
 *   - "remixicon-react"           → "@remixicon/react"
 *   - "remixicon-react/icons/..." → "@remixicon/react"  (icon names re-exported
 *                                                       from the root barrel)
 *
 * Safe to run multiple times (idempotent).
 */
import fs from "node:fs"
import path from "node:path"
import {
  startBackup,
  backupFile,
  commitBackup,
  restoreBackup,
} from "../lib/backup.js"
import type { Migration, MigrationResult } from "./index.js"

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

const REPLACEMENTS: Array<{ from: RegExp; to: string; label: string }> = [
  {
    from: /(["'])remixicon-react\/icons\/[^"']+\1/g,
    to: `"@remixicon/react"`,
    label: "remixicon-react/icons/* → @remixicon/react",
  },
  {
    from: /(["'])remixicon-react\1/g,
    to: `"@remixicon/react"`,
    label: "remixicon-react → @remixicon/react",
  },
]

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
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

export const iconRenameMigration: Migration = {
  name: "icon-rename",
  description:
    "Rewrite legacy `remixicon-react` import paths to the canonical `@remixicon/react` alias.",
  version: "0.4.0",
  apply: async (cwd, opts): Promise<MigrationResult> => {
    const files: string[] = []
    walk(cwd, files)

    const changes: MigrationResult["changes"] = []
    const warnings: string[] = []
    const session = opts.dryRun ? null : startBackup(cwd)

    try {
      for (const file of files) {
        let content: string
        try {
          content = fs.readFileSync(file, "utf-8")
        } catch {
          continue
        }
        let next = content
        for (const rule of REPLACEMENTS) {
          next = next.replace(rule.from, rule.to)
        }
        if (next === content) continue
        changes.push({
          file: path.relative(cwd, file),
          before: content,
          after: next,
        })
        if (!opts.dryRun && session) {
          backupFile(session, file)
          fs.writeFileSync(file, next, "utf-8")
        }
      }

      if (session) commitBackup(session, true)
    } catch (err) {
      if (session) restoreBackup(session)
      throw err
    }

    return {
      filesScanned: files.length,
      filesModified: changes.length,
      changes,
      warnings,
    }
  },
}
