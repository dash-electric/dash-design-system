# Screenshot capture

Headless Playwright script that snapshots the key Dash DS docs pages as PNGs.
Used as placeholders in the pitch deck + testing playbook, and as a sanity check
that hero pages still render after a refactor.

Script: [`scripts/capture-screenshots.ts`](./scripts/capture-screenshots.ts)
Output: `apps/docs/public/screenshots/<slug>.png` + `index.json`

The output directory is gitignored — re-run locally whenever you need fresh PNGs.

## Run

```bash
# Terminal 1 — start the docs site
pnpm dev

# Terminal 2 — once :3000 is responding
pnpm --filter @dash/docs screenshots
```

If `localhost:3000` is not reachable the script exits non-zero with a clear
message instead of hanging.

Override the base URL (e.g. against a preview deploy):

```bash
BASE_URL=https://dash-ds-preview.vercel.app pnpm --filter @dash/docs screenshots
```

## What it captures

Twelve pages at 1920×1080, light mode, animations disabled:

| Slug | URL |
|------|-----|
| `quick-start` | `/docs/quick-start` |
| `architecture-layered` | `/docs/architecture/layered` |
| `architecture-themes` | `/docs/architecture/themes` |
| `theme-studio` | `/docs/architecture/theme-studio` |
| `architecture-metrics` | `/docs/architecture/metrics` |
| `components-button` | `/docs/components/button` |
| `components-modal` | `/docs/components/modal` |
| `blocks-image-editor` | `/docs/blocks/image-editor-with-audit` |
| `blocks-audit-history` | `/docs/blocks/audit-history-table` |
| `widgets` | `/docs/product/widgets` |
| `onboarding` | `/docs/onboarding` |
| `testing-locally` | `/docs/getting-started/testing-locally` |

Edit `TARGETS` in the script to add or remove pages.

## Output

```
apps/docs/public/screenshots/
├── index.json                   # slug → path + capturedAt + bytes
├── quick-start.png
├── architecture-layered.png
└── …
```

`index.json` schema:

```json
{
  "capturedAt": "2026-05-20T…Z",
  "baseUrl": "http://localhost:3000",
  "viewport": { "width": 1920, "height": 1080 },
  "targets": [
    { "slug": "quick-start", "url": "/docs/quick-start", "path": "…/quick-start.png", "capturedAt": "…", "bytes": 312804 },
    { "slug": "admin-something", "url": "/admin/…", "error": "auth-gated (skipped)", "skipped": true }
  ]
}
```

Failed captures keep going — the script only exits non-zero at the end if
anything failed (skipped auth-gated pages don't count as failures).

## Behavior notes

- **Idempotent** — re-runs overwrite the previous PNGs.
- **Light mode forced** — strips `.dark` from `<html>` + sets `color-scheme: light`.
- **Animations killed** — sets `animation-duration: 0s` + `transition-duration: 0s` on every element, plus Playwright `reducedMotion: 'reduce'`.
- **Sequential** — single browser, one page at a time, to avoid hammering the dev server.
- **`networkidle` + 500ms** before screenshot.
- **Warns when a PNG exceeds 500KB** so we know to investigate (oversized assets,
  unnecessary above-the-fold imagery).

## Auth-gated pages

Anything behind `/admin` or `/pilot` needs a Bearer token. Mark those targets
with `authGated: true` in the script — they're emitted into `index.json` with
`skipped: true` instead of being attempted.

## Dependencies

Uses `chromium` from `@playwright/test`, which is already a devDep of
`@dash/docs` (also used by `pnpm test:visual`). No additional install needed —
if `pnpm install` succeeded, `pnpm screenshots` works.

If Playwright complains about a missing browser binary, run:

```bash
pnpm --filter @dash/docs exec playwright install chromium
```

## Don't

- Don't commit the PNGs (`.gitignore` already excludes them).
- Don't add `playwright` as a runtime dependency — devDep only.
- Don't parallelize captures unless you've raised the dev server's concurrency;
  Next dev mode is single-threaded compilation per route and parallel hits cause
  flaky timeouts.
