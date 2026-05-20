import chalk from "chalk"
import boxen from "boxen"

const DASH_PURPLE = "#5e2aac"

export function showBanner(version = "0.1.0"): void {
  const purple = chalk.hex(DASH_PURPLE).bold
  const dim = chalk.gray

  const title = purple(`  D A S H   B U I L D   v${version}  `)
  const tagline = dim("Lovable-for-Dash internal builder")

  const content = `${title}\n\n${tagline}`

  const box = boxen(content, {
    padding: 1,
    margin: 0,
    borderStyle: "double",
    borderColor: "magenta",
    align: "center",
  })

  // eslint-disable-next-line no-console
  console.log(box)
}
