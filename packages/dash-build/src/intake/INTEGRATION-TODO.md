# Intake Integration TODO

> Hand-off for the main session. The four intake modules ship dormant in this
> PR. Wiring them into the live pipeline is the next step.

## Where to call each scanner

Wire intake **between** `store.addPrompt` and `generateWithSkillChain` in
`src/pipeline/orchestrator.ts::processPrompt`. Run BE catalog + DB reader in
parallel, then run the classifier + audit enforcer sequentially because they
consume the catalogs.

```ts
import {
  scanBeCatalog,
  readDbSchema,
  classifyPrompt,
  checkAuditTrailRequired,
} from "../intake/index.js"

// repoPath is the on-disk path the skill chain already uses (see
// `repoPathResolver` in OrchestratorOptions).
const [beCatalog, dbCatalog] = await Promise.all([
  scanBeCatalog(repoPath).catch(() => ({
    endpoints: [],
    framework: "none" as const,
    totalEndpoints: 0,
  })),
  readDbSchema(repoPath).catch(() => ({
    tables: [],
    source: "none" as const,
  })),
])

const existingFiles = await collectExistingFileRefs(prompt) // already exists
const classification = await classifyPrompt(prompt.text, {
  beCatalog,
  dbCatalog,
  existingFiles,
})

const affectedFieldNames = classification.affectedFiles?.db ?? []
const auditTrail = checkAuditTrailRequired(prompt.text, affectedFieldNames)

const intake = { beCatalog, dbCatalog, classification, auditTrail }
```

## What context to inject into the AI prompt

Extend `GenerateInput` (in `src/skills/types.ts`) with an optional `intake`
field of the shape above. Then teach `prompt-composer.ts` to render context
blocks based on the scenario:

| Scenario           | Block(s) rendered                                              |
| ------------------ | -------------------------------------------------------------- |
| `fe_only`          | none (save tokens)                                             |
| `update_existing`  | matching `EndpointEntry[]` + matching `TableSchema[]`           |
| `extend_fe_be`     | full `BeCatalog` summary + "new endpoint expected" hint        |
| `extend_fe_be_db`  | both catalogs + migration template hint                        |
| `new_product`      | both catalogs as "existing surface — do not duplicate"         |
| `ambiguous`        | clarify gate fires before composer (see below)                 |

Always render the audit-trail block when `auditTrail.required` is true,
regardless of scenario:

```
AUDIT TRAIL REQUIRED (CR-3)
Pattern: {auditTrail.pattern}
Reason : {auditTrail.reason}
Fields to log: {auditTrail.fieldsToLog.join(", ")}
You MUST reference a Dash DS audit-bearing block. Do NOT emit raw inline-edit.
```

## Where classifier result drives skill-chain branching

In `src/skills/chain.ts`:

1. After `prd-evaluator`, if `intake.classification.scenario === "ambiguous"`
   AND `confidence < 0.5`, short-circuit with a `kind: "clarify"` result that
   carries the classifier's `needsClarify` question. This is in addition to
   the PRD evaluator's clarify gate.
2. Pass `intake` into `composeSystemPrompt` as a new field. Composer is the
   only stage that needs to branch on `scenario`.
3. `validator.ts` learns one new rule: if `intake.auditTrail.required`, the
   parsed output must reference one of the known audit-bearing blocks
   (`inline-edit-with-audit` or `image-editor-with-audit`). Otherwise emit a
   high-severity validation error.

## Error handling

All four modules are designed to never throw. Still, wrap each call in
`.catch()` and surface a `logger.warn("intake.<module> failed", err)` so we
can spot scanners that silently regress on a new repo layout. Empty catalogs
are valid — the downstream chain treats them as "no information, fall back
to today's behaviour".

## Smoke checklist before deleting this TODO

- [ ] `scanBeCatalog` returns a non-empty catalog against
      `~/Work/dash/next-backoffice-web`.
- [ ] `scanBeCatalog` returns a non-empty catalog against
      `~/Work/dash/next-portal-v2-web`.
- [ ] `scanBeCatalog` returns a non-empty catalog against
      `~/Dash/halo-dash-be`.
- [ ] `readDbSchema` returns Prisma tables for `ts-delivery-service-main`.
- [ ] Three sample prompts (FE-only / extend-BE / extend-DB) classify into
      the expected scenarios with confidence ≥ 0.7.
- [ ] CR-3 trigger fires on "edit mitra topup balance" and routes to
      `inline-edit-with-audit`.
- [ ] CR-3 trigger fires on "upload KTP proof" and routes to
      `image-editor-with-audit`.
