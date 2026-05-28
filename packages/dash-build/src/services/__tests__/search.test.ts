/**
 * Tests for the cross-corpus search service (`src/services/search.ts`).
 *
 * Coverage:
 *   - scoreField ranking buckets (prefix / word / substring / miss)
 *   - searchAll over an in-memory Store with a real temp runs root
 *   - File scanning + snippet generation
 *   - Empty / whitespace queries → empty list
 *   - Limit clamping
 *   - Dedupe stability (run + file results don't collide)
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { searchAll, scoreField, __testing } from "../search.js"

async function makeStore(): Promise<{ store: Store; statePath: string; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "dash-build-search-state-"))
  const statePath = join(dir, "state.json")
  const store = await Store.load({ path: statePath })
  return {
    store,
    statePath,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true })
    },
  }
}

async function makeRunsRoot(): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const root = await mkdtemp(join(tmpdir(), "dash-build-search-runs-"))
  return {
    root,
    cleanup: async () => {
      await rm(root, { recursive: true, force: true })
    },
  }
}

async function seedRunOnDisk(
  runsRoot: string,
  runId: string,
  files: Record<string, string>,
  summary?: { prompt?: string; explanation?: string },
): Promise<string> {
  const runDir = join(runsRoot, runId)
  await mkdir(runDir, { recursive: true })
  if (summary) {
    await writeFile(
      join(runDir, "run.json"),
      JSON.stringify({ runId, ...summary }, null, 2),
      "utf8",
    )
  }
  const filesDir = join(runDir, "files")
  await mkdir(filesDir, { recursive: true })
  for (const [relPath, content] of Object.entries(files)) {
    const dest = join(filesDir, relPath)
    await mkdir(join(dest, ".."), { recursive: true })
    await writeFile(dest, content, "utf8")
  }
  return runDir
}

describe("scoreField", () => {
  it("returns 3 for prefix matches", () => {
    expect(scoreField("Mitra dashboard", "mitra")).toBe(3)
  })
  it("returns 2 for exact-word matches", () => {
    expect(scoreField("Build a new dashboard", "dashboard")).toBe(2)
  })
  it("returns 1 for substring matches mid-word", () => {
    expect(scoreField("backoffice", "ackoff")).toBe(1)
  })
  it("returns 0 when there is no hit", () => {
    expect(scoreField("hello world", "zzz")).toBe(0)
  })
  it("is case-insensitive", () => {
    expect(scoreField("DASHBOARD", "dash")).toBe(3)
  })
  it("handles empty inputs", () => {
    expect(scoreField("", "x")).toBe(0)
    expect(scoreField("x", "")).toBe(0)
  })
})

describe("makeSnippet (internal helper)", () => {
  it("returns null when the needle is absent", () => {
    expect(__testing.makeSnippet("hello world", "absent")).toBeNull()
  })
  it("returns a single-line excerpt around the first hit", () => {
    const text =
      "Add a new auto-suspend rule to the backoffice mitra page so suspended drivers can be reinstated."
    const snippet = __testing.makeSnippet(text, "mitra")
    expect(snippet).toBeTruthy()
    expect(snippet!.toLowerCase()).toContain("mitra")
    expect(snippet!.includes("\n")).toBe(false)
  })
})

describe("searchAll", () => {
  let store: Store
  let runsRoot: string
  let cleanupStore: () => Promise<void>
  let cleanupRuns: () => Promise<void>

  beforeEach(async () => {
    const s = await makeStore()
    const r = await makeRunsRoot()
    store = s.store
    runsRoot = r.root
    cleanupStore = s.cleanup
    cleanupRuns = r.cleanup
  })

  afterEach(async () => {
    // Store.addPrompt fires persist() in the background. Wait for any
    // pending writes to flush before yanking the tmp dir out from under
    // them — otherwise rm racing with rename causes flaky ENOTEMPTY.
    try {
      await store.persist()
    } catch {
      /* defensive — cleanup runs regardless */
    }
    await cleanupStore()
    await cleanupRuns()
  })

  it("returns an empty list for an empty query", async () => {
    const res = await searchAll(store, { query: "" })
    expect(res).toEqual([])
  })

  it("returns an empty list for a whitespace-only query", async () => {
    const res = await searchAll(store, { query: "   " })
    expect(res).toEqual([])
  })

  it("matches against in-memory run prompts", async () => {
    store.addPrompt({ text: "Build a mitra suspension page", repo: "dash/backoffice" })
    const res = await searchAll(store, { query: "mitra", runsRoot })
    expect(res.length).toBeGreaterThanOrEqual(1)
    const runHit = res.find((r) => r.type === "run")
    expect(runHit).toBeTruthy()
    expect(runHit!.label.toLowerCase()).toContain("mitra")
    // Run hit should expose a runId so the UI can route to /workspace/:id.
    expect(typeof runHit!.runId).toBe("string")
    expect(runHit!.runId!.length).toBeGreaterThan(0)
  })

  it("matches project names", async () => {
    // addPrompt with a repo creates a project keyed off the repo name.
    store.addPrompt({ text: "seed", repo: "dash/halo-dash-fe" })
    const res = await searchAll(store, { query: "halo", runsRoot })
    const projectHit = res.find((r) => r.type === "project")
    expect(projectHit).toBeTruthy()
    expect(projectHit!.label.toLowerCase()).toContain("halo")
  })

  it("matches generated file contents and surfaces the snippet", async () => {
    const prompt = store.addPrompt({
      text: "scaffold a card component",
      repo: "dash/backoffice",
    })
    const runDir = await seedRunOnDisk(
      runsRoot,
      prompt.id,
      {
        "Card.tsx": "import * as React from 'react'\nexport function MitraCard() { return null }\n",
        "README.md": "# Notes\nMitra card component for backoffice.",
      },
      { prompt: "scaffold a card component" },
    )
    expect(runDir).toBeTruthy()
    await store.setRunArtifact(prompt.id, { artifactDir: runDir })

    const res = await searchAll(store, { query: "mitra", runsRoot })
    const fileHit = res.find((r) => r.type === "file")
    expect(fileHit).toBeTruthy()
    expect(fileHit!.path).toBeTruthy()
    expect(fileHit!.snippet).toBeTruthy()
    expect(fileHit!.runId).toBe(prompt.id)
  })

  it("respects the limit clamp", async () => {
    // Seed enough prompts that the default limit would otherwise trim.
    for (let i = 0; i < 5; i++) {
      store.addPrompt({ text: `mitra item ${i}`, repo: "dash/backoffice" })
    }
    const res = await searchAll(store, { query: "mitra", limit: 2, runsRoot })
    expect(res.length).toBeLessThanOrEqual(2)
  })

  it("deduplicates by (type,id) so the same run only appears once", async () => {
    const prompt = store.addPrompt({
      text: "build a mitra suspension page for mitra ops",
      repo: "dash/backoffice",
    })
    const res = await searchAll(store, { query: "mitra", runsRoot })
    const runHits = res.filter((r) => r.type === "run" && r.id === prompt.id)
    expect(runHits.length).toBe(1)
  })

  it("ranks prefix matches above substring matches", async () => {
    store.addPrompt({ text: "Mitra dashboard build", repo: "dash/backoffice" })
    store.addPrompt({ text: "Some unrelated payment work", repo: "dash/portal" })
    // 'mit' prefix-hits the first prompt's word "Mitra" → score 3.
    // No substring match on second prompt → not surfaced.
    const res = await searchAll(store, { query: "mit", runsRoot })
    expect(res[0]).toBeTruthy()
    expect(res[0]!.label.toLowerCase().startsWith("mitra")).toBe(true)
  })
})
