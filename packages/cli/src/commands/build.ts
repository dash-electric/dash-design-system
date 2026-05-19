/**
 * `dash build` — build registry from source. Runs inside Dash DS repo.
 * Mirrors logic from scripts/build-registry.ts.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import type { Registry, RegistryItem } from "../lib/schema.js"
import { validateRegistryItem } from "../lib/schema.js"

const ITEM_SCHEMA = "https://ds.dash.com/schema/registry-item.json"

export type BuildOpts = {
  output?: string
  registry?: string
  cwd?: string
}

export async function runBuild(opts: BuildOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const registryPath = path.resolve(cwd, opts.registry ?? "registry.json")
  const outDir = path.resolve(cwd, opts.output ?? "public/r")

  if (!fs.existsSync(registryPath)) {
    throw new Error(`registry.json not found at ${registryPath}`)
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8")) as Registry
  fs.mkdirSync(outDir, { recursive: true })

  let built = 0
  const index: Array<{ name: string; type: string; title: string; description: string }> = []

  for (const item of registry.items) {
    validateRegistryItem(item)
    const resolved: RegistryItem = { $schema: ITEM_SCHEMA, ...item }
    if (item.files) {
      resolved.files = item.files.map((f) => {
        const fullPath = path.join(cwd, f.path)
        if (!fs.existsSync(fullPath)) {
          throw new Error(`[${item.name}] file not found: ${f.path}`)
        }
        return { ...f, content: fs.readFileSync(fullPath, "utf-8") }
      })
    }
    fs.writeFileSync(
      path.join(outDir, `${item.name}.json`),
      JSON.stringify(resolved, null, 2) + "\n",
    )
    index.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
    })
    console.log(kleur.green(`✓`), kleur.bold(item.name), kleur.dim(`(${item.type})`))
    built++
  }

  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify(
      { name: registry.name, homepage: registry.homepage, items: index },
      null,
      2,
    ) + "\n",
  )

  console.log(
    kleur.bold().green(`\nBuilt ${built} registry items + index.json`),
    kleur.dim(`→ ${path.relative(cwd, outDir)}`),
  )
}
