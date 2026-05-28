/**
 * Tier 2 #2.14 — Per-run cost ledger (CostMonitor REAL).
 *
 * Persists token + USD cost per run to `<runDir>/cost.json` so the workspace
 * top bar can display "Run cost: $0.024" without re-estimating on every
 * refresh, and so future analytics (Owner Co-pilot) can aggregate real spend
 * instead of the Run.validationScore proxy.
 *
 * --------------------------------------------------------------------------
 * HONESTY NOTE — the underlying OpenAI/Codex client (`AuthenticatedOpenAIClient.complete`)
 * currently throws away the API response's `usage` block. Until that layer
 * is upgraded to surface `{ prompt_tokens, completion_tokens }`, this module
 * accepts an `estimateUsage()` helper that produces a directionally-correct
 * tokens count from raw text length (1 token ≈ 4 chars, OpenAI rule of
 * thumb). Drop-in replacement: when real telemetry lands, pass the SDK's
 * `usage` block straight to `writeCost()` — the persistence layer + UI
 * doesn't need to change.
 * --------------------------------------------------------------------------
 *
 * Pricing table — keep narrow + verifiable. Add new entries as Dash Build
 * gains support for new models. Numbers expressed in USD per 1M tokens to
 * avoid floating-point drift in the per-1K-token form.
 */

import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { DEFAULT_RUNS_ROOT, resolveRunDir } from "./artifact-store.js"

/** USD per 1,000,000 tokens — input then output. */
export interface ModelPricing {
  inputPerMillionUsd: number
  outputPerMillionUsd: number
}

/**
 * Snapshot of OpenAI's published pricing as of late 2026. Values intentionally
 * conservative — undercounting cost is worse than overcounting it. When OpenAI
 * publishes a new tier, add to this table.
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // GPT-4o family (current Dash Build default).
  "gpt-4o": { inputPerMillionUsd: 5, outputPerMillionUsd: 15 },
  "gpt-4o-mini": { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.6 },
  // GPT-5 family (post-2025).
  "gpt-5": { inputPerMillionUsd: 5, outputPerMillionUsd: 15 },
  // Codex (priced like the underlying GPT-4o tier per Codex CLI docs).
  "codex-default": { inputPerMillionUsd: 5, outputPerMillionUsd: 15 },
}

/** Fallback when we have no explicit price for `modelId` — use gpt-4o. */
const DEFAULT_PRICING: ModelPricing = MODEL_PRICING["gpt-4o"]!

/** Raw token usage shape — matches the SDK's `response.usage` block. */
export interface TokenUsage {
  promptTokens: number
  completionTokens: number
}

export interface CostRecord {
  runId: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number
  /** True when tokens were estimated from text length (SDK didn't return usage). */
  estimated: boolean
  generatedAt: string
}

/** Rule-of-thumb 1 token ≈ 4 chars. Fine for cost-display granularity. */
export function estimateTokensFromText(text: string): number {
  if (!text) return 0
  // Round up so very short messages still register at least 1 token.
  return Math.max(1, Math.ceil(text.length / 4))
}

/**
 * Compose a TokenUsage from prompt + completion text. Wrapper around the
 * char/4 heuristic — call from the orchestrator when the SDK didn't return
 * real `usage`.
 */
export function estimateUsage(
  promptText: string,
  completionText: string,
): TokenUsage {
  return {
    promptTokens: estimateTokensFromText(promptText),
    completionTokens: estimateTokensFromText(completionText),
  }
}

/** Compute USD cost from a usage block + model id. */
export function computeCostUsd(
  usage: TokenUsage,
  model: string,
): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING
  const inputCost =
    (usage.promptTokens / 1_000_000) * pricing.inputPerMillionUsd
  const outputCost =
    (usage.completionTokens / 1_000_000) * pricing.outputPerMillionUsd
  return inputCost + outputCost
}

export interface WriteCostInput {
  runId: string
  model: string
  usage: TokenUsage
  /** When usage came from char/4 estimation rather than real SDK telemetry. */
  estimated?: boolean
  generatedAt?: string
}

/**
 * Persist a cost record at `<runDir>/cost.json`. Best-effort: returns null
 * on FS error rather than throwing so cost tracking never breaks generation.
 */
export async function writeCost(
  input: WriteCostInput,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<CostRecord | null> {
  const record: CostRecord = {
    runId: input.runId,
    model: input.model,
    promptTokens: input.usage.promptTokens,
    completionTokens: input.usage.completionTokens,
    totalTokens: input.usage.promptTokens + input.usage.completionTokens,
    costUsd: computeCostUsd(input.usage, input.model),
    estimated: input.estimated ?? false,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  }
  try {
    const runDir = resolveRunDir(input.runId, root)
    await mkdir(runDir, { recursive: true })
    await writeFile(
      join(runDir, "cost.json"),
      JSON.stringify(record, null, 2),
      "utf8",
    )
    return record
  } catch {
    return null
  }
}

/** Read a previously persisted cost record. Returns null when absent or unparseable. */
export async function readCost(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<CostRecord | null> {
  const file = join(resolveRunDir(runId, root), "cost.json")
  if (!existsSync(file)) return null
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as CostRecord
    // Defensive: ensure all required fields are present so downstream code
    // doesn't blow up on a malformed file (e.g. partial write during crash).
    if (
      typeof parsed.totalTokens !== "number" ||
      typeof parsed.costUsd !== "number"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Render a USD cost as a stable 4-decimal display string ("$0.0234"). */
export function formatCostUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return "$0.0000"
  // Cap decimals at 4 — anything finer is noise for a single-run display.
  return "$" + usd.toFixed(4)
}
