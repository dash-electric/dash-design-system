/**
 * Lovable-style chat workspace — the post-prompt surface where the user
 * iterates with the builder.
 *
 * Composition:
 *   - Optional Lovable sidebar (collapsed by default to maximise canvas)
 *   - Compact top bar: project breadcrumb + share/run actions
 *   - 2-pane split:
 *       Left  → chat thread (`renderChatThread`) + composer (`renderPromptInput`)
 *       Right → tab strip (Component / Diff / BE Impact / Audit / Files) +
 *               preview mount placeholder (Agent B mounts the live preview here)
 *
 * Selectors use the `db-workspace-*` BEM prefix. The preview placeholder is
 * `<section id="db-preview-mount">` with `data-component-id` ready for the
 * preview backend to populate.
 */

import type { Store } from "../state/store.js"
import { isRealProject } from "../state/store.js"
import type { Project, Thread } from "../state/types.js"
import { escapeHtml, renderLayout } from "./layout.js"
import { renderSidebar, projectsToRecents } from "./sidebar.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { icon } from "./components/icon.js"
import { renderChatThread, type ChatMessage } from "./components/chat-thread.js"
import { promptToChatMessages } from "./dashboard.js"
import { renderPreviewPanel } from "./components/preview-panel.js"
import {
  renderInitialPreviewScript,
  type PreviewInitialBlob,
} from "../preview-initial.js"
import { buildSurfaceDocsUrl } from "../../constants/docs.js"

export interface WorkspaceOptions {
  /** Active run id (matches a PromptRecord). Optional — null = empty state. */
  runId?: string | null
  /** Explicit project override; otherwise resolved from the active workspace. */
  projectId?: string | null
  /** Optional surface badge ("backoffice", "portal-v2", …). */
  surface?: string | null
  /**
   * Cold-load Sandpack hydration. When set, the rendered HTML embeds a
   * `<script>window.__DASH_PREVIEW_INIT = …</script>` tag the client-side
   * `preview-mount.js` reads before subscribing to SSE. The route handler
   * fills this in via `loadInitialPreview(runId)`.
   */
  initialPreview?: PreviewInitialBlob | null
}

interface WorkspaceTab {
  id: string
  label: string
  count?: number
}

const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: "component", label: "Component" },
  { id: "diff", label: "Diff" },
  { id: "be-impact", label: "BE Impact" },
  { id: "audit", label: "Audit" },
  { id: "files", label: "Files" },
]

function pickProject(
  store: Store,
  projectId: string | null | undefined,
): Project | null {
  const projects = store.getProjects()
  if (projectId) {
    return projects.find((p) => p.id === projectId) ?? null
  }
  const workspace = store.getWorkspace()
  if (workspace.activeRepo) {
    return (
      projects.find(
        (p) => (p.repoFullName ?? "") === workspace.activeRepo,
      ) ?? null
    )
  }
  // P21 (2026-05-29) — empty /workspace/ fallback. Bare prompts auto-create a
  // repo-less "Unassigned" phantom project (see store.isRealProject). Returning
  // projects[0] blindly surfaced that phantom as the workspace project, so an
  // empty workspace showed a ghost "Unassigned" card the user never made.
  // Filter the fallback to real (repo-backed) projects; when none exist we
  // return null so renderWorkspace falls through to the clean empty/new state.
  return projects.find(isRealProject) ?? null
}

function pickThread(store: Store, project: Project | null): Thread | null {
  if (!project) return null
  return store.getThreads(project.id)[0] ?? null
}

/**
 * Bug 1+2 (2026-05-29) — resolve the Project that owns a given runId. The run
 * id equals the PromptRecord id (store re-uses it as the run id), and each Run
 * carries its `projectId`. Returns null when the run isn't found so the caller
 * falls back to the legacy active-repo / first-project pick.
 */
function resolveProjectForRun(store: Store, runId: string): Project | null {
  const run = store.getRun(runId)
  if (!run) return null
  return store.getProject(run.projectId)
}

/**
 * Collect up to 3 most-recent prompts for the project's threads, sorted by
 * `updatedAt` desc. Used to seed the chat empty-state quick-replay chips so
 * the user can re-run a previous prompt with one click instead of retyping.
 */
