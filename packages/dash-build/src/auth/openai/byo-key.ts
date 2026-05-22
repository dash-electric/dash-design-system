import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import { homedir, hostname } from "node:os"
import path from "node:path"

const AUTH_DIR_DEFAULT = path.join(homedir(), ".dash-build", "auth")
const KEY_FILENAME = "openai-byo-key.json"
const SCRYPT_SALT = "dash-build-openai-byo-v1"

type EncryptedPayload = {
  v: 1
  iv: string
  tag: string
  data: string
}

export type BYOKeyStoreOptions = {
  authDir?: string
  machineId?: string
}

export class BYOKeyStore {
  private readonly authDir: string
  private readonly keyFile: string
  private readonly encryptionKey: Buffer

  constructor(options: BYOKeyStoreOptions = {}) {
    this.authDir = options.authDir ?? AUTH_DIR_DEFAULT
    this.keyFile = path.join(this.authDir, KEY_FILENAME)
    const machineId =
      options.machineId ?? process.env.MACHINE_ID ?? `${homedir()}|${hostname()}`
    this.encryptionKey = crypto.scryptSync(machineId, SCRYPT_SALT, 32)
  }

  async save(apiKey: string): Promise<void> {
    if (!apiKey || !apiKey.startsWith("sk-")) {
      throw new Error('Invalid OpenAI API key (expected prefix "sk-").')
    }
    await fs.mkdir(this.authDir, { recursive: true })
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()])
    const tag = cipher.getAuthTag()
    const payload: EncryptedPayload = {
      v: 1,
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encrypted.toString("base64"),
    }
    await fs.writeFile(this.keyFile, JSON.stringify(payload), {
      encoding: "utf8",
      mode: 0o600,
    })
    await fs.chmod(this.keyFile, 0o600)
  }

  async load(): Promise<string | null> {
    let raw: string
    try {
      raw = await fs.readFile(this.keyFile, "utf8")
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null
      throw err
    }
    const parsed = JSON.parse(raw) as EncryptedPayload
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

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.keyFile)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
    }
  }
}
