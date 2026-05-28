# Rule Reality Audit — Dash Codebase 2026-05-28

**Date:** 2026-05-28
**Scope:** `apps/docs/registry/dash/**`, `apps/docs/app/**`, `packages/dash-build/src/**`, `packages/dashboard/**` (excludes tests, node_modules, .next, dist, build, playwright-report).
**Method:** static analysis (grep/AST-naive) + execution of existing audit scripts (`apps/docs/scripts/audit-tokens.mjs`, `packages/dash-build/scripts/audit-tokens.mjs`, `packages/dash-build/scripts/audit-css.mjs`, `packages/cli/dist dash audit`). Heuristic for rules that require visual / runtime evidence (e.g. "purple-only screen", "oversized hero") — noise rate documented per rule.
**Source files scanned:** 737 (`.tsx` / `.ts` / `.css`).
**Premise (user mandate):** "rule mungkin yang jelek". Each rule classified 🟢 FIX CODE / 🟡 UPDATE RULE / ⚪ AMBIGUOUS based on evidence, not blind enforcement.

---

## TL;DR

- **Total rules audited:** 41 (Sections A–I)
- **🟢 FIX CODE (rule valid, code wrong):** 12 rules / ~50 high-confidence violations + ~720 medium (per existing `dash audit`)
- **🟡 UPDATE RULE (reality wins, rule too strict / wrong / contradictory):** 14 rules
- **⚪ AMBIGUOUS (needs user judgment):** 10 rules
- **✅ CLEAN (rule + code aligned, no violation found):** 5 rules

**Headline:** `dash audit` reports **11 HIGH + 720 MEDIUM** drift items today, but ~60% of MEDIUM findings are noise (inline `style={{}}` on doc preview pages, intentional brand hex in `SocialButton`, theme example pages that consume Layer 1 by design). The single biggest rule-update opportunity is **A2 "card radius ≤ 8px"** — Dash's own `Card` primitive is `rounded-2xl` (16px) sourced from Figma. Several rules in `design.md` are aspirational, not enforced, and the doc surface itself is the largest violator of "no oversized hero / no decorative gradient" rules. Cardinal hex rule (#5e2aac only, no #7C4FC4) has **10 real violations** in docs preview pages — small, fixable.

---

## Per-rule findings

### A. Design contract rules (`design.md`)

---

#### A1. NO cards-inside-cards
**Verdict:** ✅ CLEAN (rule sound, zero real violations).
**Method:** opened-bracket / closed-bracket pairing for `<Card>` per file (see `/tmp/audit-2026-05-28/find-nested-cards2.mjs`).
**Raw findings:** 8 hits, but **all false positives**:
- 6× `apps/docs/registry/dash/blocks/hr-widgets.tsx` — same file exports 6 sibling widgets each wrapping their own `<Card>`; scanner doesn't track function-scope boundaries.
- 1× `apps/docs/app/(docs)/docs/components/input/page.tsx:370` — `Card` is alias for `RiBankCardLine` lucide icon (line 9: `RiBankCardLine as Card`).
- 1× `apps/docs/app/(docs)/docs/templates/marketing-settings/payment-billing/page.tsx:234` — same icon-alias inside a code-sample string literal.
**Recommended action:** none. Keep rule.

---

#### A2. Card radius ≤ 8px unless tokenized stricter
**Verdict:** 🟡 UPDATE RULE — Dash's own Card primitive uses `rounded-2xl` (16px), sourced from Figma as canonical.
**Violations:** 1 source-of-truth violation (the primitive itself) + propagated to ~200 callers.
**Evidence:**
- `apps/docs/registry/dash/ui/card.tsx:6-15` — comment: *"Figma Widgets [HR/Finance] (node 3851:32690 / 3963:7181): canonical card = stroke 1px, cornerRadius 16 (rounded-2xl), padding 16 all (p-4)"*. Variants all use `rounded-2xl` = 16px.
- `apps/docs/registry/dash/ui/modal.tsx:60` — `rounded-[20px]`
- `apps/docs/registry/dash/ui/alert-dialog.tsx:55` — `rounded-[20px]`
- design.md line 89: `Workflow surface radius: 10-14px. Avoid 20px+ radii for operational shells.` — contradicts modal/alert-dialog which is exactly 20px.
- design.md line 90: `Cards in dense tools: radius 6-8px` — direct contradiction with the primitive.
**Recommended rule update:** rewrite §"Workspace Density" to match Figma source-of-truth:
- Card (default): 16px
- Modal / Drawer / Sheet / Alert Dialog: 20px
- Popover / Menu / Dropdown: 16px
- Inline chips / pills: 6-8px or full
OR explicitly call card-in-table-row a separate class with 6-8px and keep card-as-widget at 16px.

---

