/**
 * theme-registry — Layer 2 theme catalog for Dash multi-product architecture.
 *
 * Themes layer on top of the base Dash foundation and brand a consumer repo
 * for one product (ride / logistic / travel / marketplace / trellis-tenant).
 * Each theme owns its own accent ramp, semantic mapping, and metadata; the
 * canonical source lives at
 *   `apps/docs/registry/dash/themes/<name>/manifest.json`
 *
 * The CLI side of this file is intentionally lightweight: it knows the list
 * of valid theme names, can look up a manifest from disk inside the Dash DS
 * repo (build time), and returns a safe in-memory default otherwise so
 * consumer-side `dashkit add --theme <x>` keeps working before all manifests
 * land. Manifest loading is best-effort — a missing file falls back to the
 * minimal `defaultMetadata` shape rather than throwing.
 */
import fs from "node:fs"
import path from "node:path"

export const KNOWN_THEMES = [
  "ride",
  "logistic",
  "travel",
  "marketplace",
  "trellis-tenant",
] as const

export type ThemeName = (typeof KNOWN_THEMES)[number]

export const DEFAULT_THEME: ThemeName = "ride"

export type ThemeMetadata = {
  name: ThemeName
  title: string
  description: string
  /** Hex of the canonical accent-500 for this theme. */
  accent: string
  /** Path (relative to DS repo root) of the theme colors css if available. */
  colorsCssPath?: string
  /** Free-form extras the manifest may carry (variants, audience, etc.). */
  meta?: Record<string, unknown>
}

const DEFAULT_METADATA: Record<ThemeName, ThemeMetadata> = {
  ride: {
    name: "ride",
    title: "Ride",
    description: "Default Dash ride-hailing theme (mitra-facing).",
    accent: "#5e2aac",
  },
  logistic: {
    name: "logistic",
    title: "Logistic",
    description: "Dash Express logistic / fleet operations theme.",
    accent: "#0f6cbd",
  },
  travel: {
    name: "travel",
    title: "Travel",
    description: "Dash travel / leisure booking theme.",
    accent: "#0e9f6e",
  },
  marketplace: {
    name: "marketplace",
    title: "Marketplace",
    description: "Dash multi-vendor commerce theme.",
    accent: "#d97706",
  },
  "trellis-tenant": {
    name: "trellis-tenant",
    title: "Trellis Tenant",
    description: "Trellis multi-tenant SaaS theme.",
    accent: "#7e22ce",
  },
}

export function validateThemeName(name: string): name is ThemeName {
  return (KNOWN_THEMES as readonly string[]).includes(name)
}

/**
 * Walk up from `start` looking for `apps/docs/registry/dash/themes/`. When run
 * inside the Dash DS monorepo this is what feeds real manifest data; outside
 * (consumer repos) it returns null and callers fall back to the in-memory
 * defaults.
 */
function findThemesRoot(start: string = process.cwd()): string | null {
  let cur = path.resolve(start)
  const root = path.parse(cur).root
  while (cur && cur !== root) {
    const candidate = path.join(
      cur,
      "apps",
      "docs",
      "registry",
      "dash",
      "themes",
    )
    if (fs.existsSync(candidate)) return candidate
    cur = path.dirname(cur)
  }
  return null
}

/**
 * Load `manifest.json` for a theme. Best-effort: returns the default metadata
 * if the manifest doesn't exist or is malformed (Phase B hasn't fully landed
 * manifests for every theme yet).
 */
export function getThemeMetadata(
  name: ThemeName,
  opts: { cwd?: string } = {},
): ThemeMetadata {
  const fallback = DEFAULT_METADATA[name]
  const root = findThemesRoot(opts.cwd ?? process.cwd())
  if (!root) return fallback

  const manifestPath = path.join(root, name, "manifest.json")
  if (!fs.existsSync(manifestPath)) return fallback

  try {
    const raw = JSON.parse(
      fs.readFileSync(manifestPath, "utf-8"),
    ) as Partial<ThemeMetadata> & Record<string, unknown>
    const colorsCssCandidate = path.join(root, name, "colors.css")
    return {
      name,
      title: typeof raw.title === "string" ? raw.title : fallback.title,
      description:
        typeof raw.description === "string"
          ? raw.description
          : fallback.description,
      accent: typeof raw.accent === "string" ? raw.accent : fallback.accent,
      colorsCssPath: fs.existsSync(colorsCssCandidate)
        ? colorsCssCandidate
        : undefined,
      meta: (raw.meta as Record<string, unknown> | undefined) ?? undefined,
    }
  } catch {
    return fallback
  }
}

/**
 * Read the theme's `colors.css` file. Returns a sensible scaffold string when
 * the file doesn't exist yet (Phase B may not have shipped css for every
 * theme), so `dashkit add --theme <x>` always produces something on disk.
 */
export function readThemeColorsCss(
  name: ThemeName,
  opts: { cwd?: string } = {},
): string {
  const meta = getThemeMetadata(name, opts)
  if (meta.colorsCssPath && fs.existsSync(meta.colorsCssPath)) {
    return fs.readFileSync(meta.colorsCssPath, "utf-8")
  }
  // Forward-compat scaffold; consumers can edit freely.
  return [
    `/* Dash theme: ${meta.title} (${name}) */`,
    `/* Generated by \`dashkit add --theme ${name}\` — Phase C scaffold. */`,
    `:root {`,
    `  --theme-accent-500: ${meta.accent};`,
    `}`,
    ``,
  ].join("\n")
}
