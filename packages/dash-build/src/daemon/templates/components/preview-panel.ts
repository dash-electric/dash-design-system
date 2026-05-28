/**
 * Preview Panel — workspace-level component preview chrome.
 *
 * Replaces the iframe-full-app preview for component-focused outputs. The
 * panel renders five tabpanels (Component / Diff / BE Impact / Audit / Files);
 * only the Component tabpanel is functional in MVP. Component tabpanel hosts
 * the Sandpack mount node — client-side `preview-mount.ts` looks for
 * `[data-component-id]` and bootstraps Sandpack against
 * `/api/preview/component`.
 *
 * NOTE (2026-05-28): the tab strip lives on the parent workspace shell
 * (`db-workspace-tabs` in workspace.ts). This panel intentionally omits its
 * own `<div class="db-preview-tablist">` to avoid the duplicate-tab-strip
 * bug. Tabpanels still render with `aria-labelledby="db-preview-tab-*"` so
 * the workspace tabs can hook them up later when tab switching is wired.
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

export interface DiffSnapshotEntry {
  /** Path the snapshot belongs to. */
  path: string
  /** Either "patch" (unified diff) or "new-file" (full body). */
  kind: "patch" | "new-file"
  /** Unified diff text (kind=patch) or full file body (kind=new-file). */
  body: string
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
  /**
   * Cold-load Diff tab payload. When provided, the Diff tabpanel renders the
   * unified diff (patches) or "+++ new file" view (new-file artifacts) with
   * highlight.js `language-diff` syntax classes. Missing payload leaves the
   * placeholder body in place.
   */
  diffSnapshot?: DiffSnapshotEntry[] | null
}

function renderViewportToggle(): string {
  // Tier 2 #2.12 — Desktop / Tablet / Mobile size constraints. The active
  // state is set client-side from URL hash `#viewport=<size>` or persisted
  // localStorage, with desktop as the default. Buttons are visual-only at
  // SSR time; the wired handler lives in `client/app.ts`.
  return `<div
    class="db-preview-viewport-toggle"
    role="group"
    aria-label="Preview viewport"
    data-viewport-toggle>
    <button
      type="button"
      class="db-preview-viewport-btn db-preview-viewport-btn--active"
      data-viewport-size="desktop"
      aria-pressed="true"
      aria-label="Desktop viewport"
      title="Desktop (full width)"
    >Desktop</button>
    <button
      type="button"
      class="db-preview-viewport-btn"
      data-viewport-size="tablet"
      aria-pressed="false"
      aria-label="Tablet viewport"
      title="Tablet (768px)"
    >Tablet</button>
    <button
      type="button"
      class="db-preview-viewport-btn"
      data-viewport-size="mobile"
      aria-pressed="false"
      aria-label="Mobile viewport"
      title="Mobile (375px)"
    >Mobile</button>
  </div>`
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
    ${renderViewportToggle()}
    <div
      class="db-preview-viewport-frame"
      data-viewport="desktop"
    >
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
    </div>
  </div>`
}

function renderDiffTab(
  snapshot: DiffSnapshotEntry[] | null | undefined,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  if (!snapshot || snapshot.length === 0) {
    return `<div
      role="tabpanel"
      id="db-preview-panel-diff"
      class="db-preview-tabpanel db-preview-tabpanel--placeholder"
      aria-labelledby="db-preview-tab-diff"${hidden}>
      <div class="db-preview-placeholder">
        <p class="db-preview-placeholder-kicker">Diff</p>
        <p class="db-preview-placeholder-body">
          No diff captured yet. Run a prompt against an existing file to see a
          unified diff here, or open a new-file run to view the added body.
        </p>
      </div>
    </div>`
  }
  const blocks = snapshot
    .map((entry) => {
      const header =
        entry.kind === "patch"
          ? `<header class="db-preview-diff-header">
              <span class="db-preview-diff-kind db-preview-diff-kind--patch">PATCH</span>
              <code class="db-preview-diff-path">${escapeHtml(entry.path)}</code>
            </header>`
          : `<header class="db-preview-diff-header">
              <span class="db-preview-diff-kind db-preview-diff-kind--new">+++ NEW FILE</span>
              <code class="db-preview-diff-path">${escapeHtml(entry.path)}</code>
            </header>`
      // For new-file entries we synthesise a minimal +++/--- header so the
      // language-diff lexer paints additions consistently.
      const body =
        entry.kind === "patch"
          ? entry.body
          : `--- /dev/null\n+++ ${entry.path}\n${entry.body
              .split("\n")
              .map((line) => `+${line}`)
              .join("\n")}`
      return `<article
        class="db-preview-diff-entry"
        data-diff-path="${escapeHtml(entry.path)}"
        data-diff-kind="${entry.kind}">
        ${header}
        <pre class="db-preview-diff-pre"><code
          class="db-code-block language-diff"
          data-diff-body
        >${escapeHtml(body)}</code></pre>
      </article>`
    })
    .join("")
  return `<div
    role="tabpanel"
    id="db-preview-panel-diff"
    class="db-preview-tabpanel db-preview-tabpanel--diff"
    aria-labelledby="db-preview-tab-diff"${hidden}>
    <div class="db-preview-diff" data-diff-snapshot>
      ${blocks}
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
    <div class="db-preview-tabpanels">
      ${renderComponentTab(opts.componentId, promptId, active === "component")}
      ${renderDiffTab(opts.diffSnapshot ?? null, active === "diff")}
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
