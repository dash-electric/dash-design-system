"use client"

import * as React from "react"
import { DocsCode } from "@/components/docs/code-block"

const CURSOR_CONFIG = `{
  "mcpServers": {
    "dash-ds": {
      "command": "npx",
      "args": ["-y", "@dash/mcp-server"],
      "env": { "DASH_REGISTRY_TOKEN": "..." }
    }
  }
}`

/**
 * DocsCursorConfig — uniform 1-paragraph + JSON snippet block teaching
 * users to wire the Dash MCP into Cursor. The same content lives on every
 * top-10 component page so users don't have to hunt for it.
 */
export const DocsCursorConfig = () => (
  <div className="space-y-3">
    <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
      Drop this into your Cursor <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">~/.cursor/mcp.json</code>{" "}
      to give the agent direct access to the Dash registry. Cursor will then
      know every component this docs site documents, and can install them on
      your behalf. Run{" "}
      <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">
        dashkit mcp init --cursor
      </code>{" "}
      to scaffold the file automatically.
    </p>
    <DocsCode language="json" code={CURSOR_CONFIG} />
  </div>
)
