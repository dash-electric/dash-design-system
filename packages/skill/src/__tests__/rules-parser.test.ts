import { describe, it, expect } from "vitest"
import {
  parseRules,
  slugifyHeading,
  extractLineRange,
  findChildSection,
} from "../lib/rules-parser.js"

const SAMPLE = `# Top

intro line.

## Always

ALWAYS prefer @dash primitives.

## Per-repo stack mandates (DO NOT VIOLATE)

### next-portal-v2-web (Dash portal — primary FE)
- Framework: Next.js App Router (TypeScript)
- Forms: Jotai

### next-backoffice-web (Dash backoffice ops)
- Framework: Next.js Pages Router (JavaScript)
- Forms: useState

## Per-service API envelope discrimination (CRITICAL — check before fetch)

before-fetch must discriminate.

### Rule for AI

1. Identify target service.
2. Look up the envelope shape.
`

describe("slugifyHeading", () => {
  it("strips parens and lowercases", () => {
    expect(slugifyHeading("next-portal-v2-web (Dash portal — primary FE)")).toBe(
      "next-portal-v2-web",
    )
  })

  it("collapses non-alnum into dashes", () => {
    expect(slugifyHeading("Per-service API envelope discrimination")).toBe(
      "per-service-api-envelope-discrimination",
    )
  })
})

describe("parseRules", () => {
  it("indexes top-level ## sections", () => {
    const r = parseRules(SAMPLE)
    expect(r.byId.has("always")).toBe(true)
    expect(r.byId.has("per-repo-stack-mandates")).toBe(true)
  })

  it("nests ### children under their ## parent", () => {
    const r = parseRules(SAMPLE)
    const parent = r.byId.get("per-repo-stack-mandates")!
    expect(parent.children.map((c) => c.id)).toEqual([
      "next-portal-v2-web",
      "next-backoffice-web",
    ])
  })

  it("each child body contains its content verbatim", () => {
    const r = parseRules(SAMPLE)
    const child = findChildSection(
      r,
      "per-repo-stack-mandates",
      "next-portal-v2-web",
    )
    expect(child).not.toBeNull()
    expect(child!.body).toContain("Jotai")
    expect(child!.body).not.toContain("useState")  // belongs to backoffice
  })

  it("section endLine stops before the next ## sibling", () => {
    const r = parseRules(SAMPLE)
    const always = r.byId.get("always")!
    const perRepo = r.byId.get("per-repo-stack-mandates")!
    expect(always.endLine).toBeLessThan(perRepo.startLine)
  })

  it("extractLineRange returns verbatim slice", () => {
    const r = parseRules(SAMPLE)
    const slice = extractLineRange(r, 5, 7)
    expect(slice).toContain("Always")
    expect(slice).toContain("ALWAYS prefer @dash primitives.")
  })

  it("returns empty for out-of-bounds range", () => {
    const r = parseRules(SAMPLE)
    expect(extractLineRange(r, 10000, 20000)).toBe("")
    expect(extractLineRange(r, 5, 3)).toBe("")
  })

  it("findChildSection returns null on miss", () => {
    const r = parseRules(SAMPLE)
    expect(findChildSection(r, "nonexistent", "child")).toBeNull()
    expect(
      findChildSection(r, "per-repo-stack-mandates", "no-such-repo"),
    ).toBeNull()
  })
})
