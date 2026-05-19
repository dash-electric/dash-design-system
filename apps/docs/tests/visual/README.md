# Visual Regression — Playwright

Locks pixel-baseline screenshots for the 9+ BREAKING components flagged during Figma Parity v2 Phase 2 audit, all 16 sector flagship templates, and 5 foundation pages.

## Status (2026-05-17)

**WIP — infra landed, baselines partial.**

- First generation run (`pnpm test:visual:update`) took 10.5 min and only 3 of ~76 screenshots were captured before Next.js dev-server OOM/timeout. Issue: workers run too many parallel page loads on the dev server.

## Next steps

1. **Production build**: use `next build && next start -p 3000` (not `next dev`) in `playwright.config.ts` `webServer.command` to avoid dev-server compile overhead per page.
2. **Reduce workers**: set `workers: 2` (not auto) to limit dev-server load.
3. **Skip missing routes**: some new sector templates (marketing-login, marketing-add-product) need docs preview pages added before tests can hit them.

Once stable, baselines under `tests/visual/<spec>-snapshots/` get committed and CI compares per-PR.

## Run

```bash
# Update baselines (after intentional UI changes)
pnpm test:visual:update

# Compare against baselines (default; fails if pixel diff > 0.05%)
pnpm test:visual

# Interactive UI mode
pnpm test:visual:ui
```

## Config

- `playwright.config.ts` — 2 projects (chromium-light, chromium-dark) × 1440×900 viewport
- Tolerance: `maxDiffPixelRatio: 0.0005` (≤0.05% pixel diff)
- Tests in `tests/visual/*.spec.ts`
- Baselines under `tests/visual/<spec>-snapshots/<name>-chromium-{light,dark}-{platform}.png`

## CI

`.github/workflows/ci.yml` `visual` job runs `pnpm test:visual` on PRs only. Uploads `playwright-report` artifact on failure.
