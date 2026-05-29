import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../orchestrator.js"
import { AOPEmitter } from "../../observability/aop-emitter.js"
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

// P5 — a generated artifact whose validation FAILED (e.g. a CR-3 audit-log
// rejection on a payment/KYC field). approvePR must refuse to ship this unless
// force=true is passed.
const GENERATED_FAILED: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "src/payment-form.tsx",
        language: "tsx",
        content: "export const PaymentForm = () => null",
      },
    ],
    explanation: "Adds payment form (no audit log)",
  },
  validation: {
    passed: false,
    score: 40,
    errors: [
      {
        severity: "high",
        message: "ships payment field without audit-log call",
        file: "src/payment-form.tsx",
        ruleId: "CR-3-OUTPUT",
      },
    ],
    warnings: [],
  },
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

  describe("mode-aware clone gate (2026-05-29)", () => {
    it("does NOT clone for a blank-product prompt (no repo)", async () => {
      const { orchestrator } = build()
      const spy = vi.spyOn(orchestrator, "ensureWorkspaceBootstrap")
      await orchestrator.submitPrompt({
        text: "build a brand-new product from scratch",
      })
      await new Promise((r) => setTimeout(r, 10))
      expect(spy).not.toHaveBeenCalled()
    })

    it("does NOT clone when a design-system prompt has no repo selected", async () => {
      const { orchestrator } = build()
      const spy = vi.spyOn(orchestrator, "ensureWorkspaceBootstrap")
      await orchestrator.submitPrompt({
        text: "ganti warna accent jadi biru di design system",
      })
      await new Promise((r) => setTimeout(r, 10))
      expect(spy).not.toHaveBeenCalled()
    })

    it("DOES clone when a repo is selected (existing-repo mode)", async () => {
      const { orchestrator } = build()
      const spy = vi
        .spyOn(orchestrator, "ensureWorkspaceBootstrap")
        .mockResolvedValue(undefined)
      await orchestrator.submitPrompt({
        text: "tambahin tab Delivery di detail mitra",
        repo: "dash/backoffice",
      })
      await new Promise((r) => setTimeout(r, 10))
      expect(spy).toHaveBeenCalledWith("dash/backoffice")
    })
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

  it("passes the selected repo into the skill chain for context inference", async () => {
    const skillChain = makeSkillChain(GENERATED)
    const { orchestrator } = build({ skillChain })
    const submitted = await orchestrator.submitPrompt({
      text: "add billing tab",
      repo: "dash/portal-v2",
    })
    await orchestrator.processPrompt(submitted.promptId)
    expect(skillChain.run).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedRepo: "dash/portal-v2",
      }),
    )
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

  it("Bug 6: cancelPrompt marks the prompt cancelled + broadcasts", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    // Cancel before processPrompt commits (still queued/generating).
    const out = await orchestrator.cancelPrompt(submitted.promptId)
    expect(out.status).toBe("cancelled")
    expect(store.getPrompt(submitted.promptId)?.status).toBe("cancelled")
    expect(
      events.some(
        (e) =>
          e.event === "prompts:changed" &&
          (e.data as { status?: string }).status === "cancelled",
      ),
    ).toBe(true)
    // The auto-kicked processPrompt must NOT advance a cancelled run to
    // awaiting_approval — its checkpoints bail.
    await new Promise((r) => setTimeout(r, 20))
    expect(store.getPrompt(submitted.promptId)?.status).toBe("cancelled")
    expect(orchestrator.getArtifact(submitted.promptId)).toBeUndefined()
  })

  it("Bug 6: cancelPrompt on an already-cancelled (terminal) run is a no-op", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.cancelPrompt(submitted.promptId)
    expect(store.getPrompt(submitted.promptId)?.status).toBe("cancelled")
    const before = events.length
    // Second cancel — terminal status, returns current without re-broadcasting.
    const out = await orchestrator.cancelPrompt(submitted.promptId)
    expect(out.status).toBe("cancelled")
    expect(events.length).toBe(before)
  })

  it("Bug 6: cancelPrompt throws for an unknown prompt id", async () => {
    const { orchestrator } = build()
    await expect(orchestrator.cancelPrompt("prm_nope")).rejects.toThrow(
      /not found/i,
    )
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

  it("auth-missing-openai → status failed with descriptive error", async () => {
    const { orchestrator } = build({ anthropic: makeAnthropic(false) })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("failed")
    expect(prompt?.error).toMatch(/OpenAI not connected/i)
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

  // ── F3: dev server cascade ───────────────────────────────────────────────
  describe("ensureWorkspaceBootstrap dev-server cascade (F3)", () => {
    it("cascades into workspace.startDevServer when bootstrap reaches idle", async () => {
      const { orchestrator } = build()
      // Fake workspace exposing startDevServer + minimal info() surface.
      const startDev = vi.fn(async () => undefined)
      const fakeWorkspace = {
        repoSlug: "dash/backoffice",
        clonePath: "/tmp/fake-clone",
        info: () => ({
          state: "idle",
          clonePath: "/tmp/fake-clone",
          shimCommitSha: null,
        }),
        startDevServer: startDev,
        state: {
          // No-op transition surface so wireSandboxBroadcast bails out.
          setOnTransition: undefined,
        },
      }
      // Reach into the private cascade helper for a deterministic unit test.
      type CascadeFn = (r: string, w: unknown) => Promise<void>
      const cascade = (
        orchestrator as unknown as { runDevServerStartCascade: CascadeFn }
      ).runDevServerStartCascade.bind(orchestrator)
      await cascade("dash/backoffice", fakeWorkspace)
      expect(startDev).toHaveBeenCalled()
      expect(events.some((e) => e.event === "sandbox:dev_server_starting")).toBe(true)
      expect(events.some((e) => e.event === "sandbox:dev_server_ready")).toBe(true)
    })

    it("dev server failure broadcasts sandbox:dev_server_failed without throwing", async () => {
      const { orchestrator } = build()
      const startDev = vi.fn(async () => {
        throw new Error("port already in use")
      })
      const fakeWorkspace = {
        repoSlug: "dash/backoffice",
        clonePath: "/tmp/fake-clone",
        info: () => ({
          state: "idle",
          clonePath: "/tmp/fake-clone",
          shimCommitSha: null,
        }),
        startDevServer: startDev,
        state: { setOnTransition: undefined },
      }
      type CascadeFn = (r: string, w: unknown) => Promise<void>
      const cascade = (
        orchestrator as unknown as { runDevServerStartCascade: CascadeFn }
      ).runDevServerStartCascade.bind(orchestrator)
      // Must NOT throw — cascade is best-effort by contract.
      await expect(cascade("dash/backoffice", fakeWorkspace)).resolves.toBeUndefined()
      expect(startDev).toHaveBeenCalled()
      expect(events.some((e) => e.event === "sandbox:dev_server_failed")).toBe(true)
      const failEvent = events.find((e) => e.event === "sandbox:dev_server_failed")
      expect((failEvent?.data as { error?: string })?.error).toMatch(/port already in use/)
    })

    it("cascade silently skips when Workspace lacks startDevServer (F1 not landed)", async () => {
      const { orchestrator } = build()
      const fakeWorkspace = {
        repoSlug: "dash/backoffice",
        clonePath: "/tmp/fake-clone",
        info: () => ({ state: "idle", clonePath: "", shimCommitSha: null }),
        state: { setOnTransition: undefined },
        // No startDevServer method.
      }
      type CascadeFn = (r: string, w: unknown) => Promise<void>
      const cascade = (
        orchestrator as unknown as { runDevServerStartCascade: CascadeFn }
      ).runDevServerStartCascade.bind(orchestrator)
      await expect(cascade("dash/backoffice", fakeWorkspace)).resolves.toBeUndefined()
      // No starting / ready events fired — pure no-op when the F1 method is absent.
      expect(events.some((e) => e.event === "sandbox:dev_server_starting")).toBe(false)
      expect(events.some((e) => e.event === "sandbox:dev_server_ready")).toBe(false)
      expect(events.some((e) => e.event === "sandbox:dev_server_failed")).toBe(false)
    })
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

  // ── P5: approvePR rejects unvalidated artifacts ───────────────────────────
  it("P5: approvePR refuses to open a PR when validation.passed === false", async () => {
    const github = makeGithub(true)
    const { orchestrator } = build({
      github,
      skillChain: makeSkillChain(GENERATED_FAILED),
    })
    const submitted = await orchestrator.submitPrompt({
      text: "add payment form",
      repo: "acme/x",
      branch: "main",
    })
    await orchestrator.processPrompt(submitted.promptId)
    expect(store.getPrompt(submitted.promptId)?.status).toBe("awaiting_approval")
    // The artifact failed validation — approvePR must throw and NEVER call
    // submitChanges (the merge-button-hidden guard is client-only).
    await expect(
      orchestrator.approvePR({ promptId: submitted.promptId }),
    ).rejects.toThrow(/failed validation/i)
    expect(github.submitChanges).not.toHaveBeenCalled()
    expect(store.getPrompt(submitted.promptId)?.status).toBe("awaiting_approval")
    expect(events.some((e) => e.event === "validation:rejected")).toBe(true)
  })

  it("P5: approvePR with force=true ships a failed artifact + broadcasts the override", async () => {
    const github = makeGithub(true)
    const { orchestrator } = build({
      github,
      skillChain: makeSkillChain(GENERATED_FAILED),
    })
    const submitted = await orchestrator.submitPrompt({
      text: "add payment form",
      repo: "acme/x",
      branch: "main",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const out = await orchestrator.approvePR({
      promptId: submitted.promptId,
      force: true,
    })
    expect(out.prNumber).toBe(42)
    expect(github.submitChanges).toHaveBeenCalled()
    expect(store.getPrompt(submitted.promptId)?.status).toBe("pr_created")
    expect(events.some((e) => e.event === "validation:forced")).toBe(true)
  })

  // ── P4: new-file path-policy gate over artifact.files ─────────────────────
  it("P4: new-file at a protected path is rejected before writeGeneratedFiles", async () => {
    const written: Array<{ branch: string; files: Array<{ path: string }> }> = []
    const branchManager = {
      startRun: vi.fn(async () => ({ branchName: "dash-build/run" })),
      writeGeneratedFiles: vi.fn(
        async (branch: string, files: Array<{ path: string }>) => {
          written.push({ branch, files })
        },
      ),
      rollback: vi.fn(async () => {}),
    }
    const fakeWorkspace = {
      repoSlug: "acme/x",
      // clonePath points at a dir with no files, so overwrite-detection is off
      // and we isolate the protected-path rejection.
      clonePath: join(dir, "empty-clone"),
      info: () => ({ state: "idle", clonePath: join(dir, "empty-clone"), shimCommitSha: null }),
      state: {
        setOnTransition: undefined,
        setRunIdForNextTransition: vi.fn(),
        transition: vi.fn(),
      },
    }
    const protectedResult: GenerateResult = {
      kind: "generated",
      response: {
        files: [
          { path: "src/lib/auth/session.ts", language: "ts", content: "export const x = 1" },
          { path: "src/widgets/Safe.tsx", language: "tsx", content: "export const Safe = () => null" },
        ],
        explanation: "one protected, one safe",
      },
      validation: { passed: true, score: 90, errors: [], warnings: [] },
      meta: {
        promptId: "fixed-id",
        modelId: "claude-test",
        prdSectionsTouched: 1,
        detectedRepoStack: "backoffice",
        designSources: [],
        skillSources: [],
      },
    }
    const orchestrator = new Orchestrator({
      store,
      broadcaster,
      anthropic: makeAnthropic(true),
      github: makeGithub(true),
      clarification: makeClarification(),
      skillChain: makeSkillChain(protectedResult),
      workspace: fakeWorkspace as never,
      branchManager: branchManager as never,
    })
    const submitted = await orchestrator.submitPrompt({
      text: "touch auth",
      repo: "acme/x",
    })
    // submitPrompt auto-kicks the run (queueMicrotask); the in-flight guard
    // makes an explicit processPrompt a no-op, so poll the auto-run to terminal.
    for (let i = 0; i < 200; i++) {
      const p = store.getPrompt(submitted.promptId)
      if (p && (p.status === "awaiting_approval" || p.status === "failed")) break
      await new Promise((r) => setTimeout(r, 25))
    }

    // Every commit must drop the auth path and keep the safe file.
    expect(branchManager.writeGeneratedFiles).toHaveBeenCalled()
    for (const w of written) {
      const committed = w.files.map((f) => f.path)
      expect(committed).toContain("src/widgets/Safe.tsx")
      expect(committed).not.toContain("src/lib/auth/session.ts")
    }

    // The rejection is surfaced on the artifact + broadcast.
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(
      artifact?.rejectedPatches?.some(
        (r) => r.path === "src/lib/auth/session.ts" && r.reason === "touches-protected-path",
      ),
    ).toBe(true)
    expect(events.some((e) => e.event === "patches:rejected")).toBe(true)
  })

  it("P4: new-file that overwrites an existing trunk file is rejected as covert-modify", async () => {
    const cloneDir = join(dir, "clone-overwrite")
    await mkdir(join(cloneDir, "src"), { recursive: true })
    await writeFile(join(cloneDir, "src", "Existing.tsx"), "export const Old = 1", "utf8")

    const written: Array<{ files: Array<{ path: string }> }> = []
    const branchManager = {
      startRun: vi.fn(async () => ({ branchName: "dash-build/run" })),
      writeGeneratedFiles: vi.fn(async (_b: string, files: Array<{ path: string }>) => {
        written.push({ files })
      }),
      rollback: vi.fn(async () => {}),
    }
    const fakeWorkspace = {
      repoSlug: "acme/x",
      clonePath: cloneDir,
      info: () => ({ state: "idle", clonePath: cloneDir, shimCommitSha: null }),
      state: {
        setOnTransition: undefined,
        setRunIdForNextTransition: vi.fn(),
        transition: vi.fn(),
      },
    }
    const overwriteResult: GenerateResult = {
      kind: "generated",
      response: {
        files: [
          { path: "src/Existing.tsx", language: "tsx", content: "export const New = 2" },
          { path: "src/Brand.tsx", language: "tsx", content: "export const Brand = () => null" },
        ],
        explanation: "overwrites existing + adds new",
      },
      validation: { passed: true, score: 90, errors: [], warnings: [] },
      meta: {
        promptId: "fixed-id",
        modelId: "claude-test",
        prdSectionsTouched: 1,
        detectedRepoStack: "backoffice",
        designSources: [],
        skillSources: [],
      },
    }
    const orchestrator = new Orchestrator({
      store,
      broadcaster,
      anthropic: makeAnthropic(true),
      github: makeGithub(true),
      clarification: makeClarification(),
      skillChain: makeSkillChain(overwriteResult),
      workspace: fakeWorkspace as never,
      branchManager: branchManager as never,
    })
    const submitted = await orchestrator.submitPrompt({
      text: "rewrite existing",
      repo: "acme/x",
    })
    // Poll the auto-kicked run to terminal (explicit processPrompt is a no-op
    // under the in-flight guard).
    for (let i = 0; i < 200; i++) {
      const p = store.getPrompt(submitted.promptId)
      if (p && (p.status === "awaiting_approval" || p.status === "failed")) break
      await new Promise((r) => setTimeout(r, 25))
    }

    for (const w of written) {
      const committed = w.files.map((f) => f.path)
      expect(committed).toContain("src/Brand.tsx")
      expect(committed).not.toContain("src/Existing.tsx")
    }
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(
      artifact?.rejectedPatches?.some(
        (r) => r.path === "src/Existing.tsx" && r.reason === "modifies-existing-logic",
      ),
    ).toBe(true)
  })

  // ── AOP live narration (Claude-Code-style action stream) ──────────────────
  describe("AOP step narration", () => {
    function aopEvents() {
      return events
        .filter((e) => e.event === "aop")
        .map((e) => e.data as { type: string; payload: Record<string, unknown> })
    }

    // submitPrompt kicks an auto-run via queueMicrotask; calling processPrompt
    // again would interleave a second run. Instead we let the auto-run drive
    // and poll until the prompt reaches a terminal state.
    async function runToTerminal(promptId: string): Promise<void> {
      for (let i = 0; i < 200; i++) {
        const p = store.getPrompt(promptId)
        if (p && (p.status === "awaiting_approval" || p.status === "failed" || p.status === "clarifying")) {
          return
        }
        await new Promise((r) => setTimeout(r, 25))
      }
    }

    function buildWithAop(skillChain: SkillChainRunner = makeSkillChain(GENERATED)) {
      // Real emitter wired to the test broadcaster (spy captures "aop" frames
      // into `events`). validate:true regresses any malformed envelope.
      const aopEmitter = new AOPEmitter({
        broadcaster,
        runsRoot: join(dir, "runs"),
        validate: true,
      })
      const orchestrator = new Orchestrator({
        store,
        broadcaster,
        anthropic: makeAnthropic(true),
        github: makeGithub(true),
        clarification: makeClarification(),
        skillChain,
        aopEmitter,
        intakeEnabled: true,
      })
      return { orchestrator }
    }

    it("emits an ordered run.start → scan → plan → thinking → validate → artifact → run.end sequence with non-empty narration", async () => {
      const { orchestrator } = buildWithAop()
      // New-addition keyword + no catalog match → new_product @ 0.72 conf, so
      // the intake clarify gate does NOT fire and the full chain runs.
      const submitted = await orchestrator.submitPrompt({
        text: "tambahin dashboard baru untuk performance mitra",
        repo: "dash/backoffice",
      })
      await runToTerminal(submitted.promptId)

      const seq = aopEvents()
      const types = seq.map((e) => e.type)

      // Ordered milestone presence (subsequence — allows extra thinking lines).
      const expectedOrder = [
        "run.start",
        "scan",
        "scan",
        "thinking", // plan
        "thinking", // generating
        "validate",
        "artifact",
        "run.end",
      ]
      let cursor = 0
      for (const want of expectedOrder) {
        const idx = types.indexOf(want, cursor)
        expect(idx, `missing ${want} after index ${cursor} in [${types.join(", ")}]`).toBeGreaterThanOrEqual(0)
        cursor = idx + 1
      }

      // First + last bookend the run.
      expect(types[0]).toBe("run.start")
      expect(types[types.length - 1]).toBe("run.end")

      // Narration strings are non-empty + human-readable.
      const scans = seq.filter((e) => e.type === "scan")
      expect((scans[0]!.payload.snippet as string)).toMatch(/Reading .* context/i)
      expect((scans[1]!.payload.snippet as string)).toMatch(/Found \d+ API endpoint/i)

      const thinkings = seq.filter((e) => e.type === "thinking")
      expect(thinkings.some((t) => /^Plan:/.test(t.payload.md as string))).toBe(true)
      expect(thinkings.some((t) => /Generating component/.test(t.payload.md as string))).toBe(true)

      const validate = seq.find((e) => e.type === "validate")!
      expect(validate.payload.target as string).toMatch(/Validating against Dash DS/i)
      expect(validate.payload.overall).toBe("pass")

      const artifact = seq.find((e) => e.type === "artifact")!
      expect(artifact.payload.path).toBe("src/foo.tsx")
      expect(artifact.payload.diff as string).toMatch(/^Wrote /)

      const runEnd = seq[seq.length - 1]!
      expect(runEnd.payload.status).toBe("success")
      expect(runEnd.payload.reason as string).toMatch(/Done — 1 file, score 92/)
    })

    it("P11: run.end carries a real (non-zero) durationMs from wall-clock start", async () => {
      const { orchestrator } = buildWithAop()
      const submitted = await orchestrator.submitPrompt({
        text: "tambahin dashboard baru untuk performance mitra",
        repo: "dash/backoffice",
      })
      await runToTerminal(submitted.promptId)

      const seq = aopEvents()
      const runEnd = seq[seq.length - 1]!
      expect(runEnd.type).toBe("run.end")
      // durationMs is wall-clock — must be a real, non-negative number rather
      // than the old hardcoded 0. (Could theoretically be 0 on an absurdly
      // fast machine, so assert it's at least present + numeric + the summary
      // carries the estimated token total from the cost ledger wiring.)
      expect(typeof runEnd.payload.durationMs).toBe("number")
      expect(runEnd.payload.durationMs as number).toBeGreaterThan(0)
      const summary = runEnd.payload.summary as {
        totalTokens: number
        totalUsd: number
      }
      expect(summary.totalTokens).toBeGreaterThan(0)
    })

    it("emits error + failed run.end with a 'Failed:' narration on chain failure", async () => {
      const { orchestrator } = buildWithAop(
        makeSkillChain({ kind: "error", reason: "boom", details: null }),
      )
      const submitted = await orchestrator.submitPrompt({
        text: "tambahin dashboard baru untuk performance mitra",
        repo: "dash/backoffice",
      })
      await runToTerminal(submitted.promptId)

      const seq = aopEvents()
      const error = seq.find((e) => e.type === "error")
      expect(error).toBeDefined()
      expect(error!.payload.message as string).toMatch(/^Failed:/)

      const last = seq[seq.length - 1]!
      expect(last.type).toBe("run.end")
      expect(last.payload.status).toBe("failed")
    })
  })
})
