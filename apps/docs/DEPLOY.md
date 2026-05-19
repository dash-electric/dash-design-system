# Deploy Runbook — Dash Design System

End-to-end checklist for promoting `dash-ds` to `https://ds.dash.com` (Vercel production). Designed for a single owner to execute in **~45 minutes** the first time, ~10 minutes for subsequent rolls.

> **Audience**: Irfan (CEO, owns infra). Hand to a teammate later via 1Password share.

---

## 0. Prerequisites

| Item | Where | Status |
|---|---|---|
| GitHub access to `dash-tech` org | github.com | needed |
| Vercel account on Dash team | vercel.com/dash | needed |
| DNS control for `dash.com` | (Cloudflare / Route53 / wherever) | needed |
| 1Password vault `Engineering / Dash DS` | 1Password | will create token here |
| Local `pnpm` + `node 20+` | terminal | should already have |

If any are missing, fix BEFORE starting. The rest of this runbook assumes all four exist.

---

## 1. Push to GitHub (once, ~5 min)

```bash
cd /Users/irfanprimaputra.b/dash-ds

# Create remote repo (private, no description published)
gh repo create dash-tech/design-system \
  --private \
  --source=. \
  --remote=origin \
  --description="Dash internal Design System — closed source, internal team only" \
  --push
```

Verify:

```bash
gh repo view dash-tech/design-system --web
```

Repo should be **Private**. License absent (this is intentional — `NOTICE.md` covers internal-only terms).

---

## 2. Generate Bearer token (once, ~2 min)

```bash
# Strong 256-bit token, URL-safe
openssl rand -base64 32
```

Copy the output. Save to 1Password:

- Vault: `Engineering`
- Item: `Dash Registry — DASH_REGISTRY_TOKEN (prod)`
- Field `password`: paste token
- Tag: `dash-ds`, `infra`, `rotate-quarterly`
- Notes: "Rotated 2026-05-20. Next rotation 2026-08-20."

Share with the 10 PE later (Section 7).

---

## 3. Vercel project setup (once, ~10 min)

### 3a. Import repo

```bash
# Easiest path — CLI
vercel link --project=dash-ds --yes
vercel --prod
```

OR via web: vercel.com → New Project → `dash-tech/design-system` → keep all defaults (Next.js auto-detected) → Deploy.

### 3b. Add environment variables

Project → Settings → Environment Variables. Add for **Production** + **Preview**:

| Name | Value | Notes |
|---|---|---|
| `DASH_REGISTRY_TOKEN` | (paste from 1Password Section 2) | REQUIRED |
| `NEXT_PUBLIC_DASH_DS_VERSION` | `0.1.0` | Surfaced by `/api/health` |
| `UPSTASH_REDIS_REST_URL` | (optional) | Skip Day 1; in-memory fallback works |
| `UPSTASH_REDIS_REST_TOKEN` | (optional) | Skip Day 1 |
| `SENTRY_DSN` | (optional) | Skip Day 1 |
| `LOG_DRAIN_URL` | (optional) | Skip Day 1 |

Click **Save**. Trigger a redeploy (`vercel --prod` or push a commit) so new envs propagate.

### 3c. Project settings

- **Node.js Version**: 20.x
- **Build Command**: `pnpm build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install --frozen-lockfile` (auto-detected if `pnpm-lock.yaml` present)

---

## 4. DNS + custom domain (once, ~15 min including propagation)

### 4a. Add domain in Vercel

Project → Settings → Domains → Add → `ds.dash.com`.

Vercel will display either a CNAME target (e.g. `cname.vercel-dns.com`) or A record IPs. Note it down.

### 4b. Add DNS record at your registrar

| Type | Name | Value | TTL |
|---|---|---|---|
| `CNAME` | `ds` | `cname.vercel-dns.com` | 300 |

