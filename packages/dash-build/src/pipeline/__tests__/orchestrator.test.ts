import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../orchestrator.js"
import type {
  AnthropicProvider,
  ClarificationGateway,
  GithubProvider,
  SkillChainRunner,
} from "../types.js"
import type { GenerateResult } from "../../skills/types.js"
import type { ClarificationAnswer } from "../../clarification/types.js"

// ── Fakes ──────────────────────────────────────────────────────────────────

function makeAnthropic(connected: boolean): AnthropicProvider {
  return {
    isConnected: vi.fn(async () => connected),
    buildSdkClient: vi.fn(async () => ({
      messages: { create: vi.fn(async () => ({ content: [] })) },
    })),
  }
}

function makeGithub(connected: boolean): GithubProvider & {
  submitChanges: ReturnType<typeof vi.fn>
} {
  const submitChanges = vi.fn(async () => ({
    prUrl: "https://github.com/acme/repo/pull/42",
    prNumber: 42,
    commitSha: "abc123",
    branch: "dash-build/test",
  }))
  return {
    isConnected: vi.fn(async () => connected),
    submitChanges,
  }
}

function makeClarification(): ClarificationGateway & {
  answersRef: { current: Record<string, ClarificationAnswer> }
} {
  const answersRef = { current: {} as Record<string, ClarificationAnswer> }
  return {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => ({
      status: "answered" as const,
      mergedPrompt: "merged prompt",
      answers: answersRef.current,
    })),
    answersRef,
  }
}

function makeSkillChain(result: GenerateResult): SkillChainRunner {
  return { run: vi.fn(async () => result) }
}

const GENERATED: GenerateResult = {
  kind: "generated",
  response: {
    files: [{ path: "src/foo.tsx", language: "tsx", content: "export const x = 1" }],
    explanation: "Adds foo component",
  },
  validation: { passed: true, score: 92, errors: [], warnings: [] },
  meta: {
    promptId: "fixed-id",
    modelId: "claude-test",
    prdSectionsTouched: 4,
    detectedRepoStack: "backoffice",
    designSources: ["a"],
    skillSources: ["b"],
  },
}

const CLARIFY: GenerateResult = {
  kind: "clarify",
  questions: [
    {
      id: "surface",
      text: "Where?",
      type: "single-choice",
      options: ["backoffice", "halo"],
      rationale: "ambig",
      required: true,
    },
  ],
  summary: "vague",
  confidence: 40,
}

// ── Harness ────────────────────────────────────────────────────────────────

let dir: string
let store: Store
let broadcaster: Broadcaster
let events: Array<{ event: string; data: unknown }>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-orch-"))
  store = await Store.load({ path: join(dir, "state.json") })
  broadcaster = new Broadcaster()
  events = []
  // Spy on broadcaster.broadcast so we don't need real ws clients
  vi.spyOn(broadcaster, "broadcast").mockImplementation((event, data) => {
    events.push({ event, data })
  })
})

