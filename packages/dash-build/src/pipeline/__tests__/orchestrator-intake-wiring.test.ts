/**
 * Phase A — Tier 0F / 0H / 0I / 0M wiring tests.
 *
 * Covers the surgical fixes that make the intake actually fire on the TARGET
 * repo (not dash-build's own cwd) and persist its findings so the workspace
 * cold-load can surface them. Also covers the classifier upgrade for the
 * "extend_fe_be" branch and the audit-trail output enforcement.
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
import type { GenerateResult, IntakeContext } from "../../skills/types.js"
import { resolveTargetRepoPath } from "../../daemon/repo-preview.js"
import { resolveRunDir } from "../../runs/artifact-store.js"
import { classifyPrompt } from "../../intake/scenario-classifier.js"
import { enforceAuditLogCall } from "../../skills/validator.js"

// ── Fakes (mirrored from orchestrator-intake.test.ts) ──────────────────────

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

function makeSkillChain(result: GenerateResult): SkillChainRunner & {
  run: ReturnType<typeof vi.fn>
} {
  return { run: vi.fn(async () => result) as SkillChainRunner["run"] } as SkillChainRunner & {
    run: ReturnType<typeof vi.fn>
  }
}

const GENERATED_OK: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "preview.tsx",
        language: "tsx",
        content:
          "import React from 'react'\nexport default function P() { return <div className='bg-bg-white-0 text-text-strong-950'>hi</div> }",
      },
    ],
    explanation: "Hello world component.",
  },
  validation: { passed: true, score: 95, errors: [], warnings: [] },
  meta: {
    promptId: "fixed-id",
    modelId: "claude-test",
    prdSectionsTouched: 1,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

// Output that ships a sensitive `payment_amount` field WITHOUT an
// auditLog.create(...) call — used to exercise the 0M enforcement gate.
const GENERATED_PAYMENT_NO_AUDIT: GenerateResult = {
  kind: "generated",
  response: {
    files: [
      {
        path: "preview.tsx",
        language: "tsx",
        content:
          "import React from 'react'\n" +
          "export default function PayForm() {\n" +
          "  return <input name='payment_amount' className='bg-bg-white-0' />\n" +
          "}\n",
      },
    ],
    explanation: "Payment form without audit logging.",
  },
  validation: { passed: true, score: 90, errors: [], warnings: [] },
  meta: {
    promptId: "fixed-id-pay",
    modelId: "claude-test",
    prdSectionsTouched: 1,
    detectedRepoStack: "backoffice",
    designSources: [],
    skillSources: [],
  },
}

// ── Harness ────────────────────────────────────────────────────────────────

let dir: string
let store: Store
let broadcaster: Broadcaster
let events: Array<{ event: string; data: unknown }>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-intake-wiring-"))
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
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function build(opts: {
  skillChain?: SkillChainRunner
  repoPath?: string
  runsRoot?: string
} = {}) {
  const orchestrator = new Orchestrator({
    store,
    broadcaster,
    anthropic: makeAnthropic(),
    github: makeGithub(),
    clarification: makeClarification(),
    skillChain: opts.skillChain ?? makeSkillChain(GENERATED_OK),
    intakeEnabled: true,
    repoPathResolver: () => opts.repoPath ?? dir,
  })
  return { orchestrator }
}

// ── Tier 0F — target-repo resolver ─────────────────────────────────────────

describe("Tier 0F — resolveTargetRepoPath maps repo slug to target repo dir", () => {
  it("returns null for an unknown slug", () => {
    expect(resolveTargetRepoPath("dash/does-not-exist")).toBeNull()
    expect(resolveTargetRepoPath(null)).toBeNull()
    expect(resolveTargetRepoPath(undefined)).toBeNull()
  })

  it("respects an explicit env override for backoffice", async () => {
    const tmp = await mkdtemp(join(tmpdir(), "dash-build-target-bo-"))
    try {
      const previous = process.env.DASH_BUILD_BACKOFFICE_PATH
      process.env.DASH_BUILD_BACKOFFICE_PATH = tmp
      const resolved = resolveTargetRepoPath("dash/backoffice")
      expect(resolved).toBe(tmp)
      if (previous === undefined) {
        delete process.env.DASH_BUILD_BACKOFFICE_PATH
      } else {
        process.env.DASH_BUILD_BACKOFFICE_PATH = previous
      }
    } finally {
      await rm(tmp, { recursive: true, force: true })
    }
  })

  it("falls back to DASH_BUILD_WORK_ROOT/<localDirName> when set", async () => {
    const workRoot = await mkdtemp(join(tmpdir(), "dash-build-work-root-"))
    const target = join(workRoot, "next-backoffice-web")
    await mkdir(target, { recursive: true })
    try {
      const previousWork = process.env.DASH_BUILD_WORK_ROOT
      const previousEnv = process.env.DASH_BUILD_BACKOFFICE_PATH
      const previousDashRoot = process.env.DASH_BUILD_DASH_ROOT
      delete process.env.DASH_BUILD_BACKOFFICE_PATH
      process.env.DASH_BUILD_WORK_ROOT = workRoot
      // Point DASH_BUILD_DASH_ROOT at a missing dir so it never wins.
      process.env.DASH_BUILD_DASH_ROOT = join(workRoot, "non-existent")
      const resolved = resolveTargetRepoPath("dash/backoffice")
      expect(resolved).toBe(target)
      if (previousWork === undefined) {
        delete process.env.DASH_BUILD_WORK_ROOT
      } else {
        process.env.DASH_BUILD_WORK_ROOT = previousWork
      }
      if (previousDashRoot === undefined) {
        delete process.env.DASH_BUILD_DASH_ROOT
      } else {
        process.env.DASH_BUILD_DASH_ROOT = previousDashRoot
      }
      if (previousEnv !== undefined) {
        process.env.DASH_BUILD_BACKOFFICE_PATH = previousEnv
      }
    } finally {
      await rm(workRoot, { recursive: true, force: true })
    }
  })

  it("handles a non-preview target slug (halo-dash-fe) via the fallback map", async () => {
    const workRoot = await mkdtemp(join(tmpdir(), "dash-build-work-root-halo-"))
    const target = join(workRoot, "halo-dash-fe")
    await mkdir(target, { recursive: true })
    try {
      const previousWork = process.env.DASH_BUILD_WORK_ROOT
      const previousDashRoot = process.env.DASH_BUILD_DASH_ROOT
      process.env.DASH_BUILD_WORK_ROOT = workRoot
      process.env.DASH_BUILD_DASH_ROOT = join(workRoot, "non-existent")
      const resolved = resolveTargetRepoPath("dash/halo-dash-fe")
      expect(resolved).toBe(target)
      if (previousWork === undefined) {
        delete process.env.DASH_BUILD_WORK_ROOT
      } else {
        process.env.DASH_BUILD_WORK_ROOT = previousWork
      }
      if (previousDashRoot === undefined) {
        delete process.env.DASH_BUILD_DASH_ROOT
      } else {
        process.env.DASH_BUILD_DASH_ROOT = previousDashRoot
      }
    } finally {
      await rm(workRoot, { recursive: true, force: true })
    }
  })

  it("intake scans the TARGET repo (backoffice fixture finds the endpoint)", async () => {
    // Seed a minimal "backoffice" pages-router endpoint so scanBeCatalog has
    // something to find.
    const fakeRepo = await mkdtemp(join(tmpdir(), "dash-build-fake-backoffice-"))
    const apiDir = join(fakeRepo, "src", "pages", "api", "mitra")
    await mkdir(apiDir, { recursive: true })
    await writeFile(
      join(apiDir, "performance.js"),
      "export default function handler(req, res) {\n" +
        "  if (req.method === 'GET') { return res.status(200).json({}) }\n" +
        "}\n",
      "utf8",
    )

    const skillChain = makeSkillChain(GENERATED_OK)
    const { orchestrator } = build({ skillChain, repoPath: fakeRepo })
    const submitted = await orchestrator.submitPrompt({
      text: "tambahin dashboard mitra performance di backoffice",
      repo: "dash/backoffice",
    })
    await orchestrator.processPrompt(submitted.promptId)

    expect(skillChain.run).toHaveBeenCalled()
    const arg = (skillChain.run as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      intake?: IntakeContext
    }
    expect(arg.intake).toBeDefined()
    const endpoints = arg.intake!.beCatalog.endpoints
    expect(endpoints.length).toBeGreaterThan(0)
    expect(endpoints.some((e) => e.path.includes("mitra/performance"))).toBe(true)

    await rm(fakeRepo, { recursive: true, force: true })
  })
})

// ── Tier 0H — intake.json persistence ──────────────────────────────────────

describe("Tier 0H — orchestrator persists intake snapshot to runs/<id>/intake.json", () => {
  it("writes intake.json after the intake step runs", async () => {
    // Override the runs root to an isolated dir we control. The orchestrator
    // calls writeIntakeSnapshot() without a root override, so we need to
    // redirect via env... but writeIntakeSnapshot uses DEFAULT_RUNS_ROOT from
    // the module. We can't easily intercept that without a constructor flag.
    // Instead, after processPrompt completes we read the snapshot from the
    // user's actual default root.
    const { orchestrator } = build()
    const submitted = await orchestrator.submitPrompt({
      text: "tambahin dashboard mitra performance di backoffice",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const runDir = resolveRunDir(submitted.promptId)
    const snapshotPath = join(runDir, "intake.json")
    expect(existsSync(snapshotPath)).toBe(true)
    const raw = await readFile(snapshotPath, "utf8")
    const snapshot = JSON.parse(raw)
    expect(snapshot.scenario).toBeTruthy()
    expect(snapshot.audit).toBeDefined()
    expect(Array.isArray(snapshot.beEndpoints)).toBe(true)
    expect(Array.isArray(snapshot.fePatterns)).toBe(true)
    expect(snapshot.dbSchema).toBeDefined()
    // Cleanup our run dir.
    await rm(runDir, { recursive: true, force: true })
  })
})

// ── Tier 0I — classifier upgrade ───────────────────────────────────────────

describe("Tier 0I — scenario classifier handles extend_fe_be and friends", () => {
  it("'tambahin dashboard mitra performance di backoffice' → extend_fe_be", async () => {
    const r = await classifyPrompt(
      "tambahin dashboard mitra performance di backoffice",
      {
        beCatalog: { endpoints: [], framework: "none", totalEndpoints: 0 },
        dbCatalog: { tables: [], source: "none" },
        existingFiles: [],
      },
    )
    expect(r.scenario).toBe("extend_fe_be")
  })

  it("'bikin halaman baru standalone' → new_product (no existing surface)", async () => {
    const r = await classifyPrompt(
      "bikin halaman baru standalone untuk landing",
      {
        beCatalog: { endpoints: [], framework: "none", totalEndpoints: 0 },
        dbCatalog: { tables: [], source: "none" },
        existingFiles: [],
      },
    )
    expect(r.scenario).toBe("new_product")
  })

  it("'tambahin filter status di list mitra' → update_existing (add-verb + existing surface)", async () => {
    const r = await classifyPrompt("tambahin filter status di list mitra", {
      beCatalog: { endpoints: [], framework: "none", totalEndpoints: 0 },
      dbCatalog: { tables: [], source: "none" },
      existingFiles: ["pages/mitra/list.tsx"],
    })
    expect(r.scenario).toBe("update_existing")
  })
})

// ── Tier 0M — audit-trail output enforcement ───────────────────────────────

describe("Tier 0M — enforceAuditLogCall rejects sensitive output without auditLog.create", () => {
  it("flags a payment_amount input without an audit-log call", () => {
    const outcome = enforceAuditLogCall({
      files: [
        {
          path: "preview.tsx",
          language: "tsx",
          content:
            "<input name='payment_amount' />",
        },
      ],
      explanation: "",
    })
    expect(outcome.ok).toBe(false)
    expect(outcome.sensitiveField).toBe("payment_amount")
    expect(outcome.hasAuditCall).toBe(false)
  })

  it("passes when the same field is paired with auditLog.create({...})", () => {
    const outcome = enforceAuditLogCall({
      files: [
        {
          path: "preview.tsx",
          language: "tsx",
          content:
            "<input name='payment_amount' />\n" +
            "// On submit\nauditLog.create({ field: 'payment_amount', old: 0, new: 100 })\n",
        },
      ],
      explanation: "",
    })
    expect(outcome.ok).toBe(true)
    expect(outcome.hasAuditCall).toBe(true)
  })

  it("orchestrator flips validation.passed=false when output skips audit log", async () => {
    const skillChain = makeSkillChain(GENERATED_PAYMENT_NO_AUDIT)
    const { orchestrator } = build({ skillChain })
    // Use a prompt with a BE keyword ("api") so the intake clarify gate does
    // not short-circuit before generation runs. The actual output (the fake
    // GENERATED_PAYMENT_NO_AUDIT) is what we're enforcing against.
    const submitted = await orchestrator.submitPrompt({
      text: "update api endpoint to edit mitra topup balance",
      repo: "acme/x",
    })
    await orchestrator.processPrompt(submitted.promptId)

    const artifact = orchestrator.getArtifact(submitted.promptId)
    expect(artifact).toBeDefined()
    expect(artifact!.validation.passed).toBe(false)
    const cr3 = artifact!.validation.errors.find(
      (e) => e.ruleId === "CR-3-OUTPUT",
    )
    expect(cr3).toBeDefined()
    expect(cr3!.severity).toBe("high")
    expect(cr3!.message).toMatch(/payment/i)
    // The rejection broadcast should fire so the UI knows about it.
    const rejection = events.find((e) => e.event === "validation:rejected")
    expect(rejection).toBeDefined()
  })
})
