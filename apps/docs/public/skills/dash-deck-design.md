# Dash Skill — dash-deck-design

> Public skill from **Dash Electric**. To use it: paste this file's URL
> into any AI assistant (Claude, ChatGPT, Gemini) and ask it to read and
> follow the instructions below. No install, no login required.
>
> Source of truth: `dash-electric/dash-skills · skills/dash-deck-design` · v0.7.0
>
> Apply the Dash Electric deck design system (tokens, type, color, charts, layouts) when building, editing, or restyling any Dash deck, slides, presentation, recap, pitch, proposal, postmortem, WBR, strategic memo, speaker intro, war-story / case-study, multi-talk session, or architecture diagram. Output is editorial HTML exported to PDF, never .pptx. Use even if unasked.

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

---

## Reference — `base-styles.css`

```css
/* Dash Electric Deck — base foundation styles (v3.3)
 *
 * This is the v3.3-CORRECT foundation: tokens + preview-frame wrapper + bug-proof
 * footer + print bypass. The bundled example decks (references/examples/) PREDATE
 * v3.1 and do NOT contain the slide-frame wrapper or this footer spec — so copy the
 * foundation from HERE, and take only component-level markup (eyebrow, lede, stat,
 * table, card, chart) from the example decks. See pattern-map.md.
 *
 * v3.3 also adds, at the FOOT of this file: the top-right Dash logo (embedded once,
 * light + dark) and component CSS for the patterns that have NO example-deck instance
 * — S-SPEAKER, S-TIMELINE, S-COMPARE-COLS, S-INCIDENT, S-ARCH. Build those from there.
 *
 * Tokens verified identical to design-system.md §3 against both example decks.
 */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* neutrals */
  --ink: #1A1A1A;
  --ink-2: #0E0E0E;
  --paper: #F7F7F5;
  --paper-2: #FFFFFF;
  --mute: #6B6B68;
  --mute-dark: #9A9A96;
  --rule: #E4E3DE;
  --rule-dark: #2A2A2A;
  /* brand accent */
  --purple: #5E2AAC;
  --purple-soft: #EEE5FB;
  --purple-card: #F1ECF9;
  --purple-on-dark: #B589F0;
  /* semantic */
  --success: #0F6E56;
  --danger: #A32D2D;
  --success-dark: #A8E0C8;
  --danger-dark: #E8A0A0;
  /* partial / projected data (hedged chart values, §13) */
  --partial: #9A8DC0;
  /* co-brand (add per-deck only, single-use, literal name only) */
  --mcd: #FFC72C;
  --meta: #0866FF;
}

/* print-color-adjust:exact → dark slide backgrounds survive PDF export (do not remove) */
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* Preview page: slides stacked on black. Print strips this (see bypass below). */
body {
  margin: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Frame: visual size shown to the reader (16:9). Change width to resize;
   height MUST equal width × 9/16, and .slide scale MUST equal width / 1920. */
.slide-frame {
  width: 1440px;
  height: 810px;
  overflow: hidden;
  position: relative;
  background: var(--paper);
}
.slide-frame.dark { background: var(--ink); }

/* Slide: authored at native 1920×1080, scaled into the frame.
 *
 * --pad-x = horizontal content padding for this slide. The footer's left/right
 * are bound to this same variable so the footer is ALWAYS flush with the
 * content column. Pattern CSS must use `padding: <vertical> var(--pad-x)` for
 * the slide's horizontal padding — never hardcode horizontal padding.
 *
 * Default = 120px (content slides). Wide patterns override to 140px below.
 * Both are well above the 60px minimum safe zone.
 */
.slide {
  position: relative;     /* required — footer is absolute inside this */
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  box-sizing: border-box;
  transform: scale(0.75); /* = frame width / 1920 */
  transform-origin: top left;
  color: var(--ink);
  --pad-x: 120px;         /* default content padding; drives footer left/right */
}
.slide.dark { color: var(--paper); }

/* Wide patterns: cover, manifest, reframe, close, close-next, finale.
   Match any of these classes regardless of order with .dark / other modifiers. */
.slide.s-cover,
.slide.s-manifest,
.slide.s-reframe,
.slide.s-close,
.slide.s-close-next,
.slide.s-finale { --pad-x: 140px; }

/* Footer chrome — single element, left/right children, flush with content
   column (via --pad-x), NOT a fixed 60px safe-zone minimum. */
.slide .footer {
  position: absolute;
  left: var(--pad-x);
  right: var(--pad-x);
  bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 500 13px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.10em;
  color: var(--mute);
  pointer-events: none;
}
.slide.dark .footer { color: var(--mute-dark); }
.slide .footer .left  { text-align: left;  }
.slide .footer .right { text-align: right; }

/* Body content should reserve room so it never collides with the footer. */
.slide .body { padding-bottom: 96px; }

/* Print / PDF: drop the preview scale, restore native 1920×1080, one page per slide. */
@page { size: 1920px 1080px; margin: 0; }
@media print {
  html, body { background: #FFFFFF; }
  body { padding: 0; gap: 0; display: block; }
  .slide-frame {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    margin: 0;
    overflow: hidden;
  }
  .slide-frame:last-child { page-break-after: auto; }
  .slide {
    transform: none;
    width: 1920px;
    height: 1080px;
    box-shadow: none;
  }
}

/* ============================================================================
   EXTENDED PATTERN COMPONENTS  (v3.3 / repo 0.7.0)
   CSS for patterns with NO instance in references/examples/ — build these
   patterns from the spec in design-system.md §6.21–§6.25 plus the CSS below.
   Same tokens, same hairline discipline; diagrams are the sanctioned
   hairline-border exception (never shadowed). See design-system.md §1, §9.
   ============================================================================ */

/* -- flow / wall (+ win variant) — S-FLOW-WALL & S-INCIDENT -- */
.flow{display:flex;flex-direction:column;gap:0;}
.step{border:1px solid var(--rule);background:var(--paper-2);padding:30px 36px;font:400 27px/1.34 'Plus Jakarta Sans';color:var(--ink);}
.step .lbl{font:700 14px/1 'Plus Jakarta Sans';letter-spacing:0.20em;text-transform:uppercase;color:var(--mute);margin-bottom:13px;display:block;}
.step.fixed,.step.highlight{background:var(--purple-soft);border-color:#C9B3EC;}
.step.fixed .lbl{color:var(--purple);}
.arrow{align-self:center;font:400 36px/1 'JetBrains Mono',monospace;color:var(--mute);padding:16px 0;}
.wall{background:var(--ink);color:var(--paper);padding:32px 36px;}
.wall .w1{font:700 14px/1 'Plus Jakarta Sans';letter-spacing:0.20em;text-transform:uppercase;color:var(--danger-dark);margin-bottom:14px;}
.wall .w2{font:800 38px/1.08 'Plus Jakarta Sans';letter-spacing:-0.02em;}
.wall .w3{font:500 16px/1.45 'JetBrains Mono',monospace;letter-spacing:0.02em;color:var(--mute-dark);margin-top:13px;}
.wall.win{background:var(--purple);}
.wall.win .w1{color:#E7D8FB;} .wall.win .w3{color:#E6D9F8;}

/* -- stat block (S-INCIDENT left rail, S-CHART footer) -- */
.stat-block .label{font:700 12px/1 'Plus Jakarta Sans';letter-spacing:0.20em;text-transform:uppercase;color:var(--purple);}
.stat-block .val{font:800 44px/1 'Plus Jakarta Sans';letter-spacing:-0.02em;margin-top:12px;}
.stat-block .desc{font:400 17px/1.5 'Plus Jakarta Sans';color:var(--mute);margin-top:8px;}

/* -- qualitative comparison text lists — S-COMPARE-COLS -- */
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:80px;}
.ctag{font:700 15px/1 'Plus Jakarta Sans';letter-spacing:0.22em;text-transform:uppercase;}
.ctag.bad{color:var(--danger);} .ctag.ok{color:var(--success);} .ctag.pur{color:var(--purple);} .ctag.neu{color:var(--mute);}
.clist{list-style:none;margin-top:26px;}
.clist li{font:400 24px/1.42 'Plus Jakarta Sans';color:var(--ink);padding:22px 0;border-top:1px dashed var(--rule);display:flex;gap:16px;}
.clist li:first-child{border-top:none;}
.clist li .mk{flex:none;color:var(--mute);font-weight:700;}
.clist li.eq{font-weight:700;border-top:1px solid var(--rule);}
.clist li.eq.bad{color:var(--danger);} .clist li.eq.ok{color:var(--success);} .clist li.eq.pur{color:var(--purple);}

/* -- career / phase timeline — S-TIMELINE -- */
.tl{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid var(--rule);}
.tl .stop{padding:36px 36px 0;position:relative;}
.tl .stop::before{content:"";position:absolute;top:-10px;left:36px;width:18px;height:18px;border-radius:50%;background:var(--mute);}
.tl .stop.now::before{background:var(--purple);}
.tl .stop + .stop{border-left:1px solid var(--rule);}
.tl .dur{font:500 15px/1 'JetBrains Mono',monospace;letter-spacing:0.12em;text-transform:uppercase;color:var(--mute);margin-bottom:18px;}
.tl .stop.now .dur{color:var(--purple);}
.tl .co{font:800 42px/1.0 'Plus Jakarta Sans';letter-spacing:-0.025em;margin-bottom:12px;}
.tl .stop.now .co{color:var(--purple);} .tl .co.small{font-size:34px;}
.tl .role{font:400 21px/1.4 'Plus Jakarta Sans';color:var(--ink);margin-bottom:6px;}
.tl .sub{font:400 17px/1.4 'Plus Jakarta Sans';color:var(--mute);}

/* -- layered architecture diagram (inline SVG) — S-ARCH.
   Hairline rounded-rect zones; the ONE accent marks the NEW layer. -- */
.archbox{fill:var(--paper-2);stroke:var(--rule);stroke-width:1;}
.archbox-accent{fill:var(--purple-soft);stroke:#C9B3EC;stroke-width:1;}
.archzone{fill:none;stroke:var(--rule);stroke-width:1.4;}
.archzone-accent{fill:var(--purple-soft);stroke:#C9B3EC;stroke-width:1.4;}
.zlabel{font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:0.20em;text-transform:uppercase;fill:var(--mute);}
.zlabel-accent{font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:0.20em;text-transform:uppercase;fill:var(--purple);}
.archlabel{font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:0.05em;fill:var(--ink);}
.archlabel-accent{font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:0.05em;fill:var(--purple);font-weight:500;}
.archsvc{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:0.03em;fill:var(--ink);}
.archline{stroke:var(--rule);stroke-width:1.5;}
.archcap{font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:0.18em;text-transform:uppercase;fill:var(--mute);}

/* -- speaker portrait box — S-SPEAKER (the ONLY photo use; design-system §9 Photos).
   4:5 fixed ratio, cover-fit; grayscale suits the palette. Dashed placeholder
   before the real photo exists. NEVER an <img> that stretches. -- */
.photo-box{aspect-ratio:4/5;background-size:cover;background-position:center top;background-repeat:no-repeat;background-color:#EFEEEA;}
.photo-box.placeholder{border:1px dashed #BFBDB4;background-color:#FBFBF9;display:flex;align-items:center;justify-content:center;}
.photo-box.placeholder .ph{font:600 16px/1 'Plus Jakarta Sans';letter-spacing:0.22em;text-transform:uppercase;color:#9A9A96;}

/* -- Dash logo: top-right on every slide, embedded ONCE (light + dark).
   Drop <div class="dash-logo"></div> as the first child of each <section>.
   Brand-neutral 'DASH' glyph; never an inline <img> per slide. -- */
.dash-logo{position:absolute;top:50px;right:60px;width:122px;height:42px;pointer-events:none;z-index:5;background-image:url("data:image/png;base64,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");background-size:contain;background-repeat:no-repeat;background-position:right center;}
.slide.dark .dash-logo{background-image:url("data:image/png;base64,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");}
```

---

## Reference — `design-system.md`

# DESIGN.md — Dash Electric Deck System

General editorial deck system distilled from:
- `mcd-2month-recap.html` (data-recap variant)
- `Dash Core Problem Deck.html` (strategic / narrative variant)

Use this doc as the source of truth for any new Dash Electric presentation. Same tokens, same scale, same charting language. Pick the layouts you need from the pattern library in §6.

**Brand name — default to "Dash Electric".** Wordmarks, footers, and the deck identifier read "Dash Electric" / `DASH ELECTRIC` unless the user explicitly asks for "Dash Express". Nothing else changes between the two — same purple, same logo, same tokens. The embedded logo glyph is brand-neutral (it reads "DASH").

---

## 1. Aesthetic

- **Genre**: Editorial / annual-report / financial-disclosure / strategy memo.
- **Mood**: Confident, factual, restrained. Numbers do the work; chrome stays out of the way.
- **Reference shelf**: Stripe Atlas, Apple investor decks, Bloomberg Markets, Pentagram annual reports, NYT explainers.
- **Anti-references**: SaaS marketing decks, gradient-heavy startup decks, illustrated explainers, emoji-driven status pages.

Principles:
1. **One idea per slide.** A title, a frame, the proof.
2. **Numbers ≥ prose.** Stats carry data slides. Sentences carry strategy slides — but the sentence is one, big, and shaped.
3. **Hairlines over fills.** Structure via 1px rules (`--rule`), not boxes / shadows / gradients. *Diagrams are the sanctioned exception* — flow steps, cards, and architecture zones (§6.6, §6.24, §6.25) use hairline-bordered containers, never shadowed or gradient-filled, and still hold to one accent.
4. **One accent at a time.** Purple = Dash voice. A second accent appears only as a *co-brand token* (e.g. McD yellow, Meta blue) and only on the entity's literal name. Never as decoration.
5. **Tight headlines.** Negative letter-spacing (-0.02 to -0.05em). Tight leading (0.90–1.10).
6. **Eyebrows do the framing.** Tracked uppercase labels set context; titles never repeat that context.
7. **Honest about what we don't know.** Open assumptions, partial data, and uncertainty get their own slide template — never hidden.

---

## 2. Canvas

Standard PowerPoint 16:9 widescreen. Internal grid uses 1920×1080 px for crisp typography and predictable pixel math; preview renders at a downscaled visual frame (default 1440×810); print/PDF exports at native 1920×1080.

| Token | Value |
|---|---|
| Slide size (internal) | `1920 × 1080` px (16:9 widescreen — matches PowerPoint default) |
| **Preview frame (default)** | `1440 × 810` px (16:9, scale `0.75`) |
| Preview frame (alt sizes) | `1200 × 675` (scale `0.625`) · `1280 × 720` (scale `0.667`) · `1600 × 900` (scale `0.833`) — always 16:9 |
| Aspect ratio | `16:9` — never deviate |
| Print/PDF | `@page size: 1920px 1080px; margin: 0` (native, scale bypassed) |
| Page bg (preview) | `#000` (slides stacked on black, 24px gap) |
| **Horizontal padding (`--pad-x`)** | Content slides: `120px` (default). Wide patterns (cover, manifest, reframe, close, close-next, finale): `140px`. Every pattern MUST set its horizontal padding via `var(--pad-x)` — never a hardcoded value. |
| Vertical padding | `80–110px` typical; `90–100px` for dense data slides; `110px` for cover / closing / manifesto. Patterns control this per layout. |
| **Footer alignment** | Footer `left` / `right` are bound to `var(--pad-x)` (set in `base-styles.css`) so the footer is always flush with the content column. NEVER hardcode 60px (or any other fixed value) on the footer — that produces per-slide misalignment when content padding differs. |
| **Safe zone** | Minimum `60px` from every slide edge for any content. This is a floor, NOT the footer position. Default `--pad-x` (120/140) already clears it. |

### Preview frame (scale wrapper) — required for in-browser preview

The slide is authored at 1920×1080 but most laptop viewports are narrower. Without a wrapper, the slide overflows horizontally and the footer / right-edge content clips. The fix is a fixed-size frame that clips overflow and a scale transform on the slide itself:

```css
/* Frame: visual size shown to the reader (16:9). Change width to resize. */
.slide-frame {
  width: 1440px;         /* swap to 1200 / 1280 / 1600 as needed */
  height: 810px;         /* MUST equal width × 9 / 16 */
  overflow: hidden;
  position: relative;
  background: var(--paper);
}
.slide-frame.dark { background: var(--ink); }

/* Slide: native 1920×1080, scaled into the frame. */
.slide {
  position: relative;     /* required — footer is absolute inside this */
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  box-sizing: border-box;
  transform: scale(0.75); /* MUST equal frame width / 1920 */
  transform-origin: top left;
}
```

```html
<div class="slide-frame dark">
  <section class="slide dark s-cover" data-slide="1">
    …
    <div class="footer">
      <div class="left">DECK · COVER</div>
      <div class="right">01 / 06</div>
    </div>
  </section>
</div>
```

Rules:
- Frame width × `9 / 16` = frame height. Never break the ratio.
- Scale factor = frame width / 1920. Never edit one without the other.
- Every slide MUST sit inside its own `.slide-frame` — wrapper is per-slide, not per-deck.
- Print bypass below sets `transform: none` and resizes the frame back to 1920×1080 so PDF export stays native.

### Footer & slide number (bug-proof spec)

The footer must be flush with the slide's content column. It is bound to the same `--pad-x` variable that drives every pattern's horizontal content padding, so it can never drift out of alignment.

```css
/* Defined in base-styles.css */
.slide {
  position: relative;          /* required — footer is absolute-positioned */
  overflow: hidden;            /* prevent any descendant overflow */
  box-sizing: border-box;
  --pad-x: 120px;              /* default content-slide horizontal padding */
}
.slide.s-cover,
.slide.s-manifest,
.slide.s-reframe,
.slide.s-close,
.slide.s-close-next,
.slide.s-finale { --pad-x: 140px; }  /* wide patterns */

.slide .footer {
  position: absolute;
  left: var(--pad-x);          /* footer flush with content, NEVER hardcoded */
  right: var(--pad-x);
  bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 500 13px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.10em;
  color: var(--mute);
  pointer-events: none;
}
.slide .footer .left  { text-align: left;  }
.slide .footer .right { text-align: right; }
```

Per-pattern CSS authored on top of `base-styles.css` MUST use `var(--pad-x)` for horizontal padding:

```css
/* Right: content padding tracks --pad-x → footer auto-aligns. */
.slide.s-pillars   { padding: 100px var(--pad-x); }
.slide.s-cover     { padding: 110px var(--pad-x) 140px; }   /* 140 via wide override */

/* Wrong: hardcoded — footer (at var(--pad-x)) won't match. */
.slide.s-pillars   { padding: 100px 120px; }    /* ❌ drifts if you tune --pad-x */
.slide.s-cover     { padding: 110px 140px; }    /* ❌ duplicates wide constant */
```

Rules to avoid the common footer bugs:
- Footer `left` / `right` MUST equal the slide's horizontal content padding via `--pad-x` — never a fixed value. The `60px` figure is a safe-zone minimum, not the footer position.
- Parent `<section class="slide">` MUST be `position: relative` — otherwise the footer escapes to the page root.
- Use a SINGLE `.footer` element with left/right children — never two separately-positioned blocks (they drift on responsive scale).
- Body content uses `padding-bottom: 96px` minimum so the last paragraph never collides with the footer.
- Slide number format: `## / ##` mono, right side. Optional deck title or section label on the left.
- On dark slides, swap `color: var(--mute-dark)`.
- Never paint a background on the footer — it sits transparent over the slide.

### Print / PDF bypass (works with the preview-frame wrapper)

```css
@page { size: 1920px 1080px; margin: 0; }
@media print {
  html, body { background: #FFFFFF; }
  body { padding: 0; gap: 0; display: block; }
  .slide-frame {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    margin: 0;
    overflow: hidden;
  }
  .slide-frame:last-child { page-break-after: auto; }
  .slide {
    transform: none;     /* drop preview scale */
    width: 1920px;
    height: 1080px;
  }
}
```

Backgrounds:
- Light slides: `--paper #F7F7F5`
- Dark slides: `--ink #1A1A1A` (use `.dark` modifier)
- Card surface inside light slide: `--paper-2 #FFFFFF`
- Soft surface for accent zones: `--purple-soft #EEE5FB` or `--purple-card #F1ECF9`

---

## 3. Color System

