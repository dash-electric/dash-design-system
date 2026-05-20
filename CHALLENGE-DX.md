# Dash DS Developer Experience Challenge

> Persona: **Aldi**, mid-level Next.js dev di Dash Ride tribe. Sudah ship 5+ fitur
> portal-v2. Belum pernah sentuh Dash DS. Dengar di meeting Senin, coba Selasa.
>
> Audit dilakukan dengan walking actual files in `/Users/irfanprimaputra.b/dash-ds/`.
> Setiap friction point sertain `file:line` citation. Honest critique, not
> marketing-friendly. Indonesian terms dipakai di tempat natural.

---

## TL;DR

**Total estimated journey time (Day 1 happy path):** **~95 minutes**
**Realistic with friction encountered below:** **~150 minutes (2.5 jam)**
**Drop-off risk highest at:** Stage 3 (Install — 4 conflicting MCP config paths)
and Stage 4 (`variant="primary"` typo in canonical onboarding code → first
copy-paste fails TypeScript).

Dash DS punya foundation kuat (CLI architecture, Skill v3, MCP, layered model),
tapi shipping documentation contradicts itself in ≥5 places yang Aldi pasti
ketemu di 10 menit pertama. Friction bukan di engineering — friction di
**docs drift** dan **terlalu banyak entry points**.

---

## Aldi's Journey (Stage-by-Stage)

### Stage 1 — Discovery (10 min)

**What Aldi sees on `ds.dash.com`:**
[`apps/docs/app/page.tsx:114`](apps/docs/app/page.tsx) hero copy:

> "Dash design system defines the foundations of internal product interfaces…
> ported by the dash CLI, consumed by Claude Code, shipped by Product
> Engineers."

**Estimated time:** 4 minutes scrolling, 6 minutes klik ke `/docs`.

**Friction points:**

| # | Friction | Severity | Source |
|---|---|---|---|
| 1.1 | Hero copy = "what" 4 paragraf, bukan "why should I bother" 1-liner | 3/5 | `app/page.tsx:120-126` |
| 1.2 | Tidak ada live preview component di landing (cuma 4 category cards) | 4/5 | `app/page.tsx:147-182` |
| 1.3 | Tidak ada social proof — who uses it? berapa banyak repo? berapa PR shipped pakai DS? | 4/5 | `app/page.tsx:184-203` stats strip cuma "76 components / 0 TS errors" |
| 1.4 | "Internal" disclaimer di footer ambiguous untuk Aldi — boleh ga sih dia pake di Ride tribe? Tidak ada audience matrix | 2/5 | `app/page.tsx:209-210` |
| 1.5 | Stat "0 TS errors" weak signal — every healthy repo punya itu. Should be "210 components shipped to halo-dash" atau metric adoption | 3/5 | `app/page.tsx:189-191` |

**Shadcn comparison:**
- shadcn.com hero punya live `<Button>` Aldi bisa click langsung — Dash tidak.
- shadcn punya "Used by Vercel, Cal.com, Linear" trust signal.
- shadcn "Get Started" → langsung kelihatan `npx shadcn add button` di hero CTA.

**Concrete fix:**
1. Replace circuit-pattern decor (`app/page.tsx:87-111` decorative SVG) dengan
   live `<Button>` cluster + a `dash add button` CTA.
2. Stats strip: ganti "0 TS errors" → "Used in 3 Dash repos" begitu Wave 5
   selesai. Concrete > generic.
3. Add 1-line value prop above hero: "Ship Dash mitra UIs in 10 minutes — not
   3 days." (Specific, time-bounded, mitra-tribe relevant.)

---

### Stage 2 — Decision (10 min)

Aldi nemu landing, sekarang harus decide: "Worth my Tuesday afternoon ga?"

**What he reads:**
- Hero pitch (lihat Stage 1)
- `/docs/getting-started` page banner "~10 minutes" — bagus
  ([`getting-started/page.tsx:49`](apps/docs/app/(docs)/docs/getting-started/page.tsx))
- He notices 4 "deep reference" links di bottom getting-started
  ([`getting-started/page.tsx:298-369`](apps/docs/app/(docs)/docs/getting-started/page.tsx)):
  Installation reference, User Quick Start (8 steps), Pilot testing playbook,
  Onboarding playbook (45 min).

