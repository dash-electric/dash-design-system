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
import type { Project, Thread } from "../state/types.js"
import { escapeHtml, renderLayout } from "./layout.js"
import { renderSidebar, projectsToRecents } from "./sidebar.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { renderChatThread } from "./components/chat-thread.js"
import { renderPreviewPanel } from "./components/preview-panel.js"
import {
  renderInitialPreviewScript,
  type PreviewInitialBlob,
} from "../preview-initial.js"

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
  return projects[0] ?? null
}

function pickThread(store: Store, project: Project | null): Thread | null {
  if (!project) return null
  return store.getThreads(project.id)[0] ?? null
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
  const project = pickProject(store, opts.projectId ?? null)
  const thread = pickThread(store, project)
  const recents = projectsToRecents(store.getProjects(), 8)

  const projectName = project?.name ?? "Untitled workspace"
  const surface =
    opts.surface ?? project?.theme ?? project?.repoFullName ?? "shared"
  const threadTitle = thread?.title ?? "New thread"

  const sidebar = renderSidebar({ active: null, recents, collapsed: true })

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
  const previewPanel = renderPreviewPanel({
    componentId,
    promptId: opts.runId ?? null,
    activeTab: "component",
    context: initialBlob ? initialBlob.contextMap : undefined,
    diffSnapshot: initialBlob ? initialBlob.diffSnapshot ?? null : null,
  })
  const initialPreviewScript = renderInitialPreviewScript(initialBlob)

  const chatThread = renderChatThread({
    messages: [],
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
        <span class="db-button-arrow" aria-hidden="true">↑</span>
      </button>
    </div>
  </div>`

  const body = `<section class="db-workspace-shell" data-shell="lovable">
    ${sidebar}
    <section class="db-workspace-main" aria-label="Workspace">
      <header class="db-workspace-topbar">
        <div class="db-workspace-crumb">
          <a class="db-workspace-crumb-back" href="/" aria-label="Back to home">←</a>
          <span class="db-workspace-crumb-project">${escapeHtml(projectName)}</span>
          <span class="db-workspace-crumb-divider" aria-hidden="true">·</span>
          <span class="db-workspace-crumb-surface">${escapeHtml(surface)}</span>
          <span class="db-workspace-crumb-divider" aria-hidden="true">·</span>
          <span class="db-workspace-crumb-thread">${escapeHtml(threadTitle)}</span>
        </div>
        <div class="db-workspace-topbar-actions">
          <button
            type="button"
            class="db-button db-button-ghost db-button-compact"
            data-workspace-action="share"
          >
            <span aria-hidden="true">↑</span>
            <span>Share</span>
          </button>
          <button
            type="button"
            class="db-button db-button-primary db-button-compact"
            data-workspace-action="run"
            aria-label="Run latest build"
          >
            <span aria-hidden="true">⚡</span>
            <span>Run</span>
          </button>
        </div>
      </header>

      <div class="db-workspace-split" id="db-workspace-split">
        <aside class="db-workspace-chat" aria-label="Conversation">
          <div class="db-workspace-chat-scroll" id="db-chat-scroll">
            ${chatThread}
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
