/**
 * Tool: get_design_context
 *
 * Returns the full Dash design contract in ONE round-trip: the cross-repo
 * design contract (design.md), the Layered Architecture spec
 * (LAYERED-ARCHITECTURE.md), the Layer 0 cardinal rules + voice rules, and
 * the foundation manifest.json.
 *
 * Mirrors the five filesystem reads of dash-build's `design-loader.ts`
 * (loadDesignContext) so the builder can read the design contract across the
 * MCP boundary instead of walking the monorepo filesystem.
 *
 * Reads the `design-context` registry item (published as
 * `r/design-context.json`), whose `files[]` bundle all five sources. Each file
 * is matched by its registry path suffix. On a LAYERED-ARCHITECTURE.md miss
 * the server applies the same FALLBACK_LAYERED summary the loader uses.
 */

import type { RegistryClient } from "../lib/registry-client.js";
import type { RegistryFile } from "../lib/schema.js";

export const GET_DESIGN_CONTEXT_TOOL = {
  name: "get_design_context",
  description:
    "Fetch the full Dash design context in one call: the cross-repo design contract (design.md), the Layered Architecture spec, the Layer 0 cardinal rules + voice rules, and the foundation manifest. Use when generating or reviewing Dash UI so the output honours the design contract.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

/** Fallback layered-architecture summary — mirrors design-loader.ts FALLBACK_LAYERED. */
const FALLBACK_LAYERED = `# Layered Architecture (fallback summary)

Layer 0 — Brand foundation (locked tokens, voice, cardinal rules).
Layer 1 — Common primitives (atom components consuming Layer 0 tokens).
Layer 2 — Product / tenant theme (accent + voice + density overrides).
Layer 3 — Workflow blocks (composites scoped to a product, e.g. ride-dispatch-board).

Decision:
  - Atom reusable across products → Layer 1.
  - Composite tied to one product workflow → Layer 3 (registry theme: <product>).
  - Brand / voice / density tweak → Layer 2 manifest, NEVER touch Layer 1 source.
  - Type ramp / spacing / motion / token tier → Layer 0 RFC required. Stop and ask.
`;

export interface DesignContextResult {
  designContract: string;
  layeredArchitecture: string;
  cardinalRules: string;
  voiceRules: string;
  manifest: Record<string, unknown> | null;
}

/** Match a bundled file by the basename / suffix of its registry path. */
function findFile(files: RegistryFile[], suffix: string): RegistryFile | undefined {
  return files.find((f) => f.path.endsWith(suffix) && f.content != null);
}

export async function runGetDesignContext(
  client: RegistryClient,
): Promise<DesignContextResult> {
  const item = await client.getItem("design-context");
  const files = item.files ?? [];

  const designContract = findFile(files, "design.md")?.content ?? "";
  const layeredRaw = findFile(files, "LAYERED-ARCHITECTURE.md")?.content;
  const cardinalRules = findFile(files, "cardinal-rules.md")?.content ?? "";
  const voiceRules = findFile(files, "voice-rules.md")?.content ?? "";
  const manifestRaw = findFile(files, "manifest.json")?.content;

  let manifest: Record<string, unknown> | null = null;
  if (manifestRaw) {
    try {
      manifest = JSON.parse(manifestRaw) as Record<string, unknown>;
    } catch {
      manifest = null;
    }
  }

  return {
    designContract,
    layeredArchitecture: layeredRaw && layeredRaw.trim() ? layeredRaw : FALLBACK_LAYERED,
    cardinalRules,
    voiceRules,
    manifest,
  };
}
