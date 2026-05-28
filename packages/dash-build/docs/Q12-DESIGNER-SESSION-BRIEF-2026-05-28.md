# Q12 Designer Session Brief — Dash Build First Real-User Test
Date: 2026-05-28
Goal: validate DS coverage gap real (vs paper analysis 73.5%) + UX friction real
Duration: 30-45 menit
Facilitator: Irfan
Participant: 1 designer (bukan Irfan)

---

## Why this session matters

Sampai sekarang, user Dash Build = cuma Irfan (creator). Semua optimisasi = guessing. Session ini = **first real signal** dari non-creator user. Output langsung feed:
1. DS roadmap (component sering miss apa)
2. Prompt language pattern (designer ngomong gimana vs dev)
3. UX friction (mana confusing)
4. Trust signal (apakah designer mau pakai lagi)

---

## Pre-session prep (Irfan, 15 menit sebelum)

- [ ] Dash Build daemon running (`node packages/dash-build/dist/bin.js`)
- [ ] OpenAI key connected (BYO atau Codex)
- [ ] GitHub auth fresh
- [ ] Repo target pre-picked = `backoffice` (Shim V3 deployed = stable)
- [ ] Bootstrap pre-warmed (state = `dev_live`) — saves 3-5 menit cold start
- [ ] Browser tab `:7777/dashboard` open + ready
- [ ] Screen record on (Loom / QuickTime) — perlu video buat replay analysis
- [ ] Recording disclosure ke designer (consent)
- [ ] Notion / sticky-note ready buat live log

---

## Session script (30 menit total)

### Part 1 — Context & demo (5 menit)
**Irfan**: 
> "Dash Build = AI tool internal. Lu ngetik request feature dalam bahasa biasa, dia generate page UI pakai komponen Dash DS, terus auto-buka PR di GitHub. Hari ini mau lu coba langsung. Jangan ragu kasih feedback brutal — kita lagi cari friction."

**Demo** (Irfan, 2 menit):
- Show dashboard
- Type contoh prompt SIMPLE: "halaman list mitra dengan filter status"
- Click Generate
- Show iframe load + PR opened

### Part 2 — Designer's own prompt (15 menit)

**Irfan**: 
> "Sekarang giliran lu. Pilih satu skenario kerjaan beneran yang lu pernah handle/butuh. Anggap mau prototype cepat. Tipe halaman apa aja yang dulu lu wishlist ada di Dash ops tools?"

**Prompt prompts buat designer kalau mentok**:
1. "Halaman buat lihat refund per outlet, bisa approve bulk"
2. "Dashboard cost per tribe per bulan, chart + table"
3. "Audit log siapa edit apa kapan, dengan diff before/after"
4. "Settings page tim members + invite flow"
5. "Wizard onboarding mitra 4 step"
6. "Comparison table 2 outlet sebelah-sebelahan"
7. "Form report harian dispatcher dengan upload bukti"
8. "Drag-drop assignment dispatcher ke driver"

**Observation focus** (Irfan log live):

| Stage | Watch for |
|---|---|
| Prompt typing | berapa lama designer think? rephrase berapa kali? |
| AI clarification | kalau agent tanya balik, designer ngerti atau bingung? |
| Iframe preview | reaksi pertama lihat output (kaget? kecewa? puas?) |
| Component fidelity | "ini bukan yang gua maksud" — mana? |
| Iteration | designer mau prompt ulang? prompt baru? edit code manual? |
| BulkActionBar | kalau muncul, designer ngerti pakainya? |
| Cost reaction | $0.05 untuk 1 page — terlalu mahal? murah? OK? |

### Part 3 — Debrief (10 menit)

**Open-ended**:
1. Coba 1 kalimat: apa yang menggugah?
2. Apa yang annoying / lambat / confusing?
3. Kalau lu disuruh pakai mingguan, mau? Kenapa?
4. 1 hal yang bikin lu berhenti pakai lagi = apa?
5. Bandingin vs cara lu biasa (mockup Figma → handoff ke dev): faster? slower?

