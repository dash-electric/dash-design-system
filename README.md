# Dash Design System

> Internal sovereign Design System for Dash Electric — multi-tier platform
> foundation + AI-native developer workflow.

The single repository for everything Dash Design System: docs site +
registry, install CLI, MCP server, AI editor skill, autonomous Hermes
generation pipeline, and the browser-based Dash Build workflow.

Built for internal use by 10+ engineers across Dash product engineering
teams (Ride, Logistic, Travel, Marketplace, Trellis tenants).

## What's Here

### Core Platform (~225 registry items)

Layer 0 brand foundation → Layer 1 primitives → Layer 2 product themes →
Layer 3 workflow blocks. See [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full spec, migration case studies, and visual showcase.

- **Layer 0** — Brand foundation: type ramp, spacing, radius, motion,
  semantic tokens, a11y floor. RFC-gated.
- **Layer 1** — ~76 shared primitives (Button, Input, Modal, …).
- **Layer 2** — Product/tenant themes (`ride`, `logistic`, `travel`,
  `marketplace`, `trellis-*`).
- **Layer 3** — Workflow blocks owned by product squads.

### Tooling

- **`@dash-tech/dashkit`** — Component install, audit, sync. Published to GitHub Packages (org-restricted).
  Commands: `init`, `add`, `audit`, `build`, `diff`, `doctor`, `info`,
  `list`, `login`, `mcp`, `search`, `sync`. 49 vitest specs.
- **`@dash/mcp-server`** — AI editor integration. 7 MCP tools, bearer-gated.
- **`@dash/skill`** — Per-prompt context injection (v4 freshness cache).
  Priority-pinned context blocks + per-repo scoping.
- **`@dash/worker`** — Hermes autonomous generation pipeline.
- **`@dash/build`** ⭐ — **Browser-based AI builder. Lovable-for-Dash internal.**
  - `pnpm i -g @dash/build && dash-build`
  - Daemon at localhost:7777, 9router-style multi-interface menu
  - OpenAI connection via official Codex CLI login, with BYO OpenAI API key fallback
  - GitHub App PR creation; local pilot can fall back to a stub callback while app credentials are being wired
  - Skill chain: dash-prd → `design.md` → Layer 0 rules → Skill v4 → OpenAI/Codex
  - Sandboxed iframe preview, foundation match score (0-100)
  - Lovable-style split dashboard, toast notifications, skeleton states
  - 263 tests, cross-platform path support (macOS / Linux / Windows)
  - See [`packages/dash-build/README.md`](./packages/dash-build/README.md)

## Why this repo

Before consolidation, four sibling repos drifted independently — version
bumps in the CLI lagged the registry, MCP server schemas fell out of sync
with the docs site, and onboarding a new package engineer meant cloning
three repos and reading three READMEs. Drift is the dominant failure mode
for design systems used across 10+ product teams.

One `pnpm install`, one CI pipeline, one place to ship registry +
tooling changes atomically, one shared `@dash/registry-schema` package.
AI-first workflows (Codex, Claude Code, Cursor, MCP, Dash Build) work best when
context is co-located: skill, MCP server, registry source, and the
generation pipeline all live one directory hop apart.

## Quick start

> **First time?** Follow [Step 1 of the onboarding playbook](./docs/pilot/ONBOARDING-PLAYBOOK.md#step-1--install-the-cli) to configure `~/.npmrc` with your GitHub Packages PAT — the CLI is published org-restricted to `@dash-tech`.

```bash
# In any Dash product repo (after one-time .npmrc setup):
pnpm i -g @dash-tech/dashkit
dashkit init           # bootstrap dash.config + tailwind tokens
dashkit add button     # install a registry component

# Or kick off the browser-based AI builder:
pnpm i -g @dash/build
dash-build          # → http://localhost:7777/dashboard
```

Local development of the repo itself:

```bash
git clone <this repo>
cd dash-ds
pnpm install
pnpm dev            # boots apps/docs at localhost:3000
```

## Repo structure

```
dash-ds/
├── apps/
│   └── docs/                  # @dash/docs — Next.js 16 docs site + registry source of truth
├── packages/
│   ├── cli/                   # dashkit — install CLI (v0.4.0, 49 vitest specs)
│   ├── mcp-server/            # @dash/mcp-server — MCP server exposing the registry to AI
│   ├── skill/                 # @dash/skill — Claude Code skill (v4)
│   ├── worker/                # @dash/worker — Hermes generation pipeline
│   ├── dash-build/            # @dash/build — browser-based AI builder
│   └── registry-schema/       # @dash/registry-schema — shared types
├── .github/workflows/         # CI, preview deploy, release
├── design.md                  # Global cross-repo Dash design contract for AI generation
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── vercel.json
```

## Per-package docs

- [`apps/docs/README.md`](./apps/docs/README.md) — docs site, registry build, smoke probes
- [`packages/cli/README.md`](./packages/cli/README.md) — `dashkit` CLI commands and flags
- [`packages/mcp-server/README.md`](./packages/mcp-server/README.md) — MCP server setup for Claude Code / Cursor
- [`packages/skill/README.md`](./packages/skill/README.md) — Claude Code skill manifest
- [`packages/dash-build/README.md`](./packages/dash-build/README.md) — Dash Build daemon, auth, deployment
- [`packages/dash-build/docs/gstack-adoption.md`](./packages/dash-build/docs/gstack-adoption.md) — gstack-inspired Dash Build planning workflow

## Common scripts (run from repo root)

| Command | What it does |
| --- | --- |
| `pnpm dev` | Boot the docs site (apps/docs) |
| `pnpm build` | Build every package |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm test` | Run every package's test script |
| `pnpm registry:build` | Emit `apps/docs/public/r/*.json` |
| `pnpm smoke` | Hit the local docs site with smoke probes |

Package-scoped commands use pnpm filters:

```bash
pnpm --filter @dash-tech/dashkit test   # only CLI tests
pnpm --filter @dash/docs build          # only Next build
pnpm --filter @dash/build typecheck     # only Dash Build typecheck
pnpm --filter @dash/build test          # only Dash Build tests (263)
```

## Contributing

Each package has its own contributing guide (see per-package docs above).
The high-level flow:

1. Branch off `main`
2. Run `pnpm install` once at the root
3. Make your change in the appropriate `apps/*` or `packages/*` directory
4. Run `pnpm typecheck` + the relevant package tests before pushing
5. Open a PR — CI runs typecheck, lint, registry build, Next build, CLI
   tests, docs unit tests, and visual regression

## Status

Wave 5 pilot active. 78+ commits shipped. 6 packages production-ready
(cli, mcp-server, skill, worker, dash-build, registry-schema). Layered
architecture live across Ride / Logistic / Travel / Marketplace.

## License

Internal / proprietary. Use is restricted to PT Dash Elektrik Indonesia
product engineering teams. See `apps/docs/NOTICE.md` for full terms.
