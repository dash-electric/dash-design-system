import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  parseRunFile,
  parseRunText,
  serializeRun,
  streamRunFile,
  writeRunFile,
} from "../src/replay.js";
import { validateRun } from "../src/validators.js";
import {
  eventToSseFrame,
  parseSseFrame,
  parseSseStream,
  sseKeepalive,
} from "../src/wire.js";
import {
  redactEvent,
  redactString,
  truncate,
} from "../src/redact.js";
import { sampleRun } from "./fixtures.js";

let workdir: string;

beforeEach(async () => {
  workdir = await mkdtemp(join(tmpdir(), "aop-schema-test-"));
});

afterEach(async () => {
  await rm(workdir, { recursive: true, force: true });
});

describe("replay JSONL round-trip", () => {
  it("serializeRun produces one envelope per LF-terminated line", () => {
    const text = serializeRun(sampleRun);
    const lines = text.split("\n").filter((l) => l.length > 0);
    expect(lines.length).toBe(sampleRun.length);
    expect(text.endsWith("\n")).toBe(true);
  });

  it("write -> read -> validate round-trip via parseRunFile", async () => {
    const path = join(workdir, "run.jsonl");
    await writeRunFile(path, sampleRun);

    const events = await parseRunFile(path);
    expect(events).toEqual(sampleRun);

    const report = validateRun(events);
    expect(report.ok, JSON.stringify(report.errors)).toBe(true);
  });

  it("streamRunFile yields envelopes lazily", async () => {
    const path = join(workdir, "run.jsonl");
    await writeRunFile(path, sampleRun);

    const collected = [];
    for await (const ev of streamRunFile(path)) collected.push(ev);
    expect(collected).toEqual(sampleRun);
  });

  it("parseRunText skips blank trailing lines", () => {
    const text = serializeRun(sampleRun) + "\n\n";
    const events = parseRunText(text);
    expect(events.length).toBe(sampleRun.length);
  });

  it("parseRunText throws on invalid JSON line", () => {
    const text = serializeRun(sampleRun.slice(0, 1)) + "{not json\n";
    expect(() => parseRunText(text)).toThrow(/invalid JSON/);
  });
});

describe("wire SSE frames", () => {
  it("eventToSseFrame matches the spec frame layout", () => {
    const frame = eventToSseFrame(sampleRun[0]!);
    expect(frame.startsWith("event: aop\n")).toBe(true);
    expect(frame).toContain(`id: ${sampleRun[0]!.seq}\n`);
    expect(frame).toContain(`data: ${JSON.stringify(sampleRun[0])}`);
    expect(frame.endsWith("\n\n")).toBe(true);
  });

  it("frame round-trip: encode then parse equals original", () => {
    for (const ev of sampleRun) {
      const parsed = parseSseFrame(eventToSseFrame(ev));
      expect(parsed).toEqual(ev);
    }
  });

  it("parseSseFrame returns null on keepalive comment", () => {
    expect(parseSseFrame(sseKeepalive())).toBeNull();
  });

  it("parseSseStream returns multiple envelopes from a chunk", () => {
    const chunk = sampleRun.map(eventToSseFrame).join("");
    const back = parseSseStream(chunk);
    expect(back).toEqual(sampleRun);
  });

  it("ignores non-aop event types", () => {
    const otherEvent = "event: ping\ndata: 1\n\n";
    expect(parseSseFrame(otherEvent)).toBeNull();
  });
});

describe("redaction", () => {
  it("redacts OpenAI keys, GitHub tokens, and bearer auth", () => {
    const input =
      "leak sk-AbCdEf0123456789ABCDEFGH and ghp_AbCdEf0123456789ABCDEFGH and Bearer abc.def-XYZ";
    const out = redactString(input);
    expect(out).not.toContain("sk-AbCdEf");
    expect(out).not.toContain("ghp_AbCdEf");
    expect(out).toContain("sk-***REDACTED");
    expect(out).toContain("ghp_***REDACTED");
    expect(out).toContain("Bearer ***REDACTED");
  });

  it("masks email local-part", () => {
    expect(redactString("contact me at irfan@dash.com please")).toBe(
      "contact me at ***@dash.com please",
    );
  });

  it("truncate adds spec marker beyond cap", () => {
    const big = "x".repeat(5000);
    const out = truncate(big, 100);
    expect(out.startsWith("x".repeat(100))).toBe(true);
    expect(out).toContain("…[truncated:5000 bytes]");
  });

  it("redactEvent drops snippet for .env scans", () => {
    const ev = JSON.parse(JSON.stringify(sampleRun[2]));
    ev.payload.paths = ["apps/web/.env"];
    ev.payload.snippet = "OPENAI_KEY=sk-AbCdEf0123456789ABCDEFGH";
    const out = redactEvent(ev);
    if (out.type === "scan") expect(out.payload.snippet).toBeUndefined();
  });

  it("redactEvent leaves run.end summary untouched", () => {
    const out = redactEvent(sampleRun[9]!);
    expect(out).toEqual(sampleRun[9]);
  });
});
