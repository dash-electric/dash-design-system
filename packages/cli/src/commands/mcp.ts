/**
 * `dashkit mcp init` — wire @dash/mcp-server into Claude Code + Cursor MCP configs.
 *
 * Editor targets (auto-detected from `~/.claude/` and `~/.cursor/` presence):
 *   - Claude Code: `~/.claude/mcp-config.json` (key "dash", npx invocation)
 *   - Cursor:      `~/.cursor/mcp.json`        (key "@dash", env-var passthrough)
 *
 * Both shapes write to the conventional `mcpServers` map.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL } from "../lib/components-json.js"

export type Editor = "claude-code" | "cursor"

export type McpInitOpts = {
  token?: string
  registryUrl?: string
  /** Override config path — only honored when a single editor target is selected. */
  configPath?: string
  /** Which editors to target. Defaults to auto-detect (both if both installed). */
  editors?: Editor[]
  /** Override home dir for tests. */
  _home?: string
  /** Don't write — only report what would happen. */
  checkOnly?: boolean
}

export type McpDetection = {
  editor: Editor
  configPath: string
  installed: boolean
  wired: boolean
}

function claudeCodeConfigPath(home: string): string {
  return path.join(home, ".claude", "mcp-config.json")
}

function cursorConfigPath(home: string): string {
  return path.join(home, ".cursor", "mcp.json")
}

function isInstalled(home: string, editor: Editor): boolean {
  if (editor === "claude-code") return fs.existsSync(path.join(home, ".claude"))
  return fs.existsSync(path.join(home, ".cursor"))
}

export function detectEditors(home: string = os.homedir()): McpDetection[] {
  const editors: Editor[] = ["claude-code", "cursor"]
  return editors.map((editor) => {
    const cfgPath = editor === "claude-code" ? claudeCodeConfigPath(home) : cursorConfigPath(home)
    let wired = false
    if (fs.existsSync(cfgPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(cfgPath, "utf-8"))
        const servers = (raw?.mcpServers ?? {}) as Record<string, unknown>
        wired = Boolean(servers["dash"] ?? servers["@dash"])
      } catch {
        /* ignore */
      }
    }
    return {
      editor,
      configPath: cfgPath,
      installed: isInstalled(home, editor),
      wired,
    }
  })
}

function buildClaudeEntry(registryUrl: string, token: string): Record<string, unknown> {
  return {
    command: "npx",
    args: ["-y", "@dash/mcp-server"],
    env: {
      DASH_REGISTRY_URL: registryUrl,
      DASH_REGISTRY_TOKEN: token,
    },
  }
}

function buildCursorEntry(registryUrl: string): Record<string, unknown> {
  // Cursor recommends `${env:VAR}` interpolation — keeps secrets out of disk.
  return {
    command: "npx",
    args: ["-y", "@dash/mcp-server"],
    env: {
      DASH_REGISTRY_URL: registryUrl,
      DASH_REGISTRY_TOKEN: "${env:DASH_REGISTRY_TOKEN}",
    },
  }
}

export function writeMcpConfig(
  editor: Editor,
  configPath: string,
  registryUrl: string,
  token: string,
): void {
  fs.mkdirSync(path.dirname(configPath), { recursive: true })

  let cfg: { mcpServers?: Record<string, unknown> } = {}
  if (fs.existsSync(configPath)) {
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    } catch {
      fs.copyFileSync(configPath, `${configPath}.bak`)
      cfg = {}
    }
  }

  cfg.mcpServers = cfg.mcpServers ?? {}
  if (editor === "claude-code") {
    ;(cfg.mcpServers as Record<string, unknown>)["dash"] = buildClaudeEntry(registryUrl, token)
  } else {
    ;(cfg.mcpServers as Record<string, unknown>)["@dash"] = buildCursorEntry(registryUrl)
  }

  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8")
}

export async function runMcpInit(opts: McpInitOpts): Promise<void> {
  const home = opts._home ?? os.homedir()
  const detections = detectEditors(home)

  // Determine editor targets
  let targets: Editor[]
  if (opts.editors && opts.editors.length > 0) {
    targets = opts.editors
  } else {
    const installed = detections.filter((d) => d.installed).map((d) => d.editor)
    targets = installed.length > 0 ? installed : ["claude-code"]
  }

  if (opts.checkOnly) {
    console.log(kleur.bold().cyan("MCP editor detection:"))
    for (const d of detections) {
      const installedTag = d.installed ? kleur.green("installed") : kleur.dim("not installed")
      const wiredTag = d.wired ? kleur.green("wired") : kleur.yellow("not wired")
      console.log(`  ${d.editor.padEnd(14)} ${installedTag.padEnd(20)} ${wiredTag}`)
      console.log(kleur.dim(`    ${d.configPath}`))
    }
    return
  }

  const registryUrl = opts.registryUrl ?? DEFAULT_REGISTRY_URL
  const token = opts.token ?? process.env.DASH_REGISTRY_TOKEN ?? ""

  for (const editor of targets) {
    const defaultPath =
      editor === "claude-code" ? claudeCodeConfigPath(home) : cursorConfigPath(home)
    const configPath =
      opts.configPath && targets.length === 1 ? opts.configPath : defaultPath
    writeMcpConfig(editor, configPath, registryUrl, token)
    const label = editor === "claude-code" ? "Claude Code" : "Cursor"
    console.log(kleur.green(`✓ Wired @dash/mcp-server → ${label} (${configPath})`))
  }

  console.log(kleur.dim(`Restart your editor(s) to pick up the new server.`))
  if (targets.includes("cursor")) {
    console.log(
      kleur.dim(
        `Cursor config uses \${env:DASH_REGISTRY_TOKEN} — ensure that env var is set in your shell.`,
      ),
    )
  }
}
