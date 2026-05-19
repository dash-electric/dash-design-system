# Figma Parity v2 — Hold List

Items gua skip atau ga bisa extract dari Figma. Lu manual decide / provide info.

## Data display (2026-05-17)

- `data-table.tsx` — Figma has NO dedicated DataTable componentSet (no sortable+paginated+filterable composite). Dash composite remains in-house, but inner Table primitives (Header/Row/Cell/Sort icons) ARE Figma-aligned per nodes 553:22175, 587:5793, 581:2327.
- `card.tsx` (variant `elevated`) — Figma widget cards are stroke-only; elevated variant is a Dash extension (kept for general-purpose / non-widget surfaces).
- `card.tsx` padding scale rename — was sm:16 / md:20 / lg:24. New: sm:12 / md:16 / lg:20 / xl:24 (md aligned to Figma Widget 16px). **Breaking-ish**: consumers pinning `padding="md"` keep Figma look (16px), but `padding="sm"` is now 12px not 16px, and `padding="lg"` 20px not 24px. No call site in `app/` pins sm/lg/xl explicitly (default = md), impact minimal.
- `stat.tsx` `StatValue` — added `size` prop (md=24px Figma, lg=32px Figma). Default md is **smaller** than previous text-3xl (30px). Existing call sites render slightly smaller; pass `size="lg"` to restore visual weight.
- `chart.tsx` — Figma has NO ChartContainer/ChartTooltipContent CS. Recharts wrapper is Dash extension; styling already uses Figma-aligned tokens (shadow-tooltip, stroke-soft-200, text-xs axis labels matching Budget Overview chart 12/16/400 spec).
- `empty-state.tsx` — Figma `Empty States [HR]/[Finance]` CS = 148x148 illustration sets only (no full layout composition). Added `EmptyStateIllustration` slot for 148px illustrations; existing `EmptyStateIcon` (48px circular disc) kept as Dash extension for compact contexts.

## Display atoms (2026-05-17)

- `kbd.tsx` — no dedicated Figma source in AlignUI Pro (Key Components node 263:1844 hosts "Key Icons" which is a circular icon container, not keyboard kbd). Kept Dash-custom impl with mac-style raised inset shadow.
- `skeleton.tsx` — no dedicated Figma source found in scanned pages. Kept Dash-custom impl (animate-pulse + shape variants).
- `spinner.tsx` — no dedicated Figma source. Progress Bar page 450:17758 hosts linear/circular progress (determinate), not indeterminate spinner. Kept Dash-custom impl (lucide Loader2 + tone variants).
- `brand-mark.tsx` — Figma node 2771:1469 is a 3rd-party Brand Logos library (App Store, Google, etc.), NOT a circular brand mark. Repointed to "Key Icons" set in node 263:1844 which IS the circular icon container — patched sizes (32/40/48/56/64) and added `soft`/`neutral` tones to match Figma Stroke variant. `square` shape + `2xl` size kept as Dash extension.

## Misc audit (2026-05-17)

- `accordion.tsx` — Figma `210:4022` is a card-style block (white bg, 1px stroke, radius-10, padded 14, leading+trailing icon, title+description). Dash original was shadcn classic (border-b separators, text-only trigger). **Action**: kept BOTH via `variant="default"` (Figma 1:1) | `variant="ghost"` (legacy). User decide which becomes docs primary. No HOLD blocker.
- `carousel.tsx` — checked Accordion/Rating/Scroll page exports + scanned previously-pulled pages for `COMPONENT_SET` named Carousel/Slider: NONE FOUND. Embla-powered Dash composite, no AlignUI source. Logged to `dash-extensions.md` as Dash composite (already styled with Dash tokens, only stale `ring-ring` token patched).
- `resizable.tsx` — react-resizable-panels splitter, no AlignUI Pro equivalent (AlignUI ships no "Splitter" or "Resizable Panel" component-set). Logged to `dash-extensions.md` under Utility components. Stale `hover:bg-primary/40` + `text-icon-soft` tokens patched.
- `aspect-ratio.tsx` — Radix re-export utility (zero visual surface). Logged to `dash-extensions.md`.
- `field.tsx` — layout-only stack wrapper (flex-col gap-1.5), no visual styling beyond what `Label`/`Hint` already supply. Logged to `dash-extensions.md`. Uses `text-text-sub-600` semantic token (Figma-aligned).
- `form.tsx` — react-hook-form integration wrapper. All visible surface delegated to `Label` (Figma `266:2814`) + `Hint`. Logged to `dash-extensions.md`.
- `label.tsx` — checked: form-inputs agent already aligns to Figma `266:2814` Label component-set. No further patch needed in this audit pass.
- `hint.tsx` — already audited by display agent (added to `dash-extensions.md` line 29). No further patch needed.

