import { randomBytes } from "node:crypto"
import { loadAppConfig } from "./app-config.js"

/**
 * In-memory state cache for the OAuth install flow. The state token is
 * generated when the user clicks "Connect GitHub" and validated on the
 * callback. Lifetime is tied to the daemon process; a fresh daemon will
 * invalidate in-flight installs (acceptable — user just clicks Connect again).
 */
const stateCache = new Map<string, { createdAt: number; port: number }>()
const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

export type GetInstallUrlOptions = {
  port: number
  /** Override App slug for tests. */
  appSlug?: string
}

export type InstallUrlResult = {
  url: string
  state: string
}

/**
 * Build the GitHub App install URL. Stores the state token so the callback can
 * validate it. The URL points the user to GitHub's install page; on success
 * GitHub redirects back to the daemon's `/api/auth/github/callback` endpoint.
 */
export function getInstallUrl(opts: GetInstallUrlOptions): InstallUrlResult {
  const slug = opts.appSlug ?? loadAppConfig().appSlug
  const state = randomBytes(32).toString("hex")
  stateCache.set(state, { createdAt: Date.now(), port: opts.port })
  pruneStates()
  const url = `https://github.com/apps/${encodeURIComponent(slug)}/installations/new?state=${state}`
  return { url, state }
}

export function isValidState(state: string): boolean {
  pruneStates()
  return stateCache.has(state)
}

export function consumeState(state: string): boolean {
  pruneStates()
  const hit = stateCache.get(state)
  if (!hit) return false
  stateCache.delete(state)
  return true
}

/** Test/admin helper — wipe cached state tokens. */
export function _clearStateCache(): void {
  stateCache.clear()
}

function pruneStates(): void {
  const now = Date.now()
  for (const [k, v] of stateCache) {
    if (now - v.createdAt > STATE_TTL_MS) stateCache.delete(k)
  }
}

export type CallbackInput = {
  /** GitHub-supplied installation ID */
  installation_id: number
  /** "install" or "update" */
  setup_action: string
  /** State token from the install URL */
  state?: string
}

export type CallbackResult = {
  installationId: number
  setupAction: "install" | "update"
  accessibleRepos: Array<{ name: string; fullName: string; private: boolean }>
}

/**
 * Test seam: when set, `handleCallback` will use this factory instead of the
 * real Octokit App. Lets tests inject a mock without touching `vi.mock`.
 */
export type OctokitForInstallation = {
  rest: {
    apps: {
      listReposAccessibleToInstallation: (params?: {
        per_page?: number
      }) => Promise<{
        data: {
          repositories: Array<{ name: string; full_name: string; private: boolean }>
        }
      }>
    }
  }
}

export type AppFactory = (installationId: number) => Promise<OctokitForInstallation>

let appFactoryOverride: AppFactory | null = null

export function _setAppFactory(factory: AppFactory | null): void {
  appFactoryOverride = factory
}

/**
 * Handle GitHub's redirect after the user completes an install. Fetches the
 * list of repositories the App now has access to and returns a summary.
 */
export async function handleCallback(input: CallbackInput): Promise<CallbackResult> {
  if (input.state && !consumeState(input.state)) {
    throw new Error("Invalid or expired state token")
  }
  if (!Number.isFinite(input.installation_id) || input.installation_id <= 0) {
    throw new Error("Missing installation_id")
  }

  const factory = appFactoryOverride ?? defaultAppFactory
  const octokit = await factory(input.installation_id)
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
    per_page: 100,
  })

  return {
    installationId: input.installation_id,
    setupAction: input.setup_action === "update" ? "update" : "install",
    accessibleRepos: data.repositories.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      private: r.private,
    })),
  }
}

const defaultAppFactory: AppFactory = async (installationId) => {
  const config = loadAppConfig()
  const { App } = await import("@octokit/app")
  const app = new App({ appId: config.appId, privateKey: config.privateKey })
  return (await app.getInstallationOctokit(installationId)) as unknown as OctokitForInstallation
}
