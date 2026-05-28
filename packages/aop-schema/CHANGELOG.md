# @dash/aop-schema

## 1.0.0 — 2026-05-28

Initial release. Extracted from `@dash/build` to give Dash Dashboard and
third-party tooling a zero-dependency way to consume Agent Observability
Protocol traces.

### Added

- **Types** — TypeScript interfaces for all 9 AOP event envelopes
  (`run.start`, `thinking`, `scan`, `decision`, `artifact`, `validate`,
  `cost`, `error`, `run.end`), shared primitives (`ULID`, `ISOTimestamp`,
  `RunId`, `Severity`), discriminated union `AOPEvent`, and the constants
  `AOPVersion = "1.0.0"` / `AOPProtocolHeader = "X-Dash-AOP"`.
- **JSON Schemas (Draft-07)** — hand-written, plain-object schemas per event
  type plus a top-level `oneOf` schema. Exported as the `eventSchemas` map.
- **Validators** — pure-JS per-event validators returning structured
  `ValidationResult`, a `validateAOPEvent` dispatcher, and `validateRun`
  which enforces the eight run-level invariants from the spec
  (first/last event, seq monotonicity, runId / version coherence, decision
  picked ∈ candidates, POSIX-relative artifact paths, cost reconciliation
  within ±0.001 USD).
- **Redaction** — `redactEvent`, `redactString`, `truncate`, and
  the regexes for OpenAI keys, GitHub tokens, Bearer auth, and email
  local-parts. Drops `.env*` snippets per spec.
- **Replay** — `parseRunFile`, `parseRunText`, `streamRunFile`,
  `serializeRun`, `writeRunFile` for JSONL traces.
- **Wire** — `eventToSseFrame`, `parseSseFrame`, `parseSseStream`,
  `sseKeepalive`, and the `SSE_HEADERS` block for spec-compliant
  `text/event-stream` responses.
- Dual ESM + CJS bundles via tsup with full `.d.ts`.

### Notes

- Zero runtime dependencies.
- Targets ES2022 with NodeNext module resolution.
- All schemas match the AOP v1.0.0 spec exactly. Where the spec is silent
  (e.g. minimum cardinalities), validation leans strict: `candidates` must be
  non-empty, `paths` must be non-empty, `checks` must be non-empty, numbers
  must be finite, integers must be ≥ 0.
- `error.severity` is an optional informational field added beyond the spec
  for ergonomic UI grouping; it is never required and accepts a closed enum.
