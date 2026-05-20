# @dash/worker — Hermes

Autonomous gap-to-vendored generation worker. Reads `~/.dash/gap-queue.json`,
generates a Dash-compliant block via Anthropic + Skill v2 context, validates
against foundation rules, and opens a PR.

Wave 4 Agent N — the autonomous deputy. Replaces human deputy operational work
for ~95% of gap → vendored flows.

## Setup

```sh
git clone git@github.com:irfanputra-design/dash-ds.git
cd dash-ds
pnpm install
pnpm --filter @dash/worker build

# Env template — copy and fill in.
cp packages/worker/.env.example packages/worker/.env
```

## Local dev

```sh
# Run TypeScript directly (no build step).
cd packages/worker
pnpm dev        # tsc --watch

# Or the dry-run smoke (no Anthropic / GitHub / Slack calls).
node dist/index.js --dry-run run
```

## Modes

```sh
dash-worker run                 # one-shot, process all pending, exit
dash-worker watch               # daemon, poll every POLL_INTERVAL_MS,
                                # exposes /health on $PORT (default 8080)
dash-worker generate <gap-id>   # manual trigger for a specific gap
dash-worker --dry-run run       # smoke (no Anthropic / GitHub / Slack)
dash-worker idempotency status  # show idempotency store stats + recent 10
dash-worker idempotency clear --all          # wipe store (confirm prompt)
dash-worker idempotency clear --key <hash>   # evict a single entry
```

## Idempotency

Hermes records every processed gap in `~/.dash/hermes-idempotency.json` so a
crash-and-restart or a manual queue replay can't double-spend Anthropic
tokens. Key = `sha256(gap.id + gap.created_at + gap.description.slice(0,100))`.

Behavior:

- On `processGap`, the worker checks the store first. If the key is present,
  it logs `gap.idempotent.skip`, restores the prior queue status, and returns
  the prior outcome — **no Anthropic call**.
- After every fresh process (success or fail), the worker writes the outcome,
  PR URL, and token spend back to the store via atomic tmp+rename.
- Entries older than 30 days are evicted on next read (TTL prune).
- To bypass (demo / test): `export DASH_HERMES_NO_IDEMPOTENCY=1`.

Ops commands: see `dash-worker idempotency …` above.

## Env vars

| Var | Required? | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes (unless `--dry-run`) | — | Worker refuses to start without it in non-dry-run. |
| `GITHUB_TOKEN` | recommended | — | PR creation stubbed when missing. |
| `GITHUB_REPO` | no | `irfanputra-design/dash` | |
| `SLACK_WEBHOOK_URL` | no | — | Notifications skipped when missing. |
| `MIN_SCORE_AUTO_MERGE` | no | `85` | Live-PR threshold. |
| `MIN_SCORE_REVIEW` | no | `60` | Below this → no PR. |
| `POLL_INTERVAL_MS` | no | `60000` | `watch` mode loop. Health endpoint flags "stuck" at 2×. |
| `ANTHROPIC_MODEL` | no | `claude-opus-4-7` | |
| `REGISTRY_ROOT` | no | `<repo>/apps/docs/registry/dash` | Where generated blocks land. |
| `DASH_API_URL` | no | — | Dashboard API base (post-back). |
| `DASH_CEO_TOKEN` | no | — | Admin token for dashboard API. |
| `PORT` | no | `8080` | `/health` listen port. Railway/Fly inject. |

## Foundation score (0-100)

| Criterion | Weight | Check |
|---|---|---|
| dash-primitives | +30 | imports from `@/registry/dash/*` |
| dash-tokens | +20 | uses Dash token classes, no raw hex |
| hand-rolled-state | +20 | `useState`, no `react-hook-form`/`zod`/`@tanstack/react-query`/`swr` |
| audit-trail | +15 | signature present when gap is legal/financial |
| formal-voice | +10 | `Anda` (not `kamu`) when gap is mitra-facing |
| file-conventions | +5 | default or PascalCase named export |

Score band → outcome:

- `≥ MIN_SCORE_AUTO_MERGE` + gates pass → live PR, status `vendored`
- `[MIN_SCORE_REVIEW, MIN_SCORE_AUTO_MERGE)` or gate fail → draft PR, status `synced`
- `< MIN_SCORE_REVIEW` → no PR, status `declined`

## Health endpoint

`GET /health` (exposed in `watch` mode only) returns:

