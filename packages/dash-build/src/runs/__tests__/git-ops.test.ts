/**
 * GitOps unit tests — exercise every convenience method against a real
 * throwaway git repo created via `git init` in a temp dir.
 *
 * NOTE: tests assume `git` is on $PATH (true in dev + CI).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { GitOps, GitOpsError } from "../git-ops.js"

let dir: string
let git: GitOps

const DETERMINISTIC_ENV = {
  GIT_AUTHOR_NAME: "Test Author",
  GIT_AUTHOR_EMAIL: "test@dash.local",
  GIT_COMMITTER_NAME: "Test Committer",
  GIT_COMMITTER_EMAIL: "test@dash.local",
}

async function configRepo(workdir: string): Promise<void> {
  const g = new GitOps(workdir)
  await g.run(["init", "-q", "-b", "main"])
  await g.run(["config", "user.email", "test@dash.local"])
  await g.run(["config", "user.name", "Test Author"])
  await g.run(["config", "commit.gpgsign", "false"])
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-gitops-"))
  await configRepo(dir)
  git = new GitOps(dir, { env: DETERMINISTIC_ENV })
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("GitOps", () => {
  it("run() returns stdout/stderr/code without throwing on non-zero exits", async () => {
    const result = await git.run(["cat-file", "-p", "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"])
    expect(result.code).not.toBe(0)
    expect(result.stderr.length).toBeGreaterThan(0)
  })

  it("status() reports clean tree after init", async () => {
    // Seed an initial commit so HEAD exists (porcelain v2 needs a branch).
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })
    const status = await git.status()
    expect(status.clean).toBe(true)
    expect(status.branch).toBe("main")
    expect(status.untracked.length).toBe(0)
  })

  it("status() reports untracked + modified files", async () => {
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })
    await writeFile(join(dir, "new.txt"), "new\n", "utf8")
    await writeFile(join(dir, "seed.txt"), "modified\n", "utf8")
    const status = await git.status()
    expect(status.clean).toBe(false)
    expect(status.untracked).toContain("new.txt")
    expect(status.modified).toContain("seed.txt")
  })

  it("commit() returns the new HEAD sha", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    const sha = await git.commit("first", { addAll: true })
    expect(sha).toMatch(/^[0-9a-f]{40}$/)
    const head = (await git.run(["rev-parse", "HEAD"])).stdout.trim()
    expect(head).toBe(sha)
  })

  it("currentBranch() returns the active branch name", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    await git.commit("first", { addAll: true })
    expect(await git.currentBranch()).toBe("main")
  })

  it("checkout() creates a new branch from a base ref", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    const baseSha = await git.commit("first", { addAll: true })
    await git.checkout("feature/x", { create: true, from: baseSha })
    expect(await git.currentBranch()).toBe("feature/x")
  })

  it("log() returns commits in chronological order", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    const sha1 = await git.commit("first", { addAll: true })
    await writeFile(join(dir, "b.txt"), "b\n", "utf8")
    const sha2 = await git.commit("second", { addAll: true })

    const log = await git.log(undefined, { max: 5 })
    expect(log.length).toBe(2)
    // git log default is newest first.
    expect(log[0]?.sha).toBe(sha2)
    expect(log[1]?.sha).toBe(sha1)
    expect(log[0]?.message).toBe("second")
  })

  it("cherryPick() applies a commit cleanly from another branch", async () => {
    await writeFile(join(dir, "main.txt"), "main\n", "utf8")
    await git.commit("base", { addAll: true })
    await git.checkout("feature", { create: true })
    await writeFile(join(dir, "feat.txt"), "feat\n", "utf8")
    const featSha = await git.commit("feat commit", { addAll: true })

    await git.checkout("main")
    const result = await git.cherryPick(featSha)
    expect(result.ok).toBe(true)
    const log = await git.log()
    expect(log[0]?.message).toBe("feat commit")
  })

  it("cherryPick() returns conflict result instead of throwing", async () => {
    await writeFile(join(dir, "f.txt"), "main\n", "utf8")
    await git.commit("base", { addAll: true })
    await git.checkout("feature", { create: true })
    await writeFile(join(dir, "f.txt"), "feat\n", "utf8")
    const featSha = await git.commit("feat commit", { addAll: true })

    await git.checkout("main")
    await writeFile(join(dir, "f.txt"), "diverged\n", "utf8")
    await git.commit("diverge", { addAll: true })

    const result = await git.cherryPick(featSha)
    expect(result.ok).toBe(false)
    expect(result.conflict).toBe(true)
    // Working tree must be clean again (cherry-pick --abort happened).
    const status = await git.status()
    expect(status.clean).toBe(true)
  })

  it("formatPatch() + apply() round-trip a single commit", async () => {
    await writeFile(join(dir, "seed.txt"), "seed\n", "utf8")
    await git.commit("seed", { addAll: true })
    await writeFile(join(dir, "extra.txt"), "extra\n", "utf8")
    const sha = await git.commit("extra", { addAll: true })

    const patchDir = join(dir, ".patches")
    await mkdir(patchDir, { recursive: true })
    const patches = await git.formatPatch([sha], patchDir)
    expect(patches.length).toBe(1)
    expect(patches[0]?.endsWith(".patch")).toBe(true)

    // Reset to before `extra` and re-apply via the patch.
    await git.run(["reset", "--hard", "HEAD~1"])
    const apply = await git.apply(patches[0] as string, { check: true })
    expect(apply.ok).toBe(true)
  })

  it("revListExclude() omits the excluded sha from base..head", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    await git.commit("base", { addAll: true })
    const baseSha = (await git.run(["rev-parse", "HEAD"])).stdout.trim()
    await git.checkout("feature", { create: true })
    await writeFile(join(dir, "shim.txt"), "shim\n", "utf8")
    const shimSha = await git.commit("shim", { addAll: true })
    await writeFile(join(dir, "gen.txt"), "gen\n", "utf8")
    const genSha = await git.commit("gen", { addAll: true })

    const shas = await git.revListExclude(baseSha, "feature", [shimSha])
    expect(shas).toContain(genSha)
    expect(shas).not.toContain(shimSha)
  })

  it("push() respects refspec for renaming the remote branch", async () => {
    // Create a bare upstream we can push to.
    const bareDir = await mkdtemp(join(tmpdir(), "dash-build-bare-"))
    await new GitOps(bareDir).run(["init", "--bare", "-q", "-b", "main"])
    await git.run(["remote", "add", "origin", bareDir])

    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    await git.commit("first", { addAll: true })
    await git.checkout("local-branch", { create: true })

    await git.push("remote-name", {
      refspec: "local-branch:refs/heads/remote-name",
      force: true,
    })
    // Verify the bare has the new ref.
    const bareGit = new GitOps(bareDir)
    const list = await bareGit.run(["branch", "--list"])
    expect(list.stdout).toContain("remote-name")
    await rm(bareDir, { recursive: true, force: true })
  })

  it("deleteBranch() removes a merged branch", async () => {
    await writeFile(join(dir, "a.txt"), "a\n", "utf8")
    await git.commit("first", { addAll: true })
    await git.checkout("tmp", { create: true })
    await git.checkout("main")
    await git.deleteBranch("tmp", { force: true })
    const branches = (await git.run(["branch", "--list"])).stdout
    expect(branches).not.toContain("tmp")
  })

  it("runOrThrow paths surface GitOpsError with classification", async () => {
    // status() before any commit → no HEAD → runOrThrow throws.
    let caught: unknown = null
    try {
      await git.fetch("does-not-exist-remote")
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(GitOpsError)
    const e = caught as GitOpsError
    expect(["not_found", "unknown", "auth"]).toContain(e.kind)
    expect(e.args[0]).toBe("fetch")
  })
})
