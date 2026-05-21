import { escapeHtml } from "../layout.js"

/**
 * LivePreviewPane — the right-hand pane in the Claude.ai-style dashboard.
 * Three states keyed off the active prompt's lifecycle:
 *   - idle    : nothing to preview yet (no prompt running)
 *   - running : pipeline steps with checkmarks/spinners
 *   - ready   : sandboxed iframe + foundation match score badge
 *
 * Wrapped in `#db-preview-pane` so the WS handler can swap inner HTML
 * without a full page reload.
 */

export type PreviewPaneState = "idle" | "running" | "ready" | "error"

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
  { id: "claude", label: "Claude", state: "pending" },
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
  /** Error text for the "error" state. */
  errorMessage?: string
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

function renderRunning(steps: PipelineStep[]): string {
  const items = steps
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

  return `<div class="db-live-preview-state db-live-preview-state--running" data-state="running">
    <div class="db-live-preview-pipeline">
      <h3 class="db-live-preview-heading">Generating…</h3>
      <p class="db-live-preview-sub">Skill chain is composing your feature. Hang tight.</p>
      <ol class="db-pipeline-steps">${items}</ol>
    </div>
  </div>`
}

function renderReady(opts: LivePreviewPaneOptions): string {
  const url = opts.previewUrl ?? (opts.promptId ? `/preview/${opts.promptId}` : "about:blank")
  const score = typeof opts.score === "number" ? Math.max(0, Math.min(100, opts.score)) : undefined
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

  return `<div class="db-live-preview-state db-live-preview-state--ready" data-state="ready">
    ${badge}
    <iframe
      class="db-live-preview-frame"
      title="Generated UI preview"
      sandbox="allow-scripts allow-same-origin"
      src="${escapeHtml(url)}"
      loading="lazy"
    ></iframe>
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
    ${body}
  </section>`
}
