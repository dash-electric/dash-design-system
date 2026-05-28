import type { NextRequest } from "next/server";
import { recentEvents, subscribe, type HeartbeatEvent } from "@/lib/store/heartbeats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/stream?topics=heartbeat&since=<eventId>
 *
 * Server-Sent Events. MVP supports only the `heartbeat` topic; other topics
 * (runs, incidents) are stubbed and accepted for forward compatibility but
 * emit no frames.
 *
 * Per TRD §7 F7: emit a comment-frame keepalive every 15s so proxies do not
 * idle-close the connection.
 */
export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const topics = (url.searchParams.get("topics") ?? "heartbeat")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const since = url.searchParams.get("since") ?? undefined;
  const wantsHeartbeat = topics.includes("heartbeat");

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: HeartbeatEvent) => {
        const frame =
          `event: heartbeat\n` +
          `data: ${JSON.stringify(event)}\n` +
          `id: ${event.id}\n\n`;
        try {
          controller.enqueue(encoder.encode(frame));
        } catch {
          // Stream may be closed; nothing to do.
        }
      };

      if (wantsHeartbeat) {
        // Replay from the hot ring buffer first.
        for (const ev of recentEvents(since)) send(ev);
      }

      const unsubscribe = wantsHeartbeat ? subscribe(send) : () => undefined;

      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          /* closed */
        }
      }, 15_000);

      const onAbort = () => {
        clearInterval(keepalive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable proxy buffering (nginx, Railway edge)
    },
  });
}
