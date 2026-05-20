import { describe, expect, it } from "vitest"
import { evaluatePrompt } from "../evaluator.js"
import type { EvaluatorInput } from "../evaluator.js"

function input(
  prompt: string,
  overrides: Partial<EvaluatorInput> = {},
): EvaluatorInput {
  return {
    prompt,
    detectedRepo: null,
    detectedLayer: null,
    workspaceState: { branch: "main", isDirty: false, recentPrompts: [] },
    ...overrides,
  }
}

describe("evaluatePrompt", () => {
  it("asks target-surface for vague verb without surface or detected repo", () => {
    const out = evaluatePrompt(input("tambahin tombol export"))
    expect(out.shouldClarify).toBe(true)
    const ids = out.questions.map((q) => q.id)
    expect(ids).toContain("target-surface")
  })

  it("does NOT ask target-surface when prompt mentions a known surface", () => {
    const out = evaluatePrompt(input("tambahin tombol export di backoffice"))
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("target-surface")
  })

  it("does NOT ask target-surface when detectedRepo is set", () => {
    const out = evaluatePrompt(
      input("tambahin filter table", { detectedRepo: "halo-dash-fe" }),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("target-surface")
  })

  it("asks data-source when data verb present without source", () => {
    const out = evaluatePrompt(
      input("show list of mitra in backoffice"),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).toContain("data-source")
  })

  it("does NOT ask data-source when source hint is present", () => {
    const out = evaluatePrompt(
      input("show list of orders from /api/orders endpoint in backoffice"),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("data-source")
  })

  it("asks voice-rule when mitra is mentioned", () => {
    const out = evaluatePrompt(input("build screen for mitra to view payouts"))
    const ids = out.questions.map((q) => q.id)
    expect(ids).toContain("voice-rule")
    const voice = out.questions.find((q) => q.id === "voice-rule")!
    expect(voice.type).toBe("yes-no")
    expect(voice.required).toBe(true)
  })

  it("asks audit-trail when legal/financial signals present", () => {
    const out = evaluatePrompt(
      input("allow admin to edit payment amount in backoffice"),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).toContain("audit-trail")
  })

  it("asks scope-confirm for compound clauses (3+ joiners)", () => {
    const out = evaluatePrompt(
      input(
        "Build a dispatch board and a payout exporter and a KPI dashboard in backoffice",
      ),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).toContain("scope-confirm")
  })

  it("returns shouldClarify=false + confidence 90 for crystal-clear prompt", () => {
    const out = evaluatePrompt(
      input(
        "Rename the 'Sync now' icon button to 'Refresh' on the backoffice settings page header",
        { detectedRepo: "backoffice" },
      ),
    )
    expect(out.shouldClarify).toBe(false)
    expect(out.questions).toHaveLength(0)
    expect(out.confidence).toBe(90)
  })

  it("confidence drops 15 points per question added, floors at 20", () => {
    const out = evaluatePrompt(
      input(
        "tambahin payment edit screen for mitra in basecamp and audit log and notification banner and report export",
      ),
    )
    // expects multiple questions to fire (vague, mitra, legal, scope)
    expect(out.questions.length).toBeGreaterThanOrEqual(3)
    expect(out.confidence).toBeLessThanOrEqual(90 - out.questions.length * 15)
    expect(out.confidence).toBeGreaterThanOrEqual(20)
  })
})
