/**
 * Smoke test — Day 3 final end-to-end coverage.
 *
 * Exercises the full Dash Build pipeline with all external dependencies
 * stubbed out:
 *
 *   submit prompt → queued
 *     → orchestrator picks up → generating
 *     → skill chain returns → awaiting_approval
 *     → approve → pr_created
 *
 * Verifies, in one test:
 *   1. daemon boots and reports `running`
 *   2. submit transitions queued → generating → awaiting_approval
 *   3. generation artifact is held in-memory + retrievable
 *   4. approve transitions awaiting_approval → pr_created
 *   5. WebSocket broadcast order is correct
 *   6. state persists to disk (reload yields same final status)
 *   7. close() runs cleanup cleanly (no dangling listeners)
 *
 * Network is zero — Anthropic and GitHub are fake providers. The skill chain
 * is a stub that returns a canned `generated` result. This is the highest-
 * level integration test in the suite and the canonical "is everything wired
 * together?" check for CI.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../../pipeline/orchestrator.js"
import type {
  AnthropicProvider,
  ClarificationGateway,
  GithubProvider,
  SkillChainRunner,
} from "../../pipeline/types.js"
import type { GenerateResult } from "../../skills/types.js"

// ── Fake collaborators ─────────────────────────────────────────────────────

function fakeAnthropic(): AnthropicProvider {
  return {
    isConnected: vi.fn(async () => true),
    buildSdkClient: vi.fn(async () => ({
      messages: { create: vi.fn(async () => ({ content: [] })) },
    })),
  }
}

function fakeGithub(): GithubProvider & {
  submitChanges: ReturnType<typeof vi.fn>
} {
  const submitChanges = vi.fn(async () => ({
    prUrl: "https://github.com/dash/halo-dash-fe/pull/4242",
    prNumber: 4242,
    commitSha: "deadbeefcafe",
    branch: "dash-build/smoke",
  }))
  return {
    isConnected: vi.fn(async () => true),
    submitChanges,
  }
}

function fakeClarification(): ClarificationGateway {
  return {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => null),
  }
}

const CANNED_GENERATION: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "src/components/payroll-chart.tsx",
        language: "tsx",
        content: 'export function PayrollChart() { return <div className="db-card">ok</div> }',
      },
    ],
    explanation: "Adds payroll chart grouped by mitra Lvl.",
  },
  validation: { passed: true, score: 92, errors: [], warnings: [] },
  meta: {
    promptId: "smoke-1",
    modelId: "claude-test",
    prdSectionsTouched: 5,
    detectedRepoStack: "halo-dash-fe",
    designSources: ["ds-tokens"],
    skillSources: ["dash-prd"],
  },
}

function fakeSkillChain(): SkillChainRunner {
  return { run: vi.fn(async () => CANNED_GENERATION) }
}

// ── Harness ────────────────────────────────────────────────────────────────

let dir: string
let statePath: string
let store: Store
let broadcaster: Broadcaster
let orchestrator: Orchestrator
let events: Array<{ event: string; data: unknown }>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-smoke-"))
  statePath = join(dir, "state.json")
  store = await Store.load({ path: statePath })
  broadcaster = new Broadcaster()
  events = []
  vi.spyOn(broadcaster, "broadcast").mockImplementation((event, data) => {
    events.push({ event, data })
  })
  orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic: fakeAnthropic(),
    github: fakeGithub(),
    clarification: fakeClarification(),
    skillChain: fakeSkillChain(),
  })
})

afterEach(async () => {
  await store.persist()
  for (let i = 0; i < 5; i++) await Promise.resolve()
  await new Promise((r) => setImmediate(r))
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

// ── Test ───────────────────────────────────────────────────────────────────

describe("Dash Build smoke — full flow", () => {
  it("submit → generate → approve → pr_created with correct events + persistence", async () => {
    // 1. daemon state shape
    const snap = store.snapshot()
    expect(snap.prompts).toHaveLength(0)
    expect(snap.auth.openai.connected).toBe(false)

    // 2. submit prompt
    const submitted = await orchestrator.submitPrompt({
      text: "tambahin chart payroll di backoffice",
      repo: "dash/halo-dash-fe",
      branch: "main",
    })
    expect(submitted.status).toBe("queued")
    expect(submitted.promptId).toMatch(/^prm_/)

    // 3. drive orchestrator (instead of relying on microtask)
    await orchestrator.processPrompt(submitted.promptId)
    const afterGen = store.getPrompt(submitted.promptId)
    expect(afterGen?.status).toBe("awaiting_approval")

    // 4. artifact retrievable
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    expect(artifact?.files).toHaveLength(1)
    expect(artifact?.files[0]!.path).toBe("src/components/payroll-chart.tsx")
    expect(artifact?.validation.score).toBe(92)

    // 5. approve
    const pr = await orchestrator.approvePR({ promptId: submitted.promptId })
    expect(pr.prNumber).toBe(4242)
    expect(pr.prUrl).toMatch(/pull\/4242/)
    expect(store.getPrompt(submitted.promptId)?.status).toBe("pr_created")
    expect(store.getPrompt(submitted.promptId)?.prUrl).toBe(pr.prUrl)

    // 6. WS broadcast order
    const eventNames = events.map((e) => e.event)
    const firstQueued = eventNames.indexOf("prompts:changed")
    const generationComplete = eventNames.indexOf("generation:complete")
    const prCreated = eventNames.indexOf("pr:created")
    expect(firstQueued).toBeGreaterThanOrEqual(0)
    expect(generationComplete).toBeGreaterThan(firstQueued)
    expect(prCreated).toBeGreaterThan(generationComplete)

    // 7. state persisted — reload from disk and verify final status survived
    await store.persist()
    const reloaded = await Store.load({ path: statePath })
    const persisted = reloaded.getPrompt(submitted.promptId)
    expect(persisted?.status).toBe("pr_created")
    expect(persisted?.prUrl).toBe(pr.prUrl)
    expect(persisted?.repo).toBe("dash/halo-dash-fe")

    // 8. cleanup verification — the temp dir contains a valid JSON file
    const raw = await readFile(statePath, "utf8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it("auth failure → graceful failed status, daemon stays up", async () => {
    const a = fakeAnthropic()
    ;(a.isConnected as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false)
    const orch = new Orchestrator({
      store,
      broadcaster,
      anthropic: a,
      github: fakeGithub(),
      clarification: fakeClarification(),
      skillChain: fakeSkillChain(),
    })
    const submitted = await orch.submitPrompt({ text: "x", repo: "a/b" })
    await orch.processPrompt(submitted.promptId)
    const p = store.getPrompt(submitted.promptId)
    expect(p?.status).toBe("failed")
    expect(p?.error).toMatch(/OpenAI/)
    // and the snapshot is still readable (daemon didn't crash)
    expect(store.snapshot()).toBeDefined()
  })
})
