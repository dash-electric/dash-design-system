/**
 * File writing — handles overwrite prompts, dry-run, directory creation,
 * and CSS variable merging into the consumer's globals.css.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import prompts from "prompts"
import type { RegistryFile, RegistryItem } from "./schema.js"
import {
  mergeCssVars as mergeCssVarsAst,
  generateCssBlock as generateCssBlockAst,
  type CssVarsInput,
} from "./css-merger.js"

export type WriteOpts = {
  cwd: string
  overwrite?: boolean
  yes?: boolean
  dryRun?: boolean
}

export async function writeRegistryFile(
  file: RegistryFile,
  targetPath: string,
  opts: WriteOpts,
): Promise<"written" | "skipped" | "overwrote"> {
  if (!file.content) {
    throw new Error(`File ${file.path} has no content (registry build missing inline content?)`)
  }

  const exists = fs.existsSync(targetPath)
  if (exists && !opts.overwrite) {
    if (opts.yes) {
      // --yes without --overwrite → skip existing
      console.log(kleur.yellow(`  · skipped (exists): ${path.relative(opts.cwd, targetPath)}`))
      return "skipped"
    }
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Overwrite ${path.relative(opts.cwd, targetPath)}?`,
      initial: false,
    })
    if (!confirm) {
      console.log(kleur.yellow(`  · skipped: ${path.relative(opts.cwd, targetPath)}`))
      return "skipped"
    }
  }

  if (opts.dryRun) {
    console.log(
      kleur.dim(`  · [dry-run] would write: ${path.relative(opts.cwd, targetPath)}`),
    )
    return exists ? "overwrote" : "written"
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, file.content, "utf-8")
  const action = exists ? "overwrote" : "written"
  const symbol = exists ? "↻" : "+"
  console.log(
    kleur.green(`  ${symbol} ${path.relative(opts.cwd, targetPath)}`),
  )
  return action
}

/**
 * Merge cssVars from a registry item into the consumer's globals.css.
 * Naive but safe: inserts/replaces :root and .dark blocks marked w/ dash sentinels.
 */
export function mergeCssVars(
  cssFile: string,
  cssVars: Record<string, Record<string, string>>,
  opts: WriteOpts,
): boolean {
  if (!fs.existsSync(cssFile)) {
    if (opts.dryRun) {
      console.log(kleur.dim(`  · [dry-run] would create ${cssFile} w/ cssVars`))
      return true
    }
    fs.mkdirSync(path.dirname(cssFile), { recursive: true })
    fs.writeFileSync(cssFile, generateCssBlockAst(cssVars as CssVarsInput), "utf-8")
    console.log(kleur.green(`  + ${path.relative(opts.cwd, cssFile)} (new)`))
    return true
  }

  const existing = fs.readFileSync(cssFile, "utf-8")
  const merged = mergeCssVarsAst(existing, cssVars as CssVarsInput)
  if (merged === existing) {
    return false
  }
  if (opts.dryRun) {
    console.log(kleur.dim(`  · [dry-run] would merge cssVars into ${cssFile}`))
    return true
  }
  fs.writeFileSync(cssFile, merged, "utf-8")
  console.log(kleur.green(`  ↻ ${path.relative(opts.cwd, cssFile)} (merged cssVars)`))
  return true
}

export function collectCssVars(items: RegistryItem[]): Record<string, Record<string, string>> {
  const merged: Record<string, Record<string, string>> = {}
  for (const item of items) {
    if (!item.cssVars) continue
    for (const [sel, vars] of Object.entries(item.cssVars)) {
      merged[sel] = { ...(merged[sel] ?? {}), ...vars }
    }
  }
  return merged
}
