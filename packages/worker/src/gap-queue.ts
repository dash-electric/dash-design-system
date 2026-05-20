/**
 * Gap queue — local copy of the schema for the worker.
 *
 * The canonical lib lives in `packages/cli/src/lib/gap-queue.ts`. We vendor a
 * structurally identical copy here so the worker package can be built and
 * deployed standalone (Vercel cron / Railway / VPS) without pulling the CLI's
 * `src/` into its compile graph. If the schema changes, update both places.
 *
 * Schema-version stays in lockstep with the CLI (`GAP_QUEUE_SCHEMA_VERSION`).
 *
 * Behaviour mirrors the CLI lib exactly:
 *  - missing/corrupt queue → empty queue, never throws
 *  - malformed entries dropped (don't poison the whole queue)
 *  - writes create parent dir
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

export type AppendGapInput = {
  description: string
  severity: GapSeverity
  repo: string | null
  prompt: string | null
}

export function defaultQueuePath(): string {
  return path.join(os.homedir(), ".dash", "gap-queue.json")
}

function emptyQueue(): GapQueue {
  return { schemaVersion: GAP_QUEUE_SCHEMA_VERSION, entries: [] }
}

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

export function writeQueue(
  queue: GapQueue,
  queuePath: string = defaultQueuePath(),
): void {
  const dir = path.dirname(queuePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n", "utf-8")
}

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `gap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

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

export function clearQueue(queuePath: string = defaultQueuePath()): number {
  const queue = readQueue(queuePath)
  const n = queue.entries.length
  writeQueue(emptyQueue(), queuePath)
  return n
}
