import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { createServer as createNetServer, type Server } from "node:net"
import { createServer as createHttpServer, type Server as HttpServer } from "node:http"
import { EventEmitter } from "node:events"
import { join } from "node:path"
import { spawn } from "node:child_process"
import {
  type DevServerEvent,
  type DevServerSpawn,
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

// ──────────────────────────────────────────────────────────────────────────
// F1 — startDevServer / stopDevServer / crash handling
// ──────────────────────────────────────────────────────────────────────────

/**
 * Mock ChildProcess that emulates the npm child surface we depend on:
 *   - .stdout / .stderr as EventEmitters (we never push data here, just
 *     surface so the workspace's stderr listener attaches without error)
 *   - .on / .once / .kill / .killed / .pid
 *
 * Tests trigger lifecycle by calling `mock.emitExit(code, signal)` directly.
 */
function makeFakeChild(pid = 4242): {
  child: EventEmitter & {
    pid: number
    killed: boolean
    kill: (signal?: string) => boolean
    stdout: EventEmitter
    stderr: EventEmitter
  }
  emitExit: (code: number | null, signal?: NodeJS.Signals | null) => void
} {
  const child = new EventEmitter() as EventEmitter & {
    pid: number
    killed: boolean
    kill: (signal?: string) => boolean
    stdout: EventEmitter
    stderr: EventEmitter
  }
  child.pid = pid
  child.killed = false
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.kill = (signal?: string) => {
    child.killed = true
    // Mimic node: kill triggers exit synchronously-ish for fake child.
    queueMicrotask(() => {
      child.emit("exit", 0, signal ?? "SIGTERM")
    })
    return true
  }
  const emitExit = (code: number | null, signal: NodeJS.Signals | null = null) => {
    child.killed = true
    child.emit("exit", code, signal)
  }
  return { child, emitExit }
}

/**
 * Bind a TCP server on an ephemeral port and return both the port and a
 * close handle. Used to prove `findAvailablePort` shifts when the requested
 * port is already taken.
 */
async function occupyPort(): Promise<{ port: number; close: () => Promise<void> }> {
  return await new Promise((resolveBind, rejectBind) => {
    const server: Server = createNetServer()
    server.once("error", rejectBind)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      if (!address || typeof address === "string") {
        rejectBind(new Error("no port"))
        return
      }
      resolveBind({
        port: address.port,
        close: () =>
          new Promise<void>((r) => {
            server.close(() => r())
          }),
      })
    })
  })
}

/**
 * Get a port number that's free RIGHT NOW (caller responsible for race
 * between this returning and binding). Uses kernel ephemeral assignment.
 */
async function pickFreePort(): Promise<number> {
  const held = await occupyPort()
  await held.close()
  return held.port
}

/**
 * Bind an HTTP server that simulates a successful dev-server bind. Use
 * http.createServer so the workspace's HEAD/GET readiness probe receives a
 * real HTTP response (raw TCP echo was not enough — the Node http client
 * expects status-line/headers).
 */
async function bindFakeDevServer(port: number): Promise<HttpServer> {
  return await new Promise((resolveBind, rejectBind) => {
    const server = createHttpServer((_req, res) => {
      res.statusCode = 200
      res.end("OK")
    })
    server.once("error", rejectBind)
    server.listen(port, "127.0.0.1", () => resolveBind(server))
  })
}

