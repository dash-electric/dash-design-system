/**
 * /api/dashboard/requests/[id]
 *
 * GET   detail
 * PATCH update mutable fields (status, severity, notes, etc.)
 *
 * Bearer-gated via DASH_CEO_TOKEN.
 */
import { NextRequest, NextResponse } from "next/server"
import { gateDashboard } from "@/lib/dashboard-auth"
import { getStore } from "@/lib/dashboard-store"
import { validatePatchRequest } from "@/lib/dashboard-validators"

function route(id: string): string {
  return `/api/dashboard/requests/${id}`
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params
  const gate = await gateDashboard(req, route(id))
  if (gate) return gate

  const entry = await getStore().getRequest(id)
  if (!entry) {
    return NextResponse.json({ error: "Not Found", id }, { status: 404 })
  }
  return NextResponse.json({ entry }, { status: 200 })
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params
  const gate = await gateDashboard(req, route(id))
  if (gate) return gate

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const v = validatePatchRequest(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const updated = await getStore().updateRequest(id, v.data)
  if (!updated) {
    return NextResponse.json({ error: "Not Found", id }, { status: 404 })
  }
  return NextResponse.json({ entry: updated }, { status: 200 })
}
