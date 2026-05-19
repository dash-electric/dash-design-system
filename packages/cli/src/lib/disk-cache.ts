/**
 * Persistent disk cache for registry fetches.
 *
 * Layout: `<rootDir>/<registry-host>/<safe-key>.json`
 *   - rootDir defaults to `~/.dash/cache`
 *   - registry-host derived from URL (hostname + port, e.g. `localhost-3000`)
 *   - safe-key = url-encoded item name (with `__index__` reserved for index)
 *   - entries store `{ ts: number, value: T }`
 *
 * TTL: 1 hour default. Caller can override via `ttlMs` option.
 *
 * Failure modes: filesystem errors are non-fatal — the cache silently degrades
 * to a no-op. We never want a corrupt cache to block CLI commands.
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"

export const DEFAULT_TTL_MS = 60 * 60 * 1000 // 1 hour

export type DiskCacheOpts = {
  rootDir?: string
  ttlMs?: number
  enabled?: boolean
}

type Entry<T> = {
  ts: number
  value: T
}

function defaultRoot(): string {
  return path.join(os.homedir(), ".dash", "cache")
}

function hostKey(registryUrl: string): string {
  try {
    const u = new URL(registryUrl)
    const port = u.port ? `-${u.port}` : ""
    return `${u.hostname}${port}`.replace(/[^a-zA-Z0-9._-]/g, "_")
  } catch {
    return registryUrl.replace(/[^a-zA-Z0-9._-]/g, "_")
  }
}

function safeKey(name: string): string {
  // `__index__` is a reserved sentinel passed in by registry-fetch.
  return encodeURIComponent(name)
}

function entryPath(rootDir: string, registryUrl: string, name: string): string {
  return path.join(rootDir, hostKey(registryUrl), `${safeKey(name)}.json`)
}

export function diskCacheGet<T>(
  registryUrl: string,
  name: string,
  opts: DiskCacheOpts = {},
): T | undefined {
  if (opts.enabled === false) return undefined
  const rootDir = opts.rootDir ?? defaultRoot()
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS
  const file = entryPath(rootDir, registryUrl, name)
  try {
    if (!fs.existsSync(file)) return undefined
    const raw = fs.readFileSync(file, "utf-8")
    const parsed = JSON.parse(raw) as Entry<T>
    if (!parsed || typeof parsed.ts !== "number") return undefined
    if (Date.now() - parsed.ts >= ttlMs) return undefined
    return parsed.value
  } catch {
    return undefined
  }
}

export function diskCacheSet<T>(
  registryUrl: string,
  name: string,
  value: T,
  opts: DiskCacheOpts = {},
): void {
  if (opts.enabled === false) return
  const rootDir = opts.rootDir ?? defaultRoot()
  const file = entryPath(rootDir, registryUrl, name)
  const entry: Entry<T> = { ts: Date.now(), value }
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(entry), "utf-8")
  } catch {
    // Non-fatal — degrade silently.
  }
}

export function diskCacheClear(opts: DiskCacheOpts = {}): void {
  const rootDir = opts.rootDir ?? defaultRoot()
  try {
    if (fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true })
    }
  } catch {
    // Non-fatal.
  }
}

/** Exposed for testing — derives the on-disk path without touching the FS. */
export function diskCachePath(
  registryUrl: string,
  name: string,
  opts: DiskCacheOpts = {},
): string {
  const rootDir = opts.rootDir ?? defaultRoot()
  return entryPath(rootDir, registryUrl, name)
}
