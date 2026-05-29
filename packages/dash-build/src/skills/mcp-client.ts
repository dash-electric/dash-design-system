/**
 * Dash-DS MCP client (transport-only).
 *
 * The boundary between dash-build and dash-doc (MCP-boundary spec
 * 2026-05-29 §4). The default loaders (`design-loader.ts`,
 * `ds-catalog-loader.ts`) call this MCP-first branch when `DASH_DS_MCP_URL`
 * is set, falling back to the filesystem reads on any error — so monorepo
 * dev and the hermetic test suite keep working unchanged.
 *
 * This module is transport-only: it fetches the registry `r/*.json` bundles
 * over HTTP and returns RAW payloads. The loaders own the parsing/truncation
 * (parseRegistry, truncateGlossary) so there is no behavioural drift between
 * the FS path and the MCP path, and no import cycle with the loaders.
 *
 * "MCP" here means the data the mcp-server serves; the registry HTTP surface
 * (`${DASH_DS_MCP_URL}/r/<bundle>.json`) is the same source the mcp-server
 * reads via RegistryClient, so a plain fetch is sufficient pre-split. When
 * the split lands, this wrapper is the single place to swap in the
 * @modelcontextprotocol/sdk stdio/HTTP client.
 */

import type { FoundationManifest } from "./types.js"

/** Raw registry payload shape (mirrors RawRegistry in ds-catalog-loader). */
export interface RawRegistryPayload {
  items?: Array<{
    name?: string
    title?: string
    description?: string
    type?: string
    categories?: string[]
  }>
}

/** Design contract bundle (mirrors DesignContext minus the source arrays). */
export interface RawDesignContext {
  designContract: string
  layeredArchitecture: string | null
  cardinalRules: string
  voiceRules: string
  manifest: FoundationManifest | null
}

export interface DashDsMcpClient {
  /** Base identifier (URL or descriptor) — surfaced in loadedSources. */
  readonly source: string
  /** get_catalog / list_categories — raw registry index. */
  getCatalogRaw(): Promise<RawRegistryPayload>
  /** get_rules{variant:compressed} — raw compressed-rules markdown. */
  getCompressedRules(): Promise<string>
  /** get_glossary — raw (untruncated) glossary markdown; loader truncates. */
  getGlossary(): Promise<string>
  /** get_design_context — five reads in one round-trip. */
  getDesignContext(): Promise<RawDesignContext>
}

interface RegistryFile {
  path?: string
  target?: string
  content?: string
}
interface RegistryBundle {
  files?: RegistryFile[]
}

/** Match a bundle file by the basename of its path/target. */
function fileByBasename(bundle: RegistryBundle, basename: string): string | null {
  const files = bundle.files ?? []
  for (const f of files) {
    const p = f.path ?? f.target ?? ""
    const base = p.split("/").pop()
    if (base === basename) return f.content ?? null
  }
  return null
}

/**
 * HTTP-backed client. Hits `${baseUrl}/r/<bundle>.json`. Throws on any
 * non-OK response or transport error so the loader's catch falls through
 * to the FS path.
 */
export function createHttpMcpClient(baseUrl: string): DashDsMcpClient {
  const base = baseUrl.replace(/\/+$/, "")

  async function fetchJson<T>(bundle: string): Promise<T> {
    const url = `${base}/r/${bundle}.json`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`MCP fetch ${url} → HTTP ${res.status}`)
    }
    return (await res.json()) as T
  }

  return {
    source: `mcp:${base}`,

    async getCatalogRaw() {
      // index.json IS already the { items: [...] } registry shape.
      return await fetchJson<RawRegistryPayload>("index")
    },

    async getCompressedRules() {
      const bundle = await fetchJson<RegistryBundle>("dash-ai-rules.compressed")
      const content = bundle.files?.[0]?.content
      if (content == null) throw new Error("MCP compressed-rules bundle missing content")
      return content
    },

    async getGlossary() {
      const bundle = await fetchJson<RegistryBundle>("dash-domain-glossary")
      const content = bundle.files?.[0]?.content
      if (content == null) throw new Error("MCP glossary bundle missing content")
      return content
    },

    async getDesignContext() {
      const bundle = await fetchJson<RegistryBundle>("design-context")
      const designContract = fileByBasename(bundle, "design.md")
      if (designContract == null) {
        throw new Error("MCP design-context bundle missing design.md")
      }
      const manifestRaw = fileByBasename(bundle, "manifest.json")
      let manifest: FoundationManifest | null = null
      if (manifestRaw) {
        try {
          manifest = JSON.parse(manifestRaw) as FoundationManifest
        } catch {
          manifest = null
        }
      }
      return {
        designContract,
        layeredArchitecture: fileByBasename(bundle, "LAYERED-ARCHITECTURE.md"),
        cardinalRules: fileByBasename(bundle, "cardinal-rules.md") ?? "",
        voiceRules: fileByBasename(bundle, "voice-rules.md") ?? "",
        manifest,
      }
    },
  }
}

/**
 * Build the default client from `DASH_DS_MCP_URL`, or null when unset.
 * Loaders call this so tests that never set the env var skip the MCP branch
 * entirely (hermetic).
 */
export function createMcpClientFromEnv(): DashDsMcpClient | null {
  const url = process.env.DASH_DS_MCP_URL
  if (!url) return null
  return createHttpMcpClient(url)
}
