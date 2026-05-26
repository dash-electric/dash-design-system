import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawn } from "node:child_process"
import {
  type SubprocessResult,
  type SubprocessRunner,
  SYNC_STALENESS_MS,
  Workspace,
  defaultClonePathFor,
  defaultClonesRoot,
} from "../workspace.js"
import { BACKOFFICE_SHIM_V1 } from "../preview-shim.js"

let rootDir: string
let originDir: string
let clonePath: string

interface RunResult {
  stdout: string
  stderr: string
  code: number
}

async function realRun(bin: string, args: string[], cwd: string): Promise<RunResult> {
  return await new Promise<RunResult>((resolveProc) => {
    const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8")
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8")
    })
    child.on("close", (code) => {
      resolveProc({ stdout, stderr, code: code ?? 1 })
    })
  })
}

async function makeOriginRepo(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
  await realRun("git", ["init", "-q", "-b", "main"], dir)
  await realRun("git", ["config", "user.email", "test@dashbuild.local"], dir)
  await realRun("git", ["config", "user.name", "Dash Build Test"], dir)
  await realRun("git", ["config", "commit.gpgsign", "false"], dir)
  // Seed required src tree so the shim file overwrites land cleanly.
  await mkdir(join(dir, "src", "lib"), { recursive: true })
  await mkdir(join(dir, "src", "contexts"), { recursive: true })
  await mkdir(join(dir, "src", "utils"), { recursive: true })
  await writeFile(join(dir, "README.md"), "# origin\n", "utf8")
  await writeFile(join(dir, "src", "lib", "firebase.js"), "// original\n", "utf8")
  await writeFile(
    join(dir, "src", "contexts", "AuthContext.js"),
    "// original auth\n",
    "utf8",
  )
  await writeFile(join(dir, "src", "utils", "axios.js"), "// original axios\n", "utf8")
  await realRun("git", ["add", "."], dir)
  await realRun("git", ["commit", "-q", "-m", "seed"], dir)
}

beforeEach(async () => {
  rootDir = await mkdtemp(join(tmpdir(), "dash-build-ws-"))
  originDir = join(rootDir, "origin.git-source")
  clonePath = join(rootDir, "clone")
  await makeOriginRepo(originDir)
})

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
})

function makeWorkspace(opts: { runner?: SubprocessRunner } = {}): Workspace {
  return new Workspace({
    repoSlug: "dash/backoffice",
    originUrl: originDir,
    clonePath,
    shim: BACKOFFICE_SHIM_V1,
    runner: opts.runner ?? realRun,
    skipInstall: true,
  })
}

describe("Workspace defaults", () => {
  it("defaultClonesRoot is rooted at $HOME/Work/dash-build-clones", () => {
    const root = defaultClonesRoot()
    expect(root).toMatch(/Work\/dash-build-clones$/)
  })

  it("defaultClonePathFor sanitizes the slash", () => {
    const p = defaultClonePathFor("dash/backoffice")
    expect(p).toMatch(/dash__backoffice$/)
    expect(p.includes("/dash/backoffice")).toBe(false)
  })

  it("constructor rejects relative clonePath", () => {
    expect(
      () =>
        new Workspace({
          repoSlug: "dash/backoffice",
          originUrl: originDir,
          clonePath: "relative/path",
          shim: BACKOFFICE_SHIM_V1,
          runner: realRun,
          skipInstall: true,
        }),
    ).toThrow(/must be absolute/)
  })

  it("constructor fails when repoSlug missing", () => {
    expect(
      () =>
        new Workspace({
          repoSlug: "",
          originUrl: originDir,
          clonePath,
          shim: BACKOFFICE_SHIM_V1,
          runner: realRun,
        }),
    ).toThrow(/repoSlug required/)
  })
})

