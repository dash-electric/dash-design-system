/**
 * HTTP client for the Dash registry with in-memory LRU cache (5-min TTL).
 *
 * - GET /r/index.json        → master listing
 * - GET /r/<name>.json       → individual registry item (lazy)
 * - GET /r/<file>            → raw text files (e.g. dash-ai-rules.md)
 */

import { authHeaders, loadConfig, type RegistryConfig } from "./auth.js";
import type { RegistryIndex, RegistryItem, RegistryItemSummary } from "./schema.js";

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_ENTRIES = 256;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class LruCache<T> {
  private readonly max: number;
  private readonly ttl: number;
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(max = DEFAULT_MAX_ENTRIES, ttl = DEFAULT_TTL_MS) {
    this.max = max;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // refresh LRU order
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export class RegistryClient {
  private readonly config: RegistryConfig;
  private readonly itemCache = new LruCache<RegistryItem>();
  private readonly fileCache = new LruCache<string>();
  private indexCache: CacheEntry<RegistryItemSummary[]> | undefined;

  constructor(config?: RegistryConfig) {
    this.config = config ?? loadConfig();
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /** Fetches and parses /r/index.json. Refreshed every 5 minutes. */
  async getIndex(force = false): Promise<RegistryItemSummary[]> {
    if (!force && this.indexCache && this.indexCache.expiresAt > Date.now()) {
      return this.indexCache.value;
    }
    const url = `${this.config.baseUrl}/r/index.json`;
    const raw = await this.fetchJson<unknown>(url);
    const items = normaliseIndex(raw);
    this.indexCache = { value: items, expiresAt: Date.now() + DEFAULT_TTL_MS };
    return items;
  }

  /** Fetches a single registry item by name. Cached for 5 minutes. */
  async getItem(name: string): Promise<RegistryItem> {
    const key = stripScope(name);
    const cached = this.itemCache.get(key);
    if (cached) return cached;
    const url = `${this.config.baseUrl}/r/${encodeURIComponent(key)}.json`;
    const raw = await this.fetchJson<RegistryItem>(url);
    this.itemCache.set(key, raw);
    return raw;
  }

  /** Fetches a raw text file from the registry (e.g. dash-ai-rules.md). */
  async getRawFile(path: string): Promise<string> {
    const clean = path.replace(/^\/+/, "");
    const cached = this.fileCache.get(clean);
    if (cached) return cached;
    const url = `${this.config.baseUrl}/r/${clean}`;
    const res = await fetch(url, { headers: authHeaders(this.config) });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    this.fileCache.set(clean, text);
    return text;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: authHeaders(this.config) });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
}

/** Strips the optional "@dash/" scope from a component name. */
export function stripScope(name: string): string {
  return name.replace(/^@dash\//, "").replace(/^@[^/]+\//, "");
}

/**
 * Accepts either { items: [...] } or a bare array — both shapes occur in
 * shadcn-style registries depending on version.
 */
function normaliseIndex(raw: unknown): RegistryItemSummary[] {
  if (Array.isArray(raw)) return raw as RegistryItemSummary[];
  if (raw && typeof raw === "object") {
    const obj = raw as Partial<RegistryIndex>;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}
