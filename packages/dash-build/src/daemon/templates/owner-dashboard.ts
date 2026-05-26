/**
 * Owner Dashboard composition — Surface 3 (Sprint 3A).
 *
 * Lovable-style single-column scroll of four panel cards:
 *   1. Branch Merge Queue   — cross-repo `dash-build/*` review lane
 *   2. Activity Log         — chronological run events with anomaly flags
 *   3. Cost Monitor         — mock OpenAI/Codex spend until S3B wires real data
 *   4. DS Candidate Queue   — component/block/DS gap signals (mock empty in S3A)
 *
 * The topbar mirrors the Build dashboard layout so users can switch surfaces
 * without leaving the chrome. Mode tabs (`data-tab="build" | "owner"`) ship
 * as `<a>` anchors so a hard navigation works even when the JS bundle is
 * still booting. Client-side click handling lives in `client/app.ts`.
 *
 * No mutations from this surface in S3A — everything is read-mostly. The
 * Owner AI triage logic (auto-review, conflict detect, cost spike,
 * candidate ranking) is Sprint 3B's territory.
 *
 * Layer 0 / CR-5 contract: ONLY Dash semantic vars. CSS lives in
 * `styles/dashboard.ts` under the `=== Sprint 3 Owner ===` marker.
 */

import type { Store } from "../state/store.js"
import { renderLayout, escapeHtml } from "./layout.js"
import { renderAuthChip } from "./components/auth-chip.js"
import {
  renderOwnerBranchQueue,
  type OwnerBranchRow,
} from "./components/owner-branch-queue.js"
import {
  renderOwnerActivityFeed,
  type OwnerActivityRow,
} from "./components/owner-activity-feed.js"
import {
  renderOwnerCostCard,
  type OwnerCostCardOptions,
} from "./components/owner-cost-card.js"

export interface OwnerDashboardData {
  branches: OwnerBranchRow[]
  activity: OwnerActivityRow[]
  cost: OwnerCostCardOptions
  /** DS candidates — mock empty in S3A; populated by S3B. */
  dsCandidates: Array<{ id: string; title: string; kind: string; from: string }>
}

export interface OwnerDashboardRenderOptions {
  data: OwnerDashboardData
  /** Active OpenAI / GitHub chips for parity with the Build surface topbar. */
  openAIConnected?: boolean
  openAIUser?: string | null
  githubConnected?: boolean
  githubRepoCount?: number
}

function renderPanel(
  id: string,
  title: string,
  subtitle: string,
  body: string,
  toolbar: string = "",
): string {
  return `<section class="db-owner-panel db-card" aria-labelledby="${id}-title">
    <header class="db-owner-panel-header db-card-header">
      <div class="db-owner-panel-heading">
        <h2 class="db-owner-panel-title db-card-title" id="${id}-title">${escapeHtml(title)}</h2>
        <span class="db-owner-panel-subtitle db-card-subtitle">${escapeHtml(subtitle)}</span>
      </div>
      ${toolbar ? `<div class="db-owner-panel-toolbar">${toolbar}</div>` : ""}
    </header>
    <div class="db-owner-panel-body" id="${id}-body">
      ${body}
    </div>
  </section>`
}

function renderBranchFilters(repos: string[]): string {
  const chips = ["all", ...repos]
    .map(
      (repo, i) =>
        `<button type="button" class="db-owner-filter-chip${i === 0 ? " db-owner-filter-chip--active" : ""}" data-owner-filter="repo" data-value="${escapeHtml(repo)}">${escapeHtml(repo === "all" ? "All repos" : repo)}</button>`,
    )
    .join("")
  return `<div class="db-owner-filters" role="group" aria-label="Branch filters">
    ${chips}
  </div>`
}

function renderDsCandidateQueue(rows: OwnerDashboardData["dsCandidates"]): string {
  if (!rows.length) {
    return `<div class="db-owner-ds-empty" role="status">
      <p class="db-body-sm db-muted">No DS candidates flagged yet. Build AI surfaces component / block / DS-gap signals here once they appear in generated runs.</p>
    </div>`
  }
  const items = rows
    .map(
      (c) =>
        `<li class="db-owner-ds-row" data-candidate-id="${escapeHtml(c.id)}">
          <span class="db-owner-ds-kind" data-kind="${escapeHtml(c.kind)}">${escapeHtml(c.kind)}</span>
          <span class="db-owner-ds-title">${escapeHtml(c.title)}</span>
          <span class="db-owner-ds-from db-body-sm db-muted">from ${escapeHtml(c.from)}</span>
        </li>`,
    )
    .join("")
  return `<ol class="db-owner-ds-list">${items}</ol>`
}

