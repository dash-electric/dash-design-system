/**
 * Open WebUI #A4 — orchestrator A/B variant mode.
 *
 * Verifies:
 *   - variantCount=1 path stays single-variant (default behaviour, no extra calls)
 *   - variantCount=2 fans out 2 parallel chain calls with distinct variantId / temperature
 *   - The higher-scoring variant becomes the "winner" surfaced through getArtifact
 *   - variants.json + per-variant component-source.txt are persisted on disk
 *   - pickVariant promotes the chosen variant's files to canonical
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../orchestrator.js"
import type {
  AnthropicProvider,
  ClarificationGateway,
  GithubProvider,
  SkillChainRunner,
} from "../types.js"
import type { GenerateResult } from "../../skills/types.js"

const ORIGINAL_HOME = process.env.HOME
let dir: string
let store: Store
let broadcaster: Broadcaster
let events: Array<{ event: string; data: unknown }>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-orch-variants-"))
  // Force artifact-store DEFAULT_RUNS_ROOT into the temp dir for isolation.
  process.env.HOME = dir
  store = await Store.load({ path: join(dir, "state.json") })
  broadcaster = new Broadcaster()
  events = []
  vi.spyOn(broadcaster, "broadcast").mockImplementation((event, data) => {
    events.push({ event, data })
  })
})

afterEach(async () => {
  await store.persist()
  for (let i = 0; i < 5; i++) await Promise.resolve()
  process.env.HOME = ORIGINAL_HOME
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function makeAnthropic(): AnthropicProvider {
  return {
    isConnected: vi.fn(async () => true),
    buildSdkClient: vi.fn(async () => ({
      messages: { create: vi.fn(async () => ({ content: [] })) },
    })),
  }
}

function makeGithub(): GithubProvider {
  return {
    isConnected: vi.fn(async () => true),
    submitChanges: vi.fn(async () => ({
      prUrl: "https://github.com/x/y/pull/1",
      prNumber: 1,
      commitSha: "abc",
      branch: "dash-build/x",
    })),
  }
}

function makeClarification(): ClarificationGateway {
  return {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => null),
  }
}

function makeGeneratedResult(opts: {
  fileContent: string
  score: number
  explanation: string
}): GenerateResult {
  return {
    kind: "generated",
    response: {
      files: [
        {
          path: "preview.tsx",
          language: "tsx",
          content: opts.fileContent,
        },
      ],
      explanation: opts.explanation,
    },
    validation: {
      passed: true,
      score: opts.score,
      errors: [],
      warnings: [],
    },
    meta: {
      promptId: "id",
      modelId: "stub",
      prdSectionsTouched: 0,
      detectedRepoStack: null,
      designSources: [],
      skillSources: [],
    },
  }
}

function build(skillChain: SkillChainRunner) {
  return new Orchestrator({
    store,
    broadcaster,
    anthropic: makeAnthropic(),
    github: makeGithub(),
    clarification: makeClarification(),
    skillChain,
    ttlScheduler: null,
  })
}

/**
 * Wait for the orchestrator's submitPrompt → processPrompt microtask cascade
 * to settle. We poll the prompt status because submitPrompt fires
 * `queueMicrotask(() => processPrompt(...))` rather than awaiting it directly.
 */
async function waitFor(
  store: Store,
  promptId: string,
  predicate: (status: string) => boolean,
  timeoutMs = 2000,
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const p = store.getPrompt(promptId)
    if (p && predicate(p.status)) return
    await new Promise((r) => setTimeout(r, 10))
  }
  const final = store.getPrompt(promptId)
  throw new Error(
    `waitFor timed out — final status=${final?.status ?? "(missing)"}`,
  )
}

