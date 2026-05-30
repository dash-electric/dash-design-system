/**
 * Namespace dispatch — multi-registry support via shadcn-style
 * `@<namespace>/<item>` protocol.
 *
 * Examples:
 *   dashkit add button                       → @dash/button (default)
 *   dashkit add @dash/button                 → @dash/button (explicit)
 *   dashkit add @trellis/some-tenant-block   → @trellis/some-tenant-block
 *   dashkit add @logistic/route-planner      → @logistic/route-planner
 *
 * Per-namespace URLs resolve from (in order):
 *   1. components.json `registries` field, e.g. `registries["@trellis"].url`
 *   2. <NAMESPACE>_REGISTRY_URL env var (uppercase, e.g. TRELLIS_REGISTRY_URL)
 *   3. Built-in defaults (dash | trellis | logistic)
 *
 * Tokens per namespace resolve via the existing token resolution chain in
 * `registry-fetch.ts` — `registries[@<ns>].headers.Authorization` already
 * supports `${ENV_VAR}` interpolation, so adding a `@trellis` entry with a
 * `Bearer ${TRELLIS_REGISTRY_TOKEN}` header is enough to wire auth.
 */
import type { ComponentsJson } from "./schema.js"
import { RegistryError } from "./registry-fetch.js"

/** Default namespace applied when an item name has no `@` prefix. */
export const DEFAULT_NAMESPACE = "dash"

/**
 * Built-in registry URL defaults. Real values resolve from
 * components.json or env vars — these are the last-resort fallbacks.
 */
export const BUILT_IN_REGISTRY_URLS: Record<string, string> = {
  dash: process.env.DASH_REGISTRY_URL ?? "https://ds.dash.com",
  trellis: process.env.TRELLIS_REGISTRY_URL ?? "https://trellis.ds.dash.com",
  logistic:
    process.env.DASH_LOGISTIC_REGISTRY_URL ?? "https://logistic.ds.dash.com",
}

export type ParsedItemName = {
  /** Namespace without leading `@`. Always lowercase. */
  namespace: string
  /** Item name (no namespace prefix). */
  item: string
  /** True iff the raw input carried an explicit `@<ns>/` prefix. */
  explicit: boolean
}

/**
 * Parse a CLI item argument into `{ namespace, item }`. Bare names (no `@`)
 * default to the `dash` namespace.
 *
 * Throws when the `@` prefix is malformed (empty namespace, empty item, or
 * missing `/` separator).
 */
export function parseItemName(name: string): ParsedItemName {
  if (!name || typeof name !== "string") {
    throw new RegistryError(`Invalid item name: ${JSON.stringify(name)}`)
  }
  const trimmed = name.trim()
  if (!trimmed.startsWith("@")) {
    return { namespace: DEFAULT_NAMESPACE, item: trimmed, explicit: false }
  }
  // `@ns/item` form
  const slash = trimmed.indexOf("/")
  if (slash < 0) {
    throw new RegistryError(
      `Malformed namespaced item: "${name}"`,
      {
        suggestion:
          "Expected `@<namespace>/<item>` (e.g. `@dash/button`). Did you mean `@dash/${name.slice(1)}`?",
      },
    )
  }
  const ns = trimmed.slice(1, slash).trim().toLowerCase()
  const item = trimmed.slice(slash + 1).trim()
  if (!ns) {
    throw new RegistryError(`Malformed namespaced item: "${name}" — empty namespace`)
  }
  if (!item) {
    throw new RegistryError(`Malformed namespaced item: "${name}" — empty item`)
  }
  return { namespace: ns, item, explicit: true }
}

/**
 * Resolve the registry URL for a given namespace.
 *
 * Lookup order:
 *   1. components.json `registries["@<ns>"].url` (per-project override)
 *   2. components.json `registries["<ns>"].url`  (allow bare key too)
 *   3. <NAMESPACE>_REGISTRY_URL env var
 *   4. Built-in defaults table
 *
 * Throws RegistryError with the list of known namespaces when none match.
 */
export function resolveRegistryUrl(
  namespace: string,
  config?: ComponentsJson | null,
): string {
  const ns = namespace.toLowerCase()
  const fromConfig =
    config?.registries?.[`@${ns}`]?.url ?? config?.registries?.[ns]?.url
  if (fromConfig) return fromConfig

  const envKey = `${ns.toUpperCase()}_REGISTRY_URL`
  const fromEnv = process.env[envKey]
  if (fromEnv) return fromEnv

  const builtin = BUILT_IN_REGISTRY_URLS[ns]
  if (builtin) return builtin

  const known = listKnownNamespaces(config)
  throw new RegistryError(`Unknown namespace: @${ns}`, {
    suggestion: `Available: ${known.map((n) => `@${n}`).join(", ")}. Add a "registries" entry to components.json to register a new namespace.`,
  })
}

/**
 * Resolve the per-namespace Bearer token header from components.json
 * `registries["@<ns>"].headers.Authorization`. Returns undefined when no
 * override is present — caller should then fall back to the legacy token
 * resolution chain in `registry-fetch.ts#resolveToken`.
 */
export function resolveRegistryToken(
  namespace: string,
  config?: ComponentsJson | null,
): string | undefined {
  const ns = namespace.toLowerCase()
  const entry =
    config?.registries?.[`@${ns}`] ?? config?.registries?.[ns]
  const auth = entry?.headers?.Authorization
  if (!auth) return undefined
  // Strip `Bearer ` prefix and interpolate `${ENV_VAR}` references.
  const stripped = auth.replace(/^Bearer\s+/i, "")
  return interpolateEnv(stripped)
}

/** Replace `${VAR}` with `process.env.VAR`. Unset vars become empty string. */
function interpolateEnv(input: string): string {
  return input.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? "")
}

/**
 * List all known namespaces — union of components.json registry keys and
 * built-in defaults. Used for error messages.
 */
export function listKnownNamespaces(config?: ComponentsJson | null): string[] {
  const set = new Set<string>(Object.keys(BUILT_IN_REGISTRY_URLS))
  for (const key of Object.keys(config?.registries ?? {})) {
    set.add(key.replace(/^@/, "").toLowerCase())
  }
  return [...set].sort()
}
