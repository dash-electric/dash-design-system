/**
 * @dash/skill entry point.
 *
 * v1 minimal: wires activate → collect → build into both:
 *   - `runSkill(cwd)` legacy entry (preserved for backward compat)
 *   - `loadDashSkill(opts)` new public entry that returns a BuiltPrompt
 *
 * Resilient by design — never throws. If activation fails, snapshot fails, or
 * the rules file is missing, returns a degraded BuiltPrompt with the bits
 * that did succeed.
 */
import fs from "node:fs/promises"
import fsSync from "node:fs"
import path from "node:path"
import { shouldActivate, type ActivationResult } from "./activate.js"
import {
  collectDashInfo,
  type DashInfoSnapshot,
  type CollectorResult,
} from "./info-collector.js"
import { buildPrompt, type BuiltPrompt } from "./prompt-builder.js"
import {
  detectTenant,
  loadBlocksForTenant,
  loadThemeManifest,
  loadVoiceOverrides,
  type BlockMetadata,
  type DetectedTenant,
  type ThemeManifest,
} from "./lib/tenant-detector.js"

export type SkillRunResult = {
  status: "skipped" | "scaffold" | "ready"
  activation: ActivationResult
  snapshot: DashInfoSnapshot | null
  prompt: BuiltPrompt | null
  notes: string
}

export type LoadDashSkillOpts = {
  cwd?: string
  rulesPath?: string
  /**
   * Builder version. Defaults to 2 (priority-pinned + per-repo scoped).
   * Pass `1` to fall back to legacy 8K-truncated v1 behavior.
   * Pass `3` to enable multi-tenant scoping (Layer-2 theme + voice + blocks).
   */
  version?: 1 | 2 | 3
  /** v2/v3: hard char budget. Default 7000. */
  charBudget?: number
  /**
   * v2-only: when true (default), prefer `dash-ai-rules.compressed.md` when it
   * exists in the project. Falls back to the full file otherwise. v1 always
   * uses the full file regardless of this flag.
   */
  preferCompressedRules?: boolean
  /**
   * v3-only: explicit tenant override. Bypasses auto-detection. Validated
   * against canonical internal tenants (ride/logistic/travel/marketplace) or
   * trellis-<tenantId> dynamic ids. Invalid ids fall through to detection.
   */
  tenantId?: string
  /**
   * v3-only: location of the Dash DS (so we can read themes/manifest.json +
   * registry.json). Defaults to: snapshot.project.rootPath, then cwd. Set when
   * the consumer project lives outside the dash-ds monorepo.
   */
  dsRoot?: string
  /**
   * v4-only: bypass cache + force a fresh `dashkit info --json` scan. Default
   * `false` — cache is consulted first, re-scanning on fingerprint change or
   * TTL expiry. Pass `true` for `dashkit skill refresh` or when integrating
   * tooling that wants every call to reflect on-disk state.
   */
  forceRefresh?: boolean
  /**
   * v4-only: override cache TTL in ms. Defaults to 4h via freshness-policy.
   * Set to `0` to force every call to re-check fingerprint (still cheap when
   * files unchanged because fingerprint is stat-only).
   */
  ttlMs?: number
  /**
   * v4-only: disable the v4 cache entirely (every call shells out, mirroring
   * v1-v3 behavior). Mainly for testing.
   */
  noCache?: boolean
}

export type SkillDeps = {
  /** Override the info-collector (testing). */
  collect?: (
    cwd: string,
    deps?: unknown,
    opts?: { forceRefresh?: boolean; ttlMs?: number; noCache?: boolean },
  ) => Promise<CollectorResult>
  /** Override the rules-file reader (testing). */
  readRules?: (filePath: string) => Promise<string>
}

const DEFAULT_RULES_REL_PATHS = [
  "apps/docs/registry/rules/dash-ai-rules.md",
  "node_modules/@dash/skill/rules/dash-ai-rules.md",
]

const COMPRESSED_RULES_REL_PATHS = [
  "apps/docs/registry/rules/dash-ai-rules.compressed.md",
  "node_modules/@dash/skill/rules/dash-ai-rules.compressed.md",
]

