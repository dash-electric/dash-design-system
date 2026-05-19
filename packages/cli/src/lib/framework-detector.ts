/**
 * Framework detector — inspects a consumer project (package.json, tsconfig,
 * lockfile, layout) and returns the framework variant Dash should scaffold for.
 *
 * Returned values feed `init.ts` to pick:
 *   - globals.css path (e.g. `src/index.css` for Vite, `app/tailwind.css` for Remix)
 *   - alias prefix (`@/components` for most, `~/components` for Remix)
 *   - components.json template
 *
 * Detection is structural + dependency-based; we never execute consumer code.
 */
import fs from "node:fs"
import path from "node:path"

export type Framework =
  | "next-app"
  | "next-pages"
  | "vite"
  | "remix"
  | "astro"
  | "cra"
  | "react"
  | "unknown"

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

function readPackageJson(rootPath: string): PackageJson | null {
  const file = path.join(rootPath, "package.json")
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as PackageJson
  } catch {
    return null
  }
}

function allDeps(pkg: PackageJson | null): Record<string, string> {
  if (!pkg) return {}
  return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
}

function hasFile(rootPath: string, ...candidates: string[]): boolean {
  return candidates.some((c) => fs.existsSync(path.join(rootPath, c)))
}

function hasNextAppRouter(rootPath: string): boolean {
  return (
    hasFile(rootPath, "app/layout.tsx", "app/layout.js", "app/layout.jsx") ||
    hasFile(rootPath, "src/app/layout.tsx", "src/app/layout.js", "src/app/layout.jsx")
  )
}

function hasNextPagesRouter(rootPath: string): boolean {
  return (
    hasFile(
      rootPath,
      "pages/_app.tsx",
      "pages/_app.js",
      "pages/_app.jsx",
      "pages/index.tsx",
      "pages/index.js",
    ) ||
    hasFile(
      rootPath,
      "src/pages/_app.tsx",
      "src/pages/_app.js",
      "src/pages/index.tsx",
    )
  )
}

/**
 * Detect the framework variant in use at `rootPath`. Order of checks matters:
 * Next > Remix > Astro > Vite (must come after Remix because Remix uses Vite
 * internally now) > CRA > plain React > unknown.
 */
export function detectFramework(rootPath: string): Framework {
  const pkg = readPackageJson(rootPath)
  const deps = allDeps(pkg)

  // Next.js — discriminate App Router vs Pages Router by structure
  if (deps.next) {
    if (hasNextAppRouter(rootPath)) return "next-app"
    if (hasNextPagesRouter(rootPath)) return "next-pages"
    // Default new Next projects → App Router
    return "next-app"
  }

  // Remix (incl. v2 Vite-based) — detect before Vite
  if (
    deps["@remix-run/react"] ||
    deps["@remix-run/node"] ||
    deps["@remix-run/serve"] ||
    deps["@remix-run/dev"]
  ) {
    return "remix"
  }

  // Astro
  if (deps.astro) return "astro"

  // CRA — react-scripts present, or CRACO (used by real Dash repo
  // `react-fleet-management-web`). Must check before plain Vite.
  if (
    deps["react-scripts"] ||
    deps["@craco/craco"] ||
    deps["craco"] ||
    hasFile(rootPath, "craco.config.js", "craco.config.ts")
  ) {
    return "cra"
  }

  // Vite — generic Vite + React (not Remix, not Astro)
  if (deps.vite && deps.react) return "vite"
  // Vite config file as fallback
  if (
    hasFile(rootPath, "vite.config.ts", "vite.config.js", "vite.config.mjs") &&
    deps.react
  ) {
    return "vite"
  }

  // Plain React (no framework detected, but react is a dep)
  if (deps.react) return "react"

  return "unknown"
}

/**
 * Per-framework scaffold defaults consumed by `dash init`.
 */
export type FrameworkScaffold = {
  /** Path (relative to repo root) where global CSS lives. */
  globalsCss: string
  /** Alias prefix used in components.json — `@/` for most, `~/` for Remix. */
  aliasPrefix: "@/" | "~/"
  /** Component alias root path. */
  aliasComponents: string
  /** UI alias root path. */
  aliasUi: string
  /** Lib alias root path. */
  aliasLib: string
  /** Hooks alias root path. */
  aliasHooks: string
  /** Utils alias root path. */
  aliasUtils: string
  /** Whether RSC (React Server Components) flag should be true in components.json. */
  rsc: boolean
  /** Friendly framework label for prompts/logs. */
  label: string
}

export function scaffoldFor(framework: Framework): FrameworkScaffold {
  switch (framework) {
    case "next-app":
      return {
        globalsCss: "app/globals.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: true,
        label: "Next.js (App Router)",
      }
    case "next-pages":
      return {
        globalsCss: "styles/globals.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "Next.js (Pages Router)",
      }
    case "vite":
      return {
        globalsCss: "src/index.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "Vite (React)",
      }
    case "remix":
      return {
        globalsCss: "app/tailwind.css",
        aliasPrefix: "~/",
        aliasComponents: "~/components",
        aliasUi: "~/components/ui",
        aliasLib: "~/lib",
        aliasHooks: "~/hooks",
        aliasUtils: "~/lib/utils",
        rsc: false,
        label: "Remix",
      }
    case "astro":
      return {
        globalsCss: "src/styles/global.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "Astro",
      }
    case "cra":
      return {
        globalsCss: "src/index.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "Create React App / CRACO",
      }
    case "react":
      return {
        globalsCss: "src/styles/global.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "React (no framework)",
      }
    case "unknown":
    default:
      return {
        globalsCss: "app/globals.css",
        aliasPrefix: "@/",
        aliasComponents: "@/components",
        aliasUi: "@/components/ui",
        aliasLib: "@/lib",
        aliasHooks: "@/hooks",
        aliasUtils: "@/lib/utils",
        rsc: false,
        label: "Unknown (defaulting to Next.js App Router layout)",
      }
  }
}
