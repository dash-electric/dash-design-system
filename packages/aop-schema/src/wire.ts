/**
 * SSE wire-format helpers for the "Hot" channel.
 *
 * Spec frame layout (per envelope):
 *
 *   event: aop
 *   id: <seq>
 *   data: <JSON-stringified envelope>
 *   \n
 *
 * No batching, single `event: aop` per envelope. `id` mirrors `seq` so
 * clients can resume via `Last-Event-ID`. A `: keepalive` comment is sent
 * every 15 s, but that's daemon-loop concern, not encoded here.
 */

import { AOPProtocolHeader, AOPVersion } from "./types.js";
import type { AOPEvent } from "./types.js";

export const SSE_EVENT_NAME = "aop" as const;

/** HTTP headers a server should emit on the SSE response. */
export const SSE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  [AOPProtocolHeader]: AOPVersion,
});

/**
 * Serialise one envelope into the spec's SSE frame. Includes the trailing
 * blank line that terminates a single SSE message.
 */
export function eventToSseFrame(event: AOPEvent): string {
  const data = JSON.stringify(event);
  return (
    `event: ${SSE_EVENT_NAME}\n` +
    `id: ${event.seq}\n` +
    `data: ${data}\n\n`
  );
}

/** SSE comment for keepalive. */
export function sseKeepalive(): string {
  return ": keepalive\n\n";
}

/**
 * Parse a single SSE frame back into an envelope. Returns `null` if the frame
 * isn't an `event: aop` message (e.g. keepalive comment).
 *
 * Strict: ignores frames whose `event:` line isn't `aop`. Throws if the
 * `data:` payload is non-JSON.
 */
export function parseSseFrame(frame: string): AOPEvent | null {
  const lines = frame.split(/\r?\n/);
  let eventName: string | null = null;
  const dataLines: string[] = [];

  for (const raw of lines) {
    if (raw.length === 0) continue;
    if (raw.startsWith(":")) continue; // comment, e.g. keepalive
    const sep = raw.indexOf(":");
    if (sep === -1) continue;
    const field = raw.slice(0, sep);
    // SSE allows " " after the colon; strip a single leading space if present.
    let value = raw.slice(sep + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    switch (field) {
      case "event":
        eventName = value;
        break;
      case "data":
        dataLines.push(value);
        break;
      // Ignore "id" and "retry" — `id` is mirrored from seq anyway.
    }
  }

  if (eventName !== SSE_EVENT_NAME) return null;
  if (dataLines.length === 0) return null;

  // SSE multi-line `data:` joins with literal "\n".
  const data = dataLines.join("\n");
  const parsed = JSON.parse(data) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("SSE data is not an object envelope");
  }
  return parsed as AOPEvent;
}

/**
 * Parse a concatenated SSE stream chunk (possibly containing multiple
 * frames) into an array of envelopes. Useful for tests and for buffered
 * fetch-based clients.
 */
export function parseSseStream(text: string): AOPEvent[] {
  // SSE frames are separated by a blank line (two consecutive newlines).
  const frames = text.split(/\r?\n\r?\n/).filter((f) => f.length > 0);
  const out: AOPEvent[] = [];
  for (const frame of frames) {
    const ev = parseSseFrame(frame + "\n\n");
    if (ev !== null) out.push(ev);
  }
  return out;
}
