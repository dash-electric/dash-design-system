import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import type { PromptRecord } from "../state/types.js"
import { renderLayout } from "./layout.js"
import { renderAuthChip } from "./components/auth-chip.js"
import { renderBranchInput } from "./components/branch-input.js"
import { renderOpenAIConnectForm } from "./components/anthropic-connect.js"
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
import type { RepoPreviewInfo } from "../repo-preview.js"
import type { GenerationArtifact } from "../../pipeline/types.js"

/**
 * Dashboard composition.
 *
 * Two render paths are available:
 *
 *  - `renderChatDashboard` (default) — builder-style split pane: chat
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
      : ["dash/portal-v2", "dash/backoffice"]
  return repos.map((full_name) => ({ full_name }))
}

// ─────────────────────────────────────────────────────────────────────────
// Chat ↔ prompt-record adaptation
// ─────────────────────────────────────────────────────────────────────────

function promptToChatMessages(
  prompt: PromptRecord,
  resolveArtifact?: (id: string) => GenerationArtifact | undefined,
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
  let review: ChatMessage["review"]

  switch (prompt.status) {
    case "queued":
      status = "running"
      body = "Queued — picking up shortly."
      break
    case "clarifying":
      status = "ok"
      body =
        "I need one quick answer before I generate so the PRD and design context are correct."
      break
    case "generating":
      status = "running"
      body = "Generating files…"
      break
    case "awaiting_approval": {
      status = "ok"
      body =
        "Done. Review the preview. GitHub is only needed when you want to open a PR."
      const artifact = resolveArtifact?.(prompt.id)
      if (artifact?.files?.length) {
        files = artifact.files.map((f) => ({
          path: f.path,
          size: f.content.length,
        }))
        const previewMode = artifact.previewMode ?? (artifact.bundleResult ? "component" : "fallback")
        const route = artifact.contextPack?.targetRoute ?? artifact.contextPack?.defaultRoute
        const nav = artifact.contextPack?.targetNavLabel
        const contextSummary = artifact.contextPack
          ? `Context locked to ${artifact.contextPack.surface} (${artifact.contextPack.theme})${route ? ` at ${route}` : ""}${nav ? ` via ${nav}` : ""}. ${artifact.explanation || "Dash Build generated code and prepared it for local preview."}`
          : artifact.explanation || "Dash Build generated code and prepared it for local preview."
        review = {
          title: "Review generated Dash files",
          summary: contextSummary,
          stats: [
            { label: "Files", value: String(artifact.files.length), tone: "neutral" },
            artifact.contextPack
              ? {
                  label: "Context",
                  value: artifact.contextPack.repoSlug,
                  tone: "good",
                }
              : null,
            route
              ? {
                  label: "Route",
                  value: route,
                  tone: "neutral",
                }
              : null,
            {
              label: "Foundation",
              value: `${artifact.validation.score}/100`,
              tone: artifact.validation.passed ? "good" : "warn",
            },
            {
              label: "Preview",
              value: previewMode === "fallback" ? "Fallback" : "Live",
              tone: previewMode === "fallback" ? "warn" : "good",
            },
            {
              label: "Validation",
              value: artifact.validation.passed ? "Passed" : "Review",
              tone: artifact.validation.passed ? "good" : "warn",
            },
          ].filter(Boolean) as NonNullable<ChatMessage["review"]>["stats"],
        }
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
    review,
  })
  return out
}

function pickActivePrompt(
  prompts: PromptRecord[],
  selectedRepo: string | null,
): PromptRecord | undefined {
  // Pick the latest prompt for the selected repo so switching repos reveals
  // that repo's baseline instead of pinning the canvas to old generated work.
  const scoped = selectedRepo
    ? prompts.filter((p) => p.repo === selectedRepo)
    : prompts
  const live = scoped.find((p) =>
    ["queued", "clarifying", "generating", "awaiting_approval"].includes(
      p.status,
    ),
  )
  return live ?? scoped[0]
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
      { ...set("dash-prd", "active"), detail: "shape scope" },
      set("design", "pending"),
      set("skill-v3", "pending"),
      set("codex", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (status === "clarifying") {
    return [
      { ...set("dash-prd", "active"), detail: "collect context" },
      set("design", "pending"),
      set("skill-v3", "pending"),
      set("codex", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (status === "generating") {
    return [
      { ...set("dash-prd", "done"), detail: "scope locked" },
      { ...set("design", "done"), detail: "context pack" },
      { ...set("skill-v3", "active"), detail: "compose files" },
      set("codex", "pending"),
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
      { ...set("dash-prd", "done"), detail: "scope locked" },
      { ...set("design", "done"), detail: "rules applied" },
      { ...set("skill-v3", "done"), detail: "files ready" },
      { ...set("codex", "done"), detail: "generated" },
      { ...set("validate", "done"), detail: "checked" },
      { ...set("preview", "done"), detail: "mounted" },
    ]
  }
  if (status === "failed") {
    return [
      set("dash-prd", "done"),
      set("design", "done"),
      set("skill-v3", "done"),
      set("codex", "error"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  return DEFAULT_PIPELINE_STEPS
}

function previewStateFor(prompt: PromptRecord | undefined): PreviewPaneState {
  if (!prompt) return "idle"
  if (prompt.status === "failed") return "error"
  if (prompt.status === "clarifying") return "clarifying"
  if (
    prompt.status === "awaiting_approval" ||
    prompt.status === "pr_created" ||
    prompt.status === "completed"
  ) {
    return "ready"
  }
  if (
    prompt.status === "queued" ||
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
  opts: {
    codexCliInstalled?: boolean
    codexCliAuthenticated?: boolean
    codexCliVersion?: string | null
    openAIMode?: "codex-cli" | "byo-key" | "none"
    openAIUser?: string | null
    repoPreview?: RepoPreviewInfo | null
    previewBundleAvailable?: boolean
  } = {},
): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(20)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  const repos = buildRepoList(auth.github.repos)
  const selectedRepo = workspace.activeRepo ?? repos[0]?.full_name ?? null
  const githubDetail = auth.github.connected
    ? `${auth.github.repos.length || repos.length} repos`
    : "optional for PR"
  const openAIConnected =
    opts.openAIMode === "codex-cli" ||
    opts.openAIMode === "byo-key" ||
    auth.openai.connected
  const openAIDetail =
    opts.openAIUser ??
    (opts.openAIMode === "codex-cli" ? "ChatGPT" : auth.openai.user ?? undefined)

  // Thin top status bar — workspace + auth chips above the split pane.
  const statusBar = `<div class="db-chat-statusbar" id="db-auth-region">
    <div class="db-chat-statusbar-group">
      <label class="db-chat-statusbar-label" for="db-repo-select">Repo</label>
      ${renderRepoSelect({ repos, active: selectedRepo })}
    </div>
    <div class="db-chat-statusbar-group">
      <label class="db-chat-statusbar-label" for="db-branch-input">Branch</label>
      ${renderBranchInput({ value: workspace.activeBranch })}
    </div>
    <div class="db-chat-statusbar-spacer"></div>
    <div class="db-chat-statusbar-chips">
      ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </div>`

  const needsOpenAI = !openAIConnected
  const active =
    needsOpenAI
      ? undefined
      : pickActivePrompt(prompts, selectedRepo)
  // Chat thread — build from prompt history. Oldest at top, newest at bottom.
  const chronological = [...prompts].reverse()
  const messages: ChatMessage[] = []
  for (const p of chronological) {
    for (const m of promptToChatMessages(p, resolveArtifact)) messages.push(m)
  }

  const threadBody =
    needsOpenAI
      ? `<div class="db-chat-thread db-chat-thread--empty" id="db-chat-thread">
          ${renderOpenAIConnectForm({
            codexCliInstalled: opts.codexCliInstalled,
            codexCliVersion: opts.codexCliVersion,
            activeMode: opts.openAIMode === "byo-key" ? "byo-key" : opts.codexCliAuthenticated ? "codex-cli" : "none",
          })}
        </div>`
      : renderChatThread({
          messages,
          emptyHint:
            "Describe a feature to generate code and preview it locally. Connect GitHub later only when you want Dash Build to open a PR.",
        })

  // Pinned composer + a hidden legacy `db-prompts-region` sibling so the
  // existing /api/status-driven refresh helper + the routes test
  // (`expect(html).toContain("db-prompts-region")`) continue to work.
  const promptComposer =
    needsOpenAI
      ? `<div class="db-chat-composer db-chat-composer--disabled" aria-disabled="true">
          <p class="db-muted db-body-sm">Connect OpenAI to start local generation.</p>
        </div>`
      : `<div class="db-chat-composer">
          ${
            active?.status === "clarifying"
              ? `<div class="db-chat-composer-alert" role="status">
                  <span>Paused for one clarification.</span>
                  <button type="button" data-clarification-focus="${escapeAttr(active.id)}">Answer inline →</button>
                </div>`
              : ""
          }
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
  const inferredPreviewState = active
    ? previewStateFor(active)
    : selectedRepo
      ? "baseline"
      : "idle"
  const previewState =
    inferredPreviewState === "ready" && opts.previewBundleAvailable === false
      ? "error"
      : inferredPreviewState
  const score = (active as unknown as { score?: number })?.score
  const activeArtifact = active ? resolveArtifact?.(active.id) : undefined
  const previewPane = renderLivePreviewPane({
    state: previewState,
    promptId: active?.id,
    steps: pipelineStepsFor(active),
    score:
      activeArtifact?.validation.score ??
      (typeof score === "number" ? score : undefined),
    previewMode: activeArtifact?.previewMode,
    errorMessage:
      inferredPreviewState === "ready" && opts.previewBundleAvailable === false
        ? "Generated files are ready, but the iframe bundle could not be built for this output. Review the file list on the left."
        : undefined,
    repoPreview: opts.repoPreview,
  })

  const rightPane = `<section class="db-chat-pane db-chat-pane--right" aria-label="Live preview">
    ${previewPane}
  </section>`

  const body = `<section class="db-chat-scene">
    ${statusBar}
    <div class="db-chat-shell">
      ${leftPane}
      <div class="db-chat-resizer" role="separator" aria-orientation="vertical" aria-label="Resize chat panel" tabindex="0"></div>
      ${rightPane}
    </div>
  </section>`

  return renderLayout({
    title: "Dashboard",
    body,
    authIndicator:
      openAIConnected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Classic dashboard (LEGACY / FALLBACK)
// ─────────────────────────────────────────────────────────────────────────

export function renderClassicDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: {
    codexCliInstalled?: boolean
    codexCliAuthenticated?: boolean
    codexCliVersion?: string | null
    openAIMode?: "codex-cli" | "byo-key" | "none"
    openAIUser?: string | null
  } = {},
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
    : "optional for PR"
  const openAIConnected =
    opts.openAIMode === "codex-cli" ||
    opts.openAIMode === "byo-key" ||
    auth.openai.connected
  const openAIDetail =
    opts.openAIUser ??
    (opts.openAIMode === "codex-cli" ? "ChatGPT" : auth.openai.user ?? undefined)

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
      ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </section>`

  const needsOpenAI = !openAIConnected
  let buildBody: string
  if (needsOpenAI) {
    buildBody = renderOpenAIConnectForm({
      codexCliInstalled: opts.codexCliInstalled,
      codexCliVersion: opts.codexCliVersion,
      activeMode: opts.openAIMode === "byo-key" ? "byo-key" : opts.codexCliAuthenticated ? "codex-cli" : "none",
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
    needsOpenAI
      ? `<div class="db-empty-state"><p class="db-empty-body">Connect OpenAI above to see prompts.</p></div>`
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
      openAIConnected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

/**
 * Opts threaded through to both chat + classic dashboards. Used by the
 * connect form to know whether the Codex subprocess
 * path is ready (binary on PATH) — keeps the render sync while still
 * showing accurate state. The probe runs in the dashboard route handler.
 */
export interface RenderDashboardOptions {
  codexCliInstalled?: boolean
  codexCliAuthenticated?: boolean
  codexCliVersion?: string | null
  openAIMode?: "codex-cli" | "byo-key" | "none"
  openAIUser?: string | null
  repoPreview?: RepoPreviewInfo | null
  previewBundleAvailable?: boolean
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