## Button family (2026-05-17)

- [Button] `style="light"` — Figma Buttons componentSet ships only 4 styles (Filled, Stroke, Lighter, Ghost). `light` is a Dash convenience kept for backward-compat. Decide: keep as alias or drop.
- [Button] `style="link"` — Not in Figma Buttons. Use `LinkButton` for canonical link styling. Decide: keep shortcut or remove.
- [Button] `size="lg"` / `size="xl"` — Figma Buttons stops at Medium (40). Our `lg`/`xl` (44/48) are Dash extensions for hero CTAs. Default `md=36` retained as Dash UX default; Figma default is `lg=40`.
- [Button] Hover/active CSS still uses our prior `--dash-purple-700/-800` literal alphas; Figma maps Hover → `--primary-dark`. Functionally same (purple-700) but worth a future cleanup to single-source.
- [IconButton] Figma's separate "Compact Button" componentSet (node 189:3646) at 20px/24px with Stroke|Ghost|White|Modifiable styles is NOT implemented. Add as `CompactIconButton` if a smaller toolbar variant becomes needed.
- [IconButton] Figma "Full Radius=On" toggle (cornerRadius 999 = pill) not exposed. Add via `shape="pill"` prop if needed.
- [LinkButton] Figma `Underline=On` axis ↔ our `underline="always"`. Equivalence OK.
- [FancyButton] Figma "Disabled" state spec not yet pixel-verified (shadow/text/bg specifics). Currently inherits `disabled:bg-bg-weak-50 + text-text-disabled-300 + shadow-none` which matches Button family pattern. Confirm against Figma frame in next visual pass.
- [SocialButton] `microsoft` brand is Dash extension (kept for ms365 plugin login blocks).
- [SocialButton] Figma per-brand `Focus` ring not implemented (we use generic `ring-ring`).
- [SocialButton] Figma sizes ship ONLY Medium 40. We retained sm/lg/xl as Dash extensions for shipped auth blocks.
- [ButtonGroup] Figma "Active" state on ButtonGroupItem (selected pill appearance) wired via `active` prop AND `aria-pressed`. Decide whether Dash a11y guideline prefers toggle group (`aria-pressed`) vs radio group (`role="radio"`) pattern.
- [ButtonGroup] Figma container ring is a flat 1px stroke with shared corner radius. We render as `border` + child `rounded-l-[7px]/r-[7px]` (8 minus 1px border). Pixel-perfect parity vs Figma's `outline` approach may show 1px shift in screenshot diffs.

## Overlays (2026-05-17)

- [Modal/Drawer/AlertDialog/Sheet] Overlay color token — Figma scrim `#333333 @ 24%` opacity has NO semantic token in `app/globals.css`. Used arbitrary `bg-[#333333]/24` inline. Recommend emit `--bg-overlay: rgba(51,51,51,0.24)` next token sync so all four overlays share one source.
- [Modal/AlertDialog/Popover/HoverCard/Dropdown/ContextMenu/Menubar] Surface shadow — Figma uses SINGLE drop shadow `0 16 32 -12 rgba(13,18,28,0.10)`. Closest exported token is `--shadow-custom-shadows-medium` (multi-layer stack, ~90% visual match). Consider adding `--shadow-overlay-flat` matching the single-shadow spec exactly.
- [Tooltip] `size="lg"` Large variant — Figma "Large" tooltip includes title + description + close button (HORIZONTAL gap 12, p-3, rounded-xl, weight 500). Current API ships only base container; consumer composes title/desc/close manually. No `TooltipTitle`/`TooltipDescription`/`TooltipClose` subcomponents yet — out of scope for this pass.
- [Drawer] Header/Footer variants — Figma `Drawer Header [1.1]` has 12 variants (basic/with-icon/with-avatar/upload/etc), `Drawer Footer [1.1]` similar. Current Dash `DrawerHeader`/`DrawerFooter` are plain flex containers. Not enumerated as CVA variants.
- [Modal] Header/Footer subvariants — Figma ships 12 Modal Header + 7 Modal Footer variants (Basic/Left-Icon/Error/Success/Checkbox/Information/etc). Current API plain composable. Not enumerated.
- [Modal] Status Modal preset — Figma `Status Modals [1.1]` (8 variants: Error/Warning/Success × Horizontal/Vertical alignment) with leading icon-disc. Could be a `StatusModal` convenience preset. Out of scope.
- [DropdownMenu] Item subvariants — Figma `Dropdown Items [1.1]` has 60 variants (5 prefix type × 3 state × 4 size: Country/Avatar/Provider/Brand/Basic). Current Dash exposes `DropdownMenuItem` + `DropdownMenuRichItem` only. Country/Provider/Brand prefix variants NOT implemented.
- [DropdownMenu/ContextMenu/Menubar] Item size axis — Figma ships Small (36) / Medium (40) / Large (44). Current Dash items are fixed (~36). No `size` prop. Out of scope.

