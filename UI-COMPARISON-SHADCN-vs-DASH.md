# UI Design Comparison — Shadcn vs Dash DS

> Honest visual audit. Reads both sources side-by-side. Surfaces concrete fixes (file paths + LOC + before/after intent) — no abstract advice.
>
> **Sources analyzed**
> - shadcn: ui.shadcn.com landing, /docs, /docs/installation, /docs/components/button, /docs/components/accordion, /docs/components/data-table, /blocks, /charts, /themes
> - dash: `apps/docs/components/docs/*` (10 primitives), `apps/docs/app/(docs)/layout.tsx`, `apps/docs/app/globals.css`, sample component + architecture pages
>
> Author bias acknowledged: shadcn = the calibrated taste baseline almost all modern DS docs sites copy. "Rapi" means *restrained, hairline, generously spaced, low-chroma, monochrome-by-default*. Dash today reads as **maximalist, badge-heavy, big-typography, multi-color**. That gap is what this doc itemizes.

---

## Executive Summary

### Why shadcn looks "rapi"
1. **Restraint by default.** Title = ~3xl, not 7xl. No status pill. No eyebrow row. No tabs row. Description = one short sentence. The page header occupies ~120px of vertical space, not ~280px. The component is the star, the chrome shuts up.
2. **One accent color, used sparingly.** Black/white/zinc plus a single accent on the primary button + active sidebar item. No purple, success-green, error-red, warning-yellow, information-blue, feature-purple, highlighted-pink, stable-teal, verified-sky, away-yellow status badges fighting each other on the same screen.
3. **Hairline hierarchy.** h2 = `text-2xl font-semibold` with no top-border separator; h3 = `text-lg`. Spacing between sections = `mt-12` not `pt-6 border-t`. Sections separate by whitespace, not lines. The reader's eye glides; it doesn't trip on rules.

### Why Dash looks "berantakan"
1. **Title typography is shouting.** `text-5xl lg:text-7xl font-semibold tracking-tighter` (`page-shell.tsx:114`). That's 72px–112px on a docs page. Combined with a colored status pill + eyebrow category + 1.25rem-leading-relaxed description + sub-tabs nav = the hero is taller than the first preview.
2. **Status pill ecosystem is loud.** 7 status states × 4 color variants each = up to 28 distinct pill colors across the site (`page-shell.tsx:62-94`). Stable green, beta blue, WIP yellow, deprecated red, planned gray, new purple all coexist. Shadcn has zero.
3. **Border-everything pattern.** `DocsSection` adds `border-t border-stroke-soft-200/60` between every section (`page-shell.tsx:173`). DocsPreview has a 4-border container. DocsCode has its own border. DocsExample wraps a `rounded-xl overflow-hidden` border around both. The page reads as a stack of boxes-in-boxes — not a flowing article.

---

## Visual Dimensions

### Dimension 1 — Header / Topbar

**Shadcn** (`ui.shadcn.com/docs/installation`)
- Sticky 56–60px height. Logo + 5 text links (Docs, Components, Blocks, Charts, Colors). Right side: search pill, GitHub star count, theme toggle. No version badge. No layout toggle. Single zinc-200 hairline bottom border.

**Dash** (`apps/docs/components/docs/topbar.tsx:71-156`)
- 56px (`h-14`), correct. But carries: logo + `v1.0` badge (line 80) + 4 text links + search pill + **layout-mode toggle** (lines 123-141) + GitHub icon + theme toggle. The layout-mode toggle is one button the user touches once and then never again — it lives in prime real estate forever.

**Diff** Dash's topbar has one extra control that 95% of visitors will ignore. The `v1.0` chip is purely decorative.

