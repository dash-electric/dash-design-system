# Deploy Hermes worker to Fly.io

Fallback to Railway. Pick Fly.io if you want:

- A Singapore region (Railway's nearest is HKG/SIN via partner).
- Predictable USD ~3/mo for `shared-cpu-1x@256mb`.
- Bring-your-own persistent volume (needed if we want gap queue durability
  across redeploys — see § Volumes below).

## One-time setup

```sh
# 1. Install flyctl.
brew install flyctl

# 2. Login.
fly auth login

# 3. Create the app (idempotent — skip if it already exists).
cd /Users/irfanprimaputra.b/dash-ds
fly launch \
  --config packages/worker/fly.toml \
  --dockerfile packages/worker/Dockerfile \
  --name dash-hermes \
  --region sin \
  --no-deploy
```

`--no-deploy` lets us configure secrets before the first deploy.

## Set secrets

```sh
fly secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  GITHUB_TOKEN=ghp_... \
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... \
  DASH_CEO_TOKEN=... \
  --config packages/worker/fly.toml
```

Non-secret defaults (`GITHUB_REPO`, `ANTHROPIC_MODEL`, etc.) are baked into
`fly.toml` under `[env]`.

## Deploy

```sh
fly deploy \
  --config packages/worker/fly.toml \
  --dockerfile packages/worker/Dockerfile
```

Fly will build the image locally (or remotely with `--remote-only`), push it
to the Fly registry, and roll out one machine in `sin`.

## Verify

```sh
fly logs --config packages/worker/fly.toml
fly status --config packages/worker/fly.toml
curl https://dash-hermes.fly.dev/health
```

## Volumes (optional but recommended)

The gap queue defaults to `~/.dash/gap-queue.json` inside the container. On a
plain Fly machine that path is ephemeral — a redeploy wipes it. Mount a
volume to keep history:

```sh
fly volumes create hermes_data \
  --region sin \
  --size 1 \
  --config packages/worker/fly.toml
```

Then add to `fly.toml`:

```toml
[[mounts]]
  source      = "hermes_data"
  destination = "/home/hermes/.dash"
```

## Operations

| Action | Command |
|---|---|
| Restart | `fly machine restart <id>` |
| Update secret | `fly secrets set KEY=value` (rolls a deploy) |
| SSH in | `fly ssh console` |
| Scale RAM | `fly scale memory 512` |
| Roll back | `fly releases` → `fly deploy --image <prior-image>` |

## Cost estimate

`shared-cpu-1x@256mb` in `sin` runs about USD 1.94/mo (730 hr × USD
0.0000028/sec for CPU + small RAM line item). Add USD 0.15/mo per GB volume.
Hermes total: ~USD 3/mo without volume, ~USD 3.15/mo with the 1 GB volume.

Anthropic API tokens are billed separately.

## Gotchas

- Fly will happily run 0 machines if you don't pin `min_machines_running = 1`
  (already set in our `fly.toml`). Watch-mode requires a permanent process.
- Default Fly machines auto-stop after idle. Our `fly.toml` disables this
  with `auto_stop_machines = false`. Confirm in the dashboard after deploy.
- `fly deploy` builds on Fly's remote builder by default. If your local
  Docker can build the image but the remote builder can't, pass
  `--local-only` to use your laptop.
