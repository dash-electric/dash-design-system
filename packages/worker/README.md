# @dash/worker — Hermes

Autonomous gap-to-vendored generation worker. Reads `~/.dash/gap-queue.json`,
generates a Dash-compliant block via Anthropic + Skill v2 context, validates
against foundation rules, and opens a PR.

Wave 4 Agent N — the autonomous deputy. Replaces human deputy operational work
for ~95% of gap → vendored flows.

## Modes

```sh
dash-worker run                 # one-shot, process all pending, exit
dash-worker watch               # daemon, poll every POLL_INTERVAL_MS
dash-worker generate <gap-id>   # manual trigger for a specific gap
dash-worker --dry-run run       # smoke (no Anthropic / GitHub / Slack)
```

## Env

| var | default | notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | required unless `--dry-run` |
| `GITHUB_TOKEN` | — | PR creation stubbed when missing |
| `GITHUB_REPO` | `irfanputra-design/dash` | |
| `SLACK_WEBHOOK_URL` | — | notifications skipped when missing |
| `MIN_SCORE_AUTO_MERGE` | `85` | |
| `MIN_SCORE_REVIEW` | `60` | below this → no PR |
| `POLL_INTERVAL_MS` | `60000` | watch mode |
| `ANTHROPIC_MODEL` | `claude-opus-4-7` | |
| `REGISTRY_ROOT` | `<repo>/apps/docs/registry/dash` | |

## Foundation score (0-100)

| criterion | weight | check |
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

## Tests

```sh
pnpm --filter @dash/worker test
```
