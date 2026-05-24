/**
 * Bundle ParsedFile[] into a single browser-loadable IIFE via esbuild.
 *
 * esbuild is a *peer dependency* (per locked plan). When unavailable we throw
 * EsbuildMissingError with the exact install command. Tests inject an
 * `esbuildModule` shim so we don't depend on a real install.
 *
 * Security:
 *   - All inputs land inside `prepareTempDir(promptId)` — sanitized by
 *     temp-dir.ts. Per-file paths are also resolved + verified to stay below
 *     the temp dir, blocking `../` traversal in ParsedFile.path.
 *   - Output is capped at 5 MB by default to prevent abuse.
 *
 * Entry detection priority:
 *   1. `preview.tsx`
 *   2. `index.tsx`
 *   3. First .tsx file (alphabetical for determinism)
 *   4. First .ts file
 */

import { existsSync, promises as fs, readdirSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { prepareTempDir, resolvePreviewDir } from "./temp-dir.js"
import {
  BundleError,
  BundleTooLargeError,
  EsbuildMissingError,
} from "./types.js"
import type { BundleInput, BundleResult, EsbuildLike, EsbuildPlugin } from "./types.js"
import type { ParsedFile, RepoContextPack } from "../skills/types.js"

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const require = createRequire(import.meta.url)
const GENERATED_ENTRY = "__dash_preview_entry.tsx"

export function findEntry(files: ParsedFile[]): string | null {
  if (files.length === 0) return null
  const byName = new Map(files.map((f) => [f.path, f]))
  if (byName.has("preview.tsx")) return "preview.tsx"
  if (byName.has("index.tsx")) return "index.tsx"
  const tsx = files
    .map((f) => f.path)
    .filter((p) => p.endsWith(".tsx"))
    .sort()
  if (tsx.length > 0) return tsx[0]
  const ts = files
    .map((f) => f.path)
    .filter((p) => p.endsWith(".ts"))
    .sort()
  if (ts.length > 0) return ts[0]
  return null
}

async function loadEsbuild(): Promise<EsbuildLike> {
  try {
    // Dynamic import — esbuild is a peer dep, may not be installed.
    // String-build the specifier so TypeScript skips module resolution
    // (we don't ship @types/esbuild and don't want to require the install).
    const spec = "esbuild"
    const mod = (await import(/* @vite-ignore */ spec)) as unknown as EsbuildLike
    return mod
  } catch {
    throw new EsbuildMissingError()
  }
}

/** Reject paths that escape the temp dir or use absolute / drive paths. */
function assertSafeRelativePath(filePath: string): void {
  if (path.isAbsolute(filePath)) {
    throw new Error(`unsafe_path: absolute path rejected (${filePath})`)
  }
  if (filePath.includes("\0")) {
    throw new Error(`unsafe_path: null byte rejected (${filePath})`)
  }
  // path.normalize then check the first segment isn't ".." — covers `../x`,
  // `a/../../x`, etc.
  const norm = path.normalize(filePath)
  if (norm.startsWith("..") || norm === "..") {
    throw new Error(`unsafe_path: traversal rejected (${filePath})`)
  }
}

async function firstExisting(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isFile()) return candidate
    } catch {
      // try the next candidate
    }
  }
  return null
}

function expansionCandidates(basePath: string): string[] {
  const ext = path.extname(basePath)
  if (ext) return [basePath]
  return [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    `${basePath}.json`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.jsx"),
    path.join(basePath, "index.js"),
  ]
}

function dashAliasPlugin(tempDir: string): EsbuildPlugin {
  const bases = [
    path.join(tempDir, "apps", "docs"),
    path.join(tempDir, "src"),
    tempDir,
  ]
  return {
    name: "dash-preview-alias",
    setup(build) {
      build.onResolve({ filter: /^@\// }, async (args) => {
        const rest = args.path.slice(2)
        const candidates = bases.flatMap((base) =>
          expansionCandidates(path.join(base, rest)),
        )
        const resolved = await firstExisting(candidates)
        return resolved ? { path: resolved } : null
      })
    },
  }
}

function pnpmDependencyFallback(spec: string): string | null {
  const packageName = spec.startsWith("react-dom/") ? "react-dom" : "react"
  const subpath =
    spec === packageName
      ? "index.js"
      : `${spec.slice(packageName.length + 1)}.js`
  const pnpmDir = path.join(process.cwd(), "node_modules", ".pnpm")
  if (!existsSync(pnpmDir)) return null

  const entries = readdirSync(pnpmDir)
  const reactDomEntry = entries.find((entry) => entry.startsWith("react-dom@"))
  const matchedReactVersion = reactDomEntry?.match(/_react@([^_]+)/)?.[1]
  const preferredEntries =
    packageName === "react" && matchedReactVersion
      ? [`react@${matchedReactVersion}`, ...entries.filter((entry) => entry.startsWith("react@"))]
      : entries.filter((entry) => entry.startsWith(`${packageName}@`))

  for (const entry of preferredEntries) {
    if (!entry.startsWith(`${packageName}@`)) continue
    const candidate = path.join(
      pnpmDir,
      entry,
      "node_modules",
      packageName,
      subpath,
    )
    if (existsSync(candidate)) return candidate
  }
  return null
}

function resolvePreviewDependency(spec: string): string {
  const pnpmResolved = pnpmDependencyFallback(spec)
  if (pnpmResolved) return pnpmResolved

  try {
    return require.resolve(spec, {
      paths: [
        process.cwd(),
        path.join(process.cwd(), "node_modules"),
        path.join(process.cwd(), "packages", "dash-build"),
      ],
    })
  } catch (error) {
    throw error
  }
}

