/**
 * E2E smoke helpers — assemble a fully-mocked Hermes pipeline environment.
 *
 * Every external boundary (Anthropic SDK, GitHub REST, Slack webhook, Skill v2
 * loader, filesystem registry root) is stubbed via dependency injection. No
 * test that imports from here is allowed to touch the live network or the
 * user's real `~/.dash` directory.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { appendGap, type AppendGapInput, type GapEntry } from "../../gap-queue.js"

const HERE = path.dirname(fileURLToPath(import.meta.url))
import type { AnthropicClient, SkillLoader } from "../../generator.js"
import type { FetchLike } from "../../pr-creator.js"
import type { PipelineDeps } from "../../pipeline.js"

export type CapturedAnthropicCall = {
  model: string
  system: string
  userPrompt: string
}

export type CapturedHttpCall = {
  url: string
  method: string
  body: unknown
  headers: Record<string, string>
}

export type MockHarness = {
  tmpDir: string
  queuePath: string
  registryRoot: string
  /** Append a gap to the test queue. */
  seedGap: (input: AppendGapInput) => GapEntry
  /** Read recorded Anthropic Messages.create() calls. */
  anthropicCalls: CapturedAnthropicCall[]
  /** GitHub fetches recorded (PR create + anything else). */
  githubCalls: CapturedHttpCall[]
  /** Slack fetches recorded. */
  slackCalls: CapturedHttpCall[]
  /** Pipeline deps wired to all the mocks. Override per-test as needed. */
  deps: PipelineDeps
  /** Tear down the tmpdir + reset captured state. */
  cleanup: () => void
}

const HIGH_QUALITY_RESPONSE = fs.readFileSync(
  path.join(HERE, "..", "fixtures", "mock-generated-block.tsx"),
  "utf-8",
)

const PR_RESPONSE = JSON.parse(
  fs.readFileSync(
    path.join(HERE, "..", "fixtures", "mock-pr-response.json"),
    "utf-8",
  ),
) as { html_url: string; number: number }

function silentLogger() {
  return {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  }
}

export type MockHarnessOpts = {
  /** Text the mocked Anthropic client will return. Defaults to fixture. */
  anthropicResponse?: string
  /** Force the Anthropic mock to throw (failure-mode tests). */
  anthropicThrow?: Error
  /** Force the GitHub mock to return non-OK. */
  githubFail?: boolean
  /** Slack response status (default 200). */
  slackStatus?: number
  /**
   * Skill v2 systemAppend the loader returns. Defaults to a context bundle
   * that includes the four pinned blocks the worker expects to see.
   */
  skillSystemAppend?: string
}

const DEFAULT_SKILL_SYSTEM_APPEND = [
  "# Dash project context (Skill v2)",
  "",
  "## Pinned: refuse-list",
  "Banned: react-hook-form, zod, @hookform/resolvers, @tanstack/react-query, swr.",
  "",
  "## Pinned: envelope",
  "Stack envelope per repo auto-detected; default useState + axios.",
  "",
  "## Pinned: audit-trail",
  "Legal/financial fields require AUDIT TRAIL: original, edited, edited_by, edit_reason.",
  "",
  "## Pinned: external-lib policy",
  "No new external libs without explicit user approval.",
].join("\n")

export function createMockHarness(opts: MockHarnessOpts = {}): MockHarness {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-e2e-"))
  const queuePath = path.join(tmpDir, ".dash", "gap-queue.json")
  const registryRoot = path.join(tmpDir, "registry")
  fs.mkdirSync(path.dirname(queuePath), { recursive: true })
  fs.mkdirSync(registryRoot, { recursive: true })

  const anthropicCalls: CapturedAnthropicCall[] = []
  const githubCalls: CapturedHttpCall[] = []
  const slackCalls: CapturedHttpCall[] = []

  const anthropicClient: AnthropicClient = {
    messages: {
      create: async (params) => {
        if (opts.anthropicThrow) throw opts.anthropicThrow
        anthropicCalls.push({
          model: params.model,
          system: params.system,
          userPrompt: params.messages[0]?.content ?? "",
        })
        return {
          content: [
            {
              type: "text",
              text: opts.anthropicResponse ?? HIGH_QUALITY_RESPONSE,
            },
          ],
          usage: { input_tokens: 1234, output_tokens: 567 },
        }
      },
    },
  }

  const skillLoader: SkillLoader = async () => ({
    systemAppend: opts.skillSystemAppend ?? DEFAULT_SKILL_SYSTEM_APPEND,
  })

  const githubFetch: FetchLike = async (url, init) => {
    githubCalls.push({
      url,
      method: init?.method ?? "GET",
      body: init?.body ? safeJson(init.body) : null,
      headers: init?.headers ?? {},
    })
    if (opts.githubFail) {
      return {
        ok: false,
        status: 422,
        json: async () => ({ message: "Validation failed" }),
        text: async () => "Validation failed",
      }
    }
    return {
      ok: true,
      status: 201,
      json: async () => PR_RESPONSE,
      text: async () => JSON.stringify(PR_RESPONSE),
    }
  }

  const slackFetch: FetchLike = async (url, init) => {
    slackCalls.push({
      url,
      method: init?.method ?? "GET",
      body: init?.body ? safeJson(init.body) : null,
      headers: init?.headers ?? {},
    })
    return {
      ok: (opts.slackStatus ?? 200) < 400,
      status: opts.slackStatus ?? 200,
      json: async () => ({}),
      text: async () => "ok",
    }
  }

  const idempotencyStorePath = path.join(tmpDir, ".dash", "hermes-idempotency.json")

  const deps: PipelineDeps = {
    logger: silentLogger(),
    queuePath,
    idempotencyStorePath,
    generator: { client: anthropicClient, skill: skillLoader },
    prCreator: { fetch: githubFetch },
    slackNotifier: { fetch: slackFetch },
  }

  return {
    tmpDir,
    queuePath,
    registryRoot,
    seedGap: (input) => appendGap(input, queuePath),
    anthropicCalls,
    githubCalls,
    slackCalls,
    deps,
    cleanup: () => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    },
  }
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}
