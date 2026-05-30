import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runGapReport } from "../gap.js"
import {
  appendGap,
  readQueue,
  writeQueue,
  defaultQueuePath,
  GAP_QUEUE_SCHEMA_VERSION,
} from "../../lib/gap-queue.js"

function mkTmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

type CapturedIO = {
  stdout: string[]
  stderr: string[]
  restore: () => void
}

function captureIO(): CapturedIO {
  const stdout: string[] = []
  const stderr: string[] = []
  const origStdout = process.stdout.write
  const origLog = console.log
  const origErr = console.error
  process.stdout.write = ((chunk: string | Uint8Array) => {
    stdout.push(
      typeof chunk === "string" ? chunk : Buffer.from(chunk).toString(),
    )
    return true
  }) as typeof process.stdout.write
  console.log = (...args: unknown[]) => {
    stdout.push(args.map(String).join(" ") + "\n")
  }
  console.error = (...args: unknown[]) => {
    stderr.push(args.map(String).join(" ") + "\n")
  }
  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = origStdout
      console.log = origLog
      console.error = origErr
    },
  }
}

describe("gap-queue lib", () => {
  let tmp: string
  let queuePath: string

  beforeEach(() => {
    tmp = mkTmp("dash-gap-lib-")
    queuePath = path.join(tmp, "nested", "dir", "gap-queue.json")
  })
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("readQueue returns an empty queue when file missing", () => {
    const q = readQueue(queuePath)
    expect(q.schemaVersion).toBe(GAP_QUEUE_SCHEMA_VERSION)
    expect(q.entries).toEqual([])
  })

  it("appendGap creates parent dir and persists entry", () => {
    const entry = appendGap(
      {
        description: "no image-editor in DS",
        severity: "high",
        repo: "halo-dash-fe",
        prompt: "build a proof edit modal",
      },
      queuePath,
    )
    expect(fs.existsSync(queuePath)).toBe(true)
    expect(entry.id.length).toBeGreaterThan(0)
    expect(entry.status).toBe("pending")
    const q = readQueue(queuePath)
    expect(q.entries).toHaveLength(1)
    expect(q.entries[0].description).toBe("no image-editor in DS")
    expect(q.entries[0].severity).toBe("high")
    expect(q.entries[0].repo).toBe("halo-dash-fe")
  })

  it("recovers gracefully from corrupt JSON in queue file", () => {
    fs.mkdirSync(path.dirname(queuePath), { recursive: true })
    fs.writeFileSync(queuePath, "{ not valid json")
    const q = readQueue(queuePath)
    expect(q.entries).toEqual([])
  })

  it("drops malformed entries while keeping valid ones", () => {
    fs.mkdirSync(path.dirname(queuePath), { recursive: true })
    fs.writeFileSync(
      queuePath,
      JSON.stringify({
        schemaVersion: 1,
        entries: [
          { id: "x", description: "ok", created_at: "2026-05-20T00:00:00Z" },
          { description: "missing id" },
          null,
          "string entry",
        ],
      }),
    )
    const q = readQueue(queuePath)
    expect(q.entries).toHaveLength(1)
    expect(q.entries[0].id).toBe("x")
    expect(q.entries[0].severity).toBe("medium") // default fill-in
    expect(q.entries[0].status).toBe("pending")
  })
})

describe("dashkit gap report — log mode", () => {
  let tmp: string
  let queuePath: string
  let io: CapturedIO
  let prevExit: number | undefined

  beforeEach(() => {
    tmp = mkTmp("dash-gap-log-")
    queuePath = path.join(tmp, "queue.json")
    io = captureIO()
    prevExit = process.exitCode
    process.exitCode = 0
  })
  afterEach(() => {
    io.restore()
    process.exitCode = prevExit
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("appends entry and grows the queue", async () => {
    await runGapReport({
      description: "first gap",
      severity: "medium",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
      json: true,
    })
    await runGapReport({
      description: "second gap",
      severity: "high",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
      json: true,
    })
    const q = readQueue(queuePath)
    expect(q.entries).toHaveLength(2)
    expect(q.entries[0].description).toBe("first gap")
    expect(q.entries[1].severity).toBe("high")
  })

  it("auto-detects repo from package.json name in cwd", async () => {
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "halo-dash-fe" }),
    )
    await runGapReport({
      description: "image editor missing",
      severity: "high",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
      json: true,
    })
    const q = readQueue(queuePath)
    expect(q.entries[0].repo).toBe("halo-dash-fe")
  })

  it("--repo flag overrides detected repo", async () => {
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "halo-dash-fe" }),
    )
    await runGapReport({
      description: "x",
      severity: "low",
      repo: "backoffice",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
      json: true,
    })
    const q = readQueue(queuePath)
    expect(q.entries[0].repo).toBe("backoffice")
  })

  it("rejects invalid --severity value with exit 2", async () => {
    await runGapReport({
      description: "x",
      severity: "blocker",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
    })
    expect(process.exitCode).toBe(2)
    expect(io.stderr.join("")).toContain("invalid --severity")
    expect(readQueue(queuePath).entries).toHaveLength(0)
  })

  it("requires a description (exit 2 otherwise)", async () => {
    await runGapReport({
      description: "",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
    })
    expect(process.exitCode).toBe(2)
    expect(io.stderr.join("")).toContain("description is required")
  })

  it("non-interactive mode defaults severity to medium", async () => {
    await runGapReport({
      description: "no severity flag",
      queuePath,
      nonInteractive: true,
      cwd: tmp,
      json: true,
    })
    expect(readQueue(queuePath).entries[0].severity).toBe("medium")
  })
})

