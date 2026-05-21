import type { IncomingMessage, ServerResponse } from "node:http"
import { sendJson, methodNotAllowed } from "../_helpers.js"
import { BRIDGE_ROUTES } from "../../../bridge/types.js"

/**
 * Bridge endpoints — stub only.
 *
 * Three routes (matching `BRIDGE_ROUTES` shared with @dash/worker):
 *   POST /api/bridge/missing-block  — worker should not call this; this side
 *                                     receives "user wants block X" → not yet
 *                                     wired into orchestrator.
 *   POST /api/bridge/promote        — worker callable; promote a Dash Build
 *                                     pattern into the DS registry.
 *   POST /api/bridge/clarify        — worker callable; surface clarification
 *                                     questions to the browser UI.
 *
 * All three currently return 501 — Day 4+ wires them to the orchestrator
 * (missing-block + promote forward to Hermes via WorkerClient; clarify
 * delivers to SessionStore for browser pickup).
 */

const STUB_BODY = {
  ok: false,
  kind: "error" as const,
  reason: "Bridge endpoint scaffolded, full implementation pending",
  code: "not_implemented" as const,
}

export function isBridgePath(pathname: string): boolean {
  return (
    pathname === BRIDGE_ROUTES.missingBlock ||
    pathname === BRIDGE_ROUTES.promote ||
    pathname === BRIDGE_ROUTES.clarify
  )
}

export function handleBridgeRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): void {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }
  if (!isBridgePath(pathname)) {
    return sendJson(res, 404, { ok: false, error: "not_found" })
  }
  return sendJson(res, 501, STUB_BODY)
}
