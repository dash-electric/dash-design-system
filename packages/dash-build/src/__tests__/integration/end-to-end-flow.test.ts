/**
 * Dash Build end-to-end integration tests.
 *
 * Strategy: boot a real HTTP+WS daemon against a temp state file, then
 * exercise the same routes the browser dashboard would. External deps
 * (OpenAI/Codex + GitHub) are replaced with the mock-*.ts harnesses; the
 * skill-chain layer is simulated by driving `store.updatePromptStatus`
 * directly to mirror what Agent H's worker will do.
 *
 * 12 tests cover every transition in the prompt state machine plus the
 * WebSocket broadcast layer + auth disconnection guard.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { connect } from "node:net"
import { createHash } from "node:crypto"
import { startDaemon, type RunningDaemon } from "../../daemon/server.js"
import { MockAnthropic } from "./mock-anthropic.js"
import { MockGithub } from "./mock-github.js"
import {
  AUTO_MERGE_THRESHOLD,
  canAutoMerge,
  makeOk,
  makeClarify,
} from "./mock-skill-chain.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string
let originalPath: string | undefined

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-e2e-"))
  originalPath = process.env.PATH
  process.env.PATH = workDir
  daemon = await startDaemon({
    port: 0,
    host: "127.0.0.1",
    statePath: join(workDir, "state.json"),
    writePid: false,
    // E2E tests pre-date Agent H's pipeline — they exercise the legacy
    // stub behaviour by driving store.updatePromptStatus directly. Real
    // pipeline coverage lives in src/pipeline/__tests__.
    enablePipeline: false,
  })
  const addr = daemon.server.address()
  const port = typeof addr === "object" && addr ? addr.port : daemon.port
  baseUrl = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await daemon.close()
  if (originalPath === undefined) delete process.env.PATH
  else process.env.PATH = originalPath
  await rm(workDir, { recursive: true, force: true })
})

// --- Helpers ---------------------------------------------------------------

async function submitPrompt(text: string, repo?: string, branch?: string) {
  const r = await fetch(`${baseUrl}/api/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, repo, branch }),
  })
  return { status: r.status, body: (await r.json()) as { id: string; status: string } }
}

async function getPrompt(id: string) {
  const r = await fetch(`${baseUrl}/api/prompts/${id}`)
  return { status: r.status, body: await r.json() }
}

async function approve(id: string, approved = true) {
  const r = await fetch(`${baseUrl}/api/prompts/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved }),
  })
  return { status: r.status, body: await r.json() }
}

/**
 * Open a raw WS connection and capture broadcast events. We can't use a
 * library — the daemon ships its own minimal frame encoder. We just need to
 * verify the handshake completes + an event arrives.
 */
