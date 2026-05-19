# Dash Design System — Roadmap

Single source of truth for what's shipped, what's next, and what's deferred.
Read this before adding work. Update after every meaningful commit.

Last updated: 2026-05-17 (Figma Parity v2 in progress on `feat/figma-parity-v2`)

---

## 🚧 Figma Parity v2 (branch `feat/figma-parity-v2`)

100% Figma parity push. Multi-agent autonomous dispatch. Status:

- [x] **Phase 1** — Token catalog sync from `.figma-cache/design-tokens.tokens.json`.
  430+ CSS vars: foundations (slate+gray+9 colors), 11 state semantic × 4 tones,
  semantic light+dark, radius/spacing, shadows composed, typography classes.
  Commits: `a4cc6d7`, `314ab88`, `e930235`.
- [x] **Phase 2** — Component audit 9 parallel agents, 60+ components.
  86 decisions logged (D1-D86), 9 BREAKING visual diffs flagged.
  Commits: `2ec2daa`, `eddcd17`, `4dd6fda`, `1ea1dda`, `7b4168d`, `3a3fee3`,
  `0df3ad2`, `1101ed4`, `5d71b3d`.
- [x] **Phase 3a** — Sector templates 21 ported (HR/Finance/Marketing × 7).
  Replaced placeholder dashboards with Figma 1:1 ports.
  Commits: `e96ffad`, `55dbd7a`, `722d8c4`.
- [x] **Phase 4a** — Auth blocks provenance documented.
  Commit: `93c2f8e`.
- [x] **Phase 5a** — Theme infra (FOUC-prevention inline script, body
  semantic bg, ThemeToggle uses Dash tokens).
  Commit: `87c4d5f`.
- [ ] **Phase 3b** — Headers + Widgets block extraction (BLOCKED rate-limit reset 4:10pm)
- [ ] **Phase 4b** — Per-component Examples extraction (BLOCKED rate-limit)
- [ ] **Phase 5b** — Visual regression Playwright setup (defer until user signal)
- [ ] **Icons HOLD** — 3061 Figma Remix icons not ported (awaiting user signal)

Audit trail: `figma-audit/` (decisions.md, hold-list.md, dash-extensions.md,
phase2-summary.md, phase3-summary.md, component-node-map.md).

---



---

## ✅ DONE — Shipped to main

### Phase 0 — Bootstrap (Day 1)
- [x] Next.js 16 + React 19 + Tailwind v4 + TypeScript scaffold
- [x] `components.json` Dash-owned schema with `@dash` registry namespace
- [x] `scripts/build-registry.ts` — inline file contents, emit `public/r/*.json`
- [x] `registry/dash/lib/utils.ts` cn helper

### Phase 1 — Foundations
- [x] OKLCH semantic tier tokens (light + dark) in `app/globals.css`
- [x] Figma `design-tokens.tokens.json` parity audit + sync (2026-05-16)
  - [x] Fix `stroke-soft-200` dark drift (n.700 → n.800)
  - [x] Add 40 missing state-color dark-mode overrides (10 × 4 tiers)
- [x] Dash purple brand color `--dash-purple-500: #5e2aac`

### Phase 2 — Components (76 shipped)
- [x] 12 atoms — Button, IconButton, LinkButton, FancyButton, Input,
  Label, Textarea, Badge, Avatar, Separator, Skeleton, Spinner, etc.
- [x] 22 composites — Card, Dialog, Sheet, Drawer, Popover, Tooltip,
  DropdownMenu, ContextMenu, NavigationMenu, Select, Combobox, Tabs,
  Accordion, Collapsible, Checkbox, RadioGroup, Switch, Slider, Form,
  Progress, Sonner, InputOTP, Resizable
- [x] 9 specialized — Calendar, DatePicker, Command, DataTable, Sidebar,
  Chart, Pagination, Breadcrumb, Carousel, Alert
- [x] 2 hooks — useDebounce, useMobile

### Phase 3 — Blocks (30 shipped)
- [x] 8 Auth — login (Aurora/Solaris/Phoenix/Apex + 4 key-icon variants),
  register (Aurora/Solaris/key), reset-password (key), verification (key)
