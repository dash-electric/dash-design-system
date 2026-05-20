import { describe, it, expect } from "vitest"
import {
  getFile,
  createBranch,
  commitFiles,
  createPullRequest,
  submitChanges,
  listAccessibleRepos,
} from "../repo-ops.js"
import { GitHubAppClient } from "../client.js"
import {
  GitHubTokenStore,
  type GitHubInstallation,
} from "../token-store.js"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"

type Call = { name: string; args: unknown }

/** Build a minimal Octokit-shaped mock that records calls and replies from a script. */
function mockOctokit(handlers: Record<string, (args: any) => any>) {
  const calls: Call[] = []
  const wrap = (name: string) => async (args: any) => {
    calls.push({ name, args })
    const handler = handlers[name]
    if (!handler) throw new Error(`Unhandled mock call: ${name}`)
    return handler(args)
  }
  const octokit = {
    rest: {
      apps: {
        listReposAccessibleToInstallation: wrap("apps.listReposAccessibleToInstallation"),
      },
      repos: {
        getContent: wrap("repos.getContent"),
        get: wrap("repos.get"),
      },
      git: {
        getRef: wrap("git.getRef"),
        createRef: wrap("git.createRef"),
        updateRef: wrap("git.updateRef"),
        getCommit: wrap("git.getCommit"),
        createBlob: wrap("git.createBlob"),
        createTree: wrap("git.createTree"),
        createCommit: wrap("git.createCommit"),
      },
      pulls: {
        create: wrap("pulls.create"),
      },
    },
  }
  return { octokit: octokit as any, calls }
}

async function makeConnectedClient(): Promise<{
  client: GitHubAppClient
  octokit: any
  calls: Call[]
  cleanup: () => Promise<void>
}> {
  const dir = await mkdtemp(join(tmpdir(), "dash-build-gh-"))
  const filePath = join(dir, "github.json")
  const machineKey = randomBytes(32)
  const store = new GitHubTokenStore({ path: filePath, machineKey })
  const installation: GitHubInstallation = {
    installationId: 1,
    user: "octocat",
    accessibleRepos: [{ name: "demo", fullName: "octocat/demo", private: false }],
    installedAt: "2026-05-21T00:00:00.000Z",
  }
  await store.save(installation)

  const handlers: Record<string, (args: any) => any> = {}
  const mock = mockOctokit(handlers)
  const client = new GitHubAppClient({ store, factory: async () => mock.octokit })

  return {
    client,
    octokit: mock.octokit,
    calls: mock.calls,
    cleanup: async () => rm(dir, { recursive: true, force: true }),
  }
}

describe("listAccessibleRepos", () => {
  it("returns repos from the cached installation without hitting the API", async () => {
    const ctx = await makeConnectedClient()
    try {
      const repos = await listAccessibleRepos(ctx.client)
      expect(repos).toEqual([{ name: "demo", fullName: "octocat/demo", private: false }])
      expect(ctx.calls).toHaveLength(0)
    } finally {
      await ctx.cleanup()
    }
  })
})

describe("getFile", () => {
  it("decodes base64 file content", async () => {
    const mock = mockOctokit({
      "repos.getContent": () => ({
        data: {
          type: "file",
          content: Buffer.from("hello world", "utf8").toString("base64"),
          sha: "abc123",
        },
      }),
    })
    const result = await getFile({
      octokit: mock.octokit,
      owner: "octo",
      repo: "demo",
      path: "README.md",
      ref: "main",
    })
    expect(result.content).toBe("hello world")
    expect(result.sha).toBe("abc123")
    expect(mock.calls[0]?.args).toMatchObject({ owner: "octo", repo: "demo", path: "README.md", ref: "main" })
  })

  it("throws when the path points to a directory", async () => {
    const mock = mockOctokit({
      "repos.getContent": () => ({ data: [] }),
    })
    await expect(
      getFile({ octokit: mock.octokit, owner: "o", repo: "r", path: "src" }),
    ).rejects.toThrow(/directory/i)
  })
})

describe("createBranch", () => {
  it("creates a ref from the base branch SHA", async () => {
    const mock = mockOctokit({
      "git.getRef": () => ({ data: { object: { sha: "base-sha" } } }),
      "git.createRef": () => ({ data: { ref: "refs/heads/feature" } }),
    })
    const result = await createBranch({
      octokit: mock.octokit,
      owner: "o",
      repo: "r",
      baseBranch: "main",
      newBranch: "feature",
    })
    expect(result.sha).toBe("base-sha")
    expect(mock.calls[1]?.args).toMatchObject({
      ref: "refs/heads/feature",
      sha: "base-sha",
    })
  })

  it("swallows 'already exists' when allowExisting is true", async () => {
    const conflict = Object.assign(new Error("Reference already exists"), { status: 422 })
    const mock = mockOctokit({
      "git.getRef": () => ({ data: { object: { sha: "base-sha" } } }),
      "git.createRef": () => {
        throw conflict
      },
    })
    await expect(
      createBranch({
        octokit: mock.octokit,
        owner: "o",
        repo: "r",
        baseBranch: "main",
        newBranch: "feature",
        allowExisting: true,
      }),
    ).resolves.toEqual({ sha: "base-sha" })
  })

  it("rethrows conflict when allowExisting is false", async () => {
    const conflict = Object.assign(new Error("Reference already exists"), { status: 422 })
    const mock = mockOctokit({
      "git.getRef": () => ({ data: { object: { sha: "base-sha" } } }),
      "git.createRef": () => {
        throw conflict
      },
    })
    await expect(
      createBranch({
        octokit: mock.octokit,
        owner: "o",
        repo: "r",
        baseBranch: "main",
        newBranch: "feature",
      }),
    ).rejects.toThrow(/already exists/i)
  })
})

