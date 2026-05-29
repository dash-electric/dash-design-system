import { describe, expect, it } from "vitest"
import { reviewDesignCoverage } from "../design-review.js"
import type { ParsedResponse } from "../types.js"

function tsx(path: string, content: string) {
  return { path, language: "tsx", content }
}

function emptyResponse(files: ReturnType<typeof tsx>[]): ParsedResponse {
  return { files, explanation: "" }
}

describe("reviewDesignCoverage", () => {
  it("returns zero coverage + advisory suggestion when no @dash imports", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        tsx(
          "src/page.tsx",
          'export default function Page(){return <div><span>hi</span></div>}',
        ),
      ]),
    )
    expect(out.dsImports).toBe(0)
    expect(out.atomsUsed).toEqual([])
    expect(out.coverage).toBe(0)
    expect(out.suggestions[0]).toMatch(/No @dash\/\* imports/i)
  })

  it("extracts named imports from @dash/kit blocks", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        tsx(
          "src/page.tsx",
          'import { Badge, Card, type CardProps } from "@dash/kit"\n' +
            'import Table from "@dash/kit/table"\n' +
            'export default function Page(){return <Badge variant="success"><Card/></Badge>}',
        ),
      ]),
    )
    expect(out.atomsUsed).toEqual(["Badge", "Card", "CardProps", "Table"])
    expect(out.dsImports).toBeGreaterThanOrEqual(2)
  })

  it("ignores files with non-UI extensions (e.g. .json, .md)", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        { path: "src/manifest.json", language: "json", content: '{"x": 1}' },
        { path: "docs/notes.md", language: "md", content: "# notes" },
      ]),
    )
    expect(out.atomsUsed).toEqual([])
    expect(out.dsImports).toBe(0)
    // No UI files means no suggestions.
    expect(out.suggestions).toEqual([])
  })

  it("flags raw utility-class anti-pattern", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        tsx(
          "src/badge.tsx",
          'export default function B(){return <div className="bg-success-light">ok</div>}',
        ),
      ]),
    )
    expect(out.rawUtilityAntipatterns).toBe(1)
    expect(out.suggestions.some((s) => /raw utility-class/i.test(s))).toBe(true)
  })

  it("suggests strong coverage when ratio >= 0.8 and no anti-patterns", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        tsx(
          "src/strong.tsx",
          'import { Badge, Card } from "@dash/kit"\n' +
            "export default function S(){return <Badge><Card/></Badge>}",
        ),
      ]),
    )
    // No raw lowercase JSX tags → ratio is dsImports / max(1, 0) = dsImports.
    expect(out.coverage).toBeGreaterThanOrEqual(0.8)
    expect(out.suggestions.join(" ")).toMatch(/Strong DS coverage/i)
  })

  it("returns no suggestions for non-UI output", () => {
    const out = reviewDesignCoverage(
      emptyResponse([
        { path: "src/lib.ts", language: "ts", content: "export const x = 1" },
      ]),
    )
    expect(out.suggestions).toEqual([])
    expect(out.atomsUsed).toEqual([])
  })
})
