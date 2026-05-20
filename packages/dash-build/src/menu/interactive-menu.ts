import { select } from "@inquirer/prompts"
import chalk from "chalk"

export type MenuChoice = "web-ui" | "terminal-ui" | "tray" | "exit"

export interface MenuOptions {
  port: number
  version?: string
}

/**
 * Show interactive 9router-style menu and return user choice.
 * Exported separately so tests can mock the prompt layer.
 */
export async function runInteractiveMenu(opts: MenuOptions): Promise<MenuChoice> {
  const version = opts.version ?? "0.1.0"

  // eslint-disable-next-line no-console
  console.log(chalk.bold.magenta("═══════════════════════════════════════"))
  // eslint-disable-next-line no-console
  console.log(chalk.bold(`Choose Interface (v${version})`))
  // eslint-disable-next-line no-console
  console.log(chalk.green(`🚀 Server: http://localhost:${opts.port}`))
  // eslint-disable-next-line no-console
  console.log(chalk.bold.magenta("═══════════════════════════════════════"))
  // eslint-disable-next-line no-console
  console.log()

  const choice = await select<MenuChoice>({
    message: "Pick a mode:",
    default: "web-ui",
    choices: [
      {
        name: "Web UI (Open in Browser)",
        value: "web-ui",
        description: "Start daemon and open browser dashboard",
      },
      {
        name: "Terminal UI (Interactive CLI)",
        value: "terminal-ui",
        description: "CLI prompt loop (coming soon)",
      },
      {
        name: "Hide to Tray (Background)",
        value: "tray",
        description: "Start daemon detached, no browser",
      },
      {
        name: "Exit",
        value: "exit",
        description: "Quit dash-build",
      },
    ],
  })

  return choice
}
