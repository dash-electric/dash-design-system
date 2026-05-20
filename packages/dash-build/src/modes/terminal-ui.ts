import chalk from "chalk"

export interface TerminalUIOptions {
  port: number
}

/**
 * Placeholder for the Terminal UI mode.
 *
 * Future shape (post-daemon ship):
 *   - Show daemon status (running / stopped)
 *   - Prompt: "What do you want to build?"
 *   - POST to `http://localhost:${port}/api/generate`
 *   - Stream response to terminal
 *   - Show foundation score + "Open PR?" prompt
 */
export async function runTerminalUI(opts: TerminalUIOptions): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(chalk.yellow("⚠ Terminal UI coming soon."))
  // eslint-disable-next-line no-console
  console.log(
    chalk.dim(
      `  Once Agent B ships the daemon (port ${opts.port}), this mode will run an`,
    ),
  )
  // eslint-disable-next-line no-console
  console.log(chalk.dim("  interactive prompt loop against /api/generate."))
  // eslint-disable-next-line no-console
  console.log()
}
