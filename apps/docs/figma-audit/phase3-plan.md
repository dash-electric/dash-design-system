# Phase 3 — Blocks & Templates plan

## Discovery

HR Management page alone (`3715:42038`) = **~40 template frames** at 1440×900. Each is a full page composition (Dashboard, Calendar, Settings, Login, Onboarding flows, etc).

Estimated total Figma template inventory:
- HR Management: ~40 templates
- Finance & Banking: ~30-40 templates
- Marketing & Sales: ~30-40 templates
- Cryptocurrency: HOLD (Figma marks "Soon")
- AI Product: HOLD (Figma marks "Soon")

**Total**: 100-120 page templates across 3 active sectors.

Current Dash:
- `registry/dash/blocks/` — 30 block-level compositions
- `registry/dash/templates/` — 11 full pages

**Gap**: ~80-100 templates to extract + port.

## Strategy

### Tier 1 — Per-sector flagship pages (priority)

For each sector, port the 5-10 most iconic pages first:

**HR Management** (node-ids from `node-3715_42038.json`):
- `3715:42065` Dashboard (main)
- `3873:39572` Calendar
- `3880:69995` General Settings
- `3878:62221` Teams
- `3901:15361` Login
- `3902:26059` Register
- `3902:26187` Reset Password

**Finance & Banking** (`3911:35677` — pull next):
- Dashboard, Transactions, Cards, Payments, Settings

**Marketing & Sales** (`6696:81119` — pull next):
- Dashboard, Analytics, Campaigns, Audience, Settings

### Tier 2 — Block compositions (per component)

For each component page already pulled (Badge, Banner, Button, etc), scan for nested `FRAME` named "Examples" or "Sample" or "Composition". These are the block-level patterns shown on docs pages.

Pattern from Badge: `node-2939_19642.json` contains 3 composition examples (Week's Top Contributor, Profile Account dropdown, Status Tracker). Each becomes a registry:block.

### Tier 3 — Auth flows

Welcome (`553:15317`) + Get Started (`553:15318`) + Login Pages (per-sector) → standardize into `auth-*` block family.

Current `auth-login-apex`, `auth-login-key`, `auth-login-phoenix` etc. need to be cross-referenced to Figma to verify they match exactly or are Dash-custom variants (log to dash-extensions.md if so).

## Execution plan

### Step 1 — Pull remaining sector pages (single-threaded after components done)

```bash
pnpm figma:nodes 3911:35677  # Finance & Banking
pnpm figma:nodes 6696:81119  # Marketing & Sales
pnpm figma:nodes 3829:27858  # Headers
pnpm figma:nodes 2950:5881   # Widgets
pnpm figma:nodes 3860:4301   # Empty States (likely already pulled by data-display agent)
```

### Step 2 — Build full template inventory script

`scripts/figma-block-inventory.ts` parses each cached sector JSON, emits:
- `figma-audit/block-inventory.md` — full list of FRAMES + bounding box + suggested registry name
- Cross-reference to existing Dash blocks/templates
- Gap report (Figma has X, Dash has Y, missing Z)

### Step 3 — Dispatch block-extraction agents

Per sector:
- Agent: extract N template frames from sector JSON → write `registry/dash/templates/<sector>-<name>.tsx`
- Use Dash semantic tokens
- Register in `registry.json`
- Add docs page at `app/(docs)/docs/templates/<sector>-<name>/page.tsx`

### Step 4 — Per-component Examples scan

Single sweep agent: scan all `node-<id>.json` for component pages, find `FRAME` named "Examples"/"Sample", extract composition → `registry/dash/blocks/<component>-<example>.tsx`.

## Hold list candidates

- Cryptocurrency / AI Product templates (Figma marks "Soon")
- Sector templates requiring custom domain data (HR roster, Finance transactions) — patch with mock data, log
- Any template with embedded chart/illustration that needs raster export — log for asset pipeline

## Volume estimate

After Phase 3:
- Blocks: 30 → ~80-120
- Templates: 11 → ~50-80
- Total registry items: ~60 → ~200-250
