# PPT/Report Output — Feature Spec (DRAFT)
Date: 2026-05-28
Status: DRAFT v0.1 — NEEDS user approval to implement
Owner: Irfan (pending designate)
Scope: NEW capability for Dash Build — generate `.pptx` report from prompt + data

---

## TL;DR

User asked: "outpunyaa nanti ga hanyaa UI ajaa dud, dia bisa nanti ke PPT juga nanti sehingga bisa dipake buat report juga karena secara data lu bisa akses kan yaa karena BE dapat".

Current Dash Build = TSX/JSX page generator → GitHub PR. PPT output = **NEW pipeline**: prompt → data fetch → narrative gen → chart gen → slide layout → `.pptx` export.

This spec captures scope, decisions needed, effort estimate. Implementation gated by user approval.

---

## 1. Problem

Founder/PM/ops Dash regularly produce:
- Weekly business review (WBR) decks
- Monthly investor update
- Tribe performance report
- Incident post-mortem deck
- Pitch deck untuk pipeline opportunity

Today: manual stitch in Google Slides / Keynote. 2-4 hours per deck. Slides drift from brand. Charts re-made every time. Data manually pulled.

Hypothesis: Dash Build dengan PPT output = WBR 30 menit, brand consistent, charts auto-generated dari source data.

---

## 2. Real data access — current state

User asked specifically about real data. Honest answer:

### What Dash Build CAN access today
- Local repo files (read via `git clone`)
- Dash DS component registry (`apps/docs/registry.json`)
- OpenAI API (text generation)
- GitHub API (PR create, repo metadata)

### What Dash Build CANNOT access (yet)
- Production database (mitra, transaction, order data) — needs read-only credential bridge
- Real OpenAI usage data — Usage API integration TODO (in Dashboard spec)
- Real tribe app telemetry — heartbeat endpoint ready, tribe apps not emitting yet
- BigQuery / data warehouse — no connector
- Google Sheets / Notion ops data — no connector
- Sales pipeline (CRM) — no integration

### Implications for PPT output
- **WBR with real metrics**: needs DB connector first
- **Mock-data deck (for design/template testing)**: ✅ possible today
- **Pitch deck with narrative + chart**: ✅ possible today with fixture data
- **Real-time dashboard snapshot to deck**: needs Dashboard `/api/v1/*` integration (post-Dashboard MVP)

---

## 3. User personas

| Persona | Use case | Frequency |
|---|---|---|
| **Founder** | Monthly investor update + WBR cover slides | Weekly + monthly |
| **Ops lead** | Weekly tribe performance review | Weekly |
| **PM** | Feature launch retrospective | Per launch |
| **Designer** | Design review deck | Per project |
| **Finance** | Budget/burn review | Monthly |
| **Sales (future)** | Pitch deck custom per prospect | Per deal |

---

## 4. Goals + Non-goals

### Goals (MVP)
- Prompt → generate `.pptx` file downloadable
- Dash brand template (cover, content, chart, divider, summary slide masters)
- Auto-chart from inline data (CSV paste OR JSON OR query result)
- AI narrative on slide notes (speaker script)
- Operational density per `design.md` — no decorative gradient, hairline divider, Plus Jakarta Sans, restrained color

### Non-goals (MVP)
- Real-time data refresh (deck = snapshot at gen time)
- Animated slides (no transitions)
- Video embed
- Collaborative edit (deck = output artefact, edit di Keynote/Slides)
- Auto-publish to Google Slides (download `.pptx` only, MVP)
- Pivot table / dynamic filter (deck = static)

### Phase 2 candidates
- Google Slides export (via Drive API)
- Live data link (deck regen scheduled)
- Multi-language (EN/ID)
- Template versioning (v1 / v2 / "Q4 2026 brand refresh")
- Stakeholder-specific deck (founder vs investor vs board)

---

## 5. User stories

| # | As | I want | So that |
|---|---|---|---|
| US-01 | Founder | type "WBR untuk minggu lalu" + paste CSV cost data → dapet 5-slide deck | Senin pagi siap presentasi tanpa 2 jam manual |
| US-02 | PM | type "retro launch feature X" + paste user feedback → deck 4 slide | Quick share ke stakeholder pasca-launch |
| US-03 | Designer | type "design review tribe Ride" + attach screenshot → deck 6 slide | Standardized format design crit |
| US-04 | Ops | type "incident timeline 2 minggu lalu" → deck dengan timeline + impact + post-mortem | Easy share ke leadership tanpa rebuild |
| US-05 | Finance | type "monthly burn vs budget" + paste numbers → deck 3 slide dengan chart | Monthly review prep 15 menit |
| US-06 | Anyone | download `.pptx` → buka di Keynote/PPT → edit kalau perlu | Tool ≠ lock-in, output portable |

---

## 6. MVP slice (1-2 minggu)

