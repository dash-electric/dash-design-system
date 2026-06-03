# CLAUDE.md — Dash Design System Repo Instructions

> Auto-loaded by Claude Code when working in `/dash-ds/`. Anyone (developer, PM, designer, ops, CEO) cloning + opening in Claude Code gets this context.

## What this repo is

Dash Design System — internal sovereign DS for 10+ team members at Dash (PT Dash Elektrik Indonesia). Custom CLI + MCP + Skill stack. Distributes 214+ registry items (atoms, blocks, templates, patterns) to consumer Dash repos via `dash add <name>`.

## Layered Architecture

Dash is a **platform**, not a single product. The DS is structured as 4 layers so Ride, Logistic, Travel, Marketplace, and external Trellis tenants can share one foundation without forking.

- **Layer 0 — Brand Foundation** (shared, locked): type ramp, spacing, radius, motion, semantic tokens, a11y floor. Changing Layer 0 requires a Head of Design RFC.
- **Layer 1 — Common Primitives** (shared, atom-level): ~76 components (Button, Input, Modal, …). Always consume Layer 0 tokens, never hard-code accent hex. CI-enforced by `dash audit`.
- **Layer 2 — Product / Tenant Theme** (divergent, ~30 lines): accent tokens, voice register, density, optional radius overrides. The layer that bends. Themes today: `ride`, `logistic`, `travel`, `marketplace`, `trellis-{tenantId}`.
- **Layer 3 — Workflow Blocks** (divergent, product-owned): composites like `ride-dispatch-board`, `logistic-route-planner`. Registered with a `theme:` field; new blocks default to `theme: "shared"` unless declared product-specific.

**Decision tree when adding a component:**

1. Atom reusable across products (Button, Input, …) → Layer 1 under `registry/dash/ui/`, `theme: "shared"`.
2. Composite tied to one product's workflow → Layer 3 under `registry/dash/blocks/<product>/`, `theme: "<product>"`.
3. Brand/voice/density tweak → Layer 2 manifest in `registry/dash/themes/`. Do NOT touch Layer 1 source.
4. Touching type ramp, spacing, motion, or token tier → Layer 0 RFC required. Stop and ask.

Full spec: [`LAYERED-ARCHITECTURE.md`](./LAYERED-ARCHITECTURE.md). Visual showcase: `/docs/architecture/layered` and `/docs/architecture/themes` on the docs site.

## Cardinal rules

