import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { collectDoctor } from "../doctor.js"

function mkTmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

/** Build a fake fetch that returns a fixed status per URL substring. */
function fakeFetch(routes: Array<{ match: string; status: number }>): typeof fetch {
  return (async (url: string | URL | Request) => {
    const u = url.toString()
    for (const r of routes) {
      if (u.includes(r.match)) {
        return new Response(null, { status: r.status })
      }
    }
    return new Response(null, { status: 404 })
  }) as typeof fetch
}

describe("dashkit doctor — collectDoctor", () => {
  let tmpCwd: string
  let tmpHome: string

  beforeEach(() => {
    tmpCwd = mkTmp("dash-doctor-cwd-")
    tmpHome = mkTmp("dash-doctor-home-")
    delete process.env.DASH_REGISTRY_TOKEN
  })

  afterEach(() => {
    fs.rmSync(tmpCwd, { recursive: true, force: true })
    fs.rmSync(tmpHome, { recursive: true, force: true })
  })

  it("reports 10 checks total with --no-network skipping registry+token", async () => {
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    expect(report.checks).toHaveLength(10)
    expect(report.summary.skip).toBe(2)
    const registry = report.checks.find((c) => c.id === "registry")
    const token = report.checks.find((c) => c.id === "token")
    expect(registry?.status).toBe("skip")
    expect(token?.status).toBe("skip")
  })

  it("flags missing components.json and missing .env.local as warnings", async () => {
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    const cj = report.checks.find((c) => c.id === "components-json")
    const envTok = report.checks.find((c) => c.id === "env-token")
    expect(cj?.status).toBe("warn")
    expect(cj?.detail).toBe("missing")
    expect(envTok?.status).toBe("warn")
  })

  it("detects components.json + DASH_REGISTRY_TOKEN in .env.local as OK", async () => {
    writeJson(path.join(tmpCwd, "components.json"), {
      aliases: { ui: "@/components/ui" },
      registries: { "@dash": { url: "https://ds.dash.com" } },
    })
    fs.writeFileSync(path.join(tmpCwd, ".env.local"), "DASH_REGISTRY_TOKEN=dash_pat_xyz\n")
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    expect(report.checks.find((c) => c.id === "components-json")?.status).toBe("ok")
    expect(report.checks.find((c) => c.id === "env-token")?.status).toBe("ok")
    // ensure token value never leaks into the report
    expect(JSON.stringify(report)).not.toContain("dash_pat_xyz")
  })

  it("detects MCP wired when ~/.claude/mcp-config.json contains a 'dash' server", async () => {
    writeJson(path.join(tmpHome, ".claude", "mcp-config.json"), {
      mcpServers: { dash: { command: "npx", args: ["-y", "@dash/mcp-server"] } },
    })
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    const mcp = report.checks.find((c) => c.id === "mcp")
    expect(mcp?.status).toBe("ok")
    expect(mcp?.detail).toContain("Claude Code")
    expect(mcp?.detail).toContain("Cursor: not configured")
  })

  it("detects both Claude Code AND Cursor when both configs have @dash server", async () => {
    writeJson(path.join(tmpHome, ".claude", "mcp-config.json"), {
      mcpServers: { dash: { command: "npx" } },
    })
    writeJson(path.join(tmpHome, ".cursor", "mcp.json"), {
      mcpServers: { "@dash": { command: "npx" } },
    })
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    const mcp = report.checks.find((c) => c.id === "mcp")
    expect(mcp?.status).toBe("ok")
    expect(mcp?.detail).toBe("Claude Code · Cursor")
  })

  it("reports registry 200 + token 200 as OK when fetch resolves", async () => {
    fs.writeFileSync(path.join(tmpCwd, ".env.local"), "DASH_REGISTRY_TOKEN=valid_token\n")
    const _fetch = fakeFetch([
      { match: "/api/health", status: 200 },
      { match: "/r/utils.json", status: 200 },
    ])
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      registry: "https://ds.dash.com",
      _fetch,
    })
    expect(report.checks.find((c) => c.id === "registry")?.status).toBe("ok")
    expect(report.checks.find((c) => c.id === "token")?.status).toBe("ok")
  })

  it("flags 401 token response as an error", async () => {
    fs.writeFileSync(path.join(tmpCwd, ".env.local"), "DASH_REGISTRY_TOKEN=stale\n")
    const _fetch = fakeFetch([
      { match: "/api/health", status: 200 },
      { match: "/r/utils.json", status: 401 },
    ])
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      registry: "https://ds.dash.com",
      _fetch,
    })
    expect(report.checks.find((c) => c.id === "token")?.status).toBe("error")
    expect(report.summary.error).toBeGreaterThanOrEqual(1)
  })

  it("detects pnpm package manager and next-app framework from fixture", async () => {
    writeJson(path.join(tmpCwd, "package.json"), {
      name: "consumer",
      dependencies: { next: "15.0.0" },
    })
    fs.writeFileSync(path.join(tmpCwd, "pnpm-lock.yaml"), "lockfileVersion: 9.0\n")
    fs.mkdirSync(path.join(tmpCwd, "app"))
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    expect(report.checks.find((c) => c.id === "package-manager")?.detail).toBe("pnpm")
    expect(report.checks.find((c) => c.id === "framework")?.detail).toBe("next-app")
  })

  it("detects workspace via pnpm-workspace.yaml in parent", async () => {
    // Create workspace marker in cwd itself
    fs.writeFileSync(path.join(tmpCwd, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'\n")
    const report = await collectDoctor({
      cwd: tmpCwd,
      _home: tmpHome,
      noNetwork: true,
    })
    const ws = report.checks.find((c) => c.id === "workspace")
    expect(ws?.detail).toContain("workspace")
  })
})
