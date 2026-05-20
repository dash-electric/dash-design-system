/**
 * Shared types across the worker. Kept small + standalone so individual
 * modules (generator, validator, pr-creator) can be unit tested without
 * pulling the whole pipeline.
 */
import type { GapEntry } from "./gap-queue.js"

export type Scaffold = {
  /** Slug used in registry + filename. */
  name: string
  /** Registry category. */
  category: "block" | "template" | "pattern" | "ui"
  /** Hint about which scaffold template to use (Agent O output id). */
  scaffoldId: string
  /** Stub component body — generator will refine via Anthropic. */
  stubSource: string
}

export type GeneratorResult = {
  /** Final TSX source written to disk (or that WOULD be written in dry-run). */
  source: string
  /** Absolute path where the block was written; null in dry-run. */
  writtenTo: string | null
  /** Anthropic input/output token counts when available (stub returns 0). */
  usage: { inputTokens: number; outputTokens: number }
  /** Was this a stubbed (no-network) generation? */
  stubbed: boolean
}

export type ValidationResult = {
  score: number
  /** Per-criterion breakdown for transparency / Slack notify. */
  criteria: Array<{ id: string; weight: number; passed: boolean; note?: string }>
  /** Did `pnpm typecheck` succeed (or skipped). */
  typecheckPassed: boolean
  /** Did `pnpm test` succeed (or skipped). */
  testsPassed: boolean
  /** Did `dash audit` produce zero HIGH findings. */
  auditClean: boolean
}

export type PrResult = {
  url: string | null
  number: number | null
  /** Was the PR opened in draft mode (score in review band)? */
  draft: boolean
  /** Did we actually call GitHub, or was this a dry-run stub? */
  stubbed: boolean
}

export type PipelineOutcome =
  | { kind: "vendored"; gap: GapEntry; score: number; pr: PrResult }
  | { kind: "needs-review"; gap: GapEntry; score: number; pr: PrResult; reason: string }
  | { kind: "failed"; gap: GapEntry; score: number | null; reason: string }
  | { kind: "skipped"; gap: GapEntry; reason: string }

export type PipelineLogger = {
  info: (msg: string, meta?: Record<string, unknown>) => void
  warn: (msg: string, meta?: Record<string, unknown>) => void
  error: (msg: string, meta?: Record<string, unknown>) => void
}

export function defaultLogger(prefix = "[hermes]"): PipelineLogger {
  return {
    info: (msg, meta) => console.log(`${prefix} ${msg}${meta ? " " + JSON.stringify(meta) : ""}`),
    warn: (msg, meta) => console.warn(`${prefix} ${msg}${meta ? " " + JSON.stringify(meta) : ""}`),
    error: (msg, meta) => console.error(`${prefix} ${msg}${meta ? " " + JSON.stringify(meta) : ""}`),
  }
}
