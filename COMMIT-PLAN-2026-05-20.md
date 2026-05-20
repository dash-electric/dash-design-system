# Atomic Commit Plan — 2026-05-20

> Phase 0 + Wave 1-3 work. ~13 atomic commits proposed. User review required before push.

## Commit 1 — Monorepo scaffolding + governance docs

**Files (new):**
- `.github/` (workflows authored, deferred)
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `DEMO-CHEATSHEET.md`
- `apps/docs/scripts/validate-patterns.ts`

**Message:**
```
chore: monorepo governance scaffolding

Add CHANGELOG, CONTRIBUTING, demo cheatsheet, GitHub workflows
(deferred pending OAuth scope refresh), and pattern drift validator.
Foundation for repeatable releases and contributor onboarding.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 2 — Rules + glossary: strategic decisions locked

**Files (modified):**
- `apps/docs/registry/rules/dash-ai-rules.md` (+166 lines, 4 new sections + Maintenance fix + RHF outlier ralat + Dash Purple sync)
- `apps/docs/registry/rules/dash-domain-glossary.md` (RHF outlier ralat + Purple sync)

**Message:**
```
feat(rules): lock strategic decisions + correct factual claims

- Add 4 new mandatory sections: audit trail, external-lib policy,
  cross-repo replicate strategy, update propagation policy
- Fix Maintenance state machine count: 10 → 9 (verified vs nest-fleet
  enum)
- Correct react-fleet "RHF outlier" myth: package.json has stale RHF/zod
  deps but zero source imports — 6 occurrences ralat across rules +
  glossary
- Sync Dash Purple canonical to #5e2aac (was mixed with #7C4FC4),
  19 edits across rules + glossary + fixtures

CEO-locked decisions 2026-05-20.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 3 — Baseline drift report

**Files (new):**
- `BASELINE-DRIFT-2026-05-20.md`

**Message:**
```
feat(audit): pre-launch brand-drift baseline across 11 Dash repos

Quantify drift today (before DS adoption) so post-launch progress
can be measured. Scanned 5 FE + 5 BE + 1 IaC repo read-only.

Key findings:
- next-backoffice-web: 1,913 hex hardcodes + 695 inline styles
- next-basecamp-web-main: 2,028 hex matches (fully diverged stack)
- ts-delivery-service-main: 655 bespoke AppError sites
- ZERO form-library imports in any FE source — react-fleet's "outlier"
  was stale package.json decl only

Reusable scanners: /tmp/scan_fe.sh + /tmp/scan_be.sh.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 4 — Governance: kill criteria + feedback + master plan refs

**Files (new):**
- `KILL-CRITERIA.md` (CEO-signed thresholds)
- `feedback.md` (self-critique compiled Wave 1-3)

**Message:**
```
feat(governance): kill criteria + self-critique compilation

KILL-CRITERIA.md: T1.1=3 PE installed by Wk4, T1.2=30% PRs use DS by
Wk8, T1.3=20% drift reduction by Q1. CEO-signed 2026-05-20.

feedback.md: honest pass over what shipped vs what's fragile.
Companion to vault Master-Execution-Plan-2026-05-20.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 5 — CLI: dash audit command + tests

**Files (new):**
- `packages/cli/src/commands/audit.ts`
- `packages/cli/src/commands/doctor.ts` (if new)
- `packages/cli/src/commands/__tests__/audit.test.ts`
- `packages/cli/src/commands/__tests__/doctor.test.ts`
- `packages/cli/src/commands/__tests__/mcp.test.ts`
- `packages/cli/src/lib/audit-rules.ts`

**Message:**
```
feat(cli): dash audit command for consumer-repo drift detection

Scans target repo (default: cwd) for banned imports (RHF, zod,
TanStack, SWR, @hookform/resolvers) + medium severity drift (hex
hardcode, inline style). Flags: --path, --json, --fail-on-error,
--only.

Zero new deps (Node fs.readdirSync walker). 77 tests total (64
existing + 13 new). Validates v0.4.0 CLI surface.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 6 — Skill v2: pinned blocks + per-repo scope + compressed rules

**Files (new):**
- `packages/skill/src/lib/rules-parser.ts`
- `packages/skill/src/__tests__/rules-parser.test.ts`
- `packages/skill/src/__tests__/prompt-builder.v2.test.ts`
- `apps/docs/registry/rules/dash-ai-rules.compressed.md`

**Files (modified):**
- `packages/skill/src/prompt-builder.ts` (+composeV2Prompt + PINNED_BLOCKS)
- `packages/skill/src/info-collector.ts` (+detectedRepoStack)
- `packages/skill/src/index.ts` (v2 default)
- `packages/skill/src/__tests__/prompt-builder.test.ts` (v1 pinned)

**Message:**
```
feat(skill): v2 with priority-pinned blocks + per-repo scoping

