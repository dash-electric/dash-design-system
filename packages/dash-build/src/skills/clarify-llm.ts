/**
 * Milestone 3 — MODEL-BACKED CLARIFY stage.
 *
 * Replaces the canned single-question clarify with skill-seeded reasoning. The
 * model is told to "think like a YC partner doing office hours and a CEO doing
 * a plan review" using the two vendored gstack skills as its reasoning method:
 *   - office-hours `### The Six Forcing Questions` → the clarify MENU
 *   - plan-ceo-review `## Step 0` + the four CEO modes → the FRAMING
 *
 * The discipline that matters: ask ONLY questions whose answer would CHANGE the
 * generated output (smart-skip), max 3, 0 preferred, mirror the user's
 * language, and never ask mitra-facing voice (deterministic from repo).
 *
 * Two paths, mirroring the rest of the chain:
 *   - MODEL-BACKED — one call seeded with the skill bodies + prompt + repo
 *     context, parsed with a tolerant JSON extractor.
 *   - FALLBACK — on no model, skill-read miss, parse failure, or thrown error,
 *     `clarifyWithSkill` returns `null` so the chain caller falls back to the
 *     deterministic `evaluatePromptScope` regex path (keeps tests hermetic).
 */

import { extractText } from "./response-parser.js"
import { extractFirstJsonObject } from "./prd-synthesizer.js"
import type { ClarificationQuestion } from "../clarification/types.js"
import type { AnthropicLike, PrdSeed } from "./types.js"

// ---------------------------------------------------------------------------
// I/O types
// ---------------------------------------------------------------------------

export type CeoMode = "EXPANSION" | "SELECTIVE" | "HOLD" | "REDUCTION"

export interface LlmClarifyInput {
  /** The (possibly already partially-clarified) user prompt. */
  prompt: string
  classification: { mode: string; scenario: string; confidence: number }
  repoContext: { repoSlug: string; theme: string | null }
  beFePresent: { be: boolean; fe: boolean }
  skillBodies: { ceo: string | null; officeHours: string | null }
  anthropic: AnthropicLike
  /** Model id resolved by the chain's `modelForStep("clarify")`. */
  model: string
}

export interface LlmClarifyOutput {
  needsClarification: boolean
  questions: ClarificationQuestion[]
  summary: string
  ceoMode: CeoMode
  prdSeed: PrdSeed
  lang: "id" | "en"
}

const CLARIFY_MAX_TOKENS = 1500

// ---------------------------------------------------------------------------
// Prompt template
// ---------------------------------------------------------------------------

function buildSystem(input: LlmClarifyInput): string {
  const ceo = input.skillBodies.ceo?.trim() || "(plan-ceo-review skill body unavailable)"
  const officeHours =
    input.skillBodies.officeHours?.trim() || "(office-hours skill body unavailable)"
  return `You are the intake reviewer for Dash Build. You think like a YC partner doing office
hours and a CEO doing a plan review. Use the two skills below as your reasoning method.

<plan-ceo-review>
${ceo}
</plan-ceo-review>

<office-hours>
${officeHours}
</office-hours>

RULES:
- Ask ONLY questions whose answer would CHANGE the generated output. Skip anything
  already implied by the prompt or the repo context (smart-skip).
- Max 3 questions. 0 is valid and preferred for clear prompts. Internal-ops framing:
  Q4 = "smallest version that gets greenlit", not "what would someone pay for".
- Mirror the user's language: if the prompt is Indonesian, ask in Indonesian.
- This is Dash internal tooling (backoffice/portal-v2). Never ask mitra-facing voice
  (deterministic from repo).
- Pick a CEO mode (EXPANSION/SELECTIVE/HOLD/REDUCTION) for the framing.

Return ONLY JSON matching exactly:
{"needsClarification":boolean,"ceoMode":"EXPANSION"|"SELECTIVE"|"HOLD"|"REDUCTION","lang":"id"|"en","summary":string,"questions":[{"id":string,"text":string,"type":"single-choice"|"multi-choice"|"free-text"|"yes-no","options":string[],"rationale":string,"required":boolean}],"prdSeed":{"problem":string,"user":string,"wedge":string,"surfaces":string[],"risks":string[]}}`
}

