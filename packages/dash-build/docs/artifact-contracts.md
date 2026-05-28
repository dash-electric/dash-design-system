# Dash Build Artifact Contracts

Dash Build should not pass raw prompt text directly into generation. Each stage
emits a small, structured artifact that the next stage consumes.

## 1. Intake

Purpose: normalize rough user text and identify blockers.

Required fields:

- original prompt
- normalized intent
- target repo and theme
- primary user
- surface type
- known facts
- assumptions
- ambiguities
- clarification answers

## 2. PRD

Purpose: product clarity before design or code.

Template:

```md
# Dash Build PRD — {feature}

## Problem

## Primary User

## Objective

## Scope

## Non-Goals

## User Stories

## Acceptance Criteria

## Open Questions
```

Minimum pass criteria:

- problem and objective are not identical
- primary user is explicit
- scope and non-goals both exist
- at least 3 acceptance criteria for a feature
- no unresolved blocker questions

## 3. Design Brief

Purpose: prevent generic UI and enforce Dash DS consistency.

Template:

```md
# Dash Build Design Brief — {feature}

## Audience & Context

## Existing Pattern To Reuse

## Layout Strategy

## Key States

## Components / Blocks

## Token & Theme Requirements

## Accessibility Notes

## Anti-Patterns To Avoid
```

Minimum pass criteria:

- cites `design.md`
- cites theme mapping (`ride`, `logistic`, etc.)
- lists loading, empty, error, and success states
- identifies whether this is a new Layer 3 block or consumer-app change
- no raw accent hex in proposed UI

## 4. TRD

Purpose: give Codex an implementation spine.

Template:

```md
# Dash Build TRD — {feature}

## Target Repo

## Files / Modules

## Data & API

## State Model

## Interaction Flow

## Edge Cases

## Tests

## Rollout / Risk
```

Minimum pass criteria:

- target files/modules are named or discovery task is explicit
- data source is real or marked mock-only
- risky transitions have failure states
- tests map to acceptance criteria

## 5. QA Runbook

Purpose: verify the generated output like a user.

Template:

```md
# Dash Build QA Runbook — {feature}

## Pre-flight

## Browser Flow

## API / State Checks

## Responsive Checks

## Accessibility Checks

## Expected Output

## Regression Tests
```

Minimum pass criteria:

- includes local URL or command
- includes at least one happy path and one edge path
- says what pass/fail looks like
- captures screenshot/preview expectation for UI work

## 6. Review Report

Purpose: catch scope drift and policy violations.

Checks:

- implemented acceptance criteria
- no out-of-scope files
- no banned imports
- no design token violations
- tests added or consciously skipped
- docs updated if public surface changed

## 6b. Additive-only patch policy (Sprint 2C)

Purpose: enforce cardinal rule #1 ("Existing Dash production code is NEVER
modified — this repo is purely ADDITIVE") at the orchestrator level. The
generator may emit unified-diff patches against existing files; without a
gate, an AI hallucination can silently refactor, rename, or delete code.

### Validator location

`src/pipeline/patch-validator.ts` — no external deps, regex-only algorithm.

### Validation flow

```
orchestrator.processPrompt
  → for each ParsedPatch:
      validatePatch(patch, DEFAULT_PATCH_ALLOWLIST)
        ok?   → safePatches.push(patch)   → flows into PatchApplier
        !ok?  → rejectedPatches.push(...) → surfaced via WS + chat UI
```

The validator is **lenient by design** — it allows the safe-additive shapes
we actually want and rejects only the structural modifications.

### Default allowlist

Safe file patterns (deletions allowed because they are typically re-emitted
trailing punctuation around a new entry):

- `routes.{ts,tsx,js,jsx}`
- `nav-config.{ts,tsx,js,jsx}`
- `index.{ts,tsx,js,jsx}` (barrel exports)
- `menu.{ts,tsx,js,jsx}`
- `registry.json`
- `*.config.{ts,tsx,js,jsx}`

Protected file patterns (patches always rejected):

- `**/auth/**` — login, session, JWT
- `**/payment/**` — checkout, refund, ledger
- `**/middleware.{ts,tsx,js,jsx}` — Next.js middleware
- `**/lib/api.*` — core API client
- `.env*` — environment files

### Rejection reasons

| Reason                    | When triggered                                                |
|---------------------------|---------------------------------------------------------------|
| `modifies-existing-logic` | Patch deletes a line starting with `function`/`class`/`const`/`let`/`var`/`interface`/`type`/`enum` |
| `renames-identifier`      | Paired delete/add changes the identifier after a binding kw   |
| `removes-export`          | Patch deletes a line starting with `export`                   |
| `deletes-code`            | Non-trivial deletions in a non-allowlisted file               |
| `touches-protected-path`  | File path matches a protected pattern                         |
| `malformed-patch`         | Patch body has no `@@` hunk header                            |

### How rejection surfaces to the user

1. Per-patch `logger.warn("patch rejected by additive-only validator", …)`.
2. WS broadcast `patches:rejected` event with `{promptId, count, rejected[]}`.
3. Artifact stamped with `rejectedPatches: RejectedPatch[]`.
4. Chat thread renders a `.db-rejected-patches` panel with the file path,
   human-readable reason, and a hint suggesting "create a new file or use a
   safe append pattern".

### How users should rephrase rejected prompts

- "Refactor `Button` to support a `loading` prop" → instead ask for "Create
  a new `LoadingButton` wrapper that composes `Button` with the loading state".
- "Rename `useAuth` to `useSession`" → instead ask for "Add `useSession` as
  a new export that re-exports `useAuth` for migration purposes".
- "Remove the deprecated `formatLegacy` export" → instead ask for "Add a
  deprecation comment to `formatLegacy` and document the replacement".

### Extending the allowlist

`DEFAULT_PATCH_ALLOWLIST` is exported from `patch-validator.ts`. To add a
project-specific safe pattern, the orchestrator constructor would need a
new injection point — currently the default is used directly. Adding a
constructor option `patchAllowlist?: PatchAllowlist` is a 5-line change
when needed; deferred until the first real ask.

## 7. Learnings

Purpose: avoid asking the same question forever.

Examples:

- "If prompt says HR manages mitra, default internal backoffice unless user says
  mitra-facing."
- "backoffice repo uses Next Pages Router + JS + NextAuth."
- "Performance/status pages should include empty, stale, and partial-data states."

