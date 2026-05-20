# Dash Platform — Layered Architecture

> The architecture that lets one design system serve Dash Ride, Dash Logistic, Dash Travel, Dash Marketplace, and external Trellis tenants — without forking, without drift, without compromise.

**Status:** Foundation locked. Phase A–D in progress (registry refactor). Phase E = this doc.
**Audience:** Head of Design, Engineering, Product, and any consumer team onboarding to the platform.

---

## Vision

Dash is no longer a single product. It is a **platform** that ships a family of mobility + commerce verticals (Ride, Logistic, Travel, Marketplace, Outsourcing, …) and licenses the same battle-tested foundation to external partners via **Trellis** — our white-label SaaS.

The design system has to do two contradictory things at once:

1. **Unify** — every Dash product should feel like a Dash product. Same typography rhythm, same motion, same accessibility floor, same trust signals.
2. **Diverge** — Ride wants electric-purple energy, Logistic wants industrial precision, Travel wants warmth, Trellis tenants want their own brand. One global theme cannot fit four products plus N tenants.

A flat single-brand DS solves (1) and breaks (2). A per-product fork solves (2) and breaks (1) — drift wins within 6 months, the team is sunk.

**The Layered Architecture is the synthesis: lock what must be shared, let theme + workflow diverge cleanly.**

---

## The 4 Layers

```
┌──────────────────────────────────────────────────────────────────────┐
│  Layer 3 — Workflow Blocks         divergent · per product · large   │
│  ride-dispatch-board, logistic-route-planner, travel-itinerary-card  │
│  marketplace-pdp, outsourcing-roster, trellis-tenant-onboarding      │
└────────────────────────────────▲─────────────────────────────────────┘
                                 │  composes
┌────────────────────────────────┴─────────────────────────────────────┐
│  Layer 2 — Product / Tenant Theme  divergent · accent + voice · sm   │
│  --accent-base, --accent-dark, voice ("Anda" formal · "kamu" casual) │
│  ride · logistic · travel · marketplace · trellis-{tenantId}         │
└────────────────────────────────▲─────────────────────────────────────┘
                                 │  consumes tokens from
┌────────────────────────────────┴─────────────────────────────────────┐
│  Layer 1 — Common Primitives        shared · atom-level · stable     │
│  Button, Input, Select, Badge, Modal, Tabs, Tooltip, Avatar, Toast   │
│  All consume Layer 0 tokens. Never hard-code brand or product values.│
└────────────────────────────────▲─────────────────────────────────────┘
                                 │  consumes tokens from
┌────────────────────────────────┴─────────────────────────────────────┐
│  Layer 0 — Brand Foundation         shared · LOCKED · global         │
│  Type ramp · spacing scale · radius scale · motion curves · a11y     │
│  Semantic tokens (bg/text/stroke/icon × strong/sub/soft/disabled)    │
│  State palette (success/info/warning/error/away/feature/faded)       │
└──────────────────────────────────────────────────────────────────────┘
```

### Layer 0 — Brand Foundation (shared, locked)

The non-negotiable substrate. Touching Layer 0 is a Head of Design decision, not a designer-level decision.

- **Type ramp** — Inter, 12 / 14 / 16 / 20 / 24 / 32 / 48 with locked line-heights and tracking
- **Spacing scale** — 4-pt grid, semantic `space-*` tokens
- **Radius scale** — `--radius-4` … `--radius-24`
- **Motion curves** — `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`
- **Semantic token tiers** — `bg-*`, `text-*`, `stroke-*`, `icon-*` × strong / sub / soft / disabled / weak / white
- **State palette** — 8 states × 4 levels (lighter / light / base / dark)
- **Accessibility floor** — WCAG 2.2 AA contrast, 44-pt minimum touch target, focus ring spec

### Layer 1 — Common Primitives (shared, atom-level)

The building blocks every product uses. ~76 components. **Never** hard-code brand color; **always** consume Layer 0 tokens.

Button, Input, Select, Checkbox, Radio, Switch, Badge, Avatar, Tag, Chip, Modal, Drawer, Popover, Tooltip, Tabs, Accordion, Toast, Banner, Alert, Skeleton, Spinner, Progress, Slider, DatePicker, FileUpload, Combobox, Command, Breadcrumb, Pagination, Table, Card, Divider, …