#### A3. NO decorative gradients / blobs / bokeh / glassmorphism in operational tools
**Verdict:** 🟡 UPDATE RULE — rule needs an "Auth shells / brand showcases / chart fills" carve-out.
**Violations:** 51 occurrences of `linear-gradient` / `radial-gradient` / `conic-gradient` after filtering SVG chart `<linearGradient>` (those are data-viz, not decoration).
**Sample:**
- **Real meta-violation (operational tool itself):** `packages/dash-build/src/daemon/templates/styles/dashboard.ts:90-92` — Dash Build dashboard body has 3 `radial-gradient`s (purple/green/gold). The own operational tool violates its own rule.
- **Brand showcase (legitimate per visual identity):** `apps/docs/registry/dash/ui/fancy-button.tsx:41-42` — top-down white sheen on premium CTA, intentional motion polish.
- **Auth/marketing shells (intentional):** `apps/docs/app/(docs)/docs/templates/marketing-auth-{login,register,verification,reset-password}/page.tsx` — auth shells use full-bleed orange gradient backgrounds, copied verbatim from approved Figma.
- **Data viz / charts (legitimate):** `apps/docs/app/(docs)/docs/blocks/analytics-grid/page.tsx:83` — `conic-gradient` is the chart itself (donut chart fills).
- **Color palette demos:** `apps/docs/app/(docs)/docs/foundations/brand-assets/page.tsx:744` — gradient text in a Brand Assets page (showcasing brand expression). Rule should not apply.
**Recommended rule update:** narrow scope to "Inside in-app workflow surfaces (lists, tables, forms, detail screens). Auth/onboarding shells, marketing landing, brand showcase pages, and chart fills are explicitly out of scope." Plus **fix `dashboard.ts:90-92`** to make Dash Build's own ops dashboard rule-compliant.

---

#### A4. NO frosted-glass app shells
**Verdict:** ✅ CLEAN at the "app shell" level. 🟡 PARTIAL on overlay usage.
**Violations:** 0 frosted app shells. 20 `backdrop-blur` usages, **all** on legitimate overlay surfaces (Modal, Drawer, Sheet, AlertDialog, Command, sticky header, auth-page logo backplate).
**Sample:**
- `apps/docs/registry/dash/ui/modal.tsx:47`, `drawer.tsx:42`, `sheet.tsx:28`, `alert-dialog.tsx:34`, `command.tsx:51` — overlay backdrop blur is standard pattern.
- `apps/docs/app/(docs)/docs/product/widgets/page.tsx:853`, `header/page.tsx:261` — sticky top bar with blur (acceptable; explicitly allowed in Apple HIG / Material).
**Recommended action:** keep rule as-is (it targets app shells, not overlay backdrops). Optionally add explicit "backdrop-blur on Radix overlays is fine" note for AI.

---

#### A5. NO oversized hero compositions inside ops apps
**Verdict:** ⚪ AMBIGUOUS — depends on definition of "ops apps".
**Violations (heuristic):** 17 files with `text-5xl` … `text-9xl`.
**Sample:**
- **Docs landing (acceptable):** `apps/docs/app/page.tsx:114` — `text-5xl lg:text-7xl` — Dash DS marketing site landing, intentional.
- **Docs foundation pages (acceptable):** `apps/docs/app/(docs)/docs/foundations/{corner-radius,typography,motion,shadows,grid,icons}/page.tsx` — explainer hero `text-5xl lg:text-6xl`. Doc UX, not ops.
- **Likely violations (HR templates are mocked as ops products):** `apps/docs/registry/dash/templates/hr-{login,register,reset-password,enter-verification}.tsx` — auth pages with `text-5xl` headlines. Whether these are "ops" vs "auth shells" is judgement; matches Figma source.
**Recommended action:** keep rule, but clarify "ops apps" = post-login workflow surfaces (dashboards, lists, tables, detail). Auth/marketing/landing is exempt. Heuristic noise rate ~50% — needs visual review per file.

---

#### A6. Hairline borders + spacing changes BEFORE shadows/blur (border OR shadow, not both)
**Verdict:** 🟡 UPDATE RULE — design.md already has a carve-out ("not both unless floating above workspace") but the **carve-out isn't surfaced where AI sees it** (compressed rules).
**Violations:** 104 files with `border` + `shadow-*` combo. Of those:
- **Legitimate (floating above):** Modal, Popover, Tooltip, HoverCard, NavigationMenu, Drawer, AlertDialog, DropdownMenu, ContextMenu, Menubar, Carousel, DatePicker, Toaster, BulkActionBar — ALL are "floating above workspace" per design.md ch.91.
- **Card "elevated" variant:** `apps/docs/registry/dash/ui/card.tsx:15` — `border + shadow-custom-sm`. Intentionally elevated.
- **Borderline (likely violation):** `apps/docs/registry/dash/ui/widget-shell.tsx:44` — `border + shadow-regular-xs` inside an inline grid widget. Could go shadow-only or border-only.
- **Auth shell decorative:** `apps/docs/registry/dash/templates/auth-shell.tsx` — auth Wizard surfaces; debatable.
**Recommended rule update:** make the "floating above workspace" exception explicit in compressed rules; add to AI fixtures so generation doesn't strip the shadow from Modal/Popover/etc.

