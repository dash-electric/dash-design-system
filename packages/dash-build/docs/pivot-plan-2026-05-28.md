# Dash Build — Pivot Plan 2026-05-28

> **Status:** Active execution. PR #10 60 commits, branch `feat/wave-2-3-2026-05-28`.
> **Context:** Post-pivot from iframe-full-app (5-7 min cold + scheduler silent fail) to component-focused preview (Sandpack) + BE-aware moat (3-scenario classifier + audit).
> **Cardinal rule:** Existing Dash production code NEVER modified — additive only.

## Current state (validated end-to-end via Claude Preview)

✅ **Layout working:** Lovable home `/`, workspace `/workspace/:runId`, Sandpack iframe fills canvas, context map horizontal strip, tab bar single instance.
✅ **Cold-load replay:** Direct nav to completed run → Sandpack mounts with persisted source. Truncated runId prefix resolves to canonical.
✅ **Build pipeline:** Classifier NEW_ADDITION lexicon, patch-mode diff apply, orchestrator post-patch SSE, prefix resolve, TEMPLATE_DIR probe, react-dom CDN.

❌ **CRITICAL gap discovered 2026-05-28 testing:**
1. Output uses RAW HTML + Tailwind utility classes — NOT `@dash/ui` DS atoms
2. Sandpack iframe missing Tailwind processor + Dash CSS tokens
3. BE intake context map shows "BE —" (empty) — intake either ga fire or ga persist
4. FE existing components ga di-consume untuk pattern transfer
5. Foundation scorer 100/100 = false positive (ga catch DS-coverage gap)

---

## TIER 0 — PRODUCT INTEGRITY (~15.5hr)

> Tanpa ini = Lovable clone. Itu yang user push back terus.

### Phase A — BE + FE Consumption (~4hr)

| # | Effort | Item |
|---|--------|------|
| **0F** | 2hr | Intake `runIntake()` scan target repo benar (`/Users/.../Work/dash/next-backoffice-web/`), BUKAN dash-build's scratch clone. Surface ID → repo root mapping. |
| **0H** | 1hr | Persist intake snapshot ke `runs/<runId>/intake.json` { beEndpoints[], dbSchema{}, fePatterns[], audit }. Cold-load read → context map keisi proper. |
| **0I** | 30min | ✅ DONE 2026-05-29 — `reconcileScenario()` in `skills/chain.ts` demotes false `new_product` → `extend_fe_be` once the chain resolves real existing FE files (runIntake classifies blind with existingFiles:[]). Regression test `__tests__/reconcile-scenario.test.ts` (4 cases). |
| **0G** sub | 30min | ✅ DONE 2026-05-29 — `fePatterns` from `readFePatterns()` were being destructured in `chain.ts` but **never passed** to `composeSystemPrompt()`. Wired the arg through (+ validator/meta now use the reconciled intake). LLM now sees reference FE component bodies. |
| **0M** | 1hr | Audit-trail ENFORCEMENT bukan surface — CR-3 reject output dengan payment/KYC/signature/image-proof field tanpa audit log code. |

### Phase B — AI Quality DS-first (~5.5hr)

| # | Effort | Item |
|---|--------|------|
| **0A** | 2hr | Skill EXPLICIT DS-first directive — patch `prompt-composer.ts` hard rule: "PREFER `import { X } from '@dash/ui'`. Raw `<div className='bg-success-*'>` adalah anti-pattern. Use Badge/Card/Table/Tabs atom dulu." |
| **0B** | 1hr | Verify skill chain delivers dash-doc + design.md + DS component CATALOG (atom list + variants). |
| **0C** | 1hr | Foundation scorer count DS imports — ratio `@dash/ui` imports vs raw HTML elements. 0 DS imports + 50+ raw `<div>` = score 30/100, NOT 100. |
| **0J** | 1hr | Per-repo stack mandate enforcement — backoffice Pages Router + .js + useState + axios, portal-v2 App Router + .tsx + Jotai, etc. |
| **0K** | 1hr | Voice register enforcement — mitra-facing "Anda" formal, BUKAN "kamu". Generator output check. |
| **0L** | 30min | Domain glossary inject ke skill chain — `dash-domain-glossary.md` 1982 lines (entities, table names, state machines). |

### Phase C — Runtime DS Bundle (~3.5hr)

| # | Effort | Item |
|---|--------|------|
| **0E** | 2hr | Preview-template ship `@dash/ui` bundle (CDN proxy esm.sh) + Dash CSS tokens base ke customSetup.dependencies. |
| **0G** | 1.5hr | FE pattern transfer — inject reference component bodies (truncated) ke system prompt as "Existing pattern reference:". LLM learn local style. |
| **0D** | 30min | Validator reject low-DS output — score < threshold AND prompt UI-shaped → REJECT + retry stronger directive. |

### Skill pipeline deep-audit (defer, ~1.5hr)

| # | Item |
|---|------|
| **0N** | gstack pipeline full wire — `dash-intake → dash-prd → dash-design-review? → dash-trd → Skill v4 + Codex → dash-review → dash-qa`. Confirm aktif/skip. |
| **0O** | Skill v4 + Codex integration verify — currently mungkin direct OpenAI call. |

---

## TIER 1 — VISUAL BAND-AID (~1hr)

> Safety net kalau Tier 0 ada blind spot.

| # | Effort | Item |
|---|--------|------|
| 1 | 30min | Tailwind CDN inject iframe |
| 2 | 15min | Dash CSS vars inline |
| 3 | 20min | Plus Jakarta Sans preload |

---

## TIER 2 — FUNCTIONALITY (~12hr)

