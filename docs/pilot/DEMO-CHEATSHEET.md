# Demo Cheatsheet — Dash Design System

How to demo Dash DS live in front of the team Thursday. Memorize the 5-act flow, keep this file open on a second screen as a safety net.

> **Audience**: Irfan, demoing to 10 team members at Dash on **2026-05-21 Thursday**.
>
> **Goal**: team leaves wanting to install today. Not theoretical — they SEE the workflow drop ship-time from 2.5 days to half a day, on the actual Dash codebase they touch every day.

---

## Pre-demo checklist (run 1 hour before)

```bash
# 0. Move to repo root (single home now)
cd /Users/irfanprimaputra.b/dash-ds

# 1. Health check
curl -s https://ds.dash.com/api/health | jq
# expect: { "status": "ok" }

# 2. Smoke
bash apps/docs/scripts/smoke.sh https://ds.dash.com "$DASH_REGISTRY_TOKEN"
# expect: fail=0

# 3. Verify CLI + MCP detect
dashkit info
# expect: registry=https://ds.dash.com · token=set · mcp=wired
dashkit doctor
# expect: all checks green

# 4. Clean a scratch demo repo (mirrors a real Dash next-portal-v2-web checkout)
rm -rf /tmp/dash-demo
mkdir /tmp/dash-demo && cd /tmp/dash-demo
pnpm create next-app@latest . --ts --tailwind --app --import-alias "@/*" --no-src-dir --yes
echo "DASH_REGISTRY_TOKEN=$DASH_REGISTRY_TOKEN" > .env.local

# 5. Pre-open tabs in browser:
#    - https://ds.dash.com (landing)
#    - https://ds.dash.com/docs (intro)
#    - https://ds.dash.com/docs/components/data-table
#    - https://ds.dash.com/docs/patterns/multi-item-form
#    - Claude Code window
#    - terminal at /tmp/dash-demo
#    - second terminal at /tmp/dash-demo (for parallel pnpm dev)

# 6. Mute Slack + close Mail. Big chat-noise = embarrassing mid-demo.
```

---

## The 5-act demo (12 minutes)

### Act 1 — The pain (1 min, no laptop)

**Open with a question, not slides.** Look at the room:

> "Berapa lama lu ngerjain fitur baru di `next-portal-v2-web`? Misal halaman buat bulk-create delivery — 5 order sekaligus, masing-masing punya useCode 6-digit. Beneran ngitung dari kosong sampai PR merge."

Wait. Let one team member answer "2 hari? 3 hari?". Nod.

> "Sekarang berapa lama buat warnanya match Dash brand kalau Claude / Cursor generate dari scratch? Berapa kali revisi `coba pakai biru Dash` `biru yang di Figma` `bukan itu`? Atau worse — AI generate pakai RHF + zod padahal repo Dash pakai Jotai + native state, terus harus refactor."

Wait. Laugh. Move to laptop.

### Act 2 — The website tour (2 min)

Tab: https://ds.dash.com

> "Ini Dash Design System. 181 registry items — atoms + composites + blocks + templates + patterns — semua udah pre-styled Dash brand."

Tab: https://ds.dash.com/docs

> "Quick Start ada di sini. Decision tree juga — ga perlu nebak komponen mana yang dipakai."

Tab: https://ds.dash.com/docs/components/data-table

> "Setiap komponen punya live preview, install command, props API, anatomy."

Tab: https://ds.dash.com/docs/patterns/multi-item-form

> "Dan ini yang beda dari shadcn — kita punya **patterns**. Multi-item form, bulk-submit, use-code-field. Pattern-pattern khas Dash yang tiap developer pasti ketemu."

**Don't dwell.** This is just establishing "the thing exists". Move on.

### Act 3 — Live install (2 min)

Switch to terminal:

```bash
cd /tmp/dash-demo
dashkit init
# prompts:
#   - registry URL? https://ds.dash.com  (default)
#   - token? auto-detected from .env.local
#   - framework? Next.js App Router (auto-detected via framework-detector)
# generates components.json + writes Dash tokens to globals.css + installs @dash/base-theme
```

