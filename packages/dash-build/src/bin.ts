import chalk from "chalk"
import { showBanner } from "./menu/ascii-banner.js"
import { runInteractiveMenu } from "./menu/interactive-menu.js"
import { detectPort } from "./menu/port-detect.js"
import { runWebUI } from "./modes/web-ui.js"
import { runTerminalUI } from "./modes/terminal-ui.js"
import { runTray } from "./modes/tray.js"
import { runExit } from "./modes/exit.js"

const VERSION = "0.1.0"

async function main(): Promise<void> {
  showBanner(VERSION)

  const port = await detectPort(7777)

  // Loop: Terminal UI returns to menu, Web UI / Tray / Exit break out.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const choice = await runInteractiveMenu({ port, version: VERSION })

    if (choice === "web-ui") {
      await runWebUI({ port })
      return
    }

    if (choice === "tray") {
      await runTray({ port })
      return
    }

    if (choice === "exit") {
      runExit(0)
    }

    if (choice === "terminal-ui") {
      await runTerminalUI({ port })
      // Fall through — loop back to menu
      // eslint-disable-next-line no-console
      console.log(chalk.dim("Press Enter to go back to menu..."))
    }
  }
}

main().catch((err: unknown) => {
  // Graceful handling for Ctrl+C / EOF during inquirer prompts
  if (err && typeof err === "object" && (err as { name?: string }).name === "ExitPromptError") {
    // eslint-disable-next-line no-console
    console.log(chalk.dim("\n  bye 👋"))
    process.exit(0)
  }
  // eslint-disable-next-line no-console
  console.error(chalk.red("dash-build crashed:"), err)
  process.exit(1)
})
