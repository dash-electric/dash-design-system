/**
 * In-memory heartbeat ring buffer + warm write-through (Turso or local SQLite).
 *
 * Hot path: ring buffer (~5MB cap, oldest-drop). All reads for SSE replay and
 * "current tribe status" snapshot come from this in-process map. Sub-ms.
 *
 * Warm path: optional libSQL client (Turso when TURSO_URL set, else
 * file-based at ~/.dash-dashboard/dev.db). Async writes; failure does not
 * block ingest. Schema is forward-additive per TRD §9.4.
 *
 * Process-local by design — when we scale beyond 1 instance, the ring
 * buffer becomes per-instance and we fan-in via Turso reads (or move to
 * Redis Streams). MVP runs on a single Railway service.
 */

import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type HeartbeatStatus = "ok" | "degraded" | "down";

export interface HeartbeatEvent {
  id: string;
  tribe: string;
  app: string;
  instance: string;
  status: HeartbeatStatus;
  version?: string;
  region?: string;
  latencyMs?: number;
  errorRate?: number;
  sentAt: string; // ISO-8601
  receivedAt: string; // ISO-8601 (server timestamp)
}

export interface TribeStatus {
  tribe: string;
  status: HeartbeatStatus;
  lastSeen: string;
  instances: number;
  apps: string[];
  errorRate?: number;
}

// ----- Ring buffer ----------------------------------------------------------

const RING_CAP = 5000;
const ring: HeartbeatEvent[] = [];

// Per-tribe latest snapshot. Source of truth for `/api/v1/health/tribes`.
const tribeLatest = new Map<string, HeartbeatEvent[]>();

// Per-connection SSE subscribers. The /api/v1/stream route registers a
// callback here; we fan out on push().
type Subscriber = (event: HeartbeatEvent) => void;
const subscribers = new Set<Subscriber>();

export function subscribe(cb: Subscriber): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export function recentEvents(sinceId?: string): HeartbeatEvent[] {
  if (!sinceId) return ring.slice(-200);
  const idx = ring.findIndex((e) => e.id === sinceId);
  if (idx === -1) return ring.slice(-200);
  return ring.slice(idx + 1);
}

export function tribeSnapshot(): TribeStatus[] {
  const out: TribeStatus[] = [];
  for (const [tribe, events] of tribeLatest.entries()) {
    if (events.length === 0) continue;
    // Worst-of status across instances surfaces the issue.
    const worst = events.reduce<HeartbeatEvent>((acc, e) => {
      if (statusRank(e.status) > statusRank(acc.status)) return e;
      return acc;
    }, events[0]);
    const apps = Array.from(new Set(events.map((e) => e.app))).sort();
    const lastSeen = events.reduce(
      (acc, e) => (e.receivedAt > acc ? e.receivedAt : acc),
      events[0].receivedAt,
    );
    const errorRates = events
      .map((e) => e.errorRate)
      .filter((v): v is number => typeof v === "number");
    const avgErr = errorRates.length
      ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length
      : undefined;
    out.push({
      tribe,
      status: worst.status,
      lastSeen,
      instances: events.length,
      apps,
      errorRate: avgErr,
    });
  }
  return out.sort((a, b) => a.tribe.localeCompare(b.tribe));
}

function statusRank(s: HeartbeatStatus): number {
  if (s === "down") return 2;
  if (s === "degraded") return 1;
  return 0;
}

export function push(event: HeartbeatEvent): void {
  ring.push(event);
  if (ring.length > RING_CAP) ring.shift();

  // Replace the entry for this (tribe, instance); keep one row per instance.
  const list = tribeLatest.get(event.tribe) ?? [];
  const filtered = list.filter(
    (e) => !(e.app === event.app && e.instance === event.instance),
  );
  filtered.push(event);
  tribeLatest.set(event.tribe, filtered);

  for (const sub of subscribers) {
    try {
      sub(event);
    } catch {
      // Subscriber failure must not block ingest.
    }
  }

  // Best-effort warm write.
  void warmWrite(event);
}

// ----- Warm store (Turso or local SQLite) -----------------------------------

let warmClient: Client | null | undefined; // undefined = not yet initialized

function warmInit(): Client | null {
  if (warmClient !== undefined) return warmClient;

  const turso = process.env.TURSO_URL;
  if (turso) {
    warmClient = createClient({
      url: turso,
      authToken: process.env.TURSO_TOKEN,
    });
  } else {
    const dir = join(homedir(), ".dash-dashboard");
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
      // Best effort — ENOENT etc.
    }
    warmClient = createClient({ url: `file:${join(dir, "dev.db")}` });
  }

  void ensureSchema(warmClient);
  return warmClient;
}

async function ensureSchema(client: Client): Promise<void> {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS heartbeats (
        id TEXT PRIMARY KEY,
        tribe TEXT NOT NULL,
        app TEXT NOT NULL,
        instance TEXT NOT NULL,
        status TEXT NOT NULL,
        version TEXT,
        region TEXT,
        latency_ms REAL,
        error_rate REAL,
        sent_at TEXT NOT NULL,
        received_at TEXT NOT NULL
      )
    `);
    await client.execute(
      `CREATE INDEX IF NOT EXISTS idx_heartbeats_tribe_received
       ON heartbeats(tribe, received_at DESC)`,
    );
  } catch (err) {
    // Schema errors are logged but non-fatal — hot path keeps working.
    console.error("[dashboard] heartbeats schema init failed", err);
  }
}

async function warmWrite(event: HeartbeatEvent): Promise<void> {
  const client = warmInit();
  if (!client) return;
  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO heartbeats
        (id, tribe, app, instance, status, version, region, latency_ms, error_rate, sent_at, received_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        event.id,
        event.tribe,
        event.app,
        event.instance,
        event.status,
        event.version ?? null,
        event.region ?? null,
        event.latencyMs ?? null,
        event.errorRate ?? null,
        event.sentAt,
        event.receivedAt,
      ],
    });
  } catch (err) {
    console.error("[dashboard] heartbeat warm write failed", err);
  }
}
