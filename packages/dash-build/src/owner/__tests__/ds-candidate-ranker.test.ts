/**
 * DSCandidateRanker tests — Sprint 3B Owner Co-pilot.
 *
 * Validates:
 *   - components matching known DS names are excluded
 *   - cross-project frequency drives score
 *   - domain-neutral names rank higher than domain-specific
 *   - ranking is stable (DESC by score, then alphabetical)
 */

import { describe, expect, it } from "vitest"
import { DSCandidateRanker } from "../ai/ds-candidate-ranker.js"
import type { Run, PromptStatus } from "../../daemon/state/types.js"

function makeRun(p: {
  id: string
  projectId: string
  prompt: string
  status?: PromptStatus
}): Run {
  return {
    id: p.id,
    threadId: "thr",
    projectId: p.projectId,
    prompt: p.prompt,
    status: p.status ?? "completed",
    repo: null,
    branch: null,
    contextPackRef: null,
    artifactDir: `/tmp/${p.id}`,
    validationScore: 90,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
    error: null,
    prUrl: null,
  }
}

describe("DSCandidateRanker", () => {
  it("excludes components already in the known DS registry", async () => {
    const runs = [
      makeRun({
        id: "r1",
        projectId: "p1",
        prompt: "build src/components/button.tsx with a primary variant",
      }),
    ]
    const ranker = new DSCandidateRanker()
    const candidates = await ranker.detectCandidates(runs)
    expect(candidates).toHaveLength(0)
  })

  it("surfaces a new candidate and ranks higher cross-repo count first", async () => {
    const runs = [
      // Component A — appears in 3 projects (high cross-repo)
      makeRun({
        id: "r1",
        projectId: "p1",
        prompt: "build src/components/MetricTile.tsx",
      }),
      makeRun({
        id: "r2",
        projectId: "p2",
        prompt: "build src/components/MetricTile.tsx",
      }),
      makeRun({
        id: "r3",
        projectId: "p3",
        prompt: "build src/components/MetricTile.tsx",
      }),
      // Component B — appears in 1 project only
      makeRun({
        id: "r4",
        projectId: "p1",
        prompt: "build src/components/SoloPanel.tsx",
      }),
    ]
    const ranker = new DSCandidateRanker()
    const candidates = await ranker.detectCandidates(runs)
    expect(candidates.length).toBeGreaterThanOrEqual(2)
    expect(candidates[0].componentName).toBe("MetricTile")
    expect(candidates[0].crossRepoCount).toBe(3)
    expect(candidates[0].score).toBeGreaterThan(candidates[1].score)
    expect(candidates[0].suggestedLayer).toBe("ui")
  })

  it("classifies domain-specific names as blocks (Layer 3)", async () => {
    const runs = [
      makeRun({
        id: "r1",
        projectId: "p1",
        prompt: "build src/components/DriverPolygonShift.tsx",
      }),
    ]
    const ranker = new DSCandidateRanker()
    const candidates = await ranker.detectCandidates(runs)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].domainNeutral).toBe(false)
    expect(candidates[0].suggestedLayer).toBe("blocks")
  })

  it("rankByReusability sorts DESC and tie-breaks alphabetically", () => {
    const ranker = new DSCandidateRanker()
    const sorted = ranker.rankByReusability([
      {
        componentName: "Zebra",
        occurrences: [],
        crossRepoCount: 1,
        complexity: 0,
        domainNeutral: true,
        score: 10,
        suggestedLayer: "ui",
        rationale: "",
      },
      {
        componentName: "Apple",
        occurrences: [],
        crossRepoCount: 1,
        complexity: 0,
        domainNeutral: true,
        score: 10,
        suggestedLayer: "ui",
        rationale: "",
      },
      {
        componentName: "Mango",
        occurrences: [],
        crossRepoCount: 5,
        complexity: 0,
        domainNeutral: true,
        score: 25,
        suggestedLayer: "ui",
        rationale: "",
      },
    ])
    expect(sorted[0].componentName).toBe("Mango")
    expect(sorted[1].componentName).toBe("Apple") // tie-break A < Z
    expect(sorted[2].componentName).toBe("Zebra")
  })
})
