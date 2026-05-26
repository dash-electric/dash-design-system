import type { IncomingMessage, ServerResponse } from "node:http"
import type { Store } from "../../state/store.js"
import {
  isRepoPreviewAllowed,
  listRepoPreviewManifests,
  resolveRepoManifest,
} from "../../repo-preview.js"
import { badRequest, methodNotAllowed, readJsonBody, sendJson } from "../_helpers.js"

/**
 * GET  /api/repos — list connected GitHub repos or local test targets.
 * POST /api/repos — persist the active local target repo/branch.
 *
 * STUB: Agent D wires the real GitHub App installation list. For now we
 * return what's persisted in the store (set via Agent D's auth callback) and
 * fall back to a curated default list for the demo flow.
 */
export function handleReposRoute(
  req: IncomingMessage,
  res: ServerResponse,
  store: Store,
): void {
  if (req.method === "POST") {
    void (async () => {
      let body: { repo?: string | null; branch?: string | null }
      try {
        body = await readJsonBody<{ repo?: string | null; branch?: string | null }>(req)
      } catch {
        return badRequest(res, "invalid_json_body")
      }
      const repo = typeof body.repo === "string" && body.repo.trim()
        ? body.repo.trim()
        : null
      if (repo && !isRepoPreviewAllowed(repo)) {
        return badRequest(res, "unsupported_repo")
      }
      const branch = typeof body.branch === "string" && body.branch.trim()
        ? body.branch.trim()
        : "main"
      await store.setActiveRepo(repo, branch)
      if (repo) {
        const manifest = resolveRepoManifest(repo)
        store.ensureProject(repo, { theme: manifest?.theme })
      }
      return sendJson(res, 200, { ok: true, repo, branch })
    })()
    return
  }

  if (req.method !== "GET") return methodNotAllowed(res)
  const auth = store.getAuth()
  const manifests = listRepoPreviewManifests()
  const allowedIds = manifests.map((repo) => repo.id)
  const connectedAllowedRepos = auth.github.repos.filter(isRepoPreviewAllowed)
  const repos = connectedAllowedRepos.length > 0
    ? connectedAllowedRepos
    : allowedIds
  const manifestById = new Map(manifests.map((repo) => [repo.id, repo]))

  sendJson(res, 200, {
    ok: true,
    connected: auth.github.connected,
    mode: auth.github.connected ? "github-app" : "local-test",
    repos: repos.map((full_name) => {
      const manifest = manifestById.get(full_name)
      return {
        full_name,
        id: manifest?.id ?? full_name,
        label: manifest?.label ?? full_name,
        surface: manifest?.surface ?? "Dash repo",
        audience: manifest?.audience ?? "Dash users",
        theme: manifest?.theme ?? "shared",
        previewMode: manifest?.previewMode ?? "mock-shell",
        defaultRoute: manifest?.defaultRoute ?? "/",
        baselineDescription: manifest?.baselineDescription ?? "Repo baseline preview.",
      }
    }),
  })
}
