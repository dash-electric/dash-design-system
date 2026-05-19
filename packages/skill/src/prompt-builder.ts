/**
 * Composes captured project context + Dash AI rules + domain glossary into a
 * single AI prompt template.
 *
 * SCAFFOLD ONLY — Phase 2 (post-pilot, week 3).
 */
import type { DashInfoSnapshot } from "./info-collector.js"

export type PromptInputs = {
  snapshot: DashInfoSnapshot | null
  aiRules: string | null
  glossary: Record<string, string> | null
}

export type BuiltPrompt = {
  systemAppend: string
  metadata: {
    schemaVersion: number
    builtAt: string
    sources: string[]
  }
}

/**
 * Phase 2 will assemble the actual injection. For now we return a stable
 * skeleton so downstream tooling can already exercise the contract.
 */
export function buildPrompt(_inputs: PromptInputs): BuiltPrompt {
  return {
    systemAppend: "TODO Phase 2 — Dash skill prompt assembly not implemented yet.",
    metadata: {
      schemaVersion: 1,
      builtAt: new Date(0).toISOString(),
      sources: [],
    },
  }
}
