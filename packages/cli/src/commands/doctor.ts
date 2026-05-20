/**
 * `dash doctor` — end-to-end health check per user laptop.
 *
 * Runs registry reachability, token validity, MCP wiring (Claude Code + Cursor),
 * CLI version, framework detection, components.json presence, .env.local token,
 * Node version, package manager, and workspace-root detection.
 *
 * Designed to be a single command a user runs when something feels off: it prints
 * a 10-line status board and a Summary tally. `--json` for tooling. `--no-network`
 * for offline / pre-flight check.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import kleur from "kleur"
import { VERSION } from "../version.js"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"
import {
  detectFramework,
  detectPackageManager,
} from "./info.js"

export type DoctorOpts = {
  json?: boolean
  registry?: string
  noNetwork?: boolean
  cwd?: string
  /** Override fetch for tests. */
  _fetch?: typeof fetch
  /** Override home dir for tests. */
  _home?: string
}

export type CheckStatus = "ok" | "warn" | "error" | "skip"

export type DoctorCheck = {
  id: string
  label: string
  status: CheckStatus
  detail: string
  hint?: string
}

export type DoctorReport = {
  schemaVersion: 1
  cliVersion: string
  cwd: string
  checks: DoctorCheck[]
  summary: { ok: number; warn: number; error: number; skip: number }
}

function claudeCodeConfigPath(home: string): string {
  return path.join(home, ".claude", "mcp-config.json")
}

function cursorConfigPath(home: string): string {
  return path.join(home, ".cursor", "mcp.json")
}

function readMcpServers(file: string): Record<string, unknown> | null {
  if (!fs.existsSync(file)) return null
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"))
    return (raw?.mcpServers ?? {}) as Record<string, unknown>
  } catch {
    return null
  }
}

function isDashWired(servers: Record<string, unknown> | null): boolean {
  if (!servers) return false
  // Accept either "dash" or "@dash" key (mcp.ts uses both shapes in flight)
  return Boolean(servers["dash"] ?? servers["@dash"])
}

async function safeFetch(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
  timeoutMs = 5000,
): Promise<{ ok: boolean; status: number; error?: string }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetchImpl(url, { ...init, signal: ctrl.signal })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, status: 0, error: (err as Error).message }
  } finally {
    clearTimeout(t)
  }
}

function envHasToken(cwd: string): boolean {
  if (process.env.DASH_REGISTRY_TOKEN) return true
  const envFile = path.join(cwd, ".env.local")
  if (!fs.existsSync(envFile)) return false
  try {
    const raw = fs.readFileSync(envFile, "utf-8")
    return /^\s*DASH_REGISTRY_TOKEN\s*=\s*\S/m.test(raw)
  } catch {
    return false
  }
}

function readTokenFromEnv(cwd: string): string | null {
  if (process.env.DASH_REGISTRY_TOKEN) return process.env.DASH_REGISTRY_TOKEN
  const envFile = path.join(cwd, ".env.local")
  if (!fs.existsSync(envFile)) return null
  try {
    const raw = fs.readFileSync(envFile, "utf-8")
    const m = raw.match(/^\s*DASH_REGISTRY_TOKEN\s*=\s*(.+?)\s*$/m)
    if (!m) return null
    return m[1].replace(/^["']|["']$/g, "")
  } catch {
    return null
  }
}

function nodeMajor(): number {
  const m = process.versions.node.match(/^(\d+)/)
  return m ? Number(m[1]) : 0
}

function detectWorkspaceRoot(cwd: string): { isMonorepo: boolean; marker: string | null } {
  // Walk up checking for workspace markers
  let cur = cwd
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(cur, "pnpm-workspace.yaml"))) {
      return { isMonorepo: true, marker: "pnpm-workspace.yaml" }
    }
    const pkgFile = path.join(cur, "package.json")
    if (fs.existsSync(pkgFile)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"))
        if (pkg.workspaces) return { isMonorepo: true, marker: "package.json workspaces" }
      } catch {
        /* ignore */
      }
    }
    const parent = path.dirname(cur)
    if (parent === cur) break
    cur = parent
  }
  return { isMonorepo: false, marker: null }
}

function frameworkLabel(cwd: string): string {
  const fw = detectFramework(cwd)
  if (fw !== "next") return fw
  // Differentiate app vs pages directory
  if (fs.existsSync(path.join(cwd, "app")) || fs.existsSync(path.join(cwd, "src", "app"))) {
    return "next-app"
  }
  if (fs.existsSync(path.join(cwd, "pages")) || fs.existsSync(path.join(cwd, "src", "pages"))) {
    return "next-pages"
  }
  return "next"
}

