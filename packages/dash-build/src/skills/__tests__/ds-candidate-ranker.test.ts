/**
 * DSCandidateRanker (skills) tests — Tier 6.
 *
 * Validates that the content-based ranker:
 *   - detects Badge / Card / EmptyState / TabBar inline patterns
 *   - clusters across artifacts
 *   - returns deterministic order (occurrences DESC, then name ASC)
 *   - skips non-JSX files
 *   - surfaces tone variants and project cross-repo count
 */

import { describe, expect, it } from "vitest"
import {
  DSCandidateRanker,
  classifyShape,
  detectTone,
  extractClassName,
  isJsxSource,
  type RankerArtifact,
} from "../ds-candidate-ranker.js"

function artifact(
  runId: string,
  projectId: string,
  path: string,
  content: string,
): RankerArtifact {
  return { runId, projectId, path, content }
}

describe("DSCandidateRanker — primitives", () => {
  it("isJsxSource accepts only tsx/jsx", () => {
    expect(isJsxSource("foo.tsx")).toBe(true)
    expect(isJsxSource("foo.jsx")).toBe(true)
    expect(isJsxSource("foo.ts")).toBe(false)
    expect(isJsxSource("foo.css")).toBe(false)
  })

  it("extractClassName handles double, single, and template literal forms", () => {
    expect(extractClassName('className="px-4 py-2"')).toBe("px-4 py-2")
    expect(extractClassName("className='px-4 py-2'")).toBe("px-4 py-2")
    expect(extractClassName("className={`px-4 py-2`}")).toBe("px-4 py-2")
    expect(extractClassName("style={{}}")).toBeNull()
  })

  it("classifyShape recognises Badge-like inline div", () => {
    const r = classifyShape(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success-base text-static-white",
    )
    expect(r?.name).toBe("Badge")
  })

  it("classifyShape recognises EmptyState shape", () => {
    const r = classifyShape(
      "flex flex-col items-center text-center py-12 gap-4 justify-center",
    )
    expect(r?.name).toBe("EmptyState")
  })

  it("classifyShape recognises a Card-like shape (MetricCard is the more specific match)", () => {
    // EmptyState/MetricCard fire before Card because they are stricter; the
    // ranker is intentionally biased toward the more descriptive name when
    // both rules match.
    const r = classifyShape("rounded-lg border p-6 bg-bg-white-0")
    expect(r?.name).toBe("MetricCard")
  })

  it("classifyShape falls back to Card when MetricCard guards do not fit", () => {
    // No `p-*`, no `border`/`shadow` — only Card's minimal pair (rounded + shadow).
    const r = classifyShape("rounded-md shadow-sm")
    expect(r?.name).toBe("Card")
  })

  it("detectTone maps colour classes to semantic tones", () => {
    expect(detectTone("bg-success-base text-static-white")).toBe("success")
    expect(detectTone("bg-warning-light text-warning-dark")).toBe("warning")
    expect(detectTone("bg-error-base")).toBe("error")
    expect(detectTone("bg-info-light")).toBe("info")
    expect(detectTone("bg-bg-white-0")).toBe("neutral")
  })
})

describe("DSCandidateRanker — clustering", () => {
  const badgeOnce = `
    <div className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success-base text-static-white">
      Active
    </div>
  `
  const badgeWarning = `
    <div className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning-base text-static-white">
      Pending
    </div>
  `
  const badgeError = `
    <div className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-error-base text-static-white">
      Failed
    </div>
  `
  const cardOnce = `
    <div className="rounded-lg border p-6 bg-bg-white-0">
      <div className="text-text-strong-950">Title</div>
    </div>
  `
  const emptyStateOnce = `
    <div className="flex flex-col items-center text-center py-12 gap-4 justify-center">
      <p>Nothing here.</p>
    </div>
  `

  it("clusters Badge inline divs across multiple artifacts", () => {
    const ranker = new DSCandidateRanker()
    const out = ranker.rank([
      artifact("r1", "p1", "Status.tsx", badgeOnce),
      artifact("r2", "p2", "Pill.tsx", badgeWarning),
      artifact("r3", "p2", "Result.tsx", badgeError),
    ])
    const badge = out.find((c) => c.shape === "Badge")
    expect(badge).toBeDefined()
    expect(badge?.occurrences).toBe(3)
    expect(badge?.crossRepoCount).toBe(2)
    expect(badge?.variants.sort()).toEqual(["error", "success", "warning"])
  })

  it("returns up to topN candidates sorted by occurrences DESC then name ASC", () => {
    const ranker = new DSCandidateRanker({ topN: 3 })
    const out = ranker.rank([
      artifact(
        "r1",
        "p1",
        "Mix.tsx",
        `${badgeOnce}${badgeWarning}${cardOnce}${emptyStateOnce}`,
      ),
      artifact("r2", "p2", "Card.tsx", cardOnce),
    ])
    expect(out.length).toBeLessThanOrEqual(3)
    // Sort key invariants
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i]
      const b = out[i + 1]
      if (a.occurrences === b.occurrences) {
        expect(a.name.localeCompare(b.name)).toBeLessThan(1)
      } else {
        expect(a.occurrences).toBeGreaterThan(b.occurrences)
      }
    }
  })

  it("skips non-JSX files even if content looks like JSX", () => {
    const ranker = new DSCandidateRanker()
    const out = ranker.rank([
      artifact("r1", "p1", "notes.md", badgeOnce),
      artifact("r1", "p1", "app.css", badgeOnce),
    ])
    expect(out).toHaveLength(0)
  })

  it("produces deterministic output for the same input", () => {
    const ranker = new DSCandidateRanker()
    const corpus = [
      artifact("r1", "p1", "A.tsx", `${badgeOnce}${cardOnce}`),
      artifact("r2", "p2", "B.tsx", `${badgeWarning}${emptyStateOnce}`),
    ]
    const a = ranker.rank(corpus)
    const b = ranker.rank(corpus)
    expect(a).toEqual(b)
  })

  it("captures up to 3 representative samples per candidate", () => {
    const ranker = new DSCandidateRanker({ samplesPerCandidate: 3 })
    const out = ranker.rank([
      artifact("r1", "p1", "A.tsx", badgeOnce),
      artifact("r2", "p1", "B.tsx", badgeWarning),
      artifact("r3", "p2", "C.tsx", badgeError),
      artifact("r4", "p2", "D.tsx", badgeOnce),
    ])
    const badge = out.find((c) => c.shape === "Badge")
    expect(badge?.samples.length).toBeLessThanOrEqual(3)
    expect(badge?.samples[0].snippet).toContain("rounded-full")
  })
})
