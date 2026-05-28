import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { renderHome } from "../templates/home.js"
import { renderWorkspace } from "../templates/workspace.js"
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
 */
export function handleWorkspace(
  res: ServerResponse,
  store: Store,
  runId: string | null,
): void {
  const html = renderWorkspace(store, { runId: runId ?? null })
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
