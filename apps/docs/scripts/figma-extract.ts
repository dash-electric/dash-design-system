#!/usr/bin/env tsx
/**
 * Dash DS — Figma REST API extractor.
 *
 * Usage:
 *   pnpm figma:nodes 2645:344                          # single node
 *   pnpm figma:nodes 2645:344,466:4630,553:22099      # multiple
 *   pnpm figma:variables                                # all design variables
 *   pnpm figma:styles                                   # published styles
 *   pnpm figma:pages                                    # top-level pages list
 *
 * Cache lands in .figma-cache/ (gitignored).
 */
import fs from "node:fs"
import path from "node:path"

const TOKEN = process.env.FIGMA_TOKEN
const FILE_KEY = process.env.FIGMA_FILE_KEY

if (!TOKEN || !FILE_KEY) {
  console.error("Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env.local")
  process.exit(1)
}

const CACHE_DIR = path.join(process.cwd(), ".figma-cache")
fs.mkdirSync(CACHE_DIR, { recursive: true })

async function fetchFigma<T = unknown>(endpoint: string): Promise<T> {
  const url = `https://api.figma.com/v1${endpoint}`
  const res = await fetch(url, { headers: { "X-Figma-Token": TOKEN! } })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error(`\nFigma API ${res.status} ${res.statusText} on ${endpoint}`)
    console.error(`Response body: ${body.slice(0, 500)}\n`)
    throw new Error(`Figma API ${res.status}`)
  }
  return res.json() as Promise<T>
}

function sanitize(id: string): string {
  return id.replace(/[:/]/g, "_")
}

async function fetchNodes(nodeIds: string[]) {
  const ids = nodeIds.join(",")
  const data = await fetchFigma<{ nodes: Record<string, { document: unknown }> }>(
    `/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(ids)}&geometry=paths`,
  )
  for (const [id, node] of Object.entries(data.nodes)) {
    const file = path.join(CACHE_DIR, `node-${sanitize(id)}.json`)
    fs.writeFileSync(file, JSON.stringify(node, null, 2))
    console.log(`✓ saved ${file}`)
  }
}

async function fetchVariables() {
  const data = await fetchFigma(`/files/${FILE_KEY}/variables/local`)
  const file = path.join(CACHE_DIR, "variables-local.json")
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`✓ saved ${file}`)
}

async function fetchStyles() {
  const data = await fetchFigma(`/files/${FILE_KEY}/styles`)
  const file = path.join(CACHE_DIR, "styles.json")
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`✓ saved ${file}`)
}

async function fetchPages() {
  const data = await fetchFigma<{ document: { children: { id: string; name: string; type: string }[] } }>(
    `/files/${FILE_KEY}?depth=2`,
  )
  const pages = data.document.children.map((c) => ({ id: c.id, name: c.name, type: c.type }))
  const file = path.join(CACHE_DIR, "pages.json")
  fs.writeFileSync(file, JSON.stringify(pages, null, 2))
  console.log(`✓ saved ${file}`)
  console.log(`\n${pages.length} top-level pages:`)
  for (const p of pages) console.log(`  ${p.id}  ${p.name}`)
}

const cmd = process.argv[2]
const arg = process.argv[3]

async function main() {
  switch (cmd) {
    case "nodes":
      if (!arg) {
        console.error("Usage: figma-extract nodes <nodeId1,nodeId2,...>")
        process.exit(1)
      }
      await fetchNodes(arg.split(","))
      break
    case "variables":
      await fetchVariables()
      break
    case "styles":
      await fetchStyles()
      break
    case "pages":
      await fetchPages()
      break
    default:
      console.error("Commands: pages | nodes <ids> | variables | styles")
      process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
