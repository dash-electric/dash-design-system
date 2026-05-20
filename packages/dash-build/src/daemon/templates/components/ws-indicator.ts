/**
 * WS connection state indicator — renders as 🟢 / 🟡 / 🔴 with text label.
 * Initial state is "connecting"; the client JS flips it on socket events.
 */
export function renderWsIndicator(): string {
  return `<div class="db-ws-indicator" id="db-ws-indicator" data-state="connecting" role="status" aria-live="polite">
    <span class="db-ws-dot" aria-hidden="true"></span>
    <span class="db-ws-label">Connecting…</span>
  </div>`
}
