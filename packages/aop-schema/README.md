# @dash/aop-schema

Agent Observability Protocol (AOP) v1.0.0 schemas, validators, and wire-format
helpers — packaged for use by **Dash Dashboard**, third-party replayers, lint
rules, and any tool that needs to understand a `dash-build` agent trace.

- **Zero runtime dependencies.** Pure TypeScript / Node built-ins only.
- **Dual ESM + CJS** bundles, full `.d.ts`.
- **Tree-shakeable** named exports; no default export.
- Frozen at protocol version **`1.0.0`** (header: `X-Dash-AOP: 1.0.0`).

Source spec: [`packages/dash-build/docs/specs/agent-observability-protocol-2026-05-28.md`](../dash-build/docs/specs/agent-observability-protocol-2026-05-28.md).

---

## Install

```bash
npm install @dash/aop-schema
# or
pnpm add @dash/aop-schema
```

## Subpath exports

```ts
import { AOPVersion, AOPEvent } from "@dash/aop-schema/types";
import { runStartSchema, eventSchemas } from "@dash/aop-schema/schemas";
import { validateAOPEvent, validateRun } from "@dash/aop-schema/validators";
import { redactEvent, truncate } from "@dash/aop-schema/redact";
import { parseRunFile, streamRunFile } from "@dash/aop-schema/replay";
import { eventToSseFrame, parseSseFrame } from "@dash/aop-schema/wire";
```

The barrel (`@dash/aop-schema`) re-exports all of the above.

---

## Event types

Nine envelopes form the complete AOP taxonomy. Each is a TS `interface`, has a
hand-written JSON Schema (Draft-07), and a pure-JS validator.

| Type        | Cardinality | Validator               |
|-------------|-------------|-------------------------|
| `run.start` | exactly 1   | `validateRunStart`      |
| `thinking`  | 0..N        | `validateThinking`      |
| `scan`      | 0..N        | `validateScan`          |
| `decision`  | 0..N        | `validateDecision`      |
| `artifact`  | 0..N        | `validateArtifact`      |
| `validate`  | 0..N        | `validateValidate`      |
| `cost`      | 0..N        | `validateCost`          |
| `error`     | 0..N        | `validateError`         |
| `run.end`   | exactly 1   | `validateRunEnd`        |

The discriminator is `type`. The shared envelope adds `v`, `runId` (ULID),
`seq` (monotonic), `ts` (ISO-8601 ms UTC), and `payload`.

---

## Usage

### Validate a single envelope

```ts
import { validateAOPEvent } from "@dash/aop-schema";

const result = validateAOPEvent(someJson);
if (!result.ok) {
  for (const e of result.errors) console.error(e.path, e.message);
} else {
  const event = result.value; // narrowed to AOPEvent
}
```

### Validate a whole JSONL run

```ts
import { parseRunFile, validateRun } from "@dash/aop-schema";

const events = await parseRunFile("~/.dash-build/runs/01J....jsonl");
const report = validateRun(events);
if (!report.ok) process.exit(1);
```

`validateRun` enforces the eight whole-file invariants from the spec:
first-line `run.start`, last-line `run.end`, strictly monotonic `seq`,
matching `runId`, matching `v` major, decision `picked` ∈ candidates,
POSIX-relative `artifact.path`, and `totalUsd` reconciliation with the last
`cost.cumulativeUsd` (±0.001).

### Stream large traces

```ts
import { streamRunFile } from "@dash/aop-schema";

for await (const event of streamRunFile(path)) {
  // process incrementally
}
```

### Emit + consume SSE frames

```ts
import { SSE_HEADERS, eventToSseFrame } from "@dash/aop-schema/wire";

res.writeHead(200, SSE_HEADERS);
res.write(eventToSseFrame(event));
```

```ts
import { parseSseFrame, parseSseStream } from "@dash/aop-schema/wire";

const event = parseSseFrame(frameText);    // single frame
const events = parseSseStream(chunkText);  // many concatenated frames
```

### Redact secrets before persisting

```ts
import { redactEvent } from "@dash/aop-schema/redact";

const safe = redactEvent(event); // strips OpenAI keys, GH tokens, Bearer auth,
                                 // masks email local-parts, drops .env snippets,
                                 // truncates oversized text fields with the
                                 // spec's `…[truncated:N bytes]` marker.
```

---

## Versioning

Semver 2.0 on the protocol itself. The `v` field on every envelope must match
the `AOPVersion` exported by this package's major. Consumers MUST reject
envelopes with a different major. Minor mismatches are additive and should
warn, not fail.

---

## Development

```bash
pnpm install
pnpm --filter @dash/aop-schema build       # tsup → dist/
pnpm --filter @dash/aop-schema test        # vitest
pnpm --filter @dash/aop-schema typecheck   # tsc --noEmit
```

---

## License

MIT.
