/**
 * Theme toggle — RE-ENABLED in Phase A1 (2026-05-25).
 *
 * Dashboard now consumes the Dash registry semantic tokens (`:root` light +
 * `.dark` override) inlined into the CSS bundle. This button toggles the
 * `.dark` class on `<html>` and persists the choice in `localStorage`.
 *
 * Initial state is applied by an inline script in `<head>` (see layout.ts)
 * BEFORE first paint, so we never flash the wrong theme.
 *
 * Click handling lives in client/app.ts (document-level delegate keyed on
 * `[data-theme-toggle]`).
 *
 * Future: when the DS publishes official Dash-dark theme, this stays the
 * surface-#2 control. Layer-2 product themes (ride/logistic/...) can swap
 * the icon set if needed.
 */
export function themeToggle(): string {
  return `<button
    type="button"
    class="db-theme-toggle"
    data-theme-toggle
    aria-label="Toggle dark mode"
    aria-pressed="false"
    title="Toggle theme"
  ><span class="db-theme-toggle-icon" aria-hidden="true">◐</span></button>`
}