describe("commitFiles", () => {
  it("rejects empty file lists", async () => {
    const mock = mockOctokit({})
    await expect(
      commitFiles({
        octokit: mock.octokit,
        owner: "o",
        repo: "r",
        branch: "feature",
        message: "no files",
        files: [],
      }),
    ).rejects.toThrow(/non-empty/i)
  })

  it("creates a single commit for a single file", async () => {
    const mock = mockOctokit({
      "git.getRef": () => ({ data: { object: { sha: "parent-sha" } } }),
      "git.getCommit": () => ({ data: { tree: { sha: "parent-tree" } } }),
      "git.createBlob": (args: any) => ({ data: { sha: `blob-${args.content.length}` } }),
      "git.createTree": () => ({ data: { sha: "new-tree" } }),
      "git.createCommit": () => ({ data: { sha: "new-commit" } }),
      "git.updateRef": () => ({ data: {} }),
    })
    const result = await commitFiles({
      octokit: mock.octokit,
      owner: "o",
      repo: "r",
      branch: "feature",
      message: "add file",
      files: [{ path: "a.txt", content: "hello" }],
    })
    expect(result).toEqual({ commitSha: "new-commit", treeSha: "new-tree" })
    const updateRefCall = mock.calls.find((c) => c.name === "git.updateRef")
    expect(updateRefCall?.args).toMatchObject({ ref: "heads/feature", sha: "new-commit" })
  })

  it("creates one blob per file and posts them all in a single tree", async () => {
    let blobCounter = 0
    const mock = mockOctokit({
      "git.getRef": () => ({ data: { object: { sha: "parent-sha" } } }),
      "git.getCommit": () => ({ data: { tree: { sha: "parent-tree" } } }),
      "git.createBlob": () => ({ data: { sha: `blob-${++blobCounter}` } }),
      "git.createTree": () => ({ data: { sha: "tree-multi" } }),
      "git.createCommit": () => ({ data: { sha: "commit-multi" } }),
      "git.updateRef": () => ({ data: {} }),
    })
    await commitFiles({
      octokit: mock.octokit,
      owner: "o",
      repo: "r",
      branch: "feature",
      message: "multi",
      files: [
        { path: "a.txt", content: "1" },
        { path: "b.txt", content: "22" },
        { path: "c.txt", content: "333" },
      ],
    })
    const blobCalls = mock.calls.filter((c) => c.name === "git.createBlob")
    expect(blobCalls).toHaveLength(3)
    const treeCall = mock.calls.find((c) => c.name === "git.createTree")
    expect((treeCall?.args as any).tree).toHaveLength(3)
    expect((treeCall?.args as any).base_tree).toBe("parent-tree")
  })
})

describe("createPullRequest", () => {
  it("posts to pulls.create and returns the number + url", async () => {
    const mock = mockOctokit({
      "pulls.create": () => ({ data: { number: 7, html_url: "https://github.com/o/r/pull/7" } }),
    })
    const result = await createPullRequest({
      octokit: mock.octokit,
      owner: "o",
      repo: "r",
      base: "main",
      head: "feature",
      title: "Add things",
      body: "Why we did it",
    })
    expect(result).toEqual({ prNumber: 7, prUrl: "https://github.com/o/r/pull/7" })
    expect(mock.calls[0]?.args).toMatchObject({
      base: "main",
      head: "feature",
      draft: false,
    })
  })
})

describe("submitChanges (end-to-end)", () => {
  it("runs branch + commit + PR in order and returns the PR info", async () => {
    const ctx = await makeConnectedClient()
    try {
      // Patch handlers into ctx.octokit's underlying handlers map by re-mocking.
      const order: string[] = []
      const mock = mockOctokit({
        "git.getRef": (args: any) => {
          order.push(`getRef:${args.ref}`)
          return { data: { object: { sha: "base-sha" } } }
        },
        "git.createRef": () => {
          order.push("createRef")
          return { data: {} }
        },
        "git.getCommit": () => ({ data: { tree: { sha: "parent-tree" } } }),
        "git.createBlob": () => ({ data: { sha: "blob-1" } }),
        "git.createTree": () => ({ data: { sha: "tree-1" } }),
        "git.createCommit": () => {
          order.push("createCommit")
          return { data: { sha: "commit-1" } }
        },
        "git.updateRef": () => {
          order.push("updateRef")
          return { data: {} }
        },
        "pulls.create": () => {
          order.push("pulls.create")
          return { data: { number: 11, html_url: "https://github.com/octocat/demo/pull/11" } }
        },
      })
      const client = new (await import("../client.js")).GitHubAppClient({
        store: (ctx.client as any).store,
        factory: async () => mock.octokit,
      })
      const result = await submitChanges({
        client,
        fullName: "octocat/demo",
        baseBranch: "main",
        newBranch: "dash-build/feature-1",
        files: [{ path: "out.txt", content: "ok" }],
        commitMessage: "chore: dash build commit",
        prTitle: "Dash Build run #1",
        prBody: "Generated by Dash Build",
      })
      expect(result.prNumber).toBe(11)
      expect(result.commitSha).toBe("commit-1")
      expect(result.branch).toBe("dash-build/feature-1")
      // Branch creation came before commit which came before PR.
      expect(order.indexOf("createRef")).toBeLessThan(order.indexOf("createCommit"))
      expect(order.indexOf("updateRef")).toBeLessThan(order.indexOf("pulls.create"))
    } finally {
      await ctx.cleanup()
    }
  })
})
