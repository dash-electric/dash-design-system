/**
 * Hermes worker configuration. Resolves env vars + optional `config.json`
 * sitting next to the package. Never reaches network — pure value derivation.
 *
 * Required:
 *   - ANTHROPIC_API_KEY (skipped in tests via `dryRun` flag)
 *
 * Optional (with defaults):
 *   - GITHUB_TOKEN          (PR creation; dry-run when missing)
 *   - GITHUB_REPO           (default: "irfanputra-design/dash")
 *   - SLACK_WEBHOOK_URL     (notifications disabled when missing)
 *   - MIN_SCORE_AUTO_MERGE  (default: 85)
 *   - MIN_SCORE_REVIEW      (default: 60)
 *   - POLL_INTERVAL_MS      (default: 60000)
 *   - ANTHROPIC_MODEL       (default: "claude-opus-4-7")
 *   - REGISTRY_ROOT         (default: <repo>/apps/docs/registry/dash)
 */
import fs from "node:fs"
import path from "node:path"

export type WorkerConfig = {
  anthropicApiKey: string | null
  anthropicModel: string
  githubToken: string | null
  githubRepo: string
  slackWebhookUrl: string | null
  minScoreAutoMerge: number
  minScoreReview: number
  pollIntervalMs: number
  registryRoot: string | null
  /** When true, generator/PR creator stub their network calls. */
  dryRun: boolean
}

const DEFAULTS = {
  anthropicModel: "claude-opus-4-7",
  githubRepo: "irfanputra-design/dash",
  minScoreAutoMerge: 85,
  minScoreReview: 60,
  pollIntervalMs: 60_000,
} as const

function parseIntEnv(v: string | undefined, fallback: number): number {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

function readConfigFile(filePath: string): Record<string, unknown> {
  try {
    if (!fs.existsSync(filePath)) return {}
    const raw = fs.readFileSync(filePath, "utf-8")
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}
    return parsed as Record<string, unknown>
  } catch {
    return {}
  }
}

export function loadConfig(
  opts: {
    configPath?: string
    env?: NodeJS.ProcessEnv
    dryRun?: boolean
  } = {},
): WorkerConfig {
  const env = opts.env ?? process.env
  const fileCfg = readConfigFile(
    opts.configPath ?? path.join(process.cwd(), "config.json"),
  )

  const pick = (key: string): string | undefined => {
    const fromEnv = env[key]
    if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv
    const fromFile = fileCfg[key]
    if (typeof fromFile === "string" && fromFile.length > 0) return fromFile
    return undefined
  }

  return {
    anthropicApiKey: pick("ANTHROPIC_API_KEY") ?? null,
    anthropicModel: pick("ANTHROPIC_MODEL") ?? DEFAULTS.anthropicModel,
    githubToken: pick("GITHUB_TOKEN") ?? null,
    githubRepo: pick("GITHUB_REPO") ?? DEFAULTS.githubRepo,
    slackWebhookUrl: pick("SLACK_WEBHOOK_URL") ?? null,
    minScoreAutoMerge: parseIntEnv(
      pick("MIN_SCORE_AUTO_MERGE"),
      DEFAULTS.minScoreAutoMerge,
    ),
    minScoreReview: parseIntEnv(
      pick("MIN_SCORE_REVIEW"),
      DEFAULTS.minScoreReview,
    ),
    pollIntervalMs: parseIntEnv(
      pick("POLL_INTERVAL_MS"),
      DEFAULTS.pollIntervalMs,
    ),
    registryRoot: pick("REGISTRY_ROOT") ?? null,
    dryRun: opts.dryRun ?? false,
  }
}
