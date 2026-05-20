import type { PromptRecord } from "../state/types.js"
import { escapeHtml } from "./layout.js"

const STATUS_LABEL: Record<PromptRecord["status"], string> = {
  queued: "queued",
  clarifying: "clarifying",
  generating: "generating",
  awaiting_approval: "awaiting approval",
  pr_created: "PR created",
  completed: "completed",
  failed: "failed",
  cancelled: "cancelled",
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "just now"
  if (min < 60) return `${min} min ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export function renderPromptCard(prompt: PromptRecord): string {
  const status = STATUS_LABEL[prompt.status]
  const when = formatRelative(prompt.createdAt)
  const prLink = prompt.prUrl
    ? ` · <a class="db-link" href="${escapeHtml(prompt.prUrl)}" target="_blank" rel="noreferrer">PR</a>`
    : ""

  return `<li class="db-prompt-card" data-prompt-id="${escapeHtml(prompt.id)}">
    <span class="db-prompt-meta">${escapeHtml(when)}</span>
    <span class="db-prompt-text">${escapeHtml(prompt.text)}</span>
    <span class="db-prompt-status db-prompt-status-${escapeHtml(prompt.status)}">${escapeHtml(status)}${prLink}</span>
  </li>`
}

export function renderPromptList(prompts: PromptRecord[]): string {
  if (prompts.length === 0) {
    return '<p class="db-empty">No prompts yet. Submit one above to get started.</p>'
  }
  return `<ul class="db-prompt-list">${prompts.map(renderPromptCard).join("")}</ul>`
}
