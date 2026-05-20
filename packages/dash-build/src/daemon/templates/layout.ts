/**
 * Dashboard layout chrome. Pure string templating — no React. Keeps the
 * daemon dependency-free and lean.
 *
 * Brand styling follows Dash Foundation Layer 0 tokens:
 *  - Dash Purple #5e2aac (canonical)
 *  - Plus Jakarta Sans typography
 *  - JetBrains Mono for code/mono
 *
 * Layer 0 tokens live in dashboard CSS (served by /static/app.css). This
 * layout supplies only the chrome (header, footer, font loading).
 */

import { toastContainer } from "./components/toast.js"
import { themeToggle } from "./components/theme-toggle.js"
import { renderWsIndicator } from "./components/ws-indicator.js"

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
  /** "ok" | "pending" — drives the auth indicator pill color. */
  authIndicator: string
  version: string
  /** Optional port override for the footer hint. Defaults to env or 7777. */
  port?: number | string
}

export function renderLayout(opts: LayoutOptions): string {
  const port = String(opts.port ?? process.env.DASH_BUILD_PORT ?? "7777")
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(opts.title)} · Dash Build</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/static/app.css" />
    <script>
      // Pre-paint theme application to avoid FOUC.
      (function () {
        try {
          var stored = localStorage.getItem("dash-build-theme");
          if (stored === "dark" || stored === "light") {
            document.documentElement.setAttribute("data-theme", stored);
          }
        } catch (e) { /* localStorage may be blocked */ }
      })();
    </script>
  </head>
  <body>
    <a class="sr-only" href="#db-main">Skip to main content</a>
    <header class="db-header">
      <div class="db-brand">
        <span class="db-brand-mark" aria-hidden="true"></span>
        <span class="db-brand-name">Dash Build</span>
        <span class="db-brand-version" aria-label="Version">v${escapeHtml(opts.version)}</span>
      </div>
      <div class="db-header-actions">
        ${renderWsIndicator()}
        ${themeToggle()}
        <button class="db-icon-btn" type="button" aria-label="Settings" title="Settings">⚙</button>
        <button class="db-icon-btn" type="button" aria-label="Account" title="Account">◉</button>
      </div>
    </header>
    <main class="db-main" id="db-main">
      ${opts.body}
    </main>
    <footer class="db-footer">
      Dash Build · <span class="db-mono">localhost:${escapeHtml(port)}</span> · Layered Architecture Layer 0 brand
    </footer>
    ${toastContainer()}
    <script src="/static/app.js"></script>
  </body>
</html>`
}