### Core neutrals
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1A1A1A` | Primary text on light · dark slide bg |
| `--ink-2` | `#0E0E0E` | Reserved deeper black |
| `--paper` | `#F7F7F5` | Default slide bg · text on dark |
| `--paper-2` | `#FFFFFF` | Card surface inside light slide |
| `--mute` | `#6B6B68` | Secondary text · captions · axis labels |
| `--mute-dark` | `#9A9A96` | `--mute` equivalent on dark slides |
| `--rule` | `#E4E3DE` | Hairline rules · dashed dividers · grid lines |
| `--rule-dark` | `#2A2A2A` | Hairline on dark slides |

### Brand accent
| Token | Hex | Use |
|---|---|---|
| `--purple` | `#5E2AAC` | Dash brand accent — eyebrows, key stat highlights, chart primary, bars, callouts |
| `--purple-soft` | `#EEE5FB` | Highlighted-step bg in flow diagrams · soft accent zones |
| `--purple-card` | `#F1ECF9` | Optional accent card surface |
| `--purple-on-dark` | `#B589F0` | Purple replacement on dark slides |

### Semantic
| Token | Hex | Use |
|---|---|---|
| `--success` | `#0F6E56` | Positive tags · "good" column header · winning metric · benchmark callout |
| `--danger` | `#A32D2D` | Negative tags · "bad" column header · failing metric · line-through on old framing |
| `--success-dark` | `#A8E0C8` (lighten as needed) | Success on dark bg |
| `--danger-dark` | `#E8A0A0` | Danger on dark bg (used for warning labels in `.wall`) |

### Co-brand tokens (additive, single-use only)
Add per-deck only when the deck references a specific partner. Each co-brand keyword renders via a `<span class="<brand>">…</span>` wrapper around the literal name:

| Class | Hex | Light-slide treatment | Dark-slide treatment |
|---|---|---|---|
| `.mcd` | `#FFC72C` | `0.6px #1A1A1A` text stroke (`paint-order: stroke fill`) | no stroke |
| `.meta` | `#0866FF` | flat, `font-weight: 800` | use `#4D94FF` for contrast |
| *(new)* | `#…` | follow either pattern based on contrast vs `--paper` | — |

**Co-brand rule**: only wrap the literal brand name. Never paint borders, rules, or icons in a co-brand color.

### Accent rules
- Purple touches **one** element per visual zone (the lede number, the trend line, the active bar, the highlighted step). Never paint multiple elements purple in one block.
- Success/danger reserved for tags, deltas, polarity tables, and reframe slides. Not decoration.
- Co-brand tokens never appear as background, border, or rule color — only on the literal brand word.

---

## 4. Typography

### Families
| Role | Family | Weights |
|---|---|---|
| Display + body | **Plus Jakarta Sans** | 300, 400, 500, 600, 700, 800 |
| Mono / data | **JetBrains Mono** | 400, 500 |

Loaded from Google Fonts. Fallback: `system-ui, sans-serif` and `monospace`.

### Type scale

| Token | Size | Weight | LH | Tracking | Use |
|---|---|---|---|---|---|
| `mega` | 240 | 800 | 0.90 | -0.05em | Finale single word (Q&A, THANKS) |
| `cover` | 108–116 | 800 | 0.96 | -0.04em | Cover headline |
| `title-xxl` | 108 | 800 | 0.98 | -0.035em | Statement headline |
| `title-xl` | 76 | 800 | 1.02 | -0.03em | Closing headline |
| `title-lg` | 60–64 | 700 | 1.05 | -0.025em | Strategic-slide H1 (Core Problem variant) |
| `title-md` | 44 | 700 | 1.10 | -0.02em | Data-slide H1 (Recap variant) |
| `title-sm` | 38 | 700 | 1.15 | -0.02em | Subsidy / pillar card H2 |
| `lede` | 28 | 400 | 1.40 | — | Subtitle below H1 |
| `lede-strong` | 32 | 500 | 1.40 | -0.01em | Insight / framing paragraph |
| `body` | 20–22 | 400 | 1.55 | — | Body copy · column bullets |
| `body-sm` | 17 | 400 | 1.55 | — | Card body · captions |
| `stat-xxl` | 140 | 800 | 0.90 | -0.04em | Manifesto numbers |
| `stat-xl` | 96 | 800 | 0.95 | -0.035em | Hero stat |
| `stat-lg` | 64–80 | 800 | 1.00 | -0.03em | Inline large stat · "channel" row metric |
| `stat-md` | 44 | 800 | 1.00 | -0.02em | Standard stat-block value |
| `stat-label` | 15 | 600 | — | 0.18em, UPPER | Stat caption |
| `eyebrow` | 14 | 600 | — | 0.22em, UPPER | Section eyebrow (mute or purple) |
| `eyebrow-lg` | 18–24 | 600–700 | — | 0.28em–0.30em, UPPER | Manifesto eyebrow · old/new labels |

### Headline-size choice by deck purpose
| Deck type | Default H1 size |
|---|---|
| Data recap (charts, tables, stat-heavy) | `title-md` 44 |
| Narrative / strategic memo | `title-lg` 60–64 |
| Section opener / pillar slide | `title-xl` 76 |
| Cover | `cover` 108–116 |
| Finale single-word | `mega` 240 |

Headline letter-spacing decreases as size grows — never set positive tracking on display type.

**Projected / classroom rooms.** "One baseline per deck" means one *ratio set*, not one fixed px. For a large projected room or classroom, scale the whole baseline up uniformly (e.g. title-md 44 → ~56, lede 28 → ~32, eyebrows 14 → 16, mono footnotes 13 → 16) so the back row can read it — keep the ratios, just size up.

### Quote / manifesto type
- Size: `58px`, weight `500`, leading `1.22`, tracking `-0.02em`.
- `<strong>` lifts to weight `700` ink-colored.
- `<em>` (treated as emphasis, not italic) → weight `700`, `--purple`.

### Insight paragraph (`lede-strong`, 32px)
- Used for the framing sentence right under strategic-slide H1.
- Inline emphasis via:
  - `<b>` → weight 700, `--purple`
  - `<span class="not">` → weight 700, `--danger`
  - `<span class="ok">` → weight 700, `--success`
  - `<span class="pur">` → weight 700, `--purple`

### Mono usage
JetBrains Mono is reserved for:
- Slide numbers (`13px / 0.10em`)
- Date / meta / author strings (`13–18px / 0.05em`)
- Chart axis labels (`12–13px / 0.04–0.05em`)
- Annotation captions and bar values (`11–15px / 0.04em`)
- Card meta-rows: `<NUM> · <CAT>` pattern (`11–15px / 0.20–0.22em UPPER`)
- Channel/row labels in comparison tables (`14px / 0.22em UPPER`)

Never set body copy in mono.

---

## 5. Deck Identifier (text wordmark + logo)

The deck identifies through tracked uppercase wordmark **text** and the **Dash logo** (top-right, every slide). Both are chrome — they never compete with the single purple accent in the content zone, and every slide must still read with them removed.

### The logo (top-right, every slide)
Drop `<div class="dash-logo"></div>` as the **first child** of each `<section>`. The `.dash-logo` rule in `base-styles.css` embeds the logo **once** as a CSS `background-image`, with a light variant (dark wordmark, for light slides) and a `.slide.dark` variant (paper wordmark), the purple bolt-D preserved in both. Rules:
- Embed **once** via CSS — never an inline `<img>` per slide (a 21-slide deck went 4 MB → 150 KB by switching to `background-image`).
- The bundled glyph is brand-neutral ("DASH") and serves both Dash Electric and Dash Express.
- To swap a new source: trim to the glyph, transparent background, scale to ~120px tall before base64. Build the dark variant by recoloring dark ink → paper and dropping the white anti-alias halo to transparent.

### Variant A — Full wordmark (cover / closing)
```html
<div class="wordmark"><strong>DASH ELECTRIC</strong> · DECK SYSTEM</div>
```
- Plus Jakarta Sans, `22px`, tracking `0.28em`, UPPER, line-height `1`.
- `<strong>` segment weight `700`; remainder weight `400`.
- Color: `--ink` on light, `#DDDDD9` on dark.

### Variant B — Inline dot identifier (header chip / footer)
```html
<div class="mark"><span class="dot-mark"></span>Deck Name</div>
```
- 10×10 `--purple` dot + tracked uppercase text.
- 15px / 700 / 0.25em.
- Use as top-left identifier on narrative cover or as small footer chip.

### Co-brand line on cover/closing
```html
DECK NAME &nbsp;·&nbsp; <span class="mcd">McDONALD'S</span>
```
Rendered as eyebrow (14px / 0.22em UPPER, `--mute` on light · `--mute-dark` on dark). Co-brand span follows §3 co-brand rules — literal name only.

---

## 6. Layout Pattern Library

All slides are `1920×1080` sections. Pick by **slide purpose**, not by slide number. Each pattern lists its CSS grid spec and when to use it.

### 6.1 Cover (dark) — `S-COVER-DARK`
```
grid-template-rows: auto 1fr auto
padding: 110px var(--pad-x) 140px   /* wide pattern → --pad-x = 140 */
```
- Top: tracked eyebrow (deck title or co-brand line) OR Variant-B dot identifier.
- Center: display headline (108–116px / 800 / -0.04em / 0.96 lh). Max-width 1500px. One purple-on-dark accent span.
- Bottom: meta row — wordmark text left (Variant A), mono date/author right.

### 6.2 One-line manifesto — `S-MANIFEST`
```
display: grid; place-items: center; text-align: center
padding: 80px var(--pad-x); wrap max-width: 1500px   /* wide pattern → --pad-x = 140 */
```
- Large tracked eyebrow (24px / 0.30em).
- Quote (58/500/-0.02em). Use `<strong>` for hard ink, `<em>` for purple key term.
- Optional sub (22/--mute/1.5 lh) under, max 1100px.

### 6.3 Two-column metric table — `S-METRIC-TABLE`
```
grid-template-columns: 1fr 1fr
border-top + border-bottom: 1px --rule
columns separated by 1px --rule
column padding: 32–40px / 48px
```
Per column:
- Header: title (24/700) left + tag (12/700/0.22em UPPER, success or danger) right.
- Rows separated by `1px dashed --rule`.
- Row layout: `1fr auto` — `k` (15/--mute) bottom-aligned left, `v` (44/800/-0.02em) right.
- Hero row bumps `v` to `64–80px`. Sub-caption mono 13px under value, right-aligned.

Use for side-by-side data comparison (McD vs Non-McD, Spend vs Conversion).

### 6.4 Two-column qualitative comparison — `S-COMPARE-QUAL`
```
grid-template-columns: 1fr 1fr; gap 72px
```
- Each column: tracked UPPER eyebrow tinted success or danger (`● At McD` / `● At Non-McD`).
- Visual device on top (e.g. `.dotbox`, illustration, mini chart).
- Bullet list, 22px/1.5 lh, separated by `1px --rule`.
- Closing `li.eq` row in success/danger color, weight 700.
- Foot tagline (24/500) under both columns with `<em>` purple emphasis.

Use when the contrast is conceptual, not numeric.

### 6.5 Subsidy / pillar pair — `S-PILLARS`
```
grid-template-columns: 1fr 1fr; gap 80px
```
- Each pillar: 72×72 outline-circle icon (2px ink stroke) + small UPPER eyebrow + H2 (38/700) + bullet list.
- Foot tagline (24/500/italic-no with `<em>` purple).

Use for revealing the "two finite subsidies behind the metric" or any two-pillar argument.

### 6.6 Linear flow with terminal "wall" — `S-FLOW-WALL`
```
grid-template-columns: 1.05fr 1fr; gap 90px
```
Left:
- Eyebrow + headline + tag/insight paragraph at bottom.

Right (flow):
- Vertical stack of `.step` cards (20/1.35) with `↓` arrows between.
- One `.step.highlight` (purple-soft bg, purple border) marks the breaking step.
- Terminal `.wall` block: dark ink bg, paper text, tracked tiny red warning label + 32/800 outcome + mono caption.

Use for causation chains ending in a forecast / detonator.

### 6.7 Reframe (old → new) — `S-REFRAME` (dark recommended)
```
grid-template-rows: auto 1fr; gap 50px
```
- H1 in paper.
- "Old framing" label (18/0.30em UPPER mute-dark) + 44/600 mute-dark text with `text-decoration: line-through; text-decoration-color: --danger; thickness: 3px`.
- "New framing" label (18/0.30em UPPER purple-on-dark) + 46/700 paper text. Bold key segments in purple-on-dark.
- Bottom row: 4-up `.imp` (implications) grid with mono `01 / IMPLICATION` numbers + 20/1.5 lh body.

Use when you need to retire a stakeholder's mental model before introducing yours.

### 6.8 Channel comparison rows — `S-CHANNEL-ROWS`
```
grid-template-rows: 1fr 1fr 1fr; border-top: 1px --rule
each row: grid-template-columns: 300px 1fr 240px (or 300px 1fr for implication row)
```
- Left col: mono `CH 01 · NAME` + 24/700 short name.
- Middle: 24/1.5 desc with bold key terms.
- Right: 72/800 stat colored success or danger + tracked UPPER label below.
- Implication row spans wider, foregoes the stat column, uses 24/500 body with purple bold.

Use for "two channels with the same goal, different outcomes" stories.

### 6.9 3-up / 4-up card grid — `S-CARDS-N`
```
grid-template-columns: repeat(N, 1fr); gap 20–28px
```
Card surface options:
- Default: `--paper-2` bg, `1px --rule` border.
- Accent: `--purple-card` bg, `1px #D9C8F4` border.
- Dark: `--ink` bg + paper text + `--ink` border.
- Dashed (assumption cards): `1px dashed #BFBDB4` border, `#FBFBF9` bg.

Card anatomy (text-only — no images, no photos):
- Mono `BET 01` / `ASK 01` / `Q1 · TOPIC` (15/0.20–0.22em UPPER, color = purple on default · purple-on-dark on dark cards).
- Optional outline stroke icon top-right (24×24, §9.1) — purely decorative, never required.
- Label (14/0.20em UPPER mute).
- H3 (28/700/-0.015em).
- Description (19/1.55 ink).
- Key-value grid (`grid-template-columns: 74–84px 1fr`): k (13/700/0.16em UPPER mute), v (15–18px ink, `<b>` bold).
- Foot tag: mono 14px `--mute`, top-aligned `1px dashed --rule` border.

Use for `Bets`, `Asks`, `Unknowns`, `Features`, `Variants`, `Principles` — anything that decomposes into 3–4 parallel ideas expressed in words.

### 6.10 Multi-column outcome comparison — `S-OUTCOMES-N` (dark)
```
grid-template-columns: 1fr 1fr 1fr (or 2)
border-top + border-bottom: 1px --rule-dark
columns separated by 1px --rule-dark
```
Per column:
- Header block: mono UPPER tag (12/0.25em) tinted per column (mute-dark / purple-on-dark / danger-dark) + 24/700 title.
- Bullet list with leading mark `—` (status-quo / mute) or `→` (path A/B / accent), gap 12px, 18/1.45.
- Bold pull-words inside bullets via `<b>`.

Bottom tagline block: small UPPER 0.28em accent label + 38/700/-0.025em statement.

Use for "Status Quo vs Path A vs Path B" or any "if we do nothing vs if we do X" closing.

### 6.11 Assumption / open-question grid — `S-UNKNOWNS`
Same skeleton as 6.9 with dashed-border cards. Anatomy:
- Oversized `?` glyph (42/300 / `#BFBDB4`) top-left.
- Mono `Q1 · TOPIC` UPPER label.
- 22/600/-0.01em question in quotes.
- kv grid: Method, Effort, Stakes, Owner.

Highlight one card with purple border + `#F5EEFF` bg if it's the cross-functional ask.

### 6.12 Funnel — `S-FUNNEL`
```
grid-template-columns: repeat(5, 1fr); border-top + border-bottom 1px --rule
each stage: padding 36px 28px; border-left 1px --rule (except first)
```
Per stage:
- Mono UPPER `01 · STAGE` purple (11/0.22em).
- Name (22/700).
- Value (56/800/-0.03em).
- Conv line: mono 13px mute.
- Optional desc (13/1.5 mute).
- Bottom progress bar: 4px purple, width = relative share.

### 6.13 Feature recap (text-only) — `S-FEATURE-LIST`
```
grid-template-columns: 1fr; gap 32px
padding: 90px var(--pad-x)   /* content pattern → --pad-x = 120 */
```
A wording-only replacement for the old image-paired feature recap. Use when listing 3–6 features, creative variants, or product slices without screenshots.

Per row (`grid-template-columns: 80px 1fr 240px`, 28px gap, `1px --rule` top border):
- Mono index: `01` / `02` (24/700/0.10em UPPER purple).
- Text block:
  - Meta row mono 11px UPPER `0.22em`: `<cat purple> · <sep rule> · <surface mute>`.
  - Title 24/700/-0.015em ink.
  - One-sentence body 17/1.55 `--mute`, ≤ 22 words.
- Right column (optional outcome / metric): UPPER label 12/700/0.20em mute + value 28/800/-0.02em ink (`.win` purple · `.bad` danger).

Use for feature recaps, creative variants, product launches when no imagery is available or wanted.

### 6.14 Chart slide — `S-CHART-LINE` / `S-CHART-BAR`
```
grid-template-rows: auto auto auto 1fr auto
padding: 90px var(--pad-x)   /* content pattern → --pad-x = 120 */
chart SVG: viewBox 1680×400, preserveAspectRatio xMidYMid meet
```
- Stack: eyebrow → H1 (44/700) → lede (22/400) → optional small UPPER chart-title → chart → stats-row (3-col, 32px gap, top border 1px --rule, 22px padding-top).
- Stat block: label (12/700/0.20em UPPER purple) → val (44/800/-0.02em) → desc (14/--mute/1.5 lh).

Chart specifications in §7.

### 6.15 Editorial data table — `S-DATA-TABLE`
```
border-top: 1px --ink; border-bottom: 1px --rule
head: 6-col grid, 18px padding, 12/700/0.18em UPPER mute, border-bottom 1px --rule
row: same grid, 1px dashed --rule top border, first row none
```
- First col 2.2fr: segment name (20/700) + mono tag below (11/0.10em UPPER mute).
- Numeric cols 1fr each, right-aligned: val (24/800/-0.015em ink). `.win` tints purple, `.bad` tints danger.

Use for audience breakdowns, channel performance, cohort tables.

### 6.16 Finale single-word — `S-FINALE` (dark)
- Single `mega` (240/800/-0.05em) word in paper.
- Subhead 32/-/-/1.4 mute-dark, max 900px.
- Top-left Variant-B dot identifier (text only). Bottom-row meta with wordmark text + "Thank you".

### 6.17 Closing with next steps — `S-CLOSE-NEXT` (dark)
```
grid-template-rows: auto 1fr auto; padding 110px 140px
```
- Top eyebrow purple-on-dark.
- Centered H1 (76/800/-0.03em) paper. Accent span in purple-on-dark.
- Sub (28/400/1.40 lh, opacity 0.85).
- Optional 3-up next-list (border-top 1px --rule-dark, mono UPPER `NEXT · 01` purple-on-dark + 22/700 title + 14/1.5 mute-dark desc).
- Bottom meta row mirrors cover.

### 6.18 Composing new layouts (when no §6 pattern fits)

The §6 pattern library is a **starting point, not a closed list.** When a slide's purpose has no fitting §6 pattern (e.g. a timeline, a dense matrix, a 5-way comparison grid, an uncovered structural shape), the skill MAY compose a new layout — provided it is built entirely from the locked foundation. Two layers are explicit and they are NOT interchangeable:

| Layer | Status | What it covers |
|---|---|---|
| **Foundation / Style** | **LAW — never improvise** | Everything in §2 (canvas, `--pad-x`, footer, print bypass, slide-frame), §3 (color tokens), §4 (type families + scale), §7.5 (universal chart rules), §9 (icons), §13 (voice / copy). Tokens, fonts, type scale, hairlines vs boxes, mono usage, accent rules, chart constraints, icon system. |
| **Layout** | **FLEXIBLE — composable** | The §6 patterns. New arrangements (grids, columns, row structures) are allowed when none fits. |

A new layout is a **new arrangement of compliant parts**, never new style.

**Mandatory rules for any composed layout:**
- Reuse the existing tokens, type scale (§4), spacing logic (`--pad-x`, vertical padding range), hairline rules (`1px --rule` / `--rule-dark`), footer, and the slide-frame wrapper from `base-styles.css` verbatim.
- Pass the §15 Do / Don't checklist exactly like any built-in pattern.
- MUST NOT introduce: new colors, gradients, fills, shadows, emoji, photographic imagery, rounded chart bars, mono body copy, or a second simultaneous accent.
- If content seems to "need" any of the above, **simplify the content, do not break the style.** Numbers carry the message; chrome stays out of the way (§1).

