import type { ServerResponse } from "node:http"
import { existsSync } from "node:fs"
import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import { renderDashboard } from "../templates/dashboard.js"
import { sendHtml } from "./_helpers.js"
import { CodexCliRunner } from "../../auth/codex-cli/runner.js"
import { getRepoPreviewInfo } from "../repo-preview.js"
import { bundlePathFor } from "../../preview/bundler.js"

const codexCli = new CodexCliRunner()

/**
 * Build a sandbox-state lookup the resolver can consume. We duck-type the
 * Store's `getSandboxState` so legacy/test stores without the method (or
 * future shape drift) silently fall through to env/online/local-dev instead
 * of crashing the dashboard.
 *
 * Returned shape is intentionally minimal: only `state` + optional
 * `devServerPort` are read by `resolveRepoPreviewConfig`. Whatever extra
 * fields F1 lands on the persisted record (history, runId, clonePath…) are
 * untouched and just pass through as part of the duck-typed return.
 */
function makeSandboxStateProvider(store: Store) {
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

function activePromptId(store: Store, selectedRepo: string | null): string | null {
  const prompts = store.getPrompts(20)
  const repoPrompts = selectedRepo
    ? prompts.filter((p) => p.repo === selectedRepo)
    : prompts
  const live = repoPrompts.find((p) =>
    ["queued", "clarifying", "generating", "awaiting_approval"].includes(p.status),
  )
  return (live ?? repoPrompts[0])?.id ?? null
}

export async function handleDashboard(
  res: ServerResponse,
  store: Store,
  orchestrator?: Orchestrator,
): Promise<void> {
  const codexProbe = await codexCli.probe()
  const saved = store.getAuth().openai
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const selectedRepo =
    workspace.activeRepo ??
    auth.github.repos[0] ??
    "dash/portal-v2"
  const repoPreview = await getRepoPreviewInfo(
    selectedRepo,
    makeSandboxStateProvider(store),
  )
  const activeId = activePromptId(store, selectedRepo)
  const previewBundleAvailable = activeId
    ? existsSync(bundlePathFor(activeId))
    : undefined
  const effectiveMode = codexProbe.authenticated
    ? "codex-cli"
    : saved.connected
      ? "byo-key"
      : "none"

  sendHtml(
    res,
    200,
    renderDashboard(store, orchestrator, {
      codexCliInstalled: codexProbe.installed,
      codexCliAuthenticated: codexProbe.authenticated,
      codexCliVersion: codexProbe.version,
      openAIMode: effectiveMode,
      openAIUser:
        effectiveMode === "codex-cli"
          ? "ChatGPT"
          : saved.user,
      repoPreview,
      previewBundleAvailable,
    }),
  )
}
