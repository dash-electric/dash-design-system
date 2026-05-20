# Shared Workflow Blocks

**Layer 3 — Product-agnostic workflow blocks.** Used by any Dash product (Ride, Logistic, future verticals). No mitra/vehicle/dispatch concept required to render.

This directory holds **re-export indexes only**. The source `.tsx` files remain in `apps/docs/registry/dash/blocks/` (flat layout). Theme membership is tagged via `theme: "shared"` + `products: [...]` on each entry in `apps/docs/registry.json` — those fields are the canonical source for filtering / `dash list --theme shared`.

## Members (15)

Foundational primitives (any backoffice surface):

- `audit-history-table` — audit trail viewer for any legal/financial field
- `inline-edit-with-audit` — click-to-edit single-field with mandatory audit
- `bulk-upload-with-status` — N-file batch upload with per-file retry
- `image-editor-with-audit` — canvas crop/rotate for proof images
- `proof-image-viewer` — zoom/pan/compare for POD/POP/KYC
- `multi-stage-approval` — N-stage sequential approval workflow
- `incident-form-with-attach` — incident report form (vehicle, injury, complaint)
- `payment-receipt-edit` — high-stakes amount edit with approver gate
- `activity-timeline` — actor/action/meta vertical timeline
- `analytics-grid` — KPI strip + chart row
- `empty-state-collection` — inbox / search / filter / 404 patterns
- `stat-card-grid` — 3-4 KPI tiles
- `page-header` — backoffice page-level title block
- `section-header` — content-section heading
- `delivery-status-timeline` — 26-status delivery FSM viewer (also tagged for Ride + Logistic; lives here because it's the SAME mechanism for both)

## Why "shared" vs "ride" / "logistic"

A block is **shared** when:
1. Domain language is generic (table, form, viewer, timeline) — no mitra/repossession/dispatch concept baked into props or copy.
2. Audit-trail-shaped: legal/financial primitives must work identically across products.
3. Layout primitive (header, empty state, KPI) — pure presentation.

If a block needs Ride-specific concepts (mitra voice, fleet workflow), it belongs in `ride/`. If it needs Logistic-specific concepts (hub, lane, SLA window), it belongs in `logistic/`.

## How to use this index

This is an exploration aid for engineers picking blocks. Real consumption stays via `dash add <name>` — the CLI reads `registry.json` and pulls the source from the flat path. No imports change.
