/**
 * Shared Workflow Blocks — Layer 3, product-agnostic.
 *
 * Namespace re-exports for theme-scoped discovery. Canonical metadata lives
 * in `apps/docs/registry.json` under each item's `theme: "shared"` field.
 * Source .tsx files remain in `../` (flat layout) — this index avoids moving
 * physical files so existing imports + `dash add` paths stay intact.
 *
 * Usage:
 *   import { AuditHistoryTable, PageHeader } from "@/registry/dash/blocks/shared"
 *
 * Or filter by theme programmatically via `SHARED_BLOCK_NAMES` against the
 * registry manifest.
 */

export * from "../audit-history-table"
export * from "../inline-edit-with-audit"
export * from "../bulk-upload-with-status"
export * from "../image-editor-with-audit"
export * from "../proof-image-viewer"
export * from "../multi-stage-approval"
export * from "../incident-form-with-attach"
export * from "../payment-receipt-edit"
export * from "../activity-timeline"
export * from "../analytics-grid"
export * from "../empty-state-collection"
export * from "../stat-card-grid"
export * from "../page-header"
export * from "../section-header"
export * from "../delivery-status-timeline"

/** Block names in this theme — useful for filtering against registry.json. */
export const SHARED_BLOCK_NAMES = [
  "audit-history-table",
  "inline-edit-with-audit",
  "bulk-upload-with-status",
  "image-editor-with-audit",
  "proof-image-viewer",
  "multi-stage-approval",
  "incident-form-with-attach",
  "payment-receipt-edit",
  "activity-timeline",
  "analytics-grid",
  "empty-state-collection",
  "stat-card-grid",
  "page-header",
  "section-header",
  "delivery-status-timeline",
] as const

export type SharedBlockName = (typeof SHARED_BLOCK_NAMES)[number]
