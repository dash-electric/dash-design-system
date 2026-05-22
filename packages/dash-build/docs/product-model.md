# Dash Build Product Model

Dash Build should behave like a product workspace, not a single endless chat.
The dominant use case is improving existing Dash products, but the model must
also support blank exploration for new products, templates, and design-system
experiments.

## Product Thesis

Dash Build is a multi-project AI builder for Dash surfaces. It should combine:

- Lovable-style prompt to preview feedback.
- Codex-style task history and reviewability.
- Framer-style project home, preview, and publish controls.
- Dash DS governance: PRD, design, skills, theme, validation, and publish gates.

The user should always know:

- Which project they are working in.
- Which repo/surface is targeted.
- Which run/chat is active.
- Whether output is just previewed, staged, or published.
- Which context the AI used before generating.

## Core Objects

### Workspace

Top-level tenant/account boundary.

Examples:

- Personal local workspace.
- Dash internal workspace.
- Future team workspace.

Workspace owns users, projects, OAuth connections, secrets, billing/usage, and
global policy.

### Project

A project is the durable container users return to.

Recommended fields:

- `id`
- `workspaceId`
- `name`
- `mode`: `existing-repo | blank-product | design-system`
- `repoFullName`
- `localRepoPath`
- `defaultBranch`
- `theme`: `shared | ride | logistic | travel | marketplace | outsourcing | trellis-*`
- `status`: `draft | active | archived`
- `createdBy`
- `createdAt`
- `updatedAt`

Project examples:

- `Backoffice`
- `Portal V2`
- `Ride Templates`
- `New Ops Console Concept`

### Thread

A thread is one conversation or feature exploration inside a project.

Threads allow multiple active efforts in the same repo without mixing context.

Recommended fields:

- `id`
- `projectId`
- `title`
- `goal`
- `status`: `planning | clarifying | generating | reviewing | published | archived`
- `activeRunId`
- `createdBy`
- `createdAt`
- `updatedAt`

Thread examples:

- `Performance Mitra page`
- `Payroll chart export`
- `Navbar information architecture cleanup`

### Run

A run is one generation attempt within a thread.

Recommended fields:

- `id`
- `threadId`
- `prompt`
- `resolvedPrompt`
- `repo`
- `branch`
- `contextPackId`
- `status`: `queued | clarifying | generating | preview_ready | needs_review | published | failed`
- `startedAt`
- `finishedAt`
- `error`

A thread can have many runs, but only one latest active output.

### Context Pack

Frozen input bundle consumed by the model.

Recommended fields:

- `id`
- `projectId`
- `threadId`
- `prdSummary`
- `clarificationAnswers`
- `designContractVersion`
- `skillManifestVersion`
- `repoFacts`
- `dataAssumptions`
- `theme`
- `createdAt`

This is the answer to the earlier concern: the AI should not jump straight from
thin prompt to Skill v3. It should gather enough context, freeze it, then let
design and skill generation consume that known context.

### Artifact

Generated output for a run.

Recommended fields:

- `id`
- `runId`
- `type`: `preview | file_patch | pr | design_note | validation_report`
- `path`
- `content`
- `metadata`

Artifacts should be persistable. In-memory-only artifacts make daemon restart
feel broken.

## First-Run Journey

Recommended entry flow:

1. Home shows projects and recent threads.
2. User clicks `New`.
3. User chooses:
   - `Improve existing repo`
   - `Start from blank canvas`
   - `Design system/template exploration`
4. If existing repo:
   - choose GitHub/local repo
   - choose target branch
   - confirm product/theme
   - show baseline preview if local dev server is available
5. If blank canvas:
   - choose product type, theme, and starting template
   - no GitHub required yet
6. User lands in a project thread with chat left, preview right, and project
   switcher/sidebar available.

Do not force repo selection before the user sees the app. The app can start on
Home, then ask for repo only when the user creates an existing-repo project.

## Main Builder Layout

Recommended layout:

- Left rail: projects, recent threads, running jobs.
- Center-left: current thread/chat.
- Center-right: preview canvas.
- Right inspector: context, files, validation, publish history.
- Top bar: project, repo/branch, environment, auth, usage.

The current two-pane chat is a good prototype, but it should become one screen
inside a broader project shell.

## Preview Model

Preview should have layers:

1. **Baseline Preview**
   - Shows selected repo local dev server before generation.
   - If dependencies/dev server are missing, show exact command and state.

2. **Generated Preview**
   - Uses `preview.tsx` as the primary sandbox artifact.
   - Must be self-contained and visual.
   - Should not depend on repo aliases or unavailable app shell imports.

3. **Patch Preview**
   - Shows generated files, diff, validation score, and design notes.
   - Used when the visual sandbox cannot mount full repo code.

4. **Live Repo Preview**
   - Future: apply patch to disposable worktree and run the real app.
   - Best fidelity, but requires isolated workspace and stronger safety rules.

The product should never show a blank canvas as success. If a visual preview
cannot mount, show a fallback card with file list, score, and failure reason.

## Preview And Publish Buttons

The builder should separate `Preview` and `Publish`.

### Preview

Preview means:

- generate or refresh sandbox output
- update canvas
- run validation
- keep changes local/unpublished

Preview can run without GitHub.

### Publish

Publish means:

- create a branch/worktree or GitHub branch
- commit generated files
- open PR or deploy draft preview
- record publish history

Publish should require repo authorization and explicit user approval.

Button states:

- `Preview`
- `Previewing...`
- `Preview ready`
- `Publish`
- `Publishing...`
- `PR opened`

## Multi-User Model

For multiple users, treat Dash Build like a collaborative workspace.

Minimum needs:

- User identity.
- Workspace membership.
- Project permissions.
- Run ownership.
- Shared artifact storage.
- Event stream per project/thread.
- Locks for publish actions.

Suggested permission levels:

- `viewer`: can inspect projects, threads, previews.
- `builder`: can create threads and run previews.
- `publisher`: can publish/open PR.
- `admin`: can manage repos, auth, members, secrets.

Concurrency rules:

- Multiple users can chat/run previews in the same project.
- Each thread has isolated context.
- Publishing should require latest-base validation and may lock the target
  branch/project briefly.
- If two users generate competing patches, both remain as separate runs until
  someone publishes one.

## Running Work Management

Home should show a running work queue:

- project name
- thread title
- run status
- elapsed time
- owner
- last event
- cancel/resume action

Statuses:

- `Needs context`
- `Generating`
- `Preview ready`
- `Needs review`
- `Publish blocked`
- `Published`
- `Failed`

This is how users understand "what is running" without opening every chat.

## Data Storage Direction

Local prototype can use JSON files, but product shape should move to SQLite or
Postgres.

Tables:

- `workspaces`
- `users`
- `workspace_members`
- `projects`
- `threads`
- `runs`
- `context_packs`
- `artifacts`
- `auth_connections`
- `events`
- `publish_records`

Events are important because the UI needs real-time updates across tabs/users.

## Near-Term Implementation Plan

1. Persist generated artifacts on disk, not only memory.
2. Require `preview.tsx` for generated UI.
3. Add project/thread IDs to prompt records.
4. Add Home view with project list and running jobs.
5. Convert current dashboard into `/projects/:projectId/threads/:threadId`.
6. Split `Preview` and `Publish`.
7. Add repo/blank project creation flow.
8. Add context pack review before generation for vague prompts.

