/**
 * Dashboard request store — abstraction over the gap-request backlog that the
 * Wave 4 dashboard reads/writes. Two concrete backends:
 *
 *   - "file" (default): JSON file at `apps/docs/data/dashboard/requests.json`.
 *     Used in local dev and any sovereign deploy without Vercel KV creds.
 *   - "kv": Vercel KV. Code-only; we don't instantiate the client unless
 *     the env vars are present and the backend is explicitly requested.
 *     Picked when `DASH_STORE_BACKEND=kv` AND `KV_REST_API_URL` +
 *     `KV_REST_API_TOKEN` are set. Otherwise we fall back to file.
 *
 * Schema is the same `GapEntry` shape produced by the CLI (`packages/cli/src/
 * lib/gap-queue.ts`). We deliberately re-declare the types here so the
 * `@dash/docs` app doesn't depend on the CLI workspace at build time.
 *
 * All mutations go through a single in-process lock to avoid lost writes
 * when concurrent requests touch the same JSON file. Good enough for the
 * dashboard's volume; KV backend is naturally race-safe.
 */
import { promises as fs } from "node:fs"
import path from "node:path"

export type GapSeverity = "low" | "medium" | "high"
export type GapStatus =
  | "pending"
  | "synced"
  | "processing"
  | "generated"
  | "vendored"
  | "declined"

export type GapEntry = {
  id: string
  created_at: string
  description: string
  severity: GapSeverity
  repo: string | null
  prompt: string | null
  generated_block_path: string | null
  status: GapStatus
  /** Optional: filled by Agent N once generation completes. */
  generated_at?: string | null
  /** Optional: free-form metadata the dashboard or worker can attach. */
  notes?: string | null
}

export type ListFilter = {
  status?: GapStatus | GapStatus[]
  severity?: GapSeverity | GapSeverity[]
  repo?: string
}

export interface DashboardStore {
  getRequests(filter?: ListFilter): Promise<GapEntry[]>
  getRequest(id: string): Promise<GapEntry | null>
  createRequest(payload: GapEntry): Promise<GapEntry>
  updateRequest(id: string, patch: Partial<GapEntry>): Promise<GapEntry | null>
  deleteRequests(ids: string[]): Promise<number>
  /** Mark an id as queued for Agent N generation. Returns the updated entry. */
  enqueueGeneration(id: string): Promise<GapEntry | null>
  /** Atomic merge: keep `keepId`, delete the rest. Returns kept entry. */
  mergeRequests(keepId: string, duplicateIds: string[]): Promise<GapEntry | null>
}

// ────────────────────────────────────────────────────────────────────────────
// File backend
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the JSON store path at call time (not module-load time) so tests
 * can set `DASH_DASHBOARD_DATA_DIR` per-suite without re-importing.
 */
function filePath(): string {
  const override = process.env.DASH_DASHBOARD_DATA_DIR
  const base = override
    ? path.resolve(override)
    : path.join(process.cwd(), "data", "dashboard")
  return path.join(base, "requests.json")
}

type FileShape = { schemaVersion: 1; entries: GapEntry[] }

const FILE_LOCK_KEY = Symbol.for("dash-ds.dashboard.file-lock")
type LockHolder = { promise: Promise<void> }
const globalForLock = globalThis as unknown as {
  [FILE_LOCK_KEY]?: LockHolder
}

async function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  // Serialize file mutations within a process. Cheaper than fs flock and
  // good enough for the dashboard's traffic profile.
  const prev = globalForLock[FILE_LOCK_KEY]?.promise ?? Promise.resolve()
  let release: () => void = () => {}
  const next = new Promise<void>((resolve) => {
    release = resolve
  })
  globalForLock[FILE_LOCK_KEY] = { promise: prev.then(() => next) }
  await prev
  try {
    return await fn()
  } finally {
    release()
  }
}

