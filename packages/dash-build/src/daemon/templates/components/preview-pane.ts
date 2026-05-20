import type { ParsedFile } from "../../../skills/types.js"
import { escapeHtml } from "../layout.js"

export interface PreviewPaneOptions {
  promptId: string
  files: ParsedFile[]
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

  return `<section class="db-preview-pane" data-prompt-id="${escapeHtml(opts.promptId)}" aria-label="Generated code preview">
    <div class="db-preview-frame-wrap">
      <iframe
        class="db-preview-frame"
        title="Generated UI preview"
        sandbox="allow-scripts allow-same-origin"
        src="/preview/${escapeHtml(opts.promptId)}/shell"
        loading="lazy"
      ></iframe>
    </div>
    ${fileSection}
  </section>`
}
