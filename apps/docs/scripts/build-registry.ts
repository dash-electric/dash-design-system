/**
 * Dash Design System — minimal registry build script (Day 1-7 bootstrap).
 * Reads registry.json + source files, inlines content, outputs public/r/<name>.json.
 * Day 8-13 graduates this into proper `dash build` CLI subcommand.
 *
 * NOTE on production access:
 *   The JSON files written here are the BUILD ARTIFACTS only. In production
 *   (Vercel), `public/r/*.json` MUST NOT be directly serveable — the canonical
 *   access path is the Bearer-gated route handler at `app/r/[name]/route.ts`
 *   (and `app/r/index/route.ts`), which authenticates against
 *   `DASH_REGISTRY_TOKEN` before reading the same JSON from disk.
 *
 *   To enforce this in production, block static `public/r/*.json` requests via
 *   a `next.config.ts` rewrite or middleware so consumers MUST go through
 *   `/r/[name]` and pass the Bearer header. The build output path itself is
 *   unchanged — only the access path is gated.
 */
import fs from "node:fs"
import path from "node:path"

type RegistryFile = { path: string; type: string; target?: string; content?: string }
type RegistryItem = {
  $schema?: string
  name: string
  type: string
  title: string
  description: string
  files?: RegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  cssVars?: Record<string, Record<string, string>>
  css?: string
  categories?: string[]
  meta?: Record<string, unknown>
}
type Registry = {
  $schema: string
  name: string
  homepage: string
  items: RegistryItem[]
}

const ROOT = process.cwd()
const REGISTRY_PATH = path.join(ROOT, "registry.json")
const OUT_DIR = path.join(ROOT, "public", "r")
const ITEM_SCHEMA = "https://ds.dash.com/schema/registry-item.json"

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8")) as Registry
fs.mkdirSync(OUT_DIR, { recursive: true })

let built = 0
const index: { name: string; type: string; title: string; description: string }[] = []

for (const item of registry.items) {
  const resolved: RegistryItem = { $schema: ITEM_SCHEMA, ...item }
  if (item.files) {
    resolved.files = item.files.map((f) => {
      const fullPath = path.join(ROOT, f.path)
      if (!fs.existsSync(fullPath)) {
        throw new Error(`[${item.name}] file not found: ${f.path}`)
      }
      return { ...f, content: fs.readFileSync(fullPath, "utf-8") }
    })
  }
  fs.writeFileSync(
    path.join(OUT_DIR, `${item.name}.json`),
    JSON.stringify(resolved, null, 2) + "\n",
  )
  index.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
  })
  console.log(`✓ built ${item.name} (${item.type})`)
  built++
}

fs.writeFileSync(
  path.join(OUT_DIR, "index.json"),
  JSON.stringify({ name: registry.name, homepage: registry.homepage, items: index }, null, 2) + "\n",
)

console.log(`\nBuilt ${built} registry items + index.json → public/r/`)