async function readFileStore(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(filePath(), "utf-8")
    const parsed = JSON.parse(raw) as Partial<FileShape>
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { schemaVersion: 1, entries: [] }
    }
    return { schemaVersion: 1, entries: parsed.entries as GapEntry[] }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code
    if (code === "ENOENT") return { schemaVersion: 1, entries: [] }
    // Corrupt JSON: recover to empty rather than crash the dashboard. The
    // caller will write fresh data on the next mutation.
    return { schemaVersion: 1, entries: [] }
  }
}

async function writeFileStore(data: FileShape): Promise<void> {
  await fs.mkdir(path.dirname(filePath()), { recursive: true })
  await fs.writeFile(filePath(), JSON.stringify(data, null, 2) + "\n", "utf-8")
}

function applyFilter(entries: GapEntry[], filter?: ListFilter): GapEntry[] {
  if (!filter) return entries
  return entries.filter((e) => {
    if (filter.status) {
      const arr = Array.isArray(filter.status) ? filter.status : [filter.status]
      if (!arr.includes(e.status)) return false
    }
    if (filter.severity) {
      const arr = Array.isArray(filter.severity)
        ? filter.severity
        : [filter.severity]
      if (!arr.includes(e.severity)) return false
    }
    if (filter.repo) {
      if (e.repo !== filter.repo) return false
    }
    return true
  })
}

const fileBackend: DashboardStore = {
  async getRequests(filter) {
    const store = await readFileStore()
    return applyFilter(store.entries, filter)
  },
  async getRequest(id) {
    const store = await readFileStore()
    return store.entries.find((e) => e.id === id) ?? null
  },
  async createRequest(payload) {
    return withFileLock(async () => {
      const store = await readFileStore()
      // If an entry with the same id already exists, treat as idempotent —
      // CLI sync may retry. We keep the existing record's created_at but
      // overwrite mutable fields from payload.
      const idx = store.entries.findIndex((e) => e.id === payload.id)
      if (idx >= 0) {
        store.entries[idx] = { ...store.entries[idx], ...payload }
        await writeFileStore(store)
        return store.entries[idx]
      }
      store.entries.push(payload)
      await writeFileStore(store)
      return payload
    })
  },
  async updateRequest(id, patch) {
    return withFileLock(async () => {
      const store = await readFileStore()
      const idx = store.entries.findIndex((e) => e.id === id)
      if (idx < 0) return null
      // id and created_at are immutable post-creation.
      const { id: _ignoreId, created_at: _ignoreCreated, ...safePatch } = patch
      store.entries[idx] = { ...store.entries[idx], ...safePatch }
      await writeFileStore(store)
      return store.entries[idx]
    })
  },
  async deleteRequests(ids) {
    return withFileLock(async () => {
      const store = await readFileStore()
      const set = new Set(ids)
      const before = store.entries.length
      store.entries = store.entries.filter((e) => !set.has(e.id))
      await writeFileStore(store)
      return before - store.entries.length
    })
  },
  async enqueueGeneration(id) {
    return withFileLock(async () => {
      const store = await readFileStore()
      const idx = store.entries.findIndex((e) => e.id === id)
      if (idx < 0) return null
      store.entries[idx] = { ...store.entries[idx], status: "processing" }
      await writeFileStore(store)
      // Track pending generation ids in a sidecar file for Agent N polling.
      const pendingPath = path.join(
        path.dirname(filePath()),
        "pending-generation.json",
      )
      let pending: string[] = []
      try {
        pending = JSON.parse(await fs.readFile(pendingPath, "utf-8")) as string[]
        if (!Array.isArray(pending)) pending = []
      } catch {
        pending = []
      }
      if (!pending.includes(id)) pending.push(id)
      await fs.writeFile(pendingPath, JSON.stringify(pending, null, 2) + "\n")
      return store.entries[idx]
    })
  },
  async mergeRequests(keepId, duplicateIds) {
    return withFileLock(async () => {
      const store = await readFileStore()
      const keep = store.entries.find((e) => e.id === keepId)
      if (!keep) return null
      const set = new Set(duplicateIds.filter((id) => id !== keepId))
      store.entries = store.entries.filter((e) => !set.has(e.id))
      await writeFileStore(store)
      return keep
    })
  },
}

