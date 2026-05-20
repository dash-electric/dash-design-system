/**
 * Tool: get_audit_checklist
 *
 * Returns the Layer 0 Cardinal Rules — the non-negotiable audit checklist
 * that every Dash repo must comply with. Used by AI agents before code-gen
 * to ensure banned imports, audit-trail, voice, and token rules are
 * respected.
 *
 * Surfaced as a separate tool (not just `get_ai_rules`) so AI clients can
 * fetch the focused checklist without pulling the entire 996-line guide.
 */

import type { RegistryClient } from "../lib/registry-client.js";

export const GET_AUDIT_CHECKLIST_TOOL = {
  name: "get_audit_checklist",
  description:
    "Fetch the Dash Cardinal Rules — Layer 0 audit checklist (banned imports, audit trail, voice, tokens). Use BEFORE generating Dash code. Smaller than get_ai_rules.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

const CHECKLIST_CANDIDATES = [
  "dash/foundation/rules/cardinal-rules.md",
  "foundation/rules/cardinal-rules.md",
  "rules/cardinal-rules.md",
  "cardinal-rules.md",
];

export async function runGetAuditChecklist(client: RegistryClient): Promise<string> {
  let lastErr: unknown;
  for (const path of CHECKLIST_CANDIDATES) {
    try {
      return await client.getRawFile(path);
    } catch (err) {
      lastErr = err;
    }
  }
  // also try as a registry-item file
  try {
    const item = await client.getItem("cardinal-rules");
    const file = item.files?.find((f) => f.path.endsWith(".md") && f.content);
    if (file?.content) return file.content;
  } catch (err) {
    lastErr = err;
  }
  throw new Error(
    `Could not locate cardinal-rules.md in registry. Last error: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}
