# gstack Pipeline + Codex Integration Audit — 2026-05-28

Audit-first report for Tier 0 sub-tasks **#0N** (gstack pipeline full wire) and
**#0O** (Skill v4 + Codex integration verify). Authored by Agent J on
2026-05-28 against `packages/dash-build` PR #10 (commit at audit time).

## Scope

Cross-check between aspirational docs (`gstack-adoption.md`,
`artifact-contracts.md`, `skill-routing.md`) and actual code wiring under
`src/`. Confirm what is implemented, what is wired, what is a doc-only
aspiration, and what would be cheap to close.

## TL;DR

| Stage | Doc says | Code reality | Gap |
| --- | --- | --- | --- |
| `dash-intake` | intake record + clarify gate | wired in `src/intake/` + orchestrator step 2 | **wired** |
| `dash-prd` | PRD scope + section gate | `src/skills/prd-evaluator.ts` | **wired** |
| `dash-design-review` | design brief per `design.md` | partial: `design-loader.ts` loads context but no discrete review/critique pass | **stub added** |
| `dash-trd` | implementation plan | absorbed into composed system prompt (`prompt-composer.ts`); no separate TRD artifact | **doc-only** |
| Skill v4 + Codex | composed system prompt + Codex call | `chain.ts` + `auth/openai/client.ts` + `auth/codex-cli/runner.ts` | **wired** |
| `dash-review` | scope-drift + policy checks | `validator.ts` runs CR-3 + CR-5 + DS coverage + stack mandate | **wired (covers review)** |
| `dash-qa` | browser QA + runbook | nothing — closest is `patch-validator.ts` (additive-only gate) | **stub added** |
| `dash-doc-release` / `dash-learn` | docs sync + learning capture | not implemented | doc-only |

Codex + BYO key:
- Codex CLI detection: **wired correctly** via shell probe (`codex --version` + `codex login status`).
- BYO key fallback: **wired** via encrypted `~/.dash-build/auth/openai-byo-key.json`.
- `OPENAI_API_KEY` env var fallback: **NOT wired** — would need a security decision.
- Auth-mode visibility in `run.json` metadata: **wired (this audit adds it)**.

## #0N — gstack stage walk

### Wired stages

**dash-intake** (`src/intake/`):
- `scanBeCatalog` (`be-endpoint-catalog.ts`) — Next Pages/App + Express scan.
- `readDbSchema` (`db-schema-reader.ts`) — Prisma/Drizzle/SQL parse.
- `classifyPrompt` (`scenario-classifier.ts`) — six-shape classifier.
- `checkAuditTrailRequired` (`audit-trail-enforcer.ts`) — CR-3 gate.
- `readFePatterns` (`read-fe-patterns.ts`) — reference component surfacing.

Wiring in `orchestrator.ts::processPrompt` step 2 (gated by `intakeEnabled`,
default off; daemon turns it on). Ambiguous-classify with confidence <0.5
short-circuits to clarify gate. Intake snapshot persisted to
`<runDir>/intake.json` for cold-load surface.

**dash-prd** (`src/skills/prd-evaluator.ts`):
- `evaluatePromptScope` runs Agent F's `evaluatePrompt` plus a PRD section
  counter (14 sections distilled from `skills/dash-prd/prompts/section-rules.md`).
- Thin-prompt gate fires when prompt touches <2 sections AND <12 words.
- Surfaces `summary`, `sectionsTouched`, `confidence`, plus clarification
  questions.

Wiring in `chain.ts` Stage 1.

**Skill v4 + Codex**:
- `src/skills/skill-loader.ts` calls `@dash/skill::loadDashSkill` with
  `version: 2` (priority-pinned per-repo scope — note: docs say "Skill v4" but
  what they actually mean is the v4 cache layer wrapping the v2 prompt
  builder; `@dash/skill` exposes schema versions 1/2/3 plus a v4 cache, not a
  prompt v4). Document drift here is purely terminology — wiring is correct.
- Composed system prompt assembled in `prompt-composer.ts::composeSystemPrompt`
  consuming design + skill + DS + intake + existing-file contexts.
