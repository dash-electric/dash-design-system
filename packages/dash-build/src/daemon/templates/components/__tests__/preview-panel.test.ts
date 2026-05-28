/**
 * Tier 2 #4a / #4b / #4c / #7 — preview-panel renderer tests.
 *
 * The panel renders 5 tabpanels. Pre-2026-05-28 only Component + Diff were
 * functional; BE Impact / Audit / Files were placeholders. This file covers
 * the now-functional tabs + the validator UI surface threaded into Diff.
 */

import { describe, expect, it } from "vitest"
import {
  renderPreviewPanel,
  type AuditSnapshot,
  type BeImpactSnapshot,
  type FileSnapshotEntry,
  type ValidationSnapshot,
} from "../preview-panel.js"

const baseOpts = { componentId: "run-test" } as const

describe("preview-panel BE Impact tab (#4a)", () => {
  it("renders placeholder when no snapshot is provided", () => {
    const html = renderPreviewPanel({ ...baseOpts })
    expect(html).toContain('id="db-preview-panel-be-impact"')
    expect(html).toContain("Backend touchpoints")
  })

  it("renders existing endpoints + DB tables + required endpoints when snapshot is present", () => {
    const snapshot: BeImpactSnapshot = {
      scenario: "extend_fe_be",
      existingEndpoints: [
        {
          method: "GET",
          path: "/api/mitra/performance",
          file: "apps/api/routes/mitra.ts",
        },
        {
          method: "POST",
          path: "/api/mitra/suspend",
          file: "apps/api/routes/mitra.ts",
        },
      ],
      dbTables: [
        { name: "mitra", access: "read" },
        { name: "delivery_order" },
      ],
      requiredEndpoints: [
        {
          description: "GET /api/mitra/performance/aggregate",
          scenario: "extend_fe_be",
        },
      ],
    }
    const html = renderPreviewPanel({ ...baseOpts, beImpactSnapshot: snapshot })
    expect(html).toContain("Backend Touchpoints")
    expect(html).toContain("extend_fe_be")
    expect(html).toContain("Existing endpoints (2)")
    expect(html).toContain("/api/mitra/performance")
    expect(html).toContain("apps/api/routes/mitra.ts")
    expect(html).toContain("DB tables referenced (2)")
    expect(html).toContain("mitra")
    expect(html).toContain("delivery_order")
    expect(html).toContain("(read)")
    expect(html).toContain("Required new endpoints (1)")
    expect(html).toContain("/api/mitra/performance/aggregate")
  })

  it("renders empty-state copy when no endpoints + no tables but scenario is known", () => {
    const snapshot: BeImpactSnapshot = {
      scenario: "fe_only",
      existingEndpoints: [],
      dbTables: [],
      requiredEndpoints: [],
    }
    const html = renderPreviewPanel({ ...baseOpts, beImpactSnapshot: snapshot })
    expect(html).toContain("fe_only")
    expect(html).toContain("No backend endpoints surfaced")
  })

  it("escapes hostile path/file values", () => {
    const snapshot: BeImpactSnapshot = {
      scenario: null,
      existingEndpoints: [
        { method: "GET", path: "/<script>x</script>", file: "x.ts" },
      ],
      dbTables: [],
      requiredEndpoints: [],
    }
    const html = renderPreviewPanel({ ...baseOpts, beImpactSnapshot: snapshot })
    expect(html).not.toContain("<script>x</script>")
    expect(html).toContain("&lt;script&gt;")
  })
})

describe("preview-panel Audit tab (#4b)", () => {
  it("renders placeholder when no snapshot is provided", () => {
    const html = renderPreviewPanel({ ...baseOpts })
    expect(html).toContain('id="db-preview-panel-audit"')
    expect(html).toContain("Audit-trail checklist")
  })

  it("renders Pass badge when no CR-3 trigger detected", () => {
    const snapshot: AuditSnapshot = {
      status: "pass",
      reason: "No CR-3 sensitive keywords found",
      pattern: null,
      sensitiveFields: [],
      auditCalls: [],
      validatorChecks: [],
    }
    const html = renderPreviewPanel({ ...baseOpts, auditSnapshot: snapshot })
    expect(html).toContain("Audit Trail Compliance (CR-3)")
    expect(html).toContain("db-preview-audit-status--pass")
    expect(html).toContain("Pass")
    expect(html).toContain("No CR-3 sensitive keywords found")
  })

  it("renders Missing badge + sensitive fields when audit required but no call found", () => {
    const snapshot: AuditSnapshot = {
      status: "missing",
      reason: "CR-3 triggered by financial bucket",
      pattern: "inline-edit-with-audit",
      sensitiveFields: ["payment_amount", "signature"],
      auditCalls: [],
      validatorChecks: [
        {
          ruleId: "CR-3-OUTPUT",
          status: "fail",
          message: "no audit call found",
        },
      ],
    }
    const html = renderPreviewPanel({ ...baseOpts, auditSnapshot: snapshot })
    expect(html).toContain("db-preview-audit-status--missing")
    expect(html).toContain("Missing")
    expect(html).toContain("inline-edit-with-audit")
    expect(html).toContain("Sensitive fields detected (2)")
    expect(html).toContain("payment_amount")
    expect(html).toContain("signature")
    expect(html).toContain("CR-3-OUTPUT")
    expect(html).toContain("FAIL")
  })

  it("renders audit-call references when present", () => {
    const snapshot: AuditSnapshot = {
      status: "pass",
      reason: "CR-3 triggered",
      pattern: "inline-edit-with-audit",
      sensitiveFields: ["payment_amount"],
      auditCalls: ["auditLog.create(...)"],
      validatorChecks: [],
    }
    const html = renderPreviewPanel({ ...baseOpts, auditSnapshot: snapshot })
    expect(html).toContain("Audit log calls found (1)")
    expect(html).toContain("auditLog.create(...)")
  })
})

