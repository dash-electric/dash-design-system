# BE-Aware Intake — 2026-05-28

> Status: Draft — Module 1 implementation in flight.
> Owner: Dash Build daemon team.
> Pivot ref: "Make Dash Build NOT a Lovable clone — AI must respect existing BE
> (endpoints, DB schema) when generating FE."

---

## TL;DR

Dash Build today routes prompts through a skill chain that loads design
tokens, layer-0 rules, and per-repo stack mandates. It does **not** force the
generator to align FE output against the real BE surface (endpoints + DB
schema) or to honour CR-3 (mandatory audit trail for legal/financial fields).
Result: AI happily hallucinates new endpoints, duplicates fields, and ships
inline-edit components without an audit log even when the prompt is touching
payments or KYC.

This spec introduces a new **intake** layer that sits *before* the skill chain
fires. Four modules:

1. `be-endpoint-catalog` — scan repo for real API routes (Next Pages, Next App,
   Express).
2. `db-schema-reader` — parse Prisma / Drizzle / raw SQL into a typed
   `DbCatalog`.
3. `scenario-classifier` — given a prompt + the two catalogs, decide which of
   six change-shapes we're in (fe-only / update / extend BE / extend BE+DB /
   greenfield / ambiguous).
4. `audit-trail-enforcer` — pattern-match prompt + affected fields against
   the CR-3 watch-list (payment, KYC, mitra status…) and emit a hard
   requirement object the prompt composer must honour.

All four modules are **side-effect-free**, read-only, and degrade gracefully:
missing schema returns an empty catalog, never throws. The orchestrator wires
them in *before* `generateWithSkillChain` so the chain can branch on scenario
and inject `beCatalog` / `dbCatalog` / `auditTrailRequirement` into the system
prompt.

Zero new runtime deps. AST parsing kept regex-grade to match the existing
`repo-introspector` style.

---

## Four modules overview

| Module | Responsibility | Reads | Returns |
|---|---|---|---|
| `be-endpoint-catalog` | What endpoints already exist? | API route files | `BeCatalog` |
| `db-schema-reader` | What does the DB look like? | `schema.prisma`, `src/db/schema.ts`, `migrations/*.sql` | `DbCatalog` |
| `scenario-classifier` | What kind of change is this? | prompt + both catalogs + repo file list | `ClassificationResult` |
| `audit-trail-enforcer` | Does CR-3 apply? | prompt + affected field names | `AuditTrailRequirement` |

### Module 1 — `be-endpoint-catalog.ts`

```typescript
export interface EndpointEntry {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  filePath: string
  framework: "next-pages" | "next-app" | "express"
  handlerExport: string
  inputSchema?: unknown
  outputType?: string
}

export interface BeCatalog {
  endpoints: EndpointEntry[]
  framework: "next-pages" | "next-app" | "express" | "mixed" | "none"
  totalEndpoints: number
}

export async function scanBeCatalog(repoRoot: string): Promise<BeCatalog>
```

Detection heuristics:

- **Next Pages Router** — `src/pages/api/**/*.{ts,js}` + `pages/api/**/*.{ts,js}`.
  Path derived from filename; method derived from `export default async function
  handler(req, res)` body via grep for `req.method === 'POST'` etc. Falls back
  to `GET` when no method check is present.
- **Next App Router** — `src/app/**/route.{ts,js}` + `app/**/route.{ts,js}`.
  Path derived from directory, method from named exports (`export async
  function POST`).
- **Express** — `src/routes/**/*.{ts,js}` + `routes/**/*.{ts,js}`. Method +
  path from `router.<method>("/path", ...)` calls.

Framework field is `mixed` when more than one is detected, `none` for empty.

### Module 2 — `db-schema-reader.ts`

```typescript
export interface ColumnSchema {
  name: string
  type: string
  nullable: boolean
  default?: string
  unique?: boolean
  primary?: boolean
}

export interface RelationSchema {
  type: "one-to-one" | "one-to-many" | "many-to-many"
  toTable: string
  via?: string
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  relations: RelationSchema[]
  source: "prisma" | "drizzle" | "sql"
  filePath: string
}

export interface DbCatalog {
  tables: TableSchema[]
  source: "prisma" | "drizzle" | "sql" | "none"
}

export async function readDbSchema(repoRoot: string): Promise<DbCatalog>
```

Detection precedence: Prisma → Drizzle → SQL migrations → empty catalog.

### Module 3 — `scenario-classifier.ts`

```typescript
export type Scenario =
  | "update_existing"
  | "new_product"
  | "extend_fe_be"
  | "extend_fe_be_db"
  | "fe_only"
  | "ambiguous"

export interface ClassificationResult {
  scenario: Scenario
  confidence: number   // 0..1
  reasoning: string
  affectedFiles?: { fe: string[]; be: string[]; db: string[] }
  needsClarify?: string
}

export async function classifyPrompt(
  prompt: string,
  context: {
    beCatalog: BeCatalog
    dbCatalog: DbCatalog
    existingFiles: string[]
  },
): Promise<ClassificationResult>
```

Heuristic-only for now (no LLM call) — keeps the module hermetic and unit
testable. The orchestrator can wrap a higher-confidence LLM call on top
later. See § Classification algorithm.

### Module 4 — `audit-trail-enforcer.ts`

