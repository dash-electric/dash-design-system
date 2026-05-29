import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "../_auth"
import { checkRateLimit } from "../_rate-limit"

/**
 * GET /api/registry/index
 *
 * Bearer-auth gated registry index (master listing of all items).
 * Mirrors the auth policy of /api/registry/[name].
 */

const REGISTRY_INDEX = path.join(process.cwd(), "public", "r", "index.json")

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  const rateLimited = await checkRateLimit(req)
  if (rateLimited) return rateLimited

  let body: string
  try {
    body = await fs.readFile(REGISTRY_INDEX, "utf-8")
  } catch {
    return NextResponse.json(
      { error: "Index not built", hint: "Run `pnpm dashkit build`." },
      { status: 404 },
    )
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
    },
  })
}
