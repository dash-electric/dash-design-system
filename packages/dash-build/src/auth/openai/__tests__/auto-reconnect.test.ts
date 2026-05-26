import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { AutoReconnect } from "../auto-reconnect.js"
import { AuthenticatedOpenAIClient } from "../client.js"
import { BYOKeyStore } from "../byo-key.js"
import { CodexCliRunner } from "../../codex-cli/runner.js"
import { Store } from "../../../daemon/state/store.js"
import { Broadcaster } from "../../../daemon/ws/broadcaster.js"

/**
 * Sprint 1B — AutoReconnect tests.
 *
 * Cases covered:
 *   - happy path: already connected → return ok, no broadcast
 *   - codex fallback: probe was false initially, Codex now installed+auth
 *   - byo-key fallback: Codex still cold, BYO key revalidates ok
 *   - both fail: marks disconnected + broadcasts auth:reconnect_failed
 *   - broken BYO key (401 from validation): falls through to disconnected
 */

let tmpDir: string
let statePath: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "dash-build-auto-reconnect-"))
  statePath = path.join(tmpDir, "state.json")
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

function fakeCodexRunner(installed: boolean, authenticated: boolean): CodexCliRunner {
  const stub = new CodexCliRunner({ binary: "/dev/null/never-spawns" })
  ;(stub as unknown as { probe: () => Promise<unknown> }).probe = async () => ({
    installed,
    authenticated,
    version: installed ? "stub-1.0" : null,
    statusLine: authenticated ? "logged in" : null,
  })
  return stub
}

function captureBroadcasts(): {
  broadcaster: Broadcaster
  events: Array<{ event: string; data: unknown }>
} {
  const events: Array<{ event: string; data: unknown }> = []
  const broadcaster = new Broadcaster()
  const origBroadcast = broadcaster.broadcast.bind(broadcaster)
  broadcaster.broadcast = (event: string, data: unknown) => {
    events.push({ event, data })
    origBroadcast(event, data)
  }
  return { broadcaster, events }
}

async function makeStore(initialAuthConnected: boolean): Promise<Store> {
  const store = await Store.load({ path: statePath })
  if (initialAuthConnected) {
    await store.setAuth("openai", { connected: true, user: "ChatGPT" })
  }
  return store
}

