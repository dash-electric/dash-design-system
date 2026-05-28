/**
 * Agent Observability Protocol (AOP) v1.0.0 — TypeScript types.
 *
 * Mirrors `packages/dash-build/docs/specs/agent-observability-protocol-2026-05-28.md`.
 * Every event the daemon emits is one of the nine envelopes declared here.
 *
 * The discriminator field is `type`. The protocol version is carried both in
 * the envelope (`v`) and the SSE / HTTP header (`X-Dash-AOP`).
 */

// ---------------------------------------------------------------------------
// Protocol constants
// ---------------------------------------------------------------------------

/** Frozen protocol version string. Bumped on breaking changes only. */
export const AOPVersion = "1.0.0" as const;
export type AOPVersion = typeof AOPVersion;

/** HTTP / SSE header carrying the protocol version. */
export const AOPProtocolHeader = "X-Dash-AOP" as const;
export type AOPProtocolHeader = typeof AOPProtocolHeader;

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** ULID — 26 char Crockford base32. Stable per run. */
export type ULID = string;

/** ISO-8601 timestamp with millisecond precision, UTC ("Z" suffix). */
export type ISOTimestamp = string;

/** Run identifier. Always a ULID. */
export type RunId = ULID;

/** Severity classification for ergonomic UI grouping. */
export type Severity = "info" | "warn" | "error" | "fatal";

/** Discriminator for the AOP event taxonomy. */
export type AOPEventType =
  | "run.start"
  | "thinking"
  | "scan"
  | "decision"
  | "artifact"
  | "validate"
  | "cost"
  | "error"
  | "run.end";

/** Provider identifier used in both `run.start.model` and `cost.provider`. */
export type AOPProvider = "openai" | "anthropic" | "codex-local";

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

/** Common envelope wrapping every AOP event. */
export interface AOPEnvelope<T extends AOPEventType, P> {
  /** Protocol version literal. */
  v: AOPVersion;
  /** Event type discriminator. */
  type: T;
  /** Stable run identifier. */
  runId: RunId;
  /** Monotonically increasing per-run sequence, starts at 0. */
  seq: number;
  /** Emission wall-clock time. */
  ts: ISOTimestamp;
  /** Type-specific payload. */
  payload: P;
}

// ---------------------------------------------------------------------------
// run.start
// ---------------------------------------------------------------------------

export interface RunStartTargetRepo {
  url: string;
  branch: string;
  commit: string;
}

export interface RunStartModel {
  provider: AOPProvider;
  name: string;
  version?: string;
}

export interface RunStartBudget {
  maxUsd: number;
  maxDurationMs: number;
  maxTokens: number;
}

export type RunStartInitiator = "cli" | "api" | "schedule" | "webhook";

export interface RunStartPayload {
  prompt: string;
  targetRepo: RunStartTargetRepo;
  model: RunStartModel;
  budget: RunStartBudget;
  initiator: RunStartInitiator;
}

export type RunStartEvent = AOPEnvelope<"run.start", RunStartPayload>;

// ---------------------------------------------------------------------------
// thinking
// ---------------------------------------------------------------------------

export type ThinkingKind = "reason" | "hypothesis" | "risk";

export interface ThinkingPayload {
  kind: ThinkingKind;
  md: string;
  refs?: string[];
}

export type ThinkingEvent = AOPEnvelope<"thinking", ThinkingPayload>;

// ---------------------------------------------------------------------------
// scan
// ---------------------------------------------------------------------------

export type ScanKind = "file" | "dep" | "type" | "registry";

export interface ScanPayload {
  kind: ScanKind;
  paths: string[];
  snippet?: string;
  bytesRead: number;
}

export type ScanEvent = AOPEnvelope<"scan", ScanPayload>;

// ---------------------------------------------------------------------------
// decision
// ---------------------------------------------------------------------------

export interface DecisionCandidate {
  name: string;
  score: number;
  reason: string;
}

export interface DecisionPayload {
  step: string;
  node: string;
  candidates: DecisionCandidate[];
  picked: string;
  rationale: string;
  reversible: boolean;
}

export type DecisionEvent = AOPEnvelope<"decision", DecisionPayload>;

// ---------------------------------------------------------------------------
// artifact
// ---------------------------------------------------------------------------

export type ArtifactOp = "create" | "edit" | "delete";

export interface ArtifactLoc {
  added: number;
  removed: number;
}

export interface ArtifactPayload {
  path: string;
  op: ArtifactOp;
  diff: string;
  loc: ArtifactLoc;
  language?: string;
  registryRef?: string;
}

export type ArtifactEvent = AOPEnvelope<"artifact", ArtifactPayload>;

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

export type ValidateStatus = "pass" | "fail" | "skip" | "warn";
export type ValidateScope = "file" | "package" | "repo";
export type ValidateOverall = "pass" | "fail" | "warn";

export interface ValidateCheck {
  name: string;
  status: ValidateStatus;
  durationMs: number;
  output?: string;
}

export interface ValidatePayload {
  checks: ValidateCheck[];
  overall: ValidateOverall;
  scope: ValidateScope;
  target?: string;
}

export type ValidateEvent = AOPEnvelope<"validate", ValidatePayload>;

// ---------------------------------------------------------------------------
// cost
// ---------------------------------------------------------------------------

export type CostCall = "completion" | "embedding" | "tool" | "vision";

export interface CostPayload {
  provider: AOPProvider;
  model: string;
  call: CostCall;
  tokens_in: number;
  tokens_out: number;
  tokens_cached?: number;
  usd: number;
  cumulativeUsd: number;
}

export type CostEvent = AOPEnvelope<"cost", CostPayload>;

// ---------------------------------------------------------------------------
// error
// ---------------------------------------------------------------------------

export interface ErrorPayload {
  code: string;
  message: string;
  stack?: string;
  recoverable: boolean;
  retryCount?: number;
  /** Optional severity tag. Not required by spec but useful for UI grouping. */
  severity?: Severity;
}

export type ErrorEvent = AOPEnvelope<"error", ErrorPayload>;

// ---------------------------------------------------------------------------
// run.end
// ---------------------------------------------------------------------------

export type RunEndStatus = "success" | "aborted" | "failed";

export interface RunEndPR {
  url: string;
  number: number;
  title: string;
}

export interface RunEndSummary {
  artifacts: number;
  decisions: number;
  validations: { pass: number; fail: number };
  totalUsd: number;
  totalTokens: number;
}

export interface RunEndPayload {
  status: RunEndStatus;
  durationMs: number;
  pr?: RunEndPR;
  summary: RunEndSummary;
  reason?: string;
}

export type RunEndEvent = AOPEnvelope<"run.end", RunEndPayload>;

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

/** Discriminated union over all 9 event types. */
export type AOPEvent =
  | RunStartEvent
  | ThinkingEvent
  | ScanEvent
  | DecisionEvent
  | ArtifactEvent
  | ValidateEvent
  | CostEvent
  | ErrorEvent
  | RunEndEvent;

/** Map from event-type literal to its envelope. */
export interface AOPEventByType {
  "run.start": RunStartEvent;
  thinking: ThinkingEvent;
  scan: ScanEvent;
  decision: DecisionEvent;
  artifact: ArtifactEvent;
  validate: ValidateEvent;
  cost: CostEvent;
  error: ErrorEvent;
  "run.end": RunEndEvent;
}
