import { describe, expect, it } from "vitest"
import { toastContainer } from "../toast.js"
import { DASHBOARD_JS } from "../../client/app.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"

describe("toastContainer", () => {
  it("renders an empty mount node with stable id", () => {
    const html = toastContainer()
    expect(html).toContain('id="db-toasts"')
    expect(html).toContain('class="db-toasts"')
  })

  it("exposes aria-live for screen readers", () => {
    const html = toastContainer()
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-atomic="false"')
  })

  it("client bundle includes showToast() implementation wired to WS events", () => {
    expect(DASHBOARD_JS).toContain("function showToast")
    expect(DASHBOARD_JS).toContain("pr:created")
    expect(DASHBOARD_JS).toContain("generation:complete")
    expect(DASHBOARD_JS).toContain("clarification:needed")
    // submit-failure path also surfaces a toast (replacing old shake-only fallback).
    expect(DASHBOARD_JS).toContain("Could not submit prompt")
  })

  it("CSS defines all four toast kinds with semantic border colors", () => {
    expect(DASHBOARD_CSS).toContain(".db-toast.success")
    expect(DASHBOARD_CSS).toContain(".db-toast.error")
    expect(DASHBOARD_CSS).toContain(".db-toast.warn")
    expect(DASHBOARD_CSS).toContain(".db-toast.info")
    // show-state transition class
    expect(DASHBOARD_CSS).toContain(".db-toast.show")
  })
})
