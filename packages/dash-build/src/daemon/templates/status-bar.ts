import type { AuthState, WorkspaceState } from "../state/types.js"
import { escapeHtml } from "./layout.js"

export function renderStatusBar(auth: AuthState, workspace: WorkspaceState): string {
  const repo = workspace.activeRepo ?? "no repo selected"
  const branch = workspace.activeBranch ?? "—"
  const anthropicOk = auth.anthropic.connected
  const githubOk = auth.github.connected

  const authChips = [
    anthropicOk
      ? '<span class="db-chip db-chip-ok">✓ Anthropic</span>'
      : '<span class="db-chip db-chip-warn">⚠ Anthropic pending</span>',
    githubOk
      ? '<span class="db-chip db-chip-ok">✓ GitHub</span>'
      : '<span class="db-chip db-chip-warn">⚠ GitHub pending</span>',
  ].join("")

  return `<section class="db-status">
    <div class="db-status-row">
      <span class="db-label">Target repo</span>
      <span class="db-pill">${escapeHtml(repo)}</span>
      <span class="db-muted">· ${escapeHtml(branch)}</span>
    </div>
    <div class="db-status-row">
      <span class="db-label">Status</span>
      <span class="db-chip db-chip-ok">✓ Daemon</span>
      ${authChips}
    </div>
  </section>`
}