async function tryReadRules(
  candidatePaths: string[],
  reader: (p: string) => Promise<string>,
): Promise<string | null> {
  for (const p of candidatePaths) {
    try {
      const txt = await reader(p)
      if (typeof txt === "string" && txt.length > 0) return txt
    } catch {
      /* try next */
    }
  }
  return null
}

/**
 * Primary public entry. Returns a BuiltPrompt the skill loader can splice into
 * the AI system prompt. Never throws — degrades to an empty/notice prompt if
 * the project isn't Dash-wired or the CLI isn't installed.
 */
export async function loadDashSkill(
  opts: LoadDashSkillOpts = {},
  deps: SkillDeps = {},
): Promise<BuiltPrompt> {
  const cwd = opts.cwd ?? process.cwd()
  const collect = deps.collect ?? (collectDashInfo as SkillDeps["collect"])!
  const readRules = deps.readRules ?? ((p: string) => fs.readFile(p, "utf8"))

  let snapshot: DashInfoSnapshot | null = null
  try {
    const info = await collect(cwd, undefined, {
      forceRefresh: opts.forceRefresh,
      ttlMs: opts.ttlMs,
      noCache: opts.noCache,
    })
    if (info.ok) snapshot = info.snapshot
  } catch {
    snapshot = null
  }

  const projectRoot = snapshot?.project.rootPath ?? cwd
  const version = opts.version ?? 2
  const preferCompressed =
    opts.preferCompressedRules ?? version === 2

  const rulesCandidates: string[] = []
  if (opts.rulesPath) rulesCandidates.push(opts.rulesPath)
  // When v2 + preferCompressed, try compressed paths FIRST, then full.
  if (preferCompressed) {
    for (const rel of COMPRESSED_RULES_REL_PATHS) {
      rulesCandidates.push(path.join(projectRoot, rel))
    }
  }
  for (const rel of DEFAULT_RULES_REL_PATHS) {
    rulesCandidates.push(path.join(projectRoot, rel))
  }
  if (projectRoot !== cwd) {
    if (preferCompressed) {
      for (const rel of COMPRESSED_RULES_REL_PATHS) {
        rulesCandidates.push(path.join(cwd, rel))
      }
    }
    for (const rel of DEFAULT_RULES_REL_PATHS) {
      rulesCandidates.push(path.join(cwd, rel))
    }
  }

  let aiRules: string | null = null
  try {
    aiRules = await tryReadRules(rulesCandidates, readRules)
  } catch {
    aiRules = null
  }

  // v3: resolve tenant + load tenant-scoped context. No-op when version !== 3.
  let tenantContext:
    | {
        theme: ThemeManifest | null
        voiceOverrides: string | null
        blocks: BlockMetadata[]
      }
    | null = null
  if (version === 3) {
    let tenant: DetectedTenant | undefined
    try {
      tenant = detectTenant({
        explicit: opts.tenantId,
        snapshot,
        projectRoot,
      })
    } catch {
      tenant = undefined
    }

    if (snapshot && tenant) {
      snapshot.detectedTenant = tenant
    } else if (snapshot) {
      // ensure field is not stale
      snapshot.detectedTenant = undefined
    }

    const dsRoot = opts.dsRoot ?? projectRoot
    try {
      const theme = tenant ? loadThemeManifest(tenant.id, { dsRoot }) : null
      const voiceOverrides = tenant
        ? loadVoiceOverrides(tenant.id, { dsRoot })
        : null
      const blocks = loadBlocksForTenant(tenant?.id ?? null, { dsRoot })
      tenantContext = { theme, voiceOverrides, blocks }
    } catch {
      tenantContext = { theme: null, voiceOverrides: null, blocks: [] }
    }
  }

  return buildPrompt(
    { snapshot, aiRules, glossary: null, tenantContext },
    { version, charBudget: opts.charBudget },
  )
}

/**
 * v3 helper for consumers (Hermes worker, dashboard, AI clients) that need to
 * inspect tenant context WITHOUT building the full prompt. Performs the same
 * detection + lookup the v3 builder runs, returning a structured object.
 *
 * Backward-compatible: works on a v1/v2 snapshot too — it just performs
 * detection from scratch.
 */