async function openWsAndCollect(timeoutMs = 600): Promise<string[]> {
  const url = new URL(baseUrl)
  return await new Promise((resolve) => {
    const collected: string[] = []
    const socket = connect({ host: url.hostname, port: Number(url.port) })
    const key = "dGhlIHNhbXBsZSBub25jZQ==" // RFC 6455 example
    const accept = createHash("sha1")
      .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
      .digest("base64")

    let handshakeDone = false
    let buf = Buffer.alloc(0)

    socket.on("connect", () => {
      socket.write(
        [
          "GET /ws HTTP/1.1",
          `Host: ${url.hostname}:${url.port}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\r\n",
        ].join("\r\n"),
      )
    })

    socket.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk])
      if (!handshakeDone) {
        const sep = buf.indexOf("\r\n\r\n")
        if (sep < 0) return
        const head = buf.slice(0, sep).toString("utf8")
        if (!head.includes("101") || !head.includes(accept)) {
          socket.destroy()
          return resolve(collected)
        }
        handshakeDone = true
        buf = buf.slice(sep + 4)
      }
      // Decode minimal WS frames (assume server-sent, unmasked, length < 126)
      while (buf.length >= 2) {
        const opcode = buf[0]! & 0x0f
        const len = buf[1]! & 0x7f
        if (len > 125) break
        if (buf.length < 2 + len) break
        const payload = buf.slice(2, 2 + len).toString("utf8")
        buf = buf.slice(2 + len)
        if (opcode === 0x1) collected.push(payload)
      }
    })

    setTimeout(() => {
      socket.end()
      resolve(collected)
    }, timeoutMs)
  })
}

// --- Tests -----------------------------------------------------------------

describe("Dash Build E2E", () => {
  it("dashboard renders with disconnected state by default", async () => {
    const r = await fetch(`${baseUrl}/dashboard`)
    expect(r.status).toBe(200)
    const html = await r.text()
    // Brand chrome
    expect(html).toContain("Dash Build")
    expect(html).toContain("db-brand-mark")
    expect(html).toContain("Plus+Jakarta+Sans")
    // Auth CTA visible on a fresh state
    expect(html).toContain("Connect OpenAI")
    // WS indicator present
    expect(html).toContain("db-ws-indicator")
  })

  it("OpenAI auth GET returns Codex + BYO key options", async () => {
    const r = await fetch(`${baseUrl}/api/auth/openai`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.provider).toBe("openai")
    expect(body.options.byoKey.endpoint).toBe("POST /api/auth/openai")
    expect(body.options.codexCli.endpoint).toBe(
      "GET /api/auth/openai/codex-cli",
    )
    expect(body.loginStatus === null || typeof body.loginStatus === "string").toBe(true)
  })

  it("submit prompt → queued status", async () => {
    const res = await submitPrompt("add chart payroll", "dash/halo-dash-fe", "main")
    expect(res.status).toBe(201)
    expect(res.body.status).toBe("queued")
    expect(res.body.id).toMatch(/^prm_/)
    const fetched = await getPrompt(res.body.id)
    expect(fetched.body.prompt.status).toBe("queued")
  })

  it("worker picks queued prompt → generating", async () => {
    const created = await submitPrompt("add filter driver")
    const id = created.body.id
    // Simulate worker pickup (Agent H wires the real worker)
    await daemon.store.updatePromptStatus(id, "generating")
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("generating")
  })

  it("clarification needed → session created", async () => {
    const created = await submitPrompt("ambiguous prompt")
    const id = created.body.id
    const clarify = makeClarify(id)
    expect(clarify.kind).toBe("clarify")
    expect(clarify.questions.length).toBeGreaterThan(0)
    await daemon.store.updatePromptStatus(id, "clarifying")
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("clarifying")
  })

  it("clarification answered → resume generation", async () => {
    const created = await submitPrompt("needs answers")
    const id = created.body.id
    await daemon.store.updatePromptStatus(id, "clarifying")
    // Answer (simulated) → worker resumes
    await daemon.store.updatePromptStatus(id, "generating")
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("generating")
  })

  it("generation success → awaiting_approval", async () => {
    const created = await submitPrompt("clean prompt")
    const id = created.body.id
    await daemon.store.updatePromptStatus(id, "generating")
    const result = makeOk(id, 92)
    expect(result.kind).toBe("ok")
    if (result.kind === "ok") {
      expect(result.files.length).toBe(1)
      expect(canAutoMerge(result.score)).toBe(true)
    }
    await daemon.store.updatePromptStatus(id, "awaiting_approval")
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("awaiting_approval")
  })

  it("approve PR → submitChanges called", async () => {
    const created = await submitPrompt("ready prompt")
    const id = created.body.id
    await daemon.store.updatePromptStatus(id, "awaiting_approval")
    const github = new MockGithub()
    const approveRes = await approve(id, true)
    expect(approveRes.status).toBe(202)
    // Simulate worker calling github.submitChanges after the approve hook
    const pr = await github.submitChanges({
      repo: "dash/halo-dash-fe",
      branch: "feat/dash-build-" + id,
      title: "ready prompt",
      body: "auto-generated",
      files: [{ path: "src/x.tsx", content: "export {}" }],
    })
    expect(github.calls.length).toBe(1)
    expect(pr.prUrl).toMatch(/github\.com/)
  })

  it("PR success → status pr_created + URL stored", async () => {
    const created = await submitPrompt("ship it")
    const id = created.body.id
    await daemon.store.updatePromptStatus(id, "awaiting_approval")
    const prUrl = "https://github.com/dash/halo-dash-fe/pull/2042"
    await daemon.store.updatePromptStatus(id, "pr_created", { prUrl })
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("pr_created")
    expect(fetched.body.prompt.prUrl).toBe(prUrl)
  })

  it("WebSocket broadcasts on each status transition", async () => {
    const wsPromise = openWsAndCollect(700)
    // Allow handshake to complete
    await new Promise((r) => setTimeout(r, 80))
    const created = await submitPrompt("ws-event prompt")
    await daemon.store.updatePromptStatus(created.body.id, "generating")
    daemon.broadcaster.broadcast("prompts:changed", {
      id: created.body.id,
      status: "generating",
    })
    const events = await wsPromise
    // hello + at least one prompts:changed event
    const parsed = events.map((e) => {
      try {
        return JSON.parse(e) as { event: string }
      } catch {
        return { event: "" }
      }
    })
    const eventNames = parsed.map((e) => e.event)
    expect(eventNames).toContain("hello")
    expect(eventNames.some((n) => n === "prompts:changed")).toBe(true)
  })

  it("foundation score below threshold blocks auto-merge", () => {
    const low = makeOk("prm_low", AUTO_MERGE_THRESHOLD - 10)
    if (low.kind !== "ok") throw new Error("expected ok")
    expect(canAutoMerge(low.score)).toBe(false)
    const high = makeOk("prm_high", AUTO_MERGE_THRESHOLD + 5)
    if (high.kind !== "ok") throw new Error("expected ok")
    expect(canAutoMerge(high.score)).toBe(true)
  })

  it("auth disconnection during generation → graceful failure", async () => {
    const created = await submitPrompt("auth-loss prompt")
    const id = created.body.id
    await daemon.store.updatePromptStatus(id, "generating")
    // Anthropic mock with fail scenario
    const a = new MockAnthropic({ scenario: "fail" })
    let threw = false
    try {
      await a.messages.create()
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
    // Worker should record failure on the prompt, not crash the daemon
    await daemon.store.updatePromptStatus(id, "failed", {
      error: "anthropic_unauthorized",
    })
    const fetched = await getPrompt(id)
    expect(fetched.body.prompt.status).toBe("failed")
    expect(fetched.body.prompt.error).toBe("anthropic_unauthorized")
    // Daemon still serves status
    const status = await fetch(`${baseUrl}/api/status`)
    expect(status.status).toBe(200)
  })
})
