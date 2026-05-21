import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import type { PromptRecord } from "../state/types.js"
import { renderLayout } from "./layout.js"
import { renderAuthChip } from "./components/auth-chip.js"
import { renderBranchInput } from "./components/branch-input.js"
import { renderEmptyState } from "./components/empty-state.js"
import { renderAnthropicConnectForm } from "./components/anthropic-connect.js"
import { renderPromptCard, renderPromptList } from "./components/prompt-card.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { renderRepoSelect } from "./components/repo-select.js"
import {
  renderChatThread,
  type ChatMessage,
} from "./components/chat-thread.js"
import {
  renderLivePreviewPane,
  DEFAULT_PIPELINE_STEPS,
  type PreviewPaneState,
  type PipelineStep,
} from "./components/live-preview-pane.js"

/**
 * Dashboard composition.
 *
 * Two render paths are available:
 *
 *  - `renderChatDashboard` (default) — Claude.ai-style split pane: chat
 *    thread on the left, live preview on the right.
 *  - `renderClassicDashboard` — original single-column "build feature" card.
 *    Kept callable for tests and as a fallback.
 *
 * The default export (`renderDashboard`) is the chat layout.
 */

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildRepoList(authRepos: string[]): { full_name: string }[] {
  const repos =
    authRepos.length > 0
      ? authRepos
      : ["dash/halo-dash-fe", "dash/portal-v2", "dash/backoffice"]
  return repos.map((full_name) => ({ full_name }))
}

// ─────────────────────────────────────────────────────────────────────────
// Chat ↔ prompt-record adaptation
// ─────────────────────────────────────────────────────────────────────────

function promptToChatMessages(
  prompt: PromptRecord,
  resolveArtifact?: (
    id: string,
  ) => { files: { path: string; content: string }[] } | undefined,
): ChatMessage[] {
  const out: ChatMessage[] = []
  out.push({
    role: "user",
    content: prompt.text,
    timestamp: prompt.createdAt,
    promptId: prompt.id,
  })

  let status: ChatMessage["status"] = "ok"
  let body: string
  let files: ChatMessage["files"]

  switch (prompt.status) {
    case "queued":
      status = "running"
      body = "Queued — picking up shortly."
      break
    case "clarifying":
      status = "ok"
      body =
        "I need a few clarifications before I generate. Open the prompt to answer."
      break
    case "generating":
      status = "running"
      body = "Generating files…"
      break
    case "awaiting_approval": {
      status = "ok"
      body = "Done. Review the preview and approve to open a PR."
      const artifact = resolveArtifact?.(prompt.id)
      if (artifact?.files?.length) {
        files = artifact.files.map((f) => ({
          path: f.path,
          size: f.content.length,
        }))
      }
      break
    }
    case "pr_created":
      status = "ok"
      body = prompt.prUrl ? `PR opened — ${prompt.prUrl}` : "PR opened."
      break
    case "completed":
      status = "ok"
      body = "Completed."
      break
    case "failed":
      status = "error"
      body = prompt.error ?? "Generation failed."
      break
    case "cancelled":
      status = "ok"
      body = "Cancelled."
      break
    default:
      status = "ok"
      body = ""
  }

  out.push({
    role: "builder",
    content: body,
    status,
    timestamp: prompt.updatedAt,
    promptId: prompt.id,
    files,
  })
  return out
}

function pickActivePrompt(prompts: PromptRecord[]): PromptRecord | undefined {
  // Pick the latest non-terminal prompt; fall back to newest overall.
  const live = prompts.find((p) =>
    ["queued", "clarifying", "generating", "awaiting_approval"].includes(
      p.status,
    ),
  )
  return live ?? prompts[0]
}

