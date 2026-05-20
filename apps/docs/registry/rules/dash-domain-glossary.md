# Dash Domain Glossary (merged v1 + v2 — 2026-05-20)

> **Primary source: v2** — extracted from official AGENTS.md / CLAUDE.md / README / docs / package.json across 5 Dash repos on 2026-05-20 during Phase 1.5.
> **Appendix A (below): v1** — Phase 1 code-inferred entity field detail (preserved for entities v2 didn't deep-dive). Where v2 and v1 disagree, v2 wins (it is grounded in what the Dash team OFFICIALLY wrote for their own AI agents — not speculation).
> **Cross-reference**: AI rules at `dash-ai-rules.md` (Adaptation Layer) consume both — high-level stack from v2, entity field detail from Appendix A.

## Sources actually read (15 files)

| # | File | Lines | Tier |
|---|---|---|---|
| 1 | `next-portal-v2-web/AGENTS.md` | 190 | A |
| 2 | `next-backoffice-web/AGENTS.md` | 37 | A |
| 3 | `halo-dash-fe/CLAUDE.md` | 20 | A (sparse) |
| 4 | `halo-dash-be/AGENTS.md` | 437 | A |
| 5 | `nodejs-core-service/AGENTS.md` | 435 | A |
| 6 | `nodejs-core-service/README.md` | 603 | A |
| 7 | `halo-dash-fe/docs/engineering/AI-AGENT.md` | 168 | B |
| 8 | `halo-dash-fe/docs/engineering/ARCHITECTURE.md` | 153 | B |
| 9 | `halo-dash-fe/docs/design/design-system.md` | 70 | B |
| 10 | `halo-dash-fe/docs/design/voice.md` | sampled | B |
| 11 | `halo-dash-fe/README.md` | 91 | B |
| 12 | `halo-dash-fe/TODOS.md` | 32 | B |
| 13 | `halo-dash-be/README.md` | 64 | B |
| 14 | `next-portal-v2-web/README.md` | 39 | B |
| 15 | `next-backoffice-web/README.md` | 2 | B |
| 16 | 5× `package.json` (all repos) | — | C |
| 17 | `docker-compose.yml` | 60 | C |
| 18 | `next-portal-v2-web/messages/{en,id}.json` (sampled) | — | B |

---

## TL;DR — Dash team's official stack decisions

The Dash team operates **5 repos that DO NOT share a stack**. Each repo has its own conventions, and the AGENTS.md files explicitly tell AI agents "follow the existing pattern here, don't import patterns from other repos." This is a critical correction to Phase 1's inferred-from-code assumption that there was a unified frontend stack.

**Frontend reality:**
- `next-portal-v2-web` — Next.js 14 **App Router** + **TypeScript** + Jotai 2.12 + Axios + next-intl + nuqs + AlignUI/Radix. NO RHF, NO Zod, NO TanStack Query. Forms are native useState/Jotai; HTTP is axios; URL state is nuqs. **This is the merchant/provider portal.**
- `next-backoffice-web` — Next.js 14 **Pages Router** + **JavaScript** + MUI v5 + antd 5 + NextAuth + axios + react-toastify. Heavy legacy stack (mixed MUI + antd + Tailwind). **This is the internal ops console (Control Tower lives here).**
- `halo-dash-fe` — Next.js 14 **Pages Router** + **JavaScript** + AlignUI (vendored via `file:` path) + Radix + axios. Migrated FROM TS App Router TO JS Pages Router on 2026-05-07 explicitly to mirror `next-backoffice-web` for future merge. **Mitra support backoffice.**
- (No mobile FE in scope — driver app is Kotlin native, separate repo, TBD.)

**Backend reality:**
- `nodejs-core-service` — Node 24.13 + Express 4 + Prisma + Postgres + GCP (Pub/Sub, Storage, Tasks, Cloud Run) + Xendit + Qiscus + Mapbox. Tabs (width 4), no semis, single quotes. **Single monolith owning ALL domain entities — drivers, providers, customers, deliveries, payments, shifts.**
- `halo-dash-be` — fork of nodejs-core-service patterns; standalone for now, will merge back as `support`/`agent` module. Express + Prisma + Gemini LLM. Tabs (width 4), no semis.

**Off-limits to change** (explicitly mandated by AGENTS.md):
- Do not introduce RHF/Zod/TanStack Query/Redux to `next-portal-v2-web` — stack is locked at Jotai + Axios + native React state.
- Do not modify `components/ui/*` (AlignUI vendored) — PR upstream to the `align-ui` package.
- Do not log sensitive data (passwords, tokens, PII) anywhere — explicit ban in 3 AGENTS.md files.
- Do not put forms or interactivity on server components by default (`'use client'` only when interactive).
- Do not use Jest for NEW backend tests — Node native test runner (`node:test` + `node:assert`) is mandated.
- Do not break the env-var four-place rule (Dockerfile + 2 workflows + .env.example).

---

## Per-repo AGENTS.md summary

### next-portal-v2-web/AGENTS.md (190 lines)

**Purpose**: merchant/provider portal — outlets, deliveries, billing, signup, referral, COD.

Key mandates (verbatim or near):
- **Import order** (1) React/Next (2) third-party (3) `@/` absolutes (4) relative.
- **`'use client'`** required for client components, at file top.
- **Naming**: Components PascalCase (`DashboardHeader.tsx`), hooks `useXyz.ts`, utilities camelCase, types `XyzType.ts`, enums `xyzValue.ts`, API fns `getAllDeliveries / createDelivery`.
- **TypeScript**: strict mode, explicit return types on exported fns, `type` for objects vs `interface` for extensible contracts, path alias `@/` → root.
- **Error handling**: try/catch around API calls; `console.error('[ComponentName] Error:', error)`; return fallback values (e.g. `false`) on non-critical failures.
- **Project structure**: App Router under `app/` with `(auth)` + `(dashboard)` route groups; `infrastructure/api/{delivery,user,client}/`; `enums/constValue.ts` + `enums/optionValue.ts`; `utils/axios.ts` is the http layer.
- **Component pattern**: UI components compound (`Button.Root`, `Button.Icon`). Hooks use named exports, pages use default.
- **Analytics**: every `track()` call MUST include `outlet_id` + `provider_id` from `userData`.
- **Feature flags**: `useFeatureFlag('name', 'boolean'|'number')` — type-safe hook.
- **Env vars**: `NEXT_PUBLIC_*` for client. Four-place rule (Dockerfile + stg-deployment + prd-deployment + .env.example) — skipping any place silently falls back to default.
- **Signup flow**: Step1 reads `?aff=` for referral, sends as `aff` in `POST /client-user/v1/auth/signup`, strips param after success. Self-registered providers default to `PORTAL_PAYMENT_METHOD=PAY_PER_ORDER` and `ALLOW_SELF_ORDER_CUSTOMER=true`.

**Anti-patterns**: None explicit, but absence of RHF/Zod/TanStack Query in deps is the implicit no-list.

**No test runner.** "Testing must be done manually in browser." (literal quote)

---

### next-backoffice-web/AGENTS.md (37 lines — sparse)

**Purpose**: internal ops console. Control Tower, master data, routing.

Stack mandates:
- Next.js **14 Pages Router**, React 18, Tailwind, Remix Icon.
- **JavaScript** (JSX) for FE; some TS in `../ts-delivery-service` (legacy reference, not in current 5-repo set).
- **NextAuth.js** with JWT/cookie sessions (different from portal's axios-cookie pattern).
- Monolithic API service: `src/services/apiService.js` (~3200 lines, ALL API calls).
- **API response shape mandated**: `{ status: "Success", data: {}, pagination: {} }`.
- Control Tower polling interval: **30s** (locked in AGENTS.md).
- Control Tower SLA buckets: `BREACH | NEED_ATTENTION_NOW | MEDIUM_RISK | ON_TRACK` (Redis-backed).
- Driver assignment: 2-step wizard `AssignmentModal`.

**Cross-repo reference (important)**: backend = `ts-delivery-service` (TypeScript) — but this repo is NOT in the 5-repo set we were given. It's referenced as `../ts-delivery-service` but lives outside `/Users/irfanprimaputra.b/dash/`. Layered Routes→Controllers→Use Cases→Domain Services, Prisma + Postgres + Redis. Control Tower service path: `src/app/domain/control-tower/control-tower-service.ts`. Delivery service: `src/app/domain/delivery/service/delivery-service.ts`.

**This is where the "Delivery service" Phase 1 was looking for actually lives — in `ts-delivery-service`, a sister repo to nodejs-core-service.**

---

### halo-dash-fe/CLAUDE.md (20 lines) + docs/

The repo-root CLAUDE.md is ONLY a skill-routing file (matches gstack convention), no stack rules. Real engineering rules live in `docs/engineering/{AI-AGENT,API,ARCHITECTURE}.md` and `docs/design/{design-system,voice,mitra-mobile-chat-prompt}.md` + README.md.

Stack (from README + docs/engineering/ARCHITECTURE.md):
- Next.js 14.2 **Pages Router** + React 18 + **JavaScript** + Tailwind + `tailwind-variants` + Radix + sonner + cmdk + react-toastify.
- HTTP: **axios** + cross-domain cookie auth (`src/utils/cookieStorage.js` CrossDomainStorage).
- Auth: `src/contexts/AuthContext.js` cookie-based, shareable with next-backoffice-web cross-domain.
- Package manager: **npm** (NOT pnpm, despite ARCHITECTURE.md mentioning pnpm — README says npm; README wins as it's newer post-2026-05-07 restructure).
- Folder layout: `src/pages/`, `src/components/support/`, `src/services/{authService,supportService,agentService}.js`, `src/contexts/`, `src/enums/`.
- Brand color: `#5e2aac` (Dash Purple; matches DS token `--dash-purple-500`).
- AlignUI vendored via `file:/Users/irfanprimaputra.b/code/align-ui` — explicit do-not-modify rule, PR upstream.

Open items / known debt:
- 3 backoffice modules (`routing`, `masterdata`, `dashboard`) are placeholders.
- **No test suite at all** (no Jest, no Playwright, no Node native).
- Original 1058-line `backoffice/support/page.tsx` UI fidelity NOT yet ported back (P0 in TODOS.md).
- Backoffice layout / sidebar not yet ported.

**Mobile breakpoint policy** (design-system.md): "halo-dash is a backoffice desktop tool — primary breakpoint is `lg:` (1024px+). Tablet support is OK; true mobile (<640px) is **not supported**."

---

### halo-dash-be/AGENTS.md (437 lines)

Self-described as a "fork of nodejs-core-service/AGENTS.md" — patterns inherited 1:1 because halo-dash-be will eventually merge INTO nodejs-core-service as a `support`/`agent` module.

Stack:
- Node 24.13.0 + Express 4 + Prisma + Postgres + JWT + Winston + OpenTelemetry + node-cron.
- LLM: `@google/generative-ai` (Gemini), feature-flag enabled.
- Prettier: tabs (width 4), no semis, single quotes, ES5 trailing commas, 80-char width.
- CommonJS (`require`/`module.exports`).
- Layered: Routes → Controllers → Services → Repositories → Helpers.
- **Testing**: Node native test runner (NOT Jest for new). Colocated `.test.js` next to source. Table-driven test pattern mandated (full example in AGENTS.md). `node:assert` + `mock.fn()`.
- Error classes: `BadRequestError(400) / UnauthorizedError(401) / ForbiddenError(403) / NotFoundError(404) / ConflictError(409) / GoneError(410) / TooManyRequestsError(429) / InternalServerError(500)`.
- Auth middleware: `middlewares/authenticated.js`, multiple token types: **user / provider / customer**.
- Rate limit: default 1200/60s; provider endpoints 1500/60s; separate limiter for forgot-password.
- bcrypt 12 rounds.

---

### nodejs-core-service/AGENTS.md (435 lines) + README.md (603 lines)

**This is the canonical backend monolith.** Owns drivers, providers, customers, deliveries, payments, shifts.

Same conventions as halo-dash-be (because halo-dash-be was forked from it). Additional facts unique to core:
- **Xendit** for payment + refund (QRIS auto-refund flow detailed at AGENTS.md L386).
- **Qiscus** for WhatsApp OTP.
- **Google Maps API + Mapbox** for routing.
- **Pub/Sub topics**: `invoice_payment.capture` → `invoiceEventProcessor`; `refund.capture` → `refundEventProcessor`. Sender for refund.capture is `nest-webhook-service` (another sister repo, not in scope).
- **Schedulers**: `clockInScheduler`, `clockOutScheduler`, `overdueScheduler`, `reallocatingScheduler`, `verificationCleanup`.
- Refund notes format: `{reasonCode} - {message}` (e.g., `EB1008 - Exceed SLA for driver allocation`).
- **Deployment**: Cloud Run, staging on `main` push, production on tag `v*.*.*`. CPU 1 core, Memory 512Mi, max scale 3 (staging).
- **OTel sampling**: `OTEL_TRACES_SAMPLER_ARG=0.1` (10% in prod).

Feature flags hard-listed:
```js
ENABLE_GOOGLE_PUBSUB
ENABLE_COUNTRY_CODE_PHONE_NUMBER
ENABLE_MOCK_WHATSAPP_OTP
CLOCK_IN_RADIUS
ENABLE_SYNC_ACTIVATE
ENABLE_SYNC_BLACKLIST
ENABLE_DRIVER_LOGIN_V3
ENABLE_SYNC_CLOCK_OUT
```

DB tables hinted in tracing examples: `m_driver`, `driver_approval`, `t_refund`, `t_transactions`. The `m_` prefix = master tables, `t_` prefix = transactional. (Phase 1 inferred this; Phase 1.5 confirms.)

---

## Definitive stack snapshot (from package.json)

### next-portal-v2-web (TypeScript, App Router)
```
next: ^14.2.35       react: 18.3.1        typescript: ^5
jotai: ^2.12.5       ← FORM + STATE
axios: ^1.10.0       ← HTTP CLIENT
nuqs: ^2.4.3         ← URL STATE
next-intl: ^4.8.3    ← i18n
next-themes: ^0.4.3
@tanstack/react-table: ^8.21.3  ← tables only, NOT react-query
@radix-ui/*          ← primitives
react-aria-components: ^1.4.1
react-select: ^5.10.1, react-day-picker: 8.10.1, cmdk, sonner
firebase: ^12.1.0, firebase-admin: ^13.7.0
mixpanel-browser: ^2.73.0
crypto-js: ^4.2.0
tailwind-merge + tailwind-variants
@dnd-kit/*           ← drag-n-drop
embla-carousel-react ← carousels
react-otp-input, react-hotkeys-hook, react-markdown + remark-gfm
@remixicon/react: ^4.5.0
@react-google-maps/api: ^2.20.7
```
**DOES NOT use**: react-hook-form, zod, @tanstack/react-query, redux, zustand, MUI, antd, NextAuth.

### next-backoffice-web (JavaScript, Pages Router)
```
next: 14.2.35        react: ^18           (NO typescript)
@mui/material: ^5.15.7 + @mui/icons-material + @mui/x-date-pickers
antd: ^5.14.0        ← yes, MUI + antd coexist (legacy)
@ckeditor/ckeditor5-react: ^11.0.0 + ckeditor5 + draft-js + react-draft-wysiwyg
@tanstack/react-table: ^8.11.7 + match-sorter-utils
@turf/turf: ^7.3.4   ← geospatial
@vis.gl/react-google-maps: ^1.7.1
terra-draw: ^1.26.0 + terra-draw-google-maps-adapter
axios: ^1.6.7
next-auth: ^4.24.6   ← NextAuth (DIFFERENT from portal!)
js-cookie, react-toastify, react-joyride, react-paginate
react-datepicker, react-day-picker: ^9, react-dropdown, react-select-async-paginate
moment: ^2.30.1, date-fns: ^3.3.1 (both!)
ngeohash: ^0.6.3
firebase: ^10.7.2
mixpanel-browser
tailwindcss-animate, tailwind-merge: ^3.5.0, tailwind-variants: ^3.2.2
@radix-ui/react-toast + react-tooltip (minimal)
material-icons + material-symbols + @remixicon/react: ^4.6.0  ← icon library zoo
embla-carousel-react
Jest 30 + @testing-library/react ← HAS tests, unlike portal
@faker-js/faker
```
**DOES NOT use**: jotai, RHF, zod, TanStack Query, redux. **Does use NextAuth** (portal does not).

### halo-dash-fe (JavaScript, Pages Router)
```
next: 14.2.35        react: 18.3.1
align-ui: file:/Users/irfanprimaputra.b/code/align-ui   ← LOCAL vendored
@radix-ui/*          ← same set as portal
axios: ^1.11.0
js-cookie: ^3.0.5
react-day-picker: 8.10.1, react-otp-input, react-toastify, sonner, cmdk
@remixicon/react: ^4.5.0
next-themes: ^0.4.3
tailwind-merge + tailwind-variants
```
**Notably ABSENT**: jotai (yet — TODOS suggests it'll need state mgmt soon), MUI, antd, RHF, zod, TanStack anything, Supabase (moved to BE), Gemini SDK (moved to BE). **No test runner.**

### halo-dash-be (Node.js)
```
@google/generative-ai: ^0.24.0   ← Gemini
@prisma/client: ^5.22.0 + prisma
express: ^4.21.2 + express-fileupload + express-validator
jsonwebtoken, bcrypt: ^6, helmet, cors
winston + full @opentelemetry/* stack
node-cron: ^3
moment-timezone: ^0.5.48
axios: ^1.11.0
dotenv, uuid, rate-limiter-flexible
```
Dev: nodemon, prettier 3.6.2 + @trivago/prettier-plugin-sort-imports. **NO Jest.**

### nodejs-core-service (Node.js)
Same baseline as halo-dash-be PLUS:
```
@google-cloud/pubsub, storage, tasks
@googlemaps/google-maps-services-js + @googlemaps/places
xendit-node: ^7.0.0
firebase-admin: ^12.7.0
csv-parser, json2csv, sheetjs-style ← imports/exports
tz-lookup, ngeohash
google-auth-library
```

---

## Conventions Dash team mandates (verbatim quotes)

### Forms (next-portal-v2-web)
AGENTS.md never explicitly says "use Jotai for forms" — but the dep list and existing code patterns lock it in. **The implicit mandate**: Jotai atoms + native useState + try/catch axios. The absence of RHF/Zod in package.json is the policy.

> "Wrap API calls in try/catch blocks. Log errors with context: `console.error('[ComponentName] Error:', error)`. Provide fallback values for feature flags. Silent failures acceptable for non-critical analytics." — next-portal-v2-web/AGENTS.md L69-74

**Implication for Dash DS**: rewrite multi-item-form pattern using Jotai array atom + native validation (regex / length checks inline). Replace `useFieldArray` from RHF with `useAtom([items])` and array splice helpers. Replace Zod schemas with hand-rolled validator functions returning `{ ok: boolean, error: string }`.

### Data fetching
> "API Functions: camelCase (`getAllDeliveries`, `createDelivery`)" — next-portal-v2-web/AGENTS.md L59
> "Use Tailwind CSS for styling. Use `@remixicon/react` for icons. Use `@/components/` alias for imports. API responses use `{ status: 'Success', data: {}, pagination: {} }` shape." — next-backoffice-web/AGENTS.md L18-22

**Mandated response envelope** (backoffice): `{ status: 'Success', data, pagination }`. Dash DS data hooks/tables MUST destructure this shape, NOT assume `{ data: [] }` flat.

**HTTP layer**: axios with 401 interceptor for auth refresh (`utils/axios.ts` in portal, `src/utils/axios.js` in halo-dash-fe).

### Validation
No validation library is mandated on the FE side. BE side uses `express-validator: ^7.2.1`. **FE-side validation is hand-rolled or absent.** Dash DS patterns that use Zod will fail review.

### Auth
- next-portal-v2-web: custom AuthContext + axios cookie auth (no NextAuth).
- next-backoffice-web: **NextAuth.js with JWT/cookie sessions**.
- halo-dash-fe: cookie-based AuthContext, cross-domain shareable via `CrossDomainStorage` helper (port from next-backoffice-web).
- All backends: JWT, three token types — **user / provider / customer** (verbatim from halo-dash-be AGENTS.md L333).

### i18n
> Portal uses `next-intl: ^4.8.3` with `messages/{en,id}.json`. Both files are full mirror-translations.

Sample patterns from `messages/id.json`:
- "Pengiriman" (Deliveries), "Pengguna" (Users), "Outlet", "Kebijakan", "Integrasi", "Pengaturan".
- ICU plural support: `"{minutes}m yang lalu"`.
- Section keys: `metadata`, `announcement`, `promoBanner`, `navigation`, `deliveries.notificationBell.timeAgo`.

**Implication for Dash DS**: never hardcode user-facing English. Components must accept i18n keys or render-prop labels.

**Backoffice and halo-dash-fe do NOT use next-intl** — they are Bahasa-primary (sometimes English-mixed for internal terms).

### Naming
Verbatim from next-portal-v2-web/AGENTS.md L52-60:
> "Components: PascalCase (`DashboardHeader.tsx`)
> Hooks: camelCase with `use` prefix (`useFeatureFlag.ts`)
> Utilities: camelCase (`mixpanelEvent.ts`)
> Types: PascalCase with suffix (`UserType.ts`, `AuthType.ts`)
> Enums: PascalCase with suffix (`constValue.ts`, `optionValue.ts`)
> API Functions: camelCase (`getAllDeliveries`, `createDelivery`)"

Note: enums file is `constValue.ts` / `optionValue.ts` (singular Value suffix, file-as-namespace) — not `constants.ts`.

### Style (BE)
> "Indentation: Tabs (width: 4) / Semicolons: Disabled / Quotes: Single / Trailing commas: ES5 / Print width: 80" — halo-dash-be + nodejs-core-service AGENTS.md L172-179

### Style (FE portal)
> "Single quotes, JSX single quotes, 2-space indentation, 80 character line width, Semicolons required, Arrow function parentheses always." — next-portal-v2-web/AGENTS.md L43-50

**FE and BE use OPPOSITE Prettier configs** — FE 2-space semis, BE tab-4 no-semis. Dash DS pattern files (FE) follow FE config.

### Testing
- next-portal-v2-web: **none** ("Testing must be done manually in browser." — L20)
- next-backoffice-web: Jest 30 + RTL (only repo with FE tests)
- halo-dash-fe: **none** (per TODOS + README)
- halo-dash-be + nodejs-core-service: Node native `node:test` + `node:assert`, table-driven pattern, colocated `.test.js`. NO new Jest tests.

---

## Service architecture map

### Domain ownership (corrected from Phase 1)

| Entity | Owner repo | Notes |
|---|---|---|
| Driver (m_driver) | `nodejs-core-service` | + approval state machine |
| Provider | `nodejs-core-service` | provider auth token type |
| Customer | `nodejs-core-service` | customer auth token type |
| Delivery | **`ts-delivery-service`** (NOT in 5-repo set — sister repo at `../ts-delivery-service`) | layered DDD-style: Routes→Controllers→Use Cases→Domain Services. Domain path `src/app/domain/delivery/service/delivery-service.ts` |
| Control Tower | `ts-delivery-service` | path `src/app/domain/control-tower/control-tower-service.ts` + Redis SLA buckets |
| Payment / Refund / Xendit | `nodejs-core-service` | QRIS auto-refund flow |
| Shift / Schedule | `nodejs-core-service` | + clockIn/clockOut schedulers |
| Support Thread / Ticket / KB / Halo agent | `halo-dash-be` (will merge into `nodejs-core-service`) | 5 tables, Gemini LLM |
| Webhooks (Xendit refund.succeeded) | `nest-webhook-service` (sister repo, not in scope) | publishes `refund.capture` topic |

**Phase 1 was wrong**: assumed Delivery lives in `nodejs-core-service`. It does not — it's in a separate `ts-delivery-service` TypeScript codebase that next-backoffice-web references as `../ts-delivery-service`. This sibling repo is NOT in the 5-repo set provided.

### Inter-service comms

- **Pub/Sub** (Google Cloud) — async: driver location, `invoice_payment.capture`, `refund.capture`.
- **Sync HTTP / axios** — FE→BE, BE→external (Xendit, Maps).
- **W3C Trace Context** propagation — axios auto-instrumented, traces span services.

### Sandbox vs production

- halo-dash-be has `app-sandbox.yaml`, `app-staging.yaml`, `app-production.yaml` (Cloud Run configs).
- Staging deploys on `main` push. Production on tag `v*.*.*`.
- Docker Compose local dev via OrbStack mDNS (`halo-dash-fe.orb.local`, `halo-dash-be.orb.local`, postgres internal-only at port 5433 external).

---

## Voice / copy patterns (halo-dash-fe/docs/design/voice.md)

**For mitra-facing copy (driver app context)**:
- Tone: **casual + warm Bahasa Indonesia**, 1-3 sentences max.
- Pronoun: **"kamu"** (Halo AI → Mitra), **"pak/bu/kak"** or name to address.
- Empathy first when mitra is upset.
- Currency: `Rp1.500.000` (period separator, no space).
- Dates: `5 Mei 2026` in chat or `2026-05-05` in tables.
- Time: `14:30 WIB`.

Forbidden phrases (mitra-facing): "Mohon menunggu", "Atas perhatiannya kami ucapkan terima kasih", "Silakan menghubungi customer service", "Sistem kami sedang bermasalah", "Telah berhasil di-process" — replaced with casual equivalents.

**For Dash backoffice (ops-facing) and merchant portal**: more polished but still uses "kamu" by default. Memory note `feedback_dash_mobile_voice_formal` (user override for Auto Suspend feature) says use formal "Anda" for that specific surface — these are surface-level exceptions, not the default.

**Memory rule lookup**: Phase 1.5 confirms the user's prior memory `feedback_dash_mobile_voice_formal_2026_05_11` is a per-feature override, not a global rule. Default remains "kamu" per voice.md.

---

## Implications for Dash DS adoption

Concrete refactor list for Phase 2 pattern blocks:

1. **Multi-item-form pattern**: replace `react-hook-form` + `useFieldArray` + `zod` resolver with Jotai array atom + native event handlers + inline validators returning `{ ok, error }`. Provide axios bulk-submit via `Promise.all` (keep that pattern — it's compatible).

2. **Form submit**: do NOT use TanStack `useMutation`. Use `try { await axiosClient.post(...) } catch (e) { console.error('[Form] Error:', e); toast.error(...) }` pattern with optional `setIsSubmitting` boolean.

3. **Validation**: ship a tiny hand-rolled `validators.ts` (length, regex, required, useCode pattern). No Zod.

4. **HTTP layer**: import shared axios instance from `@/utils/axios` (portal) or `@/utils/axios.js` (halo-dash-fe). Both have 401 interceptor that calls auth refresh. Do not call `fetch` directly.

5. **Response envelope**: `{ status: 'Success', data, pagination }` (backoffice). Portal uses raw response in many places — check per-endpoint. DS data hooks must accept either via a `responseAdapter` prop or be repo-specific.

6. **i18n**: portal uses `next-intl` keys (`useTranslations('namespace')` pattern). Backoffice + halo-dash-fe use hardcoded Bahasa strings. DS components must support both: accept either a translation function or fallback string props.

7. **Icons**: `@remixicon/react` (`RiUserLine`, `RiDeleteBin5Line` etc.). Backoffice ALSO uses material-icons + material-symbols (legacy). DS components should accept icon-as-prop (children or React.ReactNode), not bake in icon imports.

8. **Use-code / referral-code field**: **case-sensitive in production** — portal sends `referralCode.trim()` verbatim as `aff` to `POST /client-user/v1/auth/signup`. Do NOT auto-uppercase. (Phase 1 had this wrong.)

9. **Cookie + auth shared**: Cookie domain is shared between next-backoffice-web and halo-dash-fe via `CrossDomainStorage`. DS auth-aware components must use that helper, not localStorage.

10. **No server components for interactive surfaces**: portal uses App Router but explicitly says `'use client'` for any interactive component. DS patterns ship as client components by default (`'use client'` at top).

11. **No Redux/Zustand**: prefer React Context for app-wide state; Jotai for fine-grained reactive atoms (portal only); native useState elsewhere.

12. **Path alias**: `@/` → root in portal (TS) and `@/` → `src/` in halo-dash-fe + next-backoffice-web (JS, via jsconfig.json). DS docs should reference `@/components/...` and warn the user the alias root differs.

13. **Date library**: portal uses `date-fns: ^3`, backoffice uses BOTH `date-fns` + `moment`. DS date utilities should prefer date-fns.

14. **Tailwind variants version mismatch**: portal `0.2.1`, backoffice `3.2.2`, halo-dash-fe `0.2.1`. DS must be compatible with 0.2.x API (lowest common denominator).

15. **Mobile not supported on halo-dash-fe**: DS components don't need to ship `<sm:` overrides for halo-dash-fe surfaces. Backoffice same (desktop tool). **Portal IS mobile-friendly** — merchants check orders on phones.

---

## Updated AI rules to merge into dash-ai-rules.md v2 (Phase 3)

### Stack guarantees (NEW SECTION)

When generating UI for a Dash repo, AI MUST pick the stack based on target:

| Target repo | Framework | Forms | State | HTTP | Auth | i18n | Test runner |
|---|---|---|---|---|---|---|---|
| `next-portal-v2-web` | Next 14 App Router + TS | Jotai + native | Jotai + useState | axios + 401 interceptor | custom AuthContext | next-intl | none (manual) |
| `next-backoffice-web` | Next 14 Pages Router + JS | native useState | Context + useState | axios + apiService.js | NextAuth | Bahasa hardcoded | Jest + RTL |
| `halo-dash-fe` | Next 14 Pages Router + JS | native useState | Context + useState | axios | cookie AuthContext (cross-domain) | Bahasa hardcoded | none |
| `halo-dash-be` | Node 24 + Express + Prisma | — | — | — | JWT | — | node:test (table-driven) |
| `nodejs-core-service` | Node 24 + Express + Prisma | — | — | — | JWT (user/provider/customer) | — | node:test (table-driven) |

**Hard bans across all FE repos**: react-hook-form, zod, @tanstack/react-query, redux, zustand, mobx, formik.

**Hard bans across all BE repos**: Jest for new test files, async/await without try/catch in controllers, `console.log` (use winston), logging passwords/tokens/PII.

### Path prefix routing (BE)

Routes follow these prefixes (from QRIS flow + auth doc + signup endpoint):

- `/v1/*` — versioned shared (`/v1/deliveries/exp/control-tower`, `/v1/agent/metrics`, `/v1/approvals`)
- `/client-user/v1/*` — customer/merchant endpoints (`/client-user/v1/auth/signup`)
- `/driver/*` — driver app endpoints (driver login v3, location updates)
- `/health` — health check (no auth)

AI should infer the prefix from the actor + repo context.

### Domain glossary (replaces v1 skeleton — refined from AGENTS.md)

(22 entities preserved from v1; key corrections below)

- **Mitra** = driver-partner (m_driver). 6 lifecycle states per halo-dash-fe ARCHITECTURE.md: `ready_to_work | active | resign | blacklist | withdrawn | suspend`. **Bahasa-canonical**: "mitra" in user-facing copy; "driver" in code/DB.
- **Provider** = merchant/business account. Distinct from customer.
- **Outlet** = a merchant's physical location. One provider → many outlets.
- **Delivery** (`t_delivery` likely) — owned by `ts-delivery-service` (NOT nodejs-core-service). Has SLA buckets (BREACH / NEED_ATTENTION_NOW / MEDIUM_RISK / ON_TRACK).
- **Thread** (halo-dash) — support ticket. Categories: `payroll | reservation | order | account | other`. Statuses: `open | claimed | closed | ai_active | escalated`.
- **Message** — chat bubble. Senders: `mitra | ai | ops`.
- **KB Entry** — `{ id, category, keywords[], question, answer, is_active }`.
- **Rating** — 1-5 stars + optional feedback text.
- **Approval** (`driver_approval`) — flow: `status_from → status_to`, with rejection reasons. `ACCEPTED_2` triggers driver sync.
- **Payment / Refund** — Xendit-backed. QRIS auto-refund on PAID cancellation.
- **Shift** — schedulers manage clock-in / clock-out / overdue / reallocation.

(See v1 glossary for fuller entity list; v2 only corrects/refines, not replaces.)

### Convention rules (NEW)

When AI generates a new component / module / endpoint in a Dash repo, it MUST:

1. Run lint (`npm run lint`) before delivering — both portal and backoffice have ESLint configured. No PR without clean lint.
2. Use the existing axios instance (do not call fetch).
3. Match the repo's Prettier config (FE 2-space semis; BE tab-4 no-semis).
4. For BE endpoints: write a colocated `.test.js` with at least one happy + one error case (table-driven).
5. For env vars: update all four places (Dockerfile / stg / prd / .env.example). Verified in portal AGENTS.md L162-169.
6. For tracked events: include `outlet_id` + `provider_id` from `userData`. Verified in portal AGENTS.md L139-143.
7. Never modify `components/ui/*` (AlignUI vendored). PR upstream to `align-ui` package instead.
8. Never log sensitive data — verified in 3 AGENTS.md files.

---

## Privacy compliance

No PII was encountered in the read scope. All files read are technical documentation or stack metadata. The single mention of a credential pattern (`ops@halo-dash.local` / `halo-dev-password`) is an example dev credential explicitly documented as override-able and is not a real production secret.

`.env*`, `secrets/`, `keys/` were not opened.

---

# Appendix A — Code-Inferred Entity Detail (v1, Phase 1)

> Below: deep field-level detail for 22 domain entities, inferred directly from Prisma schema + controller code in `nodejs-core-service`, `halo-dash-be`, and FE type files. v2 corrected stack-level claims (forms / state / HTTP layer); the entity field detail below remains accurate for the BE schema as of Phase 1 (2026-05-20).
> Source files were read-only; no PII included.

## Domain entities

> Convention note: BE Prisma models use `m_*` prefix for **master tables** (reference data: drivers, providers, banks, cities, genders, etc.) and unprefixed snake_case for **transactional tables** (`driver_shift_assignment`, `driver_location`). Newer models switched to PascalCase (`Customer`, `ProviderClient`, `ProviderOutlet`, `Payment`, `Transaction`) with `@@map("snake_case")` to the actual table.

### Driver
The human delivery rider/courier on the Dash platform. Master record in `m_driver`. Internally called "driver" everywhere in `nodejs-core-service`; user-facing string for non-employee partners is "Mitra" (Bahasa Indonesia for partner).
- Source files (top): `nodejs-core-service/src/prisma/schema.prisma:13` (`m_driver`), `nodejs-core-service/src/application/controllers/driver.js`, `nodejs-core-service/src/application/routes/driver.js`
- Key fields: `id` (Int PK), `uuid`, `code` (unique), `first_name`, `last_name`, `email`, `phone_number` (unique), `talent_type` ("RIDER"), `nik` (Indonesian ID number), `status` ("READY_TO_WORK"), `is_active`, `is_blacklist`, `is_approved`, `bike_type_id`, `bank_id`, `city_id`, `latitude`, `longitude`
- Relationships: belongs to `m_city` / `m_bike_type` / `m_bank` / `m_gender`; has many `driver_shift_assignment`, `driver_approval`, `driver_tag`, `driver_working_schedule`; has one `driver_location`, `driver_media`, `driver_authentication`, `driver_ev_rent_assignment`
- Approval workflow (`ApprovalStatus` in `controllers/driver.js`): `Verifikasi Tahap 1` → `Lolos Tahap 1` → `Verifikasi Tahap 2` → `Lolos Tahap 2`, with `Ditolak Tahap 1/2` rejection states (Bahasa labels)
- Talent type: `"RIDER"` (default)

### Mitra
**User-facing synonym for Driver**, used in support context (Halo Dash). Not a separate DB entity in core service — `mitra_id` in `halo-dash-be` is a UUID reference that aligns with `m_driver.uuid`.
- Source: `halo-dash-be/src/prisma/schema.prisma:14` (`MitraSupportThread.mitra_id`), `halo-dash-fe/src/pages/support/index.js`
- Used in `halo-dash-be` because halo product is mitra-facing (driver support chat). Code in `nodejs-core-service` still uses "driver".

### Provider
A business client (B2B customer) that uses Dash to send deliveries. Top of the multi-tenant tree. Often called "client" in some user-facing strings but "Provider" in DB.
- Source files: `schema.prisma:435` (`m_provider`), `nodejs-core-service/src/application/routes/provider.js`, `nodejs-core-service/src/application/controllers/provider.js`
- Key fields: `id` (Int PK), `uuid` (unique), `code`, `name`, `legal_name`, `business_type` (`COMPANY`|`INDIVIDUAL`), `industry_type`, `source` (`BACKOFFICE`|`PORTAL`), `onboard_category` (`ASSISTED`|`SELF_SERVICE`), `is_active`, `verified_at`, `affiliate_code`
- Relationships: has many `provider_warehouse`, `provider_pricing`, `provider_schedule`, `provider_webhooks`, `shift`, `ProviderClient`, `ProviderSLA`, `ProviderAPIKey`, `ProviderOrderUploadTemplate`
- API key pair (`client_key` + `client_secret`) lives in `ProviderAPIKey` (with `is_sandbox` flag) — older `m_provider.client_secret`/`client_key` deprecated

### ProviderUser
A human staff member of a Provider who logs into the **portal** (`next-portal-v2-web`). NOT the same as `m_user` (which is internal Dash admin staff for backoffice).
- Source: `schema.prisma:780` (`m_provider_user`), `controllers/providerUser.js`
- Key fields: `id`, `uuid`, `provider_id`, `provider_outlet_id?`, `name`, `email`, `phone_number?`, `status` (`PENDING`|`ACTIVE`|`EXPIRED`), `verified_at`
- Roles (FE enum `userRole` in `next-portal-v2-web/enums/constValue.ts`): `client_super_admin`, `client_admin`, `client_staff`
- Token stored under localStorage key `clientUserToken`

### ProviderOutlet
A physical pickup location/branch of a Provider (e.g., a store, warehouse, restaurant).
- Source: `schema.prisma:1192` (`ProviderOutlet`, table `provider_outlets`), `controllers/providerOutlet.js`
- Key fields: `id` (UUID), `provider_id`, `provider_uuid`, `name`, `phone_number?`, `latitude?`, `longitude?`, `address?`, `province?`, `city?`, `district?`, `sub_district?`, `zip_code?`, `geo_hash?`, `state` (`ACTIVE`|`INACTIVE`)
- Soft delete via `deleted_at` / `deleted_by`
- Portal-side type: `next-portal-v2-web/types/OutletType.ts`

### ProviderClient
A **receiving customer / saved recipient** of a Provider — e.g., a B2B end-customer that the Provider repeatedly ships to. NOT the Provider's own user.
- Source: `schema.prisma:1057` (`ProviderClient`, table `provider_clients`), `controllers/providerClient.js`, route `/v1/provider-clients`
- Key fields: `id` (UUID), `provider_id`, `provider_outlet_id?`, `reference_code?`, `label?`, `name`, `address`, `latitude`, `longitude`, `geo_hash?`, `phone_number?`, `search_vector` (Postgres tsvector, GIN-indexed)
- Soft delete via `deleted_at`

### Customer
End consumer of Dash's **direct customer app** (separate from Provider-mediated flows). Distinct from `ProviderClient` and `ProviderUser`.
- Source: `schema.prisma:952` (`Customer`, table `customers`)
- Key fields: `id` (UUID), `full_name?`, `phone_number?` (unique), `email?` (unique), `profile_picture_img_url?`, `has_pin`, `verified_at?`
- Relationships: has many `CustomerAddress`, `CustomerSession`, `CustomerIdentity`, `CustomerVerification`
- Identity providers (`IdentityProvider` enum): `GOOGLE`, `APPLE`, `WHATSAPP`, `EMAIL_PASSWORD`

### Delivery
**Not a Prisma model in `nodejs-core-service/schema.prisma`** — deliveries are managed in a separate service (likely a dedicated delivery service or older monolith), exposed to core via webhook events and `WebhookEvent` enum (`DELIVERY_CREATED`, `DELIVERY_UPDATED`, `DELIVERY_COMPLETED`, `DELIVERY_CANCELLED`). FE consumes via `/client-user/v1/deliveries` (portal) and `/mgmt/v1/deliveries/*` (backoffice).
- Source: `next-portal-v2-web/types/DelliveryTypes.ts` (note typo "Dellivery"), `next-portal-v2-web/infrastructure/api/delivery/delivery.ts`, `next-backoffice-web/src/services/deliveryService.js`, `nodejs-core-service/src/application/constants/deliveryStatus.js`
- Identifiers used: `deliveryID` (string UUID, primary user-facing), `providerOrderID` (optional Provider's own ref), `invoiceNo`
- Status FSM (`DELIVERY_STATUS` constant + FE `deliveryStatus`): `PENDING_PAYMENT` → `QUEUEING` → `ALLOCATING` → `PENDING_PICKUP` → `PICKING_UP` → `PENDING_DELIVERY` → `IN_DELIVERY` → `COMPLETED` (happy path); branch states: `FAILED`, `CANCELLED`, `EXPIRED`, `PREPARING`, `PENDING_RETURN` → `IN_RETURN` → `RETURNED` / `FAILED_IN_RETURN`, `ON_HOLD`, `DISPOSED`, `VERIFIED`, `NOT_VERIFIED`
- Service category: `EXPRESS` | `LOGISTIC`. Service type: `INSTANT` | `SAME_DAY` | `NEXT_DAY`
- Payment method on delivery: `QRIS` | `INVOICING` | `CASH` | `CASHLESS`
- Shape: `{deliveryID, providerOrderID, status, courier, quote{...}, sender, recipient, timeline[], pickupAt, completedAt, ...}` — see `DeliveryDetailResponse` for canonical detail shape

### Trip / Stop / Quote
A multi-stop pickup/dropoff route inside a delivery flow (used during quote calculation).
- Source: `next-portal-v2-web/types/DelliveryTypes.ts` types `MultiStopQuoteRequest`, `Trip`, `Stop`, `QuoteResponse`
- A `Quote` carries: `service`, `currency`, `amount`, `discountAmount`, `finalAmount`, `estimatedTimeline{pickup,dropoff}`, `distance`, `packages[]`, `origin{address,coordinates}`, `destination{address,coordinates}`
- A Trip has `serviceCategory`, `serviceType`, `schedule{pickupTimeFrom,pickupTimeTo}`, `stops[]`
- A Stop has `id`, `type` (`PICKUP`|`DROPOFF`), `coordinates{latitude,longitude}`, `address`, `packages[]`

### Shift
A scheduled work window for drivers at a specific warehouse/pitstop/city, with a tolerance + days-of-week schedule.
- Source: `schema.prisma:579` (`shift`), routes `/v1/shifts`, `/v2/shifts`, `/v3/shifts`
- Key fields: `id`, `provider_id?`, `pitstop_id?`, `provider_warehouse_id?`, `provider_schedule_id?`, `tolerance`, `start_hour` (Time), `end_hour` (Time), `days_of_week` (bitmask Int), `valid_until?`, `timezone?`, `city_id`
- Joined to drivers via `driver_shift_assignment`
- Operational counters: `todays_overdue`, `todays_reallocating`

### DriverShiftAssignment
Many-to-many link between `m_driver` and `shift`; the actual scheduled shift for one driver.
- Source: `schema.prisma:608` (`driver_shift_assignment`)
- Has many `driver_shift_logs` (clock-in/out events) and `driver_shift_cancellation`
- Logs have `clock_in_at`, `clock_out_at`, `clock_in_img_url`, `tolerance`, `from_driver_shift_log_id` (reallocation chain), `status` (enum `DRIVER_SHIFT_ASSIGNMENT_STATUS`)

### Pitstop
A physical hub/base where drivers gather and clock in (waiting point for allocation). Linked to a Provider + city.
- Source: `schema.prisma:898` (`pitstop`), routes `/v1/pitstop`
- Operates with `ProviderUserPitstop` join for pitstop staff access

### Warehouse (ProviderWarehouse)
A Provider's pickup origin/depot. Has lat/lng + timezone.
- Source: `schema.prisma:500` (`provider_warehouse`)
- Relations: belongs to `m_provider` and `m_city`; has many `shift`

### Payment
A payment transaction record (QRIS, virtual account, deposit, e-wallet, invoicing).
- Source: `schema.prisma:1253` (`Payment`, table `t_payments`), constants `nodejs-core-service/src/application/constants/payment.js`
- Status (`PaymentStatus` constant): `PENDING` | `PAID` | `FAILED` | `CANCELLED` | `EXPIRED` (FE `billingStatus` also includes `SUCCESS`, `COMPLETED`, `REFUNDED`)
- Provider (`PaymentProvider`): `XENDIT` | `INTERNAL`
- Method (`PaymentMethod`): `QRIS` | `VIRTUAL_ACCOUNT` | `DEPOSIT` | `E_WALLET` | `INVOICING` | `PAY_PER_ORDER`
- Linked to `request_id` (UUID — quote/checkout reference) and has many `Transaction` and `Refund`

### Refund
Refund record tied to a Payment.
- Source: `schema.prisma:1280` (`Refund`, table `t_refunds`)
- Status: `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED` | `CANCELLED`
- `RefundSource` constant: `MANUAL`, `DELIVERY_CANCELLED`, `DELIVERY_ALLOCATION_FAILED`

### OneTimeCode (UseCode / PolicyOneTimeCode)
6-character alphanumeric code (case-sensitive) issued in batches under a Provider policy — used at delivery creation as an authorization/voucher. **This is the "Use-code" referenced in product specs.**
- **CANONICAL LOCATION (corrected Phase 1.7):** `nodejs-core-service/prisma/schema.prisma:1542-1584` — tables `policy_one_time_code_batches` + `policy_one_time_codes`. Owned by the **promo/voucher domain in core-service**, NOT by `ts-delivery-service`. (Phase 1.7A search of `ts-delivery-service/prisma/schema.prisma` confirms no `use_code` / `useCode` / `one_time_code` column on `t_deliveries` or sibling tables.)
- **Portal wire field:** sent as `referralCode` on signup, surfaced as `oneTimeCode` on `CheckoutDeliveriesRequest` and `DeliveryDetailResponse.policies.oneTimeCode`. (Coupling between portal and core is implicit through the wire-level field rename — recommend Dash team document explicitly.)
- **Case-sensitivity rule:** preserved verbatim — never `toUpperCase()` the user input. The Dash DS `@dash/use-code-field` block was patched 2026-05-12 to drop the uppercase coercion regression introduced in an earlier iteration.
- Lifecycle: minted in batch (with `effective_at` / `expires_at` + timezone) → consumed (`used_at`, `used_by`, `reference_id`)
- Belongs to a `m_provider` (and optional `provider_outlet_id`); unique per `(provider_id, code)`

### Webhook (ProviderWebhook + WebhookEvent)
Outbound HTTP callbacks to Provider systems on delivery lifecycle events.
- Source: `schema.prisma:provider_webhooks` + `webhook_events`
- `WebhookEvent` enum: `DELIVERY_CREATED`, `DELIVERY_UPDATED`, `DELIVERY_COMPLETED`, `DELIVERY_CANCELLED`
- `WebhookEventStatus`: `PENDING`, `SENT`, `FAILED`
- `WebhookMethod`: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### MitraSupportThread (Halo)
Support conversation thread for a Mitra (driver) in the Halo product.
- Source: `halo-dash-be/src/prisma/schema.prisma:14`, table `mitra_support_threads`
- Key fields: `id` (UUID), `mitra_id` (UUID), `category` (`payroll`|`reservation`|`order`|`account`|`other`), `subcategory?`, `status` (`created`|`ai_active`|`escalated`|`ops_active`|`closed`|`archived`), `priority` (`normal`|`high`|`urgent`), `ai_exchange_count`, `ai_handoff_reason?`, `claimed_by?`, `sla_deadline?`, `last_substantive_at` (drives 15-min auto-question scheduler), `closed_reason?` (`ops_manual`|`auto_inactive`|`mitra_confirmed`)
- Relationships: has many `MitraSupportMessage`, `MitraSupportRating`, `OpsActivityLog`

### MitraSupportMessage (Halo)
Chat message inside a support thread.
- Source: `halo-dash-be/src/prisma/schema.prisma:46`, table `mitra_support_messages`
- `sender_type`: `ai` | `mitra` | `ops` | `system`
- `message_type`: `text` | `option_chips` | `system_event`
- `options` JSON for chip-button replies

### SupportKbEntry (Halo)
Knowledge base entry — Q&A pairs with TEXT[] keywords (no pgvector). Powers AI retrieval.
- Source: `halo-dash-be/src/prisma/schema.prisma:91`, table `support_kb_entries`

### Role / Permission / UserRole (RBAC)
Generic RBAC tables (recent addition) — for internal `m_user` (Dash admin staff) authorization.
- Source: `schema.prisma:1411-1471`
- `Role` has many `Permission` via `RolePermission` join; users assigned via `UserRole`

### ReasonCode / ReasonMessage
Lookup table for standardized cancellation/failure/exception reasons surfaced across the app.
- Source: `schema.prisma:ReasonCode` + `ReasonMessage`, route `/v1/reasons`

### Other entities encountered (summary, not deep-dived)
- `m_bank` — bank list for driver payouts
- `m_bike_type` — vehicle types (MOTORCYCLE etc.)
- `m_gender`, `m_contact_relationship`, `m_past_delivery_experience` — driver onboarding lookups
- `m_city` / `m_province` / `m_district` / `m_village` — Indonesian wilayah hierarchy (with `wilayahid_code`)
- `m_ev_rent_provider` / `m_ev_rent_option` / `driver_ev_rent_assignment` — EV rental for drivers
- `m_tag` / `m_tag_category` / `driver_tag` / `shift_tag` — flexible tagging
- `m_cancellation_penalty` / `m_cancellation_reason` — shift cancellation fines
- `m_app_config` — global key-value config
- `t_cron_schedules` + `t_cron_schedules_logs` — scheduled job tracking
- `Transaction` — accounting/ledger entries linked to Payment

## Appendix A.2 — Naming, API, Validation, File Structure (v1 reference)

## Naming conventions

| Layer | Convention | Examples |
|---|---|---|
| FE file (TS/TSX) | `PascalCase.tsx` for components, `camelCase.ts` for utils/hooks | `DeliveryTable.tsx`, `useFeatureFlag.ts`, `axios.ts`, `phoneNumberHelpers.tsx` |
| FE file (halo, BO — JS) | `PascalCase.jsx` for components, `camelCase.js` for services | `ChatComposer.jsx`, `agentService.js`, `payrollApiService.js` |
| FE component | `PascalCase` | `DeliveryFilter`, `OutletTable`, `CreateManualDeliveryModal` |
| FE component family per route | `<Entity><Action>Modal`, `<Entity>Table`, `<Entity>TableColumns`, `<Entity>Filter`, `<Entity>CardList`, `<Entity>DetailModal`, `<Entity>DetailModalSkeleton` | `UserTable`, `UserTableColumns`, `UserFilter`, `UserCardList`, `UserDetailModal`, `CreateUserModal`, `EditUserModal`, `ConfirmAddUserModal`, `ConfirmDeleteUserModal` |
| FE hook | `camelCase` with `use` prefix (some legacy `kebab-case.ts` filenames) | `useFeatureFlag`, `useBanners`, `useCashAdvanceEnabled`, `useEnvMode`; files: `useBanners.ts`, `use-notification.ts` (mixed) |
| FE context | `PascalCase` ending in `Context.tsx`, exported as `XxxContext` plus `useXxx()` hook | `AuthContext.tsx` → `useAuth()`; `DeliveryNotificationContext.tsx` |
| FE API client function | `camelCase` verb-first | `getAllDeliveries`, `getDeliveryAnalytics`, `cancelDelivery`, `createPaymentRequest` |
| FE API client file | `camelCase` ending in `Service.js` (BO + halo) OR `<domain>.ts` (portal) | `payrollApiService.js`, `deliveryService.js`, `agentService.js`, `infrastructure/api/delivery/delivery.ts` |
| FE service class (halo) | `class XxxService { static async ... }` (static methods only) | `SupportService.listThreads()`, `AgentService.getActiveThread(mitraId)` |
| FE enum-like const | lowerCamelCase object exported `as const`, keys SCREAMING_SNAKE | `deliveryStatus`, `paymentMethod`, `billingStatus`, `userRole` |
| FE TS types | `PascalCase` with `Type` or `Request`/`Response` suffix; file `XxxType.ts` (note typo `DelliveryTypes.ts`) | `DeliveryDataType`, `DeliveryRequest`, `MultiStopQuoteResponse`, `ClientPoliciesResponse` |
| FE props variables | `camelCase` | `outletIDs`, `driverIDs`, `startDate`, `pickupTimeFrom` |
| FE TS strict | enabled, `any` discouraged; uses `type` for objects, `interface` for extensible contracts | per `AGENTS.md` |
| BE route file | `camelCase.js` | `driver.js`, `providerClient.js`, `driverShiftAssignment.v2.js`, `shift.v3.js` |
| BE controller / service / repository | mirror route filename, `xxxController` / `xxxService` exports | `controllers.driverController.getDrivers`, `service.driverService`, `repositories.driver` |
| BE constants | grouped by concern in `constants/<topic>.js`, exports SCREAMING_SNAKE or PascalCase const | `PaymentStatus`, `DELIVERY_STATUS`, `PaymentMethod`, `IdentityType` |
| BE Prisma master models | `m_<snake_case>` (Int autoincrement PK) | `m_driver`, `m_provider`, `m_city`, `m_bank` |
| BE Prisma transactional (legacy) | `snake_case` | `driver_shift_assignment`, `provider_warehouse`, `driver_location` |
| BE Prisma transactional (newer) | `PascalCase` model + `@@map("snake_case")` | `Customer` → `customers`, `Payment` → `t_payments`, `Refund` → `t_refunds`, `ProviderOutlet` → `provider_outlets`, `ProviderClient` → `provider_clients` |
| BE Prisma enums | `PascalCase` or `SCREAMING_SNAKE`, inconsistent | `ProviderBusinessType`, `IdentityProvider`, `WebhookEventStatus`, `DRIVER_SHIFT_ASSIGNMENT_STATUS`, `DriverStatus`, `cron_type` |
| BE Prisma columns | `snake_case` | `phone_number`, `created_at`, `is_active`, `bike_type_id` |
| BE Prisma timestamp | `*_at` (`created_at`, `updated_at`, `deleted_at`, `verified_at`, `completed_at`), `@db.Timestamptz(6)` | universal |
| API endpoint | `/<actor-prefix>/v<n>/<kebab-or-snake-resource>` versioned via path | see API section below |
| API path versions | `/v1/`, `/v2/`, `/v3/` coexist for migration | `/v1/shifts`, `/v2/shifts`, `/v3/shifts`, `/v1/upload`, `/v2/upload` |
| API path style | kebab-case in plural | `/v1/bike-types`, `/v1/contact-relationships`, `/v1/provider-clients`, `/v1/cancellation-penalties` |
| Identifier casing in JSON | Mixed — older endpoints use `snake_case` (BE controllers passing through Prisma), newer + portal endpoints use `camelCase` (`outletIDs`, `pickupTimeFrom`, `deliveryID`, `providerOrderID`) | inconsistent; portal types canonical |

## API contracts

### Base URL prefixes by actor
| Prefix | Audience | Mounted in `routes/index.js` |
|---|---|---|
| `/v1/...` | shared/authenticated default | most master + admin routes |
| `/driver/...` | Driver mobile app | `BaseDriverRouter` |
| `/customer/...` | Customer mobile app | `CustomerRouter` (with `timeZone` middleware) |
| `/client-user/...` | Provider portal (`next-portal-v2-web`) | `ClientUserRouter` (with `timeZone` middleware) |
| `/mgmt/...` | Backoffice (`next-backoffice-web`) | `ManagementRouter` |
| `/internal/...` | Internal service-to-service | `InternalRouter` (identity-restricted) |
| `/v1/agent/...`, `/v1/support/...` | Halo BE | `halo-dash-be` only |

### Request headers (FE → BE)
- `Authorization: Bearer <JWT>` (token from localStorage `clientUserToken` in portal, `token` cookie via `crossDomainStorage` in halo)
- `Content-Type: application/json`
- `Cache-Control: no-cache`
- `X-Channel: PORTAL` (portal) / `dash-client-type: web` (halo) — channel tag
- `X-Api-Mode: live | sandbox` (portal, from localStorage `envMode`)
- `X-Client-Time-Zone: <IANA tz>` (set by `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- `X-Idempotency-Key: <uuid>` (halo, per request)
- `X-Session-ID: <id>` (portal, for delivery flow correlation)
- Source: `next-portal-v2-web/utils/axios.ts`, `halo-dash-fe/src/utils/axios.js`

### Response envelopes

**Success (nodejs-core-service)** — `{status, message, data, pagination?, retryAfter?}`:
```json
{
  "status": 200,
  "message": "OK",
  "data": { ... }
}
```
Or list with pagination:
```json
{
  "status": 200,
  "message": "OK",
  "data": [ ... ],
  "pagination": { "page": 1, "size": 10, "total": 100, ... }
}
```
Source: `nodejs-core-service/src/application/controllers/driver.js`, `constants/api.js`

**Success (halo-dash-be)** — `{status, message, data}` where `status` is a STRING ("Success" / "Error"):
```json
{ "status": "Success", "message": "OK", "data": { ... } }
```
Source: `halo-dash-be/src/application/controllers/support.js`

> **Inconsistency**: `nodejs-core-service` uses numeric HTTP status in `status` field; `halo-dash-be` uses string. The HTTP status code is set independently via `res.status(...)` in both. This is an inherited divergence to call out.

**Error envelope (nodejs-core-service)**:
```json
{
  "status": 400,
  "message": "Terjadi kesalahan pada isian",
  "errors": [ { "message": "...", "field": "..." } ],
  "retryAfter": 30
}
```
Source: `middlewares/errors/errorHandler.js` + `helpers/errors/httpError.js`. Default messages in Bahasa Indonesia from `constants/api.js`.

**Error envelope (halo-dash-be)**:
```json
{ "status": "Error", "message": "Thread not found", "data": null }
```

### Pagination
- Query params: `page` (1-based) + `size` (page size). Set on `req.pagination` by `middlewares.pagination.js`
- Optional sort via `middlewares.sorting.js`
- Backoffice payroll endpoints accept additional filters: `cutOffDate`, `providerOutletIDs`, `driverIDs`, `search`
- Cursor pagination NOT observed.

### HTTP method conventions
- `GET` — list / detail
- `POST` — create (`/v1/<resource>`), action verbs (`/v1/drivers/:id/activate`, `/v1/drivers/:id/blacklist`, `/v1/drivers/sync`, `/mgmt/v1/deliveries/:id/cancel`)
- `PATCH` — partial update (default for entity updates) — `PATCH /v1/drivers/:id`, `PATCH /v1/support/threads/:id`
- `PUT` — occasional (e.g., `/v1/drivers/preference/:driverID` in BO)
- `DELETE` — soft delete (sets `deleted_at`) — `/mgmt/v1/payroll/payment-schema/basic/rules/:providerId`

### Auth + identity
- JWT bearer, validated by `middlewares.authenticated`
- Identity type gate via `middlewares.identity.allowIdentities([IdentityType.WEB, IdentityType.INTERNAL_SERVICE, ...])` — enum in `constants/identityType.js`
- Role/admin gate via `middlewares.isAdmin`, `middlewares.rbac`
- Sandbox vs live via `X-Api-Mode` header

### Versioning
Path-based: `/v1/shifts`, `/v2/shifts`, `/v3/shifts` coexist. Newer FE migrates incrementally; legacy callers stay on v1.

## State management

### Portal (`next-portal-v2-web`)
- **Atomic state**: `jotai` (^2.12.5)
- **URL state**: `nuqs` (^2.4.3)
- **Data fetching**: plain `axios` calls inside `useEffect` + component-local `useState` loading flags. **No TanStack Query, no SWR.**
- **Forms**: native React state + helper validators in `utils/validation.ts` and `utils/phoneNumberHelpers.tsx`. **No react-hook-form, no zod.**
- **Auth context**: `hooks/AuthContext.tsx` exports `useAuth()` (provides `userData`, `clientData`, `refetchAuthData`)
- **Toast**: `sonner` (^1.7.0)
- **Feature flags**: `useFeatureFlag(name, type)` reading Firebase Remote Config
- **i18n**: `next-intl` (^4.8.3) with `useTranslations('namespace')`
- **Analytics**: Mixpanel (`utils/mixpanel/`) + Firebase Analytics
- **Tables**: `@tanstack/react-table` (^8.21.3) for data tables
- **UI primitives**: Radix + AlignUI styling via `tailwind-variants` and `tailwind-merge`

### Backoffice (`next-backoffice-web`)
- **Forms**: native React state, occasionally `react-datepicker` / `react-day-picker`
- **Data fetching**: `axios` (custom `apiService.js` wrapper) + component state — no TanStack Query
- **Auth**: `next-auth` (^4.24.6)
- **Toast**: `react-toastify` (^10.0.4)
- **UI**: heterogeneous — MUI (`@mui/material`) + antd + AlignUI components + Radix Toast/Tooltip
- **Tables**: `@tanstack/react-table` + `@tanstack/match-sorter-utils` + `react-paginate`
- **Maps**: `@vis.gl/react-google-maps` + `terra-draw` for polygon-shift workflows
- **Rich text**: `@ckeditor/ckeditor5-react`, `react-draft-wysiwyg`
- **Date**: mixed — `date-fns` + `moment` (legacy)

### Halo FE (`halo-dash-fe`)
- **Data fetching**: `axios` + `setInterval` polling (3000 ms, see `pages/support/index.js` `POLL_INTERVAL_MS`)
- **Service layer**: `class XxxService` with `static async` methods, all returning `response.data?.data ?? null/[]`
- **Auth**: `js-cookie` + custom `crossDomainStorage` (shares cookie with backoffice)
- **Toast**: `react-toastify` + `sonner`
- **No state library** — local `useState` only

### State colocation
- Predominantly per-page state. Cross-cutting concerns (auth, banners, notifications, env mode, delivery session) live in `hooks/` contexts.

## Validation patterns

**No zod usage observed in any FE repo.** Validation is hand-rolled.

### Portal (TS)
```ts
// utils/validation.ts
export const validatePassword = (value: string) => {
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain a number';
  return null;
};
```
Pattern: returns error string or `null`/`''` for valid.

### Phone (Indonesian)
```ts
// utils/phoneNumberHelpers.tsx
export const normalizePhoneNumber = (phoneNumber: string): string => {
  let normalizedPhone = phoneNumber.trim();
  if (normalizedPhone.startsWith('0')) normalizedPhone = '62' + normalizedPhone.slice(1);
  else if (!normalizedPhone.startsWith('62')) normalizedPhone = '62' + normalizedPhone;
  return normalizedPhone;
};

export const isValidMobileNumber = (input: string) => {
  const cleaned = input.replace(/\D/g, '');
  if (input.startsWith('8'))  return /^8[1-9][0-9]{7,}$/.test(cleaned);
  if (input.startsWith('62')) return /^62[1-9][0-9]{8,}$/.test(cleaned);
  return false;
};
```
Variants: `validatePhoneNumber` (allow `0`/`62`), `validateIndonesianPhoneNumber` (must start with `8`), `validateGlobalPhoneNumber` (7–15 digits), `validateMobilePhoneNumber` (must start `628`).

### Business name (portal signup)
`utils/validation.ts → validateBusinessName(value, fieldName)` — checks: required, length 3–200, ≥2 alphabetic letters, no symbols-only, no repeated-char ≥3, rejects keyboard-mash patterns (`asdf`, `qwerty`, `1234`...) and fake names (`test`, `demo`, `sample`, `xyz`...).

### BE (Express + `express-validator` + custom layer)
```js
// middlewares/validator/driver.js
const driver = {
  updateDriverPassword: applyValidations([
    required(['password', 'confirm_password']),
    validate.password('password'),
    validate.confirmPassword('password', 'confirm_password'),
  ]),
  activateDriver: applyValidations([
    required(['is_active']),
    validate.boolean('is_active'),
  ]),
};
```
Helpers: `helpers/validator.js` (`applyValidations`, `validate.boolean/number/text/password/confirmPassword`) + `middlewares/errors/requiredHandler.js`. Error messages in Bahasa Indonesia (from `constants/api.js`).

### Validation language
- Portal: **English** in `utils/validation.ts`, `utils/phoneNumberHelpers.tsx`
- BE constants: **Bahasa Indonesia** in `constants/api.js` (`"Tidak punya akses"`, `"Halaman tidak ditemukan"`, `"Format nomor tidak valid"`)
- Driver-onboarding labels: **Bahasa Indonesia** (`"Verifikasi Tahap 1"`, `"Lolos Tahap 2"`)
- Halo chat copy: **Bahasa Indonesia, casual** (`"Halo lagi bantu kamu"`, `"Tim Dash lagi tangani — biasanya ditanggepin dalam 30 menit"`) — note: contradicts the formal-functional rule in MEMORY for driver-app voice; halo is mitra-facing chat, distinct context.

## File structure conventions

### Portal — App Router, locale group
```
app/
  [locale]/
    (auth)/          # auth route group
      signin/  signup/  reset-password/  verification/  accept-invitation/
    (dashboard)/     # authenticated route group
      page.tsx
      layout.tsx
      deliveries/
        page.tsx
        [slug]/page.tsx
        components/        # route-scoped components
        context/           # route-scoped context (DeliveryNotificationContext)
      outlets/  users/  billing/  addresses/  integration/  policies/  setting/  simulation/
  api/fcm/...        # Next API routes for FCM proxy

components/
  ui/                # AlignUI primitives (button.tsx, dialog.tsx, input.tsx, ...) — compound exports (`Button.Root`, `Button.Icon`)
  badge/  banner/  filter/  header/  modal/  notification/  pagination/  picker/  sidebar/  table/  map/  ...

hooks/               # all hooks at root (mix kebab + camel filenames)
infrastructure/api/  # API clients per domain (auth/, client/, delivery/, driver/, location/, simulation/, user/)
infrastructure/firestore/
enums/               # *.ts string-union constants ("as const")
types/               # *.ts type declarations
utils/               # cross-cutting helpers (axios, analytics, validation, ...)
lib/                 # firebase.ts, firebase-admin.ts, mixpanelInitializer.tsx
messages/            # next-intl message bundles
i18n/                # next-intl config
middleware.ts        # Next middleware (auth gating)
```
- Path alias `@/` → root
- `'use client'` for client components; default-export pages, named-export hooks (per AGENTS.md)
- Compound component pattern: `<Button.Root><Button.Icon /></Button.Root>`

### Backoffice — Pages Router
```
src/
  pages/
    _app.js  _document.js  index.js  signin.js
    driver/  delivery/  applicant/  outlets/  payroll/  pitstop/  shift/
    project/  provider/  return/  setting/  client-sync/  cod/  control-tower/  heatmap-2/  inbound/  broadcast/  driver-payment-schema/  attendance/
    <route>/[slug]/   # detail pages
    <route>/components/  # route-scoped components
    api/              # Pages-router API routes
  components/  hooks/  contexts/  enums/  lib/  services/  styles/  utils/
  __tests__/
scripts/  # generateMockData.js, inject-firebase-config.js
```

### Halo FE — Pages Router (small)
```
src/
  pages/
    _app.js  _document.js  index.js  login.js
    support/index.js     support/[threadId].js     # mitra chat
    backoffice/support/                            # ops dashboard
  components/
    support/  backoffice/
  services/agentService.js  authService.js  supportService.js
  utils/axios.js  cookieStorage.js
  enums/  hooks/  contexts/  styles/
```

### BE (both `nodejs-core-service` and `halo-dash-be`)
Layered architecture:
```
src/
  application/
    routes/          # Express routers per resource (driver.js, shift.v3.js, ...)
    controllers/     # request handlers (thin)
    services/        # business logic
    repositories/    # Prisma calls (file names snake_case: driver.js, customer_address.js)
    middlewares/     # authenticated, isAdmin, pagination, sorting, rbac, identity, errors/, validator/
    helpers/         # logger, jwt, parse, uuid, errors/, validator, geohash, ...
    constants/       # api.js (code+message), payment.js, deliveryStatus.js, identityType.js, ...
    lib/             # external clients (Xendit, GCS, Pub/Sub wrappers)
    schedulers/      # node-cron jobs (nodejs-core only)
  config/            # env.js, db.js, firebase.js, pubsub.js, storage.js
  prisma/
    schema.prisma   migrations/   seed.js   seeds/
  instrumentation.js  # OpenTelemetry init
server.js
```
- Path: relative requires (`require('../helpers')`)
- Test: Node 24 native test runner (new), legacy Jest in `/test/`

## Intent → File + Components map (10 samples)

| User intent | Target file | Key UI primitives | Custom components | Hooks / state |
|---|---|---|---|---|
| Build delivery list (portal) | `app/[locale]/(dashboard)/deliveries/page.tsx` | `@dash/widget-box`, `@dash/dropdown`, `@dash/button`, `@dash/pagination/TablePagination`, banner | `DeliveryTable`, `DeliveryCardList`, `DeliveryFilter`, `DeliveryTableColumns`, `DeliveryNotificationBell`, `SandboxDeliveryTable`, shimmer skeletons | `useAuth`, `useEnvMode`, `useNotification`, `useFeatureFlag`, `useTimeTracking`, `useTabActive`; data via `getAllDeliveries(...)` from `infrastructure/api/delivery/delivery.ts` |
| Open delivery detail | `app/[locale]/(dashboard)/deliveries/[slug]/page.tsx` | dialog, badge, map | timeline component (route-scoped), `ChatWindow` | `useAuth`, axios call to `/client-user/v1/deliveries/:id` |
| Create manual single delivery (portal) | `deliveries/components/CreateManualDeliveryModal.tsx` | `@dash/dialog`, input, button | `OriginModal`, `DestinationModal`, `AddressFormContent`, `ReviewDeliveryModalV2`, `MultiStopOptionCard` | quote via `getQuote(MultiStopQuoteRequest)`; checkout via `/client-user/v2/quotes/calculate` then `/client-user/...checkout` (POST) |
| Build outlet list (portal) | `app/[locale]/(dashboard)/outlets/page.tsx` | `@dash/data-table`, badge, input | `OutletTable`, `OutletCardList`, `OutletFilter`, `OutletDetailModal`, `OutletDetailModalSkeleton`, `CreateOutletModal`, `EditOutletModal`, `ConfirmDeleteOutletModal` | axios to `/client-user/v1/...` |
| Build users (portal staff) list | `app/[locale]/(dashboard)/users/page.tsx` | data-table, button, dropdown | `UserTable`, `UserTableColumns`, `UserFilter`, `UserCardList`, `UserDetailModal`, `CreateUserModal`, `EditUserModal`, `ConfirmAddUserModal`, `ConfirmResendInvitationModal` | role filter via `userRole` enum |
| Driver list (backoffice) | `src/pages/driver/index.js` | TanStack table, MUI components, `@dash/badge` | `pages/driver/components/*` | axios to `/v1/drivers?page=&size=&search=&active=`; `pagination` middleware on BE |
| Driver detail / payroll detail (BO) | `src/pages/driver/[slug]/index.js` + `pages/payroll/components/*` | tabs, breadcrumb | route-scoped components | `getDriverDetailEarnings(driverID, cutOffDate)`, `getDetailPaymentRequest(driverID)` from `payrollApiService.js` |
| Cancel delivery (BO action) | UI in `pages/delivery/*` calls `cancelDelivery(deliveryID, data)` from `services/deliveryService.js` | modal + confirm | `pages/delivery/components/...CancelModal.jsx` | `POST /mgmt/v1/deliveries/:id/cancel` |
| Mitra support chat (Halo FE) | `src/pages/support/index.js` | AlignUI shells | `ChatEntryHero`, `ChatComposer`, `MessageBubble`, `AwaitConfirmationChips`, `SuggestedChipsRow`, `TopicShiftDivider` | `AgentService.getActiveThread(mitraId)` polled every 3 s, `sendActiveThreadMessage(mitraId, content)` |
| Ops support inbox (Halo FE backoffice) | `src/pages/backoffice/support/...` | `SupportLayout`, `CategoryBar`, `KpiCard`, `StatusDonut`, `WindowSelector` | (above) | `SupportService.listThreads({status, category, claimed_by})`, `patchThread(id, patch)` |

## Anti-patterns observed in current code

(These describe what AI assistants should NOT mimic on new code, regardless of any need to maintain consistency in legacy files.)

- **Token handling**: every portal API function repeats `localStorage.getItem('clientUserToken')` and sets `axios.defaults.headers.common['Authorization']`. The axios interceptor already does this — the per-call block is redundant and overwrites global default state on each request. Use the interceptor only.
- **Nested try/catch**: portal API functions wrap one try-catch around another that just re-throws (`infrastructure/api/delivery/delivery.ts`). Single try-catch suffices.
- **Two `axios` import paths in the same file** (`import ApiService from '@/utils/axios'; import axios from '@/utils/axios'`) — same module imported twice with different aliases.
- **Typo in canonical type filename**: `next-portal-v2-web/types/DelliveryTypes.ts` (should be `DeliveryTypes.ts`). Imports across the app reference the typo path — renaming is a coordinated change.
- **`response.data` vs `response.data.data` unwrap is inconsistent**: portal returns raw axios `response.data` (envelope intact); halo `SupportService` returns `response.data?.data ?? null/[]`; backoffice `payrollApiService.js` mixes both `response.data` and `response.data.data`. Pick one per surface.
- **Two success-envelope shapes**: numeric `status` in core (`{status: 200, ...}`) vs string `status` in halo (`{status: 'Success', ...}`). On any new endpoint in halo (which will fold into core), prefer the numeric shape.
- **Date library churn**: backoffice has both `moment` and `date-fns` + `react-day-picker` + `react-datepicker` + `tailwind-datepicker-react`. Standardize on `date-fns`.
- **UI primitive heterogeneity in backoffice**: MUI + antd + AlignUI + Radix in one app. New components should pick the AlignUI primitives (`components/ui/*`) to align with portal + halo.
- **Hook filename casing mixed**: `useBanners.ts` vs `use-notification.ts` vs `useTabActive.ts` in the same `hooks/` directory.
- **Inline magic strings for status comparisons** (`'awaiting_confirmation'`, `'ai_active'`, `'closed'`) instead of importing the enum object from `enums/` or `constants/`.
- **`localStorage.clear()`** on logout (portal `axios.ts`) wipes non-auth keys (FCM, env mode, recently-used addresses) — should clear only an explicit allowlist.
- **`'use client'`** at module top of pure server components and vice-versa — verify per component (App Router only; portal).
- **No `zod` / no `react-hook-form`**: hand-rolled string-returning validators repeat themselves and lack type inference. Treat as legacy.
- **No `@tanstack/react-query`**: every list page has its own `useState/useEffect/setLoading` boilerplate plus manual refetch on filter change. New code can introduce TanStack Query without breaking existing pages.
- **Multiple secret patterns on `m_provider`**: `client_secret`/`client_key` (deprecated comment in schema) + `auth_key`/`auth_value` + sandbox variants + `ProviderAPIKey` (the new home). Reads must consult the canonical table.

## Coverage gaps

- **Delivery domain depth**: the `Delivery` entity lives outside `nodejs-core-service/schema.prisma`. The FE types (`DeliveryDetailResponse`, `DeliveryTimeline`) imply a separate delivery service / monolith we did not inspect. Future iteration should locate that service or its OpenAPI doc.
- **i18n message catalog**: `next-portal-v2-web/messages/*` not read — full UI string inventory (delivery / outlet / user / billing key namespaces) deferred.
- **Mixpanel event taxonomy**: `enums/*Analytics.ts` files exist (`deliveryAnalytics.ts`, `bannerAnalytics.ts`, `loginAnalytics.ts`, etc.) — not enumerated here.
- **Backoffice page inventory**: only top-level page directories scanned; per-page components + filters not traced.
- **RBAC model**: `Role`, `Permission`, `UserRole` tables noted but the actual role names + permission strings used by `middlewares/rbac.js` not enumerated.
- **Driver mobile API surface**: `/driver/*` route tree (`BaseDriverRouter`) not opened in detail.
- **Customer mobile API surface**: `/customer/*` tree partially extracted (Customer, CustomerAddress, CustomerIdentity, CustomerVerification models read) but endpoint inventory not traced.
- **Service categories vs service types**: enumerated `EXPRESS`/`LOGISTIC` and `INSTANT`/`SAME_DAY`/`NEXT_DAY`; the canonical join in `m_service.category + type` exists but full matrix not extracted.
- **Pricing logic**: `provider_pricing`, `ProviderPricingDistance`, `ProviderPricingWeight`, `ProviderPricingAdditionalFee` shapes captured but the actual computation flow (FLAT vs LINEAR, ADDED vs MULTIPLIED) not traced through services.
- **Webhook payload schemas**: `provider_webhooks` + `webhook_events` exist but per-event JSON shapes (e.g., what fields go on `DELIVERY_COMPLETED`) not extracted.
- **Halo AI orchestration**: Gemini call surface, prompt templates, KB retrieval algorithm not inspected.
- **Cron schedules**: `t_cron_schedules` table mentioned, `cron_type` enum exists; specific job catalog not enumerated.
- **Polygon-shift / `terra-draw` workflow in BO**: only dependency presence noted; usage flow uninspected.
- **Cross-domain cookie storage**: `halo-dash-fe/src/utils/cookieStorage.js` referenced but not opened.

---

# Appendix B — ts-delivery-service (Delivery domain, Phase 1.7A — 2026-05-20)

> Source: `/Users/irfanprimaputra.b/dash/ts-delivery-service-main`. AGENTS.md 378L + README.md 56L + .claude/CLAUDE.md + prisma/schema.prisma 672L + src/infrastructure/api/routes/route.ts 2,334L + state machine 264L + control-tower 711L + responseHelper / error-middleware / app-error / jwt / 30+ enum constants.
> Closes Phase 1.5 gap: Delivery entity now documented from source (it lives in this service, **not** in nodejs-core-service).

## B.1 — Service identity

- **Package:** `svc-dash-electric-delivery-ts`
- **Stack:** Node.js 20.20.0 · TypeScript 5.5.4 strict (ES2016) · Express 4.19.2 · **Prisma 5.22.0** (correction: ts-delivery uses Prisma, not Drizzle) · PostgreSQL
- **Architecture:** Layered DDD (Clean/Onion variant — domain + facade + usecase + infrastructure). Plain Express + hand-wired DI. NOT NestJS.
- **Runtime roles via `ROLE` env:** `app` (HTTP only), `worker` (Pub/Sub only), `dev` (both). Same image, different entrypoint.
- **Cloud infra:** Cloud Run (primary). Google Pub/Sub (6 topics), Cloud Tasks (5 queues), Cloud Storage, Cloud Logging, Cloud Profiler. **No OTel detected** — uses Winston structured logs + `wideEventMiddleware`.
- **Auth:** JWT via `Authorization: Bearer <token>` parsed by `authMiddleware` → `req.claims.identity`. Static token fallback for `INTERNAL_SERVICE` (`AGENT_STATIC_TOKEN` env).
- **Validation:** **Joi 17.13 with Bahasa Indonesia error messages baked in** (e.g. `'Field \`providerOrderID\` wajib diisi'`).
- 40+ Prisma models, 138 migrations.

## B.2 — Code style mandate (different from rest of Dash BE)

| Rule | Value |
|---|---|
| Indentation | **Tabs** (not spaces) |
| Semicolons | **None** |
| Quotes | Single |
| Trailing commas | ES5 |
| Line width | 80 chars |
| Import order | **Auto-sorted by `@trivago/prettier-plugin-sort-imports`** — do NOT hand-reorder |
| Error throwing | **`AppError(message, HttpStatus.X)` mandatory** — raw `Error` becomes HTTP 500 |
| Response shape | **`createResponse(res, statusCode, message, data, pagination?, errors?)` mandatory** — direct `res.status().json()` banned |

Test format is **Go-style table-driven**:

```ts
const testCases: TestCase[] = [ /* rows */ ]
testCases.forEach((tc) => it(tc.name, () => { /* one test body */ }))
```

Adding a new `it(...)` per scenario is treated as a code-style violation in review.

Two test layers, separated by directory:
- `**/test/**` — unit, mocked deps, `node --test`.
- `**/integration/**` — Testcontainers Postgres + real Prisma.
- **80% line coverage required.**

## B.3 — Domain entities

### Delivery (`t_deliveries`) — canonical schema
- **PK:** `id BigInt @autoincrement` · **Public key:** `uid String @unique @db.VarChar(64)`
- **Identity:** `provider_id`, `provider_outlet_id?`, `provider_order_id?`, `customer_id?` (Uuid), `driver_id?` (BigInt), `shift_id?` (Int)
- **Classification:** `service_type` (VarChar 32), `service_category` (default `'EXPRESS'`; values `EXPRESS | LOGISTIC | FLEET+ | FLEX`), `status` (Text — see B.4 state machine), `payment_method` (`INVOICING | QRIS | CASHLESS | CASH`), `channel?`, `revenue_stream?`
- **Sandbox/live:** `is_sandbox Boolean @default(false)` — resolved by `addMode({source: 'token' | 'header'})`
- **Scheduling:** `pickup_time_from`, `pickup_time_to`, `max_allocation_at`, `max_pickup_at`, `max_completion_at`
- **SLA tracking:** `pickup_time_at`, `complete_time_at`, `priority_pickup_at`, `priority_completion_at`, `pickup_sla_status`, `complete_sla_status`, `pickup_delay_minutes`, `complete_delay_minutes`
- **COD:** `cod_amount Decimal(10,2)?`, `cod_payment_method?` (`CASH | TRANSFER`), `is_cod_paid?`, `cod_confirmed_at?`, `cod_confirmed_by?`
- **Driver economics:** `driver_delivery_fee Decimal(10,2)?`, `use_express_rider?`, `use_freelance_rider?`
- **Other:** `distance_in_meter`, `invoice_number?`, `metadata Json?` (typed as `DeliveryMetadata`), `session_id?`, `group_uuid?` (Uuid — server-minted when `isGroupOrder=true && trips.length > 1`, immutable), `quote_uuid?` (Uuid FK → Quote)
- **Audit:** `created_at`, `created_by` (default `'SYSTEM'`), `updated_at @updatedAt`, `updated_by`
- **Relations:** `contact: Contact?`, `address: Address?`, `packages: Package[]`, `timelines: Timeline[]`, `allocations: Allocation[]`, `instructions: Instruction[]`, `media: Media[]`, `trackingToken: TrackingToken?`, `signatures: Signature[]`, `allocationLogs: AllocationLog[]`, `routes: Route[]`, `quote: Quote?`, `Order: Order?`, `policies: DeliveryPolicy[]`, `tips: DeliveryTip[]`
- **Indexes:** by `driver_id`, `status`, `updated_at`, `(driver_id, status, updated_at)`, `(uid, status, is_sandbox)`, `(driver_id, status, is_cod_paid, is_sandbox)`, `(group_uuid, status)`

### Sibling entities (summary — see source for full field detail)
- **Quote** (`t_quotes`): write-once, `uuid` v7 unique, `amount/discount_amount/final_amount` Decimals, ETAs, `metadata Json?` (`QuoteMetadata`). Cancelled via `/internal/v1/quotes/:quoteUUID/cancel`.
- **Package** (`t_packages`): per-delivery items, `name/quantity/price/weight`, dimensions, `metadata Json?` (`PackageMetadata`), insurance triple (`insurance_provider?` = `DASH | CLIENT`, `insurance_premi?`, `insurance_coverage?`).
- **Timeline** (`t_timelines`): status-history log. `delivery_id`, `driver_id?`, `status`, `notes?`, `reason_code?`, `media_id?` (legacy 1:1), `metadata Json?` (`DeliveryTimelineMetadata`). New POD images via `TimelineMedia` join table.
- **Contact** (`t_contacts`): sender + recipient + **return recipient** + **return-hub recipient** quads (first/last/company/phone/email). `actual_recipient_name?`.
- **Address** (`t_addresses`): **four address triples** — origin / destination / return / return_hub. Origin nullable, **destination lat/lng required**. Indexed by `geo_hash`.
- **Allocation** (`t_allocations`): driver-assignment attempts. `next_reallocate_at?` drives per-allocation Cloud Task at `/internal/v1/deliveries/:deliveryUID/reallocate-check`.
- **Route** (`t_routes`): segments per delivery. `segment_type RouteSegmentType` = `PICKUP | DESTINATION | RETURN | RETURN_HUB`. `traffic_condition`, `weather_condition`, `provider` (`GOOGLE | MAPBOX`), `polyline_precision` (5=Google, 6=Mapbox).
- **Order** (`t_orders`): provider-order grouping. `OrderStatus = CREATED | IN_DELIVERY | COMPLETED | CANCELLED | FAILED`.
- **TrackingToken** (`tracking_tokens`): 1:1 with delivery. Powers public `GET /v1/deliveries/track/:trackingToken` (no auth, timezone middleware only).
- **Signature** (`t_signatures`): per-delivery e-signatures. `type` = `SENDER | DELIVERY_PARTNER | RECIPIENT`. Base64 text.
- **DeliveryPolicy** (`t_delivery_policies`): per-delivery enforcement rules. `policy_type` examples: `ONE_TIME_CODE | TIME | LOCATION`. (Note: when `policy_type = ONE_TIME_CODE`, `value` references a code minted in core-service's `policy_one_time_codes` — see "OneTimeCode" entity above. The actual code row lives in core, not in ts-delivery.)
- **COD aggregates** (`agg_driver_deliveries_cod`, `driver_cod_confirmation_histories`): running totals per driver + immutable confirmation history.
- **Logging models:** `AllocationLog`, `DriverAvailabilityLog` (v2.0.0), `DriverFilterLog`, `quote_request_logs`, `UploadDeliveriesBulkLog`.

## B.4 — Delivery status state machine (canonical, 26 statuses)

Source: `src/app/state-machine/delivery.state-machine.ts` + `src/constants/delivery-status.ts`.

### All status values

```
PENDING_PAYMENT, QUEUEING, ALLOCATING,
PENDING_PICKING_UP, PENDING_PICKUP, ARRIVED_AT_PICKUP_POINT (SHADOW),
PICKING_UP, PENDING_DELIVERY, IN_DELIVERY,
ARRIVED_AT_DESTINATION (SHADOW),
COMPLETED, CANCELLED, FAILED,
PREPARING, VERIFIED, NOT_VERIFIED,
PENDING_RETURN, IN_RETURN, ARRIVED_AT_RETURN_POINT (SHADOW),
FAILED_IN_RETURN, RETURN_TO_HUB (SHADOW), ARRIVED_AT_HUB (SHADOW),
ON_HOLD, RETURNED, DISPOSED, EXPIRED
```

"SHADOW STATUS" = set automatically by driver-location events; not directly POSTed by clients.

### EXPRESS happy path

`PENDING_PAYMENT → QUEUEING → ALLOCATING → PENDING_PICKUP → PICKING_UP → ARRIVED_AT_PICKUP_POINT → PENDING_DELIVERY → IN_DELIVERY → ARRIVED_AT_DESTINATION → COMPLETED`

Branches: `→ FAILED`, `→ CANCELLED`. From `FAILED`: `→ PENDING_RETURN → IN_RETURN → ARRIVED_AT_RETURN_POINT → RETURNED` (or `→ FAILED_IN_RETURN → RETURN_TO_HUB → ARRIVED_AT_HUB → ON_HOLD → {DISPOSED | RETURNED | PENDING_RETURN}`). Reassignment loop: many statuses can transition back to `PENDING_PICKUP`. Final states (no outbound): `COMPLETED, DISPOSED, RETURNED, CANCELLED, EXPIRED`.

### LOGISTIC happy path

`PENDING_PAYMENT → QUEUEING → PREPARING → {NOT_VERIFIED | VERIFIED} → VERIFIED → PENDING_DELIVERY → {IN_DELIVERY | PENDING_PICKUP} → IN_DELIVERY → ARRIVED_AT_DESTINATION → COMPLETED`

LOGISTIC has its own `PENDING_PICKING_UP` reassignment status. EXPRESS-only statuses (`ALLOCATING`, `PICKING_UP`, `ARRIVED_AT_PICKUP_POINT`) map to `[]` in the LOGISTIC table, and vice versa.

### Usage (per `.claude/CLAUDE.md`)

```ts
const sm = new DeliveryStatusStateMachine(ServiceCategory.EXPRESS, currentStatus)
if (!sm.canTransitionTo(newStatus)) throw new AppError('Invalid transition', 400)
```

Static helpers: `DeliveryStatusStateMachine.canTransition`, `.isFinal`, `.getAllowedTransitions`, `.hasStateMachine`.

`ServiceCategory.FLEET` (`'FLEET+'`) and `FLEX` exist but have **no state-machine entries** — code path uses `hasStateMachine()` to skip transition validation.

Initial state: EXPRESS scheduled → `QUEUEING`; EXPRESS non-scheduled → `ALLOCATING`; LOGISTIC → `PREPARING`.

## B.5 — API surface

`deliveryRouter` is the sole exported Express router — paths are absolute (no `/api` prefix).

### Subrouter mount points

| Mount | Identity types | Notes |
|---|---|---|
| (root) `/v1/deliveries/...` | `WEB`, `PROVIDER_H2H`, `PROVIDER_USER` | Provider H2H create + admin web + bulk |
| `/express` → `/express/v1/deliveries` | `PROVIDER_H2H` | New-shape Express create |
| `/client-user` → `/client-user/v1/...`, `/client-user/v2/...` | `PROVIDER_USER`, `CLIENT_USER` | Portal |
| `/customer` → `/customer/v1/deliveries/...` | `CUSTOMER` | End-consumer app |
| `/driver` → `/driver/v1/deliveries/...` | `DRIVER` | Driver mobile app |
| `/mgmt` → `/mgmt/v1/...` | `WEB` only | Dash backoffice |
| `/internal` → `/internal/v1/...` | `INTERNAL_SERVICE` | Cron + Cloud Tasks + other Dash services |
| `/internal/aggregator` | `PROVIDER_H2H` (via `internalUsecaseMiddleware`) | Aggregator partners |

### Top endpoints (sample — full list spans route.ts L1361-2334)

| Method | Path | Identity | Use case |
|---|---|---|---|
| GET | `/` | (none) | Health |
| GET | `/v1/docs` | (none) | Swagger |
| POST | `/v1/deliveries` | PROVIDER_H2H | Create (live/sandbox auto-routed) |
| GET | `/v1/deliveries` | WEB, PROVIDER_USER | List (paginated) |
| PATCH | `/v1/deliveries/bulk` | INTERNAL_SERVICE, WEB | Bulk status update |
| POST | `/v1/deliveries/heatmap` | WEB | Heatmap data |
| POST | `/v1/deliveries/quotes` | PROVIDER_H2H | Quote calc |
| GET | `/v1/deliveries/track/:trackingToken` | (none, token gated) | Public tracking |
| GET | `/v1/deliveries/exp/control-tower` | WEB | Control Tower dashboard |
| GET | `/v1/deliveries/:deliveryUID` | (per identity) | Get one |
| POST | `/v1/deliveries/:deliveryUID/status` | (admin) | Update status |
| POST | `/v1/deliveries/:deliveryUID/status/sequence` | (admin) | Sequential update |
| POST | `/v1/deliveries/:deliveryUID/allocate` | (admin) | Force re-allocation |
| POST | `/express/v1/deliveries` | PROVIDER_H2H | New Express create |
| POST | `/client-user/v2/deliveries` | PROVIDER_USER, CLIENT_USER | Portal create (V2) |
| GET | `/client-user/v1/deliveries` | PROVIDER_USER, CLIENT_USER | Portal list |
| POST | `/client-user/v1/deliveries/:deliveryUID/cancel` | PROVIDER_USER, CLIENT_USER | Portal cancel |
| POST | `/client-user/v2/quotes/calculate` | PROVIDER_USER, CLIENT_USER | Portal quote (V2) |
| POST | `/customer/v1/deliveries` | CUSTOMER | Customer create |
| GET | `/driver/v1/deliveries/dashboard` | DRIVER | Driver's open deliveries |
| POST | `/driver/v1/deliveries/:deliveryUID/confirm-cash-advance` | DRIVER | Confirm cash advance |
| GET | `/mgmt/v1/deliveries` | WEB | Backoffice list |
| POST | `/mgmt/v1/deliveries/:deliveryUID/cancel` | WEB | Backoffice cancel |
| GET | `/mgmt/v1/deliveries/on-hold` | WEB | On-hold (return ops) |
| GET | `/mgmt/v1/cash-on-deliveries` | WEB | COD list |
| POST | `/internal/v1/deliveries/:deliveryUID/reallocate-check` | INTERNAL_SERVICE | Cloud Task |
| POST | `/internal/v1/cron/auto-reallocate-stuck` | INTERNAL_SERVICE | Cron |
| POST | `/internal/v1/control-tower/track-bucket-transitions` | INTERNAL_SERVICE | Bucket emitter |

## B.6 — Webhook namespace (CRITICAL)

This service does NOT publish `delivery.created` / `delivery.dispatched` / `delivery.completed` events outbound to providers. Outbound provider webhooks use **`provider_order.*` vocabulary**:

```ts
export enum WebhookEvent {
  PROVIDER_ORDER_CREATED     = 'provider_order.created',
  PROVIDER_ORDER_IN_PROGRESS = 'provider_order.in_progress',
  PROVIDER_ORDER_COMPLETED   = 'provider_order.completed',
  PROVIDER_ORDER_CANCELLED   = 'provider_order.cancelled',
  PROVIDER_ORDER_FAILED      = 'provider_order.failed',
}
```

Records stored in `webhook_events` (status `PENDING | SENT | FAILED`, methods `GET | POST | PUT | DELETE`). Dispatched via `PROVIDER_WEBHOOK_QUEUE` (Cloud Tasks). Inbound provider webhooks land at `/v1/deliveries/provider/orders/:providerOrderID/event/{create|update}`.

**Internal Pub/Sub topics (cross-service async — DIFFERENT namespace):**

| Topic | Default name | Producers / consumers |
|---|---|---|
| `TOPIC_DELIVERY_CREATED` | `delivery-created` | 6 subscribers (shipping doc, metadata, control-tower, routes calc, notify, SLA) |
| `TOPIC_DELIVERY_STATUS_UPDATED` | `delivery-status-updated` | 8 subscribers (metadata, docs, notify, tracking, cancel-transaction) |
| `TOPIC_DELIVERY_MEDIA_CREATED` | `delivery-media-created` | POD overlay |
| `TOPIC_INVOICE_PAYMENT_CAPTURE` | `invoice_payment.capture` | COD subscriber |
| `TOPIC_DELIVERY_REPORT_REQUESTED` | `delivery-report-requested` | Async report gen |
| `TOPIC_DELIVERY_ALLOCATED` | `delivery-allocated` | Notify / metadata |

Plus `driver-availability-logged` (CLAUDE.md).

## B.7 — Response envelope (string status — DIFFERENT from core/express)

Source: `src/utils/responseHelper.ts` + `src/infrastructure/api/middlewares/error-middleware.ts`.

### Success (statusCode < 400)
```json
{
  "status": "Success",
  "message": "<from src/constants/message.ts>",
  "data": { /* domain payload */ },
  "pagination": { /* list endpoints only */ },
  "requestId": "<uuid>",
  "meta": { "requestID": "<uuid>", "timestamp": "<ISO 8601>" }
}
```

### Error
```json
{
  "status": "Failed",
  "error": "<human message>",
  "errorCode": "<only when req.isInternalUsecase is true>",
  "errors": [ /* optional Joi/AppError details */ ],
  "requestId": "<uuid>"
}
```

**Differences vs core/express:**
- Top-level `status` is **string `"Success" | "Failed"`**, not numeric.
- Error envelope uses key **`error`** (single, message) + **`errors`** (plural, structured detail).
- `errorCode` (e.g. `EB1008`) only when caller comes via `internalUsecaseMiddleware`.
- `requestId` at top level AND inside `meta` (success only). FE should prefer top-level.
- One legacy place uses `message` instead of `error` (the `identityMiddleware` forbidden response — `{status: 'Failed', message: 'Forbidden'}`) — FE should accept either.

## B.8 — Validation (Bahasa Indonesia mandatory)

- **Library:** Joi 17.13. Schemas in `src/app/validations/*.ts`.
- **Error messages in Bahasa Indonesia, baked into schemas.** Examples: `'Field \`providerOrderID\` wajib diisi'`, `'Field \`paymentMethod\` harus berisi INVOICING, QRIS, CASHLESS, atau CASH'`.
- **FE surface as-is — DO NOT translate.** Text is already user-facing localized.
- Validation runs inside `validateRequest(req)` (abstract on `BaseUseCase`). On failure: `next(new AppError(message, HttpStatus.ClientError.BAD_REQUEST))`.
- Sample `create-delivery-validation.ts`:
  - Required: `providerOrderID` (string), `serviceCategory` (enum `EXPRESS | LOGISTIC`), `serviceType` (string), `packages[]` (each `name` max 500, `quantity`, `price`).
  - Optional: `providerOutletID`, `paymentMethod` (`INVOICING | QRIS | CASHLESS | CASH`), `cashOnDelivery: { amount }`, `instructions[]` (text + url + type), insurance fields.

## B.9 — Auth + identity types

```ts
enum IdentityType {
  WEB              = 'WEB',              // ID prefix: IU-  (backoffice user)
  CUSTOMER         = 'CUSTOMER',         // ID prefix: CS-  (end consumer)
  DRIVER           = 'DRIVER',
  INTERNAL_SERVICE = 'INTERNAL-SERVICE', // dash, not underscore on wire
  PROVIDER_H2H     = 'PROVIDER-H2H',     // ID prefix: CH-  (API customer)
  PROVIDER_USER    = 'PROVIDER-USER',    // ID prefix: CU-  (portal user)
  CLIENT_USER      = 'CLIENT-USER',
}
```

**Sandbox vs live:** resolved by `addMode({source: 'token' | 'header', allowedModes: ['live', 'sandbox']})`. Result lands at `req.mode`. Controllers branch (e.g. `if (req.mode === apiMode.sandbox) return createSandboxDeliveryController.handle(...)`).

## B.10 — Dispatch flow

```
CLIENT_USER (portal) or PROVIDER_H2H (API)
  → POST /client-user/v2/deliveries  OR  POST /v1/deliveries
    → authMiddleware → identityMiddleware → addMode → timezoneMiddleware
    → wideEventMiddleware('delivery.create.request')
    → CreateDelivery(Controller|UseCase).handle
      → validateRequest() — Joi schema (Bahasa errors)
      → ClientUserBaseUseCase / facade orchestration
      → DeliveryService.create() — Prisma transaction:
          inserts t_deliveries (status=QUEUEING or ALLOCATING per SM),
          t_addresses, t_contacts, t_packages[], t_instructions[],
          links/creates t_quotes (uuid), creates tracking_tokens row
      → publish `delivery-created` Pub/Sub (full payload, messageOrdering=true)
      → createResponse(res, 201, Message.DATA.CREATE_SUCCESS, {data...})

ASYNC (ROLE=worker):
  delivery-created → 6 subscribers
    - generateShippingDocSubscriber → PDF + GCS
    - createMetadataSubscriber → enrich Delivery.metadata
    - deliveryControlTowerSubscriber → ControlTowerService.storeDeliveryDeadline (Redis)
    - calculateRouteOnDeliveryCreatedSubscriber → Google/Mapbox → t_routes rows
    - (notify, SLA bucket init, etc.)

ALLOCATION (Cloud Tasks):
  ALLOCATION_QUEUE_INSTANT (or _SAME_DAY for 2min delay)
    → CreateAllocationUseCase / V2 (feature flag ENABLE_ALLOCATION_V2)
    → Driver eligibility pipeline (src/app/facade/driver-eligibility/strategy/)
      — logs DriverAvailabilityLog + per-driver DriverFilterLog rows
    → POST allocation via FCM / WhatsApp (Qiscus)
    → On accept: Allocation.status=SUCCESS, Delivery.driver_id set, status → PENDING_PICKUP

STATUS UPDATES (driver app):
  /driver/v1/... or internal flows update via deliveryService.updateStatus
    → DeliveryStatusStateMachine.canTransitionTo() guard (AppError if invalid)
    → Prisma transaction: update t_deliveries.status, append t_timelines row
    → publish `delivery-status-updated` Pub/Sub (8 subscribers fan-out)

TERMINAL:
  status → CANCELLED, or FAILED + reasonCode=EB1008 + payment_method=QRIS
    → CancelDeliveryTransactionWorkerSubscriber
    → POST /internal/v1/transactions/quote/{quote_uuid}/cancel on ts-core-service
    → Core service detects PAID QRIS → Xendit refund (idempotent guard)
```

## B.11 — Control Tower

- **Path:** `src/app/domain/control-tower/control-tower-service.ts` (711L)
- **Purpose:** Real-time SLA monitoring; classify each active delivery into a bucket by time-to-deadline; store in Redis (`control-tower:deliveries` hash); emit Pub/Sub bucket-transition events.
- **Buckets:** `ON_TRACK | MEDIUM_RISK | NEED_ATTENTION_NOW | BREACH`. Thresholds in `src/constants/control-tower.ts`.
- **Deadline logic:** `status === 'ALLOCATING'` → `maxAllocationAt`; `status ∈ ['PENDING_PICKUP', 'PICKING_UP']` → `maxPickupAt`; otherwise → `maxCompletionAt`.
- **Redis is OPTIONAL** (`REDIS_ENABLED=false` default). When disabled, `storeDeliveryDeadline` is no-op — FE must handle null gracefully.
- **Backoffice endpoints:** `GET /v1/deliveries/exp/control-tower`, `GET /v1/deliveries/exp/control-tower/deliveries/:deliveryUID`, `POST /internal/v1/control-tower/track-bucket-transitions`.

## B.12 — Anti-patterns + conventions to respect (this service)

- **Never throw raw `Error`** — always `AppError` (raw Error becomes HTTP 500).
- **Never write `res.status(200).json({...})` directly** — use `createResponse(res, statusCode, message, data, pagination?, errors?)`.
- **Don't bypass the state machine.** All transitions go through `DeliveryStatusStateMachine.canTransitionTo` (or static `canTransition`).
- **Don't reuse `session_id` to imply grouping.** Server mints `group_uuid` from `isGroupOrder=true && trips.length > 1`. FE cannot force grouping.
- **JSONB fields are typed.** `Delivery.metadata` → `DeliveryMetadata`, `Timeline.metadata` → `DeliveryTimelineMetadata`, `Package.metadata` → `PackageMetadata`, `Quote.metadata` → `QuoteMetadata`. Don't shove arbitrary keys.
- **Use `src/test-support/delivery-fixtures.ts`** (`seedDelivery`, `seedStuckDelivery`, `PROVIDER_ID`, `TIMEZONE`) — don't redeclare per file.
- **Tests are table-driven** — adding `it()` per scenario is a style violation.
- **`PROVIDER_H2H` ≠ `PROVIDER_USER`.** H2H = server-to-server API client; USER = portal-logged-in person. Different middleware chains, different create endpoints, different DTO shapes.

## B.13 — Implications for Dash DS (FE pattern blocks)

- **Status badges:** 26 statuses → collapse into 5-7 buckets (Booked / Allocating / Picking up / On the way / Delivered / Cancelled / Issue). Use `DeliveryStatusStateMachine.isFinal()` to decide whether to show "Cancel".
- **Endpoint per identity:** hit `/{client-user|customer|driver|mgmt}/v1/deliveries[/:deliveryUID]` per context. Envelope `{ status, message, data, pagination, requestId, meta }` — read `data`.
- **Validation errors:** read top-level `error` (string) + `errors` (array). Display the `error` string directly — already Bahasa Indonesia.
- **Sandbox mode toggle:** portal can pass `X-Mode: sandbox`. UI should make sandbox visually distinct (`is_sandbox` flag on responses).
- **Tracking page (public):** `GET /v1/deliveries/track/:trackingToken` — no auth, only timezone middleware. Build the public-tracking UI block to consume this without a JWT.
- **Webhook admin UI:** event vocabulary `provider_order.{created|in_progress|completed|cancelled|failed}` — NOT `delivery.*`. Render method/URL/status (`PENDING|SENT|FAILED`) per row, plus payload/response JSON viewers.
- **Control-tower bucket colors:** `ON_TRACK` (green) / `MEDIUM_RISK` (yellow) / `NEED_ATTENTION_NOW` (orange) / `BREACH` (red).

---

# Appendix C — Fleet + Express BE + Infrastructure (Phase 1.7B — 2026-05-20)

> Sources: `nest-express-service-main` (AGENTS.md 432L + 281 source files), `nest-fleet-service-main` (CLAUDE.md 9L + ARCHITECTURE.md 824L + 762 source files), `infrastructure-main` (README 90L + IAC_SPEC.md 28KB + IaC modules).

## C.1 — nest-express-service (new BE — driver state / reservations)

| Attribute | Value |
|---|---|
| Package | `nest-express-service` (private) |
| App name (env `APP_NAME`) | `express-service` |
| Default port | `8086` (env `APP_PORT`) |
| Cloud Run exposed port | `8080` |
| Node | 24.13.0 (Cloud Run target), `>=20` dev |
| Framework | **NestJS 10.x with Fastify adapter** (`@nestjs/platform-fastify`) |
| ORM | **Drizzle 0.45.x** (`drizzle-orm`) — **NOT Prisma** (no Prisma schema in repo) |
| DB | PostgreSQL (local port 5442, container 5432, db `express-db`) |
| Cache | Redis 5 |
| Package manager | pnpm 10.x |
| Test | Jest 29 + ts-jest |
| Observability | OpenTelemetry SDK (Node) → SigNoz |
| Logging | Winston (custom GCP `LogTransport`) |
| Auth | JWT via `@nestjs/jwt`, `AuthGuard` + `@AuthTypes` decorator |
| Rate limit | `@nestjs/throttler` available |
| Misc | bcrypt, joi, class-validator, dayjs, moment-timezone, geo-tz, ngeohash, `@google-cloud/{bigquery, pubsub, tasks, logging, error-reporting}` |

### Domain ownership

Per AGENTS.md + Drizzle schema in `src/database/schema/table/`:

1. **Driver State Management** — real-time tracking, clock-in/out, current `driver_state` snapshot, history.
2. **Reservations** — slot reservations/scheduling per tribe + geometry/geohash polygon.
3. **Driver Home Base** — driver home location bookkeeping.
4. **Driver Time Preference** — driver-side preference module.
5. **Demand** — `demand.table.ts` (used by reservation-ahead/near generation).

Tables:
```
demand.table.ts
driver-home-base.table.ts
driver-state.table.ts                     // PK driver_id (int), current snapshot
driver-state-history.table.ts
driver-time-preference.table.ts
reservation.table.ts                      // PK uuid, status PENDING, type DEDICATED, tribe EXPRESS
reservation-driver-hours.table.ts
reservation-drivers.table.ts
reservation-drivers-history.table.ts
```

**Reservation columns** (verbatim): `id uuid PK`, `geohashes jsonb`, `geometry jsonb` (center + polygon), `city_name`, `district_name`, `start_time / end_time`, `hour_duration real`, `max_driver_capacity / min_driver_capacity`, `capacity_filled`, `status` (default `'PENDING'`), `type` (default `'DEDICATED'`), `tribe` (default `'EXPRESS'`), `is_deleted boolean`.

**driver_state columns:** `driver_id int PK`, `latitude/longitude/geohash`, battery telemetry (`battery_level`, `is_battery_charging`, `is_battery_saving_mode`, `is_battery_optimization`), `ram_usage/ram_capacity`, `app_state/app_version`, `work_status`, `delivery_status`, `ongoing_deliveries jsonb[]`, `gps_status`, `location_permission`, `notification_permission`, `device_brand/device_model`, `driver_data jsonb`, `driver_tags jsonb[]`, `driver_status text`, `updated_location_at`, `updated_at`, `created_at`.

### API surface

```
src/modules/reservation/presentation/delivery/https/reservation.controller.ts
  @Controller({ path: '/v1/reservations' })
    GET    /v1/reservations              (driver gets own, ADMIN/WEB gets filtered)
    GET    /v1/reservations/map-view
    GET    /v1/reservations/driver/:driverId
    GET    /v1/reservations/drivers/available
    GET    /v1/reservations/:id
    POST   /v1/reservations/book
    PUT    /v1/reservations/:id/cancel
    POST   /v1/reservations/:id/move-driver

src/modules/reservation/presentation/delivery/https/internal.controller.ts
  @Controller({ path: '/internal/v1/reservations' })
    POST   /internal/v1/reservations/ahead
    POST   /internal/v1/reservations/near
    POST   /internal/v1/reservations/check-driver-reservations
    GET    /internal/v1/reservations/schedule-timeslot
    POST   /internal/v1/reservations/update-min-driver-capacity
    POST   /internal/v1/reservations/send-reservation-reminders
```

### Pub/Sub subscribers (driver-state module)

- `driver-clock-in.pubsub.ts`
- `driver-clock-out.pubsub.ts`
- `driver-location.pubsub.ts`
- `driver-update.pubsub.ts`

Service is a **consumer** of driver lifecycle events emitted by upstream (likely driver-service / core-service).

### Auth + envelope (numeric status — aligns with core)

```ts
class BaseApiResponse<T> {
  status!: number;                    // numeric HTTP-style (200, 201)
  message?: string;
  error?: string;
  errors?: string[];
  data?: T;
  pagination?: { size, page, lastPage?, total };  // top-level
}
```

`BaseAuthType` enum:
```ts
enum BaseAuthType {
  DRIVER = 'DRIVER',
  INTERNAL_SERVICE = 'INTERNAL-SERVICE',
  ADMIN = 'WEB',              // ⚠️ aliased to WEB
  WEB = 'WEB',
  PROVIDER_USER = 'PROVIDER-USER',
  CLIENT_USER = 'CLIENT-USER',
}
```

### AGENTS.md top mandates

1. **Always use path aliases** — no `../../../`.
2. **Extend base classes** for controllers (`BaseController` — auto-OTel span per method), use cases (`BaseUseCase`), repositories (`BaseRepository`), external service clients (`BaseService`).
3. **Use DI tokens** from `@database` (`DB`) for database access.
4. **Handle transactions** via repository methods that accept `tx` parameter.
5. **Log interceptor is global** — all requests auto-logged.

Path aliases:

| Alias | Maps to |
|---|---|
| `@database`, `@database/*` | `src/database`, `src/database/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@shared`, `@shared/*` | `src/modules/shared`, `src/modules/shared/*` |
| `@driver-home-base`, `@driver-home-base/*` | `src/modules/driver-home-base/*` |
| `@driver-state`, `@driver-state/*` | `src/modules/driver-state/*` |
| `@reservation`, `@reservation/*` | `src/modules/reservation/*` |

## C.2 — nest-fleet-service (new BE — largest, fleet domain)

| Attribute | Value |
|---|---|
| Package | `fleet-service` (private) |
| App name | `Dash Fleet Service` |
| Default port | `8086` (collides with express — per-env override expected) |
| Node | `>=22.0.0` |
| Framework | **NestJS 11.x** (newer than express's Nest 10) |
| HTTP adapter | Both `platform-fastify` + `platform-express` available |
| ORM | **Drizzle 0.40.x** with `postgres` driver |
| DB | PostgreSQL (`fleet-db`) |
| Cache | `@nestjs/cache-manager` + in-mem + Redis via `ioredis` 5.x |
| Microservices | `@nestjs/microservices` + `nestjs-google-pubsub-microservice` 11.x (publishing) + custom subscriber service |
| Cloud SDKs | `@google-cloud/{bigquery, pubsub, storage, tasks, logging, logging-winston, error-reporting}` |
| Observability | OpenTelemetry SDK (incl. logs SDK `@opentelemetry/sdk-logs`) → SigNoz |
| Logging | Winston 3.17 + `@opentelemetry/winston-transport` + `@google-cloud/logging-winston` |
| Auth | JWT, `AuthGuard` + `@AuthTypes` |
| Misc | fast-csv, fast-xml-parser, handlebars, slugify, dayjs, bcrypt, joi, ngeohash |
| Webhook | Redis Streams strategy (env `WEBHOOK_STRATEGY='redis-stream'`) |

### Domain ownership (largest blast radius)

13 feature modules under `src/modules/`:

```
vehicle/        oem/         model/         station/
handover/       maintenance/ incident/      issue/
repossession/   dashboard/   webhook/       setting/   shared/
```

Tables in `src/database/schema/table/`:

```
oem.table.ts                                     // OEM partner registry
model.table.ts                                   // vehicle models per OEM
vehicle.table.ts                                 // primary fleet entity
vehicle-changes.table.ts                         // audit log
vehicle-telemetry.table.ts                       // raw telemetry events
handover.table.ts                                // vehicle ↔ driver/client
handover-booking.table.ts
incident.table.ts                                // accident/damage events
incident-changes.table.ts
incident-status-history.table.ts
issue.table.ts                                   // lighter-weight reports
issue-changes.table.ts
maintenance.table.ts                             // repair workflow + temp/perm swap + FM decision
maintenance-changes.table.ts
maintenance-status-history.table.ts
repossession.table.ts                            // recovery workflow
repossession-change.table.ts
repossession-status-history.table.ts
station.table.ts                                 // BSS / charging stations
daily-fleet-metrics.table.ts                     // rollup
dashboard-business-unit-distribution.table.ts
dashboard-city-distribution.table.ts
dashboard-client-hub-distribution.table.ts
dashboard-hub-location.table.ts
dashboard-oem-distribution.table.ts
setting-handover-booking-date.table.ts
```

### Top fleet entities

1. **Vehicle** (`vehicle.table.ts`) — UUID PK. `plat_nomor`, `vin`, `imei`, `color`, `status` (default `'IDLE'`), `process_type` (default `'AVAILABLE'`), `hub_id/hub_name/hub_city_id/hub_city_name`, `business_unit`, `contract_start_date/contract_end_date/contract_duration`, `is_booking`, `stnk_link`, `unit_equipment text[]`, `app_username/app_password`, `vehicle_image_url`, **return-flow fields** (`return_date`, `return_odometer`, `return_unit_equipment[]`, `return_condition`, `return_reason`, `return_reason_other`, `return_issues`, `return_notes`, `return_bast_url`, `return_oem_rep_name`, `return_oem_rep_phone`, `vehicle_return_image_url`), **telemetry snapshot** (`telemetry_latitude/longitude/speed/ignition`, `telemetry_bms_1_soc`, `telemetry_bms_2_soc`, `telemetry_odometer`, `telemetry_range`, `telemetry_last_at`). Indexed on `model_id`, `plat_nomor`, `vin`, `status`, `process_type`.

2. **Handover** (`handover.table.ts`) — UUID PK. Links vehicle ↔ driver/client. `vehicle_id` (FK), `driver_id/driver_name/driver_code`, `client_id/client_name`, hub denormalized, `odometer`, `handover_date`, `status` (default `'ACTIVE'`), pricing (`purchase_price`, `selling_price`, `deposit`, `deposit_mitra_to_dash`), `bast_link`, `unit_equipment[]`, plus **full return mirror** (`return_date`, `return_odometer`, `return_unit_equipment[]`, `return_condition`, `return_reason`, `return_issues`, `vehicle_return_image_url`, `return_bast_link`, `return_notes`, `return_source_type`, `return_source_id`, `return_source_code`).

3. **Maintenance** (`maintenance.table.ts`) — UUID PK + unique `code`. Richest workflow. `reason`, `vehicle_id` (FK), driver/oem/client denormalized, `categories text[]`, `issue_description`, `maintenance_date`, `severity`, `estimated_cost`, `cost_responsibility`, `oem_service_center`, `expected_completion_date`, `status` (default `'OPEN'`), lifecycle (`start_timestamp`, `completion_timestamp`), completion (`work_completed`, `is_cost_same_as_estimate`, `actual_cost`, `cost_variance`, `cost_variance_reason`, `completion_image_url`, `completion_notes`, `actual_completion_at`), **FM decision** (`fm_decision`, `fm_decision_notes`, `fm_decided_by`, `fm_decided_at`), `from_status` (for reject rollback), **temp-swap** sub-flow (`has_temp_swap`, `temp_plate_number`, `temp_model_name`, `temp_oem_name`, `temp_swap_given_at`, `temp_swap_photos[]`, `temp_swap_notes`, `temp_swap_return_at`), `linked_incident_code/linked_incident_id` (FK), **perm-swap** sub-flow with **draft JSONB blobs** (`new_vehicle_id` FK, `draft_new_vehicle jsonb`, `draft_return_vehicle jsonb`, `draft_new_handover jsonb`, `draft_return_handover jsonb`, `perm_swap_return_at`, `perm_swap_return_condition`, `perm_swap_return_notes`).

4. **Incident** (`incident.table.ts`) — UUID PK + unique `code`. `handover_id` FK, `incident_date`, `incident_type` (default `ACCIDENT_DAMAGE`), `severity`, `chronology`, `damage_image_url`, `police_report_url`, `cost_responsibility`, `status` (default `'OPEN'`), `closed_at`. Spawns maintenance via `/incidents/:ID/spawn-maintenance`.

5. **Repossession** (`repossession.table.ts`) — UUID PK + unique `code`. `handover_id` FK, `status` (default `'OPEN'`), `from_status`, `severity` (default `'MEDIUM'`), `reason`, `notes`, `assigned_ops_team`, `reminder_count`, `escalation_due_at`, `escalation_trigger`, `escalation_type`, `search_efforts`, `escalation_reason`, `last_known_info`, `ops_recommendation`, cost fields, FM decision, settlement (`settlement_amount`, `settlement_type`, `settlement_notes`, `settlement_document_url`, `finance_approval`), `escalation_task_name` (Cloud Tasks), `settled_by/settled_at`, `found_at`, `closed_at`.

Secondary: **Issue** (lightweight pre-maintenance, can link to maintenance via `linked_maintenance_id`); **OEM** (partner registry); **Station** (scraped BSS / charging stations); **Model** (per-OEM); **Vehicle telemetry** (high-volume time-series).

### State machines (enums in `src/database/schema/enum/`)

```
VehicleStatus       = IDLE | ACTIVE | LOST | IN_REPAIR | BROKEN | RETURNED
ProcessType         = AVAILABLE | ISSUE | INCIDENT | REPOSSESSION | MAINTENANCE
                    | CANDIDATE_PERM_MAINTENANCE
HandoverStatus      = ACTIVE | RETURNED
IncidentStatus      = OPEN | IN_MAINTENANCE | MAINTENANCE_COMPLETED | CLOSED
IssueStatus         = SUBMITTED | IN_PROGRESS | RESOLVED | CLOSED
MaintenanceStatus   = OPEN | IN_PROGRESS
                    | PENDING_APPROVAL_COMPLETION
                    | PENDING_APPROVAL_TEMP_SWAP
                    | PENDING_APPROVAL_PERM_SWAP
                    | PERM_SWAP | TEMP_SWAP
                    | COMPLETED | CLOSED              // 10 states total
RepossessionStatus  = OPEN | IN_PROGRESS | FOUND | POTENTIAL_LOSS
                    | PENDING_APPROVAL | WRITTEN_OFF | CLOSED  // 7 states
StationStatus       = ... (ONLINE default)
BusinessUnit        = QUICK_COMMERCE | EXPRESS | X_DOCK | SCHEDULED_INSTANT
                    | CANVASSER_RENTAL | 4_WHEEL | OUTSOURCING | STAGING
```

37 enums total. Vehicle has a **6×6 status × processType matrix** (e.g. `IDLE` × `AVAILABLE`, `IN_REPAIR` × `MAINTENANCE`, etc.). State transitions must use service methods — never direct table writes.

### Inter-service comm

1. **Outbound HTTP (point-to-point):**
   - `CORE_BASE_URL` → `@shared/services/core.service.ts` via `InternalApiService` wrapper.
   - `DRIVER_BASE_URL` → `@shared/services/driver.service.ts`.
   - **No** `EXPRESS_BASE_URL` / `DELIVERY_BASE_URL` from fleet.
   - Outbound auth: `Authorization` header masked in logs; uses `INTERNAL_SECRET` env (shared-secret mesh style).

2. **Cloud Tasks:** `@shared/services/google-queue.service.ts` — repossession escalation reminders (`escalationTaskName` stores task handle).

3. **Pub/Sub (fleet emits + listens internally):**
   Topics **published by fleet** (7):
   - `vehicle-created`, `vehicle-updated`, `vehicle-deleted`
   - `handover-created`, `handover-updated`, `handover-deleted`
   - `oem-updated`
   Subscribers (consumed inside fleet itself — dashboard + maintenance modules):
   ```
   src/modules/dashboard/presentation/deliveries/listener/
     handover-created.listener.ts
     handover-updated.listener.ts
     handover-deleted.listener.ts
     vehicle-created.listener.ts
     vehicle-updated.listener.ts
     vehicle-deleted.listener.ts
     oem-updated.listener.ts
   src/modules/maintenance/presentation/deliveries/listener/
     oem-updated.listener.ts
   ```
   Subscription naming: `${TOPIC}-${APP_NAME}-${moduleHint}-sub`.

4. **Webhooks ingestion:** `v1/fleet/webhooks` (public, OEM telemetry callbacks) + `v1/webhooks/scheduler` (internal cron). Strategy via env `WEBHOOK_STRATEGY=redis-stream | naive`. Batched flush to `vehicle_telemetry` + snapshot back to `vehicle.telemetry_*`.

5. **Slack / Lark notifications:** `LARK_REPO_NOTIF_URL`, `LARK_MAINTENANCE_NOTIF_URL`, `SLACK_REPO_NOTIF_URL`, `SLACK_MAINTENANCE_NOTIF_URL`, `SLACK_ERROR_NOTIF_URL`. Toggled by base64 `FEATURE_FLAGS` (`{"ENABLE_SLACK": false}` default).

6. **External scrapers:** station module scrapes Electrum (KML) and Alva (REST API).

### API surface (full controllers)

Public (`/v1/*`):
```
v1/vehicles                                  vehicle.controller.ts
v1/models                                    model.controller.ts
v1/oems                                      oem.controller.ts
v1/handovers                                 handover.controller.ts
v1/handovers/bookings                        handover-booking.controller.ts
v1/issues                                    issue.controller.ts
v1/incidents                                 incident.controller.ts
v1/maintenances                              maintenance.controller.ts
v1/repossessions                             repossession.controller.ts
v1/stations                                  station.controller.ts
v1/fleet/dashboard                           dashboard.controller.ts
v1/fleet/setting                             setting.controller.ts
v1/fleet/webhooks                            webhook.controller.ts
v1/webhooks/scheduler                        webhook-scheduler.controller.ts
```

Internal (`/internal/v1/*`):
```
internal/v1/vehicles                         vehicle-internal.controller.ts
internal/v1/handovers/bookings               handover-booking-internal.controller.ts
internal/v1/repossessions                    repossession-internal.controller.ts
internal/v1/stations                         station.internal.controller.ts
internal/v1/fleet/dashboard                  dashboard-internal.controller.ts
```

Representative verbs (truncated):
- Vehicle: `GET /`, `POST /`, `GET /:ID`, `PATCH /:ID`, `PATCH /:ID/return`, `PATCH /return/:ID`, `GET /dashboards`, `GET /owned/download/csv`, `GET /returned/download/csv`, `GET /:ID/changes`.
- Handover: `GET /`, `POST /`, `GET /drivers/:driverID`, `GET /drivers/:driverID/check-active-handover`, `GET /active/download/csv`, `GET /returned/download/csv`, `GET /:ID`.
- Maintenance: `GET /`, `POST /`, `GET /:ID`, `PATCH /:ID`, `PATCH /:ID/close`, `GET /:ID/status-history`.
- Incident: `GET /`, `GET /:ID`, `POST /`, `PATCH /:ID`, `PATCH /:ID/spawn-maintenance`, `PATCH /:ID/mark-as-close`.
- Repossession: `GET /`, `POST /`, `GET /:ID`, `PATCH /:ID`, `PATCH /:ID/mark-as-found`, `PATCH /:ID/mark-as-lost`, `PATCH /:ID/start-investigation`, `PATCH /:ID/new-mark-as-found`, `PATCH /:ID/close-case`, `PATCH /:ID/escalate-to-potential-loss`, `PATCH /:ID/escalate-to-manager`, `PATCH /:ID/make-decision`, `PATCH /:ID/process-settlement`.
- Dashboard: rollup chart endpoints (`oem-distribution/chart|detail|download/csv`, `city-distribution/...`, `client-hub-distribution/...`, `hub-location/...`, `business-unit-distribution/...`, plus `fleet-snapshot`, `utilization-trend`).

### Auth + envelope (string status — aligns with halo-dash-be + ts-delivery, NOT core/express)

```ts
class BaseApiResponse<T = any> {
  status!: 'Success' | 'Failed';   // string literal — NOT a number
  message?: string;
  data?: T;                         // ⚠️ pagination is nested INSIDE data, not top-level
  error?: string;
  errors?: any[];
}
```

ARCHITECTURE.md pattern: `{ data: { items: result.data, pagination: result.pagination } }` — i.e. pagination is a key inside `data`, not a sibling of `data`.

Both express and fleet name the class `BaseApiResponse<T>` and live at the same path (`src/infrastructure/base/base-api-response.ts`) — **but the type of `status` is opposite** (number in express, string in fleet). **FE code calling both must discriminate by service, not by class name.**

`BaseAuthType` matches the express definition (same enum strings).

### CLAUDE.md mandates (only 9L)

1. Package manager: `pnpm`, not `npm`.
2. Do NOT modify generated Drizzle migration files under `src/database/migration/` (SQL + `meta/*.json` snapshots) — team manages via `pnpm run db:generate`.
3. Editing table schemas (`src/database/schema/table/*.table.ts`) IS allowed — hand-written source of truth.
4. After editing a schema, **remind the team** to run `pnpm run db:generate` and double-check the generated migration before applying.

### ARCHITECTURE.md mandates (824L — top items)

1. **Clean Architecture + DDD** — strict 4-layer: domain → data → presentation → infrastructure. Domain has zero deps on outer layers.
2. **Cross-module communication = Repository Pattern only.** No "use a usecase from another module". Import the owning module and inject its repository into the consuming module's usecase.
3. **Minimal transaction scope strategy:**
   - Reads use `this.db` (no transaction).
   - Writes (`create/update/delete`) accept `tx: DBTransaction` parameter.
   - **Validations before transaction.** External API calls (GCS, etc.) **before** transaction.
   - Atomic multi-write goes inside one `db.transaction(async tx => Promise.all([...]))`.
4. **Banned:** reads inside transactions when avoidable; external API calls inside transactions; wrapping single reads in transactions.
5. Path aliases: `@modules/*`, `@modules/oem/*`, `@modules/shared/*`, `@infrastructure/*`, `@database/*`.

## C.3 — infrastructure-main (IaC)

| Attribute | Value |
|---|---|
| Cloud provider | **GCP** |
| IaC tool | **OpenTofu 1.8.1** (`.tool-versions`), **NOT Terraform** |
| Orchestrator | **Digger CLI** (no server, GH Actions self-hosted, GCS state locks) |
| State backend | GCS bucket `de-iac-state-prod` (placeholder, single bucket / many prefixes), region `asia-southeast2` |
| DRY strategy | Partial backends + CI-supplied `-backend-config=` (explicit choice **against** Terragrunt) |
| Environments | `staging-dash-electric`, `production-dash-electric`, `sandbox-dash-electric` (sandbox deprecating in parallel) |
| Secrets | **GCP Secret Manager** (`secret` module with `secret_id`, `accessors[]`, `replication_type`) — replacing long-lived `GCP_SA_KEY` GitHub secrets |
| Container runtime | **Cloud Run + Cloud Run Jobs only** — **ADR-0001 bans K8s/GKE** |
| Service count | 56 services (50 on Cloud Run, 2 App Engine edge cases: `putriinvoice-bq`, `payroll-service`-staging) |
| Artifact Registry | `cloudrun-standard` repo in `asia-southeast2` |
| Auth to GCP | **Workload Identity Federation (WIF)** with assertion `repository == "dash-electric/infrastructure"`, env-gated via GitHub Environments — replaces 18+ workflows currently using `secrets.GCP_SA_KEY` |
| Region | `asia-southeast2` (Jakarta) — primary |

### Repo layout

```
live/                              One OpenTofu root per layer, per env
  org/                             Org-level: WIF pool/provider, state bucket, org IAM
  shared/
    artifact-registry/             logging/             monitoring/
  staging/                         staging-dash-electric
    00-project/                    Project + enabled APIs (foundation)
    10-networking/                 VPC, subnets, VPC connector
    20-data/                       Cloud SQL, GCS, Secret Manager
    30-platform/                   Shared SAs, logging, monitoring
    40-apps/                       Cloud Run services + per-app deployer SAs
  prod/                            production-dash-electric — mirrors staging
modules/
  gcp/                             Reusable GCP modules (vpc, cloud-run-service, cloud-sql, secret, etc.)
  _common/                         Shared versions.tf + remote-state example
bootstrap/                         One-shot root w/ local state (imports → live/org/)
ci/
  backend-configs/                 Per-env backend.hcl
docs/                              Runbooks, ADRs, IAC_SPEC.md
.github/workflows/                 Digger orchestration
```

**`NN-` prefix convention:** numeric sort encodes dependency order (`00 → 10 → 20 → 30 → 40`).

**Naming convention:** tool-neutral `iac-*` prefix on SAs (`iac-runner-staging`, `iac-runner-prod`, `iac-drift-prod`), state buckets (`de-iac-state-prod`), CI variables (`IAC_RUNNER_SA_STAGING`, `IAC_STATE_BUCKET`, `WIF_PROVIDER`). Upstream Digger addendum uses `TF_*`/`tf-*` — **substitute to `IAC_*`/`iac-*`** when copying.

**Modules (planned):**
```
vpc / vpc-access-connector
cloud-run-service
cloud-sql-instance
secret  (secret_id, accessors[], replication_type)
gcs-bucket
artifact-registry
service-account
pubsub-topic / pubsub-subscription
cloud-tasks-queue
```

Explicitly **dropped:** `gke-cluster` module (ADR-0001 2026-05-12).

## C.4 — Cross-service patterns

### Service-to-service auth
- `/internal/*` namespaces in both new BE services (express, fleet).
  - Express: `@Controller({ path: '/internal/v1/reservations' })` and `extends BaseController`.
  - Fleet: `@Controller('internal/v1/...')`.
- Internal calls travel **point-to-point HTTP** (no API gateway) with `INTERNAL_SECRET` shared header.
- `BaseAuthType.INTERNAL_SERVICE = 'INTERNAL-SERVICE'` is the auth type both services accept.
- **No service mesh** (Istio / Linkerd). Plain HTTP between Cloud Run services on project VPC, secured by shared-secret header + ingress controls.

### Event bus
- **Google Pub/Sub is the only event bus** across surveyed BE repos. No Kafka, no RabbitMQ, no NATS.
- Fleet publishes: `vehicle-*` (3), `handover-*` (3), `oem-updated` (7 topics total).
- Express consumes (from upstream): `driver-clock-in`, `driver-clock-out`, `driver-location`, `driver-update`.
- **No cross-pub/sub between express and fleet** (they don't share topics).
- **Google Cloud Tasks** for delayed work (reservation reminders in express; repossession escalation in fleet).

### Envelope per service (CRITICAL discrimination)

| Service | `status` field type | Pagination location | Source |
|---|---|---|---|
| `nodejs-core-service` | **number** | top-level | Phase 1 |
| `nest-express-service` | **number** | top-level | Phase 1.7B verified |
| `halo-dash-be` | **string** `'Success'\|'Failed'` | top-level | Phase 1 (mandate per AGENTS.md) |
| `nest-fleet-service` | **string** `'Success'\|'Failed'` | **nested inside `data`** | Phase 1.7B verified |
| `ts-delivery-service` | **string** `'Success'\|'Failed'` | top-level | Phase 1.7A verified |

Both nest-express and nest-fleet name the envelope class `BaseApiResponse<T>` and place it at the same path (`src/infrastructure/base/base-api-response.ts`) — but the type of `status` is opposite. **FE must discriminate by service, NOT by class name.**

### Updated stack rules

| # | Rule | Source |
|---|---|---|
| BE-NEW-1 | **Drizzle ORM is the BE ORM standard for new TS Nest services.** Do not introduce Prisma into Nest services. | express AGENTS.md + fleet ARCHITECTURE.md |
| BE-NEW-2 | **Path aliases over relative imports — mandatory.** Use `@infrastructure/*`, `@shared/*`, `@<module>/*`. No `../../../`. | express AGENTS.md |
| BE-NEW-3 | **All controllers extend `BaseController`** (OTel auto-tracing). Use cases extend `BaseUseCase`. Repositories extend `BaseRepository`. External clients extend `BaseService`. | express AGENTS.md |
| BE-NEW-4 | **Migration files are immutable.** `src/database/migration/*.sql` + `meta/*.json` are generated by `pnpm run db:generate`. AI must not edit them. Edit `src/database/schema/table/*.table.ts` and prompt the team to regenerate. | fleet CLAUDE.md |
| BE-NEW-5 | **Minimal transaction scope.** Reads outside `db.transaction(...)`. Writes accept `tx: DBTransaction`. Validations + external API calls always **before** the transaction. Multi-write atomic = one `db.transaction(async tx => Promise.all([...]))`. AI must never put reads or HTTP calls inside a transaction body. | fleet ARCHITECTURE.md |
| BE-NEW-6 | **Cross-module access = export the Repository, not the use case.** | fleet ARCHITECTURE.md |
| BE-NEW-7 | **Envelope-per-service rule for FE codegen.** Express → numeric `status`. Fleet → string `'Success'\|'Failed'`, pagination nested in `data`. Core → numeric `status`. Halo-dash-be / ts-delivery → string. Do not assume one shape. | this dossier |
| INFRA-1 | **No K8s / GKE.** Cloud Run + Cloud Run Jobs only. ADR-0001. | infrastructure ADR-0001 |
| INFRA-2 | **No long-lived GCP_SA_KEY** in new GH Actions workflows. Use WIF. | IAC_SPEC.md |
| INFRA-3 | **Secrets live in GCP Secret Manager**, not env files. | IAC_SPEC.md |
| INFRA-4 | **Region default = `asia-southeast2`** (Jakarta). Artifact Registry `cloudrun-standard`. Don't introduce US/EU regions without reason. | IAC_SPEC.md |
| INFRA-5 | **OpenTofu, not Terraform.** Pinned 1.8.1. Use `tofu init`. No Terragrunt. | infrastructure README |

---

# Appendix D — New FE repos (basecamp + react-fleet-management, Phase 1.7C — 2026-05-20)

> Sources: `next-basecamp-web-main` (AGENTS.md 478L + 240 source files, ~12 sampled), `react-fleet-management-web-main` (README 46L, **NO AGENTS.md**, ARCHITECTURE.md 400+L + 187 source files).

## D.1 — next-basecamp-web

### Stack definitive

| Layer | Choice | Source |
|---|---|---|
| Framework | **Next.js 16.1.6 App Router** with route-groups `(app)` / `(public)` | `package.json` L38 |
| Language | **TypeScript** strict | `tsconfig.json` |
| Forms | **Native `useState` controlled** — NO RHF, NO formik | zero `useForm` matches |
| Validation | **Manual / type-driven** — NO zod, NO yup | zero zod imports |
| Data fetch | **Native `fetch` to `/api/*` route handlers** + React hooks | `app/api/*/route.ts`, `lib/spend-request/hooks.ts` |
| State | **Zustand 5.0.11** (`lib/stores/app-store.ts`) | `package.json` L50, AGENTS.md L122 |
| Auth | **Firebase Auth (Google OAuth)** via `AuthProvider` context + `AuthGuard` HOC; domain-locked to `@dashelectric.co` | `lib/auth/auth-context.tsx` |
| UI lib | **shadcn/ui (new-york style)** on Radix + lucide-react + Remix Icons | `components.json` `"style": "new-york"` |
| Tailwind | **v4** (`@tailwindcss/postcss`) | `package.json` L53 |
| Brand color | **Dash Purple `#5e2aac`** (hard-coded hex, no CSS var; matches DS token `--dash-purple-500`) | `DESIGN_SYSTEM.md` L13, `components/ui/button.tsx` L40 |
| Font | **Plus Jakarta Sans** via `next/font/google` | `app/layout.tsx` L2-L7 |
| i18n | **NONE** — only `toLocaleString('id-ID')` for IDR | no i18next/next-intl deps |
| Test | **NONE configured** | no test script, no test deps |
| Backend | **Firestore (`basecamp-db` non-default DB)** + Firebase Admin + GCS for files | `lib/gcs/`, `lib/firebase-admin.ts` |
| Extras | Mapbox + Leaflet (dual), TipTap editor, jspdf/pdf-lib, Recharts, dnd-kit, **Gemini AI**, **Google Document AI / Vision** | `package.json` deps |

### Domain served

- **Audience:** Dash internal corporate / ops admins (Indonesia HQ). Admin-only settings; domain-restricted Google sign-in.
- **Modules (6):**
  1. **Capacity Planner** — logistics expansion engine (driver headcount sim for new stores)
  2. **PnL Simulator** — workspace-based profit calc, stored in GCS (NOT Firestore)
  3. **Legal Flow** — contract management on Firestore `basecamp-db`
  4. **Spend Control** — multi-layer approval workflow for cash-advance / payment-request
  5. **Reservation Planner** — `app/(app)/reservation-planner/`
  6. **Big Brother** — `app/(app)/big-brother/` (surveillance/monitoring tool)
- **BE services consumed:** **None** of the nest-* services. Talks directly to Firestore `basecamp-db` + GCS + Slack webhooks + Gemini AI + Google Document AI / Vision. **Self-contained backend via Next.js route handlers** — independent from the Dash microservice mesh.

### AGENTS.md mandates (top 10, verbatim)

1. "AI-Native Logistics Expansion Engine — Project Summary. An AI-powered logistics planning tool that determines minimum driver headcount for new store locations."
2. Route grouping: `(public)/` = no auth, `(app)/` = protected. App Router with route-groups for auth segmentation.
3. Auth: "Google OAuth Sign-In: Firebase Authentication with Google provider. Protected Routes: AuthGuard HOC."
4. CSV ingestion uses snake_case.
5. State Management = **Zustand** — single source of truth via `lib/stores/app-store.ts`. No Redux, no Jotai.
6. Firestore Indexes: "**No indexes required!**" — in-memory sort/filter only (caps ~1,000 docs).
7. Spend Control: `SpendRequest.businessUnit: 'express' | 'x-dock' | 'scheduled' | 'corporate' | null` — links basecamp domain to Dash core business units.
8. Subcollections: `timeline` (status change events), `comments`, `approvalLayers` (workflow steps).
9. Settings page: admin-only with 3 tabs — Module Access, User Groups, Feature Requests.
10. Build: `next.config.ts` overrides to `output: "standalone"` for Cloud Run deploy.

### Anti-patterns mandated

- **NO Bearer token auth on internal `/api/*` routes.** API routes are open within trusted env; auth gating happens at page layout via `AuthGuard`.
- **NO Firestore composite indexes** for spend-requests. In-memory sort/filter only.
- **NO `(default)` Firestore database** — must use `basecamp-db`.

### Implications for Dash DS

- **Different from portal-v2:** Zustand (not Jotai), Firebase Auth (not cookie+axios JWT), shadcn (not AlignUI), App Router (same).
- **Different from backoffice:** TS (not JS), shadcn (not MUI+antd mix), Firebase Auth (not NextAuth).
- **Different from halo-dash:** App Router (not Pages), shadcn (not vendored AlignUI), TS (not JS).
- **Component import path:** `@/components/ui/*` (shadcn aliases per `components.json`).
- **Cross-domain auth: NO** — standalone Firebase OAuth; do not propagate `crossDomainStorage` cookies here.

## D.2 — react-fleet-management-web

### Stack definitive (no AGENTS.md — inferred + cross-verified with ARCHITECTURE.md)

| Layer | Choice | Source |
|---|---|---|
| Framework | **Create React App + CRACO 7.1.0** (NOT Next.js, NOT Vite) | `package.json` `react-scripts 5.0.1` + `@craco/craco` |
| Language | **TypeScript 4.9.5 strict** | `tsconfig.json` |
| Routing | **React Router DOM v7.9.4** | `src/App.tsx` `BrowserRouter` |
| Forms | **Native `useState` controlled** (verified 2026-05-20). `package.json` declares RHF+zod+@hookform/resolvers but zero source imports — stale deps. `RepoModal.tsx` uses local `useFormValidation` custom hook | `grep "from 'react-hook-form'"` in `src/` → 0 matches |
| Validation | **Manual / inline checks**; zod 4.3.5 declared but barely used | `package.json` |
| Data fetch | **axios 1.12.2** + interceptors + Bearer from localStorage; per-resource service modules in `src/services/api/*.ts` | `src/utils/axios.ts` |
| State | **React Context (`AuthContext`) + local `useState`** — NO Redux, NO Zustand, NO Jotai | `src/contexts/AuthContext.tsx` |
| Auth | **Firebase Google OAuth + backend-issued JWT** stored via `crossDomainStorage` cookie helper; domain-locked to `@dashelectric.co` | `src/contexts/AuthContext.tsx` |
| Cross-domain | **YES** — `crossDomainStorage` cookie — SAME pattern as portal-v2 + halo-dash | `src/utils/cookieStorage.ts` |
| UI lib | **Custom in-house components** (`src/components/{Button,Card,Input,Modal,Table,DatePicker,Pagination,Status,UniversalFilter,…}`) + **MUI 7.3.5 + Emotion** (partial use) | `src/components/` |
| Tailwind | **v3.4.18** (NOT v4) | `package.json` |
| Font | **Plus Jakarta Sans** | `tailwind.config.js` |
| Icons | **Remix Icons** (in-house wrapper) + Material Symbols | `src/router/routes.tsx` |
| Toast | **react-toastify 11.0.5** | `src/App.tsx` |
| Charts | **ApexCharts** (apexcharts 5.3.6 + react-apexcharts) | `package.json` |
| Date | **dayjs 1.11.18** + custom DatePicker | `package.json` |
| i18n | **NONE** | no i18n deps |
| Test | **Jest + RTL declared** (`craco test`, `test:ci --coverage`) — actual coverage unverified | `package.json` |
| Backend | **Likely `nest-fleet-service`** (`dash-client-type: web` header + `/vehicles`, `/handovers`, `/drivers` endpoints match) | ARCHITECTURE.md, `src/services/api/*` |
| Feature flags | **`useFeatureFlag` hook** (`web_fms_show_dashboard`, `web_fms_show_home`) — likely Firebase Remote Config | `src/hooks/useFeatureFlag.ts` |
| Path aliases | **`@/*` → `src/*`** via CRACO + tsconfig paths | `craco.config.js` |

### Domain served

- **Consumes:** `nest-fleet-service` (Vehicles, Drivers, Handovers, OEMs, Models, Incidents, Issues, Maintenance, Repossessions, Pitstops, Providers).
- **Audience:** Dash internal Fleet Ops — dispatchers, fleet managers, maintenance coordinators, OEM/provider relationship managers, legal/recovery team. NOT driver-facing. NOT customer-facing.
- **Pages (13 modules):** dashboard, vehicles, units (alias), drivers, handovers (+ detail, pre-return), models, oems, incidents (+ detail), issues, maintenance (+ detail, perm/temp swap), repossessions (+ slug detail), settings (+ schedule modals), signin, NotFound.
- **Key UX surfaces:** SearchableDropdown, UniversalFilter (custom labels — see `docs/UNIVERSAL_FILTER_*`), GlobalModal pattern, StepIndicator (multi-step for handover/repo flows).

### Risks / Drift

- **No AGENTS.md** → conventions implicit. ARCHITECTURE.md is informational, not prescriptive.
- **Form pattern uniform** — `useState` across all source files. `package.json` declares RHF+zod (stale, never imported). RHF/zod ban effectively enforced (zero source violations verified 2026-05-20).
- **MUI + custom components coexist** — visual inconsistency risk.
- **CRACO + CRA** is legacy (deprecated by React team).
- **Brand color drift:** `primary` blue tokens `#3b82f6 / #2563eb` in tailwind config — **NOT** Dash Purple `#5e2aac`.

### Implications for Dash DS (mark "inferred — verify with team")

- **Different from all other Dash FE:** ONLY repo on CRA+CRACO. ALL others are Next.js.
- **Different routing:** React Router DOM (not file-based).
- **Different UI:** custom in-house (NOT AlignUI, NOT shadcn, NOT MUI-primary despite MUI dep).
- **Same auth pattern as portal-v2 + halo-dash:** `crossDomainStorage` cookie + Bearer JWT — confirms **Dash cross-domain SSO trio** (portal-v2 ↔ halo-dash ↔ fleet-mgmt).
- **basecamp DOES NOT participate** in the trio (Firebase Auth direct).

## D.3 — Cross-FE consistency check (all 5 FE repos)

| Convention | portal-v2 | backoffice | halo-dash | basecamp | fleet-mgmt |
|---|---|---|---|---|---|
| Bans RHF? | Yes | Yes | Yes | Yes | Yes (verified 2026-05-20: 0 imports) |
| Bans zod? | Yes | Yes | Yes | Yes | Yes (verified: declared in pkg, 0 source imports) |
| Bans TanStack Query? | Yes | Yes | Yes | Yes | Yes |
| Uses AlignUI base? | Yes | Mixed (MUI+antd) | Yes (vendored) | **No** (shadcn) | **No** (custom) |
| Next.js framework? | App | Pages | Pages | App | **No** (CRA+CRACO) |
| TypeScript? | Yes | **No** (JS) | **No** (JS) | Yes | Yes |
| Plus Jakarta Sans? | Yes | Likely | Likely | Yes | Yes |
| Brand `#5e2aac` primary? | Yes | Yes | Yes | Yes | **No** (blue `#3b82f6`) |
| `crossDomainStorage` cookie SSO? | Yes | Yes (NextAuth) | Yes | **No** (Firebase Auth) | Yes |
| Has AGENTS.md? | Yes | Yes | Yes | Yes (478L) | **No** |
| Test runner? | none | Jest (BO) | none | **No** | Yes (Jest+RTL) |

**Consistency verdict:** "ban RHF/zod/TanStack" + "AlignUI base" + "Dash Purple" + "Next.js" + "cross-domain SSO" assumptions hold for the **original 3 repos** but **break partially in both new repos** differently:
- **basecamp** breaks UI (shadcn), state (Zustand), auth (Firebase standalone). Bans hold.
- **fleet-mgmt** breaks framework (CRA), UI (custom), brand color (blue), AGENTS.md presence. Bans fully hold in source (stale RHF/zod deps in `package.json` only).

---

# Appendix E — Drift inventory (Dash team action items)

> These are **observed drift items** in real Dash repos that the Dash team may want to address. AI assistants must NOT refactor these without explicit user approval (per user mandate 2026-05-20: "kita gabisa ngubah existing, kita hanya bisa support itu").

## E.1 — react-fleet-management-web

1. **Stale RHF/zod deps in `package.json`** — `react-hook-form`, `zod`, `@hookform/resolvers` declared but zero source imports (verified 2026-05-20). `RepoModal.tsx` uses local `useFormValidation` custom hook. **Recommend Dash team remove unused deps from `package.json` (no source migration needed).**
2. **Brand color is blue `#3b82f6` not Dash Purple `#5e2aac`** — tailwind config defines `primary` as blue tokens. Visual brand drift from rest of Dash ecosystem (portal-v2 + backoffice + halo-dash + basecamp all use Dash Purple). **Recommend Dash team align to `#5e2aac`.**
3. **No `AGENTS.md` exists** — biggest documentation gap in the Dash FE estate. Conventions are inferred from ARCHITECTURE.md + code samples; AI assistants working in this repo have no prescriptive rules. **Recommend Dash team add AGENTS.md.** Minimum content: form pattern canonical choice (lock to `useState` OR migrate all to RHF), MUI deprecation plan, Vite migration plan.
4. **CRA + CRACO is legacy** — Create React App is deprecated by React team. No migration to Vite/Next planned. **Recommend Dash team schedule CRA → Vite migration.**

## E.2 — next-basecamp-web

5. **No test runner configured** — handles real money (Spend Control approvals) and legal docs, but zero test deps. **Recommend Dash team add Vitest or Jest for spend-approval workflow coverage.**
6. **No-auth on internal `/api/*` routes** — security posture choice. OK while inside trusted Cloud Run perimeter, but should be re-evaluated if basecamp ever leaves it. **Recommend Dash team document the trust boundary explicitly.**

## E.3 — ts-delivery-service

7. **`useCode` field coupling implicit** — the canonical OneTimeCode row lives in `nodejs-core-service`'s `policy_one_time_codes` table, but `ts-delivery-service` references it via `t_delivery_policies.value` where `policy_type === 'ONE_TIME_CODE'`. The cross-service link is implicit (string lookup) and undocumented in either repo's AGENTS.md. **Recommend Dash team add a cross-service contract note in both AGENTS.md files (and in this glossary).**

## E.4 — halo-dash-fe

8. **No test runner configured at all** (no Jest, no Playwright, no Node native). Repo TODOS.md flags this. **Recommend Dash team pick a runner.**

## E.5 — BE envelope inconsistency (cross-service)

9. **Three response-envelope shapes across 5 BE services, with two services naming the class identically (`BaseApiResponse<T>`) but using opposite `status` field types** (numeric in nest-express, string in nest-fleet):

   | Service | `status` field | Pagination |
   |---|---|---|
   | nodejs-core-service | number | top-level |
   | nest-express-service | number | top-level |
   | halo-dash-be | string | top-level |
   | nest-fleet-service | string | **nested inside `data`** |
   | ts-delivery-service | string | top-level |

   **Recommend Dash team converge** (or at minimum, rename the class so it cannot be confused — e.g. `NumericEnvelope<T>` vs `StringEnvelope<T>` — to make the discrimination explicit in code).

## E.6 — Schema design notes (not blocking, ratify-or-document)

10. **`m_provider` multiple secret patterns** — `client_secret`/`client_key` (deprecated comment) + `auth_key`/`auth_value` + sandbox variants + `ProviderAPIKey` (new home). Reads must consult the canonical table. **Recommend Dash team migrate fully to `ProviderAPIKey` + drop legacy columns.**
11. **Typo in canonical type filename** `next-portal-v2-web/types/DelliveryTypes.ts` (should be `DeliveryTypes.ts`). Imports across the app reference the typo path — renaming is a coordinated change. **Recommend Dash team rename in one coordinated PR.**
12. **Sandbox project (`sandbox-dash-electric`) deprecating in parallel** — list of "4 repos still using it" not enumerated. **Recommend Dash team enumerate + sunset before deprecation completes** (else CI will break for those repos).

---

