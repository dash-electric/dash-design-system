import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import type { Broadcaster } from "../../ws/broadcaster.js"
import {
  badRequest,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendJson,
} from "../_helpers.js"

interface PromptBody {
  text?: string
  repo?: string
  branch?: string
}

interface ApproveBody {
  approved?: boolean
}

/**
 * POST /api/prompt — create prompt
 * GET  /api/prompts/:id — fetch by id
 * POST /api/prompts/:id/approve — user approves PR creation
 *
 * STUB: real prompt → PR pipeline is owned by Agent E. We expose the records
 * and lifecycle hooks here so Agent E can drive state transitions.
 */
export async function handlePromptsRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  broadcaster: Broadcaster,
): Promise<void> {
  // POST /api/prompt — create
  if (pathname === "/api/prompt") {
    if (req.method !== "POST") return methodNotAllowed(res)
    let body: PromptBody
    try {
      body = await readJsonBody<PromptBody>(req)
    } catch (err) {
      return badRequest(res, (err as Error).message)
    }
    if (!body.text || typeof body.text !== "string") {
      return badRequest(res, "text_required")
    }
    const prompt = store.addPrompt({
      text: body.text,
      repo: body.repo ?? null,
      branch: body.branch ?? null,
    })
    broadcaster.broadcast("prompts:changed", { id: prompt.id, status: prompt.status })
    return sendJson(res, 201, { ok: true, id: prompt.id, status: prompt.status })
  }

  // /api/prompts/:id[/approve]
  const match = pathname.match(/^\/api\/prompts\/([A-Za-z0-9_-]+)(\/approve)?$/)
  if (!match) return notFound(res)

  const id = match[1]!
  const approveRoute = match[2] === "/approve"

  if (approveRoute) {
    if (req.method !== "POST") return methodNotAllowed(res)
    const prompt = store.getPrompt(id)
    if (!prompt) return notFound(res)
    let body: ApproveBody = {}
    try {
      body = await readJsonBody<ApproveBody>(req)
    } catch {
      // optional body
    }
    if (body.approved === false) {
      const updated = await store.updatePromptStatus(id, "cancelled")
      broadcaster.broadcast("prompts:changed", {
        id,
        status: updated?.status ?? "cancelled",
      })
      return sendJson(res, 200, { ok: true, id, status: "cancelled" })
    }
    // Agent E will wire the real PR-creation pipeline. For now, we just mark it
    // generating and rely on E to advance state.
    const updated = await store.updatePromptStatus(id, "generating")
    broadcaster.broadcast("prompts:changed", {
      id,
      status: updated?.status ?? "generating",
    })
    return sendJson(res, 202, { ok: true, id, status: updated?.status ?? "generating" })
  }

  if (req.method !== "GET") return methodNotAllowed(res)
  const prompt = store.getPrompt(id)
  if (!prompt) return notFound(res)
  return sendJson(res, 200, { ok: true, prompt })
}
