import type { PromptRecord } from "../../state/types.js"
import { escapeHtml } from "../layout.js"
import { renderStatusPill } from "./status-pill.js"

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "just now"
  if (min < 60) return `${min} min ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

function actionFor(prompt: PromptRecord): string {
  if (prompt.status === "clarifying") {
    return `<a class="db-prompt-action db-prompt-action-primary"
        href="/clarify/${escapeHtml(prompt.id)}"
        aria-label="Answer clarification questions">
      Answer questions →
    </a>`
  }
  if (prompt.status === "awaiting_approval") {
    return `<button
        class="db-prompt-action db-prompt-action-primary"
        type="button"
        data-prompt-approve="${escapeHtml(prompt.id)}"
        aria-label="Approve and submit PR">
      Review &amp; approve →
    </button>`
  }
  if (prompt.status === "pr_created" && prompt.prUrl) {
    return `<a class="db-prompt-action db-prompt-action-ghost"
        href="${escapeHtml(prompt.prUrl)}"
        target="_blank"
        rel="noreferrer"
        aria-label="Open pull request on GitHub">
      View on GitHub ↗
    </a>`
  }
  if (prompt.status === "generating") {
    return `<div class="db-prompt-progress" role="progressbar" aria-label="Generating">
      <div class="db-prompt-progress-bar"></div>
    </div>`
  }
  if (prompt.status === "failed" && prompt.error) {
    return `<span class="db-prompt-error" role="alert">${escapeHtml(prompt.error)}</span>`
  }
  return ""
}

export function renderPromptCard(prompt: PromptRecord): string {
  const when = formatRelative(prompt.createdAt)
  const repoLine = prompt.repo
    ? `<span class="db-prompt-repo" aria-label="Target repo">${escapeHtml(prompt.repo)}${
        prompt.branch ? ` · ${escapeHtml(prompt.branch)}` : ""
      }</span>`
    : ""

  return `<li class="db-prompt-card" data-prompt-id="${escapeHtml(prompt.id)}" data-status="${escapeHtml(prompt.status)}">
    <div class="db-prompt-card-head">
      ${renderStatusPill(prompt.status)}
      <span class="db-prompt-meta">${escapeHtml(when)}</span>
      ${repoLine}
    </div>
    <p class="db-prompt-text">${escapeHtml(prompt.text)}</p>
    <div class="db-prompt-card-foot">
      ${actionFor(prompt)}
    </div>
  </li>`
}

export function renderPromptList(prompts: PromptRecord[]): string {
  if (prompts.length === 0) {
    return `<div class="db-empty-state db-empty-prompts">
      <span class="db-empty-icon" aria-hidden="true">✦</span>
      <h3 class="db-empty-title">Build your first feature</h3>
      <p class="db-empty-body">Describe what you want — Dash Build evaluates scope, asks clarifying questions, then opens a PR. Try:</p>
      <ul class="db-empty-examples">
        <li>"Tambahin filter driver by status di halo-dash"</li>
        <li>"Fix Modal close button on backoffice mitra detail"</li>
        <li>"Add payroll chart grouped by mitra Lvl in portal-v2"</li>
      </ul>
    </div>`
  }
  return `<ul class="db-prompt-list" id="db-prompts-list">${prompts.map(renderPromptCard).join("")}</ul>`
}
