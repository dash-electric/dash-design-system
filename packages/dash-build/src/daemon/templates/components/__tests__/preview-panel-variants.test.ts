/**
 * Open WebUI #A4 — preview-panel A/B split-view rendering.
 *
 * Verifies the Component tabpanel branches between single-mount layout
 * (default) and the dual-mount split layout when `variants` is supplied.
 */

import { describe, expect, it } from "vitest"
import {
  renderPreviewPanel,
  type PreviewVariantsState,
} from "../preview-panel.js"

const baseOpts = { componentId: "run-ab" } as const

describe("preview-panel A/B split view (#A4)", () => {
  it("renders the canonical single Sandpack mount when variants is absent", () => {
    const html = renderPreviewPanel({ ...baseOpts })
    expect(html).toContain('id="db-preview-sandpack"')
    expect(html).not.toContain("db-preview-tabpanel--ab")
    expect(html).not.toContain("data-variants-split")
    expect(html).not.toContain("data-variant-pick")
  })

  it("renders the canonical single mount when only one variant is present (edge case)", () => {
    const variants: PreviewVariantsState = {
      active: "a",
      list: [
        {
          id: "a",
          summary: "Single",
          score: 80,
          passed: true,
          fileCount: 1,
          componentPath: "X.tsx",
          temperature: 0.7,
        },
      ],
    }
    const html = renderPreviewPanel({ ...baseOpts, variants })
    expect(html).toContain('id="db-preview-sandpack"')
    expect(html).not.toContain("data-variants-split")
  })

  it("renders two Sandpack mounts side-by-side when A/B variants present", () => {
    const variants: PreviewVariantsState = {
      active: "b",
      list: [
        {
          id: "a",
          summary: "Card layout with badge",
          score: 78,
          passed: true,
          fileCount: 2,
          componentPath: "Card.tsx",
          temperature: 0.7,
        },
        {
          id: "b",
          summary: "Table layout with inline actions",
          score: 92,
          passed: true,
          fileCount: 2,
          componentPath: "Table.tsx",
          temperature: 0.9,
        },
      ],
    }
    const html = renderPreviewPanel({
      ...baseOpts,
      promptId: "prm_abc",
      variants,
    })
    expect(html).toContain("db-preview-tabpanel--ab")
    expect(html).toContain('data-variants-split')
    expect(html).toContain('data-ab-mode="true"')
    expect(html).toContain('data-active-variant="b"')
    // Both variant headers
    expect(html).toContain("Variant A")
    expect(html).toContain("Variant B")
    // Per-variant Sandpack mounts (no shared id collision)
    expect(html).toContain('class="db-preview-sandpack db-preview-sandpack--variant"')
    expect(html.match(/data-variant-id="a"/g)?.length).toBeGreaterThanOrEqual(1)
    expect(html.match(/data-variant-id="b"/g)?.length).toBeGreaterThanOrEqual(1)
    // Pick CTAs are present + carry runId
    expect(html).toContain('data-variant-pick="a"')
    expect(html).toContain('data-variant-pick="b"')
    expect(html).toContain('data-run-id="prm_abc"')
    // Active variant carries Active badge + aria-pressed=true on its button
    expect(html).toContain("db-preview-variant--active")
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-pressed="false"')
    // Summary and score render
    expect(html).toContain("Card layout with badge")
    expect(html).toContain("Table layout with inline actions")
    expect(html).toContain("92/100")
    expect(html).toContain("T=0.90")
    // The legacy single mount id MUST NOT be emitted in A/B mode (would dupe).
    expect(html).not.toContain('id="db-preview-sandpack"')
  })

  it("escapes hostile variant summaries", () => {
    const variants: PreviewVariantsState = {
      active: "a",
      list: [
        {
          id: "a",
          summary: "<script>alert(1)</script>",
          score: 50,
          passed: false,
          fileCount: 1,
          componentPath: null,
          temperature: null,
        },
        {
          id: "b",
          summary: "ok",
          score: 60,
          passed: true,
          fileCount: 1,
          componentPath: null,
          temperature: null,
        },
      ],
    }
    const html = renderPreviewPanel({ ...baseOpts, variants })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
  })
})
