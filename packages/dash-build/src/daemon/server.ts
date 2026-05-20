import { createServer, type Server } from "node:http"
import { router } from "./router.js"
import { Store } from "./state/store.js"
import { Broadcaster } from "./ws/broadcaster.js"
import { handleUpgrade } from "./ws/server.js"
import { writePidFile, deletePidFile } from "./pid-file.js"
// pid-file lives alongside this file in src/daemon/pid-file.ts

export interface DaemonServerOptions {
  port?: number
  host?: string
  statePath?: string
  writePid?: boolean
}

export interface RunningDaemon {
  server: Server
  store: Store
  broadcaster: Broadcaster
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

  const store = await Store.load({ path: opts.statePath })
  const broadcaster = new Broadcaster()

  const server = createServer((req, res) => {
    void router(req, res, { store, broadcaster })
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

  const close = async () => {
    broadcaster.closeAll()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    if (opts.writePid !== false) {
      await deletePidFile()
    }
    await store.persist()
  }

  return { server, store, broadcaster, port, host, close }
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
