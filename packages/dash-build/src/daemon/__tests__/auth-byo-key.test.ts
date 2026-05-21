import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string
let originalHome: string | undefined

// We point HOME at a temp dir so BYOKeyStore's default
// `~/.dash-build/auth/anthropic-byo-key.json` lands inside the test
// scratch directory. The daemon's auth route uses `new BYOKeyStore()`
// with no overrides, so HOME is the only knob we have.
beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-byo-key-"))
  originalHome = process.env.HOME
  process.env.HOME = workDir

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
  await rm(workDir, { recursive: true, force: true })
})

describe("Anthropic BYO API key routes (ToS-safe)", () => {
  it("GET /api/auth/anthropic returns BYO + Claude-CLI options when no key saved", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.provider).toBe("anthropic")
    expect(body.mode).toBe("none")
    expect(body.connected).toBe(false)
    expect(body.options.byoKey).toBeDefined()
    expect(body.options.claudeCli).toBeDefined()
    expect(body.tosNote).toMatch(/banned/i)
  })

  it("POST /api/auth/anthropic rejects missing apiKey", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(r.status).toBe(400)
    const body = await r.json()
    expect(body.ok).toBe(false)
    expect(body.error).toBe("missing_apiKey")
  })

  it("POST /api/auth/anthropic rejects invalid prefix", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "not-a-real-key" }),
    })
    expect(r.status).toBe(400)
    const body = await r.json()
    expect(body.ok).toBe(false)
    expect(body.error).toMatch(/sk-ant-/)
  })

  it("POST /api/auth/anthropic accepts valid-prefix key + flips connected=true", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "sk-ant-test-only-fake-12345" }),
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.mode).toBe("byo-key")

    // Status now reports connected.
    const status = await fetch(`${baseUrl}/api/auth/anthropic`).then((x) =>
      x.json(),
    )
    expect(status.connected).toBe(true)
    expect(status.mode).toBe("byo-key")
  })

  it("DELETE /api/auth/anthropic clears the key + flips connected=false", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic`, {
      method: "DELETE",
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)

    const status = await fetch(`${baseUrl}/api/auth/anthropic`).then((x) =>
      x.json(),
    )
    expect(status.connected).toBe(false)
    expect(status.mode).toBe("none")
  })

  it("GET /api/auth/anthropic/claude-cli returns probe result + login instructions", async () => {
    const r = await fetch(`${baseUrl}/api/auth/anthropic/claude-cli`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(typeof body.installed).toBe("boolean")
    // version is null if not installed, string otherwise
    expect(body.version === null || typeof body.version === "string").toBe(true)
    expect(body.loginInstructions).toMatch(/claude login/i)
  })
})
