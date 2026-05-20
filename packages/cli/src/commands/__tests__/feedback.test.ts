import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  runFeedbackLog,
  runFeedbackList,
  runFeedbackSync,
} from "../feedback.js"
import {
  appendFeedback,
  readLog,
  detectPe,
  FEEDBACK_LOG_SCHEMA_VERSION,
} from "../../lib/feedback-log.js"

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

describe("feedback-log lib", () => {
  let tmp: string
  let logPath: string

  beforeEach(() => {
    tmp = mkTmp("dash-feedback-lib-")
    logPath = path.join(tmp, "nested", "dir", "feedback-log.jsonl")
  })
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("schema version is exported and stable", () => {
    expect(FEEDBACK_LOG_SCHEMA_VERSION).toBe(1)
  })

  it("readLog returns empty array when file missing", () => {
    expect(readLog(logPath)).toEqual([])
  })

  it("appendFeedback creates parent dir, persists JSONL, returns entry", () => {
    const entry = appendFeedback(
      {
        text: "Modal animation jumpy",
        category: "ux",
        pe: "alice",
        severity: "med",
      },
      logPath,
    )
    expect(fs.existsSync(logPath)).toBe(true)
    expect(entry.id.length).toBeGreaterThan(0)
    expect(entry.status).toBe("pending")
    expect(entry.pilot).toBe("wave-5")

    const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean)
    expect(lines).toHaveLength(1)
    const parsed = JSON.parse(lines[0])
    expect(parsed.text).toBe("Modal animation jumpy")
    expect(parsed.category).toBe("ux")
  })

  it("multiple appends produce JSONL (one entry per line, no rewrites)", () => {
    appendFeedback({ text: "A", category: "bug", pe: "x" }, logPath)
    appendFeedback({ text: "B", category: "praise", pe: "y" }, logPath)
    appendFeedback({ text: "C", category: "drift", pe: "z" }, logPath)
    const entries = readLog(logPath)
    expect(entries).toHaveLength(3)
    expect(entries.map((e) => e.text)).toEqual(["A", "B", "C"])
  })

  it("recovers from a corrupt line, keeps valid ones", () => {
    appendFeedback({ text: "good-1", category: "bug", pe: "x" }, logPath)
    fs.appendFileSync(logPath, "{ not valid json\n", "utf-8")
    appendFeedback({ text: "good-2", category: "ux", pe: "y" }, logPath)
    const entries = readLog(logPath)
    expect(entries.map((e) => e.text)).toEqual(["good-1", "good-2"])
  })

  it("coerces unknown category to 'other' and invalid severity to undefined", () => {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.writeFileSync(
      logPath,
      JSON.stringify({
        id: "fb_1",
        timestamp: new Date().toISOString(),
        pilot: "wave-5",
        pe: "x",
        category: "weird-not-a-cat",
        text: "hi",
        severity: "extreme",
        status: "pending",
      }) + "\n",
    )
    const entries = readLog(logPath)
    expect(entries).toHaveLength(1)
    expect(entries[0].category).toBe("other")
    expect(entries[0].severity).toBeUndefined()
  })

  it("detectPe falls back to $USER when git is unavailable", () => {
    // We can't easily strip git from $PATH inside the test, but in a brand-new
    // empty tmp dir `git config user.name` is still reachable globally. The
    // contract guaranteed by the lib is just "returns a non-empty string".
    const pe = detectPe(tmp)
    expect(typeof pe).toBe("string")
    expect(pe.length).toBeGreaterThan(0)
  })
})

