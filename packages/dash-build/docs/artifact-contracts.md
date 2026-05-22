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

## 7. Learnings

Purpose: avoid asking the same question forever.

Examples:

- "If prompt says HR manages mitra, default internal backoffice unless user says
  mitra-facing."
- "backoffice repo uses Next Pages Router + JS + NextAuth."
- "Performance/status pages should include empty, stale, and partial-data states."

