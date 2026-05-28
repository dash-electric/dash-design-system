# Dash Build — Preview Template

Sandpack scaffold consumed by `component-preview.ts`. The generated
component is injected as `/Component.tsx`; everything else in this
directory is the surrounding harness.

## Files

| File | Role |
|---|---|
| `index.html` | Iframe shell — Tailwind CDN + Plus Jakarta Sans + dash-token mapping (Tier 1 / Phase 0E) |
| `index.tsx` | Sandpack entry — mounts `<App />` |
| `App.tsx` | Wraps `<Component />` with token CSS + mocks |
| `Component.tsx.placeholder` | Default body when no LLM output is present |
| `dash-tokens.css` | Layer 0 token variables (neutrals, primary, semantic state, spacing, typography) |
| `mocks.json` | Fixtures (4 mitra, 3 orders, stats) |
| `package.json` | Template-only deps (react, react-dom) |
| `tsconfig.json` | Strict TS for in-browser bundler |

## Why a `preview-template/` directory and not inlined strings?

So a designer can hand-edit the harness (App.tsx layout, mock data,
token additions) without touching TS service code. The service reads the
directory at build time via `fs.readFile`; no rebuild required for
template tweaks.

## Adding to mocks

Add a new top-level key in `mocks.json`. App.tsx spreads the JSON into
the component props, so a component that destructures `props.mitra` /
`props.orders` / `props.stats` will work without further changes.
