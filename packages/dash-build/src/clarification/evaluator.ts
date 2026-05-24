/**
 * Clarification evaluator — pure function that inspects a user prompt and
 * decides whether AI should pause to ask the user questions before generating.
 *
 * 5 heuristics (each can append one or more questions):
 *   1. Vague action verbs (tambahin, buat, improve, fix, update) without surface
 *   2. Data mentioned but no source (API endpoint, postgres, mock, …)
 *   3. Mitra-facing keywords (mitra/driver/courier) → enforce formal "Anda" voice
 *   4. Legal / financial signals (payment, signature, audit, KYC, balance, …)
 *   5. Scope blast — large prompts or compound clauses (dan/kemudian/+)
 *
 * Returns `shouldClarify=false` + empty questions when prompt is sufficient.
 */

import type { ClarificationQuestion } from "./types.js"

export interface EvaluatorInput {
  prompt: string
  detectedRepo: string | null
  detectedLayer: "ride" | "logistic" | "shared" | null
  workspaceState: {
    branch: string
    isDirty: boolean
    recentPrompts: string[]
  }
}

export interface EvaluatorOutput {
  shouldClarify: boolean
  questions: ClarificationQuestion[]
  /** 0-100. 90 = no clarification needed, drops 15pt per question added. */
  confidence: number
}

const VAGUE_VERBS = ["tambahin", "tambahkan", "buat", "improve", "fix", "update", "make", "add"]
const SURFACE_HINTS = [
  "backoffice",
  "portal-v2",
  "portal v2",
  "basecamp",
  "react-fleet",
  "fleet",
]
const DATA_TOKENS = [
  "data",
  "list",
  "table",
  "fetch",
  "load",
  "show",
  "display",
  "metric",
  "report",
  "dashboard",
]
const SOURCE_TOKENS = [
  "from ",
  "endpoint",
  "/api/",
  "api/",
  "graphql",
  "postgres",
  "database",
  "db ",
  "mock",
  "hardcoded",
  "hard-coded",
]
const MITRA_TOKENS = ["mitra", "driver", "courier", "kurir", "pengemudi", "rider"]
const NON_MITRA_FACING_PATTERNS = [
  /\bnot\s+mitra[-\s]?facing\b/i,
  /\bnot\s+(for|seen by|visible to)\s+(mitra|drivers?|couriers?|kurir|pengemudi|riders?)\b/i,
  /\bbukan\s+(untuk|buat|dilihat|dipakai)\s+(mitra|driver|courier|kurir|pengemudi|rider)\b/i,
  /\b(tidak|nggak|ga|gak)\s+(mitra[-\s]?facing|untuk\s+mitra|buat\s+mitra|dilihat\s+mitra)\b/i,
  /\b(internal|backoffice|hr|admin)[-\s]only\b/i,
]
const MITRA_FACING_PATTERNS = [
  /\bmitra[-\s]?facing\b/i,
  /\b(for|seen by|visible to)\s+(mitra|drivers?|couriers?|kurir|pengemudi|riders?)\b/i,
  /\b(untuk|buat|dilihat|dipakai)\s+(mitra|driver|courier|kurir|pengemudi|rider)\b/i,
]
const LEGAL_FINANCIAL_TOKENS = [
  "payment",
  "payout",
  "audit",
  "signature",
  "amount",
  "balance",
  "transfer",
  "withdrawal",
  "kyc",
  "ekyc",
  "legal",
  "contract",
  "invoice",
  "tax",
  "fee",
  "refund",
]
const COMPOUND_TOKENS = [
  " dan ",
  " kemudian ",
  " + ",
  " plus ",
  " then ",
  " lalu ",
  " and ",
]
const BROAD_DELIVERABLE_TOKENS = [
  "board",
  "dashboard",
  "exporter",
  "export",
  "report",
  "screen",
  "page",
  "modal",
  "notification",
  "banner",
  "workflow",
  "flow",
]