**Estimated time:** 8 minutes (terdistrack baca 4 entry points).

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 2.1 | **4 overlapping entry points** untuk "getting started" — Getting Started 10min / Installation 6-step / Quick Start 8-step / Onboarding 45min. Aldi tidak tahu mana yang canonical untuk dia | **5/5** |
| 2.2 | Tidak ada "compare with shadcn" table publik. `COMPARISON-SHADCN-vs-DASH.md` ada di repo tapi bukan di docs site | 3/5 |
| 2.3 | Tidak ada estimate "berapa lama investasi vs ROI" — Aldi assumes 1 hari setup, hasil ga jelas | 3/5 |
| 2.4 | Prerequisites scattered: getting-started bilang "Node 20+, pnpm 9+, Bearer token" tapi installation/page.tsx bilang "Node 18.17+, Next 15, Tailwind v4" — version floor tidak konsisten | **4/5** |
| 2.5 | "Bearer token" mention tidak link ke "Cara request token" untuk dev yang belum pilot | 3/5 |

**Shadcn comparison:**
- shadcn has ONE getting-started page. Period.
- No "you should already be on Wave 5" gate.
- Aldi knows "shadcn is for me" in 30 detik. Dash takes 8 menit.

**Concrete fix:**
1. **Kill 3 of 4 onboarding pages.** Keep `/docs/getting-started` only. Move
   "Pilot testing", "Quick Start 8-step", "Onboarding 45min" jadi appendix
   atau redirect.
2. Reconcile prerequisites: Node 20+, pnpm 9+, Next 15+, Tailwind 4 — single
   source of truth, repeated identical di 4 tempat sekarang.
3. Add "How to get the Bearer token" sub-section yang Aldi bisa baca tanpa
   sudah masuk Wave 5 cohort. Untuk non-pilot, redirect "Ping @Irfan / fill
   form."

---

### Stage 3 — Install (15 min ideal)

Aldi terminal-ready. Buka `/docs/getting-started`.

**Step 1: `pnpm i -g dash`**
([`getting-started/page.tsx:147`](apps/docs/app/(docs)/docs/getting-started/page.tsx))

**Reality check from CLI README:** `packages/cli/README.md:17-26` says:
```bash
pnpm dlx github:dash-tech/dash-cli@latest --help
# Or globally:
pnpm i -g github:dash-tech/dash-cli
```

**Aldi's reaction:** "Wait, `pnpm i -g dash` is on the docs site, but README
says `github:dash-tech/dash-cli`? Which one works?" Looks at npm — package
`dash` doesn't exist (or belongs to someone else). README admits: "v1 ships
from GitHub. v1.1 will publish to GitHub Packages once we settle the
`@dash-tech` org scope."

**This is the #1 onboarding bug. Docs lies; install command in canonical
Getting Started page does not work today.**

**Step 2: Bearer token from 1Password**
([`getting-started/page.tsx:119-128`](apps/docs/app/(docs)/docs/getting-started/page.tsx))

**Step 3: `dash init --token $DASH_REGISTRY_TOKEN`**
([`getting-started/page.tsx:170`](apps/docs/app/(docs)/docs/getting-started/page.tsx))

**Security friction:** `--token $DASH_REGISTRY_TOKEN` — only safe if env var
set. Many devs will paste literal `dash init --token sk-dash-xxxx` from doc
example (installation page does this:
[`installation/page.tsx:76`](apps/docs/app/(docs)/docs/installation/page.tsx)
`pnpm dlx dash@latest init --token sk-dash-xxxx`). Token lands in
`~/.zsh_history`. Not a hypothetical — that's the literal code block users
copy.

**Estimated time:** 8 minutes if everything works. **20-30 minutes** with
the github-url-vs-npm bug + shell history risk surfaced.

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 3.1 | `pnpm i -g dash` advertised but package not on npm yet. README admits this. Aldi blocked in step 1 | **5/5** |
| 3.2 | `dash init --token sk-dash-xxxx` doc example puts token di shell history. Should be `DASH_REGISTRY_TOKEN=… dash init` atau interactive prompt | **4/5** |
| 3.3 | `dash init` writes `.env.local` with token. If `.env.local` ga di `.gitignore`, token bocor ke git. Tidak ada guard atau warning in CLI output | **5/5** (security) |
| 3.4 | Three different login flows: `dash login --token` (`login.ts:21`), `dash init --token` (`init.ts:38`), and manual `DASH_REGISTRY_TOKEN` env. No single canonical | 3/5 |
| 3.5 | `EACCES` gotcha for Homebrew Node mentioned (`getting-started/page.tsx:156-161`) — good, but `pnpm i -g github:…` doesn't have any gotcha doc | 2/5 |

**Shadcn comparison:**
- `npx shadcn@latest init` — works on day 1, no token, no 1Password trip,
  zero auth.
- Dash inherits ALL the auth complexity of being internal. Acceptable, but
  every step needs to be flawless. It currently isn't.

**Concrete fix:**
1. **TODAY:** Publish CLI to a real npm scope. `@dash-tech/cli` works fine.
   Don't ship Wave 5 with `pnpm i -g github:…` as install path.
2. Change docs examples from `--token sk-dash-xxxx` to `dash login`
   interactive flow (already exists in `login.ts:29-35`). Prompt-based input
   doesn't hit shell history.
