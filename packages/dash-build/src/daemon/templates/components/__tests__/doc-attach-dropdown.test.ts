/**
 * Doc-attach dropdown + composer wiring tests.
 *
 * Verifies the SSR markup contract (ids/roles/aria), the CSS hooks the JS
 * relies on, and the client JS function surface that wireDocAttach exposes.
 * The keyboard / fetch flows themselves are integration-tested via the
 * api/__tests__/docs.test.ts harness — here we make sure the wiring lives.
 */

import { describe, expect, it } from "vitest"
import { renderDocAttachDropdown } from "../doc-attach-dropdown.js"
import { renderPromptInput } from "../prompt-input.js"
import { DASHBOARD_JS } from "../../client/app.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"

describe("renderDocAttachDropdown", () => {
  it("ships the floating panel with role=combobox + aria-controls", () => {
    const html = renderDocAttachDropdown()
    expect(html).toContain('id="db-doc-attach"')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain('aria-controls="db-doc-attach-list"')
  })

  it("ships the inner listbox with role=listbox + accessible name", () => {
    const html = renderDocAttachDropdown()
    expect(html).toContain('id="db-doc-attach-list"')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('aria-label="Attach a document"')
  })

  it("starts hidden so it doesn't paint over the textarea on first render", () => {
    const html = renderDocAttachDropdown()
    expect(html).toContain('data-state="hidden"')
    expect(html).toContain('aria-expanded="false"')
  })

  it("ships keyboard-hint footer", () => {
    const html = renderDocAttachDropdown()
    expect(html).toContain("db-doc-attach-hint")
    expect(html).toMatch(/<kbd>/)
  })
})

describe("renderPromptInput integration", () => {
  it("wraps the textarea inside a positioning field for the dropdown", () => {
    const html = renderPromptInput()
    expect(html).toContain('class="db-prompt-input-field"')
    expect(html).toContain('id="db-doc-attach"')
  })

  it("seeds an empty data-attached-docs attribute on the textarea", () => {
    const html = renderPromptInput()
    expect(html).toContain('data-attached-docs="[]"')
  })

  it("wires aria-autocomplete + aria-controls so screen readers track the listbox", () => {
    const html = renderPromptInput()
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('aria-controls="db-doc-attach-list"')
  })
})

describe("client JS surface", () => {
  it("exposes wireDocAttach for tests + external triggers", () => {
    expect(DASHBOARD_JS).toContain("function wireDocAttach")
    expect(DASHBOARD_JS).toContain("window.dashBuildWireDocAttach")
  })

  it("calls /api/docs with the typed token and a small limit", () => {
    expect(DASHBOARD_JS).toContain("/api/docs?limit=")
    expect(DASHBOARD_JS).toContain("encodeURIComponent(token)")
  })

  it("debounces input + cancels stale fetch responses via a sequence guard", () => {
    expect(DASHBOARD_JS).toContain("debounceTimer")
    expect(DASHBOARD_JS).toContain("fetchSeq")
    expect(DASHBOARD_JS).toContain("mySeq !== fetchSeq")
  })

  it("posts attachedDocs alongside the prompt text on submit", () => {
    expect(DASHBOARD_JS).toContain("data-attached-docs")
    expect(DASHBOARD_JS).toContain("payload.attachedDocs = attached")
  })

  it("resets the attached-docs state after a successful submit", () => {
    // Reset writes the empty-array literal back via setAttribute — the
    // ordering of args is fragile, so we look for the call site marker.
    expect(DASHBOARD_JS).toMatch(/setAttribute\("data-attached-docs", "\[\]"\)/)
  })
})

describe("dashboard.ts CSS contract", () => {
  it("ships the .db-doc-attach floating panel ruleset", () => {
    expect(DASHBOARD_CSS).toContain(".db-doc-attach {")
    expect(DASHBOARD_CSS).toContain('.db-doc-attach[data-state="hidden"]')
  })

  it("ships hover + aria-selected highlight via primary-soft token", () => {
    expect(DASHBOARD_CSS).toContain(".db-doc-attach-item")
    expect(DASHBOARD_CSS).toContain('aria-selected="true"')
  })

  it("ships the chip helper class for inline references", () => {
    expect(DASHBOARD_CSS).toContain(".db-doc-attach-chip")
  })

  it("makes the prompt input field a positioning context", () => {
    expect(DASHBOARD_CSS).toContain(".db-prompt-input-field { position: relative; }")
  })
})