function pickQuickReplay(
  store: Store,
  project: Project | null,
  limit = 3,
): Array<{ id: string; text: string }> {
  if (!project) return []
  const threads = store.getThreads(project.id)
  if (threads.length === 0) return []
  const runs = threads.flatMap((t) => store.getRuns(t.id))
  if (runs.length === 0) return []
  // Sort by updatedAt desc — newest prompt first. Filter out blanks/dedupe
  // exact-string repeats so the chip strip stays useful (instead of 3 chips
  // of the same prompt).
  const sorted = runs
    .slice()
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
  const seen = new Set<string>()
  const picked: Array<{ id: string; text: string }> = []
  for (const run of sorted) {
    const text = (run.prompt ?? "").trim()
    if (!text) continue
    if (seen.has(text)) continue
    seen.add(text)
    picked.push({ id: run.id, text })
    if (picked.length >= limit) break
  }
  return picked
}

function renderTabs(active: string): string {
  return WORKSPACE_TABS.map((tab) => {
    const isActive = tab.id === active
    const cls = isActive
      ? "db-workspace-tab db-workspace-tab--active"
      : "db-workspace-tab"
    const count =
      typeof tab.count === "number" && tab.count > 0
        ? `<span class="db-workspace-tab-count">${tab.count}</span>`
        : ""
    return `<button
      type="button"
      class="${cls}"
      role="tab"
      aria-selected="${isActive ? "true" : "false"}"
      data-workspace-tab="${escapeHtml(tab.id)}"
    >
      <span class="db-workspace-tab-label">${escapeHtml(tab.label)}</span>
      ${count}
    </button>`
  }).join("")
}

