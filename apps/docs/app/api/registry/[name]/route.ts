import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "../_auth"
import { checkRateLimit } from "../_rate-limit"
import { captureError, logAudit } from "../_telemetry"

/**
 * GET /api/registry/[name]
 *
 * Bearer-auth gated registry endpoint. Reads the built JSON from
 * `public/r/<name>.json` and serves it to authenticated consumers only.
 *
 * Consumers configure their components.json like:
 *
 *   "registries": {
 *     "@dash": {
 *       "url": "https://ds.dash.com/api/registry/{name}",
 *       "headers": { "Authorization": "Bearer ${DASH_REGISTRY_TOKEN}" }
 *     }
 *   }
 *
 * Strip the .json suffix from the name segment if the consumer included it
 * (e.g. /api/registry/button.json works the same as /api/registry/button).
 */

const REGISTRY_DIR = path.join(process.cwd(), "public", "r")
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip")?.trim() ?? "unknown"
}

function getTokenFp(req: NextRequest): string | undefined {
  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\s+(.+)$/i.exec(header.trim())
  if (!m) return undefined
  const token = m[1].trim()
  return token.length >= 8 ? token.slice(-8) : token
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  const t0 = Date.now()
  const ip = getClientIp(req)
  const tokenFp = getTokenFp(req)

  if (!isAuthorized(req)) {
    logAudit({
      ts: new Date().toISOString(),
      op: "registry.auth_failed",
      ok: false,
      ip,
      token_fp: tokenFp,
      status_code: 401,
      duration_ms: Date.now() - t0,
    })
    return unauthorized()
  }

  const rateLimited = await checkRateLimit(req)
  if (rateLimited) {
    logAudit({
      ts: new Date().toISOString(),
      op: "registry.rate_limited",
      ok: false,
      ip,
      token_fp: tokenFp,
      status_code: 429,
      duration_ms: Date.now() - t0,
    })
    return rateLimited
  }

  const { name: rawName } = await ctx.params
  const name = rawName.replace(/\.json$/i, "")

  if (!NAME_RE.test(name)) {
    return NextResponse.json({ error: "Invalid item name", name }, { status: 400 })
  }

  const filePath = path.join(REGISTRY_DIR, `${name}.json`)

  // Defense in depth: ensure resolved path stays inside REGISTRY_DIR.
  if (!filePath.startsWith(REGISTRY_DIR + path.sep)) {
    return NextResponse.json({ error: "Path traversal blocked" }, { status: 400 })
  }

  let body: string
  try {
    body = await fs.readFile(filePath, "utf-8")
  } catch (err) {
    // 404 is expected for typos — don't capture. Other errors (perm
    // denied, FS corruption) ARE worth capturing.
    const errCode = (err as NodeJS.ErrnoException)?.code
    if (errCode !== "ENOENT") {
      captureError(err, { op: "registry.fetch_item", item: name, ip, token_fp: tokenFp })
    }
    logAudit({
      ts: new Date().toISOString(),
      op: "registry.fetch_item",
      ok: false,
      item: name,
      ip,
      token_fp: tokenFp,
      status_code: 404,
      duration_ms: Date.now() - t0,
    })
    return NextResponse.json(
      {
        error: "Not Found",
        name,
        hint: "Run `pnpm dashkit build` to regenerate the registry.",
      },
      { status: 404 },
    )
  }

  logAudit({
    ts: new Date().toISOString(),
    op: "registry.fetch_item",
    ok: true,
    item: name,
    ip,
    token_fp: tokenFp,
    status_code: 200,
    duration_ms: Date.now() - t0,
  })

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Short cache — items can update on every push. Vercel CDN can override.
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
    },
  })
}