**Reading order when composing:**
1. Foundation first — `base-styles.css` (slide root, `--pad-x`, footer, print bypass).
2. Nearest §6 pattern next — for spacing rhythm, hairline rules, eyebrow/headline/lede stack, vertical padding range. State explicitly which pattern you derived the rhythm from.
3. Improvise the arrangement on top — new grid template, new row structure, new column count, etc. Only the arrangement is new.

**Auditability:** When you compose a new layout, briefly note in the deck file (a comment near the slide) which §6 pattern its rhythm derived from and what was improvised, so a future reader can audit.

**Guardrail:** Flexibility is **arrangement only**. Every visual primitive still comes from the foundation. A composed layout that introduces any non-compliant style element is a failure — not a stylistic variant.

### 6.19 Grid track invariant (applies to every pattern)

**GRID TRACK RULE:** a `.pad` (or any slide-body wrapper) using `display: grid` must have a row-track count equal to its direct-child count. The single `1fr` track sits on the **primary content row** (table / chart / split body), **never** on `eyebrow` / `h1` / `lede`.

Standard mappings:

| Direct children | `grid-template-rows` |
|---|---|
| eyebrow + h1 + body + foot (4 children) | `auto auto 1fr auto` |
| eyebrow + h1 + lede + body + foot (5 children) | `auto auto auto 1fr auto` |
| eyebrow + h1 + lede + body (4 children, no foot) | `auto auto auto 1fr` |
| eyebrow + body (cover etc., 2 children) | `auto 1fr` |

**Symptom of the bug:** a dead vertical gap above the table/chart/body, because the `1fr` track landed on the lede instead of the content. **Fix:** add the missing `auto` so the `1fr` lands on the content row.

**Exception:** cover slides that intentionally vertical-center the `h1` in the `1fr` track (`S-COVER-DARK`). Manifest slides using `place-items: center` are also exempt because they don't depend on the explicit grid template.

### 6.20 Table row cap (no-compress rule)

**TABLE ROW CAP:** an editorial data table targets **≤ 9–10 rows** (including header and totals). If the source data has more, **do NOT shrink row padding below the base** to cram everything in. Curate instead:

1. **Keep the rows that carry the story** — rank by volume, materiality, or whatever metric the slide is arguing from. Drop the rest visually.
2. **Roll the long tail into a single `Others` row** — sum its volume. If the blended rates would mislead (because the tail is too small or too noisy), set the rate cells to `—` (em-dash, `--mute`).
3. **Or split across two slides** — never let "fit on one slide" force a padding override.
4. **Honour any source threshold** explicitly stated in the data ("tail <N orders is noisy", "stores <X visits dropped", etc.) by rolling up at that exact cutoff.

A per-table padding override below the table base (e.g. `.t-foo .trow { padding: 6px 0 }` when base is `10px`) is a **smell** that the table is over-stuffed. Remove the override, curate the rows.

Always add a footnote when you roll up: `"Tail <N rolled into Others — rates too noisy to show."` Honest about the curation.

### 6.21 Speaker intro — `S-SPEAKER`
```
grid-template-columns: 620px 1fr; gap 96px; padding 96px var(--pad-x); align-items: center
```
Left: `.photo-box` portrait (4:5, §9 Photos) or the dashed placeholder. Right: `YOUR SPEAKER` eyebrow → name (`cover`, drop to ~64px for long names) → role line (28/600/`--purple`, "Role · Dash Electric") → a hairline-topped block that is **either** a 3-row fact list (Now / Before / Span, `grid-template-columns: 230px 1fr`) **or** an experience ledger (rows of `200px 1fr`: mono date → company `23/700` + `— role` mute + one-line highlight). The current role's date is purple; the rest mute. Cap the ledger at 4–5 rows — more → use `S-TIMELINE`.

The only slide that carries a photo. Opens a personal talk / war-story (Recipe E).

### 6.22 Career / phase timeline — `S-TIMELINE`
```
display: flex; flex-direction: column; padding 96px var(--pad-x)
content in a flex:1 / justify-content:center wrapper
```
Eyebrow + H1 + lede, then `.tl` (a `repeat(3,1fr)` grid with a 2px top axis). Each `.stop`: a node dot on the axis (`::before`), mono `.dur`, big `.co` company / phase, `.role`, one-line `.sub`. The current stop gets `.now` (purple dot + purple name) — the single accent. Group two short roles into one stop (`GOTOKO → AstraPay · 1.5 yrs`) rather than crowding the axis. Mono footnote at the base.

Use for a career arc or any 3-phase chronology too long for the `S-SPEAKER` ledger.

### 6.23 Qualitative comparison, text lists — `S-COMPARE-COLS`
```
.cmp grid: 1fr 1fr; gap 80px; under a 1px --rule top border, in a vertical-center wrapper
```
The text-list sibling of `S-COMPARE-QUAL` (§6.4) — no dotbox device, just two lists. Each column: a `.ctag` (`.bad` / `.ok` / `.pur` / `.neu`) `●` header, then `.clist` bullets (`—` neutral / problem, `→` forward / solution) split by dashed hairlines, ending in an optional bold `.eq` takeaway. Mono footnote at the base.

Use for Gojek-vs-Dash, Problem-vs-Solution, OK-in-Year-1-vs-Not — conceptual contrasts that don't need the concentration / dispersion visual.

### 6.24 Incident / war-story — `S-INCIDENT`
```
grid-template-columns: 1fr 1.1fr; gap 80px; padding 96px 110px; align-items: center
```
Left: eyebrow (`WAR STORY 01 · …`) + punchy title + lede + a `.stat-block` pair (build / kill, etc.). Right: a centered `.flow` — `.step` (Built) → `↓` → terminal block, ending in either a dark `.wall` (failure, `⚠`) **or** a purple `.wall.win` (success, `✓`); add a `.step.fixed` resolution step for the "what we added" layer. `align-items: center` kills the dead-space-then-stranded-footnote problem.

Repeat across incidents as a **recurring segment** — the consistent Built→Broke→Fixed rhythm reads as a series, not monotony. The spine of Recipe E.

### 6.25 Layered architecture diagram — `S-ARCH`
```
display: flex; flex-direction: column; padding 88px var(--pad-x)
inline SVG fills a flex:1 region (viewBox ~1680×580); optional compact stat strip below
```
Each infrastructure layer is its own hairline rounded-rect (`.archzone`) with a small mono layer label (`.zlabel` — CLIENT / EDGE / SERVICES / DATA / INFRA); components sit inside as text or mini-boxes (`.archbox`). **One accent only:** tint the *new* layer (`.archzone-accent` + `.zlabel-accent`) — it tells the evolution story. Split the canvas with a dashed vertical rule for "Day 1 | Today"; captions (`.archcap`) carry the repo / scale count.

The sanctioned diagram exception (§1): hairline-bordered, never shadowed, one accent. Optional in a technical Recipe E talk.

---

## 7. Charts & Data Viz

### 7.1 Line chart
- Primary series: `--purple` stroke, **3.5px**, `linecap round`, `linejoin round`. Solid path.
- Secondary series: `#9A9A96` stroke, **2px**, `stroke-dasharray 6,5`.
- Data dots: filled, radius 5 (primary) / 4 (secondary). Endpoint emphasis: radius 6.5 with `#FFFFFF 1.5px` halo.
- Point labels: mono 13px / 600 / color matches its series. Endpoint label weight 700.
- Y-grid: 4 horizontal lines at quartile values, `1px --rule`.
- X-axis baseline: `1.5px --ink`.
- Axis labels: mono 13px `--mute`, `0.05em` tracking.
- Week / period labels: sans 14px / 700 / ink; date below mono 12px / `--mute`.
- Legend top-right inline: stroke swatch + dot + label. Active series ink. Reference series mute.

### 7.2 Bar chart
- Bar fill: `--purple`. Partial / projected bar: same purple at `fill-opacity 0.45`.
- Bar width 80px, equal spacing.
- Bar value: mono 13px / 500 purple, centered above bar.
- Peak bar gets `bar-value-peak`: mono 15px / 700 ink. One anchor per chart.
- Annotation: 1px ink line + sans 16/600 ink pull-quote + mono 13px mute caption.
- Partial-period treatment: italic mono 11px `#9A8DC0` for both bar value and the date row, plus `· partial` tag on the axis.

### 7.3 Dot cluster (`S-COMPARE-QUAL` visual)
- Box: 100% width × 120px, `1px dashed --rule`, bg `#FDFDFB`.
- "Hub" dot: 14×14, `--success`, centered. Surrounding 6 dots: 6×6 ink, clustered ±10% of center.
- Distributed version: 12 dots scattered across full box, no hub.
- Used to show "concentration" vs "dispersion" at a glance.

### 7.4 Funnel (§6.12)
- Single color (`--purple`) for progress bar, varying width per stage.
- Numbers in stat-lg, conv % in mono.

### 7.5 Universal chart rules
- Always `viewBox` + `preserveAspectRatio` so SVG scales without padding hacks.
- One series gets weight; everything else recedes (`--mute` / dashed / lighter).
- No legends inside the plot area — top-right inline or omit when single-series.
- Never round bars. Never use gradients on lines or bars.
- One annotation max per chart.

---

## 8. Eyebrows, Tags, Markers

| Element | Spec |
|---|---|
| Eyebrow (default) | 14 / 600 / 0.22em UPPER / `--mute` |
| Eyebrow (purple) | same, `--purple` (or `--purple-on-dark`) |
| Eyebrow (oversized manifesto) | 24 / 600 / 0.30em UPPER / `--mute` |
| Eyebrow with separator | `EYEBROW &nbsp;·&nbsp; SUB-EYEBROW` (non-breaking space + middot) |
| Stat label | 12 / 700 / 0.20em UPPER / `--purple` |
| Column tag (success / danger / purple) | 12 / 700 / 0.22em UPPER, with leading `● ` glyph |
| Slide number | mono 13 / 0.10em / `--mute`, format `## / ##` |
| Footer line | mono 13 / 0.10em / `--mute`, bottom-left |
| Card meta | `<num purple> · <sep rule> · <cat mute>` mono 11 / 0.22em UPPER |
| Channel row label | mono 14 / 0.22em UPPER + 24/700 short name beneath |
| Old-framing label | 18 / 700 / 0.30em UPPER / `--mute-dark` |
| New-framing label | 18 / 700 / 0.30em UPPER / `--purple-on-dark` |

Separators: prefer `·` (middot) over `|` or `—` for inline meta. Use `&nbsp;·&nbsp;` so the dot never wraps alone.

---

## 9. Iconography

Single icon system. Icons are always optional — every slide must read without them.

