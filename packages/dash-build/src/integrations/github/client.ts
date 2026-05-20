import type { Octokit } from "@octokit/rest"
import { GitHubTokenStore, type GitHubInstallation, type AccessibleRepo } from "./token-store.js"
import { loadAppConfig, hasAppConfig } from "./app-config.js"

export type RepoSummary = AccessibleRepo

export type RepoDetail = {
  fullName: string
  defaultBranch: string
  private: boolean
  description: string | null
}

/**
 * Test seam: allow injecting a fake Octokit factory. When unset the real
 * `@octokit/app` is used (loaded dynamically to avoid pulling it into test
 * bundles).
 */
export type OctokitFactory = (installationId: number) => Promise<Octokit>

let factoryOverride: OctokitFactory | null = null

export function _setOctokitFactory(factory: OctokitFactory | null): void {
  factoryOverride = factory
}

export type GitHubAppClientOptions = {
  store?: GitHubTokenStore
  factory?: OctokitFactory
}

/**
 * Per-installation Octokit client. Wraps token store + App auth so call sites
 * just say `await client.getOctokitForRepo("acme/foo")` and get a ready-to-use
 * Octokit.
 */
export class GitHubAppClient {
  private readonly store: GitHubTokenStore
  private readonly factory: OctokitFactory | null

  constructor(opts: GitHubAppClientOptions = {}) {
    this.store = opts.store ?? new GitHubTokenStore()
    this.factory = opts.factory ?? null
  }

  async isConnected(): Promise<boolean> {
    return (await this.store.getInstallation()) !== null
  }

  /** Returns true when the operator has provided env vars to enable GitHub. */
  static hasConfig(): boolean {
    return hasAppConfig()
  }

  /** Resolve the stored installation, throwing if not connected. */
  async getInstallation(): Promise<GitHubInstallation> {
    const installation = await this.store.getInstallation()
    if (!installation) {
      throw new Error(
        "GitHub not connected. Install the Dash Build GitHub App from the dashboard.",
      )
    }
    return installation
  }

  /**
   * Return an Octokit authenticated as the stored installation.
   * `fullName` is currently unused — kept for forward-compat when we move to
   * per-repo installations.
   */
  async getOctokit(_fullName?: string): Promise<Octokit> {
    const installation = await this.getInstallation()
    const factory = this.factory ?? factoryOverride ?? defaultFactory
    return factory(installation.installationId)
  }

  /** Alias kept for spec compatibility. */
  async getOctokitForRepo(fullName: string): Promise<Octokit> {
    return this.getOctokit(fullName)
  }

  async listRepos(): Promise<RepoSummary[]> {
    const installation = await this.getInstallation()
    // Trust the cached install payload first; refresh if empty.
    if (installation.accessibleRepos.length > 0) {
      return installation.accessibleRepos
    }
    const octokit = await this.getOctokit()
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    })
    return data.repositories.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      private: r.private,
    }))
  }

  async getRepo(fullName: string): Promise<RepoDetail> {
    const [owner, repo] = splitFullName(fullName)
    const octokit = await this.getOctokit(fullName)
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return {
      fullName: data.full_name,
      defaultBranch: data.default_branch,
      private: data.private,
      description: data.description,
    }
  }
}

export function splitFullName(fullName: string): [string, string] {
  const idx = fullName.indexOf("/")
  if (idx <= 0 || idx === fullName.length - 1) {
    throw new Error(`Invalid repo full name (expected "owner/repo"): ${fullName}`)
  }
  return [fullName.slice(0, idx), fullName.slice(idx + 1)]
}

const defaultFactory: OctokitFactory = async (installationId) => {
  const config = loadAppConfig()
  const { App } = await import("@octokit/app")
  const app = new App({ appId: config.appId, privateKey: config.privateKey })
  const octokit = await app.getInstallationOctokit(installationId)
  return octokit as unknown as Octokit
}
