# Changelog

All notable changes to the Dash Design System repo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-05-21

### Added — Dash Build MVP

@dash/build package shipped. Browser-based AI builder for any Dash
team member. 9router-style multi-interface, Anthropic OAuth via
subscription, GitHub App PR creation, Skill chain (dash-prd → design
→ Skill v3 → Claude), clarification gate, sandboxed iframe preview,
dark mode, toast, skeleton states.

9 agents dispatched parallel across 3 days. 225 tests passing zero
flake. 6 packages typecheck clean. 129 files in packages/dash-build/.

Bin entry: `dash-build` (after `npm i -g @dash/build`).
Daemon: localhost:7777
Storage: ~/.dash-build/{auth,sessions,preview,state.json,daemon.pid}
Dashboard: dark mode + WS reconnect + toast + skeleton

## [0.5.0] - 2026-05-20 (Phase 0 + Wave 1-4 — Governance, AI rules, workflow library)

### Added
- **Rules sections (4 new)** in `dash-ai-rules.md`: Audit Trail, External Library Policy, Cross-Repo Coupling, Update Propagation (`c90d58b`).
- **Skill v2** — priority-pinned context blocks + per-repo scoping, compressed rules default (`637dbfb`).
- **30 AI validation fixtures** covering banned-import refusals, audit-trail prompts, voice/locale, envelope shape, useCode case sensitivity + execution report (`b7cd699`).
- **`dash audit` + `dash doctor` CLI** — banned-import scan, repo health check, with tests (`e0540f2`).
- **`dash gap report`** standalone command — Wave 4 Agent M (`55ac4ab`).
- **`dash gap sync`** + dashboard API endpoints `/api/dashboard/requests` — Wave 4 Agent L (`62e3c9a`).
- **CEO-only gap request review UI** at `/dashboard/requests` — Wave 4 Agent K (`f2b35c4`).
- **`@dash/worker` package** — Hermes autonomous generator + `/health` endpoint + deployment configs — Wave 4 Agent N (`f0aa15c`, `78dc40d`).
- **6 scaffold templates** — image-action, bulk-action, table-with-filter, form-with-audit, multi-stage, inline-edit — Wave 4 Agent O (`c1454df`).
- **11 workflow blocks**:
  - `image-editor-with-audit` — Canvas crop+rotate with audit (`c5eaa0a`)
  - `audit-history-table` — render edit history for any field (`7b4bfca`)
  - `bulk-upload-with-status` — N-file batch upload + retry (`a981515`)
  - `multi-stage-approval` — N-approver workflow (`98bda4c`)
  - `mitra-dispute-flow` — formal Anda voice dispute submit (`186aa01`)
  - `proof-image-viewer` — zoom + side-by-side compare (`45c9305`)
  - `delivery-status-timeline` — 26-status visual timeline (`890c45b`)
  - `incident-form-with-attach` — role-gated incident report (`d8d992d`)
  - `repossession-action-sheet` — 7-state mobile workflow (`6dae79f`)
  - `payment-receipt-edit` — IDR amount edit with multi-approver (`7ccd20a`)
  - `inline-edit-with-audit` — click-to-edit with optional reason (`2688ee2`)
- **`dash-prd` skill** — internal PRD skill, BSD-3 fork from NatPRD, vendored at `skills/dash-prd/` (`bfd2f82`).
- **Component page schema spec + audit + DocsStep primitive** (`b810b81`).
- **Repo `CLAUDE.md`** — auto-context for Claude Code sessions (`f8b0495`).
- **Master Execution Plan + Kill Criteria + Drift Baseline + self-critique** governance docs (`b0cdd52`, `c90d58b`, `86ad30f`).

### Changed
- Dash CLI: v0.4.0 → **v0.5.0** (audit, doctor, gap report, gap sync).
- **Dash Purple canonical hex locked to `#5e2aac`** (`c90d58b`). Prior `#7C4FC4` references corrected.
- **Component page schema unified across 97 pages** — `status` pill + `kind` props codemod (`3c55e47`).

### Fixed
- **`form` block rewritten** vanilla `useState` — RHF + zod removed to match Dash ban (`a05e463`).
- **`multi-item-form` + `use-code-field` patterns** — banned RHF/zod imports removed (`03efbc0`).
- **Maintenance state machine** corrected 10 → 9 states (verified against ts-fleet) (`c90d58b`).
- **`react-fleet` "RHF outlier" myth** — stale `package.json` deps only, no runtime usage; rule note corrected (`c90d58b`).
- **Telemetry audit log** now writes JSONL so `/admin/usage` dashboard updates correctly (`abf47e2`).

### Removed
- `/docs/forms/react-hook-form` + `/docs/forms/tanstack-form` doc pages — contradicted the ban (`3ac8a2b`).

## [0.2.0] - 2026-05-20 (Wave 6 — Adoption hardening)

