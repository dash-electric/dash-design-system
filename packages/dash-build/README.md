# @dash/build

Lovable-for-Dash internal builder. Browser-based AI workflow for any Dash team member.

## Install

```bash
npm install -g @dash/build
```

## Quick Start

```bash
dash-build
```

Opens interactive menu:

- Web UI (Open in Browser) — default, recommended
- Terminal UI (Interactive CLI)
- Hide to Tray (Background)
- Exit

## Setup (one-time)

After first run, open dashboard at <http://localhost:7777/dashboard>.

### 1. Connect Anthropic

Two ToS-safe options. Pick one.

**Option A — Bring your own API key (default, recommended)**

On the dashboard, paste an Anthropic API key (`sk-ant-...`) into the
**Connect Anthropic** form. Get one at <https://console.anthropic.com/>.
The key is encrypted with AES-256-GCM and stored at
`~/.dash-build/auth/anthropic-byo-key.json`.

**Option B — Claude Code subprocess (subscription-friendly)**

Install the official Claude Code CLI and run `claude login` once. Dash
Build will spawn `claude` as a subprocess for generation — your Pro/Max
subscription is consumed via the official client, not extracted into a
third-party app. Probe availability:

```bash
curl http://localhost:7777/api/auth/anthropic/claude-cli
```

> **Why not subscription OAuth?** Anthropic's Consumer Terms of Service
> update (Feb 2026, enforced April 4 2026) made third-party use of
> Claude Pro/Max OAuth tokens a ToS violation. Tools that continued the
> pattern had tokens blocked. Dash Build removed that flow in 0.1.1.

### 2. Install GitHub App

Click **Install GitHub App** → install Dash Build app on your repo.

### 3. Pick repo

Select from dropdown.

### 4. Build

Type prompt: `tambahin chart payroll di backoffice`
Click **Generate** → AI consults Dash DS Skill → may ask clarifications
→ generates code → preview → **Open PR**.

## Architecture

```
┌──────────────────────────────────────────────┐
│ Browser (localhost:7777/dashboard)           │
│   ↕ WebSocket                                │
│ Daemon (Node.js, packages/dash-build)        │
│   ├ Anthropic auth (BYO key + Claude CLI)    │
│   ├ GitHub App (Bearer token + Octokit)      │
│   ├ Skill chain (dash-prd + design + Skill)  │
│   ├ Clarification (multi-turn questions)     │
│   ├ Preview (sandboxed iframe + esbuild)     │
│   └ Pipeline (queued → PR created)           │
│ Anthropic API ─ via subscription             │
│ GitHub API ── via App installation           │
└──────────────────────────────────────────────┘
```

## Configuration

Env vars (optional overrides):

| Var                              | Default                       | Description                  |
| -------------------------------- | ----------------------------- | ---------------------------- |
| `DASH_BUILD_PORT`                | `7777`                        | Daemon port                  |
| `DASH_BUILD_GITHUB_APP_ID`       | _(required for GitHub)_       | GitHub App ID                |
| `DASH_BUILD_GITHUB_PRIVATE_KEY`  | _(required)_                  | PEM-encoded private key      |
| `DASH_BUILD_GITHUB_CLIENT_ID`    | _(required)_                  | OAuth client ID              |
| `DASH_BUILD_GITHUB_CLIENT_SECRET`| _(required)_                  | OAuth client secret          |
| `DASH_BUILD_GITHUB_APP_SLUG`     | `dash-build`                  | App slug (for install URL)   |
| `DASH_BUILD_GITHUB_WEBHOOK_SECRET`| _(optional)_                 | Only if webhooks enabled     |

## GitHub App Setup

Manual setup for pilot phase:

1. <https://github.com/settings/apps> → **New GitHub App**
2. **Name:** `Dash Build` (your org)
3. **Homepage:** `http://localhost:7777`
4. **Callback:** `http://localhost:7777/api/auth/github/callback`
5. **Permissions** (Repository):
   - Contents: Read & write
   - Pull requests: Read & write
   - Metadata: Read-only
6. **Subscribe to events:** (none required for MVP)
7. **Where can this GitHub App be installed?** Only on this account
8. Save → **Generate a private key**
9. Set env vars per table above

## Troubleshooting

### Daemon won't start

```bash
dash-build status   # check PID file
dash-build stop     # kill stale process
dash-build start    # fresh launch
```

### Port 7777 taken

Daemon auto-falls back to `7778`, `7779`, … up to `7786`.

### Anthropic key save fails

1. Confirm the key starts with `sk-ant-` and you copied it whole from the
   Anthropic Console.
2. Check `~/.dash-build/auth/` is writable by your user.
3. Or skip BYO key entirely and use the Claude CLI subprocess path
   (`claude login` once in your terminal).

### GitHub App fails

Verify env vars are set. Re-install the app via the dashboard.

## Files Created

| Path                                       | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `~/.dash-build/daemon.pid`                 | Daemon PID                       |
| `~/.dash-build/state.json`                 | Daemon state (atomic-write JSON) |
| `~/.dash-build/auth/anthropic-byo-key.json`| Encrypted BYO Anthropic API key  |
| `~/.dash-build/auth/github.json`           | Encrypted installation tokens    |
| `~/.dash-build/sessions/<id>.json`         | Clarification sessions           |
| `~/.dash-build/preview/<id>/`              | Bundled previews                 |

Encrypted files use AES-256-GCM with a key derived from `username@hostname`.
Moving the file to another machine will not decrypt — re-install the App
from the dashboard.

## Development

```bash
cd /Users/irfanprimaputra.b/dash-ds
pnpm install
pnpm --filter @dash/build dev        # watch mode
pnpm --filter @dash/build test       # run tests
pnpm --filter @dash/build typecheck  # tsc --noEmit
pnpm --filter @dash/build build      # production build
```

Smoke test (full pipeline, no network): `pnpm vitest run src/__tests__/smoke/`

## Authentication

Dash Build supports two ToS-safe paths:

### Path A — Bring your own Anthropic API key (default)
1. Get an API key from <https://console.anthropic.com/settings/keys>
2. Paste it into the dashboard's "Connect Anthropic" form or POST it to `/api/auth/anthropic`.
3. The key is encrypted (AES-256-GCM) and stored at `~/.dash-build/auth/anthropic-byo-key.json` with mode 0600.
4. You pay Anthropic per token used.

### Path B — Subprocess the official Claude Code CLI (subscription-friendly)
1. Install Claude Code: `npm i -g @anthropic-ai/claude-code`
2. Log in once: `claude login` (uses Anthropic's own OAuth — your Pro/Max subscription).
3. Run `dash-build`. The dashboard auto-detects `claude` on PATH and uses it.
4. Generation runs as `claude -p "<prompt>"` subprocess; tokens stay inside Claude Code. Your subscription covers usage.

`GET /api/auth/anthropic` reports the active mode in its `activeMode` field
(`byo-key` | `claude-cli` | `none`). The pipeline orchestrator transparently
routes through either path via `AuthenticatedAnthropicClient.complete()`.

**Why no built-in subscription OAuth?** Anthropic's Consumer ToS (Feb 2026, enforced Apr 4 2026) bans third-party apps from minting subscription OAuth tokens. Subprocess-ing the official Claude Code CLI is different — you run Claude Code yourself; Dash Build only orchestrates the subprocess. The subscription token never leaves Claude Code.

## License

Internal — Dash Electric Indonesia.
