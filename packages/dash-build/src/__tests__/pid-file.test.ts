import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  writePidFile,
  readPidFile,
  deletePidFile,
  isProcessAlive,
} from "../daemon/pid-file.js"

let tmpDir: string
let pidPath: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "dash-build-pid-"))
  pidPath = join(tmpDir, "daemon.pid")
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe("pid-file", () => {
  it("writes and reads PID", async () => {
    await writePidFile(12345, { path: pidPath })
    const pid = await readPidFile({ path: pidPath })
    expect(pid).toBe(12345)
  })

  it("returns null when file does not exist", async () => {
    const pid = await readPidFile({ path: pidPath })
    expect(pid).toBeNull()
  })

  it("deletes pid file", async () => {
    await writePidFile(99999, { path: pidPath })
    await deletePidFile({ path: pidPath })
    const pid = await readPidFile({ path: pidPath })
    expect(pid).toBeNull()
  })

  it("delete is a no-op if file missing", async () => {
    await expect(deletePidFile({ path: pidPath })).resolves.toBeUndefined()
  })

  it("returns null for corrupt content", async () => {
    await writePidFile(0, { path: pidPath })
    // Manually corrupt
    const { writeFile } = await import("node:fs/promises")
    await writeFile(pidPath, "not-a-pid", "utf8")
    const pid = await readPidFile({ path: pidPath })
    expect(pid).toBeNull()
  })

  it("creates nested directory if missing", async () => {
    const nested = join(tmpDir, "a", "b", "daemon.pid")
    await writePidFile(42, { path: nested })
    expect(await readPidFile({ path: nested })).toBe(42)
  })
})

describe("isProcessAlive", () => {
  it("returns true for current process", () => {
    expect(isProcessAlive(process.pid)).toBe(true)
  })

  it("returns false for impossible PID", () => {
    // PID 0 is invalid as a kill target on most platforms
    expect(isProcessAlive(99_999_999)).toBe(false)
  })
})