## Form inputs (2026-05-17)

- [GLOBAL] [bare semantic tokens like `bg-primary`, `border-error-base`, `text-icon-soft` may be missing from Tailwind v4 @theme block] — `app/globals.css` defines `--primary-base`, `--state-error-base`, `--icon-soft-400` but only `--color-icon-soft-400`, `--color-static-white`, etc are bound under `@theme inline`. Classes like `bg-primary`, `bg-error-base`, `border-primary`, `text-icon-soft` won't resolve to anything visible. Many existing components (input, checkbox, switch, progress-bar, context-menu, banner, badge) ALREADY use these broken classes. Audit cannot fix without touching `app/globals.css` (out of scope). Owner decision needed: add `--color-primary: var(--primary-base)`, `--color-error-base: var(--state-error-base)`, `--color-icon-soft: var(--icon-soft-400)`, etc. — OR rewrite all components to use explicit `-base` / `-400` suffix.
- [Input] [Hover state border-drop deferred to D28] — Figma drops border on hover; Dash keeps it. See decisions D28.
- [OTP] [No Figma OTP componentSet exists] — only "Digit Input" (single-cell, 80×64 huge) under Text Input page. No multi-slot grouping spec, no separator spec. Dash composes manually with `input-otp` lib. Figma parity = per-slot only.
- [Toggle / ToggleGroup] [No Figma source] — see decisions D32. Logged as Dash extensions in `dash-extensions.md`.
- [Tag Input / Counter Input / Inline Input] [Not yet ported] — Figma Text Input page also hosts Tag Input (`428:4860`), Counter Input (`428:5656`), and Inline Input (`429:5195`) componentSets. No Dash equivalent files exist yet. Owner decision: create stubs or skip until requested.
- [Checkbox tones] [Figma only ships primary tone] — no destructive/error tone variant in Figma. Dash kept `tone="destructive"` as extension (used by form-level validation). Logged but not removed.
- [Slider tooltip] [Figma shows always-on tooltip above thumb when dragging] — Dash uses native `title` attr only. Real tooltip-on-drag not implemented (requires controlled state + Tooltip component composition). Hold for follow-up.

## Navigation (2026-05-17)

