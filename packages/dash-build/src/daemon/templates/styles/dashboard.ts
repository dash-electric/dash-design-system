/**
 * Dash Build dashboard CSS — embedded as a single string and served by the
 * static route. We follow Dash Foundation Layer 0 tokens (Dash Purple #5e2aac
 * is canonical) but inline them here so the daemon stays dependency-free.
 *
 * Tokens mirror apps/docs/registry/dash/foundation/tokens/colors.css subset.
 * Typography: Plus Jakarta Sans (loaded via Google Fonts in layout.ts),
 * with JetBrains Mono for code/mono.
 */

export const DASHBOARD_CSS = `
:root {
  /* ----- Dash Foundation Layer 0 (subset) ----- */
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

  /* Dash Purple — canonical #5e2aac */
  --primary: #5e2aac;
  --primary-base: #5e2aac;
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
body {
  font-family: var(--font-sans);
  font-size: 15px;
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
  padding: 14px 28px;
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
  font-size: 16px;
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
  padding: 28px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.db-footer {
  padding: 14px 28px;
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
  padding: 20px 22px;
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
.db-title-lg { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.db-title-md { font-size: 24px; font-weight: 700; letter-spacing: -0.015em; margin: 0; }
.db-title-sm { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.db-body { font-size: 15px; }
.db-body-sm { font-size: 13px; }
.db-mono { font-family: var(--font-mono); font-size: 14px; }
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
  padding: 10px 18px;
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
  gap: 5px;
  padding: 3px 10px;
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
  padding: 28px 20px;
  border: 1px dashed var(--rule);
  border-radius: var(--radius-md);
  background: var(--paper-3);
}
.db-empty-primary { background: var(--primary-card); border-color: var(--primary-soft); }
.db-empty-icon {
  display: inline-block;
  font-size: 22px;
  color: var(--primary);
  margin-bottom: 8px;
}
.db-empty-title { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--ink); }
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
  .db-chat-scene { border-radius: 14px; }
  .db-prompt-input-footer { flex-direction: column; align-items: stretch; }
  .db-button { justify-content: center; }
  .db-prompt-actions { width: 100%; }
  .db-prompt-actions .db-button-primary { flex: 1; }
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Chat dashboard (Claude.ai-style split-pane)                            */
/* ─────────────────────────────────────────────────────────────────────── */

/* Override the centered ".db-main" max-width when the chat shell is the body. */
.db-main:has(.db-chat-shell) {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 14px;
  gap: 0;
  height: calc(100vh - 64px);
}

.db-chat-scene {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--rule);
  box-shadow:
    0 10px 28px rgba(26, 26, 26, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
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

/* Split pane: ~40 / ~60. */
.db-chat-shell {
  display: grid;
  grid-template-columns: minmax(320px, var(--db-chat-pane-width, 40%)) 8px minmax(0, 1fr);
  gap: 0;
  background: var(--rule);
  height: calc(100vh - 128px); /* header + compact scene chrome */
  min-height: 480px;
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
}
.db-chat-pane--left {
  background: var(--paper-2);
}
.db-chat-pane--right {
  background:
    radial-gradient(circle at top, rgba(94, 42, 172, 0.06), transparent 32%),
    linear-gradient(180deg, rgba(251, 250, 248, 0.98), rgba(255, 255, 255, 0.96));
}

/* ── Chat thread ── */
.db-chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 10px;
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
  padding: 32px 20px;
}
.db-chat-empty-mark {
  display: inline-block;
  font-size: 28px;
  color: var(--primary);
  margin-bottom: 12px;
}
.db-chat-empty-title {
  margin: 0 0 8px;
  font-size: 20px;
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
  max-width: min(520px, 84%);
  padding: 7px 11px;
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
  padding: 5px 8px;
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
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
  padding: 16px 18px;
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
  border-radius: 999px;
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
  font-size: 18px;
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
  padding: 7px 10px;
  border-radius: 999px;
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
  margin: 0 auto 18px;
  border-radius: 16px;
  background: var(--paper-2);
  border: 1px dashed var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mute);
  font-size: 28px;
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
  font-size: 22px;
}
.db-live-preview-empty-title {
  margin: 0 0 6px;
  font-size: 16px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}
.db-live-preview-sub {
  margin: 0 0 20px;
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
}
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
  margin: 72px auto 24px;
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
  padding: 18px;
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
  margin-top: 20px;
}
.db-preview-harness-nav-item {
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 11px;
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
  gap: 18px;
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
  font-size: 24px;
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
  margin-top: 22px;
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
  font-size: 24px;
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
  padding: 13px 14px;
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
  padding: 7px 10px;
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
  padding: 2px 5px;
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 11px;
}
.db-auth-preview-callout ol {
  margin: 10px 0 0 18px;
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
  margin-top: 18px;
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
  padding: 18px;
}
.db-baseline-shell-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.db-baseline-shell-title {
  margin: 0;
  font-size: 18px;
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
  padding: 5px 8px;
  border-radius: 999px;
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
  padding: 9px 10px;
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
  margin: 5px 0 0;
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
  border-radius: 999px;
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
  padding: 9px 10px;
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
  padding: 5px 10px;
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
    margin-top: 64px;
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
  padding: 3px 7px;
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
  gap: 7px;
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
  margin: -3px 0 0;
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
  padding: 6px 9px;
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
  padding: 8px 11px;
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
  padding: 28px;
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.db-connect-head { display: flex; flex-direction: column; gap: 8px; }
.db-connect-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.025em;
  margin: 0;
}
.db-connect-lede {
  font-size: 15px;
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
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
  box-shadow: 0 16px 36px rgba(26, 26, 26, 0.05);
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
  font-size: 17px;
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
  background: color-mix(in srgb, var(--warn-soft) 48%, white);
}
.db-connect-fallback-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.db-connect-steps {
  margin: 0;
  padding-left: 18px;
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
`
