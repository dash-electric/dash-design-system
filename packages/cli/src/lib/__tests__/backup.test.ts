import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  startBackup,
  backupFile,
  commitBackup,
  restoreBackup,
} from "../backup.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-backup-test-"))
}

describe("backup", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp()
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("startBackup creates a session with .dash-backup/<id> rootDir", () => {
    const session = startBackup(tmp)
    expect(session.id).toBeTruthy()
    expect(session.rootDir).toContain(".dash-backup")
    expect(session.rootDir).toContain(session.id)
    expect(session.files).toEqual([])
    commitBackup(session, true)
  })

  it("backupFile copies an existing file into the backup tree", () => {
    const target = path.join(tmp, "src", "Button.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, "original content")

    const session = startBackup(tmp)
    backupFile(session, target)

    expect(session.files).toHaveLength(1)
    expect(fs.existsSync(session.files[0].backup)).toBe(true)
    expect(fs.readFileSync(session.files[0].backup, "utf-8")).toBe("original content")

    commitBackup(session, true)
  })

  it("backupFile is a no-op when target does not exist", () => {
    const session = startBackup(tmp)
    backupFile(session, path.join(tmp, "missing.tsx"))
    expect(session.files).toHaveLength(0)
    commitBackup(session, true)
  })

  it("backs up multiple files in correct relative tree", () => {
    const f1 = path.join(tmp, "a", "one.tsx")
    const f2 = path.join(tmp, "b", "nested", "two.tsx")
    fs.mkdirSync(path.dirname(f1), { recursive: true })
    fs.mkdirSync(path.dirname(f2), { recursive: true })
    fs.writeFileSync(f1, "one")
    fs.writeFileSync(f2, "two")

    const session = startBackup(tmp)
    backupFile(session, f1)
    backupFile(session, f2)

    expect(session.files).toHaveLength(2)
    expect(fs.readFileSync(session.files[0].backup, "utf-8")).toBe("one")
    expect(fs.readFileSync(session.files[1].backup, "utf-8")).toBe("two")
    expect(session.files[1].backup).toContain(path.join("b", "nested", "two.tsx"))

    commitBackup(session, true)
  })

  it("backupFile is idempotent for same target (preserves original)", () => {
    const target = path.join(tmp, "f.tsx")
    fs.writeFileSync(target, "v1")

    const session = startBackup(tmp)
    backupFile(session, target)
    // Simulate first write
    fs.writeFileSync(target, "v2")
    backupFile(session, target) // should be a no-op

    expect(session.files).toHaveLength(1)
    expect(fs.readFileSync(session.files[0].backup, "utf-8")).toBe("v1")

    commitBackup(session, true)
  })

  it("commitBackup with cleanup=true removes the backup tree", () => {
    const target = path.join(tmp, "f.tsx")
    fs.writeFileSync(target, "v1")

    const session = startBackup(tmp)
    backupFile(session, target)
    expect(fs.existsSync(session.rootDir)).toBe(true)

    commitBackup(session, true)
    expect(fs.existsSync(session.rootDir)).toBe(false)
  })

  it("commitBackup with cleanup=false preserves the backup tree", () => {
    const target = path.join(tmp, "f.tsx")
    fs.writeFileSync(target, "v1")

    const session = startBackup(tmp)
    backupFile(session, target)
    commitBackup(session, false)

    expect(fs.existsSync(session.rootDir)).toBe(true)
    // Clean up manually so afterEach can rm the parent tmp
    fs.rmSync(session.rootDir, { recursive: true, force: true })
  })

  it("restoreBackup reverts modified files to original content", () => {
    const target = path.join(tmp, "f.tsx")
    fs.writeFileSync(target, "original")

    const session = startBackup(tmp)
    backupFile(session, target)
    // Simulate destructive write
    fs.writeFileSync(target, "MODIFIED")
    expect(fs.readFileSync(target, "utf-8")).toBe("MODIFIED")

    restoreBackup(session)
    expect(fs.readFileSync(target, "utf-8")).toBe("original")
  })

  it("restoreBackup handles missing backup directory gracefully", () => {
    const session = startBackup(tmp)
    // Manually nuke rootDir before any backup occurred
    if (fs.existsSync(session.rootDir)) {
      fs.rmSync(session.rootDir, { recursive: true, force: true })
    }
    expect(() => restoreBackup(session)).not.toThrow()
  })

  it("restoreBackup reverts multiple files at once", () => {
    const f1 = path.join(tmp, "one.tsx")
    const f2 = path.join(tmp, "two.tsx")
    fs.writeFileSync(f1, "orig1")
    fs.writeFileSync(f2, "orig2")

    const session = startBackup(tmp)
    backupFile(session, f1)
    backupFile(session, f2)
    fs.writeFileSync(f1, "MOD1")
    fs.writeFileSync(f2, "MOD2")

    restoreBackup(session)
    expect(fs.readFileSync(f1, "utf-8")).toBe("orig1")
    expect(fs.readFileSync(f2, "utf-8")).toBe("orig2")
  })
})
