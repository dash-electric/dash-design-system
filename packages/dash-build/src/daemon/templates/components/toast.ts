/**
 * Toast notification system — server-side container, populated by client JS.
 *
 * The server only emits the empty `<div id="db-toasts">` mount node; the
 * client-side `showToast()` (see `client/app.ts`) creates/removes `.db-toast`
 * children in response to WebSocket events (PR created, generation complete,
 * clarification needed, prompt failure).
 *
 * Toast kinds: "success" | "error" | "warn" | "info" (default "info").
 * Each maps to a Dash Foundation Layer 0 semantic color via CSS.
 */
export function toastContainer(): string {
  return `<div id="db-toasts" class="db-toasts" aria-live="polite" aria-atomic="false"></div>`
}
