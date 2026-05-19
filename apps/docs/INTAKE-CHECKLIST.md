# Repo Intake Checklist — Phase 1 Prep

Yang lu siapin sebelum gua mulai Phase 1 (extract real Dash domain rules dari product repos). Total prep effort: ~20 menit.

> **Trigger**: Post-deploy. Setelah `ds.dash.com` live + smoke green, gua butuh akses ke product repos buat build domain glossary + Skill content. Tanpa intake = AI ga tau Dash Express terminology.

---

## 1. Repo list (priority-ranked)

Pilih 2-3 repo paling representatif. Saran:

| Priority | Repo | Why |
|---|---|---|
| 1 (must) | `dash-tech/<dash-express-portal>` | Most-used FE, has delivery/mitra/use-code domain |
| 2 (must) | `dash-tech/<dash-express-api>` | Backend conventions, API envelope shape, validation patterns |
| 3 (recommended) | `dash-tech/<halo-dash-frontend>` | Different domain (CS/support) for breadth |
| 4 (optional) | 1 more FE/BE | Cross-check naming consistency |

Lu fill ↓ (replace `<...>` with real repo names):

```
1. dash-tech/_________________
2. dash-tech/_________________
3. dash-tech/_________________
```

---

## 2. Access mode (pick one)

### Option A — GH collaborator (recommended, ~5 min)
- Add gua sebagai read-only collaborator di tiap repo
- Gua clone via `gh repo clone` local
- No code leaves machine

### Option B — Local clone (zero GH setup)
- Lu `gh repo clone` 3 repo ke `/Users/irfanprimaputra.b/dash-product-repos/<name>/`
- Gua scan path tersebut
- Zero account/permission shuffle

**Pick:** [ ] A  [ ] B

---

## 3. Sensitive area markers

File path yang **TIDAK boleh** dibaca (gua skip explicitly). Common:

- [ ] `secrets/` directory
- [ ] `.env.production` (just structure OK, no values)
- [ ] `customer-data/` exports
- [ ] `billing/invoices/` (real customer PII)
- [ ] `migrations/` with seeded test users containing real names
- [ ] (other): _________________

Default: gua auto-skip `*.env*`, `*.pem`, `*.key`, `secrets/*`, anything in `.gitignore`.

---

## 4. Domain priority

Pilih top-3 domain yang PE paling sering kerja. Gua fokus extraction di sana dulu (sisa = stretch goal).

| Domain | Description | Priority |
|---|---|---|
| Delivery | Create / list / dispatch | [ ] |
| Mitra | Onboarding / suspend / level mgmt | [ ] |
| Order | Booking / status / history | [ ] |
| Billing | Invoice / payment / refund | [ ] |
| Outlet | Pickup location mgmt | [ ] |
| Driver app | Driver-side flow | [ ] |
| Customer app | End-user flow | [ ] |
| Auth | Login / OTP / role | [ ] |
| (other): __________ | | [ ] |

Pick top-3:
```
1. _________________
2. _________________
3. _________________
```

---

## 5. Stack hints (kalau lu inget, kalau ga gua scan)

Buat speed-up Phase 1. Skip kalau ga inget — gua scan sendiri.

- Framework: ☐ Next.js App ☐ Next.js Pages ☐ Vite ☐ Remix ☐ (other)
- State mgmt: ☐ TanStack Query ☐ useSWR ☐ Zustand ☐ Redux ☐ (none)
- Forms: ☐ react-hook-form + zod ☐ Formik ☐ (other)
- Styling: ☐ Tailwind ☐ CSS Modules ☐ styled-components
- Auth: ☐ JWT bearer ☐ session cookie ☐ NextAuth ☐ (other)
- BE: ☐ NestJS ☐ Express ☐ Hono ☐ Fastify ☐ (other)
- DB: ☐ Postgres ☐ MySQL ☐ MongoDB
- API style: ☐ REST ☐ GraphQL ☐ tRPC

---

## 6. Quick context dump (optional, 5 menit lu nulis)

Kalau lu sempet, tulis 3-5 kalimat free-form context. Saves gua 2 jam scanning.

**Example:**
> "Dash Express portal = main backoffice. PE paling sering edit list-detail pages (mitra/delivery/order). Backend pakai NestJS + Postgres, JWT bearer 1hr expiry + refresh 30d. Forms semua RHF + zod. Use-code = 6-digit alphanum, generated frontend via `lib/use-code.ts genUseCode()`, validated backend di dispatch endpoint. Error envelope shape `{error: {code, message, details}}`. List API pagination `{data, meta: {total, page, perPage}}`."

**Lu nulis di sini:**

```
[ free-form context here ]
```

---

## 7. Sign-off

Setelah 1-6 di-fill, ping gua dengan format:

```
INTAKE READY
repos: <r1>, <r2>, <r3>
access: <A or B>
domains: <d1>, <d2>, <d3>
context: <link to filled checklist or paste>
```

Gua start Phase 1 autonomous within same response. Expected output Phase 1 (1-2 hari):

1. **`dash-ai-rules.md v2`** — real domain glossary, real naming conventions, real API patterns extracted from your code
2. **Entity-to-component map** — "delivery list → @dash/templates/list-detail-page + @dash/data-table + custom <DeliveryStatus>"  
3. **Sample 10 "intent → file + components" mappings** — basis for auto-inference protocol
4. **Living docs page** — `https://ds.dash.com/docs/conventions` showing extracted rules

---

## What I'll NOT do

Privacy guarantees, repeat for clarity:

- ❌ Upload code to any third-party API
- ❌ Include real PII in extracted rules (customer names, phone numbers, emails)
- ❌ Publish anything outside private `dash-ds` repo
- ❌ Train external models on this code
- ❌ Read files explicitly marked sensitive in Section 3
- ❌ Touch BE secrets / DB credentials / API keys

What I WILL do:

- ✅ Read source files locally
- ✅ Extract patterns (naming, conventions, API shapes)
- ✅ Build glossary from publicly-named domain entities (delivery, mitra — these are not secrets)
- ✅ Write rules to `dash-ds/registry/rules/dash-ai-rules.md` (private repo, Bearer-gated)
- ✅ Show diff to you before commit, so you can redact if needed

---

## Estimated timeline post-intake-ready

| Day | Output |
|---|---|
| Day 1 | Scan + extract conventions + draft v2 rules |
| Day 2 | Refine glossary + build entity-to-component map + docs page |
| (then) | Phase 2 — build `@dash/skill` package using these rules as content |

After Phase 2 done → 1 PE pilot test with real "orang bodoh prompt".
