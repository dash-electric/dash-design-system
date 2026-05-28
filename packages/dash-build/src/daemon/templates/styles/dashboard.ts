/**
 * Dash Build dashboard CSS — embedded as a single string and served by the
 * static route. We follow Dash Foundation Layer 0 tokens (Dash Purple #5e2aac
 * is canonical) but inline them here so the daemon stays dependency-free.
 *
 * Phase A1 (2026-05-25): registry tokens from apps/docs/app/globals.css are
 * INLINED via `REGISTRY_TOKENS_CSS` and prepended to the bundle. The legacy
 * daemon-internal aliases below (--ink, --paper, --canvas, --mute, --rule,
 * --shadow-*, --radius-*, --font-*) remain so the existing rule body keeps
 * working untouched — Agent A2 owns the body-side migration to registry
 * semantic names (--text-strong-950, --bg-white-0, etc.). The duplicate
 * `--primary-base` definition is dropped from the legacy block (registry
 * provides it identically).
 *
 * Tokens mirror apps/docs/registry/dash/foundation/tokens/colors.css subset.
 * Typography: Plus Jakarta Sans (loaded via Google Fonts in layout.ts),
 * with JetBrains Mono for code/mono.
 */

import { REGISTRY_TOKENS_CSS } from "./tokens.js"