- [x] 3 legacy login (01/02/03) + 2 signup (01/02) + forgot-password-01
- [x] Tables — orders-table, products-grid
- [x] Lists — my-cards-stack, activity-timeline
- [x] Dashboard — analytics-grid, empty-state-collection
- [x] Settings — profile, notifications, privacy-security, team, integrations

### Phase 4 — Templates (11 shipped)
- [x] Generic — auth-shell, dashboard-shell, list-detail-page,
  form-stepper-page, settings-tabs-page
- [x] Vertical dashboards — finance, hr, marketing
- [x] Dash-custom — halo-dash-3pane, mitra-suspend-page, phase7-results-page

### Phase 5 — AI Rules
- [x] `registry/rules/dash-ai-rules.md` — anatomy guide + decision tree +
  token rules + form pattern + AI consumption hint

### Phase 6 — Docs site
- [x] 30 docs routes (foundations, installation, forms, registry, theming,
  tools, library overview pages)
- [x] Sidebar IA (7 sections, 30 entries covering all routes)
- [x] Detail-page anatomy — DocsHeader with status pill + tabs,
  DocsPrinciples, DocsDoDont, DocsVariantTable, floating right-rail
  action card
- [x] Breadcrumb auto-derived from pathname
- [x] On-this-page TOC auto-scan with duplicate-id dedupe
- [x] Code block with hairline header (lang label + copy button)
- [x] Theme toggle bidirectional (light ↔ dark)
- [x] cmd+K command menu
- [x] Light-default topbar with backdrop blur

### Phase 7 — Dash CLI (packages/dash-cli)
- [x] `dash init` — scaffold consumer project
- [x] `dash add <name>` — fetch + install registry item with deps
- [x] `dash build` — graduated from scripts/ to CLI
- [x] `dash search <query>` — full-text search registry
- [x] `dash list` — list installed/available items
- [x] Bearer auth header interpolation from env

### Phase 8 — Registry API + Auth (Day 7 from plan)
- [x] `app/api/registry/[name]/route.ts` — Bearer-gated GET
- [x] `app/api/registry/index/route.ts` — gated master index
- [x] `app/api/registry/_auth.ts` — constant-time XOR compare helper
- [x] `middleware.ts` — gates legacy `/r/*.json` static paths
- [x] `.env.example` with token gen instructions
- [x] `components.json` default updated to Bearer-headed API path
- [x] Docs page `/docs/registry/authentication` rewritten with real impl

---

## ⬜ DO NEXT — Priority order for production-grade

Honest audit against full-stack reality (frontend / API / DB / auth /
hosting / cloud / CI/CD / security / rate-limit / cache / scaling /
error-tracking / availability). Current state: 1.5/13 strong, 4/13
partial, 7.5/13 missing. Below items close the critical gap for an
internal-only 10-PE Dash deployment.

### 🔥 P0 — Production blockers (must-do before ds.dash.com goes live)
- [ ] **Vercel deploy + ds.dash.com DNS** (~2 jam) — without this, Dash DS
  only exists on Irfan's laptop. Block all PE adoption. Closes layer
  5 (Hosting) + 6 (Cloud) + 11 (Scaling, free via Vercel auto-scale).
  - [ ] Push to GitHub `dash-ev/dash-ds` private repo
  - [ ] Vercel project connect + `DASH_REGISTRY_TOKEN` env var
  - [ ] Custom domain `ds.dash.com` (DNS A/CNAME from Cloudflare)
  - [ ] Verify HTTPS + edge region (Singapore for Indonesia latency)

- [ ] **GitHub Actions CI** (~2 jam) — catch tsc/build/lint regressions
  before merge. Closes layer 7 (CI). Workflow: `pnpm install + tsc
  --noEmit + pnpm lint + pnpm build`.

- [ ] **Rate limiting** (~2 jam) — protect against Bearer brute-force +
  Vercel invocations bill amplification. Closes layer 9.
  - [ ] Upstash Redis free tier (10k commands/day enough for 10 PE)
  - [ ] Middleware: max 60 req/min per IP, max 1000 req/hr per token
  - [ ] 429 response with Retry-After header

