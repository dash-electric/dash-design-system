# @dash/mcp-server

Model Context Protocol server exposing the [Dash Design System](https://ds.dash.com) registry as native tools for Claude Code, Cursor, Codex, and any other MCP-compatible client.

Once installed, an AI session in a Dash repo can answer "what auth blocks ship with Dash?" or "find me a finance dashboard template" by calling structured tools — not by guessing from training data, and not by you copy-pasting registry JSON into the chat.

## What this gives an AI agent

Seven tools:

| Tool | Purpose |
| --- | --- |
| `search_components` | Full-text search across name, title, description, categories |
| `get_component` | Fetch one item's full schema (files, deps, CSS vars) |
| `list_categories` | Group the registry by category, with sample items |
| `list_templates` | Filter `registry:page` items, optionally by vertical |
| `search_tokens` | Find a CSS var by name or value (`--dash-purple-500`, `#5e2aac`) |
| `get_rules` | Return `dash-ai-rules.md` — the convention guide for AI editing |
| `get_audit_checklist` | Return Layer 0 Cardinal Rules (banned imports, audit trail, voice, tokens). Smaller than `get_rules`; read BEFORE code-gen. |

> **Migration:** `get_ai_rules` → renamed to `get_rules`. The old name is still registered (with `deprecated: true`) and routes to the same handler, but will be removed in v0.3. Please migrate.

All input schemas are JSON Schema (Draft 2020-12), discoverable via the standard MCP `tools/list` method.

## Response format — markdown with CTAs

Every tool returns a single MCP `TextContent` block whose body is **markdown** (not JSON). Each response includes section headers, copy-paste install commands, and CTAs pointing the agent at the next useful tool call or docs page. This matches the shadcn MCP convention and produces noticeably cleaner agent output than a raw JSON dump.

**Example: `search_components({ query: "button" })` →**

````markdown
## Found 2 components for `button`

### `button` — Button _(form)_
Primary action button.

**Type:** `ui` · **Install:** `dashkit add button`

### `icon-button` — Icon Button _(form)_
Compact icon-only variant.

**Type:** `ui` · **Install:** `dashkit add icon-button`

**To install one:**
```bash
dashkit add <component-name>
```

**To see the full schema (files, deps, cssVars) for any of these:**
Call `get_component` with `{ "name": "<component-name>" }`.
````

Backward compat: the MCP protocol shape (`content: [{ type: "text", text: ... }]`) is unchanged. Only the contents of `text` changed from `JSON.stringify(...)` to markdown.

## Install + wire in 3 commands

```bash
git clone https://github.com/dash-tech/dash-mcp ~/dash-mcp
cd ~/dash-mcp && npm install && npm run build
dashkit mcp init   # if you have the dash CLI; otherwise see "Manual config" below
```

`dashkit mcp init` patches `~/.config/claude-code/mcp_servers.json` to point at the build output. Restart Claude Code, ask "search dash for auth blocks", confirm tool calls fire.

## Manual config

If you don't have `dash` CLI installed, edit your MCP client's config directly.

### Claude Code

`~/.config/claude-code/mcp_servers.json` (macOS / Linux):

```json
{
  "mcpServers": {
    "dash": {
      "command": "node",
      "args": ["/Users/you/dash-mcp/dist/index.js"],
      "env": {
        "DASH_REGISTRY_URL": "https://ds.dash.com",
        "DASH_REGISTRY_TOKEN": "<bearer-token>"
      }
    }
  }
}
```

### Cursor

`~/.cursor/mcp.json` — same shape, same `mcpServers` key.

### Codex (OpenAI)

`~/.codex/config.toml`:

```toml
[mcp_servers.dash]
command = "node"
args = ["/Users/you/dash-mcp/dist/index.js"]

[mcp_servers.dash.env]
DASH_REGISTRY_URL = "https://ds.dash.com"
DASH_REGISTRY_TOKEN = "<bearer-token>"
```

Restart the client after editing. Most clients log MCP startup failures to a debug pane — check there first if tools don't appear.

## What you can now ask the agent

With the server wired up, prompts like these route through real tool calls instead of hallucination:

- *"What auth pages does Dash ship?"* → `list_templates({ vertical: "auth" })`
- *"Find me a finance dashboard template."* → `search_components({ query: "finance dashboard" })`
- *"What CSS var is Dash purple?"* → `search_tokens({ query: "purple" })`
- *"Show me the anatomy of `dashboard-shell`."* → `get_component({ name: "dashboard-shell" })`
- *"How should I structure forms in Dash?"* → `get_rules({})`
- *"What categories exist?"* → `list_categories({})`
- *"What are the cardinal rules before I touch this code?"* → `get_audit_checklist({})`

The agent then writes code that matches Dash conventions, because it's reading the registry instead of inventing component names.

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `DASH_REGISTRY_URL` | `https://ds.dash.com` | Registry base URL |
| `DASH_REGISTRY_TOKEN` | _(none)_ | Optional bearer token, sent as `Authorization: Bearer <token>` |
| `DASH_MCP_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` — written to stderr |

Stdout is reserved for MCP protocol traffic. All logging goes to stderr.

## Local dev vs production

**Local dev** — pointed at a dev server running on `localhost:3000`:

```json
"env": {
  "DASH_REGISTRY_URL": "http://localhost:3000"
}
```

Pair with `pnpm dev` inside the `dash-ds` repo. Useful when iterating on a new component and you want the agent to discover it before it ships.

**Production** — `https://ds.dash.com` with a real bearer token. This is what most consumer repos should use.

You can run two servers side-by-side under different names (`dash-local`, `dash-prod`) if you want both available in the same session.

## Architecture

```
src/
├── index.ts                   stdio MCP server entrypoint
├── version.ts
├── lib/
│   ├── auth.ts                env + bearer header construction
│   ├── registry-client.ts     HTTP + 5-minute LRU cache
│   └── schema.ts              registry-item type defs
├── lib/
│   └── markdown-response.ts   formatters: JSON → markdown w/ CTAs
└── tools/                     one file per MCP tool
    ├── search-components.ts
    ├── get-component.ts
    ├── list-categories.ts
    ├── list-templates.ts
    ├── search-tokens.ts
    ├── get-ai-rules.ts
    └── get-audit-checklist.ts
```

Design rules:

- **Lazy fetch.** Only `/r/index.json` is loaded eagerly. Individual items are fetched on demand and cached 5 minutes.
- **No dependency on `dash-ds`.** This package only speaks HTTP — it never imports from the registry repo.
- **stdout is MCP-only.** All logging hits stderr so clients don't choke on extra bytes.

## Smoke test

Verify the server responds to a minimal MCP handshake:

```bash
(printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'; \
  sleep 0.3) | node dist/index.js
```

Expect a JSON line for id `2` listing the seven tools above.

## Troubleshooting

**Tools don't show up in Claude Code.**
The client logs MCP startup separately. Check `~/Library/Logs/Claude/mcp-server-dash.log` (macOS) or `~/.config/claude-code/logs/` (Linux). Most failures are: wrong path to `dist/index.js`, missing `npm run build`, or `node` not on the PATH the client uses.

**`401 Unauthorized` from registry.**
Token missing or wrong. Confirm with `curl -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" https://ds.dash.com/r/index.json`. If that 401s too, get a fresh token from the design lead.

**Stale data — agent says component doesn't exist but it does.**
5-minute LRU cache. Either wait it out, or restart the MCP server (the client will respawn it).

**`Error: stdio transport closed unexpectedly`.**
Something wrote to stdout. Check recent edits to `src/` for stray `console.log` — those must be `console.error`. Server prints all logs to stderr by design.

**Works locally, fails in CI.**
CI usually doesn't have `DASH_REGISTRY_TOKEN`. Either inject it as a secret or stub the server with `DASH_REGISTRY_URL` pointing at a fixture.

## Development

```bash
git clone https://github.com/dash-tech/dash-mcp
cd dash-mcp
npm install
npm run build                   # tsc → dist/
npm run dev                     # tsc --watch
```

The server is intentionally a single dependency on top of stdlib: `@modelcontextprotocol/sdk`. Bundle nothing; ship `dist/` raw.

## License

UNLICENSED — internal Dash use only. See [`dash-ds/NOTICE.md`](../dash-ds/NOTICE.md) for the upstream AlignUI Pro terms.

## Related repos

- [`dash-ds`](../dash-ds/README.md) — the registry this server reads from.
- [`dash-cli`](../dash-cli/README.md) — the human-facing installer. `dashkit mcp init` wires this server up for you.
