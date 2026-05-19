/**
 * @dash/skill entry point.
 *
 * SCAFFOLD ONLY — Phase 2 (post-pilot, week 3). Wires the three building
 * blocks (activate → collect → build) into a single function the Claude Code
 * skill loader can call, but the actual content injection is stubbed.
 *
 * Phase 2 work:
 *   - Replace info-collector stub with real `dash info --json` execSync call
 *   - Fetch latest dash-ai-rules from registry, cache 5 min
 *   - Load Dash domain glossary
 *   - Assemble final systemAppend in prompt-builder
 */
import { shouldActivate, type ActivationResult } from "./activate.js"
import { collectDashInfo, type DashInfoSnapshot } from "./info-collector.js"
import { buildPrompt, type BuiltPrompt } from "./prompt-builder.js"

export type SkillRunResult = {
  status: "skipped" | "scaffold" | "ready"
  activation: ActivationResult
  snapshot: DashInfoSnapshot | null
  prompt: BuiltPrompt | null
  notes: string
}

export async function runSkill(cwd: string = process.cwd()): Promise<SkillRunResult> {
  const activation = shouldActivate(cwd)
  if (!activation.active) {
    return {
      status: "skipped",
      activation,
      snapshot: null,
      prompt: null,
      notes: "CWD is not Dash-wired — skill inert.",
    }
  }

  // Phase 2 will replace this stub. For now we return a scaffold marker.
  const info = await collectDashInfo(cwd)
  const snapshot: DashInfoSnapshot | null = info.ok ? null : null
  const prompt = buildPrompt({
    snapshot,
    aiRules: null,
    glossary: null,
  })

  return {
    status: "scaffold",
    activation,
    snapshot,
    prompt,
    notes: "TODO Phase 2 — scaffold only. dash info plumbing is in dash-cli v0.2.0; runtime injection ships in week 3.",
  }
}

export { shouldActivate, collectDashInfo, buildPrompt }
export type { ActivationResult, DashInfoSnapshot, BuiltPrompt }
