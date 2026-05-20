/**
 * Clarification UI types — multi-turn AI questions before generation.
 *
 * Per Dash cardinal rule: AI must NOT generate blindly. If scope is unclear
 * (vague verbs, missing surface, mitra-facing, legal/financial fields,
 * blast scope), pause and ask user via browser before generating.
 */

export type ClarificationQuestionType =
  | "single-choice"
  | "multi-choice"
  | "free-text"
  | "yes-no"

export type ClarificationAnswer = string | string[] | boolean

export interface ClarificationQuestion {
  /** Stable identifier used as form field key + answer map key */
  id: string
  /** User-facing question text */
  text: string
  type: ClarificationQuestionType
  /** Options for choice types. Required when type ∈ {single-choice, multi-choice}. */
  options?: string[]
  /** Why AI needs this answer — shown to user as helper text */
  rationale: string
  /** If true, session cannot transition to "answered" until provided */
  required: boolean
}

export type ClarificationStatus = "pending" | "answered" | "expired"

export interface ClarificationSession {
  promptId: string
  originalPrompt: string
  questions: ClarificationQuestion[]
  answers: Record<string, ClarificationAnswer>
  status: ClarificationStatus
  createdAt: string
}

export type ClarificationResult =
  | { kind: "answered"; session: ClarificationSession }
  | { kind: "skipped"; reason: string }
  | { kind: "timeout"; session: ClarificationSession }
