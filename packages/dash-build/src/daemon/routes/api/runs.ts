/**
 * Run-scoped mutation endpoints.
 *
 * Currently hosts Open WebUI #A4 variant picker:
 *
 *   POST /api/runs/:runId/pick-variant
 *     Body: { id: "a" | "b" }
 *     200:  { ok: true, active: "a" }
 *     400:  { ok: false, error: "invalid_variant_id" | "id_required" }
 *     404:  { ok: false, error: "unknown_prompt" | "no_variants_for_run" }
 *     503:  { ok: false, error: "orchestrator_unavailable" }
 *
 * Read-only run inspection lives in `projects.ts` (`GET /api/runs/:id`).
 * The path matcher here is more specific (`/pick-variant` suffix) so the
 * router can mount this before falling through to the projects handler.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Orchestrator } from "../../../pipeline/orchestrator.js"
import {
  badRequest,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendJson,
} from "../_helpers.js"

const PICK_VARIANT_RE = /^\/api\/runs\/([A-Za-z0-9_-]+)\/pick-variant$/

interface PickVariantBody {
  id?: string
}

/** True when the pathname targets a runs-mutation endpoint owned by this module. */
export function isRunsMutationPath(pathname: string): boolean {
  return PICK_VARIANT_RE.test(pathname)
}

export async function handleRunsMutationRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  orchestrator?: Orchestrator,
): Promise<void> {
  const pickMatch = pathname.match(PICK_VARIANT_RE)
  if (pickMatch) {
    if (req.method !== "POST") return methodNotAllowed(res)
    const runId = pickMatch[1]!
    if (!orchestrator) {
      return sendJson(res, 503, {
        ok: false,
        error: "orchestrator_unavailable",
        message: "Pipeline disabled — variant picker requires the orchestrator.",
      })
    }
    let body: PickVariantBody = {}
    try {
      body = await readJsonBody<PickVariantBody>(req)
    } catch (err) {
      return badRequest(res, (err as Error).message)
    }
    const id = (body.id ?? "").trim()
    if (!id) return badRequest(res, "id_required")
    const outcome = await orchestrator.pickVariant(runId, id)
    if (!outcome.ok) {
      const status =
        outcome.error === "unknown_prompt" ||
        outcome.error === "no_variants_for_run" ||
        outcome.error === "unknown_variant_id"
          ? 404
          : outcome.error === "invalid_variant_id"
            ? 400
            : 500
      return sendJson(res, status, { ok: false, error: outcome.error })
    }
    return sendJson(res, 200, { ok: true, active: outcome.active })
  }

  return notFound(res)
}