- [Breadcrumb] No `size` axis exposed — Figma ships one fixed size (h-5 / text-sm/medium). If a small breadcrumb is needed (e.g. dense table cell), consider a `size="xs"` extension.
- [Breadcrumb] Figma divider colour for arrow is `text-soft-400 #a3a3a3` for the arrow vector but `text-disabled-300 #d1d1d1` in some frames — we standardised on `text-icon-disabled-300` for visual balance with the very-soft chevron stroke. Reconsider if visual diff fails.
- [Pagination] Figma "Group" type (button-group glued cells) NOT implemented as a separate variant — only the standalone-cell version was patched. Add a `ButtonGroupPagination` composite if the glued look is required.
- [Pagination] Figma left "Page X of Y" label and right "X / page" compact select are NOT included in the component. They are composition concerns left to the consumer. Document this in the pagination page.
- [Pagination] Figma "Selected" cell uses neutral white-card chrome with strong text (NOT a primary fill). Previous Dash impl used `shadow-custom-xs` for elevation — we replaced that with a flat stroke since the Figma frame shows no elevation. Re-add shadow if visual diff fails.
- [Tabs] Figma "Card" vertical-tab style (rounded-2xl card wrapper) NOT implemented — only the "List" style (transparent pill row) was used for `variant="pill"`. Add `variant="card"` if needed for vertical menu inside a card container.
- [Tabs] Figma item exposes optional badge / trailing-arrow / leading-icon slots; current Dash trigger only accepts children. Consumers compose icons/badges inside `<TabsTrigger>` themselves. Out of scope.
- [Tabs] Active state in Figma swaps icon colour to `--primary-base`. Implemented via `[&_svg]:` descendant selector — relies on direct `<svg>` children. Wrapping the icon in an extra `<span>` will break the colour swap.
- [SegmentedControl] Figma exposes only one size (28px item / 36px track). Dash `sm` (24/32) and `lg` (32/40) are extensions kept for sizing flexibility — they fall back to the same color logic.
- [SegmentedControl] Figma "Default" state uses `text-soft-400` (dimmer than `text-sub-600`). This is intentional Figma behaviour — unselected segments are deliberately greyed to push attention to the active fill. Previous Dash impl used `text-sub-600` (too prominent), now patched.
- [SegmentedControl] Figma `Only Icon` (icon-only) variant NOT implemented as a separate API — consumers pass icon-only children and adjust padding via `className`. Add `variant="icon-only"` if it becomes a common use.
- [StepIndicator] Figma `Sidebar` preset (3507:560 — a vertical stepper inside a soft 16px-radius card with "Contact" footer) NOT implemented as a separate component. Consumers can wrap `<StepIndicator orientation="vertical">` inside a Card to reproduce.
- [StepIndicator] Figma `completed` label colour is `text-sub-600`, NOT `text-strong-950`. Previous Dash impl used strong text for completed; now matches Figma (greyed). Visually this looks "less successful" but is intentional in Figma — re-evaluate if user feedback prefers stronger emphasis.
- [StepIndicator] Horizontal connectors use a 20×20 chevron arrow (Figma), NOT a 1px rule. The hairline-rule implementation has been removed entirely. Consumers wanting the classic stepper aesthetic should override via `withConnector={false}` + custom rule.
- [DotStepper] Figma exposes ONLY 2 sizes (Small 8px / X-Small 4px). Dash `md` (6px) and `lg` (10px) are extensions for legacy docs. Active dot in Figma is the SAME size as inactive — the "stretch-to-pill" animation in the previous Dash impl was removed.
- [DotStepper] No `completed`/`upcoming` color distinction in Figma (only current vs not-current). Previous Dash impl coloured completed dots primary — now only the current dot is primary, completed dots are stroke-soft-200 like upcoming dots.
- [NavigationMenu] Figma only exposes Topbar + Sidebar items — NOT the dropdown-content / mega-menu surface. Viewport / Content styling kept as Radix-derived defaults with `shadow-custom-shadows-small` swapped in (was undefined `shadow-custom-md`).
- [NavigationMenu] Active state swaps icon color to primary — relies on direct `<svg>` children of the trigger (see Tabs note above).
- [Sidebar] Figma `Feature Cards` (28 variants: Daily Meeting / Progress Bar / Icon & Link / Left Icon / Cloud Storage / Support / On Boarding × 4 styles) NOT implemented. These are bespoke composite cards typically placed in the sidebar footer area — consumers should compose them ad-hoc per Dash product. Could be a future `SidebarFeatureCard` family if a single product needs >1.
- [Sidebar] Figma `Header Card` (4 variants) and `User Profile Card` (4 variants) NOT implemented as named subcomponents. Consumers compose via `SidebarHeader` + `Avatar` + `Badge` directly.
- [Sidebar] Active-rail (4×20 primary bar on leading edge) is positioned with `-left-3` absolute offset matching default `px-2` padding of `SidebarItem`. If consumers override padding the rail will detach — document in API.
- [Sidebar] Collapsed state hides labels but preserves icons. Figma collapsed rail is 64px. The expanded width default was bumped 16rem → 16.5rem (264px) to match Figma. Existing call sites using `width="16rem"` explicitly are unaffected.

## Pickers / Menus (2026-05-17)

