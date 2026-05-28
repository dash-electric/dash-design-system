/**
 * Big Bug 4 (2026-05-28) — chat-thread structured action stream tests.
 *
 * The chat thread used to render a wall-of-text "review" card for every
 * awaiting_approval prompt. Big Bug 4 replaced that with a Claude
 * Code-style action stream — concise, status-iconed, expandable lines.
 *
 * These tests cover the new `ChatAction` shape: tone defaults per kind,
 * `<details>`-vs-`<div>` rendering based on the presence of `detail`,
 * back-compat with the legacy review/files slots (still typed, still
 * renderable for fixtures that haven't migrated), and HTML escaping on
 * untrusted summary / detail text.
 */

import { describe, expect, it } from "vitest"
import {
  renderChatAction,
  renderChatMessage,
  renderChatThread,
  type ChatAction,
  type ChatMessage,
} from "../chat-thread.js"

const baseMsg = {
  role: "builder" as const,
  content: "",
  status: "ok" as const,
  timestamp: "2026-05-28T12:34:56.000Z",
  promptId: "prm_abc",
}

describe("renderChatAction — Claude Code action lines", () => {
  it("renders a non-expandable plain <div> when no detail is provided", () => {
    const html = renderChatAction({
      kind: "generate",
      summary: "Generated 1 new file · 8.6 KB",
    })
    expect(html).toContain('class="db-chat-action"')
    expect(html.startsWith("<div")).toBe(true)
    expect(html).not.toContain("<details")
    expect(html).not.toContain("db-chat-action-toggle")
    expect(html).toContain("Generated 1 new file · 8.6 KB")
  })

  it("renders an expandable <details> with raw-text detail wrapped in <pre>", () => {
    const html = renderChatAction({
      kind: "edit",
      summary: "Edited 1 file · +22 / -1 lines",
      detail: "--- a/foo.ts\n+++ b/foo.ts\n@@\n+const x = 1",
    })
    expect(html.startsWith("<details")).toBe(true)
    expect(html).toContain('class="db-chat-action-toggle"')
    expect(html).toContain('class="db-chat-action-pre db-mono"')
    // Diff body is HTML-escaped — `<`/`>` should not appear as raw markup.
    expect(html).toContain("+const x = 1")
    expect(html).not.toContain("<script")
  })

  it("escapes hostile summary + detail text — no XSS surface", () => {
    const html = renderChatAction({
      kind: "scan",
      summary: '<img src=x onerror="alert(1)">',
      detail: '</pre><script>alert(2)</script>',
    })
    expect(html).not.toContain("<img src=x")
    expect(html).not.toContain("<script>alert(2)")
    expect(html).toContain("&lt;img src=x")
    expect(html).toContain("&lt;/pre&gt;&lt;script&gt;")
  })

  it("applies default tone per action kind (generate → success, error → error)", () => {
    expect(
      renderChatAction({ kind: "generate", summary: "ok" }),
    ).toContain('data-tone="success"')
    expect(
      renderChatAction({ kind: "error", summary: "boom" }),
    ).toContain('data-tone="error"')
    expect(
      renderChatAction({ kind: "thinking", summary: "..." }),
    ).toContain('data-tone="info"')
  })

  it("honours an explicit tone override over the kind default", () => {
    const html = renderChatAction({
      kind: "validate",
      summary: "soft fail",
      tone: "warn",
    })
    expect(html).toContain('data-tone="warn"')
    expect(html).not.toContain('data-tone="success"')
  })

  it("renders an external link when href is set, with target=_blank rel=noopener", () => {
    const html = renderChatAction({
      kind: "pr",
      summary: "PR opened 9876",
      href: "https://github.com/foo/bar/pull/1234",
      hrefLabel: "Open PR",
    })
    expect(html).toContain('class="db-chat-action-link"')
    expect(html).toContain('href="https://github.com/foo/bar/pull/1234"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener"')
    expect(html).toContain("Open PR")
  })

  it("supports HTML detail bodies when detailIsHtml=true (e.g. highlight.js)", () => {
    const html = renderChatAction({
      kind: "edit",
      summary: "Edited",
      detail: '<pre class="hljs"><span class="hljs-keyword">const</span></pre>',
      detailIsHtml: true,
    })
    expect(html).toContain('class="hljs-keyword"')
    expect(html).not.toContain("&lt;pre")
  })
})

