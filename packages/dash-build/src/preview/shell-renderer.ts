/**
 * HTML shell that loads inside the dashboard iframe. The bundle script auto-
 * mounts to #root via React 18 createRoot. We inject Dash Purple + minimal
 * registry tokens so previews look reasonable even before component code
 * imports its own CSS.
 */

import { buildCsp } from "./csp.js"
import { sanitize } from "./temp-dir.js"
import type { ShellRenderInput } from "./types.js"

const FALLBACK_TOKENS = `
:root {
  --primary: #5e2aac;
  --primary-base: #5e2aac;
  --bg-paper-0: #ffffff;
  --bg-white-0: #ffffff;
  --bg-soft-200: #f7f5fb;
  --text-strong-950: #1a1424;
  --text-sub-600: #6b6478;
  --text-soft-400: #9c95a8;
  --stroke-soft-200: #e6e1ee;
}
.bg-primary { background: #5e2aac; }
.text-primary { color: #5e2aac; }
.bg-bg-white-0 { background: #ffffff; }
.bg-bg-paper-0 { background: #ffffff; }
.text-text-strong-950 { color: #1a1424; }
.text-text-sub-600 { color: #6b6478; }
.border-stroke-soft-200 { border-color: #e6e1ee; }
`

export function renderShell(opts: ShellRenderInput): string {
  const safeId = sanitize(opts.promptId)
  const csp = buildCsp()
  const extraCss = opts.cssBundle ? `<style>${opts.cssBundle}</style>` : ""
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dash Build Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300..800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
  <style>${FALLBACK_TOKENS}</style>
  <style>
    body { margin: 0; font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; background: #f7f5fb; color: #1a1424; }
    #root { padding: 24px; min-height: 100vh; }
    .dash-preview-error {
      padding: 16px 20px;
      background: #fdecec;
      border: 1px solid #f4b5b5;
      border-radius: 8px;
      color: #a32d2d;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      white-space: pre-wrap;
    }
  </style>
  ${extraCss}
</head>
<body>
  <div id="root"></div>
  <script>
    window.addEventListener("error", function (e) {
      var root = document.getElementById("root");
      if (root) {
        root.innerHTML = '<div class="dash-preview-error">Preview error: ' +
          (e && e.message ? String(e.message) : "unknown") + '</div>';
      }
    });
    window.addEventListener("unhandledrejection", function (e) {
      var root = document.getElementById("root");
      if (root) {
        root.innerHTML = '<div class="dash-preview-error">Unhandled rejection: ' +
          (e && e.reason ? String(e.reason) : "unknown") + '</div>';
      }
    });
  </script>
  <script src="/preview/${safeId}/bundle.js"></script>
</body>
</html>`
}