export function renderWorkspace(
  store: Store,
  opts: WorkspaceOptions = {},
): string {
  // Bug 1+2 (2026-05-29) — resolve the active prompt for this runId FIRST so we
  // can (a) anchor the project/thread to the run the user just submitted and
  // (b) seed the chat thread with the submitted prompt bubble + its in-flight
  // builder state. Previously the workspace mounted with `messages: []` and
  // relied on an SSE prompts:changed event firing AFTER the page loaded to
  // populate chat via refreshDashboard — but the event commonly fired during
  // the home→workspace navigation gap and was missed, leaving the user staring
  // at the empty composer ("What do you want to build today?") and forcing a
  // re-type. Server-rendering the bubble closes that gap.
  const activePrompt = opts.runId ? store.getPrompt(opts.runId) : null
  const runProject =
    activePrompt && opts.runId
      ? resolveProjectForRun(store, opts.runId)
      : null

  const project = runProject ?? pickProject(store, opts.projectId ?? null)
  const thread = pickThread(store, project)
  const recents = projectsToRecents(store.getProjects(), 8)

  const projectName = project?.name ?? "Untitled workspace"
  const surface =
    opts.surface ?? project?.theme ?? project?.repoFullName ?? "shared"
  const threadTitle = thread?.title ?? "New thread"

  const sidebar = renderSidebar({
    active: null,
    recents,
    collapsed: true,
    docsSurface: opts.surface ?? project?.theme ?? null,
  })

  // Map run id. If a cold-load preview blob came back from disk, prefer its
  // canonical id — the URL may carry a truncated badge id (e.g. `prm_20cb`)
  // while disk holds the full slice (`prm_20cb094a-ac2`). Using the blob's
  // id keeps DOM data-component-id and __DASH_PREVIEW_INIT.componentId in
  // sync so preview-mount.js mounts on first paint.
  const initialBlob = opts.initialPreview ?? null
  const componentId = initialBlob?.componentId ?? opts.runId ?? ""

  // Component preview chrome — 5 tabpanels (Component live, Diff/BE/Audit/Files
  // placeholder), Sandpack mount inside Component tabpanel, context-map footer.
  // The tab strip lives on the workspace shell below, not on the panel itself
  // (see preview-panel.ts header note). Sandpack auto-bootstraps via
  // /static/preview-mount.js (loaded from layout).
  // Open WebUI #A4 — derive split-view metadata from the cold-load blob.
  // When variantsSnapshot is present and has >=2 entries, the preview panel
  // renders two Sandpack mounts side-by-side; otherwise the single-mount
  // path stays in place (default behaviour).
  const variantsState =
    initialBlob &&
    initialBlob.variantsSnapshot &&
    initialBlob.variantsSnapshot.list.length >= 2
      ? {
          active: initialBlob.variantsSnapshot.active,
          list: initialBlob.variantsSnapshot.list.map((v) => ({
            id: v.id,
            summary: v.summary,
            score: v.score,
            passed: v.passed,
            fileCount: v.fileCount,
            componentPath: v.componentPath,
            temperature: v.temperature,
          })),
        }
      : null

  const previewPanel = renderPreviewPanel({
    componentId,
    promptId: opts.runId ?? null,
    activeTab: "component",
    context: initialBlob ? initialBlob.contextMap : undefined,
    diffSnapshot: initialBlob ? initialBlob.diffSnapshot ?? null : null,
    beImpactSnapshot: initialBlob ? initialBlob.beImpactSnapshot ?? null : null,
    auditSnapshot: initialBlob ? initialBlob.auditSnapshot ?? null : null,
    filesSnapshot: initialBlob ? initialBlob.filesSnapshot ?? null : null,
    validationSnapshot: initialBlob
      ? initialBlob.validationSnapshot ?? null
      : null,
    variants: variantsState,
  })
  const initialPreviewScript = renderInitialPreviewScript(initialBlob)

  // Bug 1+2 (2026-05-29) — seed the chat with the active run's prompt bubble +
  // in-flight builder state so the workspace mounts already showing what the
  // user submitted (instead of the empty "What do you want to build today?"
  // state). Artifact-derived action streams aren't available here (no
  // orchestrator in the render path) so awaiting_approval falls back to the
  // plain "Done. Review the preview." body — the client's refreshDashboard()
  // upgrades it to the full action stream once SSE fires. The important fix is
  // that the bubble + generating spinner are present on first paint.
  const seededMessages: ChatMessage[] = activePrompt
    ? promptToChatMessages(activePrompt)
    : []
  const chatThread = renderChatThread({
    messages: seededMessages,
    emptyHint:
      "Describe the change you want to make. Dash Build keeps the thread anchored to this workspace.",
    quickReplay: pickQuickReplay(store, project, 3),
  })

  const composer = `<div class="db-workspace-composer">
    <div class="db-workspace-composer-input">${renderPromptInput({
      hideFooter: true,
      placeholder: "Iterate on this workspace… (⌘↵ to send, / to focus)",
    })}</div>
    <div class="db-workspace-composer-actions">
      <button
        type="button"
        class="db-button db-button-ghost db-button-compact"
        data-workspace-action="reset"
      >Reset</button>
      <button
        id="db-prompt-submit"
        type="button"
        class="db-button db-button-primary"
        aria-label="Send prompt to builder"
      >
        <span class="db-button-label">Build</span>
        <span class="db-button-arrow">${icon("arrow-up", { size: "sm" })}</span>
      </button>
    </div>
  </div>`

  // Tier 6 — Surface 1 Docs integration. The crumb surface badge is now a
  // direct link to the Dash DS docs surface page so any team member can
  // pivot from the workspace to the canonical pattern + voice guidance for
  // the surface in one click. Builds via `buildSurfaceDocsUrl()` so the
  // hostname is controlled by `DASH_DOCS_URL` env.
  const surfaceDocsUrl = buildSurfaceDocsUrl(surface)
  // Tier 6 — Export PPT button + Layer 2 theme picker live in the topbar
  // actions strip. The button enables when a `runId` is present (cold-load
  // or post-prompt) — empty workspaces have nothing to export so the button
  // renders disabled. The theme picker hits `/api/themes` on first open and
  // `/api/themes/:name/css` when the selection changes; the client-side
  // handler injects the CSS as a `<link>` overlay so accent tokens swap at
  // runtime without a reload.
  const runId = opts.runId ?? ""
  const exportDisabled = runId.length === 0
  const exportHref = exportDisabled
    ? "#"
    : `/api/runs/${encodeURIComponent(runId)}/export/pptx`
  const body = `<section class="db-workspace-shell" data-shell="lovable">
    ${sidebar}
    <section class="db-workspace-main" aria-label="Workspace">
      <header class="db-workspace-topbar">
        <div class="db-workspace-crumb">
          <a class="db-workspace-crumb-back" href="/" aria-label="Back to home">←</a>
          <span class="db-workspace-crumb-project">${escapeHtml(projectName)}</span>
          <span class="db-workspace-crumb-divider" aria-hidden="true">·</span>
          <a
            class="db-workspace-crumb-surface"
            href="${escapeHtml(surfaceDocsUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            data-workspace-surface-docs
            data-surface="${escapeHtml(surface)}"
            title="Open Dash DS docs for this surface"
          >${escapeHtml(surface)}</a>
          <span class="db-workspace-crumb-divider" aria-hidden="true">·</span>
          <span class="db-workspace-crumb-thread">${escapeHtml(threadTitle)}</span>
        </div>
        <div class="db-workspace-topbar-actions">
          <div
            class="db-workspace-theme-picker"
            data-workspace-theme-picker
            data-current-theme="${escapeHtml(surface)}"
          >
            <label class="db-workspace-theme-picker-label" for="db-workspace-theme">
              <span class="db-workspace-theme-picker-dot" aria-hidden="true"></span>
              <span class="db-workspace-theme-picker-text">Theme</span>
            </label>
            <select
              id="db-workspace-theme"
              class="db-workspace-theme-picker-select"
              data-workspace-theme-select
              aria-label="Layer 2 theme override"
            >
              <option value="">Default (project)</option>
            </select>
          </div>
          <a
            class="db-button db-button-ghost db-button-compact"
            href="${escapeHtml(exportHref)}"
            data-workspace-action="export-pptx"
            data-export-disabled="${exportDisabled ? "true" : "false"}"
            data-run-id="${escapeHtml(runId)}"
            aria-label="Export deck for this run"
            ${exportDisabled ? 'aria-disabled="true" tabindex="-1"' : 'download="dash-build-deck.html"'}
          >
            ${icon("upload", { size: "sm" })}
            <span>Export PPT</span>
          </a>
          <button
            type="button"
            class="db-button db-button-ghost db-button-compact"
            data-workspace-action="share"
          >
            ${icon("share", { size: "sm" })}
            <span>Share</span>
          </button>
          <button
            type="button"
            class="db-button db-button-primary db-button-compact"
            data-workspace-action="run"
            aria-label="Run latest build"
          >
            ${icon("run", { size: "sm" })}
            <span>Run</span>
          </button>
        </div>
      </header>

      <div class="db-workspace-split" id="db-workspace-split">
        <aside class="db-workspace-chat" aria-label="Conversation">
          <div class="db-workspace-chat-scroll" id="db-chat-scroll">
            ${chatThread}
            <!-- Clarification mount. When the active run is clarifying, the
                 client's hydrateInlineClarifications() fetches the questions
                 and renders the inline form here. Workspace previously lacked
                 this slot, so the "answer the questions below" message had
                 no card to populate → questions never appeared. (Copy was
                 reworded from "card on the right" in P23 since this layout
                 renders the clarify card in the LEFT chat column.) -->
            <div
              class="db-workspace-clarify"
              data-clarify-mount="${escapeHtml(runId)}"
              data-clarify-active="${runId ? "true" : "false"}"
            ></div>
          </div>
          ${composer}
        </aside>
        <main class="db-workspace-canvas" aria-label="Generated output">
          <nav class="db-workspace-tabs" role="tablist" aria-label="Output view">
            ${renderTabs("component")}
          </nav>
          <div class="db-workspace-canvas-body" data-workspace-active-tab="component">
            ${previewPanel}
          </div>
        </main>
      </div>
    </section>
    ${initialPreviewScript}
  </section>`

  return renderLayout({
    title: projectName,
    body,
    authIndicator: "ok",
    version: store.getVersion(),
    shell: "lovable",
    chromeless: true,
  })
}
