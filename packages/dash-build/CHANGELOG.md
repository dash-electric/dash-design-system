# Changelog

All notable changes to `@dash/build` are documented here.

## Unreleased — 2026-05-28

### Pivot — component-focused preview

- **Lovable-style home + workspace shell.** New landing (`/`) with prompt
  composer, recent projects grid, and template cards. Workspace at
  `/workspace/:runId` runs a 2-pane split: chat thread + composer on the
  left, Sandpack canvas + tab strip on the right.
- **Component preview via Sandpack** (`src/daemon/templates/client/preview-mount.ts`).
  Replaces the iframe-full-app path as the default. Generated components mount
  against an esm.sh CDN React runtime, with `@dash/ui` tokens + Tailwind
  injected so DS atoms render correctly. Loading state shows a shimmering
  skeleton instead of blank white.
- **BE-aware intake** (`src/intake/`, `src/runs/artifact-store.ts`). Each run
  scans the target repo for Express/Next API endpoints, Prisma/SQL schema,
  FE component patterns, and audit-trail exposure. Snapshot persisted to
  `runs/<runId>/intake.json` for cold-load context map and skill-chain
  consumption. CR-3 OUTPUT enforcer rejects artifacts shipping sensitive
  fields (payment / KYC / signature / image-proof) without an audit-log call.

### Added — UX polish (Tier 3 batch)

- Sidebar icons carry native tooltip + `aria-label` so they stay scannable
  when the rail is collapsed.
- Keyboard shortcuts: `Cmd/Ctrl+Enter` submits the composer (existing);
  `/` focuses the composer from anywhere on the page (skips when typing
  in another input); `Esc` clears the composer textarea when it has draft
  content.
- Empty chat state surfaces up to 3 recent prompts for the active project
  as clickable chips; clicking fills the composer (does not auto-submit).
- Sandpack loading skeleton replaces the previously blank iframe area
  during the 3-5s compile window.

### Added — agent observability

- AOP (Agent Observability Protocol) event emission wired through the
  pipeline orchestrator. Each pipeline step (`queued`, `started`,
  `intake.complete`, `prompt.composed`, `llm.requested`, `llm.responded`,
  `validated`, `completed`, `failed`) emits a structured event over
  `broadcaster` AND persists to `runs/<runId>/events.jsonl` for replay.
  Schema lives in `packages/aop-schema` (`@dash/aop-schema`).

### Changed

- README documents the component preview pattern and demotes
  iframe-full-app to a "Legacy" note (still wired behind the "Activate
  clone preview" button).
- Pivot plan tracked in `docs/pivot-plan-2026-05-28.md`.

## 0.1.2 — 2026-05-21

### Changed

- Switched the recommended auth path to first-party OpenAI login through the
  official Codex CLI. Dash Build now treats `codex login --device-auth` as the
  preferred zero-key setup and can fall back to an encrypted OpenAI API key.
- Added `design.md` as the global Dash design contract and wired it into the
  generation prompt before cardinal rules, Layered Architecture, and per-repo
  Skill context. This keeps UI output consistent when switching target repos.
- Improved design root resolution: when a selected product repo has no Dash
  foundation files, Dash Build falls back to the `dash-ds` cwd or
  `DASH_DS_ROOT` for `design.md` and Layer 0 rules.
- Updated Codex login detection to accept `codex login status` output that
  includes warnings on stderr while still reporting `Logged in using ChatGPT`.

### Notes

- GitHub App connection remains the PR path. Local pilot builds can use the
  stub callback while real GitHub App credentials are being configured.
- Legacy Anthropic/Claude modules remain in the tree as historical/fallback
  code paths and tests, but they are no longer the recommended dashboard flow.

## 0.1.1 — 2026-05-21

### Security

- **Removed subscription OAuth path** (banned by Anthropic ToS effective
  April 4 2026). The previous implementation reused Claude Code's public
  OAuth `client_id` (`9d1c250a-…`) to mint Pro/Max subscription tokens
  for third-party use, which Anthropic's Consumer Terms of Service
  update (Feb 2026) made a ToS violation. Tools that continued the
  pattern (OpenClaw, OpenCode, Roo Code, Goose) had their tokens
  blocked and users risk account suspension.

### Replaced with two ToS-safe paths

- **BYO Anthropic API key** (default). Paste an `sk-ant-*` key into the
  dashboard form; stored AES-256-GCM encrypted via `BYOKeyStore`.
  `POST /api/auth/anthropic { apiKey }`,
  `DELETE /api/auth/anthropic`,
  `GET /api/auth/anthropic` for status + option discovery.
- **Claude Code subprocess** (optional). `GET /api/auth/anthropic/claude-cli`
  probes whether the official `claude` binary is on `PATH`. dash-build
  spawns it as a subprocess for generation — the user's subscription is
  consumed via Claude Code's own auth, not extracted into a third-party
  app.

### Internal

- `oauth-flow.ts` retained as historical reference but both
  `startOAuthFlow` and `exchangeCodeForToken` now throw immediately on
  call with a clear ToS-violation message. PKCE helpers preserved in
  case Anthropic ever opens a real third-party OAuth program.
- `AuthenticatedAnthropicClient` now resolves credentials BYO-key only.
- Dashboard CTA changed from "Connect Anthropic → 302 to claude.ai" to
  an inline password-style form that POSTs to `/api/auth/anthropic`.

## 0.1.0 — 2026-05-21

- Initial Day 1-3 release: browser daemon, skill chain, sandboxed
  preview, GitHub App PR flow.
