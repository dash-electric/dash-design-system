import { describe, expect, it } from "vitest"
import { themeToggle } from "../theme-toggle.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"
import { DASHBOARD_JS } from "../../client/app.js"
import { renderLayout } from "../../layout.js"

describe("themeToggle", () => {
  it("renders a button with an accessible label", () => {
    const html = themeToggle()
    expect(html).toContain('id="db-theme-toggle"')
    expect(html).toContain('aria-label="Toggle theme"')
    expect(html).toMatch(/<button[^>]*type="button"/)
  })

  it("includes sun + moon icon spans (both swapped via CSS per theme)", () => {
    const html = themeToggle()
    expect(html).toContain("db-theme-icon-light")
    expect(html).toContain("db-theme-icon-dark")
  })

  it("CSS defines dark-mode tokens for both [data-theme=dark] and prefers-color-scheme", () => {
    expect(DASHBOARD_CSS).toContain('[data-theme="dark"]')
    expect(DASHBOARD_CSS).toContain('[data-theme="light"]')
    expect(DASHBOARD_CSS).toContain("@media (prefers-color-scheme: dark)")
  })

  it("client JS persists toggle state to localStorage and applies pre-paint", () => {
    expect(DASHBOARD_JS).toContain("dash-build-theme")
    expect(DASHBOARD_JS).toContain("localStorage.setItem")
    expect(DASHBOARD_JS).toContain('matchMedia("(prefers-color-scheme: dark)")')
  })

  it("layout boot script applies stored theme before stylesheet paints (anti-FOUC)", () => {
    const html = renderLayout({
      title: "Test",
      body: "<p>hi</p>",
      authIndicator: "ok",
      version: "0.1.0",
      port: 7777,
    })
    expect(html).toContain("dash-build-theme")
    expect(html).toContain('data-theme')
    // Toast mount node is present in chrome.
    expect(html).toContain('id="db-toasts"')
    // Theme toggle is in the header actions.
    expect(html).toContain('id="db-theme-toggle"')
  })
})
