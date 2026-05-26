import { escapeHtml } from "../layout.js"
import type { PipelineStep } from "./live-preview-pane.js"

/**
 * Progress strip — staged generation visibility.
 *
 * Maps internal pipeline ids (`dash-prd / design / skill-v3 / codex /
 * validate / preview`) to user-facing Indonesian labels. Renders inline
 * below the anchor bar while a run is in flight. Hidden when no run is
 * active or the active run is in a stable terminal state.
 *
 * P1.2A scope: structural rendering only. No elapsed-time meter; that lands
 * in a later slice if it stays trivial.
 */

export interface ProgressStripOptions {
  steps: PipelineStep[]
  /** Whether to render at all. Callers pass false to keep DOM stable. */
  visible: boolean
}

const STAGE_LABELS: Record<string, string> = {
  "dash-prd": "Membaca permintaan",
  design: "Membaca konteks repo",
  "skill-v3": "Mencocokkan route & nav",
  codex: "Membuat rencana",
  validate: "Menulis file",
  preview: "Menyiapkan preview",
}

function stateGlyph(state: PipelineStep["state"]): string {
  if (state === "done") return "✓"
  if (state === "error") return "✕"
  if (state === "active") return "●"
  return "○"
}

export function renderProgressStrip(opts: ProgressStripOptions): string {
  if (!opts.visible || opts.steps.length === 0) {
    return `<div class="db-progress-strip db-progress-strip--hidden" id="db-progress-strip" data-visible="false" aria-hidden="true"></div>`
  }

  const items = opts.steps
    .map((step) => {
      const label = STAGE_LABELS[step.id] ?? step.label
      const detail = step.detail ? `<span class="db-progress-step-detail">${escapeHtml(step.detail)}</span>` : ""
      return `<li class="db-progress-step" data-state="${escapeHtml(step.state)}" data-stage="${escapeHtml(step.id)}">
        <span class="db-progress-step-glyph" aria-hidden="true">${stateGlyph(step.state)}</span>
        <span class="db-progress-step-label">${escapeHtml(label)}</span>
        ${detail}
      </li>`
    })
    .join("")

  return `<div class="db-progress-strip" id="db-progress-strip" data-visible="true" role="status" aria-live="polite">
    <ol class="db-progress-list">${items}</ol>
  </div>`
}
