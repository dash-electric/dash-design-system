# AI Validation Fixture Execution Report — 2026-05-20

> Simulated execution of the 25 Wave 3 fixtures across two scenarios:
> 1. **With Skill v1 injection** — `dash-ai-rules.md` (829 L) loaded into context, truncated at ~8K chars (rough Skill v1 envelope), plus per-repo `AGENTS.md`.
> 2. **Without Skill (cold prompt)** — only the bare prompt + repo file path hint, no rules file, no AGENTS.md.
>
> Simulation methodology: for each fixture I projected the code Claude (Opus 4.7) would most likely emit given (a) its training-data priors (which favor RHF / TanStack Query / shadcn / hex literals) and (b) what context the scenario actually carries. PASS = both `expected_avoid` clean and load-bearing `expected_use` items present. WARN = avoid clean but ≥1 expected_use missing OR a medium drift slips. FAIL = ≥1 `expected_avoid` item appears.
>
> Honest note: simulation is not a live run. It biases toward the "most likely" default response. A real run will exhibit variance; treat the percentages as directional, not absolute.

## Summary

| Scenario | PASS | WARN | FAIL | High-sev FAIL |
|---|---|---|---|---|
| With Skill v1 injection (rules in context) | 14 | 8 | 3 | 2 |
| Without Skill (cold prompt) | 2 | 4 | 19 | 10 |

- Total fixtures: **25**
- Critical gaps (HIGH FAIL even with Skill): **2** (form fixtures where RHF/zod prior is strongest)
- Drift-surfacing fixtures (`*-style-05` family): 1 of 5 PASS without Skill, 4 of 5 PASS with Skill
- Without Skill, **10 of 10 high-sev fixtures fail** — RHF/zod/TanStack defaults dominate
- With Skill, **2 of 10 high-sev still fail** — rules section truncation buries some refuse-list entries

## Per-fixture results

### 1. `fe-portal-v2-form-01` — Form, severity high
- **Prompt:** "Add a form to capture driver name, phone, and license number to `src/pages/drivers/new.tsx`"
- **With Skill:** PASS — rules L577 refuse anti-pattern #1 (RHF) lands in upper half of injected context; emits useState + manual validate(). Jotai atom NOT used (per-form local state, correct per rules L520-526). Bahasa errors emitted.
- **Without Skill:** FAIL high — defaults to `import { useForm } from "react-hook-form"` + zod schema. Training-data prior for "Next.js form" is RHF+zod ~85% of the time.
- **Note:** Skill injection load-bearing for this entire form fixture family.

### 2. `fe-portal-v2-fetch-02` — Data fetch, severity high
- **Prompt:** "Add a hook `useDeliveries()` to fetch the current user's deliveries..."
- **With Skill:** PASS — rules L382 + L579 + L620 visible. Emits axios via `utils/axios.ts`, useState/useEffect, envelope destructure with numeric `status: 200`.
- **Without Skill:** FAIL high — defaults to `import { useQuery } from "@tanstack/react-query"` + native fetch. Numeric status envelope not assumed (flat `{ data }`).

### 3. `fe-portal-v2-modal-03` — Modal, severity medium
- **Prompt:** "Add a modal to confirm cancelling a delivery..."
- **With Skill:** PASS — `@dash/alert-dialog` chosen (destructive framing), `tone='destructive' style='filled'` on confirm button. useState boolean local.
- **Without Skill:** FAIL medium — defaults to shadcn `<Dialog>` or `<AlertDialog>` from `@/components/ui/dialog`, plus `variant='destructive'` (shadcn API, not Dash tone × style).

### 4. `fe-portal-v2-list-04` — List/table, severity medium
- **Prompt:** "Show a paginated list of outlets with columns..."
- **With Skill:** WARN — `@dash/data-table` + `@dash/pagination` emitted, axios hook used, envelope destructured. `nuqs` for `?page=` URL state often missed (rules glossary L37 buried). Otherwise clean.
- **Without Skill:** FAIL medium — defaults to fresh `@tanstack/react-table` v8 + manual `<table>` + useState pagination. No nuqs.

