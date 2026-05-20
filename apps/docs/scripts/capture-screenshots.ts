/**
 * Headless screenshot capture for Dash DS docs site.
 *
 * Run:
 *   Terminal 1: pnpm dev
 *   Terminal 2: pnpm --filter @dash/docs screenshots
 *
 * Outputs:
 *   apps/docs/public/screenshots/<slug>.png
 *   apps/docs/public/screenshots/index.json
 *
 * Targets ~8-12 key pages used as placeholders in pitch deck + testing playbook.
 * Auth-gated pages (admin, pilot) are flagged + skipped.
 *
 * Idempotent — re-runs overwrite old PNGs.
 */

// `@playwright/test` re-exports the `playwright` core APIs (chromium, Browser, …),
// so we don't need a separate `playwright` dependency.
import { chromium, type Browser } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000"
const OUT_DIR = join(process.cwd(), "public", "screenshots")
const VIEWPORT = { width: 1920, height: 1080 } as const
const GOTO_TIMEOUT_MS = 15_000
const POST_LOAD_WAIT_MS = 500

type Target = {
  slug: string
  url: string
  /** Auth-gated pages are skipped + flagged in index.json. */
  authGated?: boolean
}

const TARGETS: Target[] = [
  { slug: "quick-start", url: "/docs/quick-start" },
  { slug: "architecture-layered", url: "/docs/architecture/layered" },
  { slug: "architecture-themes", url: "/docs/architecture/themes" },
  { slug: "theme-studio", url: "/docs/architecture/theme-studio" },
  { slug: "architecture-metrics", url: "/docs/architecture/metrics" },
  { slug: "components-button", url: "/docs/components/button" },
  { slug: "components-modal", url: "/docs/components/modal" },
  { slug: "blocks-image-editor", url: "/docs/blocks/image-editor-with-audit" },
  { slug: "blocks-audit-history", url: "/docs/blocks/audit-history-table" },
  { slug: "widgets", url: "/docs/product/widgets" },
  { slug: "onboarding", url: "/docs/onboarding" },
  { slug: "testing-locally", url: "/docs/getting-started/testing-locally" },
]

type Result =
  | { slug: string; url: string; path: string; capturedAt: string; bytes: number }
  | { slug: string; url: string; error: string; skipped?: boolean }

async function preflight(): Promise<void> {
  try {
    const res = await fetch(BASE_URL, { method: "HEAD" })
    if (!res.ok && res.status >= 500) {
      throw new Error(`server returned ${res.status}`)
    }
  } catch (e) {
    throw new Error(
      `Cannot reach ${BASE_URL}. Start the dev server first:\n  pnpm dev\n\nUnderlying: ${(e as Error).message}`,
    )
  }
}

async function capture(browser: Browser, target: Target): Promise<Result> {
  if (target.authGated) {
    return { slug: target.slug, url: target.url, error: "auth-gated (skipped)", skipped: true }
  }

  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: "reduce",
    colorScheme: "light",
    deviceScaleFactor: 1,
  })

  // Force light mode + kill animations even if the app ignores reduced-motion.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("theme", "light")
    } catch {
      // ignore
    }
  })

  const page = await context.newPage()

  try {
    await page.goto(`${BASE_URL}${target.url}`, {
      waitUntil: "networkidle",
      timeout: GOTO_TIMEOUT_MS,
    })

    // Kill animations + force light mode at the CSS layer.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        html { color-scheme: light !important; }
        html.dark { color-scheme: light !important; }
      `,
    })

    // Drop the .dark class if Tailwind dark mode applied it.
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark")
    })

    await page.waitForTimeout(POST_LOAD_WAIT_MS)

    const path = join(OUT_DIR, `${target.slug}.png`)
    const buffer = await page.screenshot({ path, fullPage: false, type: "png" })

    return {
      slug: target.slug,
      url: target.url,
      path,
      capturedAt: new Date().toISOString(),
      bytes: buffer.byteLength,
    }
  } finally {
    await page.close().catch(() => {})
    await context.close().catch(() => {})
  }
}

async function main(): Promise<void> {
  await preflight()
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const results: Result[] = []

  try {
    for (const target of TARGETS) {
      try {
        const r = await capture(browser, target)
        if ("path" in r) {
          const kb = Math.round(r.bytes / 1024)
          const warn = kb > 500 ? ` ⚠️ ${kb}KB (>500KB target)` : ` (${kb}KB)`
          console.log(`✓ ${target.slug}${warn}`)
        } else {
          console.log(`⊘ ${target.slug}: ${r.error}`)
        }
        results.push(r)
      } catch (e) {
        const message = (e as Error).message
        console.error(`✗ ${target.slug}: ${message}`)
        results.push({ slug: target.slug, url: target.url, error: message })
      }
    }
  } finally {
    await browser.close()
  }

  const indexPath = join(OUT_DIR, "index.json")
  await writeFile(
    indexPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        viewport: VIEWPORT,
        targets: results,
      },
      null,
      2,
    ),
  )

  const ok = results.filter((r) => "path" in r).length
  const fail = results.filter((r) => "error" in r && !(r as { skipped?: boolean }).skipped).length
  const skipped = results.filter((r) => (r as { skipped?: boolean }).skipped).length
  console.log(`\n${ok} captured · ${fail} failed · ${skipped} skipped`)
  console.log(`Index: ${indexPath}`)

  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
