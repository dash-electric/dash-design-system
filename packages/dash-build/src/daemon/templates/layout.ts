/**
 * Dashboard layout chrome. Pure string templating — no React. Keeps the
 * daemon dependency-free and lean.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export interface LayoutOptions {
  title: string
  body: string
  authIndicator: string
  version: string
}

export function renderLayout(opts: LayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/static/app.css" />
  </head>
  <body>
    <header class="db-header">
      <div class="db-brand">
        <span class="db-brand-dot"></span>
        <span class="db-brand-name">Dash Build</span>
      </div>
      <nav class="db-nav">
        <span class="db-nav-item" title="Settings">⚙</span>
        <span class="db-nav-item" title="Account">👤</span>
        <span class="db-nav-item db-status-dot" id="db-conn-dot" title="Daemon online">🟢</span>
      </nav>
    </header>
    <main class="db-main">
      ${opts.body}
    </main>
    <footer class="db-footer">
      Dash Build v${escapeHtml(opts.version)} · localhost:${escapeHtml(
        process.env.DASH_BUILD_PORT ?? "7777",
      )}
    </footer>
    <script src="/static/app.js"></script>
  </body>
</html>`
}