```bash
dashkit add data-table button input modal use-code-field
# Installing 5 components...
# ✓ @dash/data-table (deps: @tanstack/react-table)
# ✓ @dash/button
# ✓ @dash/input
# ✓ @dash/modal
# ✓ @dash/use-code-field   (Dash-specific: 6-digit case-sensitive)
# 14 files written. 3 npm deps installed.
```

Show the diff:

```bash
ls registry/dash/ui/
# button.tsx  data-table.tsx  input.tsx  modal.tsx  use-code-field.tsx  ...
```

> "Komponen di repo gua, source code lengkap. Bukan import dari node_modules — own the code, edit freely."

### Act 4 — Claude Code with MCP on REAL Dash code (5 min — the killer demo)

Open Claude Code, point it at a local checkout of `next-portal-v2-web`.

```bash
# verify MCP wired
cat ~/.claude/mcp-config.json | grep dash
# expect: @dash/mcp-server config present

# verify framework detected as portal stack
dashkit info --path ~/dash-tech/next-portal-v2-web
# expect: framework=next-app · stack=portal (Jotai + axios + native useState)
```

In Claude Code chat, type **exactly this prompt** (the Dash-domain killer):

> claude, di `next-portal-v2-web`, update halaman delivery creation `app/[locale]/(dashboard)/deliveries/create/page.tsx`. Sekarang form bikin 1 order per submit. Ubah jadi multi-order — user bisa add row order tanpa keluar page. Setiap order tetap punya `referralCode` 6-digit case-sensitive (validated server-side via `nodejs-core-service.policy_one_time_codes`). Submit batch via axios POST `/client-user/v2/deliveries` per order dengan Promise.all. Expect string envelope `{status: 'Success', data}` dari ts-delivery-service.

**Watch what Claude does (narrate live):**

1. Queries Dash MCP `search_components "multi item form use code bulk"` — returns `multi-item-form` pattern, `use-code-field`, `data-table`, `button`.
2. Reads `dashkit info` → detects **portal stack** → activates **Adaptation Layer**: no RHF, no zod, no `react-query` — instead Jotai atoms + native `useState` + axios.
3. Reads `multi-item-form` pattern source. Reads `use-code-field` (case-sensitive charset — no `toUpperCase()` forcing).
4. Writes `app/[locale]/(dashboard)/deliveries/create/page.tsx`:
   - Multi-row Jotai atom for order list.
   - Per-row `<UseCodeField>` preserving case-sensitive input.
   - Submit handler: `Promise.all(orders.map(o => axios.post('/client-user/v2/deliveries', o)))`.
   - Response handling: checks string `status === 'Success'` (NOT number, NOT `data.ok`) — matches ts-delivery-service envelope.
   - State-machine awareness: surfaces all 26 delivery statuses via shared enum, doesn't hard-code "pending".

**Narrate while it works:**

> "Sebelum Dash DS, Claude akan generate RHF + zod + `Number(status)` check + uppercase the useCode. Itu 4 antipattern di Dash, semua butuh revisi manual. Sekarang Claude tanya MCP dulu — komponen apa yang ada, stack apa yang dipakai repo ini. Output langsung **portal-stack idiomatic**, useCode case-sensitive, envelope string. PR-ready."

Switch to second terminal:

```bash
pnpm dev
```

Open browser → /deliveries/create.

> "Liat. Multi-row form, add/remove order tanpa keluar page, useCode field preserve `aB3xY9` exact case. Warna Dash, spacing match Figma. Total waktu dari prompt ke render: 4 menit. Tanpa Adaptation Layer ini paling cepet half-day."

**Pause for reaction.** This is the moment.

### Act 5 — The math + the ask (2 min)

Switch back to pitch deck (slide 11 — 45 dev-days/week).

> "10 developer × 3 fitur/minggu × 1.5 hari saved per fitur = 45 dev-days saved per minggu. Setara 2 engineer full-time, balik tiap Senin."

Slide 10 (5-week roadmap):

> "Minggu ini deploy. Minggu depan gua shadow 1 user pioneer pakai workflow ini. Minggu ke-3 kita roll ke 5 user. Minggu ke-4 full rollout. Minggu ke-5 contribute-back loop terbuka."

