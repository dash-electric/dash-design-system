/**
 * GitHub App configuration loaded from environment variables.
 *
 * For Wave 5 pilot, the operator (Irfan) registers a GitHub App manually on
 * the target org (e.g. irfanputra-design) and exports the values below into
 * the daemon environment before starting `dash-build`.
 *
 * See README "GitHub App setup" for step-by-step instructions.
 */
export type AppConfig = {
  /** Numeric App ID from GitHub App settings page */
  appId: string
  /** PEM-encoded RSA private key generated for the App */
  privateKey: string
  /** Optional webhook signing secret (only required if webhooks are enabled) */
  webhookSecret: string
  /** OAuth Client ID (used for user-to-server flows) */
  clientId: string
  /** OAuth Client Secret */
  clientSecret: string
  /** Public slug used in install URL (https://github.com/apps/<slug>) */
  appSlug: string
}

/**
 * Load configuration from environment. Throws on missing required values.
 *
 * Required envs:
 *   - DASH_BUILD_GITHUB_APP_ID
 *   - DASH_BUILD_GITHUB_PRIVATE_KEY  (PEM, may contain literal `\n` which is normalized)
 *   - DASH_BUILD_GITHUB_CLIENT_ID
 *   - DASH_BUILD_GITHUB_CLIENT_SECRET
 *
 * Optional envs:
 *   - DASH_BUILD_GITHUB_WEBHOOK_SECRET
 *   - DASH_BUILD_GITHUB_APP_SLUG (default: "dash-build")
 */
export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    appId: requireEnv(env, "DASH_BUILD_GITHUB_APP_ID"),
    privateKey: normalizePem(requireEnv(env, "DASH_BUILD_GITHUB_PRIVATE_KEY")),
    webhookSecret: env.DASH_BUILD_GITHUB_WEBHOOK_SECRET ?? "",
    clientId: requireEnv(env, "DASH_BUILD_GITHUB_CLIENT_ID"),
    clientSecret: requireEnv(env, "DASH_BUILD_GITHUB_CLIENT_SECRET"),
    appSlug: env.DASH_BUILD_GITHUB_APP_SLUG ?? "dash-build",
  }
}

function requireEnv(env: NodeJS.ProcessEnv, key: string): string {
  const v = env[key]
  if (!v || v.length === 0) {
    throw new Error(
      `Missing env var: ${key}. See packages/dash-build/README.md "GitHub App setup".`,
    )
  }
  return v
}

/**
 * Some shells (and `.env` parsers) escape newlines in PEM keys as the literal
 * string "\n". Octokit needs real newlines, so normalize.
 */
function normalizePem(raw: string): string {
  if (raw.includes("\\n")) {
    return raw.replace(/\\n/g, "\n")
  }
  return raw
}

/**
 * Returns true when all required env vars are present. Lets the daemon skip
 * GitHub features gracefully when the operator has not configured the App yet.
 */
export function hasAppConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  return [
    "DASH_BUILD_GITHUB_APP_ID",
    "DASH_BUILD_GITHUB_PRIVATE_KEY",
    "DASH_BUILD_GITHUB_CLIENT_ID",
    "DASH_BUILD_GITHUB_CLIENT_SECRET",
  ].every((k) => env[k] && env[k]!.length > 0)
}
