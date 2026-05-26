import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string
let oldDashRoot: string | undefined

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-owner-"))
  oldDashRoot = process.env.DASH_BUILD_DASH_ROOT
  process.env.DASH_BUILD_DASH_ROOT = workDir
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
  if (oldDashRoot === undefined) {
    delete process.env.DASH_BUILD_DASH_ROOT
  } else {
    process.env.DASH_BUILD_DASH_ROOT = oldDashRoot
  }
})

describe("GET /owner", () => {
  it("returns 200 HTML", async () => {
    const r = await fetch(`${baseUrl}/owner`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/html/)
  })

  it("renders the four Owner panel headings", async () => {
    const r = await fetch(`${baseUrl}/owner`)
    const html = await r.text()
    expect(html).toContain("Branch merge queue")
    expect(html).toContain("Activity log")
    expect(html).toContain("Cost monitor")
    expect(html).toContain("DS candidate queue")
  })

  it("includes shell + topbar markers", async () => {
    const r = await fetch(`${baseUrl}/owner`)
    const html = await r.text()
    expect(html).toContain("db-owner-page")
    expect(html).toContain("db-owner-stack")
    expect(html).toContain("db-owner-panel")
    // Surface-switch tab anchor pointing back to /dashboard.
    expect(html).toContain('data-tab="build"')
    expect(html).toContain('href="/dashboard"')
    // Active Owner tab.
    expect(html).toContain('data-tab="owner"')
  })

  it("ships the cost-monitor mock disclaimer", async () => {
    const r = await fetch(`${baseUrl}/owner`)
    const html = await r.text()
    expect(html).toContain("Mock data")
  })

  it("surfaces the DS-candidate empty state in S3A", async () => {
    const r = await fetch(`${baseUrl}/owner`)
    const html = await r.text()
    expect(html).toContain("No DS candidates flagged yet")
  })
})
