/**
 * Dependency installation — detect package manager and shell out to add deps.
 */
import { spawn } from "node:child_process"
import { detect } from "detect-package-manager"
import kleur from "kleur"

export type PkgManager = "npm" | "pnpm" | "yarn" | "bun"

export async function detectPm(cwd: string): Promise<PkgManager> {
  try {
    const pm = await detect({ cwd })
    return pm as PkgManager
  } catch {
    return "npm"
  }
}

function installCmd(pm: PkgManager, deps: string[], dev: boolean): [string, string[]] {
  if (pm === "yarn") return ["yarn", ["add", ...(dev ? ["-D"] : []), ...deps]]
  if (pm === "pnpm") return ["pnpm", ["add", ...(dev ? ["-D"] : []), ...deps]]
  if (pm === "bun") return ["bun", ["add", ...(dev ? ["-D"] : []), ...deps]]
  return ["npm", ["install", ...(dev ? ["-D"] : []), ...deps]]
}

export async function installDeps(
  deps: string[],
  opts: { cwd: string; dev?: boolean; dryRun?: boolean; pm?: PkgManager },
): Promise<void> {
  if (deps.length === 0) return
  const pm = opts.pm ?? (await detectPm(opts.cwd))
  const [cmd, args] = installCmd(pm, deps, opts.dev ?? false)

  if (opts.dryRun) {
    console.log(kleur.dim(`  · [dry-run] would run: ${cmd} ${args.join(" ")}`))
    return
  }

  console.log(kleur.cyan(`  → ${cmd} ${args.join(" ")}`))
  await new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: "inherit" })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

export function dedupeDeps(items: { dependencies?: string[]; devDependencies?: string[] }[]): {
  deps: string[]
  devDeps: string[]
} {
  const deps = new Set<string>()
  const devDeps = new Set<string>()
  for (const item of items) {
    item.dependencies?.forEach((d) => deps.add(d))
    item.devDependencies?.forEach((d) => devDeps.add(d))
  }
  // Filter dev that are also runtime
  deps.forEach((d) => devDeps.delete(d))
  return { deps: [...deps], devDeps: [...devDeps] }
}
