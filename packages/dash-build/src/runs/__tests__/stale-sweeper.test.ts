import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import { StaleSweeper, type SweepEvent } from "../stale-sweeper.js"
import { GitHubAppClient } from "../../integrations/github/client.js"
import {
  GitHubTokenStore,
  type GitHubInstallation,
} from "../../integrations/github/token-store.js"

let dir: string

interface Branch {
  name: string
  sha: string
  /** ISO commit date used by the mock git.getCommit handler. */
  date: string
}

interface MockOpts {
  branches: Branch[]
  /** Optional override for branches that should error on deleteRef. */
  deleteFails?: Set<string>
}

interface MockState {
  octokit: any
  calls: Array<{ name: string; args: unknown }>
  deletedRefs: string[]
}

function makeMock(opts: MockOpts): MockState {
  const calls: Array<{ name: string; args: unknown }> = []
  const deleted: string[] = []
  const remaining = opts.branches.slice()
  const deleteFails = opts.deleteFails ?? new Set<string>()

  const octokit = {
    rest: {
      apps: {
        listReposAccessibleToInstallation: async (args: any) => {
          calls.push({ name: "apps.listReposAccessibleToInstallation", args })
          return { data: { repositories: [] } }
        },
      },
      repos: {
        listBranches: async (args: any) => {
          calls.push({ name: "repos.listBranches", args })
          // Single page — return all.
          if (args.page > 1) return { data: [] }
          return {
            data: remaining.map((b) => ({
              name: b.name,
              commit: { sha: b.sha },
            })),
          }
        },
      },
      git: {
        getCommit: async (args: any) => {
          calls.push({ name: "git.getCommit", args })
          const branch = remaining.find((b) => b.sha === args.commit_sha)
          if (!branch) throw new Error(`unknown sha ${args.commit_sha}`)
          return { data: { author: { date: branch.date } } }
        },
        deleteRef: async (args: any) => {
          calls.push({ name: "git.deleteRef", args })
          const ref = String(args.ref).replace(/^heads\//, "")
          if (deleteFails.has(ref)) {
            throw new Error(`mock delete failure for ${ref}`)
          }
          deleted.push(ref)
          const idx = remaining.findIndex((b) => b.name === ref)
          if (idx >= 0) remaining.splice(idx, 1)
        },
      },
    },
  }

  return { octokit, calls, deletedRefs: deleted }
}

async function makeConnectedClient(
  mock: MockState,
): Promise<{ client: GitHubAppClient; cleanup: () => Promise<void> }> {
  const machineKey = randomBytes(32)
  const filePath = join(dir, "github.json")
  const store = new GitHubTokenStore({ path: filePath, machineKey })
  const installation: GitHubInstallation = {
    installationId: 7,
    user: "octocat",
    accessibleRepos: [{ name: "demo", fullName: "octocat/demo", private: false }],
    installedAt: "2026-05-21T00:00:00.000Z",
  }
  await store.save(installation)

  const client = new GitHubAppClient({
    store,
    factory: async () => mock.octokit,
  })
  return {
    client,
    cleanup: async () => rm(dir, { recursive: true, force: true }),
  }
}

const NOW = new Date("2026-05-26T12:00:00Z")
const daysAgo = (n: number): string =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-sweeper-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
})

