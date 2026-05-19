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
        status="wip"
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

      <DocsSection title="Setup (planned)">
        <DocsCode
          language="bash"
          code={`# planned syntax — Day 12+
dash mcp init
# → writes ~/.config/claude/mcp_servers.json entry
# → wires bearer auth from DASH_REGISTRY_TOKEN
# → restart Claude Desktop / Cursor / Windsurf to load`}
        />
      </DocsSection>

      <DocsSection title="Tools spec (planned)">
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
          <li><strong className="text-text-strong-950">Day 12</strong> — spike the server in Node, mount existing /r/ JSON</li>
          <li><strong className="text-text-strong-950">Day 13</strong> — wire bearer auth, ship as <code className="text-xs">dash-mcp-server</code> npm package</li>
          <li><strong className="text-text-strong-950">Day 14</strong> — Claude Desktop manifest, Cursor settings JSON, Windsurf config docs</li>
          <li><strong className="text-text-strong-950">Day 15</strong> — diff_versions tool, audit log integration</li>
          <li><strong className="text-text-strong-950">Day 16+</strong> — beta with 3 internal PE projects, gather feedback</li>
        </ul>
        <p className="text-sm text-text-sub-600 mt-3">
          Until MCP ships, point your AI at the AI Rules markdown bundle (<code className="text-xs">dash add ai-rules</code>)
          — it&apos;s the same knowledge surface, just static.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
