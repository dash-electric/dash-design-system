/**
 * Tool: search_components
 *
 * Case-insensitive substring search across title + description + categories +
 * name. Optional `type` filter narrows by registry kind.
 */

import type { RegistryClient } from "../lib/registry-client.js";
import { shortType, type RegistryItemSummary } from "../lib/schema.js";

export const SEARCH_COMPONENTS_TOOL = {
  name: "search_components",
  description:
    "Search the Dash Design System registry. Case-insensitive substring match across title, description, name, and categories. Returns up to 50 matches.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Free-text query, e.g. 'list page', 'button', 'data table'.",
      },
      type: {
        type: "string",
        enum: ["ui", "theme", "block", "template", "file"],
        description: "Optional filter by registry item type.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
} as const;

export interface SearchComponentsInput {
  query: string;
  type?: "ui" | "theme" | "block" | "template" | "file";
}

export interface SearchComponentsResult {
  name: string;
  type: string;
  title: string;
  description: string;
  categories: string[];
}

export async function runSearchComponents(
  client: RegistryClient,
  input: SearchComponentsInput,
): Promise<SearchComponentsResult[]> {
  const query = (input.query ?? "").trim().toLowerCase();
  if (!query) return [];

  const index = await client.getIndex();
  const filtered = index.filter((item) => matches(item, query, input.type));
  return filtered.slice(0, 50).map((item) => ({
    name: item.name,
    type: shortType(item.type),
    title: item.title ?? item.name,
    description: item.description ?? "",
    categories: item.categories ?? [],
  }));
}

function matches(
  item: RegistryItemSummary,
  query: string,
  typeFilter: string | undefined,
): boolean {
  if (typeFilter && shortType(item.type) !== typeFilter) return false;
  const hay = [
    item.name,
    item.title ?? "",
    item.description ?? "",
    ...(item.categories ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}
