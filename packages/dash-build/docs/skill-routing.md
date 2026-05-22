# Dash Build Skill Routing

This is the routing contract for Dash Build's gstack-inspired workflow.

## Built-in Dash Build Stages

| Stage | When to run | Artifact |
| --- | --- | --- |
| `dash-intake` | every prompt | intake record |
| `dash-prd` | every feature/change request | PRD artifact |
| `dash-design-review` | UI, component, nav, page, visual behavior | design brief |
| `dash-trd` | before code generation | implementation plan |
| `dash-skill-v4` | generation context load | composed system prompt |
| `dash-design-critique` | before preview for UI work | critique report |
| `dash-review` | after generation | review report |
| `dash-qa` | after preview/build | QA runbook result |
| `dash-doc-release` | public surface/docs changed | docs sync |
| `dash-learn` | reusable pattern detected | learning entry |

## Installed Local Skills To Reuse

These skills exist in the user's local skill library and can inform Dash Build
or manual Codex work.

| Skill | Use in Dash Build |
| --- | --- |
| `shape` | UX planning before UI code |
| `impeccable` | high-quality frontend implementation standards |
| `tailwind-design-system` | token/component system work |
| `web-design-guidelines` | UI best-practice review |
| `audit` | a11y/performance/theming/responsive report |
| `scoutqa-test` | exploratory website QA |
| `polish` | final alignment/spacing pass |
| `layout` | layout and hierarchy fixes |
| `typeset` | typography fixes |
| `adapt` | responsive adaptation |
| `critique` | UX critique |
| `optimize` | frontend performance |
| `shadcn-ui` | only for repos where shadcn is already allowed |

## Routing Rules

### Raw Product Idea

Run:

```
dash-intake -> dash-prd -> dash-design-review? -> dash-trd
```

Ask only for blockers.

### UI Feature

Run:

```
dash-intake -> dash-prd -> dash-design-review -> dash-trd -> dash-skill-v4 -> dash-design-critique
```

Design review is mandatory when prompt mentions page, nav, table, chart, modal,
form, dashboard, empty state, or visual polish.

### API / Backend Feature

Run:

```
dash-intake -> dash-prd -> dash-trd -> dash-skill-v4
```

Design review is optional unless there is a user-facing state.

### Bug Fix

Run:

```
dash-intake -> dash-trd-light -> dash-skill-v4 -> dash-review -> dash-qa
```

Do not expand scope unless the bug reveals a product ambiguity.

### Docs / NPM / Release Work

Run:

```
dash-intake -> dash-trd-light -> dash-doc-release
```

No design review unless docs include UI screenshots or onboarding flow.

## Clarification Policy

Ask when the answer changes implementation. Do not ask for routine defaults that
Dash Build can infer safely.

Good clarification categories:

- repo/branch ambiguity
- primary user ambiguity
- data source/API ambiguity
- mutation vs read-only ambiguity
- design pattern ambiguity
- compliance/audit ambiguity
- active design-system ambiguity when no Dash `design.md` or repo pattern can be
  loaded

Bad clarification categories:

- asking the user to restate the same prompt
- asking about implementation details the agent can discover
- asking taste questions for internal admin tools unless two viable patterns
  have materially different outcomes

## Design-System Routing

Dash Build follows an Open Design-style active design-system rule:

1. If root `design.md` loads, use it as the active Dash design system.
2. If repo-specific Dash tokens/components exist, merge them below `design.md`.
3. If no Dash design contract exists, offer deterministic direction choices.
4. If the user provides a brand/reference source, extract tokens and layout
   posture into the design artifact before Codex generation.

For normal Dash repos, the user should not need to pick a visual style. The
system already knows the product character; clarification should focus on role,
data, scope, and risk.

## Completion Definition

A Dash Build run is complete when:

1. preview renders or failure is explained
2. review report exists
3. QA result exists or skipped with reason
4. generated files map back to acceptance criteria
5. GitHub PR is created or local-only output is clearly marked
6. UI work includes critique and state coverage