A primitive that breaks the contract — e.g. `<Button>` referencing `#5e2aac` directly instead of `--accent-base` — is rejected at CI by `dash audit`.

### Layer 2 — Product / Tenant Theme (divergent)

This is the layer that **bends**. A theme is a small manifest that overrides:

- **Accent tokens** — `--accent-base`, `--accent-dark`, `--accent-darker`, `--accent-on`
- **Voice metadata** — formal "Anda" vs casual "kamu", terminology overrides
- **Density preset** — compact / cozy / comfortable (defaults to cozy)
- **Optional radius override** — Marketplace runs sharper corners

A theme is ~30 lines. That is the entire delta needed to rebrand. The primitives don't change. The blocks don't change. Just the theme manifest.

### Layer 3 — Workflow Blocks (divergent)

Product-specific composites. Dash Ride has `ride-dispatch-board`. Dash Logistic has `logistic-route-planner`. Marketplace has `marketplace-pdp`. Trellis tenants compose their own from Layer 1 + their theme.

Blocks are owned by the product team, reviewed by DS for foundation compliance, and registered with a `theme:` field declaring which product they target (or `shared` if generic).

---

## Why hybrid wins (alt approaches considered)

| Approach | Unity | Divergence | Drift risk | Verdict |
| --- | --- | --- | --- | --- |
| Single-brand monolith | ✅ strong | ❌ blocked | ✅ low | Breaks the moment Logistic ships |
| Per-product fork | ❌ none | ✅ total | ❌ extreme | Drift wins in 6 months, team sinks |
| CSS variable override only | ✅ strong | ⚠️ shallow (accent only) | ⚠️ medium | Can't express voice / density / workflow |
| Multi-brand registry (Radix / shadcn pattern) | ✅ strong | ✅ accent + density | ✅ low | Doesn't model workflow divergence |
| **Layered (Layer 0–3)** | **✅ strong** | **✅ accent + voice + workflow** | **✅ low (CI-enforced)** | **Adopted** |

The layered model is the only approach that lets Layer 3 (`ride-dispatch-board`) be radically different from Layer 3 (`logistic-route-planner`) while Layer 0 + Layer 1 guarantee they feel like family.

---

## Tenant model

### Internal: Dash product family

| Theme key | Product | Accent | Voice | Status |
| --- | --- | --- | --- | --- |
| `ride` | Dash Ride | `#5e2aac` purple | formal Anda | shipped |
| `logistic` | Dash Logistic | `#1f6feb` industrial blue | formal Anda | wip |
| `travel` | Dash Travel | `#c79a2b` warm gold | mixed | planned |
| `marketplace` | Dash Marketplace | `#0f9d58` market green | mixed | planned |
| `outsourcing` | Dash Outsourcing | `#475569` operations slate | formal Anda | planned |

### External: Trellis SaaS

Trellis tenants get a Layer 2 theme generated from their brand assets:

```
trellis-{tenantId}   →  accent from tenant brand, voice from tenant config
```

The tenant inherits Layer 0 + Layer 1 unchanged — meaning every Trellis customer gets the same accessibility floor, motion polish, and component robustness that Dash invests in. The trust signal is implicit: *if it's good enough for Dash internal, it's good enough for you*.

---

## CLI usage

The `dash` CLI is theme-aware. Theme defaults are auto-detected from `dash.config.json` and can be overridden per command.

```bash
# Install a primitive (Layer 1) — works in every product
dash add button

# Install a workflow block (Layer 3) — the block's theme metadata must match
dash add ride-dispatch-board               # OK in dash-ride repo
dash add ride-dispatch-board               # WARN in dash-logistic repo (theme mismatch)

# Install a primitive into a specific theme
dash add button --theme logistic           # writes Layer 1 + Layer 2 override

# List blocks available for current product
dash list --theme logistic --kind block

# Generate a new theme manifest for a Trellis tenant
dash add --theme trellis-acme --create
```

The `dash audit` command runs against any consumer repo and rejects:

- Layer 1 component with hard-coded accent hex (`#5e2aac` etc.)
- Layer 3 block installed under wrong theme
- Theme manifest missing required tokens
- Banned external library imports (RHF, zod, react-query, swr)

---

## Migration path

### Case study: onboarding Dash Logistic

Dash Logistic ships in Q3 2026. Migration plan:

