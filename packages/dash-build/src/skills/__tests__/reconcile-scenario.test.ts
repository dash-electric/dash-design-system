/**
 * Tier 0I — reconcileScenario regression tests.
 *
 * The orchestrator classifies a prompt in runIntake() with existingFiles:[]
 * (the path resolver runs later, inside the chain). That blind spot makes
 * prompts like "tambahin tab Delivery di detail mitra" mis-route to
 * `new_product` whenever no BE endpoint matches in the target repo's /api dir.
 * reconcileScenario() corrects this once the chain has resolved real on-disk
 * files. These tests pin the exact flip conditions so the fix doesn't silently
 * over- or under-correct in future refactors.
 */

import { describe, expect, it } from "vitest"
import { reconcileScenario } from "../chain.js"
import type { IntakeContext, ExistingFilesContext, ExistingFileContent } from "../types.js"

function makeIntake(scenario: IntakeContext["classification"]["scenario"]): IntakeContext {
  return {
    beCatalog: { endpoints: [], framework: "none", totalEndpoints: 0 },
    dbCatalog: { tables: [], source: "none" },
    classification: {
      scenario,
      confidence: 0.72,
      reasoning: "original reasoning",
      affectedFiles: { fe: [], be: ["GET /api/x"], db: [] },
    },
    auditTrail: {
      required: false,
      reason: "n/a",
      pattern: "inline-edit-with-audit",
      fieldsToLog: [],
    },
  }
}

function makeFile(filePath: string): ExistingFileContent {
  return { filePath, language: "tsx", content: "x", truncated: false, fullSize: 1 }
}

function ctx(files: ExistingFileContent[]): ExistingFilesContext {
  return { resolutions: [], files }
}

describe("reconcileScenario", () => {
  it("flips new_product → extend_fe_be when existing FE files resolved", () => {
    const out = reconcileScenario(
      makeIntake("new_product"),
      ctx([makeFile("/repo/src/pages/mitra/[id].tsx")]),
    )
    expect(out!.classification.scenario).toBe("extend_fe_be")
    // FE affected files now carry the resolved paths.
    expect(out!.classification.affectedFiles!.fe).toEqual([
      "/repo/src/pages/mitra/[id].tsx",
    ])
    // BE affected files preserved from original classification.
    expect(out!.classification.affectedFiles!.be).toEqual(["GET /api/x"])
    expect(out!.classification.reasoning).toContain("reconciled new_product → extend_fe_be")
  })

  it("leaves new_product untouched when NO existing files resolved (true greenfield)", () => {
    const out = reconcileScenario(makeIntake("new_product"), ctx([]))
    expect(out!.classification.scenario).toBe("new_product")
    expect(out!.classification.reasoning).toBe("original reasoning")
  })

  it("never touches non-new_product scenarios even with existing files", () => {
    for (const s of ["update_existing", "fe_only", "extend_fe_be_db", "ambiguous"] as const) {
      const out = reconcileScenario(makeIntake(s), ctx([makeFile("/repo/a.tsx")]))
      expect(out!.classification.scenario).toBe(s)
    }
  })

  it("returns undefined intake unchanged (legacy callers without intake)", () => {
    expect(reconcileScenario(undefined, ctx([makeFile("/repo/a.tsx")]))).toBeUndefined()
  })
})