const REPO_INFERRED_NON_MITRA_AUDIENCES = [
  "backoffice",
  "portal-v2",
  "portal v2",
  "basecamp",
  "react-fleet",
  "fleet",
]

const P0_MOCK_DATA_ONLY = true

function lower(s: string): string {
  return s.toLowerCase()
}

function hasClarificationAnswer(
  prompt: string,
  question: Pick<ClarificationQuestion, "id" | "text">,
): boolean {
  const p = lower(prompt)
  if (!p.includes("--- clarifications ---")) return false
  return (
    p.includes(`${lower(question.text)} →`) ||
    p.includes(`${lower(question.text)} ->`) ||
    p.includes(`${lower(question.id)} →`) ||
    p.includes(`${lower(question.id)} ->`)
  )
}

function clarificationBooleanAnswer(
  prompt: string,
  question: Pick<ClarificationQuestion, "id" | "text">,
): boolean | null {
  const p = lower(prompt)
  if (!p.includes("--- clarifications ---")) return null
  const anchors = [lower(question.text), lower(question.id)]
  for (const anchor of anchors) {
    const idx = p.indexOf(anchor)
    if (idx === -1) continue
    const tail = p.slice(idx, idx + 240)
    if (/(→|->)\s*(true|yes|iya|ya)\b/.test(tail)) return true
    if (/(→|->)\s*(false|no|tidak|nggak|ga|gak)\b/.test(tail)) return false
  }
  return null
}

export function containsVague(prompt: string, words: string[] = VAGUE_VERBS): boolean {
  const p = lower(prompt)
  return words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(p))
}

export function mentionsSurface(prompt: string): boolean {
  const p = lower(prompt)
  return SURFACE_HINTS.some((s) => p.includes(s))
}

export function hasRepoInferredAudience(prompt: string, detectedRepo: string | null): boolean {
  const signal = lower([prompt, detectedRepo].filter(Boolean).join(" "))
  return REPO_INFERRED_NON_MITRA_AUDIENCES.some((s) => signal.includes(s))
}

export function mentionsData(prompt: string): boolean {
  const p = lower(prompt)
  return DATA_TOKENS.some((t) => new RegExp(`\\b${t}\\b`, "i").test(p))
}

export function mentionsSource(prompt: string): boolean {
  const p = lower(prompt)
  return SOURCE_TOKENS.some((t) => p.includes(t))
}

export function mentionsMitra(prompt: string): boolean {
  const p = lower(prompt)
  return MITRA_TOKENS.some((t) => new RegExp(`\\b${t}\\b`, "i").test(p))
}

export function explicitlyNonMitraFacing(prompt: string): boolean {
  return NON_MITRA_FACING_PATTERNS.some((pattern) => pattern.test(prompt))
}

export function explicitlyMitraFacing(prompt: string): boolean {
  if (explicitlyNonMitraFacing(prompt)) return false
  return MITRA_FACING_PATTERNS.some((pattern) => pattern.test(prompt))
}

export function mentionsLegalFinancial(prompt: string): boolean {
  const p = lower(prompt)
  return LEGAL_FINANCIAL_TOKENS.some((t) => new RegExp(`\\b${t}\\b`, "i").test(p))
}

export function isLargeScope(prompt: string): boolean {
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length
  if (wordCount > 200) return true
  const p = lower(prompt)
  let compoundHits = 0
  for (const t of COMPOUND_TOKENS) {
    let idx = 0
    while ((idx = p.indexOf(t, idx)) !== -1) {
      compoundHits++
      idx += t.length
    }
  }
  if (compoundHits < 2) return false
  if (compoundHits >= 3) return true
  const deliverableHits = BROAD_DELIVERABLE_TOKENS.reduce(
    (count, token) => count + (new RegExp(`\\b${token}\\b`, "i").test(p) ? 1 : 0),
    0,
  )
  return deliverableHits >= 3
}

