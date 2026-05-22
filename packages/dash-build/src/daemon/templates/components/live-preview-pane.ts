import { escapeHtml } from "../layout.js"
import type { RepoPreviewInfo } from "../../repo-preview.js"

/**
 * LivePreviewPane — the right-hand pane in the builder dashboard.
 * Three states keyed off the active prompt's lifecycle:
 *   - idle    : nothing to preview yet (no prompt running)
 *   - clarifying : waiting for user answer before generation resumes
 *   - running : pipeline steps with checkmarks/spinners
 *   - ready   : sandboxed iframe + foundation match score badge
 *
 * Wrapped in `#db-preview-pane` so the WS handler can swap inner HTML
 * without a full page reload.
 */

export type PreviewPaneState = "idle" | "baseline" | "clarifying" | "running" | "ready" | "error"

export interface PipelineStep {
  /** Slug used for data-attrs (e.g. "dash-prd"). */
  id: string
  /** Human label (e.g. "Skill v3"). */
  label: string
  /** "pending" | "active" | "done" | "error". */
  state: "pending" | "active" | "done" | "error"
  /** Optional sub-label (e.g. "Analysing prompt…"). */
  detail?: string
}

export const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  { id: "dash-prd", label: "dash-prd", state: "pending" },
  { id: "design", label: "design", state: "pending" },
  { id: "skill-v3", label: "Skill v3", state: "pending" },
  { id: "codex", label: "Codex", state: "pending" },
  { id: "validate", label: "validate", state: "pending" },
  { id: "preview", label: "preview", state: "pending" },
]

export interface LivePreviewPaneOptions {
  state: PreviewPaneState
  /** Active prompt id, when relevant. */
  promptId?: string
  /** Pipeline steps for the "running" state. */
  steps?: PipelineStep[]
  /** Iframe URL for the "ready" state. Defaults to `/preview/<promptId>`. */
  previewUrl?: string
  /** 0–100 foundation match score for the "ready" state. */
  score?: number
  /** Component means real generated UI mounted; fallback means review shell. */
  previewMode?: "component" | "fallback"
  /** Error text for the "error" state. */
  errorMessage?: string
  /** Existing selected repo preview before generation starts. */
  repoPreview?: RepoPreviewInfo | null
}

function renderIdle(): string {
  return `<div class="db-live-preview-state db-live-preview-state--idle" data-state="idle">
    <div class="db-live-preview-empty">
      <div class="db-live-preview-empty-art" aria-hidden="true">
        <span class="db-live-preview-empty-grid"></span>
        <span class="db-live-preview-empty-cursor">▸</span>
      </div>
      <p class="db-live-preview-empty-title">Live preview</p>
      <p class="db-live-preview-empty-body">Your generated UI will render here as soon as you submit a prompt.</p>
    </div>
  </div>`
}

function renderTopbar(state: PreviewPaneState, promptId?: string): string {
  const statusLabel =
    state === "ready"
      ? "Preview live"
      : state === "baseline"
        ? "Repo preview"
      : state === "clarifying"
        ? "Needs clarification"
      : state === "running"
        ? "Generating"
        : state === "error"
          ? "Needs attention"
          : "Waiting for prompt"
  const context = promptId
    ? `<span class="db-live-preview-context">Prompt <code>${escapeHtml(promptId.slice(0, 8))}</code></span>`
    : `<span class="db-live-preview-context">Dash DS sandbox</span>`

  return `<header class="db-live-preview-topbar">
    <div class="db-live-preview-topbar-copy">
      <span class="db-live-preview-kicker">${escapeHtml(statusLabel)}</span>
      <div class="db-live-preview-title-row">
        <h3 class="db-live-preview-title">Canvas</h3>
        ${context}
      </div>
    </div>
    <div class="db-live-preview-topbar-actions" aria-label="Preview modes">
      <button type="button" class="db-live-preview-device db-live-preview-device--active" data-preview-device="desktop">Desktop</button>
      <button type="button" class="db-live-preview-device" data-preview-device="tablet">Tablet</button>
      <button type="button" class="db-live-preview-device" data-preview-device="mobile">Mobile</button>
    </div>
  </header>`
}