const DAEMON_OVERRIDES_CSS = `
:root {
  /* ----- Daemon-internal aliases (Agent A2 will migrate to registry) ----- */
  --ink: #1a1a1a;
  --ink-2: #0e0e0e;
  --paper: #f7f7f5;
  --paper-2: #ffffff;
  --paper-3: #fbfaf8;
  --canvas: #f4f1ec;
  --mute: #6b6b68;
  --mute-2: #9a9a96;
  --rule: #e4e3de;
  --rule-2: #efeeea;

  /* Dash Purple — canonical #5e2aac (registry provides --primary-base) */
  --primary: #5e2aac;
  --primary-strong: #4a1f8a;
  --primary-soft: #eee5fb;
  --primary-card: #f1ecf9;
  --primary-ring: rgba(94, 42, 172, 0.24);

  /* Semantic state colors */
  --success: #0f6e56;
  --success-soft: #def7ec;
  --warn: #b08015;
  --warn-soft: #fef3c7;
  --danger: #a32d2d;
  --danger-soft: #fde8e8;
  --info: #2563eb;
  --info-soft: #e0e7ff;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;

  --shadow-sm: 0 1px 2px rgba(14, 14, 14, 0.04), 0 1px 1px rgba(14, 14, 14, 0.02);
  --shadow-md: 0 4px 12px rgba(14, 14, 14, 0.06), 0 1px 2px rgba(14, 14, 14, 0.04);
  --shadow-focus: 0 0 0 3px var(--primary-ring);

  --font-sans: "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
}

/* Dashboard is LIGHT-ONLY per Dash DS direction. Dark-mode blocks were
 * removed in May 2026 — surface follows Dash operational aesthetic. To
 * re-enable a dark variant later, ship it as a Layer-2 theme, not
 * inline media queries. */

/* ----- Reset ----- */
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
/* When the Lovable shell is mounted (has .db-shell anywhere in DOM),
   lock the page to exactly viewport height with no outer scroll.
   .db-shell + .db-split fill via flex distribution from body downward.
   Replaces the broken calc 100vh minus 64px magic number which did not
   account for actual header + footer heights. */
html:has(.db-shell), body:has(.db-shell) {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}
body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: 1.55;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(94, 42, 172, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(15, 110, 86, 0.06), transparent 30%),
    radial-gradient(circle at bottom center, rgba(176, 128, 21, 0.07), transparent 24%),
    var(--canvas);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: inherit; }

/* ----- Header ----- */
.db-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid rgba(228, 227, 222, 0.8);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.db-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: -0.012em;
  font-size: var(--text-lg);
}
.db-brand-mark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--primary);
  position: relative;
  display: inline-block;
}
.db-brand-mark::after {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 2px;
  background: var(--paper-2);
}
.db-brand-version {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--mute);
  background: var(--paper);
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
}
.db-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.db-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--mute);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.db-icon-btn:hover { background: var(--paper); border-color: var(--rule); color: var(--ink); }
.db-icon-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

/* ----- WS indicator ----- */
.db-ws-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--mute);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--paper);
  border: 1px solid var(--rule);
}
.db-ws-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mute-2);
}
.db-ws-indicator[data-state="connected"] .db-ws-dot { background: var(--success); box-shadow: 0 0 0 3px var(--success-soft); }
.db-ws-indicator[data-state="connected"] { color: var(--success); }
.db-ws-indicator[data-state="connecting"] .db-ws-dot,
.db-ws-indicator[data-state="reconnecting"] .db-ws-dot { background: var(--warn); animation: db-pulse 1.4s ease-in-out infinite; }
.db-ws-indicator[data-state="reconnecting"] { color: var(--warn); }
.db-ws-indicator[data-state="disconnected"] .db-ws-dot { background: var(--danger); }
.db-ws-indicator[data-state="disconnected"] { color: var(--danger); }

@keyframes db-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

/* ----- Main layout ----- */
.db-main {
  flex: 1;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.db-footer {
  padding: 14px 24px;
  color: var(--mute);
  font-size: 12px;
  border-top: 1px solid var(--rule);
  background: var(--paper-2);
  text-align: center;
}
.db-footer .db-mono { font-family: var(--font-mono); }

/* ----- Card ----- */
.db-card {
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  padding: 16px 24px;
  box-shadow: var(--shadow-sm);
}
.db-card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}
.db-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.db-card-subtitle {
  font-size: 12px;
  color: var(--mute-2);
}

/* ----- Typography helpers ----- */
.db-title-lg { font-size: var(--text-display-lg); font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.db-title-md { font-size: var(--text-display-sm); font-weight: 700; letter-spacing: -0.015em; margin: 0; }
.db-title-sm { font-size: var(--text-title-sm); font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.db-body { font-size: var(--text-body); }
.db-body-sm { font-size: var(--text-body-sm); }
.db-mono { font-family: var(--font-mono); font-size: var(--text-md); }
.db-muted { color: var(--mute); }
.db-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

/* ----- Workspace strip ----- */
.db-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;
  align-items: end;
}
@media (max-width: 720px) {
  .db-workspace { grid-template-columns: 1fr; }
}
.db-workspace-field { display: flex; flex-direction: column; gap: 4px; }
.db-workspace-auth { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 14px; border-top: 1px solid var(--rule-2); margin-top: 14px; }

/* ----- Form controls ----- */
.db-select,
.db-text-input,
.db-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  color: var(--ink);
  background: var(--paper-3);
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.db-select { appearance: none; padding-right: 32px; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path fill='%236b6b68' d='M3 4.5l3 3 3-3z'/></svg>"); background-repeat: no-repeat; background-position: right 10px center; }
.db-textarea { min-height: 96px; resize: vertical; line-height: 1.55; }
.db-text-input:focus,
.db-textarea:focus,
.db-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
  background: var(--paper-2);
}
.db-text-input:disabled,
.db-textarea:disabled,
.db-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ----- Auth chips ----- */
.db-auth-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--ink);
  transition: border-color 120ms ease, background 120ms ease;
}
.db-auth-chip:hover { text-decoration: none; }
.db-auth-chip-ok {
  background: var(--success-soft);
  border-color: transparent;
  color: var(--success);
}
.db-auth-chip-ok .db-auth-chip-dot { background: var(--success); }
.db-auth-chip-off { color: var(--warn); border-color: var(--warn-soft); background: var(--paper-2); cursor: pointer; }
.db-auth-chip-off:hover { background: var(--warn-soft); border-color: var(--warn); }
.db-auth-chip-off .db-auth-chip-dot { background: var(--warn); }
.db-auth-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.db-auth-chip-icon { font-size: 10px; opacity: 0.7; }
.db-auth-chip-detail { color: var(--mute); font-weight: 400; margin-left: 4px; }

/* ----- Prompt input ----- */
.db-prompt-input-wrap { display: flex; flex-direction: column; gap: 12px; }
.db-prompt-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.db-prompt-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mute);
}
.db-prompt-hint-icon { color: var(--primary); }
.db-prompt-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ----- Button ----- */
.db-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 120ms ease, transform 80ms ease, box-shadow 120ms ease;
  text-decoration: none;
}
.db-button:hover { text-decoration: none; }
.db-button-primary { background: var(--primary); color: #fff; }
.db-button-primary:hover { background: var(--primary-strong); }
.db-button-primary:active { transform: translateY(1px); }
.db-button-primary:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.db-button-primary:disabled { background: var(--mute-2); cursor: not-allowed; opacity: 0.7; }
.db-button-ghost {
  background: var(--paper-2);
  color: var(--ink);
  border-color: var(--rule);
}
.db-button-ghost:hover { background: var(--paper); }
.db-button-compact { padding: 10px 12px; }
.db-button-arrow { transform: translateX(0); transition: transform 120ms ease; }
.db-button:hover .db-button-arrow { transform: translateX(2px); }

/* ----- Status pill ----- */
.db-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--rule-2);
  color: var(--mute);
  border: 1px solid transparent;
}
.db-status-pill-icon { font-size: 10px; line-height: 1; }
.db-status-pill-queued { background: var(--rule-2); color: var(--mute); }
.db-status-pill-clarifying { background: var(--info-soft); color: var(--info); }
.db-status-pill-generating { background: var(--primary-soft); color: var(--primary); }
.db-status-pill-awaiting-approval { background: var(--success-soft); color: var(--success); }
.db-status-pill-pr-created { background: var(--success); color: #fff; }
.db-status-pill-completed { background: var(--success-soft); color: var(--success); }
.db-status-pill-failed { background: var(--danger-soft); color: var(--danger); }
.db-status-pill-cancelled { background: var(--rule-2); color: var(--mute); }
.db-status-pill-spin .db-status-pill-icon {
  animation: db-spin 1.2s linear infinite;
  display: inline-block;
}
@keyframes db-spin {
  to { transform: rotate(360deg); }
}

/* ----- Prompt list ----- */
.db-prompt-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.db-prompt-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: var(--paper-3);
  border: 1px solid var(--rule-2);
  border-radius: var(--radius-md);
  transition: border-color 120ms ease, background 120ms ease;
}
.db-prompt-card:hover { border-color: var(--rule); background: var(--paper-2); }
.db-prompt-card[data-status="generating"] { border-left: 3px solid var(--primary); padding-left: 14px; }
.db-prompt-card[data-status="failed"] { border-left: 3px solid var(--danger); padding-left: 14px; }
.db-prompt-card[data-status="pr_created"] { border-left: 3px solid var(--success); padding-left: 14px; }
.db-prompt-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.db-prompt-meta { font-size: 12px; color: var(--mute); }
.db-prompt-repo { font-family: var(--font-mono); font-size: 11px; color: var(--mute); margin-left: auto; }
.db-prompt-text { margin: 0; font-size: 14px; color: var(--ink); line-height: 1.5; }
.db-prompt-card-foot { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.db-prompt-card-foot:empty { display: none; }
.db-prompt-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
}
.db-prompt-action-primary { background: var(--primary); color: #fff; }
.db-prompt-action-primary:hover { background: var(--primary-strong); }
.db-prompt-action-ghost { color: var(--primary); border-color: var(--rule); background: var(--paper-2); }
.db-prompt-action-ghost:hover { background: var(--primary-soft); border-color: var(--primary-soft); }
.db-prompt-error { color: var(--danger); font-size: 12px; font-family: var(--font-mono); }
.db-prompt-progress {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: var(--rule-2);
  overflow: hidden;
}
.db-prompt-progress-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  background-size: 200% 100%;
  animation: db-progress-slide 1.4s linear infinite;
}
@keyframes db-progress-slide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ----- Empty states ----- */
.db-empty-state {
  text-align: center;
  padding: 24px 16px;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-3);
}
.db-empty-primary { background: var(--primary-card); border-color: var(--primary-soft); }
.db-empty-icon {
  display: inline-block;
  font-size: var(--text-title-md);
  color: var(--primary);
  margin-bottom: 8px;
}
.db-empty-title { margin: 0 0 6px; font-size: var(--text-lg); font-weight: 600; color: var(--ink); }
.db-empty-body { margin: 0 0 12px; font-size: 13px; color: var(--mute); }
.db-empty-examples {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--mute);
  font-family: var(--font-mono);
}
.db-empty-examples li { padding: 4px 0; }

/* ----- Skeleton loader ----- */
.db-skeleton {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--rule-2) 0%, var(--rule) 50%, var(--rule-2) 100%);
  background-size: 200% 100%;
  animation: db-skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes db-skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ----- Preview pane ----- */
.db-preview-pane { display: flex; flex-direction: column; gap: 12px; }
.db-preview-frame-wrap {
  border: 1px solid var(--rule);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--paper-2);
  min-height: 360px;
}
.db-preview-frame { width: 100%; height: 480px; border: 0; display: block; }
.db-preview-subheading { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: var(--mute); letter-spacing: 0.06em; }
.db-preview-file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.db-preview-file { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 4px; background: var(--paper-3); font-size: 12px; }
.db-preview-file-path { font-family: var(--font-mono); color: var(--ink); }
.db-preview-file-size { color: var(--mute); }

/* ----- Accessibility ----- */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
:focus-visible { outline: none; box-shadow: var(--shadow-focus); border-radius: 6px; }

/* Theme-toggle CSS removed (May 2026) — dashboard is light-only. */

/* ----- Toast notifications ----- */
.db-toasts {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  pointer-events: none;
}
.db-toast {
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-left: 3px solid var(--primary);
  box-shadow: var(--shadow-md);
  font-size: 14px;
  color: var(--ink);
  transform: translateX(420px);
  opacity: 0;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.db-toast.show { transform: translateX(0); opacity: 1; }
.db-toast.success { border-left-color: var(--success); }
.db-toast.error { border-left-color: var(--danger); }
.db-toast.warn { border-left-color: var(--warn); }
.db-toast.info { border-left-color: var(--primary); }
.db-toast-msg { line-height: 1.4; }
.db-toast-action {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.db-toast-action:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .db-toasts { left: 12px; right: 12px; bottom: 12px; }
  .db-toast { min-width: 0; max-width: none; width: 100%; }
}

/* ----- Skeleton placeholders (initial load + reconnect) ----- */
.db-skeleton-card {
  padding: 14px 16px;
  border: 1px solid var(--rule-2);
  border-radius: var(--radius-md);
  background: var(--paper-3);
  margin-bottom: 10px;
}
.db-skeleton-card:last-child { margin-bottom: 0; }
.db-skeleton-line {
  height: 12px;
  background: linear-gradient(
    90deg,
    var(--rule-2) 0%,
    var(--rule) 50%,
    var(--rule-2) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: db-shimmer 1.5s ease-in-out infinite;
}
.db-skeleton-chip {
  display: inline-block;
  width: 80px;
  height: 24px;
  background: linear-gradient(
    90deg,
    var(--rule-2) 0%,
    var(--rule) 50%,
    var(--rule-2) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-pill);
  animation: db-shimmer 1.5s ease-in-out infinite;
  margin-right: 8px;
}
.db-skeleton-status { display: flex; gap: 8px; align-items: center; }
.db-skeleton-list { display: flex; flex-direction: column; gap: 0; }
@keyframes db-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ----- Responsive ----- */
@media (max-width: 640px) {
  .db-main { padding: 16px 14px 48px; }
  .db-header { padding: 10px 16px; }
  .db-card { padding: 16px; }
  .db-main:has(.db-chat-shell) { padding: 12px; }
  .db-chat-scene { border-radius: var(--radius-16); }
  .db-prompt-input-footer { flex-direction: column; align-items: stretch; }
  .db-button { justify-content: center; }
  .db-prompt-actions { width: 100%; }
  .db-prompt-actions .db-button-primary { flex: 1; }
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Chat dashboard (Claude.ai-style split-pane)                            */
/* ─────────────────────────────────────────────────────────────────────── */

/* Override the centered ".db-main" max-width when the chat shell is the body.
   Fixed at 100vh (minus topbar) — internal panes scroll, NOT outer container.
   Prevents the canvas/baseline-shell min-heights from pushing the page taller
   than viewport (which made the whole red box scroll-elongate). */
.db-main:has(.db-chat-shell) {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 14px;
  gap: 0;
  height: calc(100vh - 64px);
  min-height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: hidden;
}

.db-chat-scene {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  height: 100%;
  border-radius: var(--radius-16);
  overflow: hidden;
  border: 1px solid var(--rule);
  box-shadow: var(--shadow-scene-lift), var(--shadow-inset-hi);
  background: var(--paper-2);
}

/* Thin top status bar above the split pane. */
.db-chat-statusbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--paper-2);
  border-bottom: 1px solid var(--rule);
  flex-wrap: wrap;
  min-height: 50px;
}
.db-chat-statusbar-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.db-chat-statusbar-group .db-select,
.db-chat-statusbar-group .db-text-input {
  padding: 6px 10px;
  font-size: 13px;
  width: auto;
  min-width: 160px;
}
.db-chat-statusbar-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.db-chat-statusbar-spacer { flex: 1; }
.db-chat-statusbar-chips {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* P1.1 context chrome — project pill + thread chip in the status bar. */
.db-chat-statusbar-context {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.db-project-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper);
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  max-width: 280px;
  min-width: 0;
}
.db-project-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--primary);
  flex-shrink: 0;
}
.db-project-pill-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-project-pill-theme {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.db-project-pill--empty {
  color: var(--mute);
  font-weight: 600;
  background: transparent;
  border-style: dashed;
}
.db-project-pill--empty .db-project-pill-dot { background: var(--mute); }
.db-thread-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--paper);
  border: 1px solid var(--rule);
  font-size: 12px;
  color: var(--ink);
  max-width: 320px;
  min-width: 0;
}
.db-thread-chip-label {
  color: var(--mute);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.db-thread-chip-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-run-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Split pane fills the remaining scene height, dock pinned below. */
.db-chat-shell {
  display: grid;
  grid-template-columns: minmax(320px, var(--db-chat-pane-width, 40%)) 8px minmax(0, 1fr);
  gap: 0;
  background: var(--rule);
  flex: 1;
  min-height: 0;
}
.db-chat-shell.is-resizing,
.db-chat-shell.is-resizing * {
  cursor: col-resize;
  user-select: none;
}
.db-chat-resizer {
  position: relative;
  background: var(--rule);
  cursor: col-resize;
  outline: none;
}
.db-chat-resizer::before {
  content: "";
  position: absolute;
  inset: 0 2px;
  border-radius: var(--radius-pill);
  background: transparent;
}
.db-chat-resizer:hover::before,
.db-chat-resizer:focus-visible::before,
.db-chat-shell.is-resizing .db-chat-resizer::before {
  background: var(--primary-soft);
  box-shadow: inset 0 0 0 1px var(--primary-ring);
}
.db-chat-pane {
  background: var(--paper-2);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  /* Critical: pane fills shell height, child overflow scrolls inside the pane,
     not the page. Without this, baseline-shell (min 460px) + iframe (480px)
     elongate the page when stage > viewport. */
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}
.db-chat-pane--left {
  background: var(--paper-2);
}
.db-chat-pane--right {
  background:
    radial-gradient(circle at top, rgba(94, 42, 172, 0.06), transparent 32%),
    linear-gradient(180deg, rgba(251, 250, 248, 0.98), rgba(255, 255, 255, 0.96));
}
/* Canvas stage inside the right pane: vertical scroll when content (baseline
   shell, code panel, history, owner panel) exceeds available height. */
.db-chat-pane--right .db-canvas-stage,
.db-chat-pane--right .db-canvas-panel {
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ── Chat thread ── */
.db-chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 10px;
  scroll-behavior: smooth;
}
.db-chat-thread {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-chat-thread--empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.db-chat-empty {
  text-align: center;
  max-width: 360px;
  padding: 32px 16px;
}
.db-chat-empty-mark {
  display: inline-block;
  font-size: var(--text-display-md);
  color: var(--primary);
  margin-bottom: 12px;
}
.db-chat-empty-title {
  margin: 0 0 8px;
  font-size: var(--text-subtitle);
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink);
}
.db-chat-empty-body {
  margin: 0;
  font-size: 14px;
  color: var(--mute);
  line-height: 1.5;
}

.db-chat-msg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}
.db-chat-msg[data-role="user"] { align-items: flex-end; }
.db-chat-msg[data-role="builder"] { align-items: flex-start; }

.db-chat-bubble {
  /* Shrink to fit content; cap at max so long lines wrap.
     No min-height — pure content height with respected padding. */
  width: fit-content;
  max-width: min(520px, 84%);
  /* Padding on Dash spacing scale (4-multiple): 8 + 12 = spacing-8 + spacing-12. */
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.db-chat-msg[data-role="user"] .db-chat-bubble {
  background: var(--primary);
  color: var(--paper-2);
  border-bottom-right-radius: 4px;
}
.db-chat-msg[data-role="builder"] .db-chat-bubble {
  background: var(--paper-2);
  color: var(--ink);
  border: 1px solid var(--rule);
  border-bottom-left-radius: 4px;
}
.db-chat-msg[data-role="builder"][data-status="error"] .db-chat-bubble {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}

.db-chat-time {
  font-size: 11px;
  color: var(--mute-2);
  padding: 0 6px;
}

/* Typing dots ("Builder is thinking"). */
.db-chat-typing {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
}
.db-chat-typing > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mute);
  opacity: 0.4;
  animation: db-chat-typing-bounce 1.2s ease-in-out infinite;
}
.db-chat-typing > span:nth-child(2) { animation-delay: 160ms; }
.db-chat-typing > span:nth-child(3) { animation-delay: 320ms; }
@keyframes db-chat-typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-3px); opacity: 1; }
}

/* File chips below builder bubbles. */
.db-chat-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: min(560px, 90%);
}
.db-chat-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--paper);
  border: 1px solid var(--rule);
  font-size: 12px;
  color: var(--ink);
  max-width: 100%;
  overflow: hidden;
}
.db-chat-file-chip-icon { color: var(--primary); font-size: 11px; }
.db-chat-file-chip-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
.db-chat-file-chip-size { color: var(--mute); font-size: 11px; }

.db-chat-review {
  width: min(620px, 92%);
  padding: 12px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper-2);
  box-shadow: var(--shadow-sm);
}
.db-chat-review-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.db-chat-review-kicker {
  color: var(--primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-chat-review h4 {
  margin: 0;
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
}
.db-chat-review p {
  margin: 0;
  color: var(--mute);
  font-size: 12px;
  line-height: 1.5;
}
.db-chat-review-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.db-chat-review-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--mute);
  font-size: 11px;
}
.db-chat-review-stat strong {
  color: var(--ink);
  font-weight: 800;
}
.db-chat-review-stat[data-tone="good"] { border-color: color-mix(in srgb, var(--success) 36%, var(--rule)); }
.db-chat-review-stat[data-tone="good"] strong { color: var(--success); }
.db-chat-review-stat[data-tone="warn"] { border-color: color-mix(in srgb, var(--warn) 44%, var(--rule)); }
.db-chat-review-stat[data-tone="warn"] strong { color: var(--warn); }

/* Composer pinned at the bottom of the left pane. */
.db-chat-composer {
  border-top: 1px solid var(--rule);
  padding: 10px 14px 12px;
  background: var(--paper-2);
}
.db-chat-composer .db-prompt-input-wrap { gap: 8px; }
.db-chat-composer .db-textarea {
  min-height: 60px;
  background: var(--paper-2);
  border-radius: 12px;
  border-color: var(--rule);
  box-shadow: var(--shadow-inset-hi);
}
.db-chat-composer-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(100, 54, 183, 0.22);
  border-radius: 12px;
  background: rgba(245, 239, 255, 0.92);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}
.db-chat-composer-alert button {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--primary);
  text-decoration: none;
  white-space: nowrap;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.db-chat-composer--disabled {
  border-top: 1px solid var(--rule);
  padding: 16px;
  background: var(--paper);
  text-align: center;
}

/* P1.1 R3: composer hoisted into a bottom dock spanning both panes. */
.db-composer-dock {
  flex-shrink: 0;
  border-top: 1px solid var(--rule);
  background: var(--paper-2);
  padding: 12px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-dock-up);
}
.db-composer-dock .db-prompt-input-wrap { gap: 8px; }
.db-composer-dock .db-textarea {
  min-height: 64px;
  background: var(--paper-2);
  border-radius: 12px;
  border-color: var(--rule);
  box-shadow: var(--shadow-inset-hi);
}
.db-composer-dock-input { width: 100%; }
.db-composer-dock-alert {
  padding: 8px 12px;
  border: 1px solid rgba(100, 54, 183, 0.22);
  border-radius: 10px;
  background: rgba(245, 239, 255, 0.92);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
}
.db-composer-dock--disabled {
  flex-shrink: 0;
  border-top: 1px solid var(--rule);
  padding: 14px;
  background: var(--paper);
  text-align: center;
}

/* P1.1 R4: clarification surfaces as a structured card above the preview,
   not as a chat bubble. Client-side hydration fills the inner form. */
.db-clarify-card {
  margin: 14px 14px 0;
  padding: 14px 16px 16px;
  border: 1px solid rgba(100, 54, 183, 0.28);
  border-radius: var(--radius-16);
  background: linear-gradient(180deg, rgba(245, 239, 255, 0.96), rgba(255, 255, 255, 0.96));
  box-shadow: var(--shadow-primary-lift);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-clarify-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.db-clarify-card-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}
.db-clarify-card-title {
  margin: 0;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--ink);
}
.db-clarify-card-loading {
  margin: 0;
  font-size: 13px;
  color: var(--mute);
}
.db-clarify-card .db-inline-question {
  margin: 0;
}

/* P1.1B: Preview / Code tab strip on the right pane. */
.db-canvas {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.db-canvas-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--rule);
  background: var(--paper-2);
}
.db-canvas-tab {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 8px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--mute);
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
}
.db-canvas-tab:hover {
  color: var(--ink);
  background: var(--paper);
}
.db-canvas-tab--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--paper);
}
.db-canvas-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 0 6px;
  height: 18px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 800;
}
.db-canvas-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.db-canvas-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.db-canvas-panel[hidden] { display: none; }

/* Code panel — Phase B3 top-tab bar + content stack. Empty-state path keeps
   its own --empty modifier which overrides this layout to a centered card. */
.db-code-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--paper-2);
}
.db-code-rail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--rule);
  background: var(--paper);
}
.db-code-rail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--rule);
}
.db-code-rail-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
}
.db-code-rail-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
}
.db-code-rail-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.db-code-file {
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  color: var(--ink);
  transition: background 120ms ease;
}
.db-code-file:hover { background: var(--paper-2); }
.db-code-file--active {
  background: var(--primary-soft);
  color: var(--ink);
}
.db-code-file-path {
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-code-file-meta {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--mute);
}
.db-code-file--active .db-code-file-meta { color: var(--primary); }
.db-code-stage {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 12px 14px 16px;
  gap: 10px;
  background: var(--paper-2);
}
.db-code-explanation {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper);
  font-size: 12px;
  color: var(--ink);
  line-height: 1.5;
}
.db-code-content {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  /* Code panel is intentionally always-dark (carbon look) regardless of theme.
   * Bind to foundation slate tokens, not semantic --bg-strong-950 (which inverts
   * to white in dark theme and would invert this surface incorrectly). */
  background: var(--dash-slate-950);
  color: var(--dash-slate-200);
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.55;
  overflow: auto;
  max-height: 100%;
  white-space: pre;
}
.db-code-content code {
  font: inherit;
  color: inherit;
  background: transparent;
}
.db-code-content[hidden] { display: none; }
.db-code-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}
.db-code-empty {
  max-width: 360px;
  text-align: center;
}
.db-code-empty-title {
  margin: 0 0 6px;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--ink);
}
.db-code-empty-body {
  margin: 0;
  font-size: 13px;
  color: var(--mute);
  line-height: 1.5;
}

/* ── Right pane: live preview ── */
.db-live-preview-pane {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.db-live-preview-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(228, 227, 222, 0.9);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
}
.db-live-preview-topbar-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.db-live-preview-kicker {
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--primary);
  text-transform: uppercase;
}
.db-live-preview-action {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  margin: 4px 0 14px;
  padding: 10px 14px;
  border-radius: var(--radius-full);
  background: var(--primary);
  color: var(--paper-2);
  border: 0;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.db-live-preview-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.db-live-preview-title {
  margin: 0;
  font-size: var(--text-title-sm);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.db-live-preview-context {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mute);
}
.db-live-preview-context code {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink);
}
.db-live-preview-topbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.db-live-preview-device {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--rule);
  color: var(--mute);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.db-live-preview-device--active {
  border-color: rgba(94, 42, 172, 0.2);
  background: rgba(94, 42, 172, 0.08);
  color: var(--primary-strong);
}
.db-live-preview-state {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  min-height: 0;
}
.db-live-preview-state--idle,
.db-live-preview-state--running,
.db-live-preview-state--error {
  align-items: center;
  justify-content: center;
  padding: 32px;
}
.db-live-preview-empty {
  text-align: center;
  max-width: 380px;
}
.db-live-preview-empty-art {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  border-radius: var(--radius-16);
  background: var(--paper-2);
  border: 1px dashed var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mute);
  font-size: var(--text-display-md);
}
.db-live-preview-empty-art--error {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
  font-weight: 700;
}
.db-live-preview-empty-grid {
  position: absolute;
  inset: 12px;
  border-radius: 8px;
  background-image:
    linear-gradient(var(--rule) 1px, transparent 1px),
    linear-gradient(90deg, var(--rule) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.4;
}
.db-live-preview-empty-cursor {
  position: relative;
  color: var(--primary);
  font-size: var(--text-title-md);
}
.db-live-preview-empty-title {
  margin: 0 0 6px;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--ink);
}
.db-live-preview-empty-body {
  margin: 0;
  font-size: 13px;
  color: var(--mute);
  line-height: 1.5;
}

/* Pipeline steps (running state). */
.db-live-preview-pipeline {
  width: 100%;
  max-width: 420px;
}
.db-live-preview-heading {
  margin: 0 0 4px;
  font-size: var(--text-title-sm);
  font-weight: 600;
  color: var(--ink);
}
.db-live-preview-sub {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--mute);
}
.db-pipeline-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-pipeline-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--paper-2);
  border: 1px solid var(--rule-2);
  font-size: 13px;
  color: var(--mute);
  transition: background 160ms ease, border-color 160ms ease;
}
.db-pipeline-step[data-state="active"] {
  background: var(--primary-card);
  border-color: var(--primary-soft);
  color: var(--ink);
}
.db-pipeline-step[data-state="done"] {
  color: var(--ink);
}
.db-pipeline-step[data-state="error"] {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}
.db-pipeline-step-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  background: var(--rule-2);
  color: var(--mute);
}
.db-pipeline-step-icon--done { background: var(--success); color: #fff; }
.db-pipeline-step-icon--active {
  background: transparent;
  border: 2px solid var(--primary);
  border-right-color: transparent;
  animation: db-spin 0.9s linear infinite;
}
.db-pipeline-step-icon--error { background: var(--danger); color: #fff; }
.db-pipeline-step-icon--pending {
  background: transparent;
  border: 1.5px dashed var(--rule);
}
.db-pipeline-step-label {
  font-weight: 600;
  letter-spacing: -0.005em;
}
.db-pipeline-step-detail {
  margin-left: auto;
  font-size: 12px;
  color: var(--mute);
}

/* Ready state: iframe + foundation score badge. */
.db-live-preview-state--ready { padding: 0; }
.db-live-preview-state--baseline {
  position: relative;
  /* Force vertical stack: ribbon (top, natural) + iframe (fills rest).
     Without explicit column direction, parent flex (row) tiled children
     and broke iframe sizing. */
  flex-direction: column;
  overflow: hidden;
}
.db-live-preview-state--baseline > .db-baseline-ribbon,
.db-live-preview-state--baseline > .db-baseline-auth-note {
  flex-shrink: 0;
}
.db-live-preview-state--baseline > iframe.db-live-preview-frame {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}
/* Q: yellow auth-note di iframe = visual noise, ambil banyak space.
   Hidden by default per user request (post 2026-05-28). Restore via
   removing this rule kalau perlu for compliance/UX signal back. */
.db-baseline-auth-note { display: none !important; }
.db-live-preview-frame-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--paper-2);
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  transition: width 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}
.db-live-preview-state--ready[data-preview-viewport="tablet"] .db-live-preview-frame-shell {
  width: min(820px, 100%);
  border-color: var(--rule);
  box-shadow: var(--shadow-sm);
}
.db-live-preview-state--ready[data-preview-viewport="mobile"] .db-live-preview-frame-shell {
  width: min(420px, 100%);
  border-color: var(--rule);
  box-shadow: var(--shadow-sm);
}
.db-live-preview-frame-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--rule);
  background: color-mix(in srgb, var(--paper-2) 92%, transparent);
  color: var(--mute);
  font-size: 11px;
  font-weight: 700;
}
.db-live-preview-frame-toolbar div {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.db-live-preview-frame-toolbar button,
.db-live-preview-frame-toolbar a {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--primary);
  font: inherit;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
}
.db-live-preview-frame {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  border: 0;
  display: block;
  background: var(--paper-2);
}
.db-preview-harness {
  width: min(980px, calc(100% - 48px));
  min-height: min(620px, calc(100% - 96px));
  margin: 48px auto 24px;
  display: grid;
  grid-template-columns: 208px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: var(--paper-2);
  box-shadow: var(--shadow-md);
  text-align: left;
}
.db-preview-harness-rail {
  padding: 16px;
  border-right: 1px solid var(--rule);
  background: var(--paper);
}
.db-preview-harness-brand {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary);
  color: var(--paper-2);
  font-weight: 900;
}
.db-preview-harness-rail nav {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}
.db-preview-harness-nav-item {
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 8px;
  color: var(--mute);
  font-size: 13px;
  font-weight: 750;
}
.db-preview-harness-nav-item--active {
  background: var(--paper-2);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.db-preview-harness-main {
  min-width: 0;
  padding: 24px;
}
.db-preview-harness-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.db-preview-harness-kicker {
  color: var(--primary);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-preview-harness h3 {
  margin: 6px 0 0;
  color: var(--ink);
  font-size: var(--text-display-sm);
  line-height: 1.2;
  font-weight: 900;
}
.db-preview-harness p {
  max-width: 660px;
  margin: 8px 0 0;
  color: var(--mute);
  font-size: 13px;
  line-height: 1.55;
}
.db-preview-harness-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--success);
  background: var(--success-soft);
  color: var(--success);
  font-size: 12px;
  font-weight: 900;
}
.db-preview-harness-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}
.db-preview-harness-card {
  min-height: 94px;
  padding: 14px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper-3);
}
.db-preview-harness-card span {
  display: block;
  color: var(--mute);
  font-size: 12px;
  font-weight: 700;
}
.db-preview-harness-card strong {
  display: block;
  margin-top: 14px;
  color: var(--ink);
  font-size: var(--text-display-sm);
  line-height: 1;
  font-weight: 900;
}
.db-preview-harness-panel {
  margin-top: 12px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
  background: var(--paper-2);
}
.db-preview-harness-panel-head {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--rule);
}
.db-preview-harness-panel-head strong {
  color: var(--ink);
  font-size: 14px;
  font-weight: 900;
}
.db-preview-harness-panel-head span {
  color: var(--mute);
  font-size: 12px;
  font-weight: 750;
}
.db-preview-harness table {
  width: 100%;
  border-collapse: collapse;
}
.db-preview-harness td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--rule-2);
  color: var(--ink);
  font-size: 13px;
}
.db-preview-harness tr:last-child td {
  border-bottom: 0;
}
.db-baseline-ribbon {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 28px);
  padding: 6px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--paper-2) 92%, transparent);
  border: 1px solid var(--rule);
  box-shadow: var(--shadow-sm);
  color: var(--mute);
  font-size: 12px;
  font-weight: 700;
}
.db-baseline-ribbon code {
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 11px;
}
.db-baseline-ribbon a {
  color: var(--primary);
  white-space: nowrap;
}
.db-auth-preview-callout {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 2;
  width: min(520px, calc(100% - 28px));
  max-height: min(360px, calc(100% - 96px));
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--warn);
  border-radius: 10px;
  background: color-mix(in srgb, var(--paper-2) 96%, transparent);
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  text-align: left;
}
.db-auth-preview-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.db-auth-preview-kicker {
  color: var(--warn);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-auth-preview-head strong {
  font-size: 12px;
  font-weight: 800;
}
.db-auth-preview-callout p {
  margin: 8px 0 0;
  color: var(--mute);
  font-size: 12px;
  line-height: 1.45;
}
.db-auth-preview-meta {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  color: var(--mute);
  font-size: 11px;
  line-height: 1.4;
}
.db-auth-preview-meta span {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.db-auth-preview-meta code,
.db-auth-preview-callout code {
  padding: 2px 4px;
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 11px;
}
.db-auth-preview-callout ol {
  margin: 10px 0 0 16px;
  padding: 0;
  color: var(--ink);
  font-size: 12px;
  line-height: 1.5;
}
.db-baseline-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-baseline-shell {
  width: min(760px, 100%);
  min-height: 460px;
  display: grid;
  grid-template-columns: 172px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper-2);
  box-shadow: var(--shadow-sm);
  text-align: left;
}
.db-baseline-shell-rail {
  padding: 16px;
  border-right: 1px solid var(--rule);
  background: var(--paper);
}
.db-baseline-shell-mark {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary);
  color: var(--paper-2);
  font-weight: 800;
}
.db-baseline-shell-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
}
.db-baseline-shell-nav-item {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--mute);
  font-size: 12px;
  font-weight: 700;
}
.db-baseline-shell-nav-item--active {
  background: var(--paper-2);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.db-baseline-shell-main {
  min-width: 0;
  padding: 16px;
}
.db-baseline-shell-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.db-baseline-shell-title {
  margin: 0;
  font-size: var(--text-title-sm);
  line-height: 1.25;
  font-weight: 800;
  color: var(--ink);
}
.db-baseline-shell-meta {
  margin: 4px 0 0;
  color: var(--mute);
  font-size: 12px;
  line-height: 1.45;
}
.db-baseline-shell-status {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: var(--warn-soft);
  color: var(--warn);
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
}
.db-baseline-shell-description {
  margin: 16px 0 0;
  color: var(--ink);
  font-size: 13px;
  line-height: 1.55;
}
.db-baseline-shell-reason {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--info-soft);
  color: var(--ink);
  font-size: 12px;
  line-height: 1.45;
}
.db-baseline-auth-summary {
  margin: 10px 0 0;
  padding: 10px;
  border: 1px solid var(--warn);
  border-radius: 8px;
  background: var(--warn-soft);
}
.db-baseline-auth-summary span {
  display: block;
  color: var(--warn);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-baseline-auth-summary p {
  margin: 4px 0 0;
  color: var(--ink);
  font-size: 12px;
  line-height: 1.45;
}
.db-baseline-shell-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}
.db-baseline-shell-panel {
  min-height: 88px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--rule);
  background: var(--paper-3);
}
.db-baseline-shell-panel--wide {
  grid-column: 1 / -1;
  min-height: 118px;
}
.db-baseline-shell-panel span {
  display: block;
  height: 10px;
  margin-bottom: 10px;
  border-radius: var(--radius-full);
  background: var(--rule);
}
.db-baseline-shell-panel span:nth-child(1) { width: 56%; }
.db-baseline-shell-panel span:nth-child(2) { width: 84%; }
.db-baseline-shell-panel span:nth-child(3) { width: 38%; }
.db-baseline-shell-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}
.db-baseline-shell-hints li {
  min-height: 54px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--rule-2);
  background: var(--paper-2);
  color: var(--mute);
  font-size: 11px;
  line-height: 1.4;
}
.db-baseline-command {
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper);
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
}
.db-baseline-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.db-baseline-copy {
  min-height: 36px;
}
.db-baseline-note {
  margin-top: 12px;
}
.db-baseline-error {
  margin: 10px 0 0;
  color: var(--danger);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.45;
}
.db-foundation-badge {
  position: absolute;
  top: 78px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--paper-2);
  border: 1px solid var(--rule);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  z-index: 2;
}
.db-foundation-badge-label {
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
}
.db-foundation-badge--good { border-color: var(--success); color: var(--success); }
.db-foundation-badge--ok { border-color: var(--warn); color: var(--warn); }
.db-foundation-badge--low { border-color: var(--danger); color: var(--danger); }
.db-foundation-badge + .db-foundation-badge { top: 112px; }

/* Responsive: stack on narrow screens. */
@media (max-width: 880px) {
  .db-chat-shell {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(280px, 50vh) 0 1fr;
    height: auto;
  }
  .db-chat-resizer { display: none; }
  .db-chat-pane--left { border-bottom: 1px solid var(--rule); }
  .db-live-preview-topbar { align-items: flex-start; flex-direction: column; }
  .db-preview-harness {
    width: min(100% - 24px, 620px);
    grid-template-columns: 1fr;
    margin-top: 48px;
  }
  .db-preview-harness-rail {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
  .db-preview-harness-rail nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .db-preview-harness-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .db-baseline-shell { grid-template-columns: 1fr; }
  .db-baseline-shell-rail { border-right: 0; border-bottom: 1px solid var(--rule); }
  .db-baseline-shell-nav { flex-direction: row; flex-wrap: wrap; }
  .db-baseline-shell-hints { grid-template-columns: 1fr; }
}

/* ── Inline clarification form ────────────────────────────────────────── */
.db-inline-question {
  width: min(520px, 84%);
  margin-top: 8px;
  padding: 12px;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: var(--paper-3);
  box-shadow: var(--shadow-sm);
}
.db-inline-question-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.db-inline-question-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
  color: var(--ink);
}
.db-inline-question-sub {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--mute);
}
.db-inline-question-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--primary-ring);
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.db-inline-q {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid var(--rule-2);
}
.db-inline-q:first-of-type { border-top: 0; padding-top: 0; }
.db-inline-q-label {
  font-size: 13px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--ink);
}
.db-inline-q-help {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--mute);
}
.db-inline-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.db-inline-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 8px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.db-inline-option input {
  margin: 0;
  accent-color: var(--primary);
}
.db-inline-option:has(input:checked) {
  border-color: var(--primary-ring);
  background: var(--primary-soft);
  color: var(--primary-strong);
}
.db-inline-textarea {
  width: 100%;
  min-height: 64px;
  resize: vertical;
  padding: 8px 10px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
}
.db-inline-question-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}
.db-inline-question-msg {
  font-size: 12px;
  color: var(--mute);
}
.db-inline-question-submit {
  appearance: none;
  border: 0;
  border-radius: 10px;
  background: var(--primary);
  color: var(--paper-2);
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.db-inline-question-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── OpenAI connect form ──────────────────────────────────────────────── */
.db-connect-shell {
  padding: 24px;
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.db-connect-head { display: flex; flex-direction: column; gap: 8px; }
.db-connect-title {
  font-size: var(--text-display-md);
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.025em;
  margin: 0;
}
.db-connect-lede {
  font-size: var(--text-body);
  color: var(--mute);
  line-height: 1.5;
  margin: 0;
  max-width: 56ch;
}
.db-connect-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) {
  .db-connect-grid { grid-template-columns: 1fr; }
}
.db-connect-card {
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 247, 245, 0.92));
  border: 1px solid rgba(228, 227, 222, 0.92);
  border-radius: var(--radius-16);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
  box-shadow: var(--shadow-overlay-soft);
}
.db-connect-card:hover {
  border-color: rgba(94, 42, 172, 0.26);
  transform: translateY(-1px);
}
.db-connect-card--active {
  border-color: var(--primary);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--primary) 22%, transparent),
    0 18px 40px rgba(94, 42, 172, 0.08);
}
.db-connect-card-head { display: flex; flex-direction: column; gap: 6px; }
.db-connect-card-tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary);
  font-weight: 600;
}
.db-connect-card-title {
  font-size: var(--text-title-sm);
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}
.db-connect-card-body {
  font-size: 14px;
  line-height: 1.55;
  color: var(--mute);
  margin: 0;
}
.db-connect-card-body code,
.db-connect-card-body a {
  color: var(--ink);
  font-weight: 500;
}
.db-connect-card-body a { text-decoration: underline; text-decoration-color: var(--rule); }
.db-connect-card-body a:hover { text-decoration-color: var(--primary); }
.db-connect-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}
.db-connect-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mute);
  font-weight: 600;
}
.db-connect-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  border: 1px solid var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  color: var(--ink);
  font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
}
.db-connect-input:focus {
  outline: 2px solid color-mix(in srgb, var(--primary) 30%, transparent);
  outline-offset: 0;
  border-color: var(--primary);
}
.db-connect-submit {
  align-self: flex-start;
  margin-top: 4px;
}
.db-connect-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.db-connect-cli-copy {
  align-self: flex-start;
}
.db-connect-form-msg {
  font-size: 13px;
  margin: 4px 0 0;
  min-height: 1em;
  line-height: 1.5;
}
.db-connect-form-msg--pending { color: var(--mute); }
.db-connect-form-msg--ok { color: var(--success); }
.db-connect-form-msg--err { color: var(--danger); }
.db-connect-status {
  font-size: 10px;
  margin-right: 4px;
}
.db-connect-status--ok { color: var(--success); }
.db-connect-status--pending { color: var(--warn); }
.db-connect-muted { color: var(--mute); font-weight: 400; }
.db-connect-pre {
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
  color: var(--ink);
  overflow-x: auto;
  line-height: 1.55;
  margin: 0;
}
.db-connect-pre code { background: none; padding: 0; color: inherit; }
.db-connect-cli-use { align-self: flex-start; }
.db-connect-fallback {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--warn-soft);
  background: color-mix(in srgb, var(--warn-soft) 48%, var(--static-white));
}
.db-connect-fallback-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.db-connect-steps {
  margin: 0;
  padding-left: 16px;
  color: var(--mute);
  font-size: 13px;
  line-height: 1.6;
}
.db-connect-steps li + li {
  margin-top: 4px;
}
.db-connect-foot {
  font-size: 12px;
  color: var(--mute);
  line-height: 1.5;
  padding: 14px 16px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: var(--radius-md);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.db-connect-foot-dot { color: var(--warn); font-size: 10px; margin-top: 2px; }

/* ─────────────────────────────────────────────────────────────────────── */
/* P1.2A: Canvas-first workspace shell                                     */
/* ─────────────────────────────────────────────────────────────────────── */

.db-main:has(.db-workspace) {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 14px;
  gap: 0;
  height: calc(100vh - 64px);
}

.db-workspace {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  height: 100%;
  border-radius: var(--radius-16);
  overflow: hidden;
  border: 1px solid var(--rule);
  box-shadow:
    0 10px 28px rgba(26, 26, 26, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  background: var(--paper-2);
}

.db-anchor-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--paper-2);
  border-bottom: 1px solid var(--rule);
  min-height: 56px;
  flex-wrap: wrap;
}
.db-anchor-context {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.db-anchor-target {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.db-anchor-route {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper);
  font-size: 12px;
  color: var(--ink);
  max-width: 100%;
  min-width: 0;
}
.db-anchor-route-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mute);
}
.db-anchor-route-code {
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-anchor-route-nav {
  color: var(--mute);
  font-size: 11px;
}
.db-anchor-route--empty {
  color: var(--mute);
  border-style: dashed;
  font-weight: 600;
}
.db-anchor-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}
.db-anchor-meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--paper);
  border: 1px solid var(--rule);
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
}
.db-anchor-meta-chip--repo { color: var(--ink); }
.db-anchor-meta-chip--branch { color: var(--primary); }
.db-anchor-meta-chip--commit { color: var(--mute); }

.db-workspace-auth-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
  flex-wrap: wrap;
  min-height: 44px;
}
.db-workspace-auth-strip-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.db-workspace-auth-strip-group .db-select,
.db-workspace-auth-strip-group .db-text-input {
  padding: 4px 10px;
  font-size: 12px;
  width: auto;
  min-width: 160px;
}
.db-workspace-auth-strip-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.db-workspace-auth-strip-spacer { flex: 1; }
.db-workspace-auth-strip-chips {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.db-progress-strip {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary-soft) 24%, var(--paper-2)) 0%, var(--paper-2) 100%);
  border-bottom: 1px solid var(--rule);
  padding: 10px 16px;
}
.db-progress-strip--hidden,
.db-progress-strip[data-visible="false"] {
  display: none;
}
.db-progress-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.db-progress-step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  background: transparent;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--mute);
  position: relative;
}
.db-progress-step + .db-progress-step::before {
  content: "→";
  margin-right: 4px;
  color: var(--mute);
  font-size: 11px;
  opacity: 0.4;
}
.db-progress-step-glyph {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  border-radius: var(--radius-full);
}
.db-progress-step[data-state="pending"] .db-progress-step-glyph {
  color: var(--mute);
  background: transparent;
  border: 1px dashed var(--rule);
}
.db-progress-step[data-state="active"] {
  color: var(--ink);
  background: var(--paper);
  border-color: var(--rule);
  box-shadow: var(--shadow-chip-tint);
}
.db-progress-step[data-state="active"] .db-progress-step-glyph {
  color: var(--text-white-0, #fff);
  background: var(--primary);
  border: 1px solid var(--primary);
  animation: db-progress-pulse 1.6s ease-in-out infinite;
}
.db-progress-step[data-state="done"] {
  color: var(--ink);
}
.db-progress-step[data-state="done"] .db-progress-step-glyph {
  color: var(--text-white-0, #fff);
  background: var(--success, #1f9d55);
  border: 1px solid var(--success, #1f9d55);
}
.db-progress-step[data-state="error"] .db-progress-step-glyph {
  color: var(--text-white-0, #fff);
  background: var(--state-error-base, #e5484d);
  border: 1px solid var(--state-error-base, #e5484d);
}
.db-progress-step-detail {
  color: var(--mute);
  font-size: 11px;
  font-weight: 500;
}
@keyframes db-progress-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 40%, transparent); }
  50%      { box-shadow: 0 0 0 5px color-mix(in srgb, var(--primary) 0%, transparent); }
}

.db-canvas-region {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(251, 250, 248, 0.98), rgba(255, 255, 255, 0.96));
}
.db-canvas-region .db-canvas {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.db-canvas-region .db-canvas-panel,
.db-canvas-region .db-canvas-stage {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.db-canvas-region .db-live-preview-pane {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.db-workspace-hero {
  padding: 24px;
  display: flex;
  justify-content: center;
}
.db-workspace-hero > * {
  max-width: 720px;
  width: 100%;
}

.db-prompt-strip {
  flex-shrink: 0;
  padding: 12px 16px 14px;
  background: var(--paper-2);
  border-top: 1px solid var(--rule);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}
.db-prompt-strip > * {
  width: 100%;
  max-width: 720px;
}
.db-prompt-strip-alert {
  margin-bottom: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(100, 54, 183, 0.22);
  border-radius: 10px;
  background: rgba(245, 239, 255, 0.92);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
}
.db-prompt-strip-input { width: 100%; }
.db-prompt-strip .db-textarea {
  min-height: 64px;
  background: var(--paper-2);
  border-radius: 12px;
  border-color: var(--rule);
  box-shadow: var(--shadow-inset-hi);
}
.db-prompt-strip--disabled {
  flex-shrink: 0;
  padding: 14px;
  background: var(--paper);
  text-align: center;
  border-top: 1px solid var(--rule);
}

/* ─────────────────────────────────────────────────────────────────────── */
/* P1.2B: Lovable-aligned shell — single topbar + dark rail + canvas       */
/* ─────────────────────────────────────────────────────────────────────── */

.db-main:has(.db-shell) {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0;
  gap: 0;
  /* Let body flex distribute height — no magic-number calc.
     body = column flex, header (natural) + this (flex:1) + footer (natural). */
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
/* When .db-shell mounted, suppress page footer chrome so the .db-split
   (canvas + chat rail) gets remaining viewport height. Keep page header
   (Dash Build + Connected status + theme toggle) — operational info. */
body:has(.db-shell) > .db-footer {
  display: none;
}

.db-shell {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--paper);
}

/* Top bar — single row, 4 clusters */
.db-topbar {
  display: grid;
  grid-template-columns: minmax(220px, auto) auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 8px 14px;
  background: var(--paper-2);
  border-bottom: 1px solid var(--rule);
  min-height: 52px;
}
.db-topbar-project {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.db-topbar-project-dot {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--primary);
  flex-shrink: 0;
}
.db-topbar-project-id {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}
.db-topbar-project-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-topbar-project-theme {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--primary-soft);
  color: var(--primary);
}
.db-topbar-project-sub {
  font-size: 11px;
  color: var(--mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-topbar-tabs {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: var(--paper);
  border: 1px solid var(--rule);
}
.db-topbar-tab {
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--mute);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 120ms ease, color 120ms ease;
}
.db-topbar-tab:hover { color: var(--ink); }
.db-topbar-tab--active {
  background: var(--primary);
  color: var(--text-white-0);
}
.db-topbar-tab--active .db-canvas-tab-count {
  background: rgba(255, 255, 255, 0.22);
  color: var(--text-white-0);
}
.db-topbar-tab-icon {
  font-size: 11px;
  opacity: 0.85;
}
.db-topbar-route {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: center;
  min-width: 0;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--paper);
  border: 1px solid var(--rule);
  max-width: 100%;
}
.db-topbar-route-code {
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-topbar-route-nav {
  color: var(--mute);
  font-size: 11px;
  font-weight: 600;
}
.db-topbar-route-empty {
  color: var(--mute);
  font-size: 11px;
  font-style: italic;
}
.db-topbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Split: rail + resizer + canvas. Width controlled via --db-split-left
   CSS var (saved to localStorage by client/app.ts drag handler).
   Default 32%, min 240px (rail readable), max 60% (canvas not crushed). */
.db-split {
  display: grid;
  grid-template-columns:
    minmax(240px, var(--db-split-left, 32%))
    6px
    minmax(0, 1fr);
  flex: 1;
  min-height: 0;
  background: var(--rule);
  gap: 0;
}
.db-split.is-resizing,
.db-split.is-resizing * {
  cursor: col-resize !important;
  user-select: none;
}
.db-split-resizer {
  position: relative;
  background: var(--rule);
  cursor: col-resize;
  outline: none;
  transition: background 120ms ease;
}
.db-split-resizer::before {
  content: "";
  position: absolute;
  inset: 0 -3px;
  border-radius: 3px;
}
.db-split-resizer:hover,
.db-split-resizer:focus-visible,
.db-split.is-resizing .db-split-resizer {
  background: var(--primary-soft);
}
.db-split-resizer:focus-visible {
  box-shadow: inset 0 0 0 1px var(--primary);
}
.db-split-resizer::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 28px;
  border-radius: 2px;
  background: var(--mute);
  opacity: 0.4;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.db-split-resizer:hover::after,
.db-split.is-resizing .db-split-resizer::after {
  opacity: 1;
  background: var(--primary);
}

/* Light rail — consistent with canvas. Uses Dash semantic tokens only
   per design.md CR-5 (no raw hex). */
.db-rail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--paper-2);
  color: var(--ink);
  border-right: 1px solid var(--rule);
}
.db-rail-history {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 14px 4px;
  scroll-behavior: smooth;
}
.db-rail-history .db-chat-thread {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-rail-history .db-chat-msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.db-rail-history .db-chat-msg[data-role="user"] .db-chat-bubble {
  background: var(--paper);
  border: 1px solid var(--rule);
  color: var(--ink);
  border-radius: 10px;
  /* Spacing 4-multiple (spacing-8 + spacing-12). Removed align-self: stretch
     so bubble shrinks to fit text content instead of filling rail width. */
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.45;
}
.db-rail-history .db-chat-msg[data-role="builder"] .db-chat-bubble {
  background: transparent;
  border: 0;
  /* Builder = transparent inline copy, no bg. Horizontal padding zero so
     text aligns flush with rail. spacing-4 vertical only. */
  padding: 4px 0;
  color: var(--mute);
  font-size: 13px;
  line-height: 1.5;
}
.db-rail-history .db-chat-time {
  color: var(--mute);
  font-size: 10px;
}
.db-rail-history .db-chat-thread--empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.db-rail-history .db-chat-empty {
  text-align: center;
  max-width: 280px;
  padding: 16px 14px;
}
.db-rail-history .db-chat-empty-mark {
  color: var(--primary);
  font-size: var(--text-title-md);
  display: inline-block;
  margin-bottom: 8px;
}
.db-rail-history .db-chat-empty-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}
.db-rail-history .db-chat-empty-body {
  margin: 0;
  font-size: 12px;
  color: var(--mute);
  line-height: 1.5;
}
.db-rail-history .db-chat-review {
  margin-top: 6px;
  padding: 10px;
  border-radius: 10px;
  background: var(--paper);
  border: 1px solid var(--rule);
  color: var(--ink);
}
.db-rail-history .db-chat-review h4 {
  margin: 0;
  font-size: 12px;
  color: var(--ink);
}
.db-rail-history .db-chat-review-kicker {
  color: var(--primary);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.db-rail-history .db-chat-review-stat {
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--ink);
}
.db-rail-history .db-chat-files {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.db-rail-history .db-chat-file-chip {
  background: var(--paper);
  border: 1px solid var(--rule);
  color: var(--ink);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
}

.db-rail-thinking {
  margin: 10px 4px 4px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  animation: db-rail-thinking-fade 1.6s ease-in-out infinite;
}
.db-rail-thinking-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--primary);
  animation: db-rail-thinking-pulse 1.6s ease-in-out infinite;
}
.db-rail-thinking--clarify {
  background: var(--warn-soft);
  color: var(--warn);
}
@keyframes db-rail-thinking-fade {
  0%, 100% { opacity: 0.78; }
  50%      { opacity: 1; }
}
@keyframes db-rail-thinking-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.35); }
}

.db-rail-composer {
  flex-shrink: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--rule);
  background: var(--paper-2);
}
.db-rail-composer-input { width: 100%; }
.db-rail-composer .db-prompt-input-wrap { gap: 6px; }
.db-rail-composer .db-textarea {
  background: var(--paper);
  color: var(--ink);
  border-radius: 10px;
  border: 1px solid var(--rule);
  min-height: 56px;
  font-size: 13px;
  padding: 10px 12px;
}
.db-rail-composer--disabled {
  flex-shrink: 0;
  padding: 14px;
  background: var(--paper-2);
  border-top: 1px solid var(--rule);
  color: var(--mute);
  text-align: center;
}
.db-rail-empty {
  padding: 16px 14px;
  color: var(--ink);
}

/* Canvas region in v2 shell — full-bleed, no extra wrapper chrome */
.db-shell .db-canvas-region {
  background: var(--paper);
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.db-canvas-v2 {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--paper);
}
.db-canvas-v2 .db-canvas-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.db-canvas-v2 .db-canvas-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.db-canvas-v2 .db-canvas-panel[hidden] { display: none; }
.db-baseline-auth-note {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 14px;
  background: var(--warn-soft);
  color: var(--ink);
  font-size: 12px;
  border-bottom: 1px solid var(--rule);
}
.db-baseline-auth-note strong {
  color: var(--warn);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.db-canvas-v2 .db-live-preview-pane {
  width: 100%;
  flex: 1;
  min-height: 0;
}

@media (max-width: 900px) {
  .db-split { grid-template-columns: 1fr; grid-template-rows: minmax(220px, 40vh) 1fr; }
  .db-topbar { grid-template-columns: 1fr; gap: 8px; }
  .db-topbar-route { justify-self: start; }
}

/* === Phase B1 topbar polish === */
/* Cluster A wraps project pill + repo dropdown so they ride together on the
   left edge of the topbar. */
.db-topbar-cluster-a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.db-topbar-cluster-a .db-topbar-project { flex-shrink: 0; }

/* Compact repo dropdown with leading folder icon. Uses semantic tokens only.
   The inner native <select> is restyled to a chip-sized control so it does
   not dominate the topbar. */
.db-topbar-repo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--ink);
  font-size: 12px;
  min-width: 0;
  max-width: 240px;
  transition: border-color 120ms ease, background 120ms ease;
}
.db-topbar-repo:hover {
  border-color: var(--primary-soft);
  background: var(--paper-2);
}
.db-topbar-repo:focus-within {
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
}
.db-topbar-repo-icon {
  font-size: 12px;
  line-height: 1;
  opacity: 0.7;
  flex-shrink: 0;
}
.db-topbar-repo .db-select {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 4px 16px 4px 2px;
  width: auto;
  min-width: 110px;
  max-width: 200px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'><path fill='%236b6b68' d='M3 4.5l3 3 3-3z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 2px center;
}
.db-topbar-repo .db-select:focus {
  outline: none;
  box-shadow: none;
  background-color: transparent;
}
.db-topbar-repo .db-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Branch chip — read-only badge next to the route pill. Visual parity with
   .db-topbar-route but compressed; edit affordance arrives in Phase P2 via
   the Settings dropdown. */
.db-topbar-branch-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--mute);
  font-size: 11px;
  font-weight: 600;
}
.db-topbar-branch-chip-icon {
  font-size: 11px;
  line-height: 1;
  color: var(--primary);
  opacity: 0.8;
}
.db-topbar-branch-chip-label {
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  color: var(--ink);
  font-weight: 700;
  letter-spacing: -0.005em;
}

/* History tab placeholder — same visual rhythm as Preview/Code so the
   triple-tab row reads as a unified Lovable-style segmented control. */
.db-topbar-tab[data-tab="history"] {
  /* Inherits .db-topbar-tab styles; no extra rules needed today. Reserved
     so Agent B2 can hook ::after badges (e.g. unread runs) without
     touching the shared base. */
}

/* Responsive: at narrow viewports collapse mode-tab labels so the three
   buttons stay on one row alongside the project pill + repo dropdown.
   Icons remain visible for affordance; full label resurfaces via title=. */
@media (max-width: 800px) {
  .db-topbar-tab-label { display: none; }
  .db-topbar-tab { padding: 6px 8px; }
  .db-topbar-tab-icon { font-size: 13px; opacity: 1; }
  .db-topbar-branch-chip-label { display: none; }
  .db-topbar-branch-chip { padding: 2px 6px; }
}

/* At very narrow viewports the repo dropdown can shrink further but stays
   visible — switching repo is a primary action. */
@media (max-width: 640px) {
  .db-topbar-repo { max-width: 160px; }
  .db-topbar-repo .db-select { min-width: 80px; max-width: 130px; }
}

/* === Phase B3 code panel file tabs + syntax === */
/* Top tab strip. Sticks to the top of the panel; the tab list scrolls
   horizontally when files overflow so the layout never wraps. All chrome
   uses semantic tokens so .dark auto-themes the strip. */
.db-code-tab-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 36px;
  border-bottom: 1px solid var(--rule);
  background: var(--paper);
}
.db-code-tab-scroll {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}
.db-code-tab-scroll::-webkit-scrollbar { height: 6px; }
.db-code-tab-scroll::-webkit-scrollbar-thumb { background: var(--rule); border-radius: var(--radius-pill); }
.db-code-tab-bar-end {
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-left: 1px solid var(--rule);
  background: var(--paper-2);
}
.db-code-tab-count {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mute);
}

/* Individual tab — inline-flex keeps the label and close button on one row.
   Active tab pulls the canvas surface color forward so it visually connects
   to the file body below. */
.db-code-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px 0 0;
  border-right: 1px solid var(--rule);
  background: transparent;
  color: var(--mute);
  max-width: 200px;
  min-width: 0;
  flex-shrink: 0;
  transition: background 120ms ease, color 120ms ease;
}
.db-code-tab[hidden] { display: none; }
.db-code-tab:hover { background: var(--paper-2); color: var(--ink); }
.db-code-tab--active {
  background: var(--paper-2);
  color: var(--ink);
  box-shadow: inset 0 -2px 0 var(--primary);
}
.db-code-tab-label {
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  padding: 8px 6px 8px 12px;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}
.db-code-tab-label:focus-visible { outline: none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
.db-code-tab-name {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.db-code-tab--active .db-code-tab-name { color: var(--primary); }
.db-code-tab-close {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--mute-2);
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  transition: background 120ms ease, color 120ms ease;
}
.db-code-tab-close:hover { background: var(--rule); color: var(--ink); }
.db-code-tab-close:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

/* Per-file content wrap. The breadcrumb is sticky inside the scroll area so
   long files still expose the file path while scrolling. */
.db-code-content-wrap { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.db-code-content-wrap[hidden] { display: none; }
.db-code-breadcrumb {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: var(--paper-2);
  border-bottom: 1px solid var(--rule);
}
.db-code-breadcrumb-path {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-code-breadcrumb-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.db-code-lang-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--primary-soft);
  color: var(--primary);
}
.db-code-size-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--mute);
}
.db-code-copy-btn {
  appearance: none;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--mute);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: not-allowed;
  opacity: 0.65;
}
.db-code-copy-btn:not([disabled]) { cursor: pointer; opacity: 1; }
.db-code-copy-btn:not([disabled]):hover { color: var(--ink); border-color: var(--mute-2); }

/* Code body — line-numbered. Uses .db-code-content (preserved selector) +
   nested .db-code-line wrappers. Gutter sits flush-left with a subtle rule
   so the eye separates line numbers from source. */
.db-code-content-wrap .db-code-content {
  margin: 0;
  border-radius: 0;
  padding: 8px 0;
  flex: 1;
  min-height: 0;
  /* Carbon look stays — independent from theme toggle. */
  background: var(--dash-slate-950);
  color: var(--dash-slate-200);
  overflow: auto;
  white-space: pre;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.55;
}
.db-code-content-wrap .db-code-content code { display: block; padding: 0; }
.db-code-line {
  display: flex;
  align-items: flex-start;
  min-height: 1.55em;
  width: 100%;
}
.db-code-line-num {
  flex-shrink: 0;
  width: 44px;
  padding: 0 12px 0 14px;
  text-align: right;
  user-select: none;
  color: var(--dash-slate-500);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
}
.db-code-line-text {
  flex: 1;
  min-width: 0;
  padding-right: 16px;
  white-space: pre;
}
.db-code-line:hover { background: var(--dash-slate-900); }

/* highlight.js base styling stays under control of the github / github-dark
   sheets loaded via layout.ts. We only ensure hljs's default background
   does not override our carbon surface — github.css ships a light cream
   background on .hljs that would clash. */
.db-code-content code.hljs,
.db-code-content code.hljs * {
  background: transparent !important;
}
.db-code-content code.hljs { color: inherit; }

/* Dark theme: when .dark is active, hljs swaps to github-dark via the
   stylesheet disabled toggle in client/app.ts. Our carbon surface and
   gutter need no override — both modes already read well on dash-slate-950. */
.dark .db-code-tab-bar { background: var(--bg-strong-950, var(--paper)); border-bottom-color: var(--stroke-soft-200, var(--rule)); }
.dark .db-code-tab-bar-end { background: var(--bg-surface-800, var(--paper-2)); border-left-color: var(--stroke-soft-200, var(--rule)); }
.dark .db-code-tab { color: var(--text-sub-600, var(--mute)); border-right-color: var(--stroke-soft-200, var(--rule)); }
.dark .db-code-tab:hover { background: var(--bg-surface-800, var(--paper-2)); color: var(--text-strong-950, var(--ink)); }
.dark .db-code-tab--active { background: var(--bg-surface-800, var(--paper-2)); color: var(--text-strong-950, var(--ink)); }
.dark .db-code-breadcrumb { background: var(--bg-surface-800, var(--paper-2)); border-bottom-color: var(--stroke-soft-200, var(--rule)); }

@media (max-width: 640px) {
  .db-code-tab { max-width: 140px; }
  .db-code-tab-label { padding-left: 8px; }
  .db-code-line-num { width: 32px; padding: 0 6px 0 8px; font-size: 10.5px; }
}

/* === Phase B2 history + composer polish === */
/* Rail can host two stacked views (chat thread vs run history). The
   data-view-mode attribute on .db-rail-history is the source of truth; the
   client sets [hidden] on the inactive [data-rail-view] node. */
.db-rail-view {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.db-rail-view[hidden] { display: none; }
.db-rail-view--chat { gap: 8px; }
.db-rail-view--history { gap: 0; }

.db-rail-history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 2px 12px;
}
.db-rail-history-list-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 4px 8px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 4px;
}
.db-rail-history-list-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}
.db-rail-history-list-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
}
.db-rail-history-list-count {
  font-size: 11px;
  color: var(--mute);
  font-weight: 600;
}
.db-rail-history-list-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.db-rail-history-list-empty {
  text-align: center;
  padding: 24px 16px;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper);
  color: var(--mute);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.db-rail-history-list-empty-mark {
  font-size: var(--text-subtitle);
  color: var(--primary);
}
.db-rail-history-list-empty-body {
  margin: 0;
  font-size: 12px;
  color: var(--mute);
  line-height: 1.5;
}

.db-history-card {
  appearance: none;
  border: 1px solid var(--rule);
  background: var(--paper-2);
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  font: inherit;
  color: var(--ink);
  transition: border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;
}
.db-history-card:hover {
  border-color: var(--primary-soft);
  background: var(--paper-3);
}
.db-history-card:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
.db-history-card--active {
  border-color: var(--primary);
  background: var(--primary-card);
}
.db-history-card[data-status="failed"] {
  border-left: 3px solid var(--danger);
  padding-left: 8px;
}
.db-history-card[data-status="generating"],
.db-history-card[data-status="queued"] {
  border-left: 3px solid var(--primary);
  padding-left: 8px;
}
.db-history-card[data-status="pr_created"] {
  border-left: 3px solid var(--success);
  padding-left: 8px;
}
.db-history-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.db-history-card-seq {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--primary);
  text-transform: uppercase;
}
.db-history-card-pill-label {
  font-size: 10px;
  font-weight: 700;
}
.db-history-card-prompt {
  display: block;
  font-size: 13px;
  line-height: 1.4;
  color: var(--ink);
  word-break: break-word;
}
.db-history-card-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--mute);
}
.db-history-card-duration::before {
  content: "·";
  margin-right: 6px;
  color: var(--mute-2);
}

/* Composer toolbar — Lovable-style row under the textarea. Left side hosts
   the (placeholder) attach + mode controls; right side keeps Reset + an
   icon-only Generate. */
.db-composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.db-composer-toolbar-left,
.db-composer-toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.db-composer-toolbar-hint {
  font-size: 11px;
  color: var(--mute);
  font-weight: 600;
  letter-spacing: 0.02em;
  padding-right: 4px;
}

.db-composer-tool-btn {
  appearance: none;
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--mute);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}
.db-composer-tool-btn:hover:not(:disabled) {
  background: var(--paper);
  border-color: var(--primary-soft);
  color: var(--ink);
}
.db-composer-tool-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
.db-composer-tool-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.db-composer-tool-btn--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
.db-composer-tool-btn--mode {
  padding: 4px 8px 4px 10px;
}
.db-composer-tool-btn-caret {
  font-size: 9px;
  color: var(--mute-2);
}
.db-composer-tool-btn-label {
  line-height: 1;
}

.db-composer-send {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.db-composer-send-arrow {
  font-size: var(--text-lg);
  line-height: 1;
  font-weight: 800;
  color: var(--text-white-0, var(--paper-2));
}

/* Composer textarea min-height bumped to 56px per design.md spec. The
   existing .db-rail-composer .db-textarea rule wins over .db-composer-dock
   variants via the rail scope, so we restate it here for clarity. */
.db-rail-composer .db-textarea {
  min-height: 56px;
}

@media (max-width: 640px) {
  .db-composer-toolbar { gap: 6px; }
  .db-composer-toolbar-hint { display: none; }
}

/* === Phase D3 sandbox badge ===
   Read-only chip in the topbar Cluster C that surfaces the active repo's
   sandbox lifecycle state (cloning, idle, generating, publishing, stale,
   failed). Tone is driven by data-tone so the markup stays declarative.
   Colors use the legacy daemon semantic aliases defined in the :root block
   above (--success, --warn, --danger, --info, --primary, --mute) so the
   audit:css gate stays at 0 — no hex literals are introduced. */
.db-sandbox-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--mute);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-sandbox-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mute-2);
  flex-shrink: 0;
}
.db-sandbox-badge-label {
  color: var(--ink);
  font-weight: 700;
  letter-spacing: -0.005em;
}
.db-sandbox-badge-meta {
  color: var(--mute);
  font-family: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  border-left: 1px solid var(--rule-2);
  padding-left: 6px;
  margin-left: 2px;
}

/* Tone variants — dot color + subtle border tint per lifecycle state.
   idle / preview_ready  → success (green)
   generating / publishing → primary (Dash Purple) + pulse
   cloned / shim_applied / cloning → warn (bootstrap in progress)
   sweep / stale → mute (winding down)
   failed → danger
*/
.db-sandbox-badge[data-tone="good"] .db-sandbox-badge-dot {
  background: var(--success);
  box-shadow: 0 0 0 3px var(--success-soft);
}
.db-sandbox-badge[data-tone="good"] {
  border-color: var(--success-soft);
}
.db-sandbox-badge[data-tone="primary"] .db-sandbox-badge-dot {
  background: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
  animation: db-pulse 1.6s ease-in-out infinite;
}
.db-sandbox-badge[data-tone="primary"] {
  border-color: var(--primary-soft);
}
.db-sandbox-badge[data-tone="warn"] .db-sandbox-badge-dot {
  background: var(--warn);
  box-shadow: 0 0 0 3px var(--warn-soft);
}
.db-sandbox-badge[data-tone="warn"] {
  border-color: var(--warn-soft);
}
.db-sandbox-badge[data-tone="mute"] .db-sandbox-badge-dot {
  background: var(--mute-2);
}
.db-sandbox-badge[data-tone="error"] .db-sandbox-badge-dot {
  background: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}
.db-sandbox-badge[data-tone="error"] {
  border-color: var(--danger-soft);
  color: var(--danger);
}

/* Responsive: at narrow viewports drop the meta text so the dot + label
   stay readable next to the branch chip. */
@media (max-width: 900px) {
  .db-sandbox-badge-meta { display: none; }
  .db-sandbox-badge { max-width: 200px; padding: 2px 6px; }
}
@media (max-width: 640px) {
  .db-sandbox-badge-label { display: none; }
  .db-sandbox-badge { padding: 2px 4px; }
}

/* === F3 sandbox badge state expansion ===
   Loading + clone_running variants for the dev-server lifecycle. Reuses the
   existing tone tokens so audit:css stays at 0 — only new state-scoped rules
   are added. The data-loading="true" flag layers a subtle shimmer over the
   badge (matches the existing db-shimmer keyframe used by skeletons).
*/
.db-sandbox-badge[data-state="clone_running"] .db-sandbox-badge-dot {
  background: var(--success);
  box-shadow: 0 0 0 3px var(--success-soft);
}
.db-sandbox-badge[data-state="clone_running"] {
  border-color: var(--success-soft);
  /* Subtle live-link cue — gentle background tint so the user notices the
     iframe just swapped from staging to the local clone. */
  background: var(--success-soft);
  color: var(--ink);
}
.db-sandbox-badge[data-loading="true"] .db-sandbox-badge-dot {
  /* Reuse the existing db-pulse keyframe (already declared near line 188) so
     the dot pulses while the dev server boots. */
  animation: db-pulse 1.4s ease-in-out infinite;
}
.db-sandbox-badge[data-loading="true"] {
  /* Layer a moving gradient over the badge background to communicate
     "work-in-progress" without overpowering the topbar. */
  background-image: linear-gradient(
    90deg,
    var(--paper-2) 0%,
    var(--primary-ring) 50%,
    var(--paper-2) 100%
  );
  background-size: 200% 100%;
  animation: db-shimmer 1.6s ease-in-out infinite;
}
/* The error-tone retry variant renders as a <button>; reset the default UA
   button styling so it visually matches the inline badge while still being
   keyboard-focusable + click-handlerable via [data-sandbox-restart-dev]. */
button.db-sandbox-badge {
  font: inherit;
  margin: 0;
  cursor: pointer;
  appearance: none;
  text-align: left;
}
button.db-sandbox-badge:hover {
  filter: brightness(0.98);
}
button.db-sandbox-badge:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* === Sprint 1A bootstrap button ===
   Topbar trigger that appears when the active repo sandbox is null or clean.
   Click invokes POST /api/sandbox/bootstrap to clone + shim. Disappears once
   the workspace moves past the clean state. Uses semantic primary tokens so
   the audit:css gate stays at 0. */
.db-topbar-bootstrap-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--primary-soft);
  background: var(--primary-ring);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, border-color 120ms ease, transform 80ms ease;
}
.db-topbar-bootstrap-btn:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}
.db-topbar-bootstrap-btn:active {
  transform: translateY(1px);
}
.db-topbar-bootstrap-btn[disabled] {
  opacity: 0.6;
  cursor: progress;
}
.db-topbar-bootstrap-btn-icon {
  font-size: 9px;
  line-height: 1;
}
@media (max-width: 640px) {
  .db-topbar-bootstrap-btn-label { display: none; }
  .db-topbar-bootstrap-btn { padding: 2px 6px; }
}

/* === Sprint 1B OpenAI reconnect card ===
   Sits above the connect form in the rail empty state when the daemon has a
   prior connected record but the live probe is disconnected. */
.db-reconnect-card {
  display: flex;
  gap: 12px;
  padding: 14px 14px;
  margin: 0 0 16px;
  border-radius: 10px;
  background: var(--surface-warn, var(--surface));
  border: 1px solid var(--border-warn, var(--border));
  color: var(--ink);
}
.db-reconnect-card-icon {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--surface-mute, var(--surface));
  color: var(--text-warn, var(--ink));
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
}
.db-reconnect-card-body { flex: 1; min-width: 0; }
.db-reconnect-card-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.db-reconnect-card-lede {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-soft, var(--ink));
}
.db-reconnect-card-lede code {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  background: var(--surface-mute, var(--surface));
  padding: 0 4px;
  border-radius: 4px;
}
.db-reconnect-card-reason {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-soft, var(--ink));
  font-family: ui-monospace, monospace;
}
.db-reconnect-card-reason[hidden] { display: none; }
.db-reconnect-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.db-reconnect-card-btn-icon {
  display: inline-block;
  margin-right: 4px;
  font-size: 13px;
  line-height: 1;
}
.db-reconnect-card[data-busy="true"] [data-auth-reconnect] {
  opacity: 0.6;
  cursor: progress;
}

/* === Sprint 1B chat bubble jump-flash ===
   1.4 s glow border on the bubble matching a jumped-to run. */
.db-chat-msg--jump-flash > .db-chat-bubble {
  box-shadow: 0 0 0 2px var(--accent-soft, var(--border)),
    0 0 0 4px var(--border);
  transition: box-shadow 220ms ease-out;
}
@keyframes db-chat-msg-jump-fade {
  0% { box-shadow: 0 0 0 2px var(--accent-soft, var(--border)),
                   0 0 0 4px var(--border); }
  100% { box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent; }
}
.db-chat-msg--jump-flash > .db-chat-bubble {
  animation: db-chat-msg-jump-fade 1400ms ease-out;
}

/* === F2 sandbox-clone ribbon === */
/* Variant used when resolveRepoPreviewConfig picks sandbox-clone (state.json
 * clone_running + devServerPort). Green/success tone signals the auth-bypass
 * shim is active so the operator doesn't expect a login wall. Inherits all
 * geometry from .db-baseline-ribbon; only color tokens override. Semantic
 * vars only — no raw hex (CR-5). */
.db-baseline-ribbon--clone {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success-soft) 92%, transparent);
  color: var(--success);
}
.db-baseline-ribbon--clone code {
  color: var(--success);
}
.db-baseline-ribbon--clone a {
  color: var(--success);
}

/* === Sprint 3 Owner === */

/* Owner page shell — single-column stack inside the main shell. The topbar
 * uses the existing .db-topbar layout for visual parity with the Build
 * surface. Layer 0 / CR-5: semantic vars only. */
.db-owner-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  gap: 0;
}
.db-owner-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 24px 48px;
  width: min(1180px, 100%);
  margin: 0 auto;
}
@media (max-width: 720px) {
  .db-owner-stack { padding: 16px; gap: 14px; }
}

/* Owner topbar variant — same chrome, slightly muted to signal "console". */
.db-owner-topbar .db-topbar-project-name {
  color: var(--ink);
}
.db-owner-topbar .db-topbar-tab--surface {
  text-decoration: none;
}

/* Owner panel card — inherits .db-card geometry but gives the heading a
 * tighter rhythm and reserves a toolbar slot to the right. */
.db-owner-panel { padding: 16px; }
.db-owner-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.db-owner-panel-heading { display: flex; flex-direction: column; gap: 2px; }
.db-owner-panel-title { letter-spacing: 0.04em; }
.db-owner-panel-subtitle { font-size: 12px; color: var(--mute-2); }
.db-owner-panel-toolbar { display: flex; gap: 8px; align-items: center; }

/* Filter chip strip used by the Branch Queue panel. */
.db-owner-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.db-owner-filter-chip {
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--mute);
  cursor: pointer;
}
.db-owner-filter-chip:hover { color: var(--ink); border-color: var(--mute-2); }
.db-owner-filter-chip--active {
  background: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

/* === Branch Queue table === */
.db-branch-queue-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.db-branch-queue-table thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mute);
  padding: 8px 10px;
  border-bottom: 1px solid var(--rule);
}
.db-branch-queue-row td.db-branch-queue-cell {
  padding: 10px;
  border-bottom: 1px solid var(--rule-2);
  vertical-align: middle;
}
.db-branch-queue-row:hover { background: var(--paper-3); }
.db-branch-queue-cell--branch {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 220px;
}
.db-branch-queue-branch-name {
  font-weight: 600;
  color: var(--ink);
  word-break: break-all;
}
.db-branch-queue-branch-sha { font-size: 11px; color: var(--mute-2); }
.db-branch-queue-repo-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--rule-2);
  color: var(--mute);
}
.db-branch-queue-cell--reviewer,
.db-branch-queue-cell--author { color: var(--mute); }
.db-branch-queue-cell--age { color: var(--mute-2); font-family: var(--font-mono); }
.db-branch-queue-ci-chip {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--rule-2);
  color: var(--mute);
}
.db-branch-queue-ci-chip[data-tone="good"] { background: var(--success-soft); color: var(--success); }
.db-branch-queue-ci-chip[data-tone="error"] { background: var(--danger-soft); color: var(--danger); }
.db-branch-queue-ci-chip[data-tone="primary"] { background: var(--primary-soft); color: var(--primary); }
.db-branch-queue-cell--actions { display: flex; gap: 4px; justify-content: flex-end; }
.db-branch-queue-empty {
  padding: 16px;
  text-align: center;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-3);
}

/* Generic status-pill tone variants used by Owner panels. Reuses the same
 * tokens as the existing prompt-status pills so colours stay consistent. */
.db-status-pill[data-tone="good"] { background: var(--success-soft); color: var(--success); }
.db-status-pill[data-tone="warn"] { background: var(--warn-soft); color: var(--warn); }
.db-status-pill[data-tone="error"] { background: var(--danger-soft); color: var(--danger); }
.db-status-pill[data-tone="primary"] { background: var(--primary-soft); color: var(--primary); }
.db-status-pill[data-tone="mute"] { background: var(--rule-2); color: var(--mute); }

/* === Activity Feed === */
.db-activity-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.db-activity-feed-group { display: flex; flex-direction: column; gap: 6px; }
.db-activity-feed-day {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mute);
  margin: 0;
}
.db-activity-feed-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.db-activity-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}
.db-activity-row:hover { background: var(--paper-3); border-color: var(--rule-2); }
.db-activity-row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-pill);
  background: var(--rule-2);
  color: var(--mute);
  font-size: 12px;
  font-weight: 600;
}
.db-activity-row-icon[data-tone="good"] { background: var(--success-soft); color: var(--success); }
.db-activity-row-icon[data-tone="warn"] { background: var(--warn-soft); color: var(--warn); }
.db-activity-row-icon[data-tone="error"] { background: var(--danger-soft); color: var(--danger); }
.db-activity-row-icon[data-tone="primary"] { background: var(--primary-soft); color: var(--primary); }
.db-activity-row-icon[data-tone="mute"] { background: var(--rule-2); color: var(--mute); }
.db-activity-row-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.db-activity-row-headline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  font-size: 13px;
}
.db-activity-row-event { font-weight: 600; color: var(--ink); }
.db-activity-row-user { color: var(--mute); }
.db-activity-row-project { color: var(--mute); }
.db-activity-row-sep { color: var(--mute-2); }
.db-activity-row-prompt {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-activity-row-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 11px;
  color: var(--mute-2);
}
.db-activity-row-time { color: var(--mute); }
.db-activity-row-duration { color: var(--mute-2); }
.db-activity-row-anomaly {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-pill);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 10px;
  font-weight: 700;
}
.db-activity-feed-empty {
  padding: 16px;
  text-align: center;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-3);
}

/* === Cost Card === */
.db-cost-card { display: flex; flex-direction: column; gap: 16px; }
.db-cost-card-headline {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.db-cost-card-total { display: flex; flex-direction: column; gap: 4px; }
.db-cost-card-total-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mute);
}
.db-cost-card-total-amount {
  font-size: var(--text-display-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.db-cost-spark {
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
  height: 56px;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  background: var(--paper-3);
  border: 1px solid var(--rule-2);
}
.db-cost-spark-bar {
  display: inline-block;
  width: 14px;
  background: var(--primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  min-height: 4px;
  transition: height 0.18s ease;
}
.db-cost-card-section { display: flex; flex-direction: column; gap: 8px; }
.db-cost-card-section-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.db-cost-user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.db-cost-user-table thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mute);
  padding: 6px 8px;
  border-bottom: 1px solid var(--rule-2);
}
.db-cost-user-cell {
  padding: 6px 8px;
  border-bottom: 1px solid var(--rule-2);
  vertical-align: middle;
}
.db-cost-user-cell--name { color: var(--ink); font-weight: 500; min-width: 120px; }
.db-cost-user-cell--bar { width: 50%; }
.db-cost-user-cell--amount { text-align: right; color: var(--ink); }
.db-cost-user-cell--runs { text-align: right; color: var(--mute); width: 60px; }
.db-cost-user-bar {
  display: block;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  opacity: 0.82;
}
.db-cost-budget {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--rule);
  background: var(--paper-3);
}
.db-cost-budget-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--mute);
}
.db-cost-budget-label { font-weight: 600; }
.db-cost-budget-amount { color: var(--ink); }
.db-cost-budget-bar {
  position: relative;
  height: 8px;
  background: var(--rule-2);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.db-cost-budget-fill {
  display: block;
  height: 100%;
  background: var(--primary);
  border-radius: inherit;
  transition: width 0.24s ease;
}
.db-cost-budget-fill[data-tone="warn"] { background: var(--warn); }
.db-cost-budget-fill[data-tone="error"] { background: var(--danger); }
.db-cost-budget-fill[data-tone="good"] { background: var(--success); }
.db-cost-budget[data-tone="warn"] { border-color: var(--warn); }
.db-cost-budget[data-tone="error"] { border-color: var(--danger); }
.db-cost-budget-hint { margin: 0; }
.db-cost-card-disclaimer { margin: 0; font-style: italic; }

/* === DS Candidate Queue === */
.db-owner-ds-empty {
  padding: 16px;
  text-align: center;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-3);
}
.db-owner-ds-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.db-owner-ds-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--rule-2);
  background: var(--paper-2);
}
.db-owner-ds-kind {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  color: var(--primary);
}
.db-owner-ds-title { color: var(--ink); font-weight: 500; }
.db-owner-ds-from { margin-left: auto; }
`

/**
 * Final CSS bundle served at `/static/app.css`.
 * Order matters:
 *   1. Registry tokens (light :root + .dark + shadows + motion).
 *   2. Daemon overrides (legacy --ink/--paper/--canvas aliases + body rules).
 * Registry comes first so `.dark` can be authored against semantic vars
 * while daemon-internal aliases remain available to existing rule body.
 */
export const DASHBOARD_CSS =
  REGISTRY_TOKENS_CSS + "\n\n/* === Daemon overrides === */\n" + DAEMON_OVERRIDES_CSS

