# Changelog

All notable changes to `@dash/build` are documented here.

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