describe("Orchestrator A/B mode (#A4)", () => {
  it("variantCount=1 (default) calls the skill chain exactly once", async () => {
    const run = vi.fn(async () =>
      makeGeneratedResult({
        fileContent: "export default function X(){return null}",
        score: 90,
        explanation: "single",
      }),
    )
    const orchestrator = build({ run })
    const submitted = await orchestrator.submitPrompt({ text: "do thing", repo: "x" })
    await waitFor(
      store,
      submitted.promptId,
      (s) => s === "awaiting_approval" || s === "failed",
    )
    expect(run).toHaveBeenCalledTimes(1)
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    expect(artifact!.variants).toBeUndefined()
  })

  it("variantCount=2 fans out two parallel chain calls with distinct variant ids + temperatures", async () => {
    const seen: Array<{ variantId?: string; temperature?: number }> = []
    const run = vi.fn(async (input: { variantId?: string; temperature?: number }) => {
      seen.push({ variantId: input.variantId, temperature: input.temperature })
      const score = input.variantId === "b" ? 92 : 78
      return makeGeneratedResult({
        fileContent: `export default function V${input.variantId?.toUpperCase()}(){return null}`,
        score,
        explanation: `Variant ${input.variantId} explanation`,
      })
    })
    const orchestrator = build({ run })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "x",
      variantCount: 2,
    })
    await waitFor(
      store,
      submitted.promptId,
      (s) => s === "awaiting_approval" || s === "failed",
    )
    expect(run).toHaveBeenCalledTimes(2)
    const ids = seen.map((s) => s.variantId).sort()
    expect(ids).toEqual(["a", "b"])
    expect(seen.some((s) => s.temperature === 0.7)).toBe(true)
    expect(seen.some((s) => s.temperature === 0.9)).toBe(true)

    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    expect(artifact!.variants).toBeDefined()
    expect(artifact!.variants!.list.length).toBe(2)
    // Winner = higher score = 'b'
    expect(artifact!.variants!.active).toBe("b")

    // Each variant has its own persisted source + meta
    const { resolveRunDir } = await import("../../runs/artifact-store.js")
    const runDir = resolveRunDir(submitted.promptId)
    expect(existsSync(join(runDir, "variants.json"))).toBe(true)
    expect(existsSync(join(runDir, "variants", "a", "component-source.txt"))).toBe(true)
    expect(existsSync(join(runDir, "variants", "b", "component-source.txt"))).toBe(true)
    const aSrc = await readFile(
      join(runDir, "variants", "a", "component-source.txt"),
      "utf8",
    )
    expect(aSrc).toContain("VA")
    const bSrc = await readFile(
      join(runDir, "variants", "b", "component-source.txt"),
      "utf8",
    )
    expect(bSrc).toContain("VB")

    // variants:ready broadcast fired.
    expect(events.some((e) => e.event === "variants:ready")).toBe(true)
  })

  it("variantCount=2 still surfaces ONE winning artifact when one variant fails", async () => {
    let call = 0
    const run = vi.fn(async () => {
      call++
      if (call === 1) throw new Error("variant a boom")
      return makeGeneratedResult({
        fileContent: "export default function VB(){return null}",
        score: 80,
        explanation: "Variant b explanation",
      })
    })
    const orchestrator = build({ run })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "x",
      variantCount: 2,
    })
    await waitFor(
      store,
      submitted.promptId,
      (s) => s === "awaiting_approval" || s === "failed",
    )
    expect(call).toBe(2)
    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    expect(artifact!.variants).toBeDefined()
    // Only the surviving variant persisted.
    expect(artifact!.variants!.list.length).toBe(1)
    expect(artifact!.variants!.active).toBe("b")
  })

  it("pickVariant() promotes the picked variant to canonical files dir + broadcasts variants:picked", async () => {
    const run = vi.fn(async (input: { variantId?: string }) =>
      makeGeneratedResult({
        fileContent: `// ${input.variantId}\nexport default function V(){return null}`,
        score: input.variantId === "b" ? 90 : 80,
        explanation: `Variant ${input.variantId}`,
      }),
    )
    const orchestrator = build({ run })
    const submitted = await orchestrator.submitPrompt({
      text: "do thing",
      repo: "x",
      variantCount: 2,
    })
    await waitFor(
      store,
      submitted.promptId,
      (s) => s === "awaiting_approval" || s === "failed",
    )

    // Initial winner was 'b' — pick 'a' explicitly.
    const result = await orchestrator.pickVariant(submitted.promptId, "a")
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.active).toBe("a")
    expect(events.some((e) => e.event === "variants:picked")).toBe(true)

    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact!.variants!.active).toBe("a")

    const { resolveRunDir } = await import("../../runs/artifact-store.js")
    const canonicalSrc = await readFile(
      join(resolveRunDir(submitted.promptId), "files", "preview.tsx"),
      "utf8",
    )
    expect(canonicalSrc).toContain("// a")
  })

  it("pickVariant() returns error for unknown run / variant / id", async () => {
    const orchestrator = build({
      run: vi.fn(async () =>
        makeGeneratedResult({
          fileContent: "x",
          score: 70,
          explanation: "x",
        }),
      ),
    })
    const unknownRun = await orchestrator.pickVariant("does-not-exist", "a")
    expect(unknownRun.ok).toBe(false)

    const submitted = await orchestrator.submitPrompt({ text: "x", repo: "y" })
    await waitFor(
      store,
      submitted.promptId,
      (s) => s === "awaiting_approval" || s === "failed",
    )
    const noVariants = await orchestrator.pickVariant(submitted.promptId, "a")
    expect(noVariants.ok).toBe(false)
    if (!noVariants.ok) {
      expect(noVariants.error).toBe("no_variants_for_run")
    }

    const bogus = await orchestrator.pickVariant(submitted.promptId, "AA")
    expect(bogus.ok).toBe(false)
    if (!bogus.ok) expect(bogus.error).toBe("invalid_variant_id")
  })
})
