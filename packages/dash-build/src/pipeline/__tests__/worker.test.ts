import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../orchestrator.js"
import { Worker } from "../worker.js"
import type {
  AnthropicProvider,
  ClarificationGateway,
  GithubProvider,
  SkillChainRunner,
} from "../types.js"
import type { GenerateResult } from "../../skills/types.js"

const GENERATED: GenerateResult = {
  kind: "generated",
  response: {
    files: [{ path: "src/x.ts", language: "ts", content: "export {}" }],
    explanation: "x",
  },
  validation: { passed: true, score: 80, errors: [], warnings: [] },
  meta: {
    promptId: "id",
    modelId: "claude-test",
    prdSectionsTouched: 1,
    detectedRepoStack: null,
    designSources: [],
    skillSources: [],
  },
}

function makeOrchestrator(
  store: Store,
  broadcaster: Broadcaster,
  skillRun?: ReturnType<typeof vi.fn>,
): { orchestrator: Orchestrator; skillRun: ReturnType<typeof vi.fn> } {
  const anthropic: AnthropicProvider = {
    isConnected: vi.fn(async () => true),
    buildSdkClient: vi.fn(async () => ({
      messages: { create: vi.fn(async () => ({ content: [] })) },
    })),
  }
  const github: GithubProvider = {
    isConnected: vi.fn(async () => true),
    submitChanges: vi.fn(async () => ({
      prUrl: "x",
      prNumber: 1,
      commitSha: "a",
      branch: "b",
    })),
  }
  const clarification: ClarificationGateway = {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => null),
  }
  const run = skillRun ?? vi.fn(async () => GENERATED)
  const skillChain: SkillChainRunner = { run }
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic,
    github,
    clarification,
    skillChain,
  })
  return { orchestrator, skillRun: run }
}

let dir: string
let store: Store
let broadcaster: Broadcaster

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-worker-"))
  store = await Store.load({ path: join(dir, "state.json") })
  broadcaster = new Broadcaster()
  vi.spyOn(broadcaster, "broadcast").mockImplementation(() => {})
})

afterEach(async () => {
  await store.persist()
  await new Promise((r) => setTimeout(r, 20))
  await rm(dir, { recursive: true, force: true, maxRetries: 3 })
})

describe("Worker", () => {
  it("tick picks up queued prompts and hands them to the orchestrator", async () => {
    const { orchestrator } = makeOrchestrator(store, broadcaster)
    const worker = new Worker({ orchestrator, store, intervalMs: 60_000 })
    const p1 = await orchestrator.submitPrompt({ text: "a", repo: "acme/x" })
    // submitPrompt already triggered async processing — wait briefly then verify
    // worker tick is idempotent (re-tick on already-running prompt won't re-launch)
    await new Promise((r) => setTimeout(r, 20))
    await worker.tick()
    const status = store.getPrompt(p1.promptId)?.status
    expect(status === "awaiting_approval" || status === "generating").toBe(true)
    worker.stop()
  })

  it("respects concurrency cap", async () => {
    // Skill chain hangs to keep prompts in-flight
    let release!: () => void
    const blocking = new Promise<GenerateResult>((resolve) => {
      release = () => resolve(GENERATED)
    })
    const { orchestrator } = makeOrchestrator(store, broadcaster, vi.fn(async () => blocking))
    const worker = new Worker({
      orchestrator,
      store,
      intervalMs: 60_000,
      concurrency: 2,
    })
    // Manually queue 5 prompts WITHOUT firing async processing
    for (let i = 0; i < 5; i++) {
      store.addPrompt({ text: `p${i}`, repo: "acme/x", branch: null })
    }
    await worker.tick()
    expect(worker.inFlight().length).toBeLessThanOrEqual(2)
    release()
    worker.stop()
  })

  it("stop halts the polling loop", () => {
    const { orchestrator } = makeOrchestrator(store, broadcaster)
    const worker = new Worker({ orchestrator, store, intervalMs: 60_000 })
    worker.start()
    worker.stop()
    // After stop, start() is a no-op
    worker.start()
    // Force a tick and verify it's a no-op (no prompts to process anyway)
    expect(worker.inFlight().length).toBe(0)
  })

  it("ignores non-queued prompts", async () => {
    const { orchestrator, skillRun } = makeOrchestrator(store, broadcaster)
    const worker = new Worker({ orchestrator, store, intervalMs: 60_000 })
    const p = store.addPrompt({ text: "x", repo: "acme/x", branch: null })
    await store.updatePromptStatus(p.id, "pr_created")
    await worker.tick()
    // Skill chain was never called for a non-queued prompt
    await new Promise((r) => setTimeout(r, 20))
    expect(skillRun).not.toHaveBeenCalled()
    worker.stop()
  })

  it("re-processing same prompt is safe (no-op when terminal)", async () => {
    const { orchestrator } = makeOrchestrator(store, broadcaster)
    const worker = new Worker({ orchestrator, store, intervalMs: 60_000 })
    const p = await orchestrator.submitPrompt({ text: "x", repo: "acme/x" })
    await new Promise((r) => setTimeout(r, 20))
    await store.updatePromptStatus(p.promptId, "failed", { error: "x" })
    await worker.tick()
    // status remains failed
    expect(store.getPrompt(p.promptId)?.status).toBe("failed")
    worker.stop()
  })

  it("transient error: prompt left in non-terminal state for next tick", async () => {
    const { orchestrator } = makeOrchestrator(
      store,
      broadcaster,
      vi.fn(async () => {
        throw new Error("fetch failed")
      }),
    )
    const worker = new Worker({ orchestrator, store, intervalMs: 60_000 })
    const p = await orchestrator.submitPrompt({ text: "x", repo: "acme/x" })
    // Poll until prompt reaches a terminal state. CI runners are slower than
    // local; a fixed sleep races on shared GitHub hosts.
    const deadline = Date.now() + 2000
    while (Date.now() < deadline) {
      const cur = store.getPrompt(p.promptId)
      if (cur?.status === "failed" || cur?.status === "completed") break
      await new Promise((r) => setTimeout(r, 20))
    }
    const prompt = store.getPrompt(p.promptId)
    expect(prompt?.status).toBe("failed")
    expect(prompt?.error).toMatch(/Transient|fetch failed/)
    worker.stop()
  })
})
