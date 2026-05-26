/**
 * ActivityAnomalyDetector tests — Sprint 3B Owner Co-pilot.
 *
 * Validates each of the three rules in isolation:
 *   1. stuck-user (3+ consecutive failures)
 *   2. slow-run (duration > 5x project median)
 *   3. repeated-prompt (4+ similar prompts from same user)
 */

import { describe, expect, it } from "vitest"
import { ActivityAnomalyDetector } from "../ai/activity-anomaly.js"
import type { Run, PromptStatus } from "../../daemon/state/types.js"

function makeRun(p: {
  id: string
  repo: string | null
  projectId?: string
  prompt?: string
  status: PromptStatus
  createdAt: string
  updatedAt?: string
}): Run {
  return {
    id: p.id,
    threadId: "thr",
    projectId: p.projectId ?? "p1",
    prompt: p.prompt ?? "stub prompt",
    status: p.status,
    repo: p.repo,
    branch: null,
    contextPackRef: null,
    artifactDir: null,
    validationScore: null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
    error: null,
    prUrl: null,
  }
}

describe("ActivityAnomalyDetector — stuck-user", () => {
  it("fires when 3+ consecutive failures hit same user/project", () => {
    const runs: Run[] = [
      makeRun({
        id: "r1",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:00:00Z",
      }),
      makeRun({
        id: "r2",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:10:00Z",
      }),
      makeRun({
        id: "r3",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:20:00Z",
      }),
    ]
    const det = new ActivityAnomalyDetector()
    const out = det.detect(runs)
    const stuck = out.find((a) => a.kind === "stuck-user")
    expect(stuck).toBeDefined()
    expect(stuck?.runIds).toHaveLength(3)
    expect(stuck?.user).toBe("octocat/demo")
  })

  it("does NOT fire when a success breaks the streak", () => {
    const runs: Run[] = [
      makeRun({
        id: "r1",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:00:00Z",
      }),
      makeRun({
        id: "r2",
        repo: "octocat/demo",
        status: "completed",
        createdAt: "2026-05-26T08:10:00Z",
      }),
      makeRun({
        id: "r3",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:20:00Z",
      }),
      makeRun({
        id: "r4",
        repo: "octocat/demo",
        status: "failed",
        createdAt: "2026-05-26T08:30:00Z",
      }),
    ]
    const det = new ActivityAnomalyDetector()
    const out = det.detect(runs)
    expect(out.some((a) => a.kind === "stuck-user")).toBe(false)
  })
})

describe("ActivityAnomalyDetector — slow-run", () => {
  it("flags a run > 5x the project median", () => {
    // 3 normal runs ~5s each; one outlier 60s.
    const base = "2026-05-26T08:00:00Z"
    const at = (s: number) => new Date(Date.parse(base) + s * 1000).toISOString()
    const runs: Run[] = [
      makeRun({
        id: "r1",
        repo: "octocat/demo",
        status: "completed",
        createdAt: at(0),
        updatedAt: at(5),
      }),
      makeRun({
        id: "r2",
        repo: "octocat/demo",
        status: "completed",
        createdAt: at(10),
        updatedAt: at(15),
      }),
      makeRun({
        id: "r3",
        repo: "octocat/demo",
        status: "completed",
        createdAt: at(20),
        updatedAt: at(25),
      }),
      makeRun({
        id: "r-slow",
        repo: "octocat/demo",
        status: "completed",
        createdAt: at(30),
        updatedAt: at(90), // 60s — 12x median
      }),
    ]
    const det = new ActivityAnomalyDetector({ slowRunMultiplier: 5 })
    const out = det.detect(runs)
    const slow = out.find((a) => a.kind === "slow-run")
    expect(slow).toBeDefined()
    expect(slow?.runIds).toEqual(["r-slow"])
  })

  it("skips when there are fewer than 3 runs (no median basis)", () => {
    const runs: Run[] = [
      makeRun({
        id: "r1",
        repo: "octocat/demo",
        status: "completed",
        createdAt: "2026-05-26T08:00:00Z",
        updatedAt: "2026-05-26T08:00:05Z",
      }),
    ]
    const det = new ActivityAnomalyDetector()
    const out = det.detect(runs)
    expect(out.some((a) => a.kind === "slow-run")).toBe(false)
  })
})

describe("ActivityAnomalyDetector — repeated-prompt", () => {
  it("clusters 4+ similar prompts from the same user", () => {
    const runs: Run[] = [
      makeRun({
        id: "p1",
        repo: "octocat/demo",
        status: "completed",
        prompt: "build a metric tile card",
        createdAt: "2026-05-26T08:00:00Z",
      }),
      makeRun({
        id: "p2",
        repo: "octocat/demo",
        status: "completed",
        prompt: "build metric tile card with badge",
        createdAt: "2026-05-26T08:05:00Z",
      }),
      makeRun({
        id: "p3",
        repo: "octocat/demo",
        status: "completed",
        prompt: "build the metric tile card component",
        createdAt: "2026-05-26T08:10:00Z",
      }),
      makeRun({
        id: "p4",
        repo: "octocat/demo",
        status: "completed",
        prompt: "metric tile card needs status icon",
        createdAt: "2026-05-26T08:15:00Z",
      }),
    ]
    const det = new ActivityAnomalyDetector({ promptSimilarity: 0.4 })
    const out = det.detect(runs)
    const rep = out.find((a) => a.kind === "repeated-prompt")
    expect(rep).toBeDefined()
    expect(rep?.runIds.length).toBeGreaterThanOrEqual(4)
  })

  it("does NOT fire for unrelated prompts", () => {
    const runs: Run[] = [
      makeRun({
        id: "p1",
        repo: "octocat/demo",
        status: "completed",
        prompt: "scaffold a login screen",
        createdAt: "2026-05-26T08:00:00Z",
      }),
      makeRun({
        id: "p2",
        repo: "octocat/demo",
        status: "completed",
        prompt: "wire up the prisma schema for invoices",
        createdAt: "2026-05-26T08:05:00Z",
      }),
      makeRun({
        id: "p3",
        repo: "octocat/demo",
        status: "completed",
        prompt: "add audit trail to payment editor",
        createdAt: "2026-05-26T08:10:00Z",
      }),
      makeRun({
        id: "p4",
        repo: "octocat/demo",
        status: "completed",
        prompt: "build a marketing landing page",
        createdAt: "2026-05-26T08:15:00Z",
      }),
    ]
    const det = new ActivityAnomalyDetector()
    const out = det.detect(runs)
    expect(out.some((a) => a.kind === "repeated-prompt")).toBe(false)
  })
})
