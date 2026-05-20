import type { ParsedFile } from "../../../skills/types.js"
import { escapeHtml } from "../layout.js"

export interface PreviewPaneOptions {
  promptId: string
  files: ParsedFile[]
  /** URL for the iframe `src`. Defaults to `/preview/<promptId>`. */
  previewUrl?: string
  /** When true, render a graceful fallback chrome instead of the iframe — used
   *  when bundling failed so the user still sees the file list. */
  bundleFailed?: boolean
}

/**
 * Server-rendered preview-pane skeleton. The actual sandboxed iframe is
 * mounted client-side once the bundle is built. This component renders the
 * surrounding chrome — file list, iframe placeholder, action footer.
 */
export function renderPreviewPane(opts: PreviewPaneOptions): string {
  const fileList = opts.files
    .map(
      (f) => `<li class="db-preview-file">
      <span class="db-preview-file-path">${escapeHtml(f.path)}</span>
      <span class="db-preview-file-size db-mono">${f.content.length}B</span>
    </li>`,
    )
    .join("")

  const fileSection = opts.files.length
    ? `<div class="db-preview-files">
        <h4 class="db-preview-subheading">Files (${opts.files.length})</h4>
        <ul class="db-preview-file-list">${fileList}</ul>
      </div>`
    : `<p class="db-muted">Bundle is being prepared…</p>`

  const previewUrl = opts.previewUrl ?? `/preview/${opts.promptId}`
  const frame = opts.bundleFailed
    ? `<div class="db-preview-frame-wrap db-preview-frame-wrap--failed" role="status">
        <p class="db-muted">Preview unavailable — bundle failed. Files below are still PR-ready.</p>
      </div>`
    : `<div class="db-preview-frame-wrap">
        <iframe
          class="db-preview-frame"
          title="Generated UI preview"
          sandbox="allow-scripts allow-same-origin"
          src="${escapeHtml(previewUrl)}"
          loading="lazy"
        ></iframe>
      </div>`

  return `<section class="db-preview-pane" data-prompt-id="${escapeHtml(opts.promptId)}" aria-label="Generated code preview">
    ${frame}
    ${fileSection}
  </section>`
}
