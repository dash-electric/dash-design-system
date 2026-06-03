/**
 * Tool: get_glossary
 *
 * Returns the Dash domain glossary (dash-domain-glossary.md) — canonical
 * entity shapes, table names, state machines, and endpoint conventions across
 * all Dash repos.
 *
 * The glossary is large (~137K chars), so truncation that previously lived
 * client-side in dash-build's `ds-catalog-loader.ts` (truncateGlossary) moves
 * here: the server truncates to `charBudget` (default ~12000, matching the
 * loader) and preserves the head section where the key prefixes + entities are
 * defined.
 *
 * Reads the `dash-domain-glossary` registry item (published as
 * `r/dash-domain-glossary.json`) which inlines the markdown at files[0].content.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const DEFAULT_GLOSSARY_CHAR_BUDGET = 12_000;

export const GET_GLOSSARY_TOOL = {
  name: "get_glossary",
  description:
    "Fetch the Dash domain glossary — canonical entity shapes, table names, state machines, and endpoint conventions across all Dash repos. Server-side truncated to `charBudget` (default ~12000) to fit a prompt budget while preserving the head section.",
  inputSchema: {
    type: "object",
    properties: {
      charBudget: {
        type: "number",
        description:
          "Server-side truncation budget in characters; default ~12000 (matches dash-build's ds-catalog-loader). Pass a larger value for the fuller glossary.",
      },
    },
    additionalProperties: false,
  },
} as const;

export interface GetGlossaryInput {
  charBudget?: number;
}

export interface GetGlossaryResult {
  glossary: string;
}

const GLOSSARY_CANDIDATES = [
  "dash-domain-glossary.md",
  "rules/dash-domain-glossary.md",
];

/**
 * Truncate the long domain glossary while preserving the head (table of
 * contents + first entries, where the DRV-/SUS-/HALO- prefixes + the mitra
 * entity are defined). Mirrors dash-build's `truncateGlossary`.
 */
export function truncateGlossary(text: string, charBudget: number): string {
  if (!text) return "";
  if (text.length <= charBudget) return text;
  const head = text.slice(0, charBudget);
  // Cut at the last paragraph break so we don't break mid-entry.
  const lastNl = head.lastIndexOf("\n\n");
  const safeCut = lastNl > charBudget * 0.6 ? head.slice(0, lastNl) : head;
  return safeCut + "\n\n…(glossary truncated to fit prompt budget)";
}

async function loadGlossary(client: RegistryClient): Promise<string> {
  let lastErr: unknown;
  // Prefer the registry item (inlines the markdown at files[0].content).
  try {
    const item = await client.getItem("dash-domain-glossary");
    const file = item.files?.find((f) => f.path.endsWith(".md") && f.content);
    if (file?.content) return file.content;
  } catch (err) {
    lastErr = err;
  }
  for (const path of GLOSSARY_CANDIDATES) {
    try {
      return await client.getRawFile(path);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Could not locate dash-domain-glossary.md in registry. Last error: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}

export async function runGetGlossary(
  client: RegistryClient,
  input: GetGlossaryInput = {},
): Promise<GetGlossaryResult> {
  const budget =
    typeof input.charBudget === "number" && input.charBudget > 0
      ? input.charBudget
      : DEFAULT_GLOSSARY_CHAR_BUDGET;
  const text = await loadGlossary(client);
  return { glossary: truncateGlossary(text, budget) };
}
