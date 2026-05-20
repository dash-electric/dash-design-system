"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function McpServerPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Tools"
        title="Dash MCP Server"
        description="A Model Context Protocol server that exposes the @dash registry to AI coding assistants. List components, fetch full source, and search by description — all without leaving the chat."
        status="shipped"
      />

      <DocsSection
        title="What it does"
        description="MCP gives Claude / Cursor / Windsurf live read access to the registry. No more pasting JSON — the AI calls list_components and get_component itself."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li><strong className="text-text-strong-950">list_components</strong> — enumerate every shipped item with name, type, description, deps.</li>
          <li><strong className="text-text-strong-950">get_component(name)</strong> — return the full registry-item.json (TSX content baked in).</li>
          <li><strong className="text-text-strong-950">search(query)</strong> — full-text search across name, title, description.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Setup — Claude Code">
        <DocsCode
          language="bash"
          code={`dash mcp init --claude-code
# → writes ~/.claude/mcp-config.json entry
# → bakes DASH_REGISTRY_TOKEN into the env block
# → restart Claude Code to load`}
        />
      </DocsSection>

      <DocsSection
        title="Setup — Cursor"
        description="Cursor reads ~/.cursor/mcp.json. The Dash CLI writes a Cursor-shaped entry that interpolates DASH_REGISTRY_TOKEN from your shell env (so the token isn't checked into a config file)."
      >
        <DocsCode
          language="bash"
          code={`# 1. Export the token in your shell
export DASH_REGISTRY_TOKEN=dash_pat_xxx

# 2. Wire Cursor
dash mcp init --cursor

# Or wire both editors in one shot:
dash mcp init --both

# Detect what's installed without writing anything:
dash mcp init --check-only`}
        />
        <DocsCode
          language="json"
          code={`// ~/.cursor/mcp.json (written by \`dash mcp init --cursor\`)
{
  "mcpServers": {
    "@dash": {
      "command": "npx",
      "args": ["-y", "@dash/mcp-server"],
      "env": {
        "DASH_REGISTRY_URL": "https://ds.dash.com",
        "DASH_REGISTRY_TOKEN": "\${env:DASH_REGISTRY_TOKEN}"
      }
    }
  }
}`}
        />
      </DocsSection>

      <DocsSection
        title="Verify the wiring with `dash doctor`"
        description="One command shows registry reachability, token validity, MCP wiring per editor, framework detection, and Node version."
      >
        <DocsCode
          language="bash"
          code={`dash doctor

# 🩺 Dash DS health check
#
#   ✓ Registry reachable        https://ds.dash.com/api/health → 200
#   ✓ Token valid               /r/utils.json → 200
#   ✓ MCP wired                 Claude Code · Cursor
#   ✓ CLI version               v0.4.0
#   ✓ Framework                 next-app
#   ✓ components.json           found
#   ✓ .env.local                DASH_REGISTRY_TOKEN set
#   ✓ Node                      v20.10.0
#   ✓ Package manager           pnpm
#   ✓ Workspace                 workspace detected
#
# Summary: 10 OK, 0 warnings, 0 errors`}
        />
      </DocsSection>

      <DocsSection title="Tools spec">
        <DocsPropsTable
          rows={[
            { name: "list_components", type: "() => Item[]",                description: "Lists every shipped item with name + title + description + type." },
            { name: "get_component",   type: "(name: string) => Item",      description: "Returns the full item including file contents." },
            { name: "search",          type: "(query: string) => Item[]",   description: "Substring match across name, title, description. Case-insensitive." },
            { name: "list_blocks",     type: "() => Item[]",                description: "Filtered list_components — only registry:block entries." },
            { name: "list_templates",  type: "() => Item[]",                description: "Filtered list_components — only registry:page entries." },
            { name: "diff_versions",   type: "(name, vA, vB) => string",    description: "Compare two versions of an item. Day 14+ feature." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Roadmap">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li><strong className="text-text-strong-950">WK01</strong> — server shipped in the repo as <code className="text-xs">@dash/mcp-server</code> (6 tools, Bearer-gated registry queries).</li>
          <li><strong className="text-text-strong-950">WK02</strong> — Claude Code + Cursor wiring via <code className="text-xs">dash mcp init</code>. Both variants live.</li>
          <li><strong className="text-text-strong-950">WK03</strong> — Windsurf config docs, diff_versions tool, audit log integration.</li>
          <li><strong className="text-text-strong-950">WK04</strong> — 5 user scale pilot across Reservasi, Express, Halo, Finance, Mitra.</li>
          <li><strong className="text-text-strong-950">WK05</strong> — full 10 user rollout. Deploy ETA: this week 2026-05-21+.</li>
        </ul>
        <p className="text-sm text-text-sub-600 mt-3">
          If your editor isn&apos;t wired yet, fall back to the AI Rules markdown bundle (<code className="text-xs">dash add ai-rules</code>)
          — same knowledge surface, just static.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
