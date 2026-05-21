/**
 * Cross-process bridge types between Hermes worker and Dash Build daemon.
 *
 * IMPORTANT: This file is duplicated (by intent) at
 * `packages/worker/src/bridge/types.ts`. Keep both in sync — schema drift
 * silently breaks the bridge at runtime (server returns 501 stub today;
 * Day 4+ real handlers will JSON.parse against this shape).
 *
 * Scope: stub-level wire contract only. No pipeline internals leak in here.
 *
 * Three message families correspond to the three Day-1 use cases:
 *   1. missing-block        — Dash Build → worker  (generate a DS block)
 *   2. request-clarification — worker → Dash Build (ask user via browser UI)
 *   3. promote-to-registry  — Dash Build → worker  (promote pattern to DS)
 */

/** Single file payload. Mirrors `skills/types.ts` ParsedFile shape — kept
 * local so the bridge has zero coupling to pipeline internals. */
export interface ParsedFile {
  path: string
  contents: string
}

/** Subset of clarification question shape sufficient for cross-process
 * transport. Real type lives in `../clarification/types.ts`; this is the
 * intersection of fields safe to ship over the wire. */
export interface ClarificationQuestion {
  id: string
  prompt: string
  type: "single" | "multi" | "text" | "select"
  options?: string[]
  required?: boolean
}

/** Metadata attached to a promote-to-registry request. */
export interface PromoteMetadata {
  /** Suggested registry slot, e.g. "blocks/ride-dispatch-board". */
  suggestedPath: string
  /** Foundation match score 0-100 (gating: typically only promote >=85). */
  foundationScore: number
  /** Layered Architecture target layer. */
  layer: "shared" | "ride" | "logistic" | "travel" | "marketplace"
  /** Free-text description for the PR body. */
  description: string
}

export type BridgeRequest =
  | {
      kind: "missing-block"
      blockName: string
      context: string
    }
  | {
      kind: "request-clarification"
      gapId: string
      questions: ClarificationQuestion[]
    }
  | {
      kind: "promote-to-registry"
      sourcePromptId: string
      files: ParsedFile[]
      metadata: PromoteMetadata
    }

export type BridgeResponse =
  | {
      kind: "block-generated"
      blockName: string
      available: boolean
      /** PR URL when the worker opened one for the new block. */
      prUrl?: string
    }
  | {
      kind: "clarified"
      gapId: string
      answers: Record<string, unknown>
    }
  | {
      kind: "promoted"
      registryItem: string
      prUrl: string
    }
  | {
      kind: "error"
      reason: string
      /** Optional machine-readable code for clients to branch on. */
      code?:
        | "not_implemented"
        | "unavailable"
        | "network_error"
        | "invalid_response"
        | "bad_request"
    }

/** Endpoint paths — single source of truth for both client and daemon. */
export const BRIDGE_ROUTES = {
  missingBlock: "/api/bridge/missing-block",
  clarify: "/api/bridge/clarify",
  promote: "/api/bridge/promote",
  health: "/health",
} as const

/** Minimal fetch surface the clients depend on — keeps tests trivial to mock. */
export type FetchLike = (
  url: string,
  init?: {
    method?: string
    headers?: Record<string, string>
    body?: string
    signal?: AbortSignal
  },
) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
  text: () => Promise<string>
}>
