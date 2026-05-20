/**
 * @dash/skill entry point.
 *
 * v1 minimal: wires activate → collect → build into both:
 *   - `runSkill(cwd)` legacy entry (preserved for backward compat)
 *   - `loadDashSkill(opts)` new public entry that returns a BuiltPrompt
 *
 * Resilient by design — never throws. If activation fails, snapshot fails, or
 * the rules file is missing, returns a degraded BuiltPrompt with the bits
 * that did succeed.
 */
import fs from "node:fs/promises"
import path from "node:path"
import { shouldActivate, type ActivationResult } from "./activate.js"
import {
  collectDashInfo,
  type DashInfoSnapshot,
  type CollectorResult,
} from "./info-collector.js"
import { buildPrompt, type BuiltPrompt } from "./prompt-builder.js"

export type SkillRunResult = {
  status: "skipped" | "scaffold" | "ready"
  activation: ActivationResult
  snapshot: DashInfoSnapshot | null
  prompt: BuiltPrompt | null
  notes: string
}

export type LoadDashSkillOpts = {
  cwd?: string
  rulesPath?: string
  /**
   * Builder version. Defaults to 2 (priority-pinned + per-repo scoped).
   * Pass `1` to fall back to legacy 8K-truncated v1 behavior.
   */
  version?: 1 | 2
  /** v2-only: hard char budget. Default 7000. */
  charBudget?: number
  /**
   * v2-only: when true (default), prefer `dash-ai-rules.compressed.md` when it
   * exists in the project. Falls back to the full file otherwise. v1 always
   * uses the full file regardless of this flag.
   */
  preferCompressedRules?: boolean
}

export type SkillDeps = {
  /** Override the info-collector (testing). */
  collect?: (cwd: string) => Promise<CollectorResult>
  /** Override the rules-file reader (testing). */
  readRules?: (filePath: string) => Promise<string>
}

const DEFAULT_RULES_REL_PATHS = [
  "apps/docs/registry/rules/dash-ai-rules.md",
  "node_modules/@dash/skill/rules/dash-ai-rules.md",
]

const COMPRESSED_RULES_REL_PATHS = [
  "apps/docs/registry/rules/dash-ai-rules.compressed.md",
  "node_modules/@dash/skill/rules/dash-ai-rules.compressed.md",
]

async function tryReadRules(
  candidatePaths: string[],
  reader: (p: string) => Promise<string>,
): Promise<string | null> {
  for (const p of candidatePaths) {
    try {
      const txt = await reader(p)
      if (typeof txt === "string" && txt.length > 0) return txt
    } catch {
      /* try next */
    }
  }
  return null
}

/**
 * Primary public entry. Returns a BuiltPrompt the skill loader can splice into
 * the AI system prompt. Never throws — degrades to an empty/notice prompt if
 * the project isn't Dash-wired or the CLI isn't installed.
 */
export async function loadDashSkill(
  opts: LoadDashSkillOpts = {},
  deps: SkillDeps = {},
): Promise<BuiltPrompt> {
  const cwd = opts.cwd ?? process.cwd()
  const collect = deps.collect ?? collectDashInfo
  const readRules = deps.readRules ?? ((p: string) => fs.readFile(p, "utf8"))

  let snapshot: DashInfoSnapshot | null = null
  try {
    const info = await collect(cwd)
    if (info.ok) snapshot = info.snapshot
  } catch {
    snapshot = null
  }

  const projectRoot = snapshot?.project.rootPath ?? cwd
  const version = opts.version ?? 2
  const preferCompressed =
    opts.preferCompressedRules ?? version === 2

  const rulesCandidates: string[] = []
  if (opts.rulesPath) rulesCandidates.push(opts.rulesPath)
  // When v2 + preferCompressed, try compressed paths FIRST, then full.
  if (preferCompressed) {
    for (const rel of COMPRESSED_RULES_REL_PATHS) {
      rulesCandidates.push(path.join(projectRoot, rel))
    }
  }
  for (const rel of DEFAULT_RULES_REL_PATHS) {
    rulesCandidates.push(path.join(projectRoot, rel))
  }
  if (projectRoot !== cwd) {
    if (preferCompressed) {
      for (const rel of COMPRESSED_RULES_REL_PATHS) {
        rulesCandidates.push(path.join(cwd, rel))
      }
    }
    for (const rel of DEFAULT_RULES_REL_PATHS) {
      rulesCandidates.push(path.join(cwd, rel))
    }
  }

  let aiRules: string | null = null
  try {
    aiRules = await tryReadRules(rulesCandidates, readRules)
  } catch {
    aiRules = null
  }

  return buildPrompt(
    { snapshot, aiRules, glossary: null },
    { version, charBudget: opts.charBudget },
  )
}

/**
 * Legacy entry — preserved so existing callers / activate manifest keep
 * working. Wraps `loadDashSkill` with the activation gate.
 */
export async function runSkill(
  cwd: string = process.cwd(),
): Promise<SkillRunResult> {
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

  let snapshot: DashInfoSnapshot | null = null
  try {
    const info = await collectDashInfo(cwd)
    if (info.ok) snapshot = info.snapshot
  } catch {
    snapshot = null
  }

  const prompt = await loadDashSkill({ cwd })

  return {
    status: snapshot ? "ready" : "scaffold",
    activation,
    snapshot,
    prompt,
    notes: snapshot
      ? "Dash context loaded."
      : "Dash CLI unavailable or non-Dash repo — prompt degraded.",
  }
}

export { shouldActivate, collectDashInfo, buildPrompt }
export type { ActivationResult, DashInfoSnapshot, BuiltPrompt, CollectorResult }