3. `dash init` should `git check-ignore .env.local` and refuse + warn if
   `.env.local` would be committed.
4. Single canonical auth: `dash login` first, then everything reads
   `~/.dash/credentials.json`. Deprecate `--token` flag on all other
   commands (or hide it behind `--token` only-for-CI use case).

---

### Stage 4 — First component (15 min)

Aldi runs `dash add button`. Reads output:
```
✔ Wrote registry/dash/ui/button.tsx
ℹ Import: import { Button } from "@/registry/dash/ui/button"
```
([`getting-started/page.tsx:196-199`](apps/docs/app/(docs)/docs/getting-started/page.tsx))

He pastes the example code from step 4:

```tsx
<Button variant="primary">Suspend mitra</Button>
<Button variant="ghost">Batalkan</Button>
```
([`getting-started/page.tsx:221-222`](apps/docs/app/(docs)/docs/getting-started/page.tsx))

**TypeScript explodes.** Actual Button API uses `tone` and `style`, not
`variant`:
- [`components/button/page.tsx:45`](apps/docs/app/(docs)/docs/components/button/page.tsx): `<Button tone="primary">`
- Same page line 46: `<Button tone="neutral" style="stroke">`

Search the codebase: `tone=` appears in `components/button/page.tsx` ✓,
`ONBOARDING-PLAYBOOK.md:137` ✓. But canonical `getting-started/page.tsx:221`
uses `variant=` ✗.

**This is a P0 bug — the page everyone is told to start on has incorrect
code.** Aldi's first `<Button />` of his life fails TS check.

Now Aldi looks at file path. Canonical getting-started says
`registry/dash/ui/button.tsx`. But `ONBOARDING-PLAYBOOK.md:126` says:

```
✔ Wrote src/components/ui/button.tsx
ℹ Import: import { Button } from "@/components/ui/button"
```

**Two different file targets in two docs.** Which one does the actual CLI
write to? Depends on `components.json` aliases. So the answer is "both, in
different repos" — but neither doc explains this.

**Estimated time:** 8 minutes if you trust the docs (TS error trap). **25+
minutes** when Aldi searches Slack for "variant vs tone Dash button" and
finds nothing — has to grep the actual component source.

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 4.1 | **`variant="primary"` in canonical getting-started page is wrong.** Actual API is `tone="primary"`. Day-1 paste fails TypeScript | **5/5** |
| 4.2 | Two different install paths in two docs (`registry/dash/ui/` vs `src/components/ui/`). No explanation | **4/5** |
| 4.3 | Tokens (semantic — `bg-bg-weak-50`) discoverability: Aldi doesn't know they exist after step 4. Has to find `/docs/theming` separately | 3/5 |
| 4.4 | Dark mode: `<html className="dark">` toggle never mentioned in getting-started. Aldi assumes "no dark mode supported" until he stumbles into `/docs/foundations/dark-mode` | 3/5 |
| 4.5 | No "Try variants" interactive in getting-started — just static code block. Aldi can't see what `tone="destructive"` looks like without finding component page | 2/5 |
| 4.6 | After `dash add`, no auto-suggested next step ("Want a dialog next? Run `dash add dialog`") | 2/5 |

**Shadcn comparison:**
- shadcn doc code blocks have a copy button AND a "Preview" tab that renders
  the example. Aldi sees what he's about to copy.
- shadcn's API is one prop (`variant`) for both tone+style. Dash has 2
  (`tone`, `style`) — more flexible but doubles surface area to learn.
- shadcn never has API drift between getting-started page and component
  page. CI gate prevents it.

**Concrete fix:**
1. **TONIGHT:** Edit `getting-started/page.tsx:221-222` — replace `variant`
   with `tone`. One-character fix, ships dignity back to onboarding.
2. Add a CI smoke test that imports `<Button>` with the props in
   getting-started example code blocks. Compile failure = block PR.
3. Single canonical install path. If `components.json` allows
   `src/components/ui/`, normalize docs to that. Better: write to `@/registry/dash/ui/` everywhere and update onboarding playbook.
4. Add a 3-line "you also get tokens + dark mode for free" callout di end of
   Stage 4 with links.

---

### Stage 5 — Real feature build (30 min — first real PR)

Aldi prompts Cursor/Claude to build mitra suspension page.

Skill v3 should activate
([`packages/skill/src/activate.ts:17-37`](packages/skill/src/activate.ts)).
Looks for `components.json` with `@dash` registry — found, since `dash init`
wrote it. So activation should fire.

