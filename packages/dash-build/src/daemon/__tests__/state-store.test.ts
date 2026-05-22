import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../state/store.js"

let dir: string
let file: string
const liveStores: Store[] = []

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-state-"))
  file = join(dir, "state.json")
  liveStores.length = 0
})

afterEach(async () => {
  // Drain any in-flight persist() each store may have queued via fire-and-forget
  // mutation paths (addPrompt schedules persist async). Without this, rm races
  // against the tmp file inside dir → ENOTEMPTY.
  for (const s of liveStores) {
    try {
      await s.persist()
    } catch {
      /* swallow — we're tearing down */
    }
  }
  // Yield to drain any chained microtask persists
  await new Promise((r) => setImmediate(r))
  await new Promise((r) => setImmediate(r))
  // Retry rmdir — guards against any remaining write-in-flight on slow CI.
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
})

async function loadStore(): Promise<Store> {
  const s = await Store.load({ path: file })
  liveStores.push(s)
  return s
}

describe("Store", () => {
  it("creates a fresh state when no file exists", async () => {
    const store = await loadStore()
    const snap = store.snapshot()
    expect(snap.auth.openai.connected).toBe(false)
    expect(snap.prompts).toHaveLength(0)
  })

  it("persists atomically and reloads identically", async () => {
    const store = await loadStore()
    await store.setAuth("openai", { connected: true, user: "irfan@dash.id" })
    const reloaded = await loadStore()
    expect(reloaded.getAuth().openai.user).toBe("irfan@dash.id")
    expect(reloaded.getAuth().openai.connected).toBe(true)
  })

  it("addPrompt prepends to the prompts list", async () => {
    const store = await loadStore()
    const a = store.addPrompt({ text: "first" })
    const b = store.addPrompt({ text: "second" })
    const recent = store.getPrompts(10)
    expect(recent[0]!.id).toBe(b.id)
    expect(recent[1]!.id).toBe(a.id)
    expect(a.status).toBe("queued")
  })

  it("getPrompts respects the limit argument", async () => {
    const store = await loadStore()
    for (let i = 0; i < 5; i++) store.addPrompt({ text: `p${i}` })
    expect(store.getPrompts(2)).toHaveLength(2)
    expect(store.getPrompts(100)).toHaveLength(5)
  })

  it("updatePromptStatus advances state and patches fields", async () => {
    const store = await loadStore()
    const p = store.addPrompt({ text: "ship it" })
    const updated = await store.updatePromptStatus(p.id, "pr_created", {
      prUrl: "https://github.com/dash/x/pull/1",
    })
    expect(updated?.status).toBe("pr_created")
    expect(updated?.prUrl).toBe("https://github.com/dash/x/pull/1")
  })

  it("setActiveRepo updates workspace", async () => {
    const store = await loadStore()
    await store.setActiveRepo("dash/halo-dash-fe", "main")
    expect(store.getWorkspace().activeRepo).toBe("dash/halo-dash-fe")
    expect(store.getWorkspace().activeBranch).toBe("main")
  })

  it("recovers from a corrupted state file", async () => {
    await writeFile(file, "{ this is not valid json", "utf8")
    const store = await loadStore()
    expect(store.getPrompts(10)).toHaveLength(0)
    // And the file is now valid JSON again
    const raw = await readFile(file, "utf8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it("migrates legacy anthropic auth state into openai auth", async () => {
    await writeFile(
      file,
      JSON.stringify({
        version: "0.1.0",
        startedAt: "2026-05-21T00:00:00.000Z",
        auth: {
          anthropic: { connected: true, user: "legacy-user" },
          github: { connected: false, repos: [] },
        },
        prompts: [],
        workspace: { activeRepo: "dash/halo-dash-fe", activeBranch: "main" },
      }),
      "utf8",
    )
    const store = await loadStore()
    expect(store.getAuth().openai.connected).toBe(true)
    expect(store.getAuth().openai.user).toBe("legacy-user")
    expect(store.getWorkspace().activeRepo).toBe("dash/halo-dash-fe")
  })

  it("atomic write does not leave .tmp files behind", async () => {
    const store = await loadStore()
    await store.persist()
    await store.persist()
    const { readdir } = await import("node:fs/promises")
    const entries = await readdir(dir)
    const tmps = entries.filter((e) => e.includes(".tmp-"))
    expect(tmps).toHaveLength(0)
  })
})
