/**
 * Tier 6 PPT export — deck renderer + intake snapshot helpers.
 *
 * The PPT exporter ships HTML-as-slides (4 slides) instead of a binary
 * `.pptx`, per the pivot-plan fallback. The tests guard:
 *
 *   1. Deck contains all 4 slides + the safety-rail "open in PowerPoint"
 *      instructions header.
 *   2. Snapshot helpers degrade gracefully when `<runDir>/intake.json` is
 *      missing or malformed (return null, never throw).
 *   3. Generated HTML escapes hostile prompt/runId values.
 */

import { describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  readAuditFromIntake,
  readBeImpactFromIntake,
  renderPptxDeck,
} from "../pptx-export.js"

describe("renderPptxDeck", () => {
  it("renders all 4 slides + the export instructions header", () => {
    const result = renderPptxDeck({
      runId: "prm_abc123",
      projectName: "Mitra dashboard",
      prompt: "Add a performance breakdown to the mitra overview",
      generatedAt: "2026-05-28T12:00:00.000Z",
      surface: "backoffice",
    })
    expect(result.contentType).toBe("text/html; charset=utf-8")
    expect(result.filename).toBe("Mitra_dashboard-deck.html")
    expect(result.body).toContain('aria-label="Cover"')
    expect(result.body).toContain('aria-label="Component preview"')
    expect(result.body).toContain('aria-label="Backend impact"')
    expect(result.body).toContain('aria-label="Audit"')
    expect(result.body).toContain("Open in PowerPoint or Keynote")
    expect(result.body).toContain("Mitra dashboard")
    expect(result.body).toContain("backoffice")
    expect(result.body).toContain("prm_abc123")
  })

  it("renders BE Impact snapshot data when provided", () => {
    const result = renderPptxDeck({
      runId: "prm_abc",
      projectName: "BE-test",
      prompt: "tambahin endpoint baru",
      surface: "portal-v2",
      beImpact: {
        scenario: "extend_fe_be",
        existingEndpoints: [
          {
            method: "GET",
            path: "/api/mitra/perf",
            file: "apps/api/routes/mitra.ts",
          },
        ],
        dbTables: [{ name: "mitra", access: "read" }],
        requiredEndpoints: [
          { description: "GET /api/mitra/perf/aggregate", scenario: "extend_fe_be" },
        ],
      },
      audit: {
        status: "required",
        reason: "Sensitive fields detected",
        pattern: "inline-edit-with-audit",
        sensitiveFields: ["paymentAmount"],
        auditCalls: ["auditLog.create"],
        validatorChecks: [],
      },
    })
    expect(result.body).toContain("extend_fe_be")
    expect(result.body).toContain("/api/mitra/perf")
    expect(result.body).toContain("mitra")
    expect(result.body).toContain("paymentAmount")
    expect(result.body).toContain("Required new endpoints (1)")
    expect(result.body).toContain("db-slide-status--required")
  })

  it("renders empty-state copy when BE Impact + audit are missing", () => {
    const result = renderPptxDeck({
      runId: "prm_empty",
      projectName: "Empty run",
      prompt: "nothing here",
    })
    expect(result.body).toContain("No backend touchpoints captured")
    expect(result.body).toContain("No audit findings.")
  })

  it("escapes hostile prompt and runId values", () => {
    const result = renderPptxDeck({
      runId: "abc<script>",
      projectName: "<img src=x onerror=1>",
      prompt: "&<>\"'",
      surface: "x'y",
    })
    expect(result.body).not.toContain("<script>")
    expect(result.body).not.toContain("<img src=x")
    expect(result.body).toContain("&amp;&lt;&gt;&quot;&#39;")
    // The filename sanitiser collapses non-alphanumerics, so the hostile
    // runId never lands in the Content-Disposition attribute.
    expect(result.filename).toMatch(/^[A-Za-z0-9_-]+\-deck\.html$/)
  })
})

describe("readBeImpactFromIntake / readAuditFromIntake", () => {
  it("returns null when no intake.json exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-pptx-"))
    try {
      const be = await readBeImpactFromIntake("prm_missing", root)
      const audit = await readAuditFromIntake("prm_missing", root)
      expect(be).toBeNull()
      expect(audit).toBeNull()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("returns null when intake.json is malformed JSON", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-pptx-"))
    try {
      const runDir = join(root, "prm_broken")
      await mkdir(runDir, { recursive: true })
      await writeFile(join(runDir, "intake.json"), "{not valid", "utf8")
      const be = await readBeImpactFromIntake("prm_broken", root)
      const audit = await readAuditFromIntake("prm_broken", root)
      expect(be).toBeNull()
      expect(audit).toBeNull()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("projects BE catalog + audit fields when intake.json is healthy", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-pptx-"))
    try {
      const runDir = join(root, "prm_ok")
      await mkdir(runDir, { recursive: true })
      const snapshot = {
        scenario: "extend_fe_be",
        beEndpoints: [
          { method: "GET", path: "/api/x", file: "apps/api/routes/x.ts" },
          { method: "POST", path: "/api/y", file: "apps/api/routes/y.ts" },
        ],
        dbSchema: { tables: ["x", "y"] },
        audit: {
          detected: true,
          reasonsCode: ["inline-edit-with-audit"],
          requiredFields: ["amount", "signature"],
        },
      }
      await writeFile(
        join(runDir, "intake.json"),
        JSON.stringify(snapshot),
        "utf8",
      )
      const be = await readBeImpactFromIntake("prm_ok", root)
      expect(be).not.toBeNull()
      expect(be?.scenario).toBe("extend_fe_be")
      expect(be?.existingEndpoints.length).toBe(2)
      expect(be?.dbTables.map((t) => t.name)).toEqual(["x", "y"])

      const audit = await readAuditFromIntake("prm_ok", root)
      expect(audit?.status).toBe("required")
      expect(audit?.sensitiveFields).toEqual(["amount", "signature"])
      expect(audit?.pattern).toBe("inline-edit-with-audit")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("marks audit as pass when intake reports no CR-3 trigger", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-pptx-"))
    try {
      const runDir = join(root, "prm_pass")
      await mkdir(runDir, { recursive: true })
      const snapshot = {
        scenario: "fe_only",
        beEndpoints: [],
        dbSchema: { tables: [] },
        audit: { detected: false, reasonsCode: [], requiredFields: [] },
      }
      await writeFile(
        join(runDir, "intake.json"),
        JSON.stringify(snapshot),
        "utf8",
      )
      const audit = await readAuditFromIntake("prm_pass", root)
      expect(audit?.status).toBe("pass")
      expect(audit?.sensitiveFields).toEqual([])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
