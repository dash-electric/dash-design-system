import { describe, it, expect } from "vitest"
import {
  buildDashHeader,
  classifyBump,
  hasDashHeader,
  injectDashHeader,
  parseDashHeader,
  parseSemVer,
  sha256,
} from "../component-version.js"

describe("component-version", () => {
  it("parses a complete header block", () => {
    const src = `/**\n * @dash version 1.2.3\n * @dash source registry/dash/ui/button.tsx\n * @dash updated 2026-05-20\n */\nexport const X = 1`
    const h = parseDashHeader(src)
    expect(h.rawVersion).toBe("1.2.3")
    expect(h.version).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(h.source).toBe("registry/dash/ui/button.tsx")
    expect(h.updated).toBe("2026-05-20")
  })

  it("returns nulls when header is absent", () => {
    const h = parseDashHeader("export const X = 1\n")
    expect(h.version).toBeNull()
    expect(h.rawVersion).toBeNull()
  })

  it("classifies bumps correctly", () => {
    const a = parseSemVer("1.0.0")!
    expect(classifyBump(a, parseSemVer("1.0.1"))).toBe("patch")
    expect(classifyBump(a, parseSemVer("1.1.0"))).toBe("minor")
    expect(classifyBump(a, parseSemVer("2.0.0"))).toBe("major")
    expect(classifyBump(a, parseSemVer("1.0.0"))).toBe("none")
    expect(classifyBump(null, parseSemVer("1.0.0"))).toBe("unknown")
    // downgrade treated as "none" (sync should ignore)
    expect(classifyBump(parseSemVer("2.0.0"), parseSemVer("1.0.0"))).toBe("none")
  })

  it("injects header preserving 'use client' directive position", () => {
    const src = `"use client"\n\nexport const X = 1\n`
    const header = buildDashHeader({
      version: "1.0.0",
      source: "registry/dash/ui/x.tsx",
      updated: "2026-05-20",
    })
    const out = injectDashHeader(src, header)
    const lines = out.split("\n")
    expect(lines[0]).toBe('"use client"')
    expect(out).toContain("@dash version 1.0.0")
    expect(hasDashHeader(out)).toBe(true)
  })

  it("injects header at top when no directive present", () => {
    const out = injectDashHeader(
      "export const X = 1",
      buildDashHeader({ version: "1.0.0", source: "x" }),
    )
    expect(out.startsWith("/**\n * @dash version 1.0.0")).toBe(true)
  })

  it("is idempotent — does not double-stamp", () => {
    const stamped = injectDashHeader(
      "export const X = 1",
      buildDashHeader({ version: "1.0.0", source: "x" }),
    )
    const again = injectDashHeader(
      stamped,
      buildDashHeader({ version: "9.9.9", source: "x" }),
    )
    expect(again).toBe(stamped)
  })

  it("sha256 changes with content", () => {
    expect(sha256("a")).not.toBe(sha256("b"))
    expect(sha256("a")).toBe(sha256("a"))
  })
})
