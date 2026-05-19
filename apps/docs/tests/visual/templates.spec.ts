import { test, expect } from "@playwright/test"

/**
 * Flagship sector template baselines — HR, Finance, Marketing.
 * Phase 3a ports replaced placeholder dashboards with Figma 1:1 layouts.
 * Lock visual state here to prevent regression on future agent runs.
 */

const TEMPLATES = [
  // HR
  "hr-dashboard",
  "hr-calendar",
  "hr-teams",
  "hr-profile-settings",
  "hr-login",
  "hr-register",
  "hr-reset-password",
  // Finance
  "finance-dashboard",
  "finance-cards",
  "finance-transactions",
  "finance-login",
  // Marketing
  "marketing-dashboard",
  "marketing-analytics",
  "marketing-products",
  "marketing-orders",
  "marketing-login",
] as const

for (const name of TEMPLATES) {
  test(`template ${name} renders stable`, async ({ page }) => {
    await page.goto(`/docs/templates/${name}`)
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.fonts.ready)
    await page.addStyleTag({
      content: `* { caret-color: transparent !important; } ::-webkit-scrollbar { display: none; }`,
    })
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
    })
  })
}
