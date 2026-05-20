/**
 * Minimal HTTP health endpoint for `dash-worker watch`. Built on the Node core
 * `http` module — zero deps. Used by Railway/Fly healthchecks + Slack canary.
 *
 * Endpoints:
 *   GET /health   → 200 if last poll < 2× POLL_INTERVAL_MS ago, 503 otherwise
 *                   body: { status, lastPoll, pendingGaps, processedToday,
 *                           uptimeSec, pollIntervalMs }
 *
 * Stateless / single-process — the watch loop calls `recordPoll()` after each
 * pass to refresh `lastPoll`. `incrementProcessed()` is called per outcome to
 * track daily throughput (resets at process restart — good enough for ops).
 *
 * Pure node:http so it stays compatible with --dry-run smoke + tests without
 * pulling an HTTP framework.
 */
import http from "node:http"
import type { AddressInfo } from "node:net"

export type HealthState = {
  /** Epoch ms of last completed poll. null until first poll lands. */
  lastPoll: number | null
  /** Snapshot of pending gap count after last poll. */
  pendingGaps: number
  /** Count of outcomes processed since process start (not since midnight — */
  /** restart resets, which is the simplest semantics). */
  processedToday: number
  /** Required for health staleness check. */
  pollIntervalMs: number
  /** Set by start() — used in uptime reporting. */
  startedAt: number
}

export type HealthServer = {
  state: HealthState
  recordPoll: (pendingGaps: number) => void
  incrementProcessed: (n?: number) => void
  /** Returns the actual bound port (useful when port=0 for tests). */
  port: () => number
  /** Resolves once the server's listening event has fired. */
  ready: Promise<void>
  close: () => Promise<void>
}

export type HealthServerOpts = {
  /** Listen port. Default 0 (random — for tests). Real prod: PORT env. */
  port?: number
  /** Bind host. Default 0.0.0.0 for container compatibility. */
  host?: string
  pollIntervalMs: number
}

/**
 * Decide health status from current state.
 * Exported pure helper so tests don't need to spin up a real server.
 */
export function evaluateHealth(state: HealthState, now: number = Date.now()): {
  status: "ok" | "starting" | "stuck"
  httpStatus: 200 | 503
} {
  // Before the first poll lands, we report "starting" but still 200 so the
  // platform healthcheck doesn't kill the container during initial spin-up.
  if (state.lastPoll === null) {
    // Grace period: 2× poll interval since process start.
    const ageMs = now - state.startedAt
    if (ageMs < state.pollIntervalMs * 2) {
      return { status: "starting", httpStatus: 200 }
    }
    return { status: "stuck", httpStatus: 503 }
  }
  const ageMs = now - state.lastPoll
  if (ageMs > state.pollIntervalMs * 2) {
    return { status: "stuck", httpStatus: 503 }
  }
  return { status: "ok", httpStatus: 200 }
}

export function startHealthServer(opts: HealthServerOpts): HealthServer {
  const state: HealthState = {
    lastPoll: null,
    pendingGaps: 0,
    processedToday: 0,
    pollIntervalMs: opts.pollIntervalMs,
    startedAt: Date.now(),
  }

  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 400
      res.end()
      return
    }
    if (req.method === "GET" && req.url === "/health") {
      const verdict = evaluateHealth(state)
      const body = {
        status: verdict.status,
        lastPoll: state.lastPoll,
        pendingGaps: state.pendingGaps,
        processedToday: state.processedToday,
        uptimeSec: Math.floor((Date.now() - state.startedAt) / 1000),
        pollIntervalMs: state.pollIntervalMs,
      }
      res.statusCode = verdict.httpStatus
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify(body))
      return
    }
    res.statusCode = 404
    res.end()
  })

  const ready = new Promise<void>((resolve) => {
    server.once("listening", () => resolve())
  })
  server.listen(opts.port ?? 0, opts.host ?? "0.0.0.0")

  return {
    state,
    ready,
    recordPoll: (pendingGaps: number) => {
      state.lastPoll = Date.now()
      state.pendingGaps = pendingGaps
    },
    incrementProcessed: (n = 1) => {
      state.processedToday += n
    },
    port: () => {
      const addr = server.address() as AddressInfo | null
      return addr?.port ?? 0
    },
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve())
      }),
  }
}