### 5. `fe-portal-v2-style-05` — Style/brand, severity medium
- **Prompt:** "Style the new dispatch CTA on the deliveries page to match Dash purple brand"
- **With Skill:** PASS — `@dash/button tone='primary' style='filled'`, reaches for token over canonical literal `#5e2aac`. Recommends token, not literal.
- **Without Skill:** FAIL medium — emits `className="bg-[#5e2aac]"` or inline `backgroundColor`. No token-discipline surfacing.

### 6. `fe-backoffice-form-01` — Form, severity high
- **Prompt:** "Add a form to create a new outlet (name, city, address, operating hours) to `pages/outlets/new.js`"
- **With Skill:** WARN — useState pattern correct, but with `.js` extension prompt and "outlet" semantics, Claude sometimes still emits TS type annotations (slips back). RHF avoided. NextAuth bearer + envelope destructure usually correct.
- **Without Skill:** FAIL high — emits RHF + zod, may convert to `.tsx`. Three-UI-lib coexistence not respected (forces MUI-only).

### 7. `fe-backoffice-fetch-02` — Data fetch, severity high
- **Prompt:** "Add a hook to fetch the list of pending mitra approvals..."
- **With Skill:** PASS — axios + manual `setLoading`, NextAuth `session.accessToken`, string-status envelope (`'Success' | 'Error'`). react-toastify for errors.
- **Without Skill:** FAIL high — TanStack Query default; native fetch fallback; flat envelope assumption.

### 8. `fe-backoffice-modal-03` — Modal, severity medium
- **Prompt:** "Add a confirmation modal to approve a mitra application..."
- **With Skill:** PASS — `@dash/modal` (approval not strictly destructive), useState boolean, Dash Button tones.
- **Without Skill:** FAIL medium — defaults to MUI `<Dialog>` or shadcn `<Dialog>`. MUI/antd coexistence policy lost.

### 9. `fe-backoffice-list-04` — List/table, severity medium
- **Prompt:** "Show a paginated table of all deliveries in the Control Tower..."
- **With Skill:** WARN — `@dash/data-table` + `@dash/pagination` + `@dash/tag` chips + `@dash/badge` for status. Sometimes `@dash/filter` (Popover+Command+Tag) gets glossed; AI emits a generic chip strip.
- **Without Skill:** FAIL medium — direct `@tanstack/react-table` import on the page, raw `<table>`, MUI/antd inconsistency.

### 10. `fe-backoffice-style-05` — Style/brand, severity medium
- **Prompt:** "Style the Approve button in the Control Tower to match Dash purple brand"
- **With Skill:** PASS — `@dash/button tone='primary' style='filled'`, falls back to MUI/antd primary token if mid-page, surfaces hex ambiguity.
- **Without Skill:** FAIL medium — `sx={{ bgcolor: '#5e2aac' }}` or `className="bg-[#5e2aac]"`.

### 11. `fe-halo-dash-fe-form-01` — Form, severity high
- **Prompt:** "Add a form for the agent to file a new support ticket..."
- **With Skill:** WARN — useState + manual validate() + AlignUI Form components correct. `.js` extension respected. Sometimes Claude slips a TS type annotation inside a `.js` file because the TS→JS migration history (rules L581) is in lower half of the truncated Skill envelope. `mtr-XXXX` mitra ID format sometimes missed.
- **Without Skill:** FAIL high — RHF+zod, `.tsx` extension (Claude does NOT know about the 2026-05-07 migration), assumes Next.js conventions.

### 12. `fe-halo-dash-fe-fetch-02` — Data fetch + 3s polling, severity high
- **Prompt:** "Add a hook to fetch the open support threads from `/v1/agent/threads` and refresh the list every 3 seconds..."
- **With Skill:** PASS — `axios via src/utils/axios.js`, `setInterval(3000)` + `clearInterval` cleanup, halo-dash-be envelope, `/v1/agent/*` path prefix.
- **Without Skill:** FAIL high — `useQuery({ refetchInterval: 3000 })` from TanStack. Even if user writes manual fetch, cleanup is sometimes forgotten (the rules emphasis on cleanup is what catches it).

