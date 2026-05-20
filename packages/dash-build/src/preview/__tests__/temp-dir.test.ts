import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  cleanupOld,
  cleanupOne,
  prepareTempDir,
  resolvePreviewDir,
  sanitize,
} from "../temp-dir.js"

describe("preview/temp-dir", () => {
  let root: string

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "dash-preview-test-"))
  })

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true })
  })

  it("creates a fresh preview dir, idempotent on reuse", async () => {
    const dir = await prepareTempDir("abc123", root)
    expect(dir).toBe(path.join(root, "abc123"))
    expect((await fs.stat(dir)).isDirectory()).toBe(true)
    // second call must not throw
    const again = await prepareTempDir("abc123", root)
    expect(again).toBe(dir)
  })

  it("sanitizes promptId, blocking path traversal", async () => {
    // The dangerous input — must collapse to a single safe segment
    expect(sanitize("../../etc/passwd")).toBe("______etc_passwd")
    expect(sanitize("/abs/path")).toBe("_abs_path")
    expect(sanitize("a/../b")).toBe("a____b")
    // resolvePreviewDir must always stay under root
    const resolved = resolvePreviewDir("../../etc/passwd", root)
    expect(resolved.startsWith(root + path.sep) || resolved === root).toBe(true)
  })

  it("collapses empty / non-ascii promptId to a single underscore", () => {
    expect(sanitize("")).toBe("_")
    expect(sanitize("///")).toBe("___")
    expect(sanitize("привет")).toBe("______")
  })

  it("truncates promptId to 64 chars", () => {
    const long = "a".repeat(200)
    expect(sanitize(long)).toHaveLength(64)
  })

  it("creates parent directories when root does not exist yet", async () => {
    const deep = path.join(root, "does", "not", "exist", "yet")
    const dir = await prepareTempDir("xyz", deep)
    expect((await fs.stat(dir)).isDirectory()).toBe(true)
  })

  it("cleanupOld removes only dirs older than maxAge", async () => {
    // Recent: created now
    const fresh = await prepareTempDir("fresh", root)
    // Stale: created with mtime back-dated 2h
    const stale = await prepareTempDir("stale", root)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await fs.utimes(stale, twoHoursAgo, twoHoursAgo)

    const cleaned = await cleanupOld(60 * 60 * 1000, root)
    expect(cleaned).toBe(1)
    // fresh survives
    await expect(fs.stat(fresh)).resolves.toBeTruthy()
    await expect(fs.stat(stale)).rejects.toThrow()

    // cleanupOne also works on the survivor
    const removed = await cleanupOne("fresh", root)
    expect(removed).toBe(true)
    await expect(fs.stat(fresh)).rejects.toThrow()
  })
})
