# DS Layer 2 Theme — Runtime Adoption Plan
Date: 2026-05-28
Status: physical files ALREADY EXTRACTED (`registry/dash/themes/{ride,logistic,travel,marketplace,trellis-tenant}/`), plan focuses on runtime adoption + governance
Author: overnight autonomous run

## TL;DR

**Original assumption (wrong)**: themes are still inline in `globals.css`, need extraction.
**Actual state**: theme files already split. `manifest.json` + 5 themes (ride/logistic/travel/marketplace/trellis-tenant) shipped at `apps/docs/registry/dash/themes/`. Each has `colors.css` + `typography.css` + `voice-overrides.md`.

**Real gap**: themes are physically present but **runtime adoption is incomplete**. Tribe consumer repos still rely on globals.css directly. No theme-switching API in CLI. No CI gate to prevent raw-hex usage in tribe code. Dark-mode wiring uses `next-themes` (third-party), but per-product theme selection has no canonical wiring example.

## What's already done

| Layer | Status | Where |
|---|---|---|
| Manifest schema | ✅ | `themes/manifest.json` (v0.1.0, 5 themes) |
| Per-theme `colors.css` | ✅ | each defines `--theme-accent-{50..950}` + 6 derived tokens + dark overrides |
| Per-theme `typography.css` | ✅ | (assumed parity — verify) |
| Per-theme `voice-overrides.md` | ✅ | tone deltas for product audience |
| Per-theme `examples/` | ✅ | (verify content) |
| Layer 0 vs Layer 2 separation README | ✅ | `themes/README.md` |
| Light/dark mode per theme | ✅ | `:root` + `.dark` blocks per `colors.css` |
| WCAG AA contrast notes | ✅ | inline in each theme `colors.css` |
| Trellis tenant template (Layer 2 for external SaaS) | ✅ | `themes/trellis-tenant/` |

## What's missing (real gaps)

### G1. No CLI command to install a theme
- **Current**: `dash add button` adds Layer 1 atoms. No `dash theme set ride`.
- **Impact**: consumer repos manually pick which `colors.css` to import, no validation
- **Fix**: extend `packages/cli/` with `dash theme list | set <name> | current`. Writes import line to consumer's CSS entrypoint + records active theme in `.dash-config.json`.
- **Effort**: 4-6h (commands + tests + docs)

### G2. No CI gate against raw hex in consumer repos
- **Current**: `dash audit` exists per CLAUDE.md, but no rule that flags raw `#XXXXXX` outside foundation tokens
- **Impact**: tribe app developer can hardcode `#16a34a` instead of `var(--theme-accent-base)` → drift
- **Fix**: extend `dash audit` with `no-raw-hex` rule. Allowlist: foundation files only. Reject: `*.tsx`, `*.css` in consumer repos.
- **Effort**: 2-3h

### G3. No Theme provider component for React consumers
- **Current**: dark-mode uses `next-themes` (third-party). Product theme = manual CSS import.
- **Impact**: no programmatic `useTheme()` for "which product am I in" — context like brand color, accent name, voice register
- **Fix**: add `DashThemeProvider` to `registry/dash/ui/` that wraps `next-themes` and exposes `useDashTheme()` returning `{ product: 'ride', mode: 'dark', accent: '#16a34a', voice: 'formal' }`
- **Effort**: 3h

### G4. Theme switcher demo missing on docs site
- **Current**: docs site uses single (presumed default) theme. `theme-switch` component exists but only toggles light/dark.
- **Impact**: visitors can't see "what does same page look like in Ride vs Logistic vs Marketplace"
- **Fix**: add live theme switcher to docs site header. Persist choice. Update all component preview cards to render in selected theme.
- **Effort**: 4h (need theme-aware preview wrapper)

