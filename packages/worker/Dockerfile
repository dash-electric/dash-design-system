# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Hermes worker — multi-stage build
#
# Stage 1 (builder): install full monorepo workspace deps for @dash/worker,
#   compile TypeScript → JS via `pnpm --filter @dash/worker build`.
# Stage 2 (runner): copy compiled dist + production deps only, run as
#   non-root, expose /health.
#
# Build context: REPO ROOT (so we can see pnpm-workspace.yaml + sibling
# packages like @dash/skill). Build via:
#   docker build -f packages/worker/Dockerfile -t dash-hermes:latest .
# ---------------------------------------------------------------------------

ARG NODE_VERSION=20.18-alpine

# ---------- Stage 1: builder ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /repo

# Enable pnpm via corepack (ships with Node 20).
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy only manifests first to maximize layer cache.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/worker/package.json packages/worker/
COPY packages/skill/package.json packages/skill/

# Install workspace deps for worker + skill only.
# `--filter` keeps the install lean even though we copied root manifest.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --filter @dash/worker... --frozen-lockfile

# Copy sources after install (so source edits don't bust the install cache).
COPY packages/skill packages/skill
COPY packages/worker packages/worker

# Build worker (and any workspace deps it needs).
RUN pnpm --filter @dash/worker... build

# Prune dev deps for the production image — leaves only runtime closure.
RUN pnpm --filter @dash/worker deploy --prod --legacy /out

# ---------- Stage 2: runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# Non-root user for least-privilege runtime.
RUN addgroup -S hermes && adduser -S hermes -G hermes

# Copy pruned production tree (node_modules + dist + package.json).
COPY --from=builder --chown=hermes:hermes /out /app

# Drop privileges.
USER hermes

ENV NODE_ENV=production \
    PORT=8080 \
    POLL_INTERVAL_MS=60000

EXPOSE 8080

# Container-level healthcheck — independent of platform healthcheck.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# `bin` entry "dash-worker" is symlinked into /app/node_modules/.bin by pnpm
# deploy; invoke via node to keep PID 1 simple + signal-handling correct.
CMD ["node", "node_modules/@dash/worker/dist/index.js", "watch"]