function renderBaseline(info?: RepoPreviewInfo | null): string {
  if (!info) {
    return `<div class="db-live-preview-state db-live-preview-state--idle" data-state="baseline">
      <div class="db-live-preview-empty">
        <div class="db-live-preview-empty-art" aria-hidden="true">
          <span class="db-live-preview-empty-grid"></span>
          <span class="db-live-preview-empty-cursor">▸</span>
        </div>
        <p class="db-live-preview-empty-title">Select a repo</p>
        <p class="db-live-preview-empty-body">Choose a local Dash repo to show its baseline app here before generation.</p>
      </div>
    </div>`
  }

  if (info.status === "running") {
    return `<div class="db-live-preview-state db-live-preview-state--ready db-live-preview-state--baseline" data-state="baseline">
      <div class="db-baseline-ribbon">
        <span>Baseline repo</span>
        <code>${escapeHtml(info.repo)}</code>
        <a href="${escapeHtml(info.url)}" target="_blank" rel="noreferrer">Open app ↗</a>
      </div>
      <iframe
        class="db-live-preview-frame"
        title="Selected repo baseline preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        src="${escapeHtml(info.url)}"
        loading="lazy"
      ></iframe>
    </div>`
  }

  const command =
    info.status === "dependencies_missing"
      ? info.installCommand
      : info.startCommand
  const cta =
    info.status === "dependencies_missing"
      ? "Dependencies needed"
      : info.status === "starting"
        ? "Starting…"
        : "Start local preview"
  const disabled = info.status === "dependencies_missing" || info.status === "starting"
    ? " disabled"
    : ""
  const error = info.error
    ? `<p class="db-baseline-error">${escapeHtml(info.error)}</p>`
    : ""

  return `<div class="db-live-preview-state db-live-preview-state--idle" data-state="baseline">
    <div class="db-baseline-card" data-repo-preview="${escapeHtml(info.repo)}">
      <span class="db-baseline-kicker">Existing repo</span>
      <h3 class="db-live-preview-empty-title">${escapeHtml(info.repo)}</h3>
      <p class="db-live-preview-empty-body">${escapeHtml(info.message)}</p>
      ${error}
      <pre class="db-baseline-command"><code>${escapeHtml(command)}</code></pre>
      <div class="db-baseline-actions">
        <button type="button" class="db-live-preview-action" data-repo-preview-start="${escapeHtml(info.repo)}"${disabled}>${escapeHtml(cta)} →</button>
        <button type="button" class="db-button db-button-secondary db-baseline-copy" data-copy-command="${escapeHtml(command)}">Copy command</button>
      </div>
      <p class="db-live-preview-empty-body db-baseline-note">After it is running, the current app appears here. Generated output will replace this iframe when the prompt finishes.</p>
    </div>
  </div>`
}

function renderPipelineItems(steps: PipelineStep[]): string {
  return steps
    .map((s) => {
      const icon =
        s.state === "done"
          ? `<span class="db-pipeline-step-icon db-pipeline-step-icon--done" aria-hidden="true">✓</span>`
          : s.state === "active"
            ? `<span class="db-pipeline-step-icon db-pipeline-step-icon--active" aria-hidden="true"></span>`
            : s.state === "error"
              ? `<span class="db-pipeline-step-icon db-pipeline-step-icon--error" aria-hidden="true">!</span>`
              : `<span class="db-pipeline-step-icon db-pipeline-step-icon--pending" aria-hidden="true"></span>`
      const detail = s.detail
        ? `<span class="db-pipeline-step-detail">${escapeHtml(s.detail)}</span>`
        : ""
      return `<li class="db-pipeline-step" data-step="${escapeHtml(s.id)}" data-state="${escapeHtml(s.state)}">
        ${icon}
        <span class="db-pipeline-step-label">${escapeHtml(s.label)}</span>
        ${detail}
      </li>`
    })
    .join("")
}

function renderRunning(steps: PipelineStep[]): string {
  const items = renderPipelineItems(steps)
  return `<div class="db-live-preview-state db-live-preview-state--running" data-state="running">
    <div class="db-live-preview-pipeline">
      <h3 class="db-live-preview-heading">Generating…</h3>
      <p class="db-live-preview-sub">Skill chain is composing your feature. Hang tight.</p>
      <ol class="db-pipeline-steps">${items}</ol>
    </div>
  </div>`
}

