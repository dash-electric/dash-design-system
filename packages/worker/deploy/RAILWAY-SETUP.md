# Deploy Hermes worker to Railway

Recommended platform for the first 6 months after the local pilot.

## Why Railway

- Dockerfile-native (we build off `packages/worker/Dockerfile`).
- Healthcheck wiring (`/health`) reads our endpoint natively.
- Secrets management via dashboard or CLI.
- ~USD 5/mo for a single 256 MB container with the included usage allowance.
- No region in Indonesia, but SIN/HKG ping is fine for an Anthropic + GitHub
  workload (both calls cross continents anyway).

## One-time setup

```sh
# 1. Install CLI (Homebrew or curl installer).
brew install railway

# 2. Login (opens browser).
railway login

# 3. From repo root — Railway needs the build context to include
#    pnpm-workspace.yaml + sibling packages.
cd /Users/irfanprimaputra.b/dash-ds

# 4. Either link an existing project ...
railway link

#    ... or create a new one.
railway init        # name: dash-hermes
```

## Set environment variables

```sh
# Required.
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GITHUB_TOKEN=ghp_...

# Optional overrides.
railway variables set GITHUB_REPO=irfanputra-design/dash
railway variables set SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
railway variables set MIN_SCORE_AUTO_MERGE=85
railway variables set MIN_SCORE_REVIEW=60
railway variables set POLL_INTERVAL_MS=60000
railway variables set ANTHROPIC_MODEL=claude-opus-4-7
railway variables set DASH_API_URL=https://ds.dash.com
railway variables set DASH_CEO_TOKEN=...
```

Or paste them into the Railway dashboard ("Variables" tab).

`PORT` is injected by Railway automatically — do not set it manually.

## Deploy

```sh
# From repo root. Railway will:
#  - read packages/worker/railway.json (build + healthcheck config)
#  - build packages/worker/Dockerfile with the repo as context
#  - publish the image + start `dash-worker watch`
railway up
```

## Verify

```sh
# Stream logs from the most recent deploy.
railway logs

# Hit /health (Railway exposes a public domain unless you toggle private).
curl https://dash-hermes.up.railway.app/health
# → {"status":"ok","lastPoll":1716220800000,"pendingGaps":0,...}
```

## Operations

| Action | Command |
|---|---|
| Restart | `railway redeploy` |
| Update env | `railway variables set KEY=value` (auto-restarts) |
| Roll back | Dashboard → Deployments → "Redeploy" on a prior commit |
| Open shell | `railway run sh` |
| Tail logs | `railway logs --follow` |

## Cost estimate

| Tier | Vendor allowance | Hermes actual | Net |
|---|---|---|---|
| Hobby | USD 5 credit | ~USD 4 (256 MB always-on) | included |
| Pro | USD 20/mo + usage | same | within base |

Anthropic API tokens are billed separately (Anthropic account, not Railway).

## Gotchas

- Railway secrets are visible to every project member. If we add a deputy,
  they will see `ANTHROPIC_API_KEY`. Mitigate via Railway team RBAC (Pro tier)
  or rotate keys per maintainer.
- The build context defaults to repo root because `railway.json` lives in
  `packages/worker/` but references the Dockerfile by repo-root path. If
  Railway can't find the Dockerfile, run `railway up --service hermes`
  explicitly from repo root.
- Watch-mode is single-instance only. Do NOT scale replicas — the gap queue
  is a flat file and two workers will race each other.
