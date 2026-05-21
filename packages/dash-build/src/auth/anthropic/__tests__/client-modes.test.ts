import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { AuthenticatedAnthropicClient } from "../client.js"
import { BYOKeyStore } from "../byo-key.js"
import { ClaudeCliRunner } from "../../claude-cli/runner.js"

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "dash-build-client-modes-"))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

/** Build a fake CLI runner with stubbed `probe` (and optional complete). */
function fakeRunner(
  installed: boolean,
  completeImpl?: ClaudeCliRunner["complete"],
): ClaudeCliRunner {
  const stub = new ClaudeCliRunner({ binary: "/dev/null/never-spawns" })
  ;(stub as unknown as { probe: () => Promise<{ installed: boolean; version: string | null }> }).probe =
    async () => ({ installed, version: installed ? "stub-1.0" : null })
  if (completeImpl) {
    ;(stub as unknown as { complete: ClaudeCliRunner["complete"] }).complete =
      completeImpl
  }
  return stub
}

describe("AuthenticatedAnthropicClient.getMode", () => {
  it("returns 'byo-key' when an API key is stored (regardless of CLI)", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    await byoStore.save("sk-ant-test-key")
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: fakeRunner(true),
    })
    expect(await client.getMode()).toBe("byo-key")
    expect(await client.isConnected()).toBe(true)
  })

  it("returns 'claude-cli' when no BYO key but CLI is installed", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: fakeRunner(true),
    })
    expect(await client.getMode()).toBe("claude-cli")
    expect(await client.isConnected()).toBe(true)
  })

  it("returns 'none' when neither BYO key nor CLI", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: fakeRunner(false),
    })
    expect(await client.getMode()).toBe("none")
    expect(await client.isConnected()).toBe(false)
  })
})

describe("AuthenticatedAnthropicClient.complete", () => {
  it("throws a clear error in 'none' mode", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: fakeRunner(false),
    })
    await expect(client.complete("hi")).rejects.toThrow(
      /No Anthropic credentials/,
    )
  })

  it("routes through Claude CLI subprocess in 'claude-cli' mode", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const calls: string[] = []
    const runner = fakeRunner(true, async (req) => {
      calls.push(req.prompt)
      return { content: "cli-reply", exitCode: 0, durationMs: 1 }
    })
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: runner,
    })
    const reply = await client.complete("write me a button")
    expect(reply).toBe("cli-reply")
    expect(calls).toEqual(["write me a button"])
  })

  it("routes through HTTP API in 'byo-key' mode", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    await byoStore.save("sk-ant-test-key")
    let captured: { url: string; init: RequestInit } | null = null
    const fakeFetch: typeof fetch = async (input, init) => {
      captured = { url: String(input), init: init ?? {} }
      return new Response(
        JSON.stringify({ content: [{ type: "text", text: "byo-reply" }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
    }
    const client = new AuthenticatedAnthropicClient({
      byoStore,
      claudeCli: fakeRunner(false),
      fetchImpl: fakeFetch,
    })
    const reply = await client.complete("ping")
    expect(reply).toBe("byo-reply")
    expect(captured).not.toBeNull()
    expect(captured!.url).toBe("https://api.anthropic.com/v1/messages")
    const headers = captured!.init.headers as Record<string, string>
    expect(headers["x-api-key"]).toBe("sk-ant-test-key")
  })
})
