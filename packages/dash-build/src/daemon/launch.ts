import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { writePidFile } from "./pid-file.js"

/**
 * Resolve the path to the built daemon entry (`dist/daemon.js`). When running
 * from source (tests, dev), we fall back to a placeholder script so the spawn
 * doesn't blow up.
 */
function resolveDaemonEntry(): string | null {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    // From dist/launch.js → dist/daemon.js sits alongside.
    const candidate = resolve(here, "daemon.js")
    if (existsSync(candidate)) return candidate
    // From src/daemon/launch.ts → packages/dash-build/dist/daemon.js
    const distCandidate = resolve(here, "../../dist/daemon.js")
    if (existsSync(distCandidate)) return distCandidate
  } catch {
    // ignore — fall back to placeholder
  }
  return null
}

export interface LaunchDaemonOptions {
  port: number
  mode?: "attached" | "detached"
  /**
   * Path to the daemon entry script. Defaults to the bundled
   * `dist/daemon.js`. When that file is missing (running directly from src
   * in tests/dev) a short-lived placeholder script is spawned instead.
   */
  entry?: string
}

export interface LaunchedDaemon {
  pid: number
  port: number
  pidFile: string
}

/**
 * Launch the daemon as a child process. When the bundled `dist/daemon.js`
 * is present (production path), node spawns the real HTTP server. When
 * absent (dev / tests running from src) a short-lived placeholder process
 * is spawned so the menu + dispatcher can be exercised without crashing.
 */
export async function launchDaemon(opts: LaunchDaemonOptions): Promise<LaunchedDaemon> {
  const mode = opts.mode ?? "detached"
  const builtEntry = opts.entry ?? resolveDaemonEntry()

  const spawnArgs = builtEntry
    ? [builtEntry]
    : [
        "-e",
        `console.log("[dash-build daemon placeholder] listening on port ${opts.port}");`,
      ]

  const child = spawn(process.execPath, spawnArgs, {
    detached: mode === "detached",
    stdio: mode === "detached" ? "ignore" : "inherit",
    env: {
      ...process.env,
      DASH_BUILD_PORT: String(opts.port),
    },
  })

  if (mode === "detached") {
    child.unref()
  }

  if (!child.pid) {
    throw new Error("Failed to spawn daemon child process")
  }

  const pidFile = await writePidFile(child.pid)

  return { pid: child.pid, port: opts.port, pidFile }
}
