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

  // Wait for daemon /health to return 200. Bundled daemon needs ~1-3s for
  // Store + Orchestrator + auth client init on first boot.
  const healthy = await waitForHealth({
    url: `http://localhost:${port}/health`,
    timeoutMs: 8_000,
  })

  if (!healthy) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.yellow(
        "  ⚠ Daemon /health did not respond within 8s. Check `~/.dash-build/daemon.log` or try `dash-build` again.",
      ),
    )
  } else {
    // eslint-disable-next-line no-console
    console.log(chalk.green(`  ✓ Daemon healthy on http://localhost:${port}/health`))
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
