import { existsSync } from "node:fs"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { SessionStore } from "../session-store.js"
import type { ClarificationQuestion } from "../types.js"

const QUESTIONS: ClarificationQuestion[] = [
  {
    id: "target-surface",
    text: "Where?",
    type: "single-choice",
    options: ["backoffice", "halo-dash-fe"],
    rationale: "Surface determines stack",
    required: true,
  },
  {
    id: "data-source",
    text: "Data?",
    type: "single-choice",
    options: ["GET /api", "mock"],
    rationale: "Drives fetch pattern",
    required: false,
  },
  {
    id: "voice-rule",
    text: "Mitra?",
    type: "yes-no",
    rationale: "Voice rule",
    required: true,
  },
]

describe("SessionStore", () => {
  let dir: string
  let store: SessionStore

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "dash-build-sessions-"))
    store = new SessionStore({ dir })
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it("create + retrieve a session", async () => {
    await store.create("p1", "tambahin export", QUESTIONS)
    const got = await store.get("p1")
    expect(got).not.toBeNull()
    expect(got!.promptId).toBe("p1")
    expect(got!.status).toBe("pending")
    expect(got!.originalPrompt).toBe("tambahin export")
  })

  it("returns null for unknown session", async () => {
    expect(await store.get("nope")).toBeNull()
  })

  it("answer() records value and persists", async () => {
    await store.create("p2", "x", QUESTIONS)
    await store.answer("p2", "data-source", "GET /api")
    const got = await store.get("p2")
    expect(got!.answers["data-source"]).toBe("GET /api")
  })

  it("status flips to 'answered' only after all required answered", async () => {
    await store.create("p3", "x", QUESTIONS)
    await store.answer("p3", "data-source", "mock") // optional only
    expect((await store.get("p3"))!.status).toBe("pending")
    await store.answer("p3", "target-surface", "backoffice")
    expect((await store.get("p3"))!.status).toBe("pending") // still missing voice-rule
    await store.answer("p3", "voice-rule", true)
    expect((await store.get("p3"))!.status).toBe("answered")
  })

  it("answer() throws on unknown question id", async () => {
    await store.create("p4", "x", QUESTIONS)
    await expect(store.answer("p4", "ghost", "x")).rejects.toThrow(/Unknown question/)
  })

  it("expire() flips pending sessions older than maxAgeMs", async () => {
    await store.create("p5", "x", QUESTIONS)
    // Backdate creation
    const session = (await store.get("p5"))!
    session.createdAt = new Date(Date.now() - 60 * 60_000).toISOString()
    const expired = await store.expire(30 * 60_000)
    expect(expired).toBe(1)
    expect((await store.get("p5"))!.status).toBe("expired")
  })

  it("expire() leaves fresh sessions alone", async () => {
    await store.create("p6", "x", QUESTIONS)
    const expired = await store.expire(30 * 60_000)
    expect(expired).toBe(0)
    expect((await store.get("p6"))!.status).toBe("pending")
  })

  it("persist + reload from disk roundtrip", async () => {
    await store.create("p7", "x", QUESTIONS)
    await store.answer("p7", "target-surface", "halo-dash-fe")

    // New store instance pointing at same dir
    const store2 = new SessionStore({ dir })
    const loaded = await store2.reload()
    expect(loaded).toBe(1)
    const got = await store2.get("p7")
    expect(got).not.toBeNull()
    expect(got!.answers["target-surface"]).toBe("halo-dash-fe")
  })

  it("delete() removes session from memory and disk", async () => {
    await store.create("p8", "x", QUESTIONS)
    await store.delete("p8")
    expect(await store.get("p8")).toBeNull()
    // No file left
    expect(existsSync(join(dir, "p8.json"))).toBe(false)
  })
})
