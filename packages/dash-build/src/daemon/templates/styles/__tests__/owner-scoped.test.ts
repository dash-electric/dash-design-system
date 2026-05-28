/**
 * Tier 6 — Owner standalone CSS extractor tests.
 */

import { describe, expect, it } from "vitest"
import {
  extractOwnerScopedCss,
  extractTokenRootCss,
  renderOwnerStandaloneCss,
} from "../owner-scoped.js"

describe("extractOwnerScopedCss", () => {
  it("returns a non-empty slice from the live DASHBOARD_CSS bundle", () => {
    const out = extractOwnerScopedCss()
    expect(out.length).toBeGreaterThan(100)
    expect(out).toContain("Sprint 3 Owner")
  })

  it("contains the four panel selectors used by the owner page", () => {
    const out = extractOwnerScopedCss()
    expect(out).toContain(".db-owner-page")
    expect(out).toContain(".db-owner-stack")
    expect(out).toContain(".db-owner-panel")
  })

  it("stops at the first non-owner marker (does not leak Lovable shell rules)", () => {
    const out = extractOwnerScopedCss()
    // Lovable shell / sidebar / home markers should NOT be present.
    expect(out).not.toContain("Lovable shell")
    expect(out).not.toContain("=== Sidebar ===")
    expect(out).not.toContain("=== Home ===")
  })

  it("is tolerant of a missing marker", () => {
    const stub = "/* no owner markers here */ .foo { color: red; }"
    expect(extractOwnerScopedCss(stub)).toBe("")
  })
})

describe("extractTokenRootCss", () => {
  it("returns a `:root` block from the live bundle", () => {
    const out = extractTokenRootCss()
    expect(out.startsWith(":root")).toBe(true)
    expect(out.endsWith("}")).toBe(true)
  })

  it("returns an empty string when no :root present", () => {
    expect(extractTokenRootCss(".foo { color: red; }")).toBe("")
  })
})

describe("renderOwnerStandaloneCss", () => {
  it("composes tokens + scoped slice with a separator comment", () => {
    const out = renderOwnerStandaloneCss()
    expect(out).toContain(":root")
    expect(out).toContain("Owner standalone slice")
    expect(out).toContain(".db-owner-page")
  })
})
