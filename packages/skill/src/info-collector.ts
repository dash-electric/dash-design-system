/**
 * Calls `dashkit info --json` via execSync to capture project snapshot.
 *
 * v1: shells out to the Dash CLI and parses its JSON output.
 * v4: layered fingerprint + cache. `collectDashInfo` is cache-first by default;
 *     pass `forceRefresh: true` to bypass and re-scan.
 */
import { execSync, type ExecSyncOptions } from "node:child_process"
import { computeFingerprint } from "./lib/repo-fingerprint.js"
import {
  getCacheKey,
  logMetric,
  readCache,
  writeCache,
} from "./lib/snapshot-cache.js"
import { shouldRefresh } from "./lib/freshness-policy.js"

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
  /** v4: override the fingerprint computation (testing). */
  fingerprint?: (cwd: string) => Promise<string>
  /** v4: override cache read (testing). */
  readCache?: typeof readCache
  /** v4: override cache write (testing). */
  writeCache?: typeof writeCache
}

export type CollectorOpts = {
  /** v4: when true, skip cache lookup and always re-scan. */
  forceRefresh?: boolean
  /** v4: override TTL (ms). Defaults to freshness-policy default (4h). */
  ttlMs?: number
  /** v4: when true, skip cache entirely (no read, no write). */
  noCache?: boolean
}

export type CollectorResult =
  | {
      ok: true
      snapshot: DashInfoSnapshot
      /** v4: indicates whether result came from cache or fresh scan. */
      cacheHit?: boolean
      /** v4: reason cache was/wasn't used. */
      freshnessReason?: string
    }
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
 * Cache-aware collector. v4 default entry point.
 *
 * Behavior:
 *   1. Compute repo fingerprint (~10ms)
 *   2. Read cache; if fresh (fingerprint match + TTL OK) → return cached
 *   3. Else shell out to `dashkit info --json`, persist, return fresh
 *
 * Backward compat: `collectDashInfo(cwd)` and `collectDashInfo(cwd, deps)`
 * still work — opts is a NEW third parameter that defaults to {} so v3 callers
 * are unaffected. When called with the legacy 2-arg signature, cache is on
 * by default.
 *
 * Test/legacy hatch: pass `{ noCache: true }` to skip cache entirely
 * (mirrors v1-v3 behavior — every call shells out).
 */
export async function collectDashInfo(
  cwd: string = process.cwd(),
  deps: CollectorDeps = {},
  opts: CollectorOpts = {},
): Promise<CollectorResult> {
  // Bypass cache entirely (legacy parity).
  // Heuristic: when caller injects a fake `exec` (test path), default to
  // no-cache so v1-v3 test suites don't see cross-test cache pollution.
  // Explicit opts.noCache always wins; explicit opts.forceRefresh also bypasses
  // the read path so caches stay test-isolated.
  const implicitNoCache = deps.exec !== undefined && opts.forceRefresh === undefined && opts.noCache === undefined
  if (opts.noCache || implicitNoCache) {
    return scanDashInfo(cwd, deps)
  }

  const fingerprint =
    deps.fingerprint ?? ((p: string) => computeFingerprint(p))
  const readFn = deps.readCache ?? readCache
  const writeFn = deps.writeCache ?? writeCache

  const key = getCacheKey(cwd)
  let currentFp: string
  try {
    currentFp = await fingerprint(cwd)
  } catch {
    // Fingerprint failed — fall back to fresh scan (cache disabled this call).
    return scanDashInfo(cwd, deps)
  }

  const cached = readFn(key)
  const decision = shouldRefresh({
    cache: cached,
    currentFingerprint: currentFp,
    forceRefresh: opts.forceRefresh,
    ttlMs: opts.ttlMs,
  })

  if (!decision.refresh && cached) {
    logMetric({
      ts: Date.now(),
      cwdHash: key,
      outcome: "hit",
      reason: decision.reason,
    })
    return {
      ok: true,
      snapshot: cached.snapshot,
      cacheHit: true,
      freshnessReason: decision.reason,
    }
  }

  const t0 = Date.now()
  const fresh = await scanDashInfo(cwd, deps)
  const scanDurationMs = Date.now() - t0

  logMetric({
    ts: Date.now(),
    cwdHash: key,
    outcome: "miss",
    reason: decision.reason,
    scanDurationMs,
  })

  if (fresh.ok) {
    try {
      await writeFn(key, fresh.snapshot, currentFp, { cwd })
    } catch {
      /* best-effort */
    }
    return {
      ...fresh,
      cacheHit: false,
      freshnessReason: decision.reason,
    }
  }
  return fresh
}

/**
 * Run `dashkit info --json` in the given cwd. Returns a discriminated union so
 * callers can degrade gracefully when the CLI isn't on PATH or the project
 * isn't a Dash repo.
 *
 * v4: extracted from `collectDashInfo` so the cache-aware wrapper can call
 * this internally. Exported for tests + callers that explicitly want zero
 * caching (e.g. `dashkit skill refresh`).
 */
export async function scanDashInfo(
  cwd: string = process.cwd(),
  deps: CollectorDeps = {},
): Promise<CollectorResult> {
  const exec = deps.exec ?? execSync
  let raw: string
  try {
    const out = exec("dashkit info --json", {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "pipe"],
    })
    raw = typeof out === "string" ? out : out.toString("utf8")
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `dashkit info failed: ${msg}` }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `dashkit info JSON parse failed: ${msg}` }
  }

  if (!isSnapshotShape(parsed)) {
    return {
      ok: false,
      reason: "dashkit info output missing required keys (projectRoot / installedItems)",
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
