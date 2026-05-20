/**
 * Data source helper for the CEO Dashboard (Wave 4 Agent K).
 *
 * Single API surface — `loadGapQueue()` — that auto-switches between two
 * backends without callers caring which one is live:
 *
 *   1. Remote API (Agent L): set `DASH_API_URL` env. The helper appends
 *      `/api/dashboard/requests` and reads with the Bearer
 *      `DASH_CEO_TOKEN` so the API can scope reads to the CEO key.
 *   2. Local file: fallback when the API env is unset or the call fails.
 *      Reads `~/.dash/gap-queue.json` directly using the canonical
 *      shape from `packages/cli/src/lib/gap-queue.ts` (we do NOT import
 *      that module — it pulls Node-only imports that bloat the bundle
 *      and the CLI source isn't part of the docs tsconfig include).
 *
 * Failure modes are silent + lossless: missing file, unreadable file,
 * malformed JSON, or API 5xx all degrade to `{entries: [], source:
 * "empty", error?}`. The dashboard renders an empty state with the
 * reason — never crashes the route.
 *
 * Server-only: relies on `fs`, `os`, `path`. Do not import from a
 * client component.
 */
import "server-only"
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
  /** Foundation match score reserved for Agent N. Optional today. */
  foundation_match?: number | null
  /** Free-text reason for declined entries. Set by the decline action. */
  decline_reason?: string | null
}

export type DashboardLoadResult = {
  entries: GapEntry[]
  source: "api" | "file" | "empty"
  /** Soft error — non-empty when we recovered to an empty list. */
  error?: string
  /** Absolute path consulted when source==="file" (for debug surfaces). */
  filePath?: string
}

/** Default queue location: `~/.dash/gap-queue.json`. Mirrors CLI. */
export function defaultQueuePath(): string {
  return path.join(os.homedir(), ".dash", "gap-queue.json")
}

function isSeverity(v: unknown): v is GapSeverity {
  return v === "low" || v === "medium" || v === "high"
}

function isStatus(v: unknown): v is GapStatus {
  return v === "pending" || v === "synced" || v === "vendored" || v === "declined"
}

/**
 * Coerce a single unknown into a GapEntry, dropping anything malformed.
 * Mirrors `readQueue` in `packages/cli/src/lib/gap-queue.ts` — keep these
 * two coercers behaviour-compatible.
 */
function coerceEntry(raw: unknown): GapEntry | null {
  if (!raw || typeof raw !== "object") return null
  const e = raw as Partial<GapEntry>
  if (
    typeof e.id !== "string" ||
    typeof e.description !== "string" ||
    typeof e.created_at !== "string"
  ) {
    return null
  }
  return {
    id: e.id,
    created_at: e.created_at,
    description: e.description,
    severity: isSeverity(e.severity) ? e.severity : "medium",
    repo: typeof e.repo === "string" ? e.repo : null,
    prompt: typeof e.prompt === "string" ? e.prompt : null,
    generated_block_path:
      typeof e.generated_block_path === "string" ? e.generated_block_path : null,
    status: isStatus(e.status) ? e.status : "pending",
    foundation_match:
      typeof e.foundation_match === "number" ? e.foundation_match : null,
    decline_reason:
      typeof e.decline_reason === "string" ? e.decline_reason : null,
  }
}

function readLocalQueue(queuePath: string): DashboardLoadResult {
  if (!fs.existsSync(queuePath)) {
    return { entries: [], source: "empty", filePath: queuePath }
  }
  let raw: string
  try {
    raw = fs.readFileSync(queuePath, "utf-8")
  } catch (e) {
    return {
      entries: [],
      source: "empty",
      error: e instanceof Error ? e.message : "read failed",
      filePath: queuePath,
    }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      entries: [],
      source: "empty",
      error: "queue file is not valid JSON",
      filePath: queuePath,
    }
  }
  if (!parsed || typeof parsed !== "object") {
    return {
      entries: [],
      source: "empty",
      error: "queue file root is not an object",
      filePath: queuePath,
    }
  }
  const obj = parsed as { entries?: unknown }
  if (!Array.isArray(obj.entries)) {
    return { entries: [], source: "file", filePath: queuePath }
  }
  const entries: GapEntry[] = []
  for (const raw of obj.entries) {
    const e = coerceEntry(raw)
    if (e) entries.push(e)
  }
  return { entries, source: "file", filePath: queuePath }
}

async function readRemoteQueue(
  apiUrl: string,
  token: string | null,
): Promise<DashboardLoadResult | null> {
  const url = apiUrl.replace(/\/$/, "") + "/api/dashboard/requests"
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    })
    if (!res.ok) {
      return {
        entries: [],
        source: "empty",
        error: `API returned ${res.status}`,
      }
    }
    const body = (await res.json()) as { entries?: unknown }
    if (!body || typeof body !== "object" || !Array.isArray(body.entries)) {
      return {
        entries: [],
        source: "empty",
        error: "API returned malformed payload",
      }
    }
    const entries: GapEntry[] = []
    for (const raw of body.entries) {
      const e = coerceEntry(raw)
      if (e) entries.push(e)
    }
    return { entries, source: "api" }
  } catch (e) {
    // Network failure — caller will fall back to the local file.
    return {
      entries: [],
      source: "empty",
      error: e instanceof Error ? e.message : "API fetch failed",
    }
  }
}

/**
 * Load the gap queue from whichever source is available right now.
 *
 * Resolution order:
 *   1. `DASH_API_URL` set → try API first; on any failure fall through.
 *   2. Local file `~/.dash/gap-queue.json` (or override).
 *   3. Empty queue with a soft error string.
 *
 * Caller MUST treat `entries` as the source of truth; the `error` field
 * is for surface diagnostics, not flow control.
 */
export async function loadGapQueue(opts?: {
  queuePath?: string
  apiUrl?: string
  apiToken?: string
}): Promise<DashboardLoadResult> {
  const apiUrl = opts?.apiUrl ?? process.env.DASH_API_URL ?? null
  const apiToken = opts?.apiToken ?? process.env.DASH_CEO_TOKEN ?? null

  if (apiUrl && apiUrl.trim().length > 0) {
    const remote = await readRemoteQueue(apiUrl.trim(), apiToken)
    if (remote && remote.source === "api") return remote
    // Fall through to local file when API errors. We keep the API error
    // string so the dashboard can show it as a warning banner alongside
    // the local data.
    const local = readLocalQueue(opts?.queuePath ?? defaultQueuePath())
    if (remote?.error) {
      local.error = local.error
        ? `${remote.error}; ${local.error}`
        : `API unavailable (${remote.error}); using local file fallback`
    }
    return local
  }

  return readLocalQueue(opts?.queuePath ?? defaultQueuePath())
}

/**
 * Resolve the API endpoint that the client-side action handlers should
 * POST/PATCH against. Returns null when no API is wired — callers should
 * surface a "Pending Agent L deployment" toast instead of throwing.
 *
 * NOT exposed via process.env on the client; the page passes the URL
 * down as a prop so we can keep env access server-side only.
 */
export function resolveActionsBaseUrl(): string | null {
  const u = process.env.DASH_API_URL
  if (!u || u.trim().length === 0) return null
  return u.trim().replace(/\/$/, "")
}
