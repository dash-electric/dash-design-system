# OVERNIGHT-QUESTIONS — 2026-05-28
Auto-generated during overnight autonomous run (Tier A + B scope per user direction).
**Bangun pagi: baca file ini dulu. Jawab batch. Lalu pilih next slice.**

## Session output (4 jam autonomous, 9 files written)

| # | File | Size | Status |
|---|---|---|---|
| 1 | `docs/backoffice-shim-diagnosis-2026-05-28.md` | ~5KB | ✅ root-cause found |
| 2 | `docs/ds-coverage-gap-2026-05-28.md` | ~? | ✅ 73.5% avg coverage, top 3 gaps identified |
| 3 | `docs/a11y-audit-2026-05-28.md` | ~6KB | ✅ 12 findings (3 HIGH / 5 MED / 4 LOW) |
| 4 | `docs/mobile-responsive-review-2026-05-28.md` | ~7KB | ✅ 11 layout breaks + CSS patch ready |
| 5 | `docs/specs/agent-observability-protocol-2026-05-28.md` | 17KB | ✅ AOP v1.0.0 — 9 events, SSE/JSONL/MD wire |
| 6 | `docs/specs/control-tower-autogen-2026-05-28.md` | 14KB | ✅ TS pseudocode + CLI contract |
| 7 | `docs/specs/dash-dashboard-prd-2026-05-28.md` | ~8KB | ✅ MVP 3 widgets picked + roadmap |
| 8 | `docs/specs/dash-dashboard-trd-2026-05-28.md` | ~22KB | ✅ Architecture + stack + F1-F14 + migration |
| 9 | `docs/specs/ds-layer-2-theme-runtime-plan-2026-05-28.md` | ~8KB | ✅ themes already extracted; runtime gaps mapped |

**Total artefacts**: 9 MD spec/audit files. Zero git push. Zero external action. All local.

---

## Decisions needed from Irfan (priority order)

### 🔴 Block sprint kickoff (decide before invest)

**Q1. Backoffice shim fix — apply?**
- Root cause: shim exports `AuthProvider`, backoffice imports `{ AuthContextProvider }` (named).
- Fix: rename stub export to `AuthContextProvider`, drop default export, bump shim v2 → v3.
- Effort: 30 min code + 30 min test.
- Decide: ✅ apply now / ⏸ defer / 🔄 different approach.

**Q2. Dashboard MVP slice — confirm 3 widgets?**
- Plan agent picked: Runs feed + Cost tracker + Tribe app health board.
- My PRD picked: Runs feed + Cost tracker + AI agent decision audit log.
- Different #3. Tribe health = forces alerting pipeline early. Audit log = differentiator + DS roadmap signal.
- Decide: ✅ tribe health / ✅ audit log / ⏸ both / 🔄 other.

**Q3. Top 3 DS gap — ship which next?**
- BulkActionBar (blocks 6 prompts) — sticky multi-select toolbar
- DiffView (audit log + comparison table) — before/after diff primitive
- DateRangePicker (every analytics dashboard) — extend existing date-picker
- Effort: ~3-5 days per component (write + test + register + doc).
- Decide: 1 / 2 / 3 / all-3-parallel.

**Q4. AOP schema distribution — extract package OR inline in dash-build?**
- Extract `@dash/aop-schema` npm package = third-party tooling validate without daemon dep
- Inline = simpler now, harder to share with Dashboard later
- Plan agent recommendation: extract before Dashboard work begins
- Decide: ✅ extract / ⏸ inline now, extract Phase 2.

### 🟡 Strategic (can wait but better decide before Phase 1)

**Q5. Repo strategy — Dashboard monorepo (`packages/dashboard/`) or standalone repo?**
- Default both PRD + TRD pick: stay monorepo MVP, extract Phase 4 (week 13-16).
- Counter-argument: separate from day 1 = clean dep graph but slower iteration.
- Decide: ✅ monorepo / 🔄 standalone now.

**Q6. Auth model — real Google SSO MVP or stub?**
- TRD recommend: real Google SSO MVP (~30 min config).
- Counter: stub for week 1, real Phase 1. Saves 30 min, costs security debt.
- Decide: ✅ real SSO / ⏸ stub.

**Q7. Hosting — Vercel / Cloudflare / self-host?**
- TRD recommend: Vercel for MVP (free tier covers, matches `apps/docs`).
- Open: if egress spikes, fall back Fly.io.
- Decide: ✅ Vercel / 🔄 Cloudflare Workers / 🔄 self-host Dash infra.

**Q8. DS adoption telemetry — opt-in or opt-out di `dash add`?**
- PRD recommend: opt-out, hashed user, no PII. CLI flag `dash add --no-telemetry`.
- Counter: opt-in respects privacy default but adoption visibility delayed.
- Decide: ✅ opt-out / 🔄 opt-in / 🔄 disable entirely MVP.

### 🟢 Polish (can defer)

