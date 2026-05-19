import { test, expect } from "@playwright/test"

/**
 * Visual regression baseline for the 9 BREAKING components flagged during
 * Figma Parity v2 Phase 2 audit. These shifted pixel-for-pixel vs prior Dash
 * impl and need to stay locked going forward.
 *
 * See figma-audit/inventory.csv → Breaking=Yes rows.
 */

const BREAKING_COMPONENTS = [
  "avatar",
  "brand-mark",
  "card",
  "dot-stepper",
  "stat",
  "step-indicator",
  "table",
  "tabs",
  // Phase 2 also flagged tone shifts in: button-family, navigation, feedback
  "button",
  "pagination",
  "alert",
  "badge",
  "banner",
] as const

for (const name of BREAKING_COMPONENTS) {
  test(`${name} docs page renders stable`, async ({ page }) => {
    await page.goto(`/docs/components/${name}`)
    // Wait for fonts + any animations to settle
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.fonts.ready)
    // Hide cursor + scrollbar artifacts via UA-stable CSS injection
    await page.addStyleTag({
      content: `* { caret-color: transparent !important; } ::-webkit-scrollbar { display: none; }`,
    })
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
    })
  })
}