- [Select] Country / Avatar / Provider / Brand / Color / Icon leading-content variants NOT implemented — Figma exposes 7 leading slots but Dash only ships Basic. Requires asset pipeline (flag svgs, brand logos) + slot API redesign. Track as Select v2.
- [Select] Sibling componentSets `Compact Select`, `Compact Select for Input`, `Inline Select` NOT ported. Different affordance system (no border, chev-only). Separate ticket.
- [Date Picker] `Period Range [1.1]` componentSet (preset-range chips e.g. "Last 7 days") + month/year jump-to dropdown variants NOT implemented. Composition with Combobox + Calendar.
- [Time Picker] Full popover panel (status group + 15min slot generator + AM/PM switch + scroll container) NOT shipped — only primitives `TimePickerSlot`, `TimePickerStatus`, and the numeric input `TimePicker` extension exist. Phase 2 wrapper.
- [Color Picker] Figma `Color Sliders [1.1]` (Hue, Opacity) + `Color Spectrum [1.1]` NOT ported. Dropping react-colorful for hand-rolled drag gestures is too heavy for this sweep. `ColorDot`/`ColorDotGroup` primitives shipped covering the swatch-grid pattern. HSV picker kept as Dash extension.
- [File Upload] Figma `File Format Icons [1.1]` ships 9 colors × 3 sizes = 27 bespoke folded-paper SVG components. Shipped a shortcut (lucide file icon + coloured chip overlay) — visual delta minor. Add proper SVG sprite if a consumer pins literal Figma chip.
- [Command Menu] Avatar / Left Icon / Brand / Company / Country item variants NOT implemented — same asset pipeline gap as Select.
- [Rich Editor] Color Picker dropdown + Dropdown items panel (text color, highlight color, alignment) NOT shipped — Tiptap `@tiptap/extension-color` integration pending. Track as RichEditor v2.
- [Filter] Vertical filter panel (sidebar) — Figma file has 4 componentSets but Dash `Filter` only does the Horizontal chip trigger pattern. `<FilterPanel>` / `<FilterPanelItem>` sidebar API is a separate component.
- [Calendar] `Marked` day-cell state (small dot under date number for events) NOT implemented — needs `markedDates: Date[]` prop on Calendar + DayPicker `modifiers` integration.
- [GLOBAL Pickers] Previously many picker files imported shadcn legacy tokens (`bg-popover`, `border-input`, `bg-accent`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, `text-destructive`, `bg-muted`, `focus-visible:ring-ring`). NONE of these are bound under `@theme inline` in `app/globals.css` — they rendered as nothing. ALL 10 in-scope picker files patched to Dash semantic tokens (`bg-bg-white-0`, `border-stroke-soft-200`, `bg-bg-weak-50`, `text-text-sub-600`, `bg-(--primary-base)`, `text-static-white`, etc). Same risk likely exists in `breadcrumb.tsx`, `checkbox.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `popover.tsx` (not in this sweep scope). Cross-reference D40 in `decisions.md`.

## Feedback (2026-05-17)

- [GLOBAL state-light/lighter] `--state-X-light` and `--state-X-lighter` currently bind to `*-alpha-24` / `*-alpha-16` overlay tokens in `app/globals.css` (lines 233-272). Figma source-of-truth renders these as SOLID `*-200` / `*-50` foundation colors per component-instance hex output (verified across alert/banner/badge frames). User constraint: do NOT touch `app/globals.css`. Result: Alert + Toast (and Banner + Badge, out of scope) `light`/`lighter` variants render translucent vs Figma. Fix path = rebind all `--state-{error,warning,success,information,feature}-light → --dash-{color}-200` and `*-lighter → *-50` in globals.css. Single edit, fixes all feedback surfaces simultaneously.
- [Alert] Figma `feature` status = gray scale (#7a7a7a / #eaeaea / #f5f5f5). Dash uses brand purple per D3/D42. Intentional brand deviation. Document if user wants gray-Feature variant later.
- [Toaster] Sonner does not expose a per-toast `appearance="filled"` API — the Dash Toaster always renders Alert `sm-stroke` chrome. If status-tinted toast backgrounds are needed (parity with Alert filled mode), would require a custom Sonner content renderer override.
- [NotificationFeed] Figma per-item shell uses 524px fixed width and HORIZONTAL layout with gap=15. Dash uses `flex-1 min-w-0` (fluid). Width is intentionally responsive — Figma's fixed value is a frame artifact, not a parity miss.
- [NotificationFeed] Figma Avatar instances embed Top Status + Bottom Status badges (online/offline/check). Dash NotificationAvatar primitive is a plain Radix Avatar without status overlays. Use the shared `@dash/avatar` once it ships those compose-in slots; for now consumers can layer status badges manually.
- [ActivityFeed] Figma ships an `Avatar Group` type variant (multiple stacked avatars instead of one). Dash exposes generic `FeedAvatar` only — consumers compose ad-hoc with `<div class="flex -space-x-2">…`. Add `ActivityFeedAvatarGroup` if multi-actor activities become common.
- [ActivityFeed] Figma key icon palette ships dedicated icon glyphs (`user-6-line`, `file-list-2-line`, `chat-1-line`, `time-line`, etc) — Dash exposes the slot but consumers BYO lucide icons. No icon-name preset enum.
- [ProgressBar] Figma default color = blue. Dash default = primary (purple) per D52. If a non-branded dashboard surface needs the canonical Figma look pass `tone="information"`.
- [ProgressCircle] Figma sizes ship 5 discrete values (48/56/64/72/80). Dash accepts any number for flexibility but does not type-restrict beyond the union — TypeScript autocompletes Figma sizes, custom values still compile.
- [ProgressCircle] Figma circle does NOT include a status tone matrix. Status tones (success/warning/error/information) are Dash extensions for error-budget burndowns etc.

## HR templates (2026-05-17)

- [hr-login] Login illustration (Figma `3903:27565`) — instance of `Login Image [HR Management] [1.1]` not exported as raster/SVG asset. Substituted with Time Off promo card on gradient placeholder. Marked `// TODO` inline.
- [hr-register] Register illustration (Figma `3903:27620`) — same source componentSet as hr-login. Same placeholder applied.
- [hr-reset-password] Reset Password illustration (Figma `3903:27675`) — same source componentSet. Same placeholder applied.
- [hr-dashboard / hr-calendar / hr-teams / hr-profile-settings] Sidebar + Page Header instances — Figma frames embed full `Sidebar [Navigation]` and `Page Header` instances. Templates render layout-only (no sidebar/topbar) so they can compose inside `DashboardShell`. Real instantiation = wrap template in `DashboardShell` with HR-specific groups (Dashboard / Calendar / Time Off / Projects / Teams / Integrations / Benefits / Documents).
- [hr-calendar] Calendar grid uses static absolute-positioning mockup. Figma event blocks have richer color/avatar treatment; current render is structural parity only. Phase 5 visual polish.
- [hr-profile-settings] Vertical tab nav is stub-only (visual). Real impl wires `@dash/tabs` orientation="vertical" or router state.

