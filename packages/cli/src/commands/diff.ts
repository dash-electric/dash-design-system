/**
 * `dashkit diff <name>` — compare installed files vs latest registry version.
 */
import fs from "node:fs"
import kleur from "kleur"
import {
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
  resolveTargetPath,
} from "../lib/components-json.js"
import { fetchRegistryItem } from "../lib/registry-fetch.js"

export type DiffOpts = {
  name: string
  registryUrl?: string
  token?: string
  cwd?: string
}

function lineDiff(a: string, b: string): string {
  const aLines = a.split("\n")
  const bLines = b.split("\n")
  const max = Math.max(aLines.length, bLines.length)
  const out: string[] = []
  for (let i = 0; i < max; i++) {
    const la = aLines[i] ?? ""
    const lb = bLines[i] ?? ""
    if (la === lb) continue
    if (la && !lb) out.push(kleur.red(`- ${la}`))
    else if (!la && lb) out.push(kleur.green(`+ ${lb}`))
    else {
      out.push(kleur.red(`- ${la}`))
      out.push(kleur.green(`+ ${lb}`))
    }
  }
  return out.join("\n")
}

export async function runDiff(opts: DiffOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  const item = await fetchRegistryItem(opts.name, { registryUrl, token: opts.token })
  if (!item.files?.length) {
    console.log(kleur.yellow(`${opts.name} has no files`))
    return
  }

  let anyDiff = false
  for (const f of item.files) {
    const target = resolveTargetPath(f, config, cwd)
    if (!fs.existsSync(target)) {
      console.log(kleur.yellow(`! ${target} — not installed locally`))
      anyDiff = true
      continue
    }
    const local = fs.readFileSync(target, "utf-8")
    const remote = f.content ?? ""
    if (local === remote) {
      console.log(kleur.green(`= ${target} — up to date`))
      continue
    }
    anyDiff = true
    console.log(kleur.bold(`\n△ ${target}`))
    console.log(lineDiff(local, remote))
  }

  if (!anyDiff) {
    console.log(kleur.green(`\n✓ ${opts.name} is in sync`))
  }
}
