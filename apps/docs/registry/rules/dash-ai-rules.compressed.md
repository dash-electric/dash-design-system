# Dash Design System — AI Rules (compressed)

> Generated for `@dash/skill` v2 as a token-conscious fallback. ~50% of
> `dash-ai-rules.md`. Strips long-form explanation and verbose decision trees;
> keeps mandates, ban lists, code patterns, per-repo + per-service tables.
> Source of truth remains `dash-ai-rules.md`.

## Always

1. Query Dash registry FIRST for UI primitives. Lives at `@dash` (111 items).
2. `dashkit add <name>` to install. Never copy-paste; never invent.
3. Never raw hex / rgb. Always semantic tokens (`bg-bg-white-0`, `text-text-strong-950`, `border-stroke-soft-200`).
4. Forms: `@dash/form` + `@dash/field` + zod via `@hookform/resolvers` (DS canon — see Adaptation Layer for per-repo overrides).
5. Page layouts: pick from `@dash/templates/*` first.

## Decision tree — quick map

- Status indicator → `@dash/badge`. Removable chip → `@dash/tag`. KPI → `@dash/stat` in `@dash/card`. Activity stream → `@dash/activity-feed`. Notification list → `@dash/notification-feed`. Skeleton/Spinner/Progress → `@dash/skeleton|spinner|progress-bar|progress-circle`. Empty → `@dash/empty-state`. Tooltip/Hover → `@dash/tooltip|hover-card`. Kbd glyph → `@dash/kbd`.
- Static table → `@dash/table`. Sortable+paginated → `@dash/data-table`. Filter+bulk → `@dash/blocks/transactions-table` or `orders-table`.
- Input → `@dash/input`. Textarea → `@dash/textarea`. Rich → `@dash/rich-editor`. OTP → `@dash/input-otp`. Time/Date → `@dash/time-picker|date-picker`. Select → `@dash/select` (known) / `@dash/combobox` (huge). Multi-filter → `@dash/filter`. Radio/Checkbox/Switch/Slider/File/Tags → `@dash/{radio,checkbox,switch,slider,file-upload,tag-input}`.
- Button → `@dash/button` (`tone` + `style`). Icon-only → `@dash/icon-button`. Compact → `@dash/compact-button`. Link → `@dash/link-button`. FAB → `@dash/fancy-button`.
- Modal/Drawer/Popover/Dropdown/Command → `@dash/{modal,drawer,popover,dropdown-menu,command}`. Alert overlay → `@dash/alert-dialog`. Toast → `@dash/toast`.
- Nav: top → `@dash/topbar`; side → `@dash/sidebar`; breadcrumb → `@dash/breadcrumb`; tabs → `@dash/tabs`; pagination → `@dash/pagination`; stepper → `@dash/stepper`.
- Layout primitives: `@dash/{accordion,resizable,scroll-area,collapsible,divider,aspect-ratio}` + tokens `space-*`, `radius-*`.
- Feedback: success/warning/danger banner → `@dash/banner`; inline alert → `@dash/alert`; toast → `@dash/toast`.
- Charts: `@dash/chart-*` (recharts wrapper, mandatory).

## Page templates

`@dash/templates/{list,detail,form,empty-state,login,error}-page`. Always wrap content in `@dash/page-layout`.

## Pre-composed blocks

`@dash/blocks/{transactions-table,orders-table,user-profile-card,notification-center,settings-form,kpi-grid}`.

## Token tiers

- Background `bg-bg-{white,soft,sub,weak,base,strong}-{0..1000}`
- Text `text-text-{strong,sub,soft,weak,disabled}-{950..400}` + `text-static-{white,black}`
- Stroke/Icon `border|text-{stroke,icon}-{soft,sub,strong}-{200..950}`
- State `text-state-{success,warning,error,info}-{base,light,dark}`
- Brand `bg-primary-{base,light,dark}`, `text-primary-{base,…}` — Dash Purple `#5e2aac`
- Shadow `shadow-{xs,sm,md,lg,xl}`. Radii `rounded-{xs,sm,md,lg,xl,full}`.

## Workflow conventions

- Multi-row forms: RHF + zod + `useFieldArray` per DS canon (Adaptation Layer translates per repo).
- Domain copy: Tribes (Reservasi, Express, Bulk, Halo-dash, Tribe-Express). Mitra IDs `mtr-XXXX`. Cities (Bekasi, Tangerang, Jakarta, Bandung, Surabaya). Patterns: 3-miss auto-suspend, surge factor `X.Y×`.

