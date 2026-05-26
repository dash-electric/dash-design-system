/**
 * CIGate — pre-publish validation gate (Phase D3).
 *
 * Runs sequentially against a checked-out branch in the workspace clone before
 * Publisher (D2) pushes it to origin. The five checks mirror the audits that
 * `apps/docs` enforces on PRs so the bot can't ship code that would fail CI
 * on the consumer side.
 *
 * Checks (fail-fast by default):
 *   1. cardinalRules   — validator.ts `daemon-self-audit` against generated files
 *   2. auditCss        — `pnpm --filter @dash/build audit:css:strict`
 *   3. auditTokens     — `pnpm --filter @dash/build audit:tokens`
 *                        (warn-only unless `strict` flag is set)
 *   4. typecheck       — `pnpm --filter @dash/build typecheck`
 *                        (skippable via DASH_BUILD_CI_SKIP_TYPECHECK=true)
 *   5. tests           — OFF by default; consumer repo clone doesn't have deps.
 *                        Opt in via `runTests: true`.
 *
 * No new npm deps. Subprocess via node:child_process.spawn (no shell).
 */

import { spawn } from "node:child_process"
import { performance } from "node:perf_hooks"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { validateOutput } from "../skills/validator.js"
import type {
  DesignContext,
  ParsedFile,
  ParsedResponse,
} from "../skills/types.js"

export interface CIGateCheck {
  name: CIGateCheckName
  passed: boolean
  duration: number
  output?: string
  skipped?: boolean
}

export type CIGateCheckName =
  | "cardinalRules"
  | "auditCss"
  | "auditTokens"
  | "typecheck"
  | "tests"

export interface CIGateResult {
  passed: boolean
  checks: CIGateCheck[]
  totalDuration: number
}

export interface CIGateOptions {
  /** Stop on first failed check. Default true. */
  failFast?: boolean
  /** Promote audit:tokens to a blocking check. Default false (warn-only). */
  strict?: boolean
  /** Run the optional `tests` step. Default false. */
  runTests?: boolean
  /** Override the pnpm binary path. Default "pnpm" on $PATH. */
  pnpmBin?: string
  /** Test seam — inject a fake runner so unit tests avoid real subprocess. */
  runner?: SubprocessRunner
  /**
   * Optional path to a `design.md`-derived context object for the cardinal-rules
   * validator. Defaults to an empty context (validator falls back gracefully).
   */
  design?: DesignContext
  /**
   * Optional generated files to score against cardinal rules. When omitted the
   * gate scans the branch working tree for added/modified `.ts/.tsx/.css` files.
   */
  generatedFiles?: ParsedFile[]
}

export interface SubprocessResult {
  code: number
  stdout: string
  stderr: string
}

export type SubprocessRunner = (
  cmd: string,
  args: string[],
  cwd: string,
) => Promise<SubprocessResult>

const DEFAULT_DESIGN: DesignContext = {
  designContract: "",
  cardinalRules: "",
  voiceRules: "",
  manifest: null,
  layeredArchitecture: "",
  loadedSources: [],
  missingSources: [],
}

const SCANNABLE_EXT = new Set([".ts", ".tsx", ".css", ".jsx", ".js"])

export class CIGate {
  private readonly workspaceDir: string
  private readonly opts: CIGateOptions
  private readonly runner: SubprocessRunner

  constructor(workspaceDir: string, opts: CIGateOptions = {}) {
    this.workspaceDir = workspaceDir
    this.opts = opts
    this.runner = opts.runner ?? defaultRunner
  }

  /**
   * Run all gates sequentially against `branchName` (assumed already checked
   * out in the workspace). Returns a structured report; never throws on a
   * failing check — caller decides whether to publish.
   */
  async run(_branchName: string): Promise<CIGateResult> {
    const checks: CIGateCheck[] = []
    const failFast = this.opts.failFast ?? true
    const overallStart = performance.now()

    const append = (c: CIGateCheck): boolean => {
      checks.push(c)
      return c.passed
    }

    // 1. cardinalRules — validator.ts pure JS, no subprocess.
    const cardinalOk = append(await this.checkCardinalRules())
    if (!cardinalOk && failFast) return finalize(checks, overallStart)

    // 2. auditCss — strict (no hex allowed).
    const cssOk = append(
      await this.checkSubprocess("auditCss", [
        "--filter",
        "@dash/build",
        "audit:css:strict",
      ]),
    )
    if (!cssOk && failFast) return finalize(checks, overallStart)

    // 3. auditTokens — warn-only unless strict mode opts in.
    const tokensCheck = await this.checkSubprocess("auditTokens", [
      "--filter",
      "@dash/build",
      this.opts.strict ? "audit:tokens:strict" : "audit:tokens",
    ])
    // In non-strict mode this check NEVER blocks publish — convert to passed.
    if (!this.opts.strict && !tokensCheck.passed) {
      tokensCheck.passed = true
      tokensCheck.output =
        (tokensCheck.output ?? "") +
        "\n[ci-gate] audit:tokens warn-only mode — not blocking."
    }
    append(tokensCheck)
    if (this.opts.strict && !tokensCheck.passed && failFast) {
      return finalize(checks, overallStart)
    }

    // 4. typecheck — skippable via env.
    if (process.env.DASH_BUILD_CI_SKIP_TYPECHECK === "true") {
      append({
        name: "typecheck",
        passed: true,
        duration: 0,
        skipped: true,
        output: "DASH_BUILD_CI_SKIP_TYPECHECK=true — skipped.",
      })
    } else {
      const tcOk = append(
        await this.checkSubprocess("typecheck", [
          "--filter",
          "@dash/build",
          "typecheck",
        ]),
      )
      if (!tcOk && failFast) return finalize(checks, overallStart)
    }

    // 5. tests — OFF by default.
    if (this.opts.runTests) {
      const testsOk = append(
        await this.checkSubprocess("tests", [
          "--filter",
          "@dash/build",
          "test",
        ]),
      )
      if (!testsOk && failFast) return finalize(checks, overallStart)
    } else {
      append({
        name: "tests",
        passed: true,
        duration: 0,
        skipped: true,
        output:
          "Tests off by default (consumer-clone has no deps). Pass { runTests: true } to enable.",
      })
    }

    return finalize(checks, overallStart)
  }

