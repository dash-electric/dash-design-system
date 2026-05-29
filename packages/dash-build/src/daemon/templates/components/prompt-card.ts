import type { PromptRecord } from "../../state/types.js"
import { escapeHtml } from "../layout.js"
import { renderStatusPill } from "./status-pill.js"
import { renderPreviewPane } from "./preview-pane.js"
import { icon } from "./icon.js"
import type { GenerationArtifact } from "../../../pipeline/types.js"

/** Resolver the dashboard route passes in so the prompt-card can attach a
 *  preview pane when a generation artifact exists for a prompt in
 *  `awaiting_approval`. Kept optional so legacy callers don't break. */
export type ArtifactResolver = (promptId: string) => GenerationArtifact | undefined

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
    return `<button class="db-prompt-action db-prompt-action-primary"
        type="button"
        data-clarification-focus="${escapeHtml(prompt.id)}"
        aria-label="Answer clarification questions">
      <span>Answer questions</span>${icon("arrow-right", { size: "sm" })}
    </button>`
  }
  if (prompt.status === "awaiting_approval") {
    return `<button
        class="db-prompt-action db-prompt-action-primary"
        type="button"
        data-prompt-approve="${escapeHtml(prompt.id)}"
        aria-label="Approve and submit PR">
      <span>Review &amp; approve</span>${icon("arrow-right", { size: "sm" })}
    </button>`
  }
  if (prompt.status === "pr_created" && prompt.prUrl) {
    return `<a class="db-prompt-action db-prompt-action-ghost"
        href="${escapeHtml(prompt.prUrl)}"
        target="_blank"
        rel="noreferrer"
        aria-label="Open pull request on GitHub">
      <span>View on GitHub</span>${icon("external-link", { size: "sm" })}
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

export function renderPromptCard(
  prompt: PromptRecord,
  resolveArtifact?: ArtifactResolver,
): string {
  const when = formatRelative(prompt.createdAt)
  const repoLine = prompt.repo
    ? `<span class="db-prompt-repo" aria-label="Target repo">${escapeHtml(prompt.repo)}${
        prompt.branch ? ` · ${escapeHtml(prompt.branch)}` : ""
      }</span>`
    : ""

  let previewSection = ""
  if (prompt.status === "awaiting_approval" && resolveArtifact) {
    const artifact = resolveArtifact(prompt.id)
    if (artifact && artifact.files.length > 0) {
      previewSection = renderPreviewPane({
        promptId: prompt.id,
        files: artifact.files,
        previewUrl: `/preview/${prompt.id}`,
        bundleFailed: !artifact.bundleResult,
      })
    }
  }

  return `<li class="db-prompt-card" data-prompt-id="${escapeHtml(prompt.id)}" data-status="${escapeHtml(prompt.status)}">
    <div class="db-prompt-card-head">
      ${renderStatusPill(prompt.status)}
      <span class="db-prompt-meta">${escapeHtml(when)}</span>
      ${repoLine}
    </div>
    <p class="db-prompt-text">${escapeHtml(prompt.text)}</p>
    ${previewSection}
    <div class="db-prompt-card-foot">
      ${actionFor(prompt)}
    </div>
  </li>`
}

export function renderPromptList(
  prompts: PromptRecord[],
  resolveArtifact?: ArtifactResolver,
): string {
  if (prompts.length === 0) {
    return `<div class="db-empty-state db-empty-prompts">
      <span class="db-empty-icon" aria-hidden="true">${icon("sparkle", { size: "lg" })}</span>
      <h3 class="db-empty-title">Build your first feature</h3>
      <p class="db-empty-body">Describe what you want — Dash Build evaluates scope, asks clarifying questions, then opens a PR. Try:</p>
      <ul class="db-empty-examples">
        <li>"Tambahin filter driver by status di portal-v2"</li>
        <li>"Fix Modal close button on backoffice mitra detail"</li>
        <li>"Add payroll chart grouped by mitra Lvl in portal-v2"</li>
      </ul>
    </div>`
  }
  return `<ul class="db-prompt-list" id="db-prompts-list">${prompts
    .map((p) => renderPromptCard(p, resolveArtifact))
    .join("")}</ul>`
}
