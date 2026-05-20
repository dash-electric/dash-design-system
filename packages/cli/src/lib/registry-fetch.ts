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
import {
  RegistryItemSchema,
  RegistryIndexSchema,
} from "@dash/registry-schema"
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

/**
 * Thrown when registry data fails runtime schema validation.
 * Carries the underlying zod issue list + an actionable suggestion.
 */
export class RegistryError extends Error {
  public readonly suggestion?: string
  public readonly issues?: unknown
  constructor(
    message: string,
    opts?: { cause?: unknown; suggestion?: string; issues?: unknown },
  ) {
    super(message)
    this.name = "RegistryError"
    if (opts?.cause !== undefined) (this as { cause?: unknown }).cause = opts.cause
    this.suggestion = opts?.suggestion
    this.issues = opts?.issues
  }
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

/**
 * Strip a leading `@<ns>/` prefix so the bare item name reaches the
 * registry. The dispatch layer in `commands/add.ts` already picked the
 * correct registry URL from the namespace — by the time we fetch, the
 * remote registry only knows items by their bare names.
 */
function stripNamespace(name: string): string {
  if (!name.startsWith("@")) return name
  const slash = name.indexOf("/")
  return slash < 0 ? name : name.slice(slash + 1)
}

export async function fetchRegistryItem(
  name: string,
  opts: FetchOpts,
): Promise<RegistryItem> {
  const bareName = stripNamespace(name)
  const cacheKey = `${opts.registryUrl}::${bareName}`
  const memHit = cacheGet<RegistryItem>(cacheKey)
  if (memHit) return memHit

  if (!opts.noCache) {
    const diskHit = diskCacheGet<RegistryItem>(opts.registryUrl, bareName)
    if (diskHit) {
      cacheSet(cacheKey, diskHit)
      return diskHit
    }
  }

  const url = `${opts.registryUrl.replace(/\/$/, "")}/r/${bareName}.json`
  const res = await fetch(url, { headers: buildHeaders(opts) })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${bareName} from ${url}: ${res.status} ${res.statusText}`,
    )
  }
  const raw = await res.json()
  const parsed = RegistryItemSchema.safeParse(raw)
  if (!parsed.success) {
    throw new RegistryError(
      `Registry item "${bareName}" failed schema validation`,
      {
        cause: parsed.error,
        issues: parsed.error.issues,
        suggestion:
          "Registry server may be returning malformed data. Run `dash doctor --network` to diagnose, or check the registry build.",
      },
    )
  }
  const item = parsed.data as unknown as RegistryItem
  cacheSet(cacheKey, item)
  if (!opts.noCache) diskCacheSet(opts.registryUrl, bareName, item)
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
  const raw = await res.json()
  const parsed = RegistryIndexSchema.safeParse(raw)
  if (!parsed.success) {
    throw new RegistryError(
      `Registry index failed schema validation`,
      {
        cause: parsed.error,
        issues: parsed.error.issues,
        suggestion:
          "Registry server may be returning malformed data. Run `dash doctor --network` to diagnose, or check the registry build.",
      },
    )
  }
  const index = parsed.data as unknown as RegistryIndex
  cacheSet(cacheKey, index)
  if (!opts.noCache) diskCacheSet(opts.registryUrl, "__index__", index)
  return index
}

/**
 * Recursively resolve item + all registryDependencies. Returns items in
 * topological order (deps before dependents). Cycle-safe via visited set.
 *
 * `rootName` accepts both bare names (e.g. `button`) and namespaced names
 * (e.g. `@dash/button`, `@trellis/some-block`). Namespace-resolution is
 * handled by the caller (commands/add.ts) — by the time we reach this fn,
 * `opts.registryUrl` already points at the correct namespace's registry.
 *
 * Note: `registryDependencies` declared inside an item are resolved against
 * the same registry URL — cross-namespace deps must be expressed as
 * `@<ns>/<name>` in the dependency string itself. (Future work; for now
 * tenant items SHOULD copy any shared deps inline or reference @dash items
 * by full `@dash/<name>` form.)
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
