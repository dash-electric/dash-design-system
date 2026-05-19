/**
 * Tool: list_categories
 *
 * Aggregates the registry index by `categories` (falls back to `type` group
 * if an item has no categories). Refreshes the index on every call so AI
 * gets fresh catalog data when orienting.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const LIST_CATEGORIES_TOOL = {
  name: "list_categories",
  description:
    "List all Dash registry categories with item counts and a sample of names. Use for high-level orientation in a Dash repo.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

export interface ListCategoriesResult {
  category: string;
  itemCount: number;
  sampleItems: string[];
}

export async function runListCategories(
  client: RegistryClient,
): Promise<ListCategoriesResult[]> {
  // Force-refresh index so the catalog overview is fresh.
  const items = await client.getIndex(true);
  const buckets = new Map<string, string[]>();

  for (const item of items) {
    const cats = item.categories?.length ? item.categories : [`type:${item.type}`];
    for (const cat of cats) {
      const arr = buckets.get(cat) ?? [];
      arr.push(item.name);
      buckets.set(cat, arr);
    }
  }

  return [...buckets.entries()]
    .map(([category, names]) => ({
      category,
      itemCount: names.length,
      sampleItems: names.slice(0, 5),
    }))
    .sort((a, b) => b.itemCount - a.itemCount);
}
