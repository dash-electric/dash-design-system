import { NextResponse } from "next/server";
import { tribeSnapshot } from "@/lib/store/heartbeats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/v1/health/tribes — current tribe status snapshot. */
export async function GET() {
  const tribes = tribeSnapshot();
  return NextResponse.json(
    { tribes },
    {
      headers: {
        // TRD §6.1 — private 5s.
        "Cache-Control": "private, max-age=5",
      },
    },
  );
}
