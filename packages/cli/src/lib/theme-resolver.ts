/**
 * theme-resolver — pick the active Dash theme for a CLI invocation.
 *
 * Priority order:
 *   1. `--theme <name>` CLI flag (explicit user override)
 *   2. `components.json` → `dashTheme` field (project-level config)
 *   3. default ("ride") — keeps every existing repo working unchanged
 *
 * An invalid CLI flag is a hard error (the user clearly intended a specific
 * theme). An invalid value sitting in `components.json` is non-fatal: we warn
 * and fall back to the default. This keeps `dash add` working even if the
 * config has drifted ahead of the CLI's known-theme list.
 */
import kleur from "kleur"
import {
  DEFAULT_THEME,
  KNOWN_THEMES,
  validateThemeName,
  type ThemeName,
} from "./theme-registry.js"

export type ThemeResolution = {
  name: ThemeName
  source: "cli" | "config" | "default"
}

export type ThemeResolveOpts = {
  cliFlag?: string
  componentsJson?: { dashTheme?: string } | null
  /** Override the default when explicitly needed (testing). */
  default?: ThemeName
  /** Sink for warnings. Defaults to `console.warn`. */
  warn?: (msg: string) => void
}

const KNOWN_LIST = KNOWN_THEMES.join(", ")

export function resolveTheme(opts: ThemeResolveOpts = {}): ThemeResolution {
  const fallback: ThemeName = opts.default ?? DEFAULT_THEME

  // 1. CLI flag — explicit override; reject unknown names.
  if (opts.cliFlag !== undefined && opts.cliFlag !== "") {
    if (!validateThemeName(opts.cliFlag)) {
      throw new Error(
        `Unknown theme "${opts.cliFlag}". Known themes: ${KNOWN_LIST}`,
      )
    }
    return { name: opts.cliFlag, source: "cli" }
  }

  // 2. components.json field — soft-fail with a warning on unknown values.
  const fromConfig = opts.componentsJson?.dashTheme
  if (fromConfig !== undefined && fromConfig !== "") {
    if (!validateThemeName(fromConfig)) {
      const warn = opts.warn ?? defaultWarn
      warn(
        `components.json dashTheme="${fromConfig}" is not a known theme (${KNOWN_LIST}). Falling back to "${fallback}".`,
      )
      return { name: fallback, source: "default" }
    }
    return { name: fromConfig, source: "config" }
  }

  // 3. default.
  return { name: fallback, source: "default" }
}

function defaultWarn(msg: string): void {
  // Kept side-effect-light so tests can assert via the injected warn fn.
  console.warn(kleur.yellow(`! ${msg}`))
}
