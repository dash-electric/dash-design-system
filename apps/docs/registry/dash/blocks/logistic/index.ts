/**
 * Logistic Workflow Blocks — Layer 3, Logistic-product-specific.
 *
 * Placeholder for Dash Logistic launch. No members yet.
 *
 * When the first block lands, add `theme: "logistic"` + `products: ["logistic"]`
 * to its `registry.json` entry, then re-export below and append to
 * `LOGISTIC_BLOCK_NAMES`.
 */

/** Block names in this theme — useful for filtering against registry.json. */
export const LOGISTIC_BLOCK_NAMES = [] as const

export type LogisticBlockName = (typeof LOGISTIC_BLOCK_NAMES)[number]
