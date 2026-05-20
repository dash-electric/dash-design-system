# Dash Design System

The single repository for everything Dash Design System: docs site + registry, install CLI, MCP server, and Claude Code skill. Built for internal use by Dash product engineering teams.

## Why the Dash DS repo

Before consolidation, four sibling repos drifted independently — version bumps in the CLI lagged the registry, MCP server schemas fell out of sync with the docs site, and onboarding a new package engineer meant cloning three repos and reading three READMEs. Drift is the dominant failure mode for design systems used across 10+ product teams.

One `pnpm install`, one CI pipeline, one place to ship registry + tooling changes atomically, one shared `@dash/registry-schema` package as Phase 2 lands shared types. AI-first workflows (Claude Code, Cursor, MCP) work best when context is co-located: skill, MCP server, and registry source live one directory hop apart.

This is an internal-only repository. Components, branding, and tooling are licensed for use within PT Dash Elektrik Indonesia product teams only. See `NOTICE.md` in `apps/docs` for full terms.

## Quick start

```bash
# Install the CLI globally (after first publish)
pnpm i -g dash

# In any Dash product repo:
dash init           # bootstrap dash.config + tailwind tokens
dash add button     # install a registry component
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
│   └── docs/             # @dash/docs — Next.js 16 docs site + registry source of truth
├── packages/
│   ├── cli/              # dash — install CLI (v0.3.0, 49 vitest specs)
│   ├── mcp-server/       # @dash/mcp-server — MCP server exposing the registry to AI
│   ├── skill/            # @dash/skill — Claude Code skill (scaffold, Phase 2)
│   └── registry-schema/  # @dash/registry-schema — shared types (stub)
├── .github/workflows/    # CI, preview deploy, release
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── vercel.json
```

## Per-package docs

- [`apps/docs/README.md`](./apps/docs/README.md) — docs site, registry build, smoke probes
- [`packages/cli/README.md`](./packages/cli/README.md) — `dash` CLI commands and flags
- [`packages/mcp-server/README.md`](./packages/mcp-server/README.md) — MCP server setup for Claude Code / Cursor
- [`packages/skill/README.md`](./packages/skill/README.md) — Claude Code skill manifest

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
pnpm --filter dash test           # only CLI tests
pnpm --filter @dash/docs build    # only Next build
```

## Contributing

Each package has its own contributing guide (see per-package docs above). The high-level flow:

1. Branch off `main`
2. Run `pnpm install` once at the root
3. Make your change in the appropriate `apps/*` or `packages/*` directory
4. Run `pnpm typecheck` + the relevant package tests before pushing
5. Open a PR — CI runs typecheck, lint, registry build, Next build, CLI tests, docs unit tests, and visual regression

## License

Internal / proprietary. Use is restricted to PT Dash Elektrik Indonesia product engineering teams. See `apps/docs/NOTICE.md` for full terms.