**Specific** (per DS coverage gap):
6. Saat liat iframe, ada komponen yang **missing** vs ekspektasi designer?
7. Komponen yang ada tapi shape/behavior **salah** = mana?
8. Komponen yang **over-spec** (terlalu kompleks untuk kebutuhan) = mana?

**Confirmation**:
9. OK kalau output session ini di-log + share ke tim? (privacy check)

---

## Live log template (Irfan isi)

### Designer profile
- Nama: 
- Role: 
- Tahun di Dash: 
- Sebelumnya pernah pakai AI codegen (v0, Lovable, Bolt)?

### Prompt 1
- Text:
- Time-to-preview: 
- Foundation score: 
- Reaction (face/word):
- Components used:
- Components missed:
- Iteration count:

### Prompt 2 (kalau sempat)
- (sama struktur)

### Friction log (real-time, satu baris satu)
- [time] friction: ...
- [time] confusion: ...
- [time] delight: ...

### Quote bank (kata kunci designer ucapin)
- "..."
- "..."

---

## Post-session (Irfan, 30 menit)

1. **Watch recording** sambil isi gap log
2. **Aggregate findings** ke file baru `packages/dash-build/docs/user-test-findings-2026-05-28.md`:
   ```md
   ## Designer test 2026-05-28 — findings
   
   ### DS coverage gaps (real)
   - [BLOCKER] component X missing — designer butuh untuk Y
   - [HIGH] component Z shape wrong — design pattern mismatch
   - [MED] ...
   
   ### Prompt language patterns
   - Designer pakai term "...", agent perlu mapping ke "..."
   - Clarification questions yang stuck: ...
   
   ### UX friction
   - [HIGH] cold start 3 menit = designer abandon
   - [MED] cost ticker bikin anxiety
   - [LOW] ...
   
   ### Trust signal
   - Mau pakai lagi: Y/N
   - Reason: ...
   ```
3. **Update DS roadmap** — top 3 gap dari designer feed ke `ds-coverage-gap-*.md` revisi
4. **Triage** ke OVERNIGHT-QUESTIONS atau next sprint backlog
5. **Share back ke designer** dalam 24h: "lu bilang X, kita fix di Y. Thanks."

---

## What success looks like

✅ Designer ship 1+ prompt sampai PR opened
✅ 3+ specific friction logged
✅ 1+ real DS gap surfaced (vs paper analysis)
✅ Trust signal Y/N captured
✅ Designer commit to 1 follow-up session 2 minggu lagi (recurring user)

## What failure looks like

❌ Designer give up tengah jalan tanpa output
❌ "Cool tapi gua ga butuh" — product-market gap
❌ Bootstrap stuck = bug ga ketauan
❌ Tidak ada actionable finding

Kalau gagal pertama kali: jangan abandon Dash Build. Cari designer #2 minggu depannya. 1-2 designer test ≠ verdict.

---

## Calendar template

> Subject: Dash Build first-look — 30 menit santai
> 
> Halo [name],
> 
> Gua lagi build internal AI tool buat ngebuat draft halaman backoffice/portal Dash dari prompt. Mau test ke 1 designer paling awal — pilih lu karena lu paling sering handle [contoh kerjaan].
> 
> 30 menit max. Lu ga perlu prep. Gua provide laptop, lu cuma ngetik prompt + kasih feedback brutal. Hari [tgl] jam [time] OK?
> 
> Output: lu liat duluan apa yang lagi dibangun + DS coverage real (vs guesswork gua). 
> 
> Bilang OK, gua kirim calendar.

---

Related: [[E2E-TEST-PLAYBOOK-2026-05-28]] · [[ds-coverage-gap-2026-05-28]] · [[wave-2-decisions-2026-05-28]]