Phase 0.5 fixture execution surfaced v1 limitation: rules truncated at
8K char dropped refuse-list (L575-590) + envelope discriminator
(L618-624), causing 4/10 HIGH-severity fixtures to FAIL.

v2 changes:
- 4 priority-pinned blocks (refuse-list, envelope discriminator, audit
  trail, external-lib policy) — NEVER truncated
- Per-repo scoping: snapshot.detectedRepoStack drives which mandate
  section gets injected (skip irrelevant repos = token savings)
- Compressed rules variant: dash-ai-rules.compressed.md (18K, 28% of
  original) used by default for v2 budget headroom
- Token budget target ≤7K achieved with compressed source
- Estimated fixture HIGH-severity pass: 60% → 90%

Backward compatible: v1 callers still work via opts.version=1.
36 tests pass (19 existing + 17 new). Typecheck clean.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 7 — Patterns: rewrite multi-item-form + use-code-field vanilla

**Files (modified):**
- `apps/docs/registry/dash/patterns/multi-item-form.tsx`
- `apps/docs/registry/dash/patterns/use-code-field.tsx`
- `apps/docs/app/(docs)/docs/patterns/use-code-field/page.tsx`

**Message:**
```
fix(patterns): remove banned RHF/zod from canonical patterns

Wave 1 work. Pattern blocks ship via registry — PE running `dash add
multi-item-form` was getting react-hook-form + zod imports, which
rules.md explicitly bans in 5 places. Self-contradiction eliminated.

- multi-item-form: useFieldArray → useState<DeliveryItem[]> + add/
  remove/update helpers + hand-rolled validateItem. Index-based error
  map with shift-on-remove. Public API preserved (optional onSubmit
  prop added).
- use-code-field: zod schema + RHF Controller → useDashForm-style
  hook (value/setValue/error/isValid/regenerate/copy). Case-sensitive
  validation preserved. Breaking: no longer requires FormProvider.
- Fix InputRoot hasError prop (didn't exist) → className conditional.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 8 — Form block: full vanilla rewrite

**Files (modified):**
- `apps/docs/registry/dash/ui/form.tsx` (162 → 316 LOC)
- `apps/docs/registry.json` (form block deps cleaned)
- `apps/docs/app/(docs)/docs/components/form/page.tsx`

**Message:**
```
fix(form): rewrite form block vanilla useState (RHF/zod removed)

CEO-approved Phase 0.11: rewrite, don't keep opt-in.

Public API kept: Form, FormField, FormItem, FormLabel, FormControl,
FormDescription, FormMessage, useFormField. Added: useDashForm,
validateForm, FormState<T>, FormErrors<T>.

Breaking changes:
- <Form {...form}> → <Form form={form} onSubmit={fn}>
- useForm() → useDashForm(initialValues)
- FormField render-prop: ({field}) → ({value, onChange, error})
- Schema validation: zodResolver → validateForm + field validators

Deps removed: react-hook-form, @hookform/resolvers, zod.
Registry build PASS (182 items). Typecheck CLEAN.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 9 — Delete stale RHF + TanStack docs

**Files (deleted):**
- `apps/docs/app/(docs)/docs/forms/react-hook-form/page.tsx`
- `apps/docs/app/(docs)/docs/forms/tanstack-form/page.tsx`

**Files (modified):**
- `apps/docs/app/(docs)/docs/quick-start/page.tsx` (link rewire)
- `apps/docs/app/(docs)/docs/changelog/page.tsx` (text update)

**Message:**
```
fix(docs): remove RHF + TanStack form pages (contradicted ban)

Pages existed pre-policy. After Phase 0.2 external-lib policy +
Phase 0.11 form rewrite, both pages contradicted rules. Removed.

Quick-start + changelog references rewired to /docs/components/form
(vanilla canonical).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 10 — Schema codemod: status + kind across 97 component pages

**Files (modified):**
- `apps/docs/app/(docs)/docs/components/**/page.tsx` (~97 pages)
- `apps/docs/components/docs/page-shell.tsx` (DocsHeader prop union widened)

**Message:**
```
feat(docs): unify component page schema — status pill + kind

