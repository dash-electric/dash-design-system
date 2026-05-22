/**
 * Sandboxed preview module — renders generated TSX (ParsedFile[]) inside an
 * isolated iframe before PR creation.
 *
 * Pipeline:
 *   ParsedFile[] → temp dir → esbuild IIFE → /preview/:id/bundle.js
 *   iframe (sandbox="allow-scripts allow-same-origin") → loads shell HTML →
 *   shell <script> loads bundle.js → bundle mounts to #root.
 *
 * esbuild is a peer dep so users opt-in to install. Bundle wrapper supports
 * dependency injection so tests stay hermetic without touching disk-loaded
 * native binaries.
 */

import type { ParsedFile } from "../skills/types.js"

// ---------------------------------------------------------------------------
// Bundler
// ---------------------------------------------------------------------------

export interface BundleInput {
  files: ParsedFile[]
  promptId: string
  /** Override temp root (used by tests). Defaults to ~/.dash-build/preview. */
  rootDir?: string
  /** Override max bundle bytes — defaults to 5 MB. */
  maxBytes?: number
  /** Dependency-injected esbuild module (for tests / vendor swap). When
   *  omitted we dynamic-import("esbuild") at call time. */
  esbuildModule?: EsbuildLike
}

export interface BundleResult {
  bundlePath: string
  entryPath: string
  /** Bytes on disk after write — used by api-routes for content-length. */
  byteSize: number
  /** Absolute temp dir we wrote into. */
  tempDir: string
}

/** Minimal subset of esbuild we depend on — keeps the contract typed without
 *  requiring esbuild as a hard import. */
export interface EsbuildLike {
  build(opts: EsbuildBuildOptions): Promise<EsbuildBuildResult>
}

export interface EsbuildBuildOptions {
  entryPoints: string[]
  bundle: boolean
  format: "iife" | "esm" | "cjs"
  platform: "browser" | "node" | "neutral"
  target: string
  nodePaths?: string[]
  jsx: "automatic" | "transform" | "preserve"
  jsxImportSource?: string
  minify: boolean
  sourcemap: "inline" | "external" | boolean
  outfile: string
  external?: string[]
  define?: Record<string, string>
  plugins?: EsbuildPlugin[]
  write?: boolean
  logLevel?: "silent" | "info" | "warning" | "error"
}

export interface EsbuildBuildResult {
  errors: Array<{ text: string; location?: { file?: string; line?: number } }>
  warnings: Array<{ text: string }>
}

export interface EsbuildOnResolveArgs {
  path: string
  importer: string
  resolveDir: string
}

export interface EsbuildOnResolveResult {
  path: string
}

export interface EsbuildPluginBuild {
  onResolve(
    opts: { filter: RegExp },
    callback: (
      args: EsbuildOnResolveArgs,
    ) =>
      | EsbuildOnResolveResult
      | null
      | undefined
      | Promise<EsbuildOnResolveResult | null | undefined>,
  ): void
}

export interface EsbuildPlugin {
  name: string
  setup(build: EsbuildPluginBuild): void
}

export class BundleError extends Error {
  readonly errors: EsbuildBuildResult["errors"]
  constructor(errors: EsbuildBuildResult["errors"]) {
    super(`bundle_failed: ${errors.map((e) => e.text).join("; ")}`)
    this.name = "BundleError"
    this.errors = errors
  }
}

export class BundleTooLargeError extends Error {
  readonly byteSize: number
  readonly maxBytes: number
  constructor(byteSize: number, maxBytes: number) {
    super(`bundle_too_large: ${byteSize} > ${maxBytes}`)
    this.name = "BundleTooLargeError"
    this.byteSize = byteSize
    this.maxBytes = maxBytes
  }
}

export class EsbuildMissingError extends Error {
  constructor() {
    super(
      "esbuild_missing: install peer dep — pnpm --filter @dash/build add -D esbuild",
    )
    this.name = "EsbuildMissingError"
  }
}

// ---------------------------------------------------------------------------
// Shell renderer
// ---------------------------------------------------------------------------

export interface ShellRenderInput {
  promptId: string
  /** Optional inline CSS (e.g. registry-shipped tokens). */
  cssBundle?: string
}
