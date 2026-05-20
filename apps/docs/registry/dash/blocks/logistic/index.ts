/**
 * Logistic Workflow Blocks — Layer 3, Logistic-product-specific.
 *
 * Namespace re-exports for theme-scoped discovery. Canonical metadata lives
 * in `apps/docs/registry.json` under each item's `theme: "logistic"` field.
 *
 * Usage:
 *   import { RoutePlanner } from "@/registry/dash/blocks/logistic"
 *
 * Filter by theme programmatically via `LOGISTIC_BLOCK_NAMES` against the
 * registry manifest.
 */

export * from "./route-planner"
export * from "./batch-dispatch-grid"
export * from "./package-tracking-timeline"

/** Block names in this theme — useful for filtering against registry.json. */
export const LOGISTIC_BLOCK_NAMES = [
  "route-planner",
  "batch-dispatch-grid",
  "package-tracking-timeline",
] as const

export type LogisticBlockName = (typeof LOGISTIC_BLOCK_NAMES)[number]
