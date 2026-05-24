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

### 1. Connect OpenAI

Two supported paths. Pick one.

**Option A — Bring your own API key (recommended for teams)**

On the dashboard, paste an OpenAI API key (`sk-...`) into the
**Connect OpenAI** form. The key is encrypted with AES-256-GCM and stored at
`~/.dash-build/auth/openai-byo-key.json`.

**Option B — Codex CLI login (local convenience)**

Install the official Codex CLI and run `codex login --device-auth` once.
Dash Build will spawn `codex exec` for generation while your OpenAI login
stays inside Codex.

```bash
curl http://localhost:7777/api/auth/openai/codex-cli
```

### 2. Connect GitHub

Click **Install GitHub App** → install Dash Build app on your repo.

During local pilot, if GitHub App environment variables are not configured,
the dashboard may route through `/api/auth/github/callback?stub=1` so the rest
of the UI can be tested. Real PR creation requires the GitHub App credentials
listed below.

### 3. Pick repo

Select from dropdown.

### 4. Build

Type prompt: `tambahin chart payroll di backoffice`
Click **Generate** → AI consults Dash DS Skill → may ask clarifications
→ generates code → preview → **Open PR**.

## Local Testing Without GitHub App

For local output/preview testing, GitHub is optional. Connect OpenAI through
Codex, pick `dash/portal-v2` or `dash/backoffice`, then submit a prompt. Dash
Build will generate and render the preview locally. Install/connect the GitHub
App only when you want the **Review & approve** action to open a real PR.

Real repo preview can still be auth-gated. Backoffice requires a valid
`UserAuth`/cross-domain session, while portal-v2 requires `clientUserToken` and
profile/config API data on the portal origin. Dash Build should show the live
local app URL plus the auth requirements, then render generated previews through
a first-party preview harness with mocked auth/context and fixture data instead
of patching production repos with bypass auth.

For auth-gated repos, the canvas defaults to the first-party preview harness so
local review does not get blocked by login screens, expired tokens, or iframe
runtime errors. Use **Open real app** only when you need manual authenticated
review in the target repo itself.

Generated artifacts now carry their resolved Context Pack into the review card:
selected repo, inferred surface/theme, known shell nav, default route, target
route, target nav label, and integration contract. This makes P0 testing
auditable: if output ignores the selected repo, check whether context inference
or model generation failed before judging the preview.

### Milestone Reset

During P0 testing, use the dashboard **Reset** button or call:

```bash
curl -X POST http://localhost:7777/api/prompts/reset
```

This clears local prompt/run history and removes generated preview bundles while
keeping the selected repo, branch, OpenAI auth, and GitHub connection intact. Use
it before a fresh end-to-end test so old `awaiting_approval` runs do not pin the
canvas to the wrong repo or prompt.

## Planning Workflow

Dash Build adopts a gstack-inspired planning model without vendoring gstack as
a runtime dependency. Rough prompts are normalized into explicit artifacts
before Codex generation:

```
raw prompt
  -> dash-intake
  -> clarification gate
  -> dash-prd
  -> dash-design-review
  -> dash-trd
  -> Skill v4 + Codex
  -> dash-review
  -> dash-qa
  -> preview / PR
  -> dash-doc-release + dash-learn
```

See:

- [`docs/gstack-adoption.md`](./docs/gstack-adoption.md)
- [`docs/open-design-reference.md`](./docs/open-design-reference.md)
- [`docs/context-intake.md`](./docs/context-intake.md)
- [`docs/artifact-contracts.md`](./docs/artifact-contracts.md)
- [`docs/skill-routing.md`](./docs/skill-routing.md)
- [`docs/qa-and-review.md`](./docs/qa-and-review.md)

## Architecture

