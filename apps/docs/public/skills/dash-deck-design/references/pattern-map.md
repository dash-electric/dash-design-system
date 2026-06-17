# Pattern Map — design-system §6 patterns → real example slides

Bridges the abstract spec to concrete, rendered markup. For each pattern, build from the
example slide noted here, but **always layer the foundation from `base-styles.css`** (the
examples predate the v3.1 slide-frame wrapper — see drift notes).

Examples live in `references/examples/`:
- `dash-core-problem-deck.html` — Recipe B (strategic memo), 13 slides
- `mcd-2month-recap.html` — Recipe A (data recap), 11 slides

Slides are anchored by their `<section class="…">` name (stable across edits).

## Recipe B — `dash-core-problem-deck.html` (clean, v3.1-compliant except foundation)

| Pattern (§6) | Slide | Notes |
|---|---|---|
| S-COVER-DARK | `.s1` (dark) | Variant-B dot identifier + large cover headline |
| S-MANIFEST | `.s2` | One-line framing, `<em>` purple key term |
| S-METRIC-TABLE | `.s3` | Two-column metric comparison, dashed row rules |
| S-COMPARE-QUAL | `.s4` | Dotbox concentration vs dispersion device |
| S-PILLARS | `.s5` | 72×72 outline-circle icons, two-pillar argument |
| S-CHANNEL-ROWS | `.s6` | Channel comparison + implication row |
| S-FLOW-WALL | `.s7` | `.step` cards + `↓` + terminal `.wall` |
| S-REFRAME | `.s8` (dark) | Old (line-through danger) → new (purple-on-dark) |
| S-CARDS-N | `.s9` | The bets |
| S-UNKNOWNS | `.s10` | Dashed cards, `?` glyph, open assumptions |
| S-CARDS-N | `.s11` | The asks |
| S-OUTCOMES-N | `.s12` (dark) | Status quo vs Path A vs Path B |
| S-FINALE | `.s13` (dark) | Single-word `mega` finale |

This is the best reference for Recipe B layout, component markup, and the strategic-memo
voice. Copy its component CSS/markup freely — just not its slide root (no frame wrapper).

## Recipe A — `mcd-2month-recap.html` (partially pre-v3 — read drift notes)

| Pattern (§6) | Slide | Notes |
|---|---|---|
| S-COVER-DARK | `.s1` (dark) | Cover with co-brand line (`.mcd` McDonald's) |
| S-MANIFEST | `.s2` | Three headline numbers |
| S-METRIC-TABLE | `.s3` | McD vs Non-McD comparison |
| S-CHART-LINE | `.s4` | Efficiency trend + stats-row |
| S-CHART-BAR | `.s5` | Volume / spend trend |
| ~~S-PAIR (REMOVED)~~ | `.s6`–`.s10` (`.pair`) | **DO NOT COPY — see drift note 2** |
| S-CLOSE-NEXT | `.s11` (dark) | Closing with next steps |

Use `.s1`–`.s5` and `.s11` as the Recipe A reference (cover, manifest, metric table,
both chart types, close). These are clean. The chart CSS/SVG here is the canonical
reference for §7.

---

## Spec-only patterns (no example-deck instance — added v0.7 / foundation v3.3)

These five patterns have **no slide in `references/examples/`**. Build them from their
`design-system.md` §6 spec plus the component CSS appended at the foot of `base-styles.css`
(same tokens, same hairline discipline). Used mainly by Recipe E (war-story) and Recipe D
(multi-talk).

| Pattern (§6) | Build from | Notes |
|---|---|---|
| S-SPEAKER (§6.21) | base-styles `.photo-box` + spec | Photo + identity + experience ledger. The ONLY photo slide (§9 Photos). |
| S-TIMELINE (§6.22) | base-styles `.tl` + spec | Career / phase timeline; 2px hairline axis, node dots, `.now` is the accent. |
| S-COMPARE-COLS (§6.23) | base-styles `.cmp` / `.clist` + spec | Text-list sibling of S-COMPARE-QUAL (`.s4`); no dotbox device. |
| S-INCIDENT (§6.24) | base-styles `.flow` / `.wall` / `.wall.win` + spec | Built→Broke→Fixed. Reuses the S-FLOW-WALL primitives (`.s7`) plus the `.wall.win` / `.step.fixed` variants. Repeat as a series. |
| S-ARCH (§6.25) | base-styles `.archzone` etc. + spec | Layered architecture diagram (inline SVG). Hairline zones; the NEW layer carries the one accent. |

---

## DRIFT NOTES — reconciliation against v3.1 (read before building)

**`design-system.md` (v3.1) is the authority. Where these decks disagree, the doc wins.**

1. **No slide-frame wrapper (BOTH decks).** Neither deck has the §2 preview-frame wrapper
   (`.slide-frame` + `transform: scale`) or the bug-proof footer — they predate v3.1. The
   footer-clip and horizontal-overflow bugs v3.1 fixes are likely present in them.
   → **Always build the slide foundation from `base-styles.css`, never from the example
   slide roots.** Wrap every slide in `.slide-frame`.

2. **mcd `.s6`–`.s10` use the removed image-paired layout (`.pair` + `.img-wrap` + `<img>`).**
   v3.1 replaced `S-PAIR` with the text-only `S-FEATURE-LIST` (§6.13). These 5 image slides
   are non-compliant. → **Never reproduce them.** For feature recaps, build ONE text-only
   `S-FEATURE-LIST` slide instead (no images, no screenshots).

3. **Minor: 2–4px `border-radius` on some cards/steps; `border-radius: 50%` on circles.**
   Circles (icons, dots, dot-mark) are correct. The 2–4px rounding on cards/steps is a small
   stylistic drift — v3.1 leans sharp/hairline. `base-styles.css` keeps surfaces sharp by
   default. Don't add rounding to new cards.

4. **Tokens are clean.** All color tokens in both decks match §3 exactly; `base-styles.css`
   uses the verified set. No reconciliation needed there.
