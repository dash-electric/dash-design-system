# Clone Preview Bug Fix — 2026-05-26

## Original pain (from user screenshot)

User clicked "Activate clone preview" against `dash/backoffice`. The
bootstrap cascade reported "clone applied + shim done", but the canvas iframe
kept loading `https://stg-back-office.dashelectric.co/delivery` (staging) with
the **yellow auth-warning ribbon** on top. End result: the iframe rendered
the staging login wall, not the local shim'd clone.

Expected: canvas should swap to `http://127.0.0.1:3101/delivery` (local
clone) with the auth-bypass shim active and a **green clone ribbon**.

## Root cause

The fix was split into three parallel tracks (F1 / F2 / F3). F2 and F3 landed
intact, but **F1 was missing**. Specifically:

- F2 (resolver) was wired to read `sandboxState.devServerPort` and pick
  `sourceMode: "sandbox-clone"` when state is `clone_running`.
- F3 (orchestrator + client) was wired to cascade `runBootstrap →
  workspace.startDevServer({ port })` and broadcast
  `sandbox:dev_server_starting / _ready / _failed` lifecycle events.
- F1 (`Workspace.startDevServer / stopDevServer`) was **never implemented**.
  The orchestrator called it via defensive duck-typing
  (`typeof startDev !== "function"`), silently skipped the spawn, and the
  sandbox state never transitioned past `idle` → `clone_running`. The
  resolver therefore never picked `sandbox-clone` mode and the canvas fell
  back to the staging URL.

Additional latent bugs found during the audit:

1. `SandboxStateValue` (in `src/daemon/state/types.ts`) was missing
   `clone_running` and `failed`. Persisting either of those state values
   would survive in memory but get **silently dropped** on daemon restart
   by `normalizeSandboxStateMap`'s allowlist.
2. `SandboxStatePersisted` had no `devServerPort` / `lastAction` /
   `devServerError` fields, so the dashboard badge's F3 progress/error
   variants could never be reproduced across a daemon restart.
3. The live-preview-pane sandbox-clone ribbon didn't surface port-shift
   information, so a user whose `:3101` was busy would see a `:3102` URL
   without explanation.

## Changes shipped

### F1 (new) — `Workspace.startDevServer / stopDevServer`
File: `packages/dash-build/src/runs/workspace.ts`

- Spawns `npm run dev -- -p <port>` against the clone via a replaceable
  `devServerSpawn` seam (tests inject a fake to avoid running npm).
- TCP port probe (`node:net.createServer().listen`) finds the next free
  port if the requested one is busy, bounded by
  `DEV_SERVER_PORT_PROBE_LIMIT = 10`.
- HTTP readiness probe polls `127.0.0.1:<port>` every 500ms until the
  dev server answers, with a `DEV_SERVER_READY_TIMEOUT_MS = 60_000`
  deadline.
- On success: transitions `idle → clone_running`, stores a
  `DevServerInfo` snapshot exposed via `Workspace.devServer()`.
- On crash post-ready (`child.on("exit", code !== 0 && signal !== SIGTERM)`):
  rolls state back to `idle`, fires `onDevServerEvent({ kind: "crashed" })`,
  which the orchestrator translates into a `sandbox:dev_server_crashed`
  broadcast.
- `stopDevServer()`: graceful SIGTERM → 5s wait → SIGKILL fallback.
- `tearDown()` now calls `stopDevServer()` first so the stale sweeper
  doesn't race against a zombie child.

### Orchestrator — dev-server broadcast wiring
File: `packages/dash-build/src/pipeline/orchestrator.ts`

- New `wireDevServerBroadcast(workspace)` method subscribes to
  `Workspace.onDevServerEvent`. On `crashed` it broadcasts
  `sandbox:dev_server_crashed` and persists `lastAction: "dev_server_crashed"`
  + `devServerPort: null` + `devServerError` so the badge can render the
  retry variant across a daemon restart.
- `wireSandboxBroadcast` now also persists `devServerPort` on
  `clone_running` transitions by reading `workspace.devServer().port`.
- Both DI and runtime workspaces auto-subscribe (idempotent).

### Client — crash toast + starting countdown
File: `packages/dash-build/src/daemon/templates/client/app.ts`

- New WS handler for `sandbox:dev_server_crashed` shows an actionable
  error toast.
- New `ensureStartingTick()` setInterval (5s) updates the badge label to
  "Starting dev server… (15s)" while
  `[data-action="dev_server_starting"]` is present. Auto-stops when the
  badge re-renders into a different state. Wired into `refreshDashboard()`
  via a wrapper so post-swap the ticker re-evaluates.

### State persistence — type alignment
File: `packages/dash-build/src/daemon/state/types.ts`

- Added `clone_running` and `failed` to `SandboxStateValue`.
- Added matching entries in `VALID_SANDBOX_STATES` so
  `normalizeSandboxStateMap` no longer drops these on reload.
