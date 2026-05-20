/**
 * Faux skill-chain result builder for integration tests. Mirrors the
 * `GenerateResult` discriminated union from skills/types but inlined here so
 * tests stay self-contained (no chain.ts import surface).
 */

export interface FauxFile {
  path: string
  language: string
  content: string
}

export type FauxResult =
  | { kind: "ok"; promptId: string; files: FauxFile[]; score: number; explanation: string }
  | { kind: "clarify"; promptId: string; questions: string[] }
  | { kind: "error"; promptId: string; error: string }

export function makeOk(promptId: string, score = 92): FauxResult {
  return {
    kind: "ok",
    promptId,
    score,
    explanation: "Adds payroll chart with mitra Lvl grouping.",
    files: [
      {
        path: "src/components/payroll-chart.tsx",
        language: "tsx",
        content: "export function PayrollChart() { return <div>Payroll</div> }",
      },
    ],
  }
}

export function makeClarify(promptId: string): FauxResult {
  return {
    kind: "clarify",
    promptId,
    questions: [
      "Which mitra level should the chart group by?",
      "Does this need export to PDF?",
    ],
  }
}

export function makeError(promptId: string, error = "anthropic_unauthorized"): FauxResult {
  return { kind: "error", promptId, error }
}

/**
 * Foundation-score gate. The validator returns 0–100; auto-merge requires
 * score >= 85 (matches Layer 0 cardinal-rules guard wave-5-pilot threshold).
 */
export const AUTO_MERGE_THRESHOLD = 85
export function canAutoMerge(score: number): boolean {
  return score >= AUTO_MERGE_THRESHOLD
}
