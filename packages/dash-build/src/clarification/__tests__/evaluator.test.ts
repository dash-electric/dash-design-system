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

  it("does NOT ask data-source for P0 because generation uses mock data only", () => {
    const out = evaluatePrompt(
      input("show list of mitra in backoffice"),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("data-source")
  })

  it("does NOT ask data-source when source hint is present", () => {
    const out = evaluatePrompt(
      input("show list of orders from /api/orders endpoint in backoffice"),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("data-source")
  })

  it("NEVER asks voice-rule (removed 2026-05-29 — web is never mitra-facing)", () => {
    // The mitra/voice question was removed: every web repo is internal-ops or
    // client-facing, never a driver/courier surface (that's the mobile app).
    // Voice now derives deterministically from the repo, so it's never asked.
    const out = evaluatePrompt(input("build screen about mitra payouts"))
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("voice-rule")
  })

  it("does NOT ask voice-rule when selected repo infers internal backoffice audience", () => {
    const out = evaluatePrompt(
      input("build screen about mitra payouts", { detectedRepo: "backoffice" }),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("voice-rule")
  })

  it("does NOT ask voice-rule when selected repo infers client portal audience", () => {
    const out = evaluatePrompt(
      input("show mitra referral status", { detectedRepo: "portal-v2" }),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("voice-rule")
  })

  it("does NOT ask voice-rule when prompt explicitly says not mitra-facing", () => {
    const out = evaluatePrompt(
      input("Build Performance Mitra page in backoffice for HR. This is not mitra-facing."),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("voice-rule")
  })

  it("no longer raises visibility-conflict (voice gate removed 2026-05-29)", () => {
    // The visibility-conflict gate was part of the removed mitra/voice flow.
    // With voice derived from the repo, there's no contradiction to flag.
    const out = evaluatePrompt(
      input(
        [
          "Build Performance Mitra page in backoffice for HR. This is not mitra-facing.",
          "",
          "--- Clarifications ---",
          "- Is this UI seen by mitra (drivers/couriers)? → true",
        ].join("\n"),
      ),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("visibility-conflict")
  })

  it("does NOT repeat questions already answered in merged clarification context", () => {
    const out = evaluatePrompt(
      input(
        [
          "Build performance mitra page in backoffice",
          "",
          "--- Clarifications ---",
          "- Is this UI seen by mitra (drivers/couriers)? → true",
        ].join("\n"),
      ),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("voice-rule")
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

  it("does NOT ask scope-confirm for a bounded repo-aware UI improvement", () => {
    const out = evaluatePrompt(
      input(
        "Tambahin compact delivery exception filter di backoffice delivery page. Operator bisa filter status problem delivery, lihat 3 KPI kecil, dan review daftar order bermasalah pakai mock data. Harus tetap di existing delivery shell dan jangan bikin sidebar baru.",
        { detectedRepo: "backoffice" },
      ),
    )
    const ids = out.questions.map((q) => q.id)
    expect(ids).not.toContain("scope-confirm")
    expect(out.shouldClarify).toBe(false)
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
    // expects multiple true ambiguities to fire (legal/audit + scope);
    // repo/surface and P0 data policy are inferred.
    expect(out.questions.length).toBeGreaterThanOrEqual(2)
    expect(out.confidence).toBeLessThanOrEqual(90 - out.questions.length * 15)
    expect(out.confidence).toBeGreaterThanOrEqual(20)
  })
})
