/**
 * Bug fixes (2026-05-29) — regression tests for two CLIENT preview/refresh bugs:
 *
 *   P6 — Live-submit on empty workspace: preview never renders. The IDLE
 *        branch of preview-mount bound a no-op refresh listener that stored
 *        the source but never called mountSandpack, so the
 *        dash-build:preview-refresh event (carrying the generated component)
 *        was dropped on the most common first-run path. The idle branch now
 *        mirrors the cold-load branch and mounts on refresh.
 *   P9 — softRefreshChat read `data.status`, but GET /api/prompts/:id returns
 *        `{ ok, prompt, artifact }` — so status was ALWAYS undefined, the poll
 *        never detected "ready", and chat never updated after a workspace
 *        iteration. It now reads `data.prompt.status`.
 *
 * Tests stay at the substring-assertion level on the emitted client JS (same
 * style as composer-bug-fixes.test.ts).
 */

import { describe, expect, it } from "vitest"
import { DASHBOARD_JS } from "../../client/app.js"
import { PREVIEW_MOUNT_JS } from "../../client/preview-mount.js"

describe("P6 — idle preview branch mounts on refresh", () => {
  it("idle-branch refresh listener calls mountSandpack (not a no-op store)", () => {
    // The idle branch fires when there is no inline source (empty workspace,
    // live-submit first run). Its refresh handler must mount the incoming
    // source — storing it and returning was the dropped-preview bug.
    expect(PREVIEW_MOUNT_JS).toContain("setState(mount, \"idle\")")
    // After setState idle, the refresh handler assigns source AND mounts it.
    expect(PREVIEW_MOUNT_JS).toMatch(
      /setState\(mount, "idle"\);[\s\S]*?source = cs;[\s\S]*?mountSandpack\(mount, cs, promptId\);/
    )
  })

  it("does not regress the cold-load branch (still mounts inline source + on refresh)", () => {
    // Cold-load: inline source present — mount immediately, then mount again
    // on each refresh event. Both mount calls must survive the P6 edit.
    const coldMounts =
      PREVIEW_MOUNT_JS.match(/mountSandpack\(mount, cs, promptId\)/g) ?? []
    // One for the idle branch (P6 fix) + one for the cold-load refresh handler.
    expect(coldMounts.length).toBeGreaterThanOrEqual(2)
    expect(PREVIEW_MOUNT_JS).toContain("mountSandpack(mount, source, promptId)")
  })
})

describe("P9 — softRefreshChat reads prompt.status", () => {
  it("reads status from data.prompt.status, not data.status", () => {
    // GET /api/prompts/:id returns { ok, prompt, artifact }; data.status is
    // always undefined so the poll never resolved.
    expect(DASHBOARD_JS).toContain("function softRefreshChat")
    expect(DASHBOARD_JS).toContain(
      "var status = data && data.prompt && data.prompt.status"
    )
  })

  it("no longer reads the flat data.status field", () => {
    expect(DASHBOARD_JS).not.toContain("var status = data && data.status")
  })

  it("drops the dead 'approved' literal compare from the ready gate", () => {
    // Ready is reached on awaiting_approval | failed; the stale 'approved'
    // literal compare is removed.
    expect(DASHBOARD_JS).toContain('status === "awaiting_approval"')
    expect(DASHBOARD_JS).not.toContain('status === "approved"')
  })
})
