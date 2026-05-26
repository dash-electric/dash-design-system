# Dash DS — User Onboarding Playbook (Wave 5 Pilot)

> Pilot version for the first 3 pilot users. Target end-to-end onboarding: **under 45 minutes** from a clean laptop to a vibe-coded screen committed to a Dash repo.

Web version of this same playbook (with screenshot slots, navigation, search):
**https://ds.dash.com/docs/onboarding**

Companion docs:
- [`/docs/quick-start`](https://ds.dash.com/docs/quick-start) — developer-flavored 8-step version
- [`/docs/components`](https://ds.dash.com/docs/components) — full catalog
- [`/docs/tools/cli`](https://ds.dash.com/docs/tools/cli) — CLI reference
- [`KILL-CRITERIA.md`](./KILL-CRITERIA.md) — pilot success/kill thresholds

---

## A. Pre-flight (5 min)

**What is Dash DS.** Internal sovereign design system for 10+ team members at Dash. You pull components by name with the `dash` CLI; your AI editor learns the registry through MCP + a Skill that enforces Dash conventions (tokens, voice, audit trail).

**Who this is for.** Wave 5 = the first 3 pilot users on Ride tribe. Logistic, Travel, Marketplace pilots come later. You should already be comfortable shipping Next.js + Tailwind features and using Claude Code or Cursor daily.

**Time commitment.** ~30–45 min onboarding (this doc). ~1 hour for your first real ticket. ~15 min/week giving feedback in `#dash-ds-pilot`. Pilot window: 1 week.

**What you can do after.**
- Install components in any Dash repo via `dash add <name>`
- Prompt your editor to build Dash-themed screens that respect tokens / voice / audit-trail
- Report gaps the moment the DS falls short

---

## B. Install (10 min)

**Prerequisites:** Node 20+, pnpm, Claude Code **or** Cursor (latest).

### Step 1 — Install the CLI
```bash
pnpm install -g dash
dash --version
# → dash@1.x.x
```

### Step 2 — Get your Bearer token
Open 1Password → vault entry **"Dash DS Registry Token"** (shared to you before this doc). The token is personal — do **not** paste in Slack, screenshots, or commits.

If you don't see the entry, ping **@Irfan** in `#dash-ds-pilot`.

### Step 3 — Log in
```bash
dash login --token <paste-from-1password>
# ✔ Token validated
# ✔ Saved to ~/.config/dash/auth.json
```

### Step 4 — Sanity check
```bash
dash doctor
# ✔ Node 20.x
# ✔ pnpm 9.x
# ✔ Bearer token valid (registry reachable)
# ✔ MCP server installable via npx
```
All green? You're done with B.

### Common issues + fixes
| Symptom | Fix |
| --- | --- |
| `EACCES` on `pnpm install -g dash` | Global bin folder unwritable. Run `pnpm setup` and follow its instructions. Avoid `sudo`. |
| `401 Unauthorized` on `dash login` | Token paste picked up a leading/trailing space. Re-copy from 1Password. |
| `dash doctor: MCP probe failed` | `npx` can't reach the registry — check VPN / corporate proxy. Retry; persisting → ping channel. |
| `dash: command not found` | pnpm global bin not on PATH. Run `pnpm bin -g`, add that path to your shell rc. |

---

## C. Connect your AI editor (10 min)

Pick **one** primary editor. The MCP block is identical for both — only the file path differs.

### Option A — Claude Code (recommended)
Edit `~/.claude/settings.json` (create the file if absent), merge under `mcpServers`:

```json
{
  "mcpServers": {
    "dash-ds": {
      "command": "npx",
      "args": ["-y", "@dash/mcp-server"],
      "env": {
        "DASH_REGISTRY_TOKEN": "<your-bearer-from-1password>"
      }
    }
  }
}
```

### Option B — Cursor
Same JSON block, file path `~/.cursor/mcp.json`.

### Restart your editor
MCP servers do **not** hot-reload config. Fully quit (`Cmd+Q` on macOS) and reopen.

### Verify
Open a new chat and ask:

> What Dash DS components are available for building a mitra detail page?

**Expected:** a short list referencing `@dash` registry items (Button, Input, DataTable, FilterBar, EmptyState, etc.) and a suggestion to scaffold via `dash add`.

**Drift signal:** generic shadcn answer or "I don't have access to your DS" → MCP didn't connect. Recheck step 1 / 2.

---

## D. Your first component (15 min)

### Step 1 — Open a Dash repo
```bash
cd ~/Dash/next-portal-v2-web
# or the repo assigned in your pilot brief
```

### Step 2 — Browse the catalog
Open [https://ds.dash.com/docs/components](https://ds.dash.com/docs/components). Skim the atom layer (Button, Input, Modal, Table) so you know what's there before prompting.

### Step 3 — Add Button
```bash
dash add button
# ✔ Wrote src/components/ui/button.tsx
# ℹ Import: import { Button } from "@/components/ui/button"
```

### Step 4 — Use it
```tsx
import { Button } from "@/components/ui/button"

export default function MitraDetailPage() {
  return (
    <div className="p-6 space-y-3">
      <Button tone="primary">Simpan perubahan</Button>
      <Button tone="ghost">Batal</Button>
    </div>
  )
}
```

### Step 5 — Commit + push
```bash
git checkout -b pilot/wave5-first-button
git add -A
git commit -m "chore: pilot wave5 — add Dash Button"
git push -u origin HEAD
```

---

## E. Vibe-code mode (15 min)

Now describe a screen in plain language. Skill v2 will steer the AI toward Dash patterns (`useState`, formal "Anda", semantic tokens — no RHF/zod, no raw hex).

### Try this prompt
> Tambah modal konfirmasi suspend mitra di halaman `/mitra/[id]`. Required: dropdown alasan (Reservasi, KYC, Pelanggaran), text area catatan opsional, dan audit trail (siapa, kapan, alasan). Pakai Dash DS.

### Review the diff
The generated code should:
- Import from `@dash` / your local `@/components/ui` paths
- Use `useState` for form state (**not** `react-hook-form`)
- Use formal **"Anda"** (mitra-facing voice)
- Use semantic tokens (`bg-bg-weak-50`, `text-text-strong-950`) — no raw hex
- Include an audit-trail object (`{ actorId, timestamp, reason, original?, edited? }`)

### Spot drift early — flag in `#dash-ds-pilot`
- `react-hook-form`, `zod`, `@hookform/resolvers` — banned
- `@tanstack/react-query`, `swr` — banned
- Raw hex (`#5e2aac`) instead of token names
- Casual **"kamu"** in mitra-facing copy
- Missing audit-trail on suspend / payment / KYC actions

---

## F. Reporting gaps

The whole point of Wave 5 is to find what the DS doesn't cover. Don't work around — report.

### Log locally
```bash
dash gap report "no Dash component for inline OTP input with 6 boxes — needed in mitra phone re-verify flow"
# ✔ Logged to ~/.config/dash/gaps.local.json
```

### Sync to the dashboard
```bash
dash gap sync
# ✔ Synced 1 gap to ds.dash.com/admin/gaps
```

### What happens next
No fixed SLA during pilot. Some gaps get reviewed by Irfan and queued as a vendor request; some may get auto-drafted by a Hermes worker (you'll get a Slack ping when that happens). If you're blocked, build a one-off in your repo and tag it for later DS-port.

---

## G. Feedback channels

| Channel | Use for |
| --- | --- |
| `#dash-ds-pilot` (Slack) | Default. Fast, informal — drift sightings, broken docs, weird AI behavior, screenshots. Don't worry about polish. |
| GitHub issues — `github.com/irfanputra-design/dash/issues` | Reproducible bugs in the CLI / MCP / registry. Repro steps + expected vs actual. |
| Direct ping `@Irfan` | Blockers in daily work, or sensitive items (token rotation, vault access). Use sparingly — bus factor is 1 today. |

---

## H. What you're helping with

Per [`KILL-CRITERIA.md`](./KILL-CRITERIA.md), Wave 5 tests:

- **Adoption** — does the workflow stick past day 2, or do you fall back to copy-paste?
- **Gap surfacing** — every missing component / unclear doc shapes Wave 6 + GA scope.
- **AI behavior under real prompts** — when does the Skill steer correctly, when does it drift?
- **Kill input** — if you find a reason to kill or re-scope the DS, that's a valuable finding, not a failure.

Honest critique > polite agreement.

---

## I. Out of scope (don't do)

- **Don't modify Dash production code via the DS.** The DS is purely additive — components ship into your repo as source you own, not as a replacement for what already exists there.
- **Don't share your Bearer token.** Not in Slack, screenshots, or commits. Rotate via 1Password if it leaks.
- **Don't bypass `dash add`.** No copy-pasting components from other Dash repos — that breaks audit + dep tracking.
- **Don't modify production Dash repos under `/Users/.../Dash/*`** — they are READ-ONLY references for the DS work.

---

## Appendix — Wave 5 invite Slack DM template

Paste-ready for inviting one of the 3 pilot users. Fill in `[name]`, dates, and 1Password share link.

```
Halo [name],

Lu di-invite jadi alpha pilot Dash DS — internal design system
yang baru jadi. Tujuan pilot 1 minggu:
1. Lu validate adoption + workflow
2. Surface gap (apa yang DS belum cover)
3. Feedback honest soal AI behavior

Onboarding 30–45 menit. Playbook:
https://ds.dash.com/docs/onboarding

Bearer token gw kirim via 1Password share.

Pilot window: <YYYY-MM-DD> – <YYYY-MM-DD + 7>
Channel: #dash-ds-pilot

Thanks bro/sis 🙏
```
