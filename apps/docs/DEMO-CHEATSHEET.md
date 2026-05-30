# Demo Cheatsheet — Dash Design System

How to demo Dash DS live in front of the team Thursday. Memorize the 5-step flow, keep this file open on a second screen as a safety net.

> **Audience**: Irfan, demoing to 10 team members at Dash on **2026-05-21 Thursday**.
>
> **Goal**: team leaves wanting to install today. Not theoretical — they SEE the workflow drop ship-time from 2.5 days to half a day.

---

## Pre-demo checklist (run 1 hour before)

```bash
# 1. Health check
curl -s https://ds.dash.com/api/health | jq
# expect: { "status": "ok" }

# 2. Smoke
bash /Users/irfanprimaputra.b/dash-ds/scripts/smoke.sh https://ds.dash.com "$DASH_REGISTRY_TOKEN"
# expect: fail=0

# 3. Clean a scratch demo repo
rm -rf /tmp/dash-demo
mkdir /tmp/dash-demo && cd /tmp/dash-demo
pnpm create next-app@latest . --ts --tailwind --app --import-alias "@/*" --no-src-dir --yes
echo "DASH_REGISTRY_TOKEN=$DASH_REGISTRY_TOKEN" > .env.local

# 4. Pre-open tabs in browser:
#    - https://ds.dash.com (landing)
#    - https://ds.dash.com/docs (intro)
#    - https://ds.dash.com/docs/components/data-table
#    - Claude Code window (or Cursor)
#    - terminal at /tmp/dash-demo
#    - second terminal at /tmp/dash-demo (for parallel pnpm dev)

# 5. Mute Slack + close Mail. Big chat-noise = embarrassing mid-demo.
```

---

## The 5-act demo (12 minutes)

### Act 1 — The pain (1 min, no laptop)

**Open with a question, not slides.** Look at the room:

> "Berapa lama lu ngerjain fitur baru di repo Dash sekarang? Halaman list mitra, table dengan filter, modal detail. Beneran ngitung dari kosong sampai PR merge."

Wait. Let one team member answer "2 hari? 3 hari?". Nod.

> "Sekarang berapa lama buat warnanya match Dash brand kalau Claude / Cursor generate dari scratch? Berapa kali revisi `coba pakai biru Dash` `biru yang di Figma` `bukan itu`?"

Wait. Laugh. Move to laptop.

### Act 2 — The website tour (2 min)

Tab: https://ds.dash.com

> "Ini Dash Design System. 178 komponen, blocks, templates, semua udah pre-styled Dash brand."

Tab: https://ds.dash.com/docs

> "Quick Start ada di sini. Decision tree juga — ga perlu nebak komponen mana yang dipakai."

Tab: https://ds.dash.com/docs/components/data-table

> "Setiap komponen punya live preview, install command, props API, anatomy. Jelas."

**Don't dwell.** This is just establishing "the thing exists". Move on.

### Act 3 — Live install (2 min)

Switch to terminal:

```bash
cd /tmp/dash-demo
dashkit init
# prompts:
#   - registry URL? https://ds.dash.com  (default)
#   - token? auto-detected from .env.local
#   - framework? Next.js (auto-detected)
# generates components.json + writes Dash tokens to globals.css + installs @dash/base-theme
```

```bash
dashkit add data-table button input modal
# Installing 4 components...
# ✓ @dash/data-table (deps: @tanstack/react-table)
# ✓ @dash/button
# ✓ @dash/input
# ✓ @dash/modal
# 12 files written. 3 npm deps installed.
```

Show the diff:

```bash
ls registry/dash/ui/
# button.tsx  data-table.tsx  input.tsx  modal.tsx  ...
```

> "Komponen di repo gua, source code lengkap. Bukan import dari node_modules — own the code, edit freely."

### Act 4 — Claude Code with MCP (5 min — the killer demo)

Open Claude Code in `/tmp/dash-demo`.

```bash
# verify MCP wired
cat ~/.claude/mcp-config.json | grep dash
# expect: @dash/mcp-server config present
```

In Claude Code chat, type **exactly this prompt** (or close — keep it casual):

> claude, bikin halaman /mitra dengan list mitra Dash Express. Pake @dash registry. Header punya search bar + filter status. Table kolom: nama, level, status, last trip. Empty state pake brand illustration.

**Watch what Claude does:**

1. Queries Dash MCP `search_components "table search filter"` — returns `data-table`, `input`, `select`, `badge`, `empty-state-illustration`.
2. Reads `dashkit info` for project state.
3. Writes `app/mitra/page.tsx` using actual `@dash/*` imports.

