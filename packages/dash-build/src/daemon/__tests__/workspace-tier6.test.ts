/**
 * Tier 6 — workspace template tier-6 add-ons:
 *
 *   - Surface badge is a clickable link to the Dash DS docs surface page.
 *   - Topbar Export PPT action carries `/api/runs/:runId/export/pptx` and
 *     downgrades to a disabled chip when no runId is present.
 *   - Layer 2 theme picker dropdown renders in the topbar actions strip.
 *   - Sidebar footer carries the "Open docs" link.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../state/store.js"
import { renderWorkspace } from "../templates/workspace.js"

let root: string
let store: Store

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-ws-tier6-"))
  store = await Store.load({ path: join(root, "state.json") })
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

describe("renderWorkspace surface docs link", () => {
  it("renders the surface crumb as an external link to /docs/surfaces/<surface>", () => {
    const html = renderWorkspace(store, { runId: "run-1", surface: "backoffice" })
    expect(html).toContain('class="db-workspace-crumb-surface"')
    expect(html).toContain('data-workspace-surface-docs')
    expect(html).toMatch(/href="[^"]*\/docs\/surfaces\/backoffice"/)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it("falls back to the docs root when surface is unknown / hostile", () => {
    const html = renderWorkspace(store, { runId: "run-2", surface: "../etc" })
    expect(html).toContain('class="db-workspace-crumb-surface"')
    // The href is still rendered, but it collapses to the docs root because
    // `buildSurfaceDocsUrl` rejects path traversal slugs.
    expect(html).not.toMatch(/href="[^"]*\.\.\/etc"/)
  })
})

describe("renderWorkspace Export PPT button", () => {
  it("renders an enabled link when a runId is present", () => {
    const html = renderWorkspace(store, { runId: "prm_abc123" })
    expect(html).toContain('data-workspace-action="export-pptx"')
    expect(html).toContain("/api/runs/prm_abc123/export/pptx")
    expect(html).toContain('data-export-disabled="false"')
    expect(html).toContain('download="dash-build-deck.html"')
  })

  it("renders a disabled chip when no runId is set", () => {
    const html = renderWorkspace(store, { runId: null })
    expect(html).toContain('data-workspace-action="export-pptx"')
    expect(html).toContain('data-export-disabled="true"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).not.toContain("/api/runs//export/pptx")
  })
})

describe("renderWorkspace Layer 2 theme picker", () => {
  it("renders a theme dropdown in the topbar actions strip", () => {
    const html = renderWorkspace(store, { runId: "run-3", surface: "ride" })
    expect(html).toContain('data-workspace-theme-picker')
    expect(html).toContain('data-workspace-theme-select')
    expect(html).toContain('id="db-workspace-theme"')
    expect(html).toContain('data-current-theme="ride"')
    // The select ships with a default option so the user can revert.
    expect(html).toContain("Default (project)")
  })
})

describe("renderWorkspace sidebar 'Open docs' footer link", () => {
  it("renders the docs link with the current surface in the sidebar", () => {
    const html = renderWorkspace(store, { runId: "run-4", surface: "logistic" })
    expect(html).toContain('class="db-sidebar-docs"')
    expect(html).toContain('data-sidebar-docs')
    expect(html).toContain('data-docs-surface="logistic"')
    expect(html).toMatch(/href="[^"]*\/docs\/surfaces\/logistic"/)
  })
})
