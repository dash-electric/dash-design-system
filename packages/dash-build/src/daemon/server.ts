import { createServer, type Server } from "node:http"
import { router } from "./router.js"
import { Store } from "./state/store.js"
import { Broadcaster } from "./ws/broadcaster.js"
import { handleUpgrade } from "./ws/server.js"
import { writePidFile, deletePidFile } from "./pid-file.js"
import { DevWatcher, isWatcherEnabled } from "./dev-watcher.js"
import {
  Orchestrator,
  defaultClarificationGateway,
  defaultGithubProvider,
  defaultOpenAIProvider,
  defaultSkillChainRunner,
  Worker,
} from "../pipeline/index.js"
import { AuthenticatedOpenAIClient, AutoReconnect } from "../auth/openai/index.js"
import { GitHubAppClient } from "../integrations/github/index.js"
import { SessionStore } from "../clarification/session-store.js"
import { handleClarificationRequest } from "../clarification/api-routes.js"
import { AOPEmitter } from "../observability/aop-emitter.js"
// pid-file lives alongside this file in src/daemon/pid-file.ts

export interface DaemonServerOptions {
  port?: number
  host?: string
  statePath?: string
  writePid?: boolean
  /** Disable the worker poll loop (used in tests that drive the orchestrator directly). */
  enableWorker?: boolean
  /** Disable the real pipeline (tests that exercise only HTTP shape). */
  enablePipeline?: boolean
  /**
   * Enable the dev file watcher (CSS / template HMR). Defaults to the
   * `DASH_BUILD_WATCH` env var so production daemons stay quiet. Pass
   * `false` from tests that don't want background fs watches.
   */
  enableWatcher?: boolean
}

export interface RunningDaemon {
  server: Server
  store: Store
  broadcaster: Broadcaster
  orchestrator: Orchestrator | null
  worker: Worker | null
  /**
   * Active dev watcher, or `null` when the watcher is disabled. Exposed so
   * tests can flush events without timing the debounce window.
   */
  devWatcher: DevWatcher | null
  port: number
  host: string
  close: () => Promise<void>
}

/**
 * Boot the daemon HTTP server. Returns a handle the caller can use to shut
 * down cleanly. Bind defaults to 127.0.0.1 — daemon is local-only (security).
 */