function pipelineStepsFor(prompt: PromptRecord | undefined): PipelineStep[] {
  if (!prompt) return DEFAULT_PIPELINE_STEPS
  const set = (id: string, state: PipelineStep["state"]): PipelineStep => {
    const base = DEFAULT_PIPELINE_STEPS.find((s) => s.id === id)!
    return { ...base, state }
  }
  const status = prompt.status
  if (status === "queued") {
    return [
      set("dash-prd", "active"),
      set("design", "pending"),
      set("skill-v3", "pending"),
      set("claude", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (status === "clarifying" || status === "generating") {
    return [
      set("dash-prd", "done"),
      set("design", "done"),
      set("skill-v3", "active"),
      set("claude", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (
    status === "awaiting_approval" ||
    status === "pr_created" ||
    status === "completed"
  ) {
    return [
      set("dash-prd", "done"),
      set("design", "done"),
      set("skill-v3", "done"),
      set("claude", "done"),
      set("validate", "done"),
      set("preview", "done"),
    ]
  }
  if (status === "failed") {
    return [
      set("dash-prd", "done"),
      set("design", "done"),
      set("skill-v3", "done"),
      set("claude", "error"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  return DEFAULT_PIPELINE_STEPS
}

function previewStateFor(prompt: PromptRecord | undefined): PreviewPaneState {
  if (!prompt) return "idle"
  if (prompt.status === "failed") return "error"
  if (
    prompt.status === "awaiting_approval" ||
    prompt.status === "pr_created" ||
    prompt.status === "completed"
  ) {
    return "ready"
  }
  if (
    prompt.status === "queued" ||
    prompt.status === "clarifying" ||
    prompt.status === "generating"
  ) {
    return "running"
  }
  return "idle"
}

// ─────────────────────────────────────────────────────────────────────────
// Chat dashboard (NEW DEFAULT)
// ─────────────────────────────────────────────────────────────────────────

export function renderChatDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: { claudeCliInstalled?: boolean; claudeCliVersion?: string | null } = {},
): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(20)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  const repos = buildRepoList(auth.github.repos)
  const githubDetail = auth.github.connected
    ? `${auth.github.repos.length || repos.length} repos`
    : undefined
  const anthropicDetail = auth.anthropic.user ?? undefined

  // Thin top status bar — workspace + auth chips above the split pane.
  const statusBar = `<div class="db-chat-statusbar" id="db-auth-region">
    <div class="db-chat-statusbar-group">
      <label class="db-chat-statusbar-label" for="db-repo-select">Repo</label>
      ${renderRepoSelect({ repos, active: workspace.activeRepo })}
    </div>
    <div class="db-chat-statusbar-group">
      <label class="db-chat-statusbar-label" for="db-branch-input">Branch</label>
      ${renderBranchInput({ value: workspace.activeBranch })}
    </div>
    <div class="db-chat-statusbar-spacer"></div>
    <div class="db-chat-statusbar-chips">
      ${renderAuthChip({ provider: "anthropic", connected: auth.anthropic.connected, detail: anthropicDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </div>`

  const needsAnthropic = !auth.anthropic.connected
  const needsGithub = !auth.github.connected

  // Chat thread — build from prompt history. Oldest at top, newest at bottom.
  const chronological = [...prompts].reverse()
  const messages: ChatMessage[] = []
  for (const p of chronological) {
    for (const m of promptToChatMessages(p, resolveArtifact)) messages.push(m)
  }

  const threadBody =
    needsAnthropic || needsGithub
      ? `<div class="db-chat-thread db-chat-thread--empty" id="db-chat-thread">
          ${
            needsAnthropic
              ? renderAnthropicConnectForm({
                  claudeCliInstalled: opts.claudeCliInstalled,
                  claudeCliVersion: opts.claudeCliVersion,
                  activeMode: opts.claudeCliInstalled ? "claude-cli" : "none",
                })
              : renderEmptyState({
                  icon: "◆",
                  title: "Install the Dash Build GitHub App",
                  body: "Pick which repos Dash Build can open PRs against. You can scope to a single repo or your full org.",
                  ctaLabel: "Install GitHub App",
                  ctaHref: "/api/auth/github",
                  variant: "primary",
                })
          }
        </div>`
      : renderChatThread({ messages })

  // Pinned composer + a hidden legacy `db-prompts-region` sibling so the
  // existing /api/status-driven refresh helper + the routes test
  // (`expect(html).toContain("db-prompts-region")`) continue to work.
  const promptComposer =
    needsAnthropic || needsGithub
      ? `<div class="db-chat-composer db-chat-composer--disabled" aria-disabled="true">
          <p class="db-muted db-body-sm">Connect auth above to start chatting.</p>
        </div>`
      : `<div class="db-chat-composer">
          ${renderPromptInput({})}
        </div>`

  const leftPane = `<aside class="db-chat-pane db-chat-pane--left" aria-label="Chat">
    <div class="db-chat-scroll" id="db-chat-scroll">
      ${threadBody}
    </div>
    ${promptComposer}
    <div hidden id="db-prompts-region" aria-hidden="true">
      ${renderPromptList(prompts, resolveArtifact)}
    </div>
  </aside>`

  // Right pane — live preview keyed off the active prompt.
  const active = pickActivePrompt(prompts)
  const previewState = previewStateFor(active)
  const score = (active as unknown as { score?: number })?.score
  const previewPane = renderLivePreviewPane({
    state: previewState,
    promptId: active?.id,
    steps: pipelineStepsFor(active),
    score: typeof score === "number" ? score : undefined,
  })

  const rightPane = `<section class="db-chat-pane db-chat-pane--right" aria-label="Live preview">
    ${previewPane}
  </section>`

  const body = `
    ${statusBar}
    <div class="db-chat-shell">
      ${leftPane}
      ${rightPane}
    </div>
  `

  return renderLayout({
    title: "Dashboard",
    body,
    authIndicator:
      auth.anthropic.connected && auth.github.connected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Classic dashboard (LEGACY / FALLBACK)
// ─────────────────────────────────────────────────────────────────────────

export function renderClassicDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: { claudeCliInstalled?: boolean; claudeCliVersion?: string | null } = {},
): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(10)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  const repos = buildRepoList(auth.github.repos)

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

  const needsAnthropic = !auth.anthropic.connected
  const needsGithub = !auth.github.connected

  let buildBody: string
  if (needsAnthropic) {
    buildBody = renderAnthropicConnectForm({
      claudeCliInstalled: opts.claudeCliInstalled,
      claudeCliVersion: opts.claudeCliVersion,
      activeMode: opts.claudeCliInstalled ? "claude-cli" : "none",
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

/**
 * Opts threaded through to both chat + classic dashboards. Used by the
 * connect-anthropic form to know whether the Claude Code subprocess
 * path is ready (binary on PATH) — keeps the render sync while still
 * showing accurate state. The probe runs in the dashboard route handler.
 */
export interface RenderDashboardOptions {
  claudeCliInstalled?: boolean
  claudeCliVersion?: string | null
}

// Default export — the chat-style dashboard.
export function renderDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: RenderDashboardOptions = {},
): string {
  return renderChatDashboard(store, orchestrator, opts)
}

// Re-export legacy helpers so existing callers (e.g. WS tests) keep working.
export { renderPromptCard, renderPromptList }
