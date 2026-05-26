# dash CLI

The consumer command-line installer for the [Dash Design System](https://ds.dash.com). Pull components, blocks, and full page templates into your Next.js / Vite / Remix / Astro project — no copy-paste JSON, no curl pipelines.

Same shape as `shadcn` CLI, scoped to the `@dash` registry.

## The problem this fixes

Before this CLI, adding a Dash component meant: open `ds.dash.com`, find the item, copy its TSX, copy its CSS vars, walk its `registryDependencies` tree by hand, install the npm deps it needs, run prettier. Five minutes per component. Twenty components into a page, you're an hour deep and you forgot `--dash-purple-500`.

`dash add` does that walk for you. One command, dependencies resolved, vars merged, files written into the paths your project already uses.

## Install

```bash
pnpm dlx github:dash-tech/dash-cli@latest --help
```

Or install globally:

```bash
pnpm i -g github:dash-tech/dash-cli
dash --help
```

> v1 ships from GitHub. v1.1 will publish to GitHub Packages once we settle the `@dash-tech` org scope. `pnpm dlx github:…` is the canonical path until then.

## Quickstart

```bash
# 1. In your project root
dash init

# 2. Add components — deps resolved recursively
dash add button card sidebar

# 3. Find what's available
dash search "table"
dash list --type page
```

`dash init` is idempotent. Run it again to re-sync `components.json` after pulling new defaults.

## The top three commands

### `dash init`

Sets up the project to consume the `@dash` registry. Writes:

- `components.json` with `registries["@dash"].url` pointing at `https://ds.dash.com`
- Base CSS vars in `app/globals.css` (or your configured CSS entry)
- Installs `@dash/base-theme` (OKLCH light + dark tokens)
- Installs `@dash/ai-rules` (the `dash-ai-rules.md` file consumed by Claude Code, Cursor, Codex)

Re-running it preserves your local edits to `components.json` and only patches missing keys.

### `dash add <name...>`

Installs one or more registry items. Resolves the full dependency graph before touching disk.

```bash
dash add button                 # one atom
dash add data-table             # pulls table, input, button, icon-button…
dash add dashboard-shell        # full page template + every shell dep
dash add login-aurora register-aurora reset-password-key
```

For each item, the CLI:

1. Fetches `{registryUrl}/r/{name}.json`
2. Walks `registryDependencies` recursively (dedup'd)
3. Runs `pnpm add` for any `dependencies` (npm packages)
4. Writes files to `target` paths (e.g. `app/(main)/layout.tsx` for `dashboard-shell`)
5. Merges new CSS vars into your `globals.css` — additive, never overwriting

If a target path already exists, you get a diff and a `[k]eep / [o]verwrite / [d]iff` prompt.

### `dash info`

Scans the current project and emits a structured snapshot — framework, package manager, TypeScript yes/no, alias map, registry URL, whether a token is present (the token itself is never printed), the list of installed `@dash` items, custom hooks under your hooks dir, and the API base URL from `.env*`.

```bash
dash info              # pretty table for humans
dash info --json       # single JSON object — for tooling / skills / CI
```

Flags: `--cwd <path>` to scan an arbitrary directory, `--registry <url>` / `--token` to override.

The JSON shape is stable (`schemaVersion: 1`). It is the canonical input for the `@dash/skill` package (Phase 2) — the AI reads it on session start to know which components you already have, what your aliases look like, and which domain hooks (`useDelivery`, `useDispatch`, …) are local to your repo. Pure read; never writes.

### `dash search <query>`

Full-text search across `name`, `title`, `description`, `categories`.

```bash
dash search "auth"              # all auth-related items
dash search "finance dashboard" # vertical-specific templates
dash search "settings" --type page
```

Use this before `dash add` to confirm the exact name. The registry has 178 items — guessing rarely works.

### `dash doctor`

End-to-end health check per laptop. Runs ten diagnostics: registry reachable (`/api/health`), token valid (`/r/utils.json` with `Authorization: Bearer …`), MCP wired (Claude Code + Cursor), CLI version, framework detected, `components.json` present, `.env.local` has a token, Node ≥ 20, package manager, workspace detection.

```bash
dash doctor                      # pretty output
dash doctor --json               # machine output (CI / tooling)
dash doctor --no-network         # offline diagnostic (skips registry + token probes)
dash doctor --registry http://localhost:3000   # override registry for the check
```

Sample output:

```
🩺 Dash DS health check

  ✓ Registry reachable        https://ds.dash.com/api/health → 200
  ✓ Token valid               /r/utils.json → 200
  ✓ MCP wired                 Claude Code · Cursor
  ✓ CLI version               v0.4.0
  ✓ Framework                 next-app
  ✓ components.json           found
  ✓ .env.local                DASH_REGISTRY_TOKEN set
  ✓ Node                      v20.10.0
  ✓ Package manager           pnpm
  ✓ Workspace                 workspace detected

Summary: 10 OK, 0 warnings, 0 errors
```

The command never prints the token value — only its presence. Exits non-zero when any check is in `error` state (handy for CI / pre-flight scripts).

### `dash mcp init`

Wires `@dash/mcp-server` into your editor's MCP config. Supports both Claude Code (`~/.claude/mcp-config.json`, key `dash`, bakes the token in `env`) and Cursor (`~/.cursor/mcp.json`, key `@dash`, interpolates `${env:DASH_REGISTRY_TOKEN}` so the token stays out of disk).

```bash
dash mcp init                    # auto-detect installed editors
dash mcp init --claude-code      # Claude Code only
dash mcp init --cursor           # Cursor only
dash mcp init --both             # both editors in one shot
dash mcp init --check-only       # detect + report, no writes
```

For Cursor, export `DASH_REGISTRY_TOKEN` in your shell rc (`~/.zshrc` or `~/.bashrc`) so Cursor can resolve the `${env:…}` reference at startup.

## Full command reference

| Command | Description |
| --- | --- |
| `dash init` | Initialize `components.json`, base tokens, AI rules |
| `dash add <name...>` | Install items, resolve `registryDependencies`, merge CSS vars |
| `dash info` | Print project snapshot (framework, aliases, installed items) — pretty or `--json` |
| `dash search <query>` | Full-text search the registry |
| `dash list` | List all items (filter with `--type ui\|block\|page\|hook`) |
| `dash diff <name>` | Compare local copy of an item against latest registry version |
| `dash build` | Build registry JSON from source (only inside the `dash-ds` repo) |
| `dash mcp init` | Wire `@dash/mcp-server` into Claude Code (`~/.claude/mcp-config.json`) and/or Cursor (`~/.cursor/mcp.json`). Auto-detects installed editors. Flags: `--claude-code`, `--cursor`, `--both`, `--check-only` |
| `dash doctor` | End-to-end health check (registry reachable, token valid, MCP wired per editor, framework, Node, package manager, workspace root). Flags: `--json`, `--registry <url>`, `--no-network` |

Global flags: `--registry-url <url>`, `--token <bearer>`, `--cwd <path>`, `--verbose`.

Run `dash <command> --help` for per-command flags.

## Configuration

### Registry URL resolution

Resolved in this order (first hit wins):

1. `--registry-url` CLI flag
2. `components.json` → `registries["@dash"].url`
3. `DASH_REGISTRY_URL` environment variable
4. Default: `http://localhost:3000` (local-dev convention; CLI + MCP server both default here)

For production consumer repos: `export DASH_REGISTRY_URL=https://ds.dash.com` in shell rc, or pass `--registry-url https://ds.dash.com` per command.

### Auth

The production registry expects a bearer token. Set one of:

```bash
# .env.local in your project
DASH_REGISTRY_TOKEN=dash_pat_xxx

# Or per-command
dash add button --token dash_pat_xxx
```

The token is sent as `Authorization: Bearer <token>`. Ask the design lead for one; do not commit them.

### components.json

```json
{
  "$schema": "https://ds.dash.com/schema.json",
  "registries": {
    "@dash": {
      "url": "https://ds.dash.com",
      "headers": { "Authorization": "Bearer ${DASH_REGISTRY_TOKEN}" }
    }
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  },
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

`aliases` map registry paths into your project's structure. The defaults match a stock Next.js App Router layout.

## Troubleshooting

**`Error: registry returned 401`**
Token missing or expired. Set `DASH_REGISTRY_TOKEN` or pass `--token`. Confirm with `curl -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" https://ds.dash.com/r/button.json`.

**`Error: cannot resolve dependency "foo"`**
The registry item references something the CLI can't reach — usually a private package or a registry item from a different namespace. Run with `--verbose` to see the full dependency graph; file an issue against `dash-ds` if a `@dash/*` item is unresolvable.

**`File already exists, overwrite?` on every run**
You've edited the installed file and the registry version drifted. Run `dash diff <name>` to see what changed; merge by hand if your local edits matter, otherwise pick `[o]verwrite`.

**CSS vars duplicated after `dash add`**
Known limitation in v1 — the merger is regex-based. Open `app/globals.css`, search for the variable name, delete duplicates. v1.1 will use an AST-based merger.

**`dash` not found after global install**
`pnpm i -g` doesn't update your shell's PATH cache. Open a new terminal or `hash -r` (bash/zsh).

## Local Development (Dash team)

When developing the CLI or testing consumer-side integration end-to-end, the registry must run locally — the CLI fetches `/r/<name>.json` from whatever URL it resolves.

```bash
# Terminal 1: start docs site (serves the registry at /r/*.json)
cd /Users/irfanprimaputra.b/Work/dash/dash-ds
pnpm --filter @dash/docs dev
# → http://localhost:3000

# Terminal 2: smoke test the CLI against a throwaway project
mkdir /tmp/dash-test && cd /tmp/dash-test
dash init --yes --registry-url http://localhost:3000
dash add button card sidebar --yes
dash list --registry-url http://localhost:3000
```

The CLI default resolves to `http://localhost:3000` (matches the docs dev server). For production deployment override via `DASH_REGISTRY_URL=https://ds.dash.com` in shell rc or `--registry-url https://ds.dash.com` per command.

> If you see `Warning: missing peer tailwindcss>=3.0.0` after `dash init`, install Tailwind in the consumer project: `pnpm add -D tailwindcss postcss autoprefixer && pnpm dlx tailwindcss init`. The CLI does not auto-install Tailwind to avoid overwriting your existing config.

## Development

```bash
git clone https://github.com/dash-tech/dash-cli
cd dash-cli
pnpm install
pnpm build                      # tsc → dist/
node dist/index.js --help

# Smoke test against a local dash-ds dev server
node dist/index.js list --registry-url http://localhost:3000
```

The CLI is intentionally dependency-light: `commander`, `prompts`, `ora`, `kleur`. No bundler. `tsc` is the build.

## Known limitations (v1)

- No persistent disk cache — every run re-fetches `index.json` (~30KB).
- CSS var merger is regex-based; complex `globals.css` may need manual cleanup.
- `dash diff` is line-by-line, not a proper unified diff.
- No `dash remove` or `dash update` yet — delete files manually for now.
- No Vitest suite. Smoke testing via `node dist/index.js …` against localhost.

## Roadmap

**v1.1**

- Publish to GitHub Packages as `@dash-tech/dash-cli`.
- Vitest suite covering `add`, `diff`, dependency resolution.
- AST-based CSS var merger (PostCSS).
- `dash update <name>` — re-fetch and overwrite.
- `dash remove <name>` — reverse of `add`, with safety prompt.
- Disk cache at `~/.cache/dash-cli/` with `--no-cache` opt-out.

**v2**

- Plugin hooks: `preAdd`, `postAdd` so squads can run codemods.
- Workspace mode: install into multiple packages in one command.
- Telemetry (opt-in) so the design team knows which components actually get used.

## Related repos

- [`dash-ds`](../dash-ds/README.md) — the registry source this CLI fetches from.
- [`dash-mcp`](../dash-mcp/README.md) — the MCP server for AI agents (wired via `dash mcp init`).
