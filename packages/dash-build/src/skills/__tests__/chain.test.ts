import { describe, expect, it, vi } from "vitest"
import { generateWithSkillChain } from "../chain.js"
import type {
  AnthropicLike,
  ChainDeps,
  DesignContext,
  PRDEval,
  SkillContext,
} from "../types.js"

const RICH_PROMPT =
  "Build a mitra suspension dashboard in backoffice. As ops user I view audit history for KYC compliance via GET /api/mitra/suspensions"

const passDesign: DesignContext = {
  designContract: "Global Dash design contract: use operational density and registry-first components.",
  cardinalRules: "CR-1...CR-8",
  voiceRules: "Anda formal",
  manifest: null,
  layeredArchitecture: "Layer 0..3",
  loadedSources: ["a", "b"],
  missingSources: [],
}

const passSkill: SkillContext = {
  systemAppend: "Per-repo: backoffice Next pages + useState + axios",
  sources: ["dash info"],
  detectedRepoStack: "backoffice",
  schemaVersion: 4,
}

const PASSING_PRD_EVAL: PRDEval = {
  needsClarification: false,
  questions: [],
  summary: "Build suspension dashboard — touches: Solution, Personas",
  sectionsTouched: 3,
  confidence: 90,
}

function passingDeps(overrides: Partial<ChainDeps> = {}): ChainDeps {
  const anthropic: AnthropicLike = {
    messages: {
      create: vi.fn(async () => ({
        content: [
          {
            type: "text",
            text:
              "Generated:\n\n```tsx [src/pages/suspensions.tsx]\n" +
              'import { useState } from "react"\n' +
              'export default function P() {\n  return <div className="bg-primary-500 text-text-strong-950">Anda</div>\n}\n' +
              "```\n\nUses useState. No banned libs.",
          },
        ],
      })),
    },
  }
  return {
    anthropic,
    evaluatePRD: async () => PASSING_PRD_EVAL,
    loadDesign: async () => passDesign,
    loadSkill: async () => passSkill,
    promptId: () => "fixed-id",
    modelId: "claude-test",
    ...overrides,
  }
}

