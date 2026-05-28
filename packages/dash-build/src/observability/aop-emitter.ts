/**
 * AOP (Agent Observability Protocol v1.0.0) emission helper for dash-build.
 *
 * Wraps the 9-event AOP taxonomy (`@dash/aop-schema`) with a per-run emitter
 * that:
 *   1. Broadcasts a WebSocket frame via `Broadcaster.broadcast("aop", env)`
 *      so a dashboard panel can stream events live.
 *   2. Appends one JSON-line per event to
 *      `~/.dash-build/runs/<runId>/events.jsonl` for replay + ops debugging.
 *
 * Design notes:
 *   - AOP envelope requires a ULID `runId`. Pipeline ids in dash-build are
 *     `prm_<uuidSlice>` — we map promptId → stable ULID with a tiny encoder
 *     that pads/uppercases the slice into Crockford base32. Stable per
 *     promptId so reading events.jsonl back gives a deterministic group key.
 *   - `seq` is monotonic per-run (`0, 1, 2, …`). The emitter owns the counter.
 *   - File writes are append-only + best-effort: a failure to persist never
 *     blocks pipeline progress. WebSocket broadcast is fire-and-forget too.
 *   - Validation is OPT-IN via `validate: true` (off by default to keep the
 *     hot path cheap). Tests turn it on so malformed envelopes regress.
 *
 * Mapping from pipeline steps to AOP events (current wiring):
 *   queued            → run.start                (initial submit)
 *   started           → thinking { kind: "reason" } (worker pickup)
 *   intake.complete   → scan { kind: "registry" }   (BE/DB catalogs)
 *   prompt.composed   → thinking { kind: "hypothesis" } (chain dispatch)
 *   llm.requested     → cost (provisional, no usage yet)
 *   llm.responded     → cost (final tokens + usd)
 *   validated         → validate (foundation score → overall pass/warn/fail)
 *                     + artifact (one per generated file)
 *   completed         → run.end { status: "success" }
 *   failed            → error + run.end { status: "failed" }
 *
 * Backward-compat: the broadcaster also receives the legacy
 * `prompts:changed` / `generation:complete` / … events the existing UI
 * already consumes. AOP is additive — not a replacement yet.
 */

import { appendFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import {
  AOPVersion,
  type AOPEvent,
  type AOPEventByType,
  type AOPEventType,
  type AOPProvider,
} from "@dash/aop-schema"
import type { Broadcaster } from "../daemon/ws/broadcaster.js"
import {
  DEFAULT_RUNS_ROOT,
  resolveRunDir,
} from "../runs/artifact-store.js"

const EVENTS_FILE = "events.jsonl"

/** Crockford base32 alphabet — Plain `IL O U` are skipped per spec. */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

/**
 * Map an arbitrary identifier into a 26-char Crockford base32 ULID-shaped
 * string. NOT a real time-ordered ULID — just a deterministic placeholder so
 * the AOP envelope passes pattern validation. Stable per input.
 */
export function toULID(input: string): string {
  // Hash-style fold: simple but stable. Goal is determinism, not crypto.
  const out: string[] = []
  let acc = 0
  for (let i = 0; i < input.length; i++) {
    acc = (acc * 33 + input.charCodeAt(i)) >>> 0
  }
  // Seed 26 chars from the fold + the original codepoints to keep some
  // variability between similarly-prefixed inputs ("prm_aa", "prm_ab", …).
  for (let i = 0; i < 26; i++) {
    const c = input.charCodeAt(i % input.length) || 0
    const mix = (acc + i * 31 + c * 7) >>> 0
    out.push(CROCKFORD.charAt(mix % CROCKFORD.length))
  }
  return out.join("")
}

export interface AOPEmitterOptions {
  /** WebSocket fan-out. Reuses the existing dash-build broadcaster. */
  broadcaster: Broadcaster
  /**
   * Root directory for runs persistence. Defaults to the shared
   * `~/.dash-build/runs` so events.jsonl sits next to run.json/intake.json.
   */
  runsRoot?: string
  /** Turn on envelope validation. Off by default (hot path cheap). */
  validate?: boolean
  /**
   * Optional logger for persist failures. Defaults to no-op so test fixtures
   * that boot without a logger stay silent.
   */
  logger?: { warn?: (msg: string, meta?: Record<string, unknown>) => void }
}

/** Per-run emitter — owns the seq counter and the events.jsonl handle. */
export interface RunEmitter {
  /** Stable ULID derived from the prompt id. */
  readonly runId: string
  /** Original promptId for callers that need to cross-reference. */
  readonly promptId: string
  /**
   * Emit one AOP envelope. Returns the fully-formed event for callers that
   * want to capture it (tests). Fire-and-forget by design — persistence
   * failures are logged but never thrown.
   */
  emit<T extends AOPEventType>(
    type: T,
    payload: AOPEventByType[T]["payload"],
  ): AOPEventByType[T]
  /** Read-only snapshot of the current sequence counter. */
  seq(): number
}

export class AOPEmitter {
  private readonly broadcaster: Broadcaster
  private readonly runsRoot: string
  private readonly validate: boolean
  private readonly logger: NonNullable<AOPEmitterOptions["logger"]>
  /** Per-prompt counters so concurrent runs don't collide. */
  private readonly counters: Map<string, number> = new Map()

  constructor(opts: AOPEmitterOptions) {
    this.broadcaster = opts.broadcaster
    this.runsRoot = opts.runsRoot ?? DEFAULT_RUNS_ROOT
    this.validate = opts.validate ?? false
    this.logger = opts.logger ?? {}
  }

  /** Create a per-run emitter scoped to one promptId. */
  forRun(promptId: string): RunEmitter {
    const runId = toULID(promptId)
    if (!this.counters.has(promptId)) this.counters.set(promptId, 0)
    return {
      runId,
      promptId,
      seq: () => this.counters.get(promptId) ?? 0,
      emit: <T extends AOPEventType>(
        type: T,
        payload: AOPEventByType[T]["payload"],
      ): AOPEventByType[T] => {
        const seq = this.counters.get(promptId) ?? 0
        this.counters.set(promptId, seq + 1)
        const event = {
          v: AOPVersion,
          type,
          runId,
          seq,
          ts: new Date().toISOString(),
          payload,
        } as AOPEventByType[T]

        if (this.validate) {
          // Validation is cheap when off (single property check) and adds the
          // safety we want in tests + opt-in production debug.
          this.validateEvent(event)
        }

        // Fire-and-forget broadcast — never throws.
        try {
          this.broadcaster.broadcast("aop", event)
        } catch (err) {
          this.logger.warn?.("aop broadcast failed", {
            promptId,
            type,
            err: (err as Error).message,
          })
        }

        // Persist append-only — best-effort; we don't block the pipeline.
        void this.persist(promptId, event)

        return event
      },
    }
  }

  /** Clear the counter for a finished run so the map doesn't leak forever. */
  forget(promptId: string): void {
    this.counters.delete(promptId)
  }

  private async persist(promptId: string, event: AOPEvent): Promise<void> {
    try {
      const dir = resolveRunDir(promptId, this.runsRoot)
      await mkdir(dir, { recursive: true })
      await appendFile(join(dir, EVENTS_FILE), JSON.stringify(event) + "\n", "utf8")
    } catch (err) {
      this.logger.warn?.("aop persist failed", {
        promptId,
        type: event.type,
        err: (err as Error).message,
      })
    }
  }

  private validateEvent(event: AOPEvent): void {
    // Lightweight inline check — full validator from @dash/aop-schema is
    // available but heavy enough that we keep it opt-in. We assert the
    // discriminator + envelope keys; payload contracts are caller-owned.
    if (!event || typeof event !== "object") {
      throw new Error("AOP event: not an object")
    }
    if (event.v !== AOPVersion) {
      throw new Error(`AOP event: bad version ${event.v}`)
    }
    if (typeof event.runId !== "string" || event.runId.length !== 26) {
      throw new Error(`AOP event: bad runId ${event.runId}`)
    }
    if (typeof event.seq !== "number" || event.seq < 0) {
      throw new Error(`AOP event: bad seq ${event.seq}`)
    }
    if (typeof event.ts !== "string") {
      throw new Error(`AOP event: bad ts ${event.ts}`)
    }
  }
}

/** Default no-op AOP emitter for code paths that have no broadcaster yet. */
export class NullAOPEmitter extends AOPEmitter {
  constructor() {
    super({
      broadcaster: {
        broadcast: () => {},
      } as unknown as Broadcaster,
    })
  }
}

/**
 * Provider-string normaliser used by the cost emitter. Maps dash-build's
 * env-driven names back onto the AOP enum.
 */
export function normaliseProvider(provider: string | null | undefined): AOPProvider {
  const p = (provider ?? "").toLowerCase()
  if (p.includes("anthropic")) return "anthropic"
  if (p.includes("codex")) return "codex-local"
  return "openai"
}
