/**
 * POST /api/dashboard/requests/[id]/generate
 *
 * Marks an entry as `processing` and queues it for Agent N (the generation
 * worker). Agent N polls `data/dashboard/pending-generation.json` for the
 * list of ids to act on; this endpoint is the producer side.
 *
 * Returns 202 Accepted because the actual generation runs out-of-band.
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
    `/api/dashboard/requests/${id}/generate`,
  )
  if (gate) return gate

  const entry = await getStore().enqueueGeneration(id)
  if (!entry) {
    return NextResponse.json({ error: "Not Found", id }, { status: 404 })
  }
  return NextResponse.json(
    { entry, queued: true, message: "Generation queued for Agent N" },
    { status: 202 },
  )
}