1. **Layer 0 — touch nothing.** Logistic inherits the same Inter ramp, spacing, motion, a11y floor as Ride.
2. **Layer 1 — touch nothing.** Logistic uses the same Button, Input, Modal as Ride. CI guarantees parity.
3. **Layer 2 — add `themes/logistic.ts`** (~30 lines). Industrial blue accent, formal "Anda" voice (matching driver-app rule), compact density for ops dashboards.
4. **Layer 3 — build `logistic-route-planner`, `logistic-fleet-status`, `logistic-eta-card`.** Register with `theme: "logistic"`. Reviewed by DS for Layer 0/1 compliance.
5. **Consumer repo `dash init --theme logistic`** — bootstraps `dash.config.json` with `defaultTheme: "logistic"`.

**Time to first component in production:** target 1 day. **Time to a full Logistic dashboard:** target 1 week.

Compare to the alternative — forking the DS — which would burn 2–3 weeks before line one of Logistic-specific UI ships, and produce a parallel codebase to maintain forever.

---

## For Head of Design — elevator pitch

> Dash is becoming a platform. Ride is the first product, not the only product. The Layered Architecture lets us ship Logistic, Travel, Marketplace, and Trellis on top of one foundation — designers control accent and voice per product, engineers reuse 76 primitives across the family, and brand stays unmistakably Dash everywhere. One DS, four products, N tenants, zero drift. The foundation is locked at Layer 0–1; divergence is intentional at Layer 2–3. We get the speed of a monolith and the flexibility of a fork without paying either tax.

---

## For Engineers — technical contract

**Locked (changing these requires a Layer 0 RFC):**

- Token names and tiers (`bg-strong-950`, `text-sub-600`, etc.)
- Component API surface for Layer 1 primitives (props, slots, refs)
- Accessibility floor — focus ring, contrast, touch target
- Motion curves
- Banned imports list (`dash audit` gate)

**Flexible (theme-level decision):**

- Accent token values (`--accent-base` etc.)
- Voice and copy register per product
- Density preset
- Optional radius override
- Workflow block composition

**Owned by product team (with DS review):**

- Layer 3 blocks under `registry/dash/blocks/<product>/`
- Block-level state and data wiring
- Product-specific page templates

**Hard rules carried over from `CLAUDE.md`:**

- No external form libraries (no RHF / zod / @hookform / @tanstack/react-query / swr)
- Audit trail mandatory for legal/financial editable fields
- Mitra-facing voice = formal "Anda"
- Dash Purple canonical = `#5e2aac` (no `#7C4FC4`)

---

## Appendix — showcase angles

### For business
> Scaling Dash to 4+ products via shared infrastructure cuts time-to-market by ~70%. Logistic ships in 1 week of UI work instead of 3 weeks of forking. Trellis tenant onboarding goes from 4 weeks of bespoke design to 1 day of theme manifest. The same headcount supports the entire product family.

### For design
> Brand unity across products = recognizable Dash family. Layer 0 + Layer 1 are the visual DNA — every Dash product feels related the moment you open it. Designers spend zero hours redrawing Button and 100% of their hours on the workflow that actually moves the product.

### For engineering
> One codebase, multiple themes = lower maintenance, higher confidence. A Button bug fixed once is fixed everywhere. A11y improvements compound across products. CI enforces the contract automatically — drift is impossible by construction, not by discipline.

### For external (Trellis customers)
> Trellis customers get the same battle-tested platform that runs Dash internally. The same components powering thousands of mitra trips per day power your white-label experience. Adopting Trellis is adopting a foundation Dash itself bets on — the strongest possible trust signal.

---

## See also

- [`CLAUDE.md`](./CLAUDE.md) — repo-level rules (banned imports, audit trail, canonical hex)
- [`AGENTS.md`](./AGENTS.md) — AI agent generation rules (theme awareness)
- [`apps/docs/registry/rules/dash-ai-rules.md`](./apps/docs/registry/rules/dash-ai-rules.md) — full per-repo mandates
- [`apps/docs/registry/rules/dash-domain-glossary.md`](./apps/docs/registry/rules/dash-domain-glossary.md) — entities, state machines
- Docs site: [`/docs/architecture/layered`](https://dash-ds.vercel.app/docs/architecture/layered) — visual showcase
- Docs site: [`/docs/architecture/themes`](https://dash-ds.vercel.app/docs/architecture/themes) — theme gallery
