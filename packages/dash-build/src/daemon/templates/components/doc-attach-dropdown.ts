/**
 * Doc-attach dropdown — Open WebUI `#` adoption (Sub-task 2 UI scaffold).
 *
 * Renders an empty floating panel + ARIA listbox skeleton next to the
 * composer. The client JS in `app.ts` (wireDocAttach) toggles visibility,
 * fetches `/api/docs?q=<prefix>`, populates the list, and routes keyboard
 * navigation.
 *
 * Markup contract — DO NOT rename ids without updating app.ts:
 *
 *   #db-doc-attach            wrapper (data-state="hidden|open")
 *   #db-doc-attach-list       <ul role="listbox"> populated client-side
 *   .db-doc-attach-empty      shown when zero results
 *   .db-doc-attach-hint       keyboard hint footer
 */

export function renderDocAttachDropdown(): string {
  return `<div
    id="db-doc-attach"
    class="db-doc-attach"
    data-state="hidden"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="db-doc-attach-list"
  >
    <ul
      id="db-doc-attach-list"
      class="db-doc-attach-list"
      role="listbox"
      aria-label="Attach a document"
    ></ul>
    <p class="db-doc-attach-empty" hidden>No matching docs.</p>
    <p class="db-doc-attach-hint" aria-hidden="true">
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
      <span><kbd>↵</kbd> select</span>
      <span><kbd>Esc</kbd> close</span>
    </p>
  </div>`
}