## HR Tier-2 templates (2026-05-17)

- [hr-get-started / hr-personal-information / hr-role-selection / hr-position-selection / hr-password-setup / hr-complete-onboarding] Onboarding "Custom Icon" header circle — Figma uses bespoke radial gradient + glow + tinted Key Icon (e.g. `user-add-fill`, `account-pin-box-fill`, `user-settings-fill`, `account-pin-circle-fill`, `lock-fill`, `select-box-circle-fill`). Substituted with neutral 56×56 `bg-bg-weak-50` circle + plain lucide icon. Visual fidelity placeholder only — Phase 5 raster export TBD.
- [hr-personal-information] Phone country select — Figma uses `Compact Select for Input` with full country flag list. Stubbed as a static "🇺🇸 +1" non-functional button inside `InputRoot`. Real impl wires `@dash/select` with country code dataset.
- [hr-personal-information / hr-role-selection / hr-position-selection / hr-password-setup / hr-complete-onboarding] Step indicator — Figma shows 5 inline pill steps separated by chevron-right. Renders correctly via Dash `StepIndicator` + `Step`; hidden on small viewport (`hidden md:flex`) since Figma source is desktop-only.
- [hr-role-selection] Radio Card chrome — Figma `Radio Card [1.1]` has bespoke icon-disc + selection ring. Re-implemented inline as a `button[role=radio]` with primary-base border + alpha ring. No componentSet exists in Dash UI today.
- [hr-enter-verification] Verification illustration — Figma `3903:27620` (same `Login Image [HR Management] [1.1]` componentSet as hr-login). Substituted with Time Off promo card (gradient placeholder). Marked `// TODO` inline.
- [hr-enter-verification] 4-digit OTP slot styling — Dash `InputOTP` default styling used directly. Figma `Digit Input [1.1]` shows slightly larger 48×48 boxes; current OTP slot is 40×40. Acceptable structural parity, defer pixel match.
- [hr-general-settings / hr-company-settings / hr-notification-settings / hr-privacy-security / hr-integrations-settings] Full-page render — Figma frames embed `Sidebar [Navigation]` + `Page Header` instances. Templates render content-only (vertical tab nav + active panel), no outer sidebar. Compose inside `DashboardShell` for the full-page experience. Same convention as Phase 3a hr-profile-settings.
- [hr-notification-settings] Upgrade promo block — Figma uses bespoke Sparkles illustration + soft-purple lighter card. Rendered with lucide `Sparkles` icon disc + `bg-(--dash-purple-50)` lighter Card variant. Asset replacement TBD.
- [hr-privacy-security] 2FA / Active Sessions / Delete Account sub-tabs — Default active = Change Password. Other tabs are visual stubs (no panels swapped on click). Real impl wires `@dash/tabs` + per-tab content (QR code for 2FA, session table, danger zone).
- [hr-integrations-settings / hr-integrations] App logos — Figma uses real product brand marks (Microsoft Office, Zoom, Slack, Trello, Monday.com, Skype, Jira, Asana, Zendesk). Substituted with colored 40×40 squares + single-letter initials. Real impl pulls SVG brand logos (license-aware) via a registry of supported integrations.
- [hr-integrations] Filter row "Change Label" sort variant — Figma shows a Select with Badge slot ("Sort by · Badge"). Simplified to a single-option Select with literal "Sort by: Popular/Newest/A–Z" entries — Badge slot omitted for noise reduction.
- [hr-integrations] Switch + Manage button per card — Figma renders both inline on a single horizontal row. In responsive cards (`md:2 / xl:3` grid) they share the bottom of the card body via `justify-between`. Pixel-level placement differs from Figma but information architecture is preserved.

