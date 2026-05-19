/**
 * Lightweight in-memory cache for registry fetches within a single CLI run.
 * Persistent disk cache deferred to v1.1.
 */

const memCache = new Map<string, unknown>()

export function cacheGet<T>(key: string): T | undefined {
  return memCache.get(key) as T | undefined
}

export function cacheSet<T>(key: string, value: T): void {
  memCache.set(key, value)
}

export function cacheClear(): void {
  memCache.clear()
}