**Narrate while it works:**

> "Sebelum Dash DS, Claude akan generate Button custom, Tailwind warna default, padding random. Sekarang Claude tanya MCP dulu — komponen apa yang ada, mana yang fit. Output langsung brand-match karena pake @dash."

Switch to second terminal:

```bash
pnpm dev
```

Open browser http://localhost:3000/mitra.

> "Liat. Render perfect. Warna Dash, spacing match Figma, dark mode toggle works. Total waktu dari prompt ke render: 4 menit."

**Pause for reaction.** This is the moment.

### Act 5 — The math + the ask (2 min)

Switch back to pitch deck (slide 11 — 45 dev-days/week).

> "10 developer × 3 fitur/minggu × 1.5 hari saved per fitur = 45 dev-days saved per minggu. Setara 2 engineer full-time, balik tiap Senin."

Slide 10 (roadmap 4 weeks):

> "Minggu ini deploy. Minggu depan gua shadow 1 user pioneer pakai workflow ini. Minggu ke-3 kita roll ke 5 user. Minggu ke-4 full rollout."

Slide 14 (closing):

> "Token udah di 1Password vault 'Engineering / Dash Registry'. Install instruction di `#design-system` Slack channel. Pertanyaan, friction, bug report — ping gua atau channel itu."

End. Take questions.

---

## Backup demos (if main demo breaks)

### Backup 1: MCP not responding
Pre-recorded screen recording of Act 4 saved at `~/Documents/dash-ds-demo-recording.mp4`. Open + play silently while you narrate.

### Backup 2: Vercel deploy down
Run demo against localhost — `bash scripts/smoke.sh http://localhost:3000` first to confirm. Tell team "Vercel hiccup pagi ini, lagi gua fix paralel. Ini live registry sama, host beda".

### Backup 3: Claude Code burns tokens / hangs
Skip Act 4 Claude part. Manually show `dashkit add data-table` files landing + open VS Code to edit one page using imports. Less impressive but still clear.

---

## Anti-patterns to avoid

| Don't | Why |
|---|---|
| Don't open with "Let me explain the architecture" | Team members care about their day getting faster, not your design choices. Open with their pain. |
| Don't apologize for tooling gaps ("we still need to build...") | You closed the gap yesterday. Talk about what shipped. |
| Don't demo every component | Boring. Pick 1 killer flow (data-table page) and drive it deep. |
| Don't read slides verbatim | Slides are eyebrow context. You're the narrator. |
| Don't take questions during demo | Ask "save questions for end" up front. Mid-flow Q&A kills timing. |
| Don't promise dates you don't control | Vercel rollout = "this week", user pilot = "next week", full rollout = "by mid-June". Don't over-promise. |

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

# install CLI (user laptop, one-time)
pnpm i -g dash

# new consumer repo
dashkit init                              # interactive setup
dashkit add button input modal data-table # install components
dashkit list                              # see all available
dashkit search "table"                    # full-text search
dashkit mcp init                          # wire Claude Code

# upgrade
dashkit diff button                       # see what changed
dashkit add button --upgrade              # update local copy

# DS maintainer (only Irfan)
cd /Users/irfanprimaputra.b/dash-ds
pnpm tsx scripts/build-registry.ts     # rebuild public/r/*.json
bash scripts/smoke.sh https://ds.dash.com "$TOKEN"
vercel --prod                          # deploy
vercel rollback <url> --prod           # rollback
```

---

## Recovery — if Thursday goes sideways

| Symptom | First move |
|---|---|
| Demo crashes mid-flow | Switch to slide 11 ROI math, finish on math + commitment, schedule individual demos for next week |
| User asks "kenapa ga pakai shadcn langsung?" | "Sama foundation, tapi @dash udah brand-match Dash sejak Day 1. ga perlu re-skin tiap komponen. Plus MCP integration custom buat workflow Dash." |
| User asks "lisensi?" | "Internal Dash team only. AlignUI Pro license covers this. External redistribution prohibited per NOTICE.md." |
| User asks "kapan multi-stack (Vite, Remix)?" | "Next.js first-class hari ini. Multi-stack Skill package ETA 3 minggu. Kalau ada repo urgent yang non-Next, ping gua, gua scaffold manual sambil package siap." |
| User asks "bisa contribute komponen baru?" | "Yes — PR ke `dash-tech/design-system`. Anatomy guide di docs. Gua review + merge dalam 1 hari kerja." |
| User asks "berapa cost?" | "$20/bulan Vercel. Token + auth gratis. Dependencies semua open-source." |
