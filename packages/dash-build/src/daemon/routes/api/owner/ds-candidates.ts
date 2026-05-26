/**
 * Sprint 3B — `/api/owner/ds-candidates`
 *
 * Returns the ranked DS-promotion candidate list for the Owner
 * Dashboard "DS Candidate Queue" panel.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     candidates: DSCandidate[],
 *     scannedRuns: number,
 *   }
 *
 * Coordination with S3A: the panel renders candidates as a sortable list
 * by score (already sorted DESC here). Each row exposes a "Promote" CTA
 * that the UI wires up later — this route only surfaces the suggestions.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../../state/store.js"
import { methodNotAllowed, sendJson } from "../../_helpers.js"
import { DSCandidateRanker } from "../../../../owner/ai/ds-candidate-ranker.js"

export interface OwnerDSCandidatesDeps {
  store: Store
  ranker?: DSCandidateRanker
}

export async function handleOwnerDSCandidates(
  req: IncomingMessage,
  res: ServerResponse,
  deps: OwnerDSCandidatesDeps,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  const url = new URL(req.url ?? "/", "http://localhost")
  const topN = parsePositiveInt(url.searchParams.get("topN"), 10)
  const maxRuns = parsePositiveInt(url.searchParams.get("maxRuns"), 50)

  const ranker = deps.ranker ?? new DSCandidateRanker({ topN, maxRuns })
  const runs = deps.store.snapshot().runs
  try {
    const candidates = await ranker.detectCandidates(runs)
    // S3A's panel reads `dsCandidates: Array<{id,title,kind,from}>`. Map our
    // richer shape into that contract while exposing the full record under
    // `candidates` for clients that want the score breakdown.
    const dsCandidates = candidates.map((c) => ({
      id: c.componentName,
      title: c.componentName,
      kind: c.suggestedLayer,
      from:
        c.occurrences[0]?.project ??
        c.occurrences[0]?.runId ??
        "unknown",
    }))
    return sendJson(res, 200, {
      ok: true,
      candidates,
      dsCandidates,
      scannedRuns: Math.min(runs.length, maxRuns),
    })
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "ds_candidate_scan_failed",
      message: (err as Error).message,
    })
  }
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}