**What Skill v3 does:**
1. Runs `dash info --json` ([`SKILL.md:22`](packages/skill/SKILL.md))
2. Fetches `dash-ai-rules.md` (cached 5min)
3. Loads domain glossary

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 5.1 | Aldi tidak tahu Skill aktif vs ga aktif. No visible toast / log line in Claude Code UI confirming "Dash Skill loaded". Drift detection delayed | **4/5** |
| 5.2 | If Skill loads stale cache (5 min), Aldi's brand-new updated rule won't apply. No "force refresh" command surfaced | 2/5 |
| 5.3 | Banned imports (RHF, zod, swr — see [`CLAUDE.md`](CLAUDE.md):41) are documented BUT Aldi has to wait for `dash audit` to learn his AI screwed up. No real-time linter | **4/5** |
| 5.4 | Indonesian voice rule "Anda not kamu" — only enforced by audit at PR time. AI generating "kamu" → Aldi reviews → rewrites. Friction every PR | 3/5 |
| 5.5 | Audit trail mandatory for legal/financial fields ([`CLAUDE.md:35`](CLAUDE.md)) — but error message at audit time, not at generation time | 3/5 |
| 5.6 | Aldi's mitra suspension page IS the example mentioned in [`ONBOARDING-PLAYBOOK.md:159`](ONBOARDING-PLAYBOOK.md) but no end-to-end "expected diff" walkthrough exists. Pure black box | 3/5 |
| 5.7 | `dash audit` exit code on banned import — does PR CI run this? Not documented in CONTRIBUTING. Aldi might commit drift assuming "no error = good" | 4/5 |

**Shadcn comparison:**
- shadcn doesn't ship a Skill (uses generic LLM behavior).
- BUT shadcn doesn't have voice/audit-trail rules to enforce either.
- Dash invented the "Skill + rules" stack because it has more rules. Net
  win, but execution must be tight — currently it's deferred-feedback.

**Concrete fix:**
1. Make Skill activation visible: print
   `[Dash DS] Skill v3 active — 76 components, theme: ride` once per
   session in Claude/Cursor.
2. Pre-emit a `.cursor/rules.md` or `AGENTS.md` file via `dash init` that
   has the top 5 anti-patterns inline. Faster than fetching rules.json over
   network.
3. Add `dash audit --watch` so Aldi gets red squigglies in real-time as he
   types `import { useForm } from 'react-hook-form'`.
4. Generate a 1-page worked example: "Here is the EXACT diff Skill v3 should
   produce for the mitra suspension prompt." Aldi can match against it.

---

### Stage 6 — Customization (Theming)

Aldi wants different button color for his sub-feature ("urgent" red CTA on
mitra rejection screen).

**He reads** [`/docs/theming/page.tsx:30-100`](apps/docs/app/(docs)/docs/theming/page.tsx).
4-tier system: bg / text / stroke / icon × strong/sub/soft/disabled/weak/white.

