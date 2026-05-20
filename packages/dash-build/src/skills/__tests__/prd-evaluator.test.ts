import { describe, expect, it } from "vitest"
import {
  countPrdSectionsTouched,
  evaluatePromptScope,
} from "../prd-evaluator.js"

describe("countPrdSectionsTouched", () => {
  it("returns 0 for an empty / nonsense prompt", () => {
    const r = countPrdSectionsTouched("xxxx zzzz")
    expect(r.count).toBe(0)
    expect(r.sections).toEqual([])
  })

  it("counts multiple sections for a rich prompt", () => {
    const r = countPrdSectionsTouched(
      "Build a dashboard for mitra suspension tracking. As a ops user, I want to view suspended drivers and audit KYC compliance.",
    )
    // touches: Solution (dashboard), Personas (mitra+user), User Stories (as a),
    // Compliance (audit+kyc).
    expect(r.count).toBeGreaterThanOrEqual(3)
    expect(r.sections).toContain("Solution")
  })

  it("recognises compliance keywords", () => {
    const r = countPrdSectionsTouched("Add OJK POJK 12/2018 compliance banner")
    expect(r.sections).toContain("Compliance")
  })
})

describe("evaluatePromptScope", () => {
  it("flags clarification needed for vague verb without surface", async () => {
    const out = await evaluatePromptScope({
      prompt: "tambahin tombol export",
      detectedRepo: null,
      detectedLayer: null,
    })
    expect(out.needsClarification).toBe(true)
    expect(out.questions.some((q) => q.id === "target-surface")).toBe(true)
  })

  it("adds prd-scope-expand for very short prompts touching <2 sections", async () => {
    const out = await evaluatePromptScope({
      prompt: "fix it",
      detectedRepo: "backoffice",
      detectedLayer: "shared",
    })
    expect(out.questions.some((q) => q.id === "prd-scope-expand")).toBe(true)
  })

  it("does NOT add prd-scope-expand for richly scoped prompts", async () => {
    const out = await evaluatePromptScope({
      prompt:
        "Build a suspension dashboard for mitra in backoffice. As ops user I want to view audit history for KYC compliance via GET /api/mitra/suspensions endpoint",
      detectedRepo: "backoffice",
      detectedLayer: "shared",
    })
    expect(out.questions.some((q) => q.id === "prd-scope-expand")).toBe(false)
  })

  it("produces a summary containing detected sections", async () => {
    const out = await evaluatePromptScope({
      prompt:
        "Build a dashboard for mitra suspension tracking, audit KYC, fetch via /api/mitra",
      detectedRepo: "backoffice",
      detectedLayer: "shared",
    })
    expect(out.summary).toMatch(/touches/i)
    expect(out.sectionsTouched).toBeGreaterThan(0)
  })

  it("confidence drops as more questions stack", async () => {
    const richProblems = await evaluatePromptScope({
      prompt:
        "tambahin payment ke mitra dan KYC dan signature flow + audit kemudian fix",
      detectedRepo: null,
      detectedLayer: null,
    })
    expect(richProblems.confidence).toBeLessThan(90)
  })
})
