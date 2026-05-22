/**
 * Skill chain types — pipeline that loads dash-prd + design + Skill v4 context
 * into model prompts BEFORE generation.
 *
 * Per Dash cardinal rule (AI must NOT generate blindly), every prompt routes:
 *   prompt → prd-evaluator → design-loader → skill-loader → model → parse → validate
 *
 * Each stage is pure / testable in isolation. Anthropic + Agent F integration
 * points are dependency-injected so unit tests stay hermetic.
 */

import type { ClarificationQuestion } from "../clarification/types.js"

// ---------------------------------------------------------------------------
// Stage 1 — PRD evaluation
// ---------------------------------------------------------------------------

export interface PRDEvalInput {
  prompt: string
  detectedRepo: string | null
  detectedLayer: "ride" | "logistic" | "shared" | null
}

export interface PRDEval {
  /** True when prompt is too thin to generate safely — caller must hand off
   *  to Agent F clarification UI. */
  needsClarification: boolean
  /** Clarification questions surfaced by Agent F evaluator + PRD section gate. */
  questions: ClarificationQuestion[]
  /** One-line scope summary, used inside the system prompt. */
  summary: string
  /** Count of PRD sections that prompt touches. */
  sectionsTouched: number
  /** 0-100 confidence the prompt is ready to generate. */
  confidence: number
}

// ---------------------------------------------------------------------------
// Stage 2 — Design context
// ---------------------------------------------------------------------------

export interface DesignContext {
  designContract: string
  cardinalRules: string
  voiceRules: string
  manifest: FoundationManifest | null
  layeredArchitecture: string
  /** Tracks which files were actually readable — degrades gracefully. */
  loadedSources: string[]
  /** Missing files surfaced as warnings, never as errors. */
  missingSources: string[]
}

export interface FoundationManifest {
  schemaVersion: number
  name: string
  version: string
  brand?: { name?: string; primaryHex?: string; primaryToken?: string; fontFamily?: string }
  rules?: { cardinalRules?: string[] }
  voice?: { default?: string; summary?: string }
}

// ---------------------------------------------------------------------------
// Stage 3 — Skill v4 context
// ---------------------------------------------------------------------------

export interface SkillContext {
  systemAppend: string
  sources: string[]
  detectedRepoStack: string | null
  /** Schema version of the underlying @dash/skill BuiltPrompt (currently 2/3/4). */
  schemaVersion: number
}

// ---------------------------------------------------------------------------
// Stage 4 — Response parsing
// ---------------------------------------------------------------------------

export interface ParsedFile {
  path: string
  language: string
  content: string
}

export interface ParsedResponse {
  files: ParsedFile[]
  explanation: string
}

// ---------------------------------------------------------------------------
// Stage 5 — Validation
// ---------------------------------------------------------------------------

export type ValidationSeverity = "high" | "medium" | "low"

export interface ValidationError {
  severity: ValidationSeverity
  message: string
  file: string
  /** Rule id (e.g. CR-3, CR-5, voice-formal) so the dashboard can group. */
  ruleId?: string
}

export interface ValidationResult {
  passed: boolean
  /** 0-100 — foundation match score. 100 = perfect, drops per error severity. */
  score: number
  errors: ValidationError[]
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Pipeline I/O
// ---------------------------------------------------------------------------

export interface GenerateInput {
  prompt: string
  /** Path the user is generating against (drives Skill v4 per-repo detection). */
  repoPath: string
  detectedRepo?: string | null
  detectedLayer?: "ride" | "logistic" | "shared" | null
}

export type GenerateResult =
  | {
      kind: "clarify"
      questions: ClarificationQuestion[]
      summary: string
      confidence: number
    }
  | {
      kind: "generated"
      response: ParsedResponse
      validation: ValidationResult
      meta: {
        promptId: string
        modelId: string
        prdSectionsTouched: number
        detectedRepoStack: string | null
        designSources: string[]
        skillSources: string[]
      }
    }
  | {
      kind: "error"
      reason: string
      details?: unknown
    }

// ---------------------------------------------------------------------------
// Dependency injection — keeps model provider + filesystem out of pure tests
// ---------------------------------------------------------------------------

export interface AnthropicLike {
  messages: {
    create(req: {
      model: string
      max_tokens: number
      system: string
      messages: Array<{ role: "user" | "assistant"; content: string }>
    }): Promise<{ content: Array<{ type: string; text?: string }> }>
  }
}

export interface ChainDeps {
  anthropic?: AnthropicLike
  loadDesign?: () => Promise<DesignContext>
  loadSkill?: (opts: { repoPath: string }) => Promise<SkillContext>
  evaluatePRD?: (input: PRDEvalInput) => Promise<PRDEval>
  modelId?: string
  /** Defaults to randomUUID. Injectable for deterministic tests. */
  promptId?: () => string
}
