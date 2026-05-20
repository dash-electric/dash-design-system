# Dash DS Component Page Canonical Schema

**Status:** Proposed — 2026-05-20
**Scope:** Every page under `apps/docs/app/(docs)/docs/components/<name>/page.tsx`.
**Goal:** One predictable shape for 93 component pages so readers always know where to find Install / API / a11y / do-don't, and so CI can lint missing sections.

---

## 1. File layout (TSX page, not MDX)

```tsx
"use client"

import { /* component + icons */ } from "..."
import {
  DocsPageShell, DocsHeader, DocsSection,
  DocsPreview, DocsExample, DocsPropsTable,
  DocsDoDont, DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export const meta = {
  title: "Button",
  status: "stable",            // stable | beta | wip | deprecated
  since: "0.4.0",
  category: "atom",            // atom | composite | specialized
  group: "Actions",            // human-readable category shown in eyebrow
  related: ["icon-button", "compact-button", "link-button"],
}

export default function ButtonDocsPage() { /* … */ }
```

A sibling `meta.ts` is acceptable if a separate manifest is preferred. Either way **every page MUST export or co-locate a `meta` object** with the fields above so the manifest, sidebar, status pill, and "Related" rail can be generated.

---

## 2. Required section order

Every component page MUST render these sections in this exact order. Sections marked **(required)** must exist on every page. Sections marked **(if applicable)** are required when the component has the relevant capability (e.g. compound parts → Anatomy required).

1. **Header** (required) — `<DocsHeader>` with `category` (from `meta.group`), `title`, `status` (from `meta.status`), and a 1–2 line description.
2. **Preview** (required) — `<DocsPreview>` with the canonical live demo. One representative use, not a kitchen-sink.
3. **Install** (required) — `<DocsSection title="Install">` containing `<DocsCode language="bash" code={`dash add <component>`} />`.
4. **Usage** (required) — `<DocsSection title="Usage">` with the minimum copy-pastable snippet plus a one-paragraph "when to reach for this" intro.
5. **Anatomy** (if applicable) — `<DocsSection title="Anatomy">` with a labeled visual breakdown. Required for compound components (Card, Modal, Tabs, Form, DataTable, FileUpload, etc.). Skip for true single-element atoms (Badge, Kbd, Divider).
6. **Variants** (if applicable) — `<DocsVariantTable>` for tone / size / style matrices. Use when the component has ≥2 enum-style props.
7. **Examples** (required, ≥2) — `<DocsExample>` blocks. 2–4 real-world Dash compositions (dispatch row, mitra suspend confirm, payroll filter, etc.). Code must be copy-pastable.
8. **API** (required) — `<DocsPropsTable>`. One row per public prop: `name`, `type`, `defaultValue`, `description`, `required?`. Subcomponents get their own table directly below the parent's.
9. **Accessibility** (required) — `<DocsSection title="Accessibility">`. Must cover: keyboard, ARIA roles/state, screen-reader behaviour, focus, reduced-motion (if it animates), color-contrast statement.
10. **Do / Don't** (required, ≥1 pair) — `<DocsDoDont>` blocks. Each pair: a `do` preview + caption and a `dont` preview + caption.
11. **Related** (required) — `<DocsSection title="Related">`. Grid of cross-links generated from `meta.related`.

### Optional sections (component-specific)

- **Principles** — only for primitives that ground a family (Button, Form). Sits between Header and Preview when present.
- **Token wiring** — for components that surface design tokens (Chart, Theme Switch).
- **Performance notes** — for heavy components (DataTable, RichEditor, Chart).
- **Migration** — required only when a component is `deprecated` or replacing an earlier API.

---

## 3. Status pill rules

`meta.status` is the single source of truth for the colored pill in `<DocsHeader>`.

| Value | Pill label | When |
|---|---|---|
| `stable` | Stable | Locked API, in production. |
| `beta` | Design beta | Visuals finalized, API may shift in a minor. |
| `wip` | Work in progress | Not safe to consume outside the DS team. |
| `deprecated` | Deprecated | Migrate off; page must include a Migration section. |

The current `DocsHeader` types support `"shipped" | "wip" | "planned" | "beta" | "new"`. **Action:** rename `shipped → stable`, drop `planned` and `new` (replaced by `beta` / a separate "What's New" page), and add `deprecated`. Migrate the 15 existing pages with status in the same PR.

---

## 4. Frontmatter / `meta` schema

```ts
// Co-located with each page.tsx OR exported from a sibling meta.ts
export const meta = {
  title: string,                                    // "Button"
  status: "stable" | "beta" | "wip" | "deprecated",
  since: string,                                    // "0.4.0" — first stable release
  category: "atom" | "composite" | "specialized",
  group: string,                                    // "Actions" — eyebrow label
  related: string[],                                // ["icon-button", "compact-button"]
  tags?: string[],                                  // optional search tags
}
```

A new file `apps/docs/lib/component-manifest.ts` should aggregate every component's `meta` at build time — sidebar, search, "What's New", and Related rail all read from there.

---

## 5. Lint contract (for the follow-up CI task)

The build should fail when **any** page under `app/(docs)/docs/components/` is missing:

- An exported `meta` matching the schema above
- `<DocsHeader>` with `status` set from `meta.status`
- `<DocsPreview>` block
- A section titled `Install`, `Usage`, `API`, `Accessibility`, `Related`
- A `<DocsPropsTable>` with ≥1 row
- ≥2 `<DocsExample>` blocks
- ≥1 `<DocsDoDont>` block

Anatomy and Variants are warnings (not errors) — surfaced for review but not blocking.

---

## 6. Section coverage gap (15-page sample)

| Page | Missing required sections | Severity |
|---|---|:-:|
| `checkbox` | Preview, Install, Usage, Anatomy, A11y, Examples, Related, Status | **CRITICAL** |
| `badge` | Preview, Install, Usage, Anatomy, A11y, Examples, Related, Status | **CRITICAL** |
| `avatar` | Preview, Install, Usage, Anatomy, A11y, Examples, Related, Status | **CRITICAL** |
| `alert` | Preview, Install, Usage, A11y, Examples, Related, Status | **CRITICAL** |
| `file-upload` | Preview, Install, Usage, Anatomy, A11y, Examples, Related, Status | **CRITICAL** |
| `tabs` | Preview, Usage, Anatomy, A11y, DoDont, Examples, Related, Status | **HIGH** |
| `accordion` | Preview, Usage, Anatomy, A11y, Examples, Related, Status | **HIGH** |
| `calendar` | Preview, Usage, Anatomy, A11y, Related, Status | MEDIUM |
| `chart` | Preview, Anatomy, Related, Status | MEDIUM |
| `form` | Preview, Usage, Related, Status | MEDIUM |
| `data-table` | Preview, Usage, Related, Status | MEDIUM |
| `card` | Preview, Related, Status | LOW |
| `modal` | Preview, Related, Status | LOW |
| `input` | Preview, Examples, Related, Status | LOW |
| `button` | Preview, (rename `shipped → stable`) | OK |

Extrapolated to all 93 pages: ~70 pages need Status, ~92 need Related, ~58 need Examples, ~47 need Usage, ~45 need Anatomy/A11y. API table is already 100%.
