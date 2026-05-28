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
  --dash-purple-50: #f4efff;
  --dash-purple-100: #eadfff;
  --dash-purple-200: #d8c4ff;
  --dash-purple-500: #5e2aac;
  --dash-purple-700: #4d228f;
  --dash-purple-800: #3f1d73;
  --dash-purple-950: #241044;
  --dash-red-50: #fff1f1;
  --dash-red-200: #ffcaca;
  --dash-red-500: #e5484d;
  --dash-red-950: #5f1518;
  --dash-orange-50: #fff7ed;
  --dash-orange-200: #fed7aa;
  --dash-orange-500: #f97316;
  --dash-orange-950: #431407;
  --dash-blue-50: #eff6ff;
  --dash-blue-200: #bfdbfe;
  --dash-blue-500: #3b82f6;
  --dash-blue-950: #172554;
  --dash-slate-0: #ffffff;
  --dash-slate-50: #fafafa;
  --dash-slate-100: #f4f4f5;
  --dash-slate-200: #e4e4e7;
  --dash-slate-300: #d4d4d8;
  --dash-slate-400: #a1a1aa;
  --dash-slate-500: #71717a;
  --dash-slate-700: #3f3f46;
  --dash-slate-800: #27272a;
  --dash-slate-950: #09090b;

  --primary: var(--dash-purple-500);
  --primary-base: var(--dash-purple-500);
  --primary-dark: var(--dash-purple-700);
  --primary-darker: var(--dash-purple-800);

  --state-error-dark: var(--dash-red-950);
  --state-error-base: var(--dash-red-500);
  --state-error-light: var(--dash-red-200);
  --state-error-lighter: var(--dash-red-50);
  --state-warning-dark: var(--dash-orange-950);
  --state-warning-base: var(--dash-orange-500);
  --state-warning-light: var(--dash-orange-200);
  --state-warning-lighter: var(--dash-orange-50);
  --state-information-dark: var(--dash-blue-950);
  --state-information-base: var(--dash-blue-500);
  --state-information-light: var(--dash-blue-200);
  --state-information-lighter: var(--dash-blue-50);
  --state-feature-dark: var(--dash-purple-950);
  --state-feature-base: var(--dash-purple-500);
  --state-feature-light: var(--dash-purple-200);
  --state-feature-lighter: var(--dash-purple-50);

  --bg-paper-0: var(--dash-slate-0);
  --bg-white-0: var(--dash-slate-0);
  --bg-weak-50: var(--dash-slate-100);
  --bg-soft-200: var(--dash-slate-200);
  --text-strong-950: var(--dash-slate-950);
  --text-sub-600: var(--dash-slate-500);
  --text-soft-400: var(--dash-slate-400);
  --text-white-0: var(--dash-slate-0);
  --stroke-soft-200: var(--dash-slate-200);
  --stroke-sub-300: var(--dash-slate-300);

  --bg-bg-white-0: var(--bg-white-0);
  --bg-bg-weak-50: var(--bg-weak-50);
  --bg-bg-paper-0: var(--bg-paper-0);
  --bg-bg-soft-200: var(--bg-soft-200);
  --bg-primary-base: var(--primary-base);
  --text-text-strong-950: var(--text-strong-950);
  --text-text-sub-600: var(--text-sub-600);
  --text-text-soft-400: var(--text-soft-400);
  --text-text-white-0: var(--text-white-0);
  --text-primary-base: var(--primary-base);
  --border-stroke-soft-200: var(--stroke-soft-200);
  --border-stroke-sub-300: var(--stroke-sub-300);
  --border-stroke-strong-950: var(--text-strong-950);
  --bg-state-error-lighter: var(--state-error-lighter);
  --text-state-error-dark: var(--state-error-dark);
  --text-state-error-base: var(--state-error-base);
  --stroke-state-error-light: var(--state-error-light);
  --border-state-error-base: var(--state-error-base);
  --bg-state-warning-lighter: var(--state-warning-lighter);
  --text-state-warning-dark: var(--state-warning-dark);
  --text-state-warning-base: var(--state-warning-base);
  --stroke-state-warning-light: var(--state-warning-light);
  --bg-state-information-lighter: var(--state-information-lighter);
  --text-state-information-dark: var(--state-information-dark);
  --text-state-information-base: var(--state-information-base);
  --stroke-state-information-light: var(--state-information-light);
  --bg-state-feature-lighter: var(--state-feature-lighter);
  --text-state-feature-dark: var(--state-feature-dark);
  --text-state-feature-base: var(--state-feature-base);
  --stroke-state-feature-light: var(--state-feature-light);
}
* { box-sizing: border-box; }
.bg-primary { background: var(--primary-base); }
.text-primary { color: var(--primary-base); }
.bg-bg-white-0 { background: var(--bg-white-0); }
.bg-bg-paper-0 { background: var(--bg-paper-0); }
.bg-bg-weak-50 { background: var(--bg-weak-50); }
.bg-state-error-lighter { background: var(--state-error-lighter); }
.bg-state-warning-lighter { background: var(--state-warning-lighter); }
.bg-state-information-lighter { background: var(--state-information-lighter); }
.bg-state-feature-lighter { background: var(--state-feature-lighter); }
.text-text-strong-950 { color: var(--text-strong-950); }
.text-text-sub-600 { color: var(--text-sub-600); }
.text-text-soft-400 { color: var(--text-soft-400); }
.text-text-white-0 { color: var(--text-white-0); }
.text-state-error-base { color: var(--state-error-base); }
.text-state-warning-base { color: var(--state-warning-base); }
.text-state-information-base { color: var(--state-information-base); }
.text-state-feature-base { color: var(--state-feature-base); }
.border-stroke-soft-200 { border-color: var(--stroke-soft-200); }
.border-stroke-sub-300 { border-color: var(--stroke-sub-300); }
.border-stroke-strong-950 { border-color: var(--text-strong-950); }
.border-state-error-base { border-color: var(--state-error-base); }

