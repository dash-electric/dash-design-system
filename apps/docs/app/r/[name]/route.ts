import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "../../api/registry/_auth"

/**
 * GET /r/[name]
 *
 * Public-facing Bearer-gated registry endpoint that mirrors the legacy
 * `public/r/<name>.json` URL shape. Consumers (shadcn CLI, dash-cli,
 * dash-mcp) historically pointed at `https://ds.dash.com/r/<name>.json`
 * — this route preserves that contract while adding auth.
 *
 * Auth policy (delegated to ../api/registry/_auth):
 *   - Production: requires `Authorization: Bearer <DASH_REGISTRY_TOKEN>`.
 *   - Dev/preview: bypassed when DASH_REGISTRY_TOKEN is unset.
 *   - Local dev override: `DASH_REGISTRY_DEV_MODE=1` skips the gate even
 *     if a token IS configured — handy for poking the route from curl
 *     without copying the token into your shell. NEVER set this in prod.
 *
 * Logs every request (timestamp + item + IP + outcome) to stdout for
 * audit trail. Vercel pipes these into the runtime log stream.
 *
 * Note: in production deployments, `public/r/*.json` should NOT be
 * directly accessible (block via vercel.json rewrites or middleware).
 * This route is the canonical access path.
 */

const REGISTRY_DIR = path.join(process.cwd(), "public", "r")
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip")?.trim() ?? "unknown"
}

function devModeBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DASH_REGISTRY_DEV_MODE === "1"
  )
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  const ts = new Date().toISOString()
  const ip = getClientIp(req)
  const { name: rawName } = await ctx.params
  const name = rawName.replace(/\.json$/i, "")

  // Auth gate (with explicit dev-mode bypass for localhost poking).
  if (!devModeBypass() && !isAuthorized(req)) {
    console.log(`[r/auth_denied] ts=${ts} ip=${ip} item=${name}`)
    return unauthorized()
  }

  if (!NAME_RE.test(name)) {
    return NextResponse.json({ error: "Invalid item name", name }, { status: 400 })
  }

  const filePath = path.join(REGISTRY_DIR, `${name}.json`)
  // Defense in depth: resolved path must stay inside REGISTRY_DIR.
  if (!filePath.startsWith(REGISTRY_DIR + path.sep)) {
    return NextResponse.json({ error: "Path traversal blocked" }, { status: 400 })
  }

  let body: string
  try {
    body = await fs.readFile(filePath, "utf-8")
  } catch {
    console.log(`[r/not_found] ts=${ts} ip=${ip} item=${name}`)
    return NextResponse.json(
      {
        error: "Not Found",
        name,
        hint: "Run `pnpm build:registry` to regenerate the registry.",
      },
      { status: 404 },
    )
  }

  console.log(`[r/auth_ok] ts=${ts} ip=${ip} item=${name}`)
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}
