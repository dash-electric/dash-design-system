// Encrypted token store for Anthropic OAuth tokens.
//
// Storage: ~/.dash-build/auth/anthropic.json (0o600).
// Encryption: AES-256-GCM. Key derived from machine identifiers via scrypt.
//
// Threat model: this is obfuscation, not security. Same-user processes on the
// machine can read the file. Real secret management is keychain integration
// (Tier 2). The 0o600 file mode is the primary defense against other users.

import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import { homedir, hostname } from "node:os"
import path from "node:path"

const AUTH_DIR_DEFAULT = path.join(homedir(), ".dash-build", "auth")
const TOKEN_FILENAME = "anthropic.json"
const SCRYPT_SALT = "dash-build-anthropic-v1"

export type StoredTokens = {
  access_token: string
  refresh_token: string
  /** ISO 8601 timestamp when the access token expires. */
  expires_at: string
  user_email: string
}

export type AnthropicTokenStoreOptions = {
  /** Override auth directory (used in tests). */
  authDir?: string
  /** Override machine ID used in key derivation (used in tests). */
  machineId?: string
}

type EncryptedPayload = {
  v: 1
  iv: string
  tag: string
  data: string
}

export class AnthropicTokenStore {
  private readonly authDir: string
  private readonly tokenFile: string
  private readonly encryptionKey: Buffer

  constructor(options: AnthropicTokenStoreOptions = {}) {
    this.authDir = options.authDir ?? AUTH_DIR_DEFAULT
    this.tokenFile = path.join(this.authDir, TOKEN_FILENAME)
    this.encryptionKey = this.deriveKey(options.machineId)
  }

  get filePath(): string {
    return this.tokenFile
  }

  async save(tokens: StoredTokens): Promise<void> {
    await fs.mkdir(this.authDir, { recursive: true })
    const encrypted = this.encrypt(JSON.stringify(tokens))
    await fs.writeFile(this.tokenFile, encrypted, { encoding: "utf8", mode: 0o600 })
    // Ensure mode even if file already existed.
    await fs.chmod(this.tokenFile, 0o600)
  }

  async load(): Promise<StoredTokens | null> {
    let data: string
    try {
      data = await fs.readFile(this.tokenFile, "utf8")
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null
      throw err
    }
    try {
      const decrypted = this.decrypt(data)
      return JSON.parse(decrypted) as StoredTokens
    } catch (err) {
      // Corrupt or tampered file — treat as no auth, force re-auth.
      throw new Error(
        `Failed to decrypt Anthropic token store at ${this.tokenFile}: ${
          (err as Error).message
        }`,
      )
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.tokenFile)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
    }
  }

  private encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12) // GCM standard
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv)
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    const payload: EncryptedPayload = {
      v: 1,
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encrypted.toString("base64"),
    }
    return JSON.stringify(payload)
  }

  private decrypt(payload: string): string {
    const parsed = JSON.parse(payload) as EncryptedPayload
    if (parsed.v !== 1) {
      throw new Error(`Unsupported token store version: ${parsed.v}`)
    }
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      Buffer.from(parsed.iv, "base64"),
    )
    decipher.setAuthTag(Buffer.from(parsed.tag, "base64"))
    return Buffer.concat([
      decipher.update(Buffer.from(parsed.data, "base64")),
      decipher.final(),
    ]).toString("utf8")
  }

  private deriveKey(override?: string): Buffer {
    const machineId = override ?? process.env.MACHINE_ID ?? `${homedir()}|${hostname()}`
    return crypto.scryptSync(machineId, SCRYPT_SALT, 32)
  }
}
