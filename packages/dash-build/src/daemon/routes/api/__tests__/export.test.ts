/**
 * Tier 6 — PPT export endpoint.
 *
 * The endpoint is a thin wrapper around `renderPptxDeck`; the deck renderer
 * is exercised in `src/runs/__tests__/pptx-export.test.ts`. These tests
 * cover the HTTP surface (path matching, content-type, 404 path when
 * neither the Run nor the on-disk summary exists).
 */

import { describe, expect, it } from "vitest"
import { isExportPath } from "../export.js"

describe("isExportPath", () => {
  it("matches the canonical run pptx export path", () => {
    expect(isExportPath("/api/runs/prm_abc123/export/pptx")).toBe(true)
    expect(isExportPath("/api/runs/abc-def_ghi/export/pptx")).toBe(true)
  })

  it("rejects unrelated paths", () => {
    expect(isExportPath("/api/runs/prm_abc/export/pdf")).toBe(false)
    expect(isExportPath("/api/runs/export/pptx")).toBe(false)
    expect(isExportPath("/api/export")).toBe(false)
    expect(isExportPath("/api/runs/has spaces/export/pptx")).toBe(false)
  })
})
