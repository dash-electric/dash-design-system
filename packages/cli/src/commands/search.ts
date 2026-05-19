/**
 * `dash search <query>` — full-text search registry items.
 */
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"
import { fetchRegistryIndex } from "../lib/registry-fetch.js"

export type SearchOpts = {
  query: string
  registryUrl?: string
  token?: string
  cwd?: string
}

export async function runSearch(opts: SearchOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  const index = await fetchRegistryIndex({ registryUrl, token: opts.token })
  const q = opts.query.toLowerCase()
  const matches = index.items.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.type.toLowerCase().includes(q),
  )

  if (matches.length === 0) {
    console.log(kleur.yellow(`No matches for "${opts.query}"`))
    return
  }

  console.log(kleur.bold(`\n${matches.length} match(es) for "${opts.query}":\n`))
  for (const m of matches) {
    console.log(kleur.cyan(m.name), kleur.dim(`(${m.type})`))
    console.log(`  ${kleur.bold(m.title)}`)
    console.log(`  ${kleur.dim(m.description)}\n`)
  }
}
