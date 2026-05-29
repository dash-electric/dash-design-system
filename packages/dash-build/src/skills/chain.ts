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
import { loadDSContext } from "./ds-catalog-loader.js"
import { extractText, parseResponse } from "./response-parser.js"
import { validateOutput } from "./validator.js"
import { detectOutputMode } from "./output-mode-detector.js"
import { readGstackSkill } from "./skill-reader.js"
import { clarifyWithSkill } from "./clarify-llm.js"
import { synthesizePrd, writePrdSnapshot } from "./prd-synthesizer.js"
import { readFePatterns, type FePattern } from "../intake/read-fe-patterns.js"
import type {
  ChainDeps,
  DashPRD,
  DSContext,
  ExistingFilesContext,
  GenerateInput,
  GenerateResult,
  PrdSeed,
  RepoIntrospection,
} from "./types.js"

/** Default model label — overridable per call. Codex CLI uses its own config unless env overrides it. */
export const DEFAULT_MODEL_ID = process.env.DASH_BUILD_OPENAI_MODEL ?? "codex-default"

/**
 * Milestone 3 (Spec §D) — per-step model routing seam.
 *
 * A config-shaped hook, not a graph: each pipeline step resolves to a model id
 * from an env-driven tier. Both tiers default to `DEFAULT_MODEL_ID`, so leaving
 * the env unset is byte-for-byte identical to today. This is the exact place a
 * future `pipeline-config.json models.tiers` block plugs into.
 *
 *   - clarify + prd  → CHEAP tier (cheap reasoning, many tokens)
 *   - codegen        → STRONG tier (the expensive, high-quality generation)
 */
export const MODEL_TIERS = {
  cheap: process.env.DASH_BUILD_CLARIFY_MODEL ?? DEFAULT_MODEL_ID,
  strong: process.env.DASH_BUILD_CODEGEN_MODEL ?? DEFAULT_MODEL_ID,
} as const

export function modelForStep(step: "clarify" | "prd" | "codegen"): string {
  return step === "codegen" ? MODEL_TIERS.strong : MODEL_TIERS.cheap
}

function genPromptId(): string {
  return randomUUID()
}

/**
 * Tier 0I — demote a false `new_product` classification to `extend_fe_be` when
 * the chain resolved real existing FE files for the prompt.
 *
 * The orchestrator classifies in `runIntake()` with `existingFiles: []` (the
 * resolver runs later, inside the chain). That blind spot makes prompts like
 * "tambahin tab Delivery di detail mitra" resolve to `new_product` whenever no
 * BE endpoint matches in the target repo's `/api` dir — even though the user
 * clearly wants to extend an existing surface. Once the chain has resolved the
 * real on-disk files, an existing-file hit is strong evidence the work is
 * additive-to-existing, so we correct the scenario here.
 *
 * Conservative: only flips `new_product` (the known false-positive). Never
 * touches `fe_only`, `update_existing`, `extend_fe_be_db`, or `ambiguous`, and
 * never invents an intake object when the caller didn't pass one.
 */