export function evaluatePrompt(input: EvaluatorInput): EvaluatorOutput {
  const questions: ClarificationQuestion[] = []
  const { prompt, detectedRepo } = input

  // Heuristic 1: vague verb without explicit surface and no detected repo
  const targetSurfaceQuestion: ClarificationQuestion = {
    id: "target-surface",
    text: "Where should this feature live?",
    type: "single-choice",
    options: ["backoffice", "portal-v2", "basecamp", "react-fleet"],
    rationale: "Surface determines stack + voice rule",
    required: true,
  }
  if (
    containsVague(prompt) &&
    !mentionsSurface(prompt) &&
    !detectedRepo &&
    !hasClarificationAnswer(prompt, targetSurfaceQuestion)
  ) {
    questions.push(targetSurfaceQuestion)
  }

  // Heuristic 2: data verb but no source
  const dataSourceQuestion: ClarificationQuestion = {
    id: "data-source",
    text: "Data comes from?",
    type: "single-choice",
    options: [
      "GET /api/<endpoint>",
      "Postgres direct",
      "GraphQL",
      "Hard-coded mock",
      "Skip — I'll wire later",
    ],
    rationale: "API contract drives fetch pattern",
    required: false,
  }
  if (
    mentionsData(prompt) &&
    !mentionsSource(prompt) &&
    !P0_MOCK_DATA_ONLY &&
    !hasClarificationAnswer(prompt, dataSourceQuestion)
  ) {
    questions.push(dataSourceQuestion)
  }

  // Heuristic 3: mitra mention → voice rule confirm
  const voiceRuleQuestion: ClarificationQuestion = {
    id: "voice-rule",
    text: "Is this UI seen by mitra (drivers/couriers)?",
    type: "yes-no",
    rationale: "Mitra-facing requires formal 'Anda' voice per Dash rule",
    required: true,
  }
  const voiceAnswer = clarificationBooleanAnswer(prompt, voiceRuleQuestion)
  const nonMitraFacing = explicitlyNonMitraFacing(prompt)
  if (nonMitraFacing && voiceAnswer === true) {
    questions.push({
      id: "visibility-conflict",
      text: "Prompt says this is not mitra-facing, but the answer says mitra can see it. Which is correct?",
      type: "single-choice",
      options: [
        "Internal only — HR/admin/backoffice",
        "Mitra-facing — drivers/couriers can see it",
      ],
      rationale: "Audience controls tone, permissions, and exposed data",
      required: true,
    })
  } else if (
    mentionsMitra(prompt) &&
    !nonMitraFacing &&
    !hasRepoInferredAudience(prompt, detectedRepo) &&
    !explicitlyMitraFacing(prompt) &&
    !hasClarificationAnswer(prompt, voiceRuleQuestion)
  ) {
    questions.push(voiceRuleQuestion)
  }

  // Heuristic 4: legal / financial field
  const auditTrailQuestion: ClarificationQuestion = {
    id: "audit-trail",
    text: "Does this edit a legal/financial field?",
    type: "yes-no",
    rationale: "Audit trail mandatory per Dash cardinal rule #3",
    required: true,
  }
  if (
    mentionsLegalFinancial(prompt) &&
    !hasClarificationAnswer(prompt, auditTrailQuestion)
  ) {
    questions.push(auditTrailQuestion)
  }

  // Heuristic 5: scope blast
  const scopeConfirmQuestion: ClarificationQuestion = {
    id: "scope-confirm",
    text: "This looks like 3+ days of work. Break into smaller features?",
    type: "yes-no",
    rationale: "Smaller iterations ship faster, easier to review",
    required: false,
  }
  if (isLargeScope(prompt) && !hasClarificationAnswer(prompt, scopeConfirmQuestion)) {
    questions.push(scopeConfirmQuestion)
  }

  const confidence =
    questions.length === 0 ? 90 : Math.max(20, 90 - questions.length * 15)

  return {
    shouldClarify: questions.length > 0,
    questions,
    confidence,
  }
}
