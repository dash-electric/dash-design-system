/**
 * Status transition state machine.
 *
 * Centralised so the worker, orchestrator, and API routes share a single
 * source of truth for what `queued → generating → …` transitions are legal.
 *
 * Terminal statuses (`completed`, `failed`, `cancelled`) are immutable —
 * attempting to transition out of them is a no-op (returns the existing
 * status). This lets retries idempotently call `transition()` without having
 * to first check whether the prompt is already terminal.
 */

import type { PromptStatus } from "../daemon/state/types.js"
import { STATUS_TRANSITIONS } from "./types.js"

export class IllegalTransitionError extends Error {
  constructor(public from: PromptStatus, public to: PromptStatus) {
    super(`Illegal status transition: ${from} → ${to}`)
    this.name = "IllegalTransitionError"
  }
}

const TERMINAL: ReadonlySet<PromptStatus> = new Set(["completed", "failed", "cancelled"])

export function isTerminal(status: PromptStatus): boolean {
  return TERMINAL.has(status)
}

export function canTransition(from: PromptStatus, to: PromptStatus): boolean {
  if (from === to) return true
  if (isTerminal(from)) return false
  return STATUS_TRANSITIONS[from].includes(to)
}

/**
 * Validate a transition. Throws `IllegalTransitionError` if not allowed.
 * No-ops cleanly when `from === to` (idempotent retries).
 */
export function assertTransition(from: PromptStatus, to: PromptStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalTransitionError(from, to)
  }
}

/**
 * Transition helper that respects terminal statuses. Returns the resulting
 * status — same as the requested `to`, or the existing `from` when the
 * prompt is terminal (so callers can keep going without branching).
 */
export function nextStatus(
  current: PromptStatus,
  desired: PromptStatus,
): PromptStatus {
  if (isTerminal(current)) return current
  if (!canTransition(current, desired)) {
    throw new IllegalTransitionError(current, desired)
  }
  return desired
}
