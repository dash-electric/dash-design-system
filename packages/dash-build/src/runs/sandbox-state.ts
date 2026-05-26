/**
 * Sandbox state machine for Dash Build clone sandboxes (Phase D1).
 *
 * Each consumer repo (e.g. dash/backoffice) gets ONE long-lived working clone
 * under ~/Work/dash-build-clones/<repoSlug>. The state machine tracks where
 * that clone is in its lifecycle so the daemon can refuse invalid actions
 * (e.g. publishing while still in `generating`) and surface progress to the
 * dashboard topbar (Agent D3 will wire the UI).
 *
 * Trunk-based pattern locked: short-lived branches dash-build/<userId>-<runId>,
 * 7d hard-expire, preview-shim NEVER lands trunk.
 */

export type SandboxState =
  | "clean"
  | "cloned"
  | "shim_applied"
  | "idle"
  | "clone_running"
  | "generating"
  | "preview_ready"
  | "publishing"
  | "sweep"
  | "stale"

export interface SandboxTransition {
  from: SandboxState
  to: SandboxState
  at: string
}

export interface SandboxStateMachineSnapshot {
  state: SandboxState
  history: SandboxTransition[]
}

/**
 * Bounded history — only the last N transitions are retained so a long-lived
 * sandbox doesn't accumulate megabytes of state.json bloat.
 */
const MAX_HISTORY = 20

/**
 * Stale-detection threshold. A preview-ready or idle sandbox that has not seen
 * activity for 7+ days is auto-flipped to `stale`, then later swept by D3.
 */
export const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

const ALLOWED: Record<SandboxState, SandboxState[]> = {
  clean: ["cloned"],
  cloned: ["shim_applied"],
  shim_applied: ["idle"],
  // `idle` = clone ready (shim applied, deps installed) but no dev server live.
  // `clone_running` = dev server spawned + port listening; canvas resolver may
  // swap iframe to http://127.0.0.1:<port>. F1 added this state so semantics
  // stop being ambiguous (idle previously meant both "ready" and "live").
  idle: ["generating", "clone_running", "stale"],
  clone_running: ["generating", "preview_ready", "idle", "stale"],
  generating: ["idle", "clone_running", "preview_ready"],
  preview_ready: ["idle", "clone_running", "publishing"],
  publishing: ["sweep"],
  sweep: ["idle"],
  stale: ["clean"],
}

export interface TransitionResult {
  ok: boolean
  error?: string
}

/**
 * Event payload emitted on each successful transition. Carries enough context
 * for downstream subscribers (Store persistence, WS broadcast, UI badge) to
 * react without re-reading the machine.
 *
 * `runId` is best-effort — only the orchestrator sets it on its own
 * transitions; bootstrap-time transitions (`clean → cloned → shim_applied →
 * idle`) leave it `null` because no run owns those steps.
 */
export interface SandboxTransitionEvent {
  repoSlug: string
  from: SandboxState
  to: SandboxState
  at: string
  runId: string | null
}

export interface SandboxStateMachineOptions {
  repoSlug: string
  initial?: SandboxState
  history?: SandboxTransition[]
  /** Override for tests so we don't depend on Date.now() drift. */
  now?: () => Date
  /**
   * Optional fire-on-success transition hook. Invoked AFTER the new state is
   * committed so subscribers always observe a consistent machine. Throws are
   * swallowed — a misbehaving subscriber must not corrupt machine state.
   *
   * Backward-compat: when undefined, transition() behaves exactly as before.
   */
  onTransition?: (event: SandboxTransitionEvent) => void
}

/**
 * Pure in-memory state machine. Persistence lives in Store (see store.ts).
 *
 * Construct one per repoSlug. The Workspace orchestrator calls `transition()`
 * after each side-effect (git clone done → cloned, shim apply commit → shim_applied,
 * etc.). Invalid transitions return `{ ok: false }` instead of throwing so the
 * orchestrator can decide whether to recover or surface as run failure.
 */
