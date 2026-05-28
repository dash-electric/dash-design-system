/**
 * Lovable-style home — the "what do you want to build?" landing page that
 * sits in front of the chat workspace.
 *
 * Composition:
 *   - Left: Lovable sidebar (`renderSidebar`)
 *   - Right main: connector hint + centered greeting + prompt box + tabs
 *     (My projects / Recently viewed / Templates) + card grid
 *
 * Selectors use the `db-home-*` BEM prefix.
 */

import type { Store } from "../state/store.js"
import type { Project } from "../state/types.js"
import { escapeHtml, renderLayout } from "./layout.js"
import { renderSidebar, projectsToRecents } from "./sidebar.js"
import { renderPromptInput } from "./components/prompt-input.js"

export interface HomeOptions {
  /** Display name for the greeting. Falls back to a friendly default. */
  userName?: string | null
  /** Optional connector banner text. */
  connectorHint?: string
}

interface TemplateCard {
  id: string
  title: string
  hint: string
  tag: string
}

const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: "tpl-payroll",
    title: "Payroll dashboard",
    hint: "Group payouts by mitra level with CSV export.",
    tag: "Backoffice",
  },
  {
    id: "tpl-onboarding",
    title: "Mitra onboarding flow",
    hint: "Multi-step KYC form with audit trail.",
    tag: "Portal",
  },
  {
    id: "tpl-dispatch",
    title: "Dispatch board",
    hint: "Realtime queue with drag-to-assign.",
    tag: "Operations",
  },
  {
    id: "tpl-finance",
    title: "Finance reconciliation",
    hint: "Match settlements against bank ledger.",
    tag: "Finance",
  },
  {
    id: "tpl-blank",
    title: "Blank canvas",
    hint: "Start from scratch with a generic component.",
    tag: "Custom",
  },
  {
    id: "tpl-marketing",
    title: "Landing page",
    hint: "Marketing-style hero + CTA + features grid.",
    tag: "Marketing",
  },
]

function renderProjectCard(p: Project): string {
  const subtitle = p.repoFullName ?? "Unassigned"
  const theme = p.theme || "shared"
  const href = `/workspace/${encodeURIComponent(p.id)}`
  return `<a class="db-home-card" href="${escapeHtml(href)}" data-project-id="${escapeHtml(p.id)}">
    <div class="db-home-card-thumb" aria-hidden="true">
      <span class="db-home-card-thumb-dot"></span>
    </div>
    <div class="db-home-card-body">
      <div class="db-home-card-title">${escapeHtml(p.name)}</div>
      <div class="db-home-card-sub">${escapeHtml(subtitle)}</div>
      <div class="db-home-card-meta">
        <span class="db-home-card-chip">${escapeHtml(theme)}</span>
      </div>
    </div>
  </a>`
}

function renderTemplateCard(t: TemplateCard): string {
  return `<button type="button" class="db-home-card db-home-card--template" data-template-id="${escapeHtml(t.id)}">
    <div class="db-home-card-thumb db-home-card-thumb--template" aria-hidden="true"></div>
    <div class="db-home-card-body">
      <div class="db-home-card-title">${escapeHtml(t.title)}</div>
      <div class="db-home-card-sub">${escapeHtml(t.hint)}</div>
      <div class="db-home-card-meta">
        <span class="db-home-card-chip db-home-card-chip--template">${escapeHtml(t.tag)}</span>
      </div>
    </div>
  </button>`
}

function renderEmptyProjects(): string {
  return `<div class="db-home-empty">
    <p class="db-home-empty-title">No projects yet</p>
    <p class="db-home-empty-body">Type a prompt above to spin up your first workspace.</p>
  </div>`
}

export function renderHome(store: Store, opts: HomeOptions = {}): string {
  const projects = store.getProjects()
  const recents = projectsToRecents(projects, 8)
  const userName = (opts.userName ?? "").trim() || "irfan"
  const connectorHint =
    opts.connectorHint ??
    "Connect your repo or pick a template to give Dash Build context."

  const projectGrid =
    projects.length === 0
      ? renderEmptyProjects()
      : `<div class="db-home-card-grid">
          ${projects.slice(0, 6).map(renderProjectCard).join("")}
        </div>`

  // "Recently viewed" mirrors projects for now (real recency tracking is a
  // backlog item — see open TODOs in handover).
  const recentPanel =
    projects.length === 0
      ? renderEmptyProjects()
      : `<div class="db-home-card-grid">
          ${projects.slice(0, 6).map(renderProjectCard).join("")}
        </div>`

  const templatePanel = `<div class="db-home-card-grid">
    ${TEMPLATE_CARDS.map(renderTemplateCard).join("")}
  </div>`

  const sidebar = renderSidebar({ active: "home", recents })

  const body = `<section class="db-home-shell" data-shell="lovable">
    ${sidebar}
    <section class="db-home-main" aria-label="Home">
      <div class="db-home-banner" role="note">
        <span class="db-home-banner-dot" aria-hidden="true"></span>
        <span class="db-home-banner-text">${escapeHtml(connectorHint)}</span>
        <a class="db-home-banner-link" href="/?nav=connectors">Connect</a>
      </div>

      <div class="db-home-hero">
        <h1 class="db-home-greeting">Let's build something, ${escapeHtml(userName)}</h1>
        <p class="db-home-sub">Describe a feature, screen, or workflow. Dash Build evaluates scope, then generates code against your repo.</p>
        <form class="db-home-prompt" id="db-home-prompt-form" autocomplete="off" novalidate>
          ${renderPromptInput({ hideFooter: true, placeholder: "Build a payroll dashboard for backoffice…" })}
          <div class="db-home-prompt-actions">
            <span class="db-home-prompt-hint" aria-hidden="true">⌘↵ to launch workspace</span>
            <button
              type="submit"
              class="db-button db-button-primary db-home-prompt-submit"
              id="db-home-prompt-submit"
              aria-label="Create new workspace from prompt"
            >
              <span class="db-button-label">Start building</span>
              <span class="db-button-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>

      <section class="db-home-projects" aria-label="Your projects">
        <header class="db-home-projects-head">
          <nav class="db-home-tabs" role="tablist" aria-label="Project filter">
            <button type="button" class="db-home-tab db-home-tab--active" role="tab" aria-selected="true" data-home-tab="projects">My projects</button>
            <button type="button" class="db-home-tab" role="tab" aria-selected="false" data-home-tab="recent">Recently viewed</button>
            <button type="button" class="db-home-tab" role="tab" aria-selected="false" data-home-tab="templates">Templates</button>
          </nav>
          <span class="db-home-projects-count">${projects.length} project${projects.length === 1 ? "" : "s"}</span>
        </header>
        <div class="db-home-tab-panel" data-home-panel="projects" role="tabpanel">
          ${projectGrid}
        </div>
        <div class="db-home-tab-panel" data-home-panel="recent" role="tabpanel" hidden>
          ${recentPanel}
        </div>
        <div class="db-home-tab-panel" data-home-panel="templates" role="tabpanel" hidden>
          ${templatePanel}
        </div>
      </section>
    </section>
  </section>`

  return renderLayout({
    title: "Home",
    body,
    authIndicator: "ok",
    version: store.getVersion(),
    shell: "lovable",
    chromeless: true,
  })
}
