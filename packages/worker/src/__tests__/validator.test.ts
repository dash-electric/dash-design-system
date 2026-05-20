import { describe, it, expect } from "vitest"
import { computeScore, validateGenerated } from "../validator.js"
import type { GapEntry } from "../gap-queue.js"

function gap(overrides: Partial<GapEntry> = {}): GapEntry {
  return {
    id: "gap_test_1",
    created_at: new Date().toISOString(),
    description: overrides.description ?? "no image-editor in DS",
    severity: "high",
    repo: "halo-dash-fe",
    prompt: null,
    generated_block_path: null,
    status: "pending",
    ...overrides,
  }
}

describe("computeScore", () => {
  it("awards full marks for a clean Dash-compliant block", () => {
    const source = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function ImageEditorWithAudit() {
        const [reason, setReason] = useState("")
        return <div className="bg-bg-weak-50 text-text-strong-950">
          <Button>Anda</Button>
          {/* AUDIT TRAIL: original + edited + editor + reason */}
        </div>
      }
    `
    const { score, criteria } = computeScore({
      source,
      description: "no image-editor for mitra proof upload",
    })
    expect(score).toBe(100)
    expect(criteria.every((c) => c.passed)).toBe(true)
  })

  it("penalises banned imports (react-hook-form)", () => {
    const source = `
      import { useForm } from "react-hook-form"
      import { Button } from "@/registry/dash/ui/button"
      export function X() { return <div className="bg-primary-500" /> }
    `
    const { score, criteria } = computeScore({
      source,
      description: "generic block",
    })
    const handRolled = criteria.find((c) => c.id === "hand-rolled-state")
    expect(handRolled?.passed).toBe(false)
    expect(score).toBeLessThan(100)
  })

  it("penalises raw hex colors", () => {
    const source = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function X() {
        useState(0)
        return <div style={{ color: "#5e2aac" }} className="bg-primary-500">x</div>
      }
    `
    const { criteria } = computeScore({ source, description: "generic" })
    const tokens = criteria.find((c) => c.id === "dash-tokens")
    expect(tokens?.passed).toBe(false)
  })

  it("requires audit trail when description is legal/financial", () => {
    const sourceNoAudit = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function X() { useState(0); return <div className="bg-primary-500" /> }
    `
    const result = computeScore({
      source: sourceNoAudit,
      description: "signature pad for mitra",
    })
    const audit = result.criteria.find((c) => c.id === "audit-trail")
    expect(audit?.passed).toBe(false)
  })

  it("waives audit trail when description is not legal/financial", () => {
    const source = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function X() { useState(0); return <div className="bg-primary-500" /> }
    `
    const { criteria } = computeScore({
      source,
      description: "settings panel toggle",
    })
    const audit = criteria.find((c) => c.id === "audit-trail")
    expect(audit?.passed).toBe(true)
  })

  it("requires formal Anda for mitra-facing descriptions", () => {
    const source = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function X() {
        useState(0)
        return <Button className="bg-primary-500 text-text-strong-950">kamu pilih</Button>
      }
    `
    const { criteria } = computeScore({
      source,
      description: "mitra dashboard greeting",
    })
    const voice = criteria.find((c) => c.id === "formal-voice")
    expect(voice?.passed).toBe(false)
  })
})

describe("validateGenerated", () => {
  it("skips command gates by default and returns the heuristic score", async () => {
    const source = `
      import { useState } from "react"
      import { Button } from "@/registry/dash/ui/button"
      export function X() { useState(0); return <Button className="bg-primary-500 text-text-strong-950" /> }
    `
    const result = await validateGenerated(gap(), source)
    expect(result.typecheckPassed).toBe(true)
    expect(result.testsPassed).toBe(true)
    expect(result.auditClean).toBe(true)
    expect(result.score).toBeGreaterThan(50)
  })

  it("runs command gates when skipCommandGates is false", async () => {
    const calls: string[] = []
    const fakeRunner = async (
      cmd: string,
      args: string[],
    ): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
      calls.push(`${cmd} ${args.join(" ")}`)
      return { exitCode: 0, stdout: "", stderr: "" }
    }
    const source = `import { useState } from "react"; export function X() { useState(0); return null }`
    const result = await validateGenerated(gap(), source, {
      skipCommandGates: false,
      runCommand: fakeRunner,
      repoRoot: "/tmp/fake",
    })
    expect(result.typecheckPassed).toBe(true)
    expect(result.testsPassed).toBe(true)
    expect(result.auditClean).toBe(true)
    expect(calls.length).toBe(3)
  })

  it("marks gates as failed when subprocesses exit non-zero", async () => {
    const fakeRunner = async (
      _cmd: string,
      args: string[],
    ): Promise<{ exitCode: number; stdout: string; stderr: string }> => ({
      exitCode: args.includes("test") ? 1 : 0,
      stdout: "",
      stderr: "",
    })
    const result = await validateGenerated(gap(), `export function X() {}`, {
      skipCommandGates: false,
      runCommand: fakeRunner,
    })
    expect(result.testsPassed).toBe(false)
    expect(result.typecheckPassed).toBe(true)
  })
})
