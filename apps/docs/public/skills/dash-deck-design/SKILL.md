---
name: dash-deck-design
description: Apply the Dash Electric deck design system (tokens, type, color, charts, layouts) when building, editing, or restyling any Dash deck, slides, presentation, recap, pitch, proposal, postmortem, WBR, strategic memo, speaker intro, war-story / case-study, multi-talk session, or architecture diagram. Output is editorial HTML exported to PDF, never .pptx. Use even if unasked.
version: 0.7.0
owner: dash-electric
---

# Dash Electric Deck System

This skill produces presentation decks for Dash Electric in a fixed editorial / annual-report aesthetic (think Stripe Atlas, Apple investor decks, Bloomberg). Decks are built as **self-contained HTML files** (16:9 slides, print-to-PDF for export) — not native .pptx. Every visual decision is governed by `references/design-system.md`.

**Brand name — default to "Dash Electric".** Wordmarks, footers, and the deck identifier read "Dash Electric" / `DASH ELECTRIC` unless the user explicitly asks for "Dash Express". The purple accent, the logo, and every token are unchanged either way (the embedded logo glyph is brand-neutral — it reads "DASH").

It works in two phases: **frame the deck first, then execute.** A great-looking deck with weak framing is a failure. Do not skip Phase 1.

## When this triggers

Any request to create, edit, format, or restyle a Dash deck, slides, presentation, recap, report, pitch, strategic memo, postmortem, speaker intro, war-story / case-study, multi-talk session, or architecture diagram. Also when someone pastes deck content and asks to "make it look right" or "follow the Dash style."

---

## PHASE 1 — Frame the deck (interrogate before building)

The goal of this phase is the same discipline the visual system enforces (§13): a deck leads with a *reframe* and one or two numbers, not a pile of bullets. Force that thinking up front.

