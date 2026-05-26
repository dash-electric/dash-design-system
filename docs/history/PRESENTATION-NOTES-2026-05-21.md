# Presentation Notes — Head of Design Meeting

**Date:** 2026-05-21
**Presenter:** Irfan Prima Putra
**Audience:** Head of Design (Dash)
**Duration target:** 20–25 min (5 story + 10 demo + 10 Q&A)
**Repo:** `dash-ds` @ 49 commits, single-developer, 4 weeks

---

## 1. Meeting Objective

> Align on Dash DS direction + sponsor Wave 5 pilot.

Satu kalimat. Itu aja. Kalau keluar dari sini sponsorship pilot didapat + Trellis arah disepakati = menang.

---

## 2. Pre-Meeting Prep (Internal — Irfan)

Checklist sebelum masuk ruangan:

- [ ] Buka `localhost:3000/docs/architecture/layered` (live demo siap)
- [ ] Buka `localhost:3000/docs/architecture/themes` (side-by-side proof, tab terpisah)
- [ ] `ONBOARDING-PLAYBOOK.md` ready to scroll (user journey)
- [ ] 3 pilot user candidates names siap di kepala (jangan freeze waktu ditanya)
- [ ] `KILL-CRITERIA.md` open di tab — transparency signal, bukan dihindari
- [ ] 1Password Bearer token (pilot dashboard auth) shared via Slack DM saat meeting mulai
- [ ] Slack channel `#dash-ds-pilot` pre-created (tunjukin kalau pilot real, bukan slide-only)
- [ ] Laptop charged + HDMI/dongle siap
- [ ] Air minum (jangan kering tenggorokan menit ke-10)

---

## 3. Opening Hook (60 detik)

Pilih satu — tergantung mood Head of Design saat masuk:

- **Visual hook (default):** Buka `/docs/architecture/themes`, click Ride → Logistic → Travel → Marketplace. *"Same Button component, 4 brand faces. Ini Dash sebagai platform, bukan product."*
- **Number hook (kalau dia data-driven):** *"17 production blocks shipped, 0 lines of Dash production code modified. Pure additive — zero blast radius."*
- **Strategic hook (kalau dia mood vision):** *"Dash bukan ride-hail company. Dash adalah platform of products yang kebetulan mulai dari ride-hail."*

**Decision rule:** kalau dia bawa kopi → visual hook. Kalau dia langsung tanya "status" → number hook. Kalau dia tanya "vision" duluan → strategic hook.

---

## 4. Story Arc (5 menit)

### Problem (60s)

- 10+ team members vibe-code paralel, no shared foundation
- Brand drift sudah akumulasi: **1,913 hex hardcodes** di backoffice saja (baseline scan, `BASELINE-DRIFT-2026-05-20.md`)
- Product baru launching (Logistic, Travel, Marketplace) = setiap team re-derive everything = waste 240+ jam per launch
- AI tools (Claude/Cursor/Lovable) generate generic code — gak ngerti konteks Dash, Indonesia, OJK regulation, mitra voice

### Solution (90s)

- **Layered architecture (Layer 0–3):** Foundation → Primitives → Patterns → Products
- **Theme cascade:** product autonomy tanpa fork foundation
- **AI-native via Skill v3 multi-tenant:** Claude/Cursor punya Dash context built-in
- **Hermes autonomous deputy:** operational maintenance jalan tanpa Irfan

### Proof (90s)

| Metric | Value |
|---|---|
| Commits shipped | 49 (4 weeks, solo) |
| Registry items | 202 |
| Workflow blocks | 17 production |
| Test suite | 462 pass |
| E2E smoke | verified green |
| Theme scaffold | 5 (Ride + Logistic active; Travel/Marketplace/Trellis placeholder) |
| Pilot infra | ready (auth + dashboard + tracking) |

### Next (60s)

- **This week:** Wave 5 pilot 3 users
- **Q3 2026:** Dash Logistic launches with DS Day 1 (zero re-derive cost)
- **Q4 2026:** Travel + Marketplace onboard
- **2027:** Trellis external tenant pilot (SaaS arm, deferred decision)

---

## 5. Demo Flow (10 menit, ~5 min walk-through)

Pre-ordered, tab sudah dibuka semua sebelum meeting:

1. **`/docs/architecture/layered`** — jelasin 4 layer pakai diagram (30s)
2. **`/docs/architecture/themes`** — click Ride → Logistic → Travel side-by-side (45s) ⭐ *moment paling visual*
3. **`/docs/architecture/metrics`** — scoreboard scan, angka real (30s)
4. **`/docs/components/button`** — show 1 component doc page, polish level (15s)
5. **`/docs/onboarding`** — user onboarding flow, "ini yang user alamin Day 1" (45s)
6. **Terminal:** `dash add button` live (30s) — *AI-native moment*
7. **Terminal:** `dash audit --layer-only` → 0 violations (15s)
8. **`/docs/admin/pilot`** — pilot tracking dashboard, Bearer auth required (30s)

**Total demo:** ~4 menit. Sisa 6 menit buffer untuk pertanyaan in-line.

---

## 6. Q&A Prep — Likely Questions

Ranked by likelihood (Head of Design context):

