import { describe, it, expect } from "vitest"
import {
  buildSlackPayload,
  notifySlack,
} from "../slack-notifier.js"
import { loadConfig } from "../config.js"
import type { GapEntry } from "../gap-queue.js"
import type { PipelineOutcome, PrResult } from "../types.js"

function gap(): GapEntry {
  return {
    id: "abc12345-def6-7890-1111-222233334444",
    created_at: new Date().toISOString(),
    description: "no image-editor in DS",
    severity: "high",
    repo: "halo-dash-fe",
    prompt: null,
    generated_block_path: null,
    status: "pending",
  }
}

function pr(url: string | null, draft: boolean): PrResult {
  return { url, number: url ? 1 : null, draft, stubbed: !url }
}

describe("buildSlackPayload", () => {
  it("formats vendored outcome with score + PR + install hint", () => {
    const outcome: PipelineOutcome = {
      kind: "vendored",
      gap: gap(),
      score: 92,
      pr: pr("https://github.com/x/pull/1", false),
    }
    const payload = buildSlackPayload(outcome, "image-editor-with-audit")
    expect(payload.text).toContain("Hermes Block Vendored")
    expect(payload.text).toContain("92/100")
    expect(payload.text).toContain("halo-dash-fe")
    expect(payload.text).toContain("https://github.com/x/pull/1")
    expect(payload.text).toContain("dashkit add image-editor-with-audit")
  })

  it("formats needs-review with draft PR", () => {
    const outcome: PipelineOutcome = {
      kind: "needs-review",
      gap: gap(),
      score: 70,
      pr: pr("https://github.com/x/pull/2", true),
      reason: "validation gates failed (tc=true test=false audit=true)",
    }
    const payload = buildSlackPayload(outcome, "image-editor-with-audit")
    expect(payload.text).toContain("Needs Review")
    expect(payload.text).toContain("draft PR")
    expect(payload.text).toContain("test=false")
  })

  it("formats failed outcome with reason and no PR", () => {
    const outcome: PipelineOutcome = {
      kind: "failed",
      gap: gap(),
      score: 30,
      reason: "score 30 < MIN_SCORE_REVIEW (60)",
    }
    const payload = buildSlackPayload(outcome, null)
    expect(payload.text).toContain("Hermes Failed")
    expect(payload.text).toContain("score: 30/100")
    expect(payload.text).toContain("MIN_SCORE_REVIEW")
  })
})

describe("notifySlack", () => {
  it("returns delivered=false when no webhook URL", async () => {
    const config = loadConfig({ env: {} })
    const result = await notifySlack(
      { text: "hi" },
      config,
      {
        fetch: async () => {
          throw new Error("should not be called")
        },
      },
    )
    expect(result.delivered).toBe(false)
  })

  it("returns delivered=false in dryRun even with webhook", async () => {
    const config = loadConfig({
      env: { SLACK_WEBHOOK_URL: "https://hooks.slack.com/x" },
      dryRun: true,
    })
    let calls = 0
    const result = await notifySlack(
      { text: "hi" },
      config,
      {
        fetch: async () => {
          calls++
          return { ok: true, status: 200, json: async () => ({}), text: async () => "" }
        },
      },
    )
    expect(result.delivered).toBe(false)
    expect(calls).toBe(0)
  })

  it("POSTs to the webhook when configured", async () => {
    const config = loadConfig({
      env: { SLACK_WEBHOOK_URL: "https://hooks.slack.com/x" },
    })
    let calledBody: string | undefined
    const result = await notifySlack(
      { text: "hi from hermes" },
      config,
      {
        fetch: async (_url, init) => {
          calledBody = init?.body
          return { ok: true, status: 200, json: async () => ({}), text: async () => "" }
        },
      },
    )
    expect(result.delivered).toBe(true)
    expect(calledBody).toContain("hi from hermes")
  })
})
