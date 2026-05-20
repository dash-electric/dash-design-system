/**
 * POST /api/dashboard/requests/merge
 *
 * Body: { keepId: string, duplicateIds: string[] }
 *
 * Keeps `keepId`, deletes everything in `duplicateIds`. Idempotent: re-merging
 * an already-merged set is a no-op. Useful when multiple PEs file the same
 * gap from different repos.
 */
import { NextRequest, NextResponse } from "next/server"
import { gateDashboard } from "@/lib/dashboard-auth"
import { getStore } from "@/lib/dashboard-store"
import { validateMergeBody } from "@/lib/dashboard-validators"

export async function POST(req: NextRequest): Promise<NextResponse> {
  const gate = await gateDashboard(req, "/api/dashboard/requests/merge")
  if (gate) return gate

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const v = validateMergeBody(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const kept = await getStore().mergeRequests(v.data.keepId, v.data.duplicateIds)
  if (!kept) {
    return NextResponse.json(
      { error: "Keep entry not found", keepId: v.data.keepId },
      { status: 404 },
    )
  }
  return NextResponse.json(
    { kept, mergedCount: v.data.duplicateIds.length },
    { status: 200 },
  )
}
