/**
 * Tool: search_tokens
 *
 * Pulls the `base-theme` registry item (Dash convention) and flattens its
 * token tree into searchable `{ path, value }` records. Supports color,
 * spacing, typography, shadow.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const SEARCH_TOKENS_TOOL = {
  name: "search_tokens",
  description:
    "Search Dash design tokens (color, spacing, typography, shadow) from the base-theme registry item. Case-insensitive substring match on token name or value.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Token search query, e.g. 'success', 'primary', 'spacing-4', '#12B76A'.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
} as const;

export interface SearchTokensInput {
  query: string;
}

export interface SearchTokensResult {
  path: string;
  value: string;
  group: string;
}

const THEME_CANDIDATES = ["base-theme", "theme", "dash-theme", "tokens"];

export async function runSearchTokens(
  client: RegistryClient,
  input: SearchTokensInput,
): Promise<SearchTokensResult[]> {
  const query = (input.query ?? "").trim().toLowerCase();
  if (!query) return [];

  const theme = await loadTheme(client);
  if (!theme) return [];

  const results: SearchTokensResult[] = [];

  // shadcn-style cssVars: { light: { "primary": "..." }, dark: {...} }
  if (theme.cssVars) {
    for (const [mode, vars] of Object.entries(theme.cssVars)) {
      for (const [k, v] of Object.entries(vars)) {
        results.push({
          path: `cssVars.${mode}.${k}`,
          value: String(v),
          group: `cssVars/${mode}`,
        });
      }
    }
  }

  // Dash-specific tokens block (nested object)
  if (theme.tokens) {
    flatten(theme.tokens as Record<string, unknown>, "tokens", results);
  }

  return results
    .filter(
      (r) =>
        r.path.toLowerCase().includes(query) ||
        r.value.toLowerCase().includes(query),
    )
    .slice(0, 100);
}

async function loadTheme(client: RegistryClient) {
  for (const name of THEME_CANDIDATES) {
    try {
      return await client.getItem(name);
    } catch {
      // try next
    }
  }
  return undefined;
}

function flatten(
  obj: Record<string, unknown>,
  prefix: string,
  out: SearchTokensResult[],
): void {
  for (const [k, v] of Object.entries(obj)) {
    const path = `${prefix}.${k}`;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, path, out);
    } else {
      out.push({
        path,
        value: Array.isArray(v) ? v.join(", ") : String(v),
        group: prefix,
      });
    }
  }
}
