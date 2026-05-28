/**
 * Pipeline types — orchestrator + worker contracts.
 *
 * The pipeline wires the day-1 building blocks (auth, skill chain, clarification,
 * github submit) into a single end-to-end flow:
 *
 *   submitPrompt → queued
 *     → worker picks up
 *       → generating
 *         → clarify? → clarifying (pause)
 *         → generated? → awaiting_approval
 *     → approvePR → pr_created
 *
 * All external clients are dependency-injected so unit tests stay hermetic.
 */

import type { PromptRecord, PromptStatus } from "../daemon/state/types.js"
import type {
  ClarificationAnswer,
  ClarificationQuestion,
} from "../clarification/types.js"
import type {
  AnthropicLike,
  DesignReviewResult,
  GenerateResult,
  IntakeContext,
  ParsedFile,
  ParsedPatch,
  QaResult,
  RepoContextPack,
  ValidationResult,
} from "../skills/types.js"
import type { BundleInput, BundleResult } from "../preview/types.js"
import type { RejectedPatch } from "./patch-validator.js"

// ── Pipeline result ────────────────────────────────────────────────────────

export interface SubmitPromptInput {
  text: string
  repo?: string | null
  branch?: string | null
}

export interface SubmitPromptResult {
  promptId: string
  status: PromptStatus
}

export interface ApprovePRInput {
  promptId: string
  branch?: string
  commitMessage?: string
  /** Override the default PR title (default = first 80 chars of prompt text). */
  prTitle?: string
  /** Override the default PR body (default = generated summary). */
  prBody?: string
}

export interface ApprovePRResult {
  prUrl: string
  prNumber: number
}

// ── Generation artifact (held in-memory until PR is opened) ────────────────

export interface GenerationArtifact {
  promptId: string
  files: ParsedFile[]
  /** Sprint 2B — unified-diff patches against existing files. Applied by
   *  the orchestrator via PatchApplier; all-or-nothing semantics so a
   *  conflict on patch N rolls back patches 0..N-1 before failing. */
  patches?: ParsedPatch[]
  explanation: string
  validation: ValidationResult
  generatedAt: string
  /** Result of bundleForPreview() when the bundle succeeded. Absent when the
   *  bundler failed or esbuild was unavailable — the artifact is still
   *  considered valid for PR creation; only the iframe preview is skipped. */
  bundleResult?: BundleResult
  /** Whether the iframe is rendering the generated component or a fallback
   *  review shell because the component bundle could not mount directly. */
  previewMode?: "component" | "fallback"
  /** Repo-aware context used for generation; surfaced in review UI. */
  contextPack?: RepoContextPack
  /** Sprint 2C — patches that failed the additive-only validator and were
   *  skipped before `git apply`. Surfaced to the user so they can rephrase
   *  the prompt (typically: "create a new file instead of patching X"). */
  rejectedPatches?: RejectedPatch[]
  /** BE-aware intake snapshot used for this generation. Surfaced so the
   *  dashboard can show scenario + audit-trail metadata next to the run. */
  intake?: IntakeContext
  /** Tier 0 #0N gstack stub — design-review pass result. Advisory only;
   *  never flips validation.passed. Dashboard renders next to the preview. */
  designReview?: DesignReviewResult
  /** Tier 0 #0N gstack stub — deterministic dash-qa lint result. High-sev
   *  issues set qa.passed=false but do NOT block PR creation; the dashboard
   *  surfaces them next to the validation panel so the user can review. */
  qa?: QaResult
  /** Tier 0 #0O — auth path the run used. `codex-cli` when Codex login was
   *  active, `byo-key` when the encrypted OpenAI key was used, `none` when
   *  the stub provider ran (tests). Persisted in `<runDir>/run.json`. */
  providerMode?: "codex-cli" | "byo-key" | "none" | null
}

/**
 * Bundler dependency for Orchestrator. We inject the bundleForPreview function
 * so unit tests don't need esbuild installed and we don't write to ~/.dash-build
 * during test runs.
 */
export interface PreviewBundler {
  bundle(input: BundleInput): Promise<BundleResult>
}

// ── DI for the orchestrator ────────────────────────────────────────────────

export interface AnthropicProvider {
  /** True when at least one credential (Codex login or BYO key) is available. */
  isConnected(): Promise<boolean>
  /**
   * Build a messages.create-shaped client. The orchestrator only needs the
   * `messages.create` surface (AnthropicLike) so unit tests can stub it.
   */
  buildSdkClient(): Promise<AnthropicLike>
  /**
   * Tier 0 #0O — return the active auth mode so the orchestrator can persist
   * it on the run artifact. Optional for back-compat with stub providers in
   * the test suite; when omitted the orchestrator records `null`.
   */
  getMode?(): Promise<"codex-cli" | "byo-key" | "none">
}

export interface GithubProvider {
  isConnected(): Promise<boolean>
  /** Open a PR with the supplied files. */
  submitChanges(input: {
    fullName: string
    baseBranch: string
    newBranch: string
    files: Array<{ path: string; content: string }>
    commitMessage: string
    prTitle: string
    prBody: string
  }): Promise<{ prUrl: string; prNumber: number; commitSha: string; branch: string }>
}

export interface ClarificationGateway {
  create(
    promptId: string,
    originalPrompt: string,
    questions: ClarificationQuestion[],
  ): Promise<void>
  /** Returns the merged prompt text after answers, or null if still pending. */
  resolved(promptId: string): Promise<{
    status: "answered" | "pending" | "expired"
    mergedPrompt: string
    answers: Record<string, ClarificationAnswer>
  } | null>
}

export interface SkillChainRunner {
  run(input: {
    prompt: string
    repoPath: string
    selectedRepo?: string | null
    anthropic: AnthropicLike
    /** BE-aware intake context. Optional so legacy tests/stubs still work. */
    intake?: IntakeContext
  }): Promise<GenerateResult>
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
}

// ── Status transitions (state machine) ─────────────────────────────────────

/**
 * Legal forward transitions. Used by status-transitions.ts to guard
 * the store from invalid state changes.
 */
export const STATUS_TRANSITIONS: Record<PromptStatus, PromptStatus[]> = {
  queued: ["generating", "failed", "cancelled"],
  generating: ["clarifying", "awaiting_approval", "failed", "cancelled"],
  clarifying: ["generating", "failed", "cancelled"],
  awaiting_approval: ["pr_created", "failed", "cancelled"],
  pr_created: ["completed", "failed"],
  completed: [],
  failed: [],
  cancelled: [],
}

export type Transitionable = {
  status: PromptStatus
}

export interface PromptWithArtifact extends PromptRecord {
  artifact?: GenerationArtifact
}
