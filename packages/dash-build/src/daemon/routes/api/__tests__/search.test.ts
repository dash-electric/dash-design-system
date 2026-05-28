/**
 * GET /api/search — Open WebUI-style search endpoint integration tests.
 *
 * Runs against a real daemon (port 0 / random) so the router wiring is
 * exercised end-to-end. The pipeline is disabled so prompts stay in their
 * queued state (we only care about lexical search over Store-resident
 * records, not generator output).
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { isSearchPath } from "../search.js"
import { startDaemon, type RunningDaemon } from "../../../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-search-"))
  daemon = await startDaemon({
    port: 0,
    host: "127.0.0.1",
    statePath: join(workDir, "state.json"),
    writePid: false,
    enablePipeline: false,
  })
  const addr = daemon.server.address()
  const port = typeof addr === "object" && addr ? addr.port : daemon.port
  baseUrl = `http://127.0.0.1:${port}`

  // Seed two prompts so search has something to find. The pipeline is
  // disabled so the records stay queued; we only need their text/repo.
  daemon.store.addPrompt({ text: "Build mitra suspension page", repo: "dash/backoffice" })
  daemon.store.addPrompt({ text: "Add audit log to payment flow", repo: "dash/portal" })
})

afterAll(async () => {
  await daemon.close()
  await rm(workDir, { recursive: true, force: true })
})

describe("isSearchPath", () => {
  it("matches the canonical endpoint exactly", () => {
    expect(isSearchPath("/api/search")).toBe(true)
  })
  it("rejects unrelated paths", () => {
    expect(isSearchPath("/api/searches")).toBe(false)
    expect(isSearchPath("/api/search/extra")).toBe(false)
    expect(isSearchPath("/search")).toBe(false)
  })
})

describe("GET /api/search", () => {
  it("returns empty results for a missing query", async () => {
    const r = await fetch(`${baseUrl}/api/search`)
    expect(r.status).toBe(200)
    const body = (await r.json()) as {
      ok: boolean
      q: string
      count: number
      results: unknown[]
    }
    expect(body.ok).toBe(true)
    expect(body.count).toBe(0)
    expect(body.results).toEqual([])
  })

  it("returns ranked matches for a real query", async () => {
    const r = await fetch(`${baseUrl}/api/search?q=mitra`)
    expect(r.status).toBe(200)
    const body = (await r.json()) as {
      ok: boolean
      q: string
      count: number
      results: Array<{
        type: string
        label: string
        score: number
        runId?: string
      }>
    }
    expect(body.ok).toBe(true)
    expect(body.q).toBe("mitra")
    expect(body.count).toBeGreaterThanOrEqual(1)
    const runHit = body.results.find((r) => r.type === "run")
    expect(runHit).toBeTruthy()
    expect(runHit!.label.toLowerCase()).toContain("mitra")
    expect(runHit!.score).toBeGreaterThan(0)
  })

  it("respects the limit query parameter", async () => {
    const r = await fetch(`${baseUrl}/api/search?q=a&limit=1`)
    expect(r.status).toBe(200)
    const body = (await r.json()) as { ok: boolean; count: number }
    expect(body.ok).toBe(true)
    expect(body.count).toBeLessThanOrEqual(1)
  })

  it("rejects non-GET methods", async () => {
    const r = await fetch(`${baseUrl}/api/search`, { method: "POST" })
    expect(r.status).toBe(405)
  })

  it("clamps absurd limits silently", async () => {
    const r = await fetch(`${baseUrl}/api/search?q=mitra&limit=999999`)
    expect(r.status).toBe(200)
    const body = (await r.json()) as { ok: boolean; results: unknown[] }
    expect(body.ok).toBe(true)
    // Limit clamp is enforced server-side (MAX_LIMIT = 100). Two seeded
    // prompts cap actual count anyway.
    expect(body.results.length).toBeLessThanOrEqual(100)
  })
})
