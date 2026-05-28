/**
 * Bug 2 regression (2026-05-28) — patch-mode preview cold-load.
 *
 * When the orchestrator finishes a patch-only generation (no new files, just
 * unified diffs against existing source) the live SSE flow already worked:
 * `emitComponentUpdated` reads the original file from the sandbox clone,
 * applies the diff in memory, and broadcasts the patched source via
 * `component:updated`. The browser bridge in app.ts forwards that to the
 * Sandpack mount.
 *
 * The gap was cold-load: a page refresh / process restart routed through
 * `loadInitialPreview`, which only walks `<runDir>/files/`. Patch-only runs
 * have no entries there, so the function returned `null` and the workspace
 * landed at "Preview will mount here" indefinitely.
 *
 * Fix: the orchestrator now mirrors the post-patch source under
 * `<runDir>/files/<patchPath>` so the next cold-load picks it up via the
 * existing pickComponentFile() walk. This test covers the disk-mirror.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdir, mkdtemp, rm, writeFile, readFile } from "node:fs/promises"
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
import { resolveRunDir } from "../../runs/artifact-store.js"
import { loadInitialPreview } from "../../daemon/preview-initial.js"

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
      prUrl: "https://github.com/acme/repo/pull/1",
      prNumber: 1,
      commitSha: "abc",
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

// Patch-only generation — `files` empty, `patches` carries a clean unified
// diff against a known fixture file.
const ORIGINAL_TSX =
  "import React from 'react'\n" +
  "export default function Card() {\n" +
  "  return <div>hello</div>\n" +
  "}\n"

const PATCHED_TSX =
  "import React from 'react'\n" +
  "export default function Card() {\n" +
  "  return <div>hello world</div>\n" +
  "}\n"

const PATCH_DIFF =
  "--- a/src/Card.tsx\n" +
  "+++ b/src/Card.tsx\n" +
  "@@ -1,4 +1,4 @@\n" +
  " import React from 'react'\n" +
  " export default function Card() {\n" +
  "-  return <div>hello</div>\n" +
  "+  return <div>hello world</div>\n" +
  " }\n"

const PATCH_ONLY_RESULT: GenerateResult = {
  kind: "generated",
  response: {
    files: [],
    patches: [
      {
        kind: "patch",
        path: "src/Card.tsx",
        language: "tsx",
        patchContent: PATCH_DIFF,
      },
    ],
    explanation: "Append 'world' to the card body.",
  },
  validation: { passed: true, score: 88, errors: [], warnings: [] },
  meta: {
    promptId: "patch-test",
    modelId: "stub",
    prdSectionsTouched: 1,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

// ── Harness ────────────────────────────────────────────────────────────────

let dir: string
let clonePath: string
let store: Store
let broadcaster: Broadcaster
let events: Array<{ event: string; data: unknown }>
// Side-effect cleanup tracker — patch-mode persistence writes into the
// HOME-derived runs root (`~/.dash-build/runs/<runId>/`). DEFAULT_RUNS_ROOT
// is resolved at module load so we can't redirect via env var here. We use a
// unique sentinel prefix per test run + clean up just the created dirs at
// teardown to keep the dev rig tidy.
const createdRunDirs = new Set<string>()

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-patch-preview-"))
  // Stage a fake clone with the original Card.tsx so emitComponentUpdated can
  // read + apply the diff.
  clonePath = join(dir, "clone")
  await mkdir(join(clonePath, "src"), { recursive: true })
  await writeFile(join(clonePath, "src", "Card.tsx"), ORIGINAL_TSX, "utf8")
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
  await new Promise((r) => setImmediate(r))
  // Best-effort: remove any run dirs the orchestrator created in the shared
  // runs root so we don't pollute ~/.dash-build/runs across test invocations.
  for (const runDir of createdRunDirs) {
    await rm(runDir, { recursive: true, force: true }).catch(() => {})
  }
  createdRunDirs.clear()
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function trackRun(runId: string): string {
  const runDir = resolveRunDir(runId)
  createdRunDirs.add(runDir)
  return runDir
}

function build() {
  // Inject a workspace stub so emitComponentUpdated has a clonePath to read
  // the original file from. SandboxStateMachine + dev-server hooks are not
  // exercised here so we pass through the orchestrator's null-tolerant paths
  // via undefined setters.
  const fakeWorkspace = {
    repoSlug: "acme/x",
    clonePath,
    info: () => ({ state: "idle", clonePath, shimCommitSha: null }),
    state: {
      setOnTransition: undefined,
    },
  }
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic: makeAnthropic(),
    github: makeGithub(),
    clarification: makeClarification(),
    skillChain: { run: vi.fn(async () => PATCH_ONLY_RESULT) } as SkillChainRunner,
    workspace: fakeWorkspace as never,
  })
  return { orchestrator }
}

describe("Orchestrator patch-mode preview", () => {
  it("emits component:updated with the post-patch source (live SSE flow)", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "tweak the card",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const updated = events.find((e) => e.event === "component:updated")
    expect(updated).toBeDefined()
    const data = updated!.data as {
      componentSource: string
      contextMap: { landsAt: string }
    }
    // The broadcast must ship the FULL patched source, not the raw diff body.
    expect(data.componentSource).toBe(PATCHED_TSX)
    expect(data.contextMap.landsAt).toBe("src/Card.tsx")
  })

  it("mirrors the post-patch source to <runDir>/files/<patchPath> for cold-load", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "tweak the card",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const runDir = trackRun(submitted.promptId)
    // Drain microtasks + a few macrotasks so the fire-and-forget
    // persistPatchedComponentSource settles. mkdir + writeFile each need real
    // event-loop ticks (not just microtasks) so a single setImmediate isn't
    // always enough on slow CI; poll the disk for up to ~200ms.
    const expected = join(runDir, "files", "src", "Card.tsx")
    for (let attempt = 0; attempt < 20; attempt++) {
      if (existsSync(expected)) break
      await new Promise((r) => setTimeout(r, 10))
    }
    expect(existsSync(expected)).toBe(true)
    const contents = await readFile(expected, "utf8")
    expect(contents).toBe(PATCHED_TSX)
  })

  it("loadInitialPreview picks up the mirrored patched source on cold load", async () => {
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "tweak the card",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)
    const runDir = trackRun(submitted.promptId)
    // Same disk-polling pattern as the mirror test — mkdir + writeFile need
    // real event-loop ticks before the file appears.
    const expected = join(runDir, "files", "src", "Card.tsx")
    for (let attempt = 0; attempt < 20; attempt++) {
      if (existsSync(expected)) break
      await new Promise((r) => setTimeout(r, 10))
    }

    const blob = await loadInitialPreview(submitted.promptId)
    expect(blob).not.toBeNull()
    expect(blob!.componentSource).toBe(PATCHED_TSX)
    expect(blob!.contextMap.landsAt).toBe("src/Card.tsx")
    // Patches persisted under <runDir>/patches.json should also surface so the
    // Diff tab keeps working alongside the patched preview.
    expect(blob!.diffSnapshot).toBeDefined()
    expect(blob!.diffSnapshot!.some((d) => d.kind === "patch")).toBe(true)
  })
})
