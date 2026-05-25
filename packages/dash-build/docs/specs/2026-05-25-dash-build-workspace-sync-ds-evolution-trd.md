# Dash Build TRD — Workspace, Repo Sync, and DS Evolution

## Target Repo

- Primary: `packages/dash-build`
- Supporting design authority: root `design.md`, `AGENTS.md`, `LAYERED-ARCHITECTURE.md`, docs/registry rules
- Target repos used as consumer context: `dash/backoffice`, `dash/portal-v2`, later other Dash repos

## Files / Modules

### Existing docs to align with
- `packages/dash-build/docs/product-model.md`
- `packages/dash-build/docs/artifact-contracts.md`
- `packages/dash-build/docs/gstack-adoption.md`
- `packages/dash-build/docs/qa-and-review.md`

### Product/runtime areas likely to evolve later
- `src/daemon/state/*`
- `src/daemon/routes/*`
- `src/daemon/templates/*`
- `src/pipeline/*`
- `src/skills/*`
- `src/preview/*`
- future repo event ingestion module
- future persistent storage module

## Data & API

### Core entities
- `Workspace`
- `Project`
- `Thread`
- `Run`
- `ContextPack`
- `Artifact`
- `PublishRecord`
- `RepoConnection`
- `RepoSyncEvent`
- `DsCandidate`

### Required fields to add or formalize

#### Project
- `id`
- `workspaceId`
- `name`
- `mode`
- `repoFullName`
- `localRepoPath`
- `defaultBranch`
- `theme`
- `status`
- `syncStatus`
- `lastIndexedCommit`

#### Thread
- `id`
- `projectId`
- `title`
- `goal`
- `status`
- `activeRunId`

#### Run
- `id`
- `threadId`
- `prompt`
- `resolvedPrompt`
- `repo`
- `branch`
- `baseCommit`
- `headCommit`
- `contextPackId`
- `status`
- `staleReason`

#### Artifact
- `id`
- `runId`
- `type`
- `path`
- `metadata`
- `validationSummary`

#### DsCandidate
- `id`
- `runId`
- `type`: `component | block`
- `name`
- `reason`
- `targetTheme`
- `status`: `candidate | approved | rejected | one_off`

### Event / automation API direction
- webhook endpoint for GitHub App events
- repo sync event persistence
- stale recalculation when tracked branch head changes
- optional manual refresh endpoint for local-only repos

## State Model

### Run lifecycle
- `planning`
- `clarifying`
- `queued`
- `generating`
- `preview_ready`
- `needs_review`
- `publish_blocked`
- `published`
- `failed`
- `stale`
- `superseded`

### Publish state rules
- preview can exist without GitHub auth
- publish requires repo authorization
- publish checks latest target branch/base commit
- publish may lock target branch/project briefly during PR open

### DS candidate state rules
- a run may emit zero or more DS candidates
- candidates are review artifacts, not immediate registry writes
- one-off feature code should be kept separate from approved DS promotion

## Interaction Flow

### Planning / generation
1. User selects or creates project.
2. User opens thread.
3. Prompt goes through intake -> PRD -> design -> TRD -> build.
4. Context pack is frozen for the run.
5. Preview artifact is generated.
6. Validation + DS candidate detection run.

### Publish
1. User reviews preview + validation + touched files.
2. System checks current repo head vs run base commit.
3. If stale, block or require refresh/rebase path.
4. If valid, create branch/worktree commit + PR record.

### Repo sync
1. Upstream repo push/merge event arrives.
2. System maps event to project(s).
3. If tracked branch moved beyond run base commit, mark impacted runs stale.
4. UI updates queue + inspector badges.

### DS evolution
1. Generator cannot find suitable DS component/block.
2. Run records `DS gap` and emits candidate artifact metadata.
3. Reviewer inspects candidate.
4. If approved, docs/registry follow-up work is created.

## Edge Cases

- local repo only, no GitHub webhook available
- multiple users generating in same project but different threads
- one user publishing while another run becomes stale
- repo preview auth blocked but patch preview still valid
- DS candidate detected in a run that never gets published
- docs/registry missing pattern causes repeated one-off generation

## Tests

### Product/documentation-aligned engineering slices later
- state normalization tests for project/thread/run persistence
- stale detection unit tests using base/head commit mismatch
- publish gate tests for latest-base validation
- webhook mapping tests for repo -> project sync state
- DS candidate detection tests
- UI tests for queue/status badges and inspector summaries

### Current immediate quality gate
- keep P0.1 preview truthfulness tests green
- any future workspace/sync implementation must map tests back to PRD acceptance criteria

## Rollout / Risk

### Key risks
- over-building the platform before preview trust is solved
- docs becoming aspirational and drifting from runtime behavior
- DS candidate lane creating noise if heuristics are weak
- stale detection annoying users if it is too noisy or too late

### Rollout suggestion
1. finish P0.1 preview truthfulness
2. add docs + object model alignment
3. implement persistence and run shell first
4. add publish safety next
5. add repo sync automation after object model is stable
6. add DS candidate lane after preview + publish state are trustworthy
