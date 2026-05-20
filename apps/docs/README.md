# Dash Design System

The internal component registry powering Dash's 10 portfolio products — one source of truth for tokens, components, blocks, and templates. Built on shadcn-style copy-paste distribution. Designed to be consumed by humans through a CLI and by AI agents through MCP.

## The problem this fixes

Dash has 10 product surfaces (Express, Halo, Mitra, Mobility, Logistics, Finance, HR, Marketing, Pay, Office) being built by different squads. Without a shared system, each squad re-derives buttons, sidebars, and auth shells from Figma — and three months later nothing looks like the same product.

Dash DS centralizes that. One Figma source → one token catalog → one registry → every product pulls the same `Button`, the same `DashboardShell`, the same purple. Brand drift becomes a `dash diff` away from being noticed.

Same shape as shadcn/ui, but:

- `@dash` namespace instead of `@shadcn` — you can run both in the same project.
- Sourced from a paid AlignUI Pro license — internal use only, do not vendor externally.
- Wired for AI consumption from day one (registry, CLI, MCP server, AI rules file).
- Tracked against the Dash Figma library via `figma-audit/` decision logs.

## Install

```bash
# In a Next.js / Vite / Remix / Astro project
pnpm dlx github:dash-tech/dash-cli init
pnpm dlx github:dash-tech/dash-cli add button card dialog
```

That's it. `init` writes `components.json`, drops base tokens into `globals.css`, and installs `@dash/base-theme` + `@dash/ai-rules`. `add` resolves dependencies recursively and merges any new CSS vars in.