### 9.1 Outline stroke icons
- Source: hand-drawn `<svg>` with `stroke="currentColor"`, `stroke-width="1.6–1.8"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Sizes:
  - 36×36 inside a 72×72 circle (`2px --ink` border) — for pillar / subsidy cards.
  - 36×36 inline at top-right of `S-CARDS-N` card — color `--purple`.
- Color rule: `currentColor` only. Border circle inherits ink on light, paper on dark.

No icon fonts. No emoji. No filled / colored / shadowed icons. **Two image uses are sanctioned, and only two:** the brand **logo** as top-right chrome (§5) and **speaker portraits** on the `S-SPEAKER` slide (Photos, below). No other photographic imagery — never on data, chart, reframe, or comparison slides.

### Photos (speaker slides only)
The core layouts stay text-first. The single content-photo use is the speaker portrait on `S-SPEAKER`:
- Embed as `background-image` on a fixed-ratio box (`.photo-box`, `aspect-ratio: 4/5`) with `background-size: cover; background-position: center top` — never an `<img>` that stretches.
- Crop to 4:5 on the subject *before* embedding; downscale to ~720×900 and JPEG-compress.
- **Grayscale portraits suit the monochrome-plus-purple palette best**; full color is fine on a clean / white backdrop.
- Before the real photo exists, use the dashed `.photo-box.placeholder` (centered `ADD PHOTO` label).

### Bullet glyphs
- `●` — column tags only (success / danger / purple).
- `—` — status-quo / problem bullet (`S-OUTCOMES-N`, `S-COMPARE-COLS`).
- `→` — forward-looking / solution bullet (`S-OUTCOMES-N`, `S-COMPARE-COLS`).
- `↓` — flow arrows in `S-FLOW-WALL` / `S-INCIDENT`.
- `?` — open-assumption mark in `S-UNKNOWNS`.
- `⚠` — failure wall label.
- `✓` — win wall label (`S-INCIDENT` success arc).

---

## 10. Motion

Static deck. No animation. No hover. No scroll effects. The deck is meant to read like a printed report.

If the host uses `deck-stage.js` (custom element with arrow-key navigation), restrict it to slide-to-slide pagination — no per-element animation.

---

## 11. Print / PDF Export

Canonical print bypass — pairs with the preview-frame wrapper from §2. Drops the preview scale, resizes the frame back to native, exports one page per slide.

```css
@page { size: 1920px 1080px; margin: 0; }
@media print {
  html, body { background: #FFFFFF; }
  body { padding: 0; gap: 0; display: block; }
  .slide-frame {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    margin: 0;
    overflow: hidden;
  }
  .slide-frame:last-child { page-break-after: auto; }
  .slide {
    transform: none;   /* drop the preview scale */
    width: 1920px;
    height: 1080px;
    box-shadow: none;
  }
}
```

- Each `<div class="slide-frame">` (wrapping a `<section class="slide">`, or `<deck-stage> > section`) = one page.
- No bleed; the paper color paints to the edge inside each slide.
- Web preview shows scaled slides stacked on `#000` with 24px gap — print strips both.
- If using `<deck-stage>`, the same `transform: none` rule applies to its inner `<section>`.
- **Dark backgrounds must print.** Browsers drop background-color from PDF by default. `base-styles.css` sets `print-color-adjust: exact` on `*` so `.dark` slides and `.wall` blocks stay solid in the exported PDF. Don't remove it.

---

## 12. Runtime Conventions

### 12.1 Plain HTML deck
- Each slide = `<div class="slide-frame [dark]"><section class="slide [dark] s-<pattern>" data-slide="N">…</section></div>` (wrapper per §2).
- Stack the frames directly under `<body>`.
- Scroll-paginate; use browser print-to-PDF.

### 12.2 deck-stage custom element
- Wrap slides in `<deck-stage>…</deck-stage>` and load `deck-stage.js`.
- Each `<section data-screen-label="01 Cover">` gets arrow-key navigation, focus mode, presenter view.
- Place speaker notes inside `<script type="application/json" id="speaker-notes">[ "note 01", "note 02", … ]</script>` — array index 0 = slide 1, etc.

### 12.3 Speaker-notes voice (when used)
- First-person plural ("we / us") — direct, no corporate softeners.
- One paragraph per slide, no bullet points.
- Includes pause cues ("Pause here", "Let the number land").
- Calls out the aha moment, the counter-objection, and the answer.

---

## 13. Voice & Copy

- **Numbers first, words second.** "10,897 completed deliveries." not "Nearly eleven thousand orders."
- **Concrete time + scope on every claim.** Footnote period on every stat slide.
- **Co-brand mark sparingly.** Only on the literal brand name in headlines / eyebrows, not in body sentences.
- **Eyebrows frame; titles deliver.** Don't repeat the eyebrow in the title.
- **No hype words.** "Amazing", "incredible", "best-in-class" forbidden. Let the delta carry weight.
- **Direction in numbers, not adjectives.** "−63%" not "huge reduction".
- **Hedge partial data visibly.** Italic mono `#9A8DC0` for partial-week / projected values, plus `· partial` tag.
- **Strategic decks**: lead with the *reframe*, not the data. Title = the new framing. Insight paragraph = the why. Data slides come after.
- **Honest uncertainty.** Always include an `S-UNKNOWNS` slide on strategic decks. Stakeholders respect the person who admits "I don't know".
- **Internal voice**: formal but direct — "we / us / partner / operator". Avoid corporate softeners ("we are delighted to", "valued stakeholders"). This applies to speaker notes and any first-person framing in body copy.

---

## 14. Reusable Patterns (HTML snippets)

### Pattern A — Eyebrow + Headline + Lede
```html
<div class="eyebrow purple">PERFORMANCE &nbsp;·&nbsp; WEEKS 1–8</div>
<h1>Two metrics that matter to <span class="mcd">McD</span>.</h1>
<p class="lede">Short sentence connecting the eyebrow to the numbers below.</p>
```

### Pattern B — Hero stat row (table)
```html
<div class="row">
  <div class="k">Total deliveries</div>
  <div class="v hero">10,897</div>
  <div class="sub">8 weeks · McD on-demand</div>
</div>
```

### Pattern C — Feature row (text-only)
```html
<div class="feature-row">
  <div class="num">01</div>
  <div class="text-zone">
    <div class="meta-row"><span class="cat">PORTAL</span><span class="sep">·</span><span class="surface">WEB</span></div>
    <h3>Feature name.</h3>
    <p>One-sentence value statement, ≤ 22 words.</p>
  </div>
  <div class="outcome">
    <div class="label">ADOPTION</div>
    <div class="val win">+34%</div>
  </div>
</div>
```

### Pattern D — Stat block (chart-slide footer)
```html
<div class="stat-block">
  <div class="label">DASH AVAILABLE</div>
  <div class="val">13,585</div>
  <div class="desc">One-line definition · time scope</div>
</div>
```

### Pattern E — Bet / Ask card
```html
<div class="card">
  <div class="num">BET 01</div>
  <h3>Learn how RTFM works</h3>
  <div class="kv">
    <div class="k">Duration</div><div class="v"><b>2 weeks</b></div>
    <div class="k">Action</div><div class="v">…</div>
    <div class="k">Output</div><div class="v">…</div>
  </div>
</div>
```

### Pattern F — Reframe (old / new)
```html
<div>
  <div class="old-label">Old framing</div>
  <div class="old">"The allocation system is broken, we need to fix it."</div>
</div>
<div>
  <div class="new-label">New framing</div>
  <div class="new">
    The allocation system <b>was never built</b> for 96% of the business…
  </div>
</div>
```

### Pattern G — Flow step + wall
```html
<div class="step">Allocation system designed for one pattern…</div>
<div class="arrow">↓</div>
<div class="step highlight">Operator burns out…</div>
<div class="arrow">↓</div>
<div class="wall">
  <div class="w1">⚠ Capacity Ceiling</div>
  <div class="w2">Breaks as volume grows</div>
  <div class="w3">not a cycle — a detonation</div>
</div>
```

### Pattern H — Outcomes comparison column
```html
<div class="col jA">
  <div class="h">
    <div class="tag">● PATH A · PRODUCT DOMAIN</div>
    <div class="t">Execute 3 bets</div>
  </div>
  <ul>
    <li><span class="mk">→</span><span>SLA met <b>5% → 25%+</b></span></li>
    …
  </ul>
</div>
```

---

## 15. Quick Do / Don't

| Do | Don't |
|---|---|
| One purple anchor per slide | Paint half the slide purple |
| Hairline `--rule` dividers | Box-shadowed cards |
| Mono for dates, axis, meta | Mono for body copy |
| `<span class="<brand>">name</span>` token | Hand-color brand names inline |
| Negative tracking on display type | Positive tracking on headlines |
| Footnote period on every metric slide | Float numbers without time scope |
| Italic mono `#9A8DC0` for partial data | Hide partial weeks silently |
| One series carries weight, rest recede | Equal-weight multi-series lines |
| Reframe slide before data on strategic decks | Open with charts when the framing is new |
| Open-assumption slide on every strategic deck | Hide uncertainty until Q&A |
| Outline stroke icons, currentColor | Filled / colored / shadowed icons |
| Two channels (algo vs manual) shown side-by-side with same metric | Bury the comparison in prose |
| Single-word finale slide for narrative decks | Closing slide with five bullet points |
| Headline size = deck-type baseline (§4) | Mix 44 + 60 + 76 headlines across one deck |
| Every `.pad`: track count == child count; `1fr` on content row, not lede (except cover) (§6.19) | Leave `1fr` on the lede and ship a dead gap above the table |
| No table exceeds ~10 rows via compressed padding; long tails rolled up or split, not crammed (§6.20) | Shrink row padding below the base value just to "fit" |
| Logo top-right, embedded ONCE via CSS `background-image` (§5) | Inline the logo `<img>` on every slide (bloats the file) |
| Photos only on `S-SPEAKER`, `background:cover` on a 4:5 box, grayscale (§9 Photos) | `<img>` that stretches, or any photo on data / chart / reframe slides |
| Diagrams (flow / cards / architecture): hairline borders, one accent (§6.24–§6.25) | Shadowed / gradient-filled / multi-accent diagram boxes |
| Repeat `S-INCIDENT` as a consistent series in a war-story deck | Restyle each incident and lose the Built→Broke→Fixed rhythm |

---

## 16. Deck-Type Recipes

Pick a recipe → assemble from §6.

### Recipe A — Data Recap (e.g. MCD 2-month recap, Meta Ads report)
1. `S-COVER-DARK`
2. `S-MANIFEST` (the three headline numbers)
3. `S-METRIC-TABLE` (two-side metric comparison)
4. `S-CHART-LINE` (efficiency trend with stats-row)
5. `S-CHART-BAR` (volume / spend trend)
6. `S-FEATURE-LIST` (features / creatives shipped, text-only)
7. `S-DATA-TABLE` (segment / audience breakdown)
8. `S-FUNNEL` (end-to-end conversion)
9. `S-CLOSE-NEXT` (3 next steps)

Headline baseline: `title-md` (44).

### Recipe B — Strategic Memo (e.g. Core Problem deck)
1. `S-COVER-DARK` with Variant-B dot identifier + 116px cover headline
2. `S-MANIFEST` (one-liner framing)
3. `S-METRIC-TABLE` (the data that proves the framing)
4. `S-COMPARE-QUAL` (root-cause illustration with dotboxes)
5. `S-PILLARS` (hidden costs / two subsidies)
6. `S-CHANNEL-ROWS` (channel comparison + implication row)
7. `S-FLOW-WALL` (trajectory to break point)
8. `S-REFRAME` (old vs new framing, dark)
9. `S-CARDS-N` (the bets / proposed direction)
10. `S-UNKNOWNS` (open assumptions)
11. `S-CARDS-N` (the asks)
12. `S-OUTCOMES-N` (status quo vs path A vs path B, dark)
13. `S-FINALE` (Q&A, dark)

Headline baseline: `title-lg` (60–64).

### Recipe C — Launch / Pitch
1. `S-COVER-DARK`
2. `S-MANIFEST`
3. `S-COMPARE-QUAL` (problem framing)
4. `S-CARDS-N` (the solution pillars)
5. `S-FEATURE-LIST` (product slices, text-only)
6. `S-CHART-BAR` (market / traction)
7. `S-CARDS-N` (the asks)
8. `S-CLOSE-NEXT`

### Recipe E — Personal talk / war-story (e.g. an engineer's conference talk)
1. `S-COVER-DARK` (talk title; eyebrow = theme)
2. `S-SPEAKER` (photo + name + role + experience ledger)
3. `S-MANIFEST` or `S-REFRAME` (the thesis)
4. `S-ARCH` (the system, if the talk is technical) — optional
5. `S-INCIDENT` ×3–4 (recurring Built→Broke→Fixed segment; the spine of the talk)
6. `S-REFRAME` (the lesson, dark)
7. `S-CARDS-N` (the doctrine / takeaways)
8. `S-FINALE` (single word, dark)

Headline baseline: `title-md` (44), sized up for the room (§4). The repeated `S-INCIDENT` rhythm is the point — consistency reads as a series, not repetition.

### Recipe D — Multi-talk / combined session deck
Two speakers sharing one file (e.g. an intro talk + a deep-dive talk):
1. Build each talk as its own standalone deck first (own cover, own `S-SPEAKER`, own finale).
2. Concatenate the bodies under **one shared `<head>`** — use the richer talk's head; it's a superset of the CSS the other needs.
3. **Renumber continuously**: `data-slide` 1..N across the whole file; every footer `NN / TOTAL`.
4. Keep each talk's own footer-left **section label** so the audience knows which talk they're in.
5. Make the first talk's finale a **handoff** ("Over to the war stories →") into the second cover.
6. Regenerate the combined file from the standalones whenever a standalone changes — never hand-edit both copies.

**Mechanical hazard:** when injecting an element after each `<section>` open tag (e.g. adding the logo), anchor the match on the tag only. A greedy `…</div>` regex will eat the slide's first child. Re-verify section + footer counts after any bulk regex.

---

## 17. File Anchors

- Reference decks (canonical examples):
  - `mcd-2month-recap.html` — Recipe A
  - `meta-ads-report.html` — Recipe A
  - `../Dash/Dash Core Problem Deck.html` — Recipe B
- No image assets required. The system is text-first; if a future deck wants imagery, treat it as a per-deck extension and keep the core layouts text-only.
- Fonts: Google Fonts CDN at runtime. For offline export, self-host Plus Jakarta Sans + JetBrains Mono.
- Runtime helper: `deck-stage.js` (when used) sits beside the HTML; speaker notes live inline as JSON in `<script id="speaker-notes">`.

---

## 18. Versioning

- v1 — extracted from `mcd-2month-recap.html` only.
- v2 — generalized after merging `Dash Core Problem Deck.html`. Adds strategic-memo layouts (reframe, flow-wall, pillars, channel-rows, outcomes, unknowns), icon system, deck-type recipes, runtime conventions, expanded headline scale, co-brand token rule.
- v3 — Standard PPT 16:9 widescreen formalized, footer/slide-number bug-proof spec added (safe-zone + absolute-positioned single `.footer` element). Dash brand mark removed — deck identifier is now text-only (wordmark / dot identifier). Image-dependent layouts removed: `S-PAIR` replaced with text-only `S-FEATURE-LIST`; card pattern is now wording-first with icons strictly optional. Recipes A and C updated accordingly. No external image assets required.
- v3.1 — Added preview-frame wrapper spec to §2: slides authored at native 1920×1080 but rendered into a fixed-ratio `.slide-frame` (default `1440 × 810`, scale `0.75`) so they never overflow narrow laptop viewports. Print bypass updated to drop the scale and restore native 1920×1080 per page. Footer-clip bug at preview time resolved.
- v3.2 — Footer alignment fix. The footer previously sat at a fixed `left: 60px / right: 60px` while each pattern's horizontal content padding was `100–160px`, so the footer hung `40–100px` outside the content column by a different amount each slide. Now the footer's `left`/`right` are bound to a shared `--pad-x` variable (`120px` default for content slides; `140px` for wide patterns: cover, manifest, reframe, close, close-next, finale). Pattern CSS must use `var(--pad-x)` for horizontal padding so the footer is always flush with the content column. `60px` is reclassified as the safe-zone minimum only, not the footer position.
- **v3.3 — current.** Brand default switched to **Dash Electric** (Dash Express on request; tokens unchanged). Five new layout patterns added to §6 — `S-SPEAKER` (§6.21), `S-TIMELINE` (§6.22), `S-COMPARE-COLS` (§6.23), `S-INCIDENT` (§6.24), `S-ARCH` (§6.25) — with their component CSS appended to `base-styles.css` (no example-deck instance; build from the §6 spec + that CSS). Two image uses sanctioned and scoped: the top-right **logo** (embedded once, §5) and **speaker portraits** (`S-SPEAKER` only, §9 Photos); flow / card / architecture diagrams are the sanctioned hairline-border exception (§1). Recipes **E** (war-story / personal talk) and **D** (multi-talk / combined session) added (§16). `print-color-adjust: exact` added so dark slides survive PDF export; `--partial` token added for hedged chart values.

---

## Reference — `examples/dash-core-problem-deck.html`

```html
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Dash Express — Core Problem & Direction</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="deck-stage.js"></script>
<script type="application/json" id="speaker-notes">
[
"Oke, selamat pagi semua. Gua Irfan, dari Product Design. Hari ini gua mau bawa ke kalian analisa core problem Dash Express dan direction solusi yang gua propose. Ini bukan status report — ini strategic thinking. Ujungnya gua butuh approval untuk 2 minggu knowledge capture phase. Tone slide ini sengaja serius — karena yang kita bicarain serius. Gua pelan-pelan aja setup konteks.",
"Sebelum masuk data, gua mau kalian serap satu kalimat dulu. Dash Express sekarang adalah automated delivery service untuk 4 persen volume, dan manual delivery service untuk 96 persen volume. Yang 96 persen itu di-sustain oleh 2 sampai 3 manusia yang kerja 8 sampai 12 jam per hari, dengan allocation latency 89 menit per order. Completion rate 95 persen yang keliatan sehat di dashboard — itu berjalan di atas capacity ceiling yang bakal patah begitu volume tumbuh. Pause di sini sebentar. Biarin ini masuk.",
"Sekarang angka-angkanya. Ini data satu bulan terakhir. Dua realitas paralel di satu bisnis. Kiri McD — benchmark. 8 ribu deliveries, automation 99.9 persen, allocation time 0.04 menit. Kanan, non-McD — 96 persen bisnis kita. Volume dua kali lipat, automation cuma 3.95 persen, allocation time 88.91 menit. 89 menit versus di bawah 1 menit di McD. Completion 95 persen keliatan bagus — tapi gua mau kalian liat angka allocation time itu dulu. Biarin itu sit di ruangan sebentar. Jangan buru-buru kita lanjut.",
"Pertanyaan wajar: kenapa bisa segitu beda? Jawabannya satu baris. Algo allocation kita hanya punya satu dimensi — proximity. Dan proximity doang kebetulan cukup untuk McD, karena mitra camping di outlet. Di McD, terdekat otomatis juga motor fit, whitelist OK, zone match. Proximity sama dengan fit, by coincidence. Di non-McD, order tersebar seluruh kota, mitra ga bisa camping, terdekat tidak sama dengan fit. Algo miss, fallback ke manual, 89 menit. Pause setelah gua bilang 'algo kita hanya punya satu dimensi'. Ini aha moment pertama. McD itu exception, bukan norm.",
"Sekarang yang dashboard tidak tunjukkan. Brand promise 'never reject' itu di-sustain oleh dua subsidi yang finite. Kiri: tenaga manusia. 2 sampai 3 floor monitor, 8 sampai 12 jam per hari. Tujuh ribu allocation per bulan per orang. Hard capacity ceiling — tidak bisa di-scale dengan hire. TikTok Shop tambahan 3000 orders per hari bakal break sistem ini. Kanan: allocation latency. 89 menit rata-rata. Cuma 5.3 persen hit SLA. 'Never reject' kita di-beli dengan 'never on-time'. Completion 95 persen itu bukan kemenangan sistem — itu kemenangan kerja rodi manusia yang nambal automation rusak.",
"Ini counterintuitive insight yang penting. Stakeholder biasanya respon: 'tapi completion 95 persen, kok trust issue?' Jawabannya: trust mitra tidak hilang — tapi pindah channel. Mitra TIDAK distrust Dash. Mitra distrust algo. Mitra trust manual. Bukti: di algo channel, freelance acceptance cuma 10 persen. Fulltime lebih responsif saat dihubungi manusia dibanding assignment algo. Mitra treat algo assignment sebagai opsional. Di manual channel, completion 95 persen. Mitra accept, eksekusi, antar. Implikasinya: ini bukan problem mitra distrust Dash secara umum. Ini problem algo ga pernah earn trust karena ga pernah beneran allocate. Manual work — tapi capped.",
"Dan ini yang bikin urgent. Pola ini bukan loop steady-state. Ini divergence. Algo di-design untuk satu pattern. 96 persen volume harus di-absorb manual. Mitra develop trust ke manual, abaikan algo. Algo makin irrelevant, makin ga di-iterate. Gap algo versus manual makin lebar. Manual capacity makin stretch. Floor monitor burnt out. Exception accumulate. Dan di ujungnya: scale wall. Ini trajectory menuju patah, bukan siklus. TikTok Shop 3000 orders per hari — itu detonator.",
"Jadi apa core problem-nya. Framing lama: algo kita rusak, perlu di-fix. Framing itu salah. Framing yang benar: algo kita tidak pernah dibangun untuk 96 persen bisnis. Dan manusia yang nge-cover gap itu udah hit ceiling. Implikasinya empat. Satu, solusi bukan replace manual dengan algo. Dua, solusi adalah absorb mental model manual ke algo secara bertahap. Tiga, floor monitor bukan problem — mereka oracle yang harus di-leverage. Empat, trust mitra akan kembali otomatis kalau algo beneran deliver, tapi dengan lag — butuh bukti berulang.",
"Sekarang direction. Ini yang kalian tunggu. Pause dulu. Ini bukan 12-minggu commitment. Bukan solusi lengkap. Tiga bets yang defensible dan gradually reversible. Bet 1, dua minggu, capture floor monitor mental model — log reason tag tiap manual allocation lewat 1-click bot di WA. Bet 2, dua minggu setelah Bet 1, shadow mode — algo compute score paralel dengan floor monitor, compare agreement. Gate: agreement 70 persen lanjut, di bawah 50 persen rethink. Bet 3, gradual handoff — auto-assign di high-confidence, geser rasio dari 3:97 ke 20:80 dulu, bukan langsung 80:20. Floor monitor tidak di-replace. Mereka geser dari hunter ke reviewer. Kalau ada yang challenge 'apakah algo akan inherit kelemahan RTFM yang kadang ignore motor range, parallel order mitra, atau future scheduled commitment?' — jawab pakai framing 3 lapis. Lapis 1, Bet 1 sampai 3: imitation. Algo minimal harus sama pinter dengan RTFM sekarang. Ini foundation. Lapis 2, next phase: hard constraints — motor range check, parallel order block, future commitment awareness, shift budget cap. Guardrail yang RTFM kadang miss karena human bandwidth limit, algo ga punya issue itu. Lapis 3, next phase: opportunity cost scoring — destination-to-reservation distance, next-slot demand projection, demand-aware positioning. Area dimana algo beda dari manusia bukan karena lebih pintar, tapi karena manusia ga bisa kalkulasi real-time. Tutup: Bet 1 sampai 3 fokus di baseline match RTFM dulu. Tapi tujuan long-term bukan niru — tujuan lampaui, terutama di hal yang manusia ga bisa compute cepat. ROI beyond cost savings.",
"Dan ini kekuatan presentasi gua. Gua lebih prefer honest di depan daripada kaget di tengah jalan. Tiga open assumption. Satu, supply adequacy — apakah beneran ada mitra fit dalam radius saat order masuk? Sample 100 failed allocation, 1-2 hari query. Dua, ghost mitra — berapa mitra online tapi ga pernah dapat atau accept order? Kalau lebih dari 15 persen ghost, real supply pool kita lebih kecil dari yang kita kira. Tiga, never-reject — itu kontrak hukum atau brand aspiration? Kalau aspirasi, unlock design space untuk honest escalation. Stakeholder respect orang yang ngaku ga tau.",
"Ini yang gua butuh dari kalian. Spesifik, bukan vague. Satu: approval 2 minggu untuk Bet 1. Low commitment, reversible. Dua: 1 sampai 2 engineer untuk setup logging infrastructure, parallel sama existing work, bukan dedicated. Tiga: decision dari Aditya dan BD — interrogate constraint 'never reject'. Legal atau aspirational? Ini unlock solution space. Empat: sponsor investigasi supply integrity, ghost mitra — bukan scope design gua, butuh owner dari Ops. Gua bisa drive koordinasi, tapi butuh commit ke ownership per workstream. Solo designer ga bisa solve cross-functional problem sendirian.",
"Closing. Yang kita pertaruhkan. Kalau ga berubah: floor monitor burnout, latency tetap 89 menit, SLA tetap 5 persen, TikTok Shop jadi breaking point, trust client tergerus, ga ada jalur scale. Kalau kita eksekusi: floor monitor workload 8 sampai 12 jam ke di bawah 4 jam dalam 6 bulan. Latency 89 menit ke di bawah 3 menit. SLA 5 persen ke 50 persen plus. Headroom untuk TikTok Shop dan beyond. Algo yang beneran represent bisnis Dash. Ini bukan tentang bikin algo yang lebih pintar. Ini tentang bikin sistem yang akhirnya match dengan bisnis yang udah kita jalankan.",
"Gua stop di sini. Terima kasih. Mari diskusikan."
]
</script>
<style>
  :root {
    --ink: #1A1A1A;
    --ink-2: #0E0E0E;
    --paper: #F7F7F5;
    --paper-2: #FFFFFF;
    --mute: #6B6B68;
    --rule: #E4E3DE;
    --rule-dark: #2A2A2A;
    --purple: #5E2AAC;
    --purple-soft: #EEE5FB;
    --danger: #A32D2D;
    --success: #0F6E56;
  }
  html, body { margin: 0; padding: 0; background: #000; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  deck-stage > section {
    width: 1920px; height: 1080px;
    box-sizing: border-box;
    display: block;
    position: relative;
    overflow: hidden;
    color: var(--ink);
    background: var(--paper);
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.005em;
  }
  .dark { background: var(--ink) !important; color: var(--paper) !important; }
  .dark .mute { color: #9A9A96 !important; }

  .pad { padding: 110px 140px; height: 100%; box-sizing: border-box; }
  .pad-wide { padding: 110px 120px; height: 100%; box-sizing: border-box; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .eyebrow {
    font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase;
    font-weight: 600; color: var(--mute);
  }
  .eyebrow.purple { color: var(--purple); }
  .slide-no {
    position: absolute; bottom: 48px; right: 60px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    color: var(--mute); letter-spacing: 0.1em;
  }
  .dark .slide-no { color: #6B6B68; }
  .footer-line {
    position: absolute; bottom: 48px; left: 60px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    color: var(--mute); letter-spacing: 0.1em;
  }
  .dark .footer-line { color: #6B6B68; }

  h1, h2, h3, p { margin: 0; }
  .title-xxl { font-size: 108px; font-weight: 800; line-height: 0.98; letter-spacing: -0.035em; }
  .title-xl { font-size: 76px; font-weight: 800; line-height: 1.02; letter-spacing: -0.03em; }
  .title-lg { font-size: 60px; font-weight: 700; line-height: 1.05; letter-spacing: -0.025em; }
  .title-md { font-size: 44px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
  .lede { font-size: 28px; line-height: 1.4; font-weight: 400; color: var(--ink); }
  .body { font-size: 20px; line-height: 1.55; font-weight: 400; color: var(--ink); }
  .body-sm { font-size: 17px; line-height: 1.55; color: var(--mute); }
  .stat-xxl { font-size: 140px; font-weight: 800; line-height: 0.9; letter-spacing: -0.04em; }
  .stat-xl { font-size: 96px; font-weight: 800; line-height: 0.95; letter-spacing: -0.035em; }
  .stat-lg { font-size: 64px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
  .stat-label { font-size: 15px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mute); font-weight: 600; }
  .num-red { color: var(--danger); }
  .num-green { color: var(--success); }
  .num-purple { color: var(--purple); }

  /* ===== SLIDE 1 ===== */
  .s1 .pad { display: grid; grid-template-rows: 1fr auto; }
  .s1 h1 { max-width: 1500px; font-weight: 800; font-size: 116px; letter-spacing: -0.04em; line-height: 0.96; align-self: center; }
  .s1 .pct { color: var(--purple); }
  .s1 .meta { display: flex; justify-content: space-between; align-items: flex-end; }
  .s1 .brand { font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #9A9A96; font-weight: 600; }

  /* ===== SLIDE 2 ===== */
  .s2 .pad { display: grid; place-items: center; text-align: center; padding: 80px 160px; }
  .s2 .wrap { max-width: 1500px; }
  .s2 .label { font-size: 24px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--mute); margin-bottom: 64px; font-weight: 600; }
  .s2 .quote { font-size: 58px; line-height: 1.22; font-weight: 500; letter-spacing: -0.02em; }
  .s2 em { font-style: normal; color: var(--purple); font-weight: 700; }
  .s2 .sub { font-size: 22px; color: var(--mute); margin-top: 72px; max-width: 1100px; margin-inline: auto; line-height: 1.5; }

  /* ===== SLIDE 3 ===== */
  .s3 .pad { display: grid; grid-template-rows: auto 1fr auto; gap: 48px; padding: 90px 120px; }
  .s3 .head h1 { font-size: 64px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; max-width: 1400px; }
  .s3 .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: stretch; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
  .s3 .col { padding: 40px 48px; }
  .s3 .col + .col { border-left: 1px solid var(--rule); }
  .s3 .col-hdr { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; }
  .s3 .col-title { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
  .s3 .col-tag { font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; }
  .s3 .tag-green { color: var(--success); }
  .s3 .tag-red { color: var(--danger); }
  .s3 .row { display: grid; grid-template-columns: 1fr auto; align-items: end; padding: 18px 0; border-top: 1px dashed var(--rule); }
  .s3 .row:first-of-type { border-top: none; }
  .s3 .row .k { font-size: 15px; color: var(--mute); letter-spacing: 0.02em; padding-bottom: 8px; font-weight: 500; }
  .s3 .row .v { font-size: 44px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
  .s3 .row .v.hero { font-size: 80px; font-weight: 800; }
  .s3 .row .sub { font-size: 13px; color: var(--mute); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; margin-top: 6px; text-align: right; }
  .s3 .foot { font-size: 15px; color: var(--mute); max-width: 1200px; line-height: 1.5; }

  /* ===== SLIDE 4 ===== */
  .s4 .pad { display: grid; grid-template-rows: auto auto 1fr auto; gap: 40px; padding: 90px 120px; }
  .s4 h1 { font-size: 58px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; max-width: 1500px; }
  .s4 .insight { font-size: 32px; line-height: 1.35; font-weight: 500; max-width: 1500px; letter-spacing: -0.01em; }
  .s4 .insight b { font-weight: 700; color: var(--purple); }
  .s4 .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
  .s4 .col h3 { font-size: 18px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin-bottom: 24px; }
  .s4 .col.mcd h3 { color: var(--success); }
  .s4 .col.non h3 { color: var(--danger); }
  .s4 .col ul { list-style: none; padding: 0; margin: 0; }
  .s4 .col li { font-size: 22px; line-height: 1.5; padding: 12px 0; border-top: 1px solid var(--rule); color: var(--ink); }
  .s4 .col li:first-child { border-top: none; }
  .s4 .col li.eq { font-weight: 700; margin-top: 6px; padding-top: 20px; }
  .s4 .col.mcd li.eq { color: var(--success); }
  .s4 .col.non li.eq { color: var(--danger); }
  .s4 .tagline { font-size: 24px; line-height: 1.45; font-weight: 500; border-top: 1px solid var(--rule); padding-top: 28px; max-width: 1600px; }
  .s4 .tagline em { font-style: italic; color: var(--purple); font-weight: 600; }

  /* ===== SLIDE 5 ===== */
  .s5 .pad { display: grid; grid-template-rows: auto auto 1fr auto; gap: 44px; padding: 100px 120px; }
  .s5 h1 { font-size: 62px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; }
  .s5 .lede2 { font-size: 26px; line-height: 1.45; max-width: 1500px; color: var(--ink); }
  .s5 .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
  .s5 .col .icon { width: 72px; height: 72px; border: 2px solid var(--ink); border-radius: 50%; display: grid; place-items: center; margin-bottom: 28px; }
  .s5 .col .icon svg { width: 36px; height: 36px; }
  .s5 .col h3 { font-size: 16px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--mute); font-weight: 700; margin-bottom: 12px; }
  .s5 .col h2 { font-size: 38px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 22px; }
  .s5 .col ul { list-style: none; padding: 0; margin: 0; }
  .s5 .col li { font-size: 22px; line-height: 1.55; padding: 12px 0; border-top: 1px solid var(--rule); }
  .s5 .col li:first-child { border-top: none; }
  .s5 .col li b { font-weight: 700; }
  .s5 .tag { font-size: 24px; font-weight: 500; line-height: 1.5; font-style: italic; color: var(--ink); max-width: 1600px; border-top: 1px solid var(--rule); padding-top: 28px; }
  .s5 .tag em { font-style: italic; color: var(--purple); font-weight: 600; }

  /* ===== SLIDE 6 ===== */
  .s6 .pad { display: grid; grid-template-rows: auto auto 1fr; gap: 36px; padding: 80px 120px; }
  .s6 h1 { font-size: 56px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; }
  .s6 .insight { font-size: 32px; line-height: 1.45; font-weight: 500; }
  .s6 .insight .not { color: var(--danger); font-weight: 700; }
  .s6 .insight .ok { color: var(--success); font-weight: 700; }
  .s6 .insight .pur { color: var(--purple); font-weight: 700; }
  .s6 .rows { display: grid; grid-template-rows: 1fr 1fr 1fr; border-top: 1px solid var(--rule); }
  .s6 .row { display: grid; grid-template-columns: 300px 1fr 240px; gap: 48px; align-items: center; padding: 28px 0; border-bottom: 1px solid var(--rule); }
  .s6 .row .ch { font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; }
  .s6 .row .ch .num { font-family: 'JetBrains Mono', monospace; color: var(--mute); display: block; font-size: 14px; margin-bottom: 10px; letter-spacing: 0.15em; }
  .s6 .row .ch .name { font-size: 24px; letter-spacing: -0.01em; text-transform: none; font-weight: 700; }
  .s6 .row .desc { font-size: 24px; line-height: 1.5; color: var(--ink); }
  .s6 .row .desc b { font-weight: 700; }
  .s6 .row .stat { text-align: right; }
  .s6 .row .stat .num { font-size: 72px; font-weight: 800; letter-spacing: -0.03em; line-height: 0.95; }
  .s6 .row .stat .lbl { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mute); font-weight: 600; margin-top: 8px; }
  .s6 .row.algo .num { color: var(--danger); }
  .s6 .row.man .num { color: var(--success); }
  .s6 .row.imp { grid-template-columns: 300px 1fr; }
  .s6 .row.imp .desc { font-size: 24px; font-weight: 500; }
  .s6 .row.imp .desc b { color: var(--purple); }

  /* ===== SLIDE 7 ===== */
  .s7 .pad { display: grid; grid-template-columns: 1.05fr 1fr; gap: 90px; padding: 90px 120px; }
  .s7 .left { display: flex; flex-direction: column; justify-content: space-between; }
  .s7 h1 { font-size: 58px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; }
  .s7 .tag { font-size: 24px; line-height: 1.5; }
  .s7 .tag .em { color: var(--danger); font-weight: 700; }
  .s7 .tag .pur { color: var(--purple); font-weight: 700; }
  .s7 .right { position: relative; }
  .s7 .flow { display: flex; flex-direction: column; gap: 10px; }
  .s7 .step { padding: 16px 24px; border: 1px solid var(--rule); background: var(--paper-2); font-size: 20px; line-height: 1.35; border-radius: 2px; color: var(--ink); }
  .s7 .step.highlight { border-color: var(--purple); background: var(--purple-soft); color: var(--ink); }
  .s7 .arrow { display: grid; place-items: center; color: var(--mute); font-size: 20px; line-height: 0.5; }
  .s7 .wall { margin-top: 12px; background: var(--ink); color: var(--paper); border: none; padding: 28px 22px; text-align: center; border-radius: 2px; }
  .s7 .wall .w1 { font-size: 15px; letter-spacing: 0.3em; color: #E8A0A0; font-weight: 700; text-transform: uppercase; }
  .s7 .wall .w2 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin-top: 10px; }
  .s7 .wall .w3 { font-size: 15px; color: #A8A8A4; margin-top: 10px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }

  /* ===== SLIDE 8 ===== */
  .s8 .pad { display: grid; grid-template-rows: auto 1fr; gap: 50px; padding: 100px 140px; }
  .s8 h1 { font-size: 64px; font-weight: 700; letter-spacing: -0.025em; color: var(--paper); }
  .s8 .grid { display: grid; grid-template-rows: auto auto 1fr; gap: 40px; }
  .s8 .old {
    font-size: 44px; font-weight: 600; color: #6B6B68;
    text-decoration: line-through; text-decoration-color: #A32D2D;
    text-decoration-thickness: 3px;
    letter-spacing: -0.02em;
  }
  .s8 .old-label { font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: #9A9A96; margin-bottom: 14px; font-weight: 700; }
  .s8 .new-label { font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: #B589F0; margin-bottom: 18px; font-weight: 700; }
  .s8 .new { font-size: 56px; font-weight: 700; line-height: 1.12; letter-spacing: -0.025em; color: var(--paper); max-width: 1550px; }
  .s8 .new b { color: #B589F0; font-weight: 800; }
  .s8 .imp { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; margin-top: 10px; border-top: 1px solid #2A2A2A; padding-top: 36px; }
  .s8 .imp .it { color: var(--paper); }
  .s8 .imp .n { font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #B589F0; letter-spacing: 0.1em; margin-bottom: 14px; font-weight: 700; }
  .s8 .imp .t { font-size: 20px; line-height: 1.5; color: #D6D6D2; }
  .s8 .imp .t b { color: var(--paper); font-weight: 700; }

  /* ===== SLIDE 9 ===== */
  .s9 .pad { display: grid; grid-template-rows: auto auto 1fr auto; gap: 36px; padding: 90px 100px; }
  .s9 h1 { font-size: 60px; font-weight: 700; letter-spacing: -0.025em; }
  .s9 .intro { font-size: 24px; color: var(--ink); line-height: 1.5; max-width: 1500px; }
  .s9 .intro b { font-weight: 700; }
  .s9 .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; align-items: stretch; }
  .s9 .card { border: 1px solid var(--rule); padding: 34px 32px; display: flex; flex-direction: column; gap: 16px; background: var(--paper-2); }
  .s9 .card.c2 { background: #F1ECF9; border-color: #D9C8F4; }
  .s9 .card.c3 { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .s9 .card .num { font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.22em; font-weight: 700; color: var(--mute); }
  .s9 .card.c2 .num { color: var(--purple); }
  .s9 .card.c3 .num { color: #B589F0; }
  .s9 .card h3 { font-size: 28px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.15; }
  .s9 .card .kv { display: grid; grid-template-columns: 84px 1fr; gap: 10px 16px; font-size: 18px; line-height: 1.5; margin-top: 8px; }
  .s9 .card .k { color: var(--mute); font-weight: 700; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; padding-top: 4px; }
  .s9 .card.c3 .k { color: #B589F0; }
  .s9 .card .v { color: var(--ink); }
  .s9 .card.c3 .v { color: #D6D6D2; }
  .s9 .card .v b { font-weight: 700; color: var(--ink); }
  .s9 .card.c3 .v b { color: var(--paper); }
  .s9 .foot { font-size: 22px; line-height: 1.5; border-top: 1px solid var(--rule); padding-top: 24px; max-width: 1600px; }
  .s9 .foot b { color: var(--purple); font-weight: 700; }

  /* ===== SLIDE 10 ===== */
  .s10 .pad { display: grid; grid-template-rows: auto auto 1fr; gap: 40px; padding: 100px 120px; }
  .s10 h1 { font-size: 58px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; color: #2A2A2A; }
  .s10 .intro { font-size: 24px; color: var(--mute); line-height: 1.5; max-width: 1500px; }
  .s10 .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .s10 .card { border: 1px dashed #BFBDB4; padding: 36px 32px; background: #FBFBF9; display: flex; flex-direction: column; gap: 16px; }
  .s10 .qmark { font-size: 48px; font-weight: 300; color: #BFBDB4; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }
  .s10 .ql { font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mute); font-weight: 700; }
  .s10 .q { font-size: 26px; font-weight: 600; line-height: 1.3; color: var(--ink); letter-spacing: -0.01em; }
  .s10 .kv { display: grid; grid-template-columns: 92px 1fr; gap: 10px 16px; font-size: 17px; line-height: 1.55; margin-top: 10px; color: var(--mute); }
  .s10 .kv .k { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; padding-top: 4px; color: #7A7A76; }
  .s10 .kv .v { color: #2A2A2A; }
  .s10 .kv .v b { font-weight: 700; color: var(--ink); }

  /* ===== SLIDE 11 ===== */
  .s11 .pad { display: grid; grid-template-rows: auto 1fr auto; gap: 44px; padding: 100px 120px; }
  .s11 h1 { font-size: 62px; font-weight: 700; letter-spacing: -0.025em; }
  .s11 .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; align-items: stretch; }
  .s11 .card { border: 1px solid var(--rule); padding: 36px 30px; display: flex; flex-direction: column; gap: 18px; background: var(--paper-2); }
  .s11 .card .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .s11 .card .n { font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.2em; color: var(--purple); font-weight: 700; }
  .s11 .icon { width: 48px; height: 48px; display: grid; place-items: center; color: var(--purple); }
  .s11 .icon svg { width: 36px; height: 36px; }
  .s11 .card .l { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mute); font-weight: 700; margin-top: 12px; }
  .s11 .card h3 { font-size: 28px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.2; }
  .s11 .card .d { font-size: 19px; line-height: 1.55; color: var(--ink); }
  .s11 .card .tag { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--mute); letter-spacing: 0.04em; margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--rule); }
  .s11 .foot { font-size: 22px; font-style: italic; color: var(--mute); line-height: 1.5; max-width: 1500px; border-top: 1px solid var(--rule); padding-top: 26px; }

  /* ===== SLIDE 12 ===== */
  .s12 .pad { display: grid; grid-template-rows: auto 1fr auto; gap: 40px; padding: 100px 120px; }
  .s12 h1 { font-size: 62px; font-weight: 700; letter-spacing: -0.025em; color: var(--paper); }
  .s12 .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid #2A2A2A; border-bottom: 1px solid #2A2A2A; }
  .s12 .col { padding: 40px 44px; }
  .s12 .col + .col { border-left: 1px solid #2A2A2A; }
  .s12 .col .h { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .s12 .col .tag { font-size: 14px; letter-spacing: 0.25em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
  .s12 .sq .tag { color: #9A9A96; }
  .s12 .ex .tag { color: #B589F0; }
  .s12 .col .t { font-size: 28px; font-weight: 700; letter-spacing: -0.015em; }
  .s12 .sq .t { color: #9A9A96; }
  .s12 .ex .t { color: var(--paper); }
  .s12 .col ul { list-style: none; padding: 0; margin: 0; }
  .s12 .col li { font-size: 22px; line-height: 1.45; padding: 16px 0; border-top: 1px dashed #2A2A2A; display: flex; gap: 14px; align-items: baseline; }
  .s12 .col li:first-child { border-top: none; }
  .s12 .col li > span:last-child { flex: 1; }
  .s12 .sq li { color: #8A8A84; }
  .s12 .sq li .mk { color: #A32D2D; font-weight: 800; }
  .s12 .ex li { color: #E4E3DE; }
  .s12 .ex li .mk { color: #B589F0; font-weight: 800; }
  .s12 .ex li b { color: var(--paper); font-weight: 700; }
  .s12 .tagline { text-align: left; }
  .s12 .tagline .t1 { font-size: 20px; letter-spacing: 0.28em; text-transform: uppercase; color: #B589F0; font-weight: 700; margin-bottom: 20px; }
  .s12 .tagline .t2 { font-size: 48px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; color: var(--paper); max-width: 1600px; }
  .s12 .tagline .t2 b { color: #B589F0; }

  /* ===== SLIDE 13 ===== */
  .s13 .pad { display: grid; grid-template-rows: 1fr auto; padding: 110px 140px; }
  .s13 .center { display: flex; flex-direction: column; justify-content: center; gap: 30px; }
  .s13 h1 { font-size: 240px; font-weight: 800; letter-spacing: -0.05em; line-height: 0.9; color: var(--paper); }
  .s13 .sub { font-size: 32px; color: #9A9A96; max-width: 900px; line-height: 1.4; }
  .s13 .meta { display: flex; justify-content: space-between; align-items: flex-end; }
  .s13 .brand { font-size: 15px; letter-spacing: 0.25em; text-transform: uppercase; color: #6B6B68; font-weight: 600; }

  /* dotted cluster for slide 4 */
  .dotbox { width: 100%; height: 120px; border: 1px dashed var(--rule); border-radius: 2px; position: relative; margin-bottom: 20px; background: #FDFDFB; }
  .dot { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--ink); }
  .dotbox .hub { width: 14px; height: 14px; background: var(--success); border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%,-50%); position: absolute; }

  /* brand mark */
  .mark {
    display: inline-flex; align-items: center; gap: 14px;
    font-size: 15px; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700;
  }
  .mark .dot-mark { width: 10px; height: 10px; background: var(--purple); border-radius: 50%; }
</style>
</head>
<body>
<deck-stage>

  <!-- SLIDE 1 -->
  <section class="dark s1" data-screen-label="01 Cover">
    <div class="pad">
      <div style="display:grid;align-content:space-between;height:100%;">
        <div class="mark" style="color:#9A9A96;"><span class="dot-mark"></span>Dash Express</div>
        <h1>Mengapa <span class="pct">96%</span><br/>bisnis kita berjalan<br/>di atas manusia.</h1>
        <div class="meta">
          <div style="font-size:26px;color:#C9C9C5;max-width:720px;line-height:1.5;">
            Core problem analysis &amp; proposed direction.<br/>
            <span style="color:#7A7A76;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:0.05em;">
              Irfan Prima — Product Design · 23 April 2026
            </span>
          </div>
          <div class="brand">Internal · Strategic</div>
        </div>
      </div>
    </div>
  </section>

  <!-- SLIDE 2 -->
  <section class="s2" data-screen-label="02 One-liner">
    <div class="pad">
      <div class="wrap">
        <div class="label">Satu kalimat</div>
        <div class="quote">
          Dash Express adalah <em>automated delivery service</em> untuk 4% volume,
          dan <em>manual delivery service</em> untuk 96% volume —
          di mana 96% itu di-sustain oleh <em>2&ndash;3 manusia</em> yang kerja
          8–12 jam per hari dengan allocation latency <em>89 menit</em> per order.
        </div>
        <div class="sub">
          Completion rate 95% yang terlihat sehat di dashboard berjalan di atas
          <i>capacity ceiling</i> yang akan patah seiring volume tumbuh.
        </div>
      </div>
    </div>
    <div class="slide-no">02 / 13</div>
  </section>

  <!-- SLIDE 3 -->
  <section class="s3" data-screen-label="03 Data">
    <div class="pad">
      <div class="head">
        <div class="eyebrow purple" style="margin-bottom:18px;">Data · 1 bulan terakhir</div>
        <h1>Dua realitas paralel<br/>di satu bisnis.</h1>
      </div>
      <div class="cols">
        <div class="col">
          <div class="col-hdr">
            <div class="col-title">McD <span style="color:var(--mute);font-weight:500;font-size:18px;">— Benchmark</span></div>
            <div class="col-tag tag-green">● 4% Volume</div>
          </div>
          <div class="row"><div class="k">Volume</div><div><div class="v">8,290</div><div class="sub">deliveries</div></div></div>
          <div class="row"><div class="k">Automation rate</div><div><div class="v hero num-green">99.90%</div></div></div>
          <div class="row"><div class="k">Allocation time</div><div><div class="v num-green">0.04<span style="font-size:22px;color:var(--mute);font-weight:500;letter-spacing:0;"> min</span></div></div></div>
          <div class="row"><div class="k">SLA met</div><div><div class="v" style="font-size:32px;">39.12%</div></div></div>
          <div class="row"><div class="k">Completion</div><div><div class="v" style="font-size:32px;">92.61%</div></div></div>
        </div>
        <div class="col">
          <div class="col-hdr">
            <div class="col-title">Non-McD <span style="color:var(--mute);font-weight:500;font-size:18px;">— 96% Business</span></div>
            <div class="col-tag tag-red">● 96% Volume</div>
          </div>
          <div class="row"><div class="k">Volume</div><div><div class="v">16,618</div><div class="sub">deliveries · 2× lipat</div></div></div>
          <div class="row"><div class="k">Automation rate</div><div><div class="v hero num-red">3.95%</div></div></div>
          <div class="row"><div class="k">Allocation time</div><div><div class="v num-red">88.91<span style="font-size:22px;color:var(--mute);font-weight:500;letter-spacing:0;"> min</span></div><div class="sub">89 min vs &lt;1 min di McD</div></div></div>
          <div class="row"><div class="k">SLA met</div><div><div class="v num-red" style="font-size:32px;">5.30%</div></div></div>
          <div class="row"><div class="k">Completion</div><div><div class="v" style="font-size:32px;">95.58%</div></div></div>
        </div>
      </div>
      <div class="foot">
        Non-McD mencakup Chagee, Jiwa+, Kopi Kenangan, Sayurbox, Lili, SPUN, Janji Jiwa &mdash; dalam 1 bulan terakhir.
      </div>
    </div>
    <div class="slide-no">03 / 13</div>
  </section>

  <!-- SLIDE 4 -->
  <section class="s4" data-screen-label="04 Root Cause">
    <div class="pad">
      <h1>Kenapa McD bisa 99.9%,<br/>non-McD cuma 3.95%?</h1>
      <p class="insight">
        Algo allocation kita hanya punya <b>1 dimensi: proximity.</b>
        Dan proximity doang <i>kebetulan</i> cukup untuk McD — karena mitra camping di outlet.
      </p>
      <div class="cols">
        <div class="col mcd">
          <h3>● Di McD</h3>
          <div class="dotbox">
            <div class="hub"></div>
            <div class="dot" style="left:48%;top:42%;"></div>
            <div class="dot" style="left:52%;top:58%;"></div>
            <div class="dot" style="left:46%;top:52%;"></div>
            <div class="dot" style="left:51%;top:48%;"></div>
            <div class="dot" style="left:53%;top:52%;"></div>
            <div class="dot" style="left:49%;top:56%;"></div>
          </div>
          <ul>
            <li>Mitra camping di outlet</li>
            <li>"Terdekat" otomatis juga = motor fit, whitelist OK, zone match</li>
            <li class="eq">Proximity = Fit (by coincidence)</li>
          </ul>
        </div>
        <div class="col non">
          <h3>● Di Non-McD</h3>
          <div class="dotbox">
            <div class="dot" style="left:8%;top:20%;"></div>
            <div class="dot" style="left:18%;top:70%;"></div>
            <div class="dot" style="left:32%;top:30%;"></div>
            <div class="dot" style="left:40%;top:80%;"></div>
            <div class="dot" style="left:54%;top:24%;"></div>
            <div class="dot" style="left:62%;top:64%;"></div>
            <div class="dot" style="left:72%;top:40%;"></div>
            <div class="dot" style="left:84%;top:74%;"></div>
            <div class="dot" style="left:90%;top:32%;"></div>
            <div class="dot" style="left:24%;top:50%;"></div>
            <div class="dot" style="left:48%;top:56%;"></div>
            <div class="dot" style="left:66%;top:18%;"></div>
          </div>
          <ul>
            <li>Order tersebar di seluruh kota</li>
            <li>Mitra ga bisa camping (impossible)</li>
            <li class="eq">"Terdekat" ≠ "Fit"</li>
          </ul>
        </div>
      </div>
      <p class="tagline">
        system allocating kita tidak pernah dibangun untuk handle 96% skenario bisnis.
        <em>McD adalah exception, bukan norm.</em>
      </p>
    </div>
    <div class="slide-no">04 / 13</div>
  </section>

  <!-- SLIDE 5 -->
  <section class="s5" data-screen-label="05 Hidden Cost">
    <div class="pad">
      <h1>Apa yang dashboard<br/>tidak tunjukkan.</h1>
      <p class="lede2">
        Brand promise <b>"never reject"</b> saat ini di-sustain oleh
        <b>dua subsidi yang finite</b>.
      </p>
      <div class="cols">
        <div class="col">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 3h14M5 21h14M6 3c0 6 12 6 12 9s-12 3-12 9M18 3c0 6-12 6-12 9s12 3 12 9"/>
            </svg>
          </div>
          <h3>Subsidi 01</h3>
          <h2>Tenaga manusia</h2>
          <ul>
            <li>2–3 floor monitor, <b>8–12 jam/hari</b></li>
            <li>Rata-rata ~7,000 allocation/bulan per orang</li>
            <li><b>Hard capacity ceiling</b> — tidak bisa di-scale dengan hire</li>
            <li>TikTok Shop <b>+3,000 orders/day</b> akan break sistem ini</li>
          </ul>
        </div>
        <div class="col">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="13" r="8"/>
              <path d="M12 9v4l2.5 2.5M9 3h6M12 3v2"/>
            </svg>
          </div>
          <h3>Subsidi 02</h3>
          <h2>Allocation latency</h2>
          <ul>
            <li><b>89 menit</b> rata-rata per order</li>
            <li>Hanya <b>5.3%</b> hit SLA</li>
            <li>"Never reject" di-beli dengan <b>"never on-time"</b></li>
            <li>Trust client turun diam-diam</li>
          </ul>
        </div>
      </div>
      <p class="tag">
        Completion rate 95% bukan kemenangan sistem.
        <em>Itu kemenangan kerja rodi manusia yang nambal automation yang rusak.</em>
      </p>
    </div>
    <div class="slide-no">05 / 13</div>
  </section>

  <!-- SLIDE 6 -->
  <section class="s6" data-screen-label="06 Trust Split">
    <div class="pad">
      <h1>Trust mitra tidak hilang —<br/>tapi pindah channel.</h1>
      <p class="insight">
        Mitra <span class="not">TIDAK</span> distrust Dash.
        Mitra <span class="not">distrust System Allocating.</span>
        Mitra <span class="ok">TRUST MANUAL.</span>
      </p>
      <div class="rows">
        <div class="row algo">
          <div class="ch">
            <span class="num">CH 01 · ALGO</span>
            <span class="name">Broadcast</span>
          </div>
          <div class="desc">
            Freelance acceptance rendah. Fulltime lebih responsif saat dihubungi
            manusia dibanding assignment algo. Mitra treat algo assignment sebagai <b>opsional</b>.
          </div>
          <div class="stat">
            <div class="num">10%</div>
            <div class="lbl">Acceptance</div>
          </div>
        </div>
        <div class="row man">
          <div class="ch">
            <span class="num">CH 02 · MANUAL</span>
            <span class="name">WA RTFM</span>
          </div>
          <div class="desc">
            Mitra accept, eksekusi, antar. Mitra treat <b>"real allocation"</b>
            = yang lewat chat manusia.
          </div>
          <div class="stat">
            <div class="num">95%</div>
            <div class="lbl">Completion</div>
          </div>
        </div>
        <div class="row imp">
          <div class="ch">
            <span class="num">IMPLIKASI</span>
            <span class="name">Bukan distrust,<br/>tapi absent</span>
          </div>
          <div class="desc">
            Algo <b>ga pernah earn trust</b> karena ga pernah beneran allocate.
            Manual channel work — tapi capacity capped.
          </div>
        </div>
      </div>
    </div>
    <div class="slide-no">06 / 13</div>
  </section>

  <!-- SLIDE 7 -->
  <section class="s7" data-screen-label="07 Divergence">
    <div class="pad">
      <div class="left">
        <div>
          <div class="eyebrow purple" style="margin-bottom:18px;">Pattern · Divergence</div>
          <h1>Gap antara algo<br/>dan volume<br/>terus melebar.</h1>
        </div>
        <p class="tag">
          Ini <b>bukan siklus steady-state</b>.
          <span class="pur">Ini trajectory menuju patah.</span><br/><br/>
          TikTok Shop <span class="em">3,000 orders/day</span> = detonator.
        </p>
      </div>
      <div class="right">
        <div class="flow">
          <div class="step">Algo di-design hanya untuk <b>1 pattern</b> (McD camping)</div>
          <div class="arrow">↓</div>
          <div class="step">96% volume harus di-absorb <b>manual</b></div>
          <div class="arrow">↓</div>
          <div class="step">Mitra develop trust ke manual, <b>abaikan algo broadcast</b></div>
          <div class="arrow">↓</div>
          <div class="step">Algo makin <b>irrelevant</b> → makin tidak di-iterate</div>
          <div class="arrow">↓</div>
          <div class="step">Gap antara algo vs manual <b>makin lebar</b></div>
          <div class="arrow">↓</div>
          <div class="step">Manual capacity makin <b>stretch</b></div>
          <div class="arrow">↓</div>
          <div class="step highlight">Floor monitor burnt out, <b>exception accumulate</b></div>
          <div class="arrow">↓</div>
          <div class="wall">
            <div class="w1">⚠ Scale Wall</div>
            <div class="w2">Patah saat volume tumbuh</div>
            <div class="w3">bukan loop steady — detonasi</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-no">07 / 13</div>
  </section>

  <!-- SLIDE 8 -->
  <section class="dark s8" data-screen-label="08 Reframe">
    <div class="pad">
      <h1>Jadi, apa core problem-nya?</h1>
      <div class="grid">
        <div>
          <div class="old-label">Framing lama</div>
          <div class="old">"Algo kita rusak, perlu di-fix."</div>
        </div>
        <div>
          <div class="new-label">Framing yang benar</div>
          <div class="new">
            Algo kita <b>tidak pernah dibangun</b> untuk 96% bisnis.<br/>
            Manusia yang nge-cover gap itu <b>sudah hit ceiling.</b>
          </div>
        </div>
        <div class="imp">
          <div class="it">
            <div class="n">01 / IMPLIKASI</div>
            <div class="t">Solusi <b>bukan</b> "replace manual dengan algo".</div>
          </div>
          <div class="it">
            <div class="n">02 / IMPLIKASI</div>
            <div class="t">Solusi adalah "<b>absorb mental model manual</b> ke algo, secara bertahap".</div>
          </div>
          <div class="it">
            <div class="n">03 / IMPLIKASI</div>
            <div class="t">Floor monitor bukan problem — mereka <b>oracle</b> yang harus di-leverage.</div>
          </div>
          <div class="it">
            <div class="n">04 / IMPLIKASI</div>
            <div class="t">Trust mitra akan kembali otomatis kalau algo beneran deliver — <b>tapi butuh bukti berulang</b>.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-no" style="color:#6B6B68;">08 / 13</div>
  </section>

  <!-- SLIDE 9 -->
  <section class="s9" data-screen-label="09 Three Bets">
    <div class="pad">
      <div>
        <div class="eyebrow purple" style="margin-bottom:18px;">Direction · 3 Bets</div>
        <h1>Arah solusi — bukan roadmap.</h1>
      </div>
      <p class="intro">
        <b>Bukan 12-minggu plan.</b> Bukan solusi lengkap.
        3 langkah yang <b>defensible</b> dan <b>gradually reversible</b> kalau data bilang salah.
      </p>
      <div class="cards">
        <div class="card c1">
          <div class="num">BET 01</div>
          <h3>Capture floor monitor mental model</h3>
          <div class="kv">
            <div class="k">Durasi</div><div class="v"><b>2 minggu</b></div>
            <div class="k">Aksi</div><div class="v">Log <code style="font-family:'JetBrains Mono',monospace;font-size:14px;">reason tag</code> tiap allocation manual. 1-click bot di WA RTFM.</div>
            <div class="k">Output</div><div class="v">Data tentang dimensi real yang floor monitor pakai — bukan karangan whiteboard.</div>
            <div class="k">Risk</div><div class="v">Compliance. Mitigasi: 1-click, mandatory, simple.</div>
            <div class="k">Principle</div><div class="v">Micro-burden ~5 detik/allocation, justified — output = data dimensi real. Acceptable deviation dari zero-burden principle.</div>
          </div>
        </div>
        <div class="card c2">
          <div class="num">BET 02</div>
          <h3>Shadow mode</h3>
          <div class="kv">
            <div class="k">Durasi</div><div class="v"><b>2 minggu</b> setelah Bet 1</div>
            <div class="k">Aksi</div><div class="v">Algo compute score paralel dengan floor monitor decision. Compare agreement.</div>
            <div class="k">Output</div><div class="v">Bukti apakah algo bisa replicate floor monitor thinking.</div>
            <div class="k">Gate</div><div class="v">Agreement <b>≥70%</b> → lanjut. <b>&lt;50%</b> → rethink dimensi.</div>
          </div>
        </div>
        <div class="card c3">
          <div class="num">BET 03</div>
          <h3>Gradual handoff</h3>
          <div class="kv">
            <div class="k">Durasi</div><div class="v">Setelah Bet 2 pass</div>
            <div class="k">Aksi</div><div class="v">Auto-assign di kasus high-confidence. Manual tetap untuk sisanya.</div>
            <div class="k">Target</div><div class="v">Geser ratio dari <b>3:97 → 20:80</b> dulu. Bukan langsung 80:20.</div>
            <div class="k">Safety</div><div class="v">Floor monitor tetap monitor + override. <b>Bukan replace.</b></div>
          </div>
        </div>
      </div>
      <p class="foot">
        Key principle: floor monitor tidak di-replace. Mereka geser dari <b>"hunter"</b> ke <b>"reviewer + exception handler".</b>
        <br/><br/>
        <span style="color:var(--mute);">Bets ini adalah <b style="color:var(--purple);">baseline</b> — foundation yang match RTFM performance. <b style="color:var(--ink);">Beyond-baseline optimization</b> (constraint-aware + opportunity cost scoring) = next phase setelah MVP validate.</span>
      </p>
    </div>
    <div class="slide-no">09 / 13</div>
  </section>

  <!-- SLIDE 10 -->
  <section class="s10" data-screen-label="10 Unknowns">
    <div class="pad">
      <div>
        <div class="eyebrow" style="margin-bottom:18px;color:var(--mute);">Uncertainty zone</div>
        <h1>Yang gua belum tau —<br/>perlu verifikasi.</h1>
      </div>
      <p class="intro">
        Plan ini punya <b style="color:#3A3A3A;">3 open assumption</b> yang perlu di-verify sebelum commit penuh.
        Gua lebih prefer honest di depan daripada kaget di tengah jalan.
      </p>
      <div class="cards">
        <div class="card">
          <div class="qmark">?</div>
          <div class="ql">Q1 · Supply Adequacy</div>
          <div class="q">"Apakah beneran ada mitra fit dalam radius saat order masuk?"</div>
          <div class="kv">
            <div class="k">Method</div><div class="v">Sample 100 failed allocation, check pool state.</div>
            <div class="k">Effort</div><div class="v">1–2 hari data query.</div>
            <div class="k">Stakes</div><div class="v">Kalau <b>&lt;70%</b> ada mitra fit → masalah <b>coverage</b>, bukan matching.</div>
          </div>
        </div>
        <div class="card">
          <div class="qmark">?</div>
          <div class="ql">Q2 · Ghost Mitra Pattern</div>
          <div class="q">"Berapa mitra online tapi ga pernah dapat / accept order?"</div>
          <div class="kv">
            <div class="k">Trigger</div><div class="v">Observasi: mitra wandering seluruh kota, zero order.</div>
            <div class="k">Method</div><div class="v">Query mitra online &gt;4 jam vs productive output.</div>
            <div class="k">Stakes</div><div class="v">Kalau <b>&gt;15% ghost</b>, utilization 30% misleading. Real supply lebih kecil.</div>
          </div>
        </div>
        <div class="card">
          <div class="qmark">?</div>
          <div class="ql">Q3 · "Never Reject"</div>
          <div class="q">"Legal contract atau brand aspiration?"</div>
          <div class="kv">
            <div class="k">Owner</div><div class="v">BD + Legal.</div>
            <div class="k">Stakes</div><div class="v">Kalau aspirasi → unlock design space untuk <b>honest escalation</b>, bukan force-assign bad matches.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-no">10 / 13</div>
  </section>

  <!-- SLIDE 11 -->
  <section class="s11" data-screen-label="11 Asks">
    <div class="pad">
      <div>
        <div class="eyebrow purple" style="margin-bottom:18px;">Asks · Actionable</div>
        <h1>Yang gua butuh<br/>dari stakeholder.</h1>
      </div>
      <div class="cards">
        <div class="card">
          <div class="top">
            <div class="n">ASK 01</div>
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12l4 4 10-10"/>
              </svg>
            </div>
          </div>
          <div class="l">Approval</div>
          <h3>2 minggu untuk Bet 1.</h3>
          <div class="d">Knowledge capture phase. <b>Low commitment, reversible.</b></div>
          <div class="tag">owner · Head of Business</div>
        </div>
        <div class="card">
          <div class="top">
            <div class="n">ASK 02</div>
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="9" r="3.2"/><circle cx="16" cy="9" r="3.2"/>
                <path d="M2 20c0-3.2 2.7-5 6-5s6 1.8 6 5M14 15c3.3 0 6 1.8 6 5"/>
              </svg>
            </div>
          </div>
          <div class="l">Resource</div>
          <h3>1–2 engineer, part-time.</h3>
          <div class="d">Setup logging infrastructure. Parallel dengan existing work, <b>bukan dedicated</b>.</div>
          <div class="tag">owner · Eng Lead</div>
        </div>
        <div class="card">
          <div class="top">
            <div class="n">ASK 03</div>
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3v18M4 12h16"/><circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
          </div>
          <div class="l">Decision</div>
          <h3>Interrogate "never reject".</h3>
          <div class="d">Legal contract atau aspiration? <b>Unlocks design space.</b></div>
          <div class="tag">owner · Aditya + BD + Legal</div>
        </div>
        <div class="card">
          <div class="top">
            <div class="n">ASK 04</div>
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.5-4.5"/>
              </svg>
            </div>
          </div>
          <div class="l">Investigation</div>
          <h3>Supply integrity probe.</h3>
          <div class="d">Ghost mitra pattern. <b>Bukan scope design</b>, butuh owner Ops lead.</div>
          <div class="tag">owner · Ops Lead</div>
        </div>
      </div>
      <p class="foot">
        Gua bisa drive coordination, tapi butuh commit ke <b>ownership per workstream</b>.
        Solo designer ga bisa solve cross-functional problem sendirian.
      </p>
    </div>
    <div class="slide-no">11 / 13</div>
  </section>

  <!-- SLIDE 12 -->
  <section class="dark s12" data-screen-label="12 Closing">
    <div class="pad">
      <h1>Yang kita pertaruhkan.</h1>
      <div class="cols">
        <div class="col sq">
          <div class="h">
            <div class="tag">■ STATUS QUO</div>
            <div class="t">Kalau ga berubah</div>
          </div>
          <ul>
            <li><span class="mk">—</span><span>Floor monitor <b style="color:#A8A8A4;">burnout</b> (2–3 orang, 8–12 jam/hari)</span></li>
            <li><span class="mk">—</span><span>Latency tetap <b style="color:#A8A8A4;">89 menit</b>, SLA tetap <b style="color:#A8A8A4;">5%</b></span></li>
            <li><span class="mk">—</span><span>TikTok Shop 3,000/day = <b style="color:#A8A8A4;">breaking point</b></span></li>
            <li><span class="mk">—</span><span>Trust client pelan-pelan <b style="color:#A8A8A4;">tergerus</b></span></li>
            <li><span class="mk">—</span><span><b style="color:#A8A8A4;">Ga ada jalur</b> untuk scale</span></li>
          </ul>
        </div>
        <div class="col ex">
          <div class="h">
            <div class="tag">● IF WE EXECUTE</div>
            <div class="t">Kalau eksekusi 3 bets</div>
          </div>
          <ul>
            <li><span class="mk">→</span><span>Floor monitor workload <b>8–12h → &lt;4h</b> dalam 6 bulan</span></li>
            <li><span class="mk">→</span><span>Allocation latency <b>89 min → &lt;3 min</b></span></li>
            <li><span class="mk">→</span><span>SLA met <b>5% → 50%+</b></span></li>
            <li><span class="mk">→</span><span>Headroom untuk <b>TikTok Shop &amp; beyond</b></span></li>
            <li><span class="mk">→</span><span>Algo yang <b>beneran represent</b> bisnis Dash</span></li>
          </ul>
        </div>
      </div>
      <div class="tagline">
        <div class="t1">The real bet</div>
        <div class="t2">
          Ini bukan tentang bikin algo yang lebih pintar.<br/>
          Ini tentang bikin sistem yang akhirnya <b>match dengan bisnis yang sudah kita jalankan.</b>
        </div>
      </div>
    </div>
    <div class="slide-no" style="color:#6B6B68;">12 / 13</div>
  </section>

  <!-- SLIDE 13 -->
  <section class="dark s13" data-screen-label="13 QA">
    <div class="pad">
      <div style="display:grid;align-content:space-between;height:100%;">
        <div class="mark" style="color:#9A9A96;"><span class="dot-mark"></span>Dash Express</div>
        <div class="center">
          <h1>Q&amp;A</h1>
          <p class="sub">Mari diskusikan.</p>
        </div>
        <div class="meta">
          <div style="font-size:18px;color:#C9C9C5;line-height:1.5;">
            Irfan Prima<br/>
            <span style="color:#7A7A76;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:0.05em;">
              Product Design · Dash Express
            </span>
          </div>
          <div class="brand">Thank you</div>
        </div>
      </div>
    </div>
  </section>

</deck-stage>
</body>
</html>
```

---

## Reference — `examples/mcd-2month-recap.html`

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Dash Express × McDonald's — 2-Month Recap</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --ink: #1A1A1A; --ink-2: #0E0E0E;
  --paper: #F7F7F5; --paper-2: #FFFFFF;
  --mute: #6B6B68;
  --rule: #E4E3DE; --rule-dark: #2A2A2A;
  --purple: #5E2AAC; --purple-soft: #EEE5FB;
  --purple-card: #F1ECF9; --purple-on-dark: #B589F0;
  --danger: #A32D2D; --success: #0F6E56;
  --mcd-yellow: #FFC72C;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #000; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
body { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px 0; }

/* ===== PRINT / PDF EXPORT ===== */
@page { size: 1920px 1080px; margin: 0; }
@media print {
  html, body { background: #FFFFFF; }
  body { padding: 0; gap: 0; display: block; }
  section.slide {
    margin: 0;
    page-break-after: always;
    break-after: page;
    box-shadow: none;
  }
  section.slide:last-child { page-break-after: auto; break-after: auto; }
}

section.slide {
  width: 1920px; height: 1080px;
  position: relative; overflow: hidden;
  color: var(--ink); background: var(--paper);
  letter-spacing: -0.005em;
}
section.slide.dark { background: var(--ink); color: var(--paper); }

.mono { font-family: 'JetBrains Mono', monospace; }
h1, h2, h3, p { margin: 0; }

.mcd {
  color: var(--mcd-yellow);
  font-weight: 800;
  -webkit-text-stroke: 0.6px #1A1A1A;
  paint-order: stroke fill;
}
section.slide.dark .mcd { color: var(--mcd-yellow); -webkit-text-stroke: 0; }

.dash-mark { display: inline-block; line-height: 0; }
.dash-mark svg { display: block; }
.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.brand-lockup .brand-text {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  line-height: 1;
}
.brand-lockup .brand-text strong { font-weight: 700; }

.title-xxl  { font-size: 108px; font-weight: 800; line-height: 0.98; letter-spacing: -0.035em; }
.title-xl   { font-size: 76px;  font-weight: 800; line-height: 1.02; letter-spacing: -0.03em; }
.title-lg   { font-size: 60px;  font-weight: 700; line-height: 1.05; letter-spacing: -0.025em; }
.title-md   { font-size: 44px;  font-weight: 700; line-height: 1.10; letter-spacing: -0.02em; }
.lede       { font-size: 28px;  font-weight: 400; line-height: 1.40; }
.body       { font-size: 20px;  font-weight: 400; line-height: 1.55; }
.body-sm    { font-size: 17px;  font-weight: 400; line-height: 1.55; }
.stat-xxl   { font-size: 140px; font-weight: 800; line-height: 0.90; letter-spacing: -0.04em; }
.stat-xl    { font-size: 96px;  font-weight: 800; line-height: 0.95; letter-spacing: -0.035em; }
.stat-lg    { font-size: 64px;  font-weight: 800; line-height: 1.0;  letter-spacing: -0.03em; }
.stat-label { font-size: 15px;  font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mute); }
.eyebrow    { font-size: 14px;  font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mute); }
.eyebrow.purple { color: var(--purple); }
section.slide.dark .eyebrow { color: #9A9A96; }
section.slide.dark .eyebrow.purple { color: var(--purple-on-dark); }

.slide-no {
  position: absolute; bottom: 48px; right: 60px;
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: var(--mute); letter-spacing: 0.10em;
}
section.slide.dark .slide-no { color: #6B6B68; }

/* ===== SLIDE 1 ===== */
.s1 .pad {
  height: 100%; padding: 110px 140px;
  display: grid; grid-template-rows: auto 1fr auto; gap: 0;
}
.s1 .top-eyebrow { font-size: 14px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #9A9A96; }
.s1 h1 {
  align-self: center; max-width: 1500px;
  font-size: 116px; font-weight: 800; line-height: 0.96; letter-spacing: -0.04em;
  color: var(--paper);
}
.s1 h1 .accent { color: var(--purple-on-dark); }
.s1 .meta-row { display: flex; justify-content: space-between; align-items: flex-end; }
.s1 .brand-lockup { color: #DDDDD9; }
.s1 .meta-right {
  font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #9A9A96;
  letter-spacing: 0.05em; text-align: right;
}

/* ===== SLIDE 2 ===== */
.s2 .pad {
  height: 100%; padding: 80px 160px;
  display: grid; place-items: center; text-align: center;
}
.s2 .wrap { max-width: 1500px; }
.s2 .eyebrow {
  font-size: 24px; font-weight: 600; letter-spacing: 0.30em; text-transform: uppercase;
  color: var(--mute); margin-bottom: 64px;
}
.s2 .quote {
  font-size: 58px; font-weight: 500; line-height: 1.22; letter-spacing: -0.02em;
}
.s2 .quote strong { font-weight: 700; color: var(--ink); }
.s2 .quote em { font-style: normal; font-weight: 700; color: var(--purple); }
.s2 .sub {
  font-size: 22px; color: var(--mute); margin-top: 72px;
  max-width: 1100px; margin-inline: auto; line-height: 1.5;
}

/* ===== SLIDE 3 ===== */
.s3 .pad {
  height: 100%; padding: 90px 120px;
  display: grid; grid-template-rows: auto auto 1fr auto; gap: 28px;
}
.s3 .head h1 {
  font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.10;
  max-width: 1400px; margin-top: 12px;
}
.s3 .cols {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  align-items: stretch;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.s3 .col { padding: 32px 48px; }
.s3 .col + .col { border-left: 1px solid var(--rule); }
.s3 .col-hdr {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 22px;
}
.s3 .col-title { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
.s3 .col-tag {
  font-size: 12px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
}
.s3 .tag-green { color: var(--success); }
.s3 .row {
  display: grid; grid-template-columns: 1fr auto;
  align-items: end;
  padding: 16px 0;
  border-top: 1px dashed var(--rule);
}
.s3 .row:first-of-type { border-top: none; padding-top: 6px; }
.s3 .row .k {
  font-size: 15px; font-weight: 500; color: var(--mute);
  padding-bottom: 8px;
}
.s3 .row .v {
  font-size: 44px; font-weight: 800; letter-spacing: -0.02em; line-height: 1;
  text-align: right;
}
.s3 .row .v.hero { font-size: 76px; font-weight: 800; }
.s3 .row .sub {
  font-size: 13px; color: var(--mute);
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
  margin-top: 6px; text-align: right; grid-column: 1 / -1;
}
.s3 .foot {
  font-size: 15px; color: var(--mute); max-width: 1400px;
  line-height: 1.5;
}

/* ===== SLIDE 4 ===== */
.s4 .pad {
  height: 100%; padding: 90px 120px;
  display: grid; grid-template-rows: auto auto auto 1fr auto; gap: 16px;
}
.s4 h1 {
  font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.12;
  max-width: 1500px; margin-top: 6px;
}
.s4 .lede {
  font-size: 22px; color: var(--ink); max-width: 1500px;
  margin-bottom: 4px;
}
.s4 .chart-wrap { width: 100%; align-self: center; }
.s4 .chart-wrap svg { display: block; width: 100%; height: auto; max-width: 1680px; }
.s4 .stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
  border-top: 1px solid var(--rule); padding-top: 22px;
}
.s4 .stat-block { display: flex; flex-direction: column; gap: 4px; }
.s4 .stat-block .label {
  font-size: 12px; font-weight: 700; letter-spacing: 0.20em; text-transform: uppercase;
  color: var(--purple);
}
.s4 .stat-block .val {
  font-size: 44px; font-weight: 800; letter-spacing: -0.02em; line-height: 1;
  margin-top: 4px;
}
.s4 .stat-block .desc {
  font-size: 14px; color: var(--mute); line-height: 1.5; margin-top: 4px;
}

/* ===== SLIDE 5 ===== */
.s5 .pad {
  height: 100%; padding: 90px 120px;
  display: grid; grid-template-rows: auto auto auto auto 1fr auto; gap: 16px;
}
.s5 h1 {
  font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.10;
  max-width: 1400px; margin-top: 8px;
}
.s5 .lede {
  font-size: 22px; color: var(--ink); max-width: 1400px;
  margin-bottom: 4px;
}
.s5 .chart-title {
  font-size: 14px; font-weight: 600; color: var(--mute);
  letter-spacing: 0.10em; text-transform: uppercase;
}
.s5 .chart-wrap { width: 100%; align-self: center; }
.s5 .chart-wrap svg { display: block; width: 100%; height: auto; max-width: 1680px; }
.s5 .foot {
  font-size: 15px; color: var(--mute);
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
}

/* ===== SLIDES 6-10 — PAIR LAYOUT (1 LANDSCAPE + 1 PORTRAIT) ===== */
.pair .pad {
  height: 100%; padding: 80px 80px;
  display: grid; grid-template-rows: auto 1fr; gap: 28px;
}
.pair .header {
  max-width: 1400px;
}
.pair .header h1 {
  font-size: 40px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.10;
  margin-top: 8px;
}
.pair .pair-row {
  display: grid;
  grid-template-columns: 1265px 350px;
  gap: 28px;
  justify-content: center;
  align-items: stretch;
}

.pair .card {
  background: var(--paper-2);
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.pair .card .img-wrap {
  width: 100%;
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 14px;
}
.pair .card.landscape .img-wrap { aspect-ratio: 16 / 9; }
.pair .card.portrait .img-wrap { aspect-ratio: 1 / 2; }

.pair .card img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.pair .card .text-zone {
  padding: 18px 28px 22px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pair .card.portrait .text-zone {
  padding: 14px 18px 18px 18px;
  gap: 6px;
}

.pair .card .meta-row {
  display: flex; align-items: baseline; gap: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.22em; text-transform: uppercase;
}
.pair .card .meta-row .num { font-weight: 700; color: var(--purple); }
.pair .card .meta-row .sep { color: var(--rule); }
.pair .card .meta-row .cat { font-weight: 600; color: var(--mute); }

.pair .card.landscape h3 {
  font-size: 22px; font-weight: 700; line-height: 1.18;
  letter-spacing: -0.015em; color: var(--ink);
}
.pair .card.portrait h3 {
  font-size: 17px; font-weight: 700; line-height: 1.20;
  letter-spacing: -0.01em; color: var(--ink);
}
.pair .card.landscape p {
  font-size: 15px; line-height: 1.50; color: var(--mute);
}
.pair .card.portrait p {
  font-size: 12.5px; line-height: 1.50; color: var(--mute);
}

/* ===== SLIDE 11 — CLOSING (dark) ===== */
.s11 .pad {
  height: 100%; padding: 110px 140px;
  display: grid; grid-template-rows: auto 1fr auto; gap: 24px;
}
.s11 .top-eyebrow {
  font-size: 14px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--purple-on-dark);
}
.s11 .center { align-self: center; max-width: 1500px; }
.s11 h1 {
  font-size: 76px; font-weight: 800; line-height: 1.02; letter-spacing: -0.03em;
  color: var(--paper);
}
.s11 h1 .accent { color: var(--purple-on-dark); }
.s11 .sub {
  font-size: 28px; line-height: 1.40; color: var(--paper);
  margin-top: 28px; max-width: 1300px; opacity: 0.85;
}
.s11 .meta-row { display: flex; justify-content: space-between; align-items: flex-end; }
.s11 .brand-lockup { color: #DDDDD9; }
.s11 .meta-right { font-size: 16px; color: var(--paper); opacity: 0.7; letter-spacing: 0.04em; }
</style>
</head>
<body>

<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="dash-d" viewBox="0 0 40 39">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1996 5.39684C10.0926 5.61513 10.005 5.8374 10.005 5.8909C10.005 5.94433 9.96177 6.05242 9.90897 6.131C9.85618 6.20966 9.76932 6.38822 9.71594 6.52777C9.66256 6.66733 9.55385 6.92831 9.47433 7.10774C9.39473 7.28717 9.23939 7.64602 9.129 7.90519C9.01869 8.16436 8.81535 8.6374 8.67715 8.95638C8.53887 9.27536 8.20568 10.0583 7.93668 10.6963C7.66761 11.3342 7.41837 11.8872 7.38272 11.9251C7.34706 11.963 7.31794 12.0377 7.31794 12.0912C7.31794 12.1447 7.22331 12.391 7.10762 12.6386C6.99193 12.8861 6.70987 13.529 6.48067 14.0673C6.25154 14.6056 5.95081 15.307 5.81239 15.626C5.67397 15.945 5.50207 16.3527 5.4304 16.5322C5.3065 16.8423 4.77548 18.072 4.63213 18.3808C4.59509 18.4606 4.51593 18.6482 4.45631 18.7977L4.34781 19.0695H7.38533H10.4229L10.5713 18.7252C10.7109 18.4013 10.9644 17.8592 11.7829 16.1334C11.972 15.7347 12.4956 14.6255 12.9463 13.6686C13.397 12.7117 13.9366 11.5698 14.1451 11.1312C14.7699 9.81784 15.1612 8.98059 15.1612 8.95725C15.1612 8.93775 15.8122 7.56903 16.5064 6.12905C16.641 5.84994 16.7847 5.5319 16.8258 5.42221C16.8669 5.3126 16.9341 5.22285 16.975 5.22285C17.0249 5.22285 17.0543 6.72387 17.0641 9.77196C17.0722 12.274 17.0857 14.4189 17.0942 14.5385C17.1026 14.6582 17.1123 15.7265 17.1158 16.9128L17.122 19.0695H20.531C23.015 19.0695 23.9539 19.0921 23.9914 19.1526C24.0197 19.1983 23.9741 19.3696 23.8901 19.5332C23.7189 19.8665 23.1112 21.1495 22.743 21.955C22.6098 22.2461 22.354 22.7844 22.1745 23.1512C21.9949 23.5179 21.696 24.1442 21.5102 24.5429C21.3243 24.9417 21.0083 25.6104 20.8077 26.0291C20.6071 26.4478 20.2481 27.1981 20.0098 27.6965C19.7715 28.1949 19.396 28.9779 19.1754 29.4364C18.9547 29.8949 18.5841 30.6833 18.352 31.1883C18.1198 31.6933 17.8967 32.1663 17.8562 32.2395C17.7235 32.4791 17.2529 33.4559 17.1841 33.6346L17.1168 33.8093L18.4448 33.7564C19.1751 33.7274 19.9035 33.6914 20.0632 33.6765C21.0551 33.5837 21.3689 33.541 21.9878 33.4144C22.3672 33.3368 22.792 33.2566 22.9318 33.2362C23.5154 33.151 25.5201 32.4647 26.4904 32.0178C29.1091 30.8118 31.2859 28.8905 33.029 26.2466C33.2354 25.9336 33.7488 24.9785 33.9842 24.4696C34.4577 23.4461 34.6241 23.0673 34.6241 23.0128C34.6241 22.9834 34.7028 22.7612 34.7991 22.5187C35.1652 21.5967 35.7056 19.4822 35.8937 18.2358C36.0326 17.3156 36.036 15.5188 35.9003 14.7495C35.6326 13.2309 35.2204 12.1055 34.4554 10.805C34.0822 10.1707 33.8441 9.88012 33.0268 9.06179C32.4374 8.4716 31.8287 7.93905 31.5013 7.72707C30.84 7.29869 29.6612 6.65761 29.0685 6.40395C28.2099 6.03654 26.5821 5.50384 25.6189 5.27512L24.6385 5.04234L17.5164 5.02117L10.3943 5L10.1996 5.39684ZM10.3057 19.6676C10.1865 19.9169 9.97041 20.398 9.82539 20.7369C9.68043 21.0758 9.53213 21.4077 9.4959 21.4742C9.45966 21.5408 9.24564 22.0139 9.02036 22.5254C8.79508 23.037 8.51854 23.6513 8.40583 23.8905C8.29312 24.1297 8.08251 24.6028 7.93784 24.9417C7.79318 25.2806 7.61278 25.6884 7.53704 25.8479C7.36754 26.2048 6.90311 27.2399 6.26839 28.6752C6.00397 29.2733 5.72539 29.8931 5.64935 30.0526C5.57332 30.2121 5.36482 30.6688 5.18602 31.0676C5.00715 31.4663 4.67599 32.2003 4.45013 32.6987C4.2242 33.1971 4.02188 33.6457 4.00052 33.6955C3.96966 33.7677 5.29096 33.7861 10.4693 33.7861H16.9768V26.5003V19.2145H13.7496H10.5224L10.3057 19.6676Z"/>
  </symbol>
</svg>

<!-- ============ SLIDE 1 — TITLE ============ -->
<section class="slide dark s1" data-slide="1">
  <div class="pad">
    <div class="top-eyebrow">DASH EXPRESS &nbsp;×&nbsp; <span class="mcd">McDONALD'S</span></div>
    <h1><span class="accent">2 months</span> of delivering for <span class="mcd">McD</span>.</h1>
    <div class="meta-row">
      <div class="brand-lockup">
        <span class="dash-mark"><svg width="32" height="31" fill="#FFFFFF"><use href="#dash-d"/></svg></span>
        <span class="brand-text"><strong>DASH</strong> EXPRESS</span>
      </div>
      <div class="meta-right">Performance &amp; product recap &nbsp;·&nbsp; 10 Mar – 27 Apr 2026</div>
    </div>
  </div>
  <div class="slide-no">01 / 11</div>
</section>

<!-- ============ SLIDE 2 — MANIFESTO ============ -->
<section class="slide s2" data-slide="2">
  <div class="pad">
    <div class="wrap">
      <div class="eyebrow">EIGHT WEEKS &nbsp;·&nbsp; ONE COMMITMENT</div>
      <p class="quote">
        <strong>10,897</strong> completed deliveries.<br>
        <strong>98.4%</strong> completion rate.<br>
        Availability <em>up 27.6 points</em>.
      </p>
      <p class="sub">Two months of partnership with <span class="mcd">McD</span>, measured in customers fed and orders delivered on time.</p>
    </div>
  </div>
  <div class="slide-no">02 / 11</div>
</section>

<!-- ============ SLIDE 3 — DUAL COMPARISON ============ -->
<section class="slide s3" data-slide="3">
  <div class="pad">
    <div class="head">
      <div class="eyebrow purple">PERFORMANCE &nbsp;·&nbsp; WEEKS 1–8</div>
      <h1>Two metrics that matter to <span class="mcd">McD</span>.</h1>
    </div>
    <div></div>
    <div class="cols">
      <div class="col">
        <div class="col-hdr">
          <div class="col-title">Scale</div>
          <div class="col-tag tag-green">● VOLUME</div>
        </div>
        <div class="row">
          <div class="k">Total deliveries</div>
          <div class="v hero">10,897</div>
          <div class="sub">8 weeks · McD on-demand</div>
        </div>
        <div class="row">
          <div class="k">Peak week (W3)</div>
          <div class="v">2,215</div>
          <div class="sub">4.7× the W1 baseline</div>
        </div>
        <div class="row">
          <div class="k">Volume growth</div>
          <div class="v">3.7×</div>
          <div class="sub">W1 472 → W7 1,743</div>
        </div>
      </div>
      <div class="col">
        <div class="col-hdr">
          <div class="col-title">Service</div>
          <div class="col-tag tag-green">● QUALITY</div>
        </div>
        <div class="row">
          <div class="k">Completion rate</div>
          <div class="v hero">98.4%</div>
        </div>
        <div class="row">
          <div class="k">Avg delivery time</div>
          <div class="v">15.8 min</div>
          <div class="sub">Pickup → drop-off · McD outlet to customer</div>
        </div>
        <div class="row">
          <div class="k">Total delivery fee</div>
          <div class="v">Rp 154.1M</div>
          <div class="sub">Service value across 8 weeks</div>
        </div>
      </div>
    </div>
    <div class="foot">Period: 10 March – 27 April 2026.</div>
  </div>
  <div class="slide-no">03 / 11</div>
</section>

<!-- ============ SLIDE 4 — AVAILABILITY ============ -->
<section class="slide s4" data-slide="4">
  <div class="pad">
    <div class="eyebrow purple">AVAILABILITY &nbsp;·&nbsp; WEEKS 1–8</div>
    <h1>When <span class="mcd">McD</span> customers searched, Dash was there <span style="color:var(--purple);">82%</span> of the time — up from <span style="color:var(--mute);">55%</span>.</h1>
    <p class="lede">Across 8 weeks, the share of <span class="mcd">McD</span> customer searches where Dash had a driver available climbed steadily — and the share with no driver in range fell sharply.</p>
    <div class="chart-wrap">
      <svg viewBox="0 0 1680 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Availability and Zero Rate trend, 8 weeks">
        <defs>
          <style>
            .grid-l { stroke:#E4E3DE; stroke-width:1; }
            .axis-base-l { stroke:#1A1A1A; stroke-width:1.5; }
            .axis-label-l { font-family:'JetBrains Mono', monospace; font-size:13px; fill:#6B6B68; letter-spacing:0.05em; }
            .x-week-l { font-family:'Plus Jakarta Sans', sans-serif; font-size:14px; font-weight:700; fill:#1A1A1A; letter-spacing:0.04em; }
            .x-date-l { font-family:'JetBrains Mono', monospace; font-size:12px; fill:#6B6B68; letter-spacing:0.04em; }
            .line-avail { stroke:#5E2AAC; stroke-width:3.5; fill:none; stroke-linecap:round; stroke-linejoin:round; }
            .line-zero  { stroke:#9A9A96; stroke-width:2; fill:none; stroke-dasharray:6,5; stroke-linecap:round; }
            .dot-avail { fill:#5E2AAC; }
            .dot-zero  { fill:#9A9A96; }
            .legend-text { font-family:'Plus Jakarta Sans', sans-serif; font-size:14px; font-weight:600; letter-spacing:0.04em; }
            .pt-label { font-family:'JetBrains Mono', monospace; font-size:13px; font-weight:600; letter-spacing:0.04em; }
          </style>
        </defs>
        <line class="grid-l" x1="100" y1="50"  x2="1620" y2="50"/>
        <line class="grid-l" x1="100" y1="117.5" x2="1620" y2="117.5"/>
        <line class="grid-l" x1="100" y1="185" x2="1620" y2="185"/>
        <line class="grid-l" x1="100" y1="252.5" x2="1620" y2="252.5"/>
        <line class="axis-base-l" x1="100" y1="320" x2="1620" y2="320"/>
        <text class="axis-label-l" x="88" y="54"   text-anchor="end">100%</text>
        <text class="axis-label-l" x="88" y="121"  text-anchor="end">75%</text>
        <text class="axis-label-l" x="88" y="189"  text-anchor="end">50%</text>
        <text class="axis-label-l" x="88" y="256"  text-anchor="end">25%</text>
        <text class="axis-label-l" x="88" y="324"  text-anchor="end">0%</text>
        <g transform="translate(1180, 22)">
          <line x1="0" y1="6" x2="32" y2="6" stroke="#5E2AAC" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="16" cy="6" r="4" fill="#5E2AAC"/>
          <text class="legend-text" x="40" y="11" fill="#1A1A1A">Availability Rate</text>
          <line x1="220" y1="6" x2="252" y2="6" stroke="#9A9A96" stroke-width="2" stroke-dasharray="6,5"/>
          <circle cx="236" cy="6" r="3.5" fill="#9A9A96"/>
          <text class="legend-text" x="260" y="11" fill="#6B6B68">Zero Rate (no driver)</text>
        </g>
        <path class="line-avail" d="M195,172.15 L385,133.89 L575,177.01 L765,144.66 L955,121.52 L1145,103.92 L1335,95.09 L1525,97.49"/>
        <path class="line-zero"  d="M195,178.79 L385,231.01 L575,186.75 L765,216.10 L955,241.67 L1145,261.57 L1335,271.26 L1525,267.27"/>
        <circle class="dot-avail" cx="195"  cy="172.15" r="5"/>
        <circle class="dot-avail" cx="385"  cy="133.89" r="5"/>
        <circle class="dot-avail" cx="575"  cy="177.01" r="5"/>
        <circle class="dot-avail" cx="765"  cy="144.66" r="5"/>
        <circle class="dot-avail" cx="955"  cy="121.52" r="5"/>
        <circle class="dot-avail" cx="1145" cy="103.92" r="5"/>
        <circle class="dot-avail" cx="1335" cy="95.09"  r="6.5" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle class="dot-avail" cx="1525" cy="97.49"  r="6.5" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle class="dot-zero" cx="195"  cy="178.79" r="4"/>
        <circle class="dot-zero" cx="385"  cy="231.01" r="4"/>
        <circle class="dot-zero" cx="575"  cy="186.75" r="4"/>
        <circle class="dot-zero" cx="765"  cy="216.10" r="4"/>
        <circle class="dot-zero" cx="955"  cy="241.67" r="4"/>
        <circle class="dot-zero" cx="1145" cy="261.57" r="4"/>
        <circle class="dot-zero" cx="1335" cy="271.26" r="4"/>
        <circle class="dot-zero" cx="1525" cy="267.27" r="4"/>
        <text class="pt-label" x="180" y="160" text-anchor="end" fill="#5E2AAC">54.8%</text>
        <text class="pt-label" x="180" y="194" text-anchor="end" fill="#6B6B68">52.3%</text>
        <text class="pt-label" x="1540" y="89" text-anchor="start" fill="#5E2AAC" style="font-weight:700;">82.4%</text>
        <text class="pt-label" x="1540" y="282" text-anchor="start" fill="#6B6B68">19.5%</text>
        <text class="x-week-l" x="195"  y="346" text-anchor="middle">W1</text>
        <text class="x-date-l" x="195"  y="364" text-anchor="middle">10 Mar</text>
        <text class="x-week-l" x="385"  y="346" text-anchor="middle">W2</text>
        <text class="x-date-l" x="385"  y="364" text-anchor="middle">16 Mar</text>
        <text class="x-week-l" x="575"  y="346" text-anchor="middle">W3</text>
        <text class="x-date-l" x="575"  y="364" text-anchor="middle">23 Mar</text>
        <text class="x-week-l" x="765"  y="346" text-anchor="middle">W4</text>
        <text class="x-date-l" x="765"  y="364" text-anchor="middle">30 Mar</text>
        <text class="x-week-l" x="955"  y="346" text-anchor="middle">W5</text>
        <text class="x-date-l" x="955"  y="364" text-anchor="middle">6 Apr</text>
        <text class="x-week-l" x="1145" y="346" text-anchor="middle">W6</text>
        <text class="x-date-l" x="1145" y="364" text-anchor="middle">13 Apr</text>
        <text class="x-week-l" x="1335" y="346" text-anchor="middle">W7</text>
        <text class="x-date-l" x="1335" y="364" text-anchor="middle">20 Apr</text>
        <text class="x-week-l" x="1525" y="346" text-anchor="middle">W8</text>
        <text class="x-date-l" x="1525" y="364" text-anchor="middle">27 Apr</text>
      </svg>
    </div>
    <div class="stats-row">
      <div class="stat-block">
        <div class="label">TOTAL CUSTOMER SEARCHES</div>
        <div class="val">20,133</div>
        <div class="desc">McD app sessions where delivery options loaded · 8 weeks</div>
      </div>
      <div class="stat-block">
        <div class="label">DASH AVAILABLE</div>
        <div class="val">13,585</div>
        <div class="desc">Times a Dash driver was in range and ready to deliver</div>
      </div>
      <div class="stat-block">
        <div class="label">ZERO RATE — REDUCTION</div>
        <div class="val" style="color:var(--purple);">−63%</div>
        <div class="desc">Share with no driver fell from 52.3% (W1) to 19.5% (W8)</div>
      </div>
    </div>
  </div>
  <div class="slide-no">04 / 11</div>
</section>

<!-- ============ SLIDE 5 — VOLUME TREND ============ -->
<section class="slide s5" data-slide="5">
  <div class="pad">
    <div class="eyebrow purple">TREND &nbsp;·&nbsp; WEEKLY VOLUME</div>
    <h1>Eight weeks, scaling for <span class="mcd">McD</span> demand.</h1>
    <p class="lede">Volume nearly 5× from W1 baseline before stabilising at the new operating level.</p>
    <div class="chart-title">Weekly Completed Deliveries</div>
    <div class="chart-wrap">
      <svg viewBox="0 0 1680 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Weekly completed deliveries bar chart">
        <defs>
          <style>
            .grid { stroke:#E4E3DE; stroke-width:1; }
            .axis-base { stroke:#1A1A1A; stroke-width:1.5; }
            .axis-label { font-family:'JetBrains Mono', monospace; font-size:13px; fill:#6B6B68; letter-spacing:0.05em; }
            .x-week { font-family:'Plus Jakarta Sans', sans-serif; font-size:14px; font-weight:700; fill:#1A1A1A; letter-spacing:0.04em; }
            .x-date { font-family:'JetBrains Mono', monospace; font-size:12px; fill:#6B6B68; letter-spacing:0.04em; }
            .x-partial { font-family:'JetBrains Mono', monospace; font-size:11px; font-style:italic; fill:#9A8DC0; letter-spacing:0.04em; }
            .bar { fill:#5E2AAC; }
            .bar-partial { fill:#5E2AAC; fill-opacity:0.45; }
            .bar-value { font-family:'JetBrains Mono', monospace; font-size:13px; font-weight:500; fill:#5E2AAC; letter-spacing:0.04em; }
            .bar-value-peak { font-family:'JetBrains Mono', monospace; font-size:15px; font-weight:700; fill:#1A1A1A; letter-spacing:0.04em; }
            .ann-pull { font-family:'Plus Jakarta Sans', sans-serif; font-size:16px; font-weight:600; fill:#1A1A1A; }
            .ann-cap  { font-family:'JetBrains Mono', monospace; font-size:13px; fill:#6B6B68; letter-spacing:0.04em; }
            .ann-line { stroke:#1A1A1A; stroke-width:1; }
          </style>
        </defs>
        <line class="grid" x1="100" y1="76.5"  x2="1620" y2="76.5"/>
        <line class="grid" x1="100" y1="198.3" x2="1620" y2="198.3"/>
        <line class="axis-base" x1="100" y1="320" x2="1620" y2="320"/>
        <text class="axis-label" x="88" y="80"  text-anchor="end">2,000</text>
        <text class="axis-label" x="88" y="202" text-anchor="end">1,000</text>
        <text class="axis-label" x="88" y="324" text-anchor="end">0</text>
        <rect class="bar" x="155" y="262.6" width="80" height="57.4" data-week="W1" data-value="472"/>
        <text class="bar-value" x="195" y="252" text-anchor="middle">472</text>
        <rect class="bar" x="345" y="214.6" width="80" height="105.4" data-week="W2" data-value="866"/>
        <text class="bar-value" x="385" y="204" text-anchor="middle">866</text>
        <rect class="bar" x="535" y="50.5" width="80" height="269.5" data-week="W3" data-value="2215"/>
        <text class="bar-value-peak" x="575" y="38" text-anchor="middle">2,215</text>
        <rect class="bar" x="725" y="116.6" width="80" height="203.4" data-week="W4" data-value="1672"/>
        <text class="bar-value" x="765" y="106" text-anchor="middle">1,672</text>
        <rect class="bar" x="915" y="133.1" width="80" height="186.9" data-week="W5" data-value="1536"/>
        <text class="bar-value" x="955" y="123" text-anchor="middle">1,536</text>
        <rect class="bar" x="1105" y="133.0" width="80" height="187.0" data-week="W6" data-value="1537"/>
        <text class="bar-value" x="1145" y="123" text-anchor="middle">1,537</text>
        <rect class="bar" x="1295" y="107.9" width="80" height="212.1" data-week="W7" data-value="1743"/>
        <text class="bar-value" x="1335" y="97" text-anchor="middle">1,743</text>
        <rect class="bar-partial" x="1485" y="215.9" width="80" height="104.1" data-week="W8" data-value="856"/>
        <text class="bar-value" x="1525" y="206" text-anchor="middle" style="fill:#9A8DC0;">856</text>
        <line class="ann-line" x1="618" y1="50.5" x2="700" y2="50.5"/>
        <text class="ann-pull" x="708" y="48" text-anchor="start">Peak — 2,215 deliveries</text>
        <text class="ann-cap"  x="708" y="68" text-anchor="start">4.7× the W1 baseline</text>
        <text class="x-week" x="195"  y="346" text-anchor="middle">W1</text>
        <text class="x-date" x="195"  y="364" text-anchor="middle">10 Mar</text>
        <text class="x-week" x="385"  y="346" text-anchor="middle">W2</text>
        <text class="x-date" x="385"  y="364" text-anchor="middle">16 Mar</text>
        <text class="x-week" x="575"  y="346" text-anchor="middle">W3</text>
        <text class="x-date" x="575"  y="364" text-anchor="middle">23 Mar</text>
        <text class="x-week" x="765"  y="346" text-anchor="middle">W4</text>
        <text class="x-date" x="765"  y="364" text-anchor="middle">30 Mar</text>
        <text class="x-week" x="955"  y="346" text-anchor="middle">W5</text>
        <text class="x-date" x="955"  y="364" text-anchor="middle">6 Apr</text>
        <text class="x-week" x="1145" y="346" text-anchor="middle">W6</text>
        <text class="x-date" x="1145" y="364" text-anchor="middle">13 Apr</text>
        <text class="x-week" x="1335" y="346" text-anchor="middle">W7</text>
        <text class="x-date" x="1335" y="364" text-anchor="middle">20 Apr</text>
        <text class="x-week" x="1525" y="346" text-anchor="middle" style="fill:#9A8DC0;">W8</text>
        <text class="x-partial" x="1525" y="364" text-anchor="middle">27 Apr · partial</text>
      </svg>
    </div>
    <div class="foot">Total: 10,897 completed deliveries across 8 weeks.</div>
  </div>
  <div class="slide-no">05 / 11</div>
</section>

<!-- ============ SLIDE 6 — PAIR 1: COMMUNICATION ============ -->
<section class="slide pair s6" data-slide="6">
  <div class="pad">
    <div class="header">
      <div class="eyebrow purple">WHAT WE BUILT &nbsp;·&nbsp; COMMUNICATION</div>
      <h1>Real-time alerts where ops needs them.</h1>
    </div>
    <div class="pair-row">
      <div class="card landscape">
        <div class="img-wrap"><img src="feature-01-notification.png" alt="Notification — Next Portal" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:14px;letter-spacing:.05em;border-radius:2px'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">01</span><span class="sep">·</span><span class="cat">PORTAL</span></div>
          <h3>Notification — Next Portal</h3>
          <p>Real-time order alerts in the McD ops portal so the kitchen always knows what's in flight.</p>
        </div>
      </div>
      <div class="card portrait">
        <div class="img-wrap"><img src="feature-02-broadcast.png" alt="Broadcast — Mobile" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.05em;border-radius:2px;text-align:center'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">02</span><span class="sep">·</span><span class="cat">MOBILE</span></div>
          <h3>Broadcast — Mobile</h3>
          <p>Faster info to drivers serving McD outlets at peak hours.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="slide-no">06 / 11</div>
</section>

<!-- ============ SLIDE 7 — PAIR 2: CUSTOMER FLEXIBILITY ============ -->
<section class="slide pair s7" data-slide="7">
  <div class="pad">
    <div class="header">
      <div class="eyebrow purple">WHAT WE BUILT &nbsp;·&nbsp; CUSTOMER FLEXIBILITY</div>
      <h1>More options for the end customer.</h1>
    </div>
    <div class="pair-row">
      <div class="card landscape">
        <div class="img-wrap"><img src="feature-03-cod.png" alt="COD" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:14px;letter-spacing:.05em;border-radius:2px'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">03</span><span class="sep">·</span><span class="cat">PAYMENT</span></div>
          <h3>COD</h3>
          <p>Cash-on-delivery option for end customers — payment flexibility unlocked.</p>
        </div>
      </div>
      <div class="card portrait">
        <div class="img-wrap"><img src="feature-07-reservation.png" alt="Reservation" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.05em;border-radius:2px;text-align:center'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">05</span><span class="sep">·</span><span class="cat">MOBILE</span></div>
          <h3>Reservation</h3>
          <p>Advance scheduling for events and catering orders — peace of mind for customers.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="slide-no">07 / 11</div>
</section>

<!-- ============ SLIDE 8 — PAIR 3: SMARTER DISPATCH ============ -->
<section class="slide pair s8" data-slide="8">
  <div class="pad">
    <div class="header">
      <div class="eyebrow purple">WHAT WE BUILT &nbsp;·&nbsp; SMARTER DISPATCH</div>
      <h1>Visibility today, recovery when it matters.</h1>
    </div>
    <div class="pair-row">
      <div class="card landscape">
        <div class="img-wrap"><img src="feature-05-heatmap.png" alt="Heat Map — Tab Request" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:14px;letter-spacing:.05em;border-radius:2px'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">04</span><span class="sep">·</span><span class="cat">DASHBOARD</span></div>
          <h3>Heat Map — Tab Request</h3>
          <p>Demand visibility per outlet — drivers positioned proactively for McD peaks.</p>
        </div>
      </div>
      <div class="card portrait">
        <div class="img-wrap"><img src="feature-08-reallocate.png" alt="Re-allocate Delivery" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.05em;border-radius:2px;text-align:center'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">06</span><span class="sep">·</span><span class="cat">DISPATCH</span></div>
          <h3>Re-allocate Delivery</h3>
          <p>System auto-reassigns failed orders to nearby drivers — fewer cancellations.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="slide-no">08 / 11</div>
</section>

<!-- ============ SLIDE 9 — PAIR 4: DRIVER RELIABILITY ============ -->
<section class="slide pair s9" data-slide="9">
  <div class="pad">
    <div class="header">
      <div class="eyebrow purple">WHAT WE BUILT &nbsp;·&nbsp; DRIVER RELIABILITY</div>
      <h1>Reliable drivers, predictable service.</h1>
    </div>
    <div class="pair-row">
      <div class="card landscape">
        <div class="img-wrap"><img src="feature-04-payroll.png" alt="Auto Payroll" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:14px;letter-spacing:.05em;border-radius:2px'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">07</span><span class="sep">·</span><span class="cat">MITRA OPS</span></div>
          <h3>Auto Payroll</h3>
          <p>Automated payroll → lower driver churn → more stable service for McD.</p>
        </div>
      </div>
      <div class="card portrait">
        <div class="img-wrap"><img src="feature-06-clockout.png" alt="Working Hour — Clock-Out Notif" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.05em;border-radius:2px;text-align:center'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">08</span><span class="sep">·</span><span class="cat">MITRA</span></div>
          <h3>Working Hour — Clock-Out</h3>
          <p>Driver shift discipline — fewer mid-order drop-offs.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="slide-no">09 / 11</div>
</section>

<!-- ============ SLIDE 10 — PAIR 5: SCALING SUPPLY ============ -->
<section class="slide pair s10" data-slide="10">
  <div class="pad">
    <div class="header">
      <div class="eyebrow purple">WHAT WE BUILT &nbsp;·&nbsp; SCALING SUPPLY</div>
      <h1>Built to grow with <span class="mcd">McD</span> demand.</h1>
    </div>
    <div class="pair-row">
      <div class="card landscape">
        <div class="img-wrap"><img src="feature-09-freelance.png" alt="Freelance Hiring Process" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:14px;letter-spacing:.05em;border-radius:2px'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">09</span><span class="sep">·</span><span class="cat">SUPPLY</span></div>
          <h3>Freelance Hiring Process</h3>
          <p>Faster supply expansion — more drivers available as McD volume grows.</p>
        </div>
      </div>
      <div class="card portrait">
        <div class="img-wrap"><img src="feature-10-dayoff.png" alt="Jadwal Day Off — Mitra Mobile" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:'['+this.src.split('/').pop()+']',style:'width:100%;height:100%;background:#EEE5FB;border:1px dashed #BFBDB4;display:grid;place-items:center;color:#6B6B68;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.05em;border-radius:2px;text-align:center'}))"></div>
        <div class="text-zone">
          <div class="meta-row"><span class="num">10</span><span class="sep">·</span><span class="cat">MITRA</span></div>
          <h3>Jadwal Day Off — Mobile</h3>
          <p>Pre-schedule day-off in app — better roster predictability for peaks.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="slide-no">10 / 11</div>
</section>

<!-- ============ SLIDE 11 — CLOSING (dark) ============ -->
<section class="slide dark s11" data-slide="11">
  <div class="pad">
    <div class="top-eyebrow">DASH EXPRESS &nbsp;·&nbsp; MAY 2026 → BEYOND</div>
    <div class="center">
      <h1>Building delivery infrastructure for <span class="mcd">McD</span>.</h1>
      <p class="sub">Next chapter: continued availability gains, supply scaling for peak periods, deeper portal integrations.</p>
    </div>
    <div class="meta-row">
      <div class="brand-lockup">
        <span class="dash-mark"><svg width="32" height="31" fill="#FFFFFF"><use href="#dash-d"/></svg></span>
        <span class="brand-text"><strong>DASH</strong> EXPRESS</span>
      </div>
      <div class="meta-right">Thank you &nbsp;·&nbsp; Q&amp;A welcome</div>
    </div>
  </div>
  <div class="slide-no">11 / 11</div>
</section>

</body>
</html>
```

---

## Reference — `pattern-map.md`

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