## Phase 3b/4b — Blocks (2026-05-17)

- [Block] Page/Section Header `brand` + `company` leading variants — Figma uses literal AlignUI brand monograms (Loom, Apex) drawn as VECTORs inside instances; no exported asset. Dash falls back to a square 56/48 placeholder ring when `leading="brand"|"company"` and no `leadingSlot` is provided. Consumers should pass their own `leadingSlot={<BrandMark/>}` for real product branding.
- [Block] Page Header primary `controls` slot — Figma example uses Select component with full Label + Hint affordance ("Change Label", "Help?", "Last month", "This is a hint text…"). Dash ships an open `controls?: ReactNode` slot only — consumers wire their own Select / DatePicker. No opinion baked into the header.
- [Widget] HR Status Tracker `On Break` / `Active` status colors — Figma uses bespoke colored chip tints not in Dash state-tokens (orange-700, amber-700). Used `--dash-orange-50/-700` direct color tokens. If state palette is later expanded with `state-pending-light` etc, refactor.
- [Widget] Finance MyCards full vertical variant (`💳 My Cards (Vertical)`) — Figma ships a separate vertical layout with extra rows (Card Number, Expiry Date, CVC, Recent Transactions). Ported only the compact horizontal variant. Vertical = follow-up if a finance settings page requires it.
- [Widget] Finance Stock Market Tracker / Credit Score / Currency List / Exchange / Spending Summary / Major Expenses / Total Expenses / Saved Actions / Donation Profile — 9 finance widgets NOT ported (only 6 of 16 ported in this pass per scope "5-8 most common"). Stock Market Tracker is highest-priority next addition (composes ButtonGroup + chart).
- [Widget] HR Daily Feedback / Work Hour Analysis / Courses / Daily Work Hours / Training Analysis / Course Progress / Employee Rating / Current Project — 8 HR widgets NOT ported (only 6 of 14 ported). Current Project + Course Progress are highest-priority next additions.
- [Widget] BudgetOverview chart — Figma shows a stacked-bar chart with 4 categories (Income/Expenses/Scheduled + Last Year). Ported as inline 2-color div-bars to avoid recharts dependency in the block. Real chart impl = swap to `<ChartContainer>` from `@dash/chart`.
- [Widget] TotalBalance sparkline — Figma shows an actual line chart with axis labels (0/2k/3k/4k/5k/100). Ported as inline single-color SVG polyline. Real chart impl = swap to `<ChartContainer>`.
- [Widget] Empty-State variants — every Figma widget has matching `Empty State=On` variant (e.g. Time Off Off vs On). Empty states NOT ported in this pass — each widget assumes filled state. Add `<EmptyState/>` fallback if any widget consumer needs the zero-data render.
- [Example] Badge "Status Tracker" example (Figma id 2950:6460) — duplicates HR Status Tracker widget content. Not ported separately (consumer can use `<StatusTrackerWidget />` directly).
- [Example] Banner / ButtonGroup / Modal / Alert Examples — discovered via scan (Banner=3, ButtonGroup=3, Modal=2, Alert=4) but NOT ported in this pass. Banner examples are simple inline strips with a CTA link (compositional, no new block needed). ButtonGroup examples reuse Stock Market Tracker / My Cards (already widget territory). Modal examples are status-confirmation modals (could be a `StatusModal` preset — same hold as overlays section). Alert examples are inline notification-card compositions. Skipped as low priority — example blocks should illustrate atom *usage*, not duplicate widget territory.
- [Example] Avatar / Button examples use placeholder avatar fallbacks — Figma compositions reference real image fills (Saved Recipients shows actual headshots). Ported with initials-only fallbacks. Consumers provide their own image URLs via `avatarSrc`.

