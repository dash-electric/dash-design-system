# Dash Build PRD — Workspace, Repo Sync, and DS Evolution

## Problem

Dash Build already proves that rough prompts can be normalized into governed generation for existing Dash repos. But the current product is still too close to a single local chat + preview loop.

That creates four product risks:
- multiple users working in parallel have no durable workspace/project/thread structure
- generated output can drift from repo reality because upstream changes are not tracked visibly
- publish/branch safety is under-modeled, which is risky once more than one person uses the system
- missing Dash components/blocks are handled ad hoc instead of feeding back into the design system

If we stop at generate + preview, Dash Build will produce interesting demos but weak operational trust.

## Primary User

Primary user: internal Dash product builders — product designers, PMs, operators, and engineers who want to improve existing Dash products without manually stitching together context across repos, docs, and design rules.

Secondary users:
- workspace/admin owners managing repos, auth, and publish safety
- DS maintainers reviewing reusable component/block candidates

## Objective

Turn Dash Build into a trustworthy internal workspace for multi-user product change creation on top of existing Dash repos, with:
- isolated work per project/thread/run
- clear preview vs publish states
- repo sync awareness when upstream changes
- explicit DS gap and candidate feedback loops

## Scope

### In Scope
- workspace/project/thread/run product model
- branch-safe publish model and stale awareness
- repo sync direction via Git/GitHub events
- dashboard visibility for running work and publish state
- DS gap / component candidate / block candidate capture
- design governance emphasis through `design.md` and docs quality

### Out of Scope
- full enterprise RBAC beyond minimum internal roles
- automatic merge to `main`
- automatic DS promotion without human review
- production-grade billing/cost controls
- non-Dash generic productization

## Non-Goals
- replacing GitHub as the source of truth for code review
- becoming a general-purpose greenfield site builder
- solving every repo fidelity problem before run/workspace state exists
- replacing Dash DS ownership with fully autonomous LLM decisions

## User Stories

1. As a product designer, I want Dash Build to preserve real repo layout and design rules so preview output feels trustworthy enough to review visually.
2. As a PM or operator, I want to see which project/thread/run is active so I do not lose track of parallel work.
3. As an engineer or publisher, I want each run tied to a safe branch/base commit so `main` stays protected.
4. As a workspace owner, I want Dash Build to know when upstream repo changes make a run stale.
5. As a DS maintainer, I want missing components/blocks to show up as reviewable candidates instead of one-off hidden code.

## Acceptance Criteria

1. Dash Build product docs define durable objects for Workspace, Project, Thread, Run, Context Pack, and Artifact.
2. The builder distinguishes `Preview` from `Publish` in both product model and technical design.
3. A run can be associated with repo, branch/worktree, base commit, and status.
4. Product docs define how upstream repo changes mark runs/artifacts stale.
5. Product docs define a DS feedback loop for `component candidate`, `block candidate`, and `DS gap`.
6. Product docs explicitly treat `design.md` as an active governance artifact, not optional documentation.
7. Multi-user concurrency is acknowledged in product behavior, especially around run visibility and publish control.
8. No scope in this PRD assumes full autonomous publish to production.

## Open Questions

- For the first internal multi-user release, do we want branch-per-run, worktree-per-run, or hybrid depending on repo size?
- Should DS candidates be reviewed inside Dash Build dashboard first, or still through docs/PR review only?
- Which webhook events are mandatory for V1 stale detection: `push`, `pull_request`, `installation`, `repository`?
- Do we want one workspace for all Dash internal teams first, or one workspace per tribe/product line?
