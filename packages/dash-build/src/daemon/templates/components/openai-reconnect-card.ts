import { escapeHtml } from "../layout.js"

/**
 * Sprint 1B — OpenAI reconnect card.
 *
 * Surfaces in the rail empty state when the daemon has a prior "connected"
 * record but the live probe came back disconnected (token expired, Codex
 * session evicted, daemon restarted after BYO key rotation, etc).
 *
 * Two buttons:
 *   - [data-auth-reconnect] → POST /api/auth/openai/reconnect, refresh on
 *     success
 *   - [data-open-settings]  → links to the connect form below (anchor scroll)
 *
 * Styles use Layer 0 semantic tokens only — no raw hex.
 */
export interface OpenAIReconnectCardOptions {
  /** Previous mode if known — used in the headline ("ChatGPT" vs "API key"). */
  previousMode?: "codex-cli" | "byo-key" | "none"
  /** Optional reason from the last reconnect attempt to display under the body. */
  reason?: string | null
}

export function renderOpenAIReconnectCard(
  opts: OpenAIReconnectCardOptions = {},
): string {
  const mode = opts.previousMode ?? "none"
  const headline =
    mode === "codex-cli"
      ? "Codex CLI session expired"
      : mode === "byo-key"
        ? "OpenAI API key needs revalidating"
        : "OpenAI disconnected"
  const body =
    mode === "codex-cli"
      ? "Dash Build lost the active Codex login. Try reconnecting first — if your terminal still has a valid <code>codex login</code>, we will recover automatically."
      : mode === "byo-key"
        ? "Your saved API key did not validate. Either reconnect (often just a network blip) or open settings to paste a fresh key."
        : "Reconnect to recover your previous auth, or open settings to choose a new path."
  const reasonNote = opts.reason
    ? `<p class="db-reconnect-card-reason" data-auth-reconnect-reason>${escapeHtml(opts.reason)}</p>`
    : `<p class="db-reconnect-card-reason" data-auth-reconnect-reason hidden></p>`

  return `<section class="db-reconnect-card" data-openai-reconnect-card aria-labelledby="db-reconnect-headline">
    <div class="db-reconnect-card-icon" aria-hidden="true">⚠</div>
    <div class="db-reconnect-card-body">
      <h3 class="db-reconnect-card-title" id="db-reconnect-headline">${escapeHtml(headline)}</h3>
      <p class="db-reconnect-card-lede">${body}</p>
      ${reasonNote}
      <div class="db-reconnect-card-actions">
        <button
          type="button"
          class="db-button db-button-primary db-button-compact"
          data-auth-reconnect="openai"
          aria-label="Try to reconnect OpenAI now"
        >
          <span class="db-reconnect-card-btn-icon" aria-hidden="true">↻</span>
          <span class="db-button-label">Reconnect</span>
        </button>
        <a
          class="db-button db-button-ghost db-button-compact"
          href="#db-byo-form"
          data-open-settings="openai"
        >Open settings</a>
      </div>
    </div>
  </section>`
}
