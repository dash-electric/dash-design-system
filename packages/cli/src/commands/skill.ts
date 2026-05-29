/**
 * `dashkit skill` — manage the v4 snapshot cache used by @dash/skill.
 *
 * Sub-commands:
 *   refresh   force a re-scan of the current cwd; updates the cache.
 *   status    show whether the cache for this cwd is fresh, stale, or missing.
 *   clear     wipe the cache entry for this cwd (or --all to nuke every entry).
 *
 * Implementation reads/writes the same `~/.dash/skill-cache/<key>.json` layout
 * the skill writes. Kept self-contained (no @dash/skill workspace dep) so the
 * CLI ships standalone.
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import crypto from "node:crypto"
import { execSync } from "node:child_process"
import kleur from "kleur"

const CACHE_SCHEMA_VERSION = 1
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000

const KEY_FILES = [
  "package.json",
  "components.json",
  ".dash/skill-overrides.md",
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.cjs",
  "tailwind.config.mjs",
]
const KEY_DIRS = ["src/components", "components"]
const MAX_FILES_PER_DIR = 5000

function getDashHome(home = os.homedir()): string {
  return path.join(home, ".dash")
}
function getCacheDir(home?: string): string {
  return path.join(getDashHome(home), "skill-cache")
}
function getMetricsPath(home?: string): string {
  return path.join(getDashHome(home), "skill-metrics.jsonl")
}
function getCacheKey(cwd: string): string {
  return crypto
    .createHash("sha256")
    .update(path.resolve(cwd))
    .digest("hex")
    .slice(0, 16)
}
function getCachePath(key: string, home?: string): string {
  return path.join(getCacheDir(home), `${key}.json`)
}

type CachedSnapshot = {
  schemaVersion: number
  cachedAt: number
  fingerprint: string
  dsVersion: string
  cwd: string
  snapshot: unknown
}

function readCache(key: string, home?: string): CachedSnapshot | null {
  try {
    const raw = fs.readFileSync(getCachePath(key, home), "utf8")
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    if (parsed.schemaVersion !== CACHE_SCHEMA_VERSION) return null
    return parsed as CachedSnapshot
  } catch {
    return null
  }
}

function statSafe(p: string): { mtimeMs: number; size: number } | null {
  try {
    const s = fs.statSync(p)
    return { mtimeMs: s.mtimeMs, size: s.size }
  } catch {
    return null
  }
}

function walkDir(dirPath: string): {
  exists: boolean
  fileCount: number
  maxMtimeMs: number
} {
  let exists = false
  try {
    if (!fs.statSync(dirPath).isDirectory())
      return { exists: false, fileCount: 0, maxMtimeMs: 0 }
    exists = true
  } catch {
    return { exists: false, fileCount: 0, maxMtimeMs: 0 }
  }
  let fileCount = 0
  let maxMtimeMs = 0
  const stack = [dirPath]
  while (stack.length > 0 && fileCount < MAX_FILES_PER_DIR) {
    const cur = stack.pop()!
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue
        stack.push(path.join(cur, e.name))
        continue
      }
      if (!e.isFile()) continue
      const st = statSafe(path.join(cur, e.name))
      if (!st) continue
      fileCount += 1
      if (st.mtimeMs > maxMtimeMs) maxMtimeMs = st.mtimeMs
      if (fileCount >= MAX_FILES_PER_DIR) break
    }
  }
  return { exists, fileCount, maxMtimeMs }
}

function computeFingerprint(cwd: string): string {
  const files = KEY_FILES.map((rel) => {
    const st = statSafe(path.join(cwd, rel))
    if (!st) return { rel, exists: false, mtimeMs: 0, size: 0 }
    return { rel, exists: true, mtimeMs: st.mtimeMs, size: st.size }
  })
  const dirs = KEY_DIRS.map((rel) => {
    const w = walkDir(path.join(cwd, rel))
    return { rel, ...w }
  })
  const allMissing = files.every((f) => !f.exists) && dirs.every((d) => !d.exists)
  const canonical = JSON.stringify({
    files: files.map((f) => ({
      rel: f.rel,
      exists: f.exists,
      mtimeMs: Math.floor(f.mtimeMs),
      size: f.size,
    })),
    dirs: dirs.map((d) => ({
      rel: d.rel,
      exists: d.exists,
      fileCount: d.fileCount,
      maxMtimeMs: Math.floor(d.maxMtimeMs),
    })),
  })
  const hash = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16)
  return allMissing ? `degraded-${hash}` : hash
}

function logMetric(event: Record<string, unknown>, home?: string): void {
  try {
    fs.mkdirSync(getDashHome(home), { recursive: true })
    fs.appendFileSync(getMetricsPath(home), JSON.stringify(event) + "\n", "utf8")
  } catch {
    /* best-effort */
  }
}