| # | Effort | Item |
|---|--------|------|
| 4 | 1 week | Preview tabs Diff/BE Impact/Audit/Files functional (Diff first) |
| 5 | 30min | Tab switching JS handler |
| 6 | 30min | `/dashboard` legacy route redirect ke `/workspace` |
| 7 | 1-2hr | Patch validator UI panel runtime validate |
| 8 | 1hr | Top bar `Share` + `Run` buttons wire functional |
| 9 | 2hr | Home page templates/examples (Lovable-style prompt cards) |
| 2.10 | 2hr | GitHub PR creation end-to-end (OAuth + PR via Dash Build App) |
| 2.11 | 1hr | Auth chain verify — OpenAI Codex CLI vs BYO key fallback |
| 2.12 | 30min | Preview viewport toggle (Desktop/Tablet/Mobile) wire |
| 2.13 | 1hr | Run history per project |
| 2.14 | 1.5hr | CostMonitor REAL (was Tier 6, promote — user pays OpenAI tokens, visibility matters) |

---

## TIER 3 — UX POLISH (~3.5hr)

| # | Effort | Item |
|---|--------|------|
| 10 | 20min | Sidebar icons tooltip |
| 11 | 30min | Keyboard shortcuts (Cmd+Enter, `/` focus, Esc) |
| 12 | 1hr | Mobile responsive workspace |
| 13 | 30min | Empty chat state — last 3 prompts quick-replay |
| 14 | 30min | Sandpack loading skeleton |
| 15 | 30min | README + CHANGELOG sync |

---

## TIER 4 — DEV INFRA (~3 days)

| # | Effort | Item |
|---|--------|------|
| 16 | 1hr | HMR / live reload |
| 17 | 1-2 days | Pre-existing 23-29 test fails debug |
| 18 | 1hr | Dash audit prepublish hook |
| 19 | 30min | Pin Sandpack version |
| 4.5 | 2hr | AOP event emission per agent step |
| 4.6 | 30min | Iframe shim V3 cleanup decision |

---

## TIER 5 — USER ACTION

| # | Item |
|---|------|
| 20 | **Q12 designer test session** — DEFER ke AFTER Phase B. Test sekarang = false negative karena output belum proper Dash-style. |

---

## TIER 6 — DEFERRED (post-MVP)

PPT output · Dashboard standalone · DSCandidateRanker · Layer 2 theme runtime switcher · Surface 1 Docs integration · NPM publish `@dash/build` · Branch protection GitHub App

---

## DECISIONS PENDING

| # | Item |
|---|------|
| **D1** | Clone code FINAL decision — component preview stable now, mau hapus iframe clone path atau tetap dormant? |
| **D2** | Skill v2 vs v4 deprecation — v4 di Dash Build, v2 di MCP server. Sync atau migrate? |
| **D3** | Production GitHub App registration — currently stub callback. Block production. |

---

## EXECUTION SEQUENCE

```
Phase A (4hr) ─┐
               ├─► Phase B (5.5hr) ──► Q12 session schedule
Phase C (3.5hr)┘
   │                                    │
   │ (paralel)                          ▼
   ▼                                Tier 2-3 batch (~15.5hr)
Phase D (1hr) band-aid              polish + functionality
   │
   ▼
Tier 4 (background, defer)
```

**MVP-grade total:** ~28.5hr serial atau ~18hr paralel agent.

---

## 2026-05-29 FOLLOW-UP (trust-issue dig)

User flagged generated preview looked "like a brand-new component" — no
backoffice nav, no existing mitra-detail tabs. Root-caused to 3 bugs, all fixed:

1. **fePatterns dropped** — `chain.ts` destructured `readFePatterns()` output but
   never passed it to `composeSystemPrompt()`. LLM never saw existing FE style.
   → wired through (Tier 0G).
2. **Classifier blind** — `orchestrator.runIntake()` classifies with
   `existingFiles:[]`, so "tambahin tab di detail mitra" with no `/api` match
   fell through to `new_product` (= "scaffold from scratch" prompt mode). Real
   intake.json from run `prm_67503bcf-4eb` confirmed `scenario:"new_product"`,
   `fePatterns:[]`. → `reconcileScenario()` corrects post-resolve (Tier 0I).
3. **Codex 600s timeout** — the run in the screenshot actually FAILED ("Codex
   CLI timed out after 600000ms"); the preview shown was a stale earlier run.
   → default lowered 600s→240s + large-prompt stderr warn. Env override kept.

**Clarified scope (NOT bugs — by-design / deferred):**
- Sandpack mounts a single component, not the full backoffice shell. Seeing the
  real nav + existing tabs around the change requires **Baseline Preview**
  (product-model.md layer 1) which needs **Hermes clone + auth-strip** — that's
  P1/P2 infra, deliberately deferred. Today's fix makes the *generated code*
  respect FE/BE so it's correct when it lands in the branch; the *preview
  fidelity* upgrade is a separate track.
- Merge-to-main flows through **S3 Owner Dashboard merge queue** (master-plan
  §4), not direct GitHub. S3 is P2 — until then merge is manual GitHub review.

## COMMIT HISTORY (this session)

- `ac42402` classifier NEW_ADDITION lexicon
- `7ba5fa6` preview patch-mode diff apply
- `2c5f3f1` orchestrator post-patch SSE
- `468334c` strip duplicate tabs
- `5c7d21f` cold-load replay
- `3ac7b18` prefix resolve runId
- `ead99ff` TEMPLATE_DIR probe
- `59faf16` react-dom CDN URL
- `f8b09b8` preview panel fills canvas + horizontal context strip

PR #10: 60 commits, branch `feat/wave-2-3-2026-05-28`.
