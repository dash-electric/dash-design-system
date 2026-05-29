/**
 * `dashkit info` — scan consumer project and emit a structured snapshot of its
 * Dash state. Prereq plumbing for the dash-skill auto-activation pipeline:
 * the skill calls `dashkit info --json` to capture repo context (installed items,
 * framework, aliases, registry URL, custom hooks) before injecting AI prompts.
 *
 * Side-effect free: pure read of CWD. Never prints the registry token; only
 * exposes `hasToken: bool`.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import {
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
} from "../lib/components-json.js"
import { fetchRegistryIndex } from "../lib/registry-fetch.js"
import { resolveTheme } from "../lib/theme-resolver.js"
import type { ComponentsJson, RegistryIndex } from "../lib/schema.js"

export const INFO_SCHEMA_VERSION = 1

export type InfoOpts = {
  json?: boolean
  cwd?: string
  registry?: string
  token?: string
  /** Optional CLI override for the resolved theme. */
  theme?: string
  /** Inject a pre-fetched registry index (testing). */
  _index?: RegistryIndex | null
}

export type InfoSnapshot = {
  schemaVersion: number
  project: {
    framework: "next" | "vite" | "remix" | "astro" | "unknown"
    typescript: boolean
    packageManager: "pnpm" | "npm" | "yarn" | "bun" | "unknown"
    rootPath: string
  }
  aliases: Record<string, string>
  dash: {
    registryUrl: string
    hasToken: boolean
    installedItems: Array<{
      name: string
      type: string
      path: string
    }>
    /** Layer-2 theme detected for this project. */
    theme: {
      name: string
      source: "cli" | "config" | "default"
    }
  }
  customHooks: string[]
  apiBaseUrl: string | null
}

function readPkg(cwd: string): Record<string, unknown> | null {
  const file = path.join(cwd, "package.json")
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return null
  }
}

export function detectFramework(cwd: string): InfoSnapshot["project"]["framework"] {
  const pkg = readPkg(cwd)
  if (!pkg) return "unknown"
  const deps = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  }
  if (deps.next) return "next"
  if (deps["@remix-run/react"] || deps["@remix-run/node"]) return "remix"
  if (deps.astro) return "astro"
  if (deps.vite) return "vite"
  return "unknown"
}

export function detectTypeScript(cwd: string): boolean {
  if (fs.existsSync(path.join(cwd, "tsconfig.json"))) return true
  const pkg = readPkg(cwd)
  if (!pkg) return false
  const deps = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  }
  return Boolean(deps.typescript)
}

export function detectPackageManager(
  cwd: string,
): InfoSnapshot["project"]["packageManager"] {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun"
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn"
  if (fs.existsSync(path.join(cwd, "package-lock.json"))) return "npm"
  const pkg = readPkg(cwd)
  const pm = (pkg?.packageManager as string | undefined) ?? ""
  if (pm.startsWith("pnpm")) return "pnpm"
  if (pm.startsWith("yarn")) return "yarn"
  if (pm.startsWith("bun")) return "bun"
  if (pm.startsWith("npm")) return "npm"
  return "unknown"
}

function readTsconfigPaths(cwd: string): Record<string, string> {
  const file = path.join(cwd, "tsconfig.json")
  if (!fs.existsSync(file)) return {}
  try {
    // Strip line comments — tsconfig often has them
    const raw = fs.readFileSync(file, "utf-8").replace(/^\s*\/\/.*$/gm, "")
    const json = JSON.parse(raw)
    const paths: Record<string, string[]> = json?.compilerOptions?.paths ?? {}
    const out: Record<string, string> = {}
    for (const [key, vals] of Object.entries(paths)) {
      if (Array.isArray(vals) && vals.length > 0) {
        // "@/*" -> "./src/*" ; normalize to "@/..." semantic
        out[key.replace(/\/\*$/, "")] = vals[0].replace(/\/\*$/, "")
      }
    }
    return out
  } catch {
    return {}
  }
}

export function detectAliases(
  cwd: string,
  config: ComponentsJson | null,
): Record<string, string> {
  // Prefer components.json aliases (Dash's source of truth)
  const cjAliases = (config?.aliases ?? {}) as Record<string, string>
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(cjAliases)) {
    if (v) out[k] = v
  }
  // Fall back to tsconfig paths if components.json is sparse
  const tsAliases = readTsconfigPaths(cwd)
  for (const [k, v] of Object.entries(tsAliases)) {
    if (!Object.values(out).includes(k)) {
      out[`tsconfig:${k}`] = v
    }
  }
  return out
}

