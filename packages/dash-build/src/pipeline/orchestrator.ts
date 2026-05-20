/**
 * Pipeline orchestrator — wires day-1 building blocks into one flow.
 *
 *   POST /api/prompt → submitPrompt
 *     ↓ store.addPrompt (status=queued)
 *     ↓ broadcast prompts:changed
 *     ↓ void processPrompt() (async)
 *
 *   processPrompt:
 *     status → generating
 *     auth check (Anthropic)
 *     skill chain runs:
 *       kind=clarify   → store session, status → clarifying, return
 *       kind=generated → store artifact, status → awaiting_approval
 *       kind=error     → status → failed
 *
 *   resumeAfterClarification:
 *     load session answers, merge into prompt, restart processPrompt
 *
 *   approvePR:
 *     auth check (GitHub)
 *     status → pr_created (after submitChanges returns)
 *
 * All external dependencies are injected — see types.ts.
 */

import { randomUUID } from "node:crypto"
import type { Store } from "../daemon/state/store.js"
import type { Broadcaster } from "../daemon/ws/broadcaster.js"
import type { PromptRecord, PromptStatus } from "../daemon/state/types.js"
import type {
  ClarificationAnswer,
  ClarificationQuestion,
} from "../clarification/types.js"
import type { GenerateResult, ParsedFile, ValidationResult } from "../skills/types.js"
import type {
  AnthropicProvider,
  ApprovePRInput,
  ApprovePRResult,
  ClarificationGateway,
  GenerationArtifact,
  GithubProvider,
  Logger,
  SkillChainRunner,
  SubmitPromptInput,
  SubmitPromptResult,
} from "./types.js"
import { classify, describe, PipelineError } from "./error-handling.js"
import { nextStatus, isTerminal } from "./status-transitions.js"

export interface OrchestratorOptions {
  store: Store
  broadcaster: Broadcaster
  clarification: ClarificationGateway
  anthropic: AnthropicProvider
  github: GithubProvider
  skillChain: SkillChainRunner
  /** Override the local repo path used by the skill chain (default cwd). */
  repoPathResolver?: (fullName: string | null) => string
  /** Default base branch when prompt has none. */
  defaultBaseBranch?: string
  logger?: Logger
}

const NOOP_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

export class Orchestrator {
  private readonly store: Store
  private readonly broadcaster: Broadcaster
  private readonly clarification: ClarificationGateway
  private readonly anthropic: AnthropicProvider
  private readonly github: GithubProvider
  private readonly skillChain: SkillChainRunner
  private readonly repoPathResolver: (fullName: string | null) => string
  private readonly defaultBaseBranch: string
  private readonly logger: Logger

  /** In-memory artifact cache, keyed by promptId. Survives process lifetime
   *  only — by-design, since regenerating is cheaper than reloading from disk. */
  private readonly artifacts: Map<string, GenerationArtifact> = new Map()

  constructor(opts: OrchestratorOptions) {
    this.store = opts.store
    this.broadcaster = opts.broadcaster
    this.clarification = opts.clarification
    this.anthropic = opts.anthropic
    this.github = opts.github
    this.skillChain = opts.skillChain
    this.repoPathResolver = opts.repoPathResolver ?? (() => process.cwd())
    this.defaultBaseBranch = opts.defaultBaseBranch ?? "main"
    this.logger = opts.logger ?? NOOP_LOGGER
  }

  // ── Public surface ───────────────────────────────────────────────────────

