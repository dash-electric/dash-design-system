import { escapeHtml } from "../layout.js"

/**
 * ChatThread — Claude.ai-style chat log. User messages are right-aligned
 * Dash Purple bubbles, builder messages are left-aligned paper bubbles.
 *
 * The dashboard hydrates server-rendered messages on first paint, then the
 * client JS appends new bubbles as the WS `prompt:event` stream fires.
 *
 * 2026-05-28 — Big Bug 4 (Agent R): added structured action messages
 * (`ChatAction`) so the thread reads like a Claude Code / Lovable action
 * stream — concise one-line summaries with `<details>` expandable detail
 * instead of a wall of patch text. The legacy `review` + `files` slots
 * stay typed but are no longer rendered for new awaiting_approval messages
 * (replaced by `actions`); they survive in the type for back-compat with
 * any test fixture or external caller still constructing the old shape.
 */

/**
 * Action stream kinds — one per visible pipeline step in the chat thread.
 *
 * Mapping to AOP event taxonomy (`@dash/aop-schema`):
 *   - `scan`     ← AOP `scan`        (read files / catalogs)
 *   - `thinking` ← AOP `thinking`    (reason / hypothesis / risk)
 *   - `cost`     ← AOP `cost`        (LLM request + tokens)
 *   - `generate` ← AOP `artifact op:create`
 *   - `edit`     ← AOP `artifact op:edit`  (carries +X / -Y line counts)
 *   - `validate` ← AOP `validate`    (foundation / banned-imports / qa)
 *   - `preview`  ← `generation:complete` (preview pane swap)
 *   - `pr`       ← `pr:created`
 *   - `error`    ← AOP `error`
 *   - `status`   ← terminal info line (no AOP source; emitted by orchestrator
 *                  state-machine — e.g. "Done. Review the preview.")
 */
export type ChatActionKind =
  | "scan"
  | "thinking"
  | "cost"
  | "generate"
  | "edit"
  | "validate"
  | "preview"
  | "pr"
  | "error"
  | "status"

export type ChatActionTone = "success" | "warn" | "error" | "info" | "pending"

export interface ChatAction {
  /** Action kind — drives icon + default tone. */
  kind: ChatActionKind
  /** Single-line summary. Always rendered (truncated visually if long). */
  summary: string
  /** Optional rich-text or HTML detail. Rendered inside `<details>` body. */
  detail?: string
  /** Set to true when `detail` is raw HTML (e.g. highlight.js output). */
  detailIsHtml?: boolean
  /** Override the default tone for the action kind. */
  tone?: ChatActionTone
  /** Override the default icon glyph for the action kind. */
  icon?: string
  /**
   * Optional anchor — when present, rendered as a `<a>` next to the
   * summary. Used for `pr` actions (link to GitHub PR) + `preview`
   * actions (link to the preview pane, scrolls into view).
   */
  href?: string
  /** Anchor label (defaults to "Open"). */
  hrefLabel?: string
}

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
  /**
   * Big Bug 4 (2026-05-28) — Claude Code-style action stream. When present,
   * rendered in place of the legacy `review` + `files` slots so the user
   * sees a scannable, status-iconed sequence instead of a wall of text.
   */
  actions?: ChatAction[]
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

// ─────────────────────────────────────────────────────────────────────────
// Action stream — Claude Code paradigm (Big Bug 4, 2026-05-28)
// ─────────────────────────────────────────────────────────────────────────

/** Default icon glyph per action kind. ASCII / single emoji per design spec. */
const ACTION_ICON: Record<ChatActionKind, string> = {
  scan: "✓",
  thinking: "✦",
  cost: "✓",
  generate: "✓",
  edit: "✓",
  validate: "✓",
  preview: "🎨",
  pr: "📤",
  error: "✗",
  status: "→",
}

/** Default tone per action kind. */
const ACTION_DEFAULT_TONE: Record<ChatActionKind, ChatActionTone> = {
  scan: "success",
  thinking: "info",
  cost: "info",
  generate: "success",
  edit: "success",
  validate: "success",
  preview: "info",
  pr: "success",
  error: "error",
  status: "info",
}

export function renderChatAction(action: ChatAction): string {
  const tone = action.tone ?? ACTION_DEFAULT_TONE[action.kind]
  const icon = action.icon ?? ACTION_ICON[action.kind]
  const hasDetail = typeof action.detail === "string" && action.detail.length > 0

  // Anchor (PR link / preview link) rendered next to the summary.
  const anchor = action.href
    ? `<a class="db-chat-action-link" href="${escapeHtml(action.href)}" target="_blank" rel="noopener">${escapeHtml(action.hrefLabel ?? "Open")} →</a>`
    : ""

  // Summary row — same DOM in both expandable + non-expandable cases so the
  // CSS only needs one rule.
  const summaryRow = `
    <span class="db-chat-action-icon" aria-hidden="true">${escapeHtml(icon)}</span>
    <span class="db-chat-action-summary">${escapeHtml(action.summary)}</span>
    ${anchor}
    ${hasDetail ? '<span class="db-chat-action-toggle" aria-hidden="true">▶</span>' : ""}
  `

  const dataAttrs = [
    `data-kind="${escapeHtml(action.kind)}"`,
    `data-tone="${escapeHtml(tone)}"`,
  ].join(" ")

  if (hasDetail) {
    const detailBody = action.detailIsHtml
      ? action.detail!
      : `<pre class="db-chat-action-pre db-mono">${escapeHtml(action.detail!)}</pre>`
    return `<details class="db-chat-action" ${dataAttrs}>
      <summary class="db-chat-action-row">${summaryRow}</summary>
      <div class="db-chat-action-detail">${detailBody}</div>
    </details>`
  }

  return `<div class="db-chat-action" ${dataAttrs}>
    <div class="db-chat-action-row">${summaryRow}</div>
  </div>`
}

function renderActions(actions: ChatAction[]): string {
  if (actions.length === 0) return ""
  const items = actions.map((a) => renderChatAction(a)).join("")
  return `<div class="db-chat-actions" role="list" aria-label="Build actions">${items}</div>`
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

  // Big Bug 4 — when an action stream is present, prefer it over the legacy
  // `review` + `files` slots. The review/files renderers stay for fixtures
  // that haven't migrated, but new awaiting_approval messages built by
  // dashboard.ts emit `actions` exclusively.
  const hasActions = !!msg.actions && msg.actions.length > 0
  const actionsBlock = hasActions ? renderActions(msg.actions!) : ""
  const filesBlock =
    !hasActions && msg.files && msg.files.length > 0
      ? `<div class="db-chat-files">${msg.files.map((f) => fileChip(f.path, f.size)).join("")}</div>`
      : ""
  const reviewBlock = !hasActions && msg.review ? renderReview(msg.review) : ""
  const rejectedBlock = msg.rejectedPatches?.length
    ? renderRejectedPatches(msg.rejectedPatches)
    : ""

  // When the bubble would be empty (no body text, but actions present) we
  // skip the bubble entirely so the action stream isn't preceded by an
  // empty paper rectangle. This is the Claude Code feel — no "ok done"
  // bubble cluttering the action log.
  const bubbleBlock =
    status === "running" || msg.content.trim().length > 0 || !hasActions
      ? `<div class="db-chat-bubble">${bubbleInner}</div>`
      : ""

  const timeLabel = formatTime(msg.timestamp)

  return `<li class="db-chat-msg" ${dataAttrs}>
    ${bubbleBlock}
    ${actionsBlock}
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
