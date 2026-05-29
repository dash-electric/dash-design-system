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
  "Build a mitra suspension dashboard in backoffice. As ops user I view audit history for KYC compliance"

const passDesign: DesignContext = {
  designContract: "Global Dash design contract: operational density.",
  cardinalRules: "CR-1...CR-8",
  voiceRules: "Anda formal",
  manifest: null,
  layeredArchitecture: "Layer 0..3",
  loadedSources: ["a"],
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

const CODEGEN_OUTPUT =
  "Generated:\n\n```js [src/pages/suspensions.js]\n" +
  'import { useState } from "react"\n' +
  'import { Badge } from "@dash/ui"\n' +
  'export default function P() {\n  return <Badge variant="success" className="bg-primary-500 text-text-strong-950">Anda</Badge>\n}\n' +
  "```\n\nUses useState. No banned libs."

/**
 * A model client that serves the CLARIFY JSON first, then CODEGEN output, then
 * (defensively) PRD synthesis JSON. The chain may make up to 3 model calls in
 * the full model-backed path: clarify → prd → codegen.
 */
function sequencedAnthropic(clarifyJson: string): {
  anthropic: AnthropicLike
  create: ReturnType<typeof vi.fn>
} {
  const create = vi.fn(async (req: { system: string }) => {
    // The clarify system prompt is the only one that embeds the skill tags.
    if (req.system.includes("<office-hours>") || req.system.includes("intake reviewer")) {
      return { content: [{ type: "text", text: clarifyJson }] }
    }
    // The PRD synthesizer system prompt identifies itself.
    if (req.system.includes("PRD synthesizer")) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              problem: "Ops cannot see mitra suspensions",
              users: ["ops user"],
              scope: ["read-only suspension table"],
              nonGoals: ["no BE changes"],
              acceptanceCriteria: ["reachable in backoffice"],
              surfaces: [{ route: "/provider", repo: "backoffice", kind: "page" }],
              data: { entities: ["mitra"], source: "mock", notes: "" },
              lang: "en",
            }),
          },
        ],
      }
    }
    // Otherwise, codegen.
    return { content: [{ type: "text", text: CODEGEN_OUTPUT }] }
  })
  return { anthropic: { messages: { create } }, create }
}

const CLEAR_CLARIFY_JSON = JSON.stringify({
  needsClarification: false,
  ceoMode: "HOLD",
  lang: "en",
  summary: "Clear scope.",
  questions: [],
  prdSeed: {
    problem: "Ops cannot see suspensions",
    user: "ops user",
    wedge: "read-only table",
    surfaces: ["/provider"],
    risks: [],
  },
})

describe("chain — model-backed intake (M3)", () => {
  it("fires the model-backed clarify (skill body in system) when anthropic present + no evaluatePRD injected", async () => {
    const { anthropic, create } = sequencedAnthropic(CLEAR_CLARIFY_JSON)
    const deps: ChainDeps = {
      anthropic,
      loadDesign: async () => passDesign,
      loadSkill: async () => passSkill,
      loadDSContext: async () => ({
        catalog: { atoms: [], blocks: [], templates: [], total: 0, source: null },
        compressedRules: "",
        domainGlossary: "## Glossary — mitra = provider.",
        loadedSources: [],
        missingSources: [],
      }),
      promptId: () => "fixed-id",
    }
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd(), selectedRepo: "dash/backoffice" },
      deps,
    )
    expect(r.kind).toBe("generated")
    // First call MUST be the clarify call, seeded with the skill body.
    const clarifyCall = create.mock.calls[0][0]
    expect(clarifyCall.system).toContain("intake reviewer for Dash Build")
    expect(clarifyCall.system).toContain("<office-hours>")
    // A `## PRD` block (authoritative spec) must reach codegen.
    const codegenCall = create.mock.calls.find((c) =>
      String(c[0].system).includes("PRD (authoritative spec)"),
    )
    expect(codegenCall).toBeDefined()
  })

  it("returns clarify carrying ceoMode + prdSeed when the model asks a question", async () => {
    const clarifyJson = JSON.stringify({
      needsClarification: true,
      ceoMode: "REDUCTION",
      lang: "en",
      summary: "Need the target surface.",
      questions: [
        {
          id: "surface",
          text: "Which existing page should host this?",
          type: "free-text",
          rationale: "Determines the target file.",
          required: true,
        },
      ],
      prdSeed: { problem: "p", user: "ops", wedge: "w", surfaces: [], risks: ["unknown surface"] },
    })
    const { anthropic } = sequencedAnthropic(clarifyJson)
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd(), selectedRepo: "dash/backoffice" },
      { anthropic, loadDesign: async () => passDesign, loadSkill: async () => passSkill },
    )
    expect(r.kind).toBe("clarify")
    if (r.kind !== "clarify") throw new Error("expected clarify")
    expect(r.ceoMode).toBe("REDUCTION")
    expect(r.prdSeed?.problem).toBe("p")
    expect(r.questions[0].id).toBe("surface")
  })

  it("falls back to the deterministic regex evaluator when no model is wired", async () => {
    // No anthropic at all → cannot even reach codegen. The deterministic regex
    // gate (evaluatePromptScope) must fire the canned thin-scope question.
    const r = await generateWithSkillChain(
      { prompt: "tambahin", repoPath: process.cwd() },
      { loadDesign: async () => passDesign, loadSkill: async () => passSkill },
    )
    expect(r.kind).toBe("clarify")
    if (r.kind !== "clarify") throw new Error("expected clarify")
    // The deterministic path does NOT attach the M3 additive fields.
    expect(r.ceoMode).toBeUndefined()
    expect(r.prdSeed).toBeUndefined()
  })

  it("uses the deterministic path (skips model clarify) when evaluatePRD is injected", async () => {
    const { anthropic, create } = sequencedAnthropic(CLEAR_CLARIFY_JSON)
    const evaluatePRD = vi.fn(async (): Promise<PRDEval> => PASSING_PRD_EVAL)
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd(), selectedRepo: "dash/backoffice" },
      { anthropic, evaluatePRD, loadDesign: async () => passDesign, loadSkill: async () => passSkill },
    )
    expect(r.kind).toBe("generated")
    expect(evaluatePRD).toHaveBeenCalledOnce()
    // No clarify call should have been made — only the single codegen call.
    const clarifyCalls = create.mock.calls.filter((c) =>
      String(c[0].system).includes("<office-hours>"),
    )
    expect(clarifyCalls).toHaveLength(0)
    expect(create).toHaveBeenCalledOnce()
  })

  it("falls back to evaluatePromptScope when the model clarify returns unparseable JSON", async () => {
    // Clarify returns junk → clarifyWithSkill yields null → the deterministic
    // evaluatePromptScope gate runs unchanged. For RICH_PROMPT that gate raises
    // its own audit-trail question, so we get a clarify WITHOUT the M3 additive
    // fields — proving the fallback path (not the model path) drove the result.
    const { anthropic } = sequencedAnthropic("not json at all")
    const r = await generateWithSkillChain(
      { prompt: RICH_PROMPT, repoPath: process.cwd(), selectedRepo: "dash/backoffice" },
      { anthropic, loadDesign: async () => passDesign, loadSkill: async () => passSkill },
    )
    expect(r.kind).toBe("clarify")
    if (r.kind !== "clarify") throw new Error("expected clarify")
    expect(r.ceoMode).toBeUndefined()
    expect(r.prdSeed).toBeUndefined()
  })
})
