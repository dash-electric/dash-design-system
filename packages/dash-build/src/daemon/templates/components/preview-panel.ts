/**
 * Preview Panel — workspace-level component preview chrome.
 *
 * Replaces the iframe-full-app preview for component-focused outputs. The
 * panel renders five tabs (Component / Diff / BE Impact / Audit / Files);
 * only the Component tab is functional in MVP. Component tab hosts the
 * Sandpack mount node — client-side `preview-mount.ts` looks for
 * `[data-component-id]` and bootstraps Sandpack against
 * `/api/preview/component`.
 *
 * Agent A's workspace.ts renders this panel via:
 *
 *   import { renderPreviewPanel } from "../components/preview-panel.js"
 *   renderPreviewPanel({ componentId, promptId })
 *
 * BEM namespace: `db-preview-*`. Tokens: Dash Layer 0 semantic only.
 * Spec: docs/specs/component-preview-architecture-2026-05-28.md
 */

import { escapeHtml } from "../layout.js"

export type PreviewPanelTab =
  | "component"
  | "diff"
  | "be-impact"
  | "audit"
  | "files"

export interface PreviewPanelContextMap {
  /** Route/branch where the change lands, e.g. "/mitra/[id]". */
  landsAt?: string | null
  /** DS components / hooks the generated code consumes. */
  uses?: string[]
  /** Backend touchpoints (endpoint, table, etc). */
  be?: string[]
  /** Audit trail handling note (legal/financial fields). */
  audit?: string | null
}

export interface PreviewPanelOptions {
  /** Stable component identifier — drives Sandpack data-* + SSE refresh. */
  componentId: string
  /** Prompt id this preview is rendered for. */
  promptId?: string | null
  /** Active tab on first render (defaults to "component"). */
  activeTab?: PreviewPanelTab
  /** Context map footer fields — placeholders for MVP. */
  context?: PreviewPanelContextMap
}

const TABS: ReadonlyArray<{
  id: PreviewPanelTab
  label: string
  disabled: boolean
}> = [
  { id: "component", label: "Component", disabled: false },
  { id: "diff", label: "Diff", disabled: true },
  { id: "be-impact", label: "BE Impact", disabled: true },
  { id: "audit", label: "Audit", disabled: true },
  { id: "files", label: "Files", disabled: true },
]

function renderTabs(active: PreviewPanelTab): string {
  return TABS.map((tab) => {
    const isActive = tab.id === active
    const aria = isActive ? ' aria-selected="true"' : ' aria-selected="false"'
    const tabIndex = isActive ? "" : ' tabindex="-1"'
    const disabledClass = tab.disabled
      ? " db-preview-tab--disabled"
      : ""
    const disabledAttr = tab.disabled ? ' aria-disabled="true"' : ""
    const activeClass = isActive ? " db-preview-tab--active" : ""
    return `<button
      type="button"
      role="tab"
      id="db-preview-tab-${escapeHtml(tab.id)}"
      class="db-preview-tab${activeClass}${disabledClass}"
      data-preview-tab="${escapeHtml(tab.id)}"${aria}${tabIndex}${disabledAttr}>
      ${escapeHtml(tab.label)}
    </button>`
  }).join("")
}

function renderComponentTab(
  componentId: string,
  promptId: string | null,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  const promptAttr = promptId
    ? ` data-prompt-id="${escapeHtml(promptId)}"`
    : ""
  return `<div
    role="tabpanel"
    id="db-preview-panel-component"
    class="db-preview-tabpanel db-preview-tabpanel--component"
    aria-labelledby="db-preview-tab-component"${hidden}>
    <div
      id="db-preview-sandpack"
      class="db-preview-sandpack"
      data-component-id="${escapeHtml(componentId)}"${promptAttr}
      data-preview-state="idle"
      aria-label="Generated component preview"
    >
      <div class="db-preview-sandpack-empty" data-preview-empty>
        <p class="db-preview-sandpack-empty-title">Preview will mount here</p>
        <p class="db-preview-sandpack-empty-body">
          Submit a prompt to see the generated component render inside Sandpack
          with Dash tokens + mock data preloaded.
        </p>
      </div>
    </div>
  </div>`
}

function renderPlaceholderTab(
  id: PreviewPanelTab,
  label: string,
  body: string,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  return `<div
    role="tabpanel"
    id="db-preview-panel-${escapeHtml(id)}"
    class="db-preview-tabpanel db-preview-tabpanel--placeholder"
    aria-labelledby="db-preview-tab-${escapeHtml(id)}"${hidden}>
    <div class="db-preview-placeholder">
      <p class="db-preview-placeholder-kicker">${escapeHtml(label)}</p>
      <p class="db-preview-placeholder-body">${escapeHtml(body)}</p>
    </div>
  </div>`
}

function renderContextMap(ctx: PreviewPanelContextMap | undefined): string {
  const landsAt = ctx?.landsAt ?? "—"
  const uses = ctx?.uses && ctx.uses.length > 0 ? ctx.uses.join(", ") : "—"
  const be = ctx?.be && ctx.be.length > 0 ? ctx.be.join(", ") : "—"
  const audit = ctx?.audit ?? "—"
  return `<footer class="db-preview-context-map" aria-label="Component context">
    <dl class="db-preview-context-list">
      <div class="db-preview-context-item">
        <dt>Lands at</dt>
        <dd>${escapeHtml(landsAt)}</dd>
      </div>
      <div class="db-preview-context-item">
        <dt>Uses</dt>
        <dd>${escapeHtml(uses)}</dd>
      </div>
      <div class="db-preview-context-item">
        <dt>BE</dt>
        <dd>${escapeHtml(be)}</dd>
      </div>
      <div class="db-preview-context-item">
        <dt>Audit</dt>
        <dd>${escapeHtml(audit)}</dd>
      </div>
    </dl>
  </footer>`
}

export function renderPreviewPanel(opts: PreviewPanelOptions): string {
  const active: PreviewPanelTab = opts.activeTab ?? "component"
  const promptId = opts.promptId ?? null

  return `<section
    class="db-preview-panel"
    id="db-preview-panel"
    data-component-id="${escapeHtml(opts.componentId)}"
    aria-label="Component preview">
    <div class="db-preview-tablist" role="tablist" aria-label="Preview tabs">
      ${renderTabs(active)}
    </div>
    <div class="db-preview-tabpanels">
      ${renderComponentTab(opts.componentId, promptId, active === "component")}
      ${renderPlaceholderTab(
        "diff",
        "Diff",
        "Side-by-side diff against the current branch lands here in Phase 2.",
        active === "diff",
      )}
      ${renderPlaceholderTab(
        "be-impact",
        "BE Impact",
        "Backend touchpoints (endpoints, tables, state machines) for this change.",
        active === "be-impact",
      )}
      ${renderPlaceholderTab(
        "audit",
        "Audit",
        "Audit-trail checklist for user-editable fields with legal/financial weight.",
        active === "audit",
      )}
      ${renderPlaceholderTab(
        "files",
        "Files",
        "Generated files in this run with size + path metadata.",
        active === "files",
      )}
    </div>
    ${renderContextMap(opts.context)}
  </section>`
}