---

#### A7. NO purple-only screens
**Verdict:** ⚪ AMBIGUOUS — heuristic-only.
**Violations:** 0 confirmed. Landing page (`apps/docs/app/page.tsx`) uses purple chrome on dark canvas — explicitly brand surface, not "purple-only".
**Recommended action:** keep rule, accept this is a visual-review check (no static lint can confirm).

---

#### A8. Loading/empty/error/success state coverage per async
**Verdict:** 🟢 FIX CODE — partial state coverage on several blocks.
**Violations (heuristic by token grep):** ~10 fetching blocks miss at least one of {loading, empty, error, success}.
**Sample:**
- `apps/docs/registry/dash/blocks/inline-edit-with-audit.tsx` — has error/success, missing explicit loading + empty.
- `apps/docs/app/(docs)/dashboard/requests/request-modal.tsx` — has success only.
- `apps/docs/registry/dash/scaffolds/image-action.template.tsx` — missing loading.
**Caveat:** heuristic counts keyword tokens, doesn't AST-check branch coverage. ~30% false-positive rate (the keyword "error" appears in unrelated comments).
**Recommended action:** treat as a known gap, do a focused sweep of 10 fetching components.

---

#### A9. Destructive action confirmation present
**Verdict:** ✅ CLEAN.
**Violations:** 0 (8 `onClick={…remove|delete…}` matches, all are reversible inline removals — remove file attachment, remove tag — not destructive financial actions).
**Recommended action:** keep rule.

---

#### A10. Mitra voice formal "Anda" not "kamu"
**Verdict:** ✅ CLEAN.
**Violations:** 0 in shipped UI copy. All 10 `kamu` matches are inside docs/explainer pages quoting the rule itself, or in negative examples ("don't do this") — `apps/docs/app/(docs)/docs/getting-started/testing-locally/page.tsx:490` is a negative example, `apps/docs/app/(docs)/docs/changelog/page.tsx:50` is a changelog entry about the rule.
117 `Anda` matches across the codebase = rule is followed.
**Recommended action:** keep rule.

---

#### A11. Audit trail for legal/financial editable fields
**Verdict:** 🟡 UPDATE RULE — the rule is correct but enforcement is ad-hoc; we ship `*-with-audit` blocks but the audit pattern is undocumented in compressed rules.
**Evidence:**
- Existing audit-aware blocks: `inline-edit-with-audit.tsx`, `image-editor-with-audit.tsx`, `bulk-upload-with-status.tsx`, `audit-history-table.tsx`.
- No machine-detectable enforcement; relies on naming convention + reviewer attention.
**Recommended action:** add a `dash audit --rule audit-trail` lint that flags any form-block touching `payment|signature|kyc|image-proof|legal` keywords without importing one of the audit primitives. Until then, treat as advisory.

---

#### A12. Reduced-motion respect (`@media (prefers-reduced-motion: reduce)`)
**Verdict:** 🟢 FIX CODE — animations exist, no global reduced-motion gate.
**Violations:** 175 files with `animate-*` / `transition-*` / `animation:`. **Zero** `prefers-reduced-motion` declarations in `apps/docs/registry/dash/ui/` or any `globals.css`. Reduced-motion exists only in docs explainer pages (motion/page.tsx, etc) — i.e. shown to users, not applied to the system.
**Specific high-impact:**
- `apps/docs/registry/dash/ui/{shimmer,fancy-loader,spinner-loader,announcement-bar}.tsx` — keyframe-driven loops without reduced-motion fallback.
- `apps/docs/app/globals.css` and `packages/dashboard/app/globals.css` — no `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; ... } }`.
**Recommended fix:** add one global reduced-motion block to both `globals.css` files. Cheap, high-impact a11y win.

---

#### A13. Text fits container (no viewport-unit font sizes)
**Verdict:** ✅ CLEAN.
**Violations:** 0 `font-size: ?vw|vh` or `text-[?vw]` matches.
**Recommended action:** keep rule.

---

#### A14. NO new sidebar/shell/route pattern without explicit request
**Verdict:** 🟡 UPDATE RULE — 7 distinct shell templates exist; the rule is unrealistic for a DS that must ship preview shells per product.
**Inventory:**
- `apps/docs/registry/dash/templates/auth-shell.tsx`
- `apps/docs/registry/dash/templates/dashboard-shell.tsx`
- `apps/docs/registry/dash/templates/_finance-settings-shell.tsx`
- `apps/docs/registry/dash/templates/_internal/{marketing-add-product-shell,hr-app-shell,marketing-settings-shell,finance-app-shell}.tsx`
- `apps/docs/registry/dash/ui/sidebar.tsx` (primitive)
**Recommended rule update:** rewrite as "Do not introduce a new shell pattern in a *target consumer repo*; preview shells inside the DS are allowed when they mirror a known product's shell". The current rule was written for consumer-repo generation, not for the DS itself.

