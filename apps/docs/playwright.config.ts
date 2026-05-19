import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright visual regression config — Dash DS.
 *
 * Run: `pnpm test:visual` (boots dev server, screenshots all configured routes
 * in light + dark, diff vs baseline in `tests/visual/__screenshots__/`).
 *
 * Update baselines after intentional UI changes: `pnpm test:visual --update-snapshots`.
 */
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Dev server can't handle many parallel page loads — cap at 2 workers.
  workers: 2,
  timeout: 60_000,
  reporter: [["html", { open: "never" }], ["list"]],
  expect: {
    // Allow ≤0.05% pixel diff per shot (anti-aliasing tolerance)
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.0005,
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-light",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, colorScheme: "light" },
    },
    {
      name: "chromium-dark",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, colorScheme: "dark" },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
