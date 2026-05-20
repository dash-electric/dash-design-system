/**
 * Async worker — polls the store for queued prompts and hands them off to
 * the orchestrator. Concurrency capped so a flood of submissions can't
 * exhaust auth tokens / model rate limits.
 *
 * The worker is *idempotent* — re-processing a prompt that has already moved
 * past `queued` is a no-op (Orchestrator.processPrompt short-circuits on
 * terminal status, and `setStatus` enforces the state machine).
 *
 * Stop on SIGTERM/SIGINT — daemon.close() calls .stop() during shutdown.
 */

import type { Store } from "../daemon/state/store.js"
import type { Orchestrator } from "./orchestrator.js"
import type { Logger } from "./types.js"
import { classify, shouldRetry } from "./error-handling.js"

export interface WorkerOptions {
  store: Store
  orchestrator: Orchestrator
  /** Poll interval in ms. Default 5000. */
  intervalMs?: number
  /** Max simultaneous prompts. Default 3. */
  concurrency?: number
  logger?: Logger
}

const NOOP_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

export class Worker {
  private readonly store: Store
  private readonly orchestrator: Orchestrator
  private readonly intervalMs: number
  private readonly concurrency: number
  private readonly logger: Logger

  private timer: NodeJS.Timeout | null = null
  private running: Set<string> = new Set()
  private attempts: Map<string, number> = new Map()
  private stopped = false

  constructor(opts: WorkerOptions) {
    this.store = opts.store
    this.orchestrator = opts.orchestrator
    this.intervalMs = opts.intervalMs ?? 5000
    this.concurrency = opts.concurrency ?? 3
    this.logger = opts.logger ?? NOOP_LOGGER
  }

  /** Start the polling loop. Safe to call multiple times. */
  start(): void {
    if (this.timer || this.stopped) return
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        this.logger.error("worker tick threw", { err: String(err) })
      })
    }, this.intervalMs)
    // First tick immediately so tests/dev don't wait for the interval.
    this.tick().catch((err) => {
      this.logger.error("worker initial tick threw", { err: String(err) })
    })
  }

  /** Stop the polling loop. Idempotent. */
  stop(): void {
    this.stopped = true
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Expose running snapshot for tests/observability. */
  inFlight(): string[] {
    return Array.from(this.running)
  }

  /** Run one poll cycle. Exposed for deterministic test driving. */
  async tick(): Promise<void> {
    if (this.stopped) return

    const free = this.concurrency - this.running.size
    if (free <= 0) return

    // Snapshot recent prompts; the store keeps them ordered newest-first
    // (addPrompt unshifts) — we filter to `queued` and drain up to `free`.
    const candidates = this.store
      .getPrompts(50)
      .filter((p) => p.status === "queued" && !this.running.has(p.id))
      .slice(0, free)

    for (const prompt of candidates) {
      this.running.add(prompt.id)
      void this.process(prompt.id).finally(() => {
        this.running.delete(prompt.id)
      })
    }
  }

  private async process(promptId: string): Promise<void> {
    const attempts = (this.attempts.get(promptId) ?? 0) + 1
    this.attempts.set(promptId, attempts)
    try {
      await this.orchestrator.processPrompt(promptId)
    } catch (err) {
      const classified = classify(err)
      if (shouldRetry(classified, attempts)) {
        this.logger.warn("worker retrying", {
          id: promptId,
          attempts,
          kind: classified.kind,
        })
        // Leave status as-is so the next tick can pick it up. (processPrompt
        // already would have rolled it back if it failed mid-flight via
        // failPrompt — but transient errors caught here bypass that.)
      } else {
        this.logger.error("worker giving up", {
          id: promptId,
          attempts,
          kind: classified.kind,
        })
      }
    }
  }
}
