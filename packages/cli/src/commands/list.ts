/**
 * `dash list` — list all registry items, optionally filtered by type.
 */
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"
import { fetchRegistryIndex } from "../lib/registry-fetch.js"

export type ListOpts = {
  type?: "ui" | "theme" | "block" | "template" | "file"
  registryUrl?: string
  token?: string
  cwd?: string
}

export async function runList(opts: ListOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  const index = await fetchRegistryIndex({ registryUrl, token: opts.token })
  const filter = opts.type ? `registry:${opts.type}` : null
  const items = filter ? index.items.filter((i) => i.type === filter) : index.items

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

  console.log(kleur.bold(`\n${index.name} — ${items.length} item(s) at ${registryUrl}\n`))
  for (const [type, arr] of grouped) {
    console.log(kleur.cyan().bold(type))
    for (const i of arr) {
      console.log(`  ${kleur.bold(i.name.padEnd(28))} ${kleur.dim(i.description)}`)
    }
    console.log()
  }
}
