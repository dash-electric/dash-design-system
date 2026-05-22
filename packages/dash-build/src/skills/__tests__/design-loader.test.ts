import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { findRepoRoot, loadDesignContext } from "../design-loader.js"

let workdir: string

beforeEach(async () => {
  workdir = await mkdtemp(path.join(tmpdir(), "design-loader-"))
})

afterEach(async () => {
  await rm(workdir, { recursive: true, force: true })
})

async function seedFoundation(
  root: string,
  opts: { design?: string; cardinal?: string; voice?: string; manifest?: object; layered?: string } = {},
) {
  const fdir = path.join(root, "apps", "docs", "registry", "dash", "foundation")
  await mkdir(path.join(fdir, "rules"), { recursive: true })
  await mkdir(path.join(fdir, "voice"), { recursive: true })
  if (opts.design !== undefined) {
    await writeFile(path.join(root, "design.md"), opts.design)
  }
  if (opts.cardinal !== undefined) {
    await writeFile(path.join(fdir, "rules", "cardinal-rules.md"), opts.cardinal)
  }
  if (opts.voice !== undefined) {
    await writeFile(path.join(fdir, "voice", "voice-rules.md"), opts.voice)
  }
  if (opts.manifest !== undefined) {
    await writeFile(path.join(fdir, "manifest.json"), JSON.stringify(opts.manifest))
  }
  if (opts.layered !== undefined) {
    await writeFile(path.join(root, "LAYERED-ARCHITECTURE.md"), opts.layered)
  }
}

describe("findRepoRoot", () => {
  it("returns the dir containing apps/docs/registry/dash/foundation", async () => {
    await mkdir(path.join(workdir, "apps", "docs", "registry", "dash", "foundation"), {
      recursive: true,
    })
    const sub = path.join(workdir, "packages", "x", "src")
    await mkdir(sub, { recursive: true })
    expect(findRepoRoot(sub)).toBe(workdir)
  })
})

describe("loadDesignContext", () => {
  it("loads the design contract plus all foundation files when present", async () => {
    await seedFoundation(workdir, {
      design: "# Dash Design Contract\n\nOperational density",
      cardinal: "# Cardinal Rules\n\nCR-1...",
      voice: "# Voice Rules\n\nformal Anda",
      manifest: { schemaVersion: 1, name: "@dash/foundation", version: "0.1.0" },
      layered: "# Layered Architecture",
    })
    const ctx = await loadDesignContext({ repoRoot: workdir })
    expect(ctx.designContract).toContain("Operational density")
    expect(ctx.cardinalRules).toContain("CR-1")
    expect(ctx.voiceRules).toContain("formal Anda")
    expect(ctx.manifest?.name).toBe("@dash/foundation")
    expect(ctx.layeredArchitecture).toContain("Layered Architecture")
    expect(ctx.loadedSources.length).toBe(5)
    expect(ctx.missingSources).toEqual([])
  })

  it("degrades gracefully when foundation directory is absent", async () => {
    const ctx = await loadDesignContext({ repoRoot: workdir })
    expect(ctx.cardinalRules).toBe("")
    expect(ctx.voiceRules).toBe("")
    expect(ctx.manifest).toBeNull()
    expect(ctx.layeredArchitecture).toMatch(/Layered Architecture/)
    expect(ctx.missingSources.length).toBeGreaterThan(0)
  })

  it("loads what exists when manifest.json is missing", async () => {
    await seedFoundation(workdir, {
      design: "contract",
      cardinal: "rules",
      voice: "voice",
    })
    const ctx = await loadDesignContext({ repoRoot: workdir })
    expect(ctx.designContract).toBe("contract")
    expect(ctx.cardinalRules).toBe("rules")
    expect(ctx.voiceRules).toBe("voice")
    expect(ctx.manifest).toBeNull()
    expect(ctx.loadedSources.length).toBe(3)
    expect(ctx.missingSources.length).toBe(2)
  })

  it("falls back to the dash-ds cwd when the target repo has no foundation", async () => {
    await seedFoundation(workdir, {
      design: "global contract",
      cardinal: "rules",
      voice: "voice",
      manifest: { schemaVersion: 1, name: "@dash/foundation", version: "0.1.0" },
      layered: "layered",
    })
    const targetRepo = path.join(workdir, "external-product", "src")
    await mkdir(targetRepo, { recursive: true })
    const previousCwd = process.cwd()
    process.chdir(workdir)
    try {
      const ctx = await loadDesignContext({ cwd: targetRepo })
      expect(ctx.designContract).toBe("global contract")
      expect(ctx.cardinalRules).toBe("rules")
      expect(ctx.loadedSources.length).toBe(5)
    } finally {
      process.chdir(previousCwd)
    }
  })

  it("ignores invalid JSON in manifest.json without throwing", async () => {
    await seedFoundation(workdir, { cardinal: "rules" })
    const manifestPath = path.join(
      workdir,
      "apps/docs/registry/dash/foundation/manifest.json",
    )
    await writeFile(manifestPath, "{not valid json")
    const ctx = await loadDesignContext({ repoRoot: workdir })
    expect(ctx.manifest).toBeNull()
  })
})
