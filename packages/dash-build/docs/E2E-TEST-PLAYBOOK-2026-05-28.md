# E2E Test Playbook — Dash Build (post-Wave 3)
Date: 2026-05-28
Goal: lu test Dash Build dari awal sampai akhir, ngerasain UX real
Estimated time: 30-45 menit
Prerequisites: macOS, Node 20+, pnpm, gh CLI, OpenAI API key OR Codex login

---

## ⚠️ Data reality check (baca dulu)

| Layer | Real or mock? |
|---|---|
| AI agent reasoning | ✅ REAL (OpenAI API call beneran, bayar token) |
| Code generation | ✅ REAL (output TSX/JSX nyata) |
| Repo clone | ✅ REAL (git clone repo target asli) |
| GitHub PR creation | ✅ REAL (PR muncul di repo, ke dunia luar) |
| Iframe preview app data | ⚠️ MOCK (mitra Budi/Siti, 3-4 record fixture) |
| Auth di backoffice/portal preview | ⚠️ MOCK (preview-user auto-login) |
| Cost telemetry di Dashboard | ⚠️ FIXTURE (Q5 widget proxy, real OpenAI Usage API = TODO) |
| Tribe app heartbeat | ⚠️ ENDPOINT-ONLY (Dashboard receive, tribe apps belum emit) |

**Kalau lu test dengan repo target real (backoffice), PR yang dibuat = real PR.** Hati-hati: jangan accidentally merge ke main production. Pakai branch terisolasi.

---

## Stage 0 — Setup (5 menit, one-time)

### 0.1 Pastikan dependencies fresh
```bash
cd /Users/irfanprimaputra.b/Work/dash/dash-ds
pnpm install
```

### 0.2 Build dash-build (sudah dilakuin overnight, skip kalau ga modif kode)
```bash
pnpm --filter @dash/build build
```

### 0.3 OpenAI auth — pilih satu
**Option A — BYO key (recommend untuk first test, kontrol penuh)**:
```bash
# Siapkan key sk-... dari OpenAI dashboard
# Akan di-paste di Dash Build dashboard nanti
```

**Option B — Codex CLI**:
```bash
brew install codex-cli  # kalau belum
codex login --device-auth
```

### 0.4 GitHub auth — pakai existing gh login
```bash
gh auth status
# Should show: ✓ Logged in to github.com as <username>
# Kalau belum: gh auth login
```

---

## Stage 1 — Boot daemon (2 menit)

### 1.1 Terminal baru, run daemon
```bash
cd /Users/irfanprimaputra.b/Work/dash/dash-ds/packages/dash-build
node dist/bin.js
```

### 1.2 Tunggu menu muncul
```
╔═══════════════════════════════════════╗
║     D A S H   B U I L D   v0.1.0      ║
╚═══════════════════════════════════════╝
🚀 Server: http://localhost:7777

? Pick a mode:
❯ Web UI (Open in Browser)
  Terminal UI (Interactive CLI)
  Hide to Tray (Background)
  Exit
```

### 1.3 Tekan **Enter** (default = Web UI)
- Browser auto-buka `http://localhost:7777/dashboard`
- Kalau ga auto: `open http://localhost:7777/dashboard`

**✅ Validate**: dashboard render dengan section "Connect OpenAI" + "Install GitHub App" + "Pick Repo" + "Prompt"

**❌ Kalau error**: cek port 7777 ga di-occupy (`lsof -i :7777`), kill kalau ada.

---

## Stage 2 — Setup auth di dashboard (3 menit)

### 2.1 Connect OpenAI (BYO key option A)
- Section "Connect OpenAI" → paste key `sk-...`
- Submit
- ✅ Status berubah jadi "Connected" hijau

### 2.2 Connect GitHub
- Click "Install GitHub App" → either:
  - Real install flow ke github.com (kalau App udah registered)
  - Stub callback `?stub=1` (kalau pilot mode, OK untuk test UI)
- ✅ Status "Connected" hijau

### 2.3 Pick repo target
- Dropdown menampilkan repos punya lu di GitHub
- **Pilih repo allow-listed**: backoffice atau portal-v2 (per `repo-preview.ts`)
- Untuk test backoffice shim V3: pilih `dash-electric/backoffice` (atau sejenisnya)

**✅ Validate**: repo terpilih muncul di "Current Target Repo" panel

---

## Stage 3 — Bootstrap sandbox (3-5 menit, lazy state machine)

### 3.1 Click "Bootstrap" button
State machine flip per `sandbox-state.ts`:
```
idle → clone_running → clone_done → install_running → install_done → dev_starting → dev_live
```

### 3.2 Monitor state badge di topbar
- 🟡 `clone_running` (~15-30s)
- 🟡 `install_running` (~60-180s) — npm install, biggest wait
- 🟡 `dev_starting` (~60-180s) — next dev cold start
- 🟢 `dev_live · :3101` — siap

### 3.3 Iframe load
**Kalau pilih backoffice (V3 shim test)**:
- Iframe load `http://localhost:3101`
- ✅ Page render tanpa HTTP 500 — **ini validate W1.1 fix**
- ✅ Auto-login sebagai "Preview User" (admin role)
- ⚠️ Data di list = mock fixture (mitra Budi/Siti/Andi/Rina)

