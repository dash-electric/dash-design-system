/**
 * Sandpack entry — mounts `App` into the in-browser bundler's root node.
 * Sandpack injects its own `<div id="root"></div>` so we can rely on it.
 *
 * Runtime injection of Tailwind CDN + Plus Jakarta Sans font: Sandpack's
 * `react-ts` template ships its own HTML shell that ignores any
 * `/public/index.html` we provide. The only reliable injection point is
 * here at entry, before the React tree mounts. Idempotent via id checks.
 */
import * as React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

function injectHeadAsset(id: string, build: () => HTMLElement): void {
  if (document.getElementById(id)) return
  const el = build()
  el.id = id
  document.head.appendChild(el)
}

// Tailwind CDN (Play build) — utility class processor.
injectHeadAsset("dash-tw-cdn", () => {
  const s = document.createElement("script")
  s.src = "https://cdn.tailwindcss.com"
  return s
})

// Plus Jakarta Sans — Dash typography.
injectHeadAsset("dash-jakarta-font", () => {
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  return link
})

// Dash token preset for Tailwind — maps utility class names like
// `bg-success-light` / `text-information-base` / `primary-base` to the
// corresponding `var(--…)` Dash Layer 0 CSS variables. Configured AFTER
// Tailwind loads so window.tailwind exists.
injectHeadAsset("dash-tw-config", () => {
  const s = document.createElement("script")
  s.textContent = `
    function applyDashTailwindConfig() {
      if (!window.tailwind) { return setTimeout(applyDashTailwindConfig, 50); }
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              'success-base': 'var(--bg-success-base)',
              'success-light': 'var(--bg-success-light)',
              'success-lighter': 'var(--bg-success-lighter)',
              'success-dark': 'var(--text-success-base)',
              'warning-base': 'var(--bg-warning-base)',
              'warning-light': 'var(--bg-warning-light)',
              'warning-lighter': 'var(--bg-warning-lighter)',
              'warning-dark': 'var(--text-warning-base)',
              'error-base': 'var(--bg-error-base)',
              'error-light': 'var(--bg-error-light)',
              'error-lighter': 'var(--bg-error-lighter)',
              'error-dark': 'var(--text-error-base)',
              'information-base': 'var(--bg-information-base)',
              'information-light': 'var(--bg-information-light)',
              'information-lighter': 'var(--bg-information-lighter)',
              'information-dark': 'var(--text-information-base)',
              'primary-base': 'var(--primary-base)',
              'primary-light': 'var(--primary-light)',
              'primary-lighter': 'var(--primary-lighter)',
              'bg-white-0': 'var(--bg-white-0)',
              'bg-weak-50': 'var(--bg-weak-50)',
              'bg-soft-200': 'var(--bg-soft-200)',
              'bg-sub-300': 'var(--bg-sub-300)',
              'text-strong-950': 'var(--text-strong-950)',
              'text-sub-600': 'var(--text-sub-600)',
              'text-soft-400': 'var(--text-soft-400)',
              'stroke-soft-200': 'var(--stroke-soft-200)',
              'stroke-sub-300': 'var(--stroke-sub-300)',
            },
            fontFamily: {
              sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
              mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
              'dash-sm': '4px',
              'dash-md': '8px',
              'dash-lg': '12px',
              'dash-xl': '16px',
              'dash-2xl': '20px',
            },
          }
        }
      };
    }
    applyDashTailwindConfig();
  `
  return s
})

const container = document.getElementById("root")
if (!container) {
  throw new Error("Sandpack root element missing")
}
const root = createRoot(container)
root.render(<App />)
