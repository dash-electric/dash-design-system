#!/usr/bin/env node
/**
 * probe-sandpack-cdn.mjs — CI healthcheck for the Sandpack preview CDN URLs.
 *
 * The component preview pulls React + react-dom + @codesandbox/sandpack-react
 * directly from esm.sh at mount time (see
 * `src/daemon/templates/client/preview-mount.ts`). Stale or unpublished
 * version pins silently break the preview at runtime — every user sees a
 * "Preview failed" card instead of their component.
 *
 * This script HEADs every URL up front so a publish that would break preview
 * fails fast in CI instead. Wire it into `prepublishOnly` via the
 * `verify:cdn` package script.
 *
 * URL list is read at runtime from `src/constants/cdn.ts` (single source of
 * truth). We parse the constants from the TS file instead of duplicating
 * them here — version pins can never drift away from the embedded preview
 * script.
 *
 * Usage:
 *   node scripts/probe-sandpack-cdn.mjs
 *
 * Exits:
 *   0 — every URL returned 2xx (or a normal 3xx redirect)
 *   1 — at least one URL failed (4xx, 5xx, DNS error, timeout)
 *
 * Zero npm dependencies. Pure ESM, Node >= 20.
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CDN_CONSTANTS_PATH = join(__dirname, "..", "src", "constants", "cdn.ts")

// ---------- Constant extraction ----------

/**
 * Parse `export const FOO = "..."` literals from a TS source file. Tiny
 * regex-only parser — avoids needing a TS compiler at probe time. Falls
 * back loud if the format diverges so we don't silently probe stale URLs.
 */
export function parseCdnConstants(source) {
  const constants = {}
  const re = /export\s+const\s+([A-Z0-9_]+)\s*=\s*"([^"]+)"/g
  let match
  while ((match = re.exec(source)) !== null) {
    constants[match[1]] = match[2]
  }
  return constants
}

/**
 * Build the probe URL list by templating the version constants into the
 * canonical URL shapes. Mirrors the literal strings in
 * `src/daemon/templates/client/preview-mount.ts`; if those shapes change,
 * update both.
 */
export function buildProbeUrls(constants) {
  const { SANDPACK_VERSION, REACT_VERSION } = constants
  if (!SANDPACK_VERSION || !REACT_VERSION) {
    throw new Error(
      "probe-sandpack-cdn: failed to parse SANDPACK_VERSION / REACT_VERSION " +
        "from src/constants/cdn.ts — file format diverged?",
    )
  }
  return [
    `https://esm.sh/@codesandbox/sandpack-react@${SANDPACK_VERSION}`,
    `https://esm.sh/react@${REACT_VERSION}`,
    `https://esm.sh/react-dom@${REACT_VERSION}/client`,
  ]
}

/**
 * Read the constants file from disk and return the probe URL list. Tests
 * inject `readFile` to exercise the parser without a real FS.
 */
export function loadProbeUrls(opts = {}) {
  const readFile = opts.readFile ?? ((p) => readFileSync(p, "utf8"))
  const path = opts.path ?? CDN_CONSTANTS_PATH
  const source = readFile(path)
  return buildProbeUrls(parseCdnConstants(source))
}

// ---------- Probe ----------

/**
 * HEAD-fetch a single URL with a hard timeout so a slow CDN does not stall
 * the publish pipeline indefinitely. esm.sh frequently 30x-redirects to the
 * pinned version's content hash; `redirect: "follow"` is the default but is
 * spelt out for clarity.
 */
export async function probeUrl(url, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 10_000
  const fetchImpl = opts.fetch ?? globalThis.fetch
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    })
    if (!res.ok) {
      return { url, ok: false, status: res.status, message: `HTTP ${res.status}` }
    }
    return { url, ok: true, status: res.status, message: "ok" }
  } catch (err) {
    const message = err && err.name === "AbortError"
      ? `timeout after ${timeoutMs}ms`
      : err && err.message
        ? err.message
        : String(err)
    return { url, ok: false, status: null, message }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Probe every URL in `urls` in parallel and return the result list. Pure
 * function so tests can exercise the failure-reporting path with fakes.
 */
export async function probeAll(urls, opts = {}) {
  return Promise.all(urls.map((u) => probeUrl(u, opts)))
}

/**
 * Format probe results to stdout/stderr. Returns `{ failed }` so callers
 * decide the exit code; this keeps the function side-effect free for tests.
 */
export function reportResults(results, log = console.log, errlog = console.error) {
  let failed = false
  for (const r of results) {
    if (r.ok) {
      log(`ok ${r.url}`)
    } else {
      const status = r.status ?? "ERR"
      errlog(`FAIL ${r.url} -> ${status} (${r.message})`)
      failed = true
    }
  }
  if (failed) {
    errlog(
      "\nCDN healthcheck failed. Bump or unpin the CDN versions in src/constants/cdn.ts " +
        "and re-run `pnpm verify:cdn`.",
    )
  } else {
    log("\nCDN healthcheck passed.")
  }
  return { failed }
}

// ---------- CLI entrypoint ----------

async function main() {
  const urls = loadProbeUrls()
  const results = await probeAll(urls)
  const { failed } = reportResults(results)
  process.exit(failed ? 1 : 0)
}

// Run only when invoked directly, not when imported by tests.
const invokedDirectly = (() => {
  try {
    const argv1 = process.argv[1] ?? ""
    return argv1.endsWith("probe-sandpack-cdn.mjs")
  } catch {
    return false
  }
})()

if (invokedDirectly) {
  main().catch((err) => {
    console.error("probe-sandpack-cdn fatal:", err)
    process.exit(1)
  })
}
