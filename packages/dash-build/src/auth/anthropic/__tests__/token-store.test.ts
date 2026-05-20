import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, stat, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { AnthropicTokenStore, type StoredTokens } from "../token-store.js"

let tmpDir: string

const sampleTokens = (): StoredTokens => ({
  access_token: "at-abc",
  refresh_token: "rt-xyz",
  expires_at: new Date(Date.now() + 3600_000).toISOString(),
  user_email: "irfan@dash.id",
})

const newStore = () =>
  new AnthropicTokenStore({ authDir: tmpDir, machineId: "test-machine-id" })

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "dash-build-auth-"))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe("AnthropicTokenStore", () => {
  it("save then load returns the original tokens", async () => {
    const store = newStore()
    const tokens = sampleTokens()
    await store.save(tokens)
    const loaded = await store.load()
    expect(loaded).toEqual(tokens)
  })

  it("load returns null when no file exists", async () => {
    const store = newStore()
    expect(await store.load()).toBeNull()
  })

  it("clear removes the token file", async () => {
    const store = newStore()
    await store.save(sampleTokens())
    await store.clear()
    expect(await store.load()).toBeNull()
    // Idempotent: second clear does not throw.
    await expect(store.clear()).resolves.toBeUndefined()
  })

  it("writes the token file with 0o600 permissions", async () => {
    const store = newStore()
    await store.save(sampleTokens())
    const st = await stat(store.filePath)
    const mode = st.mode & 0o777
    expect(mode).toBe(0o600)
  })

  it("produces a distinct ciphertext on every save (fresh IV)", async () => {
    const store = newStore()
    const tokens = sampleTokens()
    await store.save(tokens)
    const cipher1 = await readFile(store.filePath, "utf8")
    await store.save(tokens)
    const cipher2 = await readFile(store.filePath, "utf8")
    expect(cipher1).not.toBe(cipher2)
    // But both decrypt to the same plaintext.
    expect(await store.load()).toEqual(tokens)
  })

  it("throws a clear error when the file is corrupted (auth tag mismatch)", async () => {
    const store = newStore()
    await store.save(sampleTokens())
    // Tamper with the encrypted blob.
    await writeFile(
      store.filePath,
      JSON.stringify({ v: 1, iv: "AAAA", tag: "AAAA", data: "AAAA" }),
      "utf8",
    )
    await expect(store.load()).rejects.toThrow(/Failed to decrypt/)
  })
})
