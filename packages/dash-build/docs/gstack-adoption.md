# Dash Build gstack Adoption

Status: adopted operating contract for Dash Build planning and docs.
Source models: `garrytan/gstack` for artifact sequencing and
`nexu-io/open-design` for active design-system, discovery, progress, and
critique discipline. Do not vendor or copy either repo wholesale; Dash Build
keeps its own Dash-specific artifacts, rules, and Skill v4 context.

## Why Adopt

Dash Build users type raw intent, not complete specifications. Prompts often
look like:

> "Gua mau bikin page performance mitra buat HR lihat suspend resign gitu2."

That is enough to begin discovery, but not enough to safely generate code. The
builder must turn rough intent into stable context before implementation. The
adopted gstack idea is not "more prompts"; it is a sequence of artifacts where
each stage hands a clearer contract to the next stage.

## Adopted Principle

Dash Build follows:

```
Think -> Plan -> Design -> Engineer -> Build -> Review -> QA -> Ship -> Learn
```

This maps to gstack's software-factory workflow, but with Dash-specific names:

| gstack pattern | Dash Build adaptation | Output |
| --- | --- | --- |
| `/office-hours` | `dash-intake` | normalized intent + clarifying questions |
| `/plan-ceo-review` | `dash-prd-review` | product scope, user, objective, non-goals |
| `/plan-design-review` | `dash-design-review` | design brief constrained by `design.md` |
| `/plan-eng-review` | `dash-trd` | implementation plan, state, tests, risks |
| `/review` | `dash-review` | diff review + scope-drift detection |
| `/qa` / `/qa-only` | `dash-qa` | browser QA + runbook verification |
| `/document-release` | `dash-doc-release` | README / changelog / docs sync |
| `/learn` | `dash-learn` | reusable project and domain learnings |

## Non-Goals

- Do not install gstack as a hard runtime dependency for Dash Build.
- Do not replace Dash Skill v4, `dash-prd`, or `design.md`.
- Do not force every user through a long interview.
- Do not block simple, safe, obvious tasks behind heavyweight planning.
- Do not edit consumer repos directly during planning. Consumer repos remain
  target context; generated changes are reviewed before PR.

## Default Gates

Dash Build may proceed without asking only when the prompt has enough signal for
all required gates.

| Gate | Must know | Ask if missing |
| --- | --- | --- |
| Intake | target repo, user role, feature surface | Yes |
| PRD | objective, user job, acceptance criteria, non-goals | Yes |
| Design | audience, density, key states, source pattern | Yes for UI work |
| TRD | files/modules, data/API needs, state transitions, tests | Yes if code path unclear |
| Build | OpenAI/Codex auth, target repo, branch | Yes |
| QA | run command, URL, expected behavior | Yes if unknown |
| Ship | GitHub connected, PR target, docs status | Yes |

## Question Budget

Dash Build should ask the smallest number of questions that prevents wrong
generation.

- `0 questions`: typo/copy/layout fix with obvious repo and component.
- `1-2 questions`: normal feature prompt with one ambiguity.
- `3-5 questions`: cross-surface feature, role-sensitive UI, data/API unknown.
- `stop and ask for PRD`: legal/financial/audit-heavy scope or unclear owner.

Questions must be outcome-framed. Example:

Bad:

> Is this mitra-facing?

Good:

> Who sees this page: internal HR/backoffice or mitra themselves? This decides
> whether we use internal ops voice or formal `Anda` voice.

## Required Artifact Flow

Every generation session should be able to produce these artifacts, even if some
are compressed in memory for small tasks:

1. `intake` — normalized prompt, repo, role, ambiguity list.
2. `prd` — problem, user, objective, scope, non-goals, acceptance criteria.
3. `design` — design brief using `design.md`, Layer 0, theme mapping.
4. `trd` — implementation path, data/API, states, tests, risks.
5. `build` — generated files + explanation.
6. `review` — policy checks, scope drift, missing tests.
7. `qa` — runbook/browser checks + pass/fail.
8. `release` — PR/docs/changelog status.
9. `learn` — reusable pattern or pitfall discovered.

## How This Changes Dash Build

Current Day 1-3 chain:

```
prompt -> dash-prd -> design.md -> Skill v4 -> Codex -> validate -> preview
```

Adopted chain:

```
raw prompt
  -> dash-intake
  -> clarification gate
  -> dash-prd artifact
  -> dash-design artifact
  -> dash-trd artifact
  -> Skill v4 + Codex
  -> dash-review
  -> dash-qa
  -> preview / PR
  -> dash-doc-release + dash-learn
```

The important change is that `design` and `Skill v4` consume richer context
instead of guessing from one raw paragraph.

## Open Design Additions

Open Design reinforces the parts Dash Build needs most for rough user prompts:

- Treat an active design-system file as authority. For Dash this is root
  `design.md`, plus Layered Architecture and registry rules.
- Ask a compact discovery form only when blockers exist. Do not ask taste
  questions when the Dash contract already decides the direction.
- Keep deterministic design direction choices as a fallback for unknown,
  non-Dash surfaces, not the normal Dash path.
- Show stage progress in the canvas so the user can tell whether the run is in
  PRD, design, Skill, Codex, validate, or preview.
- Run design critique before preview is marked ready.

See `docs/open-design-reference.md` for the local reference adoption notes.
