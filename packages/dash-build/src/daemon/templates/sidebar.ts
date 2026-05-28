/**
 * Lovable-style left sidebar for the Dash Build home + workspace shells.
 *
 * Plain-string templating to stay aligned with the rest of the daemon UI
 * (no React, no JSX). Consumes Dash Foundation Layer 0 tokens via the
 * existing `--bg-*`, `--text-*`, `--primary-*` aliases mapped in the
 * dashboard CSS bundle.
 *
 * The sidebar shows:
 *   - Brand mark at the top
 *   - Primary nav (Home / Search / Resources / Connectors)
 *   - Projects shortcuts (All / Starred / Created by me / Shared)
 *   - Recents — up to 8 of the user's latest projects from the store
 *   - Footer: "+ New Project" button and a small upgrade card
 *
 * Selectors use the `db-sidebar-*` BEM prefix.
 */

import { escapeHtml } from "./layout.js"
import type { Project } from "../state/types.js"

export interface SidebarRecent {
  /** Project id. */
  id: string
  /** Display label — usually the project name. */
  label: string
  /** Optional href; defaults to `/workspace/{id}`. */
  href?: string
  /** Optional sub-label (theme, repo, etc.). */
  hint?: string
}

export type SidebarSection =
  | "home"
  | "search"
  | "resources"
  | "connectors"
  | "projects-all"
  | "projects-starred"
  | "projects-mine"
  | "projects-shared"
  | null

export interface SidebarOptions {
  /** Which nav row should render with the active treatment. */
  active?: SidebarSection
  /** Recent projects (already trimmed by the caller). */
  recents?: SidebarRecent[]
  /** When true, marks the sidebar collapsed for narrow viewports. */
  collapsed?: boolean
}

interface NavItem {
  id: Exclude<SidebarSection, null>
  label: string
  icon: string
  href: string
}

const PRIMARY_NAV: NavItem[] = [
  { id: "home", label: "Home", icon: "⌂", href: "/" },
  { id: "search", label: "Search", icon: "🔍", href: "/?nav=search" },
  { id: "resources", label: "Resources", icon: "◇", href: "/?nav=resources" },
  { id: "connectors", label: "Connectors", icon: "🔗", href: "/?nav=connectors" },
]

const PROJECT_NAV: NavItem[] = [
  { id: "projects-all", label: "All projects", icon: "▦", href: "/?projects=all" },
  { id: "projects-starred", label: "Starred", icon: "★", href: "/?projects=starred" },
  { id: "projects-mine", label: "Created by me", icon: "◇", href: "/?projects=mine" },
  { id: "projects-shared", label: "Shared with me", icon: "⇄", href: "/?projects=shared" },
]

function renderNavList(
  items: NavItem[],
  active: SidebarSection | undefined,
  groupLabel?: string,
): string {
  const heading = groupLabel
    ? `<div class="db-sidebar-section-label">${escapeHtml(groupLabel)}</div>`
    : ""
  const rows = items
    .map((item) => {
      const isActive = active === item.id
      const cls = isActive
        ? "db-sidebar-nav-item db-sidebar-nav-item--active"
        : "db-sidebar-nav-item"
      const aria = isActive ? ' aria-current="page"' : ""
      return `<a class="${cls}" href="${escapeHtml(item.href)}"${aria}>
        <span class="db-sidebar-nav-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span class="db-sidebar-nav-label">${escapeHtml(item.label)}</span>
      </a>`
    })
    .join("")
  return `<nav class="db-sidebar-section">${heading}${rows}</nav>`
}

function renderRecents(recents: SidebarRecent[]): string {
  if (recents.length === 0) {
    return `<div class="db-sidebar-section">
      <div class="db-sidebar-section-label">Recents</div>
      <p class="db-sidebar-empty">No recent projects yet.</p>
    </div>`
  }
  const rows = recents
    .map((r) => {
      const href = r.href ?? `/workspace/${encodeURIComponent(r.id)}`
      const hint = r.hint
        ? `<span class="db-sidebar-recent-hint">${escapeHtml(r.hint)}</span>`
        : ""
      return `<a class="db-sidebar-recent" href="${escapeHtml(href)}" data-recent-id="${escapeHtml(r.id)}">
        <span class="db-sidebar-recent-dot" aria-hidden="true"></span>
        <span class="db-sidebar-recent-text">
          <span class="db-sidebar-recent-label">${escapeHtml(r.label)}</span>
          ${hint}
        </span>
      </a>`
    })
    .join("")
  return `<nav class="db-sidebar-section">
    <div class="db-sidebar-section-label">Recents</div>
    ${rows}
  </nav>`
}

export function renderSidebar(opts: SidebarOptions = {}): string {
  const collapsed = opts.collapsed === true
  const active = opts.active ?? null
  const recents = opts.recents ?? []

  const collapsedAttr = collapsed ? ' data-collapsed="true"' : ""

  return `<aside class="db-sidebar" id="db-sidebar" aria-label="Project navigation"${collapsedAttr}>
    <header class="db-sidebar-brand">
      <a class="db-sidebar-brand-link" href="/" aria-label="Dash Build home">
        <span class="db-sidebar-brand-mark" aria-hidden="true"></span>
        <span class="db-sidebar-brand-name">Dash Build</span>
      </a>
      <button
        type="button"
        class="db-sidebar-collapse"
        data-sidebar-toggle
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <span aria-hidden="true">‹</span>
      </button>
    </header>

    ${renderNavList(PRIMARY_NAV, active)}

    <div class="db-sidebar-divider" role="presentation"></div>

    ${renderNavList(PROJECT_NAV, active, "Projects")}

    <div class="db-sidebar-divider" role="presentation"></div>

    ${renderRecents(recents)}

    <footer class="db-sidebar-footer">
      <button
        type="button"
        class="db-sidebar-new-btn"
        data-new-project
        aria-label="Start a new project"
      >
        <span class="db-sidebar-new-icon" aria-hidden="true">+</span>
        <span class="db-sidebar-new-label">New Project</span>
      </button>
      <a class="db-sidebar-upgrade" href="/?upgrade=plan">
        <span class="db-sidebar-upgrade-title">Upgrade</span>
        <span class="db-sidebar-upgrade-sub">Unlock private workspaces</span>
      </a>
    </footer>
  </aside>`
}

/**
 * Helper for turning Project records into sidebar recents. Kept here so
 * callers don't duplicate the field mapping.
 */
export function projectsToRecents(
  projects: Project[],
  limit = 8,
): SidebarRecent[] {
  return projects.slice(0, limit).map((p) => ({
    id: p.id,
    label: p.name,
    hint: p.theme || (p.repoFullName ?? undefined),
  }))
}
