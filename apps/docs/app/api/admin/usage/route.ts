import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { isAuthorized, unauthorized } from "@/app/api/registry/_auth"

/**
 * GET /api/admin/usage
 *
 * Bearer-gated adoption telemetry summary for the admin usage dashboard.
 *
 * Source order:
 *   1. `registry-audit.jsonl` at repo root (local dev / self-hosted log
 *      drain). One JSON object per line — flushed by
 *      app/api/registry/_telemetry.ts on overflow.
 *   2. Empty fallback when the file is absent (fresh deploy, Vercel
 *      function logs not yet wired). The endpoint stays 200 with zero
 *      counts so the dashboard can render skeletons without crashing.
 *
 * Privacy:
 *   - No raw IPs. Every IP is reduced to an 8-char SHA-256 prefix
 *     (HMAC-keyed by DASH_REGISTRY_TOKEN to prevent rainbow lookups).
 *   - No emails, no user identifiers — Bearer-gated registry has no
 *     user concept; we count by hashed client only.
 *   - No payloads — just per-day / per-component / per-client tallies.
 *
 * Response shape (stable contract — page.tsx depends on it):
 *   {
 *     totalInstalls,
 *     byDay:    [{ date: "YYYY-MM-DD", count }],
 *     byComponent: [{ name, count }],
 *     byHashedClient: [{ hashId, count }],
 *     window: { from, to, source }
 *   }
 */

const AUDIT_FILE = path.join(process.cwd(), "registry-audit.jsonl")

type AuditLine = {
  ts?: string
  op?: string
  ok?: boolean
  item?: string
  ip?: string
  status_code?: number
}

function hashClient(ip: string | undefined): string {
  if (!ip) return "unknown"
  const salt = process.env.DASH_REGISTRY_TOKEN ?? "dash-default-salt"
  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 8)
}

function parseJsonl(buf: string): AuditLine[] {
  const out: AuditLine[] = []
  for (const line of buf.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      out.push(JSON.parse(trimmed) as AuditLine)
    } catch {
      // Skip malformed line — never crash the dashboard on a bad row.
    }
  }
  return out
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  let raw = ""
  let source: "file" | "empty" = "empty"
  try {
    raw = await fs.readFile(AUDIT_FILE, "utf-8")
    source = "file"
  } catch {
    // No log file yet — return empty aggregates with 200.
  }

  const records = parseJsonl(raw).filter(
    (r) =>
      r.op === "registry.fetch_item" &&
      r.ok === true &&
      typeof r.item === "string",
  )

  const byDayMap = new Map<string, number>()
  const byCompMap = new Map<string, number>()
  const byClientMap = new Map<string, number>()
  let from: string | undefined
  let to: string | undefined

  for (const r of records) {
    const ts = r.ts ?? new Date().toISOString()
    const date = ts.slice(0, 10) // YYYY-MM-DD
    byDayMap.set(date, (byDayMap.get(date) ?? 0) + 1)

    const name = r.item ?? "unknown"
    byCompMap.set(name, (byCompMap.get(name) ?? 0) + 1)

    const hashId = hashClient(r.ip)
    byClientMap.set(hashId, (byClientMap.get(hashId) ?? 0) + 1)

    if (!from || ts < from) from = ts
    if (!to || ts > to) to = ts
  }

  const byDay = [...byDayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const byComponent = [...byCompMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const byHashedClient = [...byClientMap.entries()]
    .map(([hashId, count]) => ({ hashId, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(
    {
      totalInstalls: records.length,
      byDay,
      byComponent,
      byHashedClient,
      window: { from: from ?? null, to: to ?? null, source },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
