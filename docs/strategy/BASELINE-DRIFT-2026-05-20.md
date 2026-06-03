# Dash Brand Drift Baseline — 2026-05-20

> **Purpose:** Pre-DS snapshot. Used to measure Dash Design System adoption impact in future scans.
> **Method:** read-only grep / find / wc scans against 10 Dash production repos. No source modified, nothing committed.
> **Scope:** FE drift metrics × 5 repos, BE drift metrics × 5 repos, cross-repo signals. Infrastructure-main skipped (IaC, not in DS scope).

---

## Summary

- **5 FE repos audited:** halo-dash-fe (JS Pages Router), next-portal-v2-web (App Router TS), next-backoffice-web (JS Pages Router), next-basecamp-web-main (App Router TS, Next 16 + React 19 + TW v4), react-fleet-management-web-main (CRA+CRACO TS).
- **5 BE repos audited:** halo-dash-be, nodejs-core-service (Prisma Express), nest-express-service-main, nest-fleet-service-main (Drizzle NestJS), ts-delivery-service-main (Prisma Express).
- **Total drift signals: 13** (8 HIGH, 3 MEDIUM, 2 INFO).
- **Aggregate hex hardcodes (FE):** **4,312** matches across **268 files** — primary visible drift.
- **Aggregate inline `style={{`:** **1,062** occurrences across 5 FE repos.
- **Component file LoC (tsx/jsx + ts/js sources combined):** ~301k lines across 5 FE repos.
- **Form library standardization:** ZERO usage of `react-hook-form` / `zod` / `formik` / `@tanstack/react-query` / `swr` across all FE source files (only `axios` is universal). Custom form-state code everywhere.

### Severity legend
- **HIGH** = blocks DS adoption goal or invalidates brand consistency claims.
- **MEDIUM** = real drift but localized.
- **INFO** = noise we noted in case it grows.

---

## Per-repo FE

### halo-dash-fe  (5-FE Support Layer)
- **Stack:** Next.js `14.2.35` (Pages Router) · React `18.3.1` · Tailwind `^3.4.14` (624-line config) · JS+JSX (no TS).
- **Source size:** 9 component files (jsx), ~3,313 LoC total source.
- **rhf imports:** 0 · **zod imports:** 0 (0 type-only) · **react-query:** 0 · **swr:** 0 · **hookform/resolvers:** 0.
- **Hex hardcodes:** **12 matches in 5 files** (LOW).
- **Inline `style={{`:** **44** occurrences.
- **Primitive defs (Button/Input/Card/Modal/Badge):** **0** (uses raw HTML + Tailwind classes — no abstraction layer).
- **Severity:** LOW (small repo, late-add). DS migration easiest here.

### next-portal-v2-web  (Mitra Portal v2)
- **Stack:** Next.js `^14.2.35` (App Router) · React `18.3.1` · Tailwind `^3.4.14` (632-line config) · TypeScript.
- **Source size:** 240 component files (tsx), ~53,986 LoC.
- **rhf:** 0 · **zod:** 0 · **react-query:** 0 · **swr:** 0 · **hookform/resolvers:** 0.
- **Hex hardcodes:** **37 in 9 files** (LOW).
- **Inline `style={{`:** **53**.
- **Primitive defs:** Button:1, Input:1, Modal:1, Badge:1, Dialog:1, Table:1, Select:1, Tooltip:1, Toast:1 — **own internal primitive library** (`components/ui/`).
- **Severity:** MEDIUM (clean source, but own UI primitives = DS migration competes with existing system).

### next-backoffice-web  (Internal Ops Console)
- **Stack:** Next.js `14.2.35` (Pages Router) · React `^18` · Tailwind `^3.3.0` (698-line config) · JS+JSX (no TS).
- **Source size:** 335 component files (jsx), ~125,075 LoC.
- **rhf/zod/react-query/swr/hookform-resolvers:** 0 each.
- **Hex hardcodes:** **1,913 matches in 133 files** (HIGH).
- **Inline `style={{`:** **695** occurrences (HIGH).
- **Primitive defs:** Button:1, Input:1, Card:1, Modal:1, Tooltip:1 (in `components/ui/`).
- **Top hex offenders:**
  - `src/pages/payroll/components/DetailPaymentRequestModal.jsx` — **110 hex hardcodes**.
  - `src/pages/payroll/components/CreatePaymentRequestModal.jsx` — **79**.
  - `src/components/heatmap-2/driver-filter-popup.jsx` — **70**.
  - `src/pages/payroll/components/DetailDriverDisbursmentModal.jsx` — **66**.
  - `src/components/modal/ReturnHandoverModal.jsx` — **64**.
- **Severity:** **HIGH** — largest visual-drift surface in the org. Payroll & heatmap modals are color-soup.