1. **Existing Dash production code is NEVER modified.** This repo is purely ADDITIVE. Generate new patterns + components here; consumer repos pull via CLI.
2. **No external form / data-fetch libraries in UI / consumer code.** Banned: `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `swr`, plus `zod` in UI consumer code. Use `useState` + hand-rolled validation in components. **Carve-out:** `packages/registry-schema/**` MAY use `zod` for runtime registry-JSON validation (this is a trust-boundary validator at a consumer-package edge, not a UI form library). The audit gate (`dash audit`) excepts this path. See `apps/docs/registry/rules/dash-ai-rules.md` § "Banned Imports".
3. **Audit trail mandatory** for user-editable fields carrying legal/financial weight (image proof, payment, signature, KYC). Log original + edited + editor + reason. See rules § "Audit Trail".
4. **Dash Purple canonical hex:** `#5e2aac`. Do not introduce `#7C4FC4` or any other purple variant.
5. **Voice register is per-surface — follow each repo's existing convention, do not globalise.** portal-v2 mitra-facing default = informal **"kamu"**; **"Anda"** is a per-feature override for formal/compliance surfaces (e.g. Auto Suspend). Internal ops / backoffice / admin = formal **"Anda"**. Canonical per-repo rule: `apps/docs/registry/rules/dash-ai-rules.md` § refuse-list item 6. When in doubt, match the strings already in the target repo.

## Where to look for context

| Need | File |
|------|------|
| Global cross-repo design contract | `design.md` |
| Layered Architecture spec | `LAYERED-ARCHITECTURE.md` |
| Per-repo stack mandates | `apps/docs/registry/rules/dash-ai-rules.md` |
| Domain entities, table names, state machines | `apps/docs/registry/rules/dash-domain-glossary.md` |
| Compressed rules (Skill v2 default) | `apps/docs/registry/rules/dash-ai-rules.compressed.md` |
| AI validation fixtures | `apps/docs/registry/rules/fixtures/` |
| Component canonical sources | `apps/docs/registry/dash/{ui,blocks,templates,patterns,hooks,lib}/` |
| Registry manifest | `apps/docs/registry.json` |
| Strategic plan | `Documents/Obsidian/Irfan-Vault/02-Projects/Product-Design/Dash/Dash-Design-System/Master-Execution-Plan-2026-05-20.md` |
| Kill criteria | `KILL-CRITERIA.md` |
| Drift baseline | `BASELINE-DRIFT-2026-05-20.md` |
| Honest self-critique | `feedback.md` |
| Commit history reference | `COMMIT-PLAN-2026-05-20.md` |

## Tooling

- **CLI:** `dash` (located `packages/cli/`). Commands: `init`, `add`, `audit`, `build`, `diff`, `doctor`, `info`, `list`, `login`, `mcp`, `search`, `sync`.
- **MCP server:** `packages/mcp-server/`. Bearer-gated. 7 tools: `search-components`, `get-component`, `list-categories`, `list-templates`, `search-tokens`, `get-rules` (alias: `get-ai-rules`), `get-audit-checklist`.
- **Skill:** `packages/skill/` (v2). Priority-pinned context blocks + per-repo scoping.
- **PRD skill:** `skills/dash-prd/` (BSD-3 fork of NatPRD, vendored).

**Registry URL defaults:** CLI + MCP both resolve via `process.env.DASH_REGISTRY_URL ?? "http://localhost:3000"` (local-dev mode). For production consumer repos, export `DASH_REGISTRY_URL=https://ds.dash.com` in shell rc, or pass `--registry-url` per command. Docs site (`pnpm --filter @dash/docs dev`, port 3000) must be running when consuming the local registry.

## Dash Build (moved to sister repo)

Browser-based AI builder (Lovable-for-Dash internal) was carved out of this
monorepo on 2026-05-29 (commit `dbb1e64`). It now lives in its own sister
repo at `~/Work/dash/dash-build`. Cross-repo coordination contracts live in
`~/Work/dash/_shared-contracts/`.

When working on `dash-ds`, treat dash-build as a downstream consumer — it
pulls components via `@dash/kit` (`file:` workspace dep) and design metadata
via the MCP server in `packages/mcp-server/`. Do NOT edit dash-build sources
from within this repo.

## When generating code

1. Check DS coverage first: `dash search <name>`. If hit, install via `dash add`. If miss, build custom matching Dash foundation.
2. NEVER reach for external libraries without explicit user approval — see § External Library Policy in rules.
3. Default stack per repo (auto-detected by Skill):
   - portal-v2: Next App Router + TS + Jotai + axios
   - backoffice: Next Pages Router + JS + useState + axios + NextAuth
   - basecamp: Next App Router + TS + Zustand 5 + Firebase + shadcn
   - react-fleet: CRA + CRACO + TS + useState + custom `useFormValidation` hook
4. Tokens: `bg-primary-500`, `text-text-strong-950`, `border-error-base`. Never raw hex.
5. Cross-repo UI consistency comes from `design.md`; do not copy its rules into consumer repos. Dash Build loads it from the `dash-ds` root even when the target repo changes.

## When user asks for a new feature

Default to **dash-prd skill** (`/dash-prd`) for spec-first approach. Skip to vibe-code only when:
- Scope crystal clear (no audit/legal exposure)
- 1-person execution
- Throwaway prototype

For Dash Build prompts, run the context-intake rules first. If the prompt is
casual or incomplete, ask only the blocker questions that change implementation
or design. Persist the answers into PRD/TRD context so later stages do not ask
again.

## Don't do

- Modify Dash production repos (`/Users/irfanprimaputra.b/Dash/*`) — they are READ-ONLY references.
- Ship code with banned imports (CI gate via `dash audit`).
- Skip audit trail for legal/financial fields.
- Introduce a second component library (MUI/antd in greenfield).
- Bypass `dash add` (copy-paste between repos).
- Modify `.compressed.md` directly (regenerate via Skill rebuild).

## Common workflows

### Add new component to DS
```
1. Build component in apps/docs/registry/dash/{ui,blocks,templates}/<name>.tsx
2. Register in apps/docs/registry.json
3. Add doc page apps/docs/app/(docs)/docs/components/<name>/page.tsx
4. Run pnpm registry:build
5. Verify dash audit clean
```

### Refactor pattern that violates rules
```
1. Check rules section that's violated
2. Generate replacement matching canonical pattern (e.g., useState replacing RHF)
3. Update registry.json deps (drop banned)
4. Run pnpm test + typecheck
```

### Investigate Dash production behavior
```
1. READ-ONLY browse /Users/irfanprimaputra.b/Dash/<repo>
2. NEVER edit Dash production
3. Distill pattern → add to glossary or new block here
```

## Token budget awareness

Rules + glossary are huge (829 + 1982 lines = ~2811 lines). Skill v2 pre-compresses to 18K chars + pins 4 critical blocks (refuse-list, envelope, audit trail, external-lib policy). Trust the compressed/pinned default; only read full files when debugging Skill behavior itself.

## Open questions (verify before relying on)

- Mitra suspension threshold (need Fayzul confirmation)
- eKYC vendor (Verihubs assumed — verify)
- Metric baselines (need analytics access)
- Deputy maintainer (bus factor = 1 currently; Q3 2026 mandatory)
- Dash Build production GitHub App registration / org-wide install policy