export async function startDaemon(opts: DaemonServerOptions = {}): Promise<RunningDaemon> {
  const port = opts.port ?? Number(process.env.DASH_BUILD_PORT ?? 7777)
  const host = opts.host ?? "127.0.0.1"
  const enablePipeline = opts.enablePipeline ?? true
  const enableWorker = opts.enableWorker ?? enablePipeline
  const enableWatcher = opts.enableWatcher ?? isWatcherEnabled()

  const store = await Store.load({ path: opts.statePath })
  const broadcaster = new Broadcaster()

  // Tier 4 #16 — dev-only file watcher (off by default). Broadcasts
  // `static:refresh` to every WS client when a CSS/template file changes so
  // the dashboard can swap its stylesheet without a full reload. See
  // `src/daemon/dev-watcher.ts` for scope + env var.
  const devWatcher = enableWatcher ? new DevWatcher({ broadcaster }) : null
  devWatcher?.start()

  // ── Pipeline wiring ─────────────────────────────────────────────────────
  let orchestrator: Orchestrator | null = null
  let worker: Worker | null = null
  let clarificationStore: SessionStore | null = null
  // Sprint 1B — OpenAI auto-reconnect helper. Always constructed so the
  // manual /api/auth/openai/reconnect endpoint has something to call even
  // when the heavier pipeline (orchestrator/worker) is disabled in tests.
  const openAIClient = new AuthenticatedOpenAIClient()
  const autoReconnect = new AutoReconnect({
    client: openAIClient,
    store,
    broadcaster,
  })
  let stopAutoReconnect: (() => void) | null = null

  if (enablePipeline) {
    clarificationStore = new SessionStore()
    await clarificationStore.reload().catch(() => 0)

    const githubClient = new GitHubAppClient()

    // AOP emitter — broadcasts pipeline events over WebSocket so the chat
    // thread can stream Claude Code-style action log live. Without this
    // injection orchestrator falls back to NullAOPEmitter (events ga
    // broadcast) and builder bubbles stuck at typing-dots placeholder.
    const aopEmitter = new AOPEmitter({
      broadcaster,
      logger: {
        warn: (msg, meta) => {
          // eslint-disable-next-line no-console
          console.warn(`[aop] ${msg}`, meta ?? "")
        },
      },
    })

    const sessionStoreRef = clarificationStore
    orchestrator = new Orchestrator({
      store,
      broadcaster,
      clarification: defaultClarificationGateway(clarificationStore),
      anthropic: defaultOpenAIProvider(openAIClient),
      github: defaultGithubProvider(githubClient),
      skillChain: defaultSkillChainRunner(),
      expireSessions: (ms) => sessionStoreRef.expire(ms),
      aopEmitter,
      // Production daemon enables BE-aware intake (catalog + classifier +
      // audit-trail). Unit tests construct Orchestrator without this flag so
      // hermetic vague prompts ("do thing") don't trip the ambiguous gate.
      intakeEnabled: true,
    })

    if (enableWorker) {
      worker = new Worker({ store, orchestrator })
    }
  }

  const resumeAfterClarification = async (
    promptId: string,
    outcome: "answered" | "skipped",
  ) => {
    if ((outcome === "answered" || outcome === "skipped") && orchestrator) {
      await orchestrator.resumeAfterClarification(promptId).catch(() => {})
    }
  }

  const server = createServer((req, res) => {
    const pathname = new URL(req.url ?? "/", `http://${host}:${port}`).pathname
    if (clarificationStore && pathname.startsWith("/api/clarification/")) {
      void handleClarificationRequest(req, res, clarificationStore, {
        onComplete: resumeAfterClarification,
      }).catch((err) => {
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader("content-type", "application/json; charset=utf-8")
          res.end(
            JSON.stringify({
              error: "internal",
              message: err instanceof Error ? err.message : String(err),
            }),
          )
        }
      })
      return
    }
    void router(req, res, {
      store,
      broadcaster,
      orchestrator: orchestrator ?? undefined,
      autoReconnect,
    })
  })

  server.on("upgrade", (req, socket, head) => {
    handleUpgrade(req, socket as never, head, { broadcaster })
  })

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, host, () => {
      server.off("error", reject)
      resolve()
    })
  })

  if (opts.writePid !== false) {
    await writePidFile(process.pid)
  }

  // Start worker after server is listening
  worker?.start()

  // Sprint 1B — best-effort: if auth was previously connected but the current
  // probe fails, AutoReconnect tries to recover before the user notices. We
  // never await the result — daemon boot must not block on this.
  try {
    const savedAuth = store.getAuth().openai
    if (savedAuth.connected) {
      void autoReconnect.checkAndReconnect().catch(() => {
        /* swallow — UI will show disconnected state */
      })
    }
  } catch {
    /* swallow — never break daemon startup */
  }
  stopAutoReconnect = autoReconnect.start()

  const close = async () => {
    if (stopAutoReconnect) {
      stopAutoReconnect()
      stopAutoReconnect = null
    }
    autoReconnect.stop()
    devWatcher?.stop()
    worker?.stop()
    orchestrator?.dispose()
    broadcaster.closeAll()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    if (opts.writePid !== false) {
      await deletePidFile()
    }
    await store.persist()
  }

  return {
    server,
    store,
    broadcaster,
    orchestrator,
    worker,
    devWatcher,
    port,
    host,
    close,
  }
}

/**
 * CLI entrypoint when invoked as `node dist/daemon.js`. Wires graceful
 * shutdown on SIGTERM/SIGINT.
 */
async function main(): Promise<void> {
  const daemon = await startDaemon()
  // Use stdout for the banner so launchDaemon (when run attached) sees it.
  console.log(`✓ Daemon listening on http://${daemon.host}:${daemon.port}`)

  const shutdown = async (signal: string) => {
    console.log(`\n[dash-build daemon] received ${signal}, shutting down…`)
    try {
      await daemon.close()
    } finally {
      process.exit(0)
    }
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"))
  process.on("SIGINT", () => void shutdown("SIGINT"))
}

// Run main only when invoked directly (not when imported by tests).
const isDirectInvocation = (() => {
  try {
    const argv1 = process.argv[1] ?? ""
    return argv1.endsWith("daemon.js") || argv1.endsWith("server.js")
  } catch {
    return false
  }
})()

if (isDirectInvocation) {
  void main().catch((err) => {
    console.error("[dash-build daemon] fatal:", err)
    process.exit(1)
  })
}
