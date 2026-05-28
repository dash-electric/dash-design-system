# Dash Design System — AI Rules

> Consumed by Claude Code / Cursor / Copilot when working in any Dash repo with `@dash` registry configured. Append this file to repo-level `CLAUDE.md` / `AGENTS.md` / `.cursorrules`.

## Always

1. **Query Dash registry FIRST** before generating UI primitives. The registry lives at `@dash`. Available items: 111 components / hooks / templates / blocks / theme.
2. **Use `dash add <name>`** to install. Never copy-paste source code from another repo or invent a new primitive.
3. **Never use raw color hex / rgb**. Always use semantic tokens (e.g. `bg-bg-white-0`, `text-text-strong-950`, `border-stroke-soft-200`). Token reference: `@dash/base-theme` (ships full `app/globals.css`).
4. **Forms**: use `@dash/form` + `@dash/field` + zod schema via `@hookform/resolvers`. Never raw `<form>` without RHF.
5. **Page layouts**: pick from `@dash/templates/*` first. Decision tree below.

## Decision tree — picking the right primitive

### Display elements

- **Status indicator on a row** → `@dash/badge` with `status` + `appearance` props
- **Removable filter chip** → `@dash/tag`
- **KPI tile (label + value + trend)** → `@dash/stat` wrapped in `@dash/card`
- **Activity stream / timeline** → `@dash/activity-feed`
- **Notification list / inbox** → `@dash/notification-feed`
- **Loading skeleton** → `@dash/skeleton`
- **Spinner (indeterminate)** → `@dash/spinner`
- **Determinate progress** → `@dash/progress-bar` (linear) or `@dash/progress-circle` (radial)
- **Empty state** → `@dash/empty-state`
- **Tooltip** → `@dash/tooltip`
- **Inline preview on hover** → `@dash/hover-card`
- **Keyboard shortcut glyph** → `@dash/kbd`

### Tables

- **Static rows, no sort/filter** → `@dash/table` (primitive parts)
- **Sortable + filterable + paginated** → `@dash/data-table` (TanStack Table)
- **Table with side filter + bulk action** → `@dash/blocks/transactions-table` or `orders-table`

### Forms

- **Single-line input** → `@dash/input` composable (`InputRoot/Input/InputIcon/InputAffix`)
- **Multi-line** → `@dash/textarea`
- **Rich text** → `@dash/rich-editor` (Tiptap)
- **OTP / verification code** → `@dash/input-otp`
- **Time** → `@dash/time-picker`
- **Date** → `@dash/date-picker` (single or range)
- **Single-choice known set** → `@dash/select`
- **Single-choice searchable / huge list** → `@dash/combobox`
- **Multi-choice filter** → `@dash/filter` (Popover + Command + Tag)
- **Mutually exclusive options** → `@dash/radio`
- **Multi-toggle checkboxes** → `@dash/checkbox`
- **Boolean on/off** → `@dash/switch`
- **Numeric range** → `@dash/slider`
- **Color** → `@dash/color-picker`
- **Star rating** → `@dash/rating`
- **File upload (drag-drop + list)** → `@dash/file-upload`

### Actions

- **Primary action button** → `@dash/button` with `tone="primary"` + `style="filled"`
- **Icon-only button (toolbar / row actions)** → `@dash/icon-button` (aria-label REQUIRED)
- **Inline link as button** → `@dash/link-button`
- **OAuth sign-in** → `@dash/social-button`
- **Marketing CTA / hero** → `@dash/fancy-button`
- **Persistent on/off** → `@dash/toggle`
- **Set of related on/off** → `@dash/toggle-group`
- **View / mode picker** → `@dash/segmented-control`
- **Action group (attached buttons)** → `@dash/button-group`

### Overlays / dialogs

- **Focused atomic task** → `@dash/modal` (NOT Dialog — shadcn name)
- **Destructive confirmation** → `@dash/alert-dialog` (no overlay-click dismiss)
- **Side panel (desktop)** → `@dash/sheet` (4 sides × 5 sizes)
- **Mobile bottom drawer** → `@dash/drawer`
- **Inline form / settings popover** → `@dash/popover`
- **Action menu list** → `@dash/dropdown-menu`
- **Right-click context** → `@dash/context-menu`
- **Persistent menubar (File/Edit/View)** → `@dash/menubar`
- **Command palette (cmd+K)** → `@dash/command`

### Navigation

- **Top-level hover-mega-menu** → `@dash/navigation-menu`
- **Sidebar rail** → `@dash/sidebar` (with `SidebarProvider` + `useSidebar()` hook)
- **Tabbed section switcher** → `@dash/tabs`
- **Breadcrumb** → `@dash/breadcrumb`
- **Pagination** → `@dash/pagination`
- **Multi-step indicator** → `@dash/step-indicator` (horizontal/vertical) or `@dash/dot-stepper` (compact)

### Layout

- **Single-section show/hide** → `@dash/collapsible`
- **Multi-section grouped expand** → `@dash/accordion`
- **2+ pane splitter** → `@dash/resizable` (horizontal/vertical)
- **Scroll container** → `@dash/scroll-area`
- **Locked aspect ratio** → `@dash/aspect-ratio`
- **Separator** → `@dash/divider` (NOT Separator — shadcn name)
- **Slide-by-slide content** → `@dash/carousel`

### Feedback

- **Inline status banner** → `@dash/alert`
- **Page-top sticky banner** → `@dash/banner`
- **Toast** → `@dash/toaster` (Sonner-based) — mount once at root, call `toast.success(...)` / `featureToast(...)`
- **Helper text under field** → `@dash/hint` (5 tones with auto-icon)

### Charts

- **Bar / Line / Area / Pie** → `@dash/chart` (Recharts wrapper, ChartConfig token wiring)

## Shell / sidebar scope rule

"Do not introduce a new sidebar, shell, or route pattern unless explicitly
requested" applies to **consumer repos only** (`portal-v2`, `backoffice`,
`basecamp`, `react-fleet`, `halo-dash`, tribe apps). Dash DS itself ships
multiple preview shells (`auth-shell`, `dashboard-shell`, `hr-app-shell`,
`finance-app-shell`, `marketing-settings-shell`, `marketing-add-product-shell`)
so generated UI can render inside a realistic product chrome. These are
DS-internal infrastructure, not consumer drift.

## Page templates (decision tree)

- Backoffice with sidebar + topbar → `@dash/templates/dashboard-shell`
- Master-detail resource browser → `@dash/templates/list-detail-page`
- Multi-section settings → `@dash/templates/settings-tabs-page`
- Multi-step wizard / KYC / onboarding → `@dash/templates/form-stepper-page`
- Login / signup / reset / verify → `@dash/templates/auth-shell` (centered or split)
- Banking-style dashboard pattern → `@dash/templates/finance-dashboard`
- People-ops dashboard pattern → `@dash/templates/hr-dashboard`
- D2C marketing-ops pattern → `@dash/templates/marketing-dashboard`
- **Dash-specific**:
  - Mitra auto-suspend flow → `@dash/templates/mitra-suspend-page`
  - Halo-dash 3-pane support shell → `@dash/templates/halo-dash-3pane`
  - PT Box phase7 results dashboard → `@dash/templates/phase7-results`

## Pre-composed blocks

For sections within a page:

- **Auth forms**: `@dash/blocks/login-01..03`, `signup-01..03`, `forgot-password-01`, `verification-otp`
- **Data sections**: `@dash/blocks/transactions-table`, `orders-table`, `team-grid`, `products-grid`
- **Dashboard sections**: `@dash/blocks/stat-card-grid`, `analytics-grid`, `activity-timeline`, `my-cards-stack`, `empty-state-collection`
- **Settings sub-pages**: `@dash/blocks/settings-profile`, `settings-notifications`, `settings-integrations`, `settings-team`, `settings-privacy-security`

## Dash naming divergence from shadcn/ui

Dash uses some non-shadcn names. When user mentions shadcn names, map to Dash:

| User says (shadcn) | Use (Dash) |
|---|---|
| Dialog | Modal |
| Separator | Divider |
| RadioGroup | Radio (`RadioGroup + RadioItem + RadioField`) |
| Progress | ProgressBar |
| Sonner | Toaster |
| (chip / pill) | Tag (removable) or Badge (status) |

## Anatomy notes — non-shadcn

### Button

Dash Button has `tone × style × size` matrix, not shadcn's `variant × size`:

```tsx
<Button tone="primary" style="filled" size="md">Confirm</Button>
<Button tone="neutral" style="stroke">Cancel</Button>
<Button tone="destructive" style="ghost">Delete</Button>
```

Mapping from shadcn:
- `variant="default"` → `tone="primary" style="filled"`
- `variant="destructive"` → `tone="destructive" style="filled"`
- `variant="outline"` → `tone="neutral" style="stroke"`
- `variant="secondary"` → `tone="neutral" style="filled"`
- `variant="ghost"` → `tone="neutral" style="ghost"`
- `variant="link"` → `tone="primary" style="link"`

### Input

Dash Input is composable, not single-element:

