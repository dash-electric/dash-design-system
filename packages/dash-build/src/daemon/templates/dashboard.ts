import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import { renderLayout } from "./layout.js"
import { renderAuthChip } from "./components/auth-chip.js"
import { renderBranchInput } from "./components/branch-input.js"
import { renderEmptyState } from "./components/empty-state.js"
import { renderPromptCard, renderPromptList } from "./components/prompt-card.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { renderRepoSelect } from "./components/repo-select.js"

/**
 * Dashboard composition. Server-rendered template literal — no React.
 *
 * Sections (top to bottom):
 *  1. Page title row
 *  2. Workspace card: repo select + branch input + auth chips
 *  3. Build feature card: prompt input + submit
 *  4. Active prompts card: list of recent prompt cards w/ status pills
 *
 * The auth + prompts regions get IDs so the client JS can swap them in place
 * on WS push without a full page reload.
 */
export function renderDashboard(store: Store, orchestrator?: Orchestrator): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(10)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  // Workspace / auth region
  const repos = [
    // Fallback when GitHub App not installed yet
    ...(auth.github.repos.length > 0
      ? auth.github.repos
      : ["dash/halo-dash-fe", "dash/portal-v2", "dash/backoffice"]),
  ].map((full_name) => ({ full_name }))

  const githubDetail = auth.github.connected
    ? `${auth.github.repos.length || repos.length} repos`
    : undefined
  const anthropicDetail = auth.anthropic.user ?? undefined

  const workspaceCard = `<section class="db-card" aria-labelledby="db-workspace-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-workspace-title">Target workspace</h2>
      <span class="db-card-subtitle">${escapeAttr(workspace.activeRepo ?? "no repo selected")}</span>
    </header>
    <div class="db-workspace">
      <div class="db-workspace-field">
        <label class="db-label" for="db-repo-select">Repository</label>
        ${renderRepoSelect({ repos, active: workspace.activeRepo })}
      </div>
      <div class="db-workspace-field">
        <label class="db-label" for="db-branch-input">Branch</label>
        ${renderBranchInput({ value: workspace.activeBranch })}
      </div>
    </div>
    <div class="db-workspace-auth" id="db-auth-region">
      ${renderAuthChip({ provider: "anthropic", connected: auth.anthropic.connected, detail: anthropicDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </section>`

  // Build feature card
  const needsAnthropic = !auth.anthropic.connected
  const needsGithub = !auth.github.connected

  let buildBody: string
  if (needsAnthropic) {
    buildBody = renderEmptyState({
      icon: "✦",
      title: "Connect Claude Pro to start building",
      body: "Dash Build uses your Anthropic Pro subscription for generation. No API key required.",
      ctaLabel: "Connect Anthropic",
      ctaHref: "/api/auth/anthropic",
      variant: "primary",
    })
  } else if (needsGithub) {
    buildBody = renderEmptyState({
      icon: "◆",
      title: "Install the Dash Build GitHub App",
      body: "Pick which repos Dash Build can open PRs against. You can scope to a single repo or your full org.",
      ctaLabel: "Install GitHub App",
      ctaHref: "/api/auth/github",
      variant: "primary",
    })
  } else {
    buildBody = renderPromptInput({})
  }

  const buildCard = `<section class="db-card" aria-labelledby="db-build-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-build-title">Build feature</h2>
      <span class="db-card-subtitle">Ctrl/Cmd + Enter to submit</span>
    </header>
    ${buildBody}
  </section>`

  // Prompts card
  const promptsBody =
    needsAnthropic || needsGithub
      ? `<div class="db-empty-state"><p class="db-empty-body">Connect auth above to see prompts.</p></div>`
      : prompts.length === 0
        ? renderPromptList([], resolveArtifact)
        : renderPromptList(prompts, resolveArtifact)

  const promptsCard = `<section class="db-card" aria-labelledby="db-prompts-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-prompts-title">Active prompts</h2>
      <span class="db-card-subtitle">${prompts.length} recent</span>
    </header>
    <div id="db-prompts-region">${promptsBody}</div>
  </section>`

  const body = `
    <div class="db-page-head">
      <h1 class="db-title-lg">What do you want to build today?</h1>
      <p class="db-body db-muted">Lovable-for-Dash. Describe a feature, get a PR.</p>
    </div>
    ${workspaceCard}
    ${buildCard}
    ${promptsCard}
  `

  return renderLayout({
    title: "Dashboard",
    body,
    authIndicator:
      auth.anthropic.connected && auth.github.connected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Re-export legacy helpers so existing callers (e.g. WS tests) keep working.
export { renderPromptCard, renderPromptList }
