import { afterEach, beforeEach, describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  collectFingerprintParts,
  computeFingerprint,
  computeFingerprintSync,
} from "../lib/repo-fingerprint.js"

describe("repo-fingerprint", () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dash-fp-"))
  })

  afterEach(() => {
    try {
      fs.rmSync(tmp, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  })

  it("returns a stable hash for an empty (degraded) cwd", async () => {
    const fp1 = await computeFingerprint(tmp)
    const fp2 = await computeFingerprint(tmp)
    expect(fp1).toBe(fp2)
    expect(fp1).toMatch(/^degraded-[0-9a-f]{16}$/)
  })

  it("non-degraded fingerprint when package.json exists", async () => {
    fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "x" }))
    const fp = await computeFingerprint(tmp)
    expect(fp).toMatch(/^[0-9a-f]{16}$/)
    expect(fp.startsWith("degraded-")).toBe(false)
  })

  it("same files → same fingerprint across two calls", async () => {
    fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "y" }))
    fs.writeFileSync(path.join(tmp, "components.json"), "{}")
    const a = await computeFingerprint(tmp)
    const b = await computeFingerprint(tmp)
    expect(a).toBe(b)
  })

  it("changing package.json content changes fingerprint", async () => {
    fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "old" }))
    const before = await computeFingerprint(tmp)
    // Bump size + mtime
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "new-much-longer-name" }),
    )
    // Force a different mtime in case of fast FS
    const future = new Date(Date.now() + 5000)
    fs.utimesSync(path.join(tmp, "package.json"), future, future)
    const after = await computeFingerprint(tmp)
    expect(after).not.toBe(before)
  })

  it("adding a component file changes fingerprint", async () => {
    fs.writeFileSync(path.join(tmp, "package.json"), "{}")
    fs.mkdirSync(path.join(tmp, "src", "components"), { recursive: true })
    const before = await computeFingerprint(tmp)
    fs.writeFileSync(path.join(tmp, "src", "components", "Button.tsx"), "export {}")
    const after = await computeFingerprint(tmp)
    expect(after).not.toBe(before)
  })

  it("missing file → degraded but still hashable, never throws", async () => {
    const fp = await computeFingerprint(tmp)
    expect(typeof fp).toBe("string")
    expect(fp.length).toBeGreaterThan(0)
  })

  it("computeFingerprintSync matches computeFingerprint", async () => {
    fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "sync" }))
    const a = await computeFingerprint(tmp)
    const b = computeFingerprintSync(tmp)
    expect(a).toBe(b)
  })

  it("collectFingerprintParts surfaces per-file existence", () => {
    fs.writeFileSync(path.join(tmp, "package.json"), "{}")
    const parts = collectFingerprintParts(tmp)
    const pkg = parts.files.find((f) => f.rel === "package.json")!
    const overrides = parts.files.find((f) => f.rel === ".dash/skill-overrides.md")!
    expect(pkg.exists).toBe(true)
    expect(overrides.exists).toBe(false)
  })

  it("ignores node_modules / .next / dist when walking dirs", () => {
    fs.mkdirSync(path.join(tmp, "src", "components", "node_modules"), { recursive: true })
    fs.writeFileSync(
      path.join(tmp, "src", "components", "node_modules", "skipped.tsx"),
      "skip",
    )
    fs.writeFileSync(path.join(tmp, "src", "components", "real.tsx"), "real")
    const parts = collectFingerprintParts(tmp)
    const dir = parts.dirs.find((d) => d.rel === "src/components")!
    expect(dir.fileCount).toBe(1)
  })
})
