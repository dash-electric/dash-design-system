import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import {
  getRepoPreviewInfo,
  startRepoPreview,
  type SandboxStateProvider,
} from "../../repo-preview.js"
import { renderLivePreviewPane } from "../../templates/components/live-preview-pane.js"
import { badRequest, methodNotAllowed, readJsonBody, sendJson } from "../_helpers.js"

interface StartBody {
  repo?: string | null
}

/**
 * Duck-typed sandbox-state provider. Same shape as the dashboard handler so
 * the resolver sees a consistent view across HTML + JSON routes. Null store
 * (legacy callers / tests pre-wiring) ⇒ no provider, resolver falls through
 * to env/online/local-dev.
 */
function providerFor(store: Store | null | undefined): SandboxStateProvider | null {
  if (!store) return null
  return (repo: string) => {
    const fn = (store as unknown as {
      getSandboxState?: (slug: string) =>
        | { state: string; devServerPort?: number | null }
        | null
    }).getSandboxState
    if (typeof fn !== "function") return null
    try {
      return fn.call(store, repo) ?? null
    } catch {
      return null
    }
  }
}

export async function handleRepoPreviewRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store?: Store | null,
): Promise<void> {
  const sandboxProvider = providerFor(store)

  if (pathname === "/api/repo-preview") {
    if (req.method !== "GET") return methodNotAllowed(res)
    const url = new URL(req.url ?? "/", "http://localhost")
    const repo = url.searchParams.get("repo")
    const info = await getRepoPreviewInfo(repo, sandboxProvider)
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
    const info = await startRepoPreview(body.repo, sandboxProvider)
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
