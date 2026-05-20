# @dash/build

**Dash Build** — Lovable-for-Dash internal builder. Browser-based AI workflow for any Dash team member.

## Install

```bash
npm i -g @dash/build
```

## Usage

```bash
dash-build
```

Interactive menu opens. Pick:

- **Web UI** — start daemon + open browser dashboard
- **Terminal UI** — interactive CLI prompt loop (coming soon)
- **Hide to Tray** — start daemon in background
- **Exit** — quit

## Architecture

Day 1 scaffold (this package):

- `bin.ts` — CLI entry, runs interactive menu
- `menu/` — banner, prompt loop, port detection
- `modes/` — web-ui, terminal-ui, tray, exit dispatchers
- `daemon/` — placeholder (real daemon = Agent B)

Day 2+ integrations:

- **Agent B** — daemon HTTP server (Hono + WebSocket)
- **Agent C** — Anthropic OAuth
- **Agent D** — GitHub PR automation (see `src/integrations/github/`)

## GitHub App setup

The GitHub integration uses a GitHub App (not a personal access token) so
each user's install grants per-repo permission and tokens auto-rotate.

For the Wave 5 pilot, Irfan registers a single App manually on the
`irfanputra-design` org. Production rollout will move this to the Dash org.

### One-time App registration

1. Visit `https://github.com/organizations/<org>/settings/apps/new` (or
   `https://github.com/settings/apps/new` for a personal-account App).
2. **Name:** `Dash Build` (slug will be `dash-build`).
3. **Homepage URL:** `https://dash.id` (or any placeholder during pilot).
4. **Callback URL:** `http://localhost:7777/api/auth/github/callback`
   (the daemon's local port). Add additional ports here if needed.
5. **Webhook:** disable for pilot (we poll via API). Leave secret blank.
6. **Permissions** (Repository):
   - Contents: Read & write
   - Pull requests: Read & write
   - Metadata: Read-only
7. **Where can this GitHub App be installed?** — Any account (or just your org).
8. Create the App. From its settings page, generate a private key (`.pem`).

### Daemon env vars

Export these before running `dash-build`:

```bash
export DASH_BUILD_GITHUB_APP_ID="123456"
export DASH_BUILD_GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxxxxxx"
export DASH_BUILD_GITHUB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# PEM contents — literal "\n" between lines is tolerated.
export DASH_BUILD_GITHUB_PRIVATE_KEY="$(cat dash-build.<id>.private-key.pem)"
# Optional:
export DASH_BUILD_GITHUB_APP_SLUG="dash-build"       # default
export DASH_BUILD_GITHUB_WEBHOOK_SECRET=""           # only if webhooks enabled
```

If any required env var is missing, GitHub features stay disabled in the UI
(the "Connect GitHub" button is hidden) and the rest of the daemon keeps
running. Check `hasAppConfig()` from `src/integrations/github/app-config.ts`
to gate UI affordances.

### Tokens at rest

Installation metadata is persisted under
`~/.dash-build/auth/github.json`, AES-256-GCM encrypted with a key derived
from `username@hostname`, with file mode `0o600`. Moving the file to another
machine will not decrypt — re-install the App from the dashboard.

## Status

Phase 1 scaffold — menu + mode dispatcher only. No daemon yet.
