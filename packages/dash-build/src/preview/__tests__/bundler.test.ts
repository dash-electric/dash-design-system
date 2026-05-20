import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { bundleForPreview, bundlePathFor, findEntry } from "../bundler.js"
import {
  BundleError,
  BundleTooLargeError,
  type EsbuildBuildOptions,
  type EsbuildLike,
} from "../types.js"
import type { ParsedFile } from "../../skills/types.js"

const sampleTsx: ParsedFile = {
  path: "preview.tsx",
  language: "tsx",
  content: `import React from "react"; export default function App(){ return <div>ok</div> }`,
}

/** A fake esbuild that writes a stub bundle to `outfile` so the rest of the
 *  pipeline (stat, size check, path return) runs end-to-end. */
function fakeEsbuild(
  bundleContent = "(function(){ /* fake bundle */ })()",
  errors: Array<{ text: string }> = [],
): EsbuildLike & { lastOpts?: EsbuildBuildOptions } {
  const inst: EsbuildLike & { lastOpts?: EsbuildBuildOptions } = {
    async build(opts) {
      inst.lastOpts = opts
      if (errors.length === 0) {
        await fs.writeFile(opts.outfile, bundleContent, "utf8")
      }
      return { errors, warnings: [] }
    },
  }
  return inst
}

describe("preview/bundler — findEntry", () => {
  it("prefers preview.tsx, then index.tsx, then first .tsx alphabetically", () => {
    expect(
      findEntry([
        { path: "z.tsx", language: "tsx", content: "" },
        { path: "preview.tsx", language: "tsx", content: "" },
        { path: "index.tsx", language: "tsx", content: "" },
      ]),
    ).toBe("preview.tsx")
    expect(
      findEntry([
        { path: "z.tsx", language: "tsx", content: "" },
        { path: "index.tsx", language: "tsx", content: "" },
      ]),
    ).toBe("index.tsx")
    expect(
      findEntry([
        { path: "z.tsx", language: "tsx", content: "" },
        { path: "a.tsx", language: "tsx", content: "" },
      ]),
    ).toBe("a.tsx")
  })

  it("falls back to first .ts when no .tsx present, returns null when empty", () => {
    expect(
      findEntry([
        { path: "b.ts", language: "ts", content: "" },
        { path: "a.ts", language: "ts", content: "" },
      ]),
    ).toBe("a.ts")
    expect(findEntry([])).toBe(null)
  })
})

describe("preview/bundler — bundleForPreview", () => {
  let root: string

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "dash-bundler-test-"))
  })

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true })
  })

  it("happy path: writes files, calls esbuild with IIFE + jsx automatic, returns bundle metadata", async () => {
    const esb = fakeEsbuild()
    const result = await bundleForPreview({
      files: [sampleTsx],
      promptId: "p1",
      rootDir: root,
      esbuildModule: esb,
    })
    expect(result.bundlePath).toBe(path.join(root, "p1", "bundle.js"))
    expect(result.entryPath).toBe(path.join(root, "p1", "preview.tsx"))
    expect(result.byteSize).toBeGreaterThan(0)
    expect(result.tempDir).toBe(path.join(root, "p1"))

    // esbuild call assertions
    expect(esb.lastOpts?.format).toBe("iife")
    expect(esb.lastOpts?.platform).toBe("browser")
    expect(esb.lastOpts?.jsx).toBe("automatic")
    expect(esb.lastOpts?.bundle).toBe(true)
    expect(esb.lastOpts?.sourcemap).toBe("inline")
    expect(esb.lastOpts?.external).toEqual([])

    // file was actually written
    const onDisk = await fs.readFile(result.bundlePath, "utf8")
    expect(onDisk).toContain("fake bundle")
  })

  it("throws BundleError when files is empty", async () => {
    await expect(
      bundleForPreview({
        files: [],
        promptId: "x",
        rootDir: root,
        esbuildModule: fakeEsbuild(),
      }),
    ).rejects.toBeInstanceOf(BundleError)
  })

  it("throws BundleError when no entry candidate (.tsx/.ts) exists", async () => {
    await expect(
      bundleForPreview({
        files: [{ path: "styles.css", language: "css", content: "body{}" }],
        promptId: "x",
        rootDir: root,
        esbuildModule: fakeEsbuild(),
      }),
    ).rejects.toBeInstanceOf(BundleError)
  })

  it("propagates esbuild errors as BundleError", async () => {
    const esb = fakeEsbuild("", [{ text: "syntax error in preview.tsx" }])
    await expect(
      bundleForPreview({
        files: [sampleTsx],
        promptId: "syntax",
        rootDir: root,
        esbuildModule: esb,
      }),
    ).rejects.toMatchObject({ name: "BundleError" })
  })

  it("supports multi-file inputs and creates nested directories", async () => {
    const esb = fakeEsbuild()
    const files: ParsedFile[] = [
      { path: "preview.tsx", language: "tsx", content: `import "./lib/util"` },
      { path: "lib/util.ts", language: "ts", content: `export const x = 1` },
    ]
    const result = await bundleForPreview({
      files,
      promptId: "multi",
      rootDir: root,
      esbuildModule: esb,
    })
    expect(result.tempDir).toBe(path.join(root, "multi"))
    expect((await fs.stat(path.join(root, "multi", "lib", "util.ts"))).isFile()).toBe(true)
  })

  it("rejects ParsedFile paths that attempt path traversal", async () => {
    const esb = fakeEsbuild()
    await expect(
      bundleForPreview({
        files: [{ path: "../escape.tsx", language: "tsx", content: "" }, sampleTsx],
        promptId: "evil",
        rootDir: root,
        esbuildModule: esb,
      }),
    ).rejects.toThrow(/unsafe_path/)
  })

  it("enforces maxBytes — throws BundleTooLargeError and removes bundle", async () => {
    const esb = fakeEsbuild("x".repeat(200))
    await expect(
      bundleForPreview({
        files: [sampleTsx],
        promptId: "big",
        rootDir: root,
        maxBytes: 50,
        esbuildModule: esb,
      }),
    ).rejects.toBeInstanceOf(BundleTooLargeError)
    // bundle.js must have been cleaned
    await expect(fs.stat(path.join(root, "big", "bundle.js"))).rejects.toThrow()
  })

  it("bundlePathFor resolves to the sanitized preview dir without rebuilding", () => {
    const p = bundlePathFor("../danger/id", root)
    expect(p).toBe(path.join(root, "___danger_id", "bundle.js"))
  })
})
