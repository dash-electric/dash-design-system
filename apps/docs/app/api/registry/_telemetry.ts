/**
 * Telemetry hooks for the Dash registry API.
 *
 * Three layers, all DSN-optional — none of these fail the request if
 * unconfigured:
 *
 *   1. captureError(err, ctx) — Sentry-compatible payload. If
 *      SENTRY_DSN is set, POSTs to /api/X/store endpoint. Otherwise
 *      console.error in dev, no-op in production.
 *
 *   2. captureEvent(name, props) — structured log line. If
 *      LOG_DRAIN_URL is set, POSTs JSON. Otherwise console.log in
 *      dev. Use for `registry_fetch`, `auth_failed`, `rate_limited`.
 *
 *   3. logAudit(audit) — per-fetch audit record. Buffered in memory,
 *      flushed via captureEvent on shutdown OR when buffer >100. Drop
 *      on overflow rather than block the request.
 *
 * No hard dependency on @sentry/nextjs — the project does not include
 * the SDK yet. When the SDK is installed, swap captureError to call
 * Sentry.captureException directly; the public API of this module
 * stays stable.
 */

type ErrCtx = {
  /** Logical operation name, e.g. "registry.fetch_item". */
  op: string
  /** Item name being fetched, if any. */
  item?: string
  /** Token fingerprint (last 8 chars). Never the full token. */
  token_fp?: string
  /** Client IP (already extracted). */
  ip?: string
  /** Free-form extra context. */
  extra?: Record<string, unknown>
}

type AuditRecord = {
  ts: string
  op: "registry.fetch_item" | "registry.fetch_index" | "registry.auth_failed" | "registry.rate_limited"
  ok: boolean
  item?: string
  ip?: string
  token_fp?: string
  status_code: number
  duration_ms?: number
}

/* -------------------------------------------------------------------------- */
/* Error capture — Sentry-compatible                                           */
/* -------------------------------------------------------------------------- */

const SENTRY_DSN = process.env.SENTRY_DSN
const LOG_DRAIN_URL = process.env.LOG_DRAIN_URL

export function captureError(err: unknown, ctx: ErrCtx): void {
  const payload = {
    level: "error" as const,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    tags: { op: ctx.op },
    extra: { ...ctx.extra, item: ctx.item, ip: ctx.ip, token_fp: ctx.token_fp },
  }

  if (SENTRY_DSN) {
    // Fire-and-forget — don't block the request on telemetry.
    void postSentry(payload).catch(() => {
      // Silently swallow — error telemetry should never crash the handler.
    })
  } else if (process.env.NODE_ENV !== "production") {
    console.error("[telemetry.error]", payload)
  }
}

async function postSentry(payload: unknown): Promise<void> {
  if (!SENTRY_DSN) return
  // Minimal Sentry "store" envelope. The full @sentry/nextjs SDK does
  // proper batching, breadcrumbs, etc. This is a placeholder until the
  // SDK lands — captures the most critical signal (uncaught errors).
  try {
    const url = new URL(SENTRY_DSN)
    const projectId = url.pathname.replace(/^\//, "")
    const publicKey = url.username
    const endpoint = `${url.protocol}//${url.host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // Network failures — drop. Never crash on telemetry.
  }
}

/* -------------------------------------------------------------------------- */
/* Event capture — structured log                                              */
/* -------------------------------------------------------------------------- */

export function captureEvent(
  name: string,
  props: Record<string, unknown> = {},
): void {
  const event = {
    name,
    ts: new Date().toISOString(),
    ...props,
  }

  if (LOG_DRAIN_URL) {
    void postLogDrain(event).catch(() => {})
  } else if (process.env.NODE_ENV !== "production") {
    console.log("[telemetry.event]", event)
  }
}

async function postLogDrain(event: unknown): Promise<void> {
  if (!LOG_DRAIN_URL) return
  try {
    await fetch(LOG_DRAIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // Swallow.
  }
}

/* -------------------------------------------------------------------------- */
/* Audit log — per-fetch record                                                */
/* -------------------------------------------------------------------------- */

const auditBuffer: AuditRecord[] = []
const AUDIT_BUFFER_MAX = 100

export function logAudit(record: AuditRecord): void {
  auditBuffer.push(record)

  // Append to local audit JSONL for /admin/usage dashboard (local/self-host only).
  // Non-blocking, error-swallowed (matches "never crash request" pattern).
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    void appendAuditLine(record).catch(() => {})
  }

  if (auditBuffer.length >= AUDIT_BUFFER_MAX) {
    flushAudit()
  }
}

async function appendAuditLine(record: AuditRecord): Promise<void> {
  const fs = await import("node:fs/promises")
  const path = await import("node:path")
  const file = path.join(process.cwd(), "registry-audit.jsonl")
  await fs.appendFile(file, JSON.stringify(record) + "\n", "utf8")
}

function flushAudit(): void {
  if (auditBuffer.length === 0) return
  const batch = auditBuffer.splice(0, auditBuffer.length)
  captureEvent("registry.audit_batch", {
    count: batch.length,
    records: batch,
  })
}

// Best-effort flush on process exit (Node runtime; no-op on edge).
if (typeof process !== "undefined" && typeof process.on === "function") {
  try {
    process.on("beforeExit", flushAudit)
    process.on("SIGTERM", flushAudit)
  } catch {
    // Edge runtime — no process events available.
  }
}
