# Dash Build Context Intake

This document defines how Dash Build should convert messy user intent into a
usable planning artifact.

## Input Reality

Dash users will not write perfect specs. Expect:

- casual Indonesian + English product terms
- typos and repeated letters
- implied repo/domain knowledge
- feature names without data source
- role words like "mitra", "HR", "ops", "finance" mixed together
- acceptance criteria hidden inside examples

The intake stage should preserve the user's original words, then normalize them
without changing intent.

## Intake Artifact

Each prompt gets an intake record:

```json
{
  "promptId": "prm_xxx",
  "originalText": "...",
  "normalizedIntent": "...",
  "targetRepo": "dash/backoffice",
  "targetTheme": "ride",
  "requestType": "feature|fix|refactor|docs|qa",
  "primaryUser": "internal HR",
  "surface": "page|modal|table|chart|navigation|api|unknown",
  "knownFacts": [],
  "assumptions": [],
  "ambiguities": [],
  "recommendedQuestions": []
}
```

## Clarification Triggers

Ask before generation when any row matches.

| Trigger | Why it matters | Example question |
| --- | --- | --- |
| role ambiguity | voice, density, data permissions | "Is this page for internal HR/backoffice or mitra themselves?" |
| target repo missing | wrong stack or files | "Which repo should receive this: backoffice or portal-v2?" |
| new nav entry | route and IA risk | "Where should the new nav item live?" |
| data source unknown | fake UI risk | "Should this use existing API/data or mock data for now?" |
| state/action unclear | dangerous workflow | "Is this dashboard read-only or can HR change mitra status here?" |
| audit/legal/financial | compliance risk | "Does any field here change legal/financial status?" |
| design direction missing | generic UI risk | "Should this match an existing page pattern or introduce a new dashboard pattern?" |

## Default Assumptions

Use these only when the prompt gives enough signal.

- If user says `HR`, `ops`, `backoffice`, or `admin`, default to internal ops
  UI voice.
- If user says `mitra-facing`, `driver`, `courier`, or "dilihat mitra", use
  formal `Anda` voice.
- If target repo is `dash/backoffice`, theme resolves to `ride` until the
  product split changes.
- If the feature mentions counts/statuses but no mutation, default to read-only
  dashboard.
- If data source is not named, mark it as an assumption and prefer mock data for
  local preview, not production code.

## Output Copy Rules

When asking users, keep language plain and close to their style, but make the
decision precise.

- Use one question at a time for blockers.
- Explain the consequence in one sentence.
- Offer recommended default when obvious.
- Persist answers into PRD/TRD artifacts so later stages do not ask again.

## Example

Original:

> Gua mau bikin page baru yang menambah entry point di navbarnyaa yang disebut
> performance mitra. Disini kita bisa lihat total mitra suspend resign. Objective
> user HR bisa manage mitra.

Normalized:

> Add an internal HR/backoffice page named `Performance Mitra`, reachable from
> navigation, showing mitra totals and status breakdowns such as suspended and
> resigned so HR can monitor/manage partner health.

Clarification:

> Is this page only for internal HR/backoffice? Recommended: yes, because the
> prompt says HR manages mitra. This keeps the UI internal-ops voice and avoids
> mitra-facing `Anda` rules.

