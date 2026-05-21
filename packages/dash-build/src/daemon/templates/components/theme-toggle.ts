/**
 * Theme toggle — DISABLED.
 *
 * Dashboard is light-only per Dash DS direction (May 2026). Returns an
 * empty string so existing callers stay structurally valid until the
 * call sites get cleaned up.
 *
 * Future: re-introduce as a Layer-2 theme switcher when the DS publishes
 * official Dash-dark, instead of a per-app inline toggle.
 */
export function themeToggle(): string {
  return ""
}