**Layered architecture** ([`LAYERED-ARCHITECTURE.md`](LAYERED-ARCHITECTURE.md)):
- Layer 0 = locked (touch = RFC)
- Layer 1 = primitives (don't hard-code accent hex)
- Layer 2 = theme override (~30 lines)
- Layer 3 = workflow blocks

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 6.1 | Aldi doesn't know which layer he's in. The decision tree in CLAUDE.md is for code generators — there's no Aldi-facing "I want to change button color in ONE place — how?" guide | **4/5** |
| 6.2 | Layer 2 theme override mentions "ride/logistic/travel/marketplace" — Aldi is in Ride tribe, so theme = `ride`. But how does he override just ONE token (e.g. `--error-base`) for his urgency CTA? Not clear | 3/5 |
| 6.3 | Escape hatch via raw Tailwind `className` allowed? Forbidden? Rules say no raw hex (`#5e2aac`), but what about `bg-red-700`? Ambiguous | 3/5 |
| 6.4 | Theming docs are tier swatches + state tokens. Lots of swatches, no "task-oriented" recipe like "How to make THIS button red urgent" | 3/5 |
| 6.5 | Dark mode flip works via `.dark` class — but the consumer repo has to add the class manually. Not documented in getting-started | 2/5 |

**Shadcn comparison:**
- shadcn = "edit the component file, you own it." Direct. Aldi understands.
- Dash adds a Layer hierarchy on top. More powerful for 10+ teams, but Day 1
  Aldi can't reason about it.

**Concrete fix:**
1. Add a "Recipes" section under Theming: "I want red urgency button",
   "I want denser table for dispatch", "I want darker background" — each
   shows the 3-line CSS var override.
2. Render a "Which layer am I in?" decision flowchart on the Theming page,
   not buried in CLAUDE.md.
3. Document the escape hatch policy explicitly: "Allowed: `className`
   overrides with semantic tokens (`bg-error-base`). Banned: raw hex
   (`#xxx`)."

---

### Stage 7 — Help when stuck

Aldi hits a wall (token expired, MCP not connecting, audit fails). Where
does he go?

**`dash doctor`**
([`packages/cli/src/commands/doctor.ts`](packages/cli/src/commands/doctor.ts))
runs 10 diagnostics. Each check has `status`, `detail`, `hint`. **Good.**

**But the actionability test:** what happens when `dash doctor` reports "MCP
not wired"?

Looking at `doctor.ts:52-58`:
```ts
function claudeCodeConfigPath(home: string): string {
  return path.join(home, ".claude", "mcp-config.json")
}
function cursorConfigPath(home: string): string {
  return path.join(home, ".cursor", "mcp.json")
}
```

So doctor checks `~/.claude/mcp-config.json`. But the **onboarding playbook
tells Aldi to edit `~/.claude/settings.json`** ([`ONBOARDING-PLAYBOOK.md:79`](ONBOARDING-PLAYBOOK.md)):

> Edit `~/.claude/settings.json` (create the file if absent)…

And the **getting-started doc shows output `~/.claude/mcp.json`**
([`getting-started/page.tsx:244`](apps/docs/app/(docs)/docs/getting-started/page.tsx)):

```
✔ Wrote ~/.claude/mcp.json
```

So Aldi has **three different MCP config paths in three different docs**:

1. CLI code → `~/.claude/mcp-config.json`
2. Onboarding playbook (manual) → `~/.claude/settings.json`
3. Getting started (auto via `dash mcp init`) → `~/.claude/mcp.json`

When Aldi follows onboarding manual path, edits `settings.json`. Then runs
`dash doctor`, which checks `mcp-config.json`. Doctor reports "MCP not
wired" — but it IS wired, just at the wrong path. Aldi confused.

**Estimated time wasted on this:** **30-60 minutes** of Slack pings + grep
sessions before someone explains.

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 7.1 | **3 different MCP config paths across docs+code.** Single most-broken thing in entire onboarding | **5/5** |
| 7.2 | `#dash-ds-pilot` Slack channel only for pilot members. Aldi (not pilot) doesn't have channel | 3/5 |
| 7.3 | No GitHub issues template visible. CONTRIBUTING.md exists but no link from `dash doctor` output | 2/5 |
| 7.4 | Common errors not aggregated. Each page has its own "Gotcha" callout, but no master troubleshooting page | 3/5 |
| 7.5 | `dash doctor --json` outputs structured report ([`doctor.ts:44`](packages/cli/src/commands/doctor.ts)) but no command like `dash doctor --fix` to auto-repair | 3/5 |

**Shadcn comparison:**
- shadcn has zero auth/MCP/skill = zero of these issues exist.
- Apples-to-oranges: Dash necessarily has more surface area. But the surface
  area must be internally consistent. Currently isn't.

**Concrete fix:**
1. **TODAY:** Pick ONE MCP path. Likely Claude Code's actual default is
   `~/.claude/settings.json` (per onboarding). Migrate `mcp.ts` and
   `doctor.ts` to that. Or unify to whatever modern Claude Code expects in
   2026.
2. Add `dash doctor --fix` flag that auto-repairs the top 5 most-common
   issues (missing `.env.local`, MCP wrong path, missing tailwind preset).
3. Create `/docs/troubleshooting` page that consolidates every gotcha
   callout currently scattered.
4. Slack: have a `#dash-ds` (public) for general dev questions, keep
   `#dash-ds-pilot` for cohort. Doc references should be `#dash-ds`.

---

### Stage 8 — Update flow

Week later, Dash DS ships button v1.3 (e.g. new size `xxs`, breaking change
in default radius).

**How does Aldi find out?**
- `/docs/changelog` exists ([`apps/docs/app/(docs)/docs/changelog/page.tsx`](apps/docs/app/(docs)/docs/changelog/page.tsx)).
- Does the CLI notify? Looking at `packages/cli/src/commands/sync.ts`
  (560 lines) — yes, `dash sync` exists. But Aldi has to run it.
- `dash diff` exists (`diff.ts`, 73 lines) — shows pending updates.

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 8.1 | No push notification — Aldi must `dash sync` proactively. RSS/email not surfaced | 3/5 |
| 8.2 | No version pinning per-component. `dash add button` re-pulls latest each time → silent drift in shipped repos | **4/5** |
| 8.3 | `dash sync` 560 LOC — complex command. Does it run interactively per-component? Auto-apply? Unclear from doc | 2/5 |
| 8.4 | No "migrations" doc for breaking changes (e.g. tone="primary" → variant="primary" rename, ironically) | 3/5 |
| 8.5 | `packages/cli/src/migrations/` directory exists (per `ls` output) — promising. But not surfaced in user-facing docs | 3/5 |

**Shadcn comparison:**
- shadcn = "you own the file, no version, you decide when to bump." Aldi
  understands.
- shadcn ships migration codemods for major bumps (e.g. v0 → v4).
- Dash's `dash sync` is more powerful, but the model isn't communicated.

**Concrete fix:**
1. CLI prints a 1-line banner when running any command: "💡 3 components
   have updates. Run `dash diff` to review."
2. Document the version model explicitly: "You own the file. We don't pin
   versions. You opt into updates via `dash sync`."
3. Promote `packages/cli/src/migrations/` to user-facing — ship one
   migration per breaking change with `dash migrate <id>`.

---

### Stage 9 — Contribution

Aldi wants a `mitra-rating-card` block for the rejection screen flow.

**`dash gap report` exists** ([`packages/cli/src/commands/gap.ts`](packages/cli/src/commands/gap.ts), 536 lines).
Logs gaps to `~/.config/dash/gaps.local.json`. Sync via `dash gap sync` to
admin dashboard at `ds.dash.com/admin/gaps`.

**Wait time expectation:** Onboarding playbook says:
> "No fixed SLA during pilot. Some gaps get reviewed by Irfan and queued as a
> vendor request; some may get auto-drafted by a Hermes worker (you'll get
> a Slack ping when that happens)."
([`ONBOARDING-PLAYBOOK.md:195`](ONBOARDING-PLAYBOOK.md))

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 9.1 | No SLA = Aldi has no idea if he should wait 1 day or 1 month. Demotivating | **4/5** |
| 9.2 | "Hermes worker" mentioned in playbook but not in main docs. Aldi has no idea what Hermes is | 4/5 |
| 9.3 | No alternative path: "Can I open a PR myself?" CONTRIBUTING.md exists at root, but `dash gap report` doesn't suggest "Want to ship this yourself? See CONTRIBUTING.md" | 4/5 |
| 9.4 | Gap report goes to `gaps.local.json` until sync — Aldi might forget to sync and the gap dies on his laptop | 3/5 |
| 9.5 | Bus factor = 1 (Irfan). Acknowledged in CLAUDE.md "Open questions" but not in user-facing docs. Aldi will discover this the hard way when Irfan is on leave | **4/5** |

**Shadcn comparison:**
- shadcn = community-driven, Twitter/GitHub PRs. Discoverable contributor
  path.
- Dash = closed. Acceptable for internal, but the gap-report flow needs to
  be the next-best thing.

**Concrete fix:**
1. SLA committed even if rough: "Most gaps reviewed within 5 working days.
   No promise of build, but you'll get a Yes/No + reasoning."
2. After `dash gap report`, CLI suggests: "Want to draft this yourself? See
   CONTRIBUTING.md. PRs welcome from any tribe."
3. Auto-sync `gaps.local.json` on next `dash` command (or after 1 day TTL).
   Don't make Aldi remember `dash gap sync`.
4. Deputy maintainer mandatory before Wave 6 (already noted in CLAUDE.md).

---

### Stage 10 — Long-term sustainability (3 months in)

Aldi sticks 3 months. Burns 4-6 hours/week using Dash DS.

**Maintenance burden vs alternative:**

| Dimension | Dash DS | Shadcn | Custom |
|---|---|---|---|
| Day 1 install friction | High (auth, MCP, 4 docs) | None | None |
| Day 90 maintenance | Low (CLI pulls patches) | Medium (manual updates) | High (you own everything) |
| AI assistance | High (Skill v3) | Medium | Low |
| Voice/audit compliance | Auto-enforced | Manual | Manual |
| Career signal | Internal-only | Industry-standard | Resume gold |

**Friction points:**

| # | Friction | Severity |
|---|---|---|
| 10.1 | Lock-in concern: if Aldi leaves Dash, his Dash DS skill = 0 transferable | 3/5 |
| 10.2 | Career signal: "I used Dash DS at PT Dash" doesn't show up on LinkedIn job search. Recommend at minimum publish a public "Dash DS lite" or component case study | 3/5 |
| 10.3 | Trust over time: 3 months in, has Dash DS shipped what was promised? Wave 5 retro needs to be public (anonymized) so future devs can read | 2/5 |
| 10.4 | Bus factor 1 long-term = if Irfan rolled off, Dash DS stops. Aldi can feel that risk before joining heavy | **4/5** |
| 10.5 | Token rotation: never documented in main docs. What if Aldi's token leaks? Onboarding playbook mentions "Rotate via 1Password" but no flow described | 3/5 |

**Shadcn comparison:**
- shadcn = portable, learn it once, use forever, across companies.
- Dash DS = internal asset. Tradeoff is acceptable, but a public "Dash DS in
  the wild" content piece helps. (E.g. "How we built our DS in 30 days" blog
  post on Dash engineering blog.)