**Q9. HTML control tower — apply mobile + a11y fixes?**
- Mobile responsive CSS patch ready (~60 lines, 1.5hr work, fixes 11 breaks)
- A11y H1-H3 ready (~30 min, fixes skip-link + landmarks + agent console roles)
- Decide: ✅ apply both / ⏸ defer until audience confirmed real / 🔄 one only.

**Q10. Add "prototype — not yet wired" disclaimer di mock UI section HTML?**
- Risk: demo ke leadership could over-promise.
- Effort: 10 min badge insert.
- Decide: ✅ add now / ⏸ skip.

**Q11. Theme runtime work — start which gap first?**
- G1 (`dash theme set` CLI) — 4-6h, unlock tribe adoption
- G2 (`dash audit no-raw-hex`) — 2-3h, CI enforcement
- G3 (DashThemeProvider) — 3h, runtime API
- Decide: G1 / G2 / G3 / sequence semua.

### 🟢 Validation (most critical, can't be autonomous)

**Q12. Get 1 non-Irfan user run Dash Build prompt — kapan + siapa?**
- 1 designer = best signal for DS coverage
- 1 PM tribe = best signal for prompt language
- 1 ops lead = best signal for real operational pain
- Decide: who + when this week.

---

## Things gua TIDAK kerjain (per scope Tier A+B)

| Task | Reason skip |
|---|---|
| Open PR `fix/clone-preview-state-transition` | External action, needs user confirm + visible blast radius |
| Push commits to GitHub | External action |
| Apply backoffice shim fix to code | Tier C scope (HTML/code edit), not Tier B (spec) |
| Apply mobile + a11y CSS patches | Tier C scope |
| Add prototype disclaimer to HTML | Tier C scope |
| Update README link to control tower | Tier D scope |
| Update CLAUDE.md to flag Layer 2 themes already extracted | Avoid editing repo conventions overnight |
| Update MEMORY.md index | Tier D scope (will update at session end) |

Lu confirm Tier C+D = boleh dikerjain → say "go ahead" pas bangun, gua apply semua.

---

## Surprises ditemukan saat run

### 1. Layer 2 themes ALREADY shipped
- Prev assumption (handover): themes still inline `globals.css`
- Actual: `themes/manifest.json` + 5 themes shipped at `apps/docs/registry/dash/themes/`
- Implication: gap revised dari "extract" jadi "runtime adoption" (CLI + audit + provider)
- File: `docs/specs/ds-layer-2-theme-runtime-plan-2026-05-28.md`

### 2. DS coverage stronger than expected
- 226 registry entries, 73.5% avg coverage across 10 typical PM prompts
- Strongest: Settings (90%), Wizard onboarding (90%), Reimbursement form (85%)
- Weakest: Comparison table (45%), Audit log diff (60%), Dispatch board (65%)
- ~20 components with zero use across prompts — proposed namespace split `@dash/showcase` (NOT deprecate, keep paid AlignUI IP)

### 3. Backoffice 500 = trivial fix
- Single-token mismatch: `AuthProvider` vs `AuthContextProvider`
- 1-line rename in shim
- All other shim swaps clean (firebase named exports, axios default, UserAuth, AuthContext named — all match consumers)

### 4. Plan subagent ≠ writeable
- 2 of 4 dispatched agents used Plan subagent_type — Plan has no Write tool
- Both eventually returned content inline as text for parent to write
- Lesson: future overnight autonomous runs → only use `general-purpose` subagent_type

---

## What's STILL missing setelah overnight run

(Tier A+B closed many gaps, but bukan semua. Recap real-product priorities yang belum:)

### Validation gap (paling kritis, can't autonomous)
- 1 real user (designer / PM tribe / ops lead) run prompt belum
- Real-world DS coverage benchmark belum (paper analysis ≠ live test)

### Implementation gap (perlu user approve + push)
- PR `fix/clone-preview-state-transition` belum di-open
- Backoffice shim fix belum applied
- SSE endpoint actual code di daemon belum (cuma spec)
- HTML auto-gen script actual code belum (cuma spec)
- Dashboard `packages/dashboard/` skeleton belum
- DS Layer 2 runtime (CLI + provider) actual code belum

### Strategic gap (perlu user decide)
- Q5-Q11 di atas

---

## Quick-start checklist saat bangun

1. Baca file ini, Q1-Q12 jawab batch
2. Skim 9 output files (15 menit) untuk konfirm content valid
3. Pilih next slice: implementation Tier C+D OR validation get-1-real-user OR strategic Q5-Q11
4. Kasih `go` ke session ini (atau new session) → gua eksekusi
5. Sebelum tidur lagi: ack which questions decided + push branch ke remote kalau ada commit

---

Related: [[dash-build-handover-2026-05-27]] · [[dash-dashboard-prd-2026-05-28]] · [[dash-dashboard-trd-2026-05-28]] · [[agent-observability-protocol-2026-05-28]]