- [ ] **Error tracking** (~1 jam) — Sentry free tier. Closes layer 12.
  - [ ] `@sentry/nextjs` install + DSN env var
  - [ ] Slack webhook alert if error rate spikes >1% in 5 min
  - [ ] Capture unhandled exceptions in API routes + middleware

- [ ] **Uptime monitoring** (~30 min) — UptimeRobot free tier ping
  `/api/health` every 5 min. SMS/email on 2-min downtime. Closes
  layer 13 (Availability) minimum.
  - [ ] Build `/api/health` endpoint (returns 200 + version + ts)
  - [ ] Configure UptimeRobot with email + Slack notify

### 🟡 P1 — Feature work (post-deploy)
- [ ] **`@dash/mcp-server` package** (~6 jam) — Claude Code integration.
  Tools: `list_components`, `get_component`, `search`. PE Claude
  auto-discovers blocks as they ship.
- [ ] **CLI publish to GitHub Packages** (~3 jam) — `pnpm i -g dash`
  for all 10 PE. CI release workflow on git tag.
- [ ] **Multi-stack `dash init` templates** (~4 jam) — Vite/Remix/Astro
  variants alongside the Next.js default.
- [ ] **`@dash/skill` package** (~6 jam) — Claude Code skill format
  with `dash info --json` introspection. Depends on MCP done.
- [ ] **Smoke test campaign** — 1 PE (Andi or similar) ships a feature
  using ≥3 @dash items in <1 day. Document ROI.

### 🟢 P2 — Nice-to-have (post-adoption)
- [ ] **Audit log table** (~3 jam) — needs Database layer 3.
  `(project_id, item, ts)` per fetch. Adoption metric + leak forensic.
- [ ] **Per-user Bearer tokens** (~4 jam) — graduate from single-secret.
  Scopes, expiry, per-user revocation. Closes layer 4 properly.
- [ ] **Token rotation cron** (~2 jam) — quarterly auto-rotate with
  7-day grace window. Closes layer 8 (security) operational.
- [ ] **More Dash-custom templates** — pending user-provided Figma frame
  list (driver-onboarding, KYC stepper, etc).
- [ ] **AlignUI parity full audit** — 70+ remaining components vs
  Figma spec. Tackle when block additions slow down.

---

## ⏸ DEFERRED — Out of scope for v1 (10 PE internal)

These layers are valid full-stack concerns but the cost/benefit doesn't
justify them yet. Revisit when team grows past 30 PE or use case shifts
to multi-tenant.

- **Database & Storage (layer 3)** — registry stays file-based on disk
  until adoption metric demand justifies. Move to Supabase + Drizzle
  when audit log + per-user tokens go in (P2 above).
- **RLS / CSRF (layer 8 deep)** — no DB → no row-level concerns.
  Add when DB lands.
- **Redis cache layer (layer 10 deep)** — current Cache-Control + Vercel
  CDN sufficient for 10-PE traffic. Skip unless load test shows hotspots.
- **Load testing + capacity planning (layer 11 deep)** — 10 PE × 100
  installs/day = 0.01 req/sec average. Vercel free tier handles 1000x
  this comfortably. Skip until traffic 100x current projection.
- **Multi-region failover (layer 13 deep)** — DR plan for single-region
  outage. Acceptable to wait until Dash DS is a hard dependency for
  production releases (not yet — PE can fall back to local installs).

---

## ❌ DROPPED — Decided not to do

- Thin wrapper around shadcn CLI — rejected for sovereignty (D5 in
  Decisions Log). Dash owns its CLI 100%.
- Public/anonymous registry tier — Figma license violation, kept gated.
- v0.dev compatibility — `cssVars`/`css`/`headers` not supported by
  v0, internal-only trade-off accepted.

---

## Update protocol

When you finish work that crosses a checkbox here:
1. Move the item from "DO NEXT" to "DONE" (with date if material)
2. Commit message references "ROADMAP.md" so the audit trail stays clean
3. If you discover NEW required work, add to DO NEXT under correct P-tier
4. If you decide a P0/P1 item should be skipped, MOVE it to DEFERRED or
   DROPPED with a one-line reason. Don't silently delete.
