import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store, isRealProject } from "../state/store.js"

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

  it("addPrompt creates a Project + Thread + Run mirror", async () => {
    const store = await loadStore()
    const p = store.addPrompt({ text: "build dashboard", repo: "dash/backoffice" })
    const projects = store.getProjects()
    expect(projects).toHaveLength(1)
    const project = projects[0]!
    expect(project.repoFullName).toBe("dash/backoffice")
    expect(project.mode).toBe("existing-repo")
    const threads = store.getThreads(project.id)
    expect(threads).toHaveLength(1)
    expect(threads[0]!.activeRunId).toBe(p.id)
    const runs = store.getRuns(threads[0]!.id)
    expect(runs).toHaveLength(1)
    expect(runs[0]!.id).toBe(p.id)
    expect(runs[0]!.status).toBe("queued")
    expect(runs[0]!.repo).toBe("dash/backoffice")
  })

  it("reuses the same Project + Thread for subsequent prompts on same repo", async () => {
    const store = await loadStore()
    const a = store.addPrompt({ text: "first", repo: "dash/portal-v2" })
    const b = store.addPrompt({ text: "second", repo: "dash/portal-v2" })
    expect(store.getProjects()).toHaveLength(1)
    const project = store.getProjects()[0]!
    const threads = store.getThreads(project.id)
    expect(threads).toHaveLength(1)
    const runs = store.getRuns(threads[0]!.id)
    expect(runs.map((r) => r.id).sort()).toEqual([a.id, b.id].sort())
    expect(threads[0]!.activeRunId).toBe(b.id)
  })

  it("Bug 3+4: bare prompt auto-creates an Unassigned phantom project that isRealProject rejects", async () => {
    const store = await loadStore()
    // No repo → store.ensureProjectInternal makes an "Unassigned" phantom.
    store.addPrompt({ text: "just a bare prompt, no repo" })
    const projects = store.getProjects()
    expect(projects).toHaveLength(1)
    const phantom = projects[0]!
    expect(phantom.name).toBe("Unassigned")
    expect(phantom.repoFullName).toBeNull()
    // The phantom must be filtered out of any user-facing list.
    expect(isRealProject(phantom)).toBe(false)
  })

  it("Bug 3+4: repo-backed project is a real project", async () => {
    const store = await loadStore()
    store.addPrompt({ text: "build dashboard", repo: "dash/backoffice" })
    const real = store.getProjects()[0]!
    expect(isRealProject(real)).toBe(true)
    // Mixed: only the repo-backed one survives the filter.
    store.addPrompt({ text: "bare" })
    const surviving = store.getProjects().filter(isRealProject)
    expect(surviving).toHaveLength(1)
    expect(surviving[0]!.repoFullName).toBe("dash/backoffice")
  })

  it("updatePromptStatus mirrors into Run + Thread", async () => {
    const store = await loadStore()
    const p = store.addPrompt({ text: "ship", repo: "dash/backoffice" })
    await store.updatePromptStatus(p.id, "awaiting_approval")
    const run = store.getRun(p.id)!
    expect(run.status).toBe("awaiting_approval")
    const thread = store.getThread(run.threadId)!
    expect(thread.status).toBe("preview_ready")
    await store.updatePromptStatus(p.id, "pr_created", { prUrl: "https://x/1" })
    expect(store.getRun(p.id)!.prUrl).toBe("https://x/1")
    expect(store.getThread(run.threadId)!.status).toBe("published")
  })

  it("setActiveRepo ensures a Project exists for the repo", async () => {
    const store = await loadStore()
    await store.setActiveRepo("dash/portal-v2", "main")
    const projects = store.getProjects()
    expect(projects).toHaveLength(1)
    expect(projects[0]!.repoFullName).toBe("dash/portal-v2")
  })

  it("setRunArtifact patches artifactDir + score", async () => {
    const store = await loadStore()
    const p = store.addPrompt({ text: "design", repo: "dash/backoffice" })
    const patched = await store.setRunArtifact(p.id, {
      artifactDir: "/tmp/run-x",
      contextPackRef: "/tmp/run-x/context.json",
      validationScore: 88,
    })
    expect(patched?.artifactDir).toBe("/tmp/run-x")
    expect(patched?.contextPackRef).toBe("/tmp/run-x/context.json")
    expect(patched?.validationScore).toBe(88)
  })

  it("migrates legacy prompts[] (no projects/threads/runs) lossless and idempotent", async () => {
    await writeFile(
      file,
      JSON.stringify({
        version: "0.1.0",
        startedAt: "2026-05-21T00:00:00.000Z",
        auth: {
          openai: { connected: false, user: null },
          github: { connected: false, repos: [] },
        },
        workspace: { activeRepo: null, activeBranch: null },
        prompts: [
          {
            id: "prm_legacy_a",
            text: "legacy one",
            repo: "dash/backoffice",
            branch: "main",
            status: "awaiting_approval",
            createdAt: "2026-05-20T01:00:00.000Z",
            updatedAt: "2026-05-20T01:05:00.000Z",
            prUrl: null,
            error: null,
          },
          {
            id: "prm_legacy_b",
            text: "legacy two",
            repo: "dash/portal-v2",
            branch: "main",
            status: "pr_created",
            createdAt: "2026-05-20T02:00:00.000Z",
            updatedAt: "2026-05-20T02:10:00.000Z",
            prUrl: "https://x/2",
            error: null,
          },
        ],
      }),
      "utf8",
    )
    const store = await loadStore()
    const snap1 = store.snapshot()
    expect(snap1.projects.map((p) => p.repoFullName).sort()).toEqual([
      "dash/backoffice",
      "dash/portal-v2",
    ])
    expect(snap1.runs).toHaveLength(2)
    const aRun = snap1.runs.find((r) => r.id === "prm_legacy_a")!
    expect(aRun.status).toBe("awaiting_approval")
    const bRun = snap1.runs.find((r) => r.id === "prm_legacy_b")!
    expect(bRun.prUrl).toBe("https://x/2")
    // Persist + reload → migration must not re-fire and must not duplicate.
    await store.persist()
    const reloaded = await loadStore()
    const snap2 = reloaded.snapshot()
    expect(snap2.projects.map((p) => p.id).sort()).toEqual(
      snap1.projects.map((p) => p.id).sort(),
    )
    expect(snap2.threads.map((t) => t.id).sort()).toEqual(
      snap1.threads.map((t) => t.id).sort(),
    )
    expect(snap2.runs.map((r) => r.id).sort()).toEqual(
      snap1.runs.map((r) => r.id).sort(),
    )
  })

  // ── Phase D1 — sandboxState persistence ──────────────────────────────────

  it("getSandboxState returns null for unknown repo on fresh state", async () => {
    const store = await loadStore()
    expect(store.getSandboxState("dash/backoffice")).toBeNull()
  })

  it("updateSandboxState creates entry, sets lastActivity, and persists", async () => {
    const store = await loadStore()
    const saved = await store.updateSandboxState("dash/backoffice", {
      state: "idle",
      clonePath: "/tmp/clone",
      shimCommitSha: "deadbeef",
      history: [
        { from: "clean", to: "cloned", at: "2026-05-25T00:00:00.000Z" },
      ],
    })
    expect(saved.state).toBe("idle")
    expect(saved.clonePath).toBe("/tmp/clone")
    expect(saved.shimCommitSha).toBe("deadbeef")
    expect(saved.lastActivity).toMatch(/T/)

    const reloaded = await loadStore()
    const got = reloaded.getSandboxState("dash/backoffice")!
    expect(got.state).toBe("idle")
    expect(got.shimCommitSha).toBe("deadbeef")
    expect(got.history).toHaveLength(1)
  })

  it("flips an old idle sandbox to stale on boot (≥7d)", async () => {
    const oldIso = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    await writeFile(
      file,
      JSON.stringify({
        version: "0.1.0",
        startedAt: oldIso,
        auth: {
          openai: { connected: false, user: null },
          github: { connected: false, repos: [] },
        },
        prompts: [],
        workspace: { activeRepo: null, activeBranch: null },
        projects: [],
        threads: [],
        runs: [],
        sandboxState: {
          "dash/backoffice": {
            repoSlug: "dash/backoffice",
            state: "idle",
            history: [],
            lastActivity: oldIso,
            runId: null,
            clonePath: "/tmp/old-clone",
            shimCommitSha: "abc",
          },
        },
      }),
      "utf8",
    )
    const store = await loadStore()
    const got = store.getSandboxState("dash/backoffice")!
    expect(got.state).toBe("stale")
    // Stale flip added a history entry.
    expect(got.history.at(-1)).toMatchObject({ from: "idle", to: "stale" })
  })

  it("does NOT flip recently-active idle sandbox", async () => {
    const recent = new Date(Date.now() - 60_000).toISOString()
    await writeFile(
      file,
      JSON.stringify({
        version: "0.1.0",
        startedAt: recent,
        auth: {
          openai: { connected: false, user: null },
          github: { connected: false, repos: [] },
        },
        prompts: [],
        workspace: { activeRepo: null, activeBranch: null },
        projects: [],
        threads: [],
        runs: [],
        sandboxState: {
          "dash/backoffice": {
            repoSlug: "dash/backoffice",
            state: "idle",
            history: [],
            lastActivity: recent,
            runId: null,
            clonePath: "/tmp/c",
            shimCommitSha: null,
          },
        },
      }),
      "utf8",
    )
    const store = await loadStore()
    expect(store.getSandboxState("dash/backoffice")?.state).toBe("idle")
  })

  it("normalizes a state.json that has no sandboxState field (legacy)", async () => {
    await writeFile(
      file,
      JSON.stringify({
        version: "0.1.0",
        startedAt: "2026-05-25T00:00:00.000Z",
        auth: {
          openai: { connected: false, user: null },
          github: { connected: false, repos: [] },
        },
        prompts: [],
        workspace: { activeRepo: null, activeBranch: null },
        projects: [],
        threads: [],
        runs: [],
      }),
      "utf8",
    )
    const store = await loadStore()
    expect(store.listSandboxStates()).toEqual([])
  })

  it("deleteSandboxState removes the entry and returns true once", async () => {
    const store = await loadStore()
    await store.updateSandboxState("dash/backoffice", {
      state: "idle",
      clonePath: "/tmp/c",
    })
    expect(await store.deleteSandboxState("dash/backoffice")).toBe(true)
    expect(await store.deleteSandboxState("dash/backoffice")).toBe(false)
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
