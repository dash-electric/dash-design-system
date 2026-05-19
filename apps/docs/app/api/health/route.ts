import { NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * GET /api/health
 *
 * Public liveness + readiness probe. NOT Bearer-gated — uptime monitors
 * (UptimeRobot, BetterStack, etc) need to hit this without a token.
 *
 * Returns:
 *   - 200 + { status: "ok", ... }  when registry index is reachable
 *   - 503 + { status: "degraded", reason } when index is missing/broken
 *
 * Surface area kept minimal on purpose — anything that would leak
 * internal state (component count, item names, env vars) is omitted.
 */

type HealthPayload = {
  status: "ok" | "degraded"
  version: string
  ts: string
  uptime_s: number
  reason?: string
}

const startedAt = Date.now()
const REGISTRY_INDEX = path.join(process.cwd(), "public", "r", "index.json")

// Allow override via package.json version at build time; fallback "0.0.0".
const VERSION = process.env.NEXT_PUBLIC_DASH_DS_VERSION ?? "0.1.0"

export async function GET(): Promise<NextResponse> {
  const base: HealthPayload = {
    status: "ok",
    version: VERSION,
    ts: new Date().toISOString(),
    uptime_s: Math.floor((Date.now() - startedAt) / 1000),
  }

  // Readiness check — registry index must exist and parse as JSON.
  try {
    const body = await fs.readFile(REGISTRY_INDEX, "utf-8")
    JSON.parse(body)
  } catch (err) {
    return NextResponse.json(
      {
        ...base,
        status: "degraded",
        reason:
          err instanceof Error
            ? `registry index unreadable: ${err.message}`
            : "registry index unreadable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    )
  }

  return NextResponse.json(base, {
    status: 200,
    headers: {
      // Short cache so uptime monitors get fresh-ish responses but
      // a stampede doesn't multiply disk reads.
      "Cache-Control": "public, max-age=10, s-maxage=10",
    },
  })
}
