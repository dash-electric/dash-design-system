/**
 * CostMonitor tests — Sprint 3B Owner Co-pilot.
 *
 * Use a fake Store snapshot so the proxy-token aggregation is deterministic.
 * Validates:
 *   - snapshot windowing (only trailing 7 days included)
 *   - per-user / per-project rollup
 *   - rule 1 user-daily-spike, rule 2 project-over-threshold, rule 3 burst
 */

import { describe, expect, it } from "vitest"
import { CostMonitor } from "../ai/cost-monitor.js"
import type { Run, DaemonState, PromptStatus } from "../../daemon/state/types.js"

const NOW = new Date("2026-05-26T12:00:00Z")
const MS_PER_DAY = 24 * 60 * 60 * 1000

function makeRun(p: {
  id: string
  repo: string | null
  status: PromptStatus
  createdAt: string
  updatedAt?: string
  validationScore?: number | null
}): Run {
  return {
    id: p.id,
    threadId: "thr-1",
    projectId: p.repo ?? "p_local",
    prompt: "stub",
    status: p.status,
    repo: p.repo,
    branch: null,
    contextPackRef: null,
    artifactDir: null,
    validationScore: p.validationScore ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
    error: null,
    prUrl: null,
  }
}

function fakeStore(runs: Run[]): {
  snapshot: () => DaemonState
} {
  // Cast — CostMonitor only calls store.snapshot() and reads .runs.
  return {
    snapshot: () =>
      ({
        runs,
      }) as unknown as DaemonState,
  }
}

const iso = (offsetMs: number) =>
  new Date(NOW.getTime() + offsetMs).toISOString()

describe("CostMonitor.snapshot", () => {
  it("aggregates only runs within the trailing 7-day window", async () => {
    const runs = [
      makeRun({
        id: "r1",
        repo: "octocat/demo",
        status: "completed",
        createdAt: iso(-1 * MS_PER_DAY),
        validationScore: 90,
      }),
      // Outside window — must be excluded.
      makeRun({
        id: "r-old",
        repo: "octocat/demo",
        status: "completed",
        createdAt: iso(-30 * MS_PER_DAY),
        validationScore: 90,
      }),
    ]
    const monitor = new CostMonitor({
      store: fakeStore(runs) as never,
      now: () => NOW,
    })
    const snap = await monitor.snapshot()
    expect(snap.perProject).toHaveLength(1)
    expect(snap.perProject[0].project).toBe("octocat/demo")
    expect(snap.weeklyTokens).toBe(3_000)
    expect(snap.trend).toHaveLength(7)
    expect(snap.proxy).toBe(true)
  })

  it("flags project-over-threshold anomalies", async () => {
    // Build 20 failed runs on one repo → 20 * 8K = 160K tokens → $0.80
    const repo = "octocat/big"
    const runs = Array.from({ length: 20 }, (_, i) =>
      makeRun({
        id: `r${i}`,
        repo,
        status: "failed",
        createdAt: iso(-(i % 6) * MS_PER_DAY),
      }),
    )
    const monitor = new CostMonitor({
      store: fakeStore(runs) as never,
      now: () => NOW,
      projectAlertThresholdUsd: 0.5, // tiny so the spike fires
    })
    const snap = await monitor.snapshot()
    const anomalies = await monitor.detectAnomalies(snap)
    expect(
      anomalies.some(
        (a) => a.kind === "project-over-threshold" && a.project === repo,
      ),
    ).toBe(true)
  })

  it("flags user-daily-spike when one day exceeds 3x avg", async () => {
    // 5 days @ ~3K tokens, then 1 day @ 30K tokens → ratio ~10x
    const runs: Run[] = []
    for (let day = 1; day <= 5; day++) {
      runs.push(
        makeRun({
          id: `r${day}`,
          repo: "octocat/demo",
          status: "completed",
          createdAt: iso(-day * MS_PER_DAY),
          validationScore: 90,
        }),
      )
    }
    // 10 failed runs all on the same recent day
    for (let i = 0; i < 10; i++) {
      runs.push(
        makeRun({
          id: `spike${i}`,
          repo: "octocat/demo",
          status: "failed",
          createdAt: iso(-0.5 * MS_PER_DAY + i * 1000),
        }),
      )
    }
    const monitor = new CostMonitor({
      store: fakeStore(runs) as never,
      now: () => NOW,
      projectAlertThresholdUsd: 1000, // disable rule 2 so we test only rule 1
    })
    const snap = await monitor.snapshot()
    const anomalies = await monitor.detectAnomalies(snap)
    expect(
      anomalies.some((a) => a.kind === "user-daily-spike"),
    ).toBe(true)
  })

  it("flags hour-over-hour burst when one hour > 5x prev", async () => {
    const runs: Run[] = []
    // Prev hour — 1 run = 3K tokens
    runs.push(
      makeRun({
        id: "prev",
        repo: "octocat/demo",
        status: "completed",
        createdAt: "2026-05-26T08:30:00Z",
        validationScore: 90,
      }),
    )
    // Next hour — 10 failed runs = 80K tokens
    for (let i = 0; i < 10; i++) {
      runs.push(
        makeRun({
          id: `b${i}`,
          repo: "octocat/demo",
          status: "failed",
          createdAt: `2026-05-26T09:${String(i).padStart(2, "0")}:00Z`,
        }),
      )
    }
    const monitor = new CostMonitor({
      store: fakeStore(runs) as never,
      now: () => NOW,
      projectAlertThresholdUsd: 1000,
    })
    const snap = await monitor.snapshot()
    const anomalies = await monitor.detectAnomalies(snap)
    expect(anomalies.some((a) => a.kind === "burst")).toBe(true)
  })
})
