# Component Page Schema Audit — 2026-05-20

**Scope:** `apps/docs/app/(docs)/docs/components/` — 93 component pages.
**Method:** Survey across 93 pages (full coverage) + deep-read 15 representative samples (5 atoms, 5 composites, 5 specialized).
**Code style:** 100% TSX page components (no MDX). All pages use shared `<DocsPageShell>`, `<DocsHeader>`, `<DocsSection>` primitives from `@/components/docs/page-shell`.

## 1. Section coverage across all 93 pages

| Section | Pages with it | % |
|---|---:|---:|
| `<DocsPropsTable>` (API) | 93 | 100% |
| Do / Don't (`<DocsDoDont>` or `title="Do…"`) | 88 | 95% |
| Install section | 80 | 86% |
| Accessibility section | 52 | 56% |
| Anatomy section | 48 | 52% |
| Examples section | 46 | 49% |
| Usage section | 35 | 38% |
| Status pill (`status="…"` on `DocsHeader`) | 15 | 16% |
| Related components section | 1 | 1% |
| Principles section | 1 | 1% |

**Two findings stand out:**

1. **API table is universal (100%)** — the only fully-enforced section. Every page passes a props array to `DocsPropsTable`.
2. **Status pill (16%) and Related (1%) are essentially un-adopted.** The `DocsHeader` accepts `status?: "shipped" | "wip" | "planned" | "beta" | "new"` but 78 of 93 pages omit it entirely.

## 2. 15-page sample — section presence matrix

| Page | Preview | Install | Usage | API | Anatomy | A11y | DoDont | Examples | Status | Related | Principles |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| button (atom) | – | Y | – | Y | Y | Y | Y | Y | **Y** | **Y** | **Y** |
| input (atom) | – | Y | Y | Y | Y | Y | Y | – | – | – | – |
| checkbox (atom) | – | – | – | Y | – | – | Y | – | – | – | – |
| badge (atom) | – | – | – | Y | – | – | Y | – | – | – | – |
| avatar (atom) | – | – | – | Y | – | – | Y | – | – | – | – |
| card (composite) | – | Y | Y | Y | Y | Y | Y | Y | – | – | – |
| alert (composite) | – | – | – | Y | – | – | Y | – | – | – | – |
| modal (composite) | – | Y | Y | Y | Y | Y | Y | Y | – | – | – |
| tabs (composite) | – | Y | – | Y | – | – | – | – | – | – | – |
| accordion (composite) | – | Y | – | Y | – | – | Y | – | – | – | – |
| form (specialized) | – | Y | – | Y | Y | Y | Y | Y | – | – | – |
| data-table (specialized) | – | Y | – | Y | Y | Y | Y | Y | – | – | – |
| chart (specialized) | – | Y | Y | Y | – | Y | Y | Y | – | – | – |
| calendar (specialized) | – | Y | – | Y | – | – | Y | Y | – | – | – |
| file-upload (specialized) | – | – | – | Y | – | – | Y | – | – | – | – |

Legend: Y = present, – = missing.

## 3. Unique / one-off sections observed

These appeared on individual pages but not as a pattern:

- `Principles` (button only — first section, 3 design-principle cards)
- `Related <component> variants` (button only — grid of cross-links)
- `Token wiring` (chart only — design-token mapping)
- `Composition` (calendar only)
- Domain-specific titles substituting for `Examples`: "Tones / Styles / Sizes" (button), "Use cases gallery" / "Composite: Account Setup" (input), "State matrix" (input), "Status × appearance" (badge), "Setup wizard" / "Changelog" (accordion).
- Heavy use of `<DocsVariantTable>` for tone/size/state matrices (button, badge, alert).

There is **no `Preview` section** — most pages embed live demos inline inside ad-hoc sections or `<DocsExample>` blocks. `<DocsPreview>` exists in `page-shell.tsx` but is not used by any of the 15 sampled component pages.

## 4. Code-style consistency

- 100% TSX `page.tsx` files (no `.mdx`).
- All start with `"use client"`.
- All wrap content in `<DocsPageShell>` → `<DocsHeader>` → series of `<DocsSection title="…">`.
- All inline their props array in `<DocsPropsTable rows={[…]}>` — no shared schema source.
- No frontmatter (Next.js App Router TSX page, so frontmatter would need a sibling `meta.ts` or registered manifest — none exists today).
- Status, category, since-version not machine-queryable.

## 5. Diagnosis

The shell primitives (`DocsHeader`, `DocsSection`, `DocsPropsTable`, `DocsDoDont`, `DocsExample`, `DocsVariantTable`) **already exist and work**. The issue is they are advisory, not enforced. There is no convention doc, no lint rule, no manifest. Each component page was authored independently and converged on the API table but diverged on everything else.

Section ordering also varies: `button` puts Install + API near the bottom, `input` and `card` put Install near the top. The order itself needs to be canonized.
