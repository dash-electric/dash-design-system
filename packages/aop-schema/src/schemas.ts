/**
 * Hand-written JSON Schema (Draft-07) definitions for every AOP event.
 *
 * Kept zero-dep: schemas are plain JS objects, so consumers can plug them
 * into their preferred validator (Ajv, ajv-formats, the bundled
 * `validators.ts`, etc.).
 *
 * Source of truth: `agent-observability-protocol-2026-05-28.md`.
 */

import { AOPVersion } from "./types.js";

const DRAFT_07 = "http://json-schema.org/draft-07/schema#" as const;

// Reusable building blocks ---------------------------------------------------

/** Crockford base32 ULID — 26 chars, no `I L O U`. */
export const ULID_PATTERN = "^[0-9A-HJKMNP-TV-Z]{26}$" as const;

/** ISO-8601 UTC timestamp with millisecond precision. */
export const ISO_TIMESTAMP_PATTERN =
  "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$" as const;

const versionSchema = {
  type: "string",
  const: AOPVersion,
} as const;

const runIdSchema = {
  type: "string",
  pattern: ULID_PATTERN,
} as const;

const timestampSchema = {
  type: "string",
  pattern: ISO_TIMESTAMP_PATTERN,
} as const;

const seqSchema = {
  type: "integer",
  minimum: 0,
} as const;

const envelopeBase = (
  typeLiteral: string,
  payloadSchema: Record<string, unknown>,
) =>
  ({
    type: "object",
    required: ["v", "type", "runId", "seq", "ts", "payload"],
    additionalProperties: false,
    properties: {
      v: versionSchema,
      type: { type: "string", const: typeLiteral },
      runId: runIdSchema,
      seq: seqSchema,
      ts: timestampSchema,
      payload: payloadSchema,
    },
  }) as const;

// run.start ------------------------------------------------------------------

export const runStartPayloadSchema = {
  type: "object",
  required: ["prompt", "targetRepo", "model", "budget", "initiator"],
  additionalProperties: false,
  properties: {
    prompt: { type: "string", minLength: 1 },
    targetRepo: {
      type: "object",
      required: ["url", "branch", "commit"],
      additionalProperties: false,
      properties: {
        url: { type: "string", minLength: 1 },
        branch: { type: "string", minLength: 1 },
        commit: { type: "string", minLength: 1 },
      },
    },
    model: {
      type: "object",
      required: ["provider", "name"],
      additionalProperties: false,
      properties: {
        provider: { enum: ["openai", "anthropic", "codex-local"] },
        name: { type: "string", minLength: 1 },
        version: { type: "string" },
      },
    },
    budget: {
      type: "object",
      required: ["maxUsd", "maxDurationMs", "maxTokens"],
      additionalProperties: false,
      properties: {
        maxUsd: { type: "number", minimum: 0 },
        maxDurationMs: { type: "integer", minimum: 0 },
        maxTokens: { type: "integer", minimum: 0 },
      },
    },
    initiator: { enum: ["cli", "api", "schedule", "webhook"] },
  },
} as const;

export const runStartSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/run.start.json",
  title: "AOP run.start envelope",
  ...envelopeBase("run.start", runStartPayloadSchema),
} as const;

// thinking -------------------------------------------------------------------

export const thinkingPayloadSchema = {
  type: "object",
  required: ["kind", "md"],
  additionalProperties: false,
  properties: {
    kind: { enum: ["reason", "hypothesis", "risk"] },
    md: { type: "string" },
    refs: { type: "array", items: { type: "string" } },
  },
} as const;

export const thinkingSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/thinking.json",
  title: "AOP thinking envelope",
  ...envelopeBase("thinking", thinkingPayloadSchema),
} as const;

// scan -----------------------------------------------------------------------

export const scanPayloadSchema = {
  type: "object",
  required: ["kind", "paths", "bytesRead"],
  additionalProperties: false,
  properties: {
    kind: { enum: ["file", "dep", "type", "registry"] },
    paths: { type: "array", items: { type: "string" }, minItems: 1 },
    snippet: { type: "string" },
    bytesRead: { type: "integer", minimum: 0 },
  },
} as const;

export const scanSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/scan.json",
  title: "AOP scan envelope",
  ...envelopeBase("scan", scanPayloadSchema),
} as const;

// decision -------------------------------------------------------------------

export const decisionCandidateSchema = {
  type: "object",
  required: ["name", "score", "reason"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1 },
    score: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: "string" },
  },
} as const;

export const decisionPayloadSchema = {
  type: "object",
  required: ["step", "node", "candidates", "picked", "rationale", "reversible"],
  additionalProperties: false,
  properties: {
    step: { type: "string", minLength: 1 },
    node: { type: "string", minLength: 1 },
    candidates: {
      type: "array",
      minItems: 1,
      items: decisionCandidateSchema,
    },
    picked: { type: "string", minLength: 1 },
    rationale: { type: "string" },
    reversible: { type: "boolean" },
  },
} as const;

export const decisionSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/decision.json",
  title: "AOP decision envelope",
  ...envelopeBase("decision", decisionPayloadSchema),
} as const;

// artifact -------------------------------------------------------------------