---

#### A15. Patches must be additive [🟢 FIX CODE — implemented 2026-05-28]
**Verdict:** Implemented LENIENT patch validator per cardinal rule #1.
**Gap found:** Sprint 2B introduced `mode=patch` unified-diff fragments in `packages/dash-build/src/pipeline/orchestrator.ts:836-845`. Patches flowed straight into `PatchApplier.applyPatch` (`git apply`) with zero rule enforcement — the AI agent could emit any patch (refactor, rename, delete an export) and the system silently applied it. Direct violation of cardinal rule #1 ("Existing Dash production code is NEVER modified").
**Implementation:** `src/pipeline/patch-validator.ts` (NEW) — regex-only, zero new deps. Lenient by design: allows pure additive, allowlisted-pattern (routes/nav-config/barrel/registry), and structural-only deletions (append-entry to arrays/objects). Rejects logic deletion, identifier rename, export removal, malformed diffs, and any patch on a protected path.
**Allowlist + protected paths:** per `DEFAULT_PATCH_ALLOWLIST` constant. Safe patterns: `routes.*`, `nav-config.*`, `index.*` (barrel), `menu.*`, `registry.json`, `*.config.*`. Protected: `**/auth/**`, `**/payment/**`, `**/middleware.*`, `**/lib/api.*`, `.env*`.
**Wiring:** orchestrator splits incoming `artifact.patches` into `safePatches` (apply) + `rejectedPatches` (record + broadcast `patches:rejected` WS event). UI surface: `.db-rejected-patches` panel rendered inside the awaiting-approval chat bubble via `chat-thread.ts` → `renderRejectedPatches()`.
**Tests:** 25 cases in `src/pipeline/__tests__/patch-validator.test.ts` (happy paths, rejection paths, allowlist customization, default-list sanity).
**Doc:** see `docs/artifact-contracts.md` § 6b.

---

### B. Cardinal rules (`CLAUDE.md`)

---

#### B1. NO banned imports (`react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `swr`)
**Verdict:** 🟡 UPDATE RULE OR 🟢 FIX CODE (your call).
**Violations (per `dash audit`):**
- `packages/worker/src/__tests__/validator.test.ts:42` — `react-hook-form` in a test fixture.
- `packages/registry-schema/src/zod-schemas.ts:16` — **`zod` value import**. This is intentional: the package exists to validate registry JSON at runtime. zod is the chosen runtime validator.
- `packages/registry-schema/scripts/generate-json-schema.ts:19` — same, zod-to-jsonschema generator.

The 14 doc files mentioning RHF / zod in `apps/docs/app/(docs)/docs/...` are explainer text quoting the rule, not real imports.

**Recommended action:** either
- 🟡 update CLAUDE.md to carve out `packages/registry-schema/**` (zod as runtime validator is intentional), OR
- 🟢 swap zod for a hand-rolled validator if you really want zero zod org-wide (high cost, low benefit).

The `worker/src/__tests__/validator.test.ts` import is genuinely off-policy and should be removed/replaced (per design rule: ban applies to source AND tests).

---

#### B2. NO Dash production repo modifications (`/Users/irfanprimaputra.b/Dash/*`)
**Verdict:** ✅ CLEAN — repo is structurally isolated; this rule cannot be violated from within `dash-ds`. Enforcement happens at session/agent level, not codebase.

---

#### B3. Dash Purple canonical `#5e2aac` only — no `#7C4FC4`
**Verdict:** 🟢 FIX CODE — **10 real `#7C4FC4` violations**, all in docs preview pages.
**Sample:**
- `apps/docs/app/(docs)/docs/foundations/dark-mode/page.tsx:247`
- `apps/docs/app/(docs)/docs/foundations/color/page.tsx:279`
- `apps/docs/app/(docs)/docs/blocks/{signup-03,analytics-grid,my-cards-stack}/page.tsx`
- `apps/docs/app/(docs)/docs/templates/auth-shell/page.tsx:205`
**Recommended fix:** sed-replace `#7C4FC4` → `var(--dash-purple-500)` in all 10. ~15 minute task.

---

#### B4. Audit trail mandatory for user-editable legal/financial
Same as A11.

---

#### B5. Mitra voice "Anda"
Same as A10.

---

### C. Layered Architecture compliance (`LAYERED-ARCHITECTURE.md`)

---

#### C1. Layer 0 changes require RFC
**Verdict:** ⚪ AMBIGUOUS — cannot be statically verified from current repo; depends on commit message convention which isn't enforced.
**Recommended action:** add a CI check: any PR touching `apps/docs/registry/dash/foundation/**` must have "RFC" in the PR description.

---

