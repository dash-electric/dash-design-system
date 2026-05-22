import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string
let originalHome: string | undefined
let originalPath: string | undefined

// We point HOME at a temp dir so BYOKeyStore's default
// `~/.dash-build/auth/openai-byo-key.json` lands inside the test
// scratch directory. The daemon's auth route uses `new BYOKeyStore()`
// with no overrides, so HOME is the only knob we have.
beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-byo-key-"))
  originalHome = process.env.HOME
  originalPath = process.env.PATH
  process.env.HOME = workDir
  process.env.PATH = workDir

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
  if (originalHome === undefined) delete process.env.HOME
  else process.env.HOME = originalHome
  if (originalPath === undefined) delete process.env.PATH
  else process.env.PATH = originalPath
  await rm(workDir, { recursive: true, force: true })
})

describe("OpenAI auth routes", () => {
  it("GET /api/auth/openai returns Codex + BYO key options", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.provider).toBe("openai")
    expect(body.mode === "none" || body.mode === "byo-key").toBe(true)
    expect(typeof body.connected).toBe("boolean")
    expect(body.options.byoKey).toBeDefined()
    expect(body.options.codexCli).toBeDefined()
    expect(body.loginStatus === null || typeof body.loginStatus === "string").toBe(true)
  })

  it("POST /api/auth/openai rejects missing apiKey", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(r.status).toBe(400)
    const body = await r.json()
    expect(body.ok).toBe(false)
    expect(body.error).toBe("missing_apiKey")
  })

  it("POST /api/auth/openai rejects invalid prefix", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "not-a-real-key" }),
    })
    expect(r.status).toBe(400)
    const body = await r.json()
    expect(body.ok).toBe(false)
    expect(body.error).toMatch(/sk-/)
  })

  it("POST /api/auth/openai accepts valid-prefix key + flips connected=true", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "sk-test-only-fake-12345" }),
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.mode).toBe("byo-key")

    // Status now reports connected.
    const status = await fetch(`${baseUrl}/api/auth/openai`).then((x) =>
      x.json(),
    )
    expect(status.connected).toBe(true)
    expect(status.activeMode).toBe("byo-key")
  })

  it("DELETE /api/auth/openai clears the key + flips connected=false", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`, {
      method: "DELETE",
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)

    const status = await fetch(`${baseUrl}/api/auth/openai`).then((x) =>
      x.json(),
    )
    expect(status.mode).toBe("none")
  })

  it("GET /api/auth/openai/codex-cli returns probe result + login instructions", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai/codex-cli`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(typeof body.installed).toBe("boolean")
    expect(typeof body.authenticated).toBe("boolean")
    // version is null if not installed, string otherwise
    expect(body.version === null || typeof body.version === "string").toBe(true)
    expect(body.loginInstructions).toMatch(/codex login/i)
  })
})
