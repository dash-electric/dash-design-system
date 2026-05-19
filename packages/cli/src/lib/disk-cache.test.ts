import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  diskCacheGet,
  diskCacheSet,
  diskCacheClear,
  diskCachePath,
} from "./disk-cache.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-cache-test-"))
}

describe("disk-cache", () => {
  let tmp: string
  const url = "http://localhost:3000"

  beforeEach(() => {
    tmp = mkTmp()
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("write+read roundtrip", () => {
    diskCacheSet(url, "button", { name: "button" }, { rootDir: tmp })
    const got = diskCacheGet<{ name: string }>(url, "button", { rootDir: tmp })
    expect(got).toEqual({ name: "button" })
  })

  it("returns undefined when missing", () => {
    expect(diskCacheGet(url, "missing", { rootDir: tmp })).toBeUndefined()
  })

  it("expires after TTL", () => {
    diskCacheSet(url, "button", { name: "button" }, { rootDir: tmp })
    // 0ms TTL → already expired
    const got = diskCacheGet(url, "button", { rootDir: tmp, ttlMs: 0 })
    expect(got).toBeUndefined()
  })

  it("respects enabled=false (no-op write + skip read)", () => {
    diskCacheSet(url, "button", { name: "button" }, { rootDir: tmp, enabled: false })
    const file = diskCachePath(url, "button", { rootDir: tmp })
    expect(fs.existsSync(file)).toBe(false)
  })

  it("uses different host directories per registry URL", () => {
    const url2 = "https://registry.example.com"
    diskCacheSet(url, "button", { v: 1 }, { rootDir: tmp })
    diskCacheSet(url2, "button", { v: 2 }, { rootDir: tmp })
    const a = diskCacheGet<{ v: number }>(url, "button", { rootDir: tmp })
    const b = diskCacheGet<{ v: number }>(url2, "button", { rootDir: tmp })
    expect(a?.v).toBe(1)
    expect(b?.v).toBe(2)
  })

  it("clear removes the cache dir", () => {
    diskCacheSet(url, "button", { v: 1 }, { rootDir: tmp })
    diskCacheClear({ rootDir: tmp })
    expect(fs.existsSync(tmp)).toBe(false)
  })

  it("survives a corrupt cache file", () => {
    const file = diskCachePath(url, "button", { rootDir: tmp })
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, "not json")
    expect(diskCacheGet(url, "button", { rootDir: tmp })).toBeUndefined()
  })
})