Slide 14 (closing):

> "Token udah di 1Password vault 'Engineering / Dash Registry'. Install instruction di `#design-system` Slack channel. Pertanyaan, friction, bug report — ping gua atau channel itu."

End. Take questions.

---

## Backup demos (if main demo breaks)

### Backup 1: MCP not responding
Pre-recorded screen recording of Act 4 saved at `~/Documents/dash-ds-demo-recording.mp4`. Open + play silently while you narrate.

### Backup 2: Vercel deploy down
Run demo against localhost — `bash apps/docs/scripts/smoke.sh http://localhost:3000` first to confirm. Tell team "Vercel hiccup pagi ini, lagi gua fix paralel. Ini live registry sama, host beda".

### Backup 3: Claude Code burns tokens / hangs
Skip Act 4 Claude part. Manually show `dashkit add multi-item-form use-code-field` files landing + open VS Code to edit one page using imports. Less impressive but still clear.

---

## Recovery — what if MCP not detected on Thursday

Run **before** Act 4 starts (last sanity check):

```bash
dashkit doctor
# Should show:
#   ✓ registry reachable
#   ✓ token valid
#   ✓ framework detected
#   ✓ MCP config found at ~/.claude/mcp-config.json
#   ✓ MCP server responding
```

If `MCP server responding` fails:

```bash
# 1. Re-wire MCP
dashkit mcp init --force

# 2. Restart Claude Code (fully quit + reopen — Cmd+Q on Mac)

# 3. Re-verify
dashkit doctor
```

If still failing → skip MCP narration in Act 4. Manually instruct Claude `"first run 'dashkit search multi-item-form' and read the result before coding"`. The components still install via CLI; you lose only the auto-discovery wow factor.

---

## Anti-patterns to avoid (demo etiquette)

| Don't | Why |
|---|---|
| Don't open with "Let me explain the architecture" | Team members care about their day getting faster, not your design choices. Open with their pain. |
| Don't apologize for tooling gaps ("we still need to build...") | You closed the gap yesterday. Talk about what shipped. |
| Don't demo every component | Boring. Pick 1 killer flow (multi-order delivery page) and drive it deep. |
| Don't read slides verbatim | Slides are eyebrow context. You're the narrator. |
| Don't take questions during demo | Ask "save questions for end" up front. Mid-flow Q&A kills timing. |
| Don't promise dates you don't control | Vercel rollout = "this week", user pilot = "next week", full rollout = "by mid-June". Don't over-promise. |

---

## Q&A — likely Thursday questions

| Question | Answer |
|---|---|
| "Kenapa pakai canonical pattern RHF + zod di registry kalau Dash banned RHF?" | "Registry itu canonical — source of truth. MCP punya **Adaptation Layer** yang translate per-stack. Repo Dash detect sebagai `portal` stack → AI swap RHF → Jotai + native useState, zod → manual validator. Lu ga pernah lihat RHF masuk PR Dash. Adaptation Layer 5 FE + 5 BE, total 30 anti-pattern dijaga." |
| "Kalau gua kerja di `fleet-mgmt` (CRA, bukan Next), apa aman?" | "Aman. `framework-detector` di CLI baca `package.json` + struktur — detect CRA, Vite, Remix, Astro, Next App, Next Pages, React lib. 7 framework template. `dashkit add` adaptasi import path + entrypoint sesuai stack. fleet-mgmt sudah dicover." |
| "Berapa cost Vercel?" | "$20/bulan Pro 1 seat. Token + auth gratis. Dependencies semua open-source. Total infra cost untuk DS = $20/mo." |
| "Sekarang berapa repo dicover?" | "11 repo total — 5 FE (next-portal-v2-web, fleet-mgmt-fe, basecamp, claim-portal, driver-app-web) + 5 BE (ts-delivery-service, nodejs-core-service, payroll-service, dispatch-service, outlet-service) + 1 infra reference. Adaptation Layer mapping di `dash-ai-rules.md` v2 (829 lines, 30 anti-pattern)." |
| "Kenapa ga pakai shadcn langsung?" | "Sama foundation, tapi @dash udah brand-match Dash sejak Day 1. Ga perlu re-skin tiap komponen. Plus MCP custom buat workflow Dash + pattern Dash-specific (use-code, multi-item-form, bulk-submit) yang ga ada di shadcn." |
| "Lisensi?" | "Internal Dash team only. AlignUI Pro license covers this. External redistribution prohibited per NOTICE.md." |
| "Kapan multi-stack (Vite, Remix) ready?" | "Hari ini ready — 7 framework template di CLI v0.3.0. Kalau ketemu stack edge case, ping gua, gua adaptasi dalam 1 hari." |
| "Bisa contribute komponen baru?" | "Yes — PR ke `dash-tech/dash-ds`. Workflow di `CONTRIBUTING.md`. Gua review + merge dalam 1 hari kerja." |
| "Performance impact?" | "Komponen di-tree-shake — cuma yang lu pakai yang ke-bundle. Base theme 8KB gz. Tidak ada runtime registry call di production — semua jadi source di repo lu setelah `dashkit add`." |
| "Kalau Dash brand berubah?" | "Token-based — semua warna/spacing pakai CSS variable `--dash-*`. Brand refresh = update token, semua komponen ikut auto. Tested via token swap demo." |

