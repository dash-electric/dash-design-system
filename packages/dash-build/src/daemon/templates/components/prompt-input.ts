import { escapeHtml } from "../layout.js"

export interface PromptInputOptions {
  value?: string
  disabled?: boolean
  placeholder?: string
  /**
   * Phase B2: when true, the inline hint + Reset/Generate footer is omitted.
   * Callers (e.g. the new rail composer toolbar) take over those controls
   * and render their own action row, so duplicating ids would collide.
   */
  hideFooter?: boolean
}

/**
 * Prompt input — multi-line textarea with character counter + submit footer.
 * The skill-chain scope evaluator hint sits below the textarea so users see
 * upfront that the prompt will be auto-evaluated.
 */
export function renderPromptInput(opts: PromptInputOptions = {}): string {
  const disabled = opts.disabled ? " disabled" : ""
  const value = opts.value ?? ""
  const placeholder =
    opts.placeholder ??
    "e.g. Tambahin chart payroll di backoffice — group by mitra Lvl, export PDF…"
  const hideFooter = opts.hideFooter === true

  const footer = hideFooter
    ? ""
    : `<div class="db-prompt-input-footer">
      <span class="db-prompt-hint" aria-hidden="true">
        <span class="db-prompt-hint-icon">⚡</span>
        Skill chain auto-evaluates scope before generation
      </span>
      <span class="db-prompt-actions">
        <button
          id="db-local-run-reset"
          class="db-button db-button-ghost db-button-compact"
          type="button"
          aria-label="Reset local run history"
          ${disabled}
        >Reset</button>
        <button
          id="db-prompt-submit"
          class="db-button db-button-primary"
          type="button"
          aria-label="Generate feature from prompt"
          ${disabled}
        >
          <span class="db-button-label">Generate</span>
          <span class="db-button-arrow" aria-hidden="true">→</span>
        </button>
      </span>
    </div>`

  return `<div class="db-prompt-input-wrap">
    <textarea
      id="db-prompt-input"
      class="db-textarea"
      rows="4"
      placeholder="${escapeHtml(placeholder)}"
      aria-label="What do you want to build?"
      maxlength="4000"
      ${disabled}
    >${escapeHtml(value)}</textarea>
    ${footer}
  </div>`
}
