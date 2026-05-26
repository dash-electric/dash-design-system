/**
 * Publisher tests — full publish flow against a throwaway bare repo,
 * with the GitHub App client mocked via `_setOctokitFactory`.
 *
 * We assert:
 *   - The generated commit lands on the remote
 *   - The preview-shim commit does NOT land on the remote PR branch
 *   - pulls.create is called with the expected head/base/title/body
 *   - State machine walks preview_ready → publishing → sweep → idle
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { Octokit } from "@octokit/rest"
import {
  GitHubAppClient,
  _setOctokitFactory,
} from "../../integrations/github/client.js"
import type { GitHubTokenStore } from "../../integrations/github/token-store.js"
import { BranchManager, type Workspace } from "../branch-manager.js"
import { GitOps } from "../git-ops.js"
import { Publisher } from "../publish.js"
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
  cloneGit: GitOps
  bareGit: GitOps
  manager: BranchManager
  publisher: Publisher
  shimSha: string
  pullsCreate: ReturnType<typeof vi.fn>
}

async function configRepo(dir: string): Promise<void> {
  const g = new GitOps(dir, { env: ENV })
  await g.run(["init", "-q", "-b", "main"])
  await g.run(["config", "user.email", "test@dash.local"])
  await g.run(["config", "user.name", "Test"])
  await g.run(["config", "commit.gpgsign", "false"])
}

function makeFakeOctokit(
  pullsCreate: ReturnType<typeof vi.fn>,
): Octokit {
  return {
    rest: {
      pulls: { create: pullsCreate },
    },
  } as unknown as Octokit
}

function makeFakeTokenStore(): GitHubTokenStore {
  return {
    async getInstallation() {
      return {
        installationId: 42,
        accountLogin: "dash",
        accountType: "Organization",
        accessibleRepos: [{ name: "test-repo", fullName: "dash/test-repo", private: false }],
      }
    },
  } as unknown as GitHubTokenStore
}

async function setupHarness(): Promise<Harness> {
  const rootDir = await mkdtemp(join(tmpdir(), "dash-build-pub-"))
  const bareDir = join(rootDir, "bare.git")
  const seedDir = join(rootDir, "seed")
  const cloneDir = join(rootDir, "clone")

  await mkdir(seedDir, { recursive: true })
  await configRepo(seedDir)
  const seed = new GitOps(seedDir, { env: ENV })
  await writeFile(join(seedDir, "README.md"), "# upstream\n", "utf8")
  await seed.commit("init", { addAll: true })

  await mkdir(bareDir, { recursive: true })
  await new GitOps(bareDir, { env: ENV }).run(["init", "--bare", "-q", "-b", "main"])
  await seed.run(["remote", "add", "origin", bareDir])
  await seed.push("main")

  await new GitOps(rootDir, { env: ENV }).run(["clone", "-q", bareDir, cloneDir])
  const cloneGit = new GitOps(cloneDir, { env: ENV })
  await cloneGit.run(["config", "user.email", "test@dash.local"])
  await cloneGit.run(["config", "user.name", "Test"])
  await cloneGit.run(["config", "commit.gpgsign", "false"])

  await writeFile(join(cloneDir, "shim.local.ts"), "// preview shim\n", "utf8")
  const shimSha = await cloneGit.commit("chore: preview shim", { addAll: true })

  const state = new SandboxStateMachine({ repoSlug: "dash-test-repo" })
  state.transition("cloned")
  state.transition("shim_applied")
  state.transition("idle")

  const workspace: Workspace = {
    clonePath: cloneDir,
    repoSlug: "dash-test-repo",
    state,
    remote: "origin",
    trunkBranch: "main",
    info: () => ({ shimCommitSha: shimSha }),
  }

  const manager = new BranchManager({ workspace, gitOps: cloneGit })

  const pullsCreate = vi.fn(async () => ({
    data: {
      number: 7,
      html_url: "https://github.com/dash/test-repo/pull/7",
    },
  }))
  _setOctokitFactory(async () => makeFakeOctokit(pullsCreate))
  const client = new GitHubAppClient({ store: makeFakeTokenStore() })

  const publisher = new Publisher({
    workspace,
    branchManager: manager,
    gitOps: cloneGit,
    githubClient: client,
  })

  return {
    rootDir,
    bareDir,
    cloneDir,
    workspace,
    cloneGit,
    bareGit: new GitOps(bareDir, { env: ENV }),
    manager,
    publisher,
    shimSha,
    pullsCreate,
  }
}

let h: Harness

beforeEach(async () => {
  h = await setupHarness()
  // Drive workspace through generating → preview_ready before publish.
  // Publisher.publish does preview_ready → publishing.
})

afterEach(async () => {
  _setOctokitFactory(null)
  await rm(h.rootDir, { recursive: true, force: true })
})

const FILES: ParsedFile[] = [
  {
    path: "src/feature.tsx",
    language: "tsx",
    content: 'export const X = "Y"\n',
  },
]

async function primeRun(runId: string, userId: string): Promise<string> {
  const { branchName } = await h.manager.startRun(runId, userId)
  await h.manager.writeGeneratedFiles(branchName, FILES)
  // Drive state to preview_ready (generating → preview_ready is allowed).
  h.workspace.state.transition("preview_ready")
  return branchName
}

describe("Publisher", () => {
  it("publish() pushes the run branch and opens a PR via pulls.create", async () => {
    await primeRun("run-100", "alice")
    const result = await h.publisher.publish({
      runId: "run-100",
      userId: "alice",
      fullName: "dash/test-repo",
      prTitle: "Add feature",
      prBody: "Body of PR",
    })

    expect(result.branchName).toBe("dash-build/alice-run-100")
    expect(result.prNumber).toBe(7)
    expect(result.prUrl).toContain("pull/7")
    expect(result.commitShas.length).toBeGreaterThan(0)

    expect(h.pullsCreate).toHaveBeenCalledTimes(1)
    const args = h.pullsCreate.mock.calls[0]?.[0] as {
      owner: string
      repo: string
      base: string
      head: string
      title: string
      body: string
    }
    expect(args.owner).toBe("dash")
    expect(args.repo).toBe("test-repo")
    expect(args.base).toBe("main")
    expect(args.head).toBe("dash-build/alice-run-100")
    expect(args.title).toBe("Add feature")
  })

  it("preview-shim does NOT land on the pushed branch", async () => {
    await primeRun("run-101", "bob")
    await h.publisher.publish({
      runId: "run-101",
      userId: "bob",
      fullName: "dash/test-repo",
      prTitle: "X",
      prBody: "Y",
    })

    // Inspect the bare repo's branch log: should contain ONLY trunk commits +
    // the generated commit. The shim's commit message must be absent.
    const log = await h.bareGit.log("dash-build/bob-run-101", { max: 20 })
    const messages = log.map((l) => l.message)
    expect(messages.some((m) => m.includes("preview shim"))).toBe(false)
    expect(messages.some((m) => m.includes("dash-build run"))).toBe(true)
  })

  it("publish() walks state preview_ready → publishing → sweep", async () => {
    await primeRun("run-102", "carol")
    expect(h.workspace.state.current()).toBe("preview_ready")
    await h.publisher.publish({
      runId: "run-102",
      userId: "carol",
      fullName: "dash/test-repo",
      prTitle: "T",
      prBody: "B",
    })
    expect(h.workspace.state.current()).toBe("sweep")
  })

  it("cleanup() deletes local branches + returns state to idle", async () => {
    await primeRun("run-103", "dave")
    await h.publisher.publish({
      runId: "run-103",
      userId: "dave",
      fullName: "dash/test-repo",
      prTitle: "T",
      prBody: "B",
    })
    await h.publisher.cleanup({ runId: "run-103", userId: "dave" })
    expect(h.workspace.state.current()).toBe("idle")
    const branches = (await h.cloneGit.run(["branch", "--list"])).stdout
    expect(branches).not.toContain("dash-build/dave-run-103")
    expect(branches).not.toContain("dash-build-extract/run-103")
  })

  it("publish() throws and rolls back when GitHub pulls.create fails", async () => {
    h.pullsCreate.mockRejectedValueOnce(new Error("403 forbidden"))
    await primeRun("run-104", "eve")
    await expect(
      h.publisher.publish({
        runId: "run-104",
        userId: "eve",
        fullName: "dash/test-repo",
        prTitle: "T",
        prBody: "B",
      }),
    ).rejects.toThrow(/forbidden/i)
    // The remote branch should still exist (push already succeeded) so the user
    // can retry the PR creation manually.
    const remote = await h.bareGit.run(["branch", "--list"])
    expect(remote.stdout).toContain("dash-build/eve-run-104")
  })
})
