/**
 * Tool: list_templates
 *
 * Lists registry items of type "template" (page-level shells). Optionally
 * filters by `vertical` (marketing, hr, finance, portal, custom).
 */

import type { RegistryClient } from "../lib/registry-client.js";
import { shortType } from "../lib/schema.js";

export const LIST_TEMPLATES_TOOL = {
  name: "list_templates",
  description:
    "List Dash page templates. Optionally filter by PE vertical (marketing, hr, finance, portal, custom).",
  inputSchema: {
    type: "object",
    properties: {
      vertical: {
        type: "string",
        enum: ["marketing", "hr", "finance", "portal", "custom"],
        description: "Filter by intended PE vertical.",
      },
    },
    additionalProperties: false,
  },
} as const;

export interface ListTemplatesInput {
  vertical?: "marketing" | "hr" | "finance" | "portal" | "custom";
}

export interface ListTemplatesResult {
  name: string;
  title: string;
  description: string;
  vertical: string | undefined;
  categories: string[];
}

export async function runListTemplates(
  client: RegistryClient,
  input: ListTemplatesInput,
): Promise<ListTemplatesResult[]> {
  const index = await client.getIndex();
  const templates = index.filter((item) => shortType(item.type) === "template");
  const filtered = input.vertical
    ? templates.filter((t) => {
        const v = (t.vertical ?? "").toLowerCase();
        if (v === input.vertical) return true;
        // also accept vertical encoded in categories
        return (t.categories ?? [])
          .map((c) => c.toLowerCase())
          .includes(input.vertical as string);
      })
    : templates;

  return filtered.map((t) => ({
    name: t.name,
    title: t.title ?? t.name,
    description: t.description ?? "",
    vertical: t.vertical,
    categories: t.categories ?? [],
  }));
}
