# DS Component Coverage Gap — 10 PM Ops Prompts
Date: 2026-05-28
Total registry components scanned: 226 (per `apps/docs/registry.json`)
Average coverage: ~73%

## Inventory snapshot

- **UI atoms (94)**: `accordion`, `activity-feed`, `alert`, `alert-dialog`, `animated-alert`, `announcement-bar`, `aspect-ratio`, `availability-status`, `avatar`, `badge`, `banner`, `brand-mark`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `color-picker`, `combobox`, `command`, `compact-button`, `context-menu`, `dash-logo`, `data-table`, `date-picker`, `discount-line-item`, `divider`, `dot-stepper`, `drawer`, `dropdown-menu`, `empty-state`, `empty-state-illustration`, `fancy-button`, `fancy-loader`, `field`, `file-upload`, `filter`, `form`, `hint`, `hover-card`, `icon-button`, `information-banner`, `input`, `input-otp`, `kbd`, `label`, `language-select`, `link-button`, `menubar`, `modal`, `navigation-menu`, `notification-feed`, `notification-onboarding`, `pagination`, `password-input`, `popover`, `price-with-discount`, `progress-bar`, `progress-circle`, `radio`, `rating`, `resizable`, `rich-editor`, `scroll-area`, `segmented-control`, `select`, `sheet`, `shield-crown`, `shimmer`, `sidebar`, `skeleton`, `slider`, `social-button`, `spinner`, `spinner-loader`, `stat`, `step-indicator`, `switch`, `table`, `tabs`, `tag`, `textarea`, `theme-switch`, `time-picker`, `toaster`, `toggle`, `toggle-group`, `tooltip`, `upload-card`, `widget-shell`.
- **Blocks (50 top-level + sub-dirs `logistic/`, `ride/`, `shared/`)**: notable — `activity-timeline`, `analytics-grid`, `audit-history-table`, `bulk-upload-with-status`, `delivery-status-timeline`, `image-editor-with-audit`, `incident-form-with-attach`, `inline-edit-with-audit`, `mitra-dispute-flow`, `multi-stage-approval`, `orders-table`, `page-header`, `payment-receipt-edit`, `proof-image-viewer`, `repossession-action-sheet`, `section-header`, `settings-integrations`, `settings-notifications`, `settings-privacy-security`, `settings-profile`, `settings-team`, `stat-card-grid`, `team-grid`, `transactions-table`, plus auth/login/signup/forgot/verification variants. `logistic/`: `batch-dispatch-grid`, `package-tracking-timeline`, `route-planner`. `ride/`: `driver-assignment-board`, `polygon-shift-map`, `surge-multiplier-card`.
- **Templates (70)**: `dashboard-shell`, `auth-shell`, `halo-dash-3pane`, `settings-tabs-page`, `form-stepper-page`, `list-detail-page`, `mitra-suspend-page`, `phase7-results-page`, plus full finance-/hr-/marketing-* page sets.
- **Patterns (3)**: `bulk-submit`, `multi-item-form`, `use-code-field`.

---

## Per-prompt coverage

### Prompt 1: Halaman approve refund per outlet — filter status + bulk action
**Need:** DataTable, Filter, Status badge, Bulk action toolbar, Drawer (detail), Approve confirm modal, Pagination, Page header
**Have:** `data-table.tsx`, `filter.tsx`, `badge.tsx`, `drawer.tsx`, `alert-dialog.tsx` (approve confirm), `pagination.tsx`, `page-header.tsx`, `multi-stage-approval.tsx` (approval block), `bulk-submit.tsx` pattern
**Partial:** No dedicated `BulkActionBar` atom — sticky bottom action bar must be composed from `button-group` + `card`. Approve-with-reason flow can lean on `rich-editor` + `alert-dialog` but no first-class pattern.
**Miss:** `BulkActionBar` (sticky multi-select), filter-chip group (filter atom is search/pill, no removable chip row), per-row approve action menu pattern.
**Coverage:** 80%

