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

  const bubbleInner =
    status === "running"
      ? `<span class="db-chat-typing" aria-label="Builder is thinking">
          <span></span><span></span><span></span>
        </span>`
      : `<span class="db-chat-bubble-text">${escapeHtml(msg.content)}</span>`

  const filesBlock =
    msg.files && msg.files.length > 0
      ? `<div class="db-chat-files">${msg.files.map((f) => fileChip(f.path, f.size)).join("")}</div>`
      : ""

  const timeLabel = formatTime(msg.timestamp)

  return `<li class="db-chat-msg" ${dataAttrs}>
    <div class="db-chat-bubble">
      ${bubbleInner}
    </div>
    ${filesBlock}
    ${timeLabel ? `<span class="db-chat-time">${escapeHtml(timeLabel)}</span>` : ""}
  </li>`
}

export interface ChatThreadOptions {
  messages: ChatMessage[]
  /** Shown when the thread is empty. */
  emptyHint?: string
}

export function renderChatThread(opts: ChatThreadOptions): string {
  if (opts.messages.length === 0) {
    return `<div class="db-chat-thread db-chat-thread--empty" id="db-chat-thread">
      <div class="db-chat-empty">
        <span class="db-chat-empty-mark" aria-hidden="true">✦</span>
        <h3 class="db-chat-empty-title">What do you want to build today?</h3>
        <p class="db-chat-empty-body">${escapeHtml(
          opts.emptyHint ??
            "Describe a feature. Dash Build will evaluate scope, ask follow-ups if needed, then open a PR.",
        )}</p>
      </div>
    </div>`
  }
  return `<ul class="db-chat-thread" id="db-chat-thread" aria-live="polite">${opts.messages
    .map((m) => renderChatMessage(m))
    .join("")}</ul>`
}
