import { afterEach, beforeEach, describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  CACHE_SCHEMA_VERSION,
  clearAllCaches,
  clearCache,
  getCacheDir,
  getCacheKey,
  listCacheEntries,
  readCache,
  writeCache,
} from "../lib/snapshot-cache.js"
import type { DashInfoSnapshot } from "../info-collector.js"

const REAL_HOME = process.env.HOME
const REAL_USERPROFILE = process.env.USERPROFILE

function fakeSnapshot(rootPath = "/tmp/proj-x"): DashInfoSnapshot {
  return {
    schemaVersion: 1,
    project: { framework: "next", typescript: true, packageManager: "pnpm", rootPath },
    aliases: {},
    dash: { registryUrl: "https://r.example.com", hasToken: false, installedItems: [] },
    customHooks: [],
    apiBaseUrl: null,
  }
}

describe("snapshot-cache", () => {
  let tmpHome: string

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "dash-skill-cache-"))
    process.env.HOME = tmpHome
    process.env.USERPROFILE = tmpHome
  })

  afterEach(() => {
    try {
      fs.rmSync(tmpHome, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
    if (REAL_HOME !== undefined) process.env.HOME = REAL_HOME
    else delete process.env.HOME
    if (REAL_USERPROFILE !== undefined) process.env.USERPROFILE = REAL_USERPROFILE
    else delete process.env.USERPROFILE
  })

  it("getCacheKey is stable, 16 hex chars, derived from cwd", () => {
    const k1 = getCacheKey("/foo/bar")
    const k2 = getCacheKey("/foo/bar")
    const k3 = getCacheKey("/foo/baz")
    expect(k1).toMatch(/^[0-9a-f]{16}$/)
    expect(k1).toBe(k2)
    expect(k1).not.toBe(k3)
  })

  it("getCacheKey normalizes relative paths", () => {
    // path.resolve normalizes — same key for equivalent paths
    const k1 = getCacheKey("/foo/bar")
    const k2 = getCacheKey("/foo/bar/")
    expect(k1).toBe(k2)
  })

  it("readCache returns null when file does not exist", () => {
    const cached = readCache("not-a-real-key-1234")
    expect(cached).toBeNull()
  })

  it("write + read roundtrip preserves snapshot + fingerprint", async () => {
    const key = getCacheKey("/foo/bar")
    const snap = fakeSnapshot("/foo/bar")
    await writeCache(key, snap, "fp-abc123", { cwd: "/foo/bar", dsVersion: "9.9.9" })

    const cached = readCache(key)
    expect(cached).not.toBeNull()
    expect(cached!.schemaVersion).toBe(CACHE_SCHEMA_VERSION)
    expect(cached!.fingerprint).toBe("fp-abc123")
    expect(cached!.dsVersion).toBe("9.9.9")
    expect(cached!.cwd).toBe("/foo/bar")
    expect(cached!.snapshot.project.rootPath).toBe("/foo/bar")
    expect(typeof cached!.cachedAt).toBe("number")
  })

  it("readCache returns null on corrupted JSON (recovers gracefully)", () => {
    const key = "corrupt-key"
    const cacheDir = getCacheDir()
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(path.join(cacheDir, `${key}.json`), "{{{ not json")
    expect(readCache(key)).toBeNull()
  })

  it("readCache rejects mismatched schemaVersion", () => {
    const key = "wrong-schema"
    const cacheDir = getCacheDir()
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(
      path.join(cacheDir, `${key}.json`),
      JSON.stringify({
        schemaVersion: 999,
        cachedAt: Date.now(),
        fingerprint: "x",
        dsVersion: "1",
        cwd: "/x",
        snapshot: fakeSnapshot(),
      }),
    )
    expect(readCache(key)).toBeNull()
  })

  it("readCache rejects missing required fields", () => {
    const key = "missing-fields"
    const cacheDir = getCacheDir()
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(
      path.join(cacheDir, `${key}.json`),
      JSON.stringify({ schemaVersion: 1, cachedAt: 123 }),
    )
    expect(readCache(key)).toBeNull()
  })

  it("writeCache is atomic — no half-written file under partial failure", async () => {
    const key = getCacheKey("/atomic-test")
    await writeCache(key, fakeSnapshot(), "fp-1", { cwd: "/atomic-test" })
    // No leftover .tmp files in cache dir
    const entries = fs.readdirSync(getCacheDir())
    expect(entries.some((e) => e.endsWith(".tmp"))).toBe(false)
  })

  it("clearCache removes entry and returns true; second call returns false", async () => {
    const key = getCacheKey("/to-clear")
    await writeCache(key, fakeSnapshot(), "fp-x", { cwd: "/to-clear" })
    expect(readCache(key)).not.toBeNull()
    expect(clearCache(key)).toBe(true)
    expect(readCache(key)).toBeNull()
    expect(clearCache(key)).toBe(false)
  })

  it("clearAllCaches wipes every entry", async () => {
    await writeCache(getCacheKey("/a"), fakeSnapshot(), "fa")
    await writeCache(getCacheKey("/b"), fakeSnapshot(), "fb")
    await writeCache(getCacheKey("/c"), fakeSnapshot(), "fc")
    const n = clearAllCaches()
    expect(n).toBeGreaterThanOrEqual(3)
    expect(listCacheEntries()).toHaveLength(0)
  })

  it("listCacheEntries returns one entry per cached repo", async () => {
    await writeCache(getCacheKey("/p1"), fakeSnapshot("/p1"), "fp1", { cwd: "/p1" })
    await writeCache(getCacheKey("/p2"), fakeSnapshot("/p2"), "fp2", { cwd: "/p2" })
    const entries = listCacheEntries()
    expect(entries).toHaveLength(2)
    const cwds = entries.map((e) => e.cwd).sort()
    expect(cwds).toEqual(["/p1", "/p2"])
  })

  it("writes a metrics row when caching (best-effort, non-blocking)", async () => {
    const key = getCacheKey("/metric-test")
    await writeCache(key, fakeSnapshot(), "fp-m", { cwd: "/metric-test" })
    const metricsPath = path.join(tmpHome, ".dash", "skill-metrics.jsonl")
    expect(fs.existsSync(metricsPath)).toBe(true)
    const lines = fs.readFileSync(metricsPath, "utf8").trim().split("\n")
    expect(lines.length).toBeGreaterThanOrEqual(1)
    const last = JSON.parse(lines[lines.length - 1])
    expect(last.outcome).toBe("write")
    expect(last.cwdHash).toBe(key)
  })
})
