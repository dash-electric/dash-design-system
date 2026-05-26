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
import type { RepoIntrospection } from "./repo-introspector.js"

export type { RepoIntrospection } from "./repo-introspector.js"

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
// Repo-aware context pack
// ---------------------------------------------------------------------------

export type DashTheme =
  | "shared"
  | "ride"
  | "logistic"
  | "travel"
  | "marketplace"
  | "outsourcing"
  | `trellis-${string}`

export type RepoSurface =
  | "backoffice"
  | "portal-v2"
  | "basecamp"
  | "react-fleet"
  | "dash-travel-fe"
  | "dash-marketplace"
  | `trellis-${string}`
  | "shared"
  | "unknown"

export interface RepoContextPack {
  /** Repo selected in Dash Build UI / caller. Example: dash/backoffice. */
  selectedRepo: string | null
  /** Normalized repo/surface key used for stack + audience inference. */
  repoSlug: RepoSurface
  /** Product or tenant theme for registry metadata and downstream routing. */
  theme: DashTheme
  /** Human-readable audience inferred from repo + prompt. */
  audience: string
  /** User-facing surface name inferred from repo + prompt. */
  surface: string
  /** Generation must integrate into the existing selected repo shell. */
  existingShell: boolean
  /** Prompt asks for a page/tab/navigation/route surface. */
  requiresNavOrRoute: boolean
  /** Known default route for the selected repo/surface, if Dash Build can infer it. */
  defaultRoute: string | null
  /** Best inferred route/page the generated change should integrate with. */
  targetRoute: string | null
  /** Best inferred nav label/menu item for the generated change. */
  targetNavLabel: string | null
  /** Known shell/nav entries for the selected repo. */
  existingNavItems: string[]
  /** Concrete route/nav instruction when requiresNavOrRoute is true. */
  routeRequirement: string | null
  /** Human-readable integration contract injected into generation and review. */
  integrationContract: string
  /** P0 context pack policy: generated preview/production examples use mocks. */
  dataPolicy: "mock-data-only"
  /** Whether repo/theme was inferred from weak signal and should be surfaced. */
  ambiguity: string | null
}

// ---------------------------------------------------------------------------
// Stage 3.5 — Existing files context (Phase C / Sprint 2A)
//   Path resolver detects route mentions in the prompt and maps them to real
//   files inside the selected repo on disk. existing-file-reader reads + caps
//   their content so the prompt-composer (S2B) can inject `## CURRENT FILE
//   STATE` sections and switch downstream pipeline into patch / edit mode.
// ---------------------------------------------------------------------------

export interface PathResolution {
  /** Absolute path to the existing file on disk. */
  filePath: string
  /** Route this file is mapped to (e.g. "/provider" or "/en/deliveries"). */
  route: string
  /** 0..1 — higher = stronger evidence it's the file the user is talking about. */
  confidence: number
  /** Short human-readable explanation of why this resolution surfaced. */
  reason: string
}

export interface ExistingFileContent {
  /** Absolute path on disk. */
  filePath: string
  /** Detected language hint (js/jsx/ts/tsx/css/json/md/unknown). */
  language: string
  /** File content (possibly truncated — see `truncated`). */
  content: string
  /** True when content was truncated to fit prompt budget. */
  truncated: boolean
  /** Full size in bytes of the file on disk. */
  fullSize: number
}

export interface ExistingFilesContext {
  /** All path resolutions surfaced for the prompt, sorted by confidence desc. */
  resolutions: PathResolution[]
  /** Files actually read (top-N candidates). */
  files: ExistingFileContent[]
}

// ---------------------------------------------------------------------------
// Stage 4 — Response parsing
// ---------------------------------------------------------------------------

export interface ParsedFile {
  /** Sprint 2B — discriminator. Default "file" keeps back-compat with code
   *  that destructures ParsedFile without checking `kind`. */
  kind?: "file"
  path: string
  language: string
  content: string
}

/**
 * Sprint 2B — surgical patch against an existing file. Emitted by the model
 * inside a ```mode=patch [path]``` code fence as a unified diff. The
 * orchestrator routes these to `PatchApplier.applyPatch` instead of
 * `BranchManager.writeGeneratedFiles`.
 */
export interface ParsedPatch {
  kind: "patch"
  /** Path the patch applies to — same shape as ParsedFile.path. */
  path: string
  /** Language hint (best-effort, may be "diff" or the original ext). */
  language: string
  /** Raw unified-diff text. Caller passes this straight to `git apply`. */
  patchContent: string
}

export type ParsedOutput = ParsedFile | ParsedPatch

export interface ParsedResponse {
  /** Backwards-compatible full-file outputs (mode=new-file or legacy
   *  ```tsx [path]``` fences). */
  files: ParsedFile[]
  /** Sprint 2B — unified-diff patches against existing files (mode=patch). */
  patches?: ParsedPatch[]
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
  /** Repo selected by Dash Build, e.g. dash/backoffice. */
  selectedRepo?: string | null
  detectedRepo?: string | null
  detectedLayer?: "ride" | "logistic" | "shared" | null
  contextPack?: RepoContextPack
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
        repoContext?: RepoContextPack
        designSources: string[]
        skillSources: string[]
        /** Phase C — existing files + path resolutions injected into prompt.
         *  Orchestrator (S2B) uses this to decide patch-mode vs greenfield. */
        existingFiles?: ExistingFilesContext | null
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