  /**
   * Create a prompt record and schedule async generation. Returns immediately
   * with `{ status: "queued" }` — caller (HTTP route) must poll WebSocket or
   * `/api/prompts/:id` for progress.
   */
  async submitPrompt(input: SubmitPromptInput): Promise<SubmitPromptResult> {
    if (!input.text || !input.text.trim()) {
      throw new Error("prompt text required")
    }
    const prompt = this.store.addPrompt({
      text: input.text,
      repo: input.repo ?? null,
      branch: input.branch ?? null,
    })
    const queuedStatus = prompt.status
    this.broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: queuedStatus,
    })
    // Fire-and-forget — errors surface via prompts:changed.
    // Defer one microtask so callers can await the return value before
    // the worker observes the queued prompt.
    queueMicrotask(() => {
      this.processPrompt(prompt.id).catch((err) => {
        this.logger.error("processPrompt threw", {
          id: prompt.id,
          err: String(err),
        })
      })
    })
    return { promptId: prompt.id, status: queuedStatus }
  }

  /**
   * Run skill chain → clarify or awaiting_approval. Idempotent — calling on
   * a terminal prompt is a no-op.
   */
  async processPrompt(promptId: string): Promise<void> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) {
      this.logger.warn("processPrompt: unknown id", { id: promptId })
      return
    }
    if (isTerminal(prompt.status)) {
      this.logger.info("processPrompt: terminal, skipping", { id: promptId })
      return
    }

    await this.setStatus(prompt, "generating")

    // 1. Auth check
    try {
      if (!(await this.anthropic.isConnected())) {
        throw new PipelineError(
          "auth-missing-anthropic",
          "Anthropic not connected",
        )
      }
    } catch (err) {
      return this.failPrompt(prompt, err)
    }

    // 2. Build SDK client + run skill chain
    let result: GenerateResult
    try {
      const sdk = await this.anthropic.buildSdkClient()
      result = await this.skillChain.run({
        prompt: prompt.text,
        repoPath: this.repoPathResolver(prompt.repo),
        anthropic: sdk,
      })
    } catch (err) {
      return this.failPrompt(prompt, err)
    }

    // 3. Branch on chain result
    if (result.kind === "clarify") {
      return this.beginClarification(prompt, result.questions, prompt.text)
    }
    if (result.kind === "error") {
      return this.failPrompt(
        prompt,
        new PipelineError("skill-chain-failed", result.reason, result.details),
      )
    }

    // 4. Generated — capture artifact + mark awaiting approval
    const artifact: GenerationArtifact = {
      promptId: prompt.id,
      files: result.response.files,
      explanation: result.response.explanation,
      validation: result.validation,
      generatedAt: new Date().toISOString(),
    }
    this.artifacts.set(prompt.id, artifact)

    await this.setStatus(prompt, "awaiting_approval")
    this.broadcaster.broadcast("generation:complete", {
      promptId: prompt.id,
      score: result.validation.score,
      fileCount: result.response.files.length,
      passed: result.validation.passed,
      errorCount: result.validation.errors.length,
    })
  }

  /**
   * Called by the clarification API route after the user answers all
   * required questions. Merges answers into the original prompt and
   * restarts processPrompt.
   */
  async resumeAfterClarification(promptId: string): Promise<void> {
    const prompt = this.store.getPrompt(promptId)
    if (!prompt) return
    if (prompt.status !== "clarifying") {
      this.logger.warn("resume: prompt not in clarifying", {
        id: promptId,
        status: prompt.status,
      })
      return
    }

    const resolved = await this.clarification.resolved(promptId)
    if (!resolved || resolved.status !== "answered") {
      this.logger.warn("resume: no answered session yet", { id: promptId })
      return
    }

    // Persist merged prompt text. We don't have setText on the store, so
    // we use a small in-place mutation via snapshot+addPrompt? No — the
    // store API mutates records in place via updatePromptStatus. We store
    // the merged prompt in `error` to surface it, then transition.
    //
    // Cleaner: we replace prompt.text by direct mutation via the
    // PromptRecord reference returned by getPrompt — see store.ts which
    // mutates `prompt.status` directly. Same pattern works for text.
    prompt.text = resolved.mergedPrompt

    await this.setStatus(prompt, "generating")
    // Re-run skill chain with the merged prompt (no longer triggers clarify
    // path because answers fold the missing surface/scope in).
    return this.processPrompt(promptId)
  }

  /**
   * Approve the generated PR. Calls submitChanges → status → pr_created.
   */
  async approvePR(input: ApprovePRInput): Promise<ApprovePRResult> {
    const prompt = this.store.getPrompt(input.promptId)
    if (!prompt) throw new Error(`Unknown prompt ${input.promptId}`)
    if (prompt.status !== "awaiting_approval") {
      throw new Error(
        `Prompt ${input.promptId} not ready for PR (status=${prompt.status})`,
      )
    }
    const artifact = this.artifacts.get(input.promptId)
    if (!artifact) {
      throw new Error(`No generated artifact for prompt ${input.promptId}`)
    }
    if (!prompt.repo) {
      throw new Error(`Prompt ${input.promptId} has no repo set`)
    }

    if (!(await this.github.isConnected())) {
      const err = new PipelineError(
        "auth-missing-github",
        "GitHub App not installed",
      )
      await this.failPrompt(prompt, err)
      throw err
    }

    const baseBranch = prompt.branch || this.defaultBaseBranch
    const newBranch = input.branch ?? `dash-build/${input.promptId.slice(0, 12)}`
    const commitMessage = input.commitMessage ?? this.buildCommitMessage(prompt)

    try {
      const submitted = await this.github.submitChanges({
        fullName: prompt.repo,
        baseBranch,
        newBranch,
        files: artifact.files.map((f) => ({ path: f.path, content: f.content })),
        commitMessage,
        prTitle: this.buildPRTitle(prompt),
        prBody: this.buildPRBody(prompt, artifact),
      })

      await this.store.updatePromptStatus(input.promptId, "pr_created", {
        prUrl: submitted.prUrl,
      })
      this.broadcaster.broadcast("pr:created", {
        promptId: input.promptId,
        prUrl: submitted.prUrl,
        prNumber: submitted.prNumber,
      })
      return { prUrl: submitted.prUrl, prNumber: submitted.prNumber }
    } catch (err) {
      const classified = classify(err)
      await this.failPrompt(prompt, classified)
      throw classified
    }
  }

  // ── Inspection helpers (used by HTTP routes + tests) ─────────────────────

  getArtifact(promptId: string): GenerationArtifact | undefined {
    return this.artifacts.get(promptId)
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private async setStatus(prompt: PromptRecord, to: PromptStatus): Promise<void> {
    const target = nextStatus(prompt.status, to)
    if (target === prompt.status) return
    await this.store.updatePromptStatus(prompt.id, target)
    this.broadcaster.broadcast("prompts:changed", { id: prompt.id, status: target })
  }

  private async beginClarification(
    prompt: PromptRecord,
    questions: ClarificationQuestion[],
    originalPrompt: string,
  ): Promise<void> {
    await this.clarification.create(prompt.id, originalPrompt, questions)
    await this.setStatus(prompt, "clarifying")
    this.broadcaster.broadcast("clarification:needed", {
      promptId: prompt.id,
      sessionId: prompt.id,
      questionsCount: questions.length,
    })
  }

  private async failPrompt(prompt: PromptRecord, err: unknown): Promise<void> {
    const classified = classify(err)
    const summary = describe(classified)
    this.logger.error("pipeline failed", {
      id: prompt.id,
      kind: classified.kind,
      message: classified.message,
    })
    await this.store.updatePromptStatus(prompt.id, "failed", { error: summary })
    this.broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: "failed",
      error: summary,
    })
  }

  private buildCommitMessage(prompt: PromptRecord): string {
    const head = prompt.text.split(/\r?\n/)[0]?.slice(0, 60) ?? "dash-build change"
    return `feat: ${head}`
  }

  private buildPRTitle(prompt: PromptRecord): string {
    return prompt.text.slice(0, 80)
  }

  private buildPRBody(prompt: PromptRecord, artifact: GenerationArtifact): string {
    const fileList = artifact.files
      .map((f) => `- \`${f.path}\``)
      .join("\n")
    const errors = artifact.validation.errors
      .map((e) => `- [${e.severity}] ${e.message} (${e.file})`)
      .join("\n")
    const errorsBlock = errors
      ? `\n**Validation flags:**\n${errors}\n`
      : ""
    return `## Dash Build Generated PR

**Prompt:** ${prompt.text}

**Foundation match score:** ${artifact.validation.score}/100 (${artifact.validation.passed ? "passed" : "review needed"})

**Files generated:**
${fileList}
${errorsBlock}
**Explanation:**
${artifact.explanation}

---
🤖 Generated via Dash Build (Lovable-for-Dash) — run id ${prompt.id}
`
  }
}