describe("renderChatMessage — actions vs legacy review block", () => {
  it("renders the action stream when `actions` is present and skips the empty bubble", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      content: "",
      actions: [
        { kind: "scan", summary: "Read context" },
        { kind: "generate", summary: "Generated 1 file" },
        { kind: "validate", summary: "Validation passed (3/3 checks)" },
        { kind: "preview", summary: "Preview ready" },
        { kind: "status", summary: "Done. Review the preview." },
      ],
    }
    const html = renderChatMessage(msg)
    expect(html).toContain('class="db-chat-actions"')
    expect(html).toContain("Read context")
    expect(html).toContain("Generated 1 file")
    expect(html).toContain("Validation passed (3/3 checks)")
    // Bubble suppressed when content is empty + actions present.
    expect(html).not.toContain('class="db-chat-bubble"')
  })

  it("still renders the legacy `review` card when no actions are present (back-compat)", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      content: "Done.",
      review: {
        title: "Review generated files",
        summary: "All good.",
        stats: [{ label: "Files", value: "3", tone: "good" }],
      },
    }
    const html = renderChatMessage(msg)
    expect(html).toContain('class="db-chat-review"')
    expect(html).toContain("Review generated files")
    expect(html).not.toContain('class="db-chat-actions"')
  })

  it("prefers actions over review when both are present (forward-migration path)", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      content: "",
      actions: [{ kind: "status", summary: "Done" }],
      review: {
        title: "Old review",
        summary: "should not appear",
        stats: [],
      },
    }
    const html = renderChatMessage(msg)
    expect(html).toContain('class="db-chat-actions"')
    expect(html).not.toContain("Old review")
    expect(html).not.toContain("should not appear")
  })

  it("keeps the typing-dots bubble for running status even when actions are present", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      status: "running",
      content: "",
      actions: [{ kind: "thinking", summary: "Reasoning…" }],
    }
    const html = renderChatMessage(msg)
    expect(html).toContain("db-chat-typing")
    expect(html).toContain('class="db-chat-actions"')
  })

  it("still surfaces rejectedPatches alongside the action stream", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      content: "",
      actions: [{ kind: "status", summary: "Done" }],
      rejectedPatches: [
        { path: "src/foo.ts", summary: "modifies existing logic" },
      ],
    }
    const html = renderChatMessage(msg)
    expect(html).toContain('class="db-rejected-patches"')
    expect(html).toContain("src/foo.ts")
    expect(html).toContain('class="db-chat-actions"')
  })

  it("does not crash when actions is undefined and review is undefined (plain text bubble)", () => {
    const msg: ChatMessage = {
      ...baseMsg,
      status: "ok",
      content: "Clarification needed — answer the card on the right.",
    }
    const html = renderChatMessage(msg)
    expect(html).toContain("Clarification needed")
    expect(html).not.toContain('class="db-chat-actions"')
    expect(html).not.toContain('class="db-chat-review"')
  })
})

describe("renderChatThread — empty + populated states", () => {
  it("renders the empty hero when no messages exist", () => {
    const html = renderChatThread({ messages: [] })
    expect(html).toContain("db-chat-thread--empty")
    expect(html).toContain("What do you want to build today?")
  })

  it("renders <ul> with one <li> per message when populated", () => {
    const action: ChatAction = { kind: "generate", summary: "Generated 1 file" }
    const html = renderChatThread({
      messages: [
        { ...baseMsg, role: "user", content: "Tambah tab delivery" },
        { ...baseMsg, role: "builder", content: "", actions: [action] },
      ],
    })
    expect(html).toMatch(/<ul[^>]*class="db-chat-thread"/)
    // 2 list items.
    expect(html.match(/<li class="db-chat-msg"/g) || []).toHaveLength(2)
    expect(html).toContain("Tambah tab delivery")
    expect(html).toContain("Generated 1 file")
  })
})