**Concrete fix:**
1. Publish anonymized Wave 5 retro publicly on `ds.dash.com/blog`. Gives
   trust signal for future Aldis.
2. Document token rotation flow in `/docs/security` (currently `SECURITY.md`
   at root is 38 lines — promote to docs site).
3. Designate deputy maintainer publicly. Bus factor = 2 minimum before GA.

---

## Top 10 Friction Points (Ranked)

| Rank | Friction | Severity | Stage | Fix LOE |
|---|---|---|---|---|
| 1 | `pnpm i -g dash` advertised, package not on npm yet. Step 1 fails | 5/5 | 3 | 1 day (publish) |
| 2 | `<Button variant="primary">` in canonical getting-started page — actual API is `tone`. TS fails on first paste | 5/5 | 4 | 5 min edit + add CI guard |
| 3 | 3 different MCP config paths across docs + CLI code (`mcp-config.json`, `settings.json`, `mcp.json`) | 5/5 | 7 | 1 hour |
| 4 | 4 overlapping "getting started" entry points — choose-your-own-adventure | 5/5 | 2 | 2 hours consolidation |
| 5 | `dash init --token sk-xxx` in docs example → token in shell history | 4/5 | 3 | 30 min (switch to `dash login` interactive) |
| 6 | `.env.local` written by CLI but no `.gitignore` check → token leak risk | 5/5 | 3 | 1 hour |
| 7 | File path inconsistency: `registry/dash/ui/` vs `src/components/ui/` in two docs | 4/5 | 4 | 30 min |
| 8 | No real-time AI rule enforcement — banned imports only caught at audit time | 4/5 | 5 | 1-2 days (watch mode) |
| 9 | No live `<Button>` preview on landing — Aldi can't try before install | 4/5 | 1 | 4 hours |
| 10 | No SLA / Hermes opacity → gap reports feel like void | 4/5 | 9 | 1 day (write SLA + doc Hermes) |

