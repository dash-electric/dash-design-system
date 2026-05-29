import { escapeHtml } from "../layout.js"
import { icon } from "./icon.js"

/**
 * EmptyState — reusable empty-state block. Used when no repos connected, no
 * Anthropic auth, or no prompts yet. Surfaces a CTA prominently.
 */
export interface EmptyStateOptions {
  icon: string
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  variant?: "primary" | "muted"
}

export function renderEmptyState(opts: EmptyStateOptions): string {
  const variant = opts.variant ?? "primary"
  return `<div class="db-empty-state db-empty-${escapeHtml(variant)}">
    <span class="db-empty-icon" aria-hidden="true">${escapeHtml(opts.icon)}</span>
    <h3 class="db-empty-title">${escapeHtml(opts.title)}</h3>
    <p class="db-empty-body">${escapeHtml(opts.body)}</p>
    <a class="db-button db-button-${variant === "primary" ? "primary" : "ghost"}" href="${escapeHtml(opts.ctaHref)}">
      <span class="db-button-label">${escapeHtml(opts.ctaLabel)}</span>
      <span class="db-button-arrow" aria-hidden="true">${icon("arrow-right", { size: "sm" })}</span>
    </a>
  </div>`
}
