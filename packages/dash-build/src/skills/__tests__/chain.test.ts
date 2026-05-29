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
              // backoffice surface mandates .js (Pages Router + JavaScript).
              // Imports a Dash DS atom so the Phase 0D DS-coverage gate
              // passes even when the prompt is UI-shaped ("dashboard").
              "Generated:\n\n```js [src/pages/suspensions.js]\n" +
              'import { useState } from "react"\n' +
              'import { Badge } from "@dash/ui"\n' +
              'export default function P() {\n  return <Badge variant="success" className="bg-primary-500 text-text-strong-950">Anda</Badge>\n}\n' +
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
    expect(r.response.files[0].path).toBe("src/pages/suspensions.js")
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

  // ─── Phase B Tier 0A/0B/0J/0K/0L ──────────────────────────────────────────
  describe("Phase B — DS-first directive + catalog + stack mandate + voice", () => {
    it("injects the DS-FIRST directive block into the system prompt (Tier 0A)", async () => {
      const deps = passingDeps()
      await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd() },
        deps,
      )
      const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.system).toContain("DS-FIRST DIRECTIVE")
      expect(call.system).toContain('import { X } from "@dash/ui"')
      expect(call.system).toContain("anti-pattern")
      expect(call.system).toContain("Badge")
    })

    it("injects the per-repo stack mandate block (Tier 0J)", async () => {
      const deps = passingDeps()
      await generateWithSkillChain(
        {
          prompt: "Add a billing tab reachable from account navigation",
          repoPath: process.cwd(),
          selectedRepo: "dash/portal-v2",
        },
        deps,
      )
      const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.system).toContain("STACK MANDATE for portal-v2")
      expect(call.system).toContain("Jotai")
      expect(call.system).toContain("App Router")
    })

    it("injects the voice register block (Tier 0K)", async () => {
      const deps = passingDeps()
      await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd() },
        deps,
      )
      const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.system).toContain("VOICE REGISTER")
      expect(call.system).toMatch(/formal "Anda"/i)
      expect(call.system).toContain('"kamu"')
    })

    it("injects the DS catalog when loadDSContext returns one (Tier 0B)", async () => {
      const deps = passingDeps({
        loadDSContext: async () => ({
          catalog: {
            atoms: [
              {
                name: "badge",
                title: "Badge",
                description: "Inline status tag — 6 statuses × 4 styles.",
                categories: ["component"],
                type: "registry:ui",
              },
              {
                name: "button",
                title: "Button",
                description: "Primary CTA.",
                categories: ["component"],
                type: "registry:ui",
              },
            ],
            blocks: [],
            templates: [],
            total: 2,
            source: "/tmp/registry.json",
          },
          compressedRules: "## Compressed rules — Always use semantic tokens.",
          domainGlossary: "## Glossary — DRV- prefix denotes a driver record.",
          loadedSources: ["/tmp/registry.json"],
          missingSources: [],
        }),
      })
      await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd() },
        deps,
      )
      const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.system).toContain("Dash DS Catalog (registry-first import targets)")
      expect(call.system).toContain("`badge`")
      expect(call.system).toContain("`button`")
      expect(call.system).toContain("Compressed Dash AI rules")
      expect(call.system).toContain("DRV-")
    })

    it("skips the catalog block when loadDSContext returns an empty registry", async () => {
      const deps = passingDeps({
        loadDSContext: async () => ({
          catalog: { atoms: [], blocks: [], templates: [], total: 0, source: null },
          compressedRules: "",
          domainGlossary: "",
          loadedSources: [],
          missingSources: ["/missing/registry.json"],
        }),
      })
      await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd() },
        deps,
      )
      const call = (deps.anthropic!.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      // The section header ends with "(registry-first import targets)" —
      // anchor against the parenthesised suffix because the DS-FIRST
      // directive block already mentions "Dash DS Catalog" in its body.
      expect(call.system).not.toContain("Dash DS Catalog (registry-first import targets)")
    })

    it("propagates a DS-context loader exception without blocking generation", async () => {
      const deps = passingDeps({
        loadDSContext: async () => {
          throw new Error("registry read failed")
        },
      })
      const r = await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd() },
        deps,
      )
      expect(r.kind).toBe("generated")
    })
  })

  describe("mode clarify gate (Stage 1a)", () => {
    function ambiguousModeIntake() {
      return {
        beCatalog: { endpoints: [], framework: "none" as const, totalEndpoints: 0 },
        dbCatalog: { tables: [], source: "none" as const },
        classification: {
          scenario: "fe_only" as const,
          confidence: 0.85,
          reasoning: "ok",
          affectedFiles: { fe: [], be: [], db: [] },
        },
        auditTrail: {
          required: false,
          reason: "n/a",
          pattern: "inline-edit-with-audit" as const,
          fieldsToLog: [],
        },
        mode: {
          mode: "ambiguous" as const,
          confidence: 0.3,
          reasoning: "no repo selected, no strong signal",
          needsClarify: "Is this an existing repo, a new product, or design exploration?",
          clarifyOptions: ["Existing repo", "New product", "Design system"],
        },
      }
    }

    it("returns clarify (single-choice + options) when mode is ambiguous", async () => {
      const deps = passingDeps()
      const r = await generateWithSkillChain(
        { prompt: "bikin sesuatu", repoPath: process.cwd(), intake: ambiguousModeIntake() },
        deps,
      )
      expect(r.kind).toBe("clarify")
      if (r.kind !== "clarify") throw new Error("expected clarify")
      expect(r.questions[0].id).toBe("intake-mode")
      expect(r.questions[0].type).toBe("single-choice")
      expect(r.questions[0].options).toEqual(["Existing repo", "New product", "Design system"])
      // Mode gate fires BEFORE any LLM call.
      expect(deps.anthropic!.messages.create).not.toHaveBeenCalled()
    })

    it("does NOT fire when mode is decided (existing-repo) — proceeds to generate", async () => {
      const intake = ambiguousModeIntake()
      intake.mode = {
        mode: "existing-repo",
        confidence: 0.95,
        reasoning: "user picked backoffice",
      } as never
      const r = await generateWithSkillChain(
        { prompt: RICH_PROMPT, repoPath: process.cwd(), intake },
        passingDeps(),
      )
      expect(r.kind).toBe("generated")
    })
  })
})