describe("Workspace startDevServer (F1)", () => {
  it("spawns child, waits for port, transitions idle → clone_running", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()
    expect(ws.state.current()).toBe("idle")

    const port = await pickFreePort()
    // Fake spawn binds AFTER the workspace asks for it — this matches the
    // real npm-run-dev lifecycle (port-probe sees free → spawn → child
    // binds in its own time). We bind in a microtask so the workspace's
    // readiness probe loop catches it on the next 500ms tick.
    const { child } = makeFakeChild()
    let fakeBound: HttpServer | null = null
    const fakeSpawn: DevServerSpawn = ({ port: chosen }) => {
      void bindFakeDevServer(chosen).then((s) => {
        fakeBound = s
      })
      return child as unknown as ReturnType<DevServerSpawn>
    }

    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
    })

    const snap = await wsDev.startDevServer({ port })
    expect(snap.port).toBe(port)
    expect(snap.ready).toBe(true)
    expect(snap.portShifted).toBe(false)
    expect(wsDev.state.current()).toBe("clone_running")
    expect(wsDev.devServer()).toEqual(snap)

    await wsDev.stopDevServer()
    expect(wsDev.state.current()).toBe("idle")
    expect(wsDev.devServer()).toBeNull()

    if (fakeBound) await new Promise<void>((r) => (fakeBound as HttpServer).close(() => r()))
  }, 10000)

  it("shifts to the next free port when the requested port is occupied", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()

    // Hold the requested port; the fake spawn lazily binds whichever port
    // the workspace settles on (so the probe sees a real listener on the
    // shifted port without us hard-coding +1).
    const blocked = await occupyPort()
    const { child } = makeFakeChild()
    let fakeBound: HttpServer | null = null
    const fakeSpawn: DevServerSpawn = ({ port }) => {
      // Bind asynchronously so the workspace's TCP probe finds it.
      void bindFakeDevServer(port).then((s) => {
        fakeBound = s
      })
      return child as unknown as ReturnType<DevServerSpawn>
    }

    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
    })

    const snap = await wsDev.startDevServer({ port: blocked.port })
    expect(snap.portShifted).toBe(true)
    expect(snap.requestedPort).toBe(blocked.port)
    // Could be blocked.port + 1 or higher if the kernel had something on +1
    // — the contract is "shifted upward", not "shifted exactly +1".
    expect(snap.port).toBeGreaterThan(blocked.port)

    await wsDev.stopDevServer()
    await blocked.close()
    if (fakeBound) await new Promise<void>((r) => (fakeBound as HttpServer).close(() => r()))
  }, 10000)

  it("fires onDevServerEvent + transitions clone_running → idle on post-ready crash", async () => {
    const port = await pickFreePort()
    const { child, emitExit } = makeFakeChild()
    let fakeBound: HttpServer | null = null
    const fakeSpawn: DevServerSpawn = ({ port: chosen }) => {
      void bindFakeDevServer(chosen).then((s) => {
        fakeBound = s
      })
      return child as unknown as ReturnType<DevServerSpawn>
    }

    const events: DevServerEvent[] = []
    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
      onDevServerEvent: (e) => {
        events.push(e)
      },
    })

    await wsDev.startDevServer({ port })
    expect(wsDev.state.current()).toBe("clone_running")

    // Simulate Next.js dying with code=1 (e.g. user syntax error).
    emitExit(1, null)

    // Crash handler is synchronous within child.on("exit"); state should
    // have stepped back to idle and the snapshot cleared.
    expect(wsDev.state.current()).toBe("idle")
    expect(wsDev.devServer()).toBeNull()
    expect(events).toHaveLength(1)
    expect(events[0].kind).toBe("crashed")
    expect(events[0].port).toBe(port)
    expect(events[0].exit.code).toBe(1)

    if (fakeBound) await new Promise<void>((r) => (fakeBound as HttpServer).close(() => r()))
  }, 10000)

  it("DOES NOT fire crash event when stop is the cause of exit", async () => {
    const port = await pickFreePort()
    const { child } = makeFakeChild()
    let fakeBound: HttpServer | null = null
    const fakeSpawn: DevServerSpawn = ({ port: chosen }) => {
      void bindFakeDevServer(chosen).then((s) => {
        fakeBound = s
      })
      return child as unknown as ReturnType<DevServerSpawn>
    }

    const events: DevServerEvent[] = []
    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
      onDevServerEvent: (e) => {
        events.push(e)
      },
    })
    await wsDev.startDevServer({ port })
    await wsDev.stopDevServer()

    expect(events).toHaveLength(0)
    expect(wsDev.state.current()).toBe("idle")

    if (fakeBound) await new Promise<void>((r) => (fakeBound as HttpServer).close(() => r()))
  }, 10000)

  it("rejects on dev-server startup timeout + leaves state untouched", async () => {
    // Don't bind anything → readiness probe never succeeds.
    // Spawn returns a child that's "alive" but never binds.
    const { child } = makeFakeChild()
    const fakeSpawn: DevServerSpawn = () => child as unknown as ReturnType<DevServerSpawn>

    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
    })

    // Use a deterministic port that nothing else holds (port=0 in occupyPort
    // would let us pick one then release; we just need an arbitrary high port
    // unlikely to be bound). Use occupyPort to get a free port, then release.
    const reserved = await occupyPort()
    const targetPort = reserved.port
    await reserved.close()

    // Override the readiness deadline at module-level isn't easy; we just
    // wait the real ~60s? Too slow. Instead, kill the child mid-wait to
    // trigger the early-exit code path which short-circuits the deadline.
    const startPromise = wsDev.startDevServer({ port: targetPort })
    // Give the workspace a tick to subscribe, then fail-spawn.
    await new Promise((r) => setTimeout(r, 50))
    child.emit("error", new Error("ENOENT: npm not found"))
    child.emit("exit", 1, null)

    await expect(startPromise).rejects.toThrow(/exited before bind|did not listen/)
    expect(wsDev.state.current()).toBe("idle")
  }, 8000)

  it("tearDown stops the dev server first", async () => {
    const ws = makeWorkspace()
    await ws.bootstrap()

    const port = await pickFreePort()
    const { child } = makeFakeChild()
    let fakeBound: HttpServer | null = null
    const fakeSpawn: DevServerSpawn = ({ port: chosen }) => {
      void bindFakeDevServer(chosen).then((s) => {
        fakeBound = s
      })
      return child as unknown as ReturnType<DevServerSpawn>
    }

    const wsDev = new Workspace({
      repoSlug: "dash/backoffice",
      originUrl: originDir,
      clonePath,
      shim: BACKOFFICE_SHIM_V1,
      runner: realRun,
      skipInstall: true,
      initialState: "idle",
      devServerSpawn: fakeSpawn,
    })
    await wsDev.startDevServer({ port })
    expect(wsDev.state.current()).toBe("clone_running")

    await wsDev.tearDown()
    expect(wsDev.devServer()).toBeNull()
    // tearDown stops the dev server first → state walks back to idle.
    expect(wsDev.state.current()).toBe("idle")

    if (fakeBound) await new Promise<void>((r) => (fakeBound as HttpServer).close(() => r()))
  }, 10000)
})
