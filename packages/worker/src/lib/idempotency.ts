/**
 * Idempotency store for Hermes gap processing.
 *
 * Prevents double-spending Anthropic tokens when a gap is replayed — whether
 * the worker crashed mid-process and restarted, or an operator manually
 * re-queued an entry for debugging.
 *
 * Key format (deterministic): sha256(gap.id + gap.created_at + gap.description.slice(0,100))
 *
 * Store location: ~/.dash/hermes-idempotency.json
 *
 * Design notes:
 *  - Pure functions where possible (computeKey, isProcessed, recordOutcome,
 *    evictStale). I/O bottoms out in readStore/writeStore so tests can mock
 *    via explicit store args.
 *  - Atomic write (tmp + rename) — best-effort durability against partial
 *    writes if the worker crashes during a flush.
 *  - Corruption recovery: any parse/shape failure resets to an empty store.
 *    Better to risk one duplicate Anthropic call than to brick the worker
 *    on a bad JSON byte.
 *  - 30-day TTL: stale entries pruned on read. This keeps the file from
 *    growing unbounded across months of operation.
 *  - Disable via env `DASH_HERMES_NO_IDEMPOTENCY=1` (handled in pipeline.ts).
 *
 * Schema version 1 — bump if shape changes.
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import type { GapEntry } from "../gap-queue.js"

export const IDEMPOTENCY_SCHEMA_VERSION = 1
export const DEFAULT_TTL_DAYS = 30

export type IdempotencyOutcome = "vendored" | "needs-review" | "failed"

export type IdempotencyEntry = {
  gapId: string
  processedAt: string
  outcome: IdempotencyOutcome
  prUrl: string | null
  tokenSpent: number
}

export type IdempotencyStore = {
  version: typeof IDEMPOTENCY_SCHEMA_VERSION
  entries: Record<string, IdempotencyEntry>
}

export function defaultStorePath(): string {
  return path.join(os.homedir(), ".dash", "hermes-idempotency.json")
}

function emptyStore(): IdempotencyStore {
  return { version: IDEMPOTENCY_SCHEMA_VERSION, entries: {} }
}

/**
 * Deterministic key from (id, created_at, first 100 chars of description).
 * Same gap = same key, every run. SHA-256 hex (64 chars).
 */
export function computeKey(gap: Pick<GapEntry, "id" | "created_at" | "description">): string {
  const desc = (gap.description ?? "").slice(0, 100)
  const material = `${gap.id}\x00${gap.created_at}\x00${desc}`
  return createHash("sha256").update(material, "utf-8").digest("hex")
}

/**
 * Parse the store file. Missing file, bad JSON, wrong shape → empty store.
 * Never throws.
 */
export function readStore(storePath: string = defaultStorePath()): IdempotencyStore {
  if (!fs.existsSync(storePath)) return emptyStore()
  let raw: string
  try {
    raw = fs.readFileSync(storePath, "utf-8")
  } catch {
    return emptyStore()
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyStore()
  }
  if (!parsed || typeof parsed !== "object") return emptyStore()
  const obj = parsed as Partial<IdempotencyStore>
  if (!obj.entries || typeof obj.entries !== "object") return emptyStore()
  const entries: Record<string, IdempotencyEntry> = {}
  for (const [k, v] of Object.entries(obj.entries)) {
    if (!v || typeof v !== "object") continue
    const e = v as Partial<IdempotencyEntry>
    if (
      typeof e.gapId !== "string" ||
      typeof e.processedAt !== "string" ||
      (e.outcome !== "vendored" && e.outcome !== "needs-review" && e.outcome !== "failed")
    ) {
      continue
    }
    entries[k] = {
      gapId: e.gapId,
      processedAt: e.processedAt,
      outcome: e.outcome,
      prUrl: typeof e.prUrl === "string" ? e.prUrl : null,
      tokenSpent: typeof e.tokenSpent === "number" ? e.tokenSpent : 0,
    }
  }
  return { version: IDEMPOTENCY_SCHEMA_VERSION, entries }
}

/**
 * Atomic write: stage to a tmp file in the same dir, then rename.
 * Rename is atomic on POSIX within a filesystem; ensures readers never see
 * a half-written JSON blob.
 */
export function writeStore(
  store: IdempotencyStore,
  storePath: string = defaultStorePath(),
): void {
  const dir = path.dirname(storePath)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = `${storePath}.tmp-${process.pid}-${Date.now()}`
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2) + "\n", "utf-8")
  fs.renameSync(tmp, storePath)
}

export function isProcessed(key: string, store: IdempotencyStore): boolean {
  return Object.prototype.hasOwnProperty.call(store.entries, key)
}

export function getEntry(key: string, store: IdempotencyStore): IdempotencyEntry | null {
  return store.entries[key] ?? null
}

/**
 * Returns a NEW store with the outcome recorded. Pure — doesn't mutate input.
 * Caller is responsible for persisting via writeStore().
 */
export function recordOutcome(
  key: string,
  entry: IdempotencyEntry,
  store: IdempotencyStore,
): IdempotencyStore {
  return {
    version: IDEMPOTENCY_SCHEMA_VERSION,
    entries: { ...store.entries, [key]: entry },
  }
}

/**
 * Remove a single key from the store. Returns new store; no-op if missing.
 */
export function removeEntry(key: string, store: IdempotencyStore): IdempotencyStore {
  if (!isProcessed(key, store)) return store
  const next: Record<string, IdempotencyEntry> = { ...store.entries }
  delete next[key]
  return { version: IDEMPOTENCY_SCHEMA_VERSION, entries: next }
}

/**
 * Prune entries older than `ttlDays`. Returns new store. Now defaults to "now"
 * but is overridable for tests.
 */
export function evictStale(
  store: IdempotencyStore,
  ttlDays: number = DEFAULT_TTL_DAYS,
  now: Date = new Date(),
): IdempotencyStore {
  const cutoffMs = now.getTime() - ttlDays * 24 * 60 * 60 * 1000
  const next: Record<string, IdempotencyEntry> = {}
  for (const [k, v] of Object.entries(store.entries)) {
    const ts = Date.parse(v.processedAt)
    if (Number.isFinite(ts) && ts < cutoffMs) continue
    next[k] = v
  }
  return { version: IDEMPOTENCY_SCHEMA_VERSION, entries: next }
}

/**
 * Helper used by the CLI: load + auto-evict stale on read. Pipeline uses
 * this too so stale entries never block reprocessing.
 */
export function loadStore(
  storePath: string = defaultStorePath(),
  ttlDays: number = DEFAULT_TTL_DAYS,
): IdempotencyStore {
  const raw = readStore(storePath)
  return evictStale(raw, ttlDays)
}

/** True when env var `DASH_HERMES_NO_IDEMPOTENCY=1` is set. */
export function isDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DASH_HERMES_NO_IDEMPOTENCY === "1"
}
