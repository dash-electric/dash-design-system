import { describe, expect, it } from "vitest"
import { validateOutput } from "../validator.js"
import type { DesignContext, ParsedResponse } from "../types.js"

const EMPTY_DESIGN: DesignContext = {
  designContract: "",
  cardinalRules: "",
  voiceRules: "",
  manifest: null,
  layeredArchitecture: "",
  loadedSources: ["x"],
  missingSources: [],
}

function parsed(files: Array<{ path: string; language?: string; content: string }>): ParsedResponse {
  return {
    files: files.map((f) => ({ language: f.language ?? "tsx", ...f })),
    explanation: "",
  }
}

describe("validateOutput", () => {
  it("passes for clean Dash code", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content:
            'import { useState } from "react"\nexport const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.passed).toBe(true)
    expect(r.score).toBeGreaterThan(80)
    expect(r.errors).toHaveLength(0)
  })

  it("flags react-hook-form as high severity", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/form.tsx",
          content: 'import { useForm } from "react-hook-form"\nexport const F = () => null',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.passed).toBe(false)
    expect(r.errors.some((e) => e.message.includes("react-hook-form"))).toBe(true)
  })

  it("flags zod, swr, react-query, @hookform/resolvers", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/bad.ts",
          language: "ts",
          content: [
            'import { z } from "zod"',
            'import useSWR from "swr"',
            'import { useQuery } from "@tanstack/react-query"',
            'import { zodResolver } from "@hookform/resolvers/zod"',
          ].join("\n"),
        },
      ]),
      EMPTY_DESIGN,
    )
    const banned = r.errors.filter((e) => e.severity === "high").map((e) => e.message)
    expect(banned.some((m) => m.includes("zod"))).toBe(true)
    expect(banned.some((m) => m.includes("swr"))).toBe(true)
    expect(banned.some((m) => m.includes("@tanstack/react-query"))).toBe(true)
    expect(banned.some((m) => m.includes("@hookform/resolvers"))).toBe(true)
    expect(r.passed).toBe(false)
  })

  it("flags raw hex with medium severity", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: 'export const X = () => <div style={{ color: "#5e2aac" }} className="bg-primary-500 text-text-strong-950">X</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.ruleId === "CR-5" && e.message.includes("hex"))).toBe(true)
    expect(r.passed).toBe(true) // medium does NOT block
    expect(r.score).toBeLessThan(100)
  })

  it("flags casual voice particle as medium when mitra mentioned", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/mitra.tsx",
          content:
            'export const M = () => <div className="bg-primary-500 text-text-strong-950">Yuk lengkapin data mitra kamu</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.ruleId === "CR-4")).toBe(true)
    expect(r.errors.find((e) => e.ruleId === "CR-4")?.severity).toBe("medium")
  })

  it("flags casual voice as low when no mitra context", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/util.tsx",
          content: 'export const Greet = () => <div className="bg-primary-500 text-text-strong-950">yuk klik</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.find((e) => e.ruleId === "CR-4")?.severity).toBe("low")
  })

  it("warns when no Dash tokens are present in any TSX file", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: "export const X = () => <div>plain</div>",
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.message.includes("No Dash semantic tokens"))).toBe(true)
  })

  it("emits a TODO warning without deducting score", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content:
            '// TODO: wire endpoint\nexport const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.warnings.some((w) => w.includes("TODO"))).toBe(true)
    expect(r.passed).toBe(true)
  })

  it("surfaces degraded design context as a warning", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: 'export const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      { ...EMPTY_DESIGN, missingSources: ["x", "y"] },
    )
    expect(r.warnings.some((w) => w.toLowerCase().includes("degraded"))).toBe(true)
  })

  it("clamps score to 0 floor on heavy violations", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: [
            'import { useForm } from "react-hook-form"',
            'import { z } from "zod"',
            'import useSWR from "swr"',
            'import { useQuery } from "@tanstack/react-query"',
            'import { zodResolver } from "@hookform/resolvers/zod"',
            'export const X = () => <div style={{ color: "#fff", background: "#5e2aac" }}>kamu</div>',
          ].join("\n"),
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })
})
