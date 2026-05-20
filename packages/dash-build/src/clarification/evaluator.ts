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
  "halo-dash",
  "halo dash",
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

function lower(s: string): string {
  return s.toLowerCase()
}

export function containsVague(prompt: string, words: string[] = VAGUE_VERBS): boolean {
  const p = lower(prompt)
  return words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(p))
}

export function mentionsSurface(prompt: string): boolean {
  const p = lower(prompt)
  return SURFACE_HINTS.some((s) => p.includes(s))
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
  return compoundHits >= 2
}

export function evaluatePrompt(input: EvaluatorInput): EvaluatorOutput {
  const questions: ClarificationQuestion[] = []
  const { prompt, detectedRepo } = input

  // Heuristic 1: vague verb without explicit surface and no detected repo
  if (containsVague(prompt) && !mentionsSurface(prompt) && !detectedRepo) {
    questions.push({
      id: "target-surface",
      text: "Where should this feature live?",
      type: "single-choice",
      options: ["backoffice", "halo-dash-fe", "portal-v2", "basecamp"],
      rationale: "Surface determines stack + voice rule",
      required: true,
    })
  }

  // Heuristic 2: data verb but no source
  if (mentionsData(prompt) && !mentionsSource(prompt)) {
    questions.push({
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
    })
  }

  // Heuristic 3: mitra mention → voice rule confirm
  if (mentionsMitra(prompt)) {
    questions.push({
      id: "voice-rule",
      text: "Is this UI seen by mitra (drivers/couriers)?",
      type: "yes-no",
      rationale: "Mitra-facing requires formal 'Anda' voice per Dash rule",
      required: true,
    })
  }

  // Heuristic 4: legal / financial field
  if (mentionsLegalFinancial(prompt)) {
    questions.push({
      id: "audit-trail",
      text: "Does this edit a legal/financial field?",
      type: "yes-no",
      rationale: "Audit trail mandatory per Dash cardinal rule #3",
      required: true,
    })
  }

  // Heuristic 5: scope blast
  if (isLargeScope(prompt)) {
    questions.push({
      id: "scope-confirm",
      text: "This looks like 3+ days of work. Break into smaller features?",
      type: "yes-no",
      rationale: "Smaller iterations ship faster, easier to review",
      required: false,
    })
  }

  const confidence =
    questions.length === 0 ? 90 : Math.max(20, 90 - questions.length * 15)

  return {
    shouldClarify: questions.length > 0,
    questions,
    confidence,
  }
}