// ────────────────────────────────────────────────────────────────────────────
// KV backend (code-only; not wired to a real KV client to keep deps thin)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lightweight KV adapter. We don't import `@vercel/kv` here because that would
 * force the dep into the docs app even for sovereign deploys that never use
 * it. If/when the team chooses to deploy on Vercel KV, replace the `kv` stub
 * below with `import { kv } from "@vercel/kv"` and the rest of this module
 * works unchanged.
 *
 * Keys:
 *   dashboard:requests           → JSON array of GapEntry
 *   dashboard:pending-generation → JSON array of ids
 */
type MinimalKv = {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
}

function makeKvBackend(kv: MinimalKv): DashboardStore {
  const REQ_KEY = "dashboard:requests"
  const PEND_KEY = "dashboard:pending-generation"

  async function readAll(): Promise<GapEntry[]> {
    const raw = await kv.get<GapEntry[]>(REQ_KEY)
    return raw ?? []
  }
  async function writeAll(entries: GapEntry[]): Promise<void> {
    await kv.set(REQ_KEY, entries)
  }

  return {
    async getRequests(filter) {
      return applyFilter(await readAll(), filter)
    },
    async getRequest(id) {
      const entries = await readAll()
      return entries.find((e) => e.id === id) ?? null
    },
    async createRequest(payload) {
      const entries = await readAll()
      const idx = entries.findIndex((e) => e.id === payload.id)
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], ...payload }
        await writeAll(entries)
        return entries[idx]
      }
      entries.push(payload)
      await writeAll(entries)
      return payload
    },
    async updateRequest(id, patch) {
      const entries = await readAll()
      const idx = entries.findIndex((e) => e.id === id)
      if (idx < 0) return null
      const { id: _i, created_at: _c, ...safe } = patch
      entries[idx] = { ...entries[idx], ...safe }
      await writeAll(entries)
      return entries[idx]
    },
    async deleteRequests(ids) {
      const entries = await readAll()
      const set = new Set(ids)
      const before = entries.length
      const kept = entries.filter((e) => !set.has(e.id))
      await writeAll(kept)
      return before - kept.length
    },
    async enqueueGeneration(id) {
      const entries = await readAll()
      const idx = entries.findIndex((e) => e.id === id)
      if (idx < 0) return null
      entries[idx] = { ...entries[idx], status: "processing" }
      await writeAll(entries)
      const pending = (await kv.get<string[]>(PEND_KEY)) ?? []
      if (!pending.includes(id)) pending.push(id)
      await kv.set(PEND_KEY, pending)
      return entries[idx]
    },
    async mergeRequests(keepId, duplicateIds) {
      const entries = await readAll()
      const keep = entries.find((e) => e.id === keepId)
      if (!keep) return null
      const set = new Set(duplicateIds.filter((id) => id !== keepId))
      const kept = entries.filter((e) => !set.has(e.id))
      await writeAll(kept)
      return keep
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Selector
// ────────────────────────────────────────────────────────────────────────────

let _store: DashboardStore | null = null
let _kvOverride: MinimalKv | null = null

/**
 * Inject a KV client (or mock). Pass `null` to clear. Used by tests and by
 * future Vercel-KV wiring without making `@vercel/kv` a hard dep here.
 */
export function setKvClient(kv: MinimalKv | null): void {
  _kvOverride = kv
  _store = null
}

/** For tests: reset the cached singleton. */
export function resetStoreForTests(): void {
  _store = null
}

export function getStore(): DashboardStore {
  if (_store) return _store
  const backend = (process.env.DASH_STORE_BACKEND ?? "file").toLowerCase()
  if (backend === "kv" && _kvOverride) {
    _store = makeKvBackend(_kvOverride)
  } else {
    _store = fileBackend
  }
  return _store
}

/** Resolve absolute file path (exposed for tests / debugging). */
export function getFileStorePath(): string {
  return filePath()
}
