/**
 * Skill chain — main pipeline.
 *
 *   prompt
 *     → prd-evaluator     (scope + clarification gate)
 *     → design-loader     (Layer 0 cardinal + voice + manifest + layered arch)
 *     → skill-loader      (Skill v4 per-repo stack mandate + banned imports)
 *     → prompt-composer   (assemble system prompt)
 *     → model client (OpenAI/Codex generates)
 *     → response-parser   (extract files + explanation)
 *     → validator         (cardinal rule check + score)
 *
 * Caller responsibilities:
 *   - Provide a model client (OpenAI/Codex handoff). Defaults to `null` which
 *     returns `{ kind: "error" }` — keeps unit tests hermetic.
 *   - When `result.kind === "clarify"`, hand the questions off to Agent F's
 *     clarification UI; resume by calling `generateWithSkillChain` again with
 *     the answers folded into the prompt.
 *
 * No filesystem mutation. No commits. No stdout side effects.
 */

import { randomUUID } from "node:crypto"
import { evaluatePromptScope } from "./prd-evaluator.js"
import { loadDesignContext } from "./design-loader.js"
import { loadSkillContext } from "./skill-loader.js"
import { composeSystemPrompt, inferRepoContextPack } from "./prompt-composer.js"
import { introspectRepo } from "./repo-introspector.js"
import { loadExistingFilesContext } from "./existing-file-reader.js"
import { extractText, parseResponse } from "./response-parser.js"
import { validateOutput } from "./validator.js"
import { detectOutputMode } from "./output-mode-detector.js"
import type {
  ChainDeps,
  ExistingFilesContext,
  GenerateInput,
  GenerateResult,
  RepoIntrospection,
} from "./types.js"

/** Default model label — overridable per call. Codex CLI uses its own config unless env overrides it. */
export const DEFAULT_MODEL_ID = process.env.DASH_BUILD_OPENAI_MODEL ?? "codex-default"

function genPromptId(): string {
  return randomUUID()
}

