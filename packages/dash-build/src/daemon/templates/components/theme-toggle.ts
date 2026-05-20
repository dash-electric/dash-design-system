/**
 * Theme toggle button — sun/moon switch in the header.
 *
 * Server-side renders a button; client JS reads system preference via
 * `prefers-color-scheme`, applies stored `data-theme` from localStorage on
 * boot, and on click flips between "light" / "dark" (persisted).
 */
export function themeToggle(): string {
  return `<button id="db-theme-toggle" class="db-theme-toggle db-icon-btn" type="button" aria-label="Toggle theme" title="Toggle theme">
    <span class="db-theme-icon-light" aria-hidden="true">☀</span>
    <span class="db-theme-icon-dark" aria-hidden="true">🌙</span>
  </button>`
}