describe("AutoReconnect.checkAndReconnect", () => {
  it("returns ok without broadcasting when already connected", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const codex = fakeCodexRunner(true, true)
    const client = new AuthenticatedOpenAIClient({ byoStore, codexCli: codex })
    const store = await makeStore(true)
    const { broadcaster, events } = captureBroadcasts()

    const ar = new AutoReconnect({
      client,
      store,
      broadcaster,
      intervalMs: 0,
      byoStore,
      codexCli: codex,
    })
    const result = await ar.checkAndReconnect()
    expect(result.connected).toBe(true)
    if (result.connected) expect(result.mode).toBe("codex-cli")
    expect(events.find((e) => e.event === "auth:reconnected")).toBeUndefined()
  })

  it("recovers via Codex CLI fallback when client probe returned disconnected", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    // Client thinks codex is cold; AutoReconnect uses its OWN runner which says ready.
    const clientCodex = fakeCodexRunner(false, false)
    const reconnectCodex = fakeCodexRunner(true, true)
    const client = new AuthenticatedOpenAIClient({ byoStore, codexCli: clientCodex })
    const store = await makeStore(false)
    const { broadcaster, events } = captureBroadcasts()

    const ar = new AutoReconnect({
      client,
      store,
      broadcaster,
      intervalMs: 0,
      byoStore,
      codexCli: reconnectCodex,
    })
    const result = await ar.checkAndReconnect()
    expect(result.connected).toBe(true)
    if (result.connected) expect(result.mode).toBe("codex-cli")
    const recovered = events.find((e) => e.event === "auth:reconnected")
    expect(recovered).toBeDefined()
    expect(store.getAuth().openai.connected).toBe(true)
    expect(store.getAuth().openai.user).toBe("ChatGPT")
  })

  it("recovers via BYO-key fallback when Codex is unavailable", async () => {
    // Client sees an empty store (so isConnected()=false), AutoReconnect uses
    // a second BYO store that holds the key — simulates a key that arrived
    // on disk while the daemon was running, or a daemon restart that hasn't
    // re-read the file yet.
    const clientByoDir = path.join(tmpDir, "client")
    const reconnectByoDir = path.join(tmpDir, "reconnect")
    const clientByo = new BYOKeyStore({ authDir: clientByoDir, machineId: "t" })
    const reconnectByo = new BYOKeyStore({ authDir: reconnectByoDir, machineId: "t" })
    await reconnectByo.save("sk-test-fallback-key")
    const codex = fakeCodexRunner(false, false)
    const client = new AuthenticatedOpenAIClient({ byoStore: clientByo, codexCli: codex })
    const store = await makeStore(false)
    const { broadcaster, events } = captureBroadcasts()

    const fakeFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }))

    const ar = new AutoReconnect({
      client,
      store,
      broadcaster,
      intervalMs: 0,
      byoStore: reconnectByo,
      codexCli: codex,
      fetchImpl: fakeFetch,
    })
    const result = await ar.checkAndReconnect()
    expect(result.connected).toBe(true)
    if (result.connected) expect(result.mode).toBe("byo-key")
    expect(fakeFetch).toHaveBeenCalledOnce()
    const recovered = events.find((e) => e.event === "auth:reconnected")
    expect(recovered).toBeDefined()
    if (recovered) expect((recovered.data as { mode: string }).mode).toBe("byo-key")
    expect(store.getAuth().openai.user).toBe("byo-key")
  })

  it("marks disconnected + broadcasts reconnect_failed when both fallbacks fail", async () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const codex = fakeCodexRunner(false, false)
    const client = new AuthenticatedOpenAIClient({ byoStore, codexCli: codex })
    const store = await makeStore(true)
    const { broadcaster, events } = captureBroadcasts()

    const ar = new AutoReconnect({
      client,
      store,
      broadcaster,
      intervalMs: 0,
      byoStore,
      codexCli: codex,
    })
    const result = await ar.checkAndReconnect()
    expect(result.connected).toBe(false)
    if (!result.connected) expect(result.reason).toBeTruthy()
    const failed = events.find((e) => e.event === "auth:reconnect_failed")
    expect(failed).toBeDefined()
    expect(store.getAuth().openai.connected).toBe(false)
  })

  it("treats a 401 from BYO validation as failure (revoked key)", async () => {
    // Client has no key (isConnected false), AutoReconnect has the (revoked)
    // key on its own store. Fetch returns 401 → both fallbacks fail.
    const clientByoDir = path.join(tmpDir, "client-401")
    const reconnectByoDir = path.join(tmpDir, "reconnect-401")
    const clientByo = new BYOKeyStore({ authDir: clientByoDir, machineId: "t" })
    const reconnectByo = new BYOKeyStore({ authDir: reconnectByoDir, machineId: "t" })
    await reconnectByo.save("sk-revoked-key")
    const codex = fakeCodexRunner(false, false)
    const client = new AuthenticatedOpenAIClient({ byoStore: clientByo, codexCli: codex })
    const store = await makeStore(true)
    const { broadcaster, events } = captureBroadcasts()

    const fakeFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 401 }))

    const ar = new AutoReconnect({
      client,
      store,
      broadcaster,
      intervalMs: 0,
      byoStore: reconnectByo,
      codexCli: codex,
      fetchImpl: fakeFetch,
    })
    const result = await ar.checkAndReconnect()
    expect(result.connected).toBe(false)
    if (!result.connected) expect(result.reason).toMatch(/401/)
    expect(events.find((e) => e.event === "auth:reconnect_failed")).toBeDefined()
    expect(store.getAuth().openai.connected).toBe(false)
  })
})

describe("AutoReconnect.start", () => {
  it("returns a no-op cancel function when intervalMs <= 0", () => {
    const byoStore = new BYOKeyStore({ authDir: tmpDir, machineId: "test" })
    const codex = fakeCodexRunner(false, false)
    const client = new AuthenticatedOpenAIClient({ byoStore, codexCli: codex })
    // Use a sync store stub for this lightweight start() check.
    const store = {
      getAuth: () => ({
        openai: { connected: false, user: null },
        github: { connected: false, user: null, repos: [] },
      }),
      setAuth: async () => {},
    } as unknown as Store

    const ar = new AutoReconnect({
      client,
      store,
      intervalMs: 0,
      byoStore,
      codexCli: codex,
    })
    const cancel = ar.start()
    expect(typeof cancel).toBe("function")
    cancel()
  })
})
