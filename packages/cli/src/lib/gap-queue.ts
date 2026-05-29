/**
 * Local queue for `dashkit gap report` — records DS coverage gaps PEs encounter
 * (e.g., "no image-editor in DS"). Written to `~/.dash/gap-queue.json`. Wave 4
 * dashboard polls this file (or its sync'd remote equivalent) to surface the
 * backlog to the DS maintainer.
 *
 * Decoupled from any network dependency: this lib is pure local I/O. If the
 * queue file is missing or corrupt, we silently recover to an empty queue —
 * losing a few entries is preferable to crashing the command on bad JSON.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

export const GAP_QUEUE_SCHEMA_VERSION = 1

export type GapSeverity = "low" | "medium" | "high"

export type GapStatus = "pending" | "synced" | "vendored" | "declined"

export type GapEntry = {
  id: string
  created_at: string
  description: string
  severity: GapSeverity
  repo: string | null
  prompt: string | null
  generated_block_path: string | null
  status: GapStatus
}

export type GapQueue = {
  schemaVersion: typeof GAP_QUEUE_SCHEMA_VERSION
  entries: GapEntry[]
}

/** Default queue location: `~/.dash/gap-queue.json`. Overridable for tests. */
export function defaultQueuePath(): string {
  return path.join(os.homedir(), ".dash", "gap-queue.json")
}

function emptyQueue(): GapQueue {
  return { schemaVersion: GAP_QUEUE_SCHEMA_VERSION, entries: [] }
}

/**
 * Read queue from disk. Returns empty queue if the file is missing, unreadable,
 * or corrupt. Never throws — corruption is logged elsewhere; callers should
 * keep going.
 */
export function readQueue(queuePath: string = defaultQueuePath()): GapQueue {
  if (!fs.existsSync(queuePath)) return emptyQueue()
  let raw: string
  try {
    raw = fs.readFileSync(queuePath, "utf-8")
  } catch {
    return emptyQueue()
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyQueue()
  }
  if (!parsed || typeof parsed !== "object") return emptyQueue()
  const obj = parsed as Partial<GapQueue>
  if (!Array.isArray(obj.entries)) return emptyQueue()
  // Best-effort sanity check on each entry; drop malformed ones rather than
  // poisoning the whole queue.
  const entries: GapEntry[] = []
  for (const e of obj.entries) {
    if (!e || typeof e !== "object") continue
    const ent = e as Partial<GapEntry>
    if (
      typeof ent.id !== "string" ||
      typeof ent.description !== "string" ||
      typeof ent.created_at !== "string"
    ) {
      continue
    }
    entries.push({
      id: ent.id,
      created_at: ent.created_at,
      description: ent.description,
      severity: (ent.severity as GapSeverity) ?? "medium",
      repo: ent.repo ?? null,
      prompt: ent.prompt ?? null,
      generated_block_path: ent.generated_block_path ?? null,
      status: (ent.status as GapStatus) ?? "pending",
    })
  }
  return { schemaVersion: GAP_QUEUE_SCHEMA_VERSION, entries }
}

/** Write queue to disk. Creates parent dir if missing. */
export function writeQueue(
  queue: GapQueue,
  queuePath: string = defaultQueuePath(),
): void {
  const dir = path.dirname(queuePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n", "utf-8")
}

export type AppendGapInput = {
  description: string
  severity: GapSeverity
  repo: string | null
  prompt: string | null
}

/** Append a new entry to the queue and persist. Returns the created entry. */
export function appendGap(
  input: AppendGapInput,
  queuePath: string = defaultQueuePath(),
): GapEntry {
  const queue = readQueue(queuePath)
  const entry: GapEntry = {
    id: newId(),
    created_at: new Date().toISOString(),
    description: input.description,
    severity: input.severity,
    repo: input.repo,
    prompt: input.prompt,
    generated_block_path: null,
    status: "pending",
  }
  queue.entries.push(entry)
  writeQueue(queue, queuePath)
  return entry
}

/** Clear all entries; persists an empty queue. Returns count removed. */
export function clearQueue(queuePath: string = defaultQueuePath()): number {
  const queue = readQueue(queuePath)
  const n = queue.entries.length
  writeQueue(emptyQueue(), queuePath)
  return n
}

/**
 * Generate a short unique id. Uses `crypto.randomUUID()` when available, with
 * a timestamp-based fallback for ancient runtimes (we require Node 20 so this
 * should never fire in practice, but it's cheap insurance).
 */
function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `gap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