describe("StaleSweeper", () => {
  it("identifies branches older than maxAgeDays as stale (dryRun mode)", async () => {
    const mock = makeMock({
      branches: [
        { name: "dash-build/run-fresh", sha: "sha-fresh", date: daysAgo(2) },
        { name: "dash-build/run-old", sha: "sha-old", date: daysAgo(10) },
        { name: "dash-build/run-edge", sha: "sha-edge", date: daysAgo(7) },
        // Non-matching prefix — must be ignored.
        { name: "feature/not-ours", sha: "sha-other", date: daysAgo(100) },
      ],
    })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: true,
        maxAgeDays: 7,
        now: () => NOW,
      })
      const report = await sweeper.sweep("octocat/demo")
      // 3 dash-build/* branches scanned (feature/* filtered out).
      expect(report.scanned).toBe(3)
      const staleNames = report.stale.map((s) => s.branch).sort()
      expect(staleNames).toEqual(["dash-build/run-edge", "dash-build/run-old"])
      // dryRun → no deletes.
      expect(report.deleted).toBe(0)
      expect(report.dryRun).toBe(true)
      expect(mock.deletedRefs).toHaveLength(0)
    } finally {
      await cleanup()
    }
  })

  it("deletes stale branches when dryRun=false", async () => {
    const mock = makeMock({
      branches: [
        { name: "dash-build/run-fresh", sha: "sha-fresh", date: daysAgo(1) },
        { name: "dash-build/run-old", sha: "sha-old", date: daysAgo(30) },
      ],
    })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: false,
        maxAgeDays: 7,
        now: () => NOW,
      })
      const report = await sweeper.sweep("octocat/demo")
      expect(report.deleted).toBe(1)
      expect(report.kept).toBe(1)
      expect(mock.deletedRefs).toEqual(["dash-build/run-old"])
      // The deleteRef call used the `heads/<branch>` ref convention.
      const deleteCall = mock.calls.find((c) => c.name === "git.deleteRef")
      expect(deleteCall?.args).toMatchObject({
        ref: "heads/dash-build/run-old",
      })
    } finally {
      await cleanup()
    }
  })

  it("emits started + per-branch + completed events when broadcaster supplied", async () => {
    const mock = makeMock({
      branches: [
        { name: "dash-build/run-old", sha: "sha-old", date: daysAgo(30) },
      ],
    })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const events: SweepEvent[] = []
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: false,
        maxAgeDays: 7,
        now: () => NOW,
        broadcaster: (ev) => events.push(ev),
      })
      await sweeper.sweep("octocat/demo")
      const types = events.map((e) => e.type)
      expect(types[0]).toBe("sweep:started")
      expect(types).toContain("sweep:branch_deleted")
      expect(types[types.length - 1]).toBe("sweep:completed")
    } finally {
      await cleanup()
    }
  })

  it("records delete errors in the report instead of throwing", async () => {
    const mock = makeMock({
      branches: [
        { name: "dash-build/run-old", sha: "sha-old", date: daysAgo(30) },
      ],
      deleteFails: new Set(["dash-build/run-old"]),
    })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: false,
        maxAgeDays: 7,
        now: () => NOW,
      })
      const report = await sweeper.sweep("octocat/demo")
      expect(report.errors).toHaveLength(1)
      expect(report.errors[0].branch).toBe("dash-build/run-old")
      expect(report.deleted).toBe(0)
    } finally {
      await cleanup()
    }
  })

  it("only scans branches matching the configured prefix", async () => {
    const mock = makeMock({
      branches: [
        { name: "feature/x", sha: "sha-fx", date: daysAgo(30) },
        { name: "release/1.0", sha: "sha-r1", date: daysAgo(30) },
        { name: "dash-build/run-1", sha: "sha-d1", date: daysAgo(30) },
      ],
    })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: true,
        maxAgeDays: 7,
        now: () => NOW,
      })
      const report = await sweeper.sweep("octocat/demo")
      expect(report.scanned).toBe(1)
    } finally {
      await cleanup()
    }
  })

  it("schedule() returns a cancel function and does not block the event loop", async () => {
    const mock = makeMock({ branches: [] })
    const { client, cleanup } = await makeConnectedClient(mock)
    try {
      const sweeper = new StaleSweeper({
        githubClient: client,
        dryRun: true,
        maxAgeDays: 7,
        now: () => NOW,
      })
      const cancel = sweeper.schedule("octocat/demo", 24)
      expect(typeof cancel).toBe("function")
      cancel()
    } finally {
      await cleanup()
    }
  })
})
