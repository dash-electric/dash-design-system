/**
 * @deprecated — Day 1 placeholder. Workspace + auth chips now live inside the
 * dashboard composition (see ./dashboard.ts). This stub remains only so any
 * historical imports do not error during transition.
 */
import type { AuthState, WorkspaceState } from "../state/types.js"
import { renderAuthChip } from "./components/auth-chip.js"
import { escapeHtml } from "./layout.js"

export function renderStatusBar(auth: AuthState, workspace: WorkspaceState): string {
  const repo = workspace.activeRepo ?? "no repo selected"
  return `<section class="db-card">
    <div class="db-workspace-field">
      <span class="db-label">Target repo</span>
      <span class="db-muted">${escapeHtml(repo)}</span>
    </div>
    <div class="db-workspace-auth">
      ${renderAuthChip({ provider: "openai", connected: auth.openai.connected })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected })}
    </div>
  </section>`
}
