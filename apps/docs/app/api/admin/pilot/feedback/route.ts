import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "@/app/api/registry/_auth"

/**
 * POST /api/admin/pilot/feedback
 *
 * Bearer-gated ingest endpoint for `dashkit feedback sync`. Appends each
 * incoming entry as one JSONL line to `pilot-feedback.jsonl`. Idempotent
 * on `id` — entries already present are skipped.
 *
 * Body shape:
 *   { entries: FeedbackEntry[] }
 *
 * Response:
 *   { accepted: N, skipped: N }
 */

const FEEDBACK_FILE = path.join(process.cwd(), "pilot-feedback.jsonl")

type FeedbackEntry = {
  id: string
  timestamp: string
  pilot: string
  pe: string
  category: string
  text: string
  severity?: string
  context?: { command?: string; component?: string; repo?: string }
  status?: string
}

function isFeedbackEntry(v: unknown): v is FeedbackEntry {
  if (!v || typeof v !== "object") return false
  const r = v as Partial<FeedbackEntry>
  return (
    typeof r.id === "string" &&
    typeof r.timestamp === "string" &&
    typeof r.pe === "string" &&
    typeof r.text === "string" &&
    typeof r.category === "string"
  )
}

async function existingIds(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8")
    const ids = new Set<string>()
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const obj = JSON.parse(trimmed) as { id?: string }
        if (obj && typeof obj.id === "string") ids.add(obj.id)
      } catch {
        /* skip malformed */
      }
    }
    return ids
  } catch {
    return new Set()
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "expected object body" }, { status: 400 })
  }

  const entries = (body as { entries?: unknown }).entries
  if (!Array.isArray(entries)) {
    return NextResponse.json(
      { error: "missing entries[] in body" },
      { status: 400 },
    )
  }

  const valid = entries.filter(isFeedbackEntry)
  if (valid.length === 0) {
    return NextResponse.json({ accepted: 0, skipped: entries.length })
  }

  const known = await existingIds()
  const fresh = valid.filter((e) => !known.has(e.id))

  if (fresh.length > 0) {
    const dir = path.dirname(FEEDBACK_FILE)
    await fs.mkdir(dir, { recursive: true })
    const blob = fresh.map((e) => JSON.stringify({ ...e, status: "synced" })).join("\n") + "\n"
    await fs.appendFile(FEEDBACK_FILE, blob, "utf-8")
  }

  return NextResponse.json({
    accepted: fresh.length,
    skipped: entries.length - fresh.length,
  })
}
