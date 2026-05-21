import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  BUDGETS,
  checkBundleSizes,
  reportResults,
} from "../check-bundle-size"

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dash-bundle-test-"))
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

async function writeBytes(file: string, size: number) {
  await fs.writeFile(path.join(tmpDir, file), Buffer.alloc(size, "x"))
}

describe("checkBundleSizes", () => {
  it("returns ok for all files within budget (exit 0 path)", async () => {
    await writeBytes("bin.js", 1_000)
    await writeBytes("daemon.js", 1_000)
    await writeBytes("index.js", 1_000)
    const results = await checkBundleSizes(tmpDir, {
      "dist/bin.js": 50_000,
      "dist/daemon.js": 200_000,
      "dist/index.js": 60_000,
    })
    expect(results.every((r) => r.status === "ok")).toBe(true)
    const { errors } = reportResults(results, () => {}, () => {})
    expect(errors).toHaveLength(0)
  })

  it("flags exceeded budgets (exit 1 path)", async () => {
    await writeBytes("bin.js", 100_000) // over budget
    const results = await checkBundleSizes(tmpDir, {
      "dist/bin.js": 50_000,
    })
    expect(results[0].status).toBe("exceeded")
    const errlog = vi.fn()
    const { errors } = reportResults(results, () => {}, errlog)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain("exceeds budget")
    expect(errlog).toHaveBeenCalled()
  })

  it("skips missing files instead of failing", async () => {
    const results = await checkBundleSizes(tmpDir, {
      "dist/nonexistent.js": 1_000,
    })
    expect(results[0].status).toBe("missing")
    expect(results[0].size).toBeNull()
    const { errors } = reportResults(results, () => {}, () => {})
    expect(errors).toHaveLength(0)
  })

  it("exposes the canonical BUDGETS map with expected entries", () => {
    expect(BUDGETS).toHaveProperty("dist/bin.js")
    expect(BUDGETS).toHaveProperty("dist/daemon.js")
    expect(BUDGETS).toHaveProperty("dist/index.js")
    // All budgets are positive byte counts
    for (const v of Object.values(BUDGETS)) {
      expect(v).toBeGreaterThan(0)
    }
  })
})