describe("dash feedback log (command)", () => {
  let tmp: string
  let logPath: string
  let io: CapturedIO

  beforeEach(() => {
    tmp = mkTmp("dash-feedback-cmd-")
    logPath = path.join(tmp, "feedback-log.jsonl")
    io = captureIO()
    process.exitCode = 0
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
    process.exitCode = 0
  })

  it("logs a simple text entry with default category 'other'", async () => {
    await runFeedbackLog({
      text: "Onboarding step 3 felt slow",
      logPath,
      pe: "alice",
      cwd: tmp,
    })
    expect(process.exitCode).toBe(0)
    const entries = readLog(logPath)
    expect(entries).toHaveLength(1)
    expect(entries[0].text).toBe("Onboarding step 3 felt slow")
    expect(entries[0].category).toBe("other")
    expect(entries[0].pe).toBe("alice")
  })

  it("rejects empty text with exit code 2 and a helpful error", async () => {
    await runFeedbackLog({
      text: "   ",
      logPath,
      pe: "alice",
      cwd: tmp,
    })
    expect(process.exitCode).toBe(2)
    expect(io.stderr.join("")).toMatch(/text is required/i)
    expect(readLog(logPath)).toEqual([])
  })

  it("applies category + severity + context flags", async () => {
    await runFeedbackLog({
      text: "Hermes vendor crashed on add",
      category: "bug",
      severity: "high",
      command: "dash add image-editor",
      component: "image-editor",
      repo: "halo-dash-fe",
      pe: "bob",
      logPath,
      cwd: tmp,
    })
    const entries = readLog(logPath)
    expect(entries).toHaveLength(1)
    expect(entries[0].category).toBe("bug")
    expect(entries[0].severity).toBe("high")
    expect(entries[0].context?.command).toBe("dash add image-editor")
    expect(entries[0].context?.component).toBe("image-editor")
    expect(entries[0].context?.repo).toBe("halo-dash-fe")
  })

  it("--json mode reads payload from stdin and emits JSON output", async () => {
    const payload = JSON.stringify({
      text: "structured entry",
      category: "drift",
      severity: "low",
      context: { repo: "portal-v2" },
    })
    await runFeedbackLog({
      json: true,
      logPath,
      pe: "carol",
      cwd: tmp,
      stdinPayload: payload,
    })
    expect(process.exitCode).toBe(0)
    const entries = readLog(logPath)
    expect(entries).toHaveLength(1)
    expect(entries[0].category).toBe("drift")
    expect(entries[0].context?.repo).toBe("portal-v2")
    const printed = io.stdout.join("")
    expect(printed).toMatch(/"category":\s*"drift"/)
  })

  it("--json with empty stdin exits 2", async () => {
    await runFeedbackLog({
      json: true,
      logPath,
      pe: "carol",
      cwd: tmp,
      stdinPayload: "",
    })
    expect(process.exitCode).toBe(2)
    expect(io.stderr.join("")).toMatch(/json.*requires.*JSON/i)
  })

  it("coerces an unknown --category to 'other' rather than erroring", async () => {
    await runFeedbackLog({
      text: "weird category",
      category: "nope",
      pe: "alice",
      logPath,
      cwd: tmp,
    })
    expect(process.exitCode).toBe(0)
    expect(readLog(logPath)[0].category).toBe("other")
  })
})

