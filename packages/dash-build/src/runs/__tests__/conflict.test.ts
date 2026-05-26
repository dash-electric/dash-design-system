import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import {
  ConflictResolver,
  ConflictNeedsResolution,
  type ConflictEvent,
} from "../conflict.js"
import { GitOps } from "../git-ops.js"

let dir: string
let workdir: string
let remoteDir: string

function git(args: string[], cwd: string): { code: number; stdout: string; stderr: string } {
  const res = spawnSync("git", args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Test",
      GIT_AUTHOR_EMAIL: "test@dash.local",
      GIT_COMMITTER_NAME: "Test",
      GIT_COMMITTER_EMAIL: "test@dash.local",
    },
    encoding: "utf8",
  })
  return {
    code: res.status ?? -1,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  }
}

async function writeFileIn(cwd: string, file: string, content: string): Promise<void> {
  await mkdir(join(cwd, file.slice(0, file.lastIndexOf("/")) || "."), { recursive: true })
  await writeFile(join(cwd, file), content, "utf8")
}

/**
 * Build a working clone + remote with a base commit on `main`, then return a
 * function that lets each test diverge however it wants.
 */
async function setup(): Promise<void> {
  // Bare remote.
  remoteDir = join(dir, "remote.git")
  await mkdir(remoteDir, { recursive: true })
  git(["init", "--bare", "--initial-branch=main"], remoteDir)

  // Seed via a tmp working clone.
  const seed = join(dir, "seed")
  await mkdir(seed, { recursive: true })
  git(["init", "--initial-branch=main"], seed)
  git(["remote", "add", "origin", remoteDir], seed)
  await writeFileIn(seed, "README.md", "base\n")
  await writeFileIn(seed, "pnpm-lock.yaml", "lockfile: 6.0\nbase: true\n")
  git(["add", "-A"], seed)
  git(["commit", "-m", "base"], seed)
  git(["push", "-u", "origin", "main"], seed)

  // Working clone for the resolver to operate on.
  workdir = join(dir, "work")
  git(["clone", remoteDir, workdir], dir)
  git(["config", "user.email", "test@dash.local"], workdir)
  git(["config", "user.name", "Test"], workdir)
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-conflict-"))
  await setup()
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
})

describe("ConflictResolver.checkBranchFresh", () => {
  it("reports stale=false + behind=0 when branch matches origin/main", async () => {
    const ops = new GitOps(workdir)
    const cr = new ConflictResolver(ops)
    git(["checkout", "-b", "dash-build/run1"], workdir)
    const fresh = await cr.checkBranchFresh("dash-build/run1")
    expect(fresh.stale).toBe(false)
    expect(fresh.behind).toBe(0)
  })

  it("reports stale=true when origin/main advances past branch", async () => {
    // Branch off main first.
    git(["checkout", "-b", "dash-build/run2"], workdir)
    await writeFileIn(workdir, "feature.txt", "branch work\n")
    git(["add", "-A"], workdir)
    git(["commit", "-m", "feature"], workdir)

    // Advance origin/main via the seed clone.
    const seed = join(dir, "seed")
    git(["checkout", "main"], seed)
    await writeFileIn(seed, "main-extra.txt", "advance\n")
    git(["add", "-A"], seed)
    git(["commit", "-m", "main advance"], seed)
    git(["push", "origin", "main"], seed)

    const ops = new GitOps(workdir)
    const cr = new ConflictResolver(ops)
    const fresh = await cr.checkBranchFresh("dash-build/run2")
    expect(fresh.stale).toBe(true)
    expect(fresh.behind).toBeGreaterThanOrEqual(1)
    expect(fresh.ahead).toBeGreaterThanOrEqual(1)
  })
})

describe("ConflictResolver.autoRebase", () => {
  it("returns ok=true with no conflicts when branch rebases cleanly", async () => {
    git(["checkout", "-b", "dash-build/runX"], workdir)
    await writeFileIn(workdir, "feature.txt", "branch work\n")
    git(["add", "-A"], workdir)
    git(["commit", "-m", "feature"], workdir)

    // Advance origin/main on an UNRELATED file → clean rebase.
    const seed = join(dir, "seed")
    git(["checkout", "main"], seed)
    await writeFileIn(seed, "other.txt", "other change\n")
    git(["add", "-A"], seed)
    git(["commit", "-m", "other"], seed)
    git(["push", "origin", "main"], seed)

    const ops = new GitOps(workdir)
    const cr = new ConflictResolver(ops)
    const res = await cr.autoRebase("dash-build/runX")
    expect(res.ok).toBe(true)
    expect(res.hadAutoResolve).toBe(false)
  })

  it("auto-resolves lockfile conflicts (pnpm-lock.yaml)", async () => {
    git(["checkout", "-b", "dash-build/runLock"], workdir)
    await writeFileIn(workdir, "pnpm-lock.yaml", "lockfile: 6.0\nbranch: yes\n")
    git(["add", "-A"], workdir)
    git(["commit", "-m", "branch lock change"], workdir)

    // Advance origin/main with conflicting lockfile change.
    const seed = join(dir, "seed")
    git(["checkout", "main"], seed)
    await writeFileIn(seed, "pnpm-lock.yaml", "lockfile: 6.0\nmain: yes\n")
    git(["add", "-A"], seed)
    git(["commit", "-m", "main lock change"], seed)
    git(["push", "origin", "main"], seed)

    const ops = new GitOps(workdir)
    const cr = new ConflictResolver(ops)
    const res = await cr.autoRebase("dash-build/runLock")
    expect(res.ok).toBe(true)
    expect(res.hadAutoResolve).toBe(true)
  })

  it("returns ok=false + reports conflictFiles for a real source-file conflict", async () => {
    git(["checkout", "-b", "dash-build/runReal"], workdir)
    await writeFileIn(workdir, "README.md", "base\nbranch line\n")
    git(["add", "-A"], workdir)
    git(["commit", "-m", "branch readme"], workdir)

    const seed = join(dir, "seed")
    git(["checkout", "main"], seed)
    await writeFileIn(seed, "README.md", "base\nmain line\n")
    git(["add", "-A"], seed)
    git(["commit", "-m", "main readme"], seed)
    git(["push", "origin", "main"], seed)

    const ops = new GitOps(workdir)
    const cr = new ConflictResolver(ops)
    const res = await cr.autoRebase("dash-build/runReal")
    expect(res.ok).toBe(false)
    expect(res.conflictFiles ?? []).toContain("README.md")

    // Working tree should be clean after auto-abort.
    const status = git(["status", "--porcelain"], workdir)
    expect(status.stdout.trim()).toBe("")
  })
})

describe("ConflictResolver.escalateToUser", () => {
  it("broadcasts a conflict event and throws ConflictNeedsResolution", async () => {
    const ops = new GitOps(workdir)
    const events: ConflictEvent[] = []
    const cr = new ConflictResolver(ops, {
      broadcaster: (ev) => events.push(ev),
    })
    await expect(
      cr.escalateToUser("run_42", ["src/feature.tsx"]),
    ).rejects.toBeInstanceOf(ConflictNeedsResolution)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe("conflict:needs_resolution")
    expect(events[0].runId).toBe("run_42")
    expect(events[0].conflictFiles).toEqual(["src/feature.tsx"])
  })
})
