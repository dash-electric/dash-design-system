/**
 * `dash mcp init` — wire @dash/mcp-server into Claude Code MCP config.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL } from "../lib/components-json.js"

export type McpInitOpts = {
  token?: string
  registryUrl?: string
  configPath?: string
}

function defaultConfigPaths(): string[] {
  const home = os.homedir()
  return [
    path.join(home, ".config", "claude-code", "mcp_servers.json"),
    path.join(home, ".claude", "mcp_servers.json"),
    path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
  ]
}

export async function runMcpInit(opts: McpInitOpts): Promise<void> {
  const configPath =
    opts.configPath ??
    defaultConfigPaths().find((p) => fs.existsSync(p)) ??
    defaultConfigPaths()[0]

  fs.mkdirSync(path.dirname(configPath), { recursive: true })

  let cfg: { mcpServers?: Record<string, unknown> } = {}
  if (fs.existsSync(configPath)) {
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    } catch {
      console.log(kleur.yellow(`! ${configPath} is invalid JSON — backing up and overwriting`))
      fs.copyFileSync(configPath, `${configPath}.bak`)
      cfg = {}
    }
  }

  cfg.mcpServers = cfg.mcpServers ?? {}
  const registryUrl = opts.registryUrl ?? DEFAULT_REGISTRY_URL
  const token = opts.token ?? process.env.DASH_REGISTRY_TOKEN ?? ""

  ;(cfg.mcpServers as Record<string, unknown>)["dash"] = {
    command: "npx",
    args: ["-y", "@dash/mcp-server"],
    env: {
      DASH_REGISTRY_URL: registryUrl,
      DASH_REGISTRY_TOKEN: token,
    },
  }

  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8")
  console.log(kleur.green(`✓ Wired @dash/mcp-server → ${configPath}`))
  console.log(kleur.dim(`Restart Claude Code to pick up the new server.`))
}