export async function generateWithSkillChain(
  input: GenerateInput,
  deps: ChainDeps = {},
): Promise<GenerateResult> {
  const promptId = (deps.promptId ?? genPromptId)()
  const modelId = deps.modelId ?? DEFAULT_MODEL_ID
  const repoContext =
    input.contextPack ??
    inferRepoContextPack({
      prompt: input.prompt,
      selectedRepo: input.selectedRepo ?? input.detectedRepo ?? null,
      detectedRepo: input.detectedRepo ?? null,
      detectedLayer: input.detectedLayer ?? null,
      repoPath: input.repoPath,
    })
  const detectedRepo = input.detectedRepo ?? repoContext.repoSlug
  const detectedLayer =
    input.detectedLayer ??
    (repoContext.theme === "ride" || repoContext.theme === "logistic" || repoContext.theme === "shared"
      ? repoContext.theme
      : null)

  // ── Stage 1: PRD evaluation ───────────────────────────────────────────────
  const evaluate = deps.evaluatePRD ?? evaluatePromptScope
  let prdEval
  try {
    prdEval = await evaluate({
      prompt: input.prompt,
      detectedRepo: detectedRepo === "unknown" ? null : detectedRepo,
      detectedLayer,
    })
  } catch (err) {
    return { kind: "error", reason: "prd-evaluator failed", details: err }
  }

  if (prdEval.needsClarification) {
    return {
      kind: "clarify",
      questions: prdEval.questions,
      summary: prdEval.summary,
      confidence: prdEval.confidence,
    }
  }

  // ── Stage 1b: Intake-driven clarify gate ─────────────────────────────────
  // When the orchestrator pre-classified the prompt and flagged it as
  // ambiguous with low confidence, short-circuit BEFORE we burn an LLM call.
  // PRD evaluator's clarify gate may also fire — this gate is independent.
  if (
    input.intake &&
    input.intake.classification.scenario === "ambiguous" &&
    input.intake.classification.confidence < 0.5
  ) {
    const intakeQuestion =
      input.intake.classification.needsClarify ??
      "We could not classify this prompt — can you specify whether this is a visual change, a new BE endpoint, or a DB-schema change?"
    return {
      kind: "clarify",
      questions: [
        {
          id: "intake-scenario",
          text: intakeQuestion,
          type: "free-text",
          rationale:
            "Intake classifier returned ambiguous scenario at confidence " +
            `${input.intake.classification.confidence.toFixed(2)}. ` +
            "Need user disambiguation before generating.",
          required: true,
        },
      ],
      summary:
        "Intake classifier ambiguous — " + input.intake.classification.reasoning,
      confidence: Math.round(input.intake.classification.confidence * 100),
    }
  }

  // ── Stage 2 + 3: load design + skill context in parallel ─────────────────
  const loadDesign = deps.loadDesign ?? (() => loadDesignContext({ cwd: input.repoPath }))
  const loadSkill = deps.loadSkill ?? loadSkillContext

  const [design, skill, introspection, existingFiles] = await Promise.all([
    loadDesign().catch(() => ({
      cardinalRules: "",
      designContract: "",
      voiceRules: "",
      manifest: null,
      layeredArchitecture: "",
      loadedSources: [],
      missingSources: ["(design-loader threw)"],
    })),
    loadSkill({ repoPath: input.repoPath }).catch(() => ({
      systemAppend: "",
      sources: [],
      detectedRepoStack: null,
      schemaVersion: 0,
    })),
    // Layer A — repo introspection (best-effort, never blocks generation).
    introspectRepo(repoContext.repoSlug).catch<RepoIntrospection | null>(() => null),
    // Phase C / Sprint 2A — resolve route mentions in prompt to real files +
    // read their content. Best-effort. Empty context if anything fails.
    loadExistingFilesContext({
      prompt: input.prompt,
      contextPack: repoContext,
    }).catch<ExistingFilesContext>(() => ({ resolutions: [], files: [] })),
  ])

  // ── Stage 4: compose system prompt ───────────────────────────────────────
  // Sprint 2B — derive output mode from prompt + S2A existingFiles context.
  // The model gets explicit mode=new-file vs mode=patch instructions and
  // CURRENT FILE STATE lines for any patch-eligible file.
  const outputMode = detectOutputMode({
    prompt: input.prompt,
    existingFiles,
  })
  const systemPrompt = composeSystemPrompt({
    prd: prdEval,
    design,
    skill,
    repoContext,
    introspection,
    existingFiles,
    outputMode,
    intake: input.intake,
  })

  // ── Stage 5: call Claude ─────────────────────────────────────────────────
  if (!deps.anthropic) {
    return {
      kind: "error",
      reason:
        "No OpenAI/Codex client provided — wire `deps.anthropic` from the auth module before generation",
    }
  }

  let rawText: string
  try {
    const response = await deps.anthropic.messages.create({
      model: modelId,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: input.prompt }],
    })
    rawText = extractText(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      kind: "error",
      reason: `model generation failed: ${message}`,
      details: err,
    }
  }

  // ── Stage 6: parse ───────────────────────────────────────────────────────
  const parsed = parseResponse(rawText)

  // ── Stage 7: validate ────────────────────────────────────────────────────
  // Sprint 2B — thread existingFiles so patch-mode outputs can be vetted
  // against the real on-disk content (path existence, additions-only hex
  // checks, hunk header sanity).
  const validation = validateOutput(parsed, design, {
    existingFiles,
    intake: input.intake ?? null,
  })

  return {
    kind: "generated",
    response: parsed,
    validation,
    meta: {
      promptId,
      modelId,
      prdSectionsTouched: prdEval.sectionsTouched,
      detectedRepoStack: skill.detectedRepoStack,
      repoContext,
      designSources: design.loadedSources,
      skillSources: skill.sources,
      existingFiles,
      intake: input.intake,
    },
  }
}
