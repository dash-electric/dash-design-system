/**
 * JSONL replay helpers for AOP run files.
 *
 * Spec: `~/.dash-build/runs/<runId>.jsonl` — one envelope per line, UTF-8,
 * LF terminator. First line MUST be `run.start`, last `run.end`.
 *
 * Both helpers parse but DO NOT enforce run-level invariants — call
 * `validateRun()` from `./validators` on the result for that.
 */

import { createReadStream, promises as fsp } from "node:fs";
import { createInterface } from "node:readline";
import type { AOPEvent } from "./types.js";

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ReplayParseError extends Error {
  constructor(
    message: string,
    public readonly lineNumber: number,
    public readonly raw: string,
  ) {
    super(`${message} (line ${lineNumber})`);
    this.name = "ReplayParseError";
  }
}

function parseLine(raw: string, lineNumber: number): AOPEvent {
  if (raw.length === 0) {
    throw new ReplayParseError("empty line", lineNumber, raw);
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ReplayParseError(`invalid JSON: ${msg}`, lineNumber, raw);
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new ReplayParseError("not an object", lineNumber, raw);
  }
  return json as AOPEvent;
}

// ---------------------------------------------------------------------------
// Eager: load whole file
// ---------------------------------------------------------------------------

/**
 * Read an AOP JSONL file fully into memory and return an array of envelopes.
 * Skips blank trailing lines but reports any malformed line.
 */
export async function parseRunFile(path: string): Promise<AOPEvent[]> {
  const text = await fsp.readFile(path, "utf8");
  return parseRunText(text);
}

/** Sync variant of `parseRunFile` for tooling that can't go async. */
export function parseRunText(text: string): AOPEvent[] {
  const lines = text.split(/\r?\n/);
  const events: AOPEvent[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.length === 0) continue;
    events.push(parseLine(raw, i + 1));
  }
  return events;
}

// ---------------------------------------------------------------------------
// Lazy: stream line-by-line
// ---------------------------------------------------------------------------

/**
 * Stream an AOP JSONL file as an async iterable of envelopes. Lets large
 * traces be processed without loading the whole file into memory.
 */
export async function* streamRunFile(
  path: string,
): AsyncIterable<AOPEvent> {
  const stream = createReadStream(path, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const raw of rl) {
    lineNumber++;
    if (raw.length === 0) continue;
    yield parseLine(raw, lineNumber);
  }
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

/** Serialise events to JSONL text (LF-terminated, trailing newline). */
export function serializeRun(events: readonly AOPEvent[]): string {
  return events.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

/** Write a complete run to disk (atomic-style: temp file then rename). */
export async function writeRunFile(
  path: string,
  events: readonly AOPEvent[],
): Promise<void> {
  const tmp = `${path}.partial`;
  await fsp.writeFile(tmp, serializeRun(events), "utf8");
  await fsp.rename(tmp, path);
}