**Decide whether to ask.** If the user already handed you clear content, a framing/angle, AND the recipe (or it's obvious), skip the questions — restate the frame back in 2–3 lines and ask for a go-ahead, then build. Only interrogate when the framing or content is thin. Never interrogate twice.

**If framing is thin, ask this tight set in ONE pass (not one-at-a-time, don't exceed these):**

1. **The reframe** — what is the *one* idea this deck lands? (This becomes the title / the new framing, not a topic label.)
2. **The lead number** — the single most important stat, with its time scope.
3. **Audience + current belief** — who's in the room, and what do they believe *now* that this deck needs to shift?
4. **Recipe** — A (data recap), B (strategic memo), C (launch/pitch), D (multi-talk session), or E (war-story / personal talk)? If unsure, infer from the answers above and state your pick.
5. **The unknowns** — what don't we know yet? (Feeds the open-assumptions slide on strategic decks; honesty is part of the system, §1.7.)

Keep questions in the system's voice: direct, no corporate softeners. Don't ask about slide-by-slide content ("what goes on slide 4?") — that's backwards. Ask about framing; the content falls out of it.

**Then confirm before executing.** Restate, in 2–3 lines: the reframe (title), the lead number, the recipe, and the slide spine you'll build. Get a yes. Only then move to Phase 2. If an answer reveals the deck has no real reframe — just a data dump — say so plainly and help sharpen it before building.

---

## PHASE 2 — Execute (build the deck)

1. **Read `references/design-system.md` in full before producing any slide.** It is the source of truth. Do not improvise tokens, sizes, or colors from memory — every value is specified there and must be used exactly.
2. **Start from `references/base-styles.css`** for the slide foundation — tokens, the `.slide-frame` wrapper, the bug-proof footer, the print bypass, the top-right `.dash-logo`, and (at the foot of the file) component CSS for the patterns with no example. This is the v3.3-correct foundation.
3. **Match real rendered output, not just the spec** — use `references/pattern-map.md` to find a real instance of each pattern in `references/examples/`, and copy its component markup. **Warning: the example decks predate v3.1** — take component markup (eyebrow, lede, stat, table, card, chart) from them, but NEVER their slide root (no frame wrapper) and NEVER mcd's `.s6`–`.s10` image-paired feature slides (removed pattern — use text-only `S-FEATURE-LIST` instead). **Five patterns have NO example-deck instance** — `S-SPEAKER`, `S-TIMELINE`, `S-COMPARE-COLS`, `S-INCIDENT`, `S-ARCH` (§6.21–§6.25); build those from their §6 spec plus the component CSS appended to `base-styles.css`.
4. **Pick the recipe** confirmed in Phase 1 (§16) and its headline baseline:
   - Recipe A (recap) → `title-md` 44 · B (memo) → `title-lg` 60–64 · C (pitch) · D (multi-talk, one baseline per talk) · E (war-story) → `title-md` 44, sized up for the room (§4).
5. **Assemble slides** from the §6 layout pattern library by *slide purpose*, not slide number. Reuse the §14 HTML snippets as starting points. Drop `<div class="dash-logo"></div>` as the **first child** of every `<section>` (§5). The portrait on `S-SPEAKER` is the only photo in the deck (§9 Photos); everything else stays text-first.
6. **Apply the canvas spec from §2 exactly** — the per-slide `.slide-frame` wrapper (native 1920×1080 scaled into a 1440×810 frame) and the bug-proof absolute-positioned `.footer`. The footer's `left`/`right` MUST come from `var(--pad-x)` (set in `base-styles.css`, 120 content / 140 wide), and every pattern's horizontal content padding MUST use `var(--pad-x)` too, so the footer is always flush with the content column. These are the most common layout bugs; follow them literally.
7. **If no §6 pattern fits the slide's purpose, compose a new layout per §6.18.** Reuse the foundation (`base-styles.css`) and the spacing rhythm of the nearest §6 pattern; never invent style. When you do this, state in one line which existing pattern you derived the rhythm from (e.g. "rhythm derived from §6.9 S-CARDS-N — same eyebrow / H3 / kv-grid stack, regrouped into a 4-row timeline"). Never introduce a new color, gradient, fill, shadow, emoji, rounded bar, or second accent — if the content seems to need one, simplify the content.
8. **Self-check against §15 (Do/Don't)** before finishing.

## Non-negotiable core rules (never violate, even on a quick build)

- 16:9, 1920×1080 internal. Never deviate from the aspect ratio.
- Default brand wording is **Dash Electric** (switch to "Dash Express" only on request; tokens and logo unchanged).
- One purple anchor (`--purple #5E2AAC`) per visual zone — never decoration.
- Hairlines (`1px --rule #E4E3DE`), not boxes/shadows/gradients. Flow / card / architecture diagrams are the sanctioned exception — hairline-bordered, never shadowed, still one accent (§1, §6.24–§6.25).
- Co-brand tokens (McD `#FFC72C`, Meta `#0866FF`) wrap ONLY the literal brand name.
- Mono (JetBrains Mono) only for slide numbers, dates, axis labels, meta, bar values. Never body copy.
- Negative letter-spacing on display type; never positive tracking on headlines.
- Numbers carry the message: "−63%", not "huge reduction". Footnote the time scope on every metric slide.
- Charts: one series carries weight, the rest recede. Never round bars, never gradients, one annotation max.
- No emoji. The Dash logo top-right is chrome — embed it ONCE via CSS (`.dash-logo`, first child of each `<section>`, §5), never an inline per-slide `<img>`. Photos appear ONLY on `S-SPEAKER` (§9 Photos). Icons are outline-stroke `currentColor` SVGs, always optional.
- Strategic decks lead with the reframe (§6.7) and always include an open-assumptions slide (§6.11).

## Output

A single HTML file with all CSS inline (Google Fonts CDN for Plus Jakarta Sans + JetBrains Mono), every slide wrapped per §2, the logo embedded once, and the §11 print bypass included (with `print-color-adjust: exact` so dark slides survive PDF) so the user can export to PDF directly. Match the recipe's headline baseline consistently across the whole deck — never mix headline sizes from different baselines.

## Reference

- `references/design-system.md` — the complete design system (tokens, typography, color, layout patterns §6, chart specs §7, recipes §16, HTML snippets §14, do/don't §15). Read it before every build. Sections are numbered §1–§18.
- `references/base-styles.css` — v3.3-correct foundation (tokens + slide-frame wrapper + footer + print bypass + top-right logo + component CSS for `S-SPEAKER` / `S-TIMELINE` / `S-COMPARE-COLS` / `S-INCIDENT` / `S-ARCH`). Start every deck from this.
- `references/pattern-map.md` — maps each §6 pattern to a real slide in the example decks, plus the drift notes reconciling the examples against v3.1, and notes which patterns are spec-only. Read before copying any example markup.
- `references/examples/` — two real decks for pattern-matching: `dash-core-problem-deck.html` (Recipe B) and `mcd-2month-recap.html` (Recipe A). They predate v3.1 — see `pattern-map.md` for what not to copy.
