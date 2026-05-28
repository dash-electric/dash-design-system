/**
 * Pure-JS validators for AOP envelopes. Zero deps.
 *
 * Every validator returns a `ValidationResult` shape rather than throwing —
 * callers can decide whether a malformed event is fatal (replay) or
 * just-skip (live stream).
 *
 * For convenience we also expose `validateAOPEvent`, a dispatcher that
 * picks the right validator from the `type` discriminator.
 *
 * For run-level invariants (monotonic seq, matching runId, cost reconciliation,
 * etc.) see `validateRun` which mirrors the eight rules in the spec's
 * "Validator behavior" section.
 */

import {
  AOPVersion,
  type AOPEvent,
  type AOPEventByType,
  type AOPEventType,
  type ArtifactEvent,
  type ArtifactOp,
  type CostCall,
  type CostEvent,
  type DecisionEvent,
  type ErrorEvent,
  type RunEndEvent,
  type RunEndStatus,
  type RunStartEvent,
  type RunStartInitiator,
  type AOPProvider,
  type ScanEvent,
  type ScanKind,
  type Severity,
  type ThinkingEvent,
  type ThinkingKind,
  type ValidateEvent,
  type ValidateOverall,
  type ValidateScope,
  type ValidateStatus,
} from "./types.js";
import {
  ISO_TIMESTAMP_PATTERN,
  ULID_PATTERN,
} from "./schemas.js";

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

export interface ValidationError {
  /** Dotted path into the event ("payload.budget.maxUsd"). */
  path: string;
  /** Human-readable explanation. */
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

const ULID_RE = new RegExp(ULID_PATTERN);
const TIMESTAMP_RE = new RegExp(ISO_TIMESTAMP_PATTERN);

// ---------------------------------------------------------------------------
// Tiny assertion DSL
// ---------------------------------------------------------------------------

class Checker {
  errors: ValidationError[] = [];

  push(path: string, message: string): void {
    this.errors.push({ path, message });
  }

