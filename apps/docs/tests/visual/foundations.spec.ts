import { test, expect } from "@playwright/test"

/**
 * Foundation page baselines — colors, typography, shadows, radius.
 * Phase 1 token sync regenerated globals.css. Lock the visual state of token
 * docs pages so future token tweaks (run of figma-tokens-sync.ts) produce
 * intentional, reviewable diffs.
 */

const FOUNDATIONS = [
  "foundations/colors",
  "foundations/typography",
  "foundations/shadows",
  "foundations/dark-mode",
  "resources/tokens",
] as const

for (const path of FOUNDATIONS) {
  test(`foundation ${path} renders stable`, async ({ page }) => {
    await page.goto(`/docs/${path}`)
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.fonts.ready)
    await page.addStyleTag({
      content: `* { caret-color: transparent !important; } ::-webkit-scrollbar { display: none; }`,
    })
    const slug = path.replace(/\//g, "-")
    await expect(page).toHaveScreenshot(`${slug}.png`, {
      fullPage: true,
    })
  })
}