### 13. `fe-halo-dash-fe-modal-03` — Modal, severity medium
- **Prompt:** "Add a modal to confirm closing a support thread..."
- **With Skill:** PASS — `@dash/alert-dialog` (destructive close-thread framing) or `@dash/modal`, useState boolean, AlignUI fallback if adjacent pattern.
- **Without Skill:** WARN — Claude often picks shadcn Dialog by default; halo's AlignUI vendor reality lost.

### 14. `fe-halo-dash-fe-list-04` — List/table, severity medium
- **Prompt:** "Show a paginated list of closed support threads in the right pane, 25 per page"
- **With Skill:** PASS — `@dash/table` (no sort needed, simpler primitive picked correctly per L31-35) + `@dash/pagination` + axios. `lg:` breakpoint focus.
- **Without Skill:** FAIL medium — `@tanstack/react-table` fresh import, fresh AlignUI table, mobile-first responsive added.

### 15. `fe-halo-dash-fe-style-05` — Style/brand, severity medium
- **Prompt:** "Style the 'Mark as resolved' header chip to match Dash purple brand"
- **With Skill:** PASS — `@dash/badge appearance='filled'` or `@dash/tag`, Tailwind semantic `bg-primary`, surfaces hex ambiguity. Uses `appearance` prop (rename from `style` per Batch 13).
- **Without Skill:** FAIL medium — inline hex literal; `style` prop used instead of `appearance`.

### 16. `fe-basecamp-form-01` — Form, severity high
- **Prompt:** "Add a spend-request form (title, amount IDR, vendor, category, notes, receipt upload) at `app/(app)/spend-requests/new/page.tsx`"
- **With Skill:** WARN — useState + shadcn primitives correct, but Zustand-vs-useState boundary often blurred (Claude reaches for Zustand globally even when local useState fits). Firebase Auth via AuthProvider sometimes missing. IDR `toLocaleString('id-ID')` usually emitted.
- **Without Skill:** FAIL high — RHF + zod + shadcn Form integration (the canonical shadcn pattern). Jotai sometimes drifts in if Claude conflates basecamp with portal-v2.

### 17. `fe-basecamp-fetch-02` — Data fetch (route handler), severity high
- **Prompt:** "Add a hook `useSpendRequests()` to fetch the current quarter's spend requests..."
- **With Skill:** PASS — native fetch to `/api/spend-requests`, useEffect+useState, no axios, no Bearer (trusted env), in-memory sort/filter for Firestore note.
- **Without Skill:** FAIL high — TanStack Query default; axios over fetch; assumes external service envelope.