---

## Quick Wins (1-hour fixes that compound)

1. **Fix `variant` → `tone` in getting-started/page.tsx:221-222.** 10
   seconds. Saves every future Aldi from TS error trap. (**Most important
   1-character fix in the repo.**)
2. **Unify MCP config path.** Edit `doctor.ts:53`, `mcp.ts:39`, and 2 docs
   pages to converge on one location.
3. **Add gitignore check to `dash init`.** 20 lines in `init.ts`.
4. **Add "Skill active" toast.** Print 1 line on Skill activation so Aldi
   knows it loaded.
5. **CLI banner: "💡 X components have updates."** 10 LOC.
6. **Add live `<Button>` cluster to landing.** Replace decorative SVG circuit
   pattern with 6 actual interactive buttons.
7. **Single canonical install command.** Update README + landing + docs to
   identical string.
8. **"Recipes" stub on Theming page.** Even 3 recipes is enough seed.
9. **Banner on each of 3 "deep reference" pages: "← Back to canonical
   Getting Started".** Reduce choose-your-own-adventure.
10. **`dash doctor --fix` flag.** Even fixing 2 issues is huge UX.

---

## Long-Term Investments

1. **Publish CLI to npm under a real scope** (`@dash-tech/cli` or `@dash/cli`).
   Stop shipping via `github:` URL.
2. **Deputy maintainer recruitment.** Bus factor 1 = blocker for GA.
3. **`dash audit --watch`** real-time linter. Pre-emptive feedback during
   coding, not post-PR.
4. **CI-enforced docs API parity.** Every code block in `/docs/components/*`
   compiles against the actual registry source.
5. **Wave 5 retro published publicly.** Trust signal for future cohorts.
6. **Token rotation flow** — document + tested.
7. **Migration codemods** for breaking changes (already have
   `packages/cli/src/migrations/` skeleton — invest).
8. **Hermes auto-vendor pipeline** transparent — Aldi can see his gap's
   status in `dash gap status`.
9. **Component playground (sandbox)** on landing — drag/drop variant
   explorer like shadcn-vue has.
10. **Telemetry dashboard** (consensual, anonymous) — "X components installed
    across N repos this week."

---

## Things Aldi Will Love (Acknowledge Wins)

1. **`dash doctor` exists.** Most internal DS don't have a self-diagnostic.
   389 LOC of thoughtful checks ([`packages/cli/src/commands/doctor.ts`](packages/cli/src/commands/doctor.ts)).
2. **Layered architecture spec** ([`LAYERED-ARCHITECTURE.md`](LAYERED-ARCHITECTURE.md)).
   Genuinely well-thought; few internal DSes formalize Ride/Logistic
   tenant divergence this cleanly.
3. **Skill v3 auto-activates** on `components.json` presence. No "remember
   to load context" tax.
4. **Audit trail mandatory for legal/financial fields.** This is a real
   compliance moat shadcn cannot offer. Mitra suspension, KYC, payment —
   all auto-logged.
5. **76 components + 30 blocks + 11 templates** — that's a real catalog,
   not 5 atoms.