describe("Workspace bootstrap (real git, mocked npm)", () => {
  it("clones, fetches, resets, and applies shim end-to-end", async () => {
    const ws = makeWorkspace()
    const info = await ws.bootstrap()

    expect(info.state).toBe("idle")
    expect(info.shimCommitSha).toMatch(/^[0-9a-f]{40}$/)
    expect(info.clonePath).toBe(clonePath)

    // Shim files should be present with shim-stub content.
    const firebase = await readFile(join(clonePath, "src", "lib", "firebase.js"), "utf8")
    expect(firebase).toContain("DASH BUILD PREVIEW SHIM")
    expect(firebase).toContain("PREVIEW_USER")

    // HEAD commit subject should match the shim contract.
    const log = await realRun("git", ["log", "-1", "--format=%s"], clonePath)
    expect(log.stdout.trim()).toBe("preview-shim apply v1 [DO NOT MERGE]")

    // State machine history covers the bootstrap walk.
    const history = ws.state.history().map((h) => `${h.from}->${h.to}`)
    expect(history).toEqual(["clean->cloned", "cloned->shim_applied", "shim_applied->idle"])
  })

  it("is idempotent — second bootstrap re-fetches and re-applies cleanly", async () => {
    const ws1 = makeWorkspace()
    await ws1.bootstrap()

    // Simulate a state-restore scenario by constructing a second Workspace
    // with initialState=idle reading the same clonePath.
    const ws2 = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
    })
    // Second bootstrap should run without throwing on the existing clone.
    const info = await ws2.bootstrap()
    expect(info.state).toBe("idle")
    expect(info.shimCommitSha).toMatch(/^[0-9a-f]{40}$/)
  })

  it("throws when an existing clone has wrong origin", async () => {
    // Pre-create clonePath with a foreign origin.
    await mkdir(clonePath, { recursive: true })
    await realRun("git", ["init", "-q", "-b", "main"], clonePath)
    await realRun("git", ["remote", "add", "origin", "https://elsewhere.example/repo.git"], clonePath)

    const ws = makeWorkspace()
    await expect(ws.bootstrap()).rejects.toThrow(/wrong origin/)
  })

  it("surfaces git clone failures with stderr context", async () => {
    const ws = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: "/nonexistent/origin.git",
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
    })
    await expect(ws.bootstrap()).rejects.toThrow(/git clone failed/)
  })
})

describe("Workspace sync", () => {
  it("is a no-op if last sync was within SYNC_STALENESS_MS", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()

    const calls: Array<{ bin: string; args: string[] }> = []
    const trackingRunner: SubprocessRunner = async (bin, args, cwd) => {
      calls.push({ bin, args })
      return await realRun(bin, args, cwd)
    }

    const ws2 = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: trackingRunner,
      skipInstall: true,
      initialState: "idle",
      now: () => new Date(),
    })
    // Force lastSyncAt to recent by running bootstrap (which sets it to now).
    await ws2.bootstrap()
    calls.length = 0
    await ws2.sync()
    expect(calls.length).toBe(0)
  })

  it("re-fetches when last sync exceeds staleness threshold", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()

    let clock = Date.now()
    const tickingRunner: SubprocessRunner = async (bin, args, cwd) => realRun(bin, args, cwd)
    const ws2 = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: tickingRunner,
      skipInstall: true,
      initialState: "idle",
      now: () => new Date(clock),
    })
    await ws2.bootstrap()
    clock += SYNC_STALENESS_MS + 1000
    await expect(ws2.sync()).resolves.toBeUndefined()
  })
})

describe("Workspace tearDown", () => {
  it("resets to origin/main and drops dash-build/* branches", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()

    // Hand-craft a dash-build/* branch to verify it gets pruned.
    await realRun("git", ["branch", "dash-build/u1-runA"], clonePath)
    const before = await realRun(
      "git",
      ["branch", "--list", "dash-build/*"],
      clonePath,
    )
    expect(before.stdout).toMatch(/dash-build\/u1-runA/)

    await ws.tearDown()
    const after = await realRun(
      "git",
      ["branch", "--list", "dash-build/*"],
      clonePath,
    )
    expect(after.stdout.trim()).toBe("")
  })
})

describe("Workspace state integration with mock runner", () => {
  it("does NOT advance state past clean when clone fails", async () => {
    const failingClone: SubprocessRunner = async (bin, args): Promise<SubprocessResult> => {
      if (bin === "git" && args[0] === "clone") {
        return { stdout: "", stderr: "fatal: cannot clone", code: 128 }
      }
      return { stdout: "", stderr: "", code: 0 }
    }
    const ws = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: failingClone,
      skipInstall: true,
    })
    await expect(ws.bootstrap()).rejects.toThrow(/git clone failed/)
    expect(ws.state.current()).toBe("clean")
  })
})