### Prompt 2: Dispatch board (dispatcher) — drag-drop assignment + real-time status
**Need:** Kanban/board columns, drag-drop primitive, driver card, status badge, real-time indicator, polygon/shift map, surge card, assign drawer
**Have:** `blocks/ride/driver-assignment-board.tsx`, `blocks/ride/polygon-shift-map.tsx`, `blocks/ride/surge-multiplier-card.tsx`, `blocks/logistic/batch-dispatch-grid.tsx`, `availability-status.tsx`, `badge.tsx`, `drawer.tsx`, `avatar.tsx`, `card.tsx`
**Partial:** Driver assignment board exists but no generic `KanbanBoard` primitive (only ride-specific). No `RealtimePresence` / live-status pulse primitive — must compose `availability-status` + custom WebSocket layer.
**Miss:** Generic drag-drop column primitive (dnd-kit wrapper), conflict/lock indicator, multi-driver bulk-assign sheet pattern.
**Coverage:** 65%

### Prompt 3: Form reimbursement — upload receipt + multi-step
**Need:** Stepper, multi-step layout, form fields, file-upload (receipt), currency input, date picker, textarea, submit/draft action, review summary step
**Have:** `step-indicator.tsx`, `dot-stepper.tsx`, `templates/form-stepper-page.tsx`, `form.tsx`, `field.tsx`, `input.tsx`, `file-upload.tsx`, `upload-card.tsx`, `date-picker.tsx`, `textarea.tsx`, `button.tsx`, `patterns/multi-item-form.tsx`, `blocks/incident-form-with-attach.tsx` (close analog), `blocks/payment-receipt-edit.tsx`
**Partial:** No native IDR currency input atom — must wrap `input` with formatter (payment-receipt-edit has the logic embedded). Review-summary step has no canonical block.
**Miss:** `CurrencyInput` atom, `ReviewSummaryStep` pattern, draft autosave indicator.
**Coverage:** 85%

### Prompt 4: List mitra — filter status, suspension level, bulk action
**Need:** DataTable, Filter (multi-facet), Status badge, Suspension-level badge, Bulk action, Row drawer, Pagination, suspend action sheet
**Have:** `data-table.tsx`, `filter.tsx`, `badge.tsx`, `tag.tsx`, `drawer.tsx`, `pagination.tsx`, `blocks/repossession-action-sheet.tsx`, `templates/mitra-suspend-page.tsx`, `blocks/mitra-dispute-flow.tsx`, `bulk-submit.tsx` pattern
**Partial:** Suspension level uses generic `badge` (no semantic Lvl-1..Lvl-4 variant). Bulk action toolbar = compose (see Prompt 1).
**Miss:** `SuspensionLevelBadge` (semantic), `BulkActionBar`, multi-facet filter chip row.
**Coverage:** 80%

### Prompt 5: Dashboard cost per tribe per bulan — breakdown chart
**Need:** Dashboard shell, KPI stat cards, line/bar chart, breakdown bar (stacked), date-range picker, segmented filter (tribe), data table (drill-down)
**Have:** `templates/dashboard-shell.tsx`, `blocks/stat-card-grid.tsx`, `blocks/analytics-grid.tsx`, `blocks/finance-widgets.tsx`, `chart.tsx` (recharts wrapper), `stat.tsx`, `date-picker.tsx`, `segmented-control.tsx`, `data-table.tsx`, `widget-shell.tsx`
**Partial:** `date-picker` exists but no `DateRangePicker` variant for month-over-month. Tribe-specific palette tokens absent.
**Miss:** `DateRangePicker`, `BreakdownStackedBar` preset (chart is raw recharts), `TribeColorTokens`, cost-table preset with subtotal rows.
**Coverage:** 75%

### Prompt 6: Incident timeline + assign owner + comment thread
**Need:** Activity timeline, assign-owner combobox, avatar, comment composer, comment list, status badge, drawer/sheet, incident form
**Have:** `blocks/activity-timeline.tsx`, `ui/activity-feed.tsx`, `combobox.tsx`, `avatar.tsx`, `rich-editor.tsx` (composer), `badge.tsx`, `drawer.tsx`, `sheet.tsx`, `blocks/incident-form-with-attach.tsx`, `blocks/delivery-status-timeline.tsx`
**Partial:** No dedicated `CommentThread` block — must compose `activity-feed` + `rich-editor` + `avatar`. No @mention picker.
**Miss:** `CommentThread` block (nested replies, edit/delete), `MentionPicker`, SLA countdown chip, assignee-history sub-timeline.
**Coverage:** 70%