6. **Indonesian voice rule enforced.** "Anda not kamu" — small touch that
   reads as "this DS is OURS, not a US import." Aldi feels at home.
7. **`dash gap report`** as a first-class CLI command. Most DSes treat
   feedback as out-of-band. Dash treats it as part of the workflow.
8. **Migrations directory exists** even if not yet user-facing — shows
   intent to handle breaking changes gracefully.
9. **`dash info --json`** stable schema for AI consumption. Future-proof.
10. **Mitra-flavored doc copy** — examples use "Suspend mitra", "Batalkan",
    not "Click here". Aldi knows this is for him.

---

## Shadcn-Better Gaps

| Gap | Shadcn solution | Dash status |
|---|---|---|
| Live preview on landing | `<Button>` cluster rendered, click-through | Static circuit pattern SVG |
| Zero-auth install | `npx shadcn add button` | 1Password trip + token + MCP wire |
| ONE canonical getting-started page | One. Done. | 4 overlapping pages |
| Copy/Preview tab on every code block | Yes | Static only |
| Codemod migrations | Shipped per major bump | Directory exists, not surfaced |
| Public community contribution | GitHub PRs welcomed | Internal-only by design |
| Industry-transferable skill | Yes (resume gold) | Internal-only (lock-in) |
| Single Button API (`variant` only) | Yes | Two props (`tone` + `style`) |

**Acceptable Dash tradeoffs:** internal-only (by mandate), 2-prop button API
(more flexible for mitra contexts), auth (compliance need).

**Unacceptable Dash gaps (fixable):** live preview, page consolidation, copy
button on code blocks, MCP path unification.

---

## Specific Recommendations Pre-Wave 5

**Block Wave 5 launch until these 5 are fixed:**

1. **`variant` → `tone` fix in getting-started page.** Day-1 paste failure
   is unforgivable for a pilot.
2. **MCP config path unified.** Doctor and docs must match. Otherwise pilot
   users hit "doctor says broken" but their setup works.
3. **CLI on npm** (or pin to `pnpm dlx github:…` everywhere consistently —
   pick a story). Currently mixed signals.
4. **`dash init` `.gitignore` guard for `.env.local`.** Token leak on Day 1
   is a Slack incident waiting to happen.
5. **Single canonical "Getting Started" page.** Pilot users will read at
   least 3 of the 4 entry points "to be safe" and waste 30 minutes.

**Nice-to-have for Wave 5 but not blocking:**

6. Live preview on landing.
7. `dash doctor --fix` flag.
8. Skill activation toast.
9. SLA on gap reports.
10. Hermes opacity removed (or "Hermes" never mentioned to non-pilots).

**Defer to Wave 6:**

- Deputy maintainer.
- Public Wave 5 retro.
- Codemod migrations.
- Token rotation flow doc.

---

## Open Questions for Irfan

1. **Why are there 4 entry points** (`/docs/getting-started`, `/docs/installation`,
   `/docs/quick-start`, `/docs/onboarding`)? Is consolidating into one
   acceptable for Wave 5 — or is there a reason each exists separately?
2. **What's the canonical MCP config file path** for Claude Code in 2026?
   `~/.claude/mcp-config.json` (CLI), `~/.claude/settings.json` (playbook),
   or `~/.claude/mcp.json` (getting-started)? Pick one and migrate the
   other two.
3. **CLI distribution: GitHub URL or npm?** README admits "v1 ships from
   GitHub, v1.1 publishes". Wave 5 is now — pick the story before invites
   go out.

---

## Appendix — Pages Reviewed

- `apps/docs/app/page.tsx` (landing)
- `apps/docs/app/(docs)/docs/getting-started/page.tsx`
- `apps/docs/app/(docs)/docs/installation/page.tsx`
- `apps/docs/app/(docs)/docs/onboarding/page.tsx`
- `apps/docs/app/(docs)/docs/components/button/page.tsx`
- `apps/docs/app/(docs)/docs/theming/page.tsx`
- `apps/docs/app/(docs)/docs/foundations/dark-mode/page.tsx`
- `packages/cli/src/commands/{init,add,doctor,login,mcp,gap,sync,audit}.ts`
- `packages/skill/SKILL.md`
- `packages/skill/src/activate.ts`
- `packages/mcp-server/src/tools/`
- `README.md`, `CLAUDE.md`, `ONBOARDING-PLAYBOOK.md`, `WAVE-5-PILOT.md`,
  `LAYERED-ARCHITECTURE.md`

---

*Audit date: 2026-05-21. Reviewer persona: Aldi (mid-level Ride tribe dev,
fictional but representative of Wave 5 cohort). Reviewer real-name: Claude
Opus 4.7 walking the file tree as Aldi would. Honest critique > polite
agreement.*
