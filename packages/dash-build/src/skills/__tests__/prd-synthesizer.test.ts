import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  synthesizePrd,
  writePrdSnapshot,
  fallbackPrd,
  detectLang,
  extractFirstJsonObject,
  type SynthesizePrdInput,
} from "../prd-synthesizer.js"
import {
  composeSystemPrompt,
  inferRepoContextPack,
  renderPrd,
  type ComposeInput,
} from "../prompt-composer.js"
import type {
  AnthropicLike,
  DashPRD,
  DesignContext,
  PRDEval,
  SkillContext,
} from "../types.js"

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function baseSynthInput(over: Partial<SynthesizePrdInput> = {}): SynthesizePrdInput {
  return {
    prompt: "Add an export button to the mitra suspension table",
    promptId: "run-123",
    answers: { "target-surface": "/provider page" },
    prdSeed: {
      problem: "Ops cannot export the suspension list for audit",
      user: "Dash internal ops user",
      wedge: "A single CSV export button on the existing table",
      surfaces: ["/provider"],
      risks: ["large export may time out"],
    },
    classification: {
      scenario: "update_existing",
      repoSlug: "backoffice",
      confidence: 0.8,
      affectedFiles: { fe: ["/repo/src/pages/provider/index.js"], be: [], db: [] },
    },
    designContract: "Operational density, semantic tokens, registry-first.",
    glossary: "mitra = driver/provider partner. suspension = temporary block.",
    ...over,
  }
}

// ---------------------------------------------------------------------------
// detectLang
// ---------------------------------------------------------------------------

describe("detectLang", () => {
  it("detects Indonesian from id stopwords", () => {
    expect(detectLang("tambahin tombol export di halaman provider")).toBe("id")
  })
  it("detects English by default", () => {
    expect(detectLang("Add an export button to the table")).toBe("en")
  })
})

// ---------------------------------------------------------------------------
// extractFirstJsonObject
// ---------------------------------------------------------------------------

describe("extractFirstJsonObject", () => {
  it("pulls the first balanced object out of noisy text", () => {
    const text = 'Here is the spec:\n{"problem":"x","nested":{"a":1}} trailing junk'
    const obj = extractFirstJsonObject(text) as Record<string, unknown>
    expect(obj.problem).toBe("x")
  })
  it("returns null on malformed JSON", () => {
    expect(extractFirstJsonObject("not json at all")).toBeNull()
    expect(extractFirstJsonObject('{"unbalanced": ')).toBeNull()
  })
  it("ignores braces inside strings", () => {
    const obj = extractFirstJsonObject('{"problem":"a } b"}') as Record<string, unknown>
    expect(obj.problem).toBe("a } b")
  })
})

// ---------------------------------------------------------------------------
// synthesizePrd — fallback (no model)
// ---------------------------------------------------------------------------

describe("synthesizePrd — deterministic fallback", () => {
  it("produces a well-formed PRD from prompt + answers + seed", async () => {
    const prd = await synthesizePrd(baseSynthInput())
    expect(prd.version).toBe(1)
    expect(prd.promptId).toBe("run-123")
    expect(prd.problem).toBe("Ops cannot export the suspension list for audit")
    expect(prd.users.length).toBeGreaterThan(0)
    expect(prd.scope.length).toBeGreaterThan(0)
    expect(prd.nonGoals.length).toBeGreaterThan(0)
    expect(prd.acceptanceCriteria.length).toBeGreaterThan(0)
    expect(prd.surfaces.length).toBeGreaterThan(0)
    // update_existing → api source.
    expect(prd.data.source).toBe("api")
    expect(prd.sources).toContain("fallback")
    expect(prd.sources).toContain("prdSeed")
    // risk surfaced from the seed should appear as a mitigation AC.
    expect(prd.acceptanceCriteria.some((c) => c.includes("time out"))).toBe(true)
  })

  it("falls back to the prompt first line when no seed problem", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({ prdSeed: undefined, answers: {} }),
    )
    expect(prd.problem).toBe("Add an export button to the mitra suspension table")
    expect(prd.users.length).toBeGreaterThan(0)
    expect(prd.surfaces.length).toBeGreaterThan(0) // affectedFiles → surfaces
  })

  it("fe_only scenario maps to mock data source", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({
        classification: {
          scenario: "fe_only",
          repoSlug: "portal-v2",
          confidence: 0.7,
          affectedFiles: null,
        },
        prdSeed: undefined,
      }),
    )
    expect(prd.data.source).toBe("mock")
    expect(prd.data.notes).toContain("mock")
  })

  it("mirrors Indonesian language in the fallback", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({
        prompt: "tambahin tombol export di halaman provider",
        prdSeed: undefined,
        lang: undefined,
      }),
    )
    expect(prd.lang).toBe("id")
  })

  it("always returns a surface even with no seed + no affected files", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({
        prdSeed: undefined,
        classification: {
          scenario: "new_product",
          repoSlug: "unknown",
          confidence: 0.3,
          affectedFiles: null,
        },
      }),
    )
    expect(prd.surfaces.length).toBe(1)
    expect(prd.surfaces[0]!.kind).toBe("component")
  })
})

// ---------------------------------------------------------------------------
// synthesizePrd — model-backed
// ---------------------------------------------------------------------------

function mockAnthropic(json: string): AnthropicLike {
  return {
    messages: {
      create: async () => ({ content: [{ type: "text", text: json }] }),
    },
  }
}

