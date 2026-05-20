import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { loadConfig } from "../config.js"
import { processGap, runOnce, processGapById } from "../pipeline.js"
import {
  appendGap,
  readQueue,
  writeQueue,
} from "../gap-queue.js"
import type { AnthropicClient } from "../generator.js"
import type { PipelineDeps } from "../pipeline.js"
import type { GapEntry } from "../gap-queue.js"

function mkTmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function silentLogger() {
  return {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  }
}

function makeFakeClient(text: string): AnthropicClient {
  return {
    messages: {
      create: async () => ({
        content: [{ type: "text", text }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    },
  }
}

const HIGH_QUALITY_TSX = `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"
// AUDIT TRAIL: log original + edited + editor + reason
export function ImageEditorWithAudit() {
  const [reason, setReason] = useState("")
  return <div className="bg-bg-weak-50 text-text-strong-950">
    <Button>Anda yakin?</Button>
  </div>
}
`

const LOW_QUALITY_TSX = `import { useForm } from "react-hook-form"
export function X() { return <div style={{ color: "#ff0000" }} /> }
`

describe("pipeline", () => {
  let tmp: string
  let queuePath: string
  let registryRoot: string
  let idemStorePath: string

  beforeEach(() => {
    tmp = mkTmp("hermes-pipeline-")
    queuePath = path.join(tmp, "gap-queue.json")
    registryRoot = path.join(tmp, "registry")
    idemStorePath = path.join(tmp, "hermes-idempotency.json")
    fs.mkdirSync(registryRoot, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  function depsWithClient(text: string): PipelineDeps {
    return {
      logger: silentLogger(),
      generator: {
        client: makeFakeClient(text),
        skill: async () => ({ systemAppend: "# Dash project context" }),
      },
      prCreator: {
        fetch: async () => ({
          ok: true,
          status: 201,
          json: async () => ({
            html_url: "https://github.com/test/dash/pull/42",
            number: 42,
          }),
          text: async () => "",
        }),
      },
      slackNotifier: {
        fetch: async () => ({
          ok: true,
          status: 200,
          json: async () => ({}),
          text: async () => "",
        }),
      },
      queuePath,
      idempotencyStorePath: idemStorePath,
    }
  }

  function gapInQueue(description: string): GapEntry {
    return appendGap(
      { description, severity: "high", repo: "halo-dash-fe", prompt: null },
      queuePath,
    )
  }

  it("vendored path: high score → real PR, status='vendored'", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        SLACK_WEBHOOK_URL: "https://hooks.slack.com/x",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const gap = gapInQueue("no image-editor for mitra proof upload")
    const outcome = await processGap(gap, config, depsWithClient(HIGH_QUALITY_TSX))
    expect(outcome.kind).toBe("vendored")
    if (outcome.kind === "vendored") {
      expect(outcome.score).toBeGreaterThanOrEqual(85)
      expect(outcome.pr.url).toBe("https://github.com/test/dash/pull/42")
      expect(outcome.pr.draft).toBe(false)
    }
    const queue = readQueue(queuePath)
    expect(queue.entries[0].status).toBe("vendored")
    expect(queue.entries[0].generated_block_path).toContain("image-editor-with-audit")
  })

  it("needs-review path: middling score → draft PR, status='synced'", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
        MIN_SCORE_AUTO_MERGE: "200",
        MIN_SCORE_REVIEW: "20",
      },
    })
    const gap = gapInQueue("misc widget")
    const outcome = await processGap(gap, config, depsWithClient(HIGH_QUALITY_TSX))
    expect(outcome.kind).toBe("needs-review")
    if (outcome.kind === "needs-review") {
      expect(outcome.pr.draft).toBe(true)
    }
    const queue = readQueue(queuePath)
    expect(queue.entries[0].status).toBe("synced")
  })

  it("failed path: score < MIN_SCORE_REVIEW → no PR, status='declined'", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
        MIN_SCORE_REVIEW: "90",
        MIN_SCORE_AUTO_MERGE: "95",
      },
    })
    const gap = gapInQueue("settings widget")
    const outcome = await processGap(gap, config, depsWithClient(LOW_QUALITY_TSX))
    expect(outcome.kind).toBe("failed")
    const queue = readQueue(queuePath)
    expect(queue.entries[0].status).toBe("declined")
  })

  it("runOnce processes all pending entries and skips already-vendored", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    gapInQueue("no image-editor for mitra proof")
    gapInQueue("no signature pad for mitra")
    // Mark one as already vendored — must not be reprocessed.
    const q = readQueue(queuePath)
    q.entries[0].status = "vendored"
    writeQueue(q, queuePath)
    const outcomes = await runOnce(config, depsWithClient(HIGH_QUALITY_TSX))
    expect(outcomes).toHaveLength(1)
    expect(outcomes[0].gap.description).toContain("signature pad")
  })

  it("processGapById finds by short id prefix", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        GITHUB_TOKEN: "ghp_fake",
        REGISTRY_ROOT: registryRoot,
      },
    })
    const created = gapInQueue("no image-editor for proof")
    const shortId = created.id.slice(0, 8)
    const outcome = await processGapById(shortId, config, depsWithClient(HIGH_QUALITY_TSX))
    expect(outcome).not.toBeNull()
    expect(outcome?.gap.id).toBe(created.id)
  })

  it("dry-run end-to-end: no network, status updated to vendored or synced", async () => {
    const config = loadConfig({
      env: { REGISTRY_ROOT: registryRoot },
      dryRun: true,
    })
    gapInQueue("no image-editor for mitra proof")
    const outcomes = await runOnce(config, {
      logger: silentLogger(),
      queuePath,
      idempotencyStorePath: idemStorePath,
    })
    expect(outcomes).toHaveLength(1)
    // Should land somewhere terminal — vendored or needs-review (stub is high quality).
    expect(["vendored", "needs-review"]).toContain(outcomes[0].kind)
    const queue = readQueue(queuePath)
    expect(["vendored", "synced"]).toContain(queue.entries[0].status)
  })

  it("recovers from generator throwing — outcome=failed, queue updated", async () => {
    const config = loadConfig({
      env: { ANTHROPIC_API_KEY: "sk-fake", REGISTRY_ROOT: registryRoot },
    })
    const gap = gapInQueue("no image-editor for proof")
    const throwingClient: AnthropicClient = {
      messages: {
        create: async () => {
          throw new Error("rate limited")
        },
      },
    }
    const outcome = await processGap(gap, config, {
      logger: silentLogger(),
      generator: {
        client: throwingClient,
        skill: async () => ({ systemAppend: "" }),
      },
      queuePath,
      idempotencyStorePath: idemStorePath,
    })
    expect(outcome.kind).toBe("failed")
    if (outcome.kind === "failed") {
      expect(outcome.reason).toContain("rate limited")
    }
    const queue = readQueue(queuePath)
    expect(queue.entries[0].status).toBe("declined")
  })
})
