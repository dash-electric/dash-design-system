/**
 * POST /api/dashboard/requests/[id]/regenerate
 *
 * Same surface as /generate — resets the entry's generated_block_path and
 * re-queues. Useful when the previous generation was rejected by the
 * maintainer and a fresh attempt is needed.
 */
import { NextRequest, NextResponse } from "next/server"
import { gateDashboard } from "@/lib/dashboard-auth"
import { getStore } from "@/lib/dashboard-store"

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params
  const gate = await gateDashboard(
    req,
    `/api/dashboard/requests/${id}/regenerate`,
  )
  if (gate) return gate

  const store = getStore()
  // Clear previous generation artifacts before re-queuing so Agent N
  // can't accidentally pick up a stale path.
  const cleared = await store.updateRequest(id, {
    generated_block_path: null,
    generated_at: null,
  })
  if (!cleared) {
    return NextResponse.json({ error: "Not Found", id }, { status: 404 })
  }
  const entry = await store.enqueueGeneration(id)
  return NextResponse.json(
    { entry, queued: true, message: "Re-generation queued for Agent N" },
    { status: 202 },
  )
}
