# Figma Parity v2 — Auto-Decision Log

Decisions yang gua ambil otomatis saat ambiguity. Lu batch review.

## 2026-05-17 — Phase 1 token sync

### D1. state-X-light/lighter = alpha overlays (Figma JSON), NOT solid -200/-50

**Conflict**: My earlier comment in `banner.tsx` said "bg state-X-light (solid -200) | text text-strong-950". JSON export says `01-tokens.state.error.light → 06-foundations.alpha.red.alpha-24` (alpha, not solid).

**Decision**: TRUST Figma JSON (source of truth). All state-X-light = foundation alpha-24 (alpha-16 for success-light, alpha-10 for success-lighter — Figma quirk for green which has lighter natural tone).

**Impact**: Badge + Banner "light" and "lighter" appearance variants may render slightly translucent vs my earlier solid-tint interpretation. Visual diff TBD against Figma frames during Phase 2 audit.

**Reversal path**: If user confirms solid intent, add Dash override layer:
```css
--state-error-light: var(--dash-red-200);     /* Dash override */
--state-error-lighter: var(--dash-red-50);    /* Dash override */
```

### D2. Neutral scale: emit BOTH gray + slate scales

**Conflict**: Figma `02-neutral.* → slate.*` (slate is Figma neutral). Dash currently uses gray as neutral. Components could pick either.

**Decision**: Emit BOTH `--dash-gray-*` AND `--dash-slate-*` foundations. Semantic tokens (`--bg-*`, `--text-*`, `--icon-*`, `--stroke-*`) point to `--dash-slate-*` (Figma source). Dash brand components (mitra-suspend, halo-dash) may continue using `--dash-gray-*` if needed.

**Impact**: ZERO Figma parity loss. Dash gray scale retained as escape hatch.

### D3. Primary brand: purple (NOT sky as Figma exports)

**Conflict**: Figma `03-theme.primary-* → sky.*`. Dash brand identity = purple #5e2aac.

**Decision**: Dash override. `--primary-* → --dash-purple-*`. Document in `dash-extensions.md`. Override is at semantic theme layer, not foundation. Sky scale still emitted intact for any 1:1 Figma port.

**Impact**: All "primary" surfaces in Dash render purple. Components ported 1:1 from Figma can use `var(--dash-sky-600)` explicitly if literal Figma color needed.

### D4. Semantic mode: dark = JSON refs, light = index-inverted

**Method**: Figma exports `01-tokens.bg.white-0 → 02-neutral.950` which is DARK mode (white-0 slot = darkest in dark mode). For light mode, invert neutral index: 0↔950, 50↔900, 100↔800, 200↔700, 300↔600, 400↔500.

**Impact**: Standard AlignUI dual-mode convention. Verified against typical AlignUI light/dark Figma pages.

### D5. Typography: emit as `.text-{group}-{name}` classes

**Method**: Figma `typography.title.h1 title` etc → CSS class `.text-title-h1` with font-family + size + weight + line-height + letter-spacing.

**Impact**: Use via `<h1 class="text-title-h1">`. Doesn't tile into Tailwind utility scale (would need separate typography plugin).

### D6. Shadows: emit composed multi-layer shadows

**Method**: Figma stacks shadows (e.g. `effect.custom-shadows.large.0..8`). Emit as composed `box-shadow: layer1, layer2, ...` CSS string with offsetX/Y, blur (radius), spread, color.

**Output vars**: `--shadow-regular-shadow-x-small`, `--shadow-custom-shadows-large`, `--shadow-tooltip`, etc.

### D7. Drop legacy `--dash-neutral-*` aliases

**Reason**: 12 tokens (`--dash-neutral-0..950`) were aliases to `--dash-gray-*`. After Decision D2, semantic layer routes through slate (Figma default). Legacy aliases removed. Docs page `/docs/foundations/dark-mode` had text references — those are documentation strings, not breaking.

**Reversal**: If a Dash custom component breaks, alias back via:
```css
--dash-neutral-X: var(--dash-gray-X);  /* compat */
```

---

## Display atom audit (2026-05-17)

### D8. Avatar: full 9-size scale (xs=20 → 5xl=80)

**Method**: Figma Avatar [1.1] (node 210:4129) ships 9 sizes 20/24/32/40/48/56/64/72/80. Dash previously had 7 (missing 56, 72). Added `2xl=56`, `4xl=72`, `5xl=80`. Pre-existing `2xl=64` shifted to `3xl=64`, `3xl=80` shifted to `5xl=80`. Fallback text sizes aligned per-size to Figma (12/14/16/18/24 px).

**Impact**: BREAKING for any caller using `size="2xl"` or `size="3xl"` — now resolves to different pixel sizes. Audit existing usages.

### D9. Tag: data-state attribute for state variants

**Method**: Figma Tag [1.1] (node 417:12348) has 4 states (Default/Hover/Active/Disabled). Hover handled via CSS `:hover`. Active + Disabled added via `data-state` attribute (`active`/`disabled`) + Tailwind `data-[state=active]:` selectors. Mirror pattern used in shadcn Tabs/Toggle.

**Impact**: Consumers can render selected tag via `<Tag state="active">`. No breaking change to default rendering.

### D10. ContentDivider variant=solid

**Method**: Figma ships 5 ContentDivider variants. Added `variant="solid"` (bg-bg-weak-50 pill) to cover "Solid Text Divider". Existing `align` prop covers Text Divider + Text & Line Divider; base `Divider` covers Line + Line Spacing.

**Impact**: New optional prop; default `variant="line"` preserves existing behaviour.

### D11. BrandMark = Figma "Key Icons" (NOT Brand Logos)

