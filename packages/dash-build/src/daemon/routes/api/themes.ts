/**
 * Tier 6 — Layer 2 theme runtime switcher endpoints.
 *
 * Per `LAYERED-ARCHITECTURE.md`, Layer 2 is the only swappable layer at
 * runtime: ~30 lines of accent-token overrides per product/tenant. The
 * canonical theme manifests live in the docs registry at
 * `apps/docs/registry/dash/themes/`. This module exposes them over HTTP so
 * the workspace UI can hot-swap the accent ramp without a daemon reload.
 *
 * Routes:
 *
 *   GET /api/themes                  list known themes (manifest summary)
 *   GET /api/themes/:name/css        Layer 2 accent CSS override
 *
 * Wired from `router.ts`:
 *
 *   if (isThemesPath(pathname)) {
 *     return await handleThemesRoute(req, res, pathname)
 *   }
 *
 * The endpoints are read-only. Tenant-specific themes (the `trellis-*`
 * pattern) are surfaced from the manifest as-is; the daemon does not
 * synthesise tenant themes — those live on disk before they show up here.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { methodNotAllowed, notFound, sendJson } from "../_helpers.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Probe candidates for the `apps/docs/registry/dash/themes/` directory. The
 * daemon ships from the dash-build package but the canonical theme assets
 * live in the docs app one level up. Resolution mirrors the preview-template
 * probe pattern so the lookup works in bundled + source layouts.
 */
const THEMES_DIR_CANDIDATES = [
  // Source mode (TS in src/, themes co-located via repo root).
  resolve(__dirname, "..", "..", "..", "..", "..", "..", "apps", "docs", "registry", "dash", "themes"),
  resolve(__dirname, "..", "..", "..", "..", "..", "apps", "docs", "registry", "dash", "themes"),
  resolve(__dirname, "..", "..", "..", "..", "apps", "docs", "registry", "dash", "themes"),
  // Bundled mode (dist/).
  resolve(__dirname, "..", "..", "..", "apps", "docs", "registry", "dash", "themes"),
  // Env override (test setup).
  process.env.DASH_BUILD_THEMES_DIR ?? "",
].filter(Boolean)

function resolveThemesDir(override?: string): string | null {
  // When an explicit override is provided (tests, env), use it exclusively so
  // a missing/synthetic dir doesn't silently fall back to the real docs
  // themes — that would mask isolation in tests + leak the prod manifest
  // into ad-hoc dev setups.
  if (override !== undefined) {
    if (!override) return null
    if (existsSync(join(override, "manifest.json"))) return override
    return null
  }
  for (const candidate of THEMES_DIR_CANDIDATES) {
    if (!candidate) continue
    if (existsSync(join(candidate, "manifest.json"))) {
      return candidate
    }
  }
  return null
}

export interface ThemeManifestEntry {
  name: string
  title: string
  accent: string
  accentName?: string
  default?: boolean
  audience?: string[]
  template?: boolean
  path?: string
}

interface ThemesManifest {
  version?: string
  primaryBrand?: string
  themes?: ThemeManifestEntry[]
}

/**
 * Load + lightly validate the manifest. Returns `null` when the file is
 * missing or malformed — callers should treat that as "no themes installed"
 * rather than an error, so a green-field daemon (no docs app) still boots.
 */
export async function loadThemesManifest(
  dir?: string,
): Promise<ThemesManifest | null> {
  const root = resolveThemesDir(dir)
  if (!root) return null
  try {
    const raw = await readFile(join(root, "manifest.json"), "utf8")
    const parsed = JSON.parse(raw) as ThemesManifest
    return parsed
  } catch {
    return null
  }
}

const THEME_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/

/**
 * Resolve a theme's `colors.css` file path. Validates the name against the
 * manifest (no path-traversal) so a hostile `name` cannot escape the themes
 * directory.
 */
export async function resolveThemeCssPath(
  name: string,
  dir?: string,
): Promise<string | null> {
  if (!THEME_NAME_RE.test(name)) return null
  const root = resolveThemesDir(dir)
  if (!root) return null
  const manifest = await loadThemesManifest(dir)
  if (!manifest?.themes) return null
  const entry = manifest.themes.find((t) => t.name === name)
  if (!entry) return null
  // `path` is relative to the themes dir in the manifest ("./ride"). We
  // ignore it for the actual file resolution to avoid surprises if a future
  // entry points elsewhere — the only supported layout is
  // `<themesDir>/<name>/colors.css`.
  const css = join(root, name, "colors.css")
  if (!existsSync(css)) return null
  return css
}

export function isThemesPath(pathname: string): boolean {
  return pathname === "/api/themes" || /^\/api\/themes\/[^/]+\/css$/.test(pathname)
}

export interface ThemesRouteDeps {
  /** Override themes dir for tests. */
  themesDir?: string
}

export async function handleThemesRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  deps: ThemesRouteDeps = {},
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)

  if (pathname === "/api/themes") {
    const manifest = await loadThemesManifest(deps.themesDir)
    if (!manifest) {
      return sendJson(res, 200, { ok: true, themes: [], primaryBrand: null })
    }
    return sendJson(res, 200, {
      ok: true,
      primaryBrand: manifest.primaryBrand ?? null,
      themes: (manifest.themes ?? []).map((t) => ({
        name: t.name,
        title: t.title,
        accent: t.accent,
        accentName: t.accentName ?? null,
        default: Boolean(t.default),
        audience: t.audience ?? [],
        template: Boolean(t.template),
      })),
    })
  }

  const cssMatch = pathname.match(/^\/api\/themes\/([^/]+)\/css$/)
  if (cssMatch) {
    const name = cssMatch[1]!
    const path = await resolveThemeCssPath(name, deps.themesDir)
    if (!path) return notFound(res)
    try {
      const css = await readFile(path, "utf8")
      res.writeHead(200, {
        "Content-Type": "text/css; charset=utf-8",
        "Content-Length": Buffer.byteLength(css),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      })
      res.end(css)
    } catch {
      return notFound(res)
    }
    return
  }

  return notFound(res)
}