```json
{
  "status": "ok" | "starting" | "stuck",
  "lastPoll": 1716220800000,
  "pendingGaps": 0,
  "processedToday": 12,
  "uptimeSec": 3600,
  "pollIntervalMs": 60000
}
```

- `200` on `ok` / `starting`, `503` on `stuck`.
- "Stuck" = no poll landed in 2× `POLL_INTERVAL_MS`.
- Grace period during startup: status is `starting` (HTTP 200) for the first
  2× interval so platform healthchecks don't kill the container during boot.

## Deploy

Three options, ranked by maturity:

| Path | When | Doc |
|---|---|---|
| **Local supervised** | First 2-week pilot. Laptop daemon via tmux or one-shot cron. | [`deploy/LOCAL-SETUP.md`](./deploy/LOCAL-SETUP.md) |
| **Railway** | Default after pilot. Dockerfile-native, USD ~5/mo. | [`deploy/RAILWAY-SETUP.md`](./deploy/RAILWAY-SETUP.md) |
| **Fly.io** | Fallback. Singapore region, USD ~3/mo, volumes optional. | [`deploy/FLY-SETUP.md`](./deploy/FLY-SETUP.md) |

Recommended pilot strategy:

1. **Week 0–2:** local tmux daemon. Watch every gap by hand.
2. **Week 2:** if 0 unsafe vendorings and you trust the score gates, promote
   to Railway. Keep `MIN_SCORE_AUTO_MERGE=95` for another two weeks.
3. **Week 4+:** relax to `85` and treat the worker as production.

Vercel cron is NOT viable — Hermes needs writable fs + subprocess access for
validate gates (`pnpm typecheck`, `dash audit`).

## Operational runbook

| Symptom | Likely cause | Fix |
|---|---|---|
| `/health` returns 503 `stuck` | Watch loop crashed mid-iteration. | Check logs, restart container. |
| `/health` stays `starting` >5 min | First poll never lands — likely Anthropic auth failure. | Verify `ANTHROPIC_API_KEY`, redeploy. |
| All gaps status `declined` | Score gate too tight or generator dry-run. | Confirm `MIN_SCORE_REVIEW` and that `ANTHROPIC_API_KEY` is set in env. |
| PR creation logs "stubbed" | `GITHUB_TOKEN` missing or repo perms wrong. | Re-create PAT with `contents:write` + `pulls:write`. |
| Slack quiet despite vendorings | `SLACK_WEBHOOK_URL` missing or webhook revoked. | Re-create webhook, set var. |

Useful one-liners:

```sh
# Show current queue state.
cat ~/.dash/gap-queue.json | jq '.entries[] | {id, status}'

# Force-reset a gap to pending (manual re-run).
jq '(.entries[] | select(.id=="GAP_ID") | .status) |= "pending"' \
  ~/.dash/gap-queue.json > /tmp/q && mv /tmp/q ~/.dash/gap-queue.json

# Hit health.
curl -s http://127.0.0.1:8080/health | jq

# Dry-run one gap end-to-end.
node dist/index.js --dry-run generate <gap-id>
```

## Monitoring

- **`/health`** — primary signal. Platform healthchecks (Railway/Fly) poll
  every 30s and restart on 503.
- **Slack webhook** — every outcome (`vendored` / `needs-review` / `failed` /
  `declined`) posts a card with the score breakdown.
- **Logs** — JSON-ish via `defaultLogger`. Tail with `railway logs --follow`
  or `fly logs`.

## Troubleshooting common errors

| Error | Cause | Resolution |
|---|---|---|
| `ANTHROPIC_API_KEY missing` | Env not exported in container. | Set via `railway variables` / `fly secrets`. |
| `gap not found: <id>` | Queue path mismatch — worker reading a different file than expected. | Set `--queue=PATH` or align `~/.dash/gap-queue.json`. |
| `validation gates failed (tc=false)` | TypeScript error in generated block. | Read the generated `block_path`; usually a typo or banned-import slip — feed back into Skill prompt. |
| `EADDRINUSE :8080` | Another process holding port. | Set `PORT=8081` or kill the squatter. |
| Build fails on Railway: `pnpm not found` | Corepack not enabled in your fork. | Confirm `RUN corepack enable` line in Dockerfile. |

## Tests

```sh
pnpm --filter @dash/worker test
pnpm --filter @dash/worker typecheck
```
