import { NextRequest, NextResponse } from "next/server"

/**
 * Shared Bearer-auth helper for the Dash registry API.
 *
 * Policy:
 *   - Production (NODE_ENV === "production"): REQUIRE Authorization: Bearer
 *     header matching DASH_REGISTRY_TOKEN exactly. No token configured →
 *     401 (fail closed).
 *   - Dev/preview (NODE_ENV !== "production"): if DASH_REGISTRY_TOKEN is
 *     unset, auth is bypassed for frictionless localhost iteration. If the
 *     env var IS set, even dev requires the header (lets you test the gate
 *     locally).
 *
 * Constant-time string compare to avoid leaking the token via timing
 * side-channels.
 */

function getExpectedToken(): string | null {
  const t = process.env.DASH_REGISTRY_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

export function isAuthorized(req: NextRequest): boolean {
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

export function unauthorized(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: "Unauthorized",
      hint:
        message ??
        "Set Authorization: Bearer <token> header. Configure registries[\"@dash\"].headers in your components.json.",
    },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="Dash Registry"' },
    },
  )
}
