import { describe, expect, it, vi } from "vitest"
import { clarifyWithSkill, type LlmClarifyInput } from "../clarify-llm.js"
import type { AnthropicLike } from "../types.js"

function mockAnthropic(text: string): { anthropic: AnthropicLike; create: ReturnType<typeof vi.fn> } {
  const create = vi.fn(async () => ({ content: [{ type: "text", text }] }))
  return { anthropic: { messages: { create } }, create }
}

function baseInput(overrides: Partial<LlmClarifyInput> = {}): LlmClarifyInput {
  const { anthropic } = mockAnthropic("{}")
  return {
    prompt: "Build a mitra suspension dashboard in backoffice",
    classification: { mode: "existing-repo", scenario: "fe_only", confidence: 0.8 },
    repoContext: { repoSlug: "backoffice", theme: "ride" },
    beFePresent: { be: false, fe: true },
    skillBodies: {
      ceo: "## Step 0: Nuclear Scope Challenge — pick a mode.",
      officeHours: "### The Six Forcing Questions — Q4 narrowest wedge.",
    },
    anthropic,
    model: "cheap-model",
    ...overrides,
  }
}

describe("clarifyWithSkill", () => {
  it("returns ID questions (lang:id) for an Indonesian prompt", async () => {
    const { anthropic } = mockAnthropic(
      JSON.stringify({
        needsClarification: true,
        ceoMode: "HOLD",
        lang: "id",
        summary: "Perlu klarifikasi surface.",
        questions: [
          {
            id: "surface",
            text: "Di halaman mana fitur ini muncul?",
            type: "free-text",
            rationale: "Menentukan file target.",
            required: true,
          },
        ],
        prdSeed: { problem: "x", user: "ops", wedge: "y", surfaces: [], risks: [] },
      }),
    )
    const out = await clarifyWithSkill(
      baseInput({ prompt: "tambahin tombol export di halaman mitra", anthropic }),
    )
    expect(out).not.toBeNull()
    expect(out?.lang).toBe("id")
    expect(out?.needsClarification).toBe(true)
    expect(out?.questions[0].text).toContain("halaman")
  })

  it("returns needsClarification:false with 0 questions for a clear prompt", async () => {
    const { anthropic } = mockAnthropic(
      JSON.stringify({
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
      }),
    )
    const out = await clarifyWithSkill(baseInput({ anthropic }))
    expect(out).not.toBeNull()
    expect(out?.needsClarification).toBe(false)
    expect(out?.questions).toHaveLength(0)
    expect(out?.prdSeed.wedge).toBe("read-only table")
  })

  it("returns null on malformed JSON so the chain can fall back", async () => {
    const { anthropic } = mockAnthropic("Sorry, I cannot produce JSON here. <not json>")
    const out = await clarifyWithSkill(baseInput({ anthropic }))
    expect(out).toBeNull()
  })

  it("returns null when the model call throws", async () => {
    const create = vi.fn(async () => {
      throw new Error("rate limit")
    })
    const out = await clarifyWithSkill(
      baseInput({ anthropic: { messages: { create } } }),
    )
    expect(out).toBeNull()
  })

  it("injects both skill bodies into the system prompt", async () => {
    const { anthropic, create } = mockAnthropic(
      JSON.stringify({ needsClarification: false, ceoMode: "HOLD", lang: "en", questions: [], prdSeed: {} }),
    )
    await clarifyWithSkill(
      baseInput({
        anthropic,
        skillBodies: {
          ceo: "CEO_SKILL_MARKER step 0",
          officeHours: "OFFICE_HOURS_MARKER six forcing",
        },
      }),
    )
    const call = create.mock.calls[0][0]
    expect(call.system).toContain("CEO_SKILL_MARKER")
    expect(call.system).toContain("OFFICE_HOURS_MARKER")
    expect(call.system).toContain("<plan-ceo-review>")
    expect(call.system).toContain("<office-hours>")
    // Repo context is folded into the user message, not the system prompt.
    expect(call.messages[0].content).toContain("Repo context:")
    expect(call.messages[0].content).toContain("backoffice")
  })

  it("clamps to at most 3 questions and treats a needsClarification:true with no usable questions as null", async () => {
    const { anthropic } = mockAnthropic(
      JSON.stringify({ needsClarification: true, ceoMode: "HOLD", lang: "en", questions: [], prdSeed: {} }),
    )
    const out = await clarifyWithSkill(baseInput({ anthropic }))
    expect(out).toBeNull()
  })
})