function formatAge(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`
  if (ms < 60 * 60_000) return `${Math.round(ms / 60_000)}m`
  if (ms < 24 * 60 * 60_000) return `${(ms / 60_000 / 60).toFixed(1)}h`
  return `${(ms / 60_000 / 60 / 24).toFixed(1)}d`
}

export type SkillCommandOpts = {
  cwd?: string
  json?: boolean
  all?: boolean
  ttlMs?: number
  /** Test hook: override $HOME (so tests don't pollute the real cache dir). */
  _home?: string
  /** Test hook: override how we shell out for the refresh path. */
  _exec?: (cmd: string, opts?: Parameters<typeof execSync>[1]) => Buffer | string
}

// ─── status ──────────────────────────────────────────────────────────────

export async function runSkillStatus(opts: SkillCommandOpts = {}): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const home = opts._home
  const key = getCacheKey(cwd)
  const cached = readCache(key, home)
  const currentFp = computeFingerprint(cwd)
  const ttl = opts.ttlMs ?? DEFAULT_TTL_MS

  let state: "fresh" | "stale-fingerprint" | "stale-ttl" | "missing"
  let ageMs = 0
  if (!cached) {
    state = "missing"
  } else {
    ageMs = Math.max(0, Date.now() - cached.cachedAt)
    if (cached.fingerprint !== currentFp) state = "stale-fingerprint"
    else if (ageMs > ttl) state = "stale-ttl"
    else state = "fresh"
  }

  const out = {
    cwd,
    cacheKey: key,
    state,
    cached: cached
      ? {
          cachedAt: cached.cachedAt,
          ageMs,
          ageHuman: formatAge(ageMs),
          fingerprint: cached.fingerprint,
          dsVersion: cached.dsVersion,
        }
      : null,
    currentFingerprint: currentFp,
    ttlMs: ttl,
  }

  if (opts.json) {
    console.log(JSON.stringify(out, null, 2))
    return
  }

  console.log(kleur.bold("Dash Skill — cache status"))
  console.log(`  cwd:           ${cwd}`)
  console.log(`  cache key:     ${key}`)
  switch (state) {
    case "fresh":
      console.log(`  status:        ${kleur.green("fresh")} (age ${formatAge(ageMs)})`)
      break
    case "stale-fingerprint":
      console.log(`  status:        ${kleur.yellow("STALE — repo files changed")} (age ${formatAge(ageMs)})`)
      console.log(`    cached fp:   ${cached!.fingerprint}`)
      console.log(`    current fp:  ${currentFp}`)
      break
    case "stale-ttl":
      console.log(`  status:        ${kleur.yellow("STALE — TTL expired")} (age ${formatAge(ageMs)})`)
      break
    case "missing":
      console.log(`  status:        ${kleur.gray("no cache yet — next loadDashSkill() will scan")}`)
      break
  }
  if (cached) {
    console.log(`  ds version:    ${cached.dsVersion}`)
    console.log(`  cached at:     ${new Date(cached.cachedAt).toISOString()}`)
  }
  console.log(`  TTL:           ${formatAge(ttl)}`)
  console.log()
  console.log(kleur.gray("  Run `dashkit skill refresh` to force re-scan."))
}

// ─── refresh ─────────────────────────────────────────────────────────────

export async function runSkillRefresh(opts: SkillCommandOpts = {}): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const home = opts._home
  const exec = opts._exec ?? execSync
  const key = getCacheKey(cwd)
  const fp = computeFingerprint(cwd)

  let raw: string
  const t0 = Date.now()
  try {
    const out = exec("dashkit info --json", {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "pipe"],
    })
    raw = typeof out === "string" ? out : out.toString("utf8")
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: msg }))
    } else {
      console.error(kleur.red("✗ Failed to run `dashkit info --json`:"))
      console.error(`  ${msg}`)
    }
    process.exitCode = 1
    return
  }

  let snapshot: unknown
  try {
    snapshot = JSON.parse(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `JSON parse failed: ${msg}` }))
    } else {
      console.error(kleur.red("✗ Failed to parse `dashkit info --json` output."))
    }
    process.exitCode = 1
    return
  }

  // Atomic write
  const cacheDir = getCacheDir(home)
  try {
    fs.mkdirSync(cacheDir, { recursive: true })
  } catch {
    /* best-effort */
  }
  const finalPath = getCachePath(key, home)
  const tmpPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`
  const payload: CachedSnapshot = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    cachedAt: Date.now(),
    fingerprint: fp,
    dsVersion: "0.0.1",
    cwd,
    snapshot,
  }
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf8")
    fs.renameSync(tmpPath, finalPath)
  } catch (err) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: String(err) }))
    } else {
      console.error(kleur.red("✗ Failed to write cache file."))
    }
    process.exitCode = 1
    return
  }
  const durationMs = Date.now() - t0
  logMetric({ ts: Date.now(), cwdHash: key, outcome: "write", reason: "cli-refresh", scanDurationMs: durationMs }, home)

  if (opts.json) {
    console.log(JSON.stringify({ ok: true, cwd, cacheKey: key, fingerprint: fp, durationMs }))
    return
  }
  console.log(kleur.green("✓ Skill cache refreshed."))
  console.log(`  cwd:          ${cwd}`)
  console.log(`  cache key:    ${key}`)
  console.log(`  fingerprint:  ${fp}`)
  console.log(`  duration:     ${durationMs}ms`)
}

// ─── clear ───────────────────────────────────────────────────────────────

export async function runSkillClear(opts: SkillCommandOpts = {}): Promise<void> {
  const home = opts._home
  if (opts.all) {
    const dir = getCacheDir(home)
    let count = 0
    let entries: string[] = []
    try {
      entries = fs.readdirSync(dir)
    } catch {
      entries = []
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
    logMetric({ ts: Date.now(), cwdHash: "*", outcome: "clear", reason: "cli-clear-all" }, home)
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, cleared: count }))
    } else {
      console.log(kleur.green(`✓ Cleared ${count} cache entr${count === 1 ? "y" : "ies"}.`))
    }
    return
  }

  const cwd = opts.cwd ?? process.cwd()
  const key = getCacheKey(cwd)
  let cleared = false
  try {
    fs.unlinkSync(getCachePath(key, home))
    cleared = true
  } catch {
    cleared = false
  }
  logMetric({ ts: Date.now(), cwdHash: key, outcome: "clear", reason: "cli-clear" }, home)
  if (opts.json) {
    console.log(JSON.stringify({ ok: true, cwd, cacheKey: key, cleared }))
  } else if (cleared) {
    console.log(kleur.green("✓ Skill cache cleared for this cwd."))
  } else {
    console.log(kleur.gray("(no cache entry to clear)"))
  }
}
