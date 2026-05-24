import type { IncomingMessage, ServerResponse } from "node:http"
import { getRepoPreviewInfo, startRepoPreview } from "../../repo-preview.js"
import { renderLivePreviewPane } from "../../templates/components/live-preview-pane.js"
import { badRequest, methodNotAllowed, readJsonBody, sendJson } from "../_helpers.js"

interface StartBody {
  repo?: string | null
}

export async function handleRepoPreviewRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<void> {
  if (pathname === "/api/repo-preview") {
    if (req.method !== "GET") return methodNotAllowed(res)
    const url = new URL(req.url ?? "/", "http://localhost")
    const repo = url.searchParams.get("repo")
    const info = await getRepoPreviewInfo(repo)
    return sendJson(res, info ? 200 : 404, {
      ok: Boolean(info),
      preview: info,
      html: info
        ? renderLivePreviewPane({ state: "baseline", repoPreview: info })
        : null,
    })
  }

  if (pathname === "/api/repo-preview/start") {
    if (req.method !== "POST") return methodNotAllowed(res)
    let body: StartBody
    try {
      body = await readJsonBody<StartBody>(req)
    } catch {
      return badRequest(res, "invalid_json_body")
    }
    const info = await startRepoPreview(body.repo)
    return sendJson(res, info ? 200 : 404, {
      ok: Boolean(info),
      preview: info,
      html: info
        ? renderLivePreviewPane({ state: "baseline", repoPreview: info })
        : null,
    })
  }

  return sendJson(res, 404, { ok: false, error: "not_found" })
}
