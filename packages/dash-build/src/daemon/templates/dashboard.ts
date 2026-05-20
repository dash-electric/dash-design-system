import type { Store } from "../state/store.js"
import { renderLayout } from "./layout.js"
import { renderPromptList } from "./prompt-card.js"
import { renderStatusBar } from "./status-bar.js"

export function renderDashboard(store: Store): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(10)

  const body = `
    ${renderStatusBar(auth, workspace)}

    <section class="db-card db-prompt-form">
      <label class="db-label" for="db-prompt-input">Build feature</label>
      <textarea
        id="db-prompt-input"
        class="db-textarea"
        rows="3"
        placeholder="e.g. tambahin chart payroll di backoffice — group by mitra Lvl"
      ></textarea>
      <div class="db-prompt-actions">
        <button class="db-button" id="db-prompt-submit" type="button">Generate →</button>
      </div>
    </section>

    <section class="db-card">
      <h2 class="db-heading">Recent prompts</h2>
      <div id="db-prompts">${renderPromptList(prompts)}</div>
    </section>
  `

  return renderLayout({
    title: "Dash Build",
    body,
    authIndicator: auth.anthropic.connected && auth.github.connected ? "ok" : "pending",
    version: store.getVersion(),
  })
}