function reactResolvePlugin(): EsbuildPlugin {
  return {
    name: "dash-preview-react-resolve",
    setup(build) {
      build.onResolve({ filter: /^react(\/jsx-runtime)?$|^react-dom\/client$/ }, (args) => {
        return { path: resolvePreviewDependency(args.path) }
      })
    },
  }
}

function previewHarnessSource(ctx: RepoContextPack | undefined): string {
  const payload = ctx?.existingShell
    ? {
        repoSlug: ctx.repoSlug,
        surface: ctx.surface,
        theme: ctx.theme,
        route: ctx.targetRoute ?? ctx.defaultRoute,
        activeNav: ctx.targetNavLabel,
        navItems: ctx.existingNavItems,
      }
    : null

  return [
    `const DashPreviewContext = ${JSON.stringify(payload)}`,
    "function DashPreviewHarness(props) {",
    "  const children = props.children",
    "  const ctx = DashPreviewContext",
    "  if (!ctx) return children",
    "  const navItems = Array.isArray(ctx.navItems) && ctx.navItems.length > 0 ? ctx.navItems : ['Dashboard']",
    "  const activeNav = ctx.activeNav || navItems[0]",
    "  const route = ctx.route || '/'",
    "  const rail = React.createElement('aside', { className: 'dash-preview-harness-rail' },",
    "    React.createElement('div', { className: 'dash-preview-harness-brand' }, ctx.repoSlug === 'portal-v2' ? 'Dash Portal' : 'Dash Backoffice'),",
    "    React.createElement('nav', { className: 'dash-preview-harness-nav' },",
    "      navItems.map((item) => React.createElement('span', {",
    "        key: item,",
    "        className: 'dash-preview-harness-nav-item' + (item === activeNav ? ' is-active' : ''),",
    "      }, item))",
    "    )",
    "  )",
    "  const topbar = React.createElement('header', { className: 'dash-preview-harness-topbar' },",
    "    React.createElement('div', { className: 'dash-preview-harness-search' }, ctx.repoSlug === 'portal-v2' ? 'Search trips, invoices, users...' : 'Search orders, mitra, delivery...'),",
    "    React.createElement('div', { className: 'dash-preview-harness-route' },",
    "      React.createElement('span', null, ctx.surface),",
    "      React.createElement('code', null, route)",
    "    )",
    "  )",
    "  return React.createElement('div', { className: 'dash-preview-harness-app', 'data-repo-shell': ctx.repoSlug, 'data-target-route': route },",
    "    rail,",
    "    React.createElement('main', { className: 'dash-preview-harness-main' }, topbar, React.createElement('section', { className: 'dash-preview-harness-slot' }, children))",
    "  )",
    "}",
  ].join("\n")
}

export async function bundleForPreview(opts: BundleInput): Promise<BundleResult> {
  if (opts.files.length === 0) {
    throw new BundleError([{ text: "no input files" }])
  }

  const entry = findEntry(opts.files)
  if (!entry) {
    throw new BundleError([{ text: "no entry file (expected preview.tsx / index.tsx / *.tsx)" }])
  }

  const tempDir = await prepareTempDir(opts.promptId, opts.rootDir)

  // Write files
  for (const file of opts.files) {
    assertSafeRelativePath(file.path)
    const dest = path.join(tempDir, file.path)
    // Defence in depth — re-check resolved path stays in tempDir
    const resolved = path.resolve(dest)
    if (!resolved.startsWith(path.resolve(tempDir) + path.sep) && resolved !== path.resolve(tempDir)) {
      throw new Error(`unsafe_path: resolved outside temp dir (${file.path})`)
    }
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, file.content, "utf8")
  }

  const esbuild = opts.esbuildModule ?? (await loadEsbuild())

  const outfile = path.join(tempDir, "bundle.js")
  const sourceEntryPath = path.join(tempDir, entry)
  const generatedEntryPath = path.join(tempDir, GENERATED_ENTRY)
  const importPath = `./${path.relative(tempDir, sourceEntryPath).replace(/\\/g, "/")}`
  await fs.writeFile(
    generatedEntryPath,
    [
      'import * as React from "react"',
      'import { createRoot } from "react-dom/client"',
      `import * as PreviewModule from ${JSON.stringify(importPath)}`,
      "",
      previewHarnessSource(opts.repoContext),
      "",
      'const root = document.getElementById("root")',
      "const Component = PreviewModule.default",
      "if (!root) {",
      '  throw new Error("preview_root_missing")',
      "}",
      'if (typeof Component !== "function") {',
      '  throw new Error("preview_default_export_missing")',
      "}",
      "createRoot(root).render(React.createElement(DashPreviewHarness, null, React.createElement(Component)))",
      "",
    ].join("\n"),
    "utf8",
  )

  const result = await esbuild.build({
    entryPoints: [generatedEntryPath],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    nodePaths: [path.join(process.cwd(), "node_modules")],
    jsx: "automatic",
    jsxImportSource: "react",
    minify: false,
    sourcemap: "inline",
    outfile,
    external: [],
    plugins: [dashAliasPlugin(tempDir), reactResolvePlugin()],
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    write: true,
    logLevel: "silent",
  })

  if (result.errors.length > 0) {
    throw new BundleError(result.errors)
  }

  const stat = await fs.stat(outfile)
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES
  if (stat.size > maxBytes) {
    await fs.rm(outfile, { force: true })
    throw new BundleTooLargeError(stat.size, maxBytes)
  }

  return {
    bundlePath: outfile,
    entryPath: sourceEntryPath,
    byteSize: stat.size,
    tempDir,
  }
}

/** Resolve the on-disk bundle path for a promptId without rebuilding. Used by
 *  api-routes when serving `/preview/:id/bundle.js`. */
export function bundlePathFor(promptId: string, rootDir?: string): string {
  return path.join(resolvePreviewDir(promptId, rootDir), "bundle.js")
}
