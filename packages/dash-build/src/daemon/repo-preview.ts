import { existsSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"
import { spawn, type ChildProcess } from "node:child_process"
import http from "node:http"

export type RepoPreviewStatus =
  | "not_configured"
  | "missing"
  | "dependencies_missing"
  | "stopped"
  | "starting"
  | "running"
  | "failed"

export interface RepoPreviewConfig {
  repo: string
  dir: string
  port: number
  url: string
  installCommand: string
  startCommand: string
}

export interface RepoPreviewInfo extends RepoPreviewConfig {
  status: RepoPreviewStatus
  message: string
  pid?: number
  error?: string
}

interface ManagedProcess {
  child: ChildProcess
  status: RepoPreviewStatus
  error?: string
}

const managed = new Map<string, ManagedProcess>()

export function resolveRepoPreviewConfig(repo: string | null | undefined): RepoPreviewConfig | null {
  if (!repo) return null
  const dashRoot = process.env.DASH_BUILD_DASH_ROOT ?? path.join(homedir(), "Dash")
  const configs: Record<string, { dir: string; port: number }> = {
    "dash/portal-v2": {
      dir: process.env.DASH_BUILD_PORTAL_V2_PATH ?? path.join(dashRoot, "next-portal-v2-web"),
      port: Number(process.env.DASH_BUILD_PORTAL_V2_PORT ?? 3100),
    },
    "dash/backoffice": {
      dir: process.env.DASH_BUILD_BACKOFFICE_PATH ?? path.join(dashRoot, "next-backoffice-web"),
      port: Number(process.env.DASH_BUILD_BACKOFFICE_PORT ?? 3101),
    },
  }
  const hit = configs[repo]
  if (!hit) return null
  return {
    repo,
    dir: hit.dir,
    port: hit.port,
    url: `http://127.0.0.1:${hit.port}`,
    installCommand: `cd ${shellQuote(hit.dir)} && npm install`,
    startCommand: `cd ${shellQuote(hit.dir)} && npm run dev -- -p ${hit.port}`,
  }
}

export async function getRepoPreviewInfo(repo: string | null | undefined): Promise<RepoPreviewInfo | null> {
  const config = resolveRepoPreviewConfig(repo)
  if (!config) return null
  const local = managed.get(config.repo)
  const exists = existsSync(config.dir)
  if (!exists) {
    return {
      ...config,
      status: "missing",
      message: "Local repo folder was not found on this machine.",
    }
  }

  if (await isHttpReachable(config.url)) {
    return {
      ...config,
      status: "running",
      message: "Local dev server is running.",
      pid: local?.child.pid,
    }
  }

  if (local?.status === "starting") {
    return {
      ...config,
      status: "starting",
      message: "Starting local dev server…",
      pid: local.child.pid,
    }
  }
  if (local?.status === "failed") {
    return {
      ...config,
      status: "failed",
      message: "Local dev server failed to start.",
      error: local.error,
    }
  }

  if (!existsSync(path.join(config.dir, "node_modules"))) {
    return {
      ...config,
      status: "dependencies_missing",
      message: "Dependencies are not installed for this local repo yet.",
    }
  }

  return {
    ...config,
    status: "stopped",
    message: "Local dev server is not running.",
  }
}

export async function startRepoPreview(repo: string | null | undefined): Promise<RepoPreviewInfo | null> {
  const before = await getRepoPreviewInfo(repo)
  if (!before) return null
  if (before.status === "running" || before.status === "starting") return before
  if (before.status === "missing" || before.status === "dependencies_missing") return before

  const child = spawn("npm", ["run", "dev", "--", "-p", String(before.port)], {
    cwd: before.dir,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PORT: String(before.port),
      BROWSER: "none",
    },
  })
  child.unref()
  const entry: ManagedProcess = { child, status: "starting" }
  managed.set(before.repo, entry)

  child.once("exit", (code, signal) => {
    const current = managed.get(before.repo)
    if (!current || current.child.pid !== child.pid) return
    current.status = "failed"
    current.error = `Process exited with ${signal ?? code ?? "unknown"}`
  })

  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    if (await isHttpReachable(before.url)) {
      entry.status = "running"
      return getRepoPreviewInfo(repo)
    }
    await sleep(500)
  }

  return {
    ...before,
    status: "starting",
    message: "Local dev server is still starting.",
    pid: child.pid,
  }
}

function isHttpReachable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 800 }, (res) => {
      res.resume()
      resolve(Boolean(res.statusCode && res.statusCode < 500))
    })
    req.on("timeout", () => {
      req.destroy()
      resolve(false)
    })
    req.on("error", () => resolve(false))
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}