// ── Default skill-chain runner (calls real chain) ──────────────────────────

import { generateWithSkillChain } from "../skills/index.js"

/**
 * Factory for the default runner that delegates to the real skill chain.
 * Tests inject a stub instead.
 */
export function defaultSkillChainRunner(): SkillChainRunner {
  return {
    async run(input) {
      return generateWithSkillChain(
        { prompt: input.prompt, repoPath: input.repoPath },
        { anthropic: input.anthropic },
      )
    },
  }
}

// ── Default clarification gateway (wraps SessionStore) ─────────────────────

import type { SessionStore } from "../clarification/session-store.js"

export function defaultClarificationGateway(
  store: SessionStore,
): ClarificationGateway {
  return {
    async create(promptId, originalPrompt, questions) {
      await store.create(promptId, originalPrompt, questions)
    },
    async resolved(promptId) {
      const session = await store.get(promptId)
      if (!session) return null
      return {
        status: session.status,
        mergedPrompt: mergeAnswers(session.originalPrompt, session.answers, session.questions),
        answers: session.answers,
      }
    },
  }
}

/** Fold user answers back into the original prompt as appended context. */
export function mergeAnswers(
  original: string,
  answers: Record<string, ClarificationAnswer>,
  questions: ClarificationQuestion[],
): string {
  if (Object.keys(answers).length === 0) return original
  const lines: string[] = []
  for (const q of questions) {
    const a = answers[q.id]
    if (a === undefined) continue
    const formatted = Array.isArray(a) ? a.join(", ") : String(a)
    lines.push(`- ${q.text} → ${formatted}`)
  }
  if (lines.length === 0) return original
  return `${original}\n\n--- Clarifications ---\n${lines.join("\n")}`
}

