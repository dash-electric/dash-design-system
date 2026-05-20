/**
 * `dash list` — list all registry items, optionally filtered by type.
 */
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"
import { fetchRegistryIndex } from "../lib/registry-fetch.js"
import { resolveTheme } from "../lib/theme-resolver.js"
import {
  resolveRegistryUrl,
  resolveRegistryToken,
} from "../lib/namespace-dispatch.js"

export type ListOpts = {
  type?: "ui" | "theme" | "block" | "template" | "file"
  registryUrl?: string
  token?: string
  cwd?: string
  /** Layer-2 theme filter (`ride` | `logistic` | …). */
  theme?: string
  /** Registry namespace filter (`dash` | `trellis` | `logistic` | …). */
  namespace?: string
}

export async function runList(opts: ListOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const ns = opts.namespace?.toLowerCase()
  const registryUrl = ns
    ? resolveRegistryUrl(ns, config)
    : (opts.registryUrl ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL)
  const token =
    opts.token ?? (ns ? resolveRegistryToken(ns, config) : undefined)

  const index = await fetchRegistryIndex({ registryUrl, token })
  const theme = resolveTheme({ cliFlag: opts.theme, componentsJson: config })
  const filter = opts.type ? `registry:${opts.type}` : null
  let items = filter ? index.items.filter((i) => i.type === filter) : index.items

  // Theme-applicable filter: items declaring `themes: [...]` in their
  // (registry-side) metadata are filtered to those that include the active
  // theme. Items without that field are considered theme-agnostic and pass
  // through — keeps existing back-compat for items predating Phase B.
  if (opts.theme || opts.type === "theme") {
    items = items.filter((i) => {
      const themes = (i as { themes?: string[] }).themes
      if (!Array.isArray(themes) || themes.length === 0) return true
      return themes.includes(theme.name)
    })
  }

  if (items.length === 0) {
    console.log(kleur.yellow(`No items${filter ? ` of type ${filter}` : ""}`))
    return
  }

  // Group by type
  const grouped = new Map<string, typeof items>()
  for (const i of items) {
    const arr = grouped.get(i.type) ?? []
    arr.push(i)
    grouped.set(i.type, arr)
  }

  console.log(
    kleur.bold(
      `\n${index.name} — ${items.length} item(s) at ${registryUrl}`,
    ),
  )
  console.log(
    kleur.dim(`theme: ${theme.name} (${theme.source})\n`),
  )
  for (const [type, arr] of grouped) {
    console.log(kleur.cyan().bold(type))
    for (const i of arr) {
      console.log(`  ${kleur.bold(i.name.padEnd(28))} ${kleur.dim(i.description)}`)
    }
    console.log()
  }
}
