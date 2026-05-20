# Run Hermes worker locally (supervised pilot)

Recommended for the first 2 weeks after Wave 4 ships. Trade-offs:

- Pros: zero infra cost, full visibility, you can kill it instantly.
- Cons: requires your laptop awake; sleeps when you close the lid.

Two patterns: **tmux daemon** (preferred, always-resident) and **crontab
one-shot** (run-and-exit on a schedule).

## Prereqs

```sh
cd /Users/irfanprimaputra.b/dash-ds
pnpm install
pnpm --filter @dash/worker build

# .env in packages/worker/ — copy template, fill in.
cp packages/worker/.env.example packages/worker/.env
```

## Option A — tmux daemon (recommended)

```sh
# Install tmux if needed.
brew install tmux

# Spin up a detached session running `dash-worker watch`.
tmux new-session -d -s hermes \
  "cd /Users/irfanprimaputra.b/dash-ds/packages/worker && \
   set -a && source .env && set +a && \
   node dist/index.js watch 2>&1 | tee -a ~/.dash/hermes.log"

# Attach to watch live.
tmux attach -t hermes

# Detach (back to your shell): Ctrl-b then d.

# Stop.
tmux kill-session -t hermes
```

Verify `/health`:

```sh
curl http://127.0.0.1:8080/health
```

## Option B — crontab one-shot

Use this if you don't want a permanent process and only need periodic gap
sweeps. The worker exits after each pass (`run` mode, not `watch`).

```sh
# Edit your crontab.
crontab -e
```

Add:

```cron
# Hermes — process pending gaps every 5 min, log to file.
*/5 * * * * cd /Users/irfanprimaputra.b/dash-ds/packages/worker && \
  set -a && source .env && set +a && \
  /usr/local/bin/node dist/index.js run --json \
  >> ~/.dash/hermes.log 2>&1
```

Notes:

- `set -a; source .env; set +a` exports every var in `.env` to the
  subprocess — crontab doesn't read your shell rc.
- Use the absolute path to `node` (run `which node` to find yours).
- macOS `cron` needs Full Disk Access for the Terminal binary
  (System Settings → Privacy & Security → Full Disk Access).

## Log rotation

`~/.dash/hermes.log` grows forever otherwise. Drop a `newsyslog` entry on
macOS or just rotate manually with `logrotate` if you have it:

```conf
# /usr/local/etc/logrotate.d/hermes
/Users/irfanprimaputra.b/.dash/hermes.log {
  daily
  rotate 7
  compress
  missingok
  notifempty
  copytruncate
}
```

Or the dirt-simple weekly cron:

```cron
0 3 * * 0 mv ~/.dash/hermes.log ~/.dash/hermes.log.$(date +\%Y\%m\%d) && \
  gzip ~/.dash/hermes.log.*
```

## When to graduate to Railway / Fly

Promote off local once any of these become true:

- Laptop has been the bottleneck (you closed the lid and missed a poll).
- More than one maintainer needs visibility.
- You want Slack alerts to fire while you're asleep.
- The pilot's 2-week safety window is over.

See `RAILWAY-SETUP.md` or `FLY-SETUP.md`.
