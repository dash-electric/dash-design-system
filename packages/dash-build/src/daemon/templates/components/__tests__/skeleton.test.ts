import { describe, expect, it } from "vitest"
import {
  promptCardSkeleton,
  promptListSkeleton,
  statusBarSkeleton,
} from "../skeleton.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"

describe("skeleton placeholders", () => {
  it("promptCardSkeleton renders shimmer lines under db-skeleton-card", () => {
    const html = promptCardSkeleton()
    expect(html).toContain("db-skeleton-card")
    // 3 line stubs
    expect(html.match(/db-skeleton-line/g)?.length ?? 0).toBe(3)
    expect(html).toContain('aria-hidden="true"')
  })

  it("statusBarSkeleton renders two chip placeholders", () => {
    const html = statusBarSkeleton()
    expect(html).toContain("db-skeleton-status")
    expect(html.match(/db-skeleton-chip/g)?.length ?? 0).toBe(2)
  })

  it("promptListSkeleton renders N stacked card skeletons (default 3)", () => {
    const html = promptListSkeleton()
    expect(html.match(/db-skeleton-card/g)?.length ?? 0).toBe(3)
    expect(html).toContain('aria-busy="true"')
  })

  it("CSS includes shimmer keyframe animation", () => {
    expect(DASHBOARD_CSS).toContain("@keyframes db-shimmer")
    expect(DASHBOARD_CSS).toContain("animation: db-shimmer")
    expect(DASHBOARD_CSS).toContain(".db-skeleton-line")
    expect(DASHBOARD_CSS).toContain(".db-skeleton-chip")
  })
})
