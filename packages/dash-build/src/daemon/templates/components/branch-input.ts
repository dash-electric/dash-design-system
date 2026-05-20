import { escapeHtml } from "../layout.js"

export interface BranchInputOptions {
  value: string | null
  disabled?: boolean
}

export function renderBranchInput(opts: BranchInputOptions): string {
  const value = opts.value ?? "main"
  const disabled = opts.disabled ? " disabled" : ""
  return `<input
    id="db-branch-input"
    class="db-text-input"
    type="text"
    value="${escapeHtml(value)}"
    placeholder="branch"
    aria-label="Target branch"
    spellcheck="false"
    autocomplete="off"
    ${disabled}
  />`
}
