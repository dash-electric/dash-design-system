# PRD — Dash Dashboard (Control Tower)
Date: 2026-05-28
Status: Draft v0.1 (post-handover)
Owner: Irfan (pending designate)
Audience: founder + engineering + design leadership

## TL;DR

Dash Dashboard = internal control tower yang menyatukan signal dari Dash Build (AI codegen daemon), Dash DS (component registry), GitHub (PR throughput), OpenAI (cost ledger), dan tribe app heartbeats. Saat ini live sebagai `/owner` route di-host Dash Build daemon. Plan: spin out jadi standalone repo + multi-tenant view per role.

**MVP slice**: 3 dari 8 widget pages (Runs feed, Cost & budget tracker, AI agent decision audit log) — 3 minggu effort, validate adoption sebelum invest 5 widget sisanya.

## 1. Problem

10+ PE tribes Dash beroperasi paralel. Tiap minggu ada: code shipping (PR), AI cost burn, DS adoption shift, incident, dispatch hiccup. **No single pane** untuk:

- Founder: "berapa cost AI minggu ini per tribe?"
- Ops lead: "incident apa yang aktif sekarang? siapa owner?"
- Designer: "component DS mana paling banyak dipakai? mana gap?"
- Engineer tribe: "PR gua dimana di queue? CI status?"

Sekarang answer = manual stitch dari Slack + GitHub + OpenAI billing + per-tribe ops boards. Time-to-insight = jam, not detik. Drift risk tinggi (PM ambil keputusan based on stale data).

**Hipotesis**: kalau kita kasih 1 dashboard yang refresh < 5 menit dan cover 8 signal di atas, decision velocity naik 3-5×, surprise rate (cost overrun, incident escalation late) turun 50%+.

## 2. User personas

### P1. Founder
- **Goal**: weekly sanity check — burn rate, momentum, blocker visibility
- **Pain**: Slack noise overwhelm, no aggregated view, harus tanya tiap lead manual
- **Use freq**: 2-3× per minggu, ~5 menit per session
- **Key widgets**: Cost tracker, PR throughput, Incident timeline, Tribe health board

### P2. Ops lead (Fayzul-tier role per tribe)
- **Goal**: real-time pulse — apa yang break, apa yang nge-blok
- **Pain**: switch context Slack ↔ ops board ↔ logs, no unified incident view
- **Use freq**: daily, multi-session, 5-15 menit per
- **Key widgets**: Incident timeline, Tribe health, AI agent audit log (kalau AI emit bad PR yang impact ops)