describe("dashkit gap report — list mode", () => {
  let tmp: string
  let queuePath: string
  let io: CapturedIO

  beforeEach(() => {
    tmp = mkTmp("dash-gap-list-")
    queuePath = path.join(tmp, "queue.json")
    io = captureIO()
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("prints empty-state message when queue is empty", async () => {
    await runGapReport({ list: true, queuePath })
    const out = io.stdout.join("")
    expect(out).toContain("No gaps logged")
  })

  it("prints table rows for 3 entries", async () => {
    for (let i = 0; i < 3; i++) {
      appendGap(
        {
          description: `desc-${i}`,
          severity: i === 0 ? "high" : "medium",
          repo: "halo-dash-fe",
          prompt: null,
        },
        queuePath,
      )
    }
    await runGapReport({ list: true, queuePath })
    const out = io.stdout.join("")
    expect(out).toContain("desc-0")
    expect(out).toContain("desc-1")
    expect(out).toContain("desc-2")
    expect(out).toContain("halo-dash-fe")
    expect(out).toContain("3 entries pending")
  })

  it("--list --json emits parseable JSON", async () => {
    appendGap(
      { description: "x", severity: "low", repo: null, prompt: null },
      queuePath,
    )
    await runGapReport({ list: true, json: true, queuePath })
    const parsed = JSON.parse(io.stdout.join(""))
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.entries).toHaveLength(1)
  })
})

describe("dashkit gap report — clear mode", () => {
  let tmp: string
  let queuePath: string
  let io: CapturedIO

  beforeEach(() => {
    tmp = mkTmp("dash-gap-clear-")
    queuePath = path.join(tmp, "queue.json")
    io = captureIO()
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("clears the queue with --yes (skips confirm)", async () => {
    appendGap(
      { description: "a", severity: "low", repo: null, prompt: null },
      queuePath,
    )
    appendGap(
      { description: "b", severity: "low", repo: null, prompt: null },
      queuePath,
    )
    await runGapReport({ clear: true, yes: true, queuePath })
    expect(readQueue(queuePath).entries).toHaveLength(0)
    expect(io.stdout.join("")).toContain("Queue cleared")
  })

  it("handles empty queue gracefully", async () => {
    await runGapReport({ clear: true, queuePath, json: true })
    const out = JSON.parse(io.stdout.join(""))
    expect(out.cleared).toBe(0)
  })
})

describe("dashkit gap report — export mode", () => {
  let tmp: string
  let queuePath: string
  let io: CapturedIO

  beforeEach(() => {
    tmp = mkTmp("dash-gap-export-")
    queuePath = path.join(tmp, "queue.json")
    io = captureIO()
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("writes the queue JSON to the requested path", async () => {
    appendGap(
      {
        description: "image editor missing",
        severity: "high",
        repo: "halo-dash-fe",
        prompt: null,
      },
      queuePath,
    )
    const target = path.join(tmp, "out", "snapshot.json")
    await runGapReport({
      export: target,
      queuePath,
      cwd: tmp,
    })
    expect(fs.existsSync(target)).toBe(true)
    const parsed = JSON.parse(fs.readFileSync(target, "utf-8"))
    expect(parsed.entries).toHaveLength(1)
    expect(parsed.entries[0].description).toBe("image editor missing")
    expect(io.stdout.join("")).toContain("Exported 1 gap")
  })
})

describe("dashkit gap report — mode exclusivity", () => {
  let tmp: string
  let io: CapturedIO
  let prevExit: number | undefined

  beforeEach(() => {
    tmp = mkTmp("dash-gap-excl-")
    io = captureIO()
    prevExit = process.exitCode
    process.exitCode = 0
  })
  afterEach(() => {
    io.restore()
    process.exitCode = prevExit
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("errors when --list and --clear both passed", async () => {
    await runGapReport({
      list: true,
      clear: true,
      queuePath: path.join(tmp, "q.json"),
    })
    expect(process.exitCode).toBe(2)
    expect(io.stderr.join("")).toContain("mutually exclusive")
  })
})

describe("gap-queue defaultQueuePath", () => {
  it("points at ~/.dash/gap-queue.json", () => {
    const p = defaultQueuePath()
    expect(p).toContain(".dash")
    expect(p.endsWith("gap-queue.json")).toBe(true)
  })

  it("writeQueue + readQueue round-trips schema version", () => {
    const tmp = mkTmp("dash-gap-rt-")
    const qp = path.join(tmp, "q.json")
    writeQueue({ schemaVersion: 1, entries: [] }, qp)
    const parsed = JSON.parse(fs.readFileSync(qp, "utf-8"))
    expect(parsed.schemaVersion).toBe(1)
    fs.rmSync(tmp, { recursive: true, force: true })
  })
})