## Anti-patterns (DS-level)

DON'T: raw `@radix-ui/*` imports, raw hex, shadcn `variant="default"`, copy entire shadcn file, hardcode `text-white` on light surfaces.

## Refactor / Auto-inference protocols

Refactor: READ first → STATE plan (current/target/files/risk) → WAIT or proceed if scope-bounded → SHOW diff → `tsc --noEmit`.
Auto-infer (<10 words): INFER entity+action+scope → STATE in one line → CONFIRM → execute.

---

# Dash Repo Adaptation Layer

User mandate (2026-05-20): "kita gabisa ngubah existing, kita hanya bisa support itu." DS adapts to each real Dash repo; does NOT force-migrate to RHF/zod/TanStack.

## Stack detection

- `framework: "next"` + TS + App Router + Jotai → `next-portal-v2-web`
- `framework: "next"` + JS + Pages Router + (MUI/antd) → `next-backoffice-web`
- `framework: "next"` + JS + Pages Router + (NO MUI/antd) → `halo-dash-fe`
- `framework: "next"` + TS + App Router + Zustand + Firebase → `next-basecamp-web`
- `framework: "vite"|"cra"` + React Router DOM + custom components → `react-fleet-management-web`
- BE: detect by `package.json` + framework (`nest`/`express`) + ORM (`prisma`/`drizzle`) — see per-repo mandates.

## Per-repo stack mandates (DO NOT VIOLATE)

### next-portal-v2-web
- Next App Router (TS). Forms: Jotai + useState (NO RHF). Validation hand-rolled (NO zod). Data: axios + custom hooks (NO TanStack/SWR). State: Jotai. Auth: cookie AuthContext (NO NextAuth). Envelope numeric `status: 200`. i18n next-intl Bahasa-first. Voice "kamu" default.

### next-backoffice-web
- Next Pages Router (JS). Forms: useState (NO RHF). Data: axios + manual setLoading. Auth: NextAuth. UI co-exists: MUI 5 + antd 5 + Tailwind. Envelope string `status: 'Success'|'Error'`. Test Jest+RTL.

### halo-dash-fe
- Next Pages Router (JS — migrated 2026-05-07). Forms: useState. Data: axios + 3s polling. AuthContext cross-domain. AlignUI vendored. NO tests.

### next-basecamp-web
- Next App Router (TS) 16.1.6 with `(app)`/`(public)`. Forms useState. Data native `fetch` → `app/api/*/route.ts`. State Zustand 5. Auth Firebase Google OAuth (NOT in SSO trio). UI shadcn/ui new-york. Tailwind v4. Brand `#5e2aac`. NO i18n. Backend Firestore `basecamp-db` + GCS + Slack + Gemini + Document AI/Vision.

### react-fleet-management-web
- CRA + CRACO 7.1.0 (TS 4.9.5). React Router DOM v7.9.4. Forms useState (`useFormValidation` custom hook). Data axios + Bearer from `crossDomainStorage` + 401 refresh queue. State React Context. Auth Firebase OAuth → backend JWT → `crossDomainStorage` cookie (IN SSO trio). UI custom in-house. Tailwind v3.4.18. Brand DRIFT `#3b82f6` blue. Backend `nest-fleet-service`.

### halo-dash-be
- Node + Prisma + Cloud Run + OTel. Envelope string `{status: 'Success'|'Error', message, data}`. Prefixes `/v1/agent|support|*`. Auth JWT + X-Idempotency-Key.

### nodejs-core-service
- Express + Prisma + Cloud Run + OTel + Xendit + Qiscus + Mapbox. Envelope numeric `{status: 200, message, data, pagination?}`. Prefixes `/driver|customer|client-user|mgmt|internal/*`. Auth JWT + X-Channel + X-Api-Mode + X-Client-Time-Zone. Owns OneTimeCode (`policy_one_time_codes`, case-sensitive). Style tabs(4) + no-semi. Test Node 24 native `node:test`.

