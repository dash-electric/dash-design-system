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
  const repoPreview = await getRepoPreviewInfo(selectedRepo)
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