export const artifactPayloadSchema = {
  type: "object",
  required: ["path", "op", "diff", "loc"],
  additionalProperties: false,
  properties: {
    path: { type: "string", minLength: 1 },
    op: { enum: ["create", "edit", "delete"] },
    diff: { type: "string" },
    loc: {
      type: "object",
      required: ["added", "removed"],
      additionalProperties: false,
      properties: {
        added: { type: "integer", minimum: 0 },
        removed: { type: "integer", minimum: 0 },
      },
    },
    language: { type: "string" },
    registryRef: { type: "string" },
  },
} as const;

export const artifactSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/artifact.json",
  title: "AOP artifact envelope",
  ...envelopeBase("artifact", artifactPayloadSchema),
} as const;

// validate -------------------------------------------------------------------

export const validateCheckSchema = {
  type: "object",
  required: ["name", "status", "durationMs"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1 },
    status: { enum: ["pass", "fail", "skip", "warn"] },
    durationMs: { type: "number", minimum: 0 },
    output: { type: "string" },
  },
} as const;

export const validatePayloadSchema = {
  type: "object",
  required: ["checks", "overall", "scope"],
  additionalProperties: false,
  properties: {
    checks: { type: "array", items: validateCheckSchema, minItems: 1 },
    overall: { enum: ["pass", "fail", "warn"] },
    scope: { enum: ["file", "package", "repo"] },
    target: { type: "string" },
  },
} as const;

export const validateSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/validate.json",
  title: "AOP validate envelope",
  ...envelopeBase("validate", validatePayloadSchema),
} as const;

// cost -----------------------------------------------------------------------

export const costPayloadSchema = {
  type: "object",
  required: [
    "provider",
    "model",
    "call",
    "tokens_in",
    "tokens_out",
    "usd",
    "cumulativeUsd",
  ],
  additionalProperties: false,
  properties: {
    provider: { enum: ["openai", "anthropic", "codex-local"] },
    model: { type: "string", minLength: 1 },
    call: { enum: ["completion", "embedding", "tool", "vision"] },
    tokens_in: { type: "integer", minimum: 0 },
    tokens_out: { type: "integer", minimum: 0 },
    tokens_cached: { type: "integer", minimum: 0 },
    usd: { type: "number", minimum: 0 },
    cumulativeUsd: { type: "number", minimum: 0 },
  },
} as const;

export const costSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/cost.json",
  title: "AOP cost envelope",
  ...envelopeBase("cost", costPayloadSchema),
} as const;

// error ----------------------------------------------------------------------

export const errorPayloadSchema = {
  type: "object",
  required: ["code", "message", "recoverable"],
  additionalProperties: false,
  properties: {
    code: { type: "string", minLength: 1 },
    message: { type: "string" },
    stack: { type: "string" },
    recoverable: { type: "boolean" },
    retryCount: { type: "integer", minimum: 0 },
    severity: { enum: ["info", "warn", "error", "fatal"] },
  },
} as const;

export const errorSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/error.json",
  title: "AOP error envelope",
  ...envelopeBase("error", errorPayloadSchema),
} as const;

// run.end --------------------------------------------------------------------

export const runEndPayloadSchema = {
  type: "object",
  required: ["status", "durationMs", "summary"],
  additionalProperties: false,
  properties: {
    status: { enum: ["success", "aborted", "failed"] },
    durationMs: { type: "integer", minimum: 0 },
    pr: {
      type: "object",
      required: ["url", "number", "title"],
      additionalProperties: false,
      properties: {
        url: { type: "string", minLength: 1 },
        number: { type: "integer", minimum: 0 },
        title: { type: "string", minLength: 1 },
      },
    },
    summary: {
      type: "object",
      required: [
        "artifacts",
        "decisions",
        "validations",
        "totalUsd",
        "totalTokens",
      ],
      additionalProperties: false,
      properties: {
        artifacts: { type: "integer", minimum: 0 },
        decisions: { type: "integer", minimum: 0 },
        validations: {
          type: "object",
          required: ["pass", "fail"],
          additionalProperties: false,
          properties: {
            pass: { type: "integer", minimum: 0 },
            fail: { type: "integer", minimum: 0 },
          },
        },
        totalUsd: { type: "number", minimum: 0 },
        totalTokens: { type: "integer", minimum: 0 },
      },
    },
    reason: { type: "string" },
  },
} as const;

export const runEndSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/run.end.json",
  title: "AOP run.end envelope",
  ...envelopeBase("run.end", runEndPayloadSchema),
} as const;

// Union ----------------------------------------------------------------------

/** Map keyed by event-type literal. */
export const eventSchemas = {
  "run.start": runStartSchema,
  thinking: thinkingSchema,
  scan: scanSchema,
  decision: decisionSchema,
  artifact: artifactSchema,
  validate: validateSchema,
  cost: costSchema,
  error: errorSchema,
  "run.end": runEndSchema,
} as const;

export type EventSchemas = typeof eventSchemas;

/** Top-level oneOf schema covering any envelope. */
export const aopEventSchema = {
  $schema: DRAFT_07,
  $id: "https://schemas.dash.com/aop/1.0.0/event.json",
  title: "AOP event (any of 9 envelopes)",
  oneOf: [
    { $ref: runStartSchema.$id },
    { $ref: thinkingSchema.$id },
    { $ref: scanSchema.$id },
    { $ref: decisionSchema.$id },
    { $ref: artifactSchema.$id },
    { $ref: validateSchema.$id },
    { $ref: costSchema.$id },
    { $ref: errorSchema.$id },
    { $ref: runEndSchema.$id },
  ],
} as const;