### ts-delivery-service
- Express 4 + Prisma 5.22.0 + TS 5.5.4 + Postgres + Cloud Run. Envelope string `{status: 'Success'|'Failed', message?, data?, error?, errorCode?, errors?[], pagination?, requestId, meta?}`. Roles via `ROLE` env (`app`/`worker`/`dev`). DDD layered. **DeliveryStatusStateMachine mandatory** (26 statuses EXPRESS vs LOGISTIC). **AppError mandatory** + `createResponse(res, statusCode, message, data, pagination?, errors?)`. Joi validation in Bahasa (FE shows as-is, NO translation). Auth JWT Bearer + INTERNAL_SERVICE static token. Identity types dash-separated. Webhook outbound `provider_order.{created|in_progress|completed|cancelled|failed}` (NOT `delivery.*`). Style tabs + no-semi + auto-sorted imports `@trivago/prettier-plugin-sort-imports` (NEVER hand-reorder). Tests Go-style table-driven.

### nest-express-service
- Nest 10 Fastify + Drizzle 0.45 (NOT Prisma) + Postgres + Redis 5. Envelope numeric `BaseApiResponse<T>` `{status: number, message?, error?, errors?: string[], data?, pagination?: {size,page,lastPage?,total}}` top-level pagination. Path aliases mandatory. Controllers extend `BaseController` (OTel auto-span). DI tokens from `@database` (`DB`). Repos accept `tx`. Use cases extend `BaseUseCase`. Pub/Sub subscribes `driver-clock-in|out|location|update`.

