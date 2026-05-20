/**
 * PRD-aware prompt evaluator.
 *
 * Wraps Agent F's `evaluatePrompt` (clarification heuristics) and layers
 * dash-prd skill conventions on top:
 *   - Counts how many PRD sections the prompt touches (1..14).
 *   - Adds clarifying questions when scope covers <2 sections AND prompt is
 *     ambiguous (avoid spamming for clearly-scoped single-component asks).
 *   - Produces a one-line `summary` the system prompt injects under "PRD Context".
 *
 * Pure function. No filesystem, no network — section detection runs against
 * a hard-coded keyword index distilled from `skills/dash-prd/prompts/section-rules.md`.
 */

import { evaluatePrompt as agentFEvaluate } from "../clarification/evaluator.js"
import type { PRDEval, PRDEvalInput } from "./types.js"

interface SectionDef {
  id: string
  /** Display label used in summary text. */
  label: string
  /** Lowercase keyword triggers — any match counts the section as touched. */
  keywords: string[]
}

/**
 * Distilled from `skills/dash-prd/prompts/section-rules.md`.
 * IDs match the §N headers in that file (1..14, plus 0 = preflight).
 */
const PRD_SECTIONS: SectionDef[] = [
  { id: "1", label: "Initiative", keywords: ["initiative", "feature", "epic", "project"] },
  { id: "2", label: "Status", keywords: ["status", "owner", "tribe", "bu ", "draft", "approved"] },
  { id: "3", label: "Background", keywords: ["background", "problem", "pain", "history", "context"] },
  { id: "4", label: "Goals", keywords: ["goal", "objective", "metric", "kpi", "north star"] },
  { id: "5", label: "Personas", keywords: ["persona", "user", "mitra", "driver", "customer", "ops"] },
  { id: "6", label: "Scope", keywords: ["scope", "in-scope", "out-of-scope", "boundary"] },
  { id: "7", label: "Constraints", keywords: ["constraint", "assumption", "dependency", "risk"] },
  {
    id: "8",
    label: "User Stories",
    keywords: ["user story", "as a", "scenario", "flow", "journey", "use case"],
  },
  {
    id: "9",
    label: "Solution",
    keywords: ["solution", "design", "ui", "ux", "screen", "page", "modal", "component", "form", "table", "dashboard"],
  },
  {
    id: "10",
    label: "Data Model",
    keywords: ["data model", "schema", "entity", "table", "field", "column", "database"],
  },
  {
    id: "11",
    label: "API",
    keywords: ["api", "endpoint", "graphql", "rest", "/api/", "fetch"],
  },
  {
    id: "12",
    label: "Analytics",
    keywords: ["analytics", "event", "tracking", "amplitude", "mixpanel"],
  },
  {
    id: "13",
    label: "Compliance",
    keywords: ["ojk", "uu pdp", "bi ", "kominfo", "regulation", "legal", "audit", "kyc", "compliance"],
  },
  {
    id: "14",
    label: "Rollout",
    keywords: ["rollout", "launch", "release", "feature flag", "phase", "milestone"],
  },
]

export function countPrdSectionsTouched(prompt: string): {
  count: number
  sections: string[]
} {
  const p = prompt.toLowerCase()
  const matched = new Set<string>()
  for (const s of PRD_SECTIONS) {
    if (s.keywords.some((k) => p.includes(k))) matched.add(s.label)
  }
  return { count: matched.size, sections: Array.from(matched) }
}

function summarize(prompt: string, sections: string[]): string {
  const head = prompt.trim().split(/\n+/)[0]?.slice(0, 160) ?? prompt.slice(0, 160)
  if (sections.length === 0) return head
  return `${head} — touches: ${sections.join(", ")}`
}

/**
 * Run PRD scope evaluation. Returns clarification questions + a summary.
 * Backward compatible: if Agent F's evaluator already raised clarification
 * needs, those questions are forwarded; PRD adds at most one extra question.
 */
export async function evaluatePromptScope(input: PRDEvalInput): Promise<PRDEval> {
  const agentF = agentFEvaluate({
    prompt: input.prompt,
    detectedRepo: input.detectedRepo,
    detectedLayer: input.detectedLayer,
    workspaceState: { branch: "main", isDirty: false, recentPrompts: [] },
  })

  const { count, sections } = countPrdSectionsTouched(input.prompt)
  const summary = summarize(input.prompt, sections)

  const questions = [...agentF.questions]

  // PRD gate: if prompt is short AND barely touches PRD sections, request expansion.
  // The "<3 sections" rule from the brief is softened to "<2" so single-component
  // requests (e.g. "tambahin tombol export di backoffice") don't get blocked.
  const wordCount = input.prompt.trim().split(/\s+/).filter(Boolean).length
  if (
    count < 2 &&
    wordCount < 12 &&
    !questions.some((q) => q.id === "prd-scope-expand")
  ) {
    questions.push({
      id: "prd-scope-expand",
      text: "Prompt scope thin (touches <2 PRD sections). Add brief context?",
      type: "free-text",
      rationale:
        "Dash-PRD convention: feature spec should reference Background / Goals / User Stories at minimum. Reduces blind generation.",
      required: false,
    })
  }

  const confidence =
    questions.length === 0 ? 92 : Math.max(20, 90 - questions.length * 12)

  return {
    needsClarification: questions.length > 0,
    questions,
    summary,
    sectionsTouched: count,
    confidence,
  }
}
