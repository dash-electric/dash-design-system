/**
 * Day 3 — preview iframe wired end-to-end.
 *
 * Verifies:
 *  1. Generation success calls the bundler (artifact.bundleResult set).
 *  2. Bundler failure → still awaiting_approval, no preview but PR-ready.
 *  3. /preview/:id → HTML shell (after bundler runs).
 *  4. /preview/:id/bundle.js → bundle bytes.
 *  5. approvePR success → cleanupOne(promptId) scheduled.
 *  6. SessionStore.expire() called on the TTL schedule.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { IncomingMessage, ServerResponse } from "node:http"
import { Store } from "../../daemon/state/store.js"
import { Broadcaster } from "../../daemon/ws/broadcaster.js"
import { Orchestrator } from "../../pipeline/orchestrator.js"
import { handlePreviewRoute } from "../../preview/api-routes.js"
import { resolvePreviewDir } from "../../preview/temp-dir.js"
import type {
  AnthropicProvider,
  ClarificationGateway,
  GithubProvider,
  PreviewBundler,
  SkillChainRunner,
} from "../../pipeline/types.js"
import type { GenerateResult } from "../../skills/types.js"
import type { BundleResult } from "../../preview/types.js"

// ── Fakes ──────────────────────────────────────────────────────────────────

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
      prUrl: "https://github.com/acme/repo/pull/7",
      prNumber: 7,
      commitSha: "deadbeef",
      branch: "dash-build/test",
    })),
  }
}

function makeClarification(): ClarificationGateway {
  return {
    create: vi.fn(async () => {}),
    resolved: vi.fn(async () => null),
  }
}

const GENERATED: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      { path: "preview.tsx", language: "tsx", content: "export default ()=>null" },
    ],
    explanation: "Demo",
  },
  validation: { passed: true, score: 90, errors: [], warnings: [] },
  meta: {
    promptId: "p",
    modelId: "claude-test",
    prdSectionsTouched: 0,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

function makeSkillChain(result: GenerateResult = GENERATED): SkillChainRunner {
  return { run: vi.fn(async () => result) }
}

// ── HTTP mock helpers (ServerResponse-shaped) ─────────────────────────────

function makeRes(): { res: ServerResponse; getStatus: () => number; getBody: () => string; getHeaders: () => Record<string, string | number> } {
  let statusCode = 0
  let body = Buffer.alloc(0)
  let headers: Record<string, string | number> = {}
  const res = {
    writeHead(code: number, h: Record<string, string | number>) {
      statusCode = code
      headers = { ...headers, ...h }
    },
    end(chunk?: Buffer | string) {
      if (chunk) body = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    },
  } as unknown as ServerResponse
  return {
    res,
    getStatus: () => statusCode,
    getBody: () => body.toString("utf8"),
    getHeaders: () => headers,
  }
}

function makeReq(method: string): IncomingMessage {
  return { method } as IncomingMessage
}

// ── Harness ────────────────────────────────────────────────────────────────

let workDir: string
let store: Store
let broadcaster: Broadcaster

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-preview-"))
  store = await Store.load({ path: join(workDir, "state.json") })
  broadcaster = new Broadcaster()
  vi.spyOn(broadcaster, "broadcast").mockImplementation(() => {})
})

afterEach(async () => {
  await store.persist()
  await new Promise((r) => setTimeout(r, 20))
  await rm(workDir, { recursive: true, force: true, maxRetries: 3 })
})

function build(opts: {
  bundler?: PreviewBundler
  expireSessions?: (ms: number) => Promise<number>
  ttlScheduler?: (tick: () => Promise<void>) => () => void
  previewCleanup?: (id: string) => Promise<boolean>
} = {}) {
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic: makeAnthropic(),
    github: makeGithub(),
    clarification: makeClarification(),
    skillChain: makeSkillChain(),
    previewBundler: opts.bundler,
    expireSessions: opts.expireSessions,
    ttlScheduler: opts.ttlScheduler,
    previewCleanup: opts.previewCleanup,
    previewCleanupDelayMs: 0, // immediate cleanup for tests
  })
  return orchestrator
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Day 3 — preview wired", () => {
  it("submitPrompt → generation success → bundler called", async () => {
    const bundle = vi.fn(async (input: { promptId: string }): Promise<BundleResult> => ({
      bundlePath: join(workDir, "bundle.js"),
      entryPath: join(workDir, "preview.tsx"),
      byteSize: 42,
      tempDir: workDir,
    }))
    const orchestrator = build({
      bundler: { bundle },
      ttlScheduler: () => () => {},
    })
    const prompt = store.addPrompt({ text: "build it", repo: "a/b", branch: null })
    await orchestrator.processPrompt(prompt.id)

    expect(bundle).toHaveBeenCalledOnce()
    const artifact = orchestrator.getArtifact(prompt.id)
    expect(artifact?.bundleResult?.byteSize).toBe(42)
    expect(store.getPrompt(prompt.id)?.status).toBe("awaiting_approval")
    orchestrator.dispose()
  })

  it("bundle failure → still awaiting_approval, surfaces fallback preview mode", async () => {
    const bundle = vi.fn(async () => {
      throw new Error("esbuild_missing")
    })
    const orchestrator = build({
      bundler: { bundle },
      ttlScheduler: () => () => {},
    })
    const prompt = store.addPrompt({ text: "build it", repo: "a/b", branch: null })
    await orchestrator.processPrompt(prompt.id)

    expect(bundle).toHaveBeenCalledOnce()
    const artifact = orchestrator.getArtifact(prompt.id)
    // Orchestrator now writes a fallback preview bundle (file listing + score
    // shell) when the real bundler fails, so the iframe still has something
    // to mount. `previewMode = "fallback"` is the canonical signal that this
    // is NOT a component render — the bundle exists but is the static recap.
    expect(artifact?.previewMode).toBe("fallback")
    expect(artifact?.bundleResult).toBeDefined()
    expect(artifact?.bundleResult?.entryPath).toContain("fallback")
    expect(store.getPrompt(prompt.id)?.status).toBe("awaiting_approval")
    orchestrator.dispose()
  })

  it("GET /preview/:id returns HTML shell", async () => {
    const { res, getStatus, getBody, getHeaders } = makeRes()
    await handlePreviewRoute(makeReq("GET"), res, "/preview/prm_abc")
    expect(getStatus()).toBe(200)
    const body = getBody()
    expect(body).toMatch(/<html/i)
    expect(body).toMatch(/prm_abc/)
    expect(String(getHeaders()["Content-Security-Policy"])).toMatch(/script-src/)
  })

  it("GET /preview/:id/bundle.js returns bundle bytes when present", async () => {
    const promptId = "prm_bundlebyte"
    const dir = resolvePreviewDir(promptId)
    await mkdir(dir, { recursive: true })
    const bundlePath = join(dir, "bundle.js")
    await writeFile(bundlePath, "(function(){/*bundle*/})()", "utf8")

    const { res, getStatus, getBody, getHeaders } = makeRes()
    await handlePreviewRoute(
      makeReq("GET"),
      res,
      `/preview/${promptId}/bundle.js`,
    )
    expect(getStatus()).toBe(200)
    expect(getBody()).toMatch(/bundle/)
    expect(String(getHeaders()["Content-Type"])).toMatch(/javascript/)

    // Cleanup
    await rm(dir, { recursive: true, force: true })
  })

  it("approve PR → preview cleanup invoked", async () => {
    const bundle = vi.fn(async (): Promise<BundleResult> => ({
      bundlePath: join(workDir, "bundle.js"),
      entryPath: join(workDir, "preview.tsx"),
      byteSize: 10,
      tempDir: workDir,
    }))
    const previewCleanup = vi.fn(async () => true)
    const orchestrator = build({
      bundler: { bundle },
      previewCleanup,
      ttlScheduler: () => () => {},
    })
    const prompt = store.addPrompt({ text: "ship it", repo: "a/b", branch: "main" })
    await orchestrator.processPrompt(prompt.id)
    await orchestrator.approvePR({ promptId: prompt.id })

    // delay is 0 → cleanup should be queued/awaited on next tick.
    await new Promise((res) => setTimeout(res, 10))
    expect(previewCleanup).toHaveBeenCalledWith(prompt.id)
    orchestrator.dispose()
  })

  it("approve PR accepts prTitle/prBody overrides", async () => {
    const github = makeGithub()
    const orchestrator = new Orchestrator({
      store,
      broadcaster,
      anthropic: makeAnthropic(),
      github,
      clarification: makeClarification(),
      skillChain: makeSkillChain(),
      previewBundler: { bundle: async () => ({
        bundlePath: "", entryPath: "", byteSize: 0, tempDir: "",
      }) },
      ttlScheduler: () => () => {},
      previewCleanupDelayMs: 0,
      previewCleanup: async () => true,
    })
    const prompt = store.addPrompt({ text: "x", repo: "a/b", branch: "main" })
    await orchestrator.processPrompt(prompt.id)
    await orchestrator.approvePR({
      promptId: prompt.id,
      prTitle: "Custom title",
      prBody: "Custom body content",
    })
    const call = (github.submitChanges as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.prTitle).toBe("Custom title")
    expect(call.prBody).toBe("Custom body content")
    orchestrator.dispose()
  })

  it("SessionStore.expire() called on schedule", async () => {
    let registeredTick: (() => Promise<void>) | null = null
    const cancel = vi.fn()
    const scheduler = (tick: () => Promise<void>) => {
      registeredTick = tick
      return cancel
    }
    const expireSessions = vi.fn(async () => 0)

    const orchestrator = build({
      ttlScheduler: scheduler,
      expireSessions,
      bundler: { bundle: async () => ({
        bundlePath: "", entryPath: "", byteSize: 0, tempDir: "",
      }) },
    })

    expect(registeredTick).toBeDefined()
    await registeredTick!()
    expect(expireSessions).toHaveBeenCalled()
    orchestrator.dispose()
    expect(cancel).toHaveBeenCalled()
  })
})
