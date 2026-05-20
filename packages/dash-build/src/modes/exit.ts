import chalk from "chalk"

export function runExit(code = 0): never {
  // eslint-disable-next-line no-console
  console.log(chalk.dim("\n  bye 👋"))
  process.exit(code)
}
