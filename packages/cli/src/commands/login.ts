/**
 * `dashkit login` / `dashkit logout` — manage persistent Bearer tokens at
 * `~/.dash/credentials.json`. Credentials are keyed by registry URL so
 * users with multiple registries (staging vs prod) can authenticate to each.
 */
import kleur from "kleur"
import prompts from "prompts"
import {
  credentialsFilePath,
  deleteCredential,
  setCredential,
} from "../lib/credentials.js"
import { DEFAULT_REGISTRY_URL, readComponentsJson } from "../lib/components-json.js"

export type LoginOpts = {
  registry?: string
  token?: string
  cwd?: string
}

export async function runLogin(opts: LoginOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registry ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  let token = opts.token
  if (!token) {
    const res = await prompts({
      type: "password",
      name: "token",
      message: `Bearer token for ${registryUrl}:`,
    })
    token = res.token
  }

  if (!token) {
    console.log(kleur.yellow("✗ No token provided — aborting"))
    process.exitCode = 1
    return
  }

  const file = setCredential(registryUrl, token)
  console.log(kleur.green(`✓ Saved credentials for ${registryUrl}`))
  console.log(kleur.dim(`  ${file}`))
}

export type LogoutOpts = {
  registry?: string
  cwd?: string
}

export async function runLogout(opts: LogoutOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registry ?? config?.registries?.["@dash"]?.url ?? DEFAULT_REGISTRY_URL

  const removed = deleteCredential(registryUrl)
  if (removed) {
    console.log(kleur.green(`✓ Removed credentials for ${registryUrl}`))
    console.log(kleur.dim(`  ${credentialsFilePath()}`))
  } else {
    console.log(kleur.yellow(`! No credentials found for ${registryUrl}`))
  }
}
