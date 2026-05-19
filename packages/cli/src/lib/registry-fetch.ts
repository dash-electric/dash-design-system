/**
 * Registry fetch — pulls registry items + index from remote registry URL.
 *
 * Token resolution order:
 *   1. explicit opts.token (CLI --token flag)
 *   2. DASH_REGISTRY_TOKEN env var
 *   3. .env.local in current working directory (DASH_REGISTRY_TOKEN=...)
 *   4. ~/.dash/credentials.json keyed by registry URL
 *
 * Cache layers:
 *   - in-memory (per-process) via `./cache`
 *   - persistent disk cache via `./disk-cache` (1h TTL by default)
 *
 * Disable disk cache with opts.noCache = true (CLI `--no-cache` flag).
 */
import fs from "node:fs"
import path from "node:path"
import { cacheGet, cacheSet } from "./cache.js"
import { diskCacheGet, diskCacheSet } from "./disk-cache.js"
import { getCredential } from "./credentials.js"
import type { RegistryItem, RegistryIndex } from "./schema.js"

export type FetchOpts = {
  registryUrl: string
  token?: string
  headers?: Record<string, string>
  noCache?: boolean
  cwd?: string
}

function readEnvLocalToken(cwd: string): string | undefined {
  const file = path.join(cwd, ".env.local")
  if (!fs.existsSync(file)) return undefined
  try {
    const raw = fs.readFileSync(file, "utf-8")
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*DASH_REGISTRY_TOKEN\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, "")
    }
  } catch {
    /* ignore */
  }
  return undefined
}

export function resolveToken(opts: FetchOpts): string | undefined {
  if (opts.token) return opts.token
  if (process.env.DASH_REGISTRY_TOKEN) return process.env.DASH_REGISTRY_TOKEN
  const cwd = opts.cwd ?? process.cwd()
  const envLocal = readEnvLocalToken(cwd)
  if (envLocal) return envLocal
  return getCredential(opts.registryUrl)
}

function buildHeaders(opts: FetchOpts): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers ?? {}),
  }
  const token = resolveToken(opts)
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function fetchRegistryItem(
  name: string,
  opts: FetchOpts,
): Promise<RegistryItem> {
  const cacheKey = `${opts.registryUrl}::${name}`
  const memHit = cacheGet<RegistryItem>(cacheKey)
  if (memHit) return memHit

  if (!opts.noCache) {
    const diskHit = diskCacheGet<RegistryItem>(opts.registryUrl, name)
    if (diskHit) {
      cacheSet(cacheKey, diskHit)
      return diskHit
    }
  }

  const url = `${opts.registryUrl.replace(/\/$/, "")}/r/${name}.json`
  const res = await fetch(url, { headers: buildHeaders(opts) })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${name} from ${url}: ${res.status} ${res.statusText}`,
    )
  }
  const item = (await res.json()) as RegistryItem
  cacheSet(cacheKey, item)
  if (!opts.noCache) diskCacheSet(opts.registryUrl, name, item)
  return item
}

export async function fetchRegistryIndex(opts: FetchOpts): Promise<RegistryIndex> {
  const cacheKey = `${opts.registryUrl}::__index__`
  const memHit = cacheGet<RegistryIndex>(cacheKey)
  if (memHit) return memHit

  if (!opts.noCache) {
    const diskHit = diskCacheGet<RegistryIndex>(opts.registryUrl, "__index__")
    if (diskHit) {
      cacheSet(cacheKey, diskHit)
      return diskHit
    }
  }

  const url = `${opts.registryUrl.replace(/\/$/, "")}/r/index.json`
  const res = await fetch(url, { headers: buildHeaders(opts) })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch index from ${url}: ${res.status} ${res.statusText}`,
    )
  }
  const index = (await res.json()) as RegistryIndex
  cacheSet(cacheKey, index)
  if (!opts.noCache) diskCacheSet(opts.registryUrl, "__index__", index)
  return index
}

/**
 * Recursively resolve item + all registryDependencies. Returns items in
 * topological order (deps before dependents). Cycle-safe via visited set.
 */
export async function resolveItemTree(
  rootName: string,
  opts: FetchOpts,
): Promise<RegistryItem[]> {
  const ordered: RegistryItem[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  async function visit(name: string): Promise<void> {
    if (visited.has(name)) return
    if (visiting.has(name)) {
      // cycle — skip silently (already in-flight up the stack)
      return
    }
    visiting.add(name)
    const item = await fetchRegistryItem(name, opts)
    if (item.registryDependencies?.length) {
      for (const dep of item.registryDependencies) {
        await visit(dep)
      }
    }
    visiting.delete(name)
    visited.add(name)
    ordered.push(item)
  }

  await visit(rootName)
  return ordered
}