For local dev against this repo, see [Local development](#local-development).

## Three ways to use it

### 1. Human, building a feature

```bash
dash search "table"
dash add data-table orders-table
```

Then open the file in your editor. The component is in *your* repo, not `node_modules` — edit it freely.

### 2. AI agent, building a feature

In Claude Code / Cursor / Codex with the MCP server installed:

> "Build me a settings page with a sidebar, tabs for Profile / Notifications / Team, and a danger-zone card at the bottom."

The agent calls `search_components`, finds `settings-tabs-page` + `dashboard-shell`, calls `get_component` to inspect anatomy, calls `get_ai_rules` to learn Dash's compose-don't-fork conventions, and writes the page. You review the diff.

### 3. Designer / PM, checking what exists

Browse `https://ds.dash.com` — the live docs site. Every item has a preview, anatomy diagram, variant table, do/don't list, and an "Install" snippet you can paste straight into an issue.

## Architecture

```
                    Figma library (source of truth)
                              │
                              ▼
              .figma-cache/design-tokens.tokens.json
                              │
                              ▼
              registry/dash/  (TSX source of every item)
                              │
                              ▼  (pnpm registry:build)
                public/r/*.json  (resolved registry items)
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        Docs site         dash CLI         @dash/mcp-server
       (ds.dash.com)   (human install)    (AI agents install)
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    Consumer projects
              (Express, Halo, Mitra, Finance…)
```

## What's in the registry

178 items as of 2026-05-20:

| Type | Count | Examples |
| --- | --- | --- |
| `registry:ui` | 92 | button, input, dialog, data-table, calendar, sidebar |
| `registry:page` | 41 | dashboard-shell, auth-shell, settings-tabs-page, finance-* |
| `registry:block` | 39 | login-aurora, orders-table, my-cards-stack, activity-timeline |
| `registry:hook` | 2 | use-debounce, use-mobile |
| `registry:theme` | 1 | base-theme (OKLCH tokens, light + dark) |
| `registry:lib` | 1 | utils (`cn` helper) |
| `registry:file` | 1 | ai-rules (`dash-ai-rules.md`) |

Categories: `template`, `shell`, `auth`, `dashboard`, `settings`, `tables`, `lists`, `forms`, `marketing`, `finance`, `hr`.

Browse them all: `ds.dash.com/library` or `dash list`.

## AI-first workflow

Three surfaces, same registry:

- **CLI** — `dash add button` — for humans and for agents that prefer shell.
- **MCP server** — `@dash/mcp-server` — exposes the registry as 6 native tools to Claude Code / Cursor / Codex. See [`dash-mcp/README.md`](../dash-mcp/README.md).
- **AI rules file** — `registry/rules/dash-ai-rules.md` — installed by `dash init`. Tells the agent: how to name files, when to extend vs fork, what tokens to never inline, how to wire forms with react-hook-form + zod.

Wire it once, every Dash repo Claude Code touches inherits the system.

```bash
# One-time setup per project
dash init
dash mcp init   # patches ~/.config/claude-code/mcp_servers.json
```

After that the agent answers questions like "what auth blocks ship with Dash?" or "search for finance dashboard templates" by calling MCP tools, not by guessing.

## Repo layout

```
dash-ds/
├── app/                       Next.js docs site (ds.dash.com)
├── registry/
│   ├── dash/                  Source TSX for every registry item
│   │   ├── ui/                Atoms + composites (92 items)
│   │   ├── blocks/            Page fragments (39 items)
│   │   ├── templates/         Full pages (41 items)
│   │   ├── hooks/             use-debounce, use-mobile
│   │   └── lib/utils.ts       `cn` helper
│   ├── rules/dash-ai-rules.md AI consumption guide
│   └── themes/                Base theme + per-vertical overrides
├── public/r/                  Built registry JSON (output)
├── packages/dash-cli/         Mirror of dash-cli (workspace pkg)
├── mcp/                       Reserved for in-repo MCP work
├── scripts/
│   ├── build-registry.ts      registry source → public/r/*.json
│   └── figma-extract.ts       Figma → .figma-cache/
├── figma-audit/               Parity decision logs (D1-D86 + summaries)
├── tests/                     Playwright visual regression
├── components.json            Schema for THIS repo (not consumers)
├── registry.json              Item catalog (source of `dash list`)
├── ROADMAP.md                 What shipped, what's next
├── AGENTS.md                  Conventions for AI editing this repo
└── NOTICE.md                  AlignUI Pro license terms
```

## Local development

```bash
pnpm install
pnpm dev                       # docs site on :3000
pnpm registry:build            # rebuild public/r/*.json after registry/ edits
pnpm typecheck                 # tsc --noEmit
pnpm test:visual               # Playwright visual diffs
pnpm screenshots               # capture key pages → public/screenshots/ (see SCREENSHOT-CAPTURE.md)
```

To point a consumer project at your local registry instead of production:

```bash
# In the consumer repo
DASH_REGISTRY_URL=http://localhost:3000 dash add button
```

## Licensing — read this before forking

This repo contains components derived from **AlignUI Pro**, a paid license held by Dash. The license permits internal use across Dash entities and portfolio products. It does **not** permit:

- Publishing this registry to a public npm or GitHub org outside `dash-tech/`.
- Reselling or relicensing the components.
- Using Dash DS in a non-Dash commercial product.

See [`NOTICE.md`](./NOTICE.md) for the full terms. If in doubt, ask the design lead before pushing the repo public or vendoring it into an unrelated client.

The CLI (`dash-cli`) and MCP server (`dash-mcp`) are infrastructure — they're MIT-licensable separately once we strip Dash-internal defaults. They are not currently published.

## Contributing

- Read [`AGENTS.md`](./AGENTS.md) first — it covers branch naming, decision-log format, and the compose-don't-fork rule.
- Check [`ROADMAP.md`](./ROADMAP.md) before starting work. Add a checkbox under the right phase.
- Visual changes: include a Playwright snapshot diff in the PR.
- Token changes: re-run `pnpm figma:variables` and commit `.figma-cache/` alongside.
- Decisions that diverge from Figma: log them in `figma-audit/decisions.md` with rationale.

The bar: a teammate (or an AI agent) should be able to install and use your component six months from now without DM'ing you.

## Related repos

- [`dash-cli`](../dash-cli/README.md) — the `dash` command-line installer.
- [`dash-mcp`](../dash-mcp/README.md) — the MCP server for AI agents.

## Open questions

If the docs are wrong, the registry is out of date, or `dash add` does something surprising, open an issue in `dash-tech/dash-ds`. Patches welcome — small ones especially.