### Pilih 1 deck template untuk MVP
**Recommend**: **WBR template** (5 slide) — highest frequency, founder pain.

Slides:
1. **Cover** — title + week range + author
2. **Snapshot** — 3 KPI big number (revenue / orders / NPS atau equivalent)
3. **Trend chart** — 4-week line chart for 1 main metric
4. **Highlight + Lowlight** — 2-column bullet list
5. **Action items** — owner + due date table

### Data input MVP
- Inline CSV paste di prompt
- JSON paste
- (NOT: live API fetch, BigQuery, Sheets — Phase 2)

### Output MVP
- `.pptx` file download
- (NOT: Google Slides export — Phase 2)

---

## 7. Tech stack (proposed)

| Layer | Pick | Rationale |
|---|---|---|
| PPT generation | **`pptxgenjs`** | Node lib, MIT, mature, charts built-in, Dash brand fonts importable |
| Chart engine | `pptxgenjs` native charts (line/bar/pie) | Built-in, no extra dep |
| Image embed | sharp / native | Logo, icons, screenshot |
| AI narrative | OpenAI (existing) | Same provider as code gen |
| Template system | TS class per deck type (`WBRTemplate`, `RetroTemplate`) | Type-safe, version-able |
| Brand assets | `packages/dash-build/src/pptx/assets/` | Logo SVG, brand colors, font (Plus Jakarta Sans embed) |
| Storage | Local download → user manual upload to Drive | MVP — no cloud yet |

### NOT in stack
- LibreOffice headless (overkill)
- HTML-to-PDF then convert (lossy)
- Apache POI Java (wrong runtime)
- Custom XML emitter (`pptxgenjs` solves this)

---

## 8. Pipeline architecture

```
prompt + (optional data paste)
  ↓
[Intake] extract deck type + key metrics + audience
  ↓
[Data parser] parse CSV/JSON → structured rows
  ↓
[Narrative gen] AI write speaker notes + bullet text per slide
  ↓
[Chart gen] pick chart type per metric → pptxgenjs chart spec
  ↓
[Layout] apply Dash brand template → slide assembly
  ↓
[Validate] checks: no PII leak, color contrast, font fallback
  ↓
[Export] write .pptx → download URL
  ↓
[Log] AOP event "artifact" with deck metadata (slide count, chart count, cost)
```

---

## 9. Open questions (decide before build)

| # | Question | Default assumption | Decider |
|---|---|---|---|
| Q1 | MVP template = WBR only? Atau 2-3 sekaligus (WBR + retro + design review)? | WBR only (smallest scope, fastest validate) | Irfan |
| Q2 | Data source MVP = paste only? Atau juga upload CSV file? | Paste only (simpler UI) | Irfan |
| Q3 | Output destination = local download? Atau auto-attach ke GitHub PR? | Local download MVP, GitHub PR Phase 2 | Irfan |
| Q4 | Brand fonts — embed Plus Jakarta Sans di `.pptx`? (license OK kalau Google Fonts) | Yes embed (consistency across machines) | Designer |
| Q5 | Chart styling — Dash semantic colors (state-*) atau custom palette? | Dash semantic (reuse tokens) | Designer |
| Q6 | Multi-page beyond 5 slides — limit di MVP? | Cap 10 slide MVP, infinite Phase 2 | Irfan |
| Q7 | Real data integration — pilot with which BE first? (Backoffice DB / Halo-Dash / Tribe app heartbeat) | Defer Phase 2 — MVP paste data only | Irfan + Eng |
| Q8 | PPT vs Google Slides priority? | PPT MVP (download `.pptx` portable), Google Slides Phase 2 | Founder + ops |
| Q9 | Pricing model — same daemon (free internal), atau hosted SaaS Phase 3? | Internal-only forever (per Dash Build PRD scope) | Founder |
| Q10 | Audit deck — when stakes high (board, investor), need human review gate? | Yes — auto-mark "review required" if recipient = external | Compliance + Founder |

---

## 10. Effort estimate

| Phase | Scope | Effort |
|---|---|---|
| **Phase 0** | This spec + 2 alternative templates exploration | 1 hari |
| **Phase 1 (MVP)** | WBR template + paste-data + download .pptx | 1-2 minggu |
| **Phase 2** | 2-3 more templates (retro, design review, finance burn) + Google Slides export | 2-3 minggu |
| **Phase 3** | Real data connectors (BigQuery, Sheets, BE DB read) | 4-6 minggu |
| **Phase 4** | Live data refresh + scheduled regen + stakeholder-specific decks | 6-8 minggu |

**MVP total = 2-3 minggu** (Phase 0 + 1).

**Caveat**: requires Wave 3 done (current state ✅) + at least Dashboard widget #1 (Runs feed) live so PPT pipeline can log to AOP.

---

