/**
 * Owner Dashboard — Cost Monitor panel (Sprint 3A).
 *
 * Today this renders mock data only — Dash Build does not yet track per-run
 * OpenAI / Codex token usage. The data contract is sketched here so Sprint
 * 3B can wire a real `UsageTracker` without renderer churn.
 *
 * Visual: big number total spend → 7-day sparkline (pure CSS, no chart lib)
 * → per-user top-5 breakdown → budget threshold bar.
 *
 * Layer 0 / CR-5: ONLY semantic vars. Styles in `styles/dashboard.ts`.
 */

import { escapeHtml } from "../layout.js"

export interface OwnerCostUser {
  user: string
  spendUsd: number
  /** Optional run count to qualify the spend. */
  runs?: number
}

export interface OwnerCostCardOptions {
  /** Total spend this week (USD). */
  weekSpendUsd: number
  /** 7-day spend series (Mon … Sun). Values in USD. Length should be 7. */
  series: number[]
  /** Top-N users by spend. Already sorted DESC; renderer trims to top 5. */
  topUsers: OwnerCostUser[]
  /** Weekly budget cap (USD) used for the threshold bar. */
  budgetUsd: number
}

function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return "$0"
  if (Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`
  }
  return `$${n.toFixed(2)}`
}

function renderSparkline(series: number[]): string {
  if (!series.length) return ""
  const max = Math.max(...series, 1)
  const bars = series
    .map((v, i) => {
      const pct = Math.max(2, Math.round((v / max) * 100))
      return `<span class="db-cost-spark-bar" data-day-index="${i}" style="height: ${pct}%" title="${formatUsd(v)}"></span>`
    })
    .join("")
  return `<div class="db-cost-spark" role="img" aria-label="7-day spend sparkline">
    ${bars}
  </div>`
}

function renderUserTable(users: OwnerCostUser[]): string {
  if (!users.length) {
    return `<p class="db-body-sm db-muted">No user spend recorded this week.</p>`
  }
  const top = users.slice(0, 5)
  const max = Math.max(...top.map((u) => u.spendUsd), 1)
  const rows = top
    .map((u) => {
      const pct = Math.max(4, Math.round((u.spendUsd / max) * 100))
      return `<tr class="db-cost-user-row">
        <td class="db-cost-user-cell db-cost-user-cell--name">${escapeHtml(u.user)}</td>
        <td class="db-cost-user-cell db-cost-user-cell--bar">
          <span class="db-cost-user-bar" style="width: ${pct}%" aria-hidden="true"></span>
        </td>
        <td class="db-cost-user-cell db-cost-user-cell--amount db-mono">${escapeHtml(formatUsd(u.spendUsd))}</td>
        <td class="db-cost-user-cell db-cost-user-cell--runs db-mono">${escapeHtml(String(u.runs ?? 0))}</td>
      </tr>`
    })
    .join("")
  return `<table class="db-cost-user-table" aria-label="Top users by spend">
    <thead>
      <tr>
        <th scope="col">User</th>
        <th scope="col">Share</th>
        <th scope="col">Spend</th>
        <th scope="col">Runs</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function renderBudgetBar(spend: number, budget: number): string {
  const ratio = budget > 0 ? Math.min(1.5, spend / budget) : 0
  const pct = Math.round(ratio * 100)
  // Tone escalates as the bar fills.
  let tone: "good" | "warn" | "error" = "good"
  if (pct >= 90) tone = "error"
  else if (pct >= 65) tone = "warn"
  const fillPct = Math.min(100, pct)
  return `<div class="db-cost-budget" data-tone="${tone}">
    <div class="db-cost-budget-meta">
      <span class="db-cost-budget-label">Weekly budget</span>
      <span class="db-cost-budget-amount db-mono">${escapeHtml(formatUsd(spend))} / ${escapeHtml(formatUsd(budget))}</span>
    </div>
    <div class="db-cost-budget-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
      <span class="db-cost-budget-fill" style="width: ${fillPct}%" data-tone="${tone}"></span>
    </div>
    <p class="db-cost-budget-hint db-body-sm db-muted">${pct}% of weekly budget used</p>
  </div>`
}

export function renderOwnerCostCard(opts: OwnerCostCardOptions): string {
  return `<div class="db-cost-card">
    <div class="db-cost-card-headline">
      <div class="db-cost-card-total">
        <span class="db-cost-card-total-label">Spend this week</span>
        <span class="db-cost-card-total-amount">${escapeHtml(formatUsd(opts.weekSpendUsd))}</span>
      </div>
      ${renderSparkline(opts.series)}
    </div>
    <div class="db-cost-card-section">
      <h4 class="db-cost-card-section-title">Top users</h4>
      ${renderUserTable(opts.topUsers)}
    </div>
    <div class="db-cost-card-section">
      ${renderBudgetBar(opts.weekSpendUsd, opts.budgetUsd)}
    </div>
    <p class="db-cost-card-disclaimer db-body-sm db-muted">
      Mock data — real OpenAI/Codex usage tracking lands in Sprint 3B.
    </p>
  </div>`
}