### Added
- `dash doctor` command (10-check health diagnostic) — registry reachability, token validity, MCP wiring (Claude Code + Cursor), CLI version, framework detection, components.json + .env.local presence, Node version, package manager, workspace detection. `--json` machine output, `--no-network` offline mode.
- Cursor MCP support in `dash mcp init` — auto-detects Claude Code + Cursor installs, prompts user choice, writes `~/.cursor/mcp.json` with `${env:DASH_REGISTRY_TOKEN}` interpolation (token never written to disk for Cursor). Flags: `--claude-code`, `--cursor`, `--both`, `--check-only`.
- Pattern validator script (`pnpm validate:patterns`) — audits pattern blocks against Adaptation Layer ban list, reports reference-vs-drift imports, wired into CI as non-blocking warning.
- `CONTRIBUTING.md` at repo root — branch naming, Conventional Commits + Co-Authored-By, PR workflow, code style, anti-patterns reference.
- `CHANGELOG.md` at repo root.

### Changed
- Dash CLI: v0.3.0 → **v0.4.0** (doctor + Cursor MCP).
- Vitest: 49 → **64 tests passing** across 8 files.
- `DEMO-CHEATSHEET.md` migrated from old `dash-ds/` to repo root + Act 4 killer prompt replaced with real Dash domain (delivery multi-order refactor against `next-portal-v2-web` w/ useCode case-sensitive + ts-delivery string envelope + `/client-user/v2/deliveries` prefix + 26-status state machine).

### Removed
- 4 separate pre-consolidation directories (`dash-ds/`, `dash-cli/`, `dash-mcp/`, `dash-skill/`) — content already in the repo, moved to `/tmp/dash-pre-consolidation-backup-2026-05-20/` (18 GB total) with `RESTORE.md`.

## [0.1.0] - 2026-05-20 (Wave 1-5 — Adoption foundation)

### Added
- Repo consolidation (`apps/docs` + `packages/cli` + `packages/mcp-server` + `packages/skill` + `packages/registry-schema`).
- 181 registry items (atoms + composites + blocks + templates + patterns).
- 5 FE + 5 BE Adaptation Layer in `dash-ai-rules.md` v2 (829 lines, 30 anti-patterns).
- `dash-domain-glossary.md` (1,982 lines, 22+ entities, 4 state machines).
- 3 canonical pattern blocks: `multi-item-form`, `bulk-submit`, `use-code-field`.
- Dash CLI v0.3.0: `init`, `add`, `build`, `search`, `list`, `diff`, `mcp`, `login`, `info`, `sync` — 7 framework templates (next-app, next-pages, vite, remix, astro, cra, react).
- `@dash/mcp-server` with 6 tools (Bearer-gated).
- `@dash/skill` Phase 2 scaffold.
- Vitest prompt harness (12 fixtures) + `dash-stack-detector`.
- GitHub Actions CI + preview + release workflows.
- Token usage dashboard scaffold.
- Bearer auth + audit log + rate limit on `/r/*` and `/api/registry/*`.
- `DEPLOY.md`, `MAINTENANCE.md`, `DEMO-CHEATSHEET.md`, `INTAKE-CHECKLIST.md`.
- Dash logo registry component.
- shadcn-style information architecture (8 top-level sections, 40 page routes).
- Codex-style image-rich docs (Quick Start 8-step + Installation 6-step).
- Repo root `CONTRIBUTING.md` (branch naming, commit format, PR workflow, code style, sign-off).
- Repo root `CHANGELOG.md` (this file).

### Changed
- Sidebar navigation: 115 → 40 page-level routes.
- Homepage: theme-stable static-black / static-white (no swap-token mixing).
- `use-code-field`: case-sensitive charset (no uppercase forcing) to match `policy_one_time_codes`.
- Pitch deck refreshed to 5-week roadmap.

### Documented (drift inventory, no action — see `apps/docs/registry/rules/dash-domain-glossary.md` Appendix E)
- 12 drift items observed across 11 Dash repos — **observations only, NO modifications to existing code** per user mandate "kita gabisa ngubah existing, kita hanya bisa support itu":
  - **fleet-mgmt** (4): `RepoModal.tsx` uses RHF+zod (violates Dash ban) · brand color `#3b82f6` blue (not Dash purple `#7C4FC4`) · no `AGENTS.md` (biggest doc gap) · CRA+CRACO legacy framework.
  - **basecamp** (2): zero test runner (handles Spend Control money + legal docs) · no-auth on internal `/api/*` routes (OK inside Cloud Run perimeter, trust boundary undocumented).
  - **ts-delivery-service** (1): `useCode` cross-service coupling implicit — canonical row in `nodejs-core-service.policy_one_time_codes`, referenced from `ts-delivery.t_delivery_policies.value` via implicit string lookup.
  - **halo-dash-fe** (1): zero test runner configured (Jest/Playwright/Node native — TODOS.md flag).
  - **BE envelope inconsistency** (1): 3 string vs 2 numeric envelopes across 5 BE services, `BaseApiResponse<T>` class name shared between nest-express (numeric) and nest-fleet (string).
  - **Schema notes** (3): `m_provider` multiple secret patterns (`client_secret`/`client_key` deprecated + `auth_key`/`auth_value` + `ProviderAPIKey` new) · typo `DelliveryTypes.ts` filename (should be `DeliveryTypes.ts`) · `sandbox-dash-electric` deprecating w/o enumerated dependent repos.

[Unreleased]: https://github.com/irfanputra-design/dash/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/irfanputra-design/dash/releases/tag/v0.5.0
[0.2.0]: https://github.com/irfanputra-design/dash/releases/tag/v0.2.0
[0.1.0]: https://github.com/irfanputra-design/dash/releases/tag/v0.1.0
