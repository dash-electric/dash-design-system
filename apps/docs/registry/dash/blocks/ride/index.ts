/**
 * Ride Workflow Blocks — Layer 3, Ride-product-specific.
 *
 * Namespace re-exports for theme-scoped discovery. Canonical metadata lives
 * in `apps/docs/registry.json` under each item's `theme: "ride"` field.
 * Source .tsx files remain in `../` (flat layout) — this index avoids moving
 * physical files so existing imports + `dash add` paths stay intact.
 *
 * Usage:
 *   import { MitraDisputeFlow } from "@/registry/dash/blocks/ride"
 */

export * from "../mitra-dispute-flow"
export * from "../repossession-action-sheet"

/** Block names in this theme — useful for filtering against registry.json. */
export const RIDE_BLOCK_NAMES = [
  "mitra-dispute-flow",
  "repossession-action-sheet",
] as const

export type RideBlockName = (typeof RIDE_BLOCK_NAMES)[number]