export function reconcileScenario(
  intake: GenerateInput["intake"],
  existingFiles: ExistingFilesContext,
): GenerateInput["intake"] {
  if (!intake) return intake
  if (intake.classification.scenario !== "new_product") return intake
  if (existingFiles.files.length === 0) return intake

  const resolvedPaths = existingFiles.files.map((f) => f.filePath)
  return {
    ...intake,
    classification: {
      ...intake.classification,
      scenario: "extend_fe_be",
      reasoning:
        `[reconciled new_product → extend_fe_be] ${intake.classification.reasoning} ` +
        `Chain resolved ${resolvedPaths.length} existing FE file(s) for this prompt ` +
        `(${resolvedPaths.join(", ")}), so the change extends an existing surface ` +
        `rather than scaffolding a greenfield product.`,
      affectedFiles: {
        fe: resolvedPaths,
        be: intake.classification.affectedFiles?.be ?? [],
        db: intake.classification.affectedFiles?.db ?? [],
      },
    },
  }
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

  // ── Stage 1: PRD evaluation + clarify ─────────────────────────────────────
  // Two paths:
  //   1. MODEL-BACKED (M3) — when a model client is wired AND the caller did
  //      NOT inject a deterministic `evaluatePRD` stub, seed `clarifyWithSkill`
  //      with the two vendored gstack skills (office-hours forcing questions +
  //      plan-ceo-review modes) so clarify becomes skill-seeded reasoning that
  //      asks ONLY output-changing questions in the user's language. Emits an
  //      optional `prdSeed` carried into Stage 1c synthesis.
  //   2. DETERMINISTIC FALLBACK — the existing `evaluatePromptScope` regex gate
  //      (or an injected `evaluatePRD`). Drives every hermetic unit test, since
  //      they don't wire a real clarify model. Also the runtime fallback when
  //      the skill read or the model JSON parse fails.
  const evaluate = deps.evaluatePRD ?? evaluatePromptScope

  // The model-backed clarify only runs when the caller did NOT inject a
  // deterministic evaluator (an injected `evaluatePRD` is the explicit "use the
  // deterministic path" signal that keeps existing chain tests hermetic).
  let clarifyPrdSeed: PrdSeed | undefined
  // True once the model-backed clarify has explicitly adjudicated "no
  // clarification needed". When set, we still run the deterministic evaluator
  // for its summary/sectionsTouched/confidence, but we IGNORE its
  // `needsClarification` — re-asking what the skill-seeded reviewer already
  // cleared is the double-ask the spec (§B / vision §1.3) warns against.
  let modelClarifyCleared = false
  if (deps.anthropic && !deps.evaluatePRD) {
    const [ceoSkill, ohSkill] = await Promise.all([
      readGstackSkill("plan-ceo-review").catch(() => null),
      readGstackSkill("office-hours").catch(() => null),
    ])
    // Only attempt the model path when at least one reasoning body resolved —
    // otherwise the model has no method to apply, so we degrade to the regex.
    if (ceoSkill || ohSkill) {
      const llm = await clarifyWithSkill({
        prompt: input.prompt,
        classification: {
          mode: input.intake?.mode?.mode ?? "unknown",
          scenario: input.intake?.classification.scenario ?? "unknown",
          confidence: input.intake?.classification.confidence ?? 0,
        },
        repoContext: {
          repoSlug: repoContext.repoSlug,
          theme: repoContext.theme ?? null,
        },
        beFePresent: {
          be: (input.intake?.beCatalog.totalEndpoints ?? 0) > 0,
          fe: (input.intake?.classification.affectedFiles?.fe.length ?? 0) > 0,
        },
        skillBodies: { ceo: ceoSkill?.body ?? null, officeHours: ohSkill?.body ?? null },
        anthropic: deps.anthropic,
        model: modelForStep("clarify"),
      })
      if (llm) {
        if (llm.needsClarification) {
          return {
            kind: "clarify",
            questions: llm.questions,
            // Confidence: scale down per outstanding question (mirrors the
            // deterministic evaluator's shape), floored at 20.
            confidence: Math.max(20, 90 - llm.questions.length * 12),
            summary: llm.summary,
            ceoMode: llm.ceoMode,
            prdSeed: llm.prdSeed,
          }
        }
        // Clear prompt → no questions. Stash the seed for Stage 1c synthesis
        // and suppress the deterministic clarify gate below.
        clarifyPrdSeed = llm.prdSeed
        modelClarifyCleared = true
      }
      // llm === null → parse/skill/model failure: fall through to the
      // deterministic evaluator below (no early return).
    }
  }

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

  if (prdEval.needsClarification && !modelClarifyCleared) {
    return {
      kind: "clarify",
      questions: prdEval.questions,
      summary: prdEval.summary,
      confidence: prdEval.confidence,
    }
  }

  // ── Stage 1a: MODE clarify gate ──────────────────────────────────────────
  // Mode sits ABOVE scenario. If the detector couldn't tell whether this is an
  // existing-repo improvement, a blank-product build, or a design-system
  // change, ask ONE outcome-framed question before anything else — getting the
  // mode wrong is the root of the "looks brand-new" trust issue. Skipped when
  // the user already picked a repo (detector returns existing-repo at 0.95, no
  // needsClarify). See docs/specs/mode-aware-intake-2026-05-29.md.
  // #4 fix (2026-05-29): DON'T re-ask mode when the surface is already known.
  // The clarification gate (clarification/evaluator) may have already resolved
  // "Where should this feature live? → backoffice", which sets
  // repoContext.repoSlug to a real repo. A known repo === existing-repo mode,
  // so asking "existing / new / design-system?" again is a redundant double-
  // ask that confused users (they'd already said backoffice). Only fire the
  // mode gate when the surface is genuinely unresolved ("unknown").
  const surfaceResolved =
    repoContext.repoSlug && repoContext.repoSlug !== "unknown"
  if (
    !surfaceResolved &&
    input.intake?.mode &&
    input.intake.mode.mode === "ambiguous" &&
    input.intake.mode.needsClarify
  ) {
    return {
      kind: "clarify",
      questions: [
        {
          id: "intake-mode",
          text: input.intake.mode.needsClarify,
          type: input.intake.mode.clarifyOptions?.length ? "single-choice" : "free-text",
          options: input.intake.mode.clarifyOptions,
          rationale:
            "Project mode ambiguous at confidence " +
            `${input.intake.mode.confidence.toFixed(2)}. Mode drives clone vs ` +
            "standalone preview, so we resolve it before generating.",
          required: true,
        },
      ],
      summary: "Project mode unclear — " + input.intake.mode.reasoning,
      confidence: Math.round(input.intake.mode.confidence * 100),
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
  const loadDSCtxFn =
    deps.loadDSContext ?? (({ repoPath }) => loadDSContext({ cwd: repoPath }))

  const [design, skill, introspection, existingFiles, dsContext, fePatterns] = await Promise.all([
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
    // Phase B Tier 0A/0B/0L — Dash DS catalog + compressed rules + glossary.
    loadDSCtxFn({ repoPath: input.repoPath }).catch<DSContext | null>(() => null),
    // Phase C / Tier 0G — surface 1-3 reference FE components from the
    // target repo so the LLM mirrors local style + imports. Best-effort:
    // never throws, returns [] when the repo can't be walked.
    readFePatterns({
      prompt: input.prompt,
      repoRoot: input.repoPath,
      scenario: input.intake?.classification.scenario ?? null,
    }).catch<FePattern[]>(() => []),
  ])

  // ── Stage 4: compose system prompt ───────────────────────────────────────
  // Sprint 2B — derive output mode from prompt + S2A existingFiles context.
  // The model gets explicit mode=new-file vs mode=patch instructions and
  // CURRENT FILE STATE lines for any patch-eligible file.
  const outputMode = detectOutputMode({
    prompt: input.prompt,
    existingFiles,
  })

  // Tier 0I — scenario correction. The orchestrator's runIntake() classifies
  // BEFORE the chain resolves real FE files (it passes existingFiles:[]), so a
  // prompt like "tambahin tab di detail mitra" mis-routes to `new_product`
  // when no BE endpoint matches in the target repo's /api dir. Here both the
  // intake classification AND the resolved existing FE files are available, so
  // we can demote a false `new_product` to `extend_fe_be` when the prompt
  // actually resolved to existing on-disk files. Greenfield prompts (no file
  // resolved) keep `new_product` untouched.
  const intake = reconcileScenario(input.intake, existingFiles)

  // ── Stage 1c: PRD synthesis ──────────────────────────────────────────────
  // Turn the clarified prompt + answers + (optional) prdSeed + design contract
  // + domain glossary into ONE authoritative `DashPRD`, persist it to
  // `<runDir>/prd.json`, and feed it into the composer's `## PRD` block so
  // code-gen builds from a real spec instead of the one-line `prdEval.summary`.
  //
  // The seed prefers a fresh model-backed clarify seed (this call), then any
  // seed carried over from a prior clarify round-trip on the input. Synthesis
  // is model-backed only when the caller did NOT inject a deterministic
  // `evaluatePRD` stub (same hermetic-test discipline as clarify above) — the
  // structured-summary fallback always yields a valid PRD otherwise.
  const prdSeed = clarifyPrdSeed ?? input.prdSeed
  const synthAnthropic = deps.anthropic && !deps.evaluatePRD ? deps.anthropic : undefined
  let dashPrd: DashPRD | undefined
  try {
    dashPrd = await synthesizePrd({
      prompt: input.prompt,
      promptId,
      answers: input.answers,
      prdSeed,
      classification: {
        scenario: intake?.classification.scenario ?? "unknown",
        repoSlug: repoContext.repoSlug,
        confidence: intake?.classification.confidence ?? prdEval.confidence / 100,
        affectedFiles: intake?.classification.affectedFiles ?? null,
      },
      designContract: design.designContract,
      glossary: dsContext?.domainGlossary ?? "",
      anthropic: synthAnthropic,
      model: modelForStep("prd"),
    })
    // Persist best-effort — a write failure must NEVER block generation.
    await writePrdSnapshot(promptId, dashPrd).catch(() => undefined)
  } catch {
    // synthesizePrd never throws, but guard the await chain defensively so a
    // persistence/IO edge case degrades to "no PRD block" rather than erroring.
    dashPrd = undefined
  }

  const systemPrompt = composeSystemPrompt({
    prd: prdEval,
    design,
    skill,
    repoContext,
    introspection,
    existingFiles,
    outputMode,
    intake,
    dsContext,
    fePatterns,
    dashPrd,
  })

  // ── Stage 5: call Claude ─────────────────────────────────────────────────
  if (!deps.anthropic) {
    return {
      kind: "error",
      reason:
        "No OpenAI/Codex client provided — wire `deps.anthropic` from the auth module before generation",
    }
  }

  // Codegen model resolution (Spec §D): an explicit `deps.modelId` override is
  // a hard win; otherwise route through the STRONG tier seam. Unset env =
  // identical to today (both resolve to DEFAULT_MODEL_ID).
  const codegenModel = deps.modelId ?? modelForStep("codegen")

  let rawText: string
  try {
    const response = await deps.anthropic.messages.create({
      model: codegenModel,
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
    intake: intake ?? null,
    repoContext,
    prompt: input.prompt,
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
      intake,
    },
  }
}