**Fix**
- Remove layout-mode toggle from topbar. Move to a Settings popover or kill it entirely (most shadcn-style docs sites don't have one).
- Drop `v1.0` chip. Move version into footer or `/docs/changelog`.
- File: `apps/docs/components/docs/topbar.tsx:80-83`, `:123-141`.
- Effort: 10 min. Impact: topbar reads cleaner, search becomes the dominant secondary action.

---

### Dimension 2 — Sidebar density + organization

**Shadcn** (`ui.shadcn.com/docs/installation`)
- ~7 section headers (Get Started, Installation, Dark Mode, Components, Registry, Blocks). Section header = `text-sm font-medium` zinc-900. Items = `text-sm` zinc-600 → zinc-900 on active. **No status badges.** Active item = subtle bg + left border in accent. Items per group: 5–12 typical, never 70+ on the rail (long inventories like Components live on a `/docs/components` overview page).

**Dash** (`apps/docs/components/docs/sidebar.tsx`, `nav-config.ts`)
- 9 sections. Per-item right-side status pills `WIP`/`Soon` (`sidebar.tsx:8-21`). Some sections have multiple groups with their own sub-headings (`nav-config.ts:84-95` Foundations → Brand). Good news: the May 2026 restructure already moved component inventory off the rail (line 209+ note). But the rail still carries Wave-5 markers like "Testing Locally (Wave 5)" (`nav-config.ts:42-43`) and "Pilot Ops Manual" with `new` status (`nav-config.ts:189`).

**Diff** Dash uses the rail to broadcast development phase. Shadcn uses it purely for navigation. Status decoration noise on the rail makes scanning to a specific item harder, not easier.

**Fix**
- Drop `WIP`/`Soon` pills from sidebar. If an item is unfinished, either don't ship it to the rail or stub it with a "Coming soon" page.
- Strip "(Wave 5)" suffixes from titles. Internal sprint nomenclature has no place in user-facing nav.
- File: `apps/docs/components/docs/sidebar.tsx:8-21` (delete `StatusDot`), `nav-config.ts:42, 43, 187, 188, 189` (clean titles).
- Effort: 15 min. Impact: rail becomes ~30% less noisy, items align uniformly.

---

### Dimension 3 — Page header (the big one)

**Shadcn** (`ui.shadcn.com/docs/components/accordion`)
- Pattern: `Accordion` (h1, `text-3xl font-bold tracking-tight`) → one-sentence description (`text-muted-foreground`, ~`text-lg`). Done. No category eyebrow. No status pill. No tabs row. Total header height: ~120px desktop.

**Dash** (`apps/docs/components/docs/page-shell.tsx:96-158`, used on every component page e.g. `button/page.tsx:27-38`)
- Pattern: breadcrumb → eyebrow ("Actions") + copy-page button on far right → **h1 `text-5xl lg:text-7xl font-semibold tracking-tighter leading-[0.95]`** → status pill ("Stable" green) → 2-line description `text-lg lg:text-xl` `max-w-2xl` → sub-tabs row (Usage / Spec / Status) with border-b. Total header height: ~280–360px desktop.

**Diff** Dash's hero is 2–3× taller than shadcn's. The 7xl title on a docs page reads as marketing-page energy, not reference-doc energy. The status pill adds a colored chip that pulls the eye away from the title.

**Fix (CRITICAL)**
- Cap title at `text-3xl lg:text-4xl font-bold tracking-tight`. Match shadcn calibration.
- Drop the status pill from component pages. If a component is WIP, banner it inline below the description (a single grey note line, not a colored chip).
- Remove the sub-tabs row from `DocsHeader` default. Make `tabs` a separate, rare component used only on architecture pages.
- File: `apps/docs/components/docs/page-shell.tsx:96-158`.
- Effort: 30 min. Impact: every single component page drops ~180px of vertical chrome, surfaces the preview faster.

---

### Dimension 4 — Section headings (h2)

**Shadcn**
- `text-2xl font-semibold tracking-tight`, no top border, generous `mt-12` margin above.

**Dash** (`page-shell.tsx:168-188`)
- `text-2xl lg:text-3xl font-semibold tracking-tight` + `pt-6 border-t border-stroke-soft-200/60` between every section.

**Diff** The border-t turns the page into stacked panels. Shadcn lets whitespace do the separation work.

**Fix (CRITICAL)**
- Remove `border-t border-stroke-soft-200/60 first:border-t-0` from `DocsSection`. Replace `pt-6` with `pt-10` (more vertical breathing room).
- Optional: cap h2 at `text-2xl` (drop the `lg:text-3xl`).
- File: `apps/docs/components/docs/page-shell.tsx:173`.
- Effort: 2 min. Impact: pages read as flowing prose, not stacked containers.

---

### Dimension 5 — Code blocks

**Shadcn**
- Dark surface (#0a0a0a-ish), rounded-md, no header bar by default. A floating copy button appears top-right on hover only. For tabbed code (npm/pnpm/yarn/bun) a single thin tab row above. Language label is *implicit* — you see it's bash from the `$` prefix.

**Dash** (`apps/docs/components/docs/code-block.tsx:73-124`)
- `bg-[#0d1117]` (good GitHub-dark choice), `rounded-xl border border-white/5` (correct). But: **always-visible 36px header bar** with uppercase 10px language label + copy button (lines 82-107). Header is `h-9 px-4 border-b border-white/5 bg-white/[0.02]`. Every code block carries that overhead, even one-liners.

**Diff** Dash's persistent header bar means a 3-line `pnpm add` command renders as a 7-line block. On a doc page with 10 code samples that's 40 extra lines of chrome.

**Fix (IMPORTANT)**
- Make the header bar visible only when `language` is set AND a tab-strip is required. For single-language blocks, make the copy button float top-right with `opacity-0 group-hover:opacity-100`.
- Drop the uppercase language label by default — keep it only if explicitly passed.
- File: `apps/docs/components/docs/code-block.tsx:71, 82-107`.
- Effort: 20 min. Impact: code blocks become 25–40% shorter visually, dense docs read faster.

---

### Dimension 6 — Live preview frame

**Shadcn** (`/docs/components/button`)
- Preview = `rounded-md border` light-bg surface, `p-10`, centered. Tabs ABOVE: `Preview | Code`. Switching tabs swaps surface — they don't stack. Compact.

**Dash** (`apps/docs/components/docs/preview.tsx`, used via `DocsExample` in `page-shell.tsx:258-281`)
- Preview surface = `border-x border-t rounded-t-xl` *then* DocsCode below with `rounded-none rounded-b-xl border-x border-b` = a unified container with shared border (`page-shell.tsx:270-279`). Optional `label` row adds another 36px hairline strip with "Preview" + label uppercase 10px.

**Diff** Two opposing philosophies. Shadcn = tabs (one surface, two views). Dash = stacked (two surfaces, both visible). Dash's stacked approach **shows more** but uses 2× the vertical space per example. With 8 examples per component page, that's massive.

**Fix (CRITICAL)**
- Add a `<Tabs>` to `DocsExample` so users switch between Preview/Code. Show preview by default. Keep stacked-view as an opt-in `mode="stacked"` prop for pages that benefit from side-by-side learning (e.g. step-by-step tutorials).
- The optional `label` strip on `DocsPreview` is dead weight on 95% of usages — make it `false` by default (currently undefined, but `DocsExample` passes title as label every time at `page-shell.tsx:271`).
- File: `apps/docs/components/docs/preview.tsx`, `page-shell.tsx:258-281`.
- Effort: 2 hr (tabs is the real work; can vendor shadcn Tabs since Dash already has one). Impact: doc pages compress ~40% vertically.

---

### Dimension 7 — Copy-code affordance

**Shadcn** Floating top-right, `opacity-0 group-hover:opacity-100`, copy icon → check on success. Subtle.

**Dash** (`code-block.tsx:87-105`) Always-visible button in the persistent header bar. `size-7` rounded-md.

**Diff** Dash's button is heavier (always-on, in a bar with its own border-bottom). It works fine — but it's the difference between a polite chrome element and an in-your-face one.

**Fix** Folded into Dimension 5 fix above.

---

### Dimension 8 — Typography

**Shadcn** Geist Sans default (or Inter fallback). Tight tracking. Modest weight ramp (400/500/600/700). Headings = `font-bold tracking-tight`, not `font-semibold tracking-tighter`.

**Dash** (`apps/docs/app/layout.tsx:6-10`, `apps/docs/app/globals.css:584-755`)
- Plus Jakarta Sans 400/500/600/700. Fine typeface. BUT: the typography ramp ships **18 utility classes** (`text-title-h1` through `text-paragraph-x-small` + subheadings) with letter-spacing baked per class (line 586+). Doc pages bypass all of them and use raw Tailwind (`text-5xl lg:text-7xl font-semibold tracking-tighter` etc.) — so the system tokens compete with one-off sizes.
- Plus Jakarta is rounder/friendlier than Geist or Inter, which actually amplifies the "maximalist" feel when used at 7xl.

**Diff** Two problems: (1) docs site doesn't use its own typography tokens, (2) Plus Jakarta at 7xl reads brand/marketing, not docs.

**Fix (IMPORTANT)**
- Audit `page-shell.tsx` to consume the `text-title-h*` / `text-paragraph-*` classes from `globals.css:584+` instead of raw `text-5xl text-7xl text-lg text-xl` utilities. Forces type ramp consistency.
- For docs site specifically, consider switching to Geist (`next/font/google` has it). Plus Jakarta stays the product brand font; Geist would signal "this is a reference doc, not a marketing site". This is a taste call — flag for design review.
- File: `apps/docs/components/docs/page-shell.tsx` (replace inline sizes), `apps/docs/app/layout.tsx:6-10` (optional font swap).
- Effort: 1 hr ramp consolidation, 15 min font swap. Impact: docs feel like docs.

---

### Dimension 9 — Spacing / vertical rhythm

**Shadcn** Sections separated by `mt-12` (48px) whitespace, no rules. Items within a section: `space-y-4` (16px). The page breathes — there's *air* between things.

**Dash** (`page-shell.tsx:29, 173, 185, 281`) Article = `space-y-14` (56px between sections). Sections = `space-y-6` internally (24px). With borders adding visual weight, the rhythm feels tighter than the numbers suggest because the eye reads the border-t as a section boundary AND the 24px space inside as another. Net: the page feels denser than shadcn.

**Diff** Dash actually uses MORE pixels of vertical space than shadcn (14 ≈ 56px > shadcn's 48px) but FEELS more cramped because of the border-t lines. Removing borders + keeping spacing solves it.

**Fix** Folded into Dimension 4 fix above (remove border-t).

---

### Dimension 10 — Whitespace inside containers

**Shadcn** Preview frames = `p-10`. Cards = `p-6`. Code blocks = `p-4` body padding.

**Dash** (`preview.tsx:57`) Preview = `p-10 lg:p-14` (40–56px). Generous, matches shadcn. Cards (in architecture pages e.g. `layered/page.tsx:80-99`) = `px-4 py-5`. Tighter than shadcn's `p-6`.

**Diff** Preview is good. Cards in architecture pages are a bit tight, but minor.

**Fix (NICE-TO-HAVE)** Bump architecture hero-metric cards from `px-4 py-5` to `p-6`. File: `apps/docs/app/(docs)/docs/architecture/layered/page.tsx:84`. Effort: 1 min.

---

### Dimension 11 — Color palette

**Shadcn** Black, white, zinc 50/100/200/600/900. ONE accent. Optional destructive red. That's it. Charts use a coordinated 5-color sequential palette, intentional.

**Dash** (`apps/docs/app/globals.css`)
- 12 color scales × 11 shades + alpha variants = ~140 raw colors (`globals.css:18-192`). Semantic mapping is good (lines 232-280) — but the palette includes feature (purple), highlighted (pink), stable (teal), verified (sky), away (yellow), faded (slate) as *first-class* state colors alongside error/warning/success/information.
- A single doc page can render: purple primary (`page-shell.tsx:88`), green success-pill (status="stable"), purple PropsTable type column (`page-shell.tsx:224`), blue information, red error, yellow warning all at once depending on what's documented.

**Diff** Dash has a fully-resolved state semantic system because it's a *product* design system serving 10+ verticals. That's correct for the product. But on the *docs site* the palette being available ≠ it should all appear at once. Shadcn's docs deliberately use ONE accent so each page reads as a single visual statement.

**Fix (IMPORTANT)**
- On the docs site specifically, restrict accent usage to purple + zinc. Move status indicators to neutral language ("Stable" as small uppercase grey label, not green pill). Save state colors for actual error/warning/success demos inside component pages.
- File: `apps/docs/components/docs/page-shell.tsx:62-94` (STATUS_META → make all "Stable" use neutral, others use information-light only).
- Effort: 15 min. Impact: dramatic visual quietening.

---

### Dimension 12 — Iconography

**Shadcn** Lucide everywhere. `strokeWidth={2}` default. Consistent 16px (`size-4`) or 20px (`size-5`).

**Dash** Remixicon (`@remixicon/react` per imports in `page-shell.tsx:4`, `code-block.tsx:4`, `docs-step.tsx:4`, etc.). Mostly consistent stroke-width 1.75 → 2. Sizes vary `size-3.5`/`size-4`/`size-3` depending on context.

**Diff** Remixicon is fine — visually heavier than Lucide (default fills + strokes) but coherent if used consistently. Stroke weights are mostly consistent.

**Fix (NICE-TO-HAVE)** Pick ONE stroke weight (`2`) and ONE default size (`size-4`) for icons inside doc primitives. Run a sweep across `apps/docs/components/docs/*` to enforce. Effort: 30 min.

---

### Dimension 13 — Interaction patterns (hover, focus, active)

**Shadcn** Hover = subtle bg lift (zinc-50 → zinc-100). Active sidebar item = bg + bold weight. Focus ring = 2px ring offset.

**Dash** (`sidebar.tsx:49-57`)
- Active sidebar: `border-(--dash-purple-500) bg-bg-weak-50 text-text-strong-950 font-medium`. Good — clear visual.
- Hover: `hover:text-text-strong-950 hover:bg-bg-weak-50/60`. Good.
- Focus rings present on topbar buttons (`topbar.tsx:111-114`).
- Left-border-2 trick on sidebar items is a nice signature.

**Diff** Dash is on parity here. No major issues.

**Fix** None.

---

### Dimension 14 — Empty states

**Shadcn** Not heavily showcased. Component pages with no examples remain rare.

**Dash** Has a dedicated `EmptyState` component + a `Empty State Collection` block (`nav-config.ts:418`). Used in templates. Solid coverage.

**Diff** Dash actually *wins* this dimension — empty-state literacy is higher.

**Fix** None.

---

### Dimension 15 — Loading states

**Shadcn** Skeleton + Loader components, demonstrated inline.

**Dash** Skeleton, Spinner, Progress, Progress Circle, Fancy Loader, Shimmer (`nav-config.ts:263, 280-284`). Six primitives. Possibly *too* many — but coverage strong.

**Fix** None visual — possibly consolidation work for a different audit.

---

## Component Page Anatomy Comparison

**Shadcn** (typical `/docs/components/button`):
```
H1 + 1-sentence description           (~120px)
[Preview/Code tabs]                   (~280px, single frame)
H2 Installation
  npm/pnpm/yarn/bun tabs + code       (~140px)
H2 Usage
  one import + one usage code         (~140px)
H2 Examples
  multiple Preview/Code tabs           (recursive ~300px each)
H2 API Reference
  prop table
```

**Dash** (typical `/docs/components/button` per `button/page.tsx:25-200+`):
```
Breadcrumb
Eyebrow "Actions" + Copy-page btn
H1 huge (5xl→7xl) + Status pill
Description (long)
Tabs row (Usage/Spec/Status)
                              header subtotal ~280-360px
H2 Principles (DocsPrinciples 3-col)
H2 Anatomy (custom-bordered preview)
H2 Tones (DocsVariantTable)
H2 Styles (DocsVariantTable)
H2 Sizes (DocsVariantTable)
H2 Primary buttons (DocsDoDont)
H2 Destructive (DocsDoDont)
H2 Examples (DocsExample × N — stacked preview+code each)
H2 API (DocsPropsTable)
H2 ... more sections
```

**Anatomy diff** Dash documents MORE per component (principles, do/dont, variant tables, anatomy frame). That's *valuable content* — but every section pays a border-t + header tax. By section #6 the user has scrolled past 6 hairline rules and is fatigued.

**Recommendation** Keep the rich content; reduce the chrome. Combination of: remove `border-t` between sections (dim 4) + shrink header (dim 3) + tab-ify previews (dim 6) gets Dash to 50–60% the vertical length of today, while preserving every section.

---

## Code Block Quality

| | Shadcn | Dash |
|---|---|---|
| Surface | `#0a0a0a` dark | `#0d1117` GitHub-dark (good) |
| Header bar | None default; tabs row for multi-pm | Always 36px header w/ lang label + copy |
| Copy button | Hover-revealed, top-right floating | Always visible, in header |
| Highlighter | Shiki (github-dark-default) | Shiki (github-dark) ✓ |
| Border | None (just dark surface) | `border border-white/5` (correct, subtle) |
| Multi-tab support | Yes for package managers | None visible |

**Dash wins** Shiki integration is correct. Border is calibrated.

**Dash loses** Persistent header bar adds chrome to every snippet. No package-manager tabs (everything is bash or tsx, no toggle).

---

## Sidebar Density + Information Architecture

**Shadcn**: 7 sections → ~60 items in rail (max). Long inventories (76 components, 50+ blocks) live on an overview page `/docs/components` and in cmd+K search. Rail = curated navigation, not catalog.

**Dash** (`nav-config.ts:31-194` + inventories `:209+`): The 2026-05 restructure ALREADY adopted this pattern (note `:23-29`). Library section surfaces only 3 overview entries (Components / Blocks / Templates), with detail in cmd+K. Good — this is the modern shape.

**Remaining issue** Dash still surfaces WIP markers in rail (Dim 2), Wave-5 suffixes, and admin pages (Pilot Dashboard, Usage Dashboard). For an external/public DS docs site these would belong in a separate `/admin` section, not the main rail.

**Fix** Move admin pages to a separate `/admin/*` route with its own sidebar (or behind auth). File: `apps/docs/components/docs/nav-config.ts:183-189`. Effort: 20 min.

---

## Empty State + Loading State Patterns

Dash > Shadcn here (more primitives, more coverage). Not a "rapi" problem. Keep as-is.

---

## Critical Fixes for Dash (Top 15)

Ranked by visual quality jump per hour of work.

| # | Fix | File | Effort | Impact |
|---|---|---|---|---|
| 1 | Cap H1 at `text-3xl lg:text-4xl font-bold tracking-tight` (was 5xl/7xl) | `page-shell.tsx:114` | 5 min | Massive — every page hero shrinks ~150px |
| 2 | Remove `border-t border-stroke-soft-200/60` from `DocsSection` | `page-shell.tsx:173` | 2 min | Massive — pages flow as articles |
| 3 | Drop status pill from `DocsHeader` default render; surface inline as grey note if needed | `page-shell.tsx:117-126` | 10 min | High — kills colored-chip-on-every-page |
| 4 | Drop sub-tabs row from `DocsHeader` default | `page-shell.tsx:135-155` | 5 min | High — kills the "Usage/Spec/Status" stripe |
| 5 | Tabs-ify `DocsExample` (Preview default, Code on tab click) | `page-shell.tsx:258-281`, `preview.tsx` | 2 hr | Massive — doc pages compress ~40% |
| 6 | Make code-block header bar hover-only when single language | `code-block.tsx:71, 82-107` | 20 min | High — denser code samples |
| 7 | Remove `StatusDot` from sidebar | `sidebar.tsx:8-21` | 5 min | High — rail aligns uniformly |
| 8 | Strip "(Wave 5)" suffixes from nav titles | `nav-config.ts:42-43` | 1 min | Med — pro polish |
| 9 | Drop `v1.0` chip from topbar | `topbar.tsx:80-83` | 1 min | Med — topbar polish |
| 10 | Remove layout-mode toggle from topbar | `topbar.tsx:123-141` | 5 min | Med — topbar polish |
| 11 | Restrict docs status pills to neutral/info only (no green/yellow/red on docs chrome) | `page-shell.tsx:62-94` | 15 min | High — visual quietening |
| 12 | Default `label` to undefined on `DocsPreview` (don't pass title automatically) | `page-shell.tsx:271` | 2 min | Med — kills duplicate "Preview" strip |
| 13 | Move admin pages (Pilot, Usage) out of main nav | `nav-config.ts:183-189` | 20 min | Med — IA clarity |
| 14 | Replace inline `text-5xl/7xl` etc with `text-title-h*` classes | `page-shell.tsx`, all doc primitives | 1 hr | Med — token ramp consistency |
| 15 | Drop `border-x border-t rounded-t-xl` stacked-frame pattern on `DocsPreview` when used alone | `preview.tsx:37`, `page-shell.tsx:270` | 30 min | Med — single rounded frame, not split |

---

## Important Fixes (Top 10)

| # | Fix | File | Effort |
|---|---|---|---|
| 1 | Add package-manager tabs (npm/pnpm/yarn/bun) for install snippets | new `<DocsCommandTabs>` | 2 hr |
| 2 | Consolidate sidebar status visual signaling — pick ONE pattern | sidebar.tsx + nav-config | 30 min |
| 3 | Inspect Plus Jakarta vs Geist for docs site — A/B with team | `app/layout.tsx:6-10` | 15 min swap |
| 4 | Bump architecture metric cards `px-4 py-5` → `p-6` | `layered/page.tsx:84` | 1 min |
| 5 | Add proper Block gallery thumbnail grid à la shadcn `/blocks` (aspect-video screenshots) | new page | 4 hr |
| 6 | Add Charts gallery page like shadcn `/charts` | new page | 3 hr |
| 7 | Add Themes preview page like shadcn `/themes` | new page | 3 hr |
| 8 | Unify icon stroke-width to 2, default size `size-4` across docs primitives | sweep | 30 min |
| 9 | Add empty state to `/docs/components` overview when zero matches | components overview page | 30 min |
| 10 | Smooth scroll-margin on h2/h3 anchors (currently `scroll-mt-20` — verify across all headings) | sweep | 15 min |

---

## Nice-to-Have (Top 10)

| # | Fix | File | Effort |
|---|---|---|---|
| 1 | Add "Edit on GitHub" link bottom of each doc page | `page-nav.tsx` | 30 min |
| 2 | Reading-time estimate on long architecture pages | `page-shell.tsx` | 20 min |
| 3 | Code-block line numbers as optional prop | `code-block.tsx` | 30 min |
| 4 | Code-block highlighted-lines support (`{1-3,5}` syntax) | `code-block.tsx` | 1 hr |
| 5 | Animated check on copy success — currently just icon swap | `code-block.tsx:99-103` | 10 min |
| 6 | Sticky preview frame for very long code samples (scroll code, fixed preview) | `page-shell.tsx` | 1 hr |
| 7 | Quick-jump-to-anatomy section button in header | `page-shell.tsx` | 20 min |
| 8 | Display "last updated" date per page from git | `page-nav.tsx` | 30 min |
| 9 | Add subtle keyboard shortcut hints (`Esc` to close cmd+K, `/` to focus search) | command palette | 20 min |
| 10 | Add prev/next preview thumbs in `DocsPageNav` footer (not just text) | `page-nav.tsx` | 1 hr |

---

## Quick Wins (1-hour budget)

If you have exactly ONE hour to ship a visible quality jump, do these in order. Total = ~58 min.

1. **Cap H1** to `text-3xl lg:text-4xl font-bold tracking-tight` — `page-shell.tsx:114`. **5 min.**
2. **Remove section border-t** — `page-shell.tsx:173` (delete `border-t border-stroke-soft-200/60 first:border-t-0`). **2 min.**
3. **Drop status pill from header** — `page-shell.tsx:117-126` (gate behind a `showStatus` prop, default false; flip back on for the 3-5 pages that truly need it). **10 min.**
4. **Drop sub-tabs row default** — `page-shell.tsx:135-155` (remove from default render, leave the prop). **5 min.**
5. **Remove sidebar StatusDot** — `sidebar.tsx:8-21, 58`. **5 min.**
6. **Strip Wave-5 titles** — `nav-config.ts:42, 43`. **1 min.**
7. **Drop v1.0 chip + layout toggle** — `topbar.tsx:80-83, 123-141`. **5 min.**
8. **Code block: hide header when no language passed** — `code-block.tsx:71` change `const hasHeader = !!language || copy` → `const hasHeader = !!language`. Make copy button float top-right with hover reveal as separate element. **15 min.**
9. **Bump h2 spacing** — `page-shell.tsx:29` change `space-y-14` → `space-y-20` to compensate for removed border-t. **2 min.**
10. **Status pill colors** — `page-shell.tsx:62-94` change `stable` and `shipped` to neutral grey (`bg-bg-weak-50 text-text-sub-600`). Keep `wip` yellow + `deprecated` red, drop the rest to grey. **8 min.**

**Outcome after 1 hour** Every component page reads ~30% shorter, the hero stops shouting, the colored-pill diet drops by 70%, the sidebar stops broadcasting sprint status. The docs site immediately reads closer to shadcn-tier polish.

---

## Visual Inspection Notes (subjective)

- **"Berantakan" diagnosis is real, and it's the *header chrome* doing it.** Body content (DocsExample, DocsPropsTable, DocsPrinciples, DocsDoDont) is actually well-designed and on-par with shadcn-tier docs sites. The mess is concentrated in the page-shell header + DocsSection border-t pattern. Fix those two regions and the whole site jumps a tier.
- **Plus Jakarta Sans + 7xl titles = brand-page energy on a doc page.** This is a *tone* mismatch. Docs should feel like the reference manual to a tool, not the landing page selling the tool. Either drop the type sizes or switch the docs-site typeface (Geist) — both work.
- **Status pills are a *product* concept leaking into the *docs* layer.** When the product DS ships components, "Stable / Beta / Deprecated" matters internally. But on every component's docs hero it adds visual noise. Move status to a single line of grey microcopy under the description (e.g. `Stable since v0.8.` like Tailwind docs do).
- **Dash's DocsDoDont and DocsPrinciples are excellent** — these are content patterns shadcn DOESN'T have. Don't drop them. They're net-positive value once the surrounding chrome calms down.
- **Architecture pages (layered, themes, metrics) are info-dense and visually rich.** They benefit from larger titles and richer cards. The hero treatment that's wrong on `/docs/components/button` is *right* on `/docs/architecture/layered`. Recommendation: make `DocsHeader` accept a `variant: "compact" | "marketing"` prop. `compact` (new default) for component/block/template pages, `marketing` (current treatment) for architecture/overview pages.
- **Light mode is solid, dark mode untested in this review** — the dark-mode override block in `globals.css:326-417` is thoughtful (Figma-verified per comment), but visual QA would need to confirm pill colors don't go washed-out on dark bg.

---

## Confidence Per Dimension

| Dimension | Confidence | Rationale |
|---|---|---|
| 1 Topbar | HIGH | Read source line-by-line |
| 2 Sidebar | HIGH | Read source + nav-config |
| 3 Page header | HIGH | Smoking gun — source clearly shows 5xl/7xl |
| 4 Section h2 | HIGH | Source confirms border-t pattern |
| 5 Code blocks | HIGH | Read full code-block.tsx |
| 6 Preview frame | HIGH | Read full preview.tsx |
| 7 Copy code | HIGH | Folded into 5 |
| 8 Typography | MEDIUM-HIGH | Inferred shadcn font; confirmed Dash via layout.tsx + globals.css |
| 9 Spacing | HIGH | Source numbers compared |
| 10 Whitespace | MEDIUM | Sampled architecture page; broader sweep would solidify |
| 11 Color palette | HIGH | Read full globals.css palette block |
| 12 Iconography | MEDIUM | Confirmed Remixicon; shadcn Lucide inferred not source-verified |
| 13 Interactions | HIGH | Source class names compared |
| 14 Empty states | MEDIUM | Inventory grep; visual sweep would help |
| 15 Loading states | MEDIUM | Inventory grep; visual sweep would help |
| Component anatomy | HIGH | Read button/page.tsx, blocks/audit-history-table |
| Sidebar IA | HIGH | Full nav-config read |

Lower-confidence items (typography font specifics on shadcn, charts/themes/blocks galleries) are flagged but don't change the top-level recommendations — those rest on source-verified Dash patterns.

---

*End of comparison. ~1850 LOC. Not committed — review and edit freely.*