function buildUserMessage(input: LlmClarifyInput): string {
  const ctx = {
    classification: input.classification,
    repoContext: input.repoContext,
    beFePresent: input.beFePresent,
  }
  return `${input.prompt}\n\nRepo context:\n${JSON.stringify(ctx, null, 2)}`
}

// ---------------------------------------------------------------------------
// Coercion — tolerant of partial / loose model JSON
// ---------------------------------------------------------------------------

const VALID_MODES: readonly CeoMode[] = ["EXPANSION", "SELECTIVE", "HOLD", "REDUCTION"]
const VALID_Q_TYPES = new Set(["single-choice", "multi-choice", "free-text", "yes-no"])

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
}

function coerceQuestions(raw: unknown): ClarificationQuestion[] {
  if (!Array.isArray(raw)) return []
  const out: ClarificationQuestion[] = []
  for (let i = 0; i < raw.length && out.length < 3; i++) {
    const q = raw[i]
    if (!q || typeof q !== "object") continue
    const o = q as Record<string, unknown>
    const text = typeof o.text === "string" ? o.text.trim() : ""
    if (text.length === 0) continue
    const type = VALID_Q_TYPES.has(o.type as string)
      ? (o.type as ClarificationQuestion["type"])
      : "free-text"
    const options = asStringArray(o.options)
    const question: ClarificationQuestion = {
      id: typeof o.id === "string" && o.id.trim() ? o.id.trim() : `clarify-${i + 1}`,
      text,
      type,
      rationale:
        typeof o.rationale === "string" && o.rationale.trim()
          ? o.rationale.trim()
          : "Answer changes the generated output.",
      required: typeof o.required === "boolean" ? o.required : true,
    }
    if (options.length > 0) question.options = options
    out.push(question)
  }
  return out
}

function coercePrdSeed(raw: unknown): PrdSeed {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return {
    problem: typeof o.problem === "string" ? o.problem.trim() : "",
    user: typeof o.user === "string" ? o.user.trim() : "",
    wedge: typeof o.wedge === "string" ? o.wedge.trim() : "",
    surfaces: asStringArray(o.surfaces),
    risks: asStringArray(o.risks),
  }
}

function coerceOutput(raw: unknown): LlmClarifyOutput | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const questions = coerceQuestions(o.questions)
  // `needsClarification` is authoritative if present; otherwise infer from
  // whether any questions survived coercion.
  const needsClarification =
    typeof o.needsClarification === "boolean"
      ? o.needsClarification
      : questions.length > 0

  const ceoMode = VALID_MODES.includes(o.ceoMode as CeoMode)
    ? (o.ceoMode as CeoMode)
    : "HOLD"
  const lang: "id" | "en" = o.lang === "id" || o.lang === "en" ? o.lang : "en"
  const summary = typeof o.summary === "string" ? o.summary.trim() : ""

  // When the model says we need clarification but produced zero usable
  // questions, the payload is unusable — fall back to the deterministic path.
  if (needsClarification && questions.length === 0) return null

  return {
    needsClarification,
    questions,
    summary,
    ceoMode,
    prdSeed: coercePrdSeed(o.prdSeed),
    lang,
  }
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

/**
 * Run the model-backed clarify. Returns `null` (never throws) when the model
 * call throws, the response can't be parsed into JSON, or the payload is
 * unusable — the chain caller treats `null` as "fall back to the deterministic
 * regex evaluator".
 */
export async function clarifyWithSkill(
  input: LlmClarifyInput,
): Promise<LlmClarifyOutput | null> {
  try {
    const res = await input.anthropic.messages.create({
      model: input.model,
      max_tokens: CLARIFY_MAX_TOKENS,
      system: buildSystem(input),
      messages: [{ role: "user", content: buildUserMessage(input) }],
    })
    const text = extractText(res)
    const parsed = extractFirstJsonObject(text)
    if (parsed === null) return null
    return coerceOutput(parsed)
  } catch {
    return null
  }
}
