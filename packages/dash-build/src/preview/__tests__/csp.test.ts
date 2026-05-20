import { describe, expect, it } from "vitest"
import { buildCsp } from "../csp.js"

describe("preview/csp", () => {
  it("emits all required directives separated by `; `", () => {
    const csp = buildCsp()
    const directives = csp.split("; ")
    const heads = directives.map((d) => d.split(" ")[0])
    expect(heads).toEqual([
      "default-src",
      "script-src",
      "style-src",
      "font-src",
      "img-src",
      "connect-src",
      "frame-ancestors",
    ])
  })

  it("blocks outbound calls with connect-src 'none'", () => {
    const csp = buildCsp()
    expect(csp).toMatch(/connect-src 'none'/)
  })

  it("locks frame-ancestors to 'self' (no embedding cross-origin)", () => {
    const csp = buildCsp()
    expect(csp).toMatch(/frame-ancestors 'self'/)
  })

  it("permits 'unsafe-eval' in script-src (esbuild inline sourcemap)", () => {
    const csp = buildCsp()
    const scriptSrc = csp.split("; ").find((d) => d.startsWith("script-src")) ?? ""
    expect(scriptSrc).toContain("'unsafe-eval'")
    expect(scriptSrc).toContain("'unsafe-inline'")
    expect(scriptSrc).toContain("'self'")
  })
})