function aliasToFsRoot(alias: string, cwd: string): string {
  // "@/components/ui" -> "<cwd>/components/ui" or "<cwd>/src/components/ui"
  // We try both since aliasing varies; first existing wins.
  const stripped = alias.replace(/^@\//, "")
  const candidates = [path.join(cwd, stripped), path.join(cwd, "src", stripped)]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return candidates[0]
}

function walkFiles(root: string, max = 500): string[] {
  if (!fs.existsSync(root)) return []
  const out: string[] = []
  const stack: string[] = [root]
  while (stack.length && out.length < max) {
    const cur = stack.pop()!
    let entries: fs.Dirent[] = []
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      const p = path.join(cur, e.name)
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue
        stack.push(p)
      } else if (e.isFile()) {
        out.push(p)
      }
    }
  }
  return out
}

/**
 * Match installed registry items by scanning aliased component dirs and
 * comparing basenames against the registry index. Best-effort: file may have
 * been moved / renamed by the user.
 */
export function findInstalledItems(
  cwd: string,
  config: ComponentsJson | null,
  index: RegistryIndex | null,
): InfoSnapshot["dash"]["installedItems"] {
  if (!index) return []
  const aliases = (config?.aliases ?? {}) as Record<string, string>
  const roots = new Set<string>()
  for (const v of Object.values(aliases)) {
    if (!v) continue
    roots.add(aliasToFsRoot(v, cwd))
  }
  // Also probe canonical Dash layout `registry/dash/<type>/`
  roots.add(path.join(cwd, "registry", "dash"))

  const allFiles: string[] = []
  for (const r of roots) {
    allFiles.push(...walkFiles(r))
  }

  const found: InfoSnapshot["dash"]["installedItems"] = []
  const seen = new Set<string>()
  for (const item of index.items) {
    if (seen.has(item.name)) continue
    // Match by `<name>.tsx` or `<name>.ts` basename
    const hit = allFiles.find((f) => {
      const base = path.basename(f).replace(/\.(tsx?|jsx?|css|mdx?)$/, "")
      return base === item.name
    })
    if (hit) {
      found.push({
        name: item.name,
        type: item.type,
        path: path.relative(cwd, hit),
      })
      seen.add(item.name)
    }
  }
  return found
}

/**
 * Discover custom hooks by scanning common hook dirs and excluding files that
 * belong to known registry hooks. Returns hook export names (best-effort: file
 * basename if no `export function useX` found).
 */
export function findCustomHooks(
  cwd: string,
  aliases: Record<string, string>,
  installedNames: Set<string>,
): string[] {
  const hookAlias = aliases.hooks ?? "@/hooks"
  const roots = [
    aliasToFsRoot(hookAlias, cwd),
    path.join(cwd, "hooks"),
    path.join(cwd, "lib", "hooks"),
    path.join(cwd, "src", "hooks"),
    path.join(cwd, "src", "lib", "hooks"),
  ]
  const seen = new Set<string>()
  const found: string[] = []
  for (const r of roots) {
    if (seen.has(r)) continue
    seen.add(r)
    const files = walkFiles(r, 100)
    for (const f of files) {
      const base = path.basename(f).replace(/\.(tsx?|jsx?)$/, "")
      if (!base.startsWith("use")) continue
      if (installedNames.has(base)) continue
      if (!found.includes(base)) found.push(base)
    }
  }
  return found
}

