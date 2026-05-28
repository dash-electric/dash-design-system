# @dash/dashboard

Standalone Next.js 15 control tower. Lives in `dash-ds` monorepo for MVP;
spins out to its own repo in Phase 4 per migration plan in
`packages/dash-build/docs/specs/dash-dashboard-trd-2026-05-28.md` §12.

## Quick start

```bash
# from monorepo root
pnpm install
INGEST_HMAC_KEY=test pnpm --filter @dash/dashboard dev
# → http://localhost:3001/dashboard
```

Dev mode bypasses auth (when `NEXTAUTH_URL` is unset). Heartbeats are stored
in-memory + file-based SQLite at `~/.dash-dashboard/dev.db`.

## Env vars

See `.env.example`. Required for dev: `INGEST_HMAC_KEY`. Required for prod:
add `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `TURSO_URL`, `TURSO_TOKEN`.

## Send a test heartbeat

```bash
KEY=test
BODY='{"tribe":"ride","app":"ride-web","instance":"i-1","status":"ok","sentAt":"2026-05-28T08:00:00Z"}'
SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$KEY" -hex | awk '{print $2}')"

curl -s http://localhost:3001/api/ingest/heartbeat \
  -H "Content-Type: application/json" \
  -H "X-Dash-Signature: $SIG" \
  --data "$BODY"
```

Reload `/dashboard` — the Tribe health widget should render the new tribe.
The SSE stream pushes the event live to any open dashboard tab.

## Endpoints

- `GET  /api/v1/health/tribes` — current tribe status snapshot (JSON)
- `GET  /api/v1/stream?topics=heartbeat` — SSE stream of heartbeat events
- `POST /api/ingest/heartbeat` — HMAC-signed heartbeat ingest

## Deploy (Railway)

`railway.json` configures NIXPACKS build + start commands. The healthcheck
path is `/api/v1/health/tribes` so Railway will restart on persistent failure.

```bash
railway up
# or via GitHub integration: push to main triggers prod deploy
```

Set env vars in Railway → Service → Variables. Quarterly rotation per TRD §9.3.

## What's wired

| Widget | Status |
|---|---|
| Runs feed | stub (placeholder copy) |
| Cost tracker | stub (placeholder copy) |
| Tribe health | **live** — server snapshot + SSE updates |

## What's NOT yet

- next-auth `/login` route + session pages (handlers stubbed; needs UI)
- Build daemon SSE consumer for runs feed
- OpenAI Usage API poller for cost
- Role-based access (TRD §5)
- Cold tier (Cloudflare R2) + weekly digest cron
- `dash-ds` Layer 1 UI components consumed via `dash add` (inline styles for now)