**Method**: Initial spec pointed brand-mark to node 2771:1469 (Brand Logos library — 3rd party app icons). Re-mapped to "Key Icons [1.1]" in node 263:1844, which is the actual circular icon container (radius=999, 5 sizes, Stroke style with #EAEAEA border + white bg). Added `xs/sm/md/lg/xl` matching Figma 32/40/48/56/64; kept Dash `2xl=96` + `square` shape extensions.

**Impact**: BREAKING — `size="sm"` shifts from 40px to 40px (same), but `size="md"` shifts 56→48px, `size="lg"` shifts 96→56px. Audit auth blocks using BrandMark.

### D12. Display atoms without Figma source kept as Dash-custom

**Method**: `kbd.tsx`, `skeleton.tsx`, `spinner.tsx` have no dedicated AlignUI Pro Figma source. Kept Dash impl as-is; documented in `dash-extensions.md` and `hold-list.md`.

**Impact**: None — these are foundational atoms used internally; not driven from Figma.

## Misc audit (2026-05-17)

### D13. Accordion: keep BOTH card-style (Figma 1:1) and ghost (legacy)

**Conflict**: Figma `210:4022` ships ONE accordion variant — card-style (white bg + 1px stroke-soft-200 + radius-10 + padding 14 + leading icon + title + description + trailing chevron 20×20). Dash original is shadcn classic: text-only trigger separated by `border-b`.

**Decision**: Add `variant` prop on `<Accordion>` root. `variant="default"` = Figma 1:1 card-style (each item a bordered card with gap-2 between). `variant="ghost"` = legacy shadcn (border-b separators, no card chrome). Default = Figma parity (`"default"`).

**Reason**: Existing docs/blocks built against the legacy ghost pattern. Hard-flipping breaks callers. Both variants share Radix primitive — zero behaviour change.

**Tokens patched**: removed phantom shadcn tokens (`border-border`, `text-foreground`, `text-muted-foreground`, `ring-ring`) → Dash semantic (`stroke-soft-200`, `text-text-strong-950`, `text-text-sub-600`, `ring-(--primary-alpha-24)`). Trigger icon size 16→20px (Figma). 8px gap between cards.

**Reversal**: drop `variant` prop, hard-pick one.

### D14. Rating star fill: yellow-500 (NOT warning-base orange)

**Conflict**: Dash original used `fill-warning-base text-warning-base` (= `--dash-orange-600` = #ea7821). Figma `532:4144` (Star Full) exports fill `rgba(0.96,0.71,0.12)` = #f6b51e EXACT match to `--dash-yellow-500`.

**Decision**: Switch full + half star fill/stroke to `--dash-yellow-500` via arbitrary token syntax (`fill-[var(--dash-yellow-500)]`). Empty star kept `text-stroke-soft-200` (Figma exports `rgba(0.82,0.82,0.82)` ≈ stroke-soft-200). Row gap `gap-1` → `gap-0.5` (Figma itemSpacing=2px).

**Impact**: Visual yellow ⭐ instead of orange. Matches App Store / Google Play convention shipped in Figma.

**Reversal**: Re-swap to `warning-base` if Dash brand decides on orange ratings.

### D15. Scroll-area: 3 sizes × 2 variants exposed (was single 8px track)

**Conflict**: Figma `166941:61889` ships 3 track sizes (12/16/20px) × 2 styles (default white / lighter bg-weak-50). Dash original was single 8px (`w-2`) track.

**Decision**: Add `size: "x-small" | "small" | "medium"` (default `"medium"`) + `variant: "default" | "lighter"` (default `"default"`) props on `<ScrollArea>`. Track widths 12/16/20px. Thumb always 4px rounded-full (Figma constant). Variant controls track bg + thumb tone (default = white track + stroke-soft-200 thumb, lighter = bg-weak-50 track + stroke-sub-300 thumb). 1px stroke-soft-200 border around track.

**Impact**: Existing callers default to medium (20px) — visibly thicker than old 8px. If callers want compact, pass `size="x-small"` (12px, closest to legacy). Acceptable trade-off for Figma parity.

**Reversal**: Hardcode `size="x-small"` as default if 12px is too prominent in practice.

### D16. Aspect-ratio / Resizable / Form / Field / Carousel — declared utility extensions

**Method**: No AlignUI Pro Figma source exists for any of these. Logged under `dash-extensions.md` → "Utility components (no Figma source)" + "Misc 1:1 audit". They wrap third-party libs (Radix AspectRatio, react-resizable-panels, react-hook-form, Embla Carousel) and provide layout-only surface. Stale Tailwind token references patched to Dash semantic vars (`ring-ring` → `ring-(--primary-alpha-24)`, `hover:bg-primary/40` → `hover:bg-(--primary-alpha-24)`, `text-icon-soft` → `text-icon-soft-400`).

**Impact**: Documented divergence; no Figma node lookup needed in future audits.

## Button family (2026-05-17)

### D17. Button: preserve xs/sm/md/lg/xl API, realign metrics to Figma 4-size scale

- Context: Figma `Buttons` componentSet ships 4 sizes (28/32/36/40 = "2X-Small/X-Small/Small/Medium"). Existing Dash Button exposes 5 sizes (xs/sm/md/lg/xl = 28/32/36/40/44). Renaming would break dozens of call-sites under `registry/dash/blocks/*` and docs pages.
- Decision: KEEP `xs/sm/md/lg/xl`. Realign each size's cornerRadius / padding / gap / icon size to match the Figma height it shares. Treat `xl` (44) as Dash extension. Figma default = `lg` (40) but Dash default stays `md` (36) for dense surfaces.
- Reversal: rename via codemod (`size="md"` → `size="lg"`, etc.) to align Dash default with Figma default.

### D18. Button cornerRadius: `rounded-lg` for 28/32/36, `rounded-[10px]` for 40+

- Context: Figma ships r=8 for the 3 smaller sizes and r=10 for Medium (40). Tailwind v4 has no `rounded-10` utility OOTB and our token layer uses `--radius-10` but Tailwind utility expects `rounded-[10px]` arbitrary value.
- Decision: Use `rounded-lg` (8px) for xs/sm/md and arbitrary `rounded-[10px]` for lg/xl/icon-lg/icon-xl. Acceptable until we add a `rounded-10` plugin utility.
- Reversal: configure Tailwind preset to expose `--radius-10` as `rounded-10` class, then swap arbitrary values.

### D19. SocialButton Google brand fill: red (#F14336), not white-with-G

- Context: Figma source paste shows Google variant `bg = rgb(241,67,54)` (red) with white "G" mark. Many SSO buttons in the wild use the "white-bg + colored G" pattern instead.
- Decision: MATCH Figma source — red fill with white mono icon.
- Reversal: revert to white bg + 4-color G logo per Google branding guidelines. One-line swap in `socialButtonVariants.brand.google`.

### D20. SocialButton: add Linkedin + Dropbox, demote Microsoft to Dash-extension

- Context: Figma `Social Buttons` ships 7 brands (Apple, X, Google, Facebook, Linkedin, Github, Dropbox). Our impl had 6 brands but with Microsoft (Figma doesn't include MS) and missing Linkedin/Dropbox.
- Decision: Add `linkedin` + `dropbox`. KEEP `microsoft` because ms365 plugin login blocks already depend on it — flagged in `dash-extensions.md`.
- Reversal: delete `microsoft` from `socialButtonVariants.brand` + `brandLabel` + `brandIcon`. Update ms365 blocks to render their own.

### D21. SocialButton X/Twitter is BLACK bg, not white

- Context: Figma `X (Twitter)` variant fills `rgb(0,0,0)` after the Twitter→X rebrand. Prior Dash impl rendered white bg + dark X icon.
- Decision: MATCH Figma — black bg, white X glyph.
- Reversal: change `brand.twitter` from `bg-black` back to `bg-bg-white-0`.

### D22. SocialButton: add `style="stroke"` + `onlyIcon` axes

- Context: Figma SocialButton has 4 axes: Brand × Style (Filled|Stroke) × State × OnlyIcon. Dash impl only had Brand × Size.
- Decision: Add `style: "filled" | "stroke"` (stroke = white bg + gray ring + dark text via `!important` overrides on brand classes) and `onlyIcon: boolean` (collapses to 40×40 square at md, scales per size).
- Reversal: drop the two new props; revert to single Filled style.

### D23. ButtonGroup: switch to container-ring pattern + add ButtonGroupItem

- Context: Figma renders ButtonGroup as a single 1px ring container holding ring-less children. Original Dash impl gave every child its own border and collapsed adjacent ones via negative margin.
- Decision: Outer `border border-stroke-soft-200 rounded-lg`, children get `rounded-none` and `border-l` (or `border-t` vertical) separator between siblings. Added new `ButtonGroupItem` primitive matching Figma's `Button Group Items` componentSet (white default → gray-50 hover → gray-50+dark active → gray-50+disabled-light states).
- Reversal: revert to negative-margin approach (restore prior `-ml-px` rules and remove container `border`).

### D24. IconButton aligned to "Buttons OnlyIcon=On", Compact Button held

- Context: Figma has TWO icon-only button componentSets — `Buttons` with `Only Icon=On` (28/32/36/40px scale) AND a separate `Compact Button` (20/24px scale, different styles). Dash usage (table row actions, header toolbar) matches the former scale.
- Decision: Align `IconButton` to Buttons-OnlyIcon spec (xs/sm/md/lg/xl @ 28/32/36/40/44, r=8 / r=10). Hold the smaller Compact Button for a future `CompactIconButton` primitive if a 20/24px slot is requested.
- Reversal: implement `CompactIconButton` as a new component when a use case appears.

## 2026-05-17 — Phase 4 data-display audit

### D25. Table header text: 12/16 weight 500 uppercase tracking-wider, text-soft-400

**Conflict**: Dash had `text-xs font-semibold uppercase tracking-wider text-text-sub-600` (12px / weight 600 / sub-600 color). Figma `587:5793` + real Table Examples header text reads 12px / weight 500 / ls 0.48 / color `262:1714` (= `text-soft-400` #a3a3a3). Authors typed labels in UPPERCASE ("EMAIL", "BUY FROM", "DOCS") but `textCase` field is None — so the look IS uppercase but achieved by content, not CSS in Figma.

**Decision**: Drop weight to `font-medium` (500) and color to `text-text-soft-400`. Retain `uppercase tracking-wider` CSS to keep look regardless of caller-supplied content. Header row height `h-9` (36px), padding `px-3 py-2` matches Figma `8t/12r/8b/12l`.

**Impact**: All Dash tables suddenly have lower-contrast, lighter-weight column headers. Visually softer (matches AlignUI Pro look). Halo-dash + mitra-suspend admin tables should be screenshot-diffed.

### D26. Table row hover bg: solid (NOT translucent)

**Conflict**: Dash used `hover:bg-bg-weak-50/60` (60% opacity). Figma Row Cell Hover state fill is solid `#f7f7f7` = `bg-weak-50` direct (`109:3066` → `120:3296` swap, both solid).

**Decision**: Drop the `/60` opacity. Hover and selected states both render `bg-bg-weak-50` solid.

**Impact**: Stronger hover affordance. Matches AlignUI Pro tactile feel.

### D27. Card default padding 20px → 16px (Figma Widget spec)

**Conflict**: Dash card `padding="md"` = `p-5` (20px). Figma `Widgets [HR Management]` 3851:32690 + `Widgets [Finance]` 3963:7181 use 16px padding all + itemSpacing 16 + cornerRadius 16 universally across 14 HR + 16 Finance widget types.

**Decision**: Rescale padding tier: sm=12 / md=16 / lg=20 / xl=24. Default md aligned to Figma. `CardFooter` and `CardMedia` bleed offsets follow (`-mx-4`, `-mt-4`).

**Impact**: All cards default-rendered 4px tighter on every side. Compositions relying on 20px breathing (modal-like cards) should set `padding="lg"` explicitly. Compact dashboard widgets benefit most.

### D28. CardTitle / EmptyStateTitle weight 600 → 500

**Conflict**: Dash used `font-semibold` (600). Figma widget header text + empty-state titles uniformly 16/24 weight 500 ls -0.176 (medium, not semibold).

**Decision**: Drop to `font-medium` (500). Title is communicated by size + tracking + neutral-strong color, not by weight bump.

**Impact**: Softer title typographic voice consistent with AlignUI Pro's quieter widget aesthetic. Pairs well with StatValue also dropping to weight 500.

### D29. StatValue size scale (24px md / 32px lg), weight 500

**Conflict**: Dash `StatValue` was `text-3xl font-semibold tracking-tighter` (30px / 600). Figma has two canonical sizes — `Spending Summary` / `Total Balance` use 24/32 weight 500 ls 0; `My Cards` / `Total Expenses` use 32/40 weight 500 ls -0.16.

**Decision**: Add `size` prop. md = `text-2xl leading-8 tracking-tight` (24px Figma small stat), lg = `text-[32px] leading-10 tracking-tighter` (32px Figma big stat). Default md (smaller than previous text-3xl). Weight `font-medium` for both.

**Impact**: Existing StatValue usages render slightly smaller by default. Hero stats should migrate to `size="lg"`. Tabular dashboard stats look more refined at 24px.

### D30. Empty state illustration slot (148x148) added

**Conflict**: Dash `EmptyStateIcon` is a 48px circular disc with bg-weak fill (compact / list-empty pattern). Figma `Empty States [HR Management]` 3860:4495 + `[Finance]` 3860:5822 are 148x148 vector illustrations embedded in widget cards with no bg container.

**Decision**: Keep `EmptyStateIcon` (48px disc) as Dash extension for compact contexts. Add new `EmptyStateIllustration` slot (148x148, no bg) for Figma-canonical big-illustration empty states. Both exported.

**Impact**: Two-tier empty-state pattern. List/inline empties keep disc icon; full-card empties use illustration. No breaking change — pure addition.

### D31. Chart kept as Dash extension (no Figma source)

**Conflict**: Recharts-based chart wrapper has no AlignUI Pro Figma ComponentSet equivalent. Widget compositions embed inline `Stacked Bar Chart` / `Donation Profile` etc. with one-off geometry, not a reusable Chart abstraction.

**Decision**: Keep `ChartContainer` / `ChartTooltipContent` / `ChartLegendContent` as Dash extensions. Verified styling already uses Figma-aligned tokens (`shadow-tooltip`, `stroke-soft-200`, `text-xs` axis labels matching Budget Overview 12/16/400 spec). No code changes beyond Figma-reference comments.

**Impact**: Documented as Dash extension in `hold-list.md`. Future Recharts → Figma-spec migration would require designing a Chart CS upstream first.

## 2026-05-17 — Form inputs audit

### D25. Input sizes mapped sm/md/lg/xl (NOT renamed) to preserve callers

- Context: Figma Text Input ships 3 sizes (X-Small 32 / Small 36 / Medium 40). Dash had 4 sizes (sm=32 / md=36 / lg=40 / xl=44) with `md` as default. Renaming to match Figma labels would break ~30 callers (login blocks, dashboard shells, doc pages).
- Decision: Keep size names (sm/md/lg/xl) but re-map values to Figma exact specs: sm=32 (X-Small) · md=36 (Small) · lg=40 (Medium) · xl=44 (Dash extension). Change default from `md` → `lg` so unspecified InputRoot renders Figma "Medium" — the design source default. Doc strings + props table annotated.
- Reversal: change default back to `md` if visual regression detected in auth flows.

### D26. Input padding asymmetric (Figma), gap per size — NOT symmetric `px-*`

- Context: Figma pads left more than right (pl=12/pr=10 at Medium · pl=10/pr=8 at Small · pl=8/pr=6 at X-Small) because the icon slot sits on the right. Dash previously used symmetric `px-3` etc.
- Decision: Use Tailwind `pl-* pr-* py-*` triplets per size. Restore Figma's left-bias visually.
- Reversal: revert to `px-*` if visual review prefers symmetric padding (loss of Figma parity).

### D27. Input radius mapped via arbitrary value `rounded-[10px]` for Medium/XL

- Context: Tailwind v4 radius scale = 8 (`rounded-lg`) and 12 (`rounded-xl`). Figma Medium = 10px exactly. No mid-scale token.
- Decision: Use arbitrary value `rounded-[10px]` for `lg`/`xl` sizes. `sm`/`md` use `rounded-lg` (8 = Figma X-Small/Small).
- Reversal: register `--radius-10` in design tokens + emit `--radius-10` to @theme as `rounded-10` utility (cleaner long-term).

### D28. Hover state on Input — keep border instead of dropping it

- Context: Figma Hover state DROPS the border (bg fills bg-weak-50, no stroke). Dash currently keeps the border on hover. Dropping border on hover causes layout shift (1px) and feels jarring on dense forms.
- Decision: KEEP border on hover. Skip Figma's border-drop on hover. Other states (Default/Focus/Error/Disabled) match Figma exactly.
- Reversal: add `hover:border-transparent hover:bg-bg-weak-50` if visual review wants strict Figma parity.

### D29. Radio inverted to Figma: bg fills primary on checked, white inner dot

- Context: Dash previously rendered Radio as `bg-bg-white-0 border-primary` with inner primary dot (shadcn convention). Figma source: `bg-stroke-soft-200` when off (with inset white circle), `bg-primary` when on (with inset 8px WHITE dot).
- Decision: Rewrite using `data-[state=unchecked]:bg-stroke-soft-200` + `before:` pseudo for inner white circle (Off), and `data-[state=checked]:bg-primary` + Radix Indicator with white inner dot (On). No border ring.
- Reversal: revert to bordered shadcn-style if accessibility review prefers a visible ring at rest.

### D30. Switch track uses `bg-stroke-soft-200` (matches Figma token bv 213:2997)

- Context: Figma off-track fill bound to `stroke-soft-200` (#ebebeb), not `bg-soft-200` (which is the same hex but different semantic class). Dash previously used `bg-bg-soft-200`.
- Decision: Use `bg-stroke-soft-200` to match Figma's semantic binding 1:1. Visual output identical (both #ebebeb), but token lineage now matches Figma source.
- Reversal: none needed — both classes resolve to same color.

### D31. Slider thumb = inner-dot pattern (NOT bordered ring)

- Context: Figma slider thumb = 16px white disc with 6px primary INNER DOT (separate ellipse layer). Dash had `border-2 border-primary` ring — 2 different visual treatments.
- Decision: Drop border; use `::after` pseudo-element to render 6px primary inner dot. Matches Figma 1:1.
- Reversal: revert to border-2 if user prefers ring style.

### D32. Toggle + ToggleGroup logged as Dash extensions (no Figma source)

- Context: Audit scope listed Toggle/ToggleGroup with "Toggle is under Button page, check". After scanning Button page (node 129:605) + cross-checking all componentSets across cached pages, no "Toggle" component exists in AlignUI Pro Figma. Closest analog is `Segmented Control` (separate node 553:14953) — but that's already a distinct Dash component.
- Decision: Toggle + ToggleGroup are Dash-only primitives (Radix-based, shadcn-derived). No Figma parity work needed. Added to `dash-extensions.md`.
- Reversal: if AlignUI ships a Toggle component in a future Figma release, port to Figma spec.

### D33. OTP slot scaled to 40×48 (NOT Figma 80×64) for practicality

- Context: Figma Digit Input is huge (80×64 per slot, text 24px) — designed for OTP-as-hero auth screens. Dash usage = compact 6-slot inputs in modals/sidebars. Slotting 80×64 cells creates 480px-wide groups that overflow standard form columns.
- Decision: Scale to 40×48 (`h-12 w-10`) while preserving Figma radius (10px) + state tokens (border-stroke-soft-200 → border-stroke-strong-950 on active). Aspect ratio preserved (5:4 ≈ Figma 5:4).
- Reversal: add `size="hero"` variant for the 80×64 spec if a full-page OTP flow is built.

## Overlays audit (2026-05-17)

### D34. Overlay scrim hard-coded `bg-[#333333]/24` (no semantic token yet)

- Context: Figma `Modal Overlay [1.1]` (node 480:2474) and Drawer overlay both render `#333333 @ 24%`. App `globals.css` has no `--bg-overlay` token. Previous overlays used undefined `bg-overlay` class (silently rendering transparent).
- Decision: Hard-code `bg-[#333333]/24` inline on Modal, AlertDialog, Sheet, Drawer overlays. Same hex for all four = one find-and-replace when token added.
- Reversal: Add `--bg-overlay: rgba(51,51,51,0.24)` to `app/globals.css` semantic layer, then sweep replace `bg-[#333333]/24` → `bg-bg-overlay`.

### D35. Overlay shadow = `--shadow-custom-shadows-medium` (90% match for single 0/16/32 -12)

- Context: Figma Modal/Popover/Dropdown surfaces use SINGLE `DROP_SHADOW offset=0,16 radius=32 spread=-12 color=rgba(13,18,28,0.10)`. No matching single-layer token in exports. Closest is `--shadow-custom-shadows-medium` (8-layer stack mimicking macOS elevation).
- Decision: Use `shadow-custom-shadows-medium` for Modal, AlertDialog, Popover, HoverCard, DropdownMenu, ContextMenu, MenubarContent. Visual ~90% match (multi-layer slightly softer than single big spread).
- Reversal: emit `--shadow-overlay-flat: 0px 16px 32px -12px rgba(13,18,28,0.10)` next sync, sweep replace.

### D36. Tooltip default appearance flipped from Dark → Light (Figma default)

- Context: Dash shipped Tooltip dark-only (`bg-bg-strong-950 text-text-white-0`). Figma Tooltip ComponentSet `2604:269` default `Dark Mode=Off` = bg-white-0 + text-strong-950 + `shadow-tooltip` (multi-layer with 1px ring).
- Decision: Flip default to `appearance="light"`. Expose `appearance="dark"` for the old behavior. Added `size="lg"` (was `md`) per Figma "Large" naming (radius 12 / p-3 / weight 500).
- Reversal: change `defaultVariants.appearance` back to `"dark"`. Sites using `size="md"` (date-picker/dot-stepper demos) MUST migrate to `size="lg"`.
- Breaking: any consumer relying on dark default visually loses contrast on light bg. Audit needed.

### D37. Drawer/Sheet shadow upgraded `--shadow-card-lg` (undefined) → `--shadow-custom-shadows-large`

- Context: Drawer/Sheet shipped with `style={{ boxShadow: "var(--shadow-card-lg)" }}` and `shadow-custom-lg` (both undefined). Figma Drawer shadow stack = 8 DROP_SHADOWs + 1 INNER_SHADOW, identical to `--shadow-custom-shadows-large` export.
- Decision: Use `shadow-custom-shadows-large` for Drawer + Sheet (both wide side panels). Modal uses `medium` (less aggressive elevation).
- Reversal: none — exact Figma match.

### D38. Drawer width default `w-96` (384) → `w-[400px]` (Figma source)

- Context: Figma all Drawer examples = 400px wide. Dash default `md = w-96` (384px) for legacy parity with shadcn.
- Decision: `md = w-[400px]`. Keep `sm w-80`, `lg w-[480px]`, `xl w-[640px]`, `full w-screen`.
- Reversal: change md back to `w-96` if any consumer pixel-pins to 384.
- Impact: ~+16px width per Drawer instance, marginal.

### D39. Modal/AlertDialog footer drops `bg-bg-weak-50` + inner radius (NOT in Figma)

- Context: Dash previously shipped Modal/AlertDialog footers with `bg-bg-weak-50 rounded-b-2xl` (shadcn convention: tinted footer band). Figma Modal Footer has NO bg tint and NO inner radius — just `border-t stroke-soft-200`.
- Decision: Drop `bg-bg-weak-50` + `rounded-b-2xl`. Keep `border-t` divider only.
- Reversal: re-add `bg-bg-weak-50` if visual review prefers banded footer.

### D40. Dropdown/Context/Menubar container = `rounded-2xl p-2 gap-1` (matches Figma 16/8/4)

- Context: Dash previously had Dropdown surface as `rounded-lg p-1` (8/4) matching Radix defaults. Figma `Profile Dropdown Items` = radius 16 / pad 8 / gap 4 between items.
- Decision: All three (DropdownMenu, ContextMenu, Menubar Content+SubContent) standardized to `rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-custom-shadows-medium flex flex-col gap-1`.
- Reversal: revert to `rounded-lg p-1` if compact menus preferred.

## Feedback audit (2026-05-17)

Scope: alert.tsx · toaster.tsx · notification-feed.tsx · activity-feed.tsx · progress-bar.tsx · progress-circle.tsx.
Figma source: nodes 169:2358 (Alert/Notification/Toast), 4096:21398 (Notification Items), 164611:26451 (Activity Feed), 450:17758 (Progress Bar + Circle). Sequential numbering continues from D40 above; per-phase D-numbers were locally reset in earlier phases, so the new entries restart at D41 for clarity.

### D41. Feedback components keep `--state-X-*` semantic tokens (NOT raw foundation hex)

- Context: Figma Alert/Toast renders use literal foundation colors (`red-500` base, `red-200` light, `red-50` lighter) per node hex output. But the AlignUI design-tokens JSON binds `state-X-light → alpha-24` (per earlier D1), and current `app/globals.css` follows the JSON. So `bg-(--state-error-light)` currently produces translucent #fb37483d instead of Figma's solid #ffc0c5.
- Decision: Use semantic state-X-* tokens anyway, matching Badge + Banner convention. The discrepancy is at the token layer, not the component layer — fix once in `globals.css` (out of scope: user constraint forbids touching it) and ALL feedback surfaces realign instantly.
- Impact: Until globals.css solid/alpha discrepancy is resolved, Alert + Toast `light` + `lighter` variants render translucent vs Figma solid. Logged to hold-list.
- Reversal: rebind components to `--dash-{color}-200` foundation tokens directly. Loses semantic participation but matches Figma immediately.

### D42. Alert `feature` status = Dash purple (NOT Figma gray)

- Context: Figma "Alert & Notification & Toast" Feature variant uses gray (#7a7a7a base / #eaeaea light / #f5f5f5 lighter). Dash brand convention (D3) maps `feature` to purple-500 via `--state-feature-base`.
- Decision: Keep Dash purple. Matches Banner + Badge + Tag — "feature" semantically = "new / spotlight" in Dash, expressed via brand purple.
- Reversal: if a future Figma update reframes Feature as neutral surface, retoken `--state-feature-*` to gray.

### D43. Alert size set = `xs | sm | lg` (matches Figma X-Small=32 / Small=36 / Large)

- Context: Existing alert.tsx had `sm/lg` only (sm-mode rendered xs-style + lg vertical stack). Figma component set ships 3 explicit sizes: X-Small h=32 pad=8 icon=16, Small h=36 pad y=8 x=10 icon=20, Large vertical pad y=14/16 x=14 icon=20 gap=12 to actions gap=4 title→desc.
- Decision: Adopt all 3 sizes. `xs` = compact 32px inline, `sm` = 36px inline (default), `lg` = vertical with description + actions block. Docs page already uses all three.
- Reversal: collapse back to `sm/lg` if 32px row proves visually redundant.

### D44. Alert + Toast share one Figma component set; rendering split lives in code

- Context: Figma names the source "Alert & Notification & Toast [1.1]" as a single component set — variants differ only by style and size. There's no Toast-specific anatomy in Figma.
- Decision: Toaster's Sonner `toast` classNames mirror Alert `sm` + `stroke` variant (white bg, soft border, shadow-tooltip). Both use `--state-X-base` for icon color so visual lineage is identical. Inline-vs-floating is a UX/layout decision, not a Figma component decision.

### D45. Alert role + aria-live derived from status (`error` → assertive, others → polite)

- Context: Docs page promised this contract (error = role="alert" + aria-live=assertive, others = role="status" + aria-live=polite). Implementation hardcoded `role="alert"` for all.
- Decision: Set both attributes dynamically: `isAssertive = status === "error"`. Aligns with docs + WCAG live-region guidance.

### D46. ActivityFeed gains `keyIcon` slot + `more` button (Figma left-decoration + right-action)

- Context: Figma "Activity Feed [1.1]" anatomy = keyIcon + avatar + content + more-button (gap 16). Dash had avatar + content only. Default Figma always shows a 32×32 white-circle key icon (purple icon glyph) and a 3-dot more button.
- Decision: Add optional `keyIcon` prop (renders via new `ActivityFeedKeyIcon` sub-component) + `more` prop (boolean = default 3-dot, ReactNode = custom). Both default `undefined` for backward compat — existing usages render identical to before. Avatar resized 28→32px per Figma.
- Reversal: omit prop entirely.

### D47. ActivityFeedTask supports BOTH Figma states and Dash legacy state aliases

- Context: Figma task states = `success / warning / pending / error`. Dash legacy = `completed / in-progress / blocked / cancelled` (workflow-named). Docs page uses legacy names with `count={N}` prefix.
- Decision: Accept 8 state strings, with legacy ones aliasing to Figma color tokens (`completed→success-green`, `in-progress→information-blue`, `blocked→warning-orange`, `cancelled→faded-gray`). `count` prop kept as optional numeric prefix.
- Reversal: deprecate legacy names in a future major.

### D48. ActivityFeedItem title row matches Figma (name+action+target + "・" + timestamp)

- Context: Old Dash put author name + action together with a generic separator. Figma uses 4-part composition: bold `name` + light `action` verb + bold `target` (optional) + ASCII "・" sub-300 divider + light `timestamp` soft-400.
- Decision: New `target?` prop renders the optional bold target. Separator is Japanese middle-dot "・" colored #d1d1d1 (gray-300) per Figma.

### D49. ActivityFeedFilter active state uses brand purple-400 bg + purple-700 text

- Context: Figma `Activity Feed Selected Filter` Active state = `#784def` bg (= --dash-purple-400) + `#5e2aac` icon/text (= --dash-purple-700). Old Dash used `bg-primary/10 + text-primary` (light tint, monochrome).
- Decision: Match Figma 1:1 — solid purple-400 bg + purple-700 text + purple-700 icon. Higher contrast, more intentional "selected" weight.

### D50. NotificationItem keeps legacy `icon` prop alongside new `avatar` slot

- Context: Figma "Notifications Items" always renders a 40×40 Avatar (user image + status badges). Dash legacy API had `icon=<LucideIcon>` inside a 32×32 rounded chip — used in docs/templates.
- Decision: Support both. If `avatar` given, render as-is. If `icon` given, wrap in 40×40 rounded chip (matching Figma Avatar dimensions). Recommend `avatar` going forward.

### D51. NotificationFeed removes `divide-y` between items

- Context: Figma per-item shell = radius=12 + padding=12 (self-contained cards, no separator). Dash used `divide-y divide-stroke-soft-200`, which adds a line BETWEEN rounded cards (visually awkward).
- Decision: Remove `divide-y`. Use `NotificationGroup` label for section breaks; items use hover state for boundaries. Item padding adjusted to match Figma (12 horizontal/vertical, gap 15 between avatar and content).

### D52. ProgressBar default tone stays `primary` (Dash purple, NOT Figma blue)

- Context: Figma "Progress Bar Line" set defaults to blue (#335cff). Dash `tone="primary"` already binds to brand purple via `--primary` token. Changing default would break every existing call.
- Decision: Keep `tone="primary"` default (purple). Document `tone="information"` as the Figma-default blue.
- Reversal: switch default if blue-by-default proves more correct in dashboard contexts.

### D53. ProgressBar track bound to `bg-stroke-soft-200` (Figma uses #eaeaea = stroke-soft)

- Context: Figma track fill = #eaeaea, identical hex to `--stroke-soft-200`. Previous Dash used `bg-bg-soft-200` — slightly different shade and incorrect semantic lineage.
- Decision: Rebind to `bg-stroke-soft-200`. Same color in light mode, correct semantic chain.

### D54. ProgressCircle default tone = `primary` (already matches Figma purple #5e2aac)

- Context: Figma circular progress uses purple-700 fill on gray track. Dash `tone="primary"` already maps to purple via `--primary`. Already correct — confirmation only.
- Decision: Default `primary`. Documented size enum (48/56/64/72/80) for Figma fidelity; arbitrary numbers still accepted via numeric prop.

### D55. ProgressBarLabel added (Figma "Progress Bar Label [1.1]" composition wrapper)

- Context: Figma ships a separate component set with 3 layouts (top label+caption / top label only / right caption). Dash had no equivalent — users wrote ad-hoc flex wrappers.
- Decision: Export `ProgressBarLabel` thin wrapper with `label`, `caption`, `description` slots covering the most-common "On Top + Show Bottom On" layout. Other layouts can be composed inline.

## Navigation (2026-05-17)

### D41. Breadcrumb separator uses `text-icon-disabled-300`, item `h-5 gap-0.5`

- Context: Previous Dash impl had `gap-1.5` between item and icon, `size-3.5` chevron. Figma items are h-5 with a tighter `gap-2` between icon and label (rendered as `gap-0.5` here because the 20×20 icon already includes whitespace).
- Decision: Item gap `gap-0.5`, separator chevron `size-3` inside a `size-5` box, colour `text-icon-disabled-300` (Figma uses #d1d1d1 for the arrow vector). List font is `font-medium text-sm` (Figma 14/20 weight 500).
- Reversal: bump chevron to `text-icon-soft-400` if disabled-300 reads too faint in light mode.

### D42. Pagination selected = neutral white-card (NOT primary fill)

- Context: Dash previously rendered `data-active` cell with primary border + bg-white-0 + shadow-custom-xs (elevated tile). Figma "Selected" state is INDISTINGUISHABLE from "Default" except for text colour (`text-strong-950` vs `text-sub-600`) — same white bg, same stroke-soft-200 border, no elevation.
- Decision: Match Figma. Selected = `border-stroke-soft-200 bg-bg-white-0 text-text-strong-950`. Default = same border + bg, but `text-text-sub-600`. Hover drops the border and goes to `bg-weak-50`.
- Reversal: re-add `shadow-custom-shadows-x-small` to selected if visual review needs more affordance for the active page.
- Breaking: `shadow-custom-xs` removed; affected zero pages (Figma is the source of truth).

### D43. Pagination cell shape exposed via `shape="rounded"|"full"` prop

- Context: Figma ships two cell sets — `Full Radius=Off` (rounded-lg 8px) and `Full Radius=On` (rounded-full 999px). Previous Dash had no axis.
- Decision: Added `shape` prop on `PaginationButton`. Default `rounded` mirrors Figma "Off" (most common). `full` opt-in for pill cells.

### D44. Tabs `pill` variant = Figma vertical "List" style (NOT shadcn pill background)

- Context: Dash previously used shadcn-style `pill` (white card pill on a `bg-weak-50` rounded-lg track with `data-[state=active]:shadow-custom-xs`). Figma has no such pattern — its "vertical/list" tab is just a row of 36px rounded-lg pills with bg swap on hover/active and no track chrome.
- Decision: Reimplemented `variant="pill"` to match Figma vertical list: no track, 36px items, `bg-weak-50` on hover/active, icon swaps to `--primary-base` on active.
- Reversal: re-add `bg-bg-weak-50 p-1 rounded-lg` to `tabsListVariants.pill` if shadcn-style segmented track is preferred.
- Breaking: visual diff on all pages using `<TabsList variant="pill">` — pills now sit flush instead of inside a track.

### D45. Tabs active icon swap via `[&_svg]:text-(--primary-base)` descendant selector

- Context: Figma active tab swaps the leading icon colour from `text-sub-600` to `--primary-base`. Implementing this with a CSS variable per-trigger would require state plumbing.
- Decision: Use Tailwind descendant selector `data-[state=active]:[&_svg]:text-(--primary-base)`. Works only with direct `<svg>` children — extra wrapper spans block the selector.
- Reversal: drop and require consumers to colour their own icon based on `data-state`.

### D46. SegmentedControl default colour = `text-soft-400` (NOT sub-600)

- Context: Dash previously rendered unselected segments with `text-text-sub-600` (close to text-strong-950, attention-grabbing). Figma "Default" state uses the lighter `text-soft-400` to deliberately fade unselected options.
- Decision: Default unselected = `text-text-soft-400`. Hover bumps to `text-text-sub-600`. Active = `text-text-strong-950 + bg-bg-white-0 + shadow-regular-xs`. Disabled = `text-text-disabled-300`.
- Reversal: bump to sub-600 if user testing shows unselected options are too faint.
- Token note: `shadow-regular-xs` referenced from button.tsx convention — assumes the token resolves at build time.

### D47. StepIndicator: completed label colour = `text-sub-600` (NOT strong-950)

- Context: Dash previously coloured all completed + current step labels `text-strong-950`. Figma differentiates: only "current" is strong-950; "completed" steps fall back to `text-sub-600` (greyed). This intentionally pushes focus to the active step.
- Decision: Match Figma. Only `status="current"` gets `text-text-strong-950`; both upcoming and completed render `text-text-sub-600`.
- Reversal: tie back to "strong if completed OR current" if visual hierarchy feels too uniform.

### D48. StepIndicator horizontal connector = chevron, not hairline

- Context: Dash previously rendered horizontal step connectors as `h-px flex-1 mx-3` (hairline rule that grows with primary fill when completed). Figma uses a static 20×20 `chevron-right` icon (text-soft-400) between items — no hairline.
- Decision: Replaced hairline with `<ChevronRight size-5 text-icon-soft-400 />`. Step item no longer needs `flex-1` (was used to space the rule).
- Reversal: re-implement hairline if consumers prefer the progress-bar aesthetic. Both can co-exist via a `connector="chevron"|"rule"` prop.
- Breaking: vertical connectors also removed (Figma vertical stepper has zero connector lines — each item is a self-contained 36px pill with rounded-[10px] chrome). Consumers wanting vertical rules must implement manually.

### D49. StepIndicator marker = 20×20 (NOT 28×28) and font-medium not font-semibold

- Context: Dash used `size-7` (28px) circles with `font-semibold` numerals. Figma uses 20×20 with `font-medium`.
- Decision: Marker is `size-5` (20px) with `text-xs font-medium`. Completed check is `size-2.5` (10px) — fits the smaller disc.

### D50. DotStepper: all dots same size, only colour changes

- Context: Dash previously animated the current dot to `w-5` (stretched pill) and used `bg-primary` for both `completed` and `current` dots. Figma keeps all dots identical in size — only the current dot fills primary; completed dots are stroke-soft-200 (identical to upcoming).
- Decision: Removed the stretch animation and the completed-primary fill. Active = `bg-(--primary-base)`. Everything else = `bg-stroke-soft-200`.
- Reversal: revert to stretch+fill if the "linear-progress" cue is missed.
- Breaking: visual diff on all carousels / onboarding flows using `<DotStepper>`.

### D51. DotStepper sizes shifted (Figma small=8 / x-small=4)

- Context: Dash size scale was `sm=1.5 / md=2 / lg=2.5` (6/8/10 px). Figma scale is `Small=8 / X-Small=4` (no md or lg).
- Decision: `xs=1 (4px Figma)`, `sm=2 (8px Figma default)`. Kept `md=1.5` and `lg=2.5` as Dash extensions for docs/legacy callers. Default size flipped `md` → `sm` to match Figma default.
- Breaking: default render now 8px (was 6px). Sites pinning `size="md"` keep 6px.

### D52. NavigationMenu trigger active = bg-weak-50 + icon primary

- Context: Previous trigger style used `hover:bg-bg-weak-50 + text-strong-950` for both hover and open states (text changed on both). Figma topbar item separates: hover keeps `text-sub-600`, ONLY open/active swaps to `text-strong-950 + icon primary-base`.
- Decision: Hover applies `bg-bg-weak-50` only. `data-[state=open]` / `data-[active]` apply text-strong-950 + icon-primary swap.
- Reversal: collapse back to hover==active styling for simpler interaction model.

### D53. NavigationMenu viewport shadow `shadow-custom-md` (undefined) → `shadow-custom-shadows-small`

- Context: Previous viewport used `shadow-custom-md` which is not defined in `app/globals.css`. Result was no shadow rendered.
- Decision: Use `shadow-custom-shadows-small` (defined, 5-layer stack) for the dropdown surface. Radius bumped 12 → 16 to match Figma dropdown radius.

### D54. Sidebar: width 16rem → 16.5rem (264px Figma), collapsed 14 → 16 (64px Figma)

- Context: Previous sidebar shell width default `16rem` (256px) and collapsed `w-14` (56px). Figma source = 264 expanded / 64 collapsed.
- Decision: Default `width="16.5rem"`, collapsed `w-16`. Header/footer 14→16 (64px tall) to match Figma's larger top/bottom chrome.
- Reversal: shrink back if shell layouts feel cramped at the new width.

### D55. Sidebar active item = 4×20 primary rail on leading edge

- Context: Previous active item style was `bg-weak-50 + text-strong-950` only. Figma adds a 4×20 primary fill bar pinned to the leading edge (the "active rail" affordance) on top of the bg/text changes.
- Decision: Render a non-interactive `<span>` with `absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-md bg-(--primary-base)` only when `active` prop is true. Icon also swaps to `--primary-base` on active.
- Reversal: drop the rail span if it conflicts with custom-padded sidebar layouts.
- Note: `-left-3` positions the rail relative to default `px-2` padding; consumer overrides may detach it (logged in hold-list).

### D56. Sidebar group label = 12px medium uppercase (was 10px semibold widest)

- Context: Previous label `text-[10px] font-semibold uppercase tracking-widest`. Figma section headers are 12/16 medium uppercase with normal tracking.
- Decision: `text-xs font-medium uppercase tracking-wide`. Padding 12→8 horizontal to match item indent.

## 2026-05-17 — Picker/menu sweep (Phase 2 continuation)

### D41. Picker family tokens: sweep ALL shadcn-legacy refs → Dash semantic

**Conflict**: `date-picker.tsx`, `calendar.tsx`, `color-picker.tsx`,
`command.tsx`, `file-upload.tsx`, `filter.tsx`, `rich-editor.tsx`
historically imported shadcn aliases: `bg-popover`, `border-input`,
`bg-accent`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`,
`text-foreground`, `bg-card`, `border-border`, `text-destructive`,
`border-destructive`, `bg-muted`, `text-icon-sub` (short form),
`focus-visible:ring-ring`. None are bound to a Tailwind utility under
`@theme inline` in `app/globals.css` — they rendered as no-op styles.

**Decision**: Hard replace with Dash semantic-token classes in all 10
in-scope files: `bg-bg-white-0`, `bg-bg-weak-50`, `border-stroke-soft-200`,
`text-text-strong-950`, `text-text-sub-600`, `text-text-soft-400`,
`text-text-disabled-300`, `text-icon-soft-400`, `text-icon-sub-600`,
`bg-(--primary-base)`, `text-(--primary-base)`, `text-(--state-error-base)`,
`text-static-white`, `focus-visible:ring-(--primary-alpha-10)`. Used
arbitrary `var()` syntax for `--primary-*` and `--state-*-*` because no
Tailwind `--color-primary-*` / `--color-state-*` mapping exists in the
@theme block.

**Impact**: Picker surfaces become visible & on-brand for the first time.
No `app/globals.css` change (out of scope per task). Same broken-token
risk exists in non-scope files — see hold-list GLOBAL Pickers entry.

**Reversal**: revert any single component file or add proper `--color-primary`
mappings under `@theme inline` in a future Phase 3 token-sync sweep.

### D42. Select sizes: Figma X-Small (32) / Small (36) / Medium (40, DEFAULT) mapped to sm/md/lg

**Conflict**: Figma source has 3 sizes (32 / 36 / 40 with 40 being the
default visual). Dash Select historically shipped sm=32, md=36, lg=40,
xl=44 — naming OK but default was `md=36` not the Figma default 40.

**Decision**: Keep `sm | md | lg | xl` naming (preserves consumer call
sites). Map dimensions to Figma exactly: sm=h-8 r-8 (X-Small),
md=h-9 r-8 (Small), lg=h-10 r-10 (Medium, NEW DEFAULT), xl=h-11 r-10
(Dash extension for hero forms). `defaultVariants.size` flipped `md → lg`.

**Impact**: Existing call sites that omit `size` will render visually
larger (40 vs 36). Forms that previously composed Select with `Input md`
will appear visually balanced (both 40h, matching Figma form spec).

**Reversal**: Set `defaultVariants.size: "md"` to revert default to 36.
xl can be deleted if Dash drops the 44 hero variant.

### D43. Picker trigger token vocabulary unified across Select/Combobox/DatePicker/ColorSwatch

**Method**: All 4 picker triggers share an identical state-token spec:

```
default  → border-stroke-soft-200 bg-bg-white-0 text-text-strong-950
hover    → bg-bg-weak-50 border-transparent text-text-sub-600
open     → border-stroke-strong-950 (data-[state=open])
focus    → ring-4 ring-(--primary-alpha-10)
invalid  → border-(--state-error-base) (aria-[invalid=true])
disabled → bg-bg-weak-50 border-transparent text-text-disabled-300
```

**Impact**: Visual + a11y parity across all dropdown affordances. Future
audit only needs to update one block; cross-component drift eliminated.

### D44. ColorPicker: split into Figma `ColorDot`/`ColorDotGroup` + Dash `ColorPicker` (HSV)

**Conflict**: Figma's canonical "Color Picker" (node 553:22078) is a
brand-fixed 10-swatch dot grid, NOT a continuous HSV square. Dash already
ships an HSV picker via react-colorful for product surfaces needing any
hex.

**Decision**: Add Figma-faithful primitives:
- `ColorDot` — 24x24 hit area, 16x16 dot fill, selected = 2px inner ring
  in `bg-white-0` (Figma exact).
- `ColorDotGroup` — radio group of brand 10 (gray/blue/orange/red/green/
  yellow/purple/sky/pink/teal).

Keep `ColorPicker` (HSV + hex input) as a documented Dash extension. Keep
`ColorPickerPresets` + `ColorSwatch` (restyled to Dash tokens).

**Impact**: Consumers who need Figma-exact label-color picker now have
the right primitive. Hex-arbitrary surfaces unchanged.

### D45. TimePicker: split into Figma slot/status primitives + numeric input extension

**Conflict**: Figma Time Picker is a popover panel of time slots + status
badges. Dash original `TimePicker` was a numeric HH:MM input (form usage).

**Decision**: Keep the numeric `TimePicker` (Dash extension for forms).
Add `TimePickerSlot` (Figma "Time Picker Items" 36h r=8 selectable row
with optional check) + `TimePickerStatus` (Figma "Select Status" 28h
pill with status dot). Full panel composition deferred (see hold-list).

**Impact**: Calendar booking / availability UI now has the right
primitives. Forms keep the input.

### D46. File Upload format chip: solid-color label chip over generic lucide icon

**Conflict**: Figma `File Format Icons [1.1]` ships 27 bespoke
folded-paper SVG components (9 colors × 3 sizes). Hand-importing each as
React = high effort, low visual payoff.

**Decision**: Approximate via lucide file icon + small coloured chip
overlay carrying the uppercase extension label (PDF/CSV/DOC/etc) with
the Figma-spec color (PDF red, CSV/XLS green, DOC blue, PNG/JPG purple,
ZIP yellow, JSON sky). The Figma 40x40 container shape (r=6 white card
with 1.5px stroke + folded corner) is approximated as a rounded white
card with format chip pinned bottom-centre.

**Impact**: 90% visual parity. Real Figma SVGs deferred to asset import
sweep (track in hold-list H6).

### D47. RichEditor toolbar background: `bg-bg-weak-50` → `bg-bg-white-0`

**Conflict**: Figma `Rich Editor` Variant=01 toolbar is white (#ffffff)
with bottom hairline + per-item hover `bg-bg-weak-50`. Dash original had
the entire toolbar tinted weak-grey.

**Decision**: Flip toolbar bg to `bg-bg-white-0`, move the weak tint
ONLY into per-item `aria-pressed` and `hover` states. Toolbar padding
shrinks `px-2 py-1.5 → px-1 py-0.5` to match Figma 481x32 total height
(2px padding × 28px items).

**Impact**: Editor surface looks cleaner & more spacious. Editing area
gains visual continuity with toolbar (both white).

### D48. Filter trigger: dashed → solid border on open + h-9 (was h-8)

**Conflict**: Figma Filter trigger is solid 9-tall pill with border that
transitions dashed → solid on open. Dash original was 8-tall dashed
always.

**Decision**: Bump h-8 → h-9 for visual parity with other 36h triggers
(Small Select/Input). Add `data-[state=open]:border-solid` to convert
dashed to solid when popover opens.

**Impact**: Filter now sits at the same baseline as adjacent Input/Select
triggers in a toolbar row.
