/**
 * `dash add <name...>` — install registry items into consumer project.
 */
import path from "node:path"
import fs from "node:fs"
import kleur from "kleur"
import ora from "ora"
import {
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
  resolveTargetPath,
} from "../lib/components-json.js"
import { resolveItemTree } from "../lib/registry-fetch.js"
import {
  writeRegistryFile,
  collectCssVars,
  mergeCssVars,
} from "../lib/file-writer.js"
import { dedupeDeps, installDeps } from "../lib/deps-installer.js"
import {
  buildDashHeader,
  hasDashHeader,
  injectDashHeader,
} from "../lib/component-version.js"
import type { RegistryItem, RegistryFile } from "../lib/schema.js"

export type AddOpts = {
  names: string[]
  yes?: boolean
  overwrite?: boolean
  dryRun?: boolean
  path?: string
  registryUrl?: string
  token?: string
  noCache?: boolean
  cwd?: string
}

export async function runAdd(opts: AddOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ??
    config?.registries?.["@dash"]?.url ??
    DEFAULT_REGISTRY_URL

  if (!config) {
    console.log(
      kleur.yellow(
        `! components.json not found — run ${kleur.cyan("dash init")} first (or use --path to override)`,
      ),
    )
  }

  // Resolve all items + dedupe across requests
  const seen = new Map<string, RegistryItem>()
  const spinner = ora("Resolving registry items").start()
  try {
    for (const name of opts.names) {
      const tree = await resolveItemTree(name, {
        registryUrl,
        token: opts.token,
        noCache: opts.noCache,
        cwd,
      })
      for (const item of tree) {
        if (!seen.has(item.name)) seen.set(item.name, item)
      }
    }
    spinner.succeed(`Resolved ${seen.size} item(s)`)
  } catch (err) {
    spinner.fail(`Resolve failed: ${(err as Error).message}`)
    throw err
  }

  const ordered = [...seen.values()]
  console.log(
    kleur.dim(
      `  ${ordered.map((i) => i.name).join(" → ")}`,
    ),
  )

  // Write files
  console.log(kleur.bold("\n→ Writing files"))
  let written = 0
  let skipped = 0
  for (const item of ordered) {
    if (!item.files?.length) continue
    const itemVersion =
      (item.meta?.version as string | undefined) ?? "1.0.0"
    for (const f of item.files) {
      const baseTarget = opts.path
        ? path.join(cwd, opts.path, path.basename(f.target ?? f.path))
        : resolveTargetPath(f, config, cwd)
      // Inject `@dash version` header on first install of a JS/TS source file
      // so `dash sync` can classify bump severity later. Idempotent: skipped
      // if header already present.
      const stamped = stampDashHeader(f, item.name, itemVersion)
      const result = await writeRegistryFile(stamped, baseTarget, {
        cwd,
        yes: opts.yes,
        overwrite: opts.overwrite,
        dryRun: opts.dryRun,
      })
      if (result === "skipped") skipped++
      else written++
    }
  }

  // CSS vars
  const cssVars = collectCssVars(ordered)
  if (Object.keys(cssVars).length > 0) {
    console.log(kleur.bold("\n→ Merging CSS vars"))
    const cssFile =
      config?.tailwind?.css ?? "app/globals.css"
    mergeCssVars(path.join(cwd, cssFile), cssVars, {
      cwd,
      dryRun: opts.dryRun,
    })
  }

  // Deps
  const { deps, devDeps } = dedupeDeps(ordered)
  if (deps.length || devDeps.length) {
    console.log(kleur.bold("\n→ Installing dependencies"))
    if (deps.length) {
      await installDeps(deps, { cwd, dev: false, dryRun: opts.dryRun })
    }
    if (devDeps.length) {
      await installDeps(devDeps, { cwd, dev: true, dryRun: opts.dryRun })
    }
  }

  // Summary
  console.log(kleur.bold().green("\n✓ Done"))
  console.log(kleur.dim(`  ${written} file(s) written, ${skipped} skipped`))
  if (deps.length) console.log(kleur.dim(`  ${deps.length} runtime dep(s)`))
  if (devDeps.length) console.log(kleur.dim(`  ${devDeps.length} dev dep(s)`))
  if (opts.dryRun) console.log(kleur.yellow(`  (dry-run — no changes applied)`))
}

export function ensureWorkingDir(cwd: string): void {
  if (!fs.existsSync(cwd)) throw new Error(`cwd does not exist: ${cwd}`)
}

/**
 * Return a copy of `file` with a `@dash version` header injected into its
 * content. No-op for non-JS/TS files (css, mdx, json, etc.) and for files
 * that already declare a `@dash version` header.
 */
export function stampDashHeader(
  file: RegistryFile,
  itemName: string,
  version: string,
): RegistryFile {
  const content = file.content ?? ""
  if (!content) return file
  const ext = path.extname(file.path).toLowerCase()
  if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) return file
  if (hasDashHeader(content)) return file
  const header = buildDashHeader({
    version,
    source: file.path,
  })
  return { ...file, content: injectDashHeader(content, header) }
}
