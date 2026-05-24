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
import { extractText, parseResponse } from "./response-parser.js"
import { validateOutput } from "./validator.js"
import type {
  ChainDeps,
  GenerateInput,
  GenerateResult,
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

  // ── Stage 2 + 3: load design + skill context in parallel ─────────────────
  const loadDesign = deps.loadDesign ?? (() => loadDesignContext({ cwd: input.repoPath }))
  const loadSkill = deps.loadSkill ?? loadSkillContext

  const [design, skill] = await Promise.all([
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
  ])

  // ── Stage 4: compose system prompt ───────────────────────────────────────
  const systemPrompt = composeSystemPrompt({ prd: prdEval, design, skill, repoContext })

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
  const validation = validateOutput(parsed, design)

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
    },
  }
}
