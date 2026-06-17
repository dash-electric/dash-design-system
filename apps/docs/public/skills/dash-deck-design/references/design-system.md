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
