# Dash Build — First-Run Test Guide (2026-05-29)

> Goal: open Dash Build like a brand-new user, prompt against **backoffice**,
> and watch it generate a real Dash-DS change. Everything below is prepped —
> you just boot + log in to Codex + prompt.

## TL;DR — 3 commands

```bash
cd ~/Work/dash/dash-ds/packages/dash-build

# (once, in a second terminal) authenticate the model
codex login --device-auth

# clean-slate boot as a first-time user (archives old state, never deletes)
bash scripts/first-run-test.sh
# → open http://127.0.0.1:7777
```

To put your old history back afterwards:
```bash
bash scripts/first-run-test.sh --restore
```

## What the script does

- **Archives** `~/.dash-build` (2200+ historical runs + state.json) to
  `~/.dash-build-archive-<timestamp>` so you see a TRUE empty first-run UI.
  Nothing is deleted — `--restore` brings it back.
- Sets `DASH_BUILD_WORK_ROOT=~/Work/dash` so clone + intake target your local
  checkouts (`next-backoffice-web`, `next-portal-v2-web`) — **no GitHub needed**.
- Sets `DASH_BUILD_DEV_SERVER_TIMEOUT_MS=420000` (7 min) so the heavy backoffice
  cold-compile doesn't trip the watchdog.
- Boots `dist/daemon.js` on :7777.

## The 3 surfaces (all live)

| URL | Surface | What |
|-----|---------|------|
| `/` | Home / Build | First screen. Repo picker + prompt composer. |
| `/workspace/:runId` | Generate | Chat + preview canvas after you submit. |
| `/owner` | **Dash Dashboard** (Surface 3) | Branch merge queue, cost, DS candidates, activity. |

## Test flow — existing-repo (backoffice)

1. Open `/`. You should see a clean home — no old runs. Repo picker shows
   **Backoffice** + **Portal v2**.
2. Pick **Backoffice**. (This sets mode = `existing-repo` → clone will fire.)
3. Type a prompt, e.g.:
   > "tambahin tab Delivery sama Performance di halaman detail mitra"
4. Submit. Expected sequence:
   - Toast: *"Booting baseline preview … first cold build can take a few
     minutes"* — clone + auth-strip + `npm install` + `next dev` is starting in
     the background (first time only; later boots are fast).
   - The skill chain runs: intake → mode-detect (existing-repo) → scenario
     (reconciled to `extend_fe_be` once it resolves the real mitra file) →
     fePatterns injected → DS-first directive → Codex generates.
   - **Files / Diff tab**: the generated change. This is the real deliverable —
     check it mirrors backoffice style (`@dash/ui` imports, Pages Router `.js`,
     `useState`, axios) and is additive.
   - **Component tab**: Sandpack preview of the new component.
   - When the clone dev server finishes compiling, the baseline iframe flips to
     `http://127.0.0.1:31xx` — the real backoffice, auth stripped.

## Test flow — blank-product (no clone)

1. From `/`, DON'T pick a repo. Prompt: "bikin produk baru dashboard analytics
   dari nol".
2. Mode detector → `blank-product` → **no clone** (no "booting" toast).
3. Preview = Sandpack standalone. `new_product` scenario here is CORRECT.

## Test flow — ambiguous (the clarify gate)

1. From `/`, no repo, vague prompt: "bikin sesuatu buat monitoring".
2. Expected: an inline clarify card asks **one** question —
   *"Existing repo / New product / Design system?"* — before generating.
3. Pick one → context is set → generation proceeds. This is the
   "context kebentuk dulu, baru turun ke code" behavior.

## What's verified vs not

- ✅ Daemon boots clean, 3 surfaces return 200, fresh-state home renders.
- ✅ Generate + Sandpack preview path (needs Codex login).
- ✅ Mode gate, clone gate, fePatterns, scenario reconcile — unit-tested.
- ✅ **Baseline clone iframe — VERIFIED end-to-end 2026-05-29.** Manually drove
  the full chain on this machine: filesystem clone of `next-backoffice-web` →
  `clean → cloned → shim_applied` → preview-shim v3 rewrote `firebase.js` /
  `AuthContext.js` / `axios.js` (auth stripped, commit `preview-shim apply v3
  [DO NOT MERGE]`) → `next dev` booted **Ready in ~2s** (node_modules + .next
  came with the local clone, so NO 5-7 min cold compile) → backoffice served
  **HTTP 200** on both `localhost` and `127.0.0.1`, real app rendered with
  mocked auth. Only a cosmetic `Invalid DOM property 'class'` warning from the
  app's own markup — not fatal.

### Key fix that made it work
The clone was silently failing because it tried to clone from the **GitHub
remote** (`https://github.com/dash-electric/...`) which the local daemon has no
credentials for. Added `DASH_BUILD_CLONE_FROM_LOCAL=1` (set by the script) →
clones from your local checkout via filesystem. Fast + offline + no auth.

> Note: the 420s dev-server timeout is now a safety ceiling, not the norm —
> because the local clone carries `node_modules` + a warm `.next`, boot is
> seconds. A truly cold clone (fresh `npm install` + first compile) would still
> approach the old 5-7 min, which is why the ceiling stays generous.

## If something breaks

- **"OpenAI not connected"** → run `codex login --device-auth`, refresh.
- **Generate times out** → Codex prompt too big / cold binary. Check the daemon
  stderr for `[codex-cli] large prompt`. Raise `DASH_BUILD_CODEX_TIMEOUT_MS`.
- **Baseline iframe stays on staging** → dev server still compiling (wait) or
  failed (retry badge). Daemon log shows `sandbox:dev_server_*`.
- **Want your old runs back** → `bash scripts/first-run-test.sh --restore`.
