import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { collectAudit, runAudit } from "../audit.js"

function mkTmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function writeFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

describe("dash audit — collectAudit", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp("dash-audit-")
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("returns 0 findings for a clean repo", () => {
    writeFile(
      path.join(tmp, "src", "Hello.tsx"),
      `import React from "react"\nexport const Hello = () => <div>hello</div>\n`,
    )
    writeFile(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "clean-repo" }),
    )
    const report = collectAudit({ cwd: tmp })
    expect(report.summary.high).toBe(0)
    expect(report.summary.medium).toBe(0)
    expect(report.findings).toHaveLength(0)
    expect(report.scannedFiles).toBeGreaterThan(0)
    expect(report.repo).toBe(path.basename(tmp))
  })

  it("flags a single react-hook-form value import as one HIGH finding", () => {
    writeFile(
      path.join(tmp, "src", "components", "RepoModal.tsx"),
      [
        `import React from "react"`,
        `import { useForm } from "react-hook-form"`,
        `export const RepoModal = () => null`,
      ].join("\n"),
    )
    const report = collectAudit({ cwd: tmp })
    expect(report.summary.high).toBe(1)
    expect(report.summary.medium).toBe(0)
    const f = report.findings[0]
    expect(f.rule).toBe("no-rhf")
    expect(f.severity).toBe("high")
    expect(f.line).toBe(2)
    expect(f.file).toContain("RepoModal.tsx")
  })

  it("allows type-only zod imports but flags value imports", () => {
    writeFile(
      path.join(tmp, "src", "ok.tsx"),
      `import type { z } from "zod"\nexport const x = 1\n`,
    )
    writeFile(
      path.join(tmp, "src", "bad.tsx"),
      `import { z } from "zod"\nexport const y = 1\n`,
    )
    const report = collectAudit({ cwd: tmp })
    expect(report.summary.high).toBe(1)
    expect(report.findings[0].file).toContain("bad.tsx")
    expect(report.findings[0].rule).toBe("no-zod")
  })

  it("reports both HIGH (import) and MEDIUM (inline-style threshold) drift", () => {
    writeFile(
      path.join(tmp, "src", "Form.tsx"),
      [
        `import { useForm } from "react-hook-form"`,
        // 11 inline styles -> over warnAboveCount=10
        ...Array.from({ length: 11 }, (_, i) => `const s${i} = <div style={{color: 'red'}}/>`),
      ].join("\n"),
    )
    const report = collectAudit({ cwd: tmp })
    expect(report.summary.high).toBeGreaterThanOrEqual(1)
    expect(report.summary.medium).toBeGreaterThanOrEqual(1)
    const ruleIds = new Set(report.findings.map((f) => f.rule))
    expect(ruleIds.has("no-rhf")).toBe(true)
    expect(ruleIds.has("inline-style-prop")).toBe(true)
  })

  it("does NOT flag inline-style when count is at or below threshold (10)", () => {
    writeFile(
      path.join(tmp, "src", "Few.tsx"),
      Array.from({ length: 10 }, () => `const x = <div style={{color: 'red'}}/>`).join("\n"),
    )
    const report = collectAudit({ cwd: tmp })
    const inline = report.findings.find((f) => f.rule === "inline-style-prop")
    expect(inline).toBeUndefined()
  })

  it("does NOT flag hex colors under tokens/", () => {
    writeFile(
      path.join(tmp, "src", "tokens", "colors.tsx"),
      `export const accent = "#FF8800"\n`,
    )
    writeFile(
      path.join(tmp, "src", "components", "Foo.tsx"),
      `export const accent = "#FF8800"\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const hex = report.findings.filter((f) => f.rule === "off-token-hex")
    expect(hex).toHaveLength(1)
    expect(hex[0].file).toContain("components/Foo.tsx")
  })

  it("skips node_modules and dist", () => {
    writeFile(
      path.join(tmp, "node_modules", "evil", "a.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    writeFile(
      path.join(tmp, "dist", "b.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    writeFile(
      path.join(tmp, "src", "ok.tsx"),
      `export const x = 1\n`,
    )
    const report = collectAudit({ cwd: tmp })
    expect(report.summary.high).toBe(0)
  })

  it("--only imports limits checks to the imports category", () => {
    writeFile(
      path.join(tmp, "src", "Mixed.tsx"),
      [
        `import { useForm } from "react-hook-form"`,
        // many inline styles to ensure they'd otherwise fire
        ...Array.from({ length: 20 }, () => `const x = <div style={{color: 'red'}}/>`),
      ].join("\n"),
    )
    const report = collectAudit({ cwd: tmp, only: "imports" })
    expect(report.summary.high).toBe(1)
    expect(report.summary.medium).toBe(0)
  })

  it("--only style restricts to style rules", () => {
    writeFile(
      path.join(tmp, "src", "Comp.tsx"),
      [
        `import { useForm } from "react-hook-form"`,
        `const c = "#abcdef"`,
      ].join("\n"),
    )
    const report = collectAudit({ cwd: tmp, only: "style" })
    expect(report.summary.high).toBe(0)
    expect(report.summary.medium).toBe(1)
    expect(report.findings[0].rule).toBe("off-token-hex")
  })
})

describe("dash audit — runAudit JSON output", () => {
  let tmp: string
  let stdoutChunks: string[]
  let writeSpy: typeof process.stdout.write
  let prevExitCode: number | undefined

  beforeEach(() => {
    tmp = mkTmp("dash-audit-json-")
    stdoutChunks = []
    writeSpy = process.stdout.write
    process.stdout.write = ((chunk: string | Uint8Array) => {
      stdoutChunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString())
      return true
    }) as typeof process.stdout.write
    prevExitCode = process.exitCode
    process.exitCode = 0
  })

  afterEach(() => {
    process.stdout.write = writeSpy
    process.exitCode = prevExitCode
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("emits valid JSON when --json is set", () => {
    writeFile(
      path.join(tmp, "src", "X.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    runAudit({ cwd: tmp, json: true, path: tmp })
    const out = stdoutChunks.join("")
    const parsed = JSON.parse(out)
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.summary.high).toBe(1)
    expect(Array.isArray(parsed.findings)).toBe(true)
    expect(parsed.findings[0].rule).toBe("no-rhf")
  })

  it("--fail-on-error sets exitCode=1 on HIGH drift", () => {
    writeFile(
      path.join(tmp, "src", "X.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    runAudit({ cwd: tmp, json: true, failOnError: true, path: tmp })
    expect(process.exitCode).toBe(1)
  })

  it("--fail-on-error leaves exitCode=0 on clean repo", () => {
    writeFile(path.join(tmp, "src", "X.tsx"), `export const x = 1\n`)
    runAudit({ cwd: tmp, json: true, failOnError: true, path: tmp })
    expect(process.exitCode).toBe(0)
  })

  it("rejects unknown --only value with non-zero exit", () => {
    const origError = console.error
    const errChunks: string[] = []
    console.error = (...args: unknown[]) => {
      errChunks.push(args.map(String).join(" "))
    }
    try {
      runAudit({ cwd: tmp, only: "does-not-exist" })
      expect(process.exitCode).toBe(1)
      expect(errChunks.join("")).toContain("unknown --only")
    } finally {
      console.error = origError
    }
  })
})
