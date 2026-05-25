# Dash Build Workspace + Sync + DS Evolution Implementation Plan

> **For Hermes / Claude Code:** execute in small, reviewable slices. Do not jump to full platform rewrite.

**Goal:** Evolve Dash Build from a single-run local preview tool into a multi-user builder workspace with branch-safe execution, repo-sync awareness, and design-system evolution feedback loops.

**Architecture:** Keep the current `packages/dash-build` daemon + preview pipeline as the nucleus. Add durable workspace/project/thread/run objects, repo event ingestion, branch-aware publish safety, and DS gap capture as layered capabilities rather than rewriting the generator core.

**Tech Stack:** Node.js daemon, local JSON -> SQLite/Postgres migration path, GitHub App/webhooks, local git worktrees or isolated branches, Dash DS docs/registry as active design authority.

---

## North Star

Dash Build should become an internal multi-user AI workspace for Dash teams where users can:
- work inside a known project/repo context
- generate safely without touching `main`
- preview truthfully in the target repo shell
- understand when output is stale because upstream changed
- surface missing DS components/blocks as reusable candidates
- push accepted learnings back into Dash docs/registry

## Product Principles

1. **Preview truthfulness before platform breadth**
   - No fake confidence.
   - If fidelity is partial, say so in-product.
2. **Branch safety by default**
   - Never treat `main` as the working surface.
3. **Context is frozen, not guessed live forever**
   - Every run should know which repo state and design contract it used.
4. **Design system is active infrastructure**
   - `design.md` is not decorative docs. It is the UI governance contract.
5. **DS gaps are product signals**
   - Missing components/blocks should become tracked candidates, not hidden one-offs.
6. **Multi-user visibility matters**
   - Users must see what is running, stale, published, blocked, or superseded.

---

## Phase Plan

### Phase P0.1 — Preview Truthfulness Hardening

**Objective:** Make current Backoffice and Portal v2 previews trustworthy enough for internal testing.

**Outcomes:**
- single source of truth for repo preview metadata
- route/nav labels closer to real repos
- duplicate-shell validation
- explicit repo-aware preview constraints

**Files / Areas:**
- `src/daemon/repo-preview.ts`
- `src/skills/prompt-composer.ts`
- `src/skills/validator.ts`
- `src/skills/chain.ts`
- preview-related tests

**Exit criteria:**
- Backoffice and Portal preview no longer look like the same generic shell
- generated `preview.tsx` cannot silently render duplicate app chrome
- manual screenshots look repo-recognizable at first glance

### Phase P1 — Workspace + Run Model

**Objective:** Stop treating Dash Build like one endless chat.

**Outcomes:**
- Home / Projects / Threads / Runs model in docs and runtime state
- prompt records upgraded to durable project/thread/run records
- top bar shows project, repo, branch, auth, environment
- run queue shows ownership + status

**Implementation slices:**
1. persist project/thread/run IDs in daemon state
2. create disk-backed artifact folders per run
3. add Home view and project shell framing
4. split `Preview` vs `Publish`

**Exit criteria:**
- a user can return to a project and see its runs
- multiple threads can exist in one repo without context confusion

### Phase P1.5 — Branch Safety + Publish Control

**Objective:** Allow many users to work safely without colliding on `main`.

**Outcomes:**
- each run has base commit + working branch/worktree
- publish requires latest-base validation
- publish actions can be locked briefly per project/target branch
- publish status is visible in UI

**Implementation slices:**
1. define branch naming contract
2. store `baseCommit`, `headCommit`, `publishRecord`
3. add publish preflight checks
4. add stale/conflict banners

**Exit criteria:**
- 3 users can generate in parallel without pretending they are editing the same surface safely
- publish is explicit and reviewable

### Phase P2 — Repo Sync + Automation

**Objective:** Keep Dash Build aware of upstream repo change.

**Outcomes:**
- GitHub webhook ingestion for push/merge/install events
- repo snapshot / sync status per project
- runs/artifacts marked stale when base moves
- event stream visible in dashboard

**Implementation slices:**
1. define repo connection object
2. ingest webhook events
3. update project sync state + stale markers
4. re-index repo facts/context pack as needed

**Exit criteria:**
- when upstream changes, users can see which runs are outdated
- Dash Build stops pretending old output is still current

### Phase P2.5 — DS Gap Capture + Candidate Lane

**Objective:** Make Dash Build help evolve Dash DS, not only consume it.

**Outcomes:**
- run output can mark `component candidate`, `block candidate`, `DS gap`
- inspector/dashboard shows candidate queue
- docs/registry update path is explicit
- one-off UI and reusable DS contribution are separated

**Implementation slices:**
1. add candidate metadata to artifacts
2. create DS review queue states
3. define acceptance path into docs/registry
4. add learn/review checklist for DS promotion

**Exit criteria:**
- new UI primitives are not silently invented and forgotten
- DS debt becomes visible and reviewable

### Phase P3 — Admin / Team Control Plane

**Objective:** Make Dash Build operable as an internal team product.

**Outcomes:**
- workspace members / roles
- usage and run visibility
- project permissions
- DS review / publish approvals
- cost and automation monitoring

---

## UI / UX Priorities

Because UI quality is a first-class concern for this product, every phase should preserve these rules:
- the builder UI itself must feel like disciplined Dash software, not generic AI SaaS
- project shell, inspector, queue, and preview states should be dense, operational, and honest
- `design.md` must be maintained as an active contract whenever the builder shell or DS evolution lane changes
- docs app gaps are not cosmetic debt; they directly reduce model quality and preview trust

---

## Immediate Next Slice

1. Finish P0.1 preview truthfulness hardening.
2. Lock PRD/design/TRD for Workspace + Sync + DS Evolution.
3. Implement the smallest viable project/thread/run persistence layer.
4. Introduce branch-safe publish states before broadening user access.

---

## Suggested Commit Strategy

- Commit 1: `docs: add Dash Build workspace/sync/DS evolution plan`
- Commit 2: `docs: add Dash Build PRD + design brief + TRD`
- Commit 3+: implementation commits per phase slice

---

## What Not To Do Yet

- do not rewrite generator core just to fit future architecture
- do not build pixel-perfect repo adapters before run/project state exists
- do not auto-promote DS candidates into registry without review
- do not expose multi-user publish without branch/base validation
