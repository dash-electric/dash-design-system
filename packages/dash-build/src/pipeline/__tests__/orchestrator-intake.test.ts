/**
 * Integration test — BE-aware intake wired into the orchestrator.
 *
 * Covers the contract handed off by intake/INTEGRATION-TODO.md:
 *  1. processPrompt fires the intake scanners (catalog + db + classifier + audit)
 *  2. Classification scenario is threaded into the skill chain
 *  3. Audit-trail enforcer triggers for legal/financial prompts
 *  4. SSE component:updated is emitted after generation finalizes
 *  5. Intake clarify gate fires for ambiguous prompts (confidence < 0.5)
 *
 * Uses the same fake-driver pattern as orchestrator.test.ts. Note that this
 * suite always passes `intakeEnabled: true` to opt into the new behaviour
 * (legacy tests stay hermetic by leaving it off).
 */

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
import type { GenerateResult, IntakeContext } from "../../skills/types.js"

// ── Fakes ──────────────────────────────────────────────────────────────────

function makeAnthropic(): AnthropicProvider {
  return {
    isConnected: vi.fn(async () => true),
    buildSdkClient: vi.fn(async () => ({
      messages: { create: vi.fn(async () => ({ content: [] })) },
    })),
  }
}

function makeGithub(): GithubProvider {
  return {
    isConnected: vi.fn(async () => true),
    submitChanges: vi.fn(async () => ({
      prUrl: "https://github.com/acme/repo/pull/1",
      prNumber: 1,
      commitSha: "abc",
      branch: "dash-build/test",
    })),
  }
}

function makeClarification(): ClarificationGateway {
  return {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => null),
  }
}

function makeSkillChain(result: GenerateResult): SkillChainRunner & {
  run: ReturnType<typeof vi.fn>
} {
  return { run: vi.fn(async () => result) as SkillChainRunner["run"] } as SkillChainRunner & {
    run: ReturnType<typeof vi.fn>
  }
}

const GENERATED_TSX: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "preview.tsx",
        language: "tsx",
        content:
          "import React from 'react'\nimport { InlineEditWithAudit } from '@dash/blocks/inline-edit-with-audit'\nexport default function P() { return <InlineEditWithAudit /> }",
      },
    ],
    explanation: "Adds audit-bearing inline edit.",
  },
  validation: { passed: true, score: 95, errors: [], warnings: [] },
  meta: {
    promptId: "fixed-id",
    modelId: "claude-test",
    prdSectionsTouched: 3,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

// Generated output WITHOUT any audit-bearing block — used to validate the
// CR-3 enforcer surfaces a high-severity error.
const GENERATED_NO_AUDIT: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "preview.tsx",
        language: "tsx",
        content:
          "import React from 'react'\nexport default function P() { return <input className='bg-bg-white-0 text-text-strong-950' /> }",
      },
    ],
    explanation: "Raw inline edit, missing audit block.",
  },
  validation: { passed: true, score: 90, errors: [], warnings: [] },
  meta: {
    promptId: "fixed-id-2",
    modelId: "claude-test",
    prdSectionsTouched: 3,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

// ── Harness ────────────────────────────────────────────────────────────────

let dir: string
let store: Store
let broadcaster: Broadcaster
let events: Array<{ event: string; data: unknown }>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-intake-"))
  store = await Store.load({ path: join(dir, "state.json") })
  broadcaster = new Broadcaster()
  events = []
  vi.spyOn(broadcaster, "broadcast").mockImplementation((event, data) => {
    events.push({ event, data })
  })
})