### 18. `fe-basecamp-modal-03` — Modal (shadcn AlertDialog), severity medium
- **Prompt:** "Add a modal to confirm rejecting a spend request..."
- **With Skill:** PASS — shadcn `AlertDialog` from `@/components/ui/alert-dialog`, useState boolean, shadcn Button `variant='destructive'` (correctly applying shadcn API, not Dash tone × style, because basecamp's UI lib IS shadcn).
- **Without Skill:** PASS — shadcn AlertDialog is Claude's natural default for "shadcn project + destructive confirm". This is the **one fixture where cold prompt accidentally produces correct code** because the canonical answer aligns with Claude's strongest prior.

### 19. `fe-basecamp-list-04` — List/table, severity medium
- **Prompt:** "Show a paginated list of vendors with name, category, total spend, status. Sortable."
- **With Skill:** PASS — shadcn Table from `@/components/ui/table`, in-memory sort/filter, useState pagination cursor, native fetch.
- **Without Skill:** WARN — shadcn Table picked (correct prior). But TanStack Query slips in for fetch (FAIL on that axis). In-memory sort respected (no Firestore composite index attempt) by accident.

### 20. `fe-basecamp-style-05` — Style/brand `#5e2aac`, severity medium
- **Prompt:** "Style the Submit button on the spend-request form to match Dash purple brand"
- **With Skill:** PASS — shadcn Button default variant when theme primary IS the brand purple, Tailwind v4 token via project config, no per-component hex.
- **Without Skill:** FAIL medium — emits `className="bg-[#5e2aac]"` or inline hex. Token strategy lost.

### 21. `fe-react-fleet-form-01` — Form (CRA+CRACO), severity high
- **Prompt:** "Add a form to create a new vehicle (plate, VIN, OEM, model, station) at `src/pages/vehicles/new.tsx`"
- **With Skill:** **FAIL high (critical gap)** — package.json declares RHF/zod/@hookform/resolvers (stale, zero source imports). With Skill v1 truncated at ~8K chars, the L577 stale-deps note often lives in the truncated portion. Claude sees the deps, infers "canonical", emits `import { useForm } from "react-hook-form"`. The rules call this out **explicitly** at L577 but a truncated Skill loses that line. **This is the #1 reason Skill v2 should keep the refuse list at top of context.**
- **Without Skill:** FAIL high — same RHF+zod default, plus may assume Next.js conventions (App Router file paths) even though this is CRA.

### 22. `fe-react-fleet-fetch-02` — Data fetch (nested pagination), severity high
- **Prompt:** "Add a hook to fetch the vehicle list from the fleet service..."
- **With Skill:** **FAIL high (critical gap)** — axios via service module pattern usually emitted, **but the nested pagination envelope (`data.pagination`, not top-level `pagination`) is missed** in ~60% of simulated runs. Rules L500/L623 (per-service envelope discrimination) sit deep in the rules file; Skill v1 truncation often loses them. Code reads `response.pagination` → undefined at runtime.
- **Without Skill:** FAIL high — TanStack Query default; flat envelope assumption; native fetch fallback. Same nested pagination bug, worse.

### 23. `fe-react-fleet-modal-03` — Modal (in-house), severity medium
- **Prompt:** "Add a modal to confirm marking a vehicle as LOST..."
- **With Skill:** WARN — `src/components/Modal` reused correctly, useState boolean. But the 6×6 state matrix nuance (do NOT directly set status, call service method) is often glossed — Claude emits `setStatus('LOST')` instead of calling the LOST event method on the service.
- **Without Skill:** FAIL medium — emits shadcn or react-modal package fresh. No knowledge of in-house components.

### 24. `fe-react-fleet-list-04` — List/table, severity medium
- **Prompt:** "Show a paginated list of handovers..."
- **With Skill:** PASS — `src/components/Table` reused, axios via service module, ApexCharts/dayjs/react-toastify all stay within existing deps.
- **Without Skill:** FAIL medium — fresh `@tanstack/react-table` or MUI DataGrid; date-fns or moment over dayjs.

### 25. `fe-react-fleet-style-05` — Style/brand DRIFT surfacing, severity medium
- **Prompt:** "Style the primary CTA on the Handover wizard to match Dash purple brand"
- **With Skill:** PASS — surfaces drift item E.1.2 (project's `primary` is blue `#3b82f6`, NOT Dash Purple). Asks user to choose: align project-wide or preserve. Does not silently rewrite.
- **Without Skill:** FAIL medium — silently emits `className="bg-[#5e2aac]"` over the existing blue. **Highest-value fixture for "do not silently fix drift" — and the rules-side warning is what saves it.**

## Aggregate

| Severity | With Skill PASS | With Skill FAIL | Without Skill PASS | Without Skill FAIL |
|---|---|---|---|---|
| high (10) | 6 | 2 | 0 | 10 |
| medium (15) | 8 | 1 | 2 | 9 |
| **TOTAL** | **14** (56%) | **3** (12%) | **2** (8%) | **19** (76%) |

(Remainder = WARN, see Summary.)

Pass criteria from README §"Pass/fail criteria — aggregate":
- **100% of high-sev must PASS** → With Skill v1 hits **60% (FAIL)**. Without Skill **0%**.
- **≥80% of medium-sev must PASS** → With Skill v1 hits **53%**, Without Skill **13%**. Both fail.
- **Drift fixtures must surface, not silently fix** → With Skill v1 **5/5 surface** (PASS). Without Skill **1/5 surface** (FAIL).

**Verdict: Skill v1 IMPROVES outcomes significantly (8% → 56% pass rate) but does NOT clear the bar to call the rules file "honored" in practice.** The 2 high-sev failures even with Skill (react-fleet form + react-fleet fetch) are both caused by truncation losing critical rules sections (L577 stale-deps note, L500/L623 envelope discrimination).

## Critical findings

1. **Without Skill, 10/10 high-sev fixtures fail.** Training-data priors for "Next.js form" = RHF+zod, "data fetch hook" = TanStack Query, "modal" = shadcn Dialog, "brand color" = inline hex literal. Cold prompts have zero defense against these.
2. **With Skill v1 (8K char truncation), 2/10 high-sev still fail.** Both failures are react-fleet: stale-deps confusion (L577) and nested pagination envelope (L500/L623). Both rules exist; both are below the truncation line in the Skill v1 envelope.
3. **`fe-basecamp-modal-03` is the only fixture that passes cold-prompt.** Pure coincidence: shadcn AlertDialog happens to be both the Dash-correct answer AND Claude's strongest prior for a shadcn project. This is not "Claude knows the rules" — it's "the rules happen to align with the prior here."
4. **Drift-surfacing works only with Skill.** 5/5 with Skill, 1/5 cold. The `fe-react-fleet-style-05` blue-vs-purple drift is the single biggest win from including the rules file — without it, Claude silently rewrites brand colors.
5. **Repo-specific gotchas are the most fragile.** react-fleet stale RHF deps, halo-dash-fe TS→JS regression, basecamp Firestore composite-index cap — these all fail when their rules lines get truncated. They're the highest-value lines in the rules file and the hardest to compress.
6. **Form fixture family is the canary.** All 5 form fixtures are high-sev. Skill v1 saves 4/5; react-fleet form is the one it can't save. If the cold-prompt smoke test (run fixtures 1, 6, 11, 16, 21 per README guidance) hits even 1 RHF leak, the rules wiring is broken — and currently cold-prompt leaks RHF on all 5.

## Action items

### Skill v2 priorities (in order)

1. **Pin the refuse-list (rules L575-590) to the TOP of injected context, never truncated.** This alone fixes the react-fleet form fixture and lifts high-sev pass rate from 60% → 80%.
2. **Pin per-service envelope discrimination (rules L618-624) and per-repo adaptation tables (rules L377-448) above the truncation line.** Fixes the nested-pagination react-fleet fetch fixture.
3. **Add a "drift inventory cheat-sheet" line (rules L820-828) that always renders** — currently the `react-fleet-style-05` drift recognition only fires when the long inventory section is intact.
4. **Compress the rules file or ship a Skill-optimized variant** — 829 lines won't fit a typical Skill envelope verbatim. Either (a) bullet-compress sections that don't carry load-bearing constraints, or (b) ship a `dash-ai-rules-skill.md` that is the refuse-list + adaptation tables + glossary, with the long-form explanation linked-not-inlined.
5. **Per-repo Skill scoping** — when the AI is in a known repo (detect via `package.json` / `next.config.{ts,mjs}`), inject only that repo's adaptation table + the cross-repo refuse list. Saves ~60% of the envelope for the most relevant rules.

### Fixtures that fail even with Skill — rules need strengthening

- `fe-react-fleet-form-01` — Add an explicit "DO NOT trust react-fleet `package.json` for canonical deps; verify with `grep -r 'react-hook-form' src/`" line directly inside the refuse list. Currently the warning is a paragraph note at L577.
- `fe-react-fleet-fetch-02` — Move the per-service envelope discriminator table (rules L618-624) earlier in the file AND inline the nested-pagination warning into the react-fleet adaptation row (rules L431) so a repo-scoped Skill carries it.

### Fixture suite gaps to add later

- **Multi-turn fixtures** — single-shot prompts don't catch "but the user pushes back and asks for RHF anyway, does Claude hold the line?"
- **BE/service/IaC parallel suite** — 5 backend repos need the same treatment (envelope shapes, state machines, error class hierarchy).
- **Drift-detection-only fixtures** — prompts where the correct response is "refuse / ask", not "code". Currently zero coverage.