/* Minimal utility subset for generated preview artifacts. This is intentionally
   small: enough to make Tailwind-like generated UI reviewable in the sandbox
   without bringing Tailwind runtime or repo CSS into the iframe. */
.block { display: block; }
.inline-flex { display: inline-flex; }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.overflow-hidden { overflow: hidden; }
.overflow-x-auto { overflow-x: auto; }
.w-full { width: 100%; }
.min-w-\\[760px\\] { min-width: 760px; }
.h-8 { height: 2rem; }
.h-9 { height: 2.25rem; }
.h-10 { height: 2.5rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.border { border-width: 1px; border-style: solid; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.p-4 { padding: 1rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-medium { font-weight: 600; }
.font-semibold { font-weight: 700; }
.font-bold { font-weight: 750; }
.uppercase { text-transform: uppercase; }
.tracking-tight { letter-spacing: 0; }
.tracking-wider { letter-spacing: 0.04em; }
.transition-colors { transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease; }
.bg-white { background: var(--bg-white-0); }
.bg-transparent { background: transparent; }
.table-auto { table-layout: auto; }
table { border-collapse: collapse; }
thead.bg-bg-weak-50 { background: var(--bg-weak-50); }
th, td { border-color: var(--stroke-soft-200); }

@media (min-width: 640px) {
  .sm\\:flex-row { flex-direction: row; }
  .sm\\:items-start { align-items: flex-start; }
  .sm\\:justify-between { justify-content: space-between; }
}
@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
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
    body { margin: 0; font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; background: var(--bg-weak-50); color: var(--text-strong-950); }
    #root { padding: 24px; min-height: 100vh; box-sizing: border-box; }
    .dash-preview-harness-app {
      display: grid;
      grid-template-columns: 216px minmax(0, 1fr);
      min-height: calc(100vh - 48px);
      overflow: hidden;
      background: var(--bg-white-0);
      border: 1px solid var(--stroke-soft-200);
      border-radius: 10px;
      box-shadow: var(--shadow-md);
    }
    .dash-preview-harness-rail {
      padding: 16px 14px;
      background: var(--bg-paper-0);
      border-right: 1px solid var(--stroke-soft-200);
    }
    .dash-preview-harness-brand {
      display: flex;
      align-items: center;
      min-height: 36px;
      padding: 0 10px 14px;
      color: var(--text-strong-950);
      font-size: var(--text-body);
      font-weight: 800;
      letter-spacing: 0;
    }
    .dash-preview-harness-brand::before {
      content: "";
      width: 24px;
      height: 24px;
      margin-right: 10px;
      border-radius: 7px;
      background: var(--primary-base);
    }
    .dash-preview-harness-nav {
      display: grid;
      gap: 4px;
      padding-top: 6px;
    }
    .dash-preview-harness-nav-item {
      display: flex;
      align-items: center;
      min-height: 36px;
      padding: 0 10px;
      border-radius: 7px;
      color: var(--text-sub-600);
      font-size: 13px;
      font-weight: 650;
      white-space: nowrap;
    }
    .dash-preview-harness-nav-item.is-active {
      color: var(--text-strong-950);
      background: var(--bg-weak-50);
      box-shadow: inset 3px 0 0 var(--primary-base);
    }
    .dash-preview-harness-main {
      min-width: 0;
      background: linear-gradient(180deg, var(--bg-white-0) 0%, var(--bg-weak-50) 100%);
    }
    .dash-preview-harness-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 64px;
      padding: 0 24px;
      border-bottom: 1px solid var(--stroke-soft-200);
      background: var(--bg-white-0);
    }
    .dash-preview-harness-search {
      width: min(360px, 50%);
      min-height: 34px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      border: 1px solid var(--stroke-soft-200);
      border-radius: 8px;
      color: var(--text-soft-400);
      background: var(--bg-weak-50);
      font-size: 12px;
      font-weight: 600;
    }
    .dash-preview-harness-route {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid var(--stroke-soft-200);
      border-radius: var(--radius-full);
      color: var(--text-sub-600);
      background: var(--bg-white-0);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .dash-preview-harness-route code {
      color: var(--text-strong-950);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      font-weight: 700;
    }
    .dash-preview-harness-slot {
      padding: 24px;
      min-height: calc(100vh - 114px);
      box-sizing: border-box;
    }
    @media (max-width: 760px) {
      #root { padding: 12px; }
      .dash-preview-harness-app { grid-template-columns: 1fr; }
      .dash-preview-harness-rail { border-right: 0; border-bottom: 1px solid var(--stroke-soft-200); }
      .dash-preview-harness-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dash-preview-harness-topbar { align-items: flex-start; flex-direction: column; padding: 14px; }
      .dash-preview-harness-search { width: 100%; }
      .dash-preview-harness-slot { padding: 16px; }
    }
    .dash-preview-error {
      padding: 16px 24px;
      background: var(--state-error-lighter);
      border: 1px solid var(--state-error-light);
      border-radius: 8px;
      color: var(--state-error-dark);
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
