import { escapeHtml } from "../layout.js"

export interface PromptInputOptions {
  value?: string
  disabled?: boolean
  placeholder?: string
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
    <div class="db-prompt-input-footer">
      <span class="db-prompt-hint" aria-hidden="true">
        <span class="db-prompt-hint-icon">⚡</span>
        Skill chain auto-evaluates scope before generation
      </span>
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
    </div>
  </div>`
}