export function renderOwnerDashboard(
  store: Store,
  opts: OwnerDashboardRenderOptions,
): string {
  const auth = store.getAuth()
  const openAIConnected = opts.openAIConnected ?? auth.openai.connected
  const openAIDetail = opts.openAIUser ?? auth.openai.user ?? undefined
  const githubConnected = opts.githubConnected ?? auth.github.connected
  const githubDetail = githubConnected
    ? `${opts.githubRepoCount ?? auth.github.repos.length} repos`
    : "optional for PR"

  const repos = Array.from(new Set(opts.data.branches.map((b) => b.repo))).sort()

  // Topbar — mirrors the Build shell. Mode tabs are <a> anchors so the
  // browser handles navigation even without JS; click handler in app.ts
  // upgrades to history.pushState-friendly behaviour later if needed.
  const topbar = `<header class="db-topbar db-owner-topbar" role="banner">
    <div class="db-topbar-cluster-a">
      <div class="db-topbar-project">
        <span class="db-topbar-project-dot" aria-hidden="true"></span>
        <div class="db-topbar-project-id">
          <span class="db-topbar-project-name">Owner Console</span>
          <span class="db-topbar-project-sub">Surface 3 · review queue across all repos</span>
        </div>
      </div>
    </div>
    <nav class="db-topbar-tabs" role="tablist" aria-label="Workspace surface">
      <a class="db-topbar-tab" role="tab" data-tab="build" href="/dashboard" aria-selected="false" title="Build">
        <span class="db-topbar-tab-icon" aria-hidden="true">◆</span>
        <span class="db-topbar-tab-label">Build</span>
      </a>
      <a class="db-topbar-tab db-topbar-tab--active" role="tab" data-tab="owner" href="/owner" aria-selected="true" title="Owner">
        <span class="db-topbar-tab-icon" aria-hidden="true">⚙</span>
        <span class="db-topbar-tab-label">Owner</span>
      </a>
    </nav>
    <div class="db-topbar-route" title="Surface scope">
      <span class="db-topbar-route-empty">cross-repo</span>
    </div>
    <div class="db-topbar-actions" id="db-topbar-actions">
      ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
      ${renderAuthChip({ provider: "github", connected: githubConnected, detail: githubDetail })}
    </div>
  </header>`

  const branchPanel = renderPanel(
    "db-owner-branches",
    "Branch merge queue",
    `${opts.data.branches.length} branch${opts.data.branches.length === 1 ? "" : "es"} awaiting review`,
    `${renderBranchFilters(repos)}
     ${renderOwnerBranchQueue({ rows: opts.data.branches })}`,
  )

  const activityPanel = renderPanel(
    "db-owner-activity",
    "Activity log",
    `${opts.data.activity.length} recent event${opts.data.activity.length === 1 ? "" : "s"}`,
    renderOwnerActivityFeed({ rows: opts.data.activity }),
  )

  const costPanel = renderPanel(
    "db-owner-cost",
    "Cost monitor",
    "OpenAI + Codex spend (mock until S3B)",
    renderOwnerCostCard(opts.data.cost),
  )

  const dsPanel = renderPanel(
    "db-owner-ds",
    "DS candidate queue",
    `${opts.data.dsCandidates.length} candidate${opts.data.dsCandidates.length === 1 ? "" : "s"}`,
    renderDsCandidateQueue(opts.data.dsCandidates),
  )

  const body = `<section class="db-owner-page" data-surface="owner">
    ${topbar}
    <main class="db-owner-stack" aria-label="Owner panels">
      ${branchPanel}
      ${activityPanel}
      ${costPanel}
      ${dsPanel}
    </main>
  </section>`

  return renderLayout({
    title: "Owner",
    body,
    authIndicator: openAIConnected ? "ok" : "pending",
    version: store.getVersion(),
  })
}