#### C2. Layer 1 must NEVER hard-code accent hex (CI'd via `dash audit`)
**Verdict:** 🟢 FIX CODE (mostly) + 🟡 UPDATE RULE (logo exception).
**Per `dash audit`:** 720 MEDIUM `off-token-hex` findings; most are inside theme example pages, brand assets pages, color picker components, and SocialButton brand colors.
**Real Layer 1 (in `registry/dash/ui/`) hardcodes:**
- `apps/docs/registry/dash/ui/dash-logo.tsx:23` — `const DASH_PURPLE = "#5E2AAC"`. Brand logo — should arguably live in Layer 0 foundation, not Layer 1.
- `apps/docs/registry/dash/ui/fancy-loader.tsx:50-56` — raw purple/indigo hex in SVG illustration. **Real violation.**
- `apps/docs/registry/dash/ui/social-button.tsx:38-41,93-...` — Facebook/LinkedIn/Google brand hex. Legitimate (external brand identity).
- `apps/docs/registry/dash/ui/chart.tsx:59-67` — `[stroke='#ccc']` selector hooks to override recharts defaults. Legitimate.
**Recommended:**
- 🟡 add brand-logo + external-brand carve-out to the L-1 hex rule.
- 🟢 fix `fancy-loader.tsx` to use `var(--dash-purple-*)`.
- 🟢 move `dash-logo.tsx` const into a foundation token file.

**Bug note:** earlier prompt claimed `dash audit` was broken (`Cannot find module zod-schemas.js`). That bug appears **resolved** in current build — `dash audit` runs successfully and produces actionable output (verified 2026-05-28). The `registry-schema/dist/` is now populated.

---

#### C3. Layer 1 always consume Layer 0 tokens (no raw color or off-token spacing)
Covered by C2 + D1/D2.

---

#### C4. Layer 3 workflow blocks registered with `theme:` field
**Verdict:** 🟢 FIX CODE — 23 of 56 blocks have `theme:` field. **33 blocks missing.**
**Evidence:** `apps/docs/registry.json` — 226 items total, 23 themed. Of the 56 entries that reference `blocks/`, only 23 have `"theme"` key.
**Recommended action:** sweep `registry.json` and add `"theme": "shared"` (or product-specific) to every block. Manual ~30 minute pass.

---

#### C5. Theme manifest valid (matches each theme dir's `colors.css` + `typography.css`)
**Verdict:** 🟡 UPDATE RULE + 🟢 FIX CODE.
**Findings:**
- `apps/docs/registry/dash/themes/manifest.json` lists 5 themes; 4 have full `colors.css` + `typography.css`; `trellis-tenant/` is **missing `typography.css`** (only `colors.css` present).
- **Manifest accent values disagree with LAYERED-ARCHITECTURE.md docs.** manifest says `ride = #16a34a (mobility-green)`, `logistic = #ea580c (delivery-orange)`, `travel = #0284c7`, `marketplace = #ca8a04`. Architecture doc says ride = `#5e2aac` purple, logistic = `#1f6feb` blue, travel = `#c79a2b`, marketplace = `#0f9d58`. **Two sources of truth, no clear winner.**
**Recommended action:**
- 🟢 add `trellis-tenant/typography.css`.
- 🟡 reconcile manifest vs `LAYERED-ARCHITECTURE.md` accent table — pick one and update the other.

---

### D. Token discipline

---

#### D1. Spacing on Dash ramp `{0,2,4,6,8,10,12,14,16,24,32,40,48}`
**Verdict:** ✅ CLEAN. Only **1** off-ramp finding: `apps/docs/app/(docs)/docs/templates/portal-developer/page.tsx:106` uses `top-[60px]` for sticky header. Trivial.
**Existing audit:** `audit-tokens.mjs` reports 0 findings across 723 docs files + 199 dash-build files.

---

#### D2. Radius on scale `{0,2,4,6,8,10,12,16,20,24,28,9999}`
**Verdict:** ✅ CLEAN. 3 minor off-scale findings (`rounded-[3px]`, `rounded-[1px]×2`) — visual-decoration edge cases, low priority.

---

#### D3. Font-size mapped to text-tokens
**Verdict:** ⚪ AMBIGUOUS — Tailwind text-* utilities widely used; would need a custom lint to map back to Dash type ramp.
**Recommended action:** extend `audit-tokens.mjs` to grep for `text-[?px]` and similar arbitrary values; current script doesn't cover this.

---

#### D4. Box-shadow via semantic vars
**Verdict:** 🟢 mostly CLEAN. `shadow-custom-*` semantic tokens used consistently. A handful of raw `shadow-sm`, `shadow-md`, `shadow-lg` Tailwind defaults appear in templates (e.g. `apps/docs/registry/dash/ui/upload-card.tsx:62`); those are Tailwind defaults, arguably still semantic.

---

#### D5. Color via semantic vars (no raw hex outside foundation)
**Verdict:** see C2 / B3. Per `dash audit`: 720 MEDIUM hex findings (vast majority in theme example pages, brand-assets docs page, SocialButton, color picker — all legitimate by design). Real violations confined to a dozen UI components + 10 #7C4FC4 occurrences.