  // ── Individual checks ────────────────────────────────────────────────────

  private async checkCardinalRules(): Promise<CIGateCheck> {
    const start = performance.now()
    try {
      const files =
        this.opts.generatedFiles ?? scanGeneratedFiles(this.workspaceDir)
      const parsed: ParsedResponse = {
        files,
        explanation: "",
      }
      const result = validateOutput(
        parsed,
        this.opts.design ?? DEFAULT_DESIGN,
        // Keep mode default ("generated"): we are validating BRANCH-LEVEL output,
        // not the daemon's own template literals (that is a separate audit).
      )
      const passed = result.passed
      const output = [
        `score: ${result.score}/100`,
        ...result.errors.map(
          (e) => `${e.severity.toUpperCase()} ${e.ruleId} ${e.file}: ${e.message}`,
        ),
        ...result.warnings.map((w) => `WARN ${w}`),
      ].join("\n")
      return {
        name: "cardinalRules",
        passed,
        duration: Math.round(performance.now() - start),
        output,
      }
    } catch (err) {
      return {
        name: "cardinalRules",
        passed: false,
        duration: Math.round(performance.now() - start),
        output: `cardinal-rules check threw: ${(err as Error).message}`,
      }
    }
  }

  private async checkSubprocess(
    name: CIGateCheckName,
    args: string[],
  ): Promise<CIGateCheck> {
    const start = performance.now()
    const cmd = this.opts.pnpmBin ?? "pnpm"
    try {
      const result = await this.runner(cmd, args, this.workspaceDir)
      return {
        name,
        passed: result.code === 0,
        duration: Math.round(performance.now() - start),
        output: trimOutput(result.stdout, result.stderr),
      }
    } catch (err) {
      return {
        name,
        passed: false,
        duration: Math.round(performance.now() - start),
        output: `${name} runner threw: ${(err as Error).message}`,
      }
    }
  }
}

function finalize(checks: CIGateCheck[], startMs: number): CIGateResult {
  const blockingChecks = checks.filter((c) => !c.skipped)
  const passed =
    blockingChecks.length === checks.filter((c) => !c.skipped).length &&
    blockingChecks.every((c) => c.passed)
  return {
    passed,
    checks,
    totalDuration: Math.round(performance.now() - startMs),
  }
}

function trimOutput(stdout: string, stderr: string): string {
  const blob = [stdout, stderr].filter((s) => s && s.length > 0).join("\n")
  if (blob.length <= 4000) return blob
  // Keep head + tail; CI noise in the middle is rarely useful.
  return `${blob.slice(0, 2000)}\n... [truncated ${blob.length - 4000} chars] ...\n${blob.slice(-2000)}`
}

/**
 * Walk the workspace looking for files we should run cardinal-rules against.
 * Skips node_modules, .git, dist, build, .next.
 */
function scanGeneratedFiles(root: string): ParsedFile[] {
  if (!existsSync(root)) return []
  const out: ParsedFile[] = []
  const SKIP_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
  ])
  const MAX_BYTES = 200_000

  const walk = (dir: string): void => {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      let stat: ReturnType<typeof statSync>
      try {
        stat = statSync(full)
      } catch {
        continue
      }
      if (stat.isDirectory()) {
        walk(full)
        continue
      }
      if (!stat.isFile()) continue
      const dot = entry.lastIndexOf(".")
      const ext = dot >= 0 ? entry.slice(dot) : ""
      if (!SCANNABLE_EXT.has(ext)) continue
      if (stat.size > MAX_BYTES) continue
      let content: string
      try {
        content = readFileSync(full, "utf8")
      } catch {
        continue
      }
      const rel = full.slice(root.length + 1)
      out.push({
        path: rel,
        content,
        language: ext.replace(".", ""),
      })
    }
  }
  walk(root)
  return out
}

/**
 * Default subprocess runner — spawn, capture both streams, resolve with exit
 * code. No shell. Inherits env from the daemon process.
 */
const defaultRunner: SubprocessRunner = (cmd, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (b) => {
      stdout += b.toString("utf8")
    })
    child.stderr.on("data", (b) => {
      stderr += b.toString("utf8")
    })
    child.on("error", (err) => reject(err))
    child.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }))
  })
