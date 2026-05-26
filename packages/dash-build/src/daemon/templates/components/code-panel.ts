import { escapeHtml } from "../layout.js"
import type { ParsedFile } from "../../../skills/types.js"

/**
 * Code panel — Lovable-style top tab bar + content body.
 *
 * Phase B3 (2026-05-25): refactored from sidebar+content to a tab strip at the
 * top of the panel with a sticky breadcrumb above the file body. File switching
 * is still wired client-side via `setCodeFile` in `client/app.ts` and preserves
 * the `data-code-file` / `data-code-content` selectors so existing handlers
 * keep working.
 *
 * Tabs render with a per-tab close button (×). Closing is a soft hide for now
 * — the tab disappears from the strip but the underlying `<pre>` stays so a
 * refresh restores it (full close persistence is Phase B4 scope).
 *
 * Syntax highlighting is layered on the client via `highlight.js` (loaded from
 * CDN by `layout.ts`). The server stays dependency-free and only emits
 * `<code class="language-…">` so hljs can pick up the right grammar.
 */

export interface CodePanelOptions {
  promptId?: string
  files: ParsedFile[]
  /** Optional explanation rendered above the file list. */
  explanation?: string
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

/** Map ParsedFile.language → highlight.js class suffix. Conservative defaults
 *  so unknown languages fall back to plain text rather than a wrong grammar. */
function hljsLang(language: string): string {
  const key = language.trim().toLowerCase()
  const map: Record<string, string> = {
    typescript: "typescript",
    ts: "typescript",
    tsx: "tsx",
    javascript: "javascript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    css: "css",
    scss: "scss",
    html: "xml",
    xml: "xml",
    md: "markdown",
    markdown: "markdown",
    yaml: "yaml",
    yml: "yaml",
    shell: "bash",
    bash: "bash",
    sh: "bash",
    python: "python",
    py: "python",
    sql: "sql",
  }
  return map[key] ?? "plaintext"
}

/** Render the file content as one `<span class="db-code-line">…</span>` per
 *  source line, with a left gutter line number. Counter-friendly: hljs runs on
 *  the inner `<code>` element so token spans get woven inside the line wrappers.
 */
function renderCodeLines(content: string): string {
  // Normalize line endings; preserve trailing empty line if any.
  const lines = content.replace(/\r\n?/g, "\n").split("\n")
  return lines
    .map((line, idx) => {
      const num = idx + 1
      // NBSP keeps empty lines from collapsing to 0-height.
      const body = line.length === 0 ? " " : escapeHtml(line)
      return (
        `<span class="db-code-line">` +
        `<span class="db-code-line-num" aria-hidden="true">${num}</span>` +
        `<span class="db-code-line-text">${body}</span>` +
        `</span>`
      )
    })
    .join("")
}

function renderEmpty(): string {
  return `<div class="db-code-panel db-code-panel--empty" data-active-file="">
    <div class="db-code-empty">
      <p class="db-code-empty-title">No generated files yet</p>
      <p class="db-code-empty-body">Submit a prompt to see generated code here. The Code tab opens automatically once Dash Build finishes a run.</p>
    </div>
  </div>`
}

export function renderCodePanel(opts: CodePanelOptions): string {
  const files = opts.files ?? []
  if (files.length === 0) return renderEmpty()

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path))
  const activePath = sorted[0]!.path

  // Top tab strip (one tab per file).
  const tabs = sorted
    .map((f) => {
      const isActive = f.path === activePath
      const fileName = f.path.split("/").pop() ?? f.path
      return `<div
        class="db-code-tab${isActive ? " db-code-tab--active" : ""}"
        data-code-tab="${escapeHtml(f.path)}"
        role="presentation"
      >
        <button
          type="button"
          class="db-code-tab-label db-code-file${isActive ? " db-code-file--active" : ""}"
          data-code-file="${escapeHtml(f.path)}"
          aria-pressed="${isActive ? "true" : "false"}"
          title="${escapeHtml(f.path)}"
        >
          <span class="db-code-tab-name">${escapeHtml(fileName)}</span>
        </button>
        <button
          type="button"
          class="db-code-tab-close"
          data-code-tab-close="${escapeHtml(f.path)}"
          aria-label="Close ${escapeHtml(fileName)}"
          title="Close (refresh to restore)"
        >×</button>
      </div>`
    })
    .join("")

  // Per-file content body: sticky breadcrumb (path + lang badge + copy stub)
  // plus the highlighted source. Hidden until activated.
  const panes = sorted
    .map((f) => {
      const hidden = f.path === activePath ? "" : " hidden"
      const lang = hljsLang(f.language)
      const sizeBadge = escapeHtml(formatBytes(f.content.length))
      return `<div
        class="db-code-content-wrap"
        data-code-content="${escapeHtml(f.path)}"
        data-lang="${escapeHtml(f.language)}"
        ${hidden}
      >
        <header class="db-code-breadcrumb">
          <span class="db-code-breadcrumb-path">${escapeHtml(f.path)}</span>
          <span class="db-code-breadcrumb-meta">
            <span class="db-code-lang-badge">${escapeHtml(f.language)}</span>
            <span class="db-code-size-badge">${sizeBadge}</span>
            <button
              type="button"
              class="db-code-copy-btn"
              data-code-copy="${escapeHtml(f.path)}"
              aria-label="Copy file contents"
              title="Copy (coming soon)"
              disabled
            >Copy</button>
          </span>
        </header>
        <pre class="db-code-content"><code class="db-code-block hljs language-${escapeHtml(
          lang,
        )}" data-hljs-lang="${escapeHtml(lang)}">${renderCodeLines(f.content)}</code></pre>
      </div>`
    })
    .join("")

  const promptIdAttr = opts.promptId
    ? ` data-prompt-id="${escapeHtml(opts.promptId)}"`
    : ""

  const explanation = opts.explanation
    ? `<p class="db-code-explanation">${escapeHtml(opts.explanation)}</p>`
    : ""

  return `<div class="db-code-panel db-code-panel--tabs" data-active-file="${escapeHtml(activePath)}"${promptIdAttr}>
    <div class="db-code-tab-bar" role="tablist" aria-label="Generated files">
      <div class="db-code-tab-scroll">${tabs}</div>
      <div class="db-code-tab-bar-end">
        <span class="db-code-tab-count" aria-label="${files.length} file${files.length === 1 ? "" : "s"} generated">${files.length} file${files.length === 1 ? "" : "s"}</span>
      </div>
    </div>
    <section class="db-code-stage" aria-live="polite">
      ${explanation}
      ${panes}
    </section>
  </div>`
}
