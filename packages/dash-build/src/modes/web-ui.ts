import chalk from "chalk"
import open from "open"
import { launchDaemon } from "../daemon/launch.js"
import { waitForHealth } from "../daemon/health.js"

export interface WebUIOptions {
  port: number
  /** Skip actually opening the browser (used in tests / headless). */
  skipBrowser?: boolean
}

export async function runWebUI(opts: WebUIOptions): Promise<void> {
  const { port } = opts

  // eslint-disable-next-line no-console
  console.log(chalk.dim(`→ Launching daemon on port ${port}...`))

  const daemon = await launchDaemon({ port, mode: "detached" })

  // eslint-disable-next-line no-console
  console.log(chalk.dim(`  PID ${daemon.pid} · pid file ${daemon.pidFile}`))

  // Wait for daemon /health — will gracefully time out while daemon is a stub.
  const healthy = await waitForHealth({
    url: `http://localhost:${port}/health`,
    timeoutMs: 1_500,
  })

  if (!healthy) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.yellow(
        "  ⚠ Daemon health check did not pass (expected — daemon HTTP server lands with Agent B).",
      ),
    )
  }

  const dashboardUrl = `http://localhost:${port}/dashboard`

  if (!opts.skipBrowser) {
    try {
      await open(dashboardUrl)
    } catch {
      // Browser launch failed — print URL so user can open manually
    }
  }

  // eslint-disable-next-line no-console
  console.log(chalk.green(`✓ Dashboard: ${dashboardUrl}`))
  // eslint-disable-next-line no-console
  console.log(
    chalk.dim("  Press Ctrl+C to stop daemon, or run `dash-build` again to access menu."),
  )
}