export function getTenantContext(
  snapshot: DashInfoSnapshot | null,
  opts: {
    explicit?: string
    dsRoot?: string
    aiRules?: string | null
  } = {},
): {
  tenantId: string | null
  tenant: DetectedTenant | null
  theme: ThemeManifest | null
  voiceOverrides: string | null
  blocks: BlockMetadata[]
  cardinalRules: string | null
} {
  const projectRoot = snapshot?.project?.rootPath
  const tenant =
    detectTenant({
      explicit: opts.explicit,
      snapshot,
      projectRoot,
    }) ?? null

  const dsRoot = opts.dsRoot ?? projectRoot
  const theme = tenant ? loadThemeManifest(tenant.id, { dsRoot }) : null
  const voiceOverrides = tenant ? loadVoiceOverrides(tenant.id, { dsRoot }) : null
  const blocks = loadBlocksForTenant(tenant?.id ?? null, { dsRoot })

  let cardinalRules: string | null = null
  if (opts.aiRules) {
    cardinalRules = opts.aiRules
  } else if (dsRoot) {
    for (const rel of [
      "apps/docs/registry/rules/dash-ai-rules.compressed.md",
      "apps/docs/registry/rules/dash-ai-rules.md",
    ]) {
      try {
        const txt = fsSync.readFileSync(path.join(dsRoot, rel), "utf8")
        if (txt && txt.length > 0) {
          cardinalRules = txt
          break
        }
      } catch {
        /* try next */
      }
    }
  }

  return {
    tenantId: tenant?.id ?? null,
    tenant,
    theme,
    voiceOverrides,
    blocks,
    cardinalRules,
  }
}

/**
 * Legacy entry — preserved so existing callers / activate manifest keep
 * working. Wraps `loadDashSkill` with the activation gate.
 */
export async function runSkill(
  cwd: string = process.cwd(),
): Promise<SkillRunResult> {
  const activation = shouldActivate(cwd)
  if (!activation.active) {
    return {
      status: "skipped",
      activation,
      snapshot: null,
      prompt: null,
      notes: "CWD is not Dash-wired — skill inert.",
    }
  }

  let snapshot: DashInfoSnapshot | null = null
  try {
    const info = await collectDashInfo(cwd)
    if (info.ok) snapshot = info.snapshot
  } catch {
    snapshot = null
  }

  const prompt = await loadDashSkill({ cwd })

  return {
    status: snapshot ? "ready" : "scaffold",
    activation,
    snapshot,
    prompt,
    notes: snapshot
      ? "Dash context loaded."
      : "Dash CLI unavailable or non-Dash repo — prompt degraded.",
  }
}

export { shouldActivate, collectDashInfo, buildPrompt }
export { scanDashInfo } from "./info-collector.js"
export {
  computeFingerprint,
  computeFingerprintSync,
  collectFingerprintParts,
} from "./lib/repo-fingerprint.js"
export {
  getCacheKey,
  readCache,
  writeCache,
  clearCache,
  clearAllCaches,
  listCacheEntries,
  getCacheDir,
  getMetricsPath,
  CACHE_SCHEMA_VERSION,
} from "./lib/snapshot-cache.js"
export type { CachedSnapshot, CacheMetricEvent } from "./lib/snapshot-cache.js"
export {
  shouldRefresh,
  describeFreshness,
  DEFAULT_CACHE_TTL_MS,
} from "./lib/freshness-policy.js"
export type {
  FreshnessDecision,
  FreshnessReason,
  FreshnessInput,
} from "./lib/freshness-policy.js"
export {
  detectTenant,
  loadBlocksForTenant,
  loadThemeManifest,
  loadVoiceOverrides,
  isValidTenantId,
  KNOWN_INTERNAL_TENANTS,
  TRELLIS_TEMPLATE,
} from "./lib/tenant-detector.js"
export type {
  ActivationResult,
  DashInfoSnapshot,
  BuiltPrompt,
  CollectorResult,
}
export type {
  DetectedTenant,
  ThemeManifest,
  BlockMetadata,
  ProductLine,
} from "./lib/tenant-detector.js"
