import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  computeKey,
  evictStale,
  getEntry,
  isProcessed,
  loadStore,
  readStore,
  recordOutcome,
  removeEntry,
  writeStore,
  type IdempotencyEntry,
  type IdempotencyStore,
} from "../lib/idempotency.js"
import { loadConfig } from "../config.js"
import { processGap, type PipelineDeps, type IdempotencyDeps } from "../pipeline.js"
import { appendGap, readQueue } from "../gap-queue.js"
import type { AnthropicClient } from "../generator.js"

function mkTmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function silentLogger() {
  return { info: () => undefined, warn: () => undefined, error: () => undefined }
}

function makeFakeClient(text: string): AnthropicClient {
  return {
    messages: {
      create: async () => ({
        content: [{ type: "text", text }],
        usage: { input_tokens: 42, output_tokens: 13 },
      }),
    },
  }
}

const HIGH_QUALITY_TSX = `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"
// AUDIT TRAIL: log original + edited + editor + reason
export function ImageEditorWithAudit() {
  const [reason, setReason] = useState("")
  return <div className="bg-bg-weak-50 text-text-strong-950">
    <Button>Anda yakin?</Button>
  </div>
}
`

describe("idempotency — pure helpers", () => {
  it("computeKey is deterministic for same gap fields", () => {
    const gap = {
      id: "gap_abc",
      created_at: "2026-05-20T10:00:00.000Z",
      description: "no image-editor for mitra proof upload yang panjang",
    }
    const k1 = computeKey(gap)
    const k2 = computeKey({ ...gap })
    expect(k1).toBe(k2)
    expect(k1).toMatch(/^[0-9a-f]{64}$/)
  })

  it("computeKey changes when any of (id, created_at, description) changes", () => {
    const base = {
      id: "gap_abc",
      created_at: "2026-05-20T10:00:00.000Z",
      description: "foo bar baz",
    }
    const k0 = computeKey(base)
    expect(computeKey({ ...base, id: "gap_xyz" })).not.toBe(k0)
    expect(computeKey({ ...base, created_at: "2026-05-21T10:00:00.000Z" })).not.toBe(k0)
    expect(computeKey({ ...base, description: "different" })).not.toBe(k0)
  })

  it("computeKey only uses first 100 chars of description (long descs collide)", () => {
    const head = "x".repeat(100)
    const a = computeKey({ id: "g", created_at: "t", description: head + "AAA" })
    const b = computeKey({ id: "g", created_at: "t", description: head + "BBB" })
    expect(a).toBe(b)
  })

  it("recordOutcome returns a new store (pure) and writeStore + readStore round-trip", () => {
    const tmp = mkTmp("hermes-idem-")
    try {
      const sp = path.join(tmp, "idem.json")
      const empty: IdempotencyStore = { version: 1, entries: {} }
      const entry: IdempotencyEntry = {
        gapId: "gap_1",
        processedAt: "2026-05-20T10:00:00.000Z",
        outcome: "vendored",
        prUrl: "https://github.com/x/y/pull/1",
        tokenSpent: 55,
      }
      const next = recordOutcome("k1", entry, empty)
      // purity
      expect(empty.entries).toEqual({})
      expect(next.entries.k1).toEqual(entry)
      writeStore(next, sp)
      const reloaded = readStore(sp)
      expect(reloaded.entries.k1).toEqual(entry)
      expect(isProcessed("k1", reloaded)).toBe(true)
      expect(isProcessed("missing", reloaded)).toBe(false)
      expect(getEntry("k1", reloaded)).toEqual(entry)
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it("writeStore is atomic — no stray tmp files remain after success", () => {
    const tmp = mkTmp("hermes-idem-")
    try {
      const sp = path.join(tmp, "idem.json")
      writeStore({ version: 1, entries: {} }, sp)
      const siblings = fs.readdirSync(tmp)
      expect(siblings).toContain("idem.json")
      expect(siblings.some((f) => f.startsWith("idem.json.tmp"))).toBe(false)
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it("readStore recovers from corruption — invalid JSON → empty store", () => {
    const tmp = mkTmp("hermes-idem-")
    try {
      const sp = path.join(tmp, "idem.json")
      fs.writeFileSync(sp, "{ this is not json", "utf-8")
      const store = readStore(sp)
      expect(store.entries).toEqual({})
      expect(store.version).toBe(1)
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it("readStore drops malformed entries but keeps the valid ones", () => {
    const tmp = mkTmp("hermes-idem-")
    try {
      const sp = path.join(tmp, "idem.json")
      fs.writeFileSync(
        sp,
        JSON.stringify({
          version: 1,
          entries: {
            good: {
              gapId: "g",
              processedAt: "t",
              outcome: "vendored",
              prUrl: null,
              tokenSpent: 0,
            },
            bad_outcome: { gapId: "g", processedAt: "t", outcome: "WAT" },
            null_entry: null,
            missing_fields: { gapId: "g" },
          },
        }),
        "utf-8",
      )
      const store = readStore(sp)
      expect(Object.keys(store.entries)).toEqual(["good"])
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it("evictStale removes entries older than TTL, keeps fresh ones", () => {
    const now = new Date("2026-05-20T12:00:00.000Z")
    const store: IdempotencyStore = {
      version: 1,
      entries: {
        fresh: {
          gapId: "f",
          processedAt: "2026-05-19T12:00:00.000Z",
          outcome: "vendored",
          prUrl: null,
          tokenSpent: 0,
        },
        stale: {
          gapId: "s",
          processedAt: "2026-04-01T12:00:00.000Z", // 49 days old
          outcome: "vendored",
          prUrl: null,
          tokenSpent: 0,
        },
      },
    }
    const pruned = evictStale(store, 30, now)
    expect(Object.keys(pruned.entries)).toEqual(["fresh"])
  })

  it("removeEntry deletes a single key, no-op if absent", () => {
    const store: IdempotencyStore = {
      version: 1,
      entries: {
        a: { gapId: "a", processedAt: "t", outcome: "vendored", prUrl: null, tokenSpent: 0 },
        b: { gapId: "b", processedAt: "t", outcome: "failed", prUrl: null, tokenSpent: 0 },
      },
    }
    const next = removeEntry("a", store)
    expect(Object.keys(next.entries)).toEqual(["b"])
    expect(removeEntry("missing", next).entries).toEqual(next.entries)
  })

  it("loadStore auto-evicts stale entries on read", () => {
    const tmp = mkTmp("hermes-idem-")
    try {
      const sp = path.join(tmp, "idem.json")
      const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      const fresh = new Date().toISOString()
      writeStore(
        {
          version: 1,
          entries: {
            stale: { gapId: "s", processedAt: old, outcome: "vendored", prUrl: null, tokenSpent: 0 },
            fresh: { gapId: "f", processedAt: fresh, outcome: "vendored", prUrl: null, tokenSpent: 0 },
          },
        },
        sp,
      )
      const store = loadStore(sp, 30)
      expect(Object.keys(store.entries).sort()).toEqual(["fresh"])
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})

describe("idempotency — pipeline integration (mock replay)", () => {
  let tmp: string
  let queuePath: string
  let registryRoot: string
  let idemStorePath: string

  beforeEach(() => {
    tmp = mkTmp("hermes-idem-pl-")
    queuePath = path.join(tmp, "gap-queue.json")
    registryRoot = path.join(tmp, "registry")
    idemStorePath = path.join(tmp, "idem.json")
    fs.mkdirSync(registryRoot, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  function depsWithClient(text: string, overrides: Partial<PipelineDeps> = {}): PipelineDeps {
    return {
      logger: silentLogger(),
      generator: {
        client: makeFakeClient(text),
        skill: async () => ({ systemAppend: "# Dash project context" }),
      },
      prCreator: {
        fetch: async () => ({
          ok: true,
          status: 201,
          json: async () => ({ html_url: "https://github.com/test/dash/pull/42", number: 42 }),
          text: async () => "",
        }),
      },
      slackNotifier: {
        fetch: async () => ({
          ok: true,
          status: 200,
          json: async () => ({}),
          text: async () => "",
        }),
      },
      queuePath,
      idempotencyStorePath: idemStorePath,
      ...overrides,
    }
  }

  it("second processGap on same gap skips Anthropic call (no duplicate token spend)", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const gap = appendGap(
      { description: "no image-editor for mitra proof upload", severity: "high", repo: "halo-dash-fe", prompt: null },
      queuePath,
    )

    // Count Anthropic invocations via a custom client.
    let calls = 0
    const countingClient: AnthropicClient = {
      messages: {
        create: async () => {
          calls++
          return {
            content: [{ type: "text", text: HIGH_QUALITY_TSX }],
            usage: { input_tokens: 10, output_tokens: 5 },
          }
        },
      },
    }
    const deps = depsWithClient(HIGH_QUALITY_TSX, {
      generator: { client: countingClient, skill: async () => ({ systemAppend: "" }) },
    })

    const o1 = await processGap(gap, config, deps)
    expect(o1.kind).toBe("vendored")
    expect(calls).toBe(1)

    // Second call: idempotency store has the key, Anthropic must NOT be hit.
    const o2 = await processGap(gap, config, deps)
    expect(o2.kind).toBe("vendored")
    expect(calls).toBe(1) // unchanged — replay path
  })

  it("DASH_HERMES_NO_IDEMPOTENCY=1 bypasses store (allows re-pay for demo/test)", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const gap = appendGap(
      { description: "no signature pad", severity: "high", repo: "halo-dash-fe", prompt: null },
      queuePath,
    )

    let calls = 0
    const countingClient: AnthropicClient = {
      messages: {
        create: async () => {
          calls++
          return {
            content: [{ type: "text", text: HIGH_QUALITY_TSX }],
            usage: { input_tokens: 1, output_tokens: 1 },
          }
        },
      },
    }
    // Mock the idempotency deps as "disabled".
    const disabledIdem: IdempotencyDeps = {
      computeKey: () => "irrelevant",
      loadStore: () => ({ version: 1, entries: {} }),
      isProcessed: () => false,
      getEntry: () => null,
      recordOutcome: (_k, _e, s) => s,
      writeStore: () => undefined,
      isDisabled: () => true,
    }

    const deps = depsWithClient(HIGH_QUALITY_TSX, {
      generator: { client: countingClient, skill: async () => ({ systemAppend: "" }) },
      idempotency: disabledIdem,
    })

    await processGap(gap, config, deps)
    await processGap(gap, config, deps)
    expect(calls).toBe(2) // both calls hit the network
  })

  it("idempotency replay preserves prior outcome shape (vendored stays vendored)", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const gap = appendGap(
      { description: "no image-editor for mitra proof", severity: "high", repo: "halo-dash-fe", prompt: null },
      queuePath,
    )
    const deps = depsWithClient(HIGH_QUALITY_TSX)

    const o1 = await processGap(gap, config, deps)
    expect(o1.kind).toBe("vendored")

    // Reset queue status as if a replay (debugger) cleared status to pending.
    const q = readQueue(queuePath)
    q.entries[0].status = "pending"
    fs.writeFileSync(queuePath, JSON.stringify(q, null, 2), "utf-8")

    const o2 = await processGap(gap, config, deps)
    expect(o2.kind).toBe("vendored")
    // Queue should be restored to vendored from replay.
    expect(readQueue(queuePath).entries[0].status).toBe("vendored")
  })

  it("records tokenSpent + prUrl + processedAt on the idempotency entry", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const gap = appendGap(
      { description: "no image-editor for mitra proof", severity: "high", repo: "halo-dash-fe", prompt: null },
      queuePath,
    )
    await processGap(gap, config, depsWithClient(HIGH_QUALITY_TSX))

    const store = readStore(idemStorePath)
    const keys = Object.keys(store.entries)
    expect(keys.length).toBe(1)
    const entry = store.entries[keys[0]]
    expect(entry.gapId).toBe(gap.id)
    expect(entry.outcome).toBe("vendored")
    expect(entry.prUrl).toBe("https://github.com/test/dash/pull/42")
    expect(entry.tokenSpent).toBeGreaterThan(0) // 10 + 5 from fake client
    expect(Date.parse(entry.processedAt)).not.toBeNaN()
  })
})
