/**
 * Local feedback log for `dash feedback log` — captures Wave 5 pilot signal
 * (bugs, UX issues, missing pieces, praise, drift sightings) from PE while
 * they're working. Written as JSONL to `~/.dash/feedback-log.jsonl` so
 * appends are cheap, atomic-enough, and the file streams nicely to the
 * /docs/admin/pilot dashboard.
 *
 * Decoupled from any network dependency — pure local I/O. Missing or
 * corrupt files recover to an empty list (losing a few entries beats
 * crashing a PE's terminal mid-thought).
 *
 * Schema-versioned. Bumps require a migration here; the dashboard reader
 * fans out on schemaVersion.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execSync } from "node:child_process"

export const FEEDBACK_LOG_SCHEMA_VERSION = 1

export type FeedbackCategory =
  | "bug"
  | "ux"
  | "missing"
  | "praise"
  | "drift"
  | "other"

export type FeedbackSeverity = "low" | "med" | "high"

export type FeedbackStatus = "pending" | "synced"

export type FeedbackContext = {
  command?: string
  component?: string
  repo?: string
}

export type FeedbackEntry = {
  id: string
  timestamp: string
  pilot: string
  pe: string
  category: FeedbackCategory
  text: string
  severity?: FeedbackSeverity
  context?: FeedbackContext
  status: FeedbackStatus
}

export const VALID_CATEGORIES: ReadonlySet<FeedbackCategory> = new Set([
  "bug",
  "ux",
  "missing",
  "praise",
  "drift",
  "other",
])

export const VALID_SEVERITIES: ReadonlySet<FeedbackSeverity> = new Set([
  "low",
  "med",
  "high",
])

/** Default log location: `~/.dash/feedback-log.jsonl`. Overridable for tests. */
export function defaultLogPath(): string {
  return path.join(os.homedir(), ".dash", "feedback-log.jsonl")
}

/**
 * Read all entries from disk. Returns [] if file missing, unreadable, or
 * fully corrupt. Bad individual lines are dropped silently — better to
 * lose one line than the whole log.
 */
export function readLog(logPath: string = defaultLogPath()): FeedbackEntry[] {
  if (!fs.existsSync(logPath)) return []
  let raw: string
  try {
    raw = fs.readFileSync(logPath, "utf-8")
  } catch {
    return []
  }
  const out: FeedbackEntry[] = []
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      continue
    }
    const ent = coerceEntry(parsed)
    if (ent) out.push(ent)
  }
  return out
}

function coerceEntry(raw: unknown): FeedbackEntry | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Partial<FeedbackEntry>
  if (
    typeof r.id !== "string" ||
    typeof r.timestamp !== "string" ||
    typeof r.text !== "string" ||
    typeof r.pe !== "string"
  ) {
    return null
  }
  const category: FeedbackCategory = VALID_CATEGORIES.has(
    r.category as FeedbackCategory,
  )
    ? (r.category as FeedbackCategory)
    : "other"
  const severity: FeedbackSeverity | undefined =
    r.severity && VALID_SEVERITIES.has(r.severity)
      ? r.severity
      : undefined
  return {
    id: r.id,
    timestamp: r.timestamp,
    pilot: typeof r.pilot === "string" && r.pilot.length > 0 ? r.pilot : "wave-5",
    pe: r.pe,
    category,
    text: r.text,
    severity,
    context: r.context && typeof r.context === "object" ? r.context : undefined,
    status: r.status === "synced" ? "synced" : "pending",
  }
}

export type AppendFeedbackInput = {
  text: string
  category: FeedbackCategory
  pe: string
  pilot?: string
  severity?: FeedbackSeverity
  context?: FeedbackContext
}

/** Append an entry to the log, creating parents if needed. Returns the new entry. */
export function appendFeedback(
  input: AppendFeedbackInput,
  logPath: string = defaultLogPath(),
): FeedbackEntry {
  const entry: FeedbackEntry = {
    id: newId(),
    timestamp: new Date().toISOString(),
    pilot: input.pilot ?? "wave-5",
    pe: input.pe,
    category: input.category,
    text: input.text,
    severity: input.severity,
    context: input.context,
    status: "pending",
  }
  const dir = path.dirname(logPath)
  fs.mkdirSync(dir, { recursive: true })
  fs.appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8")
  return entry
}

/** Rewrite the log with the supplied entries. Used after `feedback sync`. */
export function writeLog(
  entries: FeedbackEntry[],
  logPath: string = defaultLogPath(),
): void {
  const dir = path.dirname(logPath)
  fs.mkdirSync(dir, { recursive: true })
  const body = entries.map((e) => JSON.stringify(e)).join("\n")
  fs.writeFileSync(logPath, body ? body + "\n" : "", "utf-8")
}

/**
 * Best-effort PE auto-detect from local git config user.name. Falls back to
 * $USER and finally "unknown" so the entry is always log-able even outside
 * a repo.
 */
export function detectPe(cwd: string = process.cwd()): string {
  try {
    const out = execSync("git config user.name", {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
    if (out) return out
  } catch {
    /* fall through */
  }
  const env = process.env.USER ?? process.env.USERNAME
  if (env && env.length > 0) return env
  return "unknown"
}

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