function renderClarifying(steps: PipelineStep[], promptId?: string): string {
  const items = renderPipelineItems(steps)
  const action = promptId
    ? `<button type="button" class="db-live-preview-action" data-clarification-focus="${escapeHtml(promptId)}">Answer question →</button>`
    : ""
  return `<div class="db-live-preview-state db-live-preview-state--running" data-state="clarifying">
    <div class="db-live-preview-pipeline">
      <h3 class="db-live-preview-heading">Needs one answer</h3>
      <p class="db-live-preview-sub">Dash Build paused before generation so PRD, design, and Skill v3 get the right context.</p>
      ${action}
      <ol class="db-pipeline-steps">${items}</ol>
    </div>
  </div>`
}

function renderReady(opts: LivePreviewPaneOptions): string {
  const url = opts.previewUrl ?? (opts.promptId ? `/preview/${opts.promptId}` : "about:blank")
  const score = typeof opts.score === "number" ? Math.max(0, Math.min(100, opts.score)) : undefined
  const previewMode = opts.previewMode ?? "component"
  const scoreClass =
    score == null
      ? ""
      : score >= 85
        ? "db-foundation-badge--good"
        : score >= 70
          ? "db-foundation-badge--ok"
          : "db-foundation-badge--low"
  const badge =
    score != null
      ? `<span class="db-foundation-badge ${scoreClass}" title="Foundation match score">
          <span class="db-foundation-badge-label">Foundation</span>
          <span class="db-foundation-badge-value">${score}/100</span>
        </span>`
      : ""
  const modeBadge =
    previewMode === "fallback"
      ? `<span class="db-foundation-badge db-foundation-badge--ok" title="Fallback review shell">
          <span class="db-foundation-badge-label">Preview</span>
          <span class="db-foundation-badge-value">Fallback</span>
        </span>`
      : ""

  return `<div class="db-live-preview-state db-live-preview-state--ready" data-state="ready" data-preview-viewport="desktop">
    ${badge}
    ${modeBadge}
    <div class="db-live-preview-frame-shell">
      <div class="db-live-preview-frame-toolbar">
        <span>${previewMode === "fallback" ? "Fallback preview" : "Generated preview"}</span>
        <div>
          <button type="button" data-preview-refresh>Refresh</button>
          <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Open full ↗</a>
        </div>
      </div>
      <iframe
        class="db-live-preview-frame"
        title="Generated UI preview"
        sandbox="allow-scripts allow-same-origin"
        src="${escapeHtml(url)}"
        loading="lazy"
      ></iframe>
    </div>
  </div>`
}

function renderError(message: string): string {
  return `<div class="db-live-preview-state db-live-preview-state--error" data-state="error" role="alert">
    <div class="db-live-preview-empty">
      <div class="db-live-preview-empty-art db-live-preview-empty-art--error" aria-hidden="true">!</div>
      <p class="db-live-preview-empty-title">Preview unavailable</p>
      <p class="db-live-preview-empty-body">${escapeHtml(message)}</p>
    </div>
  </div>`
}

export function renderLivePreviewPane(opts: LivePreviewPaneOptions): string {
  let body: string
  switch (opts.state) {
    case "baseline":
      body = renderBaseline(opts.repoPreview)
      break
    case "clarifying":
      body = renderClarifying(opts.steps ?? DEFAULT_PIPELINE_STEPS, opts.promptId)
      break
    case "running":
      body = renderRunning(opts.steps ?? DEFAULT_PIPELINE_STEPS)
      break
    case "ready":
      body = renderReady(opts)
      break
    case "error":
      body = renderError(opts.errorMessage ?? "Generation failed.")
      break
    case "idle":
    default:
      body = renderIdle()
      break
  }

  const promptAttr = opts.promptId ? ` data-prompt-id="${escapeHtml(opts.promptId)}"` : ""
  return `<section class="db-live-preview-pane" id="db-preview-pane" data-state="${escapeHtml(opts.state)}"${promptAttr} aria-label="Live preview">
    ${renderTopbar(opts.state, opts.promptId)}
    ${body}
  </section>`
}
