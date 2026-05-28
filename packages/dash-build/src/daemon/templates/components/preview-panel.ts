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

export interface BeImpactEndpoint {
  method: string
  path: string
  file: string
}

export interface BeImpactRequiredEndpoint {
  /** "GET /api/foo/aggregate" or similar one-liner. */
  description: string
  /** Scenario tag that surfaces the requirement (e.g. "extend_fe_be"). */
  scenario?: string
}

export interface BeImpactSnapshot {
  /** Scenario classifier output (extend_fe_be / fe_only / new_feature / ...). */
  scenario: string | null
  /** Existing endpoints surfaced from the BE catalog. */
  existingEndpoints: BeImpactEndpoint[]
  /** DB tables referenced — name + optional access hint. */
  dbTables: Array<{ name: string; access?: string | null }>
  /** Required new endpoints inferred from the scenario. */
  requiredEndpoints: BeImpactRequiredEndpoint[]
}

export interface AuditSnapshot {
  /** "pass" | "required" | "missing" — drives the status badge. */
  status: "pass" | "required" | "missing"
  /** Friendly reason string (CR-3 trigger description). */
  reason: string | null
  /** CR-3 pattern bucket (inline-edit-with-audit / image-editor-with-audit / custom). */
  pattern: string | null
  /** Sensitive fields detected in the prompt / output. */
  sensitiveFields: string[]
  /** Audit-call references found in generated output (e.g. "auditLog.create"). */
  auditCalls: string[]
  /** Validator findings related to CR-3 / audit. */
  validatorChecks: Array<{ ruleId: string; status: "pass" | "warn" | "fail"; message?: string }>
}

export interface FileSnapshotEntry {
  /** Path relative to <runDir>/files/, forward-slash separated. */
  path: string
  /** Size in bytes. */
  size: number
  /** Lower-case file extension (no dot) or "" for extension-less files. */
  type: string
}

export interface ValidationFinding {
  ruleId: string
  severity: "high" | "medium" | "low"
  message: string
  file?: string | null
}

