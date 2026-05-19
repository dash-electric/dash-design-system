/**
 * Calls `dash info --json` via execSync to capture project snapshot.
 *
 * SCAFFOLD ONLY — Phase 2 (post-pilot, week 3). The shape is defined; the
 * caching layer, error handling, and version-skew negotiation land later.
 */
import type { ExecSyncOptions } from "node:child_process"

export type DashInfoSnapshot = {
  schemaVersion: number
  project: {
    framework: "next" | "vite" | "remix" | "astro" | "unknown"
    typescript: boolean
    packageManager: "pnpm" | "npm" | "yarn" | "bun" | "unknown"
    rootPath: string
  }
  aliases: Record<string, string>
  dash: {
    registryUrl: string
    hasToken: boolean
    installedItems: Array<{ name: string; type: string; path: string }>
  }
  customHooks: string[]
  apiBaseUrl: string | null
}

export type CollectorDeps = {
  /** Injectable for testing — defaults to node:child_process.execSync. */
  exec?: (cmd: string, opts?: ExecSyncOptions) => Buffer | string
}

/**
 * Phase 2 will run `dash info --json` via execSync, parse, and validate
 * schemaVersion. For now this returns a TODO marker — callers should treat
 * a non-ok result as "skill scaffold, not ready".
 */
export async function collectDashInfo(
  _cwd: string,
  _deps: CollectorDeps = {},
): Promise<{ ok: false; reason: string; todo: "phase-2" }> {
  return {
    ok: false,
    reason: "TODO Phase 2 — wire execSync('dash info --json')",
    todo: "phase-2",
  }
}