afterEach(async () => {
  // Let any in-flight async store.persist() calls settle before rm.
  // Multiple drain passes catch nested microtasks scheduled by addPrompt /
  // updatePromptStatus.
  await store.persist()
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
  await new Promise((r) => setImmediate(r))
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function build({
  anthropic = makeAnthropic(true),
  github = makeGithub(true),
  clarification = makeClarification(),
  skillChain = makeSkillChain(GENERATED),
}: {
  anthropic?: AnthropicProvider
  github?: GithubProvider
  clarification?: ClarificationGateway
  skillChain?: SkillChainRunner
} = {}) {
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic,
    github,
    clarification,
    skillChain,
  })
  return { orchestrator, anthropic, github, clarification, skillChain }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Orchestrator", () => {
  it("submitPrompt → returns queued and broadcasts prompts:changed", async () => {
    const { orchestrator } = build()
    const r = await orchestrator.submitPrompt({ text: "do thing", repo: "acme/x" })
    expect(r.status).toBe("queued")
    expect(events.some((e) => e.event === "prompts:changed")).toBe(true)
    // Wait one micro-tick for async processPrompt
    await new Promise((r) => setTimeout(r, 10))
  })

  it("rejects empty prompt text", async () => {
    const { orchestrator } = build()
    await expect(orchestrator.submitPrompt({ text: " " })).rejects.toThrow(
      /text required/i,
    )
  })

  it("processPrompt happy path: generating → awaiting_approval, generation:complete fired", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("awaiting_approval")
    expect(events.some((e) => e.event === "generation:complete")).toBe(true)
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact?.files.length).toBe(1)
  })

  it("clarification path: generating → clarifying, clarification:needed fired", async () => {
    const clarification = makeClarification()
    const { orchestrator } = build({
      skillChain: makeSkillChain(CLARIFY),
      clarification,
    })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("clarifying")
    expect(clarification.create).toHaveBeenCalled()
    expect(events.some((e) => e.event === "clarification:needed")).toBe(true)
  })

  it("approvePR happy path: awaiting_approval → pr_created, submitChanges called", async () => {
    const github = makeGithub(true)
    const { orchestrator } = build({ github })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
      branch: "main",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const out = await orchestrator.approvePR({ promptId: submitted.promptId })
    expect(out.prNumber).toBe(42)
    expect(out.prUrl).toMatch(/pull\/42/)
    expect(store.getPrompt(submitted.promptId)?.status).toBe("pr_created")
    expect(store.getPrompt(submitted.promptId)?.prUrl).toBe(out.prUrl)
    expect(events.some((e) => e.event === "pr:created")).toBe(true)
    expect(github.submitChanges).toHaveBeenCalled()
  })

  it("approvePR errors when prompt not in awaiting_approval", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    // do not call processPrompt — still queued
    await expect(
      orchestrator.approvePR({ promptId: submitted.promptId }),
    ).rejects.toThrow(/not ready for PR/i)
  })

  it("auth-missing-anthropic → status failed with descriptive error", async () => {
    const { orchestrator } = build({ anthropic: makeAnthropic(false) })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("failed")
    expect(prompt?.error).toMatch(/Anthropic not connected/i)
  })

  it("auth-missing-github → approvePR rejects without mutating to pr_created", async () => {
    const { orchestrator } = build({ github: makeGithub(false) })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    await expect(
      orchestrator.approvePR({ promptId: submitted.promptId }),
    ).rejects.toThrow(/GitHub/i)
    expect(store.getPrompt(submitted.promptId)?.status).toBe("failed")
  })

  it("PR body includes foundation score and file list", async () => {
    const github = makeGithub(true)
    const { orchestrator } = build({ github })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
      branch: "main",
    })
    await orchestrator.processPrompt(submitted.promptId)
    await orchestrator.approvePR({ promptId: submitted.promptId })
    const call = (github.submitChanges as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.prBody).toMatch(/Foundation match score:\*\* 92/)
    expect(call.prBody).toMatch(/src\/foo\.tsx/)
    expect(call.prBody).toMatch(/Generated via Dash Build/)
  })

  it("resumeAfterClarification merges answers and re-runs chain", async () => {
    const clarification = makeClarification()
    let callCount = 0
    const run = vi.fn(async () => {
      callCount++
      return callCount === 1 ? CLARIFY : GENERATED
    })
    const skillChain: SkillChainRunner = { run }
    const { orchestrator } = build({ clarification, skillChain })
    // Build prompt manually so we control when processPrompt runs (avoid
    // race with submitPrompt's microtask kicking off a second chain call).
    const p = store.addPrompt({ text: "do thing", repo: "acme/x", branch: null })
    await orchestrator.processPrompt(p.id)
    expect(store.getPrompt(p.id)?.status).toBe("clarifying")
    expect(run).toHaveBeenCalledTimes(1)
    await orchestrator.resumeAfterClarification(p.id)
    expect(store.getPrompt(p.id)?.status).toBe("awaiting_approval")
    expect(run).toHaveBeenCalledTimes(2)
  })

  it("skill-chain error → failed status with reason", async () => {
    const { orchestrator } = build({
      skillChain: makeSkillChain({
        kind: "error",
        reason: "boom",
        details: null,
      }),
    })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("failed")
    expect(prompt?.error).toMatch(/Skill chain failed.*boom/)
  })
})