### P3. Designer (DS owner)
- **Goal**: DS adoption signal — what's used, what's missing, where drift happens
- **Pain**: no usage data, request inbox in chat (lost), gap discovery via complaint
- **Use freq**: weekly, 10-30 menit per session
- **Key widgets**: DS adoption heatmap, Component gap list, Decision audit log (AI's "candidate but not picked")

### P4. Engineer (per tribe IC)
- **Goal**: my PR pipeline status, my CI gate, where I'm blocked
- **Pain**: GitHub UI doesn't aggregate per-person + per-priority
- **Use freq**: daily, multi-session
- **Key widgets**: Runs feed (filtered to me), PR throughput personal slice

## 3. Goals + non-goals

### Goals
- Aggregate 5 data sources into single web UI behind Dash workspace SSO
- Refresh real-time (SSE) untuk hot data (live runs, incident), cached 5-min untuk warm (cost, throughput)
- Per-role view (founder vs ops vs designer vs engineer) — same dashboard, different default lens
- Mobile-readable (founder check di HP sambil meeting)
- Read-only initially. Write actions (incident assign, PR approve) later phase.

### Non-goals (v1)
- Bukan replacement untuk Datadog/Sentry (we'll embed/link, not rebuild)
- Bukan replacement untuk GitHub (we'll surface metrics, not edit PR)
- Bukan customer-facing
- Bukan multi-org (single Dash org only)
- Bukan editable dashboards (no widget drag-drop di v1)
- Bukan billing-grade audit (cost = approximation untuk operational awareness, not finance close)

## 4. User stories

### Founder
- U1. Sebagai founder, gua mau lihat cost AI mingguan per tribe biar bisa flag tribe yang over-budget.
- U2. Sebagai founder, gua mau lihat PR throughput trend 4-minggu biar tau momentum tiap tribe.
- U3. Sebagai founder, gua mau lihat list incident aktif >24h biar bisa nge-push owner-nya.
- U4. Sebagai founder, gua mau bookmark dashboard di HP untuk quick check.

### Ops
- U5. Sebagai ops lead, gua mau real-time feed semua run Dash Build yang gagal CI biar bisa intervensi cepat.
- U6. Sebagai ops lead, gua mau aggregate incident dengan SLA timer.
- U7. Sebagai ops lead, gua mau view tribe app heartbeat (last-seen, error rate) di 1 layar.

### Designer
- U8. Sebagai designer, gua mau lihat top-10 component DS by usage trend (rising / falling) biar tau mana hot.
- U9. Sebagai designer, gua mau lihat gap list: prompt yang AI agent ga nemu match di registry.
- U10. Sebagai designer, gua mau decision audit log per AI run: "agent shortlisted X, Y, Z, picked X, here's why".

### Engineer
- U11. Sebagai engineer, gua mau lihat run gua yang lagi jalan (filter by author) + status.
- U12. Sebagai engineer, gua mau click ke detail run → see thinking stream + decision tree.

## 5. Success metrics (90-day target)

### Leading indicators (weekly, week 1-12)
| Metric | Target |
|---|---|
| Unique active users / week | 12+ (founder + 4 lead + 7 engineer) |
| Sessions / week / user | 5+ avg |
| Median session duration | 3-8 min (anything <1 min = empty visit, >15 min = friction) |
| Page-view per session | 4+ widgets viewed |
| Mobile traffic share | >20% (founder uses HP) |

### Lagging indicators (week 8-12)
| Metric | Baseline | Target |
|---|---|---|
| Time-to-insight on "weekly cost per tribe" | 30 min (manual stitch) | <30 sec (dashboard) |
| Incident MTTR aware-to-acknowledge | 4 hr | <30 min |
| DS gap-component shipped per month | 0 (no signal) | 3+ (gap list drives roadmap) |
| Founder Slack questions about ops state | ~5/week | <1/week |
| Dash Build run cost surprise rate | unknown | <5% (dashboard alert before runaway) |

### Counter-metrics (watch — don't optimize)
- Avoid replacing real conversation with stat-watching
- Avoid stale data anxiety (refresh too aggressive = noise)
- Avoid surveillance-mode usage (engineer feeling watched)

## 6. MVP slice (3 widgets, 3 weeks)

### Why subset
8 widgets × full polish = ~12 weeks. Founder adoption hipotesis ada di 3 widget pertama. Build them well, validate, then expand.

### Pick + rationale

| Widget | Why first | Owner persona | Effort |
|---|---|---|---|
| **1. Runs feed (Dash Build sessions)** | Highest event volume, real-time SSE proof-of-concept | Engineer + Ops | 1 week |
| **2. Cost & budget tracker** | Highest founder pain (cost surprise), simplest data (OpenAI usage API), 1 chart + 1 table | Founder | 1 week |
| **3. AI agent decision audit log** | Differentiator vs generic dashboards, demonstrates observability story, drives DS roadmap | Designer + Engineer | 1 week |

### Why skip (for now)
- **DS adoption heatmap**: needs tribe apps actually using @dash-electric registry first (chicken-and-egg)
- **PR throughput**: GitHub Insights already does 80% — embed or defer
- **Tribe app health board**: needs heartbeat protocol shipped per tribe app (cross-team work)
- **Component request gap list**: derivable from widget #3 (AI decision audit). Aggregate later.
- **Incident timeline**: needs incident schema + writer flow → separate sprint

## 7. Post-MVP roadmap

### Phase 2 (week 4-6) — Founder + designer expansion
- DS adoption heatmap (consume registry telemetry shipped in Layer 2 runtime plan)
- Component request gap list (aggregate from decision audit)
- Cost alert (Slack/email) when tribe > threshold

### Phase 3 (week 7-9) — Ops depth
- Incident timeline with assign + SLA
- Tribe app health board (heartbeat protocol)
- Write actions: incident acknowledge, PR approve from dashboard

### Phase 4 (week 10-12) — Multi-tenant + governance
- Per-role default views
- Audit log of dashboard read+write actions
- API for external integration (Slack bot, etc)

## 8. Open product questions (need decision before TRD lock)

| # | Question | Hypothesis | Decider |
|---|---|---|---|
| Q1 | Standalone repo or monorepo with `dash-ds`? | Monorepo until phase 3, then split | Irfan |
| Q2 | Auth: Google SSO via Dash workspace? Or custom JWT? | SSO (lowest friction, leverages existing Google Workspace) | Irfan + IT |
| Q3 | Hosting: Vercel / Cloudflare / self-host on Dash infra? | **DECIDED 2026-05-28: Railway** ($5/mo Starter cover MVP, Next.js zero-config, PR previews) | Irfan |
| Q4 | When to introduce write actions (vs read-only forever)? | Phase 3, after read-only adoption proven | Irfan |
| Q5 | How long to retain run history (telemetry storage)? | 90 days hot, 1 year cold, GDPR-compliant purge for PII prompts | Legal + Irfan |
| Q6 | Public dashboard URL or VPN-only? | SSO behind public URL OK (Dash workspace identity) | IT + Irfan |
| Q7 | Allow tribe-specific customization (their own widgets)? | No in v1, evaluate after 5 tribes adopted core | Irfan |

## 9. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Founder doesn't adopt (use Slack instead) | MED | HIGH | Demo session week 2, embed in founder routine (Monday morning check) |
| Cost data inaccuracy (OpenAI usage API delay) | HIGH | MED | Show "as of 5 min ago" stamp, allow manual refresh |
| Heartbeat protocol blocks Phase 3 | MED | MED | Define schema in TRD, ship reference impl, then ask 1 tribe to consume |
| Compliance / data residency for telemetry | LOW | HIGH | Default Indonesia-region storage, audit access logs |
| Dashboard becomes "another tool to maintain" | HIGH | MED | Auto-gen widget pages from data contracts (no manual layout per widget) |
| Vapor-ware perception (mock UI → real didn't ship) | HIGH | HIGH | Ship MVP fast (3 widgets), label everything Beta until real data flowing |

## 10. Definition of done (MVP)

- [ ] 3 widgets live with real data, refresh < 5 min
- [ ] 5 active users (founder + 4 lead) measured via analytics
- [ ] Mobile responsive at 375px
- [ ] Dash DS components only (no raw CSS / external UI lib)
- [ ] Light + dark mode
- [ ] Sub-3s p95 page load
- [ ] SSE stream for Runs feed
- [ ] Auth via Dash workspace SSO
- [ ] Documented in `docs/` site + linked from Dash Build `README.md`
- [ ] 1 weekly retro with users to capture feedback (week 1, 2, 3, 6, 12)

---

Related: [[dash-dashboard-trd-2026-05-28]] · [[agent-observability-protocol-2026-05-28]] · [[ds-coverage-gap-2026-05-28]]
