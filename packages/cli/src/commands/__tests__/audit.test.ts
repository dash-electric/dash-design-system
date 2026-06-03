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

describe("dashkit audit — collectAudit", () => {
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

describe("dashkit audit — runAudit JSON output", () => {
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

// ─────────────────────────────────────────────────────────────────────────────
// Layered Architecture rules (L-1 … L-7)
// ─────────────────────────────────────────────────────────────────────────────

describe("dashkit audit — Layered Architecture rules", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp("dash-audit-layer-")
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("L-1: flags Layer 1 primitive referencing --theme-accent- var", () => {
    writeFile(
      path.join(tmp, "registry", "dash", "ui", "button.tsx"),
      `import React from "react"
export const Button = () => <div style={{ color: "var(--theme-accent-500)" }} />
`,
    )
    // Control: same string in a non-Layer-1 file should NOT fire L-1.
    writeFile(
      path.join(tmp, "registry", "dash", "blocks", "shared", "stat.tsx"),
      `export const Stat = () => <div style={{ color: "var(--theme-accent-500)" }} />\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const l1 = report.findings.filter((f) => f.rule === "L-1")
    expect(l1.length).toBe(1)
    expect(l1[0].severity).toBe("high")
    expect(l1[0].file).toContain("ui/button.tsx")
  })

  it("L-2: flags theme importing from Layer 1 ui/", () => {
    writeFile(
      path.join(tmp, "registry", "dash", "themes", "ride", "theme.ts"),
      `import { Button } from "@/registry/dash/ui/button"\nexport const x = Button\n`,
    )
    writeFile(
      path.join(tmp, "registry", "dash", "themes", "logistic", "theme.ts"),
      `import { Btn } from "../../ui/button"\nexport const y = Btn\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const l2 = report.findings.filter((f) => f.rule === "L-2")
    expect(l2.length).toBe(2)
    expect(l2.every((f) => f.severity === "high")).toBe(true)
  })

  it("L-3: flags shared block importing product-specific code", () => {
    writeFile(
      path.join(tmp, "registry", "dash", "blocks", "shared", "stat-card-grid.tsx"),
      `import { RideThing } from "../ride/ride-thing"\nexport const x = RideThing\n`,
    )
    writeFile(
      path.join(tmp, "registry", "dash", "blocks", "shared", "ok.tsx"),
      `import { Button } from "@/registry/dash/ui/button"\nexport const y = Button\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const l3 = report.findings.filter((f) => f.rule === "L-3")
    expect(l3.length).toBe(1)
    expect(l3[0].file).toContain("shared/stat-card-grid.tsx")
  })

  it("L-4: flags ride block importing from logistic and vice versa", () => {
    writeFile(
      path.join(tmp, "registry", "dash", "blocks", "ride", "dispatch.tsx"),
      `import { Truck } from "@/registry/dash/blocks/logistic/truck"\nexport const x = Truck\n`,
    )
    writeFile(
      path.join(tmp, "registry", "dash", "blocks", "logistic", "route.tsx"),
      `import { Car } from "../ride/car"\nexport const y = Car\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const l4 = report.findings.filter((f) => f.rule === "L-4")
    const l4b = report.findings.filter((f) => f.rule === "L-4b")
    expect(l4.length).toBe(1)
    expect(l4b.length).toBe(1)
    expect(l4[0].file).toContain("ride/dispatch.tsx")
    expect(l4b[0].file).toContain("logistic/route.tsx")
  })

  it("L-5: warns on raw hex in theme examples but allows it in colors.css", () => {
    writeFile(
      path.join(tmp, "registry", "dash", "themes", "ride", "examples", "hero.tsx"),
      `export const Hero = () => <div style={{ background: "#ff0066" }} />\n`,
    )
    // Token definition file is allowlisted — should NOT fire.
    writeFile(
      path.join(tmp, "registry", "dash", "themes", "ride", "colors.css"),
      `:root { --theme-accent-500: #ff0066; }\n`,
    )
    const report = collectAudit({ cwd: tmp })
    const l5 = report.findings.filter((f) => f.rule === "L-5")
    expect(l5.length).toBe(1)
    expect(l5[0].severity).toBe("medium")
    expect(l5[0].file).toContain("examples/hero.tsx")
  })

  it("L-6: flags block registry entry missing meta.layer", () => {
    const registry = {
      name: "dash",
      items: [
        {
          name: "good-block",
          type: "registry:block",
          meta: { layer: 3, theme: "shared" },
          files: [{ path: "registry/dash/blocks/shared/good-block.tsx" }],
        },
        {
          name: "missing-layer-block",
          type: "registry:block",
          // No meta at all → L-6 fires.
          files: [{ path: "registry/dash/blocks/shared/missing.tsx" }],
        },
      ],
    }
    writeFile(
      path.join(tmp, "apps", "docs", "registry.json"),
      JSON.stringify(registry, null, 2),
    )
    const report = collectAudit({ cwd: tmp })
    const l6 = report.findings.filter((f) => f.rule === "L-6")
    expect(l6.length).toBe(1)
    expect(l6[0].severity).toBe("high")
    expect(l6[0].match).toBe("missing-layer-block")
  })

  it("L-7: flags block in blocks/ride/ with meta.theme: 'shared'", () => {
    const registry = {
      name: "dash",
      items: [
        {
          name: "ride-correct",
          type: "registry:block",
          meta: { layer: 3, theme: "ride" },
          files: [{ path: "registry/dash/blocks/ride/ride-correct.tsx" }],
        },
        {
          name: "ride-mismatch",
          type: "registry:block",
          meta: { layer: 3, theme: "shared" },
          files: [{ path: "registry/dash/blocks/ride/ride-mismatch.tsx" }],
        },
      ],
    }
    writeFile(
      path.join(tmp, "apps", "docs", "registry.json"),
      JSON.stringify(registry, null, 2),
    )
    const report = collectAudit({ cwd: tmp })
    const l7 = report.findings.filter((f) => f.rule === "L-7")
    expect(l7.length).toBe(1)
    expect(l7[0].severity).toBe("high")
    expect(l7[0].match).toBe("ride-mismatch")
    expect(l7[0].label).toContain("expected \"ride\"")
  })

  it("--layer-only filters out non-layer rules", () => {
    writeFile(
      path.join(tmp, "src", "X.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    writeFile(
      path.join(tmp, "registry", "dash", "ui", "button.tsx"),
      `export const Button = () => <div style={{ color: "var(--theme-accent-500)" }} />\n`,
    )
    const report = collectAudit({ cwd: tmp, layerOnly: true })
    const ruleIds = new Set(report.findings.map((f) => f.rule))
    expect(ruleIds.has("no-rhf")).toBe(false)
    expect(ruleIds.has("L-1")).toBe(true)
  })

  it("--only layer scopes to the layer category", () => {
    writeFile(
      path.join(tmp, "src", "X.tsx"),
      `import { useForm } from "react-hook-form"\n`,
    )
    writeFile(
      path.join(tmp, "registry", "dash", "ui", "button.tsx"),
      `export const Button = () => <div style={{ color: "var(--theme-accent-500)" }} />\n`,
    )
    const report = collectAudit({ cwd: tmp, only: "layer" })
    const ruleIds = new Set(report.findings.map((f) => f.rule))
    expect(ruleIds.has("no-rhf")).toBe(false)
    expect(ruleIds.has("L-1")).toBe(true)
  })

  it("--explain-layer prints summary without scanning", () => {
    const origLog = console.log
    const chunks: string[] = []
    console.log = (...args: unknown[]) => {
      chunks.push(args.map(String).join(" "))
    }
    process.exitCode = 0
    try {
      runAudit({ cwd: tmp, explainLayer: true })
      const out = chunks.join("\n")
      expect(out).toContain("Layered Architecture")
      expect(out).toContain("L-1")
      expect(out).toContain("L-7")
      expect(process.exitCode).toBe(0)
    } finally {
      console.log = origLog
    }
  })
})
