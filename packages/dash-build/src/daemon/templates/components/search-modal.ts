/**
 * Open WebUI-style command-K search modal — server-rendered shell.
 *
 * The markup is intentionally empty (no results, no JSON bootstrap) — the
 * `client/app.ts` controller hydrates the input + result list lazily once
 * the user opens the modal. Keeping markup static means the dashboard
 * HTML payload doesn't balloon with potentially-stale search content, and
 * a refresh during typing won't clobber the user's draft query.
 *
 * Selectors:
 *
 *   #db-search-modal              — backdrop + dialog wrapper (hidden by default)
 *   [data-search-modal-card]      — focusable card surface
 *   [data-search-modal-input]     — autofocused text input
 *   [data-search-modal-results]   — <ul> populated client-side
 *   [data-search-modal-status]    — live region for empty / loading text
 *   [data-search-modal-close]     — close affordance (button + backdrop click)
 *
 * Open mechanism: client toggles `data-open="true"` on `#db-search-modal`.
 * The CSS layer (see styles/dashboard.ts) handles backdrop visibility,
 * card transitions, and the empty-state placeholder rules. Keeping the
 * markup body identical between open/closed states means screen readers
 * don't see content appear from nowhere when the modal mounts.
 */
export function renderSearchModal(): string {
  return `<div
  id="db-search-modal"
  class="db-search-modal"
  data-open="false"
  aria-hidden="true"
  role="presentation"
>
  <button
    type="button"
    class="db-search-modal-backdrop"
    data-search-modal-close
    aria-label="Close search"
    tabindex="-1"
  ></button>
  <div
    class="db-search-modal-card"
    role="dialog"
    aria-modal="true"
    aria-labelledby="db-search-modal-title"
    data-search-modal-card
  >
    <h2 id="db-search-modal-title" class="sr-only">Search Dash Build</h2>
    <header class="db-search-modal-head">
      <span class="db-search-modal-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        class="db-search-modal-input"
        placeholder="Search runs, projects, files…"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Search across runs, projects, and generated files"
        data-search-modal-input
      />
      <kbd class="db-search-modal-kbd" aria-hidden="true">Esc</kbd>
    </header>
    <p
      class="db-search-modal-status"
      data-search-modal-status
      aria-live="polite"
    >Type to search across runs, projects, and files.</p>
    <ul
      class="db-search-modal-results"
      data-search-modal-results
      role="listbox"
      aria-label="Search results"
    ></ul>
    <footer class="db-search-modal-foot">
      <span class="db-search-modal-hint">
        <kbd>↵</kbd> open
        <kbd>↑</kbd><kbd>↓</kbd> navigate
        <kbd>Esc</kbd> close
      </span>
    </footer>
  </div>
</div>`
}
