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

export type RepoPreviewMode = "local-dev" | "mock-shell"
export type RepoPreviewAuthMode =
  | "none"
  | "real-session-required"
  | "preview-harness-required"

export interface RepoPreviewAuthStrategy {
  mode: RepoPreviewAuthMode
  summary: string
  sessionKeys: string[]
  routes: string[]
  unblockPlan: string[]
}

export interface RepoBaselineModel {
  repo: string
  label: string
  surface: string
  audience: string
  theme: string
  previewMode: RepoPreviewMode
  defaultRoute: string
  description: string
  shell: {
    title: string
    nav: string[]
    primaryAction: string
    contentHints: string[]
  }
  unavailableReason?: string
}

export interface RepoManifestEntry {
  id: string
  label: string
  surface: string
  audience: string
  theme: string
  previewMode: RepoPreviewMode
  defaultRoute: string
  auth: RepoPreviewAuthStrategy
  baselineDescription: string
  localDirEnv: string
  localDirName: string
  portEnv: string
  defaultPort: number
  shell: RepoBaselineModel["shell"]
}

export interface RepoPreviewInfo extends RepoPreviewConfig {
  metadata: RepoManifestEntry
  baseline: RepoBaselineModel
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

export const REPO_PREVIEW_MANIFEST: readonly RepoManifestEntry[] = [
  {
    id: "dash/portal-v2",
    label: "Portal v2",
    surface: "Consumer ride portal",
    audience: "Dash riders and customer support operators",
    theme: "ride",
    previewMode: "local-dev",
    defaultRoute: "/en/deliveries",
    auth: {
      mode: "real-session-required",
      summary:
        "Portal preview needs a real client session before protected routes can render.",
      sessionKeys: ["localStorage.clientUserToken", "localStorage.user", "localStorage.envMode"],
      routes: ["/en/deliveries", "/en/billing", "/en/users"],
      unblockPlan: [
        "Run portal-v2 locally against staging or sandbox API.",
        "Log in top-level with a verified test account so clientUserToken and user are seeded on the portal origin.",
        "Use sandbox mode via localStorage.envMode=sandbox or the existing UI toggle when available.",
        "For Dash Build generated previews, render DS blocks in a first-party preview harness with mocked AuthProvider and fixture API data.",
      ],
    },
    baselineDescription:
      "Ride-facing portal shell with customer navigation, booking context, and account surfaces.",
    localDirEnv: "DASH_BUILD_PORTAL_V2_PATH",
    localDirName: "next-portal-v2-web",
    portEnv: "DASH_BUILD_PORTAL_V2_PORT",
    defaultPort: 3100,
    shell: {
      title: "Portal v2 baseline",
      nav: ["Home", "Trips", "Payments", "Support"],
      primaryAction: "Preview rider flow",
      contentHints: [
        "Customer-facing ride workspace",
        "Trip list and booking entry points",
        "Account, payment, and support modules",
      ],
    },
  },
  {
    id: "dash/backoffice",
    label: "Backoffice",
    surface: "Internal operations console",
    audience: "Dash operations, HR, finance, and admin teams",
    theme: "ride",
    previewMode: "local-dev",
    defaultRoute: "/delivery",
    auth: {
      mode: "preview-harness-required",
      summary:
        "Backoffice protected pages render blank until AuthContext finds a valid backend session.",
      sessionKeys: [
        "cookie/localStorage token",
        "cookie/localStorage dashelectric_user",
        "localStorage accessToken",
        "localStorage dashelectric_token",
      ],
      routes: ["/delivery", "/provider", "/broadcast", "/pitstop"],
      unblockPlan: [
        "Run backoffice locally with staging Firebase/API env values.",
        "Open the app top-level for a real Google/Firebase login when manual review needs real data.",
        "Do not add a production auth bypass in the source repo.",
        "For Dash Build generated previews, mount the target page/block in a first-party preview harness with mocked UserAuth and fixture API data.",
      ],
    },
    baselineDescription:
      "Internal admin shell for operational dashboards, mitra workflows, payroll, and compliance review.",
    localDirEnv: "DASH_BUILD_BACKOFFICE_PATH",
    localDirName: "next-backoffice-web",
    portEnv: "DASH_BUILD_BACKOFFICE_PORT",
    defaultPort: 3101,
    shell: {
      title: "Backoffice baseline",
      nav: ["Dashboard", "Mitra", "Orders", "Payroll", "Audit"],
      primaryAction: "Open ops workspace",
      contentHints: [
        "Dense admin navigation for repeated operations work",
        "Mitra, payroll, order, and audit workflows",
        "Role-aware internal tooling surface",
      ],
    },
  },
]

export function listRepoPreviewManifests(): RepoManifestEntry[] {
  return [...REPO_PREVIEW_MANIFEST]
}

export function resolveRepoManifest(repo: string | null | undefined): RepoManifestEntry | null {
  if (!repo) return null
  return REPO_PREVIEW_MANIFEST.find((entry) => entry.id === repo) ?? null
}

export function isRepoPreviewAllowed(repo: string | null | undefined): repo is string {
  return Boolean(resolveRepoManifest(repo))
}

export function resolveRepoPreviewConfig(repo: string | null | undefined): RepoPreviewConfig | null {
  const manifest = resolveRepoManifest(repo)
  if (!manifest) return null
  const dashRoot = process.env.DASH_BUILD_DASH_ROOT ?? path.join(homedir(), "Dash")
  const dir = process.env[manifest.localDirEnv] ?? path.join(dashRoot, manifest.localDirName)
  const port = Number(process.env[manifest.portEnv] ?? manifest.defaultPort)
  return {
    repo: manifest.id,
    dir,
    port,
    url: `http://127.0.0.1:${port}${manifest.defaultRoute}`,
    installCommand: `cd ${shellQuote(dir)} && npm install`,
    startCommand: `cd ${shellQuote(dir)} && npm run dev -- -p ${port}`,
  }
}

export async function getRepoPreviewInfo(repo: string | null | undefined): Promise<RepoPreviewInfo | null> {
  const manifest = resolveRepoManifest(repo)
  const config = resolveRepoPreviewConfig(repo)
  if (!manifest || !config) return null
  const local = managed.get(config.repo)
  const exists = existsSync(config.dir)
  const baseline = (unavailableReason?: string): RepoBaselineModel => ({
    repo: manifest.id,
    label: manifest.label,
    surface: manifest.surface,
    audience: manifest.audience,
    theme: manifest.theme,
    previewMode: manifest.previewMode,
    defaultRoute: manifest.defaultRoute,
    description: manifest.baselineDescription,
    shell: manifest.shell,
    unavailableReason,
  })

  if (!exists) {
    return {
      ...config,
      metadata: manifest,
      baseline: baseline("Local repo folder is not configured on this machine."),
      status: "missing",
      message: "Local repo folder was not found on this machine.",
    }
  }

  if (await isHttpReachable(config.url)) {
    return {
      ...config,
      metadata: manifest,
      baseline: baseline(),
      status: "running",
      message: "Local dev server is running.",
      pid: local?.child.pid,
    }
  }

  if (local?.status === "starting") {
    return {
      ...config,
      metadata: manifest,
      baseline: baseline("Local dev server is starting."),
      status: "starting",
      message: "Starting local dev server…",
      pid: local.child.pid,
    }
  }
  if (local?.status === "failed") {
    return {
      ...config,
      metadata: manifest,
      baseline: baseline("Local dev server failed to start."),
      status: "failed",
      message: "Local dev server failed to start.",
      error: local.error,
    }
  }

  if (!existsSync(path.join(config.dir, "node_modules"))) {
    return {
      ...config,
      metadata: manifest,
      baseline: baseline("Dependencies are not installed for this local repo yet."),
      status: "dependencies_missing",
      message: "Dependencies are not installed for this local repo yet.",
    }
  }

  return {
    ...config,
    metadata: manifest,
    baseline: baseline("Local dev server is not running."),
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