afterEach(async () => {
  await store.persist()
  for (let i = 0; i < 5; i++) await Promise.resolve()
  await new Promise((r) => setImmediate(r))
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function build(opts: {
  skillChain?: SkillChainRunner
  repoPath?: string
} = {}) {
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic: makeAnthropic(),
    github: makeGithub(),
    clarification: makeClarification(),
    skillChain: opts.skillChain ?? makeSkillChain(GENERATED_TSX),
    intakeEnabled: true,
    // Point the repo resolver at a known-empty path so the BE/DB scanners
    // return empty catalogs without throwing. The intake step still runs;
    // we just don't have real schemas to feed it.
    repoPathResolver: () => opts.repoPath ?? dir,
  })
  return { orchestrator }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Orchestrator + intake wiring", () => {
  it("processPrompt fires intake and threads classification into the skill chain", async () => {
    const skillChain = makeSkillChain(GENERATED_TSX)
    const { orchestrator } = build({ skillChain })
    // "edit invoice payout balance" deterministically classifies as
    // update_existing OR extend_fe_be (BE keywords) — never ambiguous.
    const submitted = await orchestrator.submitPrompt({
      text: "edit api endpoint to update mitra balance payout",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    expect(skillChain.run).toHaveBeenCalled()
    const arg = (skillChain.run as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      intake?: IntakeContext
    }
    expect(arg.intake).toBeDefined()
    expect(arg.intake?.classification.scenario).not.toBe("ambiguous")
    expect(arg.intake?.beCatalog).toBeDefined()
    expect(arg.intake?.dbCatalog).toBeDefined()
  })

  it("audit-trail enforcer triggers for legal/financial prompt and surfaces required=true", async () => {
    const skillChain = makeSkillChain(GENERATED_TSX)
    const { orchestrator } = build({ skillChain })
    // Add a BE keyword ("api") so the classifier doesn't short-circuit to
    // ambiguous before we reach the audit-trail check.
    const submitted = await orchestrator.submitPrompt({
      text: "add api endpoint to edit mitra topup balance and log the change",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const arg = (skillChain.run as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      intake?: IntakeContext
    }
    expect(arg.intake?.auditTrail.required).toBe(true)
    expect(arg.intake?.auditTrail.pattern).toBe("inline-edit-with-audit")
    expect(arg.intake?.auditTrail.fieldsToLog.length).toBeGreaterThan(0)
  })

  it("audit-trail enforcer triggers for image-bearing prompt (KYC pattern)", async () => {
    const skillChain = makeSkillChain(GENERATED_TSX)
    const { orchestrator } = build({ skillChain })
    const submitted = await orchestrator.submitPrompt({
      text: "add api endpoint to upload KTP proof for mitra verification",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const arg = (skillChain.run as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      intake?: IntakeContext
    }
    expect(arg.intake?.auditTrail.required).toBe(true)
    expect(arg.intake?.auditTrail.pattern).toBe("image-editor-with-audit")
  })

  it("emits SSE component:updated event after generation finalizes", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "edit api endpoint to update mitra balance payout",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const updated = events.find((e) => e.event === "component:updated")
    expect(updated).toBeDefined()
    const data = updated!.data as {
      runId: string
      componentId: string
      componentSource: string
      contextMap: {
        landsAt: string
        uses: string[]
        be: string[]
        audit: string | null
      }
    }
    expect(data.runId).toBe(submitted.promptId)
    expect(data.componentSource).toContain("InlineEditWithAudit")
    expect(data.contextMap.landsAt).toBe("preview.tsx")
    expect(data.contextMap.uses).toContain("@dash/blocks")
    expect(data.contextMap.audit).toBeTruthy()
  })

  it("intake clarify gate fires for ambiguous prompt and short-circuits the pipeline", async () => {
    const skillChain = makeSkillChain(GENERATED_TSX)
    const { orchestrator } = build({ skillChain })
    // Vague prompt — no FE/BE/DB/greenfield/update keywords → ambiguous + low conf
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const prompt = store.getPrompt(submitted.promptId)
    expect(prompt?.status).toBe("clarifying")
    // Skill chain MUST NOT be invoked when intake short-circuits
    expect(skillChain.run).not.toHaveBeenCalled()
    expect(events.some((e) => e.event === "clarification:needed")).toBe(true)
  })

  it("validator flags missing audit block when intake says CR-3 required", async () => {
    // Stub the chain so we control validation directly — bypass PRD evaluator
    // and prompt-composer (both of which may fire their own clarify gates on
    // the synthetic prompts used here). This isolates the validator contract
    // against the audit-trail enforcer output.
    const { validateOutput } = await import("../../skills/validator.js")
    const skillChain: SkillChainRunner = {
      async run(input) {
        const parsed = {
          files: [
            {
              path: "preview.tsx",
              language: "tsx",
              content:
                "import React from 'react'\n" +
                "export default function P() { return <input className='bg-bg-white-0 text-text-strong-950' /> }\n",
            },
          ],
          explanation: "Raw inline edit, missing audit block.",
        }
        const validation = validateOutput(
          parsed,
          {
            cardinalRules: "",
            designContract: "",
            voiceRules: "",
            manifest: null,
            layeredArchitecture: "",
            loadedSources: [],
            missingSources: [],
          },
          { intake: input.intake ?? null },
        )
        return {
          kind: "generated" as const,
          response: parsed,
          validation,
          meta: {
            promptId: "validator-test",
            modelId: "stub",
            prdSectionsTouched: 0,
            detectedRepoStack: null,
            designSources: [],
            skillSources: [],
          },
        }
      },
    }
    const { orchestrator } = build({ skillChain })
    const submitted = await orchestrator.submitPrompt({
      text: "add api endpoint to edit mitra topup balance",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    const cr3Error = artifact!.validation.errors.find((e) => e.ruleId === "CR-3")
    expect(cr3Error).toBeDefined()
    expect(cr3Error?.severity).toBe("high")
    expect(cr3Error?.message).toMatch(/audit/i)
  })

  // Use the legacy-prompt fixture (intake disabled) to prove old behaviour is
  // preserved when the daemon flag is off.
  it("intake disabled → vague prompt flows straight to generation (no clarify gate)", async () => {
    const skillChain = makeSkillChain(GENERATED_TSX)
    const orchestrator = new Orchestrator({
      store,
      broadcaster,
      anthropic: makeAnthropic(),
      github: makeGithub(),
      clarification: makeClarification(),
      skillChain,
      // intakeEnabled left undefined → defaults to false
      repoPathResolver: () => dir,
    })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    expect(store.getPrompt(submitted.promptId)?.status).toBe("awaiting_approval")
    expect(skillChain.run).toHaveBeenCalled()
    // No intake → no component:updated event? Actually we still emit one for
    // any tsx output, but contextMap.be should be empty.
    const updated = events.find((e) => e.event === "component:updated")
    expect(updated).toBeDefined()
    const data = updated!.data as { contextMap: { be: string[] } }
    expect(data.contextMap.be).toEqual([])
  })
})
