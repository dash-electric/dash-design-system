# `@dash/foundation` — Layer 0

> **Brand Foundation.** Shared by all Dash products + Trellis tenants.

## What this is

Layer 0 of the Dash DS layered architecture. The lowest, most stable layer — pure design data + voice + non-negotiable rules. Everything above (component primitives, blocks, templates, product-specific variants, tenant themes) inherits from here.

Consumers:

- **Internal Dash products:** Dash Ride (current), Dash Logistic, Dash Travel, Dash Marketplace (future)
- **External tenants:** Trellis

## What's in it

| Folder | Contents |
|---|---|
| `tokens/colors.css` | 12 color ramps + primary brand alias (Dash Purple `#5e2aac`) + 10 state tones × 4 surfaces + semantic surface tokens (bg/text/icon/stroke) for light + dark mode |
| `tokens/typography.css` | Plus Jakarta Sans + 6 title scales + 5 label + 5 paragraph + 4 subheading + docs |
| `tokens/spacing.css` | Spacing scale `4 / 8 / 12 / 16 / 24 / 32 / 48` + radius scale `0 / 2 / 4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 28 / full` |
| `tokens/motion.css` | Durations (fast/base/slow) + easings (out, in-out) |
| `tokens/shadow.css` | 4 elevation shadows + tooltip shadow |
| `voice/voice-rules.md` | Formal "Anda" mitra-facing baseline + dual-aesthetic principle + Layer 1+ override policy |
| `rules/cardinal-rules.md` | 8 non-negotiable rules (additive, audit trail, banned libs, voice, tokens, registry, sync, audit UI) |
| `manifest.json` | Machine-readable index of everything in Layer 0 |

## How to consume

### CSS import (vanilla)

```css
@import "@dash/foundation/tokens/colors.css";
@import "@dash/foundation/tokens/typography.css";
@import "@dash/foundation/tokens/spacing.css";
@import "@dash/foundation/tokens/motion.css";
@import "@dash/foundation/tokens/shadow.css";
```

### Tailwind (v4) theme bridge

Re-export the CSS variables into a `@theme inline` block (see `apps/docs/app/globals.css` for the canonical bridge — Phase B will move that bridge into a `foundation/tailwind.css` once consumers cut over).

### Brand quick-reference

- Primary brand: **Dash Purple `#5e2aac`** = `var(--dash-purple-500)` = `var(--primary-base)`
- Font family: **Plus Jakarta Sans** = `var(--dash-font-family)`

## This layer is LOCKED

Changes to Layer 0 require:

1. Multi-product review (all 4 Dash products + Trellis liaison)
2. Migration plan for existing consumers
3. ADR entry in the strategic vault under `Dash-Design-System/ADRs/`

Tactical product-level tokens (e.g. a Dash Ride driver-app specific accent color, a Trellis tenant override) live in higher layers — they MUST NOT be added here.

## Relationship to the current `dash-ai-rules.md` + `globals.css`

Layer 0 is **extracted from** but does **NOT replace** the originals during Phase A:

- `apps/docs/app/globals.css` is still the live token source for all current consumers.
- `apps/docs/registry/rules/dash-ai-rules.md` is still the source of truth for AI agents.
- This `foundation/` directory is purely additive — a parallel restructure that Phase B will switch consumers to.

There is intentional duplication between this directory and the originals during the transition. See "Future dedup" in the Phase A report.

## Cross-references

- Strategic plan: `Documents/Obsidian/Irfan-Vault/02-Projects/Product-Design/Dash/Dash-Design-System/Master-Execution-Plan-2026-05-20.md`
- Layered architecture decision: `Documents/Obsidian/Irfan-Vault/02-Projects/Product-Design/Dash/Dash-Design-System/Layered-Architecture-Decision.md` (TBD — to be created alongside Phase A landing)
- Drift baseline: `BASELINE-DRIFT-2026-05-20.md`
- Kill criteria: `KILL-CRITERIA.md`
- Full AI rules (source of truth until Phase B): `apps/docs/registry/rules/dash-ai-rules.md`