- Codex call routes through `AuthenticatedOpenAIClient.complete` in
  `src/auth/openai/client.ts` (see #0O below).

Wiring in `chain.ts` Stages 4-5.

**dash-review** (`src/skills/validator.ts::validateOutput`):
- Banned-import check (CR-1).
- Raw hex / token check (CR-5).
- Casual voice on mitra surfaces (formal-voice rule).
- DS coverage gate (Phase 0D import-ratio).
- Raw utility-class anti-pattern (Phase 0C).
- Stack-mandate enforcement per `RepoSurface` (Phase 0J).
- CR-3 audit-trail block reference enforcement.
- Score 0..100, errors with `ruleId` for dashboard grouping.

This covers `dash-review`'s "diff review + scope-drift detection" intent.
Additionally `patch-validator.ts::validatePatch` enforces the additive-only
allowlist (cardinal rule #1).

### Partially wired / stubbed

**dash-design-review** (doc target):
- `src/skills/design-loader.ts` loads `design.md` + cardinal rules + voice +
  layered architecture, but the loader only feeds the system prompt — there
  is no discrete "design brief" artifact emitted before generation.
- `src/skills/ds-catalog-loader.ts` surfaces the Dash DS catalog for prompt
  composition.
- `validator.ts::measureDSCoverage` exists but runs as a validator gate, not
  a review step.
- **This audit adds** `src/skills/design-review.ts::reviewDesignCoverage`
  (post-generation pass producing `{atomsUsed[], coverage, suggestions[]}`)
  plus a test. Wired into the orchestrator's `awaiting_approval` path and
  surfaced on the generation artifact (`artifact.designReview`).

**dash-trd** (doc target):
- No discrete TRD artifact emission step. Implementation-plan content is
  absorbed into the system prompt (composer injects existing-file context,
  intake scenario, route requirements, stack mandate).
- Effort to add as a discrete stage: **medium** — requires a separate LLM
  call (which doubles cost) OR a deterministic template synthesis from intake
  + existing-files + PRD eval. Deferred; gate already passes for the current
  pipeline.

### Stub added — dash-qa

- `src/skills/qa.ts::runDashQa` runs a post-generation lint:
  - syntax sanity (matched braces / quotes / hex-on-banned-lines parse).
  - banned-import re-check (defense in depth against composer drift).
  - file extension matching against per-surface stack mandate.
  - audit-trail block reference re-check when intake flags it.
  - additive-only patch shape re-check.
- Output `{passed: boolean, issues: QaIssue[]}` where `QaIssue` mirrors the
  validator's severity/ruleId/file/message shape so the dashboard can render
  it next to the existing validation panel.
- Wired into the orchestrator on the awaiting-approval path. Result attached
  to the artifact as `artifact.qa`.

Note: this is a **deterministic lint**, not a browser QA pass — the doc
intent ("browser QA + runbook verification") still requires a real browser
harness (e.g. `gstack` skill `qa-only` or a Playwright wrapper). Surfacing
this gap explicitly in the report below.

### Not implemented (deferred)

- `dash-doc-release` — README / changelog / docs sync after merge. Reasonable
  to defer until Dash Build has actual production docs flow.
- `dash-learn` — reusable-pattern capture. Deferred; no concrete consumer
  surface yet.
- `dash-design-critique` (mentioned in `skill-routing.md`) — a designer-eye
  critique before preview. Out of scope for #0N stubs.
- Discrete `dash-trd` artifact — see medium-effort note above.

## #0O — Codex integration verify

### What is actually wired

`src/auth/openai/client.ts::AuthenticatedOpenAIClient.getMode()` resolves the
auth mode in this order:

1. Probe Codex CLI via `codex --version` and `codex login status`
   (`CodexCliRunner.probe()`, `src/auth/codex-cli/runner.ts`).
   - Installed + authenticated → `codex-cli`.
2. Load encrypted BYO key from `~/.dash-build/auth/openai-byo-key.json`
   via `BYOKeyStore.load()`.
   - Present → `byo-key`.
3. Otherwise → `none` (surfaces a clear error message pointing to either
   `codex login --device-auth` or the dashboard settings).

`AuthenticatedOpenAIClient.complete` dispatches:
- `codex-cli` mode → `CodexCliRunner.complete()` (spawns `codex exec` with
  `--skip-git-repo-check --sandbox read-only`, reads completion from a
  tmpfile so token streaming doesn't hold output in memory).
- `byo-key` mode → direct `fetch` against `https://api.openai.com/v1/responses`
  with the stored key.
- `none` mode → throws with actionable error text.

Error classification in `src/pipeline/error-handling.ts` maps Codex CLI
failures (`codex.*not.*(logged|auth)/i`) to `auth-missing-openai`, which the
clarification UI surfaces.

`auto-reconnect.ts` polls the probe and triggers `device-auth` flow when the
session lapses (UI integration exists in the dashboard).

### Gaps found

1. **No `OPENAI_API_KEY` environment-variable fallback.** CLAUDE.md says
   "BYO OpenAI API key fallback" — code reads this strictly as the encrypted
   on-disk key. A user with `OPENAI_API_KEY` exported in their shell will
   currently see "not connected" until they save the key in the dashboard.
   - Effort: low (~20min). Add an env-var probe to `BYOKeyStore.load()` or
     `AuthenticatedOpenAIClient.getMode()`.
   - **Not wired in this audit** because it carries a security decision the
     user should make: an env-var fallback ships the user's key to any
     subprocess the daemon spawns (including the Codex CLI sandbox). Best
     practice is to allow it only via an explicit `--use-env-key` flag or a
     dashboard toggle. Flagging this for a follow-up.

2. **Auth-mode invisible in `run.json` metadata.** A user inspecting the
   `<runDir>/run.json` cannot tell whether the run was powered by Codex CLI
   or BYO key. The plan calls for "Document which path was taken in run.json
   metadata so users can see 'powered by Codex' vs 'powered by OPENAI_API_KEY'".
   - **Wired in this audit.** `AnthropicProvider` now exposes `getMode()` (via
     `defaultOpenAIProvider`), and the orchestrator records the mode on
     `RunArtifactPayload.providerMode` which `writeRunArtifacts` persists to
     `run.json`. Falls back to `null` for the legacy stub provider used in
     tests.

3. **Skill version label drift between docs and code.** Docs say "Skill v4";
   `skill-loader.ts` calls `loadDashSkill({ version: 2 })`. The v4 reference
   is to the `@dash/skill` v4 cache layer (freshness-policy + per-cwd
   fingerprint), not a v4 prompt schema (only v1/v2/v3 exist). This is a doc
   nit, not a wiring gap — flagged here so future contributors don't try to
   "upgrade to v4" expecting a schema migration.

## Files changed by this audit

| File | Change |
| --- | --- |
| `src/skills/design-review.ts` | NEW — `reviewDesignCoverage` post-generation pass |
| `src/skills/__tests__/design-review.test.ts` | NEW — design-review unit tests |
| `src/skills/qa.ts` | NEW — `runDashQa` deterministic lint |
| `src/skills/__tests__/qa.test.ts` | NEW — qa lint unit tests |
| `src/skills/index.ts` | re-export the two new modules |
| `src/skills/types.ts` | add `DesignReviewResult` + `QaResult` shapes |
| `src/auth/openai/client.ts` | no change (already exposes `getMode()`) |
| `src/pipeline/types.ts` | extend `GenerationArtifact` + `AnthropicProvider` with optional mode field; add `designReview` + `qa` to artifact |
| `src/pipeline/orchestrator.ts` | call `runDashQa` + `reviewDesignCoverage` after validation; thread provider mode into run.json |
| `src/runs/artifact-store.ts` | persist `providerMode` to `run.json` |
| `docs/gstack-codex-audit-2026-05-28.md` | THIS REPORT |

No changes to existing behavior — both new stages are best-effort and never
flip `validation.passed` on their own. They surface findings on the artifact
for the dashboard to render.

## Recommended next actions

| Priority | Action | Effort |
| --- | --- | --- |
| P1 | Decide on `OPENAI_API_KEY` env-var fallback policy (yes/no, explicit flag?) | 20min decision + 30min wire |
| P2 | Wire `dash-design-review` results into the dashboard preview panel | 1hr |
| P2 | Wire `dash-qa` results into the dashboard validation panel | 1hr |
| P3 | Decide whether to ship a discrete `dash-trd` artifact (extra LLM call) or keep the absorbed-into-prompt model | 30min decision |
| P3 | Refresh `docs/gstack-adoption.md` + `docs/skill-routing.md` so "Skill v4" reads as "Skill v2 prompt + v4 cache" (clarifying nit) | 15min |
| P4 | Real browser QA path — wrap an `audit` / `scoutqa-test` skill into a `dash-qa-browser` step | 1+ day |
| P4 | `dash-doc-release` + `dash-learn` — defer until concrete consumer demand | n/a |

## How to verify

```bash
cd packages/dash-build
npx tsc --noEmit
npx vitest run src/skills/__tests__/design-review.test.ts \
                src/skills/__tests__/qa.test.ts
```

Both new test files run hermetically (no real LLM, no fs writes outside
`tmpdir()`).