(Or A record(s) if Vercel asks for that — depends on your registrar's CNAME-at-apex support; `ds.dash.com` is a subdomain so CNAME is fine.)

### 4c. Verify

```bash
# Allow 1–5 min for propagation
dig ds.dash.com CNAME +short
# expect: cname.vercel-dns.com

curl -I https://ds.dash.com
# expect: HTTP/2 200, server: Vercel
```

Vercel auto-provisions a Let's Encrypt cert once DNS resolves. Wait for the green checkmark in Vercel → Domains.

---

## 5. Smoke test (once, ~5 min)

Verify auth gate, health, and a representative registry item.

```bash
TOKEN="<paste DASH_REGISTRY_TOKEN>"

# Health (public, no auth)
curl -s https://ds.dash.com/api/health | jq
# expect: { "status": "ok", "version": "0.1.0", ... }

# Registry WITHOUT token — must be 401
curl -s -o /dev/null -w "%{http_code}\n" https://ds.dash.com/r/button.json
# expect: 401

# Registry WITH token — must be 200 + JSON
curl -s -H "Authorization: Bearer $TOKEN" https://ds.dash.com/r/button.json | jq '.name, .type'
# expect: "button", "registry:ui"

# (note: Dash uses `modal`/`sheet`/`drawer` not Radix `dialog`)

# Full smoke (30 routes)
bash scripts/smoke.sh https://ds.dash.com "$TOKEN"
```

If the script reports anything ≠ 200/401-expected, **STOP** and investigate before Section 6.

---

## 6. Wire CLI consumer (one Dash repo, ~5 min)

Pick the most-active Dash repo (e.g., `dash-tech/portal`, `dash-tech/halo-dash`). In that repo:

```bash
# Install dash CLI globally if not already
pnpm i -g dash   # (or pnpm dlx github:dash-tech/dash-cli#v1)

# Configure consumer
cd <dash-repo>
echo "DASH_REGISTRY_TOKEN=$TOKEN" >> .env.local

# Initialize
dash init
# prompts:
#   - registry URL: https://ds.dash.com   (default)
#   - token: pulled from .env.local
#   - framework: auto-detected
# writes:
#   - components.json (with @dash registry preconfigured)
#   - app/globals.css (or framework equivalent) with Dash base tokens
#   - installs @dash/base-theme

# First install
dash add button
# expect: files written to registry/dash/ui/button.tsx, deps installed
```

If `dash init` or `dash add` fails, capture the full error + tagged `@dud` in `#design-system` Slack channel before continuing.

---

## 7. Distribute token to PE Dash (~5 min)

In 1Password:

1. Right-click the `Dash Registry — DASH_REGISTRY_TOKEN (prod)` item → Share → Vault → `Engineering / PE Access (read-only)`.
2. Share that vault with the 10 PE.
3. Slack `#engineering`:

   > Dash DS is live at https://ds.dash.com 🟣
   > Install CLI: `pnpm i -g dash`
   > Wire your repo: `cd <repo> && dash init` (grab token from 1Password → "Dash Registry — DASH_REGISTRY_TOKEN").
   > Docs: https://ds.dash.com/docs
   > Bugs / friction: ping @irfan or `#design-system`.

---

## 8. Post-deploy monitoring (ongoing)

| Metric | Where | Action if degraded |
|---|---|---|
| `/api/health` 200 | UptimeRobot ping (5 min) | Vercel logs |
| Registry hit count / day | Vercel Analytics or `LOG_DRAIN_URL` if set | — |
| 401 rate spike | Vercel logs | Token leaked? Rotate (Section 9) |
| Build failures | Vercel deploy alerts | Investigate, rollback to last green |

---

## 9. Token rotation (quarterly, ~10 min)

Schedule: **2026-08-20**, **2026-11-20**, etc.

```bash
# 1. Generate new token
openssl rand -base64 32

# 2. Update 1Password — keep OLD value in "Previous tokens" note for 7-day grace
# 3. Update Vercel env var DASH_REGISTRY_TOKEN (both Production + Preview)
# 4. Trigger redeploy: vercel --prod
# 5. Update 1Password vault item, re-share with PE
# 6. Slack announcement: "Token rotated. Pull from 1Password, update .env.local, restart dev server."
# 7. After 7 days, remove old token note from 1Password
```

Stagger rotation away from sprint releases to avoid blocking PE mid-feature.

---

## 10. Rollback (if something burns)

```bash
# Last-known-good deploy URL from Vercel dashboard → Deployments → Promote
vercel rollback https://design-system-<previous-hash>-dash.vercel.app --prod
```

Or via web: Vercel → Deployments → previous green deploy → "..." → Promote to Production.

DNS does not need to change (still points at Vercel project; just the active deployment alias swaps).

---

## Appendix — Why this is bare-bones

We're intentionally NOT setting up:

- Per-PE OAuth (10 users, Bearer token is fine; rotate quarterly)
- Public docs (license forbids; `NOTICE.md`)
- Self-hosted npm registry (Vercel + raw URLs work; npm registry is Day-30+ work)
- CI build matrix (Vercel handles it)
- Per-tenant rate-limiting tiers (in-memory limit fine for 10 users)

Add complexity only when 10 → 30 PE forces it. See `ROADMAP.md` for the trigger criteria.
