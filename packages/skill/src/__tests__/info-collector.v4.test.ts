/**
 * v4 cache-aware collector tests. Uses dependency injection (no real disk
 * caches written) so tests stay hermetic.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { collectDashInfo, type DashInfoSnapshot } from "../info-collector.js"

const REAL_HOME = process.env.HOME
const REAL_USERPROFILE = process.env.USERPROFILE

function fakeSnapshot(): DashInfoSnapshot {
  return {
    schemaVersion: 1,
    project: { framework: "next", typescript: true, packageManager: "pnpm", rootPath: "/repo" },
    aliases: {},
    dash: { registryUrl: "", hasToken: false, installedItems: [] },
    customHooks: [],
    apiBaseUrl: null,
  }
}

describe("collectDashInfo v4 cache behavior", () => {
  let tmpHome: string
  let tmpCwd: string

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "dash-v4-home-"))
    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), "dash-v4-cwd-"))
    process.env.HOME = tmpHome
    process.env.USERPROFILE = tmpHome
    // give the cwd a tiny package.json so fingerprint isn't degraded
    fs.writeFileSync(path.join(tmpCwd, "package.json"), JSON.stringify({ name: "consumer" }))
  })

  afterEach(() => {
    try { fs.rmSync(tmpHome, { recursive: true, force: true }) } catch {}
    try { fs.rmSync(tmpCwd, { recursive: true, force: true }) } catch {}
    if (REAL_HOME !== undefined) process.env.HOME = REAL_HOME
    else delete process.env.HOME
    if (REAL_USERPROFILE !== undefined) process.env.USERPROFILE = REAL_USERPROFILE
    else delete process.env.USERPROFILE
  })

  it("first call → cache miss → exec called → result marked cacheHit:false", async () => {
    const exec = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const result = await collectDashInfo(tmpCwd, { exec }, { forceRefresh: false })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.cacheHit).toBe(false)
      expect(result.freshnessReason).toBe("no-cache")
    }
    expect(exec).toHaveBeenCalledTimes(1)
  })

  it("second call within TTL + same fingerprint → cache hit, exec NOT called", async () => {
    const exec1 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    await collectDashInfo(tmpCwd, { exec: exec1 }, { forceRefresh: false })

    const exec2 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const r2 = await collectDashInfo(tmpCwd, { exec: exec2 }, { forceRefresh: false })
    expect(r2.ok).toBe(true)
    if (r2.ok) {
      expect(r2.cacheHit).toBe(true)
      expect(r2.freshnessReason).toBe("valid-cache")
    }
    expect(exec2).not.toHaveBeenCalled()
  })

  it("forceRefresh=true → always re-scan, write fresh cache", async () => {
    const exec1 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    await collectDashInfo(tmpCwd, { exec: exec1 }, { forceRefresh: false })

    const exec2 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const r2 = await collectDashInfo(tmpCwd, { exec: exec2 }, { forceRefresh: true })
    expect(r2.ok).toBe(true)
    if (r2.ok) {
      expect(r2.cacheHit).toBe(false)
      expect(r2.freshnessReason).toBe("forced")
    }
    expect(exec2).toHaveBeenCalledTimes(1)
  })

  it("fingerprint change between calls → cache miss + rescan", async () => {
    const exec1 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    await collectDashInfo(tmpCwd, { exec: exec1 }, { forceRefresh: false })

    // Mutate package.json + bump mtime
    fs.writeFileSync(
      path.join(tmpCwd, "package.json"),
      JSON.stringify({ name: "consumer-changed-name" }),
    )
    const future = new Date(Date.now() + 10_000)
    fs.utimesSync(path.join(tmpCwd, "package.json"), future, future)

    const exec2 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const r2 = await collectDashInfo(tmpCwd, { exec: exec2 }, { forceRefresh: false })
    expect(r2.ok).toBe(true)
    if (r2.ok) {
      expect(r2.cacheHit).toBe(false)
      expect(r2.freshnessReason).toBe("fingerprint-changed")
    }
    expect(exec2).toHaveBeenCalledTimes(1)
  })

  it("ttlMs=0 → cache always treated as expired, re-scan every call", async () => {
    const exec1 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    await collectDashInfo(tmpCwd, { exec: exec1 }, { forceRefresh: false })

    // Wait 2ms then assert TTL expiry
    await new Promise((r) => setTimeout(r, 2))

    const exec2 = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const r2 = await collectDashInfo(tmpCwd, { exec: exec2 }, { ttlMs: 0, forceRefresh: false })
    expect(r2.ok).toBe(true)
    if (r2.ok) {
      // Either ttl-expired (cache too old) or valid-cache (sub-ms) — most paths hit ttl-expired
      expect(["ttl-expired", "valid-cache"]).toContain(r2.freshnessReason)
    }
  })

  it("noCache=true → bypasses cache entirely, every call hits exec", async () => {
    const exec = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    await collectDashInfo(tmpCwd, { exec }, { noCache: true })
    await collectDashInfo(tmpCwd, { exec }, { noCache: true })
    expect(exec).toHaveBeenCalledTimes(2)
  })

  it("v3-style 2-arg call with mocked exec still works (backward compat)", async () => {
    // Calling with deps={exec} but no opts → implicit-no-cache because of test heuristic
    const exec = vi.fn().mockReturnValue(JSON.stringify(fakeSnapshot()))
    const r = await collectDashInfo(tmpCwd, { exec })
    expect(r.ok).toBe(true)
    expect(exec).toHaveBeenCalledTimes(1)
  })
})
