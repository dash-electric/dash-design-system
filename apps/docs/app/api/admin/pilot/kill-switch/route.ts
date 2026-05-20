import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "@/app/api/registry/_auth"

/**
 * POST /api/admin/pilot/kill-switch
 *
 * Bearer-gated kill switch for the Wave 5 pilot. Writes a marker file
 * (`pilot-frozen`) that the registry middleware reads on each fetch to
 * decide whether to honor or 423-Locked the install.
 *
 * Body:
 *   { action: "freeze" | "unfreeze", reason?: string }
 *
 * Response:
 *   { status: "frozen"|"active", reason?: string, since?: string }
 *
 * Freezing is reversible — unfreeze deletes the marker file and clears
 * the reason. The marker is intentionally local: an op accidentally
 * clicking "freeze" can be reversed by clearing the file by hand on
 * the server.
 */

const KILL_SWITCH_FILE = path.join(process.cwd(), "pilot-frozen")

type Body = {
  action?: string
  reason?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const action = body.action
  if (action !== "freeze" && action !== "unfreeze") {
    return NextResponse.json(
      { error: "action must be 'freeze' or 'unfreeze'" },
      { status: 400 },
    )
  }

  if (action === "freeze") {
    const payload = {
      since: new Date().toISOString(),
      reason: body.reason ?? "manual freeze via /docs/admin/pilot",
    }
    await fs.writeFile(KILL_SWITCH_FILE, JSON.stringify(payload, null, 2), "utf-8")
    return NextResponse.json({ status: "frozen", ...payload })
  }

  // Unfreeze: best-effort delete; missing file is success.
  try {
    await fs.unlink(KILL_SWITCH_FILE)
  } catch {
    /* already absent */
  }
  return NextResponse.json({ status: "active" })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const raw = await fs.readFile(KILL_SWITCH_FILE, "utf-8")
    return NextResponse.json({ status: "frozen", ...JSON.parse(raw) })
  } catch {
    return NextResponse.json({ status: "active" })
  }
}
