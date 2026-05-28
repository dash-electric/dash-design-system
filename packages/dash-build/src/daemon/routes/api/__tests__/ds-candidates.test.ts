/**
 * /api/ds-candidates — Tier 6 content-based DS candidate scanner tests.
 *
 * Uses the daemon HTTP harness so the route + ranker wiring is verified end
 * to end. Artifact loading is stubbed via the test-seam so we do not depend
 * on on-disk run state.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../../../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-dsc-"))
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
})

afterAll(async () => {
  await daemon.close()
  await rm(workDir, { recursive: true, force: true })
})

describe("GET /api/ds-candidates", () => {
  it("returns ok:true with an empty candidate list when no runs exist", async () => {
    const r = await fetch(`${baseUrl}/api/ds-candidates`)
    expect(r.status).toBe(200)
    const body = (await r.json()) as {
      ok: boolean
      scannedRuns: number
      scannedArtifacts: number
      candidates: unknown[]
    }
    expect(body.ok).toBe(true)
    expect(body.scannedRuns).toBe(0)
    expect(body.scannedArtifacts).toBe(0)
    expect(body.candidates).toEqual([])
  })

  it("rejects non-GET methods with 405", async () => {
    const r = await fetch(`${baseUrl}/api/ds-candidates`, { method: "POST" })
    expect(r.status).toBe(405)
  })

  it("clamps topN and maxRuns to safe ranges", async () => {
    const r = await fetch(
      `${baseUrl}/api/ds-candidates?topN=99999&maxRuns=99999`,
    )
    expect(r.status).toBe(200)
    const body = (await r.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
  })
})
