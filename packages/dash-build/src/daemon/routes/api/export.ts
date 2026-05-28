/**
 * Tier 6 — Run export endpoints. The first surface is `POST
 * /api/runs/:runId/export/pptx`, which materialises a 4-slide HTML deck for
 * the run (rendered from on-disk artifacts) and returns it as an attachment.
 * See `src/runs/pptx-export.ts` for the deck renderer + format rationale.
 *
 * Wired from `router.ts`:
 *
 *   if (isExportPath(pathname)) {
 *     return await handleExportRoute(req, res, pathname, deps.store)
 *   }
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import { methodNotAllowed, notFound } from "../_helpers.js"
import {
  readAuditFromIntake,
  readBeImpactFromIntake,
  renderPptxDeck,
  type PptxExportPayload,
} from "../../../runs/pptx-export.js"
import { readRunSummary } from "../../../runs/artifact-store.js"

const RUN_PPTX_RE = /^\/api\/runs\/([A-Za-z0-9_-]+)\/export\/pptx$/

export function isExportPath(pathname: string): boolean {
  return RUN_PPTX_RE.test(pathname)
}

interface RunSummary {
  runId?: string
  prompt?: string
  generatedAt?: string
  repo?: string | null
  branch?: string | null
}

export async function handleExportRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
): Promise<void> {
  const match = pathname.match(RUN_PPTX_RE)
  if (!match) return notFound(res)
  if (req.method !== "POST" && req.method !== "GET") {
    // Allow GET for direct browser download via <a download> as well; the
    // primary surface is POST from the workspace export button.
    return methodNotAllowed(res)
  }

  const runId = match[1]!
  const run = store.getRun(runId)
  const summary = (await readRunSummary(runId).catch(() => null)) as
    | RunSummary
    | null
    | undefined

  // The endpoint succeeds even without a Run row — the on-disk summary is
  // the canonical artifact. Without either we return 404.
  if (!run && !summary) return notFound(res)

  const projectName = run
    ? store.getProject(run.projectId)?.name ?? null
    : null
  const surface = run
    ? store.getProject(run.projectId)?.theme ?? null
    : null

  const beImpact = await readBeImpactFromIntake(runId).catch(() => null)
  const audit = await readAuditFromIntake(runId).catch(() => null)

  const payload: PptxExportPayload = {
    runId,
    projectName,
    prompt: run?.prompt ?? summary?.prompt ?? null,
    generatedAt: run?.updatedAt ?? summary?.generatedAt ?? null,
    surface,
    beImpact,
    audit,
  }

  const deck = renderPptxDeck(payload)
  res.writeHead(200, {
    "Content-Type": deck.contentType,
    "Content-Length": Buffer.byteLength(deck.body),
    "Content-Disposition": `attachment; filename="${deck.filename}"`,
    "Cache-Control": "no-store",
  })
  res.end(deck.body)
}