---

## After the demo

### Same-day
- Pin install instructions in `#design-system` Slack
- DM the 1-2 team members who looked most enthusiastic — schedule shadow session within 48 hours
- Update vault `06-Adoption-Metrics.md` with attendance + reactions

### Week 1
- Shadow the 1 pilot user. Capture every friction point ("dashkit init prompt confusing", "Claude tried to install non-existent variant", etc.).
- Friction → GitHub issue or vault `07-Ideas-Backlog.md`.

### Week 2
- 1 user → 5 users. Slack thread per user: "Liat workflow ini, mau coba minggu ini?"
- Track install events in Vercel logs.

---

## Quick reference — commands you'll actually type

```bash
# health
curl -s https://ds.dash.com/api/health | jq

# install CLI (user laptop, one-time — requires ~/.npmrc with @dash-tech registry + PAT, see ONBOARDING-PLAYBOOK)
pnpm i -g @dash-tech/dashkit

# new consumer repo
dashkit init                              # interactive setup
dashkit add button input modal data-table # install components
dashkit add multi-item-form use-code-field # Dash-domain patterns
dashkit list                              # see all 181 registry items
dashkit search "table"                    # full-text search
dashkit mcp init                          # wire Claude Code
dashkit doctor                            # diagnose MCP / token / framework
dashkit info                              # see detected stack + registry config

# upgrade
dashkit diff button                       # see what changed
dashkit add button --upgrade              # update local copy

# DS maintainer (only Irfan)
cd /Users/irfanprimaputra.b/dash-ds
pnpm --filter @dash/docs build         # rebuild registry JSON
bash apps/docs/scripts/smoke.sh https://ds.dash.com "$TOKEN"
pnpm --filter @dash/docs deploy        # via Vercel
vercel rollback <url> --prod           # rollback (from apps/docs)
```

---

## Recovery — if Thursday goes sideways

| Symptom | First move |
|---|---|
| Demo crashes mid-flow | Switch to slide 11 ROI math, finish on math + commitment, schedule individual demos for next week |
| `dashkit doctor` red mid-prep | Re-run `dashkit mcp init --force`, restart Claude Code, re-verify. If still red, fallback to manual `dashkit search` narration. |
| Claude generates RHF anyway | Stop, say "look — without Adaptation Layer that's exactly what you'd get". Type `"first run dashkit search and check stack via dashkit info"` as a follow-up. Shows the layer in action by absence vs presence. |
| Vercel deploy down | Demo against localhost — `pnpm --filter @dash/docs dev` + `bash apps/docs/scripts/smoke.sh http://localhost:3000`. Tell team "Vercel hiccup, live registry sama, host beda". |
| User asks deep BE question (envelope/state machine) | Open `apps/docs/dash-domain-glossary.md` — 1,982 lines, 22+ entities, 4 state machines. Answer from source. |