### next-basecamp-web-main  (Legal / Onboarding Flow)
- **Stack:** Next.js `16.1.6` (App Router) · React `19.2.3` · Tailwind `^4` (CSS `@theme` config, no JS config) · TypeScript · Firebase + Zustand 5.
- **Source size:** 118 component files (tsx), ~67,976 LoC.
- **rhf:** 0 · **zod:** 0 · **react-query:** 0 · **swr:** 0 · `axios`: not in deps (uses native fetch — **107** `fetch(`/`useQuery(`/`useSWR(` call sites).
- **Hex hardcodes:** **2,028 matches in 72 files** (HIGH).
- **Inline `style={{`:** **159**.
- **Primitive defs:** Button:1, Input:1, Card:1, Badge:1, Dialog:1, Table:1, Select:1, Tooltip:1, Toast:1 (shadcn-style `components/ui/`).
- **Top hex offenders:**
  - `app/(app)/settings/modules/[moduleId]/page.tsx` — **87 hex hardcodes**.
  - `app/legal-flow/document/[id]/page.tsx` — **69**.
  - `app/(app)/settings/page.tsx` — **64**.
- **Severity:** **HIGH** — bleeding-edge stack (Next 16 / React 19 / TW v4) divergent from rest of org; hex density worst-per-file.

### react-fleet-management-web-main  (Fleet Mgmt SPA)
- **Stack:** CRA + CRACO (NOT Next.js) · React `^19.2.3` · Tailwind `^3.4.18` (24-line config — basically default) · TypeScript.
- **Source size:** 122 component files (tsx), ~50,645 LoC.
- **rhf:** declared in `package.json` (`^7.70.0`) BUT **0 actual imports in source**. **`@hookform/resolvers ^5.2.2`** also declared, 0 imports. **`zod ^4.3.5`** declared, 0 imports.
- **react-query/swr:** 0 imports.
- **Hex hardcodes:** **322 matches in 49 files** (MEDIUM).
- **Inline `style={{`:** **111**.
- **Primitive defs:** Button:1, Card:1, Modal:1.
- **Top hex offenders:**
  - `src/pages/issues/components/CreateMaintenanceModal.tsx` — **25**.
  - `src/pages/dashboard/components/FleetUtilizationChart.tsx` — **16**.
- **Severity:** **HIGH** for divergent stack (CRA in a Next.js org), MEDIUM for hex.

---

## Per-repo BE

### halo-dash-be  (Prisma + Express)
- Express `^4.21.2` · Prisma `^5.22.0` · JS source (no TS).
- 86 src files, ~5,988 LoC.
- 1 response-helper file detected.
- Envelope status: 0 string, 1 numeric.
- AppError: 0 · generic error classes (HttpException/BadRequest/etc): 4.
- ORM call in controller/route files: 0.
- Controller/route files: 0 (likely flat express handlers in non-conventional naming).
- Service files: 0.

### nodejs-core-service  (Prisma + Express)
- Express `^4.21.2` · Prisma `^5.22.0` · JS source.
- 484 src files, ~58,545 LoC.
- 1 response-helper file.
- Envelope status: 0 string, 23 numeric.
- AppError: 0 · generic errors: 15.
- ORM in controller/route files: 0.
- Controller/route files: 0 (likely uses non-standard naming).
- Service files: 5.

### nest-express-service-main  (NestJS + Drizzle 0.45)
- NestJS `^10.0.0` · Drizzle `^0.45.1` · Fastify `^5.2.1` · TS.
- 277 src files, ~19,279 LoC.
- 0 response-helper files (presumably interceptor-based).
- Envelope status: 0 string, 10 numeric.
- AppError: 0 · NestJS exception classes: 28.
- ORM in controller/route files: 0. Controllers: 9 · Services: 56.

### nest-fleet-service-main  (NestJS 11 + Drizzle 0.40)
- NestJS `^11.1.11` (NEWER than express service) · Drizzle `^0.40.0` (OLDER than express service) · TS.
- 755 src files, ~43,461 LoC.
- 0 response-helper files.
- Envelope: 1 string, 2 numeric.
- AppError: 0 · NestJS exceptions: **285** (heaviest exception-class usage).
- Controllers: 21 · Services: 134.
- **Drift signal:** NestJS major version differs from sibling Nest service (10 vs 11); Drizzle older despite Nest newer (architectural inversion).