  isObject(value: unknown, path: string): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      this.push(path, "expected object");
      return false;
    }
    return true;
  }

  isString(value: unknown, path: string): value is string {
    if (typeof value !== "string") {
      this.push(path, "expected string");
      return false;
    }
    return true;
  }

  isNonEmptyString(value: unknown, path: string): value is string {
    if (typeof value !== "string" || value.length === 0) {
      this.push(path, "expected non-empty string");
      return false;
    }
    return true;
  }

  isNumber(value: unknown, path: string): value is number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      this.push(path, "expected finite number");
      return false;
    }
    return true;
  }

  isInteger(value: unknown, path: string, min = 0): value is number {
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < min
    ) {
      this.push(path, `expected integer >= ${min}`);
      return false;
    }
    return true;
  }

  isBoolean(value: unknown, path: string): value is boolean {
    if (typeof value !== "boolean") {
      this.push(path, "expected boolean");
      return false;
    }
    return true;
  }

  isArray(value: unknown, path: string): value is unknown[] {
    if (!Array.isArray(value)) {
      this.push(path, "expected array");
      return false;
    }
    return true;
  }

  isEnum<E extends string>(
    value: unknown,
    path: string,
    allowed: readonly E[],
  ): value is E {
    if (typeof value !== "string" || !allowed.includes(value as E)) {
      this.push(path, `expected one of ${allowed.join(" | ")}`);
      return false;
    }
    return true;
  }

  matches(value: unknown, path: string, re: RegExp, label: string): boolean {
    if (typeof value !== "string" || !re.test(value)) {
      this.push(path, `expected ${label}`);
      return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// Envelope head check
// ---------------------------------------------------------------------------

function checkEnvelope<T extends AOPEventType>(
  event: unknown,
  expectedType: T,
  c: Checker,
): event is { payload: unknown } & Record<string, unknown> {
  if (!c.isObject(event, "")) return false;
  if (event.v !== AOPVersion) {
    c.push("v", `expected protocol version "${AOPVersion}"`);
  }
  if (event.type !== expectedType) {
    c.push("type", `expected "${expectedType}"`);
  }
  c.matches(event.runId, "runId", ULID_RE, "ULID");
  c.isInteger(event.seq, "seq", 0);
  c.matches(event.ts, "ts", TIMESTAMP_RE, "ISO-8601 UTC ms timestamp");
  if (!("payload" in event)) c.push("payload", "missing");
  return true;
}

// ---------------------------------------------------------------------------
// Per-event-type payload checks
// ---------------------------------------------------------------------------

const PROVIDERS: readonly AOPProvider[] = [
  "openai",
  "anthropic",
  "codex-local",
];
const INITIATORS: readonly RunStartInitiator[] = [
  "cli",
  "api",
  "schedule",
  "webhook",
];
const THINKING_KINDS: readonly ThinkingKind[] = [
  "reason",
  "hypothesis",
  "risk",
];
const SCAN_KINDS: readonly ScanKind[] = ["file", "dep", "type", "registry"];
const ARTIFACT_OPS: readonly ArtifactOp[] = ["create", "edit", "delete"];
const VALIDATE_STATUSES: readonly ValidateStatus[] = [
  "pass",
  "fail",
  "skip",
  "warn",
];
const VALIDATE_OVERALL: readonly ValidateOverall[] = ["pass", "fail", "warn"];
const VALIDATE_SCOPES: readonly ValidateScope[] = ["file", "package", "repo"];
const COST_CALLS: readonly CostCall[] = [
  "completion",
  "embedding",
  "tool",
  "vision",
];
const SEVERITIES: readonly Severity[] = ["info", "warn", "error", "fatal"];
const RUN_END_STATUSES: readonly RunEndStatus[] = [
  "success",
  "aborted",
  "failed",
];

function checkRunStartPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isNonEmptyString(p.prompt, "payload.prompt");

  if (c.isObject(p.targetRepo, "payload.targetRepo")) {
    c.isNonEmptyString(p.targetRepo.url, "payload.targetRepo.url");
    c.isNonEmptyString(p.targetRepo.branch, "payload.targetRepo.branch");
    c.isNonEmptyString(p.targetRepo.commit, "payload.targetRepo.commit");
  }

  if (c.isObject(p.model, "payload.model")) {
    c.isEnum(p.model.provider, "payload.model.provider", PROVIDERS);
    c.isNonEmptyString(p.model.name, "payload.model.name");
    if (p.model.version !== undefined) {
      c.isString(p.model.version, "payload.model.version");
    }
  }

  if (c.isObject(p.budget, "payload.budget")) {
    if (!c.isNumber(p.budget.maxUsd, "payload.budget.maxUsd")) {
      // already reported
    } else if ((p.budget.maxUsd as number) < 0) {
      c.push("payload.budget.maxUsd", "must be >= 0");
    }
    c.isInteger(p.budget.maxDurationMs, "payload.budget.maxDurationMs", 0);
    c.isInteger(p.budget.maxTokens, "payload.budget.maxTokens", 0);
  }

  c.isEnum(p.initiator, "payload.initiator", INITIATORS);
}

function checkThinkingPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isEnum(p.kind, "payload.kind", THINKING_KINDS);
  c.isString(p.md, "payload.md");
  if (p.refs !== undefined) {
    if (c.isArray(p.refs, "payload.refs")) {
      p.refs.forEach((ref, i) => c.isString(ref, `payload.refs[${i}]`));
    }
  }
}

function checkScanPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isEnum(p.kind, "payload.kind", SCAN_KINDS);
  if (c.isArray(p.paths, "payload.paths")) {
    if (p.paths.length === 0) c.push("payload.paths", "must be non-empty");
    p.paths.forEach((path, i) =>
      c.isNonEmptyString(path, `payload.paths[${i}]`),
    );
  }
  if (p.snippet !== undefined) c.isString(p.snippet, "payload.snippet");
  c.isInteger(p.bytesRead, "payload.bytesRead", 0);
}

function checkDecisionPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isNonEmptyString(p.step, "payload.step");
  c.isNonEmptyString(p.node, "payload.node");

  let candidateNames: string[] = [];
  if (c.isArray(p.candidates, "payload.candidates")) {
    if (p.candidates.length === 0) {
      c.push("payload.candidates", "must be non-empty");
    }
    p.candidates.forEach((raw, i) => {
      const base = `payload.candidates[${i}]`;
      if (!c.isObject(raw, base)) return;
      c.isNonEmptyString(raw.name, `${base}.name`);
      if (c.isNumber(raw.score, `${base}.score`)) {
        const s = raw.score as number;
        if (s < 0 || s > 1) c.push(`${base}.score`, "must be in [0, 1]");
      }
      c.isString(raw.reason, `${base}.reason`);
      if (typeof raw.name === "string") candidateNames.push(raw.name);
    });
  }

  if (c.isNonEmptyString(p.picked, "payload.picked")) {
    if (
      candidateNames.length > 0 &&
      !candidateNames.includes(p.picked as string)
    ) {
      c.push("payload.picked", "must match a candidates[].name");
    }
  }
  c.isString(p.rationale, "payload.rationale");
  c.isBoolean(p.reversible, "payload.reversible");
}

function isPosixRelativePath(s: string): boolean {
  if (s.length === 0) return false;
  if (s.startsWith("/")) return false;
  if (s.includes("\\")) return false;
  const parts = s.split("/");
  return !parts.includes("..");
}

function checkArtifactPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  if (c.isNonEmptyString(p.path, "payload.path")) {
    if (!isPosixRelativePath(p.path as string)) {
      c.push("payload.path", "must be a POSIX relative path (no ..,no leading /)");
    }
  }
  c.isEnum(p.op, "payload.op", ARTIFACT_OPS);
  c.isString(p.diff, "payload.diff");
  if (c.isObject(p.loc, "payload.loc")) {
    c.isInteger(p.loc.added, "payload.loc.added", 0);
    c.isInteger(p.loc.removed, "payload.loc.removed", 0);
  }
  if (p.language !== undefined) c.isString(p.language, "payload.language");
  if (p.registryRef !== undefined) {
    c.isString(p.registryRef, "payload.registryRef");
  }
}

function checkValidatePayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  if (c.isArray(p.checks, "payload.checks")) {
    if (p.checks.length === 0) c.push("payload.checks", "must be non-empty");
    p.checks.forEach((raw, i) => {
      const base = `payload.checks[${i}]`;
      if (!c.isObject(raw, base)) return;
      c.isNonEmptyString(raw.name, `${base}.name`);
      c.isEnum(raw.status, `${base}.status`, VALIDATE_STATUSES);
      if (c.isNumber(raw.durationMs, `${base}.durationMs`)) {
        if ((raw.durationMs as number) < 0) {
          c.push(`${base}.durationMs`, "must be >= 0");
        }
      }
      if (raw.output !== undefined) c.isString(raw.output, `${base}.output`);
    });
  }
  c.isEnum(p.overall, "payload.overall", VALIDATE_OVERALL);
  c.isEnum(p.scope, "payload.scope", VALIDATE_SCOPES);
  if (p.target !== undefined) c.isString(p.target, "payload.target");
}

function checkCostPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isEnum(p.provider, "payload.provider", PROVIDERS);
  c.isNonEmptyString(p.model, "payload.model");
  c.isEnum(p.call, "payload.call", COST_CALLS);
  c.isInteger(p.tokens_in, "payload.tokens_in", 0);
  c.isInteger(p.tokens_out, "payload.tokens_out", 0);
  if (p.tokens_cached !== undefined) {
    c.isInteger(p.tokens_cached, "payload.tokens_cached", 0);
  }
  if (c.isNumber(p.usd, "payload.usd")) {
    if ((p.usd as number) < 0) c.push("payload.usd", "must be >= 0");
  }
  if (c.isNumber(p.cumulativeUsd, "payload.cumulativeUsd")) {
    if ((p.cumulativeUsd as number) < 0) {
      c.push("payload.cumulativeUsd", "must be >= 0");
    }
  }
}

function checkErrorPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isNonEmptyString(p.code, "payload.code");
  c.isString(p.message, "payload.message");
  if (p.stack !== undefined) c.isString(p.stack, "payload.stack");
  c.isBoolean(p.recoverable, "payload.recoverable");
  if (p.retryCount !== undefined) {
    c.isInteger(p.retryCount, "payload.retryCount", 0);
  }
  if (p.severity !== undefined) {
    c.isEnum(p.severity, "payload.severity", SEVERITIES);
  }
}

