import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { beforeEach, describe, expect, it } from "vitest"
import {
  loadExistingFilesContext,
  loadFilesForPrompt,
  readExistingFile,
} from "../existing-file-reader.js"
import type { PathResolution, RepoContextPack } from "../types.js"

let workDir: string

function writeFile(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

beforeEach(() => {
  workDir = mkdtempSync(path.join(tmpdir(), "dash-file-reader-"))
})

describe("readExistingFile", () => {
  it("reads a small file verbatim and reports language", async () => {
    const file = path.join(workDir, "small.tsx")
    writeFile(file, "export const x = 1\n")
    const result = await readExistingFile(file)
    expect(result).not.toBeNull()
    expect(result!.content).toBe("export const x = 1\n")
    expect(result!.language).toBe("tsx")
    expect(result!.truncated).toBe(false)
    expect(result!.fullSize).toBeGreaterThan(0)
  })

  it("returns null for missing files (never throws)", async () => {
    const result = await readExistingFile(path.join(workDir, "missing.ts"))
    expect(result).toBeNull()
  })

  it("returns null for forbidden path segments", async () => {
    const file = path.join(workDir, "node_modules", "leak.ts")
    writeFile(file, "secret")
    const result = await readExistingFile(file)
    expect(result).toBeNull()
  })

  it("truncates large files keeping head + tail", async () => {
    const file = path.join(workDir, "big.tsx")
    const lines: string[] = []
    for (let i = 0; i < 1000; i++) lines.push(`line ${i}: ${"x".repeat(50)}`)
    writeFile(file, lines.join("\n"))
    // Budget needs to fit 20 head + 10 tail × ~57 bytes ≈ 1.7KB + marker.
    const result = await readExistingFile(file, {
      maxBytes: 4096,
      headLines: 20,
      tailLines: 10,
    })
    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(true)
    expect(result!.content).toContain("[truncated")
    // Head: should mention "line 0"
    expect(result!.content).toContain("line 0:")
    // Tail: should mention final lines
    expect(result!.content).toContain(`line ${1000 - 1}:`)
  })

  it("scales head + tail down when both would blow the byte budget", async () => {
    const file = path.join(workDir, "tight.tsx")
    const lines: string[] = []
    for (let i = 0; i < 200; i++) lines.push(`line ${i}: ${"x".repeat(50)}`)
    writeFile(file, lines.join("\n"))
    // Cap too tight for 50 + 50 lines — should auto-shrink but still keep ≥1
    // head + ≥1 tail line and the truncation marker.
    const result = await readExistingFile(file, {
      maxBytes: 512,
      headLines: 50,
      tailLines: 50,
    })
    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(true)
    expect(result!.content).toContain("[truncated")
    expect(result!.content).toContain("line 0:")
    expect(result!.content).toContain(`line ${200 - 1}:`)
    expect(Buffer.byteLength(result!.content, "utf-8")).toBeLessThanOrEqual(
      512 + 200, // marker slack
    )
  })

  it("respects byte cap even when line cap alone wouldn't truncate enough", async () => {
    const file = path.join(workDir, "longline.ts")
    // Few long lines — line count under default head+tail
    writeFile(file, "x".repeat(20000))
    const result = await readExistingFile(file, { maxBytes: 500 })
    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(true)
    expect(Buffer.byteLength(result!.content, "utf-8")).toBeLessThanOrEqual(
      500 + 200, // marker tail allowance
    )
  })

  it("detects common languages by extension", async () => {
    const cases: Array<[string, string]> = [
      ["a.ts", "ts"],
      ["a.tsx", "tsx"],
      ["a.js", "js"],
      ["a.jsx", "jsx"],
      ["a.css", "css"],
      ["a.scss", "scss"],
      ["a.json", "json"],
      ["a.md", "md"],
      ["a.mjs", "js"],
      ["a.cjs", "js"],
      ["a.weird", "unknown"],
    ]
    for (const [filename, expected] of cases) {
      const file = path.join(workDir, filename)
      writeFile(file, "x")
      const result = await readExistingFile(file)
      expect(result!.language).toBe(expected)
    }
  })

  it("returns null when given a directory (not a file)", async () => {
    mkdirSync(path.join(workDir, "adir"))
    const result = await readExistingFile(path.join(workDir, "adir"))
    expect(result).toBeNull()
  })
})

describe("loadFilesForPrompt", () => {
  it("reads top-N candidates by confidence, dropping nulls", async () => {
    const f1 = path.join(workDir, "a.tsx")
    const f2 = path.join(workDir, "b.tsx")
    writeFile(f1, "alpha")
    writeFile(f2, "beta")
    const resolutions: PathResolution[] = [
      { filePath: f1, route: "/a", confidence: 0.9, reason: "x" },
      { filePath: f2, route: "/b", confidence: 0.8, reason: "x" },
      {
        filePath: path.join(workDir, "missing.tsx"),
        route: "/c",
        confidence: 0.7,
        reason: "x",
      },
    ]
    const files = await loadFilesForPrompt(resolutions, { topN: 5 })
    expect(files).toHaveLength(2)
    expect(files[0]!.filePath).toBe(f1)
    expect(files[1]!.filePath).toBe(f2)
  })

  it("honours topN cap (default 3)", async () => {
    const paths: string[] = []
    for (let i = 0; i < 6; i++) {
      const p = path.join(workDir, `f${i}.tsx`)
      writeFile(p, `content-${i}`)
      paths.push(p)
    }
    const resolutions: PathResolution[] = paths.map((p, i) => ({
      filePath: p,
      route: `/r${i}`,
      confidence: (10 - i) / 10,
      reason: "x",
    }))
    const files = await loadFilesForPrompt(resolutions)
    expect(files).toHaveLength(3)
  })

  it("de-dupes when multiple routes resolve to same file", async () => {
    const f1 = path.join(workDir, "shared.tsx")
    writeFile(f1, "shared")
    const resolutions: PathResolution[] = [
      { filePath: f1, route: "/a", confidence: 0.9, reason: "x" },
      { filePath: f1, route: "/b", confidence: 0.85, reason: "x" },
    ]
    const files = await loadFilesForPrompt(resolutions, { topN: 5 })
    expect(files).toHaveLength(1)
  })

  it("returns empty array on empty input", async () => {
    expect(await loadFilesForPrompt([])).toEqual([])
  })
})

describe("loadExistingFilesContext (chain entry)", () => {
  it("returns empty context when prompt has no route + no targetRoute", async () => {
    const ctx: RepoContextPack = {
      selectedRepo: "dash/backoffice",
      repoSlug: "backoffice",
      theme: "ride",
      audience: "x",
      surface: "backoffice",
      existingShell: true,
      requiresNavOrRoute: false,
      defaultRoute: null,
      targetRoute: null,
      targetNavLabel: null,
      existingNavItems: [],
      routeRequirement: null,
      integrationContract: "x",
      dataPolicy: "mock-data-only",
      ambiguity: null,
    }
    const result = await loadExistingFilesContext({
      prompt: "do something",
      contextPack: ctx,
      repoRoot: workDir,
    })
    expect(result.resolutions).toEqual([])
    expect(result.files).toEqual([])
  })

  it("returns resolved files when prompt mentions a real route", async () => {
    // Scaffold a backoffice-shaped fe dir inside workDir
    const fe = path.join(workDir, "next-backoffice-web")
    writeFile(
      path.join(fe, "src", "pages", "provider", "index.js"),
      "export default function ProviderPage(){return null}\n",
    )
    const ctx: RepoContextPack = {
      selectedRepo: "dash/backoffice",
      repoSlug: "backoffice",
      theme: "ride",
      audience: "x",
      surface: "backoffice",
      existingShell: true,
      requiresNavOrRoute: false,
      defaultRoute: "/delivery",
      targetRoute: "/provider",
      targetNavLabel: "Mitra",
      existingNavItems: [],
      routeRequirement: null,
      integrationContract: "x",
      dataPolicy: "mock-data-only",
      ambiguity: null,
    }
    const result = await loadExistingFilesContext({
      prompt: "tambah filter di /provider",
      contextPack: ctx,
      repoRoot: fe,
    })
    expect(result.resolutions.length).toBeGreaterThan(0)
    expect(result.files.length).toBeGreaterThan(0)
    expect(result.files[0]!.content).toContain("ProviderPage")
  })

  it("swallows resolver errors and returns empty context", async () => {
    const ctx: RepoContextPack = {
      selectedRepo: null,
      repoSlug: "unknown",
      theme: "shared",
      audience: "x",
      surface: "x",
      existingShell: false,
      requiresNavOrRoute: false,
      defaultRoute: null,
      targetRoute: null,
      targetNavLabel: null,
      existingNavItems: [],
      routeRequirement: null,
      integrationContract: "x",
      dataPolicy: "mock-data-only",
      ambiguity: null,
    }
    const result = await loadExistingFilesContext({
      prompt: "tambah /provider",
      contextPack: ctx,
      // Force a path that doesn't exist
      repoRoot: path.join(workDir, "absolutely-missing"),
    })
    expect(result.resolutions).toEqual([])
    expect(result.files).toEqual([])
  })
})
