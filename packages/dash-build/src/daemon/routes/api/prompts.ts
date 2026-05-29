import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import type { Broadcaster } from "../../ws/broadcaster.js"
import type { Orchestrator } from "../../../pipeline/orchestrator.js"
import { cleanupOne } from "../../../preview/index.js"
import { removeRunArtifacts } from "../../../runs/artifact-store.js"
import {
  readDocBodies,
  renderReferencedDocsBlock,
} from "../../../services/doc-index.js"
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
  /**
   * Open WebUI `#` adoption — opaque doc ids (sha1 prefixes) attached via
   * the composer's autocomplete picker. Each id is hydrated to its full
   * markdown body and prepended to the prompt as a referenced-docs block.
   */
  attachedDocs?: string[]
}

/**
 * Hydrate attached doc bodies and prepend them as a "## Referenced documents"
 * section to the user prompt. Best-effort: a stale or unknown id is silently
 * dropped so a missing doc never blocks generation.
 *
 * Exported so the orchestrator + tests can re-use the same composition.
 */
export async function composePromptWithAttachedDocs(
  text: string,
  attachedDocs: string[] | undefined,
): Promise<string> {
  if (!Array.isArray(attachedDocs) || attachedDocs.length === 0) return text
  try {
    const docs = await readDocBodies(attachedDocs)
    const block = renderReferencedDocsBlock(docs)
    if (!block) return text
    return `${block}\n\n## User prompt\n\n${text}`
  } catch {
    // Doc index failure must never block prompt submission — fall back to
    // the original text.
    return text
  }
}

interface ApproveBody {
  approved?: boolean
  branch?: string
  commitMessage?: string
  prTitle?: string
  prBody?: string
}

/**
 * POST /api/prompt — create prompt, kick off pipeline
 * GET  /api/prompts/:id — fetch by id (includes artifact when generated)
 * POST /api/prompts/:id/approve — user approves PR creation
 * POST /api/prompts/:id/rerun — clone an existing prompt + kick the pipeline
 *
 * `rerun` resolves the original prompt text + repo/branch by id, then submits
 * a brand-new PromptRecord through `orchestrator.submitPrompt`. The response
 * carries the new prompt id so the client can navigate to the fresh workspace.
 *
 * When `orchestrator` is provided, real pipeline runs. When omitted, falls
 * back to the legacy stub for tests that haven't migrated.
 */
export async function handlePromptsRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  broadcaster: Broadcaster,
  orchestrator?: Orchestrator,
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

    // Open WebUI `#` adoption — hydrate referenced doc bodies into the
    // prompt before queueing. The composed text flows transparently through
    // the orchestrator + skill chain + prompt-composer, so no changes are
    // required to downstream interfaces.
    const composedText = await composePromptWithAttachedDocs(
      body.text,
      body.attachedDocs,
    )

    if (orchestrator) {
      try {
        const result = await orchestrator.submitPrompt({
          text: composedText,
          repo: body.repo ?? null,
          branch: body.branch ?? null,
        })
        return sendJson(res, 201, {
          ok: true,
          id: result.promptId,
          status: result.status,
        })
      } catch (err) {
        return badRequest(res, (err as Error).message)
      }
    }

    // Legacy fallback
    const prompt = store.addPrompt({
      text: composedText,
      repo: body.repo ?? null,
      branch: body.branch ?? null,
    })
    broadcaster.broadcast("prompts:changed", {
      id: prompt.id,
      status: prompt.status,
    })
    return sendJson(res, 201, { ok: true, id: prompt.id, status: prompt.status })
  }

  if (pathname === "/api/prompts/reset") {
    if (req.method !== "POST") return methodNotAllowed(res)
    const removed = await store.clearPrompts()
    await Promise.all(
      removed.flatMap((p) => [
        cleanupOne(p.id).catch(() => false),
        removeRunArtifacts(p.id).catch(() => false),
      ]),
    )
    broadcaster.broadcast("prompts:changed", {
      status: "reset",
      removed: removed.length,
    })
    return sendJson(res, 200, {
      ok: true,
      removed: removed.length,
    })
  }

  // /api/prompts/:id[/approve|/rerun|/cancel]
  const match = pathname.match(
    /^\/api\/prompts\/([A-Za-z0-9_-]+)(\/approve|\/rerun|\/cancel)?$/,
  )
  if (!match) return notFound(res)

  const id = match[1]!
  const approveRoute = match[2] === "/approve"
  const rerunRoute = match[2] === "/rerun"
  const cancelRoute = match[2] === "/cancel"

  // Bug 6 (2026-05-29) — POST /api/prompts/:id/cancel — abort an in-flight run.
  // Marks the prompt cancelled + aborts the in-flight model call (best-effort)
  // via the orchestrator. Falls back to a plain store status flip when the
  // orchestrator isn't wired (legacy/test path) so the UI still settles.
  if (cancelRoute) {
    if (req.method !== "POST") return methodNotAllowed(res)
    const prompt = store.getPrompt(id)
    if (!prompt) return notFound(res)
    if (orchestrator) {
      try {
        const result = await orchestrator.cancelPrompt(id)
        return sendJson(res, 200, { ok: true, id, status: result.status })
      } catch (err) {
        return badRequest(res, (err as Error).message)
      }
    }
    const updated = await store.updatePromptStatus(id, "cancelled")
    broadcaster.broadcast("prompts:changed", {
      id,
      status: updated?.status ?? "cancelled",
    })
    return sendJson(res, 200, { ok: true, id, status: updated?.status ?? "cancelled" })
  }

  if (rerunRoute) {
    if (req.method !== "POST") return methodNotAllowed(res)
    const prompt = store.getPrompt(id)
    if (!prompt) return notFound(res)
    if (!orchestrator) {
      return sendJson(res, 503, {
        ok: false,
        error: "orchestrator_unavailable",
        message: "Pipeline disabled — rerun requires the orchestrator.",
      })
    }
    try {
      const result = await orchestrator.submitPrompt({
        text: prompt.text,
        repo: prompt.repo,
        branch: prompt.branch,
      })
      return sendJson(res, 202, {
        ok: true,
        id: result.promptId,
        status: result.status,
        sourceId: id,
      })
    } catch (err) {
      return badRequest(res, (err as Error).message)
    }
  }

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
    if (orchestrator) {
      try {
        const result = await orchestrator.approvePR({
          promptId: id,
          branch: body.branch,
          commitMessage: body.commitMessage,
          prTitle: body.prTitle,
          prBody: body.prBody,
        })
        return sendJson(res, 200, {
          ok: true,
          id,
          status: "pr_created",
          prUrl: result.prUrl,
          prNumber: result.prNumber,
        })
      } catch (err) {
        return sendJson(res, 409, {
          ok: false,
          error: "approve_failed",
          message: (err as Error).message,
        })
      }
    }
    // Legacy stub
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
  const artifact = orchestrator?.getArtifact(id)
  return sendJson(res, 200, {
    ok: true,
    prompt,
    artifact: artifact
      ? {
          files: artifact.files.map((f) => ({ path: f.path, language: f.language })),
          explanation: artifact.explanation,
          validation: artifact.validation,
          generatedAt: artifact.generatedAt,
          contextPack: artifact.contextPack,
          preview: artifact.bundleResult
            ? {
                mode: artifact.previewMode ?? "component",
                bundleUrl: `/preview/${encodeURIComponent(id)}/bundle.js`,
                previewUrl: `/preview/${encodeURIComponent(id)}`,
                byteSize: artifact.bundleResult.byteSize,
              }
            : null,
        }
      : null,
  })
}