export interface ValidationSnapshot {
  passed: boolean
  score: number
  /** Total findings count split by severity. */
  counts: { high: number; medium: number; low: number }
  /** Individual findings (truncated to ~20 in the UI). */
  findings: ValidationFinding[]
  /** Aggregate rule ids hit (deduplicated, ordered by severity then count). */
  rulesHit: Array<{ ruleId: string; count: number }>
  /** Warning strings (non-blocking). */
  warnings: string[]
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
  /**
   * Tier 2 #4a — BE Impact tab cold-load payload. When provided, the BE
   * Impact tabpanel renders existing endpoints, DB tables, and required new
   * endpoints. Missing payload leaves the placeholder body in place.
   */
  beImpactSnapshot?: BeImpactSnapshot | null
  /**
   * Tier 2 #4b — Audit tab cold-load payload. When provided, the Audit
   * tabpanel renders CR-3 status, sensitive fields, audit-call references,
   * and validator outcomes. Missing payload leaves the placeholder body in
   * place.
   */
  auditSnapshot?: AuditSnapshot | null
  /**
   * Tier 2 #4c — Files tab cold-load payload. When provided, the Files
   * tabpanel renders a sorted list with size + type per generated file.
   * Missing payload leaves the placeholder body in place.
   */
  filesSnapshot?: FileSnapshotEntry[] | null
  /**
   * Tier 2 #7 — Validator UI payload. When provided, the Diff tabpanel (or
   * dedicated validation block) renders a pass/fail summary with rule-id
   * breakdown so users can see why a patch was held back.
   */
  validationSnapshot?: ValidationSnapshot | null
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
  validation: ValidationSnapshot | null | undefined,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  const validationPanel = renderValidationPanel(validation)
  if (!snapshot || snapshot.length === 0) {
    return `<div
      role="tabpanel"
      id="db-preview-panel-diff"
      class="db-preview-tabpanel db-preview-tabpanel--placeholder"
      aria-labelledby="db-preview-tab-diff"${hidden}>
      ${validationPanel}
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
    ${validationPanel}
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

// ---------------------------------------------------------------------------
// Tier 2 #4a — BE Impact tab renderer
// ---------------------------------------------------------------------------

function renderBeImpactTab(
  snapshot: BeImpactSnapshot | null | undefined,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  if (
    !snapshot ||
    (snapshot.existingEndpoints.length === 0 &&
      snapshot.dbTables.length === 0 &&
      snapshot.requiredEndpoints.length === 0 &&
      !snapshot.scenario)
  ) {
    return renderPlaceholderTab(
      "be-impact",
      "BE Impact",
      "Backend touchpoints (endpoints, tables, state machines) for this change.",
      active,
    )
  }

  const scenarioLine = snapshot.scenario
    ? `<p class="db-preview-be-scenario"><span class="db-preview-be-label">Scenario:</span> <code>${escapeHtml(snapshot.scenario)}</code></p>`
    : ""

  const existingBlock =
    snapshot.existingEndpoints.length > 0
      ? `<section class="db-preview-be-section">
          <h3 class="db-preview-be-heading">Existing endpoints (${snapshot.existingEndpoints.length})</h3>
          <ul class="db-preview-be-list">
            ${snapshot.existingEndpoints
              .slice(0, 30)
              .map(
                (ep) =>
                  `<li class="db-preview-be-item">
                    <span class="db-preview-be-method db-preview-be-method--${escapeHtml(ep.method.toLowerCase())}">${escapeHtml(ep.method.toUpperCase())}</span>
                    <code class="db-preview-be-path">${escapeHtml(ep.path)}</code>
                    <span class="db-preview-be-sep" aria-hidden="true">—</span>
                    <code class="db-preview-be-file">${escapeHtml(ep.file)}</code>
                  </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : `<section class="db-preview-be-section db-preview-be-section--empty">
          <h3 class="db-preview-be-heading">Existing endpoints</h3>
          <p class="db-preview-be-empty">No backend endpoints surfaced from the BE catalog.</p>
        </section>`

  const dbBlock =
    snapshot.dbTables.length > 0
      ? `<section class="db-preview-be-section">
          <h3 class="db-preview-be-heading">DB tables referenced (${snapshot.dbTables.length})</h3>
          <ul class="db-preview-be-list">
            ${snapshot.dbTables
              .slice(0, 30)
              .map((t) => {
                const access = t.access
                  ? ` <span class="db-preview-be-access">(${escapeHtml(t.access)})</span>`
                  : ""
                return `<li class="db-preview-be-item">
                  <code class="db-preview-be-table">${escapeHtml(t.name)}</code>${access}
                </li>`
              })
              .join("")}
          </ul>
        </section>`
      : ""

  const requiredBlock =
    snapshot.requiredEndpoints.length > 0
      ? `<section class="db-preview-be-section">
          <h3 class="db-preview-be-heading">Required new endpoints (${snapshot.requiredEndpoints.length})</h3>
          <ul class="db-preview-be-list">
            ${snapshot.requiredEndpoints
              .slice(0, 20)
              .map((r) => {
                const scenarioTag = r.scenario
                  ? ` <span class="db-preview-be-scenario-tag">(${escapeHtml(r.scenario)} scenario)</span>`
                  : ""
                return `<li class="db-preview-be-item db-preview-be-item--required">
                  <span class="db-preview-be-required-icon" aria-hidden="true">+</span>
                  <code class="db-preview-be-required">${escapeHtml(r.description)}</code>${scenarioTag}
                </li>`
              })
              .join("")}
          </ul>
        </section>`
      : ""

  return `<div
    role="tabpanel"
    id="db-preview-panel-be-impact"
    class="db-preview-tabpanel db-preview-tabpanel--be-impact"
    aria-labelledby="db-preview-tab-be-impact"${hidden}>
    <div class="db-preview-be" data-be-snapshot>
      <header class="db-preview-be-header">
        <h2 class="db-preview-be-title">Backend Touchpoints</h2>
        ${scenarioLine}
      </header>
      ${existingBlock}
      ${dbBlock}
      ${requiredBlock}
    </div>
  </div>`
}

// ---------------------------------------------------------------------------
// Tier 2 #4b — Audit tab renderer
// ---------------------------------------------------------------------------

function statusBadge(status: "pass" | "required" | "missing"): string {
  const label =
    status === "pass" ? "Pass" : status === "required" ? "Required" : "Missing"
  const symbol = status === "pass" ? "✓" : status === "required" ? "!" : "✗"
  return `<span class="db-preview-audit-status db-preview-audit-status--${escapeHtml(status)}" aria-label="Audit status ${escapeHtml(label)}">
    <span class="db-preview-audit-status-icon" aria-hidden="true">${escapeHtml(symbol)}</span>
    <span>${escapeHtml(label)}</span>
  </span>`
}

function renderAuditTab(
  snapshot: AuditSnapshot | null | undefined,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  if (!snapshot) {
    return renderPlaceholderTab(
      "audit",
      "Audit",
      "Audit-trail checklist for user-editable fields with legal/financial weight.",
      active,
    )
  }

  const reasonBlock = snapshot.reason
    ? `<p class="db-preview-audit-reason">${escapeHtml(snapshot.reason)}</p>`
    : ""

  const patternBlock = snapshot.pattern
    ? `<p class="db-preview-audit-pattern"><span class="db-preview-audit-label">Pattern:</span> <code>${escapeHtml(snapshot.pattern)}</code></p>`
    : ""

  const sensitiveBlock =
    snapshot.sensitiveFields.length > 0
      ? `<section class="db-preview-audit-section">
          <h3 class="db-preview-audit-heading">Sensitive fields detected (${snapshot.sensitiveFields.length})</h3>
          <ul class="db-preview-audit-list">
            ${snapshot.sensitiveFields
              .slice(0, 20)
              .map(
                (f) =>
                  `<li class="db-preview-audit-item"><code>${escapeHtml(f)}</code></li>`,
              )
              .join("")}
          </ul>
        </section>`
      : `<section class="db-preview-audit-section db-preview-audit-section--empty">
          <h3 class="db-preview-audit-heading">Sensitive fields detected</h3>
          <p class="db-preview-audit-empty">No CR-3 sensitive keywords found in this run.</p>
        </section>`

  const callsBlock =
    snapshot.auditCalls.length > 0
      ? `<section class="db-preview-audit-section">
          <h3 class="db-preview-audit-heading">Audit log calls found (${snapshot.auditCalls.length})</h3>
          <ul class="db-preview-audit-list">
            ${snapshot.auditCalls
              .slice(0, 20)
              .map(
                (c) =>
                  `<li class="db-preview-audit-item"><code>${escapeHtml(c)}</code></li>`,
              )
              .join("")}
          </ul>
        </section>`
      : `<section class="db-preview-audit-section db-preview-audit-section--empty">
          <h3 class="db-preview-audit-heading">Audit log calls found</h3>
          <p class="db-preview-audit-empty">No audit-log call (auditLog.create / writeAuditLog / logAudit) referenced in the generated output.</p>
        </section>`

  const validatorBlock =
    snapshot.validatorChecks.length > 0
      ? `<section class="db-preview-audit-section">
          <h3 class="db-preview-audit-heading">Validator outcome</h3>
          <ul class="db-preview-audit-list">
            ${snapshot.validatorChecks
              .slice(0, 20)
              .map(
                (c) =>
                  `<li class="db-preview-audit-item db-preview-audit-item--check">
                    <span class="db-preview-audit-rule">${escapeHtml(c.ruleId)}</span>
                    <span class="db-preview-audit-check-status db-preview-audit-check-status--${escapeHtml(c.status)}">${escapeHtml(c.status.toUpperCase())}</span>
                    ${c.message ? `<span class="db-preview-audit-check-msg">${escapeHtml(c.message)}</span>` : ""}
                  </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : ""

  return `<div
    role="tabpanel"
    id="db-preview-panel-audit"
    class="db-preview-tabpanel db-preview-tabpanel--audit"
    aria-labelledby="db-preview-tab-audit"${hidden}>
    <div class="db-preview-audit" data-audit-snapshot>
      <header class="db-preview-audit-header">
        <h2 class="db-preview-audit-title">Audit Trail Compliance (CR-3)</h2>
        ${statusBadge(snapshot.status)}
      </header>
      ${reasonBlock}
      ${patternBlock}
      ${sensitiveBlock}
      ${callsBlock}
      ${validatorBlock}
    </div>
  </div>`
}

// ---------------------------------------------------------------------------
// Tier 2 #4c — Files tab renderer
// ---------------------------------------------------------------------------

const FILE_TYPE_ICON: Record<string, string> = {
  tsx: "⚛",
  ts: "T",
  jsx: "⚛",
  js: "J",
  json: "{}",
  md: "M",
  css: "C",
  html: "H",
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function renderFilesTab(
  snapshot: FileSnapshotEntry[] | null | undefined,
  active: boolean,
): string {
  const hidden = active ? "" : ' hidden=""'
  if (!snapshot || snapshot.length === 0) {
    return renderPlaceholderTab(
      "files",
      "Files",
      "Generated files in this run with size + path metadata.",
      active,
    )
  }
  // Pre-sort: directory-prefixed paths first (when path contains "/"), then
  // alphabetical. The caller already sorts but we guard for double-safety.
  const sorted = snapshot.slice().sort((a, b) => {
    const aHasDir = a.path.includes("/")
    const bHasDir = b.path.includes("/")
    if (aHasDir !== bHasDir) return aHasDir ? -1 : 1
    return a.path.localeCompare(b.path)
  })
  const totalSize = sorted.reduce((sum, f) => sum + f.size, 0)
  return `<div
    role="tabpanel"
    id="db-preview-panel-files"
    class="db-preview-tabpanel db-preview-tabpanel--files"
    aria-labelledby="db-preview-tab-files"${hidden}>
    <div class="db-preview-files" data-files-snapshot>
      <header class="db-preview-files-header">
        <h2 class="db-preview-files-title">Generated Files</h2>
        <p class="db-preview-files-meta">${sorted.length} file${sorted.length === 1 ? "" : "s"} · ${escapeHtml(formatSize(totalSize))}</p>
      </header>
      <ul class="db-preview-files-list">
        ${sorted
          .map((f) => {
            const icon = FILE_TYPE_ICON[f.type] ?? "·"
            return `<li class="db-preview-files-item" data-file-path="${escapeHtml(f.path)}" data-file-type="${escapeHtml(f.type)}">
              <span class="db-preview-files-icon" aria-hidden="true">${escapeHtml(icon)}</span>
              <button
                type="button"
                class="db-preview-files-link"
                data-files-open="${escapeHtml(f.path)}"
                aria-label="Open ${escapeHtml(f.path)} in component preview"
              >${escapeHtml(f.path)}</button>
              <span class="db-preview-files-size">${escapeHtml(formatSize(f.size))}</span>
            </li>`
          })
          .join("")}
      </ul>
    </div>
  </div>`
}

// ---------------------------------------------------------------------------
// Tier 2 #7 — Validation panel (rendered above the diff tabpanel body)
// ---------------------------------------------------------------------------

function renderValidationPanel(
  snapshot: ValidationSnapshot | null | undefined,
): string {
  if (!snapshot) return ""
  const statusClass = snapshot.passed
    ? "db-preview-validation--pass"
    : "db-preview-validation--fail"
  const statusLabel = snapshot.passed ? "Passed" : "Failed"
  const rulesList =
    snapshot.rulesHit.length > 0
      ? `<ul class="db-preview-validation-rules">
          ${snapshot.rulesHit
            .slice(0, 10)
            .map(
              (r) =>
                `<li class="db-preview-validation-rule">
                  <code>${escapeHtml(r.ruleId)}</code>
                  <span class="db-preview-validation-rule-count">${r.count}×</span>
                </li>`,
            )
            .join("")}
        </ul>`
      : ""
  const findingsList =
    snapshot.findings.length > 0
      ? `<ul class="db-preview-validation-findings">
          ${snapshot.findings
            .slice(0, 20)
            .map(
              (f) =>
                `<li class="db-preview-validation-finding db-preview-validation-finding--${escapeHtml(f.severity)}">
                  <span class="db-preview-validation-severity">${escapeHtml(f.severity)}</span>
                  <code class="db-preview-validation-rule">${escapeHtml(f.ruleId)}</code>
                  <span class="db-preview-validation-msg">${escapeHtml(f.message)}</span>
                  ${f.file ? `<span class="db-preview-validation-file">${escapeHtml(f.file)}</span>` : ""}
                </li>`,
            )
            .join("")}
        </ul>`
      : `<p class="db-preview-validation-empty">No findings — all gates clean.</p>`
  const warningsList =
    snapshot.warnings.length > 0
      ? `<details class="db-preview-validation-warnings">
          <summary>${snapshot.warnings.length} warning${snapshot.warnings.length === 1 ? "" : "s"}</summary>
          <ul>
            ${snapshot.warnings
              .slice(0, 20)
              .map((w) => `<li>${escapeHtml(w)}</li>`)
              .join("")}
          </ul>
        </details>`
      : ""
  return `<section class="db-preview-validation ${statusClass}" data-validation-snapshot aria-label="Validation outcome">
    <header class="db-preview-validation-header">
      <span class="db-preview-validation-status">${escapeHtml(statusLabel)}</span>
      <span class="db-preview-validation-score">Score: ${snapshot.score}/100</span>
      <span class="db-preview-validation-counts">
        <span class="db-preview-validation-count db-preview-validation-count--high">${snapshot.counts.high} high</span>
        <span class="db-preview-validation-count db-preview-validation-count--medium">${snapshot.counts.medium} medium</span>
        <span class="db-preview-validation-count db-preview-validation-count--low">${snapshot.counts.low} low</span>
      </span>
    </header>
    ${rulesList}
    ${findingsList}
    ${warningsList}
  </section>`
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
      ${renderDiffTab(opts.diffSnapshot ?? null, opts.validationSnapshot ?? null, active === "diff")}
      ${renderBeImpactTab(opts.beImpactSnapshot ?? null, active === "be-impact")}
      ${renderAuditTab(opts.auditSnapshot ?? null, active === "audit")}
      ${renderFilesTab(opts.filesSnapshot ?? null, active === "files")}
    </div>
    ${renderContextMap(opts.context)}
  </section>`
}
