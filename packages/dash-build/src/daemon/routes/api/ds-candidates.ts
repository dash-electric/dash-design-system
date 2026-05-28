/**
 * Tier 6 — `GET /api/ds-candidates`
 *
 * Returns the content-based DS-promotion candidate list. Complements the
 * existing name-based `/api/owner/ds-candidates` endpoint by scanning the
 * source code of each completed run for inline JSX patterns that should
 * have been Dash UI atoms.
 *
 * Response:
 *   {
 *     ok: true,
 *     scannedRuns: number,
 *     scannedArtifacts: number,
 *     candidates: DSCandidate[],
 *   }
 *
 * Optional query params:
 *   - `topN`      — cap candidate list (default 3, max 25)
 *   - `maxRuns`   — cap how many recent runs to scan (default 50, max 200)
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { methodNotAllowed, sendJson } from "../_helpers.js"
import {
  DSCandidateRanker,
  loadArtifactsFromRunDirs,
  type RankerArtifact,
} from "../../../skills/ds-candidate-ranker.js"

export interface DSCandidatesDeps {
  store: Store
  /** Test seam — swap for a stub corpus instead of disk reads. */
  artifactLoader?: (
    inputs: Array<{ runId: string; projectId: string; runDir: string }>,
  ) => Promise<RankerArtifact[]>
  /** Test seam — preconfigured ranker. */
  ranker?: DSCandidateRanker
}

export async function handleDSCandidates(
  req: IncomingMessage,
  res: ServerResponse,
  deps: DSCandidatesDeps,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  const url = new URL(req.url ?? "/", "http://localhost")
  const topN = clampInt(url.searchParams.get("topN"), 3, 1, 25)
  const maxRuns = clampInt(url.searchParams.get("maxRuns"), 50, 1, 200)

  const runs = deps.store.snapshot().runs
  const window = runs
    .filter((r) => !!r.artifactDir && r.status === "completed")
    .slice(0, maxRuns)
    .map((r) => ({
      runId: r.id,
      projectId: r.projectId,
      runDir: r.artifactDir as string,
    }))

  try {
    const loader = deps.artifactLoader ?? loadArtifactsFromRunDirs
    const artifacts = await loader(window)
    const ranker = deps.ranker ?? new DSCandidateRanker({ topN })
    const candidates = ranker.rank(artifacts)
    return sendJson(res, 200, {
      ok: true,
      scannedRuns: window.length,
      scannedArtifacts: artifacts.length,
      candidates,
    })
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: "ds_candidates_scan_failed",
      message: (err as Error).message,
    })
  }
}

function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