describe("synthesizePrd — model-backed", () => {
  it("parses a valid DashPRD from the model JSON", async () => {
    const modelJson = JSON.stringify({
      problem: "Ops need a CSV export",
      users: ["Ops analyst Budi"],
      scope: ["Add export button", "Trigger CSV download"],
      nonGoals: ["No async job queue"],
      acceptanceCriteria: ["Clicking export downloads a CSV"],
      surfaces: [{ route: "/provider", repo: "backoffice", kind: "page" }],
      data: { entities: ["Provider"], source: "api", notes: "reuse existing list endpoint" },
      lang: "en",
    })
    const prd = await synthesizePrd(
      baseSynthInput({ anthropic: mockAnthropic(modelJson), model: "test-model" }),
    )
    expect(prd.problem).toBe("Ops need a CSV export")
    expect(prd.users).toEqual(["Ops analyst Budi"])
    expect(prd.surfaces[0]!.route).toBe("/provider")
    expect(prd.data.entities).toEqual(["Provider"])
    expect(prd.sources).toContain("model")
  })

  it("falls back deterministically when the model emits non-JSON", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({ anthropic: mockAnthropic("sorry, I cannot do that"), model: "m" }),
    )
    expect(prd.sources).toContain("fallback")
    expect(prd.problem).toBe("Ops cannot export the suspension list for audit")
  })

  it("falls back when the model omits the problem", async () => {
    const prd = await synthesizePrd(
      baseSynthInput({
        anthropic: mockAnthropic(JSON.stringify({ scope: ["x"] })),
        model: "m",
      }),
    )
    expect(prd.sources).toContain("fallback")
  })

  it("falls back when the model call throws", async () => {
    const throwing: AnthropicLike = {
      messages: { create: async () => { throw new Error("network") } },
    }
    const prd = await synthesizePrd(baseSynthInput({ anthropic: throwing, model: "m" }))
    expect(prd.sources).toContain("fallback")
    expect(prd.version).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// writePrdSnapshot
// ---------------------------------------------------------------------------

describe("writePrdSnapshot", () => {
  let root: string
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "dash-build-prd-"))
  })
  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it("writes prd.json to the run dir with the expected shape", async () => {
    const prd = fallbackPrd(baseSynthInput())
    const file = await writePrdSnapshot("run-123", prd, root)
    expect(file).toBe(join(root, "run-123", "prd.json"))
    const raw = JSON.parse(await readFile(file, "utf8")) as DashPRD
    expect(raw.version).toBe(1)
    expect(raw.promptId).toBe("run-123")
    expect(raw.problem).toBe(prd.problem)
    expect(Array.isArray(raw.surfaces)).toBe(true)
  })

  it("sanitizes the run id into the dir name", async () => {
    const prd = fallbackPrd(baseSynthInput({ promptId: "weird/id:1" }))
    const file = await writePrdSnapshot("weird/id:1", prd, root)
    expect(file).toContain("weird_id_1")
  })
})

// ---------------------------------------------------------------------------
// renderPrd + composer `## PRD` block
// ---------------------------------------------------------------------------

function prdEval(): PRDEval {
  return {
    needsClarification: false,
    questions: [],
    summary: "Add export button.",
    sectionsTouched: 1,
    confidence: 80,
  }
}
function design(): DesignContext {
  return {
    designContract: "",
    cardinalRules: "",
    voiceRules: "",
    manifest: null,
    layeredArchitecture: "Layer 1 atoms first.",
    loadedSources: [],
    missingSources: [],
  }
}
function skill(): SkillContext {
  return { systemAppend: "", sources: [], detectedRepoStack: null, schemaVersion: 4 }
}
function composeInput(dashPrd?: DashPRD): ComposeInput {
  return {
    prd: prdEval(),
    design: design(),
    skill: skill(),
    repoContext: inferRepoContextPack({
      prompt: "add export button",
      selectedRepo: "dash/backoffice",
      detectedRepo: "backoffice",
      detectedLayer: "ride",
      repoPath: null,
    }),
    dashPrd: dashPrd ?? null,
  }
}

describe("renderPrd", () => {
  it("renders all PRD sections", () => {
    const prd = fallbackPrd(baseSynthInput())
    const out = renderPrd(prd)
    expect(out).toContain("Problem:")
    expect(out).toContain("Users:")
    expect(out).toContain("Scope")
    expect(out).toContain("Non-goals")
    expect(out).toContain("Acceptance criteria")
    expect(out).toContain("Surfaces:")
    expect(out).toContain("Data:")
    expect(out).toContain("AUTHORITATIVE")
  })
})

describe("composeSystemPrompt — `## PRD` block", () => {
  it("renders the PRD block when ctx.dashPrd is present", () => {
    const prd = fallbackPrd(baseSynthInput())
    const prompt = composeSystemPrompt(composeInput(prd))
    expect(prompt).toContain("PRD (authoritative spec)")
    expect(prompt).toContain("Acceptance criteria")
    expect(prompt).toContain(prd.problem)
  })

  it("omits the PRD block when ctx.dashPrd is absent", () => {
    const prompt = composeSystemPrompt(composeInput(undefined))
    expect(prompt).not.toContain("PRD (authoritative spec)")
    // legacy PRD Context section still present.
    expect(prompt).toContain("PRD Context")
  })
})