### ts-delivery-service-main  (Prisma + Express + custom AppError)
- Express `^4.19.2` (OLDER than halo/core's 4.21.2) · Prisma `^5.22.0` · TS.
- 578 src files, ~104,348 LoC.
- **104 response-helper files** (orders of magnitude higher than peers — likely per-route helper).
- Envelope: 1 string, 17 numeric.
- **AppError occurrences: 655** — ONLY repo using AppError pattern.
- ORM in controller/route files: **5** (smallest leak but the only repo where the heuristic caught any).
- Controllers/routes: 27 · Services: 59.
- **Drift signal:** uses bespoke AppError/response-builder convention nobody else uses. Architecturally lonely.

---

## Cross-repo signals

### 1. Framework version drift
| Layer | Versions in org |
| --- | --- |
| Next.js (4 repos) | `14.2.35` (3 repos: halo-fe, portal-v2, backoffice) + `16.1.6` (basecamp) — **2 majors apart** |
| React (5 repos) | `18.3.1` / `^18` (3 repos) + `19.2.3` / `^19.2.3` (basecamp, fleet) — **2 majors live** |
| Tailwind (5 repos) | `^3.3.0` (backoffice) · `^3.4.14` (halo, portal) · `^3.4.18` (fleet) · `^4` (basecamp, CSS @theme) — **major v3 vs v4 split + 3 minor versions in v3** |
| NestJS (2 repos) | `^10.0.0` (express svc) vs `^11.1.11` (fleet svc) — **1 major apart** |
| Drizzle (2 repos) | `^0.45.1` (express svc) vs `^0.40.0` (fleet svc) — **5 minors apart, but newer Nest paired with OLDER Drizzle** |
| Express (3 repos) | `^4.19.2` (delivery) vs `^4.21.2` (halo-be, core) |
| Prisma (3 repos) | `^5.22.0` (uniform — only consistent piece in the BE) |

### 2. Component file duplication (FE only)
- 820 component files (`.tsx`/`.jsx`) total across 5 FE repos.
- 728 unique basenames → **92 duplicated basenames** (~11% reuse pattern).
- Primitive duplicates confirmed:
  - **Button:** 3 separate implementations (portal-v2 `button.tsx`, basecamp `button.tsx`, fleet `Button.tsx`) — backoffice has lowercase `button.jsx`, so **4 total**.
  - **Input:** 3 (portal-v2, backoffice, basecamp) + fleet has none.
  - **Card:** 3 (backoffice, basecamp, fleet).
  - **Modal/Dialog:** 4 surface area (portal-v2 Modal, basecamp Dialog, fleet Modal, backoffice Modal — semantic split between "Modal" and "Dialog" naming).
  - **Badge:** 2 (portal-v2, basecamp).
  - **Tooltip:** 3.
- halo-dash-fe has **zero primitives** — uses inline HTML+Tailwind; opposite end of the drift spectrum.

### 3. Form / data-fetch pattern drift
- **No form library used in source** anywhere. All 5 FE repos manage form state via `useState` / custom hooks.
- **react-fleet** has `react-hook-form`, `zod`, `@hookform/resolvers` in `package.json` but **zero imports** — dead dependency (probably a half-finished migration).
- **basecamp** is the only repo using native `fetch` + `useQuery`/`useSWR`-named call sites (107 occurrences) — no axios, no `@tanstack/react-query` as dep. Custom data layer.
- **All other FE repos:** `axios` is universal client.

### 4. BE response/error pattern drift
- **AppError pattern only in `ts-delivery-service-main`** (655 occurrences). All other BE repos use NestJS exception classes (28–285 occurrences) or generic Errors.
- **Response envelope:** no string-status discipline (only 2 occurrences across 5 repos use string `'success'`/`'error'` status). Numeric `statusCode` is the de facto convention but not codified in any shared helper.
- **`ts-delivery-service-main`** has 104 response-helper file references vs `0–1` everywhere else — likely a per-domain response builder that ought to be a shared lib.

### 5. Total LoC summary
| Repo | Source LoC |
| --- | --- |
| next-backoffice-web | 125,075 |
| next-basecamp-web-main | 67,976 |
| next-portal-v2-web | 53,986 |
| react-fleet-management-web-main | 50,645 |
| halo-dash-fe | 3,313 |
| **FE TOTAL** | **~301,000** |
| ts-delivery-service-main | 104,348 |
| nodejs-core-service | 58,545 |
| nest-fleet-service-main | 43,461 |
| nest-express-service-main | 19,279 |
| halo-dash-be | 5,988 |
| **BE TOTAL** | **~232,000** |

---

## Top drift hotspots (HIGH severity)

1. **`next-backoffice-web/src/pages/payroll/components/DetailPaymentRequestModal.jsx`** — 110 hardcoded hex colors in one file. Worst single offender in the org.
2. **`next-basecamp-web-main/app/(app)/settings/modules/[moduleId]/page.tsx`** — 87 hardcoded hex. Bleeding-edge stack (Next 16/React 19/TW v4) means refactor cost compounds.
3. **next-backoffice-web** as a whole — 1,913 hex + 695 inline `style={{` in JS+JSX with no TypeScript safety net.
4. **react-fleet-management-web-main** stack divergence — only CRA+CRACO repo, only React 19+TW3 combo, declared-but-unused RHF/zod/resolvers deps (stale migration corpse).
5. **next-basecamp-web-main** — Next 16 / React 19 / TW v4 isolated from the rest of org's Next 14 / React 18 / TW v3.
6. **ts-delivery-service-main** BE — bespoke `AppError` + response-helper convention used nowhere else. 655 AppError sites = costly to harmonize.
7. **Form-state anarchy** — all 5 FE repos roll their own state; zero shared validation primitives. Every new form is a new opinion.
8. **NestJS 10 vs 11 split** between two sibling Drizzle services with the older service running newer Drizzle.

### Known-outlier sanity check
- Memory rule: "react-fleet-management — known RHF outlier (acknowledged in rules)."
- **Detected?** Partially. The `package.json` declaration exists (`"react-hook-form": "^7.70.0"`, `"@hookform/resolvers": "^5.2.2"`, `"zod": "^4.3.5"`). However **zero source imports** found across the repo — the outlier appears to be a **stale dependency**, not active code. The only form-validation site is `src/pages/repossessions/components/RepoModal.tsx` which uses a **custom `useFormValidation` hook**, not RHF.
- **Interpretation:** the historical RHF migration in fleet was abandoned or reverted; deps were never cleaned up. This is a data-point worth flagging because it contradicts the assumption that fleet is "the RHF outlier" — it isn't *currently*, just on paper.

---

## Recommendations — Top 5 components to ship in Dash DS first

Ranked by duplicate-elimination impact + hex/inline-style consolidation potential:

1. **`Button`** — 4 separate implementations across portal-v2, backoffice, basecamp, fleet. Highest-frequency primitive; shared component eliminates 4 maintenance surfaces.
2. **`Modal` / `Dialog`** — 4 surfaces, plus the worst hex-density files are all `*Modal.jsx`. Shipping `<DashModal>` with token-based theming kills ~300+ hex hardcodes in backoffice payroll modals alone.
3. **`Input` + `Form` field primitives** — 3 Input implementations + zero shared form-state pattern. Pair with a chosen form library decision (RHF + Zod, or `@tanstack/react-form`) baked into the DS.
4. **`Card`** — 3 implementations + dozens of bespoke `*Card.jsx` (DetailCard, ProcessCard, KycCard, StatCard, etc. in backoffice alone). Even just a token-driven shell will absorb visual drift.
5. **`Badge` / `Tooltip`** — pair primitives, 2–3 implementations each. Low individual LoC but high visual-vocabulary impact.

## What's NOT cleanly measurable (honest caveats)

- **Token compliance**: I count raw hex matches but didn't parse each Tailwind config to know which colors *are* tokens (e.g., `#FFFFFF` in `theme.colors.white` is "legal" but raw `#FAFAFA` in a JSX `style` is drift). True compliance score needs config parsing + per-token allow-listing. The 4,312 hex count is upper-bound drift.
- **Inline style legitimacy**: `style={{ width: dynamicPercent }}` is fine; `style={{ background: '#fafafa' }}` is drift. The 1,062 inline-style count includes both.
- **Component "duplication"**: same filename ≠ same semantics. `button.tsx` in portal-v2 vs basecamp might be shadcn-derived and largely identical, or wildly different. A deeper structural diff (props, classNames, variants) would refine this. Future scan idea: AST-parse `forwardRef` declarations and compare prop shapes.
- **Envelope shape consistency**: my heuristic catches `status: 'success'` literals and `statusCode:` references; it does NOT catch envelopes implemented via NestJS `ResponseInterceptor` (which emit at runtime). Real BE envelope drift may be higher than reported.
- **BE "ORM-call-in-controller" heuristic**: looked for prisma/db calls in files matching `controller|route|handler` filename patterns. Misses cases where controllers are co-located in unconventionally named files (which is why halo-dash-be / nodejs-core-service show 0 — they're not Nest-style).
- **Halo-dash-fe size warning**: only 3.3k LoC and 9 components — it's barely a baseline. Drift signals from this repo carry low weight.

---

## Re-run instructions (for future post-DS comparison)

Scripts saved at:
- `/tmp/scan_fe.sh` — FE drift scanner (single arg: repo basename under `/Users/irfanprimaputra.b/Dash/`).
- `/tmp/scan_be.sh` — BE drift scanner (same arg pattern).

To reproduce or measure post-DS deltas, re-run `bash /tmp/scan_fe.sh <repo>` and diff against the per-repo numbers in this document.
