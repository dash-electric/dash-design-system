/**
 * Temp dir lifecycle for sandboxed preview bundles.
 *
 *   ~/.dash-build/preview/<sanitized-promptId>/
 *      ├─ <user-files>.tsx
 *      └─ bundle.js
 *
 * Sanitization is the security boundary — promptId comes from over-the-wire
 * input and must never escape PREVIEW_ROOT. We allow [A-Za-z0-9_-] only and
 * cap length at 64 chars; everything else collapses to underscores.
 */

import { promises as fs } from "node:fs"
import path from "node:path"
import { homedir } from "node:os"

export const DEFAULT_PREVIEW_ROOT = path.join(homedir(), ".dash-build", "preview")

/** Strip every char that isn't `[A-Za-z0-9_-]` and clamp length. Empty input
 *  becomes `"_"` so we always return a non-empty single segment. */
export function sanitize(promptId: string): string {
  const cleaned = String(promptId).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64)
  return cleaned.length > 0 ? cleaned : "_"
}

/** Resolve the preview dir for a promptId. Pure — no I/O. */
export function resolvePreviewDir(promptId: string, rootDir = DEFAULT_PREVIEW_ROOT): string {
  return path.join(rootDir, sanitize(promptId))
}

/** Create (mkdir -p) the preview dir. Idempotent. */
export async function prepareTempDir(
  promptId: string,
  rootDir = DEFAULT_PREVIEW_ROOT,
): Promise<string> {
  const dir = resolvePreviewDir(promptId, rootDir)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

/** Best-effort delete of a single preview dir. Swallows ENOENT. */
export async function cleanupOne(
  promptId: string,
  rootDir = DEFAULT_PREVIEW_ROOT,
): Promise<boolean> {
  const dir = resolvePreviewDir(promptId, rootDir)
  try {
    await fs.rm(dir, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

/** Delete preview dirs whose mtime is older than `maxAgeMs`. Returns count
 *  removed. Tolerates a missing root (returns 0). */
export async function cleanupOld(
  maxAgeMs = 60 * 60 * 1000,
  rootDir = DEFAULT_PREVIEW_ROOT,
  now: () => number = Date.now,
): Promise<number> {
  let entries: import("node:fs").Dirent[]
  try {
    entries = await fs.readdir(rootDir, { withFileTypes: true })
  } catch {
    return 0
  }
  let cleaned = 0
  const cutoff = now() - maxAgeMs
  for (const d of entries) {
    if (!d.isDirectory()) continue
    const dir = path.join(rootDir, d.name)
    try {
      const stat = await fs.stat(dir)
      if (stat.mtimeMs < cutoff) {
        await fs.rm(dir, { recursive: true, force: true })
        cleaned++
      }
    } catch {
      // best-effort — skip on race / permission
    }
  }
  return cleaned
}