describe("generateWithSkillChain", () => {
  it("returns clarify when PRD evaluator surfaces questions", async () => {
    const deps = passingDeps({
      evaluatePRD: async (): Promise<PRDEval> => ({
        needsClarification: true,
        questions: [
          {
            id: "target-surface",
            text: "Where?",
            type: "single-choice",
            options: ["backoffice", "halo-dash-fe"],
            rationale: "x",
            required: true,
          },
        ],
        summary: "",
        sectionsTouched: 0,
        confidence: 50,
      }),
    })
    const r = await generateWithSkillChain(
      { prompt: "tambahin", repoPath: process.cwd() },
      deps,
    )
    expect(r.kind).toBe("clarify")
  })

  it("calls the model with the composed system prompt when scope is clear", async () => {
    const deps = passingDeps()
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    expect(r.kind).toBe("generated")
    expect(deps.anthropic!.messages.create).toHaveBeenCalledOnce()
    const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.system).toContain("Global Design Contract")
    expect(call.system).toContain("Global Dash design contract")
    expect(call.system).toContain("Cardinal Rules")
    expect(call.system).toContain("Layered Architecture")
    expect(call.system).toContain("Per-Repo Stack Mandate")
    expect(call.system).toContain("Repo Context Pack")
    expect(call.system).toContain("Banned Imports")
    expect(call.system).toContain("ALWAYS include a first file named `preview.tsx`")
    expect(call.messages[0].content).toBe(RICH_PROMPT)
  })

  it("injects selected repo, inferred audience/theme, nav, mock-data, and reuse constraints", async () => {
    const deps = passingDeps()
    const r = await generateWithSkillChain(
      {
        prompt: "Add a billing tab reachable from account navigation",
        repoPath: process.cwd(),
        selectedRepo: "dash/portal-v2",
      },
      deps,
    )
    expect(r.kind).toBe("generated")
    const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.system).toContain("Selected repo: dash/portal-v2")
    expect(call.system).toContain("Inferred surface: portal-v2")
    expect(call.system).toContain("Inferred audience: client/web portal users")
    expect(call.system).toContain("Theme metadata: ride")
    expect(call.system).toContain("Known shell nav: Home, Trips, Payments, Support, Users, Billing")
    expect(call.system).toContain("Default route: /en/deliveries")
    expect(call.system).toContain("Target route: /en/billing")
    expect(call.system).toContain("Target nav label: Billing")
    expect(call.system).toContain("Existing shell constraint: Integrate into the selected repo")
    expect(call.system).toContain("Integration contract: Target route: /en/billing")
    expect(call.system).toContain("P0 data policy: mock-data-only")
    expect(call.system).toContain("Route/nav requirement: Include the production route/page file")
    expect(call.system).toContain("do not generate a standalone app shell")
    expect(call.system).toContain('active nav "Billing"')
    expect(call.system).toContain("route /en/billing")
    expect(call.system).toContain("Render only the feature/page content")
    expect(call.system).toContain("Reuse existing Dash DS registry components")
    expect(call.system).toContain("component candidate")
    if (r.kind === "generated") {
      expect(r.meta.repoContext?.repoSlug).toBe("portal-v2")
      expect(r.meta.repoContext?.requiresNavOrRoute).toBe(true)
      expect(r.meta.repoContext?.targetRoute).toBe("/en/billing")
      expect(r.meta.repoContext?.targetNavLabel).toBe("Billing")
    }
  })

  it("passes inferred repo context into PRD evaluation", async () => {
    const evaluatePRD = vi.fn(async (): Promise<PRDEval> => PASSING_PRD_EVAL)
    const deps = passingDeps({ evaluatePRD })
    await generateWithSkillChain(
      {
        prompt: "Add a compact statement page",
        repoPath: process.cwd(),
        selectedRepo: "dash/backoffice",
      },
      deps,
    )
    expect(evaluatePRD).toHaveBeenCalledWith(
      expect.objectContaining({
        detectedRepo: "backoffice",
        detectedLayer: "ride",
      }),
    )
  })

  it("invokes design + skill loaders in parallel", async () => {
    const order: string[] = []
    const deps = passingDeps({
      loadDesign: async () => {
        order.push("design-start")
        await new Promise((r) => setTimeout(r, 5))
        order.push("design-end")
        return passDesign
      },
      loadSkill: async () => {
        order.push("skill-start")
        await new Promise((r) => setTimeout(r, 5))
        order.push("skill-end")
        return passSkill
      },
    })
    await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    // Both starts should appear before either end (parallel execution)
    const designStart = order.indexOf("design-start")
    const skillStart = order.indexOf("skill-start")
    const designEnd = order.indexOf("design-end")
    expect(Math.max(designStart, skillStart)).toBeLessThan(designEnd)
  })

  it("returns generated result with parsed files + validation", async () => {
    const deps = passingDeps()
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    if (r.kind !== "generated") throw new Error("expected generated")
    expect(r.response.files).toHaveLength(1)
    expect(r.response.files[0].path).toBe("src/pages/suspensions.tsx")
    expect(r.validation.passed).toBe(true)
    expect(r.meta.promptId).toBe("fixed-id")
    expect(r.meta.modelId).toBe("claude-test")
    expect(r.meta.detectedRepoStack).toBe("backoffice")
  })

  it("returns error when no model client is wired", async () => {
    const deps = passingDeps()
    deps.anthropic = undefined
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    expect(r.kind).toBe("error")
    if (r.kind === "error") expect(r.reason).toMatch(/OpenAI\/Codex/)
  })

  it("returns error when model generation throws", async () => {
    const deps = passingDeps({
      anthropic: {
        messages: {
          create: vi.fn(async () => {
            throw new Error("rate limit")
          }),
        },
      },
    })
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    expect(r.kind).toBe("error")
    if (r.kind === "error") expect(r.reason).toMatch(/model generation/i)
  })

  it("validates banned imports in Claude output and marks validation.passed=false", async () => {
    const deps = passingDeps({
      anthropic: {
        messages: {
          create: vi.fn(async () => ({
            content: [
              {
                type: "text",
                text:
                  "```tsx [src/bad.tsx]\n" +
                  'import { useForm } from "react-hook-form"\n' +
                  'export const B = () => <div className="bg-primary-500 text-text-strong-950">x</div>\n' +
                  "```",
              },
            ],
          })),
        },
      },
    })
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    if (r.kind !== "generated") throw new Error("expected generated")
    expect(r.validation.passed).toBe(false)
    expect(
      r.validation.errors.some((e) => e.message.includes("react-hook-form")),
    ).toBe(true)
  })

  it("propagates degraded design context without failing the chain", async () => {
    const deps = passingDeps({
      loadDesign: async () => ({
        ...passDesign,
        cardinalRules: "",
        voiceRules: "",
        missingSources: ["rules", "voice"],
        loadedSources: [],
      }),
    })
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd() },
      deps,
    )
    expect(r.kind).toBe("generated")
    if (r.kind === "generated") {
      expect(r.validation.warnings.some((w) => w.toLowerCase().includes("degraded"))).toBe(true)
    }
  })
})
