/**
 * Repo fingerprint — fast (~10ms) stat-based signature of the consumer repo.
 *
 * Hashes mtime + size of the small set of files that meaningfully affect a
 * Dash snapshot. When any of these change, the snapshot cache should be
 * invalidated and `dash info` re-run.
 *
 * Strict requirements:
 *   - NO external deps (node:fs + node:crypto only)
 *   - Degraded fingerprint when files are missing (still hashable, never throws)
 *   - Deterministic: same inputs → same output across runs
 */
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

/** Files that trigger snapshot invalidation when changed. */
const KEY_FILES = [
  "package.json",
  "components.json",
  ".dash/skill-overrides.md",
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.cjs",
  "tailwind.config.mjs",
] as const

/** Directories scanned recursively (counts + max mtime). */
const KEY_DIRS = ["src/components", "components"] as const

/** Cap recursive scan to avoid pathological repos. */
const MAX_FILES_PER_DIR = 5000

export type FingerprintParts = {
  files: Array<{ rel: string; exists: boolean; mtimeMs: number; size: number }>
  dirs: Array<{ rel: string; exists: boolean; fileCount: number; maxMtimeMs: number }>
}

function statSafe(p: string): { mtimeMs: number; size: number } | null {
  try {
    const s = fs.statSync(p)
    return { mtimeMs: s.mtimeMs, size: s.size }
  } catch {
    return null
  }
}

/**
 * Walk a directory recursively, accumulating file count + max mtime.
 * Bounded by MAX_FILES_PER_DIR. Returns { exists: false } when dir missing.
 */
function walkDir(dirPath: string): {
  exists: boolean
  fileCount: number
  maxMtimeMs: number
} {
  let exists = false
  try {
    const s = fs.statSync(dirPath)
    if (!s.isDirectory()) return { exists: false, fileCount: 0, maxMtimeMs: 0 }
    exists = true
  } catch {
    return { exists: false, fileCount: 0, maxMtimeMs: 0 }
  }

  let fileCount = 0
  let maxMtimeMs = 0
  const stack: string[] = [dirPath]
  while (stack.length > 0 && fileCount < MAX_FILES_PER_DIR) {
    const cur = stack.pop()!
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      // skip noise dirs to keep fingerprint cheap
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue
        stack.push(path.join(cur, e.name))
        continue
      }
      if (!e.isFile()) continue
      const full = path.join(cur, e.name)
      const st = statSafe(full)
      if (!st) continue
      fileCount += 1
      if (st.mtimeMs > maxMtimeMs) maxMtimeMs = st.mtimeMs
      if (fileCount >= MAX_FILES_PER_DIR) break
    }
  }
  return { exists, fileCount, maxMtimeMs }
}

/**
 * Collect the raw stat parts that feed into the fingerprint. Exposed for
 * debugging + tests (so we can assert "this file changed → these parts changed").
 */
export function collectFingerprintParts(cwd: string): FingerprintParts {
  const files = KEY_FILES.map((rel) => {
    const st = statSafe(path.join(cwd, rel))
    if (!st) return { rel, exists: false, mtimeMs: 0, size: 0 }
    return { rel, exists: true, mtimeMs: st.mtimeMs, size: st.size }
  })

  const dirs = KEY_DIRS.map((rel) => {
    const w = walkDir(path.join(cwd, rel))
    return { rel, ...w }
  })

  return { files, dirs }
}

/**
 * Compute a stable 16-char fingerprint of the consumer repo state.
 *
 * Algorithm:
 *   1. stat KEY_FILES (mtime + size, 0/0 when missing)
 *   2. walk KEY_DIRS (file count + max mtime within tree)
 *   3. SHA-256 the canonical JSON, return first 16 hex chars
 *
 * Returns `"degraded-<hex>"` when ALL inputs are missing (cwd is not a project
 * at all). Callers can use this prefix to distinguish "nothing here yet" from
 * "real repo state".
 */
export async function computeFingerprint(cwd: string): Promise<string> {
  const parts = collectFingerprintParts(cwd)

  const allMissing =
    parts.files.every((f) => !f.exists) && parts.dirs.every((d) => !d.exists)

  // Round mtime to integer ms to dodge filesystem float jitter (some FS
  // report nanosecond precision that varies between stat calls).
  const canonical = JSON.stringify({
    files: parts.files.map((f) => ({
      rel: f.rel,
      exists: f.exists,
      mtimeMs: Math.floor(f.mtimeMs),
      size: f.size,
    })),
    dirs: parts.dirs.map((d) => ({
      rel: d.rel,
      exists: d.exists,
      fileCount: d.fileCount,
      maxMtimeMs: Math.floor(d.maxMtimeMs),
    })),
  })

  const hash = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16)
  return allMissing ? `degraded-${hash}` : hash
}

/** Synchronous flavor — same algorithm, useful for CLI status output. */
export function computeFingerprintSync(cwd: string): string {
  const parts = collectFingerprintParts(cwd)
  const allMissing =
    parts.files.every((f) => !f.exists) && parts.dirs.every((d) => !d.exists)
  const canonical = JSON.stringify({
    files: parts.files.map((f) => ({
      rel: f.rel,
      exists: f.exists,
      mtimeMs: Math.floor(f.mtimeMs),
      size: f.size,
    })),
    dirs: parts.dirs.map((d) => ({
      rel: d.rel,
      exists: d.exists,
      fileCount: d.fileCount,
      maxMtimeMs: Math.floor(d.maxMtimeMs),
    })),
  })
  const hash = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16)
  return allMissing ? `degraded-${hash}` : hash
}