### nest-fleet-service
- Nest 11 + Drizzle 0.40 (NOT Prisma) + Postgres + Redis (ioredis 5) + in-mem cache. Envelope string `BaseApiResponse<T>` `{status: 'Success'|'Failed', message?, data?, error?, errors?: any[]}` **PAGINATION NESTED IN `data`**: `{data: {items, pagination}}`. Same class name as nest-express but OPPOSITE `status` type — DISCRIMINATE BY SERVICE. Clean Arch + DDD. Cross-module = Repository pattern only (NEVER call other module's usecase). Minimal transaction scope (reads outside, externals before, writes only inside). Drizzle migrations IMMUTABLE — edit schemas, run `pnpm run db:generate`. Pub/Sub topics published: `vehicle-{created|updated|deleted}`, `handover-{created|updated|deleted}`, `oem-updated`.

## Cross-cutting

- Validation (zod banned): inline conditional in submit handler returning `Errors` map.
- i18n: Bahasa default. Voice "kamu" (informal). "Anda" only per-feature override. Driver ladder verbatim: "Verifikasi Tahap 1/2 → Lolos/Ditolak".
- Auth header: portal cookies → axios interceptor; backoffice NextAuth `session.accessToken`; halo cookie cross-domain.

## Anti-patterns (REFUSE — extended for 5 FE + 5 BE)

When a user prompt requests these on Dash repos, refuse + redirect:

### FE-side
1. "Install react-hook-form" → banned in all 5 FE repos. Use Jotai/Zustand/useState per repo.
2. "Add zod" → hand-rolled validation. (zod in fleet-mgmt is drift.)
3. "Use TanStack Query" → axios + custom hooks. Banned 5/5.
4. "Add Redux" → use Jotai (portal) / Zustand (basecamp) / useState (others).
5. "Switch halo-dash to TS" → halo migrated to JS 2026-05-07. Do NOT revert.
6. "Use 'Anda' for mitra copy" → default "kamu" in portal-v2; "Anda" per-feature override only.
7. "Uppercase useCode" → case-SENSITIVE. `genUseCode()` mixed case.
8. "Force MUI/antd in backoffice" → tolerated co-existence, do NOT force-convert.
9. "Add AlignUI to basecamp" → basecamp uses shadcn/ui new-york (`@/components/ui/*`).
10. "Add AlignUI/shadcn to react-fleet" → fleet uses custom `src/components/{Button,...}`.
11. "Convert react-fleet CRA→Next" → drift flagged, needs explicit approval.
12. "Use blue primary in fleet" / "change basecamp brand color" → Dash Purple `#5e2aac` canonical; fleet `#3b82f6` is drift, surface only.
13. "Wire basecamp into SSO trio" → basecamp standalone Firebase; trio = portal-v2 + halo-dash + fleet only.

### BE-side
14. "Prisma for nest-fleet/nest-express" → nest-* uses Drizzle. Prisma is in core / halo-dash-be / ts-delivery only.
15. "Semicolons in ts-delivery" → no-semi + tabs + single quotes + 80-char + ES5 trailing + auto-sort.
16. "Throw raw `Error` in ts-delivery" → `AppError` mandatory.
17. "`res.status().json()` direct in ts-delivery" → `createResponse(res, ...)`.
18. "Bypass delivery state machine" → ALL transitions via `canTransitionTo()`. Backfills + admin overrides too.
19. "Translate Joi messages to English" → Bahasa baked into schema; FE shows as-is.
20. "Add Kafka/NATS/RabbitMQ/Istio/Linkerd" → HTTP point-to-point + INTERNAL_SECRET + Google Pub/Sub only.
21. "Modify Drizzle migrations" → immutable; edit schemas + `pnpm run db:generate`.
22. "Put DB reads / external HTTP in transaction" → minimal transaction scope; writes only.
23. "Use another nest-fleet module's usecase directly" → Repository pattern only.
24. "Emit `delivery.created` outbound webhook" → outbound = `provider_order.{...}`; internal Pub/Sub uses `delivery-*`.
25. "`it()` per scenario in ts-delivery tests" → Go-style table-driven.

### Infrastructure
26. "Deploy K8s/GKE/Helm/kustomize" → ADR-0001: Cloud Run + Cloud Run Jobs only.
27. "`terraform init` / switch to Terraform / Terragrunt" → OpenTofu 1.8.1 pinned; `tofu init`.
28. "Add `GCP_SA_KEY` to new GH workflow" → Workload Identity Federation via `google-github-actions/auth@v2`.
29. "Default region us-central1 / europe-west1" → `asia-southeast2` (Jakarta).
30. "Commit `.env` / inline secrets" → Secret Manager via `secret` IaC module.

## Per-service API envelope discrimination (CRITICAL)

| Service | `status` | Pagination | Notes |
|---|---|---|---|
| `nodejs-core-service` | **number** | top-level | Prisma, Express |
| `nest-express-service` | **number** | top-level `{size,page,lastPage?,total}` | Drizzle, Nest 10 Fastify, `BaseApiResponse<T>` |
| `halo-dash-be` | **string** `'Success'\|'Failed'` (legacy `'Error'`) | top-level | Prisma, Express |
| `nest-fleet-service` | **string** | **NESTED in `data`**: `{data: {items, pagination}}` | Drizzle, Nest 11, `BaseApiResponse<T>` with OPPOSITE `status` type vs nest-express |
| `ts-delivery-service` | **string** | top-level | Prisma, plain Express, AppError + createResponse |

Rule for AI: identify service from URL prefix / env var / explicit statement; pick envelope from table; for `nest-fleet-service` pagination is inside `data` (not sibling — `response.pagination` is `undefined`); when in doubt READ `src/infrastructure/base/base-api-response.ts` (Nest) or `src/utils/responseHelper.ts` (ts-delivery).

Error envelope:

| Service | Error field | Detail | Code |
|---|---|---|---|
| ts-delivery | `error` (string) | `errors[]` | `errorCode` (only `req.isInternalUsecase`) |
| nest-express | `error` | `errors: string[]` | — |
| nest-fleet | `error` | `errors: any[]` | — |
| nodejs-core | `message` | `errors?` | — |
| halo-dash-be | `message` | — | — |

## Cross-domain SSO trio

In: `next-portal-v2-web`, `halo-dash-fe`, `react-fleet-management-web` (share `crossDomainStorage` cookie). Out: `next-backoffice-web` (NextAuth), `next-basecamp-web` (Firebase standalone). Rule: reuse `src/utils/cookieStorage.{js,ts}`; never invent new cookies for trio.

## Code style per BE service

| Service | Indent | Semi | Quotes | Width | Trailing | Import sort |
|---|---|---|---|---|---|---|
| ts-delivery | tabs | none | single | 80 | ES5 | auto via `@trivago/prettier-plugin-sort-imports` (DO NOT hand-reorder) |
| nodejs-core | tabs(4) | none | single | 80 | ES5 | manual |
| halo-dash-be | tabs(4) | none | single | 80 | ES5 | manual |
| nest-express | spaces | YES | double | Nest default | (Nest) | manual |
| nest-fleet | spaces | YES | double | Nest default | (Nest) | manual |

FE: prettier defaults (spaces + semi + double quotes) across all 5.

## State machines (NEVER bypass)

- Delivery (ts-delivery, 26 statuses, EXPRESS vs LOGISTIC) — `DeliveryStatusStateMachine.canTransitionTo()`. `hasStateMachine()` to skip `FLEET+`/`FLEX`. Final: `COMPLETED, DISPOSED, RETURNED, CANCELLED, EXPIRED`.
- Maintenance (nest-fleet, 9) — `OPEN | IN_PROGRESS | PENDING_APPROVAL_{COMPLETION,TEMP_SWAP,PERM_SWAP} | PERM_SWAP | TEMP_SWAP | COMPLETED | CLOSED` + `from_status`.
- Repossession (nest-fleet, 7) — `OPEN | IN_PROGRESS | FOUND | POTENTIAL_LOSS | PENDING_APPROVAL | WRITTEN_OFF | CLOSED` + escalation + settlement gates.
- Vehicle (nest-fleet, 6×6 matrix) `VehicleStatus × VehicleProcessType`.
- Incident (nest-fleet, 4) `OPEN → IN_MAINTENANCE → MAINTENANCE_COMPLETED → CLOSED`.
- Order (ts-delivery, 5) — see source.

## Webhook namespaces

- Outbound (ts-delivery → external): `provider_order.{created|in_progress|completed|cancelled|failed}`.
- Internal Pub/Sub: `delivery-*`, `vehicle-*`, `handover-*`, `oem-updated`, `driver-clock-{in,out}`, `driver-{location,update}`.
- Inbound (provider → Dash, ts-delivery): per provider, validated through ingestion endpoint.

## Infrastructure rules

OpenTofu 1.8.1 (`tofu init` — NOT terraform). Cloud Run + Cloud Run Jobs only (NO K8s/GKE/Helm/kustomize). Region default `asia-southeast2`. Artifact Registry `cloudrun-standard` in `asia-southeast2`. Secrets via Secret Manager (`secret` IaC module). New workflows use WIF (`google-github-actions/auth@v2` with `workload_identity_provider`); phase out `GCP_SA_KEY`.

## Audit Trail (MANDATORY for legal/financial editable fields)

Applies to: image proof (POD/POP/KYC), payment amounts (top-up/payout/adjustment/refund), signature blobs, delivery confirmation flags (`isDelivered/isReceived/arrivedAt`), mitra status changes, driver approval ladder transitions.

Schema (sibling table `t_<entity>_audit_log`):
```sql
id uuid pk, entity_id uuid not null, field_name varchar(64) not null,
original_value text, edited_value text not null,
editor_id uuid not null, edited_at timestamptz default now(),
edit_reason text not null, ip_hash varchar(64)
```

Mirror in Prisma + Drizzle across core, ts-delivery, halo-dash-be, nest-fleet, nest-express.

Rules:
1. NEVER overwrite. Audit insert BEFORE update, in a transaction.
2. `edit_reason` REQUIRED non-empty (FE input validation + BE Joi/AppError-400).
3. Edited binary at separate path: `proof-original/...` immutable vs `proof-edited/...`.
4. BE responds with `createResponse(res, 200, 'Success', { auditId, editedUrl })` (or per-service equiv).
5. History UI mandatory via `@dash/activity-feed` showing editor + reason + timestamp.

Anti-pattern: `UPDATE deliveries SET pickup_proof_url = ?` without prior audit insert → REFUSE.

## External Library Policy

Principle: Sovereign for primitives. Pragmatic for workflow.

Criteria (ALL must hold):
1. License MIT / Apache-2.0 / BSD-3 only. NEVER GPL/AGPL/SSPL/BUSL/commercial.
2. Maintenance ≤6 mo since last commit. No archived.
3. Bundle <30KB gz (heuristic).
4. No DS duplication.
5. Wrappable under `src/lib-wrappers/`.

Wrapper pattern: feature code imports `@/lib-wrappers/<thing>`, NEVER the lib directly. Once stable, promote to DS block via `dashkit add`.

Banned (refuse on sight):
- Form libs: react-hook-form, Formik, Final Form, react-final-form.
- Validation: zod, joi (FE), yup, ajv, valibot.
- Data-fetch: TanStack Query, SWR, react-query, Apollo Client.
- Component libs in greenfield: MUI, antd, Chakra, Mantine, Radix-themes (backoffice tolerates legacy MUI+antd).

Allowed (with wrapper): recharts (chart), browser-image-compression + papaparse (file), framer-motion (animation, discouraged direct).