```typescript
export interface AuditTrailRequirement {
  required: boolean
  reason: string
  pattern: "inline-edit-with-audit" | "image-editor-with-audit" | "custom"
  fieldsToLog: string[]
}

export function checkAuditTrailRequired(
  prompt: string,
  affectedFields: string[],
): AuditTrailRequirement
```

Synchronous (pure function). No I/O. CR-3 keyword list lives inline in this
module so it stays auditable in one place.

---

## Classification algorithm

The classifier runs a deterministic decision tree:

1. **Pure-FE signal** — prompt mentions only visual concepts (color, layout,
   spacing, copy, animation) AND zero verbs from the BE/DB lexicon ("endpoint",
   "API", "field", "column", "migrate", "save"). → `fe_only`, confidence 0.85.
2. **Greenfield signal** — prompt mentions "new product", "from scratch",
   "greenfield", "build X module", AND `existingFiles` for the named module is
   empty. → `new_product`, confidence 0.75.
3. **DB-touching signal** — prompt mentions a verb in {"add field", "store",
   "persist", "new column", "migrate"}. Cross-check `dbCatalog.tables`:
    - target table missing → `extend_fe_be_db`, confidence 0.8.
    - target table present but field missing → `extend_fe_be_db`, confidence 0.7.
4. **BE-extending signal** — prompt mentions a verb in {"endpoint", "fetch",
   "post to", "call API"}. Cross-check `beCatalog`:
    - matching method+path → `update_existing`, confidence 0.75.
    - no match → `extend_fe_be`, confidence 0.7.
5. **Default** — `ambiguous`, confidence 0.3, with a `needsClarify` question
   built from the strongest unmet signal.

When two signals tie, take the *higher-impact* scenario (db > be > fe).

Confidence is a hint for the orchestrator: < 0.5 should auto-route to the
clarify gate.

---

## CR-3 audit-trail rules

CR-3 says: *"Audit trail mandatory for user-editable fields carrying
legal/financial weight (image proof, payment, signature, KYC)."*

Watch-list keyword buckets (single source of truth in `audit-trail-enforcer`):

- **Financial:** payment, transfer, withdraw, balance, refund, payout,
  commission, fee, charge, invoice.
- **Identity/KYC:** ktp, npwp, kyc, signature, image proof, photo proof, foto
  bukti, surat, id card, passport.
- **Authority transitions:** approval, approve, reject, rejection,
  verification, verify, suspend, delist, blacklist, activate, deactivate,
  mitra status, driver status, account status.

Match if the prompt OR any affected field name contains a keyword (case
insensitive, whole word for short keywords).

Pattern recommendation:

- image-bearing keyword (`image proof`, `ktp`, `signature`, `photo`) →
  `image-editor-with-audit`.
- any other → `inline-edit-with-audit`.

Required log fields (always): `originalValue`, `newValue`, `editor`,
`timestamp`, `reason`. Extra fields per pattern allowed but not enforced.

---

## Integration with orchestrator skill chain

```
POST /api/prompt
  ↓ submitPrompt
  ↓ store.addPrompt (status=queued)
  ↓ INTAKE LAYER ← NEW
  │   1. scanBeCatalog(repoRoot)
  │   2. readDbSchema(repoRoot)
  │   3. classifyPrompt(prompt, { beCatalog, dbCatalog, existingFiles })
  │   4. checkAuditTrailRequired(prompt, affectedFieldNames)
  │   ↓ attach all four results to GenerateInput as `intake`
  ↓ generateWithSkillChain
      ↓ prd-evaluator (now receives `intake` for richer clarify questions)
      ↓ design-loader
      ↓ skill-loader
      ↓ prompt-composer  ← consumes `intake` and renders BE/DB context blocks
      ↓ model call
      ↓ response-parser
      ↓ validator (CR-3 check: if intake.auditTrail.required, fail unless the
                   output references a known audit pattern block)
```

Branching by scenario inside the composer:

| Scenario | Composer behaviour |
|---|---|
| `fe_only` | omit BE/DB context blocks entirely (save tokens) |
| `update_existing` | include matching endpoint(s) + relevant table |
| `extend_fe_be` | include full beCatalog summary + warn "new endpoint expected" |
| `extend_fe_be_db` | include both catalogs + migration template hint |
| `new_product` | include both catalogs as "existing surface — do not duplicate" |
| `ambiguous` | clarify gate fires before composer is reached |

---

## Testing strategy

- **Hermetic** — every test scaffolds a temp dir, never touches the real
  filesystem outside `tmpdir()`.
- Per scanner: empty, single, multi-framework, malformed, edge.
- Classifier: one positive case per scenario + ambiguous + edge.
- Audit enforcer: one positive per bucket + negative case + custom pattern
  promotion.
- Target: 30-40 tests total, runs in < 2s.

---

## Migration plan

1. Land the four modules + tests + barrel under `src/intake/`. ← this spec.
2. Land the `INTEGRATION-TODO.md` handoff in the same folder.
3. Main session wires intake into `pipeline/orchestrator.ts` between
   `store.addPrompt` and `generateWithSkillChain`.
4. `prompt-composer.ts` learns to render the new context blocks based on the
   scenario branch table above.
5. `validator.ts` learns to enforce `auditTrailRequirement.required` against
   the parsed output.
6. Smoke test against `backoffice`, `portal-v2`, and Halo-Dash to verify the
   scanners agree with reality.

No production wire-up happens in this PR — intake ships dormant.
