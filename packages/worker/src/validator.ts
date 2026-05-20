/**
 * Foundation match scorer + optional command-runner gates.
 *
 * Two layers:
 *
 *  1) **Heuristic score (0-100)** — regex-only, deterministic. Tested directly.
 *     Criteria (weights documented in the spec):
 *       +30  uses `@/registry/dash/...` primitives
 *       +20  uses Dash tokens (no raw hex)
 *       +20  hand-rolled state (useState) — NO RHF/zod/react-query/swr
 *       +15  audit trail signature present (when description suggests legal/financial)
 *       +10  formal voice ("Anda") in mitra-facing strings (when description suggests mitra)
 *       +5   plausible file conventions (default export OR named export starts uppercase)
 *
 *  2) **Command gates** — typecheck / test / audit. Runs `pnpm` subprocess
 *     in the repo root; configurable via `deps.runCommand` for tests.
 */
import { spawn } from "node:child_process"
import type { GapEntry } from "./gap-queue.js"
import type { ValidationResult } from "./types.js"

export type ScoreCriterion = {
  id: string
  weight: number
  passed: boolean
  note?: string
}

export type ScoreInput = {
  source: string
  description: string
}

const BANNED_IMPORTS = [
  "react-hook-form",
  "@hookform/resolvers",
  "zod",
  "@tanstack/react-query",
  "swr",
]

const RAW_HEX = /#(?:[0-9a-fA-F]{3}){1,2}\b/

const LEGAL_FINANCIAL_KEYWORDS = [
  "payment",
  "payout",
  "signature",
  "kyc",
  "ktp",
  "proof",
  "image",
  "saldo",
  "rekening",
  "tanda tangan",
]

const MITRA_KEYWORDS = ["mitra", "driver", "fleet", "courier", "kurir"]