export function findApiBaseUrl(cwd: string): string | null {
  const envFiles = [".env.local", ".env", ".env.development"]
  const keys = [
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_API_BASE_URL",
    "VITE_API_URL",
    "VITE_API_BASE_URL",
    "PUBLIC_API_URL",
  ]
  for (const ef of envFiles) {
    const file = path.join(cwd, ef)
    if (!fs.existsSync(file)) continue
    try {
      const raw = fs.readFileSync(file, "utf-8")
      for (const line of raw.split(/\r?\n/)) {
        for (const k of keys) {
          const m = line.match(new RegExp(`^\\s*${k}\\s*=\\s*(.+?)\\s*$`))
          if (m) return m[1].replace(/^["']|["']$/g, "")
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

function envHasToken(cwd: string): boolean {
  if (process.env.DASH_REGISTRY_TOKEN) return true
  const envFile = path.join(cwd, ".env.local")
  if (!fs.existsSync(envFile)) return false
  try {
    const raw = fs.readFileSync(envFile, "utf-8")
    return /^\s*DASH_REGISTRY_TOKEN\s*=\s*\S/m.test(raw)
  } catch {
    return false
  }
}

export async function collectInfo(opts: InfoOpts = {}): Promise<InfoSnapshot> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registry ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  // Index fetch — best-effort; failures degrade to empty installedItems list.
  // Pass `_index: null` explicitly in tests to skip the network call.
  let index: RegistryIndex | null
  if (opts._index !== undefined) {
    index = opts._index
  } else {
    try {
      index = await fetchRegistryIndex({
        registryUrl,
        token: opts.token,
        cwd,
      })
    } catch {
      index = null
    }
  }

  const aliases = detectAliases(cwd, config)
  const installedItems = findInstalledItems(cwd, config, index)
  const installedNames = new Set(installedItems.map((i) => i.name))
  const customHooks = findCustomHooks(cwd, aliases, installedNames)
  const theme = resolveTheme({ cliFlag: opts.theme, componentsJson: config })

  return {
    schemaVersion: INFO_SCHEMA_VERSION,
    project: {
      framework: detectFramework(cwd),
      typescript: detectTypeScript(cwd),
      packageManager: detectPackageManager(cwd),
      rootPath: cwd,
    },
    aliases,
    dash: {
      registryUrl,
      hasToken: envHasToken(cwd) || Boolean(opts.token),
      installedItems,
      theme,
    },
    customHooks,
    apiBaseUrl: findApiBaseUrl(cwd),
  }
}

function printPretty(snap: InfoSnapshot): void {
  const pad = (s: string, w = 18) => s.padEnd(w)
  const line = (k: string, v: string) =>
    `${kleur.dim(pad(k))} ${kleur.bold(v)}`

  console.log(kleur.bold().cyan(`\nDash project snapshot`))
  console.log(kleur.dim(`schema v${snap.schemaVersion} · ${snap.project.rootPath}\n`))

  console.log(kleur.bold("Project"))
  console.log(line("  framework", snap.project.framework))
  console.log(line("  typescript", String(snap.project.typescript)))
  console.log(line("  package manager", snap.project.packageManager))
  console.log()

  console.log(kleur.bold("Aliases"))
  if (Object.keys(snap.aliases).length === 0) {
    console.log(kleur.dim("  (none)"))
  } else {
    for (const [k, v] of Object.entries(snap.aliases)) {
      console.log(line(`  ${k}`, v))
    }
  }
  console.log()

  console.log(kleur.bold("Dash registry"))
  console.log(line("  url", snap.dash.registryUrl))
  console.log(line("  token", snap.dash.hasToken ? "✓ configured" : "✗ missing"))
  console.log(
    line(
      "  theme",
      `${snap.dash.theme.name} (${snap.dash.theme.source})`,
    ),
  )
  console.log(line("  installed", `${snap.dash.installedItems.length} item(s)`))
  for (const it of snap.dash.installedItems.slice(0, 12)) {
    console.log(kleur.dim(`    · ${it.name} (${it.type}) ${it.path}`))
  }
  if (snap.dash.installedItems.length > 12) {
    console.log(kleur.dim(`    … ${snap.dash.installedItems.length - 12} more`))
  }
  console.log()

  console.log(kleur.bold("Custom hooks"))
  if (snap.customHooks.length === 0) {
    console.log(kleur.dim("  (none detected)"))
  } else {
    for (const h of snap.customHooks) console.log(kleur.dim(`  · ${h}`))
  }
  console.log()

  console.log(kleur.bold("API base URL"))
  console.log(kleur.dim(`  ${snap.apiBaseUrl ?? "(not set)"}\n`))
}

export async function runInfo(opts: InfoOpts): Promise<void> {
  const snap = await collectInfo(opts)
  if (opts.json) {
    process.stdout.write(JSON.stringify(snap, null, 2) + "\n")
    return
  }
  printPretty(snap)
}
