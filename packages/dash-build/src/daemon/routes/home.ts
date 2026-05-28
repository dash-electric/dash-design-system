import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { renderHome } from "../templates/home.js"
import { renderWorkspace } from "../templates/workspace.js"
import { loadInitialPreview } from "../preview-initial.js"
import { sendHtml } from "./_helpers.js"

/**
 * GET /  → Lovable-style home (sidebar + prompt + cards).
 *
 * Keeps the daemon dependency-free — synchronous render fed only by the
 * already-loaded Store. The home doesn't need orchestrator/auth probes,
 * those flow through /workspace once the user enters a run.
 */
export function handleHome(res: ServerResponse, store: Store): void {
  const html = renderHome(store, {})
  sendHtml(res, 200, html)
}

/**
 * GET /workspace/:runId → chat workspace + preview placeholder.
 *
 * The run id is forwarded to `renderWorkspace` so the preview mount carries
 * a `data-component-id` Agent B can use to hydrate the live preview later.
 *
 * Cold-load preview (2026-05-28): when a persisted run artifact exists for
 * `runId`, we read the component source from disk and inject it as an
 * inline `window.__DASH_PREVIEW_INIT` blob so Sandpack mounts on first
 * paint. Skips silently for in-flight / patch-only / banned-import runs;
 * the placeholder + SSE flow continue to work.
 */
export async function handleWorkspace(
  res: ServerResponse,
  store: Store,
  runId: string | null,
): Promise<void> {
  const initialPreview = await loadInitialPreview(runId)
  const html = renderWorkspace(store, {
    runId: runId ?? null,
    initialPreview,
  })
  sendHtml(res, 200, html)
}

/** True when the pathname matches `/workspace/...`. */
export function isWorkspacePath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/")
}

/** Extract the run id from `/workspace/:runId`. Returns null when missing. */
export function workspaceRunId(pathname: string): string | null {
  if (pathname === "/workspace" || pathname === "/workspace/") return null
  const rest = pathname.slice("/workspace/".length)
  const slashIdx = rest.indexOf("/")
  const raw = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
