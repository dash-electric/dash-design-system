import { escapeHtml } from "../layout.js"

/**
 * ChatThread — Claude.ai-style chat log. User messages are right-aligned
 * Dash Purple bubbles, builder messages are left-aligned paper bubbles.
 *
 * The dashboard hydrates server-rendered messages on first paint, then the
 * client JS appends new bubbles as the WS `prompt:event` stream fires.
 */

export interface ChatMessage {
  role: "user" | "builder"
  content: string
  /** Only relevant for builder messages; user messages are always "ok". */
  status?: "running" | "ok" | "error"
  timestamp: string
  /** Optional structured artifact callouts (e.g. generated files). */
  files?: Array<{ path: string; size?: number }>
  /** Optional generated-output review summary. */
  review?: {
    title: string
    summary: string
    stats: Array<{ label: string; value: string; tone?: "good" | "warn" | "neutral" }>
  }
  /** Sprint 2C — patches blocked by the additive-only validator. Surfaced
   *  inline so the user can re-prompt with a "create a new file" hint. */
  rejectedPatches?: Array<{
    path: string
    summary: string
    hint?: string
  }>
  /** Optional prompt id so client-side updates can target this bubble. */
  promptId?: string
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  } catch {
    return ""
  }
}

function fileChip(path: string, size?: number): string {
  const sizeLabel = typeof size === "number" ? `${size}B` : ""
  return `<span class="db-chat-file-chip" title="${escapeHtml(path)}">
    <span class="db-chat-file-chip-icon" aria-hidden="true">▦</span>
    <span class="db-chat-file-chip-name db-mono">${escapeHtml(path)}</span>
    ${sizeLabel ? `<span class="db-chat-file-chip-size db-mono">${escapeHtml(sizeLabel)}</span>` : ""}
  </span>`
}

function renderRejectedPatches(
  rejected: NonNullable<ChatMessage["rejectedPatches"]>,
): string {
  if (rejected.length === 0) return ""
  const items = rejected
    .map(
      (r) => `<li class="db-rejected-patch-item">
        <code class="db-mono">${escapeHtml(r.path)}</code>
        <span class="db-rejected-patch-reason">${escapeHtml(r.summary)}</span>
        ${r.hint ? `<p class="db-rejected-patch-hint">${escapeHtml(r.hint)}</p>` : ""}
      </li>`,
    )
    .join("")
  const count = rejected.length
  const noun = count === 1 ? "patch" : "patches"
  return `<section class="db-rejected-patches" aria-label="Patches rejected by additive-only rule">
    <div class="db-rejected-patches-head">
      <span class="db-rejected-patches-kicker">Blocked — additive-only rule</span>
      <h4>${count} ${noun} rejected</h4>
    </div>
    <p class="db-rejected-patches-body">Dash Build refused to modify these existing files. Rephrase your prompt to create a new file instead, or use a safe append pattern (route entry, nav config, barrel export).</p>
    <ul class="db-rejected-patches-list">${items}</ul>
  </section>`
}

function renderReview(review: NonNullable<ChatMessage["review"]>): string {
  const stats = review.stats
    .map((stat) => {
      const tone = stat.tone ?? "neutral"
      return `<span class="db-chat-review-stat" data-tone="${escapeHtml(tone)}">
        <span>${escapeHtml(stat.label)}</span>
        <strong>${escapeHtml(stat.value)}</strong>
      </span>`
    })
    .join("")
  return `<section class="db-chat-review" aria-label="Generated output review">
    <div class="db-chat-review-head">
      <span class="db-chat-review-kicker">What changed</span>
      <h4>${escapeHtml(review.title)}</h4>
    </div>
    <p>${escapeHtml(review.summary)}</p>
    ${stats ? `<div class="db-chat-review-stats">${stats}</div>` : ""}
  </section>`
}

