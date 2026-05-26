import type { IncomingMessage, ServerResponse } from "node:http"
import { methodNotAllowed, sendJson } from "../../_helpers.js"
import type { AutoReconnect } from "../../../../auth/openai/auto-reconnect.js"

/**
 * Sprint 1B — Manual reconnect endpoint.
 *
 * POST /api/auth/openai/reconnect → trigger AutoReconnect.checkAndReconnect()
 * and return the result. Used by the rail empty-state "🔄 Reconnect" button
 * so the user gets immediate feedback instead of waiting for the next poll
 * tick (default 5 min).
 *
 * Returns 200 in both connected + disconnected outcomes — the client treats
 * either as a useful answer. Non-200 only on internal errors.
 */
export async function handleOpenAIReconnectRoute(
  req: IncomingMessage,
  res: ServerResponse,
  autoReconnect: AutoReconnect | null,
): Promise<void> {
  if (req.method !== "POST") {
    methodNotAllowed(res)
    return
  }
  if (!autoReconnect) {
    sendJson(res, 503, {
      ok: false,
      connected: false,
      reason: "auto_reconnect_not_initialised",
    })
    return
  }
  try {
    const result = await autoReconnect.checkAndReconnect()
    sendJson(res, 200, {
      ok: true,
      connected: result.connected,
      mode: result.connected ? result.mode : undefined,
      reason: result.connected ? undefined : result.reason,
    })
  } catch (err) {
    sendJson(res, 500, {
      ok: false,
      connected: false,
      reason: `reconnect_failed: ${(err as Error).message}`,
    })
  }
}