function checkRunEndPayload(p: unknown, c: Checker): void {
  if (!c.isObject(p, "payload")) return;
  c.isEnum(p.status, "payload.status", RUN_END_STATUSES);
  c.isInteger(p.durationMs, "payload.durationMs", 0);

  if (p.pr !== undefined && c.isObject(p.pr, "payload.pr")) {
    c.isNonEmptyString(p.pr.url, "payload.pr.url");
    c.isInteger(p.pr.number, "payload.pr.number", 0);
    c.isNonEmptyString(p.pr.title, "payload.pr.title");
  }

  if (c.isObject(p.summary, "payload.summary")) {
    c.isInteger(p.summary.artifacts, "payload.summary.artifacts", 0);
    c.isInteger(p.summary.decisions, "payload.summary.decisions", 0);
    if (c.isObject(p.summary.validations, "payload.summary.validations")) {
      c.isInteger(
        p.summary.validations.pass,
        "payload.summary.validations.pass",
        0,
      );
      c.isInteger(
        p.summary.validations.fail,
        "payload.summary.validations.fail",
        0,
      );
    }
    if (c.isNumber(p.summary.totalUsd, "payload.summary.totalUsd")) {
      if ((p.summary.totalUsd as number) < 0) {
        c.push("payload.summary.totalUsd", "must be >= 0");
      }
    }
    c.isInteger(p.summary.totalTokens, "payload.summary.totalTokens", 0);
  }

  if (
    typeof p.status === "string" &&
    p.status !== "success" &&
    typeof p.reason !== "string"
  ) {
    c.push("payload.reason", "required when status != 'success'");
  }
  if (p.reason !== undefined) c.isString(p.reason, "payload.reason");
}

// ---------------------------------------------------------------------------
// Public per-event API
// ---------------------------------------------------------------------------

function runChecker<E>(
  event: unknown,
  expectedType: AOPEventType,
  payloadCheck: (p: unknown, c: Checker) => void,
): ValidationResult<E> {
  const c = new Checker();
  checkEnvelope(event, expectedType, c);
  if (event && typeof event === "object" && "payload" in event) {
    payloadCheck((event as { payload: unknown }).payload, c);
  }
  if (c.errors.length === 0) return { ok: true, value: event as E };
  return { ok: false, errors: c.errors };
}

export const validateRunStart = (e: unknown) =>
  runChecker<RunStartEvent>(e, "run.start", checkRunStartPayload);

export const validateThinking = (e: unknown) =>
  runChecker<ThinkingEvent>(e, "thinking", checkThinkingPayload);

export const validateScan = (e: unknown) =>
  runChecker<ScanEvent>(e, "scan", checkScanPayload);

export const validateDecision = (e: unknown) =>
  runChecker<DecisionEvent>(e, "decision", checkDecisionPayload);

export const validateArtifact = (e: unknown) =>
  runChecker<ArtifactEvent>(e, "artifact", checkArtifactPayload);

export const validateValidate = (e: unknown) =>
  runChecker<ValidateEvent>(e, "validate", checkValidatePayload);

export const validateCost = (e: unknown) =>
  runChecker<CostEvent>(e, "cost", checkCostPayload);

export const validateError = (e: unknown) =>
  runChecker<ErrorEvent>(e, "error", checkErrorPayload);

export const validateRunEnd = (e: unknown) =>
  runChecker<RunEndEvent>(e, "run.end", checkRunEndPayload);

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

const dispatchTable: {
  [K in AOPEventType]: (e: unknown) => ValidationResult<AOPEventByType[K]>;
} = {
  "run.start": validateRunStart,
  thinking: validateThinking,
  scan: validateScan,
  decision: validateDecision,
  artifact: validateArtifact,
  validate: validateValidate,
  cost: validateCost,
  error: validateError,
  "run.end": validateRunEnd,
};

/**
 * Inspect an unknown value's `type` discriminator and dispatch to the right
 * validator. If the discriminator is missing or unknown, fails with a clear
 * error rather than silently passing.
 */
