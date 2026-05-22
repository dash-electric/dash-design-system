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
  GenerateResult,
  ParsedFile,
  ValidationResult,
} from "../skills/types.js"
import type { BundleInput, BundleResult } from "../preview/types.js"

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
    anthropic: AnthropicLike
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
