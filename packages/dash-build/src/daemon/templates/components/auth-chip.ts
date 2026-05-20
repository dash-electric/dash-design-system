import { escapeHtml } from "../layout.js"

/**
 * AuthChip — provider connection indicator. Shows provider name with a colored
 * dot + label. Clickable when disconnected (CTA to /api/auth/<provider>).
 */

export type AuthProviderId = "anthropic" | "github"

interface ChipMeta {
  label: string
  icon: string
}

const META: Record<AuthProviderId, ChipMeta> = {
  anthropic: { label: "Anthropic", icon: "✦" },
  github: { label: "GitHub", icon: "◆" },
}

export interface AuthChipOptions {
  provider: AuthProviderId
  connected: boolean
  /** Optional sub-label (e.g. user handle, repo count). */
  detail?: string
}

export function renderAuthChip(opts: AuthChipOptions): string {
  const meta = META[opts.provider]
  const state = opts.connected ? "ok" : "off"
  const aria = opts.connected
    ? `${meta.label} connected${opts.detail ? `, ${opts.detail}` : ""}`
    : `${meta.label} not connected, click to connect`
  const detail = opts.detail
    ? `<span class="db-auth-chip-detail">${escapeHtml(opts.detail)}</span>`
    : ""

  if (opts.connected) {
    return `<span class="db-auth-chip db-auth-chip-${state}" data-provider="${escapeHtml(opts.provider)}" aria-label="${escapeHtml(aria)}">
      <span class="db-auth-chip-dot" aria-hidden="true"></span>
      <span class="db-auth-chip-icon" aria-hidden="true">${escapeHtml(meta.icon)}</span>
      <span class="db-auth-chip-label">${escapeHtml(meta.label)}</span>
      ${detail}
    </span>`
  }
  return `<a class="db-auth-chip db-auth-chip-${state}" href="/api/auth/${escapeHtml(opts.provider)}" data-provider="${escapeHtml(opts.provider)}" aria-label="${escapeHtml(aria)}">
    <span class="db-auth-chip-dot" aria-hidden="true"></span>
    <span class="db-auth-chip-icon" aria-hidden="true">${escapeHtml(meta.icon)}</span>
    <span class="db-auth-chip-label">Connect ${escapeHtml(meta.label)}</span>
  </a>`
}
