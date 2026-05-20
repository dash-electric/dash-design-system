import type { PromptStatus } from "../../state/types.js"
import { escapeHtml } from "../layout.js"

/**
 * StatusPill — colored, iconified status indicator for prompt cards.
 *
 * Color + icon mapping follows Dash Foundation Layer 0 semantic tokens.
 * One pill per terminal state in the prompt lifecycle.
 */

export interface StatusPillSpec {
  label: string
  icon: string
  /** CSS modifier class (db-pill-*). Drives color + animation. */
  modifier: string
  /** Whether the icon should spin (only used for in-flight states). */
  animated: boolean
  /** aria-label for screen readers — terse status verb */
  aria: string
}

export const PROMPT_STATUS_SPEC: Record<PromptStatus, StatusPillSpec> = {
  queued: {
    label: "Queued",
    icon: "○",
    modifier: "queued",
    animated: false,
    aria: "queued, waiting for worker",
  },
  clarifying: {
    label: "Needs clarification",
    icon: "?",
    modifier: "clarifying",
    animated: false,
    aria: "needs clarification before proceeding",
  },
  generating: {
    label: "Generating",
    icon: "◐",
    modifier: "generating",
    animated: true,
    aria: "generating with Claude",
  },
  awaiting_approval: {
    label: "Awaiting approval",
    icon: "✓",
    modifier: "awaiting-approval",
    animated: false,
    aria: "ready for your approval",
  },
  pr_created: {
    label: "PR opened",
    icon: "⤴",
    modifier: "pr-created",
    animated: false,
    aria: "pull request created on GitHub",
  },
  completed: {
    label: "Completed",
    icon: "✓",
    modifier: "completed",
    animated: false,
    aria: "completed",
  },
  failed: {
    label: "Failed",
    icon: "✕",
    modifier: "failed",
    animated: false,
    aria: "failed",
  },
  cancelled: {
    label: "Cancelled",
    icon: "−",
    modifier: "cancelled",
    animated: false,
    aria: "cancelled",
  },
}

export function renderStatusPill(status: PromptStatus): string {
  const spec = PROMPT_STATUS_SPEC[status]
  const spinCls = spec.animated ? " db-status-pill-spin" : ""
  return `<span class="db-status-pill db-status-pill-${spec.modifier}${spinCls}" role="status" aria-label="${escapeHtml(spec.aria)}">
    <span class="db-status-pill-icon" aria-hidden="true">${escapeHtml(spec.icon)}</span>
    <span class="db-status-pill-label">${escapeHtml(spec.label)}</span>
  </span>`
}