### Prompt 7: Settings page (auth integration + billing + team members)
**Need:** Settings tabs shell, integrations grid, team members table, billing summary, profile card, invite modal, role select
**Have:** `templates/settings-tabs-page.tsx`, `blocks/settings-integrations.tsx`, `blocks/settings-team.tsx`, `blocks/settings-profile.tsx`, `blocks/settings-notifications.tsx`, `blocks/settings-privacy-security.tsx`, `blocks/team-grid.tsx`, `templates/finance-payment-billing` (marketing variant), `templates/hr-integrations.tsx`, `modal.tsx`, `select.tsx`
**Partial:** Auth-integration (OAuth / SSO connector) is generic integrations grid — no SSO-config wizard. Billing block exists only as marketing-finance template, not as standalone billing block.
**Miss:** `SSOConfigPanel`, standalone `BillingBlock` (invoice list + plan card + payment method).
**Coverage:** 90%

### Prompt 8: Audit log viewer — diff before/after + filter actor
**Need:** Audit table, before/after diff, actor avatar+filter, timestamp, JSON/field diff viewer, filter
**Have:** `blocks/audit-history-table.tsx`, `blocks/inline-edit-with-audit.tsx`, `blocks/image-editor-with-audit.tsx`, `blocks/payment-receipt-edit.tsx` (before/after confirm), `avatar.tsx`, `filter.tsx`, `data-table.tsx`, `drawer.tsx`
**Partial:** Diff currently rendered ad-hoc inside `payment-receipt-edit` and `inline-edit-with-audit` — no shared `DiffView` primitive.
**Miss:** `DiffView` (side-by-side / inline JSON), `ActorFilterChip` (avatar+name pill), `AuditDetailDrawer` shared shell.
**Coverage:** 60%

### Prompt 9: Comparison table 2 entity (driver/outlet) — highlight diff
**Need:** Side-by-side table, entity header, value diff highlight, status badges, copy/link, select-entity combobox
**Have:** `table.tsx`, `data-table.tsx`, `combobox.tsx`, `badge.tsx`, `avatar.tsx`, `card.tsx`, `blocks/proof-image-viewer.tsx` (has side-by-side compare for images)
**Partial:** Image side-by-side exists, but no tabular two-entity comparison block. `table.tsx` can render, but diff highlighting must be hand-rolled.
**Miss:** `ComparisonTable` block, `DiffHighlightCell`, entity-picker dual combobox pattern.
**Coverage:** 45%

### Prompt 10: Wizard onboarding 4-step — progress + back/forward + skip
**Need:** Stepper, multi-step layout, progress bar, prev/next/skip actions, completion screen, persisted state
**Have:** `step-indicator.tsx`, `dot-stepper.tsx`, `templates/form-stepper-page.tsx`, `progress-bar.tsx`, `progress-circle.tsx`, `templates/hr-complete-onboarding.tsx`, `templates/hr-get-started.tsx`, `templates/hr-personal-information.tsx`, `notification-onboarding.tsx`, `button.tsx`
**Partial:** `form-stepper-page` has Prev/Next but no explicit `Skip` slot. No canonical persisted-progress storage helper.
**Miss:** `SkipStepAction` slot in stepper template, `OnboardingCompletionScreen` (confetti + summary + next-action card).
**Coverage:** 90%

---

## Coverage roll-up

| # | Prompt | Coverage |
|---|--------|----------|
| 1 | Refund approval | 80% |
| 2 | Dispatch board | 65% |
| 3 | Reimbursement form | 85% |
| 4 | Mitra list + bulk | 80% |
| 5 | Tribe cost dashboard | 75% |
| 6 | Incident timeline + comments | 70% |
| 7 | Settings (auth/billing/team) | 90% |
| 8 | Audit log + diff | 60% |
| 9 | Comparison table | 45% |
| 10 | Wizard onboarding | 90% |
| | **Average** | **73.5%** |

