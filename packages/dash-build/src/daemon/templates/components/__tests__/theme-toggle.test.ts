import { describe, expect, it } from "vitest"
import { themeToggle } from "../theme-toggle.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"
import { DASHBOARD_JS } from "../../client/app.js"
import { renderLayout } from "../../layout.js"

/**
 * Theme toggle was removed in May 2026 — dashboard is light-only per
 * Dash DS direction. These tests now lock in the "no dark mode anywhere"
 * invariants so a future regression that re-introduces inline dark-mode
 * blocks (instead of a Layer-2 theme) fails loudly.
 */
describe("themeToggle (light-only invariants)", () => {
  it("themeToggle() renders nothing — disabled per Dash DS light-only direction", () => {
    expect(themeToggle()).toBe("")
  })

  it("CSS does not include dark-mode media query or [data-theme=dark]", () => {
    expect(DASHBOARD_CSS).not.toContain("[data-theme=\"dark\"]")
    expect(DASHBOARD_CSS).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/)
  })

  it("client JS does not write or read a stored dark theme", () => {
    expect(DASHBOARD_JS).not.toContain("localStorage.setItem(\"dash-build-theme\"")
    expect(DASHBOARD_JS).not.toMatch(/matchMedia\(["']\(prefers-color-scheme: dark\)["']\)/)
  })

  it("layout no longer applies a stored data-theme before paint", () => {
    const html = renderLayout({
      title: "Test",
      body: "<p>hi</p>",
      authIndicator: "ok",
      version: "0.1.0",
      port: 7777,
    })
    expect(html).not.toContain("localStorage.getItem(\"dash-build-theme\"")
    expect(html).not.toContain("data-theme")
    // Toast mount node still present in chrome.
    expect(html).toContain('id="db-toasts"')
    // Theme toggle button no longer rendered.
    expect(html).not.toContain('id="db-theme-toggle"')
  })

  it("Dash Purple #5e2aac is the canonical brand primary token", () => {
    expect(DASHBOARD_CSS).toContain("#5e2aac")
    expect(DASHBOARD_CSS).toContain("Plus Jakarta Sans")
  })
})