function usesDashPrimitives(source: string): boolean {
  return /from\s+["']@\/registry\/dash\//.test(source) ||
    /from\s+["']@dash\//.test(source)
}

function usesDashTokens(source: string): boolean {
  // Heuristic: at least one Dash token class AND no raw hex literal.
  const hasToken = /\b(bg|text|border|stroke|fill)-(primary|bg|text|stroke|fill|error|success|warning|information)-[a-z0-9-]+/.test(source)
  const hasRawHex = RAW_HEX.test(source)
  return hasToken && !hasRawHex
}

function handRolledState(source: string): { passed: boolean; note?: string } {
  for (const lib of BANNED_IMPORTS) {
    if (new RegExp(`from\\s+["']${lib.replace(/[/.*+?^${}()|[\\]\\\\]/g, "\\$&")}["']`).test(source)) {
      return { passed: false, note: `banned import: ${lib}` }
    }
  }
  const hasUseState = /\buseState\s*[(<]/.test(source)
  return hasUseState
    ? { passed: true }
    : { passed: false, note: "no useState found" }
}

function isLegalFinancial(description: string): boolean {
  const d = description.toLowerCase()
  return LEGAL_FINANCIAL_KEYWORDS.some((k) => d.includes(k))
}

function isMitraFacing(description: string): boolean {
  const d = description.toLowerCase()
  return MITRA_KEYWORDS.some((k) => d.includes(k))
}

function hasAuditTrail(source: string): boolean {
  return /AUDIT[\s_-]?TRAIL/i.test(source) ||
    /\b(audit|original|edited_by|edit_reason)\b/i.test(source)
}

function hasFormalVoice(source: string): boolean {
  // `Anda` (capital A) within JSX string content. Reject "kamu".
  const hasAnda = /\bAnda\b/.test(source)
  const hasKamu = /\bkamu\b/.test(source)
  return hasAnda && !hasKamu
}

function plausibleConventions(source: string): boolean {
  // Has either a default export or a named export beginning with uppercase.
  return /export\s+default\s+/.test(source) ||
    /export\s+(?:function|const)\s+[A-Z]/.test(source)
}

/**
 * Compute the foundation-match score. Pure function — no I/O.
 */
export function computeScore(input: ScoreInput): {
  score: number
  criteria: ScoreCriterion[]
} {
  const criteria: ScoreCriterion[] = []
  const { source, description } = input

  criteria.push({
    id: "dash-primitives",
    weight: 30,
    passed: usesDashPrimitives(source),
    note: "uses @/registry/dash/* imports",
  })

  criteria.push({
    id: "dash-tokens",
    weight: 20,
    passed: usesDashTokens(source),
    note: "tokens + no raw hex",
  })

  const handRolled = handRolledState(source)
  criteria.push({
    id: "hand-rolled-state",
    weight: 20,
    passed: handRolled.passed,
    note: handRolled.note ?? "useState present, no banned libs",
  })

  // Audit-trail criterion only applies to legal/financial gaps. If not
  // applicable, we award the points by default (so unrelated gaps aren't
  // penalised) but mark the note accordingly.
  const legalFinancial = isLegalFinancial(description)
  criteria.push({
    id: "audit-trail",
    weight: 15,
    passed: legalFinancial ? hasAuditTrail(source) : true,
    note: legalFinancial
      ? "audit-trail signature for legal/financial field"
      : "not applicable (not legal/financial)",
  })

  const mitra = isMitraFacing(description)
  criteria.push({
    id: "formal-voice",
    weight: 10,
    passed: mitra ? hasFormalVoice(source) : true,
    note: mitra
      ? "formal Anda for mitra-facing"
      : "not applicable (not mitra-facing)",
  })

  criteria.push({
    id: "file-conventions",
    weight: 5,
    passed: plausibleConventions(source),
    note: "default or PascalCase named export",
  })

  const score = criteria.reduce(
    (sum, c) => sum + (c.passed ? c.weight : 0),
    0,
  )
  return { score, criteria }
}

// ---------------------------------------------------------------------------
// Command gate runners — optional, async, injectable for tests.
// ---------------------------------------------------------------------------

export type CommandRunner = (
  cmd: string,
  args: string[],
  opts: { cwd: string; timeoutMs?: number },
) => Promise<{ exitCode: number; stdout: string; stderr: string }>

const defaultRunCommand: CommandRunner = (cmd, args, opts) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: process.env })
    let stdout = ""
    let stderr = ""
    let killed = false
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          killed = true
          child.kill("SIGKILL")
        }, opts.timeoutMs)
      : null
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.on("close", (code) => {
      if (timer) clearTimeout(timer)
      resolve({
        exitCode: killed ? 124 : code ?? 1,
        stdout,
        stderr,
      })
    })
    child.on("error", () => {
      if (timer) clearTimeout(timer)
      resolve({ exitCode: 1, stdout, stderr })
    })
  })

export type ValidateOpts = {
  /** Repo root for `pnpm typecheck/test/audit`. */
  repoRoot?: string
  /** Skip command-runner gates entirely (default true in worker tests). */
  skipCommandGates?: boolean
  /** Override the command runner (tests). */
  runCommand?: CommandRunner
}

/**
 * Run heuristic score + optional command gates. Always returns a complete
 * ValidationResult — even when gates are skipped (those flags become `true`).
 */
export async function validateGenerated(
  gap: GapEntry,
  source: string,
  opts: ValidateOpts = {},
): Promise<ValidationResult> {
  const { score, criteria } = computeScore({
    source,
    description: gap.description,
  })

  if (opts.skipCommandGates ?? true) {
    return {
      score,
      criteria,
      typecheckPassed: true,
      testsPassed: true,
      auditClean: true,
    }
  }

  const run = opts.runCommand ?? defaultRunCommand
  const cwd = opts.repoRoot ?? process.cwd()

  const tc = await run("pnpm", ["typecheck"], { cwd, timeoutMs: 120_000 })
  const tests = await run("pnpm", ["test"], { cwd, timeoutMs: 300_000 })
  const audit = await run("pnpm", ["dash", "audit"], { cwd, timeoutMs: 60_000 })

  return {
    score,
    criteria,
    typecheckPassed: tc.exitCode === 0,
    testsPassed: tests.exitCode === 0,
    auditClean: audit.exitCode === 0,
  }
}