---

#### D6. Tailwind utility classes on Dash scale
**Verdict:** ⚪ AMBIGUOUS — 6,542 token-shaped utility usages across the audited tree. Existing audit-tokens script catches the most common arbitrary-value escapes; full coverage would require AST + Tailwind theme config parsing.

---

### E. A11y baseline

---

#### E1. WCAG AA color contrast (text > body)
**Verdict:** ⚪ AMBIGUOUS — not statically verifiable from grep. Defer to a runtime audit (axe / Lighthouse) on actual pages.
**Recommended action:** add Playwright a11y assertions for the top 10 routes. Existing `a11y-audit-2026-05-28.md` already covers initial work.

---

#### E2. ARIA roles correct usage (eslint-jsx-a11y)
**Verdict:** ⚪ AMBIGUOUS — depends on eslint config. Verify `apps/docs/.eslintrc` enables `jsx-a11y` plugin.

---

#### E3. Keyboard nav (clickable divs without `role="button"` + tabindex)
**Verdict:** ✅ CLEAN — 1 finding only.
**Violation:** `apps/docs/app/(docs)/docs/components/drawer/page.tsx:390` — `<div onClick={() => setServiceVis(...)}>` without `role="button"` / `tabIndex`. Single, doc-page-only.

---

#### E4. Skip-link present in shell layouts
**Verdict:** 🟢 FIX CODE — no skip-link in `apps/docs/app/(docs)/layout.tsx` or `packages/dashboard/app/layout.tsx`. Only mention is the docs header explainer at `apps/docs/app/(docs)/docs/product/header/page.tsx`. Cheap fix.

---

#### E5. Landmarks (`<main>`, `<header role="banner">`, `<nav aria-label>`, `<footer role="contentinfo">`)
**Verdict:** 🟢 PARTIAL.
- `apps/docs/app/(docs)/layout.tsx:17` — `<main>` only. No `<header>` / `<footer>` landmarks.
- `packages/dashboard/app/layout.tsx:39,93` — `<header>` + `<main>`. No `aria-label` on nav, no footer landmark.
**Recommended fix:** add `<header role="banner">`, `<nav aria-label="...">`, `<footer role="contentinfo">` to both layouts.

---

#### E6. Color not sole indicator of state
**Verdict:** ⚪ AMBIGUOUS — needs visual audit per status component.
**Note:** Dash `Badge` / `StatusChip` components in `apps/docs/registry/dash/ui/` consistently include text labels alongside color (verified by spot-checking 5 status usages). Heuristic says rule is followed.

---

### F. Tribe operational sanity

---

#### F1. Domain state names from `dash-domain-glossary.md` only
**Verdict:** ⚪ AMBIGUOUS — 218 status-literal matches in code; most are UI-local (loading/loaded/uploading/online/busy/away/idle/error) not domain entities.
**Caveat:** none of the audited code has hard-coded delivery / mitra / payment status literals (those would live in consumer repos, not the DS itself).
**Recommended action:** run F1 against consumer Dash repos via `dash audit --domain-glossary`, not the DS itself.

---

#### F2. Domain entity names consistent
Same as F1. DS doesn't model entities; consumer repos do.

---

### G. Performance + bundle

---

#### G1. Bundle size per route < target
**Verdict:** ✅ CLEAN.
- `packages/dash-build/dist/bin.js` = **8.2 KB** (budget 50 KB) ✅
- `packages/dash-build/dist/daemon.js` = **697 KB** (budget 720 KB, 97% utilized — close to ceiling) ⚠️
- `packages/dash-build/dist/index.js` = **667 KB** (budget 700 KB, 95%) ⚠️
**Note:** daemon + index are within budget but headroom is thin. Sprint 4 changes risk a budget breach.

---

#### G2. Lazy load discipline
**Verdict:** ⚪ AMBIGUOUS — would need next.js build report. Out of scope for static analysis.

---

### H. Testing discipline

---

#### H1. Test coverage threshold
**Verdict:** ⚪ AMBIGUOUS — `packages/dash-build/vitest.config.ts` has no coverage threshold set. Test files in scope: 112 across repo, 33+ in dash-build. No baseline number to compare against.
**Recommended action:** add `coverage.thresholds` to vitest config; baseline current %.

---

#### H2. Test naming convention
**Verdict:** ✅ uniform — `*.test.ts` pattern observed throughout.

---

#### H3. Critical paths covered (clone preview, shim apply, PR creation)
**Verdict:** ✅ COVERED.
Test files found:
- Clone / sandbox: `src/runs/__tests__/sandbox-state.test.ts`, `branch-manager.test.ts`, `workspace.test.ts`, `git-ops.test.ts`
- Shim apply: `src/runs/__tests__/preview-shim.test.ts`, `patch-applier.test.ts`, `conflict.test.ts`, `stale-sweeper.test.ts`
- PR creation: `src/runs/__tests__/publish.test.ts`, `ci-gate.test.ts`
- Pipeline: `src/pipeline/__tests__/orchestrator.test.ts`, `status-transitions.test.ts`, `worker.test.ts`

