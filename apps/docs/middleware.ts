import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/app/api/registry/_rate-limit"

/**
 * Edge middleware — gates direct access to legacy /r/*.json static paths
 * with the same Bearer auth + rate limit policy as /api/registry/[name].
 *
 * Without this, Next.js would serve public/r/*.json statically and bypass
 * the API route entirely, leaking the registry to anyone who knows an
 * item name.
 *
 * Auth policy mirrors app/api/registry/_auth.ts (constant-time compare,
 * dev-bypass when DASH_REGISTRY_TOKEN unset and not in production).
 */

function getExpectedToken(): string | null {
  const t = process.env.DASH_REGISTRY_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

function isAuthorized(req: NextRequest): boolean {
  const expected = getExpectedToken()
  if (!expected) return process.env.NODE_ENV !== "production"

  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\s+(.+)$/i.exec(header.trim())
  if (!m) return false

  const provided = m[1].trim()
  if (provided.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        hint: "Direct /r/*.json access requires Authorization: Bearer <token>. Prefer /api/registry/<name>.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="Dash Registry"',
        },
      },
    )
  }

  const rateLimited = await checkRateLimit(req)
  if (rateLimited) return rateLimited

  return NextResponse.next()
}

export const config = {
  matcher: ["/r/:path*"],
}
