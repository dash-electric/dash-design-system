/**
 * Hand-rolled validators for dashboard request bodies.
 *
 * Per Dash AI rules (§ Banned Imports), we don't use zod / yup / joi here —
 * just plain TypeScript narrowing. The surface is small enough that hand-rolled
 * stays readable and avoids the dep cost.
 *
 * Each validator returns a discriminated union: `{ ok: true, data }` on
 * success, `{ ok: false, error }` on failure. Callers translate the failure
 * branch to HTTP 400 with the error string in the response body.
 */
import type { GapEntry, GapSeverity, GapStatus } from "./dashboard-store"

const VALID_SEVERITIES: ReadonlySet<GapSeverity> = new Set([
  "low",
  "medium",
  "high",
])

const VALID_STATUSES: ReadonlySet<GapStatus> = new Set([
  "pending",
  "synced",
  "processing",
  "generated",
  "vendored",
  "declined",
])

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0
}

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `gap_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

/**
 * Validate a CREATE payload. Accepts the same shape the CLI writes
 * (`GapEntry` minus optional server-managed fields). Missing id/created_at
 * are filled with sensible defaults — Agent K can POST a partial entry from
 * the dashboard's "log gap" form without minting an id client-side.
 */
export function validateCreateRequest(body: unknown): Result<GapEntry> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object" }
  }
  if (!isNonEmptyString(body.description)) {
    return { ok: false, error: "description is required (non-empty string)" }
  }
  const severityRaw = body.severity ?? "medium"
  if (typeof severityRaw !== "string" || !VALID_SEVERITIES.has(severityRaw as GapSeverity)) {
    return {
      ok: false,
      error: `severity must be one of: low, medium, high (got ${JSON.stringify(severityRaw)})`,
    }
  }
  const severity = severityRaw as GapSeverity

  if (body.repo !== undefined && body.repo !== null && typeof body.repo !== "string") {
    return { ok: false, error: "repo must be a string or null" }
  }
  if (
    body.prompt !== undefined &&
    body.prompt !== null &&
    typeof body.prompt !== "string"
  ) {
    return { ok: false, error: "prompt must be a string or null" }
  }
  if (body.id !== undefined && !isNonEmptyString(body.id)) {
    return { ok: false, error: "id, if provided, must be a non-empty string" }
  }
  if (body.created_at !== undefined && !isNonEmptyString(body.created_at)) {
    return {
      ok: false,
      error: "created_at, if provided, must be an ISO timestamp string",
    }
  }
  const statusRaw = body.status ?? "pending"
  if (typeof statusRaw !== "string" || !VALID_STATUSES.has(statusRaw as GapStatus)) {
    return {
      ok: false,
      error: `status must be one of: ${Array.from(VALID_STATUSES).join(", ")}`,
    }
  }

  const entry: GapEntry = {
    id: (body.id as string | undefined) ?? newId(),
    created_at: (body.created_at as string | undefined) ?? new Date().toISOString(),
    description: (body.description as string).trim(),
    severity,
    repo: (body.repo as string | null | undefined) ?? null,
    prompt: (body.prompt as string | null | undefined) ?? null,
    generated_block_path:
      typeof body.generated_block_path === "string"
        ? body.generated_block_path
        : null,
    status: statusRaw as GapStatus,
    generated_at:
      typeof body.generated_at === "string" ? body.generated_at : null,
    notes: typeof body.notes === "string" ? body.notes : null,
  }
  return { ok: true, data: entry }
}

/** PATCH: any subset of mutable fields. id/created_at silently ignored. */
export function validatePatchRequest(body: unknown): Result<Partial<GapEntry>> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object" }
  }
  const patch: Partial<GapEntry> = {}

  if (body.description !== undefined) {
    if (!isNonEmptyString(body.description)) {
      return { ok: false, error: "description must be a non-empty string" }
    }
    patch.description = body.description.trim()
  }
  if (body.severity !== undefined) {
    if (
      typeof body.severity !== "string" ||
      !VALID_SEVERITIES.has(body.severity as GapSeverity)
    ) {
      return { ok: false, error: "severity must be one of: low, medium, high" }
    }
    patch.severity = body.severity as GapSeverity
  }
  if (body.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !VALID_STATUSES.has(body.status as GapStatus)
    ) {
      return {
        ok: false,
        error: `status must be one of: ${Array.from(VALID_STATUSES).join(", ")}`,
      }
    }
    patch.status = body.status as GapStatus
  }
  if (body.repo !== undefined) {
    if (body.repo !== null && typeof body.repo !== "string") {
      return { ok: false, error: "repo must be a string or null" }
    }
    patch.repo = body.repo as string | null
  }
  if (body.prompt !== undefined) {
    if (body.prompt !== null && typeof body.prompt !== "string") {
      return { ok: false, error: "prompt must be a string or null" }
    }
    patch.prompt = body.prompt as string | null
  }
  if (body.generated_block_path !== undefined) {
    if (
      body.generated_block_path !== null &&
      typeof body.generated_block_path !== "string"
    ) {
      return {
        ok: false,
        error: "generated_block_path must be a string or null",
      }
    }
    patch.generated_block_path = body.generated_block_path as string | null
  }
  if (body.generated_at !== undefined) {
    if (body.generated_at !== null && typeof body.generated_at !== "string") {
      return { ok: false, error: "generated_at must be a string or null" }
    }
    patch.generated_at = body.generated_at as string | null
  }
  if (body.notes !== undefined) {
    if (body.notes !== null && typeof body.notes !== "string") {
      return { ok: false, error: "notes must be a string or null" }
    }
    patch.notes = body.notes as string | null
  }

  return { ok: true, data: patch }
}

/** DELETE bulk body: { ids: string[] } */
export function validateDeleteBody(body: unknown): Result<string[]> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object" }
  }
  const { ids } = body
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "ids must be a non-empty array of strings" }
  }
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0) {
      return { ok: false, error: "every id must be a non-empty string" }
    }
  }
  return { ok: true, data: ids as string[] }
}

/** MERGE body: { keepId, duplicateIds } */
export function validateMergeBody(
  body: unknown,
): Result<{ keepId: string; duplicateIds: string[] }> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object" }
  }
  if (!isNonEmptyString(body.keepId)) {
    return { ok: false, error: "keepId must be a non-empty string" }
  }
  if (!Array.isArray(body.duplicateIds) || body.duplicateIds.length === 0) {
    return {
      ok: false,
      error: "duplicateIds must be a non-empty array of strings",
    }
  }
  for (const id of body.duplicateIds) {
    if (typeof id !== "string" || id.length === 0) {
      return { ok: false, error: "every duplicateId must be a non-empty string" }
    }
  }
  return {
    ok: true,
    data: {
      keepId: body.keepId as string,
      duplicateIds: body.duplicateIds as string[],
    },
  }
}

/** Bulk create (CLI sync): { entries: GapEntry[] } */
export function validateBulkCreateBody(
  body: unknown,
): Result<GapEntry[]> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object" }
  }
  if (!Array.isArray(body.entries)) {
    return { ok: false, error: "entries must be an array" }
  }
  const out: GapEntry[] = []
  for (let i = 0; i < body.entries.length; i++) {
    const r = validateCreateRequest(body.entries[i])
    if (!r.ok) {
      return { ok: false, error: `entries[${i}]: ${r.error}` }
    }
    out.push(r.data)
  }
  return { ok: true, data: out }
}

/** Filter params from URLSearchParams. */
export function parseListFilter(searchParams: URLSearchParams): {
  status?: GapStatus[]
  severity?: GapSeverity[]
  repo?: string
} {
  const filter: { status?: GapStatus[]; severity?: GapSeverity[]; repo?: string } = {}
  const statusRaw = searchParams.getAll("status")
  if (statusRaw.length > 0) {
    const ok = statusRaw.filter((s): s is GapStatus =>
      VALID_STATUSES.has(s as GapStatus),
    )
    if (ok.length > 0) filter.status = ok
  }
  const sevRaw = searchParams.getAll("severity")
  if (sevRaw.length > 0) {
    const ok = sevRaw.filter((s): s is GapSeverity =>
      VALID_SEVERITIES.has(s as GapSeverity),
    )
    if (ok.length > 0) filter.severity = ok
  }
  const repo = searchParams.get("repo")
  if (repo) filter.repo = repo
  return filter
}
