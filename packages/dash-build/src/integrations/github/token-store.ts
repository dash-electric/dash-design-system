import { mkdir, readFile, writeFile, unlink, chmod, rename } from "node:fs/promises"
import { existsSync } from "node:fs"
import { homedir, hostname, userInfo } from "node:os"
import { dirname, join } from "node:path"
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const DEFAULT_PATH = join(homedir(), ".dash-build", "auth", "github.json")

const ALGO = "aes-256-gcm"
const KEY_LEN = 32
const IV_LEN = 12
const TAG_LEN = 16

export type AccessibleRepo = {
  name: string
  fullName: string
  private: boolean
}

export type GitHubInstallation = {
  installationId: number
  user: string
  accessibleRepos: AccessibleRepo[]
  installedAt: string
}

export interface TokenStoreOptions {
  path?: string
  /** Override machine key derivation in tests. */
  machineKey?: Buffer
}

/**
 * Persists GitHub App installation metadata under
 * `~/.dash-build/auth/github.json` with AES-256-GCM encryption.
 *
 * Mirrors the pattern used by the Anthropic token store. The machine-derived
 * key means the file cannot be moved to a different machine and decrypted
 * without re-installing the App.
 */
export class GitHubTokenStore {
  private readonly filePath: string
  private readonly machineKey: Buffer

  constructor(opts: TokenStoreOptions = {}) {
    this.filePath = opts.path ?? DEFAULT_PATH
    this.machineKey = opts.machineKey ?? deriveMachineKey()
  }

  async save(installation: GitHubInstallation): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 })
    const payload = JSON.stringify(installation)
    const blob = encrypt(payload, this.machineKey)
    const tmp = `${this.filePath}.tmp-${process.pid}-${Date.now()}`
    await writeFile(tmp, blob, { mode: 0o600 })
    await chmod(tmp, 0o600)
    await rename(tmp, this.filePath)
    // rename preserves mode but be explicit for paranoia.
    await chmod(this.filePath, 0o600)
  }

  async getInstallation(): Promise<GitHubInstallation | null> {
    if (!existsSync(this.filePath)) return null
    try {
      const blob = await readFile(this.filePath, "utf8")
      const raw = decrypt(blob, this.machineKey)
      const parsed = JSON.parse(raw) as GitHubInstallation
      if (typeof parsed.installationId !== "number") return null
      return parsed
    } catch {
      return null
    }
  }

  async clear(): Promise<void> {
    if (!existsSync(this.filePath)) return
    try {
      await unlink(this.filePath)
    } catch {
      // best-effort
    }
  }

  /** Exposed for tests. */
  get path(): string {
    return this.filePath
  }
}

function deriveMachineKey(): Buffer {
  // Combine username + hostname to bind ciphertext to this machine/account.
  const seed = `${userInfo().username}@${hostname()}::dash-build::github`
  return createHash("sha256").update(seed).digest().subarray(0, KEY_LEN)
}

function encrypt(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({
    v: 1,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: ct.toString("base64"),
  })
}

function decrypt(blob: string, key: Buffer): string {
  const obj = JSON.parse(blob) as { v: number; iv: string; tag: string; ct: string }
  if (obj.v !== 1) throw new Error("Unsupported store version")
  const iv = Buffer.from(obj.iv, "base64")
  const tag = Buffer.from(obj.tag, "base64")
  const ct = Buffer.from(obj.ct, "base64")
  if (iv.length !== IV_LEN || tag.length !== TAG_LEN) {
    throw new Error("Corrupt blob")
  }
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ct), decipher.final()])
  return pt.toString("utf8")
}
