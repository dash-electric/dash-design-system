import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-routes-"))
  daemon = await startDaemon({
    port: 0, // OS-assigned free port
    host: "127.0.0.1",
    statePath: join(workDir, "state.json"),
    writePid: false,
    enablePipeline: false,
  })
  const addr = daemon.server.address()
  const port =
    typeof addr === "object" && addr ? addr.port : daemon.port
  baseUrl = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await daemon.close()
  await rm(workDir, { recursive: true, force: true })
})

describe("HTTP routes", () => {
  it("GET /health returns 200 with ok=true", async () => {
    const r = await fetch(`${baseUrl}/health`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(typeof body.uptime).toBe("number")
    expect(body.version).toBeTruthy()
  })

  it("GET /api/status returns auth + workspace + prompts shape", async () => {
    const r = await fetch(`${baseUrl}/api/status`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.auth).toBeDefined()
    expect(body.workspace).toBeDefined()
    expect(Array.isArray(body.prompts.recent)).toBe(true)
  })

  it("GET / redirects to /dashboard", async () => {
    const r = await fetch(`${baseUrl}/`, { redirect: "manual" })
    expect(r.status).toBe(302)
    expect(r.headers.get("location")).toBe("/dashboard")
  })

  it("GET /dashboard returns HTML", async () => {
    const r = await fetch(`${baseUrl}/dashboard`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/html/)
    const html = await r.text()
    expect(html).toContain("Dash Build")
    // Dashboard chrome always renders, regardless of auth state.
    expect(html).toContain("db-ws-indicator")
    expect(html).toContain("db-prompts-region")
  })

  it("GET /static/app.css returns CSS", async () => {
    const r = await fetch(`${baseUrl}/static/app.css`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/css/)
  })

  it("GET /static/app.js returns JS", async () => {
    const r = await fetch(`${baseUrl}/static/app.js`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/javascript/)
  })

  it("GET /unknown returns 404 JSON", async () => {
    const r = await fetch(`${baseUrl}/totally-unknown`)
    expect(r.status).toBe(404)
    const body = await r.json()
    expect(body.ok).toBe(false)
  })

  it("POST /api/prompt creates a prompt and echoes id", async () => {
    const r = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "add chart payroll backoffice" }),
    })
    expect(r.status).toBe(201)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.id).toMatch(/^prm_/)
    expect(body.status).toBe("queued")
  })

  it("POST /api/prompt without text returns 400", async () => {
    const r = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(r.status).toBe(400)
  })

  it("GET /api/repos returns repo list", async () => {
    const r = await fetch(`${baseUrl}/api/repos`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(Array.isArray(body.repos)).toBe(true)
    expect(body.repos[0]?.full_name).toBeTruthy()
    expect(body.mode).toBe("local-test")
    expect(body.repos.map((repo: { full_name: string }) => repo.full_name)).toEqual([
      "dash/portal-v2",
      "dash/backoffice",
    ])
  })

  it("POST /api/repos persists active local test repo", async () => {
    const r = await fetch(`${baseUrl}/api/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: "dash/backoffice", branch: "main" }),
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(daemon.store.getWorkspace().activeRepo).toBe("dash/backoffice")
  })

  it("dashboard allows local generation with OpenAI only", async () => {
    await daemon.store.setAuth("openai", { connected: true, user: "byo-key" })
    const r = await fetch(`${baseUrl}/dashboard`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain("db-prompt-input")
    expect(html).not.toContain("Install the Dash Build GitHub App")
  })
})
