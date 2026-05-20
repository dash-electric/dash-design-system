import { describe, it, expect, vi } from "vitest"
import { resolveTheme } from "../theme-resolver.js"
import { KNOWN_THEMES, validateThemeName } from "../theme-registry.js"

describe("theme-resolver", () => {
  it("CLI flag wins over components.json config", () => {
    const r = resolveTheme({
      cliFlag: "logistic",
      componentsJson: { dashTheme: "travel" },
    })
    expect(r).toEqual({ name: "logistic", source: "cli" })
  })

  it("config wins over default when no CLI flag", () => {
    const r = resolveTheme({ componentsJson: { dashTheme: "travel" } })
    expect(r).toEqual({ name: "travel", source: "config" })
  })

  it("falls back to ride default when nothing set", () => {
    const r = resolveTheme({})
    expect(r).toEqual({ name: "ride", source: "default" })
  })

  it("falls back to default when components.json is null", () => {
    const r = resolveTheme({ componentsJson: null })
    expect(r).toEqual({ name: "ride", source: "default" })
  })

  it("rejects an invalid CLI flag with a helpful error", () => {
    expect(() => resolveTheme({ cliFlag: "ferrari" })).toThrow(
      /Unknown theme "ferrari"/,
    )
  })

  it("warns and falls back when components.json has unknown theme", () => {
    const warn = vi.fn()
    const r = resolveTheme({
      componentsJson: { dashTheme: "spaceship" },
      warn,
    })
    expect(r).toEqual({ name: "ride", source: "default" })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/spaceship/)
  })

  it("auto-detects theme from components.json dashTheme field", () => {
    const r = resolveTheme({
      componentsJson: { dashTheme: "marketplace" },
    })
    expect(r.name).toBe("marketplace")
    expect(r.source).toBe("config")
  })

  it("exposes the full known-themes list and validator", () => {
    expect(KNOWN_THEMES).toEqual([
      "ride",
      "logistic",
      "travel",
      "marketplace",
      "trellis-tenant",
    ])
    expect(validateThemeName("ride")).toBe(true)
    expect(validateThemeName("nonsense")).toBe(false)
  })
})
