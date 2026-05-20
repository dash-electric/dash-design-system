# Maintenance Playbook — Dash Design System

How to keep `ds.dash.com` healthy, add new components, rotate tokens, ship breaking changes, and onboard new users — without breaking the 10 users downstream.

> **Audience**: Irfan (owner) Day 1. Hand to a hire when team grows past you.
>
> **Cadence summary**: daily (5 min), weekly (15 min), monthly (30 min), quarterly (2 hr).

---

## 0. Mental model

Dash DS has **3 surfaces** to maintain:

| Surface | Repo | Hosted at | Who pulls it |
|---|---|---|---|
| Registry source | `dash-tech/design-system` | `ds.dash.com` (Vercel) | CLI (`dash add`) |
| CLI tool | `dash-tech/dash-cli` | npm (private) or GH | User laptops (`pnpm i -g dash`) |
| MCP server | `dash-tech/dash-mcp` | npm (private) or GH | User Claude Code config |

The registry is the **source of truth**. CLI + MCP are thin clients that fetch from `ds.dash.com`.

**Rule of thumb**: change shape (rename file, change export, breaking prop) = bump version + announce. Add new component = silent (users pull when they want it).

---

## 1. Daily — 5 minutes

Do at 9am, sip coffee. Most days = green, close laptop.

### 1a. Health check

```bash
curl -s https://ds.dash.com/api/health | jq
# expect: { "status": "ok", "version": "0.1.x", ... }
```

If `status: degraded`: open Vercel logs, find the failed deploy, rollback (Section 7).

### 1b. Vercel dashboard scan

vercel.com/dash/design-system → Deployments tab.

| What | Where | Red flag |
|---|---|---|
| Last deploy status | top of list | red X = check logs |
| Function invocations | Analytics → Functions | sudden 10× spike = bot / leak |
| 4xx rate | Analytics → Errors | 401 spike = leaked token or misconfigured user |
| Bandwidth | Settings → Usage | nearing tier cap = upgrade |

### 1c. Slack `#design-system` skim

Look for friction posts ("kok `dash add` error?"). Respond within 1 working day.

---

## 2. Weekly — 15 minutes

Pick a fixed slot — Monday 10am works. Goal: know who's adopting + who's stuck.

### 2a. Adoption metric pull

```bash
# Top 10 most-installed components last 7 days
# (assumes LOG_DRAIN_URL configured; otherwise use Vercel function logs export)
curl -s "https://ds.dash.com/api/registry/_admin/top?days=7" \
  -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" | jq
```

Note in vault `06-Adoption-Metrics.md`:

```markdown
## 2026-05-26 Week
- 8/10 users active (Andi, Budi, Citra, Dani, Edo, Fitri, Galih, Hanif)
- top: data-table (12), button (9), form (7), modal (6), avatar (5)
- inactive: 2 users (Indra, Joko) — Slack DM to find friction
- 4xx rate: 0.3% (mostly token-not-set in fresh repos)
```

### 2b. Outstanding GitHub issues

```bash
gh issue list --repo dash-tech/design-system --state open --limit 20
```

Triage:
- **P1 broken-on-prod**: fix today, ship same-day
- **P2 friction**: schedule next sprint
- **P3 enhancement**: backlog (`07-Ideas-Backlog.md`)

### 2c. Type-check + smoke

```bash
cd /Users/irfanprimaputra.b/dash-ds
git pull
pnpm tsc --noEmit
bash scripts/smoke.sh https://ds.dash.com "$DASH_REGISTRY_TOKEN"
```

Catches drift between main branch and production.

---

## 3. Monthly — 30 minutes

End of month. Roll up insights.

### 3a. Component lifecycle review

For each component:

| Bucket | Action |
|---|---|
| **Heavy use** (>10 installs/mo) | Stable. Defer breaking changes. |
| **Light use** (1-10 installs/mo) | OK. Watch friction. |
| **Zero use** (3 months 0 installs) | Mark deprecated. Plan removal at next major. |

Update `02-Component-Catalog.md` in vault.

### 3b. Dependency audit

```bash
cd /Users/irfanprimaputra.b/dash-ds
pnpm outdated
pnpm audit
```

Patch security issues immediately. Minor bumps: monthly. Major bumps (Next.js / React / Tailwind): quarterly (Section 4).

### 3c. Backup verify

Vercel auto-backs-up deploys. GitHub auto-backs-up source. Manual:
```bash
cd /Users/irfanprimaputra.b/dash-ds && git pull && git log -1
# confirm last commit hash matches Vercel deployment commit
```

---

## 4. Quarterly — 2 hours

End of Mar / Jun / Sep / Dec.

### 4a. Token rotation

Per `DEPLOY.md` Section 9. New token, Vercel envs, 1Password share, Slack announce, 7-day grace, retire old.

### 4b. Major version bumps

| Stack | Cadence | Risk |
|---|---|---|
| Next.js | quarterly | medium — breaking changes per release |
| React | yearly | low |
| Tailwind | yearly | medium — class renames |
| Radix UI (per primitive) | as released | low |

Workflow:
1. Branch `chore/upgrade-next-17`.
2. `pnpm up next@latest`.
3. Run smoke + 5 random component pages in browser.
4. Fix breakages. Commit per package.
5. Deploy preview. Send Vercel preview URL to 2 users for smoke.
6. Merge → main → prod after user thumbs-up.

### 4c. Open questions sweep

Review `04-Decisions-Log.md` for "OPEN" rows. Force-close one way or the other (decide + document, no infinite "still open" rows).

---

## 5. Add a new component (single most common task)