```tsx
<InputRoot size="md" invalid={hasError}>
  <InputIcon><Search /></InputIcon>
  <Input placeholder="…" />
  <InputAffix>@dash.id</InputAffix>
</InputRoot>
```

Focus/hover/disabled/invalid state lives on `InputRoot`, NOT on raw `Input`.

### Badge

Use `appearance` prop, NOT `style` (style clashed with HTMLAttributes.style; renamed Batch 13):

```tsx
<Badge status="success" appearance="light">Active</Badge>
<Badge status="error" appearance="filled">Suspended</Badge>
```

Same rename applied to Alert + Banner.

## Token usage

Avoid raw colors. Always reach for semantic tokens:

### Background tier
- `bg-bg-strong-950` — deepest (e.g. code surface, inverted CTA)
- `bg-bg-surface-800` — secondary inverted
- `bg-bg-sub-300` — mid contrast
- `bg-bg-soft-200` — divider / inactive
- `bg-bg-weak-50` — page background
- `bg-bg-white-0` — surface (card, popover, sheet)

### Text tier
- `text-text-strong-950` — primary
- `text-text-sub-600` — secondary
- `text-text-soft-400` — tertiary / placeholder
- `text-text-disabled-300` — disabled
- `text-text-white-0` — inverted

### Stroke / Icon tier
- `border-stroke-soft-200` / `border-stroke-sub-300` / `border-stroke-strong-950`
- `text-icon-sub` / `text-icon-soft` / `text-icon-strong` / `text-icon-disabled`

### State colors
- success / information / warning / error / away / feature / faded / verified / highlighted / stable
- Each has `-dark` / `-base` / `-light` / `-lighter` modifier

### Brand
- `bg-primary` / `text-primary` — Dash brand purple (#5e2aac via `--dash-purple-500`)
- **Canonical Dash Purple primary value: `#5e2aac`** (matches DS token `--dash-purple-500`). Any reference to `#7C4FC4` in older docs is **deprecated** — sync to `#5e2aac`.

### Shadows
- `shadow-custom-xs/sm/md/lg` — card layering presets
- `shadow-tooltip` — overlay popovers
- `shadow-switch-thumb` / `shadow-toggle-switch` — form control specifics

### Radii
- `rounded-md` (8) / `rounded-lg` (12) / `rounded-xl` (16) / `rounded-2xl` (20-24)
- **Per-surface defaults (Figma canonical):**
  - Card (default widget / content block): `rounded-2xl` (16px)
  - Modal / Drawer / Sheet / Alert Dialog: `rounded-[20px]`
  - Popover / Dropdown / Menu / Toast: `rounded-2xl` (16px)
  - Inline table-row cards, chips, dense list rows: `rounded-md`/`rounded-lg` (6-8px) or full
- Dense table-row cards may go tighter (6-8px). The 16px floor applies to standalone widget / content Cards.

## Workflow conventions

1. **Before generating any UI**: query Dash registry via cmd+K on `https://ds.dash.com/docs` OR Dash MCP `search` tool.
2. **Install dependencies**: `dash add <name1> <name2>` — handles cascading registryDependencies automatically.
3. **Theme**: install once via `dash add base-theme` — writes consumer's `app/globals.css` with full token system.
4. **Layout first**: pick a template before composing sections. Templates already handle Sidebar / topbar / split / wizard scaffolding.
5. **Form pattern**: always RHF + zod resolver + Dash Form primitives:
   ```tsx
   const form = useForm({ resolver: zodResolver(schema) })
   <Form {...form}>
     <FormField control={form.control} name="…" render={({ field }) => (
       <FormItem>
         <FormLabel>…</FormLabel>
         <FormControl><InputRoot><Input {...field} /></InputRoot></FormControl>
         <FormMessage />
       </FormItem>
     )} />
   </Form>
   ```
6. **Domain copy**: when generating Dash-specific UI, use real Dash terms:
   - Tribes: Reservasi, Express, Bulk, Halo-dash, Tribe-Express
   - Mitra ID format: `mtr-XXXX` (4-5 digit suffix)
   - Cities: Bekasi, Tangerang, Jakarta, Bandung, Surabaya
   - Common actors: Sigit P., Wei Chen, Fayzul A. (mitra names)
   - External signals: BMKG (weather), Lebaran rate freeze (holiday pricing)
   - Patterns: 3-miss auto-suspend, surge factor X.Y×, dispatch radius

## Border + shadow policy

Default: hairline border OR shadow, not both. This keeps inline workspace cards
flat and scannable.

**Exception — floating surfaces above the workspace MAY combine border +
shallow shadow** for elevation clarity. Allowed list:

Modal, Drawer, Sheet, AlertDialog, Popover, Tooltip, HoverCard, DropdownMenu,
ContextMenu, Menubar, NavigationMenu, Toaster, DatePicker, Carousel,
BulkActionBar, fixed/sticky toolbars when scrolled.

Inline workspace cards (Card primitive in a list, table row, dashboard widget)
stay border-or-shadow, never both. The Card `elevated` variant is the one
explicit Card exception — intentionally elevated above the page surface.

## Decorative gradient policy

No decorative `linear-gradient` / `radial-gradient` / `conic-gradient` /
ornamental bokeh on in-app workflow surfaces (lists, tables, forms, detail
screens, dashboards). Allowed carve-outs:

- **Auth shells** (login / register / reset / verify) — gradients allowed per Figma.
- **Chart fills** — SVG `<linearGradient>` / `<radialGradient>` / `conic-gradient`
  inside Chart components is data-viz, not decoration.
- **Brand showcase pages** — Foundation, Theme Studio, Brand Assets, color and
  typography demo pages may use gradient backgrounds and gradient text.
- **Dash Build's own dashboard** — control-tower meta-surface (not a consumer
  ops product) may use radial-gradient body backgrounds.
- **`FancyButton` sheen** — top-down white sheen on premium CTA is sanctioned.

## Anti-patterns

❌ **DO**:
- `import { Button } from "@/registry/dash/ui/button"` after `dash add button`
- Use semantic token classes `bg-bg-white-0`
- Use `tone="primary" style="filled"` for Buttons
- Use `appearance="light"` for Badge / Alert / Banner

