/**
 * Tier 6 — Owner Dashboard standalone deployment constants.
 *
 * The Owner surface (`/owner`) is intentionally light on shared state with
 * the Build surface (`/`, `/workspace`) so admins can deploy it on its own
 * subdomain/port and still hit the same daemon for data. These constants
 * centralise the env var contract.
 *
 * Env vars
 * ────────
 *   - `DASH_BUILD_OWNER_ROOT_URL` — fully qualified base where the Owner
 *     dashboard is hosted. Used by health checks and any client that needs
 *     to print "open owner at <url>". Defaults to the same host as the
 *     daemon. Empty string is treated as unset.
 *
 *   - `DASH_BUILD_OWNER_HEALTH_PATH` — override the health endpoint path
 *     under the owner surface. Defaults to `/owner/health`. Useful when
 *     fronting the daemon with a reverse proxy that already owns the
 *     `/owner` prefix.
 *
 * Anything else (auth, store, branches feed) lives on the daemon itself and
 * is fetched via relative URLs — making this surface portable in a single
 * env var.
 */

export const DEFAULT_OWNER_HEALTH_PATH = "/owner/health"

export interface OwnerRuntimeConfig {
  /** Resolved root URL (falls back to runtime-detected origin). */
  ownerRootUrl: string | null
  /** Health endpoint path. */
  ownerHealthPath: string
}

export function loadOwnerRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): OwnerRuntimeConfig {
  const rawRoot = (env.DASH_BUILD_OWNER_ROOT_URL ?? "").trim()
  const rawHealth = (env.DASH_BUILD_OWNER_HEALTH_PATH ?? "").trim()
  return {
    ownerRootUrl: rawRoot.length > 0 ? rawRoot : null,
    ownerHealthPath:
      rawHealth.length > 0 ? rawHealth : DEFAULT_OWNER_HEALTH_PATH,
  }
}
