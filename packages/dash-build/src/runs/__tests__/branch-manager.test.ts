/**
 * BranchManager tests — exercise startRun + writeGeneratedFiles + rollback +
 * extractGeneratedOnly against a real throwaway git repo wired as both
 * "origin" (bare) and the sandbox clone (working tree).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  BranchManager,
  looksLikeShimSubject,
  type Workspace,
} from "../branch-manager.js"
import { GitOps } from "../git-ops.js"
import { SandboxStateMachine } from "../sandbox-state.js"
import type { ParsedFile } from "../../skills/types.js"

const ENV = {
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@dash.local",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@dash.local",
}

interface Harness {
  rootDir: string
  bareDir: string
  cloneDir: string
  workspace: Workspace
  git: GitOps
  manager: BranchManager
  shimSha: string
  baseSha: string
}

async function configRepo(dir: string): Promise<void> {
  const g = new GitOps(dir, { env: ENV })
  await g.run(["init", "-q", "-b", "main"])
  await g.run(["config", "user.email", "test@dash.local"])
  await g.run(["config", "user.name", "Test"])
  await g.run(["config", "commit.gpgsign", "false"])
}

async function setupHarness(): Promise<Harness> {
  const rootDir = await mkdtemp(join(tmpdir(), "dash-build-bm-"))
  const bareDir = join(rootDir, "bare.git")
  const seedDir = join(rootDir, "seed")
  const cloneDir = join(rootDir, "clone")

  // 1. Seed an upstream with one initial commit.
  await mkdir(seedDir, { recursive: true })
  await configRepo(seedDir)
  const seed = new GitOps(seedDir, { env: ENV })
  await writeFile(join(seedDir, "README.md"), "# upstream\n", "utf8")
  const baseSha = await seed.commit("init", { addAll: true })

  // 2. Create the bare and push initial commit.
  await mkdir(bareDir, { recursive: true })
  await new GitOps(bareDir, { env: ENV }).run(["init", "--bare", "-q", "-b", "main"])
  await seed.run(["remote", "add", "origin", bareDir])
  await seed.push("main")

  // 3. Clone the bare into the sandbox dir.
  await new GitOps(rootDir, { env: ENV }).run(["clone", "-q", bareDir, cloneDir])
  const cloneGit = new GitOps(cloneDir, { env: ENV })
  await cloneGit.run(["config", "user.email", "test@dash.local"])
  await cloneGit.run(["config", "user.name", "Test"])
  await cloneGit.run(["config", "commit.gpgsign", "false"])

  // 4. Apply a preview-shim commit on top of trunk.
  await writeFile(join(cloneDir, "shim.local.ts"), "// preview shim\n", "utf8")
  const shimSha = await cloneGit.commit("chore: preview shim [dash-build local-only]", {
    addAll: true,
  })

  const state = new SandboxStateMachine({ repoSlug: "test-repo" })
  // Drive state machine to `idle` (clean → cloned → shim_applied → idle).
  state.transition("cloned")
  state.transition("shim_applied")
  state.transition("idle")

  const workspace: Workspace = {
    clonePath: cloneDir,
    repoSlug: "test-repo",
    state,
    remote: "origin",
    trunkBranch: "main",
    info: () => ({ shimCommitSha: shimSha }),
  }

  const manager = new BranchManager({ workspace, gitOps: cloneGit })
  return {
    rootDir,
    bareDir,
    cloneDir,
    workspace,
    git: cloneGit,
    manager,
    shimSha,
    baseSha,
  }
}

let h: Harness

beforeEach(async () => {
  h = await setupHarness()
})

afterEach(async () => {
  await rm(h.rootDir, { recursive: true, force: true })
})

const FILES: ParsedFile[] = [
  {
    path: "src/feature.tsx",
    language: "tsx",
    content: 'export const Feature = () => "hello"\n',
  },
  {
    path: "src/feature.test.tsx",
    language: "tsx",
    content: 'test("feature", () => {})\n',
  },
]

describe("BranchManager", () => {
  it("startRun() creates branch from origin/main + cherry-picks shim", async () => {
    const result = await h.manager.startRun("run-001", "alice")
    expect(result.branchName).toBe("dash-build/alice-run-001")
    expect(result.baseCommit).toMatch(/^[0-9a-f]{40}$/)

    expect(await h.git.currentBranch()).toBe("dash-build/alice-run-001")
    expect(h.workspace.state.current()).toBe("generating")

    // Shim file should exist (cherry-pick succeeded).
    const shimContent = await readFile(join(h.cloneDir, "shim.local.ts"), "utf8")
    expect(shimContent).toContain("preview shim")
  })

  it("writeGeneratedFiles() commits files on the run branch", async () => {
    const { branchName } = await h.manager.startRun("run-002", "bob")
    const sha = await h.manager.writeGeneratedFiles(branchName, FILES)
    expect(sha).toMatch(/^[0-9a-f]{40}$/)

    // Files exist on disk.
    const feature = await readFile(join(h.cloneDir, "src/feature.tsx"), "utf8")
    expect(feature).toContain("Feature")

    // Log shows shim + generated commit on the branch.
    const log = await h.git.log(undefined, { max: 5 })
    expect(log.length).toBeGreaterThanOrEqual(2)
    expect(log[0]?.message).toContain("dash-build run")
  })

  it("writeGeneratedFiles() refuses empty file list", async () => {
    const { branchName } = await h.manager.startRun("run-empty", "ck")
    await expect(
      h.manager.writeGeneratedFiles(branchName, []),
    ).rejects.toThrow(/no writable files/i)
  })

  it("rollback() returns the workspace to trunk and deletes the branch", async () => {
    const { branchName } = await h.manager.startRun("run-003", "carol")
    await h.manager.rollback(branchName)
    expect(await h.git.currentBranch()).toBe("main")
    const branches = (await h.git.run(["branch", "--list"])).stdout
    expect(branches).not.toContain(branchName.split("/").pop() ?? "")
  })

  it("extractGeneratedOnly() returns shas EXCLUDING the shim and emits patches", async () => {
    const { branchName } = await h.manager.startRun("run-004", "dave")
    const genSha = await h.manager.writeGeneratedFiles(branchName, FILES)

    const extracted = await h.manager.extractGeneratedOnly(
      branchName,
      h.shimSha,
      "run-004",
    )
    expect(extracted.generatedShas).toContain(genSha)
    expect(extracted.generatedShas).not.toContain(h.shimSha)
    expect(extracted.patchPaths.length).toBe(extracted.generatedShas.length)
    expect(extracted.patchPaths[0]?.endsWith(".patch")).toBe(true)
  })

  it("startRun() rolls back when the shim cherry-pick conflicts", async () => {
    // Force a conflict by editing the shim file on trunk so the next cherry-pick
    // collides. We push the conflicting change to origin first so startRun's
    // checkout-from-origin/main lands on the colliding tree.
    await h.git.checkout("main")
    await writeFile(join(h.cloneDir, "shim.local.ts"), "// conflict\n", "utf8")
    await h.git.commit("conflict on shim path", { addAll: true })
    await h.git.push("main", { force: true })

    await expect(h.manager.startRun("run-conflict", "eve")).rejects.toThrow(
      /failed to cherry-pick shim/i,
    )
    // Working tree should be back on a usable branch (trunk).
    const branch = await h.git.currentBranch()
    expect(branch).toBe("main")
  })
})

describe("looksLikeShimSubject (Tier 4 #17)", () => {
  it("matches production shim subjects across versions", () => {
    expect(looksLikeShimSubject("preview-shim apply v1 [DO NOT MERGE]")).toBe(true)
    expect(looksLikeShimSubject("preview-shim apply v2 [DO NOT MERGE]")).toBe(true)
    expect(looksLikeShimSubject("preview-shim apply v9 [DO NOT MERGE]")).toBe(true)
  })

  it("matches the test-harness fixture phrasing", () => {
    expect(looksLikeShimSubject("chore: preview shim")).toBe(true)
    expect(looksLikeShimSubject("chore: preview shim [dash-build local-only]")).toBe(true)
  })

  it("ignores generated commits", () => {
    expect(looksLikeShimSubject("feat: add foo")).toBe(false)
    expect(looksLikeShimSubject("init")).toBe(false)
    expect(looksLikeShimSubject("dash-build run run-100")).toBe(false)
  })
})