## Finance Tier-2 templates (2026-05-17)

- [finance-profile-settings / finance-company-settings / finance-notification-settings / finance-team-settings / finance-privacy-security / finance-integration-settings / finance-localization-settings] Sidebar + Page Header instances — Figma frames embed full `Sidebar [Navigation]` and `Page Header` instances. The 7 settings templates render the SETTINGS-shell (vertical category nav + header + content) only; product chrome (Apex left rail, brand bar, etc) is intentionally NOT embedded so consumers compose inside `DashboardShell` or `AuthShell`. Same approach as Phase 3a HR settings.
- [finance-profile-settings] "Apex ID" row Copy/Share buttons are stub-only — no clipboard wiring. Consumers add `navigator.clipboard.writeText(id)` handler.
- [finance-company-settings] Logo placeholder uses neutral 64x64 building glyph (`<Building2/>`). Figma source shows literal Apex monogram. Consumers swap in `<BrandMark/>` or `<img>`.
- [finance-notification-settings] Theme radio cards (Light/Dark/System) are visual-only — they do not wire to a real theme provider. Real impl = bind selected value to `useTheme()` from `next-themes` or similar.
- [finance-team-settings] SegmentedControl labels rewritten from Figma source `[All / Income / Expenses]` (literal frame default) → `[All / Active / Invited]` for semantic accuracy. Status badge column uses Dash `Badge` status="success" for active members, "warning" for invited.
- [finance-privacy-security] Browser column icon = neutral `<Globe/>` glyph (lucide-react does not ship `Chrome` / `Firefox` brand icons in the version pinned in package.json). Consumers swap in branded SVG via React render-prop if needed.
- [finance-integration-settings] App logos are letter-glyph placeholders (M/S/A/Z/D/Z) — Figma source uses literal Microsoft/Slack/Asana/Zoom/Dropbox/Zendesk brand marks. Consumers swap via `glyph` prop or render a real `<img src>`.
- [finance-localization-settings] All four field-rows are display-only with "Edit" link. Real impl = wire to Select / Combobox dialogs (Language, Currency, Timezone, DateFormat are all big lists — overlay UX TBD).
- [finance-register / finance-reset-password / finance-email-verification] Top-bar inline language select shown as static `ENG` text — Figma source uses an `Inline Select` instance with chevron. Real impl = wire `<Select/>` with i18n config.
- [finance-email-verification] Figma source shows 4 digit slots ("4-7-0-9"). Defaulted `length={4}` but exposed prop `length: 4 | 6` since 6-digit OTP is more common in production. Slot dimensions enlarged via `className` override (`h-16 w-16 text-2xl`) on each `InputOTPSlot`.
- [finance-my-card-detail] Action row "Unhide" toggle visually identical to "Hide" — no actual reveal state wired. Real impl = controlled state revealing real card number/CVC, with timeout auto-rehide.
- [finance-my-card-detail] Transaction direction-icon backgrounds use `--state-success-light` / `--state-error-light` which currently bind to alpha overlays in `app/globals.css` per Phase 1 hold-list note. Render is translucent vs Figma solid. Fix path = same global rebind covering all light/lighter state tokens.
- [Shared `_finance-settings-shell.tsx`] Internal helper file used by 7 settings templates. NOT registered as its own `dash add ...` block — it's a `registry:component` payload bundled into each settings template entry. Filename prefix `_` matches convention for internal-only modules.
