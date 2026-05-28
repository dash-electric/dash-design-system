"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeartbeatStatus, TribeStatus } from "@/lib/store/heartbeats";

interface TribeHealthLiveProps {
  initial: TribeStatus[];
}

interface IncomingHeartbeat {
  id: string;
  tribe: string;
  app: string;
  instance: string;
  status: HeartbeatStatus;
  errorRate?: number;
  receivedAt: string;
}

/**
 * Subscribes to /api/v1/stream?topics=heartbeat and merges incoming events
 * into the per-tribe map. Worst-of status wins. Last-seen ticks every 5s
 * via a render heartbeat so the "Xs ago" text stays live without polling.
 */
export function TribeHealthLive({ initial }: TribeHealthLiveProps) {
  const [tribes, setTribes] = useState<Map<string, TribeStatus>>(() => {
    const m = new Map<string, TribeStatus>();
    for (const t of initial) m.set(t.tribe, t);
    return m;
  });
  const [now, setNow] = useState<number>(() => Date.now());
  const [streamState, setStreamState] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );

  useEffect(() => {
    const es = new EventSource("/api/v1/stream?topics=heartbeat");
    es.onopen = () => setStreamState("open");
    es.onerror = () => setStreamState("closed");
    es.addEventListener("heartbeat", (evt) => {
      let data: IncomingHeartbeat;
      try {
        data = JSON.parse((evt as MessageEvent).data);
      } catch {
        return;
      }
      setTribes((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.tribe);
        // Worst-of status wins for a tribe across its instances.
        const status: HeartbeatStatus =
          existing && rank(existing.status) > rank(data.status)
            ? existing.status
            : data.status;
        const apps = existing
          ? Array.from(new Set([...existing.apps, data.app])).sort()
          : [data.app];
        next.set(data.tribe, {
          tribe: data.tribe,
          status,
          lastSeen: data.receivedAt,
          instances: existing ? Math.max(existing.instances, 1) : 1,
          apps,
          errorRate: data.errorRate ?? existing?.errorRate,
        });
        return next;
      });
    });

    const tick = setInterval(() => setNow(Date.now()), 5_000);

    return () => {
      es.close();
      clearInterval(tick);
    };
  }, []);

  const sorted = useMemo(
    () => Array.from(tribes.values()).sort((a, b) => a.tribe.localeCompare(b.tribe)),
    [tribes],
  );

  if (sorted.length === 0) {
    return <EmptyState streamState={streamState} />;
  }

  return (
    <div
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 8,
      }}
    >
      {sorted.map((t) => (
        <TribeCard key={t.tribe} tribe={t} now={now} />
      ))}
    </div>
  );
}

function TribeCard({ tribe, now }: { tribe: TribeStatus; now: number }) {
  const ago = relativeAgo(new Date(tribe.lastSeen).getTime(), now);
  return (
    <article
      role="listitem"
      style={{
        border: "1px solid var(--border-soft)",
        borderRadius: 6,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        background: "var(--bg-subtle)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <strong style={{ fontSize: 12, color: "var(--text-strong)" }}>
          {tribe.tribe}
        </strong>
        <StatusBadge status={tribe.status} />
      </div>
      <div style={{ fontSize: 11, color: "var(--text-sub)" }}>
        {tribe.apps.length} app{tribe.apps.length === 1 ? "" : "s"} ·{" "}
        {tribe.instances} instance{tribe.instances === 1 ? "" : "s"}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
        last seen {ago}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: HeartbeatStatus }) {
  const palette = {
    ok: { fg: "var(--state-ok-fg)", bg: "var(--state-ok-bg)", label: "ok" },
    degraded: {
      fg: "var(--state-warn-fg)",
      bg: "var(--state-warn-bg)",
      label: "degraded",
    },
    down: { fg: "var(--state-down-fg)", bg: "var(--state-down-bg)", label: "down" },
  }[status];

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        padding: "2px 6px",
        borderRadius: "var(--radius-pill)",
        color: palette.fg,
        background: palette.bg,
      }}
    >
      {palette.label}
    </span>
  );
}

function EmptyState({ streamState }: { streamState: "connecting" | "open" | "closed" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "32px 16px",
        textAlign: "center",
        color: "var(--text-sub)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-body)" }}>
        0 tribes registered
      </div>
      <div style={{ fontSize: 11 }}>
        Waiting for heartbeats on{" "}
        <code style={{ fontSize: 11 }}>POST /api/ingest/heartbeat</code>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-soft)" }}>
        stream: {streamState}
      </div>
    </div>
  );
}

function rank(s: HeartbeatStatus): number {
  if (s === "down") return 2;
  if (s === "degraded") return 1;
  return 0;
}

function relativeAgo(then: number, now: number): string {
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}