export class SandboxStateMachine {
  readonly repoSlug: string
  private _state: SandboxState
  private _history: SandboxTransition[]
  private readonly now: () => Date
  private onTransition: ((event: SandboxTransitionEvent) => void) | null
  /**
   * Run id to stamp on the next transition event. Owners (orchestrator) set
   * this before driving the machine through a run so subscribers can correlate
   * Store records. Auto-clears back to null after each transition so leftover
   * run ids don't bleed into unrelated bootstrap steps.
   */
  private pendingRunId: string | null = null

  constructor(opts: SandboxStateMachineOptions) {
    this.repoSlug = opts.repoSlug
    this._state = opts.initial ?? "clean"
    this._history = (opts.history ?? []).slice(-MAX_HISTORY)
    this.now = opts.now ?? (() => new Date())
    this.onTransition = opts.onTransition ?? null
  }

  /**
   * Late-bind the transition callback. Used by the orchestrator when it
   * receives a Workspace that was constructed before the Store/Broadcaster
   * were available. Overwrites any previously-set callback.
   */
  setOnTransition(cb: ((event: SandboxTransitionEvent) => void) | null): void {
    this.onTransition = cb
  }

  /**
   * Tag the NEXT transition event with the given runId. Auto-clears after one
   * fire so non-run transitions stay clean.
   */
  setRunIdForNextTransition(runId: string | null): void {
    this.pendingRunId = runId
  }

  current(): SandboxState {
    return this._state
  }

  history(): SandboxTransition[] {
    return this._history.slice()
  }

  snapshot(): SandboxStateMachineSnapshot {
    return { state: this._state, history: this.history() }
  }

  transition(to: SandboxState): TransitionResult {
    const allowed = ALLOWED[this._state] ?? []
    if (!allowed.includes(to)) {
      return {
        ok: false,
        error: `invalid transition ${this._state} → ${to} (allowed: ${allowed.join(", ") || "<none>"})`,
      }
    }
    const from = this._state
    const at = this.now().toISOString()
    const entry: SandboxTransition = { from, to, at }
    this._history.push(entry)
    if (this._history.length > MAX_HISTORY) {
      this._history = this._history.slice(-MAX_HISTORY)
    }
    this._state = to
    // Snapshot + clear pendingRunId BEFORE firing so a re-entrant callback
    // (e.g. one that calls transition() again) sees a clean slate.
    const runId = this.pendingRunId
    this.pendingRunId = null
    if (this.onTransition) {
      try {
        this.onTransition({
          repoSlug: this.repoSlug,
          from,
          to,
          at,
          runId,
        })
      } catch {
        // Swallow — subscriber bugs must not corrupt machine state. Caller
        // can opt into logging via wrapping their own try/catch.
      }
    }
    return { ok: true }
  }

  /**
   * Force-set state without validating the transition. ONLY for use by the
   * persistence layer when rehydrating from disk — never call from runtime
   * orchestrator code.
   */
  rehydrate(state: SandboxState, history: SandboxTransition[] = []): void {
    this._state = state
    this._history = history.slice(-MAX_HISTORY)
  }
}

/**
 * Decide if a persisted sandbox snapshot should be marked stale on boot.
 *
 * Rule (Phase D1): if state ∈ {preview_ready, idle} AND lastActivity > 7d ago,
 * flip to `stale`. `stale` then becomes a candidate for the D3 sweeper to
 * delete the clone dir and reset state to `clean`.
 *
 * `generating` / `publishing` left as-is even when stale — they likely crashed
 * mid-run and the orchestrator's restart logic should reconcile, not the
 * stale-flip path.
 */
export function shouldFlipStale(
  state: SandboxState,
  lastActivityIso: string | null,
  nowMs: number = Date.now(),
): boolean {
  if (
    state !== "preview_ready" &&
    state !== "idle" &&
    state !== "clone_running"
  ) {
    return false
  }
  if (!lastActivityIso) return false
  const last = Date.parse(lastActivityIso)
  if (!Number.isFinite(last)) return false
  return nowMs - last >= STALE_THRESHOLD_MS
}