// ── Default github gateway (wraps GitHubAppClient + submitChanges) ─────────

import type { GitHubAppClient } from "../integrations/github/client.js"
import { submitChanges } from "../integrations/github/repo-ops.js"

export function defaultGithubProvider(client: GitHubAppClient): GithubProvider {
  return {
    async isConnected() {
      return client.isConnected()
    },
    async submitChanges(input) {
      return submitChanges({
        client,
        fullName: input.fullName,
        baseBranch: input.baseBranch,
        newBranch: input.newBranch,
        files: input.files,
        commitMessage: input.commitMessage,
        prTitle: input.prTitle,
        prBody: input.prBody,
      })
    },
  }
}

// ── Default anthropic provider ─────────────────────────────────────────────

import type { AuthenticatedAnthropicClient } from "../auth/anthropic/client.js"
import type { AnthropicLike } from "../skills/types.js"

export function defaultAnthropicProvider(
  client: AuthenticatedAnthropicClient,
): AnthropicProvider {
  return {
    async isConnected() {
      return client.isConnected()
    },
    async buildSdkClient() {
      const sdk = (await client.buildSdkClient()) as AnthropicLike
      return sdk
    },
  }
}

// Re-export randomUUID-based promptId helper for callers that want their own id.
export function generatePromptId(): string {
  return `prm_${randomUUID().slice(0, 12)}`
}
