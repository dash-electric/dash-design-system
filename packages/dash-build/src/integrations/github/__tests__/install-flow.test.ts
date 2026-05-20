import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  getInstallUrl,
  handleCallback,
  isValidState,
  consumeState,
  _setAppFactory,
  _clearStateCache,
  type OctokitForInstallation,
} from "../install-flow.js"

function fakeOctokit(repos: Array<{ name: string; full_name: string; private: boolean }>) {
  const ok: OctokitForInstallation = {
    rest: {
      apps: {
        listReposAccessibleToInstallation: async () => ({ data: { repositories: repos } }),
      },
    },
  }
  return ok
}

beforeEach(() => {
  _clearStateCache()
})

afterEach(() => {
  _setAppFactory(null)
  _clearStateCache()
})

describe("getInstallUrl", () => {
  it("produces a github.com/apps URL with state token", () => {
    const { url, state } = getInstallUrl({ port: 7777, appSlug: "dash-build" })
    expect(url).toMatch(/^https:\/\/github\.com\/apps\/dash-build\/installations\/new\?state=/)
    expect(state).toMatch(/^[a-f0-9]{64}$/)
    expect(url).toContain(state)
  })

  it("URL-encodes slugs containing special chars", () => {
    const { url } = getInstallUrl({ port: 7777, appSlug: "dash build prod" })
    expect(url).toContain("dash%20build%20prod")
  })

  it("registers state so isValidState returns true", () => {
    const { state } = getInstallUrl({ port: 7777, appSlug: "dash-build" })
    expect(isValidState(state)).toBe(true)
    expect(isValidState("not-real")).toBe(false)
  })
})

describe("handleCallback", () => {
  it("returns installation summary on success", async () => {
    _setAppFactory(async () =>
      fakeOctokit([
        { name: "alpha", full_name: "octo/alpha", private: false },
        { name: "beta", full_name: "octo/beta", private: true },
      ]),
    )
    const { state } = getInstallUrl({ port: 7777, appSlug: "dash-build" })
    const result = await handleCallback({
      installation_id: 42,
      setup_action: "install",
      state,
    })
    expect(result.installationId).toBe(42)
    expect(result.setupAction).toBe("install")
    expect(result.accessibleRepos).toEqual([
      { name: "alpha", fullName: "octo/alpha", private: false },
      { name: "beta", fullName: "octo/beta", private: true },
    ])
  })

  it("rejects unknown state token", async () => {
    _setAppFactory(async () => fakeOctokit([]))
    await expect(
      handleCallback({ installation_id: 1, setup_action: "install", state: "bogus" }),
    ).rejects.toThrow(/invalid or expired state/i)
  })

  it("rejects missing installation_id", async () => {
    _setAppFactory(async () => fakeOctokit([]))
    await expect(
      handleCallback({ installation_id: 0, setup_action: "install" }),
    ).rejects.toThrow(/installation_id/i)
  })
})

describe("consumeState", () => {
  it("removes state once used", () => {
    const { state } = getInstallUrl({ port: 7777, appSlug: "dash-build" })
    expect(consumeState(state)).toBe(true)
    expect(consumeState(state)).toBe(false)
  })
})
