/**
 * Tool: get_rules (formerly get_ai_rules)
 *
 * Returns the contents of `dash-ai-rules.md` — the canonical conventions
 * file that AI agents should consume on first invocation in a Dash repo.
 *
 * The legacy `get_ai_rules` name is kept registered as a deprecation alias
 * (same handler) until v0.3. New integrations should use `get_rules`.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const GET_RULES_TOOL = {
  name: "get_rules",
  description:
    "Fetch the Dash Design System conventions for AI code generation. Read this first when working in a Dash repo. `variant:\"full\"` (default) returns the canonical dash-ai-rules.md; `variant:\"compressed\"` returns the pre-compressed Skill-default form (~18K chars, critical blocks pinned).",
  inputSchema: {
    type: "object",
    properties: {
      variant: {
        type: "string",
        enum: ["full", "compressed"],
        default: "full",
        description:
          "Which rules form to fetch. \"full\" = dash-ai-rules.md (canonical, ~800 lines). \"compressed\" = dash-ai-rules.compressed.md (Skill v2/v4 default, smaller).",
      },
    },
    additionalProperties: false,
  },
} as const;

export interface GetRulesInput {
  variant?: "full" | "compressed";
}

/**
 * Deprecated alias. Will be removed in v0.3 — please migrate to `get_rules`.
 * Kept registered so existing clients keep working through one version.
 */
export const GET_AI_RULES_TOOL = {
  name: "get_ai_rules",
  description:
    "[DEPRECATED — renamed to `get_rules`, will be removed in v0.3] Fetch dash-ai-rules.md — Dash Design System conventions for AI code generation.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  deprecated: true,
} as const;

const RULES_CANDIDATES = [
  "dash-ai-rules.md",
  "ai-rules.md",
  "rules.md",
];

const COMPRESSED_CANDIDATES = [
  "dash-ai-rules.compressed.md",
  "rules/dash-ai-rules.compressed.md",
];

/**
 * Fetch the Dash AI rules. `variant` selects which form:
 *   - "full" (default): the canonical dash-ai-rules.md.
 *   - "compressed": dash-ai-rules.compressed.md (the Skill v2/v4 default that
 *     `ds-catalog-loader.ts` loads). Served from `r/dash-ai-rules.compressed.json`.
 */
export async function runGetAiRules(
  client: RegistryClient,
  input: GetRulesInput = {},
): Promise<string> {
  if (input.variant === "compressed") {
    return runGetCompressedRules(client);
  }
  let lastErr: unknown;
  for (const path of RULES_CANDIDATES) {
    try {
      return await client.getRawFile(path);
    } catch (err) {
      lastErr = err;
    }
  }
  // also try as a registry-item file
  try {
    const item = await client.getItem("dash-ai-rules");
    const file = item.files?.find((f) => f.path.endsWith(".md") && f.content);
    if (file?.content) return file.content;
  } catch (err) {
    lastErr = err;
  }
  throw new Error(
    `Could not locate dash-ai-rules.md in registry. Last error: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}

async function runGetCompressedRules(client: RegistryClient): Promise<string> {
  let lastErr: unknown;
  for (const path of COMPRESSED_CANDIDATES) {
    try {
      return await client.getRawFile(path);
    } catch (err) {
      lastErr = err;
    }
  }
  // also try as a registry-item file (published as r/dash-ai-rules.compressed.json)
  try {
    const item = await client.getItem("dash-ai-rules.compressed");
    const file = item.files?.find(
      (f) => f.path.endsWith(".compressed.md") && f.content,
    );
    if (file?.content) return file.content;
  } catch (err) {
    lastErr = err;
  }
  throw new Error(
    `Could not locate dash-ai-rules.compressed.md in registry. Last error: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}