### G5. Per-theme typography parity unverified
- **Current**: every theme has `typography.css` but content not audited
- **Impact**: themes may have drifted (e.g. ride overrides display font, logistic doesn't — accidental)
- **Fix**: diff all 5 `typography.css` files vs canonical foundation; flag intentional deltas, fix accidental
- **Effort**: 1h

### G6. Examples folder content unaudited
- **Current**: every theme has `examples/` dir but content unknown
- **Impact**: if empty, theme is invisible to designer evaluating
- **Fix**: each theme needs minimum: 1 dashboard page + 1 form page + 1 list page in canonical theme colors, as live HTML/TSX
- **Effort**: 6h (2h per theme × 5 themes / amortize via template)

### G7. No "trellis tenant create" workflow
- **Current**: `trellis-tenant` template exists. No CLI command to fork it for a new SaaS customer.
- **Impact**: when first real Trellis tenant lands, friction = manual copy-paste
- **Fix**: `dash theme create <tenant-id> --from trellis-tenant --accent <hex>` generates new theme folder, registers in manifest, opens PR
- **Effort**: 4h

### G8. Voice-override registry unconsumed
- **Current**: each theme has `voice-overrides.md` with tone deltas. Build-time / generation-time consumption = unclear.
- **Impact**: Dash Build AI agent doesn't load these when generating copy → voice drift between tribes
- **Fix**: agent context loader reads active theme's `voice-overrides.md` + merges with global `design.md`. Mention in `gstack-adoption.md`.
- **Effort**: 2h (loader) + need real test prompts to validate

### G9. Dark-mode color ramps verified visually?
- **Current**: dark `:root` blocks defined, contrast notes inline, but no automated check + no QA loop
- **Impact**: theme + dark mode combos (4 × 2 = 8 combos for non-template themes) may have edge cases
- **Fix**: Storybook-style theme matrix page. 8 thumbnails. Visual diff vs baseline screenshot.
- **Effort**: 4h

## Recommended sequence

| Phase | Slice | Effort | Unlocks |
|---|---|---|---|
| 1 | G1 + G2 (CLI theme set + audit gate) | 6-9h | tribe consumer can pick theme + CI enforces |
| 2 | G3 + G4 (Provider + docs switcher) | 7h | designer can preview, developer has runtime API |
| 3 | G5 + G6 (typography audit + examples) | 7h | quality bar across all 5 themes |
| 4 | G8 (voice in generation pipeline) | 2h | Dash Build emits product-correct voice |
| 5 | G7 + G9 (Trellis create + visual matrix) | 8h | externalize-ready |

**MVP (phases 1-2, ~13-16h)**: enough for first real tribe app to adopt themes properly with safety rails.

## Definition of done (Layer 2 fully landed)

- [ ] `dash theme set ride` works in any consumer repo
- [ ] `dash audit` fails CI if `#XXXXXX` appears outside foundation
- [ ] `useDashTheme()` returns product+mode+accent+voice
- [ ] Docs site header has live theme switcher, persists choice
- [ ] All 5 themes have 3+ example pages
- [ ] Dash Build AI agent loads `voice-overrides.md` of active theme
- [ ] Trellis tenant create flow tested end-to-end
- [ ] Theme × mode matrix (8 combos) visual baseline locked

## Open questions

- **Q1**: theme switching at runtime (CSS swap) vs build-time (one bundle per theme)? Runtime simpler dev, build-time better perf. Recommend: runtime for now, revisit when first tribe app ships.
- **Q2**: should `dash theme` live in `@dash-electric/cli` or stay in monorepo `packages/cli/`? Hinges on broader publish strategy.
- **Q3**: Layer 2 `typography.css` per-theme — do we actually want per-product font OR just per-product weight/scale? Heading font swap = legal risk if license per-app counts.
- **Q4**: Trellis tenant template ships with neutral grey accent. Do we limit tenant-defined accent to a curated palette, or allow arbitrary hex (drift risk)?

---

## Note on prior assumption

Previous handover called Layer 2 "still inline in globals.css". That was outdated/wrong — `themes/` package shipped. Memory file index should reflect this. Action: update `MEMORY.md` to remove the "Layer 2 themes still in globals.css" line if present.
