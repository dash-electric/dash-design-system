/**
 * Calls `dash info --json` via execSync to capture project snapshot.
 *
 * v1 minimal impl: shells out to the Dash CLI and parses its JSON output.
 * Caching layer and version-skew negotiation can layer on later.
 */
import { execSync, type ExecSyncOptions } from "node:child_process"

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
  /**
   * v2-additive: which `### <repo>` section in dash-ai-rules.md applies to
   * this project. Computed from `project.rootPath` basename when the CLI does
   * not supply it. `null` when no match. Backward compatible — v1 callers
   * simply ignore this field.
   */
  detectedRepoStack?: string | null
  /**
   * v3-additive: resolved Layer-2 tenant (theme). Populated by the skill
   * loader before prompt build using lib/tenant-detector. Optional — when
   * absent the prompt-builder falls back to shared/generic context. v1/v2
   * callers ignore this field.
   */
  detectedTenant?: {
    id: string
    theme: string
    productLine: "internal" | "external"
    source:
      | "components.json"
      | "package.json"
      | "env"
      | "auto-detect"
      | "explicit-override"
  }
}

/**
 * Canonical repo slugs documented in dash-ai-rules.md `### <slug>`.
 * Kept in sync with `Per-repo stack mandates` section.
 */
export const KNOWN_REPO_STACKS = [
  "next-portal-v2-web",
  "next-backoffice-web",
  "halo-dash-fe",
  "next-basecamp-web",
  "react-fleet-management-web",
  "halo-dash-be",
  "nodejs-core-service",
  "ts-delivery-service",
  "nest-express-service",
  "nest-fleet-service",
] as const

/**
 * Derive `detectedRepoStack` from a project root path.
 *   1. Exact basename match (`/x/y/next-portal-v2-web` → `next-portal-v2-web`)
 *   2. Substring match on basename (covers worktrees like
 *      `next-portal-v2-web.feature-x`)
 *   3. Substring match on the full rootPath as last resort
 *
 * Returns `null` when nothing matches.
 */
export function detectRepoStackFromPath(rootPath: string): string | null {
  if (!rootPath || typeof rootPath !== "string") return null
  const norm = rootPath.replace(/\/+$/, "")
  const base = norm.split("/").pop() ?? ""

  for (const slug of KNOWN_REPO_STACKS) {
    if (base === slug) return slug
  }
  for (const slug of KNOWN_REPO_STACKS) {
    if (base.includes(slug)) return slug
  }
  for (const slug of KNOWN_REPO_STACKS) {
    if (norm.includes(`/${slug}`)) return slug
  }
  return null
}

export type CollectorDeps = {
  /** Injectable for testing — defaults to node:child_process.execSync. */
  exec?: (cmd: string, opts?: ExecSyncOptions) => Buffer | string
}

export type CollectorResult =
  | { ok: true; snapshot: DashInfoSnapshot }
  | { ok: false; reason: string }

/**
 * Shape-checks an arbitrary parsed value against the DashInfoSnapshot contract.
 * Best-effort: only validates the top-level keys we depend on; tolerates extra
 * fields so CLI can grow without breaking the skill.
 */
function isSnapshotShape(v: unknown): v is DashInfoSnapshot {
  if (!v || typeof v !== "object") return false
  const o = v as Record<string, unknown>
  if (typeof o.schemaVersion !== "number") return false
  if (!o.project || typeof o.project !== "object") return false
  const proj = o.project as Record<string, unknown>
  if (typeof proj.rootPath !== "string") return false
  if (!o.dash || typeof o.dash !== "object") return false
  const dash = o.dash as Record<string, unknown>
  if (!Array.isArray(dash.installedItems)) return false
  return true
}

/**
 * Run `dash info --json` in the given cwd. Returns a discriminated union so
 * callers can degrade gracefully when the CLI isn't on PATH or the project
 * isn't a Dash repo.
 */
export async function collectDashInfo(
  cwd: string = process.cwd(),
  deps: CollectorDeps = {},
): Promise<CollectorResult> {
  const exec = deps.exec ?? execSync
  let raw: string
  try {
    const out = exec("dash info --json", {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "pipe"],
    })
    raw = typeof out === "string" ? out : out.toString("utf8")
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `dash info failed: ${msg}` }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `dash info JSON parse failed: ${msg}` }
  }

  if (!isSnapshotShape(parsed)) {
    return {
      ok: false,
      reason: "dash info output missing required keys (projectRoot / installedItems)",
    }
  }

  // v2: enrich with detectedRepoStack iff CLI didn't already provide one.
  const enriched: DashInfoSnapshot = { ...parsed }
  if (
    enriched.detectedRepoStack === undefined ||
    enriched.detectedRepoStack === null
  ) {
    enriched.detectedRepoStack = detectRepoStackFromPath(
      enriched.project.rootPath,
    )
  }

  return { ok: true, snapshot: enriched }
}
