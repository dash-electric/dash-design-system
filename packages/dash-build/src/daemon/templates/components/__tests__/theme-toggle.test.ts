import { describe, expect, it } from "vitest"
import { themeToggle } from "../theme-toggle.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"
import { DASHBOARD_JS } from "../../client/app.js"
import { renderLayout } from "../../layout.js"

/**
 * Phase A1 (2026-05-25) — registry tokens inlined, theme toggle RE-ENABLED.
 *
 * Dashboard now consumes the Dash registry semantic tokens (`:root` light +
 * `.dark` override) inlined into the CSS bundle from
 * `apps/docs/app/globals.css`. The toggle flips the `.dark` class on
 * `<html>` and persists in `localStorage` under the `dash-build-theme` key.
 * An inline script in `<head>` applies the stored / system preference
 * before first paint so we never flash the wrong theme.
 */
describe("themeToggle (Phase A1 registry-token wiring)", () => {
  it("themeToggle() renders a real button with the data-theme-toggle hook", () => {
    const html = themeToggle()
    expect(html).toContain("data-theme-toggle")
    expect(html).toContain("db-theme-toggle")
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain("aria-label=")
  })

  it("CSS bundle inlines the Dash registry `.dark` semantic override block", () => {
    // The `.dark` block defines bg-white-0, text-strong-950, etc. — proof the
    // registry tokens.ts payload landed in the bundle.
    expect(DASHBOARD_CSS).toMatch(/^\.dark\s*\{/m)
    expect(DASHBOARD_CSS).toContain("--bg-white-0: var(--dash-slate-950)")
    expect(DASHBOARD_CSS).toContain("--text-strong-950: var(--dash-slate-0)")
  })

  it("CSS bundle inlines the Dash registry light-mode foundations", () => {
    expect(DASHBOARD_CSS).toContain("--dash-purple-500: #5e2aac")
    expect(DASHBOARD_CSS).toContain("--primary-base:     var(--dash-purple-500)")
  })

  it("client JS handles the theme toggle click and persists the choice", () => {
    expect(DASHBOARD_JS).toContain("data-theme-toggle")
    expect(DASHBOARD_JS).toContain("dash-build-theme")
    expect(DASHBOARD_JS).toMatch(/classList\.toggle\(["']dark["']/)
  })

  it("layout applies the stored / system theme inline before paint", () => {
    const html = renderLayout({
      title: "Test",
      body: "<p>hi</p>",
      authIndicator: "ok",
      version: "0.1.0",
      port: 7777,
    })
    // Inline init script in <head> reads localStorage + prefers-color-scheme.
    expect(html).toContain("dash-build-theme")
    expect(html).toMatch(/matchMedia\(["']\(prefers-color-scheme: dark\)["']\)/)
    expect(html).toContain("classList.add('dark')")
    // Toast mount node still present in chrome.
    expect(html).toContain('id="db-toasts"')
    // Theme toggle button rendered in chrome.
    expect(html).toContain("data-theme-toggle")
  })

  it("Dash Purple #5e2aac is the canonical brand primary token", () => {
    expect(DASHBOARD_CSS).toContain("#5e2aac")
    expect(DASHBOARD_CSS).toContain("Plus Jakarta Sans")
  })
})