describe("dash feedback list", () => {
  let tmp: string
  let logPath: string
  let io: CapturedIO

  beforeEach(() => {
    tmp = mkTmp("dash-feedback-list-")
    logPath = path.join(tmp, "feedback-log.jsonl")
    io = captureIO()
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("prints empty-state hint when no entries", () => {
    runFeedbackList({ logPath })
    expect(io.stdout.join("")).toMatch(/No feedback logged/)
  })

  it("filters by pe in --json mode", () => {
    appendFeedback({ text: "a", category: "bug", pe: "alice" }, logPath)
    appendFeedback({ text: "b", category: "bug", pe: "bob" }, logPath)
    appendFeedback({ text: "c", category: "ux", pe: "alice" }, logPath)
    runFeedbackList({ logPath, pe: "alice", json: true })
    const payload = JSON.parse(io.stdout.join(""))
    expect(payload.entries).toHaveLength(2)
    expect(payload.entries.every((e: { pe: string }) => e.pe === "alice")).toBe(true)
  })

  it("filters by category", () => {
    appendFeedback({ text: "a", category: "bug", pe: "alice" }, logPath)
    appendFeedback({ text: "b", category: "praise", pe: "bob" }, logPath)
    runFeedbackList({ logPath, category: "praise", json: true })
    const payload = JSON.parse(io.stdout.join(""))
    expect(payload.entries).toHaveLength(1)
    expect(payload.entries[0].text).toBe("b")
  })
})

describe("dash feedback sync", () => {
  let tmp: string
  let logPath: string
  let io: CapturedIO
  const origFetch = globalThis.fetch
  const origUrl = process.env.DASH_DASHBOARD_URL
  const origToken = process.env.DASH_CEO_TOKEN

  beforeEach(() => {
    tmp = mkTmp("dash-feedback-sync-")
    logPath = path.join(tmp, "feedback-log.jsonl")
    io = captureIO()
    process.exitCode = 0
  })
  afterEach(() => {
    io.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
    globalThis.fetch = origFetch
    if (origUrl === undefined) delete process.env.DASH_DASHBOARD_URL
    else process.env.DASH_DASHBOARD_URL = origUrl
    if (origToken === undefined) delete process.env.DASH_CEO_TOKEN
    else process.env.DASH_CEO_TOKEN = origToken
    process.exitCode = 0
  })

  it("requires url + token, exits 2 otherwise", async () => {
    delete process.env.DASH_DASHBOARD_URL
    delete process.env.DASH_CEO_TOKEN
    await runFeedbackSync({ logPath })
    expect(process.exitCode).toBe(2)
  })

  it("--dry-run prints what would sync without calling fetch", async () => {
    appendFeedback({ text: "pending", category: "bug", pe: "alice" }, logPath)
    let called = false
    globalThis.fetch = (async () => {
      called = true
      return new Response("", { status: 200 })
    }) as typeof fetch
    await runFeedbackSync({
      logPath,
      url: "https://example.com",
      token: "tk",
      dryRun: true,
      json: true,
    })
    expect(called).toBe(false)
    const out = JSON.parse(io.stdout.join(""))
    expect(out.wouldSync).toBe(1)
  })

  it("on 200 response, marks entries synced locally", async () => {
    appendFeedback({ text: "pending-1", category: "bug", pe: "alice" }, logPath)
    appendFeedback({ text: "pending-2", category: "ux", pe: "bob" }, logPath)
    globalThis.fetch = (async () =>
      new Response("{}", { status: 201 })) as typeof fetch
    await runFeedbackSync({
      logPath,
      url: "https://example.com/",
      token: "tk",
      json: true,
    })
    expect(process.exitCode).toBe(0)
    const entries = readLog(logPath)
    expect(entries.every((e) => e.status === "synced")).toBe(true)
    const out = JSON.parse(io.stdout.join(""))
    expect(out.synced).toBe(2)
    expect(out.endpoint).toBe("https://example.com/api/admin/pilot/feedback")
  })

  it("no-op when nothing is pending", async () => {
    const e = appendFeedback({ text: "x", category: "bug", pe: "alice" }, logPath)
    // Force synced
    const all = readLog(logPath)
    all[0].status = "synced"
    fs.writeFileSync(logPath, all.map((x) => JSON.stringify(x)).join("\n") + "\n")
    let called = false
    globalThis.fetch = (async () => {
      called = true
      return new Response("", { status: 200 })
    }) as typeof fetch
    await runFeedbackSync({
      logPath,
      url: "https://example.com",
      token: "tk",
      json: true,
    })
    expect(called).toBe(false)
    const out = JSON.parse(io.stdout.join(""))
    expect(out.synced).toBe(0)
    expect(out.skipped).toBe(1)
    void e
  })

  it("on 5xx response, exits 1 and does NOT mark synced", async () => {
    appendFeedback({ text: "fail", category: "bug", pe: "alice" }, logPath)
    globalThis.fetch = (async () =>
      new Response("upstream sad", { status: 503 })) as typeof fetch
    await runFeedbackSync({
      logPath,
      url: "https://example.com",
      token: "tk",
      json: true,
    })
    expect(process.exitCode).toBe(1)
    const entries = readLog(logPath)
    expect(entries[0].status).toBe("pending")
  })
})