## 11. Data integration roadmap (deeper answer to "BE dapat?")

| Data source | Today | MVP needs | Phase 2 | Phase 3 |
|---|---|---|---|---|
| Backoffice production DB | ❌ no creds | ❌ skip | ⚠️ read-only role only + PII redact | ✅ real-time via Dashboard ingest |
| Portal-v2 production DB | ❌ no creds | ❌ skip | ⚠️ same | ✅ same |
| Halo-Dash DB | ❌ no creds | ❌ skip | ⚠️ same | ✅ same |
| OpenAI Usage API | ❌ TODO | ❌ skip | ✅ via Dashboard Cost widget | ✅ aggregate cross-tribe |
| GitHub PR stats | ❌ no webhook live | ❌ skip | ✅ via Dashboard PR widget | ✅ historical 90d trend |
| Tribe app heartbeat | ⚠️ endpoint ready, no producer | ❌ skip | ⚠️ depends on tribe apps emitting | ✅ live SLA tracking |
| BigQuery analytics | ❌ no connector | ❌ skip | ⚠️ if needed | ✅ standard ETL |
| Google Sheets ops data | ❌ no connector | ❌ skip | ✅ Drive API + Sheets API | ✅ scheduled sync |
| Notion ops boards | ❌ no connector | ❌ skip | ⚠️ if needed | ✅ Notion API |
| Manual CSV/JSON paste | ✅ trivial | ✅ MVP starts here | ✅ keep | ✅ keep |

**Reality**: real data integration = bigger than PPT pipeline itself. Recommend ship paste-data MVP first, validate template, THEN invest in connectors per real demand.

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `pptxgenjs` chart engine limited (advanced charts not supported) | MED | MED | Stick to line/bar/pie MVP, fallback to image-embed for complex |
| Brand font license issue | LOW | MED | Plus Jakarta Sans = Google Fonts OFL = OK embed |
| Generated narrative wrong/misleading | HIGH | HIGH | Mark all narrative as "AI-generated, review before send"; human review required for external |
| PII leak in paste data | MED | HIGH | Input scan + redact (email regex, phone, ID number patterns) |
| Cost spike (chart-heavy deck = many AI calls) | MED | LOW | Budget cap per deck $0.50 hard, alert if breach |
| Output `.pptx` corrupt | LOW | MED | Validate file open-able post-gen + checksum |
| Brand drift between PPT + UI | MED | LOW | Share design tokens via Layer 0 (single source) |

---

## 13. Acceptance criteria (MVP)

- [ ] Type "WBR untuk [date range]" → deck `.pptx` downloadable in <60s
- [ ] Deck has 5 slides per WBR template
- [ ] Charts render correctly when opened di Keynote, PowerPoint, Google Slides import
- [ ] Plus Jakarta Sans embedded (no font fallback ugly)
- [ ] Dash semantic colors used (no random palette)
- [ ] Speaker notes per slide (script for presenter)
- [ ] No PII leak (test with prompt containing email/phone)
- [ ] Cost <$0.20 per deck typical
- [ ] AOP event logged
- [ ] 1 founder + 1 ops successfully ship 1 deck without help

---

## 14. Next step kalau di-approve

1. **User approve** spec ini (Q1-Q10 jawab dulu)
2. **Pick 1 sample WBR** dari output Irfan/founder past month → reference
3. **Build Phase 0 prototype**: paste data + 1 hardcoded chart → `.pptx` smoke test (1 hari)
4. **Spec WBR template** detail: slide-by-slide layout (designer + Irfan, 0.5 hari)
5. **Implement Phase 1**: full pipeline + template + UI (1-2 minggu)
6. **Pilot with founder**: 1 real WBR weekly for 4 weeks → iterate
7. **Phase 2 trigger**: founder NPS >7/10 on Phase 1 → expand template library

---

## 15. Out of scope (explicit)

- Real-time collaborative editing
- Custom theme builder (designers edit slide master)
- AI image generation for slide cover (DALL-E etc) — Phase 3 maybe
- Multi-language deck (EN/ID) — Phase 3
- Animation / transition / video — never (defeats portability)
- Auto-publish to Twitter/LinkedIn/internal blog — never (output ≠ distribution)

---

## TL;DR for user

**YES, PPT output feasible** dengan stack `pptxgenjs` + existing AI pipeline. Effort: 2-3 minggu MVP.

**Real data access** = LIMITED sekarang. Mock/paste-data MVP first, real BE connectors = Phase 2-3 (4-8 minggu after).

**Recommend**: jawab Q1-Q10 + approve spec → gua dispatch agent build Phase 0 prototype (1 hari) → iterate.

---

Related: [[dash-dashboard-prd-2026-05-28]] · [[dash-dashboard-trd-2026-05-28]] · [[E2E-TEST-PLAYBOOK-2026-05-28]]
