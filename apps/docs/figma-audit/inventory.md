# Dash DS — Component/Block/Template Inventory

**Source spreadsheet**: [`inventory.csv`](./inventory.csv) — open di Numbers / Excel / Google Sheets.

**Last sync**: 2026-05-17 post-merge `e12c3ff` + Phase 6 docs (commit `18de71b`, `12004ca`)

**Total rows**: 197 (was 190, added 3 marketing add-product step templates)

## Status breakdown

| Status | Count | Meaning |
|---|---:|---|
| Done | 137 | Figma 1:1 audited + patched in Phase 2 + Tier-1 & Tier-2 ported + blocks/examples |
| Pre-existing | 35 | Shipped before parity audit, no Figma re-check needed (mostly Dash auth/settings blocks + generic templates) |
| Dash-only | 15 | Component exists in Dash but NO Figma source (utility primitives + Dash-custom templates) |
| Not Ported | 6 | Marketing duplicate Empty variants collapsed into single Filled file |
| Partial | 2 | Foundation token sync done but supporting docs page TBD (Typography, Motions) |
| HOLD | 2 | Awaiting user signal (Icons 3061, Brand logos library) |

## Type breakdown

| Type | Count |
|---|---:|
| component | 76 (registry/dash/ui/*.tsx) |
| template | 66 (29 in Dash + 37 Figma not ported) |
| block | 35 (30 Dash + 5 in-progress) |
| foundation | 7 (Color/Typography/Icons/Grid/Shadows/Motion/Radius) |
| asset | 6 (Brand/Placeholder/CountryFlags/Emojies/Appstore/Others) |

## Highlight columns

CSV has 9 columns:
1. **Type** — component / block / template / foundation / asset
2. **Name** — display name
3. **Figma Node ID** — `pages.json` source ID or `N/A`
4. **Dash File** — path under `registry/dash/`
5. **Status** — see breakdown above
6. **Phase 2 Patch** — git commit hash if audited Phase 2
7. **Hold Items** — count from `hold-list.md`
8. **Breaking** — Yes/No (breaking visual diff that needs consumer audit)
9. **Notes** — short context

## Breaking changes count

`Breaking: Yes` rows = **9 components** needing consumer-side audit:

1. Avatar — 9 sizes, 2xl/3xl pixel-shifted
2. Brand Mark — remapped node, md/lg labels shifted
3. Card — padding scale 16/20/24 shifted
4. Dot Stepper — stretch-to-pill animation removed
5. Stat — StatValue default md smaller (24px was 30px)
6. Step Indicator — markers 28→20, connector hairline→chevron
7. Table — header weight 600→500, color sub→soft
8. Tabs — pill variant fully reimplemented
9. (Various tone shifts logged D8-D56)

## Tier-2 deferred (43 templates)

All sub-flows (Settings/Onboarding/Verification per sector). User can choose to:
- A: Port all 43 in Phase 3c via more agents
- B: Skip — sector-specific teams compose ad-hoc
- C: Hybrid — port Settings sub-flows (high reuse), skip onboarding (one-shot)

## Maintenance

CSV regen-able via inspection of:
- `registry/dash/` directory listing
- `figma-audit/component-node-map.md` (Figma mapping source)
- `git log --oneline` (commit hash lookup)
- `figma-audit/hold-list.md` (hold count)

Update manually after each phase OR build `scripts/inventory-gen.ts` script in future iteration.
