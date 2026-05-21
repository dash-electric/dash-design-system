import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Bundle size budget enforcement for @dash/build.
 *
 * Raw byte sizes (not gzipped). Budgets include reasonable headroom over
 * current build output; exceeding them indicates accidental dependency
 * bloat or missed tree-shaking and warrants investigation.
 */
export const BUDGETS: Record<string, number> = {
  "dist/bin.js": 50_000, // CLI entry — tiny dispatcher (current ~8KB)
  "dist/daemon.js": 200_000, // Daemon server, http + skill chain (current ~156KB)
  "dist/index.js": 220_000, // Programmatic API surface (current ~163KB)
}

export interface CheckResult {
  file: string
  budget: number
  size: number | null // null = file not found
  status: "ok" | "exceeded" | "missing"
}

export async function checkBundleSizes(
  distDir: string,
  budgets: Record<string, number> = BUDGETS,
): Promise<CheckResult[]> {
  const results: CheckResult[] = []
  for (const [file, budget] of Object.entries(budgets)) {
    const filePath = path.join(distDir, path.basename(file))
    try {
      const stat = await fs.stat(filePath)
      results.push({
        file,
        budget,
        size: stat.size,
        status: stat.size <= budget ? "ok" : "exceeded",
      })
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        results.push({ file, budget, size: null, status: "missing" })
      } else {
        throw err
      }
    }
  }
  return results
}

function formatKb(bytes: number): string {
  return (bytes / 1024).toFixed(1)
}

export function reportResults(
  results: CheckResult[],
  log: (msg: string) => void = console.log,
  errlog: (msg: string) => void = console.error,
): { errors: string[] } {
  const errors: string[] = []
  for (const r of results) {
    if (r.status === "missing") {
      log(`! ${r.file}: not found (skip)`)
      continue
    }
    const sizeKb = formatKb(r.size!)
    const budgetKb = formatKb(r.budget)
    const mark = r.status === "ok" ? "ok" : "FAIL"
    log(`[${mark}] ${r.file}: ${sizeKb}KB / ${budgetKb}KB`)
    if (r.status === "exceeded") {
      const overKb = formatKb(r.size! - r.budget)
      errors.push(
        `${r.file} (${sizeKb}KB) exceeds budget ${budgetKb}KB by ${overKb}KB`,
      )
    }
  }
  if (errors.length > 0) {
    errlog("\nBundle size budget exceeded:")
    for (const e of errors) errlog(`  - ${e}`)
  } else {
    log("\nAll bundles within budget")
  }
  return { errors }
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const distDir = path.resolve(here, "../dist")
  const results = await checkBundleSizes(distDir)
  const { errors } = reportResults(results)
  if (errors.length > 0) process.exit(1)
}

// Run only when invoked directly, not when imported by tests.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
