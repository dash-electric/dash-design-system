import chalk from "chalk"
import { launchDaemon } from "../daemon/launch.js"

export interface TrayOptions {
  port: number
}

export async function runTray(opts: TrayOptions): Promise<void> {
  const { port } = opts

  const daemon = await launchDaemon({ port, mode: "detached" })

  // eslint-disable-next-line no-console
  console.log(
    chalk.green(`✓ Daemon running in background at http://localhost:${port}`),
  )
  // eslint-disable-next-line no-console
  console.log(chalk.dim(`  PID ${daemon.pid} · pid file ${daemon.pidFile}`))
  // eslint-disable-next-line no-console
  console.log(chalk.dim(`  Access dashboard: http://localhost:${port}/dashboard`))
  // eslint-disable-next-line no-console
  console.log(chalk.dim(`  Stop daemon:      dash-build stop`))
  // eslint-disable-next-line no-console
  console.log(chalk.dim(`  Status:           dash-build status`))
}
