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
import { isRealProject } from "../state/store.js"
import type { Project } from "../state/types.js"
import { escapeHtml, renderLayout } from "./layout.js"
import { renderSidebar, projectsToRecents } from "./sidebar.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { icon, type IconName } from "./components/icon.js"
import { listRepoPreviewManifests } from "../repo-preview.js"

/**
 * P7 (2026-05-29) — default target repo for the Home composer's repo picker.
 *
 * THE BUG this fixes: the hero "Start building" flow used to POST `{ text }`
 * with NO repo, so the orchestrator's `shouldClone` was false and intake
 * scanned dash-build's OWN dir → greenfield/standalone generation (the
 * Lovable-clone failure the product rejects). The verified "respect existing
 * + fePatterns + BE reach" wins only fire when a real repo is selected, so
 * the DEFAULT must be a real repo, not blank.
 */
const DEFAULT_HOME_REPO = "dash/backoffice"

/**
 * Render the repo `<select>` for the home composer. Options are sourced from
 * the preview manifest (`backoffice`, `portal-v2`, …) plus a blank "No repo
 * (new product)" escape hatch for genuine greenfield work. Defaults to the
 * last-used repo (`store.getActiveRepo()`) when it is a known manifest id,
 * else `DEFAULT_HOME_REPO`. The selected value is read by `hookHomePrompt`
 * and carried in the POST /api/prompt body as `{ repo }`.
 */
function renderRepoPicker(activeRepo: string | null): string {
  const manifests = listRepoPreviewManifests()
  const known = manifests.some((m) => m.id === activeRepo)
  const selected = known && activeRepo ? activeRepo : DEFAULT_HOME_REPO
  const options = manifests
    .map((m) => {
      const sel = m.id === selected ? " selected" : ""
      return `<option value="${escapeHtml(m.id)}"${sel}>${escapeHtml(m.label)}</option>`
    })
    .join("")
  // Blank-product escape hatch — empty value means "no repo", which
  // hookHomePrompt omits from the payload so the orchestrator keeps the
  // greenfield path available on demand.
  const blankOption = `<option value="">No repo (new product)</option>`
  return `<label class="db-home-repo-picker" for="db-home-repo-select">
    <span class="db-home-repo-picker-label">Target repo</span>
    <select
      class="db-home-repo-select"
      id="db-home-repo-select"
      name="repo"
      aria-label="Target repo for generation"
    >
      ${options}
      ${blankOption}
    </select>
  </label>`
}

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

/**
 * Tier 2 #9 — Lovable-style example prompt cards rendered directly below the
 * home hero composer. Click → fill `#db-prompt-input` with the prompt text +
 * focus. Voice is formal "Anda" per Dash voice rule (CLAUDE.md §Cardinal
 * rules) — these are mitra-facing surfaces the user is building toward.
 *
 * Six cards keeps the grid balanced on most viewports (2-3 wide depending on
 * width) without spilling below the fold on a 13-inch laptop.
 */
interface ExamplePrompt {
  id: string
  icon: IconName
  text: string
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: "ex-dashboard",
    icon: "grid",
    text: "Dashboard mitra performance dengan SLA tracking",
  },
  {
    id: "ex-form-kyc",
    icon: "file",
    text: "Form pendaftaran mitra baru dengan KYC + audit log",
  },
  {
    id: "ex-banner-suspend",
    icon: "alarm",
    text: "Banner notifikasi suspension dengan reason + reactivate CTA",
  },
  {
    id: "ex-table-orders",
    icon: "list",
    text: "Tabel order list dengan filter status + pagination",
  },
  {
    id: "ex-modal-delete",
    icon: "bell",
    text: "Modal konfirmasi delete dengan undo grace period",
  },
  {
    id: "ex-settings",
    icon: "settings",
    text: "Settings page mitra dengan tabs Profile/Payment/Notification",
  },
]

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

function renderExamplePromptCard(ex: ExamplePrompt): string {
  return `<button
    type="button"
    class="db-home-example-card"
    data-example-prompt="${escapeHtml(ex.text)}"
    data-example-id="${escapeHtml(ex.id)}"
    aria-label="Use example prompt: ${escapeHtml(ex.text)}"
  >
    <span class="db-home-example-icon" aria-hidden="true">${icon(ex.icon, { size: "sm" })}</span>
    <span class="db-home-example-text">${escapeHtml(ex.text)}</span>
  </button>`
}

function renderExamplePrompts(): string {
  return `<section class="db-home-examples" aria-label="Example prompts">
    <p class="db-home-examples-label">Coba contoh berikut</p>
    <div class="db-home-examples-grid">
      ${EXAMPLE_PROMPTS.map(renderExamplePromptCard).join("")}
    </div>
  </section>`
}

function renderEmptyProjects(): string {
  return `<div class="db-home-empty">
    <p class="db-home-empty-title">No projects yet</p>
    <p class="db-home-empty-body">Type a prompt above to spin up your first workspace.</p>
  </div>`
}

export function renderHome(store: Store, opts: HomeOptions = {}): string {
  // Bug 3+4 (2026-05-29) — only surface repo-backed projects on the home grid.
  // Bare-prompt runs auto-create an "Unassigned" phantom project (store
  // `ensureProjectInternal`); filtering here keeps the grid + count honest
  // without touching the underlying data model.
  const projects = store.getProjects().filter(isRealProject)
  const recents = projectsToRecents(projects, 8)
  const activeRepo = store.getActiveRepo()
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
            ${renderRepoPicker(activeRepo)}
            <span class="db-home-prompt-hint" aria-hidden="true">⌘↵ to launch workspace</span>
            <button
              type="submit"
              class="db-button db-button-primary db-home-prompt-submit"
              id="db-home-prompt-submit"
              aria-label="Create new workspace from prompt"
            >
              <span class="db-button-label">Start building</span>
              <span class="db-button-arrow" aria-hidden="true">${icon("arrow-right", { size: "sm" })}</span>
            </button>
          </div>
        </form>
        ${renderExamplePrompts()}
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
