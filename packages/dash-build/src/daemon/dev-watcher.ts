import { watch, type FSWatcher } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Broadcaster } from "./ws/broadcaster.js"

/**
 * Dev-only file watcher. Broadcasts a `static:refresh` event to every WS
 * client whenever a watched template source file changes, so the dashboard
 * can swap its `<link rel="stylesheet">` href without a full reload.
 *
 * Scope (deliberately narrow — see pivot plan Tier 4 #16):
 *   - Watches CSS / shell templates only (dashboard.ts, tokens.ts, home.ts,
 *     workspace.ts, layout.ts). Catches the common dev iteration loop.
 *   - Emits a single debounced event per burst — editors save in a flurry
 *     (chmod + rename + write), and we don't want one save = three events.
 *   - Native `fs.watch` only. No `chokidar` dep so the daemon stays
 *     dependency-free. Trade-off: slightly noisier on some filesystems;
 *     debounce + change-kind filter compensates.
 *   - Off by default in production. Opt in via `DASH_BUILD_WATCH=1` (or pass
 *     `enableWatcher: true` from a test). The CLI `dash-build dev` should
 *     export the env var.
 *
 * Defers (out of scope, per #16):
 *   - JS hot reload — client app.ts changes still need a hard refresh.
 *   - Programmatic re-compile — `tsup --watch` already rebuilds the daemon.
 *     The watcher emits the refresh signal AFTER tsup writes the new bundle,
 *     so the user sees CSS changes without restarting the daemon manually.
 *
 * Wiring (from `startDaemon`):
 *
 *   const watcher = enableWatcher ? new DevWatcher({ broadcaster }) : null
 *   watcher?.start()
 *   // ... on shutdown:
 *   watcher?.stop()
 */

/** Files we watch by default. Resolved relative to package src/ root. */
export const DEFAULT_WATCH_FILES: readonly string[] = [
  "daemon/templates/styles/dashboard.ts",
  "daemon/templates/styles/tokens.ts",
  "daemon/templates/home.ts",
  "daemon/templates/workspace.ts",
  "daemon/templates/layout.ts",
]

export interface DevWatcherOptions {
  /** Broadcaster the daemon already constructed. */
  broadcaster: Pick<Broadcaster, "broadcast">
  /**
   * Paths to watch. Each entry is resolved relative to `rootDir`. Defaults to
   * `DEFAULT_WATCH_FILES`. Tests inject custom paths.
   */
  files?: readonly string[]
  /**
   * Base directory the file list resolves against. Defaults to the package's
   * `src/` directory (via `import.meta.url`). Tests override this so the
   * watcher tracks a `tmpdir`-based fixture.
   */
  rootDir?: string
  /**
   * Debounce window in milliseconds. Editor saves often emit 2-3 raw fs
   * events; one save should map to one broadcast.
   */
  debounceMs?: number
  /**
   * Injectable `fs.watch` for tests. Real callers should leave this unset.
   */
  watchImpl?: typeof watch
}

export interface RefreshEventDetail {
  /**
   * Filesystem path that triggered the event (relative to package root for
   * readability). Useful in client console logs when debugging which save
   * actually caused the refresh.
   */
  source: string
  /** Wall-clock ms when the watcher fired the broadcast. */
  ts: number
}

/**
 * Single-purpose dev watcher. Constructed once and lifecycle-managed by the
 * daemon — `start()` to attach watches, `stop()` to release them.
 */
export class DevWatcher {
  private readonly broadcaster: Pick<Broadcaster, "broadcast">
  private readonly files: readonly string[]
  private readonly rootDir: string
  private readonly debounceMs: number
  private readonly watchImpl: typeof watch
  private watchers: FSWatcher[] = []
  private debounceTimer: NodeJS.Timeout | null = null
  /** Track the most recent file that fired so the broadcast carries it. */
  private pendingSource: string | null = null

  constructor(opts: DevWatcherOptions) {
    this.broadcaster = opts.broadcaster
    this.files = opts.files ?? DEFAULT_WATCH_FILES
    this.rootDir = opts.rootDir ?? resolveDefaultRootDir()
    this.debounceMs = opts.debounceMs ?? 120
    this.watchImpl = opts.watchImpl ?? watch
  }

  /**
   * Attach watches. Idempotent — calling twice is a no-op so a daemon reload
   * doesn't double-subscribe.
   */
  start(): void {
    if (this.watchers.length > 0) return
    for (const rel of this.files) {
      const abs = path.resolve(this.rootDir, rel)
      try {
        const w = this.watchImpl(abs, { persistent: false }, (eventType) => {
          // `fs.watch` fires "change" + "rename" — we only care about content
          // changes, but rename events can happen when editors atomically
          // swap files. Treat both as refresh triggers.
          if (eventType !== "change" && eventType !== "rename") return
          this.onChange(rel)
        })
        // Watcher errors (e.g. file deleted out from under us) should not
        // crash the daemon. Surface them as warnings instead.
        w.on("error", (err) => {
          // eslint-disable-next-line no-console
          console.warn(`[dash-build dev-watcher] ${rel}: ${err.message}`)
        })
        this.watchers.push(w)
      } catch (err) {
        // Missing file is fine in dev (template might not exist yet);
        // permission errors are not — log either way and keep going.
        const message = err instanceof Error ? err.message : String(err)
        // eslint-disable-next-line no-console
        console.warn(`[dash-build dev-watcher] skipped ${rel}: ${message}`)
      }
    }
  }

  /**
   * Detach every watch and clear any pending debounce. Safe to call from
   * shutdown handlers even if `start()` was never called.
   */
  stop(): void {
    for (const w of this.watchers) {
      try {
        w.close()
      } catch {
        // Already closed — ignore.
      }
    }
    this.watchers = []
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    this.pendingSource = null
  }

  /** Number of attached watchers. Tests use this to assert wiring. */
  watcherCount(): number {
    return this.watchers.length
  }

  /**
   * Internal — debounce raw fs events and emit a single broadcast per burst.
   * Public for tests so we can flush without waiting for the real timer.
   */
  onChange(source: string): void {
    this.pendingSource = source
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.debounceTimer = setTimeout(() => this.flush(), this.debounceMs)
  }

  /** Force-emit the pending refresh event (used by tests). */
  flush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    const source = this.pendingSource
    if (!source) return
    this.pendingSource = null
    const detail: RefreshEventDetail = { source, ts: Date.now() }
    this.broadcaster.broadcast("static:refresh", detail)
  }
}

function resolveDefaultRootDir(): string {
  // src/daemon/dev-watcher.ts → package src/ root.
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, "..")
}

/**
 * Convenience: read whether the daemon should boot a dev watcher. Reads the
 * `DASH_BUILD_WATCH` env var so callers don't sprinkle string literals.
 * Accepts `1`, `true`, `yes` (case-insensitive) as truthy.
 */
export function isWatcherEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.DASH_BUILD_WATCH
  if (!raw) return false
  const lower = raw.toLowerCase()
  return lower === "1" || lower === "true" || lower === "yes"
}
