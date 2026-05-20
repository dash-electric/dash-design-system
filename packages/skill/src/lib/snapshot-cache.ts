/**
 * Snapshot cache — persist DashInfoSnapshot to disk keyed by cwd, so repeated
 * `loadDashSkill` calls within a short window skip the `dash info` shell-out.
 *
 * Cache location: `~/.dash/skill-cache/<key>.json`
 *   - <key> = sha256(cwd) first 16 chars
 *   - One file per repo (so multiple consumer repos cache in parallel)
 *
 * Safety:
 *   - Atomic write via tmp + rename
 *   - Read returns null on corruption (never throws) — caller treats as miss
 *   - Schema versioned so future changes don't read stale shape
 *
 * Also writes a single-line JSONL telemetry row to `~/.dash/skill-metrics.jsonl`
 * per cache hit/miss so we can compute hit rate later.
 */
import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import crypto from "node:crypto"
import type { DashInfoSnapshot } from "../info-collector.js"

export const CACHE_SCHEMA_VERSION = 1

export type CachedSnapshot = {
  schemaVersion: number
  cachedAt: number
  fingerprint: string
  dsVersion: string
  cwd: string
  snapshot: DashInfoSnapshot
}

export type CacheMetricEvent = {
  ts: number
  cwdHash: string
  outcome: "hit" | "miss" | "write" | "clear"
  reason?: string
  scanDurationMs?: number
}

/** Resolve `~/.dash` honoring HOME / USERPROFILE. */
export function getDashHome(): string {
  return path.join(os.homedir(), ".dash")
}

export function getCacheDir(): string {
  return path.join(getDashHome(), "skill-cache")
}

export function getMetricsPath(): string {
  return path.join(getDashHome(), "skill-metrics.jsonl")
}

/** sha256(cwd)[0..16]. Stable across runs, won't leak the cwd path. */
export function getCacheKey(cwd: string): string {
  const norm = path.resolve(cwd)
  return crypto.createHash("sha256").update(norm).digest("hex").slice(0, 16)
}

function getCachePath(key: string): string {
  return path.join(getCacheDir(), `${key}.json`)
}

function ensureDirSync(dir: string): void {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch {
    /* best-effort */
  }
}

/**
 * Synchronously load a cached snapshot by key. Returns null when:
 *   - file does not exist
 *   - JSON parse fails (corrupt)
 *   - schemaVersion mismatch
 *   - required fields missing
 *
 * Never throws.
 */
export function readCache(key: string): CachedSnapshot | null {
  let raw: string
  try {
    raw = fs.readFileSync(getCachePath(key), "utf8")
  } catch {
    return null
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null
  const c = parsed as Record<string, unknown>
  if (c.schemaVersion !== CACHE_SCHEMA_VERSION) return null
  if (typeof c.cachedAt !== "number") return null
  if (typeof c.fingerprint !== "string") return null
  if (typeof c.dsVersion !== "string") return null
  if (typeof c.cwd !== "string") return null
  if (!c.snapshot || typeof c.snapshot !== "object") return null
  return c as CachedSnapshot
}

/**
 * Atomically persist a cached snapshot. Uses tmp + rename so a crash
 * mid-write never leaves a half-written file. Best-effort: failures
 * (disk full, no perms) silently swallowed — cache is an optimization,
 * not a correctness gate.
 */
export async function writeCache(
  key: string,
  snapshot: DashInfoSnapshot,
  fingerprint: string,
  opts: { cwd?: string; dsVersion?: string } = {},
): Promise<void> {
  const dir = getCacheDir()
  ensureDirSync(dir)

  const payload: CachedSnapshot = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    cachedAt: Date.now(),
    fingerprint,
    dsVersion: opts.dsVersion ?? "0.0.1",
    cwd: opts.cwd ?? "",
    snapshot,
  }

  const finalPath = getCachePath(key)
  const tmpPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`
  try {
    await fsp.writeFile(tmpPath, JSON.stringify(payload, null, 2), "utf8")
    await fsp.rename(tmpPath, finalPath)
    logMetric({ ts: Date.now(), cwdHash: key, outcome: "write" })
  } catch {
    // attempt cleanup
    try {
      await fsp.unlink(tmpPath)
    } catch {
      /* ignore */
    }
  }
}

/** Remove a single cache entry. Returns true if a file was deleted. */
export function clearCache(key: string): boolean {
  try {
    fs.unlinkSync(getCachePath(key))
    logMetric({ ts: Date.now(), cwdHash: key, outcome: "clear" })
    return true
  } catch {
    return false
  }
}

/** Wipe every cache file in the dir. Returns deletion count. */
export function clearAllCaches(): number {
  const dir = getCacheDir()
  let count = 0
  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return 0
  }
  for (const f of entries) {
    if (!f.endsWith(".json")) continue
    try {
      fs.unlinkSync(path.join(dir, f))
      count += 1
    } catch {
      /* ignore */
    }
  }
  logMetric({ ts: Date.now(), cwdHash: "*", outcome: "clear" })
  return count
}

/**
 * Append a one-line JSON record to skill-metrics.jsonl. Best-effort; never
 * blocks the caller path. Used to compute cache hit rate offline.
 */
export function logMetric(event: CacheMetricEvent): void {
  ensureDirSync(getDashHome())
  try {
    fs.appendFileSync(getMetricsPath(), JSON.stringify(event) + "\n", "utf8")
  } catch {
    /* metrics is best-effort */
  }
}

/** Return all cache entries currently on disk. Used by `dash skill status`. */
export function listCacheEntries(): Array<{ key: string; path: string; cachedAt: number; fingerprint: string; cwd: string }> {
  const dir = getCacheDir()
  let names: string[]
  try {
    names = fs.readdirSync(dir)
  } catch {
    return []
  }
  const out: Array<{ key: string; path: string; cachedAt: number; fingerprint: string; cwd: string }> = []
  for (const n of names) {
    if (!n.endsWith(".json")) continue
    const key = n.replace(/\.json$/, "")
    const cached = readCache(key)
    if (!cached) continue
    out.push({
      key,
      path: getCachePath(key),
      cachedAt: cached.cachedAt,
      fingerprint: cached.fingerprint,
      cwd: cached.cwd,
    })
  }
  return out
}
