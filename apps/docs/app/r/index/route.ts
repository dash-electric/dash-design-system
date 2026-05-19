import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "../../api/registry/_auth"

/**
 * GET /r/index
 *
 * Bearer-gated registry index listing. Mirrors auth policy of /r/[name].
 * Returns the contents of `public/r/index.json`.
 */

const REGISTRY_INDEX = path.join(process.cwd(), "public", "r", "index.json")

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ts = new Date().toISOString()
  const ip = getClientIp(req)

  if (!devModeBypass() && !isAuthorized(req)) {
    console.log(`[r/auth_denied] ts=${ts} ip=${ip} item=index`)
    return unauthorized()
  }

  let body: string
  try {
    body = await fs.readFile(REGISTRY_INDEX, "utf-8")
  } catch {
    return NextResponse.json(
      { error: "Index not built", hint: "Run `pnpm build:registry`." },
      { status: 404 },
    )
  }

  console.log(`[r/auth_ok] ts=${ts} ip=${ip} item=index`)
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}
