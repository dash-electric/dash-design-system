/**
 * Persistent registry credentials at `~/.dash/credentials.json`.
 *
 * Format:
 *   {
 *     "http://localhost:3000": { "token": "..." },
 *     "https://registry.dash.io": { "token": "..." }
 *   }
 *
 * Permissions: file written with mode 0600 (owner read/write only) when
 * supported by the OS. Failure to chmod is non-fatal.
 *
 * Lookup is exact-string against the registry URL. We also normalize trailing
 * slashes so `http://x` and `http://x/` are treated as the same registry.
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"

export const CREDENTIALS_FILE = "credentials.json"

export type CredentialsStore = Record<string, { token: string }>

export type CredentialsOpts = {
  rootDir?: string
}

function defaultRoot(): string {
  return path.join(os.homedir(), ".dash")
}

function credentialsPath(opts: CredentialsOpts = {}): string {
  return path.join(opts.rootDir ?? defaultRoot(), CREDENTIALS_FILE)
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

export function readCredentials(opts: CredentialsOpts = {}): CredentialsStore {
  const file = credentialsPath(opts)
  if (!fs.existsSync(file)) return {}
  try {
    const raw = fs.readFileSync(file, "utf-8")
    const parsed = JSON.parse(raw) as CredentialsStore
    if (!parsed || typeof parsed !== "object") return {}
    return parsed
  } catch {
    return {}
  }
}

export function writeCredentials(
  store: CredentialsStore,
  opts: CredentialsOpts = {},
): string {
  const file = credentialsPath(opts)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(store, null, 2) + "\n", "utf-8")
  try {
    fs.chmodSync(file, 0o600)
  } catch {
    // Windows / restricted FS — non-fatal.
  }
  return file
}

export function setCredential(
  registryUrl: string,
  token: string,
  opts: CredentialsOpts = {},
): string {
  const store = readCredentials(opts)
  store[normalizeUrl(registryUrl)] = { token }
  return writeCredentials(store, opts)
}

export function deleteCredential(
  registryUrl: string,
  opts: CredentialsOpts = {},
): boolean {
  const store = readCredentials(opts)
  const key = normalizeUrl(registryUrl)
  if (!(key in store)) return false
  delete store[key]
  writeCredentials(store, opts)
  return true
}

export function getCredential(
  registryUrl: string,
  opts: CredentialsOpts = {},
): string | undefined {
  const store = readCredentials(opts)
  return store[normalizeUrl(registryUrl)]?.token
}

/** Exposed for tests / `dash login --help` messaging. */
export function credentialsFilePath(opts: CredentialsOpts = {}): string {
  return credentialsPath(opts)
}
