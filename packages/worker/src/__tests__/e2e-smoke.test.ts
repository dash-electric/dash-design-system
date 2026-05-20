/**
 * Hermes Wave 4 end-to-end smoke test.
 *
 * Verifies the full pipeline integrates across components that were tested
 * in isolation in Waves K (dashboard), L (API), N (worker), O (scaffolds):
 *
 *   gap-queue.json (file)
 *     → runOnce(config) picks pending entry
 *       → scaffold picker matches keywords (Wave O)
 *       → Skill v2 loader returns pinned-block bundle (Wave N integration)
 *       → Anthropic Messages.create called with composed system+user (MOCKED)
 *       → block tsx written to registryRoot/blocks/<name>.tsx
 *       → validator scores against Dash foundation rules
 *       → PR creator hits GitHub REST (MOCKED) and returns html_url
 *       → Slack webhook receives canonical payload (MOCKED)
 *       → queue entry status mutates to vendored / synced / declined
 *
 * Mocks: Anthropic SDK, GitHub REST fetch, Slack webhook fetch, Skill loader,
 * filesystem registry root (tmpdir). Zero real network. Zero touching of the
 * user's ~/.dash directory.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "../config.js"
import { runOnce, processGap } from "../pipeline.js"
import { readQueue } from "../gap-queue.js"
import { createMockHarness, type MockHarness } from "./helpers/mock-env.js"

const ENV_BASE = {
  ANTHROPIC_API_KEY: "sk-fake-e2e",
  GITHUB_TOKEN: "ghp_fake_e2e",
  GITHUB_REPO: "irfanputra-design/dash",
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T/B/X",
}

describe("Hermes E2E smoke (Wave 4)", () => {
  let harness: MockHarness

  beforeEach(() => {
    harness = createMockHarness()
  })

  afterEach(() => {
    harness.cleanup()
  })

  // -------------------------------------------------------------------------
  // 1. Happy path — full PE→gap→worker→PR→Slack pipeline.
  // -------------------------------------------------------------------------
  it("processes pending gap end-to-end → vendored + PR + Slack", async () => {
    // 1. PE drops a gap into the queue (simulating CLI `dash gap sync` having
    //    POSTed to /api/dashboard/requests which writes the queue file).
    const gap = harness.seedGap({
      description: "no image-editor for mitra proof upload",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: "Mitra needs to crop a delivery proof photo with audit trail.",
    })

    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })

    // 2. Worker one-shot pass.
    const outcomes = await runOnce(config, harness.deps)
    expect(outcomes).toHaveLength(1)
    const outcome = outcomes[0]

    // 3. Anthropic called with Skill v2 systemAppend (pinned blocks present).
    expect(harness.anthropicCalls).toHaveLength(1)
    const call = harness.anthropicCalls[0]
    expect(call.model).toBe("claude-opus-4-7")
    expect(call.system).toContain("refuse-list")
    expect(call.system).toContain("audit-trail")
    expect(call.system).toContain("envelope")
    expect(call.system).toContain("external-lib policy")
    expect(call.userPrompt).toContain("image-editor")
    expect(call.userPrompt).toContain("Output contract")

    // 4. Block file actually written to the (mock) registry root.
    const expectedBlockPath = path.join(
      harness.registryRoot,
      "blocks",
      "image-editor-with-audit.tsx",
    )
    expect(fs.existsSync(expectedBlockPath)).toBe(true)
    const written = fs.readFileSync(expectedBlockPath, "utf-8")
    expect(written).toContain("AUDIT TRAIL")
    expect(written).toContain("@/registry/dash/ui/button")

    // 5. Score ≥ 85 (auto-merge band).
    expect(outcome.kind).toBe("vendored")
    if (outcome.kind === "vendored") {
      expect(outcome.score).toBeGreaterThanOrEqual(85)
      expect(outcome.pr.url).toBe(
        "https://github.com/irfanputra-design/dash/pull/4242",
      )
      expect(outcome.pr.draft).toBe(false)
    }

    // 6. PR creator hit GitHub with correct shape.
    expect(harness.githubCalls).toHaveLength(1)
    const ghCall = harness.githubCalls[0]
    expect(ghCall.url).toBe(
      "https://api.github.com/repos/irfanputra-design/dash/pulls",
    )
    expect(ghCall.method).toBe("POST")
    const ghBody = ghCall.body as {
      title: string
      head: string
      base: string
      draft: boolean
    }
    expect(ghBody.title).toContain("vendored image-editor-with-audit")
    expect(ghBody.head).toMatch(/^hermes\//)
    expect(ghBody.base).toBe("main")
    expect(ghBody.draft).toBe(false)

    // 7. Slack notified with vendored format.
    expect(harness.slackCalls).toHaveLength(1)
    const slackBody = harness.slackCalls[0].body as { text: string }
    expect(slackBody.text).toContain("🤖 *Hermes Block Vendored*")
    expect(slackBody.text).toContain("score:")
    expect(slackBody.text).toContain("PR: https://github.com/")
    expect(slackBody.text).toContain("install: dash add image-editor-with-audit")

    // 8. Queue entry mutated: vendored + generated_block_path set.
    const queueAfter = readQueue(harness.queuePath)
    const entry = queueAfter.entries.find((e) => e.id === gap.id)
    expect(entry?.status).toBe("vendored")
    expect(entry?.generated_block_path).toBe(expectedBlockPath)
  })

  // -------------------------------------------------------------------------
  // 2. Failure mode — middling score routes to draft PR.
  // -------------------------------------------------------------------------
  it("low score routes to needs-review draft PR + alert Slack", async () => {
    // Override Anthropic response with TSX that's structurally fine but uses
    // casual voice ("kamu") — fails formal-voice criterion (-10) when the gap
    // is mitra-facing. Also missing audit trail despite legal/financial
    // description (-15). Lands in [60, 85) review band.
    harness.cleanup()
    harness = createMockHarness({
      anthropicResponse: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"
export function PaymentWidget() {
  const [v, setV] = useState("")
  return <div className="bg-primary-500 text-text-strong-950"><Button>Kirim, kamu yakin?</Button></div>
}
`,
    })
    harness.seedGap({
      description: "payment widget for mitra payout",
      severity: "medium",
      repo: "portal-v2",
      prompt: null,
    })

    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })
    const outcomes = await runOnce(config, harness.deps)
    expect(outcomes).toHaveLength(1)
    const outcome = outcomes[0]

    // Score lands in [60, 85): needs-review band, draft PR opened.
    expect(outcome.kind).toBe("needs-review")
    if (outcome.kind === "needs-review") {
      expect(outcome.score).toBeGreaterThanOrEqual(60)
      expect(outcome.score).toBeLessThan(85)
      expect(outcome.pr.draft).toBe(true)
    }

    const ghBody = harness.githubCalls[0].body as { draft: boolean }
    expect(ghBody.draft).toBe(true)

    const slackText = (harness.slackCalls[0].body as { text: string }).text
    expect(slackText).toContain("⚠️ *Hermes Needs Review*")
    expect(slackText).toContain("draft PR:")

    const queue = readQueue(harness.queuePath)
    expect(queue.entries[0].status).toBe("synced")
  })

  // -------------------------------------------------------------------------
  // 3. Failure mode — generator throws → outcome=failed + queue=declined.
  // -------------------------------------------------------------------------
  it("generator failure marks status=declined + Slack alert", async () => {
    harness.cleanup()
    harness = createMockHarness({
      anthropicThrow: new Error("Anthropic 529: overloaded"),
    })
    harness.seedGap({
      description: "no image-editor for mitra proof",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: null,
    })

    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })
    const outcomes = await runOnce(config, harness.deps)
    expect(outcomes).toHaveLength(1)
    expect(outcomes[0].kind).toBe("failed")
    if (outcomes[0].kind === "failed") {
      expect(outcomes[0].reason).toContain("Anthropic 529")
    }

    // No PR opened on generator failure.
    expect(harness.githubCalls).toHaveLength(0)

    // Slack still notified (failure variant).
    expect(harness.slackCalls).toHaveLength(1)
    const slackText = (harness.slackCalls[0].body as { text: string }).text
    expect(slackText).toContain("🔥 *Hermes Failed*")
    expect(slackText).toContain("Anthropic 529")

    const queue = readQueue(harness.queuePath)
    expect(queue.entries[0].status).toBe("declined")
  })

  // -------------------------------------------------------------------------
  // 4. Scaffold picker integration — keyword routing.
  // -------------------------------------------------------------------------
  it("scaffold picker routes image keyword → image-editor-with-audit", async () => {
    const gap = harness.seedGap({
      description: "annotate proof image for delivery confirmation",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: null,
    })
    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })

    await processGap(gap, config, { ...harness.deps, queuePath: harness.queuePath })

    // The generator composed a user prompt that names the scaffold; the
    // resolved path includes the scaffold name on disk.
    expect(harness.anthropicCalls[0].userPrompt).toContain(
      "name: image-editor-with-audit",
    )
    const queueAfter = readQueue(harness.queuePath)
    expect(queueAfter.entries[0].generated_block_path).toContain(
      "image-editor-with-audit.tsx",
    )

    // Sibling scaffold check: kyc keyword routes elsewhere. Append a second
    // gap and verify cross-routing on the same harness.
    const kycGap = harness.seedGap({
      description: "bulk-upload KYC documents for mitra onboarding",
      severity: "medium",
      repo: "portal-v2",
      prompt: null,
    })
    await processGap(kycGap, config, {
      ...harness.deps,
      queuePath: harness.queuePath,
    })
    const kycCall = harness.anthropicCalls[1]
    expect(kycCall.userPrompt).toContain("name: kyc-uploader")
  })

  // -------------------------------------------------------------------------
  // 5. Skill v2 context — pinned blocks reach Anthropic system prompt.
  // -------------------------------------------------------------------------
  it("Skill v2 context includes all four pinned blocks", async () => {
    harness.seedGap({
      description: "payment-form for mitra payout flow",
      severity: "high",
      repo: "backoffice",
      prompt: null,
    })
    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })

    await runOnce(config, harness.deps)

    expect(harness.anthropicCalls).toHaveLength(1)
    const system = harness.anthropicCalls[0].system
    // The four pinned blocks the Skill v2 loader is contracted to surface.
    expect(system).toMatch(/refuse-list/)
    expect(system).toMatch(/envelope/)
    expect(system).toMatch(/audit-trail/)
    expect(system).toMatch(/external-lib policy/)
    expect(system).toMatch(/react-hook-form/)
  })

  // -------------------------------------------------------------------------
  // 6. GitHub API failure — pipeline does not crash, PR stubbed.
  // -------------------------------------------------------------------------
  it("GitHub 422 → pipeline degrades to stubbed PR (no crash)", async () => {
    harness.cleanup()
    harness = createMockHarness({ githubFail: true })
    harness.seedGap({
      description: "no image-editor for mitra proof",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: null,
    })
    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })
    const outcomes = await runOnce(config, harness.deps)
    expect(outcomes).toHaveLength(1)
    // Per pipeline.ts post-Wave5-fix: stubbed PR auto-downgrades outcome
    // to needs-review (no ghost "vendored without PR" rows in dashboard).
    expect(outcomes[0].kind).toBe("needs-review")
    if (outcomes[0].kind === "needs-review") {
      expect(outcomes[0].pr.stubbed).toBe(true)
      expect(outcomes[0].pr.url).toBeNull()
    }
  })

  // -------------------------------------------------------------------------
  // 7. Multi-gap batch — runOnce sweeps the whole queue in order.
  // -------------------------------------------------------------------------
  it("runOnce drains multiple pending gaps in one pass", async () => {
    harness.seedGap({
      description: "no image-editor for mitra proof",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: null,
    })
    harness.seedGap({
      description: "kyc uploader for mitra onboarding",
      severity: "medium",
      repo: "portal-v2",
      prompt: null,
    })
    harness.seedGap({
      description: "signature pad for mitra contract",
      severity: "high",
      repo: "halo-dash-fe",
      prompt: null,
    })

    const config = loadConfig({
      env: { ...ENV_BASE, REGISTRY_ROOT: harness.registryRoot },
    })
    const outcomes = await runOnce(config, harness.deps)
    expect(outcomes).toHaveLength(3)
    expect(harness.anthropicCalls).toHaveLength(3)
    expect(harness.githubCalls.length).toBeGreaterThanOrEqual(3)
    expect(harness.slackCalls).toHaveLength(3)

    const queue = readQueue(harness.queuePath)
    // All terminal (none left pending).
    for (const e of queue.entries) {
      expect(["vendored", "synced", "declined"]).toContain(e.status)
    }
  })
})