Time: ~30 min code + 15 min docs.

```bash
cd /Users/irfanprimaputra.b/dash-ds
git checkout -b feat/component-rating-stars

# 1. Pull source from Figma / AlignUI Pro
#    (Figma MCP get_design_context / get_screenshot)

# 2. Write component
$EDITOR registry/dash/ui/rating-stars.tsx
# anatomy: forwardRef · data-slot · cva variants · @/registry/dash/lib/utils

# 3. Add entry to registry.json items[]
$EDITOR registry.json
# {
#   "name": "rating-stars",
#   "type": "registry:ui",
#   "title": "Rating Stars",
#   "description": "5-star rating input with half-step support.",
#   "dependencies": ["@radix-ui/react-slot"],
#   "registryDependencies": ["@dash/utils"],
#   "files": [
#     { "path": "registry/dash/ui/rating-stars.tsx", "type": "registry:ui" }
#   ]
# }

# 4. Build registry
pnpm tsx scripts/build-registry.ts
# (later: `dash build` after CLI graduates to root)

# 5. Add docs page
$EDITOR "app/(docs)/docs/components/rating-stars/page.tsx"
# Use DocsPageShell + DocsHeader + DocsSection + DocsExample

# 6. Type-check + visual
pnpm tsc --noEmit
pnpm dev  # eyeball http://localhost:3000/docs/components/rating-stars

# 7. Smoke
bash scripts/smoke.sh http://localhost:3000 ""

# 8. Commit + push
git add -A
git commit -m "feat(rating-stars): add @dash/rating-stars component"
git push -u origin feat/component-rating-stars
gh pr create --fill

# 9. After merge: Vercel auto-deploys. Within 60s available at:
#    https://ds.dash.com/r/rating-stars.json

# 10. Slack:
#     "@dash/rating-stars shipped — install: `dash add rating-stars`"
```

---

## 6. Add a new template / block

Identical to Section 5 except `type: "registry:block"` or `"registry:page"` and the file lives in `registry/dash/blocks/` or `registry/dash/templates/`.

For templates, set `target: "<consumer-path>"` so `dash add` knows where to write:
```json
{ "path": "registry/dash/templates/list-detail.tsx", "type": "registry:page", "target": "app/list-detail/page.tsx" }
```

---

## 7. Rollback (a deploy burned production)

Vercel keeps every deploy. Roll back without touching code:

```bash
# Find last green deploy
vercel ls --prod | head -10

# Promote it to production alias
vercel rollback https://design-system-<hash>-dash.vercel.app --prod
```

Or via web: Vercel dashboard → Deployments → previous green deploy → `...` → Promote to Production.

DNS stays pointed at the Vercel project. Active deploy alias swaps instantly. Consumers see new (rolled-back) registry on their next `dash add`.

After rollback: open the bad deploy logs, find root cause, fix on a branch, PR, re-deploy.

---

## 8. Breaking change protocol

You renamed `Button.tsx`'s `loading` prop to `pending`. Users in 5 repos have `<Button loading>`.

**DO NOT** ship to main and hope. Instead:

1. Branch `feat/button-rename-loading`.
2. Code change.
3. **Bump version**: add `version: "0.2.0"` (or bump major) to `registry.json` items[]:
   ```json
   { "name": "button", "version": "0.2.0", "deprecates": { "version": "0.1.x", "prop": "loading", "replacement": "pending" } }
   ```
4. Add **migration note** to `app/(docs)/docs/components/button/page.tsx` in a "Migrating from 0.1.x" section.
5. Slack `#engineering` 1 week before merge:
   > Heads up — `@dash/button` v0.2.0 next Monday. `loading` prop renamed to `pending`. Codemod: `find . -name "*.tsx" | xargs sed -i '' 's/loading=/pending=/g'` (review diff before commit).
6. Merge after week of grace.
7. After merge, monitor `4xx` rate in Vercel — spike = users missed announcement, ping them direct.

For nuclear-level changes (rename component, drop component): add 30-day deprecation banner on docs page first, then remove.

---

## 9. Onboard a new user

When a new engineer joins Dash:

```bash
# 1. Share 1Password vault item "Dash Registry — DASH_REGISTRY_TOKEN (prod)"
# 2. Slack DM:
```

> Welcome 🟣. Setup Dash DS:
> 1. `pnpm i -g dash` (or `pnpm dlx github:dash-tech/dash-cli#v1` if no npm registry access)
> 2. In your first Dash repo: `cd <repo> && dash init` (grab token from 1Password "Dash Registry")
> 3. `dash mcp init` (wires Claude Code to query the registry natively)
> 4. Bookmark https://ds.dash.com/docs — Quick Start + decision tree
> 5. First feature, ping me — I'll shadow once.

Track in vault `06-Adoption-Metrics.md` under "Onboarded".

---

## 10. Decommission protocol (when DS evolves past current shape)

If Dash team grows to 30+ users and current Bearer model breaks (token sprawl), migrate:
- Per-user OAuth via Vercel SSO
- Self-hosted npm registry (Verdaccio at `npm.dash.com`)
- CI-enforced consumer linting

Not now. Trigger criteria: any user complaints about token rotation friction OR 30+ users OR external partner needs registry access.

---

## Vault sync

Every entry above should backlink to vault:
- Decisions → `04-Decisions-Log.md`
- Adoption → `06-Adoption-Metrics.md`
- Components → `02-Component-Catalog.md`
- Token rotations → `Daily-Logs/YYYY-MM-DD-token-rotation.md`

Don't keep ops state in this README. This is the playbook; vault is the journal.