---

### I. Code review / drift

---

#### I1. Components in `registry/dash/ui/` that exist but are never imported
**Verdict:** 🟢 minor — **1 truly unused primitive**.
- `apps/docs/registry/dash/ui/widget-shell.tsx` — 0 importers outside its own file.
- Honest note: ~37 UI primitives have only **1 importer** (almost always their own docs page). They aren't "dead" but they aren't load-bearing either. Adoption signal: weak.
**Recommended action:** delete `widget-shell.tsx` or document its intended use. Track adoption per-primitive over time.

---

#### I2. Components frequently re-implemented vs `dash add`
**Verdict:** see `ds-coverage-gap-2026-05-28.md` (existing artifact). Not redone here.

---

#### I3. Drift since `BASELINE-DRIFT-2026-05-20.md`
**Verdict:** baseline was on **consumer repos** (`halo-dash-fe`, etc), not on `dash-ds` itself. No directly comparable delta. The 4,312 hex baseline is in consumer repos which this audit doesn't touch.

---

## Gaps in `design.md` (rules that SHOULD exist but don't)

1. **"Empty state must have illustration + CTA"** — implicit in §"Voice And Copy" but never enforced. Several blocks have empty states with text only.
2. **"Form errors must be field-level not top banner"** — partially in §"Component Behavior" line 103 ("Show field-level errors near the field and a summary only when it helps"), but no AI fixture proves it.
3. **"Layer 2 themes must not import Layer 1 source"** — `dash audit` enforces (L-2 rule), but `design.md` is silent. 8 violations in `themes/*/examples/*-preview.tsx`.
4. **"Brand external hex (Facebook/Google/Apple/etc) is allowed in SocialButton"** — implicit carve-out, never stated. Generates false-positive churn in audit reports.
5. **"Chart fills via SVG `<linearGradient>` are not 'decorative'"** — currently the rule lumps them with body backgrounds; audit must hand-filter every time.
6. **"Reduced-motion respect"** — implied by §"Visual Character" ("sober motion") but no concrete enforcement clause. Zero global `prefers-reduced-motion` blocks today.
7. **"Skip-link in app shells"** — A11y floor in `LAYERED-ARCHITECTURE.md` mentions WCAG 2.2 AA + focus ring, but skip-link is not called out. Missing in both layouts.
8. **"External-brand-color allow-list"** — SocialButton uses Facebook `#1977F3`, Google brand quad, LinkedIn `#0077B5`, GitHub `#24292F`, Dropbox `#3984FF`. These should be on a sanctioned list, not flagged.
9. **"Logo colors live in Layer 0, not Layer 1"** — `dash-logo.tsx` const `DASH_PURPLE = "#5E2AAC"` is in Layer 1; architecturally should be in foundation.
10. **"Dash Build dashboard is itself an ops surface"** — the dashboard template at `packages/dash-build/src/daemon/templates/styles/dashboard.ts` uses 3 decorative `radial-gradient`s on body — design.md says ops surfaces shouldn't.

---

## Anti-gaps (rules that don't enforce reality)

1. **A2 "card radius ≤ 8px"** vs reality: Card primitive = `rounded-2xl` (16px) sourced from Figma. Rule is misaligned with the source of truth. **Highest-impact rule update.**
2. **A6 "border OR shadow, not both"** vs reality: every Modal/Popover/Tooltip/Menu/Drawer combines both — intentional per "floating above workspace" carve-out. Rule needs the carve-out in compressed form.
3. **A14 "no new sidebar/shell"** vs reality: DS ships 7 distinct shell variants (preview shells for each product). Rule was written for consumer repos; doesn't apply to the DS itself.
4. **B1 "no zod"** vs reality: `packages/registry-schema/src/zod-schemas.ts` is intentional runtime validation, package-scoped. Rule needs `registry-schema/**` carve-out.
5. **CLAUDE.md cardinal 4 "Dash Purple is #5e2aac"** is enforced semantically (Layer 0 token `--dash-purple-500: #5e2aac`) but **10 doc preview pages still ship raw `#7C4FC4`** — rule isn't lint-blocked.
6. **design.md line 156 "no purple-only screens"** has zero enforcement mechanism; landing page IS heavily purple (intentional). Rule is aspirational.
7. **design.md line 113 "Do not introduce a new sidebar, shell, or route pattern unless explicitly requested"** — every new docs route violates this technically. Rule context is consumer-repo generation, not DS itself.
8. **`packages/dash-build/src/daemon/templates/styles/dashboard.ts:90-92`** — the DS's own control-tower dashboard violates "no decorative gradients in operational tools". META-violation worth fixing.
9. **`apps/docs/registry.json` only has `theme:` on 23/56 blocks** — Layered Architecture says every Layer 3 block needs `theme:` field. Either backfill or relax the rule.
10. **Manifest accent table disagrees with LAYERED-ARCHITECTURE.md table** (ride: `#16a34a` vs `#5e2aac`). Two sources, no reconciler.

