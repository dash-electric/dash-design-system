import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  CIGate,
  type SubprocessResult,
  type SubprocessRunner,
} from "../ci-gate.js"

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-ci-gate-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
  delete process.env.DASH_BUILD_CI_SKIP_TYPECHECK
})

interface RecordedCall {
  cmd: string
  args: string[]
  cwd: string
}

function makeRunner(
  responses: Partial<Record<string, SubprocessResult>>,
  recorded: RecordedCall[],
): SubprocessRunner {
  return async (cmd, args, cwd) => {
    recorded.push({ cmd, args, cwd })
    // Key on the trailing script name (e.g. "audit:css:strict", "typecheck").
    const key = args[args.length - 1] ?? ""
    return (
      responses[key] ?? {
        code: 0,
        stdout: "",
        stderr: "",
      }
    )
  }
}

async function writeClean(file: string, content: string): Promise<void> {
  const full = join(dir, file)
  const parent = full.slice(0, full.lastIndexOf("/"))
  await mkdir(parent, { recursive: true })
  await writeFile(full, content, "utf8")
}

describe("CIGate", () => {
  it("runs all 5 checks when everything passes (with tests opted in)", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner({}, calls)
    const gate = new CIGate(dir, { runner, runTests: true })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(true)
    const names = result.checks.map((c) => c.name)
    expect(names).toEqual([
      "cardinalRules",
      "auditCss",
      "auditTokens",
      "typecheck",
      "tests",
    ])
    expect(result.totalDuration).toBeGreaterThanOrEqual(0)
    // Subprocess called 4 times (cardinalRules is in-process).
    expect(calls).toHaveLength(4)
    // Each invocation should target the workspace dir.
    for (const c of calls) {
      expect(c.cwd).toBe(dir)
      expect(c.cmd).toBe("pnpm")
    }
  })

  it("fails fast on auditCss failure (default failFast=true)", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner(
      {
        "audit:css:strict": { code: 1, stdout: "5 hex literals", stderr: "" },
      },
      calls,
    )
    const gate = new CIGate(dir, { runner, runTests: true })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(false)
    const names = result.checks.map((c) => c.name)
    expect(names).toEqual(["cardinalRules", "auditCss"])
    // Should not have invoked typecheck or tests after fail-fast.
    expect(calls.map((c) => c.args[c.args.length - 1])).toEqual([
      "audit:css:strict",
    ])
  })

  it("auditTokens is warn-only by default (does not block)", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner(
      {
        "audit:tokens": { code: 1, stdout: "12 raw tokens", stderr: "" },
      },
      calls,
    )
    const gate = new CIGate(dir, { runner })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(true)
    const tokens = result.checks.find((c) => c.name === "auditTokens")
    expect(tokens?.passed).toBe(true)
    expect(tokens?.output ?? "").toContain("warn-only mode")
  })

  it("auditTokens BLOCKS publish when strict=true", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner(
      {
        "audit:tokens:strict": { code: 1, stdout: "12 raw tokens", stderr: "" },
      },
      calls,
    )
    const gate = new CIGate(dir, { runner, strict: true })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(false)
    const tokens = result.checks.find((c) => c.name === "auditTokens")
    expect(tokens?.passed).toBe(false)
    // Fail-fast: typecheck NOT invoked.
    expect(calls.find((c) => c.args.includes("typecheck"))).toBeUndefined()
  })

  it("respects DASH_BUILD_CI_SKIP_TYPECHECK env (marks typecheck skipped)", async () => {
    process.env.DASH_BUILD_CI_SKIP_TYPECHECK = "true"
    const calls: RecordedCall[] = []
    const runner = makeRunner({}, calls)
    const gate = new CIGate(dir, { runner })
    const result = await gate.run("dash-build/run123")
    const tc = result.checks.find((c) => c.name === "typecheck")
    expect(tc?.skipped).toBe(true)
    expect(tc?.passed).toBe(true)
    // typecheck should NOT have run as a subprocess.
    expect(calls.find((c) => c.args.includes("typecheck"))).toBeUndefined()
  })

  it("tests step is skipped by default", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner({}, calls)
    const gate = new CIGate(dir, { runner })
    const result = await gate.run("dash-build/run123")
    const tests = result.checks.find((c) => c.name === "tests")
    expect(tests?.skipped).toBe(true)
    expect(calls.find((c) => c.args.includes("test"))).toBeUndefined()
  })

  it("flags cardinal-rules failure when generated files include banned imports", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner({}, calls)
    const gate = new CIGate(dir, {
      runner,
      // Inject a synthetic generated file with a banned import (react-hook-form).
      generatedFiles: [
        {
          path: "src/feature.tsx",
          language: "tsx",
          content:
            "import { useForm } from 'react-hook-form'\nexport function X(){ return <div/> }",
        },
      ],
    })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(false)
    const cr = result.checks.find((c) => c.name === "cardinalRules")
    expect(cr?.passed).toBe(false)
    expect(cr?.output ?? "").toContain("react-hook-form")
  })

  it("scans the workspace for files when generatedFiles not supplied", async () => {
    // Use a Dash semantic token so cross-file CR-5 check passes for the tsx.
    await writeClean(
      "src/clean.tsx",
      "export const A = () => <div className=\"bg-primary-500 text-text-strong-950\" />\n",
    )
    const calls: RecordedCall[] = []
    const runner = makeRunner({}, calls)
    const gate = new CIGate(dir, { runner })
    const result = await gate.run("dash-build/run123")
    // Clean file (no banned imports / no hex / has Dash tokens) → cardinal pass.
    const cr = result.checks.find((c) => c.name === "cardinalRules")
    expect(cr?.passed).toBe(true)
  })

  it("non-failFast mode collects all results", async () => {
    const calls: RecordedCall[] = []
    const runner = makeRunner(
      {
        "audit:css:strict": { code: 1, stdout: "fail", stderr: "" },
        typecheck: { code: 1, stdout: "ts error", stderr: "" },
      },
      calls,
    )
    const gate = new CIGate(dir, { runner, failFast: false, runTests: true })
    const result = await gate.run("dash-build/run123")
    expect(result.passed).toBe(false)
    // All 5 checks should have been attempted.
    expect(result.checks).toHaveLength(5)
  })
})
