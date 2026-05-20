/**
 * `dash search <query>` — full-text search registry items.
 */
import kleur from "kleur"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"
import { fetchRegistryIndex } from "../lib/registry-fetch.js"
import {
  listKnownNamespaces,
  resolveRegistryUrl,
  resolveRegistryToken,
} from "../lib/namespace-dispatch.js"

export type SearchOpts = {
  query: string
  registryUrl?: string
  token?: string
  cwd?: string
  /**
   * Filter to a single namespace. When omitted, searches every known
   * namespace (built-ins + components.json `registries` entries) and tags
   * each match with its `@<ns>/` prefix.
   */
  namespace?: string
}

export async function runSearch(opts: SearchOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const q = opts.query.toLowerCase()

  // Single-namespace path (preserves legacy behavior when --namespace given,
  // or when --registry-url is explicitly set — registryUrl override implies
  // single registry).
  if (opts.namespace || opts.registryUrl) {
    const ns = opts.namespace?.toLowerCase()
    const registryUrl = ns
      ? resolveRegistryUrl(ns, config)
      : (opts.registryUrl ??
          config?.registries?.["@dash"]?.url ??
          DEFAULT_REGISTRY_URL)
    const token =
      opts.token ?? (ns ? resolveRegistryToken(ns, config) : undefined)
    const index = await fetchRegistryIndex({ registryUrl, token })
    const matches = index.items.filter((i) => matchesQuery(i, q))
    printMatches(matches, opts.query, ns)
    return
  }

  // Multi-namespace fan-out. Errors from secondary registries are non-fatal
  // (commonly an offline tenant registry) — the primary @dash result still
  // surfaces.
  const namespaces = listKnownNamespaces(config)
  const all: Array<{ ns: string; item: { name: string; type: string; title: string; description: string } }> = []
  for (const ns of namespaces) {
    try {
      const registryUrl = resolveRegistryUrl(ns, config)
      const token = opts.token ?? resolveRegistryToken(ns, config)
      const index = await fetchRegistryIndex({ registryUrl, token })
      for (const item of index.items) {
        if (matchesQuery(item, q)) all.push({ ns, item })
      }
    } catch (err) {
      console.log(
        kleur.dim(`  (skipped @${ns}: ${(err as Error).message})`),
      )
    }
  }

  if (all.length === 0) {
    console.log(kleur.yellow(`No matches for "${opts.query}" across ${namespaces.length} namespace(s)`))
    return
  }

  console.log(
    kleur.bold(`\n${all.length} match(es) for "${opts.query}" across ${namespaces.length} namespace(s):\n`),
  )
  for (const { ns, item } of all) {
    console.log(kleur.cyan(`@${ns}/${item.name}`), kleur.dim(`(${item.type})`))
    console.log(`  ${kleur.bold(item.title)}`)
    console.log(`  ${kleur.dim(item.description)}\n`)
  }
}

function matchesQuery(
  i: { name: string; title: string; description: string; type: string },
  q: string,
): boolean {
  return (
    i.name.toLowerCase().includes(q) ||
    i.title.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    i.type.toLowerCase().includes(q)
  )
}

function printMatches(
  matches: Array<{ name: string; type: string; title: string; description: string }>,
  query: string,
  namespace: string | undefined,
): void {
  if (matches.length === 0) {
    console.log(kleur.yellow(`No matches for "${query}"`))
    return
  }
  console.log(kleur.bold(`\n${matches.length} match(es) for "${query}":\n`))
  for (const m of matches) {
    const display = namespace ? `@${namespace}/${m.name}` : m.name
    console.log(kleur.cyan(display), kleur.dim(`(${m.type})`))
    console.log(`  ${kleur.bold(m.title)}`)
    console.log(`  ${kleur.dim(m.description)}\n`)
  }
}
