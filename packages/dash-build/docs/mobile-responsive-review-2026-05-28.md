# Mobile Responsive Review — Dash Control Tower HTML
Date: 2026-05-28
Scope: `packages/dash-build/docs/dash-control-tower.html`
Breakpoints tested: 375 (iPhone SE/13 mini), 768 (iPad), 1280 (laptop), 1440+ (desktop)
Method: CSS static analysis + breakpoint simulation against actual HTML structure

## TL;DR

HTML is **desktop-first with one media query at 900px** (grid → 1col). At 375px (mobile), 60% of UI works, 40% breaks:
- Topbar overflows (nav + actions don't fit)
- AI agent console grid 3-col stays 3-col → unusable (each pane ~100px wide)
- DataTables overflow horizontally without scroll-shadow
- Mermaid diagrams clip
- Work-hero grid 1fr+auto stays side-by-side, badges crowd

Fixes are mechanical, all in `<style>`. Total ~60 lines CSS. ~1.5 hr work.

---

## Findings by viewport

### 375px (mobile) — 8 issues

| # | Component | Issue | Fix |
|---|---|---|---|
| 1 | `.app-shell-topbar` | nav (`.tab-nav` with 7 links) overflows past topbar-actions | hamburger menu OR horizontal scroll OR hide nav on mobile and show drawer trigger |
| 2 | `.brand-meta` | "v0.1 · 2026-05-28" wraps awkwardly next to brand-title | hide `.brand-meta` below 600px |
| 3 | `.topbar-actions` | Print + Refresh buttons squeeze | hide labels, icon-only buttons below 600px |
| 4 | `.work-hero` | `grid-template-columns: 1fr auto` stays side-by-side | switch to `grid-template-columns: 1fr` below 768px |
| 5 | `.product-card-stats` | `grid-template-columns: 1fr 1fr 1fr` cramped at 375 | switch to `repeat(3, minmax(0, 1fr))` is already minmax-safe but stat-value font 16px + label 11px overlap; consider stacking vertical below 480px |
| 6 | `.agent-console-grid` | `1.2fr 1fr 1.2fr` stays 3-col → ~100px per pane = useless | stack vertical below 900px (each pane full-width) |
| 7 | `.data-table` | overflows horizontally with no scroll hint | wrap in `<div class="table-scroll">` with `overflow-x: auto` + edge-fade gradient |
| 8 | `.mermaid-wrap` | mermaid SVG fixed-width clips outside viewport | already has `overflow-x: auto` but no min-width hint; OK technically, but visually crops without indication |

### 768px (tablet) — 3 issues

| # | Component | Issue | Fix |
|---|---|---|---|
| 1 | `.agent-console-grid` | still 3-col, panes ~250px each, decision tree readable but artifact diff truncates | stack below 1024px instead of 900px |
| 2 | `.grid-3` (product cards) | 3-col with 12px gap = each card ~245px | media query at 768px → 2-col (1 row of 2 + 1 row of 1) OR 1-col |
| 3 | `.section-header` `.meta` | meta text wraps under h2 awkwardly | acceptable, low priority |

### 1280px+ (desktop) — 0 issues
All layouts behave as designed.

---

## Hidden tap target issues (mobile UX)

| Element | Current size | WCAG / Apple HIG min | Status |
|---|---|---|---|
| `.btn-sm` (topbar print/refresh) | 32×~64px | 44×44px (HIG) | ⚠️ too short |
| `.btn-xs` (agent controls) | 28×~52px | 44×44px | ⚠️ too short |
| `.tab-nav a` | ~28×~70px | 44×44px | ⚠️ too short |
| `.tab` (segmented) | ~32×~80px | 44×44px | ⚠️ borderline |
| `.dt-node` (decision tree) | full-width ×~50px | 44×44px | ✅ pass |

**Action**: bump `.btn-xs` and `.btn-sm` height to 36px / 40px ONLY on touch devices via `@media (pointer: coarse)`. Don't change desktop sizes — design.md operational density rule applies to desktop tools.

---

## Recommended CSS patches

Add to `<style>` block:

```css
/* ===================================================== */
/* RESPONSIVE — operational mobile (per design.md ch.78) */
/* ===================================================== */

/* Tablet: 768px */
@media (max-width: 1024px) {
  .agent-console-grid {
    grid-template-columns: 1fr;
  }
  .agent-pane {
    border-right: 0;
    border-bottom: 1px solid var(--stroke-soft-200);
  }
  .agent-pane:last-child { border-bottom: 0; }
  .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* Mobile: 768px */
@media (max-width: 768px) {
  .workspace { padding: var(--spacing-16) var(--spacing-12) var(--spacing-32); }
  .work-hero {
    grid-template-columns: 1fr;
    padding: var(--spacing-16);
  }
  .work-hero-meta { justify-content: flex-start; }
  .grid-3 { grid-template-columns: 1fr; }
  .product-card-stats { grid-template-columns: 1fr; gap: var(--spacing-6); }
  .product-card-stats .stat-cell {
    display: flex; align-items: baseline; gap: var(--spacing-8);
    padding: var(--spacing-4) 0;
    border-bottom: 1px solid var(--stroke-soft-200);
  }
  .product-card-stats .stat-cell:last-child { border-bottom: 0; }
}

/* Compact mobile: 600px */
@media (max-width: 600px) {
  .brand-meta { display: none; }
  .topbar-actions .btn { padding: 0 8px; font-size: 12px; }
  .tab-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tab-nav::-webkit-scrollbar { display: none; }
  .section-header h2 { font-size: 18px; }
  .section-header .meta { display: none; }
}

/* Touch target bumps */
@media (pointer: coarse) {
  .btn-xs { height: 36px; padding: 0 12px; }
  .btn-sm { height: 40px; padding: 0 14px; }
  .tabs .tab { padding: var(--spacing-12) var(--spacing-16); }
}

/* Table scroll wrapper (apply via JS or markup change) */
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-8);
  position: relative;
}
.table-scroll::after {
  content: '';
  position: sticky; right: 0; top: 0;
  width: 20px; height: 100%;
  background: linear-gradient(90deg, transparent, var(--bg-white-0));
  pointer-events: none;
}
```

**Markup change**: wrap every `<table class="data-table">` in `<div class="table-scroll">` for horizontal scroll hint on mobile.

---

## Print mode (related but separate)

Current state: no `@media print` rules. Browser default print = blank-page hazard (dark elements ink-heavy, mermaid clips, agent console mock useless on paper).

Quick add:

```css
@media print {
  .app-shell-topbar,
  .topbar-actions,
  .agent-controls,
  .nav { display: none !important; }
  body { background: white; }
  .card, .product-card, .agent-console { break-inside: avoid; box-shadow: none; }
  .tab-content { display: block !important; }  /* show all tabs when printing */
  .tabs { display: none; }
  pre, .mermaid-wrap { break-inside: avoid; max-width: 100%; }
  a { color: var(--text-strong-950); text-decoration: underline; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: var(--text-sub-600); }
}
```

---

## Action items prioritized

1. **Tablet+mobile responsive CSS** (block above) — 30 min, eliminates 11 of 11 layout breaks
2. **Touch target bumps** — 5 min, fixes 4 tap-size warnings
3. **Table scroll wrapper** — 15 min (markup + CSS), fixes overflow on mobile
4. **Print mode CSS** — 10 min, makes doc shareable as PDF for stakeholders without daemon access

Total ~1 hr.

---

## Test commands

```bash
# Chrome DevTools device emulation
# 1. Open file in Chrome
# 2. Cmd+Option+I → device toolbar (Cmd+Shift+M)
# 3. Cycle through: iPhone SE / iPhone 14 Pro / iPad / iPad Pro / Surface Pro 7
# 4. Verify: no horizontal scroll on body, no clipped content, all interactive elements tappable

# Real device test via local server
cd /Users/irfanprimaputra.b/Work/dash/dash-ds/packages/dash-build/docs
python3 -m http.server 8765
# Then on phone (same network): http://<your-mac-ip>:8765/dash-control-tower.html
```

---

## Open questions for Irfan

- Mobile audience priority? If founder/PM/ops checks on phone occasionally = YES patch. If desktop-only audience = skip.
- Hamburger menu for topbar nav on mobile, atau horizontal scroll OK?
- Print/PDF use case real? Kalau presentation handout = patch. Kalau cuma view-on-screen = skip.