**Kalau pilih portal-v2**:
- Same flow, Jotai-based auth context

**❌ Kalau iframe HTTP 500**: lihat console error → screenshot → file issue. Shim V3 should've fixed AuthContextProvider mismatch.

---

## Stage 4 — Type prompt + generate (5-10 menit)

### 4.1 Prompt examples (pilih satu)

**A) Simple page** — fastest, validate basic flow:
```
Halaman list mitra dengan filter status (active/suspended/pending),
search by name, pagination. Tampilkan total count di topbar.
```

**B) Block heavy** — validate DS coverage:
```
Halaman approve refund per outlet. DataTable dengan kolom outlet,
amount, status, requested_at. Bulk select + approve/reject action.
Drawer kanan untuk detail per row.
```

**C) Layout pattern** — validate composite:
```
Settings page dengan 3 tab: Account, Integrations, Team. Tab Team
list anggota dengan role badge + invite form.
```

### 4.2 Click "Generate"
**Behind the scenes** (lihat di "Activity" pane real-time):
- Skill chain: `dash-intake → dash-prd → dash-design → dash-trd → Skill v4 + Codex`
- AI agent baca repo existing (intake)
- Query DS registry (DataTable, Badge, Drawer, dll)
- Emit plan artifact
- Generate code TSX
- Validate (typecheck + DS rule)
- Foundation match score 0-100

### 4.3 Monitor cost
- Bottom-right cost ticker: real OpenAI tokens burning
- Typical simple prompt: ~$0.02-0.10
- Complex: ~$0.20-0.50

**✅ Validate**: foundation score >70, no banned imports flagged

---

## Stage 5 — Preview generated code (3 menit)

### 5.1 Iframe refresh dengan generated page
- New route appear di iframe (e.g. `/mitra`, `/refunds`, `/settings`)
- Component render dengan Dash DS components (Button, DataTable, Badge, dll)

### 5.2 Interact dengan UI
- Click filter → mock data filter di front-end
- Click row → drawer open
- Bulk select → BulkActionBar muncul ✨ (kalau pakai prompt B)

**✅ Validate**: UI behaves per design.md (operational density, hairline border, Plus Jakarta Sans)

**❌ Kalau ada visual drift**: report sebagai gap (untuk DS coverage gap revisi)

---

## Stage 6 — Approve + PR (3 menit)

### 6.1 Review diff
- Bottom panel: tab "Diff" → see generated files (`pages/<route>.tsx`, etc)
- Tab "Plan" → AI rationale (which component picked + why)
- Tab "Validation" → typecheck + lint + DS-rule results

### 6.2 Click "Approve & Open PR"
**Real action**:
- Branch isolated: `dash-build/<runId>` di repo target
- Commit conv-commits: `feat: add <feature> via Dash Build [run <id>]`
- PR created via gh API
- PR link returned di toast

### 6.3 Verify di GitHub
- Click PR link
- ✅ Branch + diff visible
- ✅ PR body include AI rationale + foundation score + cost summary
- ⚠️ **Jangan merge ke main production** kecuali sudah review beneran

---

## Stage 7 — Cleanup (2 menit)

### 7.1 Stop daemon
- Ctrl+C di terminal Dash Build

### 7.2 Kill iframe dev server
```bash
# Find + kill next dev process
lsof -i :3101 | awk 'NR>1 {print $2}' | xargs kill -9
```

### 7.3 Delete test PR (kalau cuma test)
```bash
gh pr close <pr-number> --delete-branch
```

---

## Observation checklist (isi pas test)

- [ ] Boot daemon time
- [ ] Bootstrap end-to-end time
- [ ] Iframe loaded successfully (NO HTTP 500)
- [ ] Prompt understood by agent (no clarification stuck)
- [ ] Foundation score
- [ ] Generated code uses ONLY @dash registry components
- [ ] BulkActionBar usable (kalau prompt B)
- [ ] PR opened successfully
- [ ] Cost incurred ($)
- [ ] Issues / friction noticed:

---

## Known limitations (jangan kaget)

| Behavior | Reason |
|---|---|
| Data list = 4 mitra fixture | Sandbox shim mock — design |
| Auth = auto-login admin | Preview shim bypass — design |
| Dashboard `/owner` = partial stub | Real telemetry wiring belum |
| `@dash-electric/*` ga install via npm | Belum publish ke registry |
| AI agent thinking ga visible step-by-step | AOP emit di daemon belum — spec exists |
| Tribe app health di Dashboard kosong | Tribe apps belum emit heartbeat |
| Cost widget = fixture | OpenAI Usage API wiring TODO |

---

## Where to file issues

Bug + friction → tambahin ke `packages/dash-build/docs/E2E-TEST-FINDINGS-2026-05-28.md` (new file kalau belum ada).

Format:
```
## [SEVERITY] <issue title>
**Where**: stage X.Y
**Expected**: ...
**Actual**: ...
**Repro**: ...
**Screenshot/log**: ...
```

Severity: `BLOCKER` / `HIGH` / `MED` / `LOW`.

---

Related: [[wave-2-decisions-2026-05-28]] · [[backoffice-shim-diagnosis-2026-05-28]] · [[OVERNIGHT-QUESTIONS-2026-05-28]]