- Extended `SandboxStatePersisted` with `devServerPort?`, `lastAction?`,
  `devServerError?`. Backward-compat: all optional with null defaults so
  older state.json files load cleanly.

### Live-preview-pane — port-shift UX
File: `packages/dash-build/src/daemon/templates/components/live-preview-pane.ts`

- Sandbox-clone ribbon now compares `info.port` vs
  `info.metadata.defaultPort`. When shifted: appends
  `port shifted from :3101`, adds `data-port-shifted="true"` attr, and
  surfaces an explanatory tooltip on the ribbon element.

## Verification done in this agent

- **Code audit:** F1 confirmed missing; F2 + F3 confirmed wired but
  ungrounded. Also caught the `SandboxStateValue` allowlist bug + missing
  persisted dev-server fields.
- **Unit tests:** 29/29 passing — 18 workspace tests (6 new for
  `startDevServer`/`stopDevServer`/crash handler/tearDown) and 11
  live-preview-pane tests (6 new for port-shift hint + state coverage).
- **Smoke test:** Ran the real `Workspace` class against the existing
  clone at `~/Work/dash-build-clones/dash__backoffice` with a fake
  spawn. Verified: idle → clone_running transition, snapshot exposed via
  `devServer()`, crash handler rolls back to idle and fires the
  `onDevServerEvent({ kind: "crashed" })` hook. Result: **PASS**.
  Cleanup confirmed (no `/tmp/dash-build-smoke.*` left over).
- **Typecheck:** Clean (one pre-existing failure in `owner/ai/branch-review.ts`
  unrelated to this fix — S3B file).
- **CSS audit:** `node scripts/audit-css.mjs` → 0 raw hex violations.

## Manual verification checklist for the user

This bug fix is **observable in a browser**, not via curl — the dashboard
HTML is composed at request time + driven by WebSocket pushes. Run the
following manual flow:

1. Build + relaunch the daemon:
   ```
   cd packages/dash-build && pnpm build && node dist/bin.js
   ```
2. Open `http://127.0.0.1:7777/dashboard` (or whichever port your daemon
   uses — check stdout).
3. Select `dash/backoffice` from the repo picker.
4. Click **"Activate clone preview"** in the canvas.
5. **Expected within 5s:** topbar badge flips to primary tone + label
   reads `Starting dev server…`. Every 5s the label ticks
   `Starting dev server… (5s)`, `(10s)`, etc.
6. **Expected within ~30-60s** (Next.js first boot):
   - Badge swaps to green: `Clone live · :3101`.
   - Canvas iframe URL flips from staging to
     `http://127.0.0.1:3101/delivery`.
   - **Yellow auth ribbon is GONE.** The ribbon swaps to the success-toned
     green variant labelled `Clone preview · 127.0.0.1:3101 · shim active`.
   - You can navigate the iframe — protected routes render without the
     login wall because the shim's `PREVIEW_USER` bypass is active.
7. **Port-collision check** (optional): start a separate `python3 -m
   http.server 3101` BEFORE clicking activate. Expected: badge says
   `Clone live · :3102`, ribbon adds `port shifted from :3101`.
8. **Crash handling check** (optional): with the clone running, `kill -9
   <next-dev-pid>` from a shell. Expected: red error toast
   `Dev server crashed (port :3101) — click the badge to retry`, badge
   flips to error tone with "Click to retry" hint, canvas iframe goes
   blank (fallback). Click the badge → restart kicks via
   `POST /api/sandbox/restart-dev` → new lifecycle cycles green again.

## Caveats / known limitations

- **First boot is slow.** `npm run dev` against backoffice typically takes
  30-50s for the initial compile. The 60s readiness timeout in F1 is sized
  for this; an underpowered machine + cold cache could trip the timeout
  and surface as `Dev server failed to start — click the badge to retry`.
  Solution: bump `DEV_SERVER_READY_TIMEOUT_MS` or warm the clone via a
  prior manual `npm run dev` once.
- **Backoffice needs Firebase env vars.** Without them, `dev` will fail
  in `scripts/inject-firebase-config.js` BEFORE `next dev` runs. The
  crash handler will catch the exit and surface the retry badge, but the
  user needs to set the env (or use the alternative dev script that
  skips Firebase injection) for a successful boot.
- **Port shift is bounded at +10.** If a user has 10 background dev
  servers on `:3101..:3110`, the spawn rejects with `no free port in
  [3101, 3110]`. Realistic for a developer machine; can be raised by
  bumping `DEV_SERVER_PORT_PROBE_LIMIT`.
- **`failed` state is persistence-only.** It's not in the
  `SandboxStateMachine.ALLOWED` map — the orchestrator writes it directly
  to the Store via `setSafeSandboxState` when bootstrap fails. The badge
  reads it correctly; future code that wants to gate on `failed` should
  read Store, not the state machine.
