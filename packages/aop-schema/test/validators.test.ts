import { describe, expect, it } from "vitest";

import {
  validateAOPEvent,
  validateArtifact,
  validateCost,
  validateDecision,
  validateError,
  validateRun,
  validateRunEnd,
  validateRunStart,
  validateScan,
  validateThinking,
  validateValidate,
} from "../src/validators.js";
import { sampleRun, SAMPLE_RUN_ID } from "./fixtures.js";

describe("envelope validators", () => {
  it("validateRunStart accepts the spec sample", () => {
    const r = validateRunStart(sampleRun[0]);
    expect(r.ok).toBe(true);
  });

  it("validateRunStart rejects missing budget", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[0]));
    delete bad.payload.budget;
    const r = validateRunStart(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.path.includes("budget"))).toBe(true);
    }
  });

  it("validateRunStart rejects bad ULID", () => {
    const bad = { ...sampleRun[0]!, runId: "not-a-ulid" };
    const r = validateRunStart(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]!.path).toBe("runId");
  });

  it("validateThinking accepts reason/hypothesis/risk", () => {
    expect(validateThinking(sampleRun[1]).ok).toBe(true);
    const hypo = { ...sampleRun[1]!, payload: { kind: "hypothesis", md: "x" } };
    expect(validateThinking(hypo).ok).toBe(true);
  });

  it("validateThinking rejects bad kind", () => {
    const bad = { ...sampleRun[1]!, payload: { kind: "guess", md: "x" } };
    const r = validateThinking(bad);
    expect(r.ok).toBe(false);
  });

  it("validateScan accepts file and registry kinds", () => {
    expect(validateScan(sampleRun[2]).ok).toBe(true);
    expect(validateScan(sampleRun[3]).ok).toBe(true);
  });

  it("validateScan rejects empty paths array", () => {
    const bad = { ...sampleRun[2]!, payload: { kind: "file", paths: [], bytesRead: 0 } };
    expect(validateScan(bad).ok).toBe(false);
  });

  it("validateDecision accepts spec sample", () => {
    expect(validateDecision(sampleRun[4]).ok).toBe(true);
  });

  it("validateDecision rejects picked that's not in candidates", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[4]));
    bad.payload.picked = "Ghost";
    const r = validateDecision(bad);
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.errors.some((e) => e.path === "payload.picked")).toBe(true);
  });

  it("validateDecision rejects score outside [0,1]", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[4]));
    bad.payload.candidates[0].score = 1.5;
    const r = validateDecision(bad);
    expect(r.ok).toBe(false);
  });

  it("validateArtifact accepts spec sample", () => {
    expect(validateArtifact(sampleRun[6]).ok).toBe(true);
    expect(validateArtifact(sampleRun[7]).ok).toBe(true);
  });

  it("validateArtifact rejects leading-slash path", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[6]));
    bad.payload.path = "/etc/passwd";
    const r = validateArtifact(bad);
    expect(r.ok).toBe(false);
  });

  it("validateArtifact rejects parent-dir escape", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[6]));
    bad.payload.path = "../../etc/passwd";
    expect(validateArtifact(bad).ok).toBe(false);
  });

  it("validateValidate accepts spec sample", () => {
    expect(validateValidate(sampleRun[8]).ok).toBe(true);
  });

  it("validateValidate rejects bad status enum", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[8]));
    bad.payload.checks[0].status = "maybe";
    expect(validateValidate(bad).ok).toBe(false);
  });

  it("validateCost accepts spec sample", () => {
    expect(validateCost(sampleRun[5]).ok).toBe(true);
  });

  it("validateCost rejects negative usd", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[5]));
    bad.payload.usd = -1;
    expect(validateCost(bad).ok).toBe(false);
  });

  it("validateError happy path", () => {
    const err = {
      v: "1.0.0",
      type: "error",
      runId: SAMPLE_RUN_ID,
      seq: 1,
      ts: "2026-05-28T03:11:00.000Z",
      payload: {
        code: "REGISTRY_FETCH_FAILED",
        message: "timeout",
        recoverable: true,
        retryCount: 1,
      },
    };
    expect(validateError(err).ok).toBe(true);
  });

  it("validateError rejects missing code", () => {
    const bad = {
      v: "1.0.0",
      type: "error",
      runId: SAMPLE_RUN_ID,
      seq: 1,
      ts: "2026-05-28T03:11:00.000Z",
      payload: { message: "x", recoverable: true },
    };
    expect(validateError(bad).ok).toBe(false);
  });

  it("validateRunEnd accepts spec sample", () => {
    expect(validateRunEnd(sampleRun[9]).ok).toBe(true);
  });

  it("validateRunEnd requires reason when status != success", () => {
    const bad = JSON.parse(JSON.stringify(sampleRun[9]));
    bad.payload.status = "failed";
    delete bad.payload.reason;
    expect(validateRunEnd(bad).ok).toBe(false);
  });
});

describe("dispatcher validateAOPEvent", () => {
  it("dispatches by type discriminator for all 9 events", () => {
    for (const ev of sampleRun) {
      const r = validateAOPEvent(ev);
      expect(r.ok, `${ev.type} should validate`).toBe(true);
    }
  });

  it("rejects unknown type", () => {
    const r = validateAOPEvent({ ...sampleRun[0]!, type: "nope" });
    expect(r.ok).toBe(false);
  });
});

describe("validateRun (run-level invariants)", () => {
  it("accepts the spec sample run", () => {
    const r = validateRun(sampleRun);
    expect(r.ok, JSON.stringify(r.errors)).toBe(true);
    expect(r.count).toBe(10);
  });

  it("rejects when first event isn't run.start", () => {
    const bad = [...sampleRun.slice(1), sampleRun[0]!];
    const r = validateRun(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects gaps in seq", () => {
    const cloned = JSON.parse(JSON.stringify(sampleRun));
    cloned[5].seq = 99;
    const r = validateRun(cloned);
    expect(r.ok).toBe(false);
  });

  it("rejects mismatched runId", () => {
    const cloned = JSON.parse(JSON.stringify(sampleRun));
    cloned[3].runId = "01JOTHER0000000000000000Z0";
    const r = validateRun(cloned);
    expect(r.ok).toBe(false);
  });

  it("rejects when totalUsd doesn't reconcile with last cumulativeUsd", () => {
    const cloned = JSON.parse(JSON.stringify(sampleRun));
    cloned[9].payload.summary.totalUsd = 99;
    const r = validateRun(cloned);
    expect(r.ok).toBe(false);
  });

  it("rejects empty run", () => {
    expect(validateRun([]).ok).toBe(false);
  });
});