```
┌──────────────────────────────────────────────┐
│ Browser (localhost:7777/dashboard)           │
│   ↕ WebSocket                                │
│ Daemon (Node.js, packages/dash-build)        │
│   ├ OpenAI auth (Codex CLI + BYO key)        │
│   ├ GitHub App (Bearer token + Octokit)      │
│   ├ Skill chain (PRD + design.md + Skill v4) │
│   ├ Clarification (multi-turn questions)     │
│   ├ Preview (sandboxed iframe + esbuild)     │
│   └ Pipeline (queued → PR created)           │
│ OpenAI / Codex ─ via CLI or API              │
│ GitHub API ── via App installation           │
└──────────────────────────────────────────────┘
```

## Configuration

Env vars (optional overrides):

| Var                              | Default                       | Description                  |
| -------------------------------- | ----------------------------- | ---------------------------- |
| `DASH_BUILD_PORT`                | `7777`                        | Daemon port                  |
| `DASH_DS_ROOT`                   | auto-detected from cwd        | Dash DS root used for `design.md` and foundation rules |
| `DASH_BUILD_CODEX_TIMEOUT_MS`    | `600000`                      | Max local Codex generation time |
| `DASH_BUILD_OPENAI_MODEL`        | Codex CLI default             | Optional model override passed to Codex/API |
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

## Design Consistency

Dash Build intentionally separates the target repo from the design authority.
Repo detection still comes from the selected project, but global UI quality is
loaded from this `dash-ds` repo:

1. `design.md` — cross-repo product character and anti-patterns.
2. `apps/docs/registry/dash/foundation/rules/cardinal-rules.md` — CR-1..CR-8.
3. `apps/docs/registry/dash/foundation/voice/voice-rules.md` — formal voice rules.
4. `LAYERED-ARCHITECTURE.md` — Layer 0..3 placement rules.
5. `@dash/skill` — target repo stack mandate and banned imports.
6. Open Design reference lessons — active design-system loading, deterministic
   discovery, progress checklist, critique, and compact workspace density.

If the selected product repo does not contain Dash foundation files, the loader
falls back to the current `dash-ds` root or `DASH_DS_ROOT`. That keeps generated
UI consistent when switching between `portal-v2`, `backoffice`,
`react-fleet`, or future repos.

## Troubleshooting

### Daemon won't start

```bash
dash-build status   # check PID file
dash-build stop     # kill stale process
dash-build start    # fresh launch
```

### Port 7777 taken

Daemon auto-falls back to `7778`, `7779`, … up to `7786`.

### OpenAI key save fails

1. Confirm the key starts with `sk-` and you copied it whole from the
   OpenAI Platform.
2. Check `~/.dash-build/auth/` is writable by your user.
3. Or skip BYO key entirely and use the Codex CLI path
   (`codex login --device-auth` once in your terminal).

### GitHub App fails

Verify env vars are set. Re-install the app via the dashboard.

## Files Created

| Path                                       | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `~/.dash-build/daemon.pid`                 | Daemon PID                       |
| `~/.dash-build/state.json`                 | Daemon state (atomic-write JSON) |
| `~/.dash-build/auth/openai-byo-key.json`   | Encrypted BYO OpenAI API key     |
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

Dash Build supports two auth paths:

### Path A — Bring your own OpenAI API key (recommended for teams)
1. Get an API key from <https://platform.openai.com/api-keys>
2. Paste it into the dashboard's "Connect OpenAI" form or POST it to `/api/auth/openai`.
3. The key is encrypted (AES-256-GCM) and stored at `~/.dash-build/auth/openai-byo-key.json` with mode 0600.
4. Direct API mode uses the Responses API.

### Path B — Codex CLI login (local convenience)
1. Install Codex CLI: `npm i -g @openai/codex`
2. Log in once: `codex login --device-auth`
3. Run `dash-build`. The dashboard auto-detects `codex` on PATH and can use it.
4. Generation runs as `codex exec`; your OpenAI login stays inside Codex.

`GET /api/auth/openai` reports the active mode in its `activeMode` field
(`byo-key` | `codex-cli` | `none`). The pipeline orchestrator transparently
routes through either path via `AuthenticatedOpenAIClient.complete()`.

## License

Internal — Dash Electric Indonesia.