export function validateAOPEvent(event: unknown): ValidationResult<AOPEvent> {
  if (typeof event !== "object" || event === null || Array.isArray(event)) {
    return {
      ok: false,
      errors: [{ path: "", message: "expected object" }],
    };
  }
  const t = (event as { type?: unknown }).type;
  if (typeof t !== "string") {
    return {
      ok: false,
      errors: [{ path: "type", message: "missing or non-string" }],
    };
  }
  if (!(t in dispatchTable)) {
    return {
      ok: false,
      errors: [{ path: "type", message: `unknown event type "${t}"` }],
    };
  }
  return dispatchTable[t as AOPEventType](event) as ValidationResult<AOPEvent>;
}

// ---------------------------------------------------------------------------
// Run-level invariants ("Validator behavior" §)
// ---------------------------------------------------------------------------

export interface RunValidationReport {
  ok: boolean;
  errors: ValidationError[];
  /** Number of events inspected. */
  count: number;
}

/** USD reconciliation tolerance per spec. */
export const COST_RECONCILE_TOLERANCE = 0.001;

/**
 * Validate the eight whole-file invariants from the spec, given an array of
 * (already per-event-validated, ideally) AOP envelopes.
 */
export function validateRun(events: unknown[]): RunValidationReport {
  const errors: ValidationError[] = [];

  if (events.length === 0) {
    return { ok: false, errors: [{ path: "", message: "empty run" }], count: 0 };
  }

  // 1. First line run.start, last line run.end
  const first = events[0] as { type?: unknown } | undefined;
  const last = events[events.length - 1] as { type?: unknown } | undefined;
  if (!first || first.type !== "run.start") {
    errors.push({ path: "[0].type", message: "first event must be run.start" });
  }
  if (!last || last.type !== "run.end") {
    errors.push({
      path: `[${events.length - 1}].type`,
      message: "last event must be run.end",
    });
  }

  // Per-event validation as a baseline (catches malformed before we trust shape)
  const validated: AOPEvent[] = [];
  events.forEach((e, i) => {
    const r = validateAOPEvent(e);
    if (!r.ok) {
      for (const err of r.errors) {
        errors.push({ path: `[${i}].${err.path}`, message: err.message });
      }
    } else {
      validated.push(r.value);
    }
  });

  if (validated.length !== events.length) {
    return { ok: false, errors, count: events.length };
  }

  // 2. seq monotonic from 0, no gaps
  // 3. same runId
  // 4. same v major
  const runId = validated[0]!.runId;
  const majorOf = (v: string) => v.split(".")[0];
  const major = majorOf(validated[0]!.v);
  for (let i = 0; i < validated.length; i++) {
    const ev = validated[i]!;
    if (ev.seq !== i) {
      errors.push({
        path: `[${i}].seq`,
        message: `expected ${i}, got ${ev.seq}`,
      });
    }
    if (ev.runId !== runId) {
      errors.push({
        path: `[${i}].runId`,
        message: `expected ${runId}, got ${ev.runId}`,
      });
    }
    if (majorOf(ev.v) !== major) {
      errors.push({
        path: `[${i}].v`,
        message: `protocol major mismatch (expected ${major}.x)`,
      });
    }
  }

  // 5. decision.picked already enforced per-event.
  // 6. artifact.path POSIX relative already enforced per-event.

  // 7. run.end.summary.totalUsd ≈ last cost.cumulativeUsd
  const costs = validated.filter((e): e is CostEvent => e.type === "cost");
  const runEnd = validated[validated.length - 1] as RunEndEvent | undefined;
  if (
    costs.length > 0 &&
    runEnd &&
    runEnd.type === "run.end" &&
    typeof runEnd.payload?.summary?.totalUsd === "number"
  ) {
    const lastCumulative = costs[costs.length - 1]!.payload.cumulativeUsd;
    if (
      Math.abs(runEnd.payload.summary.totalUsd - lastCumulative) >
      COST_RECONCILE_TOLERANCE
    ) {
      errors.push({
        path: `[${validated.length - 1}].payload.summary.totalUsd`,
        message: `does not match last cost.cumulativeUsd (${lastCumulative})`,
      });
    }
  }

  // 8. Total bytes < 50 MB — caller's concern (we don't see the raw file here)

  return { ok: errors.length === 0, errors, count: events.length };
}