---

## Top 10 missing components (across all prompts)

1. **BulkActionBar** — needed by Prompts 1, 4 (sticky multi-select toolbar). Compose-only today.
2. **DiffView** — needed by Prompts 8, 9 (side-by-side / inline diff). Logic exists scattered across `payment-receipt-edit` and `inline-edit-with-audit` — needs extraction.
3. **ComparisonTable** block — needed by Prompt 9. Largest single-prompt gap.
4. **DateRangePicker** — needed by Prompt 5 (and likely many analytics pages). `date-picker` is single-date only.
5. **CommentThread** block — needed by Prompt 6. `activity-feed` + `rich-editor` exist but no composed thread with reply/edit/delete affordances.
6. **CurrencyInput (IDR)** — needed by Prompts 3, 5. Currently re-implemented inline.
7. **FilterChipGroup** — needed by Prompts 1, 4, 8 (removable, multi-facet). Distinct from existing `filter.tsx` (search/pill).
8. **KanbanBoard primitive** — needed by Prompt 2. Only ride-specific assignment board exists.
9. **SSOConfigPanel** — needed by Prompt 7 (auth integration). Generic integrations grid is not a substitute for OAuth/SAML setup wizard.
10. **MentionPicker** — needed by Prompt 6 (and any collaborative composer).

---

## Recommended next 5 additions (priority order)

1. **BulkActionBar** (UI atom) — unblocks 2 high-frequency list pages (Prompts 1, 4), pure composition layer, low effort (~½ day). Highest leverage.
2. **DiffView** (UI atom + audit block) — extract from `payment-receipt-edit` + `inline-edit-with-audit`. Unblocks audit + comparison + future approval flows.
3. **ComparisonTable** block — solves the lowest-coverage prompt (45%) and surfaces in QBR / vendor-evaluation / mitra-evaluation pages.
4. **DateRangePicker** (UI atom) — required by every analytics/finance dashboard; current `date-picker` is single-date and forces ad-hoc fixes.
5. **CommentThread** block + **MentionPicker** atom — pair-shipped; unblocks incident, dispute, audit-discussion flows in one go.

---

## Components with 0 use across these 10 prompts (candidates for deprecation review)

Note: zero use *in these 10 ops prompts* — many may still be valid for marketplace/marketing surfaces. Treat as a "should we keep these in the @dash registry for internal ops?" list, not a kill list.

- `accordion.tsx` (no ops prompt needed it; useful for FAQ/docs only)
- `aspect-ratio.tsx`
- `carousel.tsx` (consumer-facing only)
- `color-picker.tsx`
- `discount-line-item.tsx` (marketing/commerce)
- `fancy-button.tsx`, `fancy-loader.tsx` (marketing surfaces)
- `kbd.tsx` (only useful inside command palette)
- `language-select.tsx`
- `menubar.tsx` (desktop-app metaphor; rarely used in web ops)
- `price-with-discount.tsx` (marketing/commerce)
- `rating.tsx` (consumer-facing only)
- `shield-crown.tsx` (decorative)
- `slider.tsx` (rare in ops; mostly settings)
- `social-button.tsx` (auth only)
- `theme-switch.tsx` (settings-only)
- `blocks/announcement-bar.tsx`, `blocks/avatar-recipient-selection.tsx`, `blocks/badge-upvote-card.tsx`, `blocks/my-cards-stack.tsx`, `blocks/products-grid.tsx`, `blocks/discount-line-item` — all consumer/finance-product surfaces, not ops.
- Most `auth-*`, `signup-*`, `login-*` blocks (10+ variants) — ops uses one login flow, the variants are demo fodder.
- `templates/marketing-*` set (20+ pages) — ports of AlignUI Pro Figma; useful as reference but unused by internal ops prompts.

**Recommendation:** keep them registered but move them to a separate `@dash/showcase` namespace so `dash add` autocomplete for internal ops doesn't get polluted. Don't deprecate — the AlignUI ports are paid-IP value.
