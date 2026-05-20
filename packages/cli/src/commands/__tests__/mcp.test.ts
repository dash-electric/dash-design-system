import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runMcpInit, detectEditors, writeMcpConfig } from "../mcp.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-mcp-test-"))
}

describe("dash mcp init — Cursor + Claude Code targeting", () => {
  let tmpHome: string

  beforeEach(() => {
    tmpHome = mkTmp()
    delete process.env.DASH_REGISTRY_TOKEN
  })

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true })
  })

  it("writes Cursor config with ${env:DASH_REGISTRY_TOKEN} interpolation and @dash key", async () => {
    fs.mkdirSync(path.join(tmpHome, ".cursor"))
    await runMcpInit({
      _home: tmpHome,
      editors: ["cursor"],
      registryUrl: "https://ds.dash.com",
      token: "should-not-be-written",
    })
    const file = path.join(tmpHome, ".cursor", "mcp.json")
    expect(fs.existsSync(file)).toBe(true)
    const cfg = JSON.parse(fs.readFileSync(file, "utf-8"))
    expect(cfg.mcpServers["@dash"]).toBeDefined()
    expect(cfg.mcpServers["@dash"].env.DASH_REGISTRY_URL).toBe("https://ds.dash.com")
    expect(cfg.mcpServers["@dash"].env.DASH_REGISTRY_TOKEN).toBe("${env:DASH_REGISTRY_TOKEN}")
    // The raw token must NOT leak into Cursor's on-disk config
    expect(fs.readFileSync(file, "utf-8")).not.toContain("should-not-be-written")
  })

  it("writes Claude Code config with 'dash' key and bakes token", async () => {
    fs.mkdirSync(path.join(tmpHome, ".claude"))
    await runMcpInit({
      _home: tmpHome,
      editors: ["claude-code"],
      registryUrl: "https://ds.dash.com",
      token: "tok_abc",
    })
    const file = path.join(tmpHome, ".claude", "mcp-config.json")
    const cfg = JSON.parse(fs.readFileSync(file, "utf-8"))
    expect(cfg.mcpServers.dash).toBeDefined()
    expect(cfg.mcpServers.dash.env.DASH_REGISTRY_TOKEN).toBe("tok_abc")
  })

  it("targets BOTH editors when --both is passed (auto-creates both files)", async () => {
    fs.mkdirSync(path.join(tmpHome, ".claude"))
    fs.mkdirSync(path.join(tmpHome, ".cursor"))
    await runMcpInit({
      _home: tmpHome,
      editors: ["claude-code", "cursor"],
      registryUrl: "https://ds.dash.com",
      token: "tok",
    })
    expect(fs.existsSync(path.join(tmpHome, ".claude", "mcp-config.json"))).toBe(true)
    expect(fs.existsSync(path.join(tmpHome, ".cursor", "mcp.json"))).toBe(true)
  })

  it("auto-detects installed editors (.claude only) when no explicit target given", async () => {
    fs.mkdirSync(path.join(tmpHome, ".claude"))
    await runMcpInit({
      _home: tmpHome,
      registryUrl: "https://ds.dash.com",
      token: "tok",
    })
    expect(fs.existsSync(path.join(tmpHome, ".claude", "mcp-config.json"))).toBe(true)
    expect(fs.existsSync(path.join(tmpHome, ".cursor", "mcp.json"))).toBe(false)
  })

  it("detectEditors reports installed=true + wired=true after writing a config", () => {
    fs.mkdirSync(path.join(tmpHome, ".cursor"))
    writeMcpConfig("cursor", path.join(tmpHome, ".cursor", "mcp.json"), "https://x", "")
    const detections = detectEditors(tmpHome)
    const cursor = detections.find((d) => d.editor === "cursor")
    expect(cursor?.installed).toBe(true)
    expect(cursor?.wired).toBe(true)
  })

  it("preserves existing mcpServers entries when adding @dash to Cursor config", async () => {
    const cursorFile = path.join(tmpHome, ".cursor", "mcp.json")
    fs.mkdirSync(path.dirname(cursorFile), { recursive: true })
    fs.writeFileSync(
      cursorFile,
      JSON.stringify({ mcpServers: { other: { command: "node" } } }, null, 2),
    )
    await runMcpInit({
      _home: tmpHome,
      editors: ["cursor"],
      registryUrl: "https://ds.dash.com",
      token: "tok",
    })
    const cfg = JSON.parse(fs.readFileSync(cursorFile, "utf-8"))
    expect(cfg.mcpServers.other).toBeDefined()
    expect(cfg.mcpServers["@dash"]).toBeDefined()
  })
})