export async function collectDoctor(opts: DoctorOpts = {}): Promise<DoctorReport> {
  const cwd = opts.cwd ?? process.cwd()
  const home = opts._home ?? os.homedir()
  const fetchImpl = opts._fetch ?? (globalThis.fetch as typeof fetch)
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registry ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  const checks: DoctorCheck[] = []

  // 1. Registry reachable
  if (opts.noNetwork) {
    checks.push({
      id: "registry",
      label: "Registry reachable",
      status: "skip",
      detail: "skipped (--no-network)",
    })
  } else {
    const url = `${registryUrl.replace(/\/$/, "")}/api/health`
    const res = await safeFetch(url, { method: "GET" }, fetchImpl)
    checks.push({
      id: "registry",
      label: "Registry reachable",
      status: res.ok ? "ok" : "error",
      detail: res.ok
        ? `${url} → ${res.status}`
        : `${url} → ${res.error ?? `HTTP ${res.status}`}`,
      hint: !res.ok ? "Check network / DASH_REGISTRY_URL / VPN" : undefined,
    })
  }

  // 2. Token valid (HTTP probe — needs network)
  if (opts.noNetwork) {
    checks.push({
      id: "token",
      label: "Token valid",
      status: "skip",
      detail: "skipped (--no-network)",
    })
  } else {
    const token = readTokenFromEnv(cwd)
    if (!token) {
      checks.push({
        id: "token",
        label: "Token valid",
        status: "warn",
        detail: "no DASH_REGISTRY_TOKEN configured",
        hint: "run `dash init` or `dash login`",
      })
    } else {
      const url = `${registryUrl.replace(/\/$/, "")}/r/utils.json`
      const res = await safeFetch(
        url,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } },
        fetchImpl,
      )
      if (res.status === 200) {
        checks.push({
          id: "token",
          label: "Token valid",
          status: "ok",
          detail: `/r/utils.json → 200`,
        })
      } else if (res.status === 401 || res.status === 403) {
        checks.push({
          id: "token",
          label: "Token valid",
          status: "error",
          detail: `/r/utils.json → ${res.status}`,
          hint: "token expired or revoked — run `dash login`",
        })
      } else {
        checks.push({
          id: "token",
          label: "Token valid",
          status: "warn",
          detail: `/r/utils.json → ${res.error ?? `HTTP ${res.status}`}`,
        })
      }
    }
  }

  // 3. MCP wired (both editors)
  const ccPath = claudeCodeConfigPath(home)
  const cursorPath = cursorConfigPath(home)
  const ccWired = isDashWired(readMcpServers(ccPath))
  const cursorWired = isDashWired(readMcpServers(cursorPath))
  const ccLabel = ccWired ? "Claude Code" : "Claude Code: not configured"
  const cursorLabel = cursorWired ? "Cursor" : "Cursor: not configured"
  checks.push({
    id: "mcp",
    label: "MCP wired",
    status: ccWired || cursorWired ? "ok" : "warn",
    detail: `${ccLabel} · ${cursorLabel}`,
    hint: ccWired || cursorWired ? undefined : "run `dash mcp init`",
  })

  // 4. CLI version
  checks.push({
    id: "cli-version",
    label: "CLI version",
    status: "ok",
    detail: `v${VERSION}`,
  })

  // 5. Framework detected
  const fw = frameworkLabel(cwd)
  checks.push({
    id: "framework",
    label: "Framework",
    status: fw === "unknown" ? "warn" : "ok",
    detail: fw,
  })

  // 6. components.json present
  const cjExists = fs.existsSync(path.join(cwd, "components.json"))
  checks.push({
    id: "components-json",
    label: "components.json",
    status: cjExists ? "ok" : "warn",
    detail: cjExists ? "found" : "missing",
    hint: cjExists ? undefined : "run `dash init`",
  })

  // 7. .env.local with token
  const hasTok = envHasToken(cwd)
  checks.push({
    id: "env-token",
    label: ".env.local",
    status: hasTok ? "ok" : "warn",
    detail: hasTok ? "DASH_REGISTRY_TOKEN set" : "missing",
    hint: hasTok ? undefined : "run `dash init`",
  })

  // 8. Node version
  const nm = nodeMajor()
  checks.push({
    id: "node",
    label: "Node",
    status: nm >= 20 ? "ok" : "error",
    detail: `v${process.versions.node}`,
    hint: nm >= 20 ? undefined : "upgrade Node to v20+",
  })

  // 9. Package manager
  const pm = detectPackageManager(cwd)
  checks.push({
    id: "package-manager",
    label: "Package manager",
    status: pm === "unknown" ? "warn" : "ok",
    detail: pm,
  })

  // 10. Workspace root
  const ws = detectWorkspaceRoot(cwd)
  checks.push({
    id: "workspace",
    label: "Workspace",
    status: "ok",
    detail: ws.isMonorepo ? `workspace detected (${ws.marker})` : "standalone",
  })

  const summary = checks.reduce(
    (acc, c) => {
      acc[c.status]++
      return acc
    },
    { ok: 0, warn: 0, error: 0, skip: 0 },
  )

  return {
    schemaVersion: 1,
    cliVersion: VERSION,
    cwd,
    checks,
    summary,
  }
}

function glyph(status: CheckStatus): string {
  switch (status) {
    case "ok":
      return kleur.green("✓")
    case "warn":
      return kleur.yellow("⚠")
    case "error":
      return kleur.red("✗")
    case "skip":
      return kleur.dim("·")
  }
}

function printPretty(report: DoctorReport): void {
  const pad = (s: string, w = 26) => s.padEnd(w)
  console.log()
  console.log(kleur.bold().cyan(`🩺 Dash DS health check`))
  console.log()
  for (const c of report.checks) {
    const line = `  ${glyph(c.status)} ${pad(c.label)} ${kleur.dim(c.detail)}`
    console.log(line)
    if (c.hint && c.status !== "ok") {
      console.log(kleur.dim(`     → ${c.hint}`))
    }
  }
  console.log()
  const { ok, warn, error, skip } = report.summary
  const parts = [
    `${ok} OK`,
    `${warn} warning${warn === 1 ? "" : "s"}`,
    `${error} error${error === 1 ? "" : "s"}`,
  ]
  if (skip > 0) parts.push(`${skip} skipped`)
  console.log(kleur.bold(`Summary: ${parts.join(", ")}`))
  console.log()
}

export async function runDoctor(opts: DoctorOpts): Promise<void> {
  const report = await collectDoctor(opts)
  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n")
  } else {
    printPretty(report)
  }
  // Exit non-zero if any errors (skip the process.exit in tests by checking import.meta)
  if (report.summary.error > 0) {
    process.exitCode = 1
  }
}
