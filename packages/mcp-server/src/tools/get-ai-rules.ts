/**
 * Tool: get_ai_rules
 *
 * Returns the contents of `dash-ai-rules.md` — the canonical conventions
 * file that AI agents should consume on first invocation in a Dash repo.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const GET_AI_RULES_TOOL = {
  name: "get_ai_rules",
  description:
    "Fetch dash-ai-rules.md — Dash Design System conventions for AI code generation. Read this first when working in a Dash repo.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

const RULES_CANDIDATES = [
  "dash-ai-rules.md",
  "ai-rules.md",
  "rules.md",
];

export async function runGetAiRules(client: RegistryClient): Promise<string> {
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