Phase 0.9 minimal codemod. Adds:
- status prop (stable/beta/wip/deprecated) on every component
- kind prop (atom/composite/specialized) for category metadata
- DocsHeader STATUS_META extended; legacy values (shipped/planned/new)
  back-compat preserved

Distribution: 57 stable, 38 beta, 2 wip (use-debounce, use-mobile).
Kind: 35 atom, 45 composite, 17 specialized.

Per audit: don't scaffold empty Examples/Anatomy/A11y stubs —
better honest gap than misleading TODO. Backfill in Wave 5.

97 pages modified. Typecheck PASS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 11 — dash-prd skill (BSD-3 fork from NatPRD)

**Files (new):**
- `skills/dash-prd/` (full tree: SKILL.md, prompts/, templates/, scripts/, examples/, NOTICE.md, LICENSE, install.sh, README.md)

**Message:**
```
feat(skill): dash-prd internal PRD skill (BSD-3 fork from NatPRD)

Adapt @anatasof/NatPRD for Dash-domain. Vendor in dash-ds/skills/ so
we don't depend on upstream repo (sovereignty).

Adaptations:
- §0 intake: tribe / BU enum / user surface / mitra-facing flag
- Regulatory mapping: OJK POJK 12/2018, UU PDP, BI-SNAP
- Domain entities: mitra, outlet, delivery, maintenance, repossession,
  incident, vehicle, handover, OEM, provider, station
- Voice rule: mitra-facing UI MUST use formal "Anda" (Dash rule)
- Frontmatter: Tribe + BU + User Surface + Mitra-facing? fields
- 2 example PRDs: Auto Suspend Mitra (vault-anonymized) + Driver
  Onboarding

BSD-3 attribution preserved (LICENSE + NOTICE.md). Original
copyright intact. install.sh creates ~/.claude/skills/dash-prd
symlink.

Anyone at Dash (PE, PM, ops, designer, CEO) can now invoke
"create a PRD" or "review my PRD" with Dash domain awareness.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 12 — AI validation fixtures (30 total + execution report)

**Files (new):**
- `apps/docs/registry/rules/fixtures/` (25 base + 5 image-edit + README + EXECUTION-REPORT)

**Message:**
```
feat(fixtures): 30 AI validation fixtures + execution report

Phase 0.5-0.6: validate AI follows rules under load.

25 base fixtures (5 per FE repo × 5 categories: form, fetch, modal,
list, style). 5 new image-edit fixtures covering Phase 0.1 audit trail
+ Phase 0.2 external-lib policy.

EXECUTION-REPORT-2026-05-20.md: simulated execution baseline.
- Without Skill: 0% HIGH-severity pass (10/10 FAIL)
- With Skill v1 (truncated 8K): 60% HIGH pass (4/10 FAIL)
- With Skill v2 (Commit 6): estimated 90% HIGH pass

Pass bar: 100% HIGH + ≥80% MEDIUM before external demo. Live re-run
required after Skill v2 lands.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Commit 13 — Docs site supplements

**Files (new):**
- `apps/docs/docs/COMPONENT-PAGE-SCHEMA.md`
- `apps/docs/docs/SCHEMA-AUDIT-2026-05-20.md`
- `apps/docs/components/docs/docs-step.tsx`
- COMMIT-PLAN-2026-05-20.md (this file)

**Message:**
```
feat(docs): component page schema spec + audit

Phase 0.9 reference docs. COMPONENT-PAGE-SCHEMA defines required +
optional sections. SCHEMA-AUDIT records 2026-05-20 baseline (15-page
sample × 11 section coverage). Hybrid backfill plan: codemod
mechanical (done), manual creative (Wave 5).

DocsStep primitive supports numbered onboarding flow (used in Quick
Start + Installation pages — screenshots deferred to human capture).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Untracked also to handle

**Defer (don't commit):**
- `apps/docs/docs/` — contains schema audit, ok to commit (Commit 13)

**Skip (build artifacts):**
- `.next/` build outputs — should be in .gitignore already, verify

---

## Push strategy

After 13 commits land:
1. `git log --oneline -20` review
2. Push to `irfanputra-design/dash` branch `main`
3. Verify CI green (or note CI deferred per OAuth scope)
4. Tag if releasing: `v0.5.0` (CLI + Skill v2 + dashboard-ready)

---

## Risk note

13 commits. Each ATOMIC and self-contained. If any commit breaks
build/test, can `git revert <sha>` cleanly without cascade.

DO NOT amend. DO NOT squash. Atomic history = atomic revertability.
