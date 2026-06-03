/**
 * /api/dashboard/requests
 *
 * GET    list (filterable via ?status=&severity=&repo=)
 * POST   create single OR bulk (if body has `entries`, treated as bulk)
 * DELETE bulk delete by body { ids: string[] }
 *
 * Bearer-gated via DASH_CEO_TOKEN. Audit-logged on every hit.
 */
import { NextRequest, NextResponse } from "next/server"
import { gateDashboard } from "@/lib/dashboard-auth"
import { getStore } from "@/lib/dashboard-store"
import {
  parseListFilter,
  validateBulkCreateBody,
  validateCreateRequest,
  validateDeleteBody,
} from "@/lib/dashboard-validators"

const ROUTE = "/api/dashboard/requests"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const gate = await gateDashboard(req, ROUTE)
  if (gate) return gate

  const filter = parseListFilter(req.nextUrl.searchParams)
  const store = getStore()
  const entries = await store.getRequests(filter)
  return NextResponse.json({ entries, count: entries.length }, { status: 200 })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const gate = await gateDashboard(req, ROUTE)
  if (gate) return gate

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }

  // Bulk mode: body shape `{ entries: GapEntry[] }`. Used by `dashkit gap sync`.
  if (body && typeof body === "object" && "entries" in (body as object)) {
    const v = validateBulkCreateBody(body)
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
    const store = getStore()
    const created = []
    for (const entry of v.data) {
      created.push(await store.createRequest(entry))
    }
    return NextResponse.json(
      { created, count: created.length },
      { status: 201 },
    )
  }

  // Single create.
  const v = validateCreateRequest(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
  const store = getStore()
  const entry = await store.createRequest(v.data)
  return NextResponse.json({ entry }, { status: 201 })
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const gate = await gateDashboard(req, ROUTE)
  if (gate) return gate

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const v = validateDeleteBody(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const store = getStore()
  const removed = await store.deleteRequests(v.data)
  return NextResponse.json({ removed }, { status: 200 })
}
