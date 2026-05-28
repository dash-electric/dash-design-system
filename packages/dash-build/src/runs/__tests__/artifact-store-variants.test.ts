/**
 * Open WebUI #A4 — A/B variant persistence helpers.
 *
 * Covers writeVariantArtifacts, readVariantMeta/Source, the manifest
 * read/write pair, and promoteVariantToCanonical (winner selection).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  promoteVariantToCanonical,
  readVariantComponentSource,
  readVariantMeta,
  readVariantsManifest,
  resolveRunDir,
  resolveVariantDir,
  writeVariantArtifacts,
  writeVariantsManifest,
} from "../artifact-store.js"

let root: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-variant-store-"))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe("writeVariantArtifacts", () => {
  it("persists files under <runDir>/variants/<id>/files/ + meta + component-source", async () => {
    const result = await writeVariantArtifacts(
      {
        runId: "run-1",
        variantId: "a",
        files: [
          { path: "Component.tsx", language: "tsx", content: "export const X = 1" },
          {
            path: "src/hooks/useFoo.ts",
            language: "ts",
            content: "export function useFoo() { return 1 }",
          },
        ],
        componentSource: "export const X = 1",
        componentPath: "Component.tsx",
        meta: {
          score: 87,
          passed: true,
          explanation: "Adds Component\nwith hook",
          temperature: 0.7,
        },
      },
      root,
    )
    expect(result.fileCount).toBe(2)
    const variantDir = resolveVariantDir("run-1", "a", root)
    expect(existsSync(join(variantDir, "files", "Component.tsx"))).toBe(true)
    expect(existsSync(join(variantDir, "files", "src", "hooks", "useFoo.ts"))).toBe(true)
    const meta = await readVariantMeta("run-1", "a", root)
    expect(meta).not.toBeNull()
    expect(meta!.score).toBe(87)
    expect(meta!.passed).toBe(true)
    expect(meta!.temperature).toBe(0.7)
    expect(meta!.componentPath).toBe("Component.tsx")
    const source = await readVariantComponentSource("run-1", "a", root)
    expect(source).toBe("export const X = 1")
  })

  it("rejects invalid variant ids", async () => {
    await expect(
      writeVariantArtifacts(
        {
          runId: "run-2",
          variantId: "AA",
          files: [],
          componentSource: null,
          componentPath: null,
          meta: {
            score: 0,
            passed: false,
            explanation: "",
            temperature: null,
          },
        },
        root,
      ),
    ).rejects.toThrow(/invalid variantId/)
  })
})

describe("writeVariantsManifest / readVariantsManifest", () => {
  it("round-trips an A/B manifest", async () => {
    await writeVariantsManifest(
      "run-3",
      {
        active: "b",
        list: [
          {
            id: "a",
            summary: "Variant A summary",
            score: 70,
            passed: true,
            fileCount: 2,
            componentPath: "A.tsx",
            temperature: 0.7,
          },
          {
            id: "b",
            summary: "Variant B summary",
            score: 85,
            passed: true,
            fileCount: 2,
            componentPath: "B.tsx",
            temperature: 0.9,
          },
        ],
      },
      root,
    )
    const manifest = await readVariantsManifest("run-3", root)
    expect(manifest).not.toBeNull()
    expect(manifest!.active).toBe("b")
    expect(manifest!.list.length).toBe(2)
    expect(manifest!.list[0].id).toBe("a")
    expect(manifest!.list[1].score).toBe(85)
    expect(typeof manifest!.updatedAt).toBe("string")
  })

  it("returns null for missing manifest", async () => {
    const manifest = await readVariantsManifest("nope", root)
    expect(manifest).toBeNull()
  })
})

describe("promoteVariantToCanonical", () => {
  it("copies the picked variant's files over <runDir>/files/", async () => {
    await writeVariantArtifacts(
      {
        runId: "run-promote",
        variantId: "a",
        files: [
          { path: "VariantA.tsx", language: "tsx", content: "A" },
        ],
        componentSource: "A",
        componentPath: "VariantA.tsx",
        meta: { score: 60, passed: true, explanation: "A", temperature: 0.7 },
      },
      root,
    )
    await writeVariantArtifacts(
      {
        runId: "run-promote",
        variantId: "b",
        files: [
          { path: "VariantB.tsx", language: "tsx", content: "B" },
          { path: "extra/Helper.ts", language: "ts", content: "helper" },
        ],
        componentSource: "B",
        componentPath: "VariantB.tsx",
        meta: { score: 90, passed: true, explanation: "B", temperature: 0.9 },
      },
      root,
    )

    const out = await promoteVariantToCanonical("run-promote", "b", root)
    expect(out.promoted).toBe(true)
    expect(out.fileCount).toBe(2)
    const canonicalDir = join(resolveRunDir("run-promote", root), "files")
    expect(existsSync(join(canonicalDir, "VariantB.tsx"))).toBe(true)
    expect(existsSync(join(canonicalDir, "extra", "Helper.ts"))).toBe(true)
    // Loser-variant files MUST NOT linger in canonical.
    expect(existsSync(join(canonicalDir, "VariantA.tsx"))).toBe(false)
    const canonicalSource = await readFile(
      join(canonicalDir, "VariantB.tsx"),
      "utf8",
    )
    expect(canonicalSource).toBe("B")
  })

  it("returns promoted=false when variant dir is missing", async () => {
    const out = await promoteVariantToCanonical("run-x", "a", root)
    expect(out.promoted).toBe(false)
  })
})
