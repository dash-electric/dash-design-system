import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/app/api/registry/_rate-limit"

/**
 * Edge middleware — two independent gates sharing the same matcher list:
 *
 *   1. /r/:path* — direct access to legacy /r/*.json static paths
 *      (gated by DASH_REGISTRY_TOKEN; mirrors /api/registry/[name]).
 *      Without this, Next.js would serve public/r/*.json statically
 *      and bypass the API route entirely, leaking the registry to
 *      anyone who knows an item name.
 *
 *   2. /dashboard/:path* — CEO-only dashboard for the Wave 4 gap
 *      backlog (Agent K). Gated by DASH_CEO_TOKEN. NOT applied to
 *      /docs/* — docs stay public. NOT applied to / or any marketing
 *      route — only /dashboard prefix.
 *
 * Each gate uses its own token env var so leaking the registry key
 * doesn't grant CEO dashboard access (and vice versa). Both follow
 * the same dev-bypass convention (token unset + NODE_ENV !==
 * "production" allows through, for local iteration).
 *
 * Rate limiting only applies to /r/* (DDoS-shaped path); /dashboard is
 * server-rendered HTML behind a token gate and doesn't need it.
 */

function getRegistryToken(): string | null {
  const t = process.env.DASH_REGISTRY_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

function getCeoToken(): string | null {
  const t = process.env.DASH_CEO_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\s+(.+)$/i.exec(header.trim())
  return m ? m[1].trim() : null
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

function isAuthorizedFor(req: NextRequest, expected: string | null): boolean {
  if (!expected) return process.env.NODE_ENV !== "production"
  const provided = bearerToken(req)
  if (!provided) return false
  return constantTimeEq(provided, expected)
}

function unauthorized(realm: string, hint: string): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Unauthorized", hint }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer realm="${realm}"`,
      },
    },
  )
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthorizedFor(req, getCeoToken())) {
      return unauthorized(
        "Dash CEO Dashboard",
        "The /dashboard/* surface is CEO-only. Set DASH_CEO_TOKEN and send Authorization: Bearer <token>.",
      )
    }
    return NextResponse.next()
  }

  // Default branch: /r/:path* registry gate.
  if (!isAuthorizedFor(req, getRegistryToken())) {
    return unauthorized(
      "Dash Registry",
      "Direct /r/*.json access requires Authorization: Bearer <token>. Prefer /api/registry/<name>.",
    )
  }

  const rateLimited = await checkRateLimit(req)
  if (rateLimited) return rateLimited

  return NextResponse.next()
}

export const config = {
  matcher: ["/r/:path*", "/dashboard/:path*"],
}
