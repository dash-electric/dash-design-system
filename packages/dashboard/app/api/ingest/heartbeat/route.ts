import { type NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { verifyHmac } from "@/lib/hmac";
import {
  push,
  type HeartbeatEvent,
  type HeartbeatStatus,
} from "@/lib/store/heartbeats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingHeartbeat {
  tribe?: unknown;
  app?: unknown;
  instance?: unknown;
  status?: unknown;
  version?: unknown;
  region?: unknown;
  latencyMs?: unknown;
  errorRate?: unknown;
  sentAt?: unknown;
}

/**
 * POST /api/ingest/heartbeat
 *
 * Per TRD §3 row 5. Hand-rolled validation (no zod per banned-deps rule).
 * Body must be JSON; signature is verified against the raw bytes — so we
 * read text first, then parse.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-dash-signature");

  if (!verifyHmac(raw, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let parsed: IncomingHeartbeat;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const errors: string[] = [];
  const tribe = stringField(parsed.tribe, "tribe", errors);
  const app = stringField(parsed.app, "app", errors);
  const instance = stringField(parsed.instance, "instance", errors);
  const status = statusField(parsed.status, errors);
  const sentAt = stringField(parsed.sentAt, "sentAt", errors);

  if (errors.length > 0 || !tribe || !app || !instance || !status || !sentAt) {
    return NextResponse.json(
      { error: "invalid_payload", details: errors },
      { status: 400 },
    );
  }

  const event: HeartbeatEvent = {
    id: randomUUID(),
    tribe,
    app,
    instance,
    status,
    version: optionalString(parsed.version),
    region: optionalString(parsed.region),
    latencyMs: optionalNumber(parsed.latencyMs),
    errorRate: optionalNumber(parsed.errorRate),
    sentAt,
    receivedAt: new Date().toISOString(),
  };

  push(event);

  return NextResponse.json({ ok: true, id: event.id }, { status: 202 });
}

function stringField(v: unknown, name: string, errors: string[]): string | null {
  if (typeof v !== "string" || v.length === 0) {
    errors.push(`${name} must be non-empty string`);
    return null;
  }
  return v;
}

function statusField(v: unknown, errors: string[]): HeartbeatStatus | null {
  if (v === "ok" || v === "degraded" || v === "down") return v;
  errors.push(`status must be one of: ok | degraded | down`);
  return null;
}

function optionalString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function optionalNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
