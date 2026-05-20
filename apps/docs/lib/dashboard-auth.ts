/**
 * Bearer auth + audit logging for the `/api/dashboard/*` surface.
 *
 * Distinct from `app/api/registry/_auth.ts` because the dashboard uses a
 * different token (`DASH_CEO_TOKEN`) — registry consumers shouldn't be able
 * to read the gap-request backlog, and dashboard operators shouldn't be
 * able to pull arbitrary registry items.
 *
 * Policy:
 *   - Production: REQUIRE Authorization: Bearer matching DASH_CEO_TOKEN.
 *     Token unset in production → 401 (fail closed).
 *   - Dev: if token unset, auth is bypassed for localhost iteration. If
 *     the env var IS set, even dev requires the header.
 *
 * Constant-time compare to avoid timing leaks.
 * Every successful auth (and every failure) appends a JSONL audit line to
 * `data/dashboard/audit-log.jsonl`.
 */
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

function auditLogPath(): string {
  const override = process.env.DASH_DASHBOARD_DATA_DIR
  const base = override
    ? path.resolve(override)
    : path.join(process.cwd(), "data", "dashboard")
  return path.join(base, "audit-log.jsonl")
}

function getExpectedToken(): string | null {
  const t = process.env.DASH_CEO_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export function isDashboardAuthorized(req: NextRequest): boolean {
  const expected = getExpectedToken()
  if (!expected) return process.env.NODE_ENV !== "production"

  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\s+(.+)$/i.exec(header.trim())
  if (!m) return false
  return constantTimeEqual(m[1].trim(), expected)
}

export function dashboardUnauthorized(): NextResponse {
  return NextResponse.json(
    {
      error: "Unauthorized",
      hint: "Set Authorization: Bearer <DASH_CEO_TOKEN> header.",
    },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="Dash Dashboard"' },
    },
  )
}

function clientIpHash(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  const ip =
    (xff ? xff.split(",")[0].trim() : null) ??
    req.headers.get("x-real-ip")?.trim() ??
    "unknown"
  // Hash for privacy — raw IPs in audit logs is more than we need.
  return createHash("sha256").update(ip).digest("hex").slice(0, 16)
}

export type AuditRecord = {
  ts: string
  route: string
  method: string
  status: number
  ok: boolean
  ip_hash: string
}

/**
 * Append a single JSONL line to the audit log. Fire-and-forget — never throws
 * back to the caller. If the disk is unavailable we'd rather drop the audit
 * line than 500 a legitimate request.
 */
export async function writeAudit(record: AuditRecord): Promise<void> {
  try {
    await fs.mkdir(path.dirname(auditLogPath()), { recursive: true })
    await fs.appendFile(auditLogPath(), JSON.stringify(record) + "\n", "utf-8")
  } catch {
    // intentionally swallowed
  }
}

/**
 * Convenience wrapper: checks auth, writes an audit line, returns either an
 * unauthorized NextResponse or null (= continue). Use at the top of every
 * dashboard route handler.
 */
export async function gateDashboard(
  req: NextRequest,
  route: string,
): Promise<NextResponse | null> {
  const ok = isDashboardAuthorized(req)
  await writeAudit({
    ts: new Date().toISOString(),
    route,
    method: req.method,
    status: ok ? 200 : 401,
    ok,
    ip_hash: clientIpHash(req),
  })
  if (!ok) return dashboardUnauthorized()
  return null
}

/** Exposed for tests. */
export function getAuditLogPath(): string {
  return auditLogPath()
}
