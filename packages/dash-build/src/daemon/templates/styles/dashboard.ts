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

/* ----- Reset ----- */
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink);
  background: var(--paper);
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
  background: var(--paper-2);
  border-bottom: 1px solid var(--rule);
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

/* ----- Responsive ----- */
@media (max-width: 640px) {
  .db-main { padding: 16px 14px 48px; }
  .db-header { padding: 10px 16px; }
  .db-card { padding: 16px; }
  .db-prompt-input-footer { flex-direction: column; align-items: stretch; }
  .db-button { justify-content: center; }
}
`
