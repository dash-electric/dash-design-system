import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm, writeFile, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import {
  GitHubTokenStore,
  type GitHubInstallation,
} from "../token-store.js"

let dir: string
let filePath: string
const key = randomBytes(32)

const sample: GitHubInstallation = {
  installationId: 12345,
  user: "octocat",
  accessibleRepos: [
    { name: "demo", fullName: "octocat/demo", private: false },
    { name: "secret", fullName: "octocat/secret", private: true },
  ],
  installedAt: "2026-05-21T00:00:00.000Z",
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dash-build-gh-"))
  filePath = join(dir, "auth", "github.json")
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("GitHubTokenStore", () => {
  it("round-trips an installation through save + getInstallation", async () => {
    const store = new GitHubTokenStore({ path: filePath, machineKey: key })
    await store.save(sample)
    const loaded = await store.getInstallation()
    expect(loaded).toEqual(sample)
  })

  it("clear() removes the file", async () => {
    const store = new GitHubTokenStore({ path: filePath, machineKey: key })
    await store.save(sample)
    await store.clear()
    expect(await store.getInstallation()).toBeNull()
    // clear() on empty store is a no-op.
    await expect(store.clear()).resolves.toBeUndefined()
  })

  it("returns null when the file is corrupt", async () => {
    const store = new GitHubTokenStore({ path: filePath, machineKey: key })
    await store.save(sample)
    await writeFile(filePath, "not-json-at-all", "utf8")
    expect(await store.getInstallation()).toBeNull()
  })

  it("writes the token file with 0o600 permissions", async () => {
    const store = new GitHubTokenStore({ path: filePath, machineKey: key })
    await store.save(sample)
    const st = await stat(filePath)
    // mask to permission bits
    const mode = st.mode & 0o777
    expect(mode).toBe(0o600)
  })
})
