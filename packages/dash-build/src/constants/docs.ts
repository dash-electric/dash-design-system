/**
 * Tier 6 — Dash DS docs site URL constants. The workspace surface badge and
 * sidebar "Open docs" link build their hrefs from here so a docs hostname
 * change lands in one spot.
 *
 * Default points at the local docs dev server (`pnpm --filter @dash/docs
 * dev`, port 3000) per the CLAUDE.md registry URL convention. Production
 * deployments should set `DASH_DOCS_URL=https://ds.dash.com` in the daemon
 * env so the link opens the public docs.
 */

/** Default Dash DS docs origin. Matches the docs app dev-server port. */
export const DEFAULT_DASH_DOCS_URL = "http://localhost:3000"

/** Read the configured docs URL, trimming a trailing slash for clean joins. */
export function getDashDocsUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.DASH_DOCS_URL?.trim()
  const base = raw && raw.length > 0 ? raw : DEFAULT_DASH_DOCS_URL
  return base.replace(/\/+$/, "")
}

const SURFACE_SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/

/**
 * Build the docs URL for a surface. Surfaces map 1:1 to docs routes under
 * `/docs/surfaces/<slug>`. Unknown / hostile slugs collapse to the docs
 * root instead of leaking unsafe paths into the workspace UI.
 */
export function buildSurfaceDocsUrl(
  surface: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const base = getDashDocsUrl(env)
  if (!surface) return base
  const trimmed = surface.trim().toLowerCase()
  if (!SURFACE_SLUG_RE.test(trimmed)) return base
  return `${base}/docs/surfaces/${trimmed}`
}
