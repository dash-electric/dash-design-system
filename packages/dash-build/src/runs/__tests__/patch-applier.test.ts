/**
 * PatchApplier tests — exercise applyPatch against a real throwaway git repo.
 *
 * Asserts:
 *   - clean unified-diff applies + mutates the working tree
 *   - context drift (conflict) is detected via `git apply --check`
 *   - invalid diff body is rejected before touching the workspace
 *   - missing target file is reported with `missingTarget: true`
 *
 * NOTE: assumes `git` on $PATH (same as the rest of the runs/ test suite).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { GitOps } from "../git-ops.js"
import {
  PatchApplier,
  ensureDiffHeader,
  looksLikeUnifiedDiff,
} from "../patch-applier.js"

const DETERMINISTIC_ENV = {
  GIT_AUTHOR_NAME: "Patch Test",
  GIT_AUTHOR_EMAIL: "patch-test@dash.local",
  GIT_COMMITTER_NAME: "Patch Test",
  GIT_COMMITTER_EMAIL: "patch-test@dash.local",
}

async function initRepo(dir: string): Promise<GitOps> {
  const g = new GitOps(dir, { env: DETERMINISTIC_ENV })
  await g.run(["init", "-q", "-b", "main"])
  await g.run(["config", "user.email", "patch-test@dash.local"])
  await g.run(["config", "user.name", "Patch Test"])
  await g.run(["config", "commit.gpgsign", "false"])
  return g
}

let dir: string
let git: GitOps
let applier: PatchApplier

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-patch-applier-"))
  git = await initRepo(dir)
  applier = new PatchApplier({ workspaceDir: dir, gitOps: git })
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("looksLikeUnifiedDiff", () => {
  it("accepts a body with @@ header and +/- lines", () => {
    expect(
      looksLikeUnifiedDiff(
        ["@@ -1,3 +1,4 @@", " alpha", "+beta", " gamma", " delta"].join("\n"),
      ),
    ).toBe(true)
  })

  it("rejects body with no @@ header", () => {
    expect(looksLikeUnifiedDiff("just some text +alpha -beta")).toBe(false)
  })

  it("rejects body with @@ but no +/- lines", () => {
    expect(looksLikeUnifiedDiff("@@ -1,1 +1,1 @@\n same\n")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(looksLikeUnifiedDiff("")).toBe(false)
  })
})

describe("ensureDiffHeader", () => {
  it("prepends --- / +++ when missing", () => {
    const out = ensureDiffHeader("src/x.ts", "@@ -1,1 +1,2 @@\n a\n+b\n")
    expect(out).toMatch(/^--- a\/src\/x\.ts\n\+\+\+ b\/src\/x\.ts\n@@/)
  })

  it("passes through when headers already present", () => {
    const body = ["--- a/x", "+++ b/x", "@@ -1,1 +1,1 @@", " a"].join("\n")
    expect(ensureDiffHeader("x", body)).toContain("--- a/x\n+++ b/x")
  })
})

describe("PatchApplier.applyPatch", () => {
  it("applies a clean patch and mutates the file", async () => {
    const target = "hello.txt"
    await writeFile(
      join(dir, target),
      ["line a", "line b", "line c", ""].join("\n"),
      "utf8",
    )
    await git.commit("seed", { addAll: true })

    const patch = [
      "@@ -1,3 +1,4 @@",
      " line a",
      " line b",
      "+line b.5",
      " line c",
    ].join("\n")

    const r = await applier.applyPatch(target, patch)
    expect(r.ok).toBe(true)
    const content = await readFile(join(dir, target), "utf8")
    expect(content).toContain("line b.5")
  })

  it("returns conflict=true when context drifts from on-disk file", async () => {
    const target = "drift.txt"
    await writeFile(
      join(dir, target),
      ["alpha", "beta", "gamma", ""].join("\n"),
      "utf8",
    )
    await git.commit("seed", { addAll: true })

    // Context expects "DIFFERENT" lines that don't exist in the file.
    const patch = [
      "@@ -1,3 +1,4 @@",
      " DIFFERENT one",
      " DIFFERENT two",
      "+DIFFERENT inserted",
      " DIFFERENT three",
    ].join("\n")

    const r = await applier.applyPatch(target, patch)
    expect(r.ok).toBe(false)
    expect(r.conflict).toBe(true)
    expect(r.error).toMatch(/apply|patch/i)
    // File on disk must be unchanged.
    const content = await readFile(join(dir, target), "utf8")
    expect(content).not.toContain("DIFFERENT")
  })

  it("rejects body that is not a unified diff before touching workspace", async () => {
    const target = "x.txt"
    await writeFile(join(dir, target), "x\n", "utf8")
    await git.commit("seed", { addAll: true })

    const r = await applier.applyPatch(target, "this is not a diff")
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/unified diff/i)
    expect(r.conflict).toBeUndefined()
  })

  it("reports missingTarget=true when file does not exist", async () => {
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })

    const patch = ["@@ -1,1 +1,2 @@", " seed", "+new"].join("\n")
    const r = await applier.applyPatch("does/not/exist.tsx", patch)
    expect(r.ok).toBe(false)
    expect(r.missingTarget).toBe(true)
  })

  it("rejects unsafe paths (../escape)", async () => {
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })

    // Build a path that resolves OUTSIDE the workspace.
    const outside = "../escape.txt"
    const patch = ["@@ -1,1 +1,2 @@", " seed", "+new"].join("\n")
    const r = await applier.applyPatch(outside, patch)
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/unsafe|exist/i)
  })

  it("rejects an empty patch body", async () => {
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })

    const r = await applier.applyPatch("seed.txt", "")
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/empty/i)
  })

  it("stages patch files under .dash-build/patches/inbox for forensic review", async () => {
    const target = "log.txt"
    await writeFile(
      join(dir, target),
      ["first", "second", ""].join("\n"),
      "utf8",
    )
    await git.commit("seed", { addAll: true })

    const patch = ["@@ -1,2 +1,3 @@", " first", " second", "+third"].join("\n")
    const r = await applier.applyPatch(target, patch)
    expect(r.ok).toBe(true)
    expect(r.patchPath).toMatch(/\.dash-build\/patches\/inbox\//)
  })

  it("cleanupStaging removes the patches/inbox directory", async () => {
    await mkdir(join(dir, ".dash-build", "patches", "inbox"), { recursive: true })
    await writeFile(
      join(dir, ".dash-build", "patches", "inbox", "junk.patch"),
      "noop",
      "utf8",
    )
    await applier.cleanupStaging()
    await expect(
      readFile(join(dir, ".dash-build", "patches", "inbox", "junk.patch")),
    ).rejects.toThrow()
  })
})
