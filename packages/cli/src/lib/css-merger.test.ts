import { describe, it, expect } from "vitest"
import { mergeCssVars, generateCssBlock } from "./css-merger.js"

describe("mergeCssVars", () => {
  it("creates :root rule when CSS is empty", () => {
    const out = mergeCssVars("", { light: { foreground: "0 0 0" } })
    expect(out).toContain(":root")
    expect(out).toContain("--foreground: 0 0 0")
  })

  it("aliases 'light' → :root and 'dark' → .dark", () => {
    const out = mergeCssVars("", {
      light: { a: "1" },
      dark: { a: "2" },
    })
    expect(out).toMatch(/:root\s*\{[^}]*--a:\s*1/)
    expect(out).toMatch(/\.dark\s*\{[^}]*--a:\s*2/)
  })

  it("updates existing var instead of duplicating", () => {
    const input = `:root {\n  --foreground: 0 0 0;\n}\n`
    const out = mergeCssVars(input, { light: { foreground: "1 1 1" } })
    expect(out).toContain("--foreground: 1 1 1")
    expect(out).not.toContain("--foreground: 0 0 0")
    // only one occurrence
    expect(out.match(/--foreground:/g)?.length).toBe(1)
  })

  it("adds a new var to an existing :root block", () => {
    const input = `:root {\n  --foreground: 0 0 0;\n}\n`
    const out = mergeCssVars(input, { light: { background: "1 1 1" } })
    expect(out).toContain("--foreground: 0 0 0")
    expect(out).toContain("--background: 1 1 1")
  })

  it("handles multi-line oklch values without breaking", () => {
    const input = `:root {\n  --accent: oklch(0.5\n    0.2\n    30);\n}\n`
    const out = mergeCssVars(input, {
      light: { accent: "oklch(0.6 0.3 40 / 0.5)" },
    })
    expect(out).toContain("oklch(0.6 0.3 40 / 0.5)")
    expect(out).not.toContain("oklch(0.5")
  })

  it("preserves other rules and comments", () => {
    const input = `/* header */\n.button { color: red; }\n:root { --a: 1; }\n`
    const out = mergeCssVars(input, { light: { a: "2" } })
    expect(out).toContain("/* header */")
    expect(out).toContain(".button")
    expect(out).toContain("color: red")
    expect(out).toContain("--a: 2")
  })

  it("is idempotent", () => {
    const input = `:root { --a: 1; }\n`
    const once = mergeCssVars(input, { light: { a: "2" } })
    const twice = mergeCssVars(once, { light: { a: "2" } })
    expect(twice).toBe(once)
  })

  it("accepts var names with or without leading --", () => {
    const a = mergeCssVars("", { light: { foreground: "0 0 0" } })
    const b = mergeCssVars("", { light: { "--foreground": "0 0 0" } })
    expect(a).toBe(b)
  })
})

describe("generateCssBlock", () => {
  it("emits :root and .dark blocks", () => {
    const out = generateCssBlock({
      light: { foreground: "0 0 0" },
      dark: { foreground: "1 1 1" },
    })
    expect(out).toContain(":root")
    expect(out).toContain(".dark")
  })
})