describe("preview-panel Files tab (#4c)", () => {
  it("renders placeholder when no snapshot is provided", () => {
    const html = renderPreviewPanel({ ...baseOpts })
    expect(html).toContain('id="db-preview-panel-files"')
    expect(html).toContain("Generated files in this run")
  })

  it("renders sorted file list with size + type icon", () => {
    const files: FileSnapshotEntry[] = [
      { path: "Component.tsx", size: 1024, type: "tsx" },
      { path: "README.md", size: 200, type: "md" },
      { path: "src/utils.ts", size: 500, type: "ts" },
      { path: "src/hooks/useFoo.ts", size: 300, type: "ts" },
    ]
    const html = renderPreviewPanel({ ...baseOpts, filesSnapshot: files })
    expect(html).toContain("Generated Files")
    expect(html).toContain("4 files")
    expect(html).toContain("Component.tsx")
    expect(html).toContain("README.md")
    expect(html).toContain("src/utils.ts")
    expect(html).toContain("src/hooks/useFoo.ts")
    // Sub-dir entries come before top-level entries.
    const idxSubDir = html.indexOf("src/hooks/useFoo.ts")
    const idxTopLevel = html.indexOf("Component.tsx")
    expect(idxSubDir).toBeLessThan(idxTopLevel)
    // Size formatting: 1024 → "1.0 KB"
    expect(html).toContain("1.0 KB")
    expect(html).toContain("200 B")
    // Clickable link opens in component preview
    expect(html).toContain("data-files-open=\"Component.tsx\"")
  })

  it("shows singular file label when only one file", () => {
    const files: FileSnapshotEntry[] = [
      { path: "Solo.tsx", size: 100, type: "tsx" },
    ]
    const html = renderPreviewPanel({ ...baseOpts, filesSnapshot: files })
    expect(html).toContain("1 file ·")
    expect(html).not.toContain("1 files ·")
  })
})

describe("preview-panel validation UI (#7)", () => {
  it("omits validation block when no snapshot is provided", () => {
    const html = renderPreviewPanel({ ...baseOpts })
    expect(html).not.toContain("db-preview-validation")
  })

  it("renders validation pass header with score + zero findings", () => {
    const snapshot: ValidationSnapshot = {
      passed: true,
      score: 95,
      counts: { high: 0, medium: 0, low: 0 },
      findings: [],
      rulesHit: [],
      warnings: [],
    }
    const html = renderPreviewPanel({
      ...baseOpts,
      diffSnapshot: [
        {
          path: "Comp.tsx",
          kind: "new-file",
          body: "export default function C(){return null}",
        },
      ],
      validationSnapshot: snapshot,
    })
    expect(html).toContain("db-preview-validation--pass")
    expect(html).toContain("Passed")
    expect(html).toContain("Score: 95/100")
    expect(html).toContain("0 high")
    expect(html).toContain("No findings")
  })

  it("renders validation fail with rules hit, severity breakdown, and per-finding rows", () => {
    const snapshot: ValidationSnapshot = {
      passed: false,
      score: 40,
      counts: { high: 2, medium: 1, low: 0 },
      findings: [
        {
          ruleId: "DS-COVERAGE",
          severity: "high",
          message: "ratio too low",
          file: "Comp.tsx",
        },
        {
          ruleId: "CR-3",
          severity: "high",
          message: "audit missing",
          file: "Comp.tsx",
        },
        {
          ruleId: "STACK-MANDATE",
          severity: "medium",
          message: "wrong ext",
          file: "Comp.tsx",
        },
      ],
      rulesHit: [
        { ruleId: "DS-COVERAGE", count: 1 },
        { ruleId: "CR-3", count: 1 },
        { ruleId: "STACK-MANDATE", count: 1 },
      ],
      warnings: ["small sample"],
    }
    const html = renderPreviewPanel({
      ...baseOpts,
      diffSnapshot: [
        {
          path: "Comp.tsx",
          kind: "new-file",
          body: "export default () => null",
        },
      ],
      validationSnapshot: snapshot,
    })
    expect(html).toContain("db-preview-validation--fail")
    expect(html).toContain("Failed")
    expect(html).toContain("Score: 40/100")
    expect(html).toContain("2 high")
    expect(html).toContain("1 medium")
    expect(html).toContain("DS-COVERAGE")
    expect(html).toContain("CR-3")
    expect(html).toContain("STACK-MANDATE")
    expect(html).toContain("ratio too low")
    expect(html).toContain("audit missing")
    expect(html).toContain("small sample")
  })

  it("escapes hostile finding messages", () => {
    const snapshot: ValidationSnapshot = {
      passed: false,
      score: 20,
      counts: { high: 1, medium: 0, low: 0 },
      findings: [
        {
          ruleId: "X",
          severity: "high",
          message: "<script>alert(1)</script>",
          file: null,
        },
      ],
      rulesHit: [{ ruleId: "X", count: 1 }],
      warnings: [],
    }
    const html = renderPreviewPanel({
      ...baseOpts,
      validationSnapshot: snapshot,
    })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
  })
})