---

## Pre-existing bugs surfaced

1. **`dash audit` working** — earlier prompt claimed it errors with `Cannot find module zod-schemas.js`. Verified 2026-05-28 it runs cleanly and produces 11 HIGH + 720 MEDIUM. The dist/ rebuild appears to have resolved this; if it regresses again, the cause is `packages/registry-schema/dist/` getting wiped without a rebuild.
2. **Manifest version drift** — `themes/manifest.json` says `version: 0.1.0` but `layer: 2` while `LAYERED-ARCHITECTURE.md` documents the layer system as "Phase A–D in progress". Either version the manifest or version the architecture doc.
3. **`trellis-tenant/typography.css` missing** — manifest assumes it exists; CI doesn't verify.
4. **`worker/src/__tests__/validator.test.ts:42` imports `react-hook-form`** — slipped into tests, banned everywhere else.
5. **Bundle headroom thin** — `daemon.js` at 97% of budget, `index.js` at 95%. One feature lands and a budget breach is likely.
6. **`packages/dashboard/app/layout.tsx`** uses inline `style={{}}` on every chrome element (header, banner, badge). Dashboard package mocked as MVP but uses none of the registry components it advertises.
7. **`fancy-loader.tsx` has raw purple hex** (`#F3E8FF`, `#E9D5FF`, `#A78BFA`, `#6366F1`) — Layer 1 component violating its own token discipline.
8. **`feedback.md` lists "patterns are conceptually broken"** (ship RHF+zod that are banned). Patterns dir does NOT actually import RHF; comments simply mention the ban. Earlier critique was about a planned approach, not actual current code. `feedback.md` could be updated.

---

## Recommended priority queue for fixes

**P0 — High-impact, low-cost (do this week):**

1. **Reconcile Card radius rule** (A2) — pick: keep Figma 16px and update design.md, or migrate Card primitive to 8px. Most cascading rule change.
2. **Fix 10× `#7C4FC4` → `var(--dash-purple-500)`** (B3) — sed-replace in 8 docs pages. ~15 min.
3. **Add `prefers-reduced-motion` global block** to both `globals.css` files (A12). ~10 min.
4. **Add skip-link + landmark roles** to `apps/docs/app/(docs)/layout.tsx` and `packages/dashboard/app/layout.tsx` (E4, E5). ~30 min.
5. **Remove RHF import** from `packages/worker/src/__tests__/validator.test.ts:42` (B1). ~5 min.
6. **Add `theme:` field to remaining 33 blocks** in `apps/docs/registry.json` (C4). ~30 min.

**P1 — Rule clarifications (this sprint):**

7. **Add "floating-above-workspace" carve-out** to A6 in compressed AI rules (border+shadow on Modal/Popover/etc).
8. **Add "external brand color" carve-out** to A3/B3 (SocialButton).
9. **Add "auth shell / brand showcase" carve-out** to A3 (decorative gradients).
10. **Move `dash-logo.tsx` const into foundation tokens** (C2) — architectural cleanup.
11. **Add `trellis-tenant/typography.css`** (C5).
12. **Reconcile theme accent values** (C5) — `manifest.json` vs `LAYERED-ARCHITECTURE.md` accent table.

**P2 — Bigger sweeps (this quarter):**

13. **Fix `dashboard.ts:90-92`** — remove radial-gradients from Dash Build's own dashboard or document why ops tools get a one-off (A3 meta-violation).
14. **State coverage sweep** on 10 fetching blocks (A8) — formal loading/empty/error/success per block.
15. **Replace `fancy-loader.tsx` raw hex** with token references (C2).
16. **Audit-trail lint** — `dash audit --rule audit-trail` flagging payment/signature/kyc blocks without audit primitives (A11/B4).
17. **AI fixtures for floating-vs-flat shadow rule** (A6 enforcement at generation time).
18. **Bundle budget headroom** — refactor `daemon.js` to drop below 85% of budget; current 97% is fragile.

**P3 — Out of audit scope, flag for owner:**

19. **Glossary domain-status enforcement** against consumer repos via `dash audit --domain-glossary` (F1/F2). The DS doesn't model entities; this lint belongs in consumer-repo CI.
20. **Visual review for "purple-only / oversized hero"** (A5, A7) — needs human + Lighthouse, not static analysis.
21. **Update `feedback.md`** to reflect current pattern-block status (patterns no longer import RHF; honest-self-critique is now stale).

---

**Author:** static-analysis agent + verified by execution of `dash audit`, `audit-tokens.mjs`, `audit-css.mjs`.
**Total time:** ~75 min static analysis + 10 min report write-up.
**Verification scripts saved at:** `/tmp/audit-2026-05-28/{find-nested-cards2,raw-hex,unused-ui}.mjs`. Re-run from repo root to reproduce.