**Q1: Bedanya sama shadcn / Material UI apa?**
A: Indonesian-context + multi-tenant + Layer 2–3 product autonomy + AI-native Skill v3 + audit-trail by default. Shadcn = greenfield generic, single-tenant. Material = Google-opinionated. Dash DS = Indonesia + multi-product platform + brownfield-aware.

**Q2: Kenapa gak pake Lovable / v0 / Cursor aja?**
A: Mereka greenfield single-player. Dash DS ship ke existing brownfield codebase, team-scoped, dengan Indonesian voice + OJK regulation context built-in. Market gap verified 2026-05-20 (WebSearch — no Indonesian multi-tenant DS w/ AI-native).

**Q3: Maintenance cost berapa?**
A: Hermes autonomous deputy handle 95% operational. Irfan strategic only (~50h/year vs 240h/year manual). Deputy human optional post-Wave 5 success.

**Q4: Tau dari mana ini works?**
A: 462 tests + E2E smoke verified loop. **Tapi jujur — real user adoption unproven.** Wave 5 pilot = critical validation. Live AI behavior simulated, real API test deferred ke pilot week.

**Q5: Risk-nya apa?**
A: Tiga utama:
- **Bus factor 1** — Irfan sole owner. Hermes mitigates ops, strategic ownership masih risk.
- **AI behavior under context pressure** — Skill v3 estimate +15–25pp accuracy, belum validated real user workflow.
- **Trellis productization timeline** — separate side project, defer post-Dash internal proof.

**Q6: Cost-nya berapa?**
A: 1 month single-developer + ~5M Claude API tokens build phase. Compare: 10 team members × 1 month re-derive per launch = 240 person-hours saved per product family launch (~Rp 250M opportunity cost).

**Q7: Kapan Dash Logistic dapet ini?**
A: Theme scaffold ready sekarang. Real blocks built saat launch ETA locked. ~2 minggu effort begitu timeline confirmed.

**Q8: External monetization gimana?**
A: Trellis = future SaaS arm. Free untuk internal client pertama (Dash + Dash products). External pricing $10–15/seat/mo SEA market. **Deferred — keputusan pasca Wave 5 validation.**

**Q9: Lu butuh apa dari gue (Head of Design)?**
A:
- Sponsor Wave 5 pilot (3 users blockless 1 minggu)
- Decision: Trellis stays under Dash atau eventual spin-off?
- Quarterly review cadence on kill criteria
- Brand exposure: present Dash DS di Indonesian design community talk?

**Q10: Kalau gagal gimana?**
A: `KILL-CRITERIA.md` ada — honest exit thresholds. T1.1/T1.2/T1.3 trip → pivot atau sunset. Sunk cost protected via documented decision tree. Bukan emotional escalation.

---

## 7. Asks (Closing, 2 menit)

Tiga eksplisit, ranked by urgency:

1. **Approve Wave 5 pilot kick-off minggu ini.** (decision needed today)
2. **Designate 3 pilot user candidates** — atau approve list yang sudah disiapkan. (decision needed within 48h)
3. **Schedule monthly review** — Wave 5 retro Day +7 sebagai checkpoint pertama. (calendar invite follow-up)

**Backup ask (kalau time allows):** brand exposure di komunitas designer Indonesia — Dash DS as case study talk. Low-effort high-reach.

---

## 8. Materials Checklist (Physical + Digital)

**Bawa ke meeting:**
- [ ] Laptop dengan localhost docs running (port 3000 confirmed before walk-in)
- [ ] `LAYERED-ARCHITECTURE.md` printed (optional, kalau dia tipe baca paper)
- [ ] `ONBOARDING-PLAYBOOK.md` printed (user journey reference)
- [ ] `KILL-CRITERIA.md` printed (transparency signal — taruh di atas tumpukan)
- [ ] 1Password Bearer token ready to share via DM
- [ ] `#dash-ds-pilot` Slack channel pre-created + invite link siap

**Standby digital:**
- [ ] `BASELINE-DRIFT-2026-05-20.md` (1,913 hex number source)
- [ ] `WAVE-5-PILOT.md` (pilot scope detail)
- [ ] `CHANGELOG.md` (49 commits proof)

---

## 9. Tone & Behavior Reminders

- **Honest > impressive.** Sebut "unproven" untuk Wave 5 dengan tegas. Kill criteria di-mention voluntarily.
- **Visual-first.** Designer audience — buka URL, jangan baca slide.
- **Indonesian casual.** "Lu" / "gue" kalau dia start casual. Switch formal kalau dia formal.
- **Don't oversell Trellis.** External SaaS = future, bukan sekarang. Anchor on Wave 5.
- **Time-check menit 15.** Kalau Q&A belum mulai, cut demo, masuk asks.
- **Silence is OK.** Setelah ajukan ask, diam. Jangan auto-fill.

---

## 10. Post-Meeting (Same Day)

- [ ] Send recap email/Slack: 3 asks status, follow-up dates
- [ ] Update `WAVE-5-PILOT.md` with sponsor decision
- [ ] Create calendar invite untuk monthly review (kalau approved)
- [ ] Log meeting notes ke vault `04-Dash/Dash-DS/meetings/2026-05-21-head-of-design.md`
- [ ] Slack `#dash-ds-pilot` announcement kalau pilot greenlit

---

*Doc ini bukan slide deck. Ini speaker note + pre-flight checklist. Slide dibikin terpisah kalau Head of Design minta — default mode = laptop demo, no slides.*