❌ **DON'T**:
- `import { Button } from "@radix-ui/react-button"` directly (wrong primitive)
- `style={{ backgroundColor: "#5e2aac" }}` (raw hex)
- `<Button variant="default">` (shadcn name — won't work in Dash)
- Copy entire shadcn component file into the repo (use `dash add` instead — auto-handles tokens + dependencies + cssVars)
- Hardcode `text-white` on light surfaces — use `text-text-strong-950` / `text-static-white` depending on context

---

## Refactor Protocol (mandatory for modifications to existing code)

When user prompt asks to modify, update, or refactor existing code:
1. **READ** target file(s) FIRST via Read tool. Do not write before reading.
2. **STATE plan in 3-5 bullets BEFORE writing code**:
   - Current state (file path + shape)
   - Target state
   - Files touched
   - Risk (backward-compat, API contracts, breaking changes)
3. **WAIT for user confirmation** OR proceed silently only if scope is fully bounded (single-file, no API change, no breaking rename)
4. **SHOW diff per file** after edit
5. **RUN `tsc --noEmit`** before declaring done

## Auto-Inference Protocol (for short/ambiguous prompts)

When prompt is **< 10 words** or missing context:
1. **INFER entity** (delivery / mitra / order / billing / outlet / driver based on keywords)
2. **INFER action** (create / update / refactor / migrate / fix)
3. **INFER scope** (file glob)
4. **STATE inference in 1 line**:
   `Infer: <action> <entity> at <file>. Confirm? (y / redirect / cancel)`
5. **EXECUTE on confirm**, redirect on correction
6. **DO NOT write code on first-pass inference** unless user confirms or scope is read-only

## Domain Glossary (skeleton — fill from real Dash repos in Phase 1)

> Note: This section will be populated from Dash Express + halo-dash + Dash Outlet codebases during repo intake. Current placeholders.

- **Delivery** — Order shipment unit. Tracked from creation → dispatch → completion. Has `useCode` (6-digit, generated frontend).
- **Mitra** — Driver / partner. Levels 1-5. Status: Active / Suspended / Pending. ID format `mtr-XXXX`.
- **Use-code** — 6-digit one-time code per delivery. Frontend-generated via `genUseCode()` (see `@dash/use-code-field`). Validated at dispatch.
- **Dispatch** — Act of assigning a delivery to a mitra. Triggers use-code validation.
- **Outlet** — Pickup point. Has address + operating hours.
- **Tribe** — Internal product line: Reservasi, Express, Bulk, Halo-dash, Tribe-Express.
- **Surge factor** — Demand-based multiplier on base fare, displayed as `X.Y×`.
- **3-miss auto-suspend** — Reservasi mitra missing 3 dispatches in a day are auto-suspended.
- **(rest TBD Phase 1)**

## Pattern Block Catalog (canonical references for refactor prompts)

When users ask for these shapes, pull from `@dash/patterns/*` instead of re-deriving:

- **Multi-row form with add/remove + batch submit** → `@dash/multi-item-form`
  - Schema: `z.object({items: z.array(itemSchema).min(1)})`
  - Per-row state via react-hook-form `useFieldArray`
  - Trigger phrases: "multi-order", "batch submit", "list with add/remove rows", "repeat this section"
  - Docs: `https://ds.dash.com/docs/patterns/multi-item-form`
- **Batch endpoint dispatch with per-row status + retry** → `@dash/bulk-submit`
  - Per-row `RowStatus` map (idle / pending / success / error)
  - Parallel `Promise.all` dispatch, optimistic UI, per-row rollback
  - Trigger phrases: "bulk submit", "batch dispatch", "submit all", "partial failure handling"
  - Docs: `https://ds.dash.com/docs/patterns/bulk-submit`
- **6-digit alphanumeric use-code field** → `@dash/use-code-field`
  - Exports `genUseCode()` and `USE_CODE_REGEX` for schema validation
  - Charset excludes ambiguous chars (`0 / O / 1 / I / L`)
  - Trigger phrases: "use code", "delivery code", "6-digit code", "regenerate code"
  - Docs: `https://ds.dash.com/docs/patterns/use-code-field`

## Anti-Pattern Catalog (REFUSE these)

When a user prompt requests these, refuse + redirect:

- **Hardcode hex color** → redirect to semantic token (`bg-primary-base`, `text-text-strong-950`)
- **Custom Modal / Dialog from scratch** → redirect to `@dash/modal`
- **Plain `<form>` without zod** → redirect to `@dash/form` + `@dash/field` + `@hookform/resolvers/zod`
- **Raw `<table>` for data grid** → redirect to `@dash/data-table`
- **New Tailwind variant class without component** → redirect to existing variant prop (`tone="primary" style="filled"`)
- **Inventing a use-code generator** → redirect to `genUseCode()` exported from `@dash/use-code-field`
- **`useState<Item[]>` inside a RHF form** → redirect to `useFieldArray` (see `@dash/multi-item-form`)
- **Sequential `await` loop for batch submit** → redirect to `Promise.all` (see `@dash/bulk-submit`)
- **Inline raw `<input type="text" maxLength={6}>` for use-codes** → redirect to `<UseCodeField />`

---

# Dash Repo Adaptation Layer (CRITICAL — read before generating code)

Dash has **11 product/service repos with distinct stacks** (5 FE + 5 BE-or-service + 1 infrastructure). AI MUST detect target repo BEFORE generating code, and adapt the canonical pattern blocks to match that repo's actual stack.

**Mandate (user-stated, 2026-05-20):** "kita gabisa ngubah existing, kita hanya bisa support itu." The Dash DS adapts to each real Dash repo. It does NOT force-migrate Dash repos to RHF/zod/TanStack — those are hard-banned per Phase 1.5 AGENTS.md analysis. Canonical pattern blocks (`multi-item-form.tsx`, `bulk-submit.tsx`) remain the reference shape for greenfield repos; for the 5 known Dash repos, use the translations below.

## Stack detection (extended for 5 FE + 5 BE)

When `dash info --json` returns repo metadata, infer target repo by:

**Frontend:**
- `framework: "next"` + `typescript: true` + App Router + Jotai dep → `next-portal-v2-web`
- `framework: "next"` + `typescript: false` + Pages Router + NextAuth dep → `next-backoffice-web`
- `framework: "next"` + `typescript: false` + Pages Router + AlignUI vendored → `halo-dash-fe`
- `framework: "next"` + `typescript: true` + App Router + Zustand 5 + shadcn + Firebase → `next-basecamp-web`
- `framework: "cra"` (`react-scripts` in deps) + CRACO + React Router v7 + custom UI → `react-fleet-management-web`

**Backend / services:**
- `framework: "express"` + Prisma + Node 24 + halo-related (Gemini SDK) → `halo-dash-be`
- `framework: "express"` + Prisma + Node 24 + Xendit/Qiscus + pubsub + 100+ models → `nodejs-core-service`
- `framework: "express"` + Prisma + TypeScript + `ROLE` env (`app|worker|dev`) + delivery state machine → `ts-delivery-service`
- `framework: "nest"` + Drizzle + Fastify adapter + Nest 10 + driver-state/reservation modules → `nest-express-service`
- `framework: "nest"` + Drizzle + Nest 11 + vehicle/handover/maintenance/repossession modules → `nest-fleet-service`

**Infrastructure:** OpenTofu + Digger + GCP Cloud Run modules → `infrastructure` (IaC only — different rules entirely; see `## Infrastructure rules` section).

If ambiguous, ASK user: "Target repo? (11 known: portal / backoffice / halo-fe / basecamp / fleet-mgmt / halo-be / core / ts-delivery / nest-express / nest-fleet / infrastructure)"

## Per-repo stack mandates (DO NOT VIOLATE)

### next-portal-v2-web (Dash portal — primary FE)
- Framework: Next.js App Router (TypeScript)
- Forms: **Jotai atoms + native useState** — NEVER react-hook-form
- Validation: hand-rolled (no zod, no joi) — typically inline in submit handler
- Data fetch: axios + custom hooks — NEVER TanStack Query/SWR
- State: Jotai for cross-component, useState for local
- Auth: cookie-based AuthContext (custom, NOT NextAuth)
- API envelope: `{status: 200, message, data, pagination?}` (numeric status field)
- i18n: next-intl with messages/ folder — Bahasa primary, English fallback
- Voice: default mitra-facing = "kamu" (informal); "Anda" only on per-feature override

### next-backoffice-web (Dash backoffice ops)
- Framework: Next.js Pages Router (JavaScript)
- Forms: native useState + manual validation — NEVER react-hook-form
- Data fetch: axios with manual setLoading — NEVER TanStack Query
- Auth: NextAuth.js
- UI libs co-exist: MUI 5 + antd 5 + Tailwind — DS components must drop in without breaking these
- API envelope: `{status: 'Success'|'Error', data, pagination}` (STRING status field — per AGENTS.md L22)
- Test: Jest + RTL
- Tailwind-variants: 3.2.2

### halo-dash-fe (CS / Halo)
- Framework: Next.js Pages Router (JavaScript) — was TS App Router, migrated 2026-05-07
- Forms: native useState — NEVER react-hook-form
- Data fetch: axios + 3-second polling (some pages)
- Auth: cookie-based AuthContext with cross-domain shared storage
- AlignUI vendored locally: `file:/Users/irfanprimaputra.b/code/align-ui`
- Test: NONE (no runner configured)
- Tailwind-variants: 0.2.1 (lowest common — DS targets this)

### next-basecamp-web (corporate / ops admin)
- Framework: Next.js 16.1.6 **App Router** with route-groups `(app)` (protected) / `(public)` (open)
- Language: **TypeScript** strict
- Forms: Native `useState` controlled (no RHF, no zod) — consistent with Dash FE bans
- Validation: Manual inline
- Data fetch: Native `fetch` → `app/api/*/route.ts` route handlers (no Bearer, open within trusted env)
- State: **Zustand 5** at `lib/stores/app-store.ts` — NOT Jotai
- Auth: **Firebase Auth (Google OAuth)** via `AuthProvider` context + `AuthGuard` HOC; domain-locked to `@dashelectric.co`
- UI lib: **shadcn/ui (new-york style)** + Radix + lucide + Remix icons — NOT AlignUI, NOT MUI
- Tailwind: **v4** (`@tailwindcss/postcss`)
- Brand color: `#5e2aac` (Dash Purple, hard-coded hex)
- Font: Plus Jakarta Sans via `next/font/google`
- i18n: NONE (only `toLocaleString('id-ID')` for IDR formatting)
- Test: NONE configured
- Backend: Firestore `basecamp-db` (non-default) + GCS + Slack webhooks + **Gemini AI** + **Google Document AI / Vision** (all server-side via Next route handlers)
- **WARN: Self-contained — NOT part of cross-domain SSO trio** (portal-v2 / halo-dash / fleet-mgmt). Do NOT propagate `crossDomainStorage` cookies here.
- Firestore: NO composite indexes for spend-requests; in-memory sort/filter only (caps ~1,000 docs).

### react-fleet-management-web (fleet ops console)
- Framework: **Create React App + CRACO 7.1.0** (legacy stack — only Dash FE NOT on Next.js)
- Language: **TypeScript 4.9.5** strict
- Routing: **React Router DOM v7.9.4**
- Forms: Native `useState` controlled. `package.json` declares `react-hook-form`, `zod`, `@hookform/resolvers` but zero source imports (verified via grep 2026-05-20) — stale deps, safe to remove. `RepoModal.tsx` uses local `useFormValidation` custom hook (useState-based), not RHF.
- Validation: Manual inline
- Data fetch: **axios** with Bearer token from `crossDomainStorage` + 401 refresh+retry queue; per-resource service modules in `src/services/api/*.ts`
- State: React Context (`AuthContext`) + local `useState` — NO Redux/Zustand/Jotai
- Auth: **Firebase Google OAuth → backend-issued JWT → `crossDomainStorage` cookie**; domain `@dashelectric.co`
- Cross-domain SSO: **YES — part of the trio** (portal-v2 + halo-dash + fleet-mgmt share the cookie)
- UI lib: **Custom in-house components** (`src/components/{Button,Card,Input,Modal,Table,…}`) — NOT AlignUI, NOT shadcn; MUI 7 declared but partial usage
- Tailwind: **v3.4.18** (NOT v4)
- Brand color: **DRIFT — `primary` blue tokens `#3b82f6 / #2563eb`**, NOT Dash Purple `#5e2aac` (see Drift Inventory)
- Font: Plus Jakarta Sans (consistent)
- Icons: Remix Icons + Material Symbols
- Toast: react-toastify (`<ToastContainer position="bottom-right">`)
- Charts: ApexCharts
- Date: dayjs + custom DatePicker
- i18n: NONE
- Test: Jest + React Testing Library declared (`craco test`, `test:ci --coverage`)
- Backend: consumes **`nest-fleet-service`** (vehicles, handovers, drivers, OEMs, models, incidents, issues, maintenance, repossessions, stations)
- Feature flags: `useFeatureFlag` hook (Firebase Remote Config — `web_fms_show_dashboard`, `web_fms_show_home`)
- Path aliases: `@/*` → `src/*` via CRACO + tsconfig
- **WARN: No AGENTS.md** — conventions inferred from ARCHITECTURE.md + code samples. See Drift Inventory.

### halo-dash-be (Halo backend)
- Stack: Node.js + Prisma + Cloud Run + OTel
- API envelope: `{status: 'Success'|'Error', message, data}` (string status)
- Path prefixes by actor: `/v1/agent/*`, `/v1/support/*`, `/v1/*`
- Auth: JWT bearer + X-Idempotency-Key header

### nodejs-core-service (Dash core backend)
- Stack: Express + **Prisma** + Cloud Run + OTel + Xendit + Qiscus + Mapbox
- API envelope: `{status: 200, message, data, pagination?}` (**numeric** status)
- Path prefixes by actor: `/driver/*`, `/customer/*`, `/client-user/*`, `/mgmt/*`, `/internal/*`
- Auth: JWT bearer + X-Channel + X-Api-Mode + X-Client-Time-Zone
- **Owns OneTimeCode / `useCode`** — table `policy_one_time_codes` (and batch via `PolicyOneTimeCodeBatch`). The Dash promo/voucher domain canonically lives here. **NOT** in `ts-delivery-service`. Portal sends as `referralCode`; ts-delivery references it indirectly via `t_delivery_policies.value` where `policy_type === 'ONE_TIME_CODE'`. Case-SENSITIVE — never `toUpperCase()`.
- Code style: tabs (width 4), no semicolons, single quotes, ES5 trailing commas (Prettier — same as halo-dash-be).
- Test: Node 24 native test runner mandated for new code (`node:test` + `node:assert`). Legacy Jest in `/test/`.

### ts-delivery-service (Delivery domain backend — Phase 1.7A documented)
- Stack: Express 4 + **Prisma 5.22.0** + TypeScript 5.5.4 strict + PostgreSQL + Cloud Run
- API envelope: **string status** — `{status: 'Success'|'Failed', message?, data?, error?, errorCode?, errors?[], pagination?, requestId, meta?}`. Top-level `error` (single, message) + `errors` (plural, structured). `errorCode` (e.g. `EB1008`) only on internal-usecase calls.
- Runtime roles via `ROLE` env: `app` (HTTP only), `worker` (Pub/Sub only), `dev` (both).
- Architecture: Layered DDD — `Request → Route → UseCase → Facade (optional) → Domain Service → Prisma/External`. Joi validation before UseCase.
- **State machine mandatory** — `DeliveryStatusStateMachine.canTransitionTo()` guards every status change. 26 statuses (EXPRESS vs LOGISTIC tables). FLEET+ and FLEX have no state machine — code uses `hasStateMachine()` to skip.
- **AppError mandatory** (`src/utils/app-error.ts` + `HttpStatus` constants). Raw `Error` becomes HTTP 500. Never `res.status().json()` direct — use `createResponse(res, statusCode, message, data, pagination?, errors?)`.
- **Joi validation in Bahasa Indonesia** — error messages baked into schemas (`'Field \`X\` wajib diisi'`). **FE surfaces as-is, NO translation.**
- Auth: JWT `Authorization: Bearer`; `req.claims.identity` from `authMiddleware`. Static token fallback for `INTERNAL_SERVICE`.
- Identity types: `WEB | CUSTOMER | DRIVER | INTERNAL-SERVICE | PROVIDER-H2H | PROVIDER-USER | CLIENT-USER` (dashes, not underscores on wire).
- Path prefixes by actor: `/v1/*` (provider H2H + mixed), `/express/v1/*`, `/client-user/v1|v2/*`, `/customer/v1/*`, `/driver/v1/*`, `/mgmt/v1/*`, `/internal/v1/*`, `/internal/aggregator/v1/*`.
- **Webhook namespace:** `provider_order.{created|in_progress|completed|cancelled|failed}` — NOT `delivery.*`. Internal Pub/Sub uses `delivery-created`, `delivery-status-updated`, etc. (different namespace from outbound).
- **Code style — different from Dash DS:** tabs + **no semicolons** + single quotes + 80-char + ES5 trailing commas + imports auto-sorted via `@trivago/prettier-plugin-sort-imports` (do NOT hand-reorder).
- **Test format — Go-style table-driven:** `const testCases: TestCase[] = [...]; testCases.forEach((tc) => it(tc.name, ...))`. Adding `it()` per scenario is a style violation. Two layers: `**/test/**` (unit, `node --test`) vs `**/integration/**` (Testcontainers Postgres). 80% line coverage required.
- JSONB fields typed: `Delivery.metadata: DeliveryMetadata`, `Timeline.metadata: DeliveryTimelineMetadata`, `Package.metadata: PackageMetadata`, `Quote.metadata: QuoteMetadata`. Don't shove arbitrary keys.

### nest-express-service (driver state / reservations BE — Phase 1.7B documented)
- Stack: **NestJS 10.x with Fastify adapter** (`@nestjs/platform-fastify`) + **Drizzle 0.45.x** (NOT Prisma) + PostgreSQL + Redis 5
- API envelope: **numeric status** — `BaseApiResponse<T>` with `status: number`, `message?`, `error?`, `errors?: string[]`, `data?`, `pagination?: { size, page, lastPage?, total }` (top-level pagination)
- Node 24.13.0 (Cloud Run target) / `>=20` dev; pnpm 10.x; Jest 29 + ts-jest
- Auth: JWT via `@nestjs/jwt`, `AuthGuard` + `@AuthTypes(BaseAuthType.X)` decorator. `BaseAuthType` enum strings: `DRIVER | INTERNAL-SERVICE | WEB | PROVIDER-USER | CLIENT-USER` (ADMIN aliased to WEB).
- Path aliases mandatory (no `../../../`): `@database`, `@infrastructure/*`, `@shared/*`, `@driver-home-base/*`, `@driver-state/*`, `@reservation/*`
- **Architecture mandates (AGENTS.md verbatim):**
  1. Always use path aliases.
  2. **All controllers extend `BaseController`** (auto-OTel span per method with `httpMethod fullPath` name).
  3. Use DI tokens from `@database` (`DB`).
  4. Handle transactions via repository methods accepting `tx` parameter.
  5. Log interceptor is global.
- Use cases extend `BaseUseCase`, repositories extend `BaseRepository`, external clients extend `BaseService`.
- Domain owned: driver state (real-time + history + battery/RAM/GPS telemetry), reservations (slot scheduling per tribe + geometry/geohash), driver home base, driver time preference, demand.
- Pub/Sub subscriber (consumes from upstream): `driver-clock-in`, `driver-clock-out`, `driver-location`, `driver-update`.
- Path prefixes: `/v1/reservations/*` (public, authed), `/internal/v1/reservations/*` (service-mesh).

### nest-fleet-service (fleet domain BE — Phase 1.7B documented)
- Stack: **NestJS 11.x** + **Drizzle 0.40.x** (NOT Prisma) + PostgreSQL + Redis (ioredis 5.x) + in-mem cache
- API envelope: **string status** — `BaseApiResponse<T>` with `status: 'Success'|'Failed'`, `message?`, `data?`, `error?`, `errors?: any[]`. **PAGINATION IS NESTED INSIDE `data`**, not top-level: `{ data: { items, pagination } }`. (Different from express/core.)
- Both express and fleet name the envelope class `BaseApiResponse<T>` and place it at the same path (`src/infrastructure/base/base-api-response.ts`) — but the `status` field type is **opposite**. **FE must discriminate by service, NOT by class name.**
- Node `>=22.0.0`; pnpm; OpenTelemetry SDK (incl. logs SDK) → SigNoz; Winston 3.17 + `@google-cloud/logging-winston`
- Auth: JWT + `AuthGuard` + `@AuthTypes`. `BaseAuthType` matches express enum (same strings).
- Webhook ingestion: env `WEBHOOK_STRATEGY='redis-stream' | 'naive'`. Batched flush to `vehicle_telemetry` + snapshot to `vehicle.telemetry_*`.
- **Architecture mandates (ARCHITECTURE.md):**
  1. Clean Architecture + DDD — strict 4-layer (domain → data → presentation → infrastructure). Domain zero-deps on outer layers.
  2. **Cross-module communication = Repository Pattern only.** Import the owning module and inject its repository into the consuming module's usecase. Do NOT call another module's usecase directly.
  3. **Minimal transaction scope:** reads use `this.db` (no transaction); writes accept `tx: DBTransaction`; validations + external API calls always **before** the transaction; multi-write atomic = one `db.transaction(async tx => Promise.all([...]))`.
  4. Banned: reads inside transactions when avoidable, external API calls inside transactions, single reads wrapped in transactions.
  5. Path aliases: `@modules/*`, `@modules/<module>/*`, `@modules/shared/*`, `@infrastructure/*`, `@database/*`.
- **Pub/Sub topics PUBLISHED by fleet (7):** `vehicle-created`, `vehicle-updated`, `vehicle-deleted`, `handover-created`, `handover-updated`, `handover-deleted`, `oem-updated`. Subscription naming: `${TOPIC}-${APP_NAME}-${moduleHint}-sub`.
- **CLAUDE.md mandate:** Do NOT modify generated Drizzle migration files (`src/database/migration/*.sql` + `meta/*.json`). EDIT schemas in `src/database/schema/table/*.table.ts`, then remind the team to run `pnpm run db:generate` and review the generated migration.
- Domain entities: Vehicle (UUID, 6×6 status×processType matrix), Handover (UUID, ACTIVE/RETURNED), Maintenance (UUID + code, **9 statuses** + temp/perm swap + FM decision), Incident (UUID + code, OPEN→IN_MAINTENANCE→MAINTENANCE_COMPLETED→CLOSED), Repossession (UUID + code, **7 statuses** with escalation + settlement), Issue, OEM, Model, Station, Vehicle telemetry, plus 5 dashboard rollups. BusinessUnit enum: `QUICK_COMMERCE | EXPRESS | X_DOCK | SCHEDULED_INSTANT | CANVASSER_RENTAL | 4_WHEEL | OUTSOURCING | STAGING`.
- Path prefixes: `v1/{vehicles, models, oems, handovers, handovers/bookings, issues, incidents, maintenances, repossessions, stations, fleet/dashboard, fleet/setting, fleet/webhooks, webhooks/scheduler}`; `internal/v1/{vehicles, handovers/bookings, repossessions, stations, fleet/dashboard}`.

## Pattern-to-stack adaptation table

When canonical pattern uses RHF/zod/TanStack and target repo bans it, translate as below.

### multi-item-form.tsx adaptation

| Target repo | Replace `useForm + useFieldArray + zod` with |
|---|---|
| portal | Jotai array atom + `useAtom` + manual validation in submit |
| backoffice | `useState<Item[]>` + manual validation + MUI Form components |
| halo | `useState<Item[]>` + manual validation + AlignUI Form |

### bulk-submit.tsx adaptation

| Target repo | Replace `fetch + Promise.all` with |
|---|---|
| portal | configured axios client + Promise.all + status map in useState |
| backoffice | axios + Promise.all + status map in useState + MUI Snackbar for toast |
| halo | axios + Promise.all + cross-domain auth headers passed |

### use-code-field.tsx adaptation

| Target repo | Notes |
|---|---|
| ALL | Case-SENSITIVE (no uppercase forcing). Real spec: 6-char alphanumeric mixed case. `genUseCode()` returns mixed case. `USE_CODE_REGEX = /^[A-Za-z0-9]{6}$/`. |

## Cross-cutting rules

### Validation approach (since zod banned)
- Use inline conditional checks in submit handler:
  ```ts
  function validate(data: T): Errors {
    const errors: Errors = {}
    if (!data.name) errors.name = "Nama wajib diisi"
    if (data.phone && !/^(\+62|62|0)[\d]{8,12}$/.test(data.phone)) errors.phone = "Format nomor tidak valid"
    return errors
  }
  ```
- Store errors in component state, display via field-level error UI

### i18n (Bahasa-first)
- Default user-facing copy in Bahasa Indonesia
- Voice: "kamu" (informal), "Anda" only per-feature override
- Driver approval ladder verbatim: "Verifikasi Tahap 1/2 → Lolos/Ditolak"

### Auth header injection
- portal: cookies → Authorization header in axios interceptor
- backoffice: NextAuth session.accessToken
- halo: cookie cross-domain

### Path prefix routing
When generating fetch URLs, infer prefix from actor + repo:
- "delivery create page in portal" → POST `/client-user/v1/deliveries`
- "delivery list in backoffice" → GET `/mgmt/v1/deliveries`
- "support thread in halo" → `/v1/agent/threads` or `/v1/support/messages`

## Anti-patterns (REFUSE — extended for 5 FE + 5 BE)

When a user prompt requests these on Dash repos, refuse + redirect:

### FE-side (was v1.5)
1. "Install react-hook-form" → "Dash team banned RHF in portal-v2 + backoffice + halo-dash + basecamp + react-fleet (all 5 FE repos verified zero imports 2026-05-20). Use Jotai (portal) or Zustand 5 (basecamp) or `useState` (all others). Reference: AGENTS.md hard bans. NOTE: react-fleet `package.json` has stale `react-hook-form`/`zod`/`@hookform/resolvers` deps but zero imports — declarative drift only, no canonical violation."
2. "Add zod schema" → "Dash uses hand-rolled validation. See validation pattern in Adaptation Layer. (zod imported in fleet-mgmt is drift.)"
3. "Use TanStack Query" → "Dash uses axios + custom hooks. See data fetch pattern. Banned in ALL 5 FE repos."
4. "Add Redux to portal/backoffice/halo/fleet-mgmt" → "Use Jotai (portal) / useState (backoffice/halo/fleet-mgmt) for global. basecamp uses Zustand 5 — that's its standard."
5. "Switch halo-dash to TypeScript" → "halo-dash-fe was intentionally migrated to JS in 2026-05-07. Do not revert."
6. "Use 'Anda' for mitra copy" → "Default voice = 'kamu' in portal-v2. 'Anda' is per-feature override only (e.g., Auto Suspend formal compliance feature)."
7. "Uppercase the use-code" → "Use-code is case-SENSITIVE per spec. genUseCode() returns mixed case. The canonical row lives in core-service's `policy_one_time_codes` table."
8. "Force this primitive to MUI / antd in backoffice" → "Backoffice tolerates MUI+antd+Tailwind co-existence. Drop @dash component as-is, do not force-convert."
9. "Add AlignUI to basecamp" → "basecamp uses **shadcn/ui (new-york style)**, not AlignUI. Use `@/components/ui/*` shadcn primitives."
10. "Add AlignUI/shadcn to react-fleet-management" → "fleet-mgmt uses **custom in-house components** at `src/components/{Button,Card,Input,Modal,Table,…}`. Do not introduce AlignUI or shadcn there without explicit user direction."
11. "Convert react-fleet-management from CRA to Next.js" → "Drift item flagged in glossary (E.1.4). Requires Dash team decision — do not initiate without explicit approval."
12. "Use blue primary in fleet-mgmt" / "Change basecamp brand color" → "Dash Purple `#5e2aac` is the brand. fleet-mgmt has a drift (`#3b82f6` blue) flagged in glossary E.1.2 — surface it as a recommendation, do not silently fix."
13. "Wire basecamp into the cross-domain SSO trio" → "basecamp uses standalone Firebase Auth. The SSO trio is portal-v2 + halo-dash + fleet-mgmt only. Do NOT propagate `crossDomainStorage` cookies into basecamp."

### BE-side (NEW)
14. "Use Prisma for nest-fleet" / "Use Prisma for nest-express" → "**nest-fleet and nest-express use Drizzle ORM, not Prisma.** Prisma is in nodejs-core-service + halo-dash-be + ts-delivery-service. Do not introduce Prisma into Nest services."
15. "Use semicolons in ts-delivery-service" → "Style mandate is **no semicolons** + tabs + single quotes + 80-char + ES5 trailing commas. Auto-sorted imports via `@trivago/prettier-plugin-sort-imports`. Do NOT hand-reorder imports."
16. "Throw raw `Error` in ts-delivery-service" → "**`AppError` mandatory** (`src/utils/app-error.ts` + `HttpStatus` constants). Raw `Error` becomes HTTP 500."
17. "Use `res.status(200).json({...})` in ts-delivery-service" → "Use `createResponse(res, statusCode, message, data, pagination?, errors?)` so envelope + requestId + meta stay consistent."
18. "Bypass the delivery state machine" / "directly set Delivery.status" → "All transitions MUST go through `DeliveryStatusStateMachine.canTransitionTo()` (or static `canTransition`). Backfills and admin overrides still call the machine."
19. "Translate Joi error messages to English" → "Bahasa Indonesia is **baked into the validation schemas** in ts-delivery-service. FE surfaces server validation errors as-is — text is already user-facing localized."
20. "Add Kafka / NATS / RabbitMQ" / "Add service mesh (Istio/Linkerd)" → "Dash BE uses **HTTP point-to-point + `INTERNAL_SECRET` header + Google Pub/Sub** only. No service mesh, no Kafka/NATS/RabbitMQ. Plain HTTP between Cloud Run services on project VPC."
21. "Modify Drizzle migration files in nest-fleet / nest-express" → "Migration files (`src/database/migration/*.sql` + `meta/*.json`) are **generated and immutable**. Edit `src/database/schema/table/*.table.ts`, then run `pnpm run db:generate` and review."
22. "Put DB reads inside a transaction in nest-fleet" / "Put HTTP calls inside `db.transaction()`" → "**Minimal transaction scope** mandate (fleet ARCHITECTURE.md). Reads outside transactions, external API calls + validations BEFORE transaction. Transactions wrap writes only."
23. "Use a usecase from another nest-fleet module directly" → "Cross-module access = **Repository Pattern only**. Import the owning module and inject its repository into the consuming module's usecase."
24. "Emit `delivery.created` / `delivery.completed` outbound webhook" → "Outbound provider webhook vocabulary is `provider_order.{created|in_progress|completed|cancelled|failed}`, NOT `delivery.*`. Internal Pub/Sub topics use `delivery-*` namespace — different from outbound."
25. "Use `it()` per scenario in ts-delivery tests" → "Tests are **Go-style table-driven**: `const testCases: TestCase[] = [...]; testCases.forEach((tc) => it(tc.name, ...))`. Adding `it()` per scenario is a style violation in code review."

### Infrastructure-side (NEW)
26. "Deploy this service to K8s / GKE" / "Add a Helm chart" / "Add kustomize" → "**ADR-0001 mandates Cloud Run + Cloud Run Jobs only.** No K8s, no GKE, no Helm, no kustomize, no Deployment manifests. The `gke-cluster` IaC module was explicitly dropped (2026-05-12)."
27. "Use `terraform init`" / "Switch to Terraform" → "Dash uses **OpenTofu 1.8.1** (pinned in `.tool-versions`). Use `tofu init`, not `terraform init`. Also: do not introduce Terragrunt (explicit decision in IAC_SPEC.md)."
28. "Add GCP_SA_KEY to a new GitHub Actions workflow" → "New workflows must use **Workload Identity Federation (WIF)** via `google-github-actions/auth@v2` with `workload_identity_provider`. Long-lived `GCP_SA_KEY` secrets are being phased out."
29. "Default to us-central1 / europe-west1 region" → "Dash default region is **`asia-southeast2`** (Jakarta). Artifact Registry repo is `cloudrun-standard` in `asia-southeast2`. Don't introduce US/EU regions without a stated reason."
30. "Commit `.env` with secret values" / "Inline secret strings in deploy script" → "**Secrets live in GCP Secret Manager.** The `secret` IaC module exposes `secret_id`, `accessors[]`, `replication_type`. Codegen that produces deployment configs must reference Secret Manager, not inline secrets."

---

## Per-service API envelope discrimination (CRITICAL — check before fetch)

Before AI generates any FE → BE fetch call, **discriminate the target service** and match the envelope shape exactly. Two services name the envelope class identically (`BaseApiResponse<T>`) but use opposite types — class name is NOT a reliable signal.

| Service | `status` field | Pagination location | Notes |
|---|---|---|---|
| `nodejs-core-service` | **number** (200, 201, 4xx, 5xx) | top-level `pagination` | Prisma, Express, Cloud Run, OTel |
| `nest-express-service` | **number** | top-level `pagination: {size, page, lastPage?, total}` | Drizzle, Nest 10 Fastify, `BaseApiResponse<T>` class |
| `halo-dash-be` | **string** `'Success'\|'Failed'` (also `'Error'` legacy) | top-level | Prisma, Express |
| `nest-fleet-service` | **string** `'Success'\|'Failed'` | **NESTED inside `data`**: `{ data: { items, pagination } }` | Drizzle, Nest 11, `BaseApiResponse<T>` class with **opposite `status` type from nest-express** |
| `ts-delivery-service` | **string** `'Success'\|'Failed'` | top-level | Prisma, plain Express, AppError + createResponse helpers |

### Rule for AI

When generating a fetch call:
1. Identify the target service (from URL prefix, env var, or explicit user statement).
2. Look up the envelope shape in the table above.
3. Write the response handler with the correct `status` field type and pagination location.
4. For `nest-fleet-service` specifically: pagination is **inside `data`**, not a sibling. Code that reads `response.pagination` will be `undefined`.
5. When in doubt: **read** the target service's `src/infrastructure/base/base-api-response.ts` (Nest services) or `src/utils/responseHelper.ts` (ts-delivery) before generating.

### Error envelope shapes

| Service | Error field | Detail field | Code field |
|---|---|---|---|
| `ts-delivery-service` | `error` (string, top-level) | `errors` (array, top-level) | `errorCode` (only when `req.isInternalUsecase`) |
| `nest-express-service` | `error` (string) | `errors: string[]` | — |
| `nest-fleet-service` | `error` (string) | `errors: any[]` | — |
| `nodejs-core-service` | `message` (string, top-level) | `errors`? | — |
| `halo-dash-be` | `message` (string) | — | — |

---

## Cross-domain SSO trio

Three FE repos share a single SSO cookie via `crossDomainStorage` helper. AI must understand which repos are in the trio before propagating auth state.

### In the trio (share `crossDomainStorage` cookie)
- **next-portal-v2-web** — cookie-based AuthContext, axios interceptor injects Bearer
- **halo-dash-fe** — `src/utils/cookieStorage.js` (`CrossDomainStorage`)
- **react-fleet-management-web** — `src/utils/cookieStorage.ts` + `src/contexts/AuthContext.tsx`

User logged into one of these three can be reflected into the other two by reading the shared cookie. AI generating SSO logic for these three should reuse the existing `crossDomainStorage` helper, not invent new cookies.

### NOT in the trio
- **next-backoffice-web** — uses **NextAuth.js** (JWT/cookie sessions, different cookie domain). Do NOT integrate with `crossDomainStorage`.
- **next-basecamp-web** — uses **Firebase Auth (Google OAuth)** standalone (`AuthProvider` context + `AuthGuard` HOC). Domain-locked to `@dashelectric.co`. Do NOT integrate with `crossDomainStorage` (basecamp is its own ecosystem).

### Rule for AI
- "Add cross-domain login to basecamp" → "basecamp uses Firebase Auth standalone — not in the SSO trio. Adding cross-domain would require Dash team's explicit decision; flag and do not silently implement."
- "Wire fleet-mgmt to share session with portal" → "Already done via `crossDomainStorage` cookie trio. Reuse the existing helper at `src/utils/cookieStorage.ts`."

---

## Code style per BE service

BE repos have **different prettier configurations**. AI must match the target service before writing code.

| Service | Indent | Semicolons | Quotes | Line width | Trailing commas | Import sorting |
|---|---|---|---|---|---|---|
| `ts-delivery-service` | **Tabs** | **None** | Single | 80 | ES5 | **Auto via `@trivago/prettier-plugin-sort-imports`** — do NOT hand-reorder |
| `nodejs-core-service` | Tabs (width 4) | None | Single | 80 | ES5 | manual |
| `halo-dash-be` | Tabs (width 4) | None | Single | 80 | ES5 | manual |
| `nest-express-service` | Spaces (Nest default) | **Yes** | Double | Nest default | (Nest default) | manual |
| `nest-fleet-service` | Spaces (Nest default) | **Yes** | Double | Nest default | (Nest default) | manual |

### Additional ts-delivery-service mandates
- **AppError mandatory** — never raw `Error` (becomes HTTP 500).
- **`createResponse(res, ...)` mandatory** — never `res.status().json()` direct.
- **Go-style table-driven tests** — never `it()` per scenario.

### FE prettier (5 FE repos)
- All 5 follow prettier defaults (spaces + semicolons + double quotes). Don't introduce tab/no-semi style on FE code.

---

## State machines (NEVER bypass)

Three Dash services have formal state machines. AI must **never** write a direct status update — always go through the canonical guard.

### Delivery (ts-delivery-service) — 26 statuses

Source: `src/app/state-machine/delivery.state-machine.ts`. Statuses + transitions vary by `service_category` (EXPRESS vs LOGISTIC).

```ts
const sm = new DeliveryStatusStateMachine(serviceCategory, currentStatus)
if (!sm.canTransitionTo(newStatus)) {
  throw new AppError('Invalid transition', HttpStatus.ClientError.BAD_REQUEST)
}
```

Static helpers: `DeliveryStatusStateMachine.canTransition`, `.isFinal`, `.getAllowedTransitions`, `.hasStateMachine`. `FLEET+` and `FLEX` categories have no machine — use `.hasStateMachine()` to skip.

**Final statuses (no outbound transitions):** `COMPLETED, DISPOSED, RETURNED, CANCELLED, EXPIRED`. UI must hide "Cancel" / "Update status" actions when `.isFinal(status) === true`.

### Maintenance (nest-fleet-service) — 9 states

```
OPEN | IN_PROGRESS
| PENDING_APPROVAL_COMPLETION | PENDING_APPROVAL_TEMP_SWAP | PENDING_APPROVAL_PERM_SWAP
| PERM_SWAP | TEMP_SWAP
| COMPLETED | CLOSED
```

Plus `from_status` field for reject-rollback. Use the maintenance service method, never direct table updates. **Temp swap** + **perm swap** are sub-flows with their own draft JSONB blobs (`draft_new_vehicle`, `draft_return_vehicle`, etc.).

### Repossession (nest-fleet-service) — 7 states

```
OPEN | IN_PROGRESS | FOUND | POTENTIAL_LOSS | PENDING_APPROVAL | WRITTEN_OFF | CLOSED
```

Plus `from_status`, `escalation_due_at`, `escalation_task_name` (Cloud Tasks). State transitions use service methods. Settlement records (`settlement_amount`, `settlement_type`, `finance_approval`) gate the `CLOSED` exit.

### Vehicle (nest-fleet-service) — 6×6 matrix

```
VehicleStatus  = IDLE | ACTIVE | LOST | IN_REPAIR | BROKEN | RETURNED
ProcessType    = AVAILABLE | ISSUE | INCIDENT | REPOSSESSION | MAINTENANCE | CANDIDATE_PERM_MAINTENANCE
```

Vehicle state = `(status, process_type)` pair. AI must never directly mutate either field; use the service method that derives the new pair from the triggering event (incident creation, maintenance close, etc.).

### Incident (nest-fleet-service) — 4 states

```
OPEN | IN_MAINTENANCE | MAINTENANCE_COMPLETED | CLOSED
```

`PATCH /v1/incidents/:ID/spawn-maintenance` transitions OPEN → IN_MAINTENANCE and creates a Maintenance record.

### Order (ts-delivery-service) — 5 states

```
CREATED | IN_DELIVERY | COMPLETED | CANCELLED | FAILED
```

---

## Webhook namespaces

Three different event vocabularies coexist in the Dash mesh. AI must use the correct one per target.

### Outbound provider webhooks (ts-delivery-service → external provider URL)
**Namespace: `provider_order.*`**

```
provider_order.created
provider_order.in_progress
provider_order.completed
provider_order.cancelled
provider_order.failed
```

Records in `webhook_events` table (`status: PENDING | SENT | FAILED`, methods `GET | POST | PUT | DELETE`). Dispatched via `PROVIDER_WEBHOOK_QUEUE` (Cloud Tasks). **Never use `delivery.*` for outbound.**

### Internal Pub/Sub topics (cross-service async, intra-Dash)
**Namespace: `delivery-*`, `driver-*`, `vehicle-*`, `handover-*`, `oem-*`, `invoice_payment.*`, `refund.capture`**

| Service | Publishes | Consumes |
|---|---|---|
| ts-delivery-service | `delivery-created`, `delivery-status-updated`, `delivery-media-created`, `delivery-report-requested`, `delivery-allocated`, `driver-availability-logged` | `invoice_payment.capture` (COD), `delivery-status-updated` (cancel-transaction worker) |
| nodejs-core-service | `refund.capture`, etc. | `invoice_payment.capture` → invoiceEventProcessor; `refund.capture` → refundEventProcessor (sender: nest-webhook-service) |
| nest-fleet-service | `vehicle-created`, `vehicle-updated`, `vehicle-deleted`, `handover-created`, `handover-updated`, `handover-deleted`, `oem-updated` (7 topics) | own topics back (dashboard + maintenance listeners) |
| nest-express-service | (none observed publishing) | `driver-clock-in`, `driver-clock-out`, `driver-location`, `driver-update` |

Subscription naming convention (Nest services): `${TOPIC}-${APP_NAME}-${moduleHint}-sub`.

### Inbound provider webhooks (provider → Dash, ts-delivery-service)
Land at: `/v1/deliveries/provider/orders/:providerOrderID/event/{create|update}`. Inbound payload schema is provider-specific (not Dash-normalized).

### Rule for AI
- "Add a `delivery.created` webhook" → "Outbound vocabulary is `provider_order.created`. Internal Pub/Sub is `delivery-created` (dash, not dot). Pick the right namespace based on destination (external provider URL vs internal cross-service)."

---

## Infrastructure rules (when generating deploy / CI / IaC code)

| Rule | Value |
|---|---|
| Cloud provider | GCP only |
| IaC tool | **OpenTofu 1.8.1** (pinned `.tool-versions`). Use `tofu init`, NOT `terraform init`. NO Terragrunt. |
| Orchestrator | Digger CLI on GH Actions self-hosted runners, GCS state locks |
| State backend | One GCS bucket `de-iac-state-prod` (or staging equivalent), region `asia-southeast2`, partial backend + CI-supplied `-backend-config=` |
| Container runtime | **Cloud Run + Cloud Run Jobs only.** ADR-0001 bans K8s/GKE. |
| Region | **`asia-southeast2`** (Jakarta) default. Artifact Registry repo `cloudrun-standard`. |
| GH Actions auth to GCP | **Workload Identity Federation (WIF)** with `repository == "dash-electric/infrastructure"` assertion + GitHub Environments env-gating. **No long-lived `GCP_SA_KEY`** in new workflows. |
| Secrets | **GCP Secret Manager.** Use the `secret` module (`secret_id`, `accessors[]`, `replication_type`). NO inline secret strings, NO committed `.env` files with values. |
| Layer numbering | `00-project → 10-networking → 20-data → 30-platform → 40-apps`. Numeric prefix encodes dependency order. |
| Naming prefix | **Tool-neutral `iac-*`** (NOT `tf-*`). SAs: `iac-runner-staging`, `iac-runner-prod`, `iac-drift-prod`. State bucket: `de-iac-state-prod`. CI vars: `IAC_RUNNER_SA_STAGING`, `IAC_STATE_BUCKET`, `WIF_PROVIDER`. |
| Available modules | `vpc`, `vpc-access-connector`, `cloud-run-service`, `cloud-sql-instance`, `secret`, `gcs-bucket`, `artifact-registry`, `service-account`, `pubsub-topic`, `pubsub-subscription`, `cloud-tasks-queue`. **NO `gke-cluster`** (dropped 2026-05-12). |
| Environments | `staging-dash-electric`, `production-dash-electric`, `sandbox-dash-electric` (sandbox deprecating). |

### Rule for AI
- Any deploy / CI / IaC code targeting Dash must:
  1. Use `tofu`, not `terraform`.
  2. Default region `asia-southeast2`.
  3. Use Cloud Run (`google_cloud_run_v2_service`), never `google_container_cluster`.
  4. Use WIF (`google-github-actions/auth@v2` with `workload_identity_provider`), never `credentials_json`.
  5. Use GCP Secret Manager for secrets, never inline.
  6. Use `iac-*` naming (not `tf-*`) when scaffolding new resources.

---

## Drift inventory awareness

The Dash domain glossary documents observed drift items in real Dash repos (Appendix E). AI must:
- **NOT silently fix** drift items (per user mandate: "kita gabisa ngubah existing, kita hanya bisa support itu").
- **Surface drift as a recommendation** when relevant to the current task.
- **Refer the user to Appendix E** of the glossary for the canonical list.

Examples:
- User asks to "add a new modal in react-fleet-management" → use `useState` per canonical pattern. RepoModal.tsx already uses local `useFormValidation` custom hook — match that pattern for consistency.
- User asks to "set primary color in fleet-mgmt" → flag that the current `#3b82f6` blue is drift from Dash Purple `#5e2aac`; ask whether to align or preserve.
- User asks to "add tests to basecamp" → flag that no test runner is configured (E.2 in glossary); ask which runner to add.

---

## Audit Trail (MANDATORY for user-editable fields carrying legal/financial weight)

> **Enforcement note (per RULE-REALITY-AUDIT-2026-05-28 A11):** rule is correct
> but currently enforced by **naming convention + reviewer attention** only.
> The DS ships audit-aware blocks (`inline-edit-with-audit`, `image-editor-with-audit`,
> `bulk-upload-with-status`, `audit-history-table`). A machine lint
> (`dash audit --rule audit-trail`) is planned to flag any form-block touching
> `payment|signature|kyc|image-proof|legal` keywords without importing an audit
> primitive. Until that lands, treat the rule as **advisory but mandatory in
> review**; reviewers must reject PRs that touch these fields without the
> audit primitive.


Applies to **any field** whose mutation could be the subject of a mitra dispute, regulator audit, or financial reconciliation:
- Image proof (POD = proof of delivery, POP = proof of pickup, KYC documents)
- Payment amounts (top-up, payout, adjustment, refund)
- Signature blobs (e-sign on delivery, contract acknowledgement)
- Delivery confirmation flags (`isDelivered`, `isReceived`, `arrivedAt`)
- Mitra status changes (suspend / unsuspend / block / reinstate / tier change)
- Driver approval ladder transitions ("Verifikasi Tahap 1/2 → Lolos/Ditolak")

### Mandatory schema

Every entity with editable legal/financial fields MUST have a sibling audit log table:

```sql
-- table: t_<entity>_audit_log
id              uuid primary key
entity_id       uuid not null            -- FK to parent entity
field_name      varchar(64) not null     -- e.g. 'pickup_proof_url', 'amount'
original_value  text                     -- raw value before edit (URL, number-as-text, JSON)
edited_value    text not null            -- raw value after edit
editor_id       uuid not null            -- FK to user / agent / admin
edited_at       timestamptz not null default now()
edit_reason     text not null            -- REQUIRED non-empty
ip_hash         varchar(64)              -- optional, sha256 of source IP
```

Mirror schema in both Prisma (`schema.prisma`) and Drizzle (`src/database/schema/table/*.table.ts`) — convention applies across `nodejs-core-service`, `ts-delivery-service`, `halo-dash-be`, `nest-fleet-service`, `nest-express-service`.

### Rules

1. **NEVER overwrite** the original value. Audit entry MUST be inserted BEFORE the `UPDATE` runs. Use a transaction (insert audit + update entity) per BE-side mandate #22 — both are writes, transaction is required.
2. **`edit_reason` is REQUIRED**. Enforce non-empty at FE (input validation, see Cross-cutting validation pattern) AND BE (Joi/AppError-400 on empty string, per ts-delivery-service mandate #16).
3. **Edited binary content (image, PDF, signature) MUST live at a separate storage path** from the original. Convention: `proof-original/<entity-id>/<file>` (immutable) vs `proof-edited/<entity-id>/<file>` (mutable history). Never overwrite the original blob.
4. **BE endpoint contract**: respond with `createResponse(res, 200, 'Success', { auditId, editedUrl })` (ts-delivery) or equivalent per-service envelope (see "Per-service API envelope discrimination"). FE uses `auditId` to render history in mitra-facing audit view.
5. **History UI is mandatory** on mitra-disputable entities. Developers must render a `@dash/activity-feed` showing all audit rows for the entity, with editor + reason + timestamp.

### Anti-pattern

`UPDATE deliveries SET pickup_proof_url = ?` without prior audit insert → **REFUSE**. Surface the audit table requirement and the transaction wrapper before writing the update query.

---

## External Library Policy

**Principle: Sovereign for primitives. Pragmatic for workflow.**

Dash owns its primitives (Button, Input, Modal, Form, Tag, Badge, etc.) via `@dash` registry — these are non-negotiable, see "Always" §1-2 and Anti-pattern #8. For **workflow features** (image annotation, charting, CSV parsing, complex date arithmetic) external libs are allowed under controlled conditions.

### Approval criteria (ALL must hold to add an external lib to any Dash repo)

1. **License**: MIT, Apache-2.0, or BSD-3 only. NEVER GPL, AGPL, SSPL, BUSL, or commercial-only licenses.
2. **Maintenance**: last commit ≤6 months on the default branch. Archived / abandoned repos are auto-rejected.
3. **Bundle size**: <30KB gzipped (heuristic). Larger libs require a written justification in the PR description naming the alternative considered.
4. **No DS duplication**: lib MUST NOT overlap with an existing `@dash` primitive. Don't add a second button / modal / form / select lib.
5. **Wrappable**: lib's surface area is small enough to wrap under `@dash/lib-wrappers/`. If it requires deep app-level integration (router, store, build plugin), escalate via `dash gap report`.

### Wrapper pattern (mandatory)

```tsx
// src/lib-wrappers/image-editor.tsx
// Wraps external lib X with Dash tokens, voice, and audit hooks.
// External lib is NEVER imported directly in feature code — only here.
import { ImageEditor as ExternalEditor } from 'some-image-lib'
import { logAudit } from '@/lib/audit'

export function ImageEditor(props: DashImageEditorProps) {
  // Apply Dash tokens, Bahasa copy, audit-on-save side-effect, etc.
  return <ExternalEditor {...mappedProps} />
}
```

Once a wrapper proves stable in one repo, it gets promoted to the DS registry as a `block` and consumed via `dash add image-editor` thereafter.

### Banned categories (refuse on sight)

- **Form libraries**: react-hook-form, Formik, Final Form, react-final-form (see Anti-pattern #1)
- **Validation libraries (UI / consumer code)**: zod, joi (FE-side), yup, ajv, valibot (see Anti-pattern #2). **Carve-out:** `packages/registry-schema/**` MAY use `zod` for runtime registry-JSON validation — this is a trust-boundary validator at the consumer-package edge, not a form-validation library. `dash audit` excepts this single path.
- **Data-fetch libraries**: TanStack Query, SWR, react-query, Apollo Client (see Anti-pattern #3)
- **Component libraries in greenfield**: MUI, antd, Chakra, Mantine, Radix-themes (backoffice tolerates legacy MUI+antd per Anti-pattern #8; do not add to new repos)

### Allowed categories (with wrapper)

- **Chart**: `recharts` is the established choice — must be wrapped, never imported direct
- **Date pickers** if `@dash/date-picker` lacks the feature (rare — first file `dash gap report`)
- **File handling**: CSV parsers (papaparse), image manipulation (browser-image-compression)
- **Animation**: framer-motion is allowed when wrapped — direct usage in feature code is discouraged

### Cross-ref

When an external lib gets wrapped, the wrapper becomes a DS block — see "Cross-Repo Component Replication" §2 below for promotion mechanics. Developers never import the underlying external lib directly in feature code.

---

## Cross-Repo Component Replication

**Single source of truth**: `/dash-ds/apps/docs/registry/dash/` is the ONLY canonical source for shared Dash components. No exceptions.

### Rules

1. **NEVER copy-paste** a component between Dash repos. Use `dash add <name>` to install a fresh copy from the registry. The CLI handles tokens, dependencies, and cssVars correctly — manual copy will silently break theming (see Anti-pattern #4).
2. **Divergence protocol**: if a component must diverge in a repo (e.g., backoffice Button needs a tone the registry doesn't have), the divergence MUST:
   1. Be reported via `dash gap report <component> --reason="<why>"` FIRST.
   2. Resolve as EITHER (a) promote the variant to DS as a new component or new variant prop, OR (b) justify per-repo override in the PR description with explicit ADR-style reasoning.
3. **No silent forks**. Once a component is vendored locally via `dash add`, developers may modify it, but:
   - **Cosmetic tweaks** (margin, label copy, icon swap) → OK in place.
   - **Behavioral changes** (state machine, event contract, accessibility tree) → log via `dash gap report` for upstream consideration; do not fork silently.
   - The component file should NOT be edited beyond surface props. Deep edits inside the component body signal a divergence that needs DS-level discussion.
4. **Version pinning**: each repo's `components.json` records installed component versions (managed by the `dash` CLI). Do not hand-edit version fields.
5. **Mass update**: `dash sync` (planned v0.5 CLI feature) will detect components installed in a repo and prompt for upgrade — do NOT precompose a manual upgrade script.

### Anti-pattern

`git cp src/components/Button.tsx <other-repo>/src/components/Button.tsx` → **REFUSE**. Run `dash add button` in the destination repo instead.

---

## DS Update Propagation

**Model**: push-pull. DS maintainer pushes updates to the registry; users pull via CLI on their schedule.

### Notification channels

- **Slack `#dash-ds-updates`**: mandatory. Every minor/major release posts a changelog summary + migration notes.
- **Email digest**: weekly roll-up across all team leads. Patch releases batched here; minor/major also announced in Slack first.

### Version semantics

Dash components follow strict semver:

| Bump | Trigger | User obligation |
|---|---|---|
| **Patch** (v1.0.x) | bug fix, no API change | Update freely whenever. No PR review required for the upgrade itself. |
| **Minor** (v1.x.0) | new feature, backward-compatible | Update at convenience. Changelog must list new props / variants. |
| **Major** (vX.0.0) | breaking change (prop rename, removed variant, behavior shift) | **Mandatory upgrade window: 14 days** from release. After window, the old version is EOL and `dash audit` will flag it as critical. |

### Auto-PR pattern

When a new component version lands in DS, the maintainer optionally triggers an auto-PR to each consumer repo upgrading the pinned version in `components.json`. Opt-in per-repo via `.dash/auto-upgrade.json`:

```json
{
  "auto_upgrade": {
    "patch": true,
    "minor": "pr-only",
    "major": false
  }
}
```

### Stale detection

`dash audit --stale` flags components >90 days behind upstream. Output is non-blocking but feeds into per-repo health dashboards.

### Maintainer commitment

- Every **minor or major** bump ships a written changelog (Markdown) covering: new props, removed props, behavior diffs, migration snippets, affected blocks.
- **Patch** bumps can be batched weekly in a single changelog entry.
- Breaking changes (major) MUST include a codemod script under `/dash-ds/codemods/<component>-vX.ts` whenever the change is mechanically migratable.

### Cross-ref

This policy assumes the "Cross-Repo Component Replication" model above — components are vendored via CLI, not imported from a shared package. Update propagation = re-running `dash add` (or `dash sync`) per repo, not bumping a node_modules dep.