export function renderChatMessage(msg: ChatMessage): string {
  const role = msg.role
  const status = msg.status ?? (role === "user" ? "ok" : "ok")
  const dataAttrs = [
    `data-role="${escapeHtml(role)}"`,
    `data-status="${escapeHtml(status)}"`,
    msg.promptId ? `data-prompt-id="${escapeHtml(msg.promptId)}"` : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Bubble inner: typing dots when running, otherwise text directly inside
  // .db-chat-bubble (no inner wrapper span — removed 2026-05-28 to simplify
  // DOM. .db-chat-bubble-text had no CSS rules, was pure structural noise).
  const bubbleInner =
    status === "running"
      ? `<span class="db-chat-typing" aria-label="Builder is thinking">
          <span></span><span></span><span></span>
        </span>`
      : escapeHtml(msg.content)

  const filesBlock =
    msg.files && msg.files.length > 0
      ? `<div class="db-chat-files">${msg.files.map((f) => fileChip(f.path, f.size)).join("")}</div>`
      : ""
  const reviewBlock = msg.review ? renderReview(msg.review) : ""
  const rejectedBlock = msg.rejectedPatches?.length
    ? renderRejectedPatches(msg.rejectedPatches)
    : ""

  const timeLabel = formatTime(msg.timestamp)

  return `<li class="db-chat-msg" ${dataAttrs}>
    <div class="db-chat-bubble">
      ${bubbleInner}
    </div>
    ${reviewBlock}
    ${rejectedBlock}
    ${filesBlock}
    ${timeLabel ? `<span class="db-chat-time">${escapeHtml(timeLabel)}</span>` : ""}
  </li>`
}

export interface ChatQuickReplay {
  /** Run/prompt id this chip will replay. */
  id: string
  /** Prompt text to fill the composer with on click. */
  text: string
}

export interface ChatThreadOptions {
  messages: ChatMessage[]
  /** Shown when the thread is empty. */
  emptyHint?: string
  /**
   * Up to 3 most-recent prompts for the current project. Rendered as
   * clickable chips below the empty state — click fills the composer with
   * the chip's text so the user can iterate fast.
   */
  quickReplay?: ChatQuickReplay[]
}

function renderQuickReplayChips(items: ChatQuickReplay[]): string {
  if (!items || items.length === 0) return ""
  const chips = items
    .slice(0, 3)
    .map((item) => {
      // Cap chip text so very long prompts don't blow out the column.
      const raw = item.text.trim()
      const compact = raw.length > 60 ? raw.slice(0, 57) + "…" : raw
      return `<button
        type="button"
        class="db-chat-empty-chip"
        data-quick-replay="${escapeHtml(item.id)}"
        data-quick-replay-text="${escapeHtml(raw)}"
        title="${escapeHtml(raw)}"
      >
        <span class="db-chat-empty-chip-icon" aria-hidden="true">↻</span>
        <span class="db-chat-empty-chip-label">${escapeHtml(compact)}</span>
      </button>`
    })
    .join("")
  return `<div class="db-chat-empty-quick" aria-label="Recent prompts">
    <span class="db-chat-empty-quick-label">Recent prompts</span>
    <div class="db-chat-empty-chips">${chips}</div>
  </div>`
}

export function renderChatThread(opts: ChatThreadOptions): string {
  if (opts.messages.length === 0) {
    const quickReplay = renderQuickReplayChips(opts.quickReplay ?? [])
    return `<div class="db-chat-thread db-chat-thread--empty" id="db-chat-thread">
      <div class="db-chat-empty">
        <span class="db-chat-empty-mark" aria-hidden="true">✦</span>
        <h3 class="db-chat-empty-title">What do you want to build today?</h3>
        <p class="db-chat-empty-body">${escapeHtml(
          opts.emptyHint ??
            "Describe a feature. Dash Build will evaluate scope, ask follow-ups if needed, then open a PR.",
        )}</p>
        ${quickReplay}
      </div>
    </div>`
  }
  return `<ul class="db-chat-thread" id="db-chat-thread" aria-live="polite">${opts.messages
    .map((m) => renderChatMessage(m))
    .join("")}</ul>`
}
