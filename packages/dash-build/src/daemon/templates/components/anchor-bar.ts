import { escapeHtml } from "../layout.js"
import type { Project, Thread } from "../../state/types.js"

/**
 * Anchor bar — top of the canvas-first workspace.
 *
 * Layout:
 *   [project pill] [thread chip] [run tag] [target route badge]
 *                                                  [repo · branch · commit]
 *
 * P1.2A scope: read-only chrome. Re-uses chip styles from the P1.1A status
 * bar. No "Open repo" link, no history drawer trigger, no commit hash read
 * (placeholder `—`). Those land in later slices.
 */

export interface AnchorBarOptions {
  project: Project | null
  thread: Thread | null
  runSeq: number | null
  targetRoute: string | null
  targetNavLabel: string | null
  repo: string | null
  branch: string | null
  /** Optional short commit hash. Pass `null` to render placeholder `—`. */
  commit: string | null
}

function chip(content: string, className = ""): string {
  return `<span class="db-anchor-meta-chip${className ? " " + className : ""}">${content}</span>`
}

export function renderAnchorBar(opts: AnchorBarOptions): string {
  const project = opts.project
  const thread = opts.thread

  const projectPill = project
    ? `<span class="db-project-pill" title="Project ${escapeHtml(project.id)}">
        <span class="db-project-pill-dot" aria-hidden="true"></span>
        <span class="db-project-pill-name">${escapeHtml(project.name)}</span>
        <span class="db-project-pill-theme">${escapeHtml(project.theme)}</span>
      </span>`
    : `<span class="db-project-pill db-project-pill--empty">No project</span>`

  const threadChip = thread
    ? `<span class="db-thread-chip" title="Thread ${escapeHtml(thread.id)}">
        <span class="db-thread-chip-label">Thread</span>
        <span class="db-thread-chip-title">${escapeHtml(thread.title)}</span>
      </span>`
    : ""

  const runTag =
    opts.runSeq != null
      ? `<span class="db-run-tag">Run #${opts.runSeq}</span>`
      : ""

  const routeBadge = opts.targetRoute
    ? `<span class="db-anchor-route" title="Target route">
        <span class="db-anchor-route-label">Route</span>
        <code class="db-anchor-route-code">${escapeHtml(opts.targetRoute)}</code>
        ${opts.targetNavLabel ? `<span class="db-anchor-route-nav">via ${escapeHtml(opts.targetNavLabel)}</span>` : ""}
      </span>`
    : `<span class="db-anchor-route db-anchor-route--empty">No target route</span>`

  const repoMeta = [
    opts.repo ? chip(escapeHtml(opts.repo), "db-anchor-meta-chip--repo") : "",
    opts.branch ? chip(escapeHtml(opts.branch), "db-anchor-meta-chip--branch") : "",
    chip(escapeHtml(opts.commit ?? "—"), "db-anchor-meta-chip--commit"),
  ]
    .filter(Boolean)
    .join("")

  return `<header class="db-anchor-bar" aria-label="Workspace anchor">
    <div class="db-anchor-context">
      ${projectPill}
      ${threadChip}
      ${runTag}
    </div>
    <div class="db-anchor-target">
      ${routeBadge}
    </div>
    <div class="db-anchor-meta">
      ${repoMeta}
    </div>
  </header>`
}
