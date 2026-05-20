/**
 * Bundle ParsedFile[] into a single browser-loadable IIFE via esbuild.
 *
 * esbuild is a *peer dependency* (per locked plan). When unavailable we throw
 * EsbuildMissingError with the exact install command. Tests inject an
 * `esbuildModule` shim so we don't depend on a real install.
 *
 * Security:
 *   - All inputs land inside `prepareTempDir(promptId)` — sanitized by
 *     temp-dir.ts. Per-file paths are also resolved + verified to stay below
 *     the temp dir, blocking `../` traversal in ParsedFile.path.
 *   - Output is capped at 5 MB by default to prevent abuse.
 *
 * Entry detection priority:
 *   1. `preview.tsx`
 *   2. `index.tsx`
 *   3. First .tsx file (alphabetical for determinism)
 *   4. First .ts file
 */

import { promises as fs } from "node:fs"
import path from "node:path"
import { prepareTempDir, resolvePreviewDir } from "./temp-dir.js"
import {
  BundleError,
  BundleTooLargeError,
  EsbuildMissingError,
} from "./types.js"
import type { BundleInput, BundleResult, EsbuildLike } from "./types.js"
import type { ParsedFile } from "../skills/types.js"

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export function findEntry(files: ParsedFile[]): string | null {
  if (files.length === 0) return null
  const byName = new Map(files.map((f) => [f.path, f]))
  if (byName.has("preview.tsx")) return "preview.tsx"
  if (byName.has("index.tsx")) return "index.tsx"
  const tsx = files
    .map((f) => f.path)
    .filter((p) => p.endsWith(".tsx"))
    .sort()
  if (tsx.length > 0) return tsx[0]
  const ts = files
    .map((f) => f.path)
    .filter((p) => p.endsWith(".ts"))
    .sort()
  if (ts.length > 0) return ts[0]
  return null
}

async function loadEsbuild(): Promise<EsbuildLike> {
  try {
    // Dynamic import — esbuild is a peer dep, may not be installed.
    // String-build the specifier so TypeScript skips module resolution
    // (we don't ship @types/esbuild and don't want to require the install).
    const spec = "esbuild"
    const mod = (await import(/* @vite-ignore */ spec)) as unknown as EsbuildLike
    return mod
  } catch {
    throw new EsbuildMissingError()
  }
}

/** Reject paths that escape the temp dir or use absolute / drive paths. */
function assertSafeRelativePath(filePath: string): void {
  if (path.isAbsolute(filePath)) {
    throw new Error(`unsafe_path: absolute path rejected (${filePath})`)
  }
  if (filePath.includes("\0")) {
    throw new Error(`unsafe_path: null byte rejected (${filePath})`)
  }
  // path.normalize then check the first segment isn't ".." — covers `../x`,
  // `a/../../x`, etc.
  const norm = path.normalize(filePath)
  if (norm.startsWith("..") || norm === "..") {
    throw new Error(`unsafe_path: traversal rejected (${filePath})`)
  }
}

export async function bundleForPreview(opts: BundleInput): Promise<BundleResult> {
  if (opts.files.length === 0) {
    throw new BundleError([{ text: "no input files" }])
  }

  const entry = findEntry(opts.files)
  if (!entry) {
    throw new BundleError([{ text: "no entry file (expected preview.tsx / index.tsx / *.tsx)" }])
  }

  const tempDir = await prepareTempDir(opts.promptId, opts.rootDir)

  // Write files
  for (const file of opts.files) {
    assertSafeRelativePath(file.path)
    const dest = path.join(tempDir, file.path)
    // Defence in depth — re-check resolved path stays in tempDir
    const resolved = path.resolve(dest)
    if (!resolved.startsWith(path.resolve(tempDir) + path.sep) && resolved !== path.resolve(tempDir)) {
      throw new Error(`unsafe_path: resolved outside temp dir (${file.path})`)
    }
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, file.content, "utf8")
  }

  const esbuild = opts.esbuildModule ?? (await loadEsbuild())

  const outfile = path.join(tempDir, "bundle.js")
  const entryPath = path.join(tempDir, entry)

  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    jsxImportSource: "react",
    minify: false,
    sourcemap: "inline",
    outfile,
    external: [],
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    write: true,
    logLevel: "silent",
  })

  if (result.errors.length > 0) {
    throw new BundleError(result.errors)
  }

  const stat = await fs.stat(outfile)
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES
  if (stat.size > maxBytes) {
    await fs.rm(outfile, { force: true })
    throw new BundleTooLargeError(stat.size, maxBytes)
  }

  return {
    bundlePath: outfile,
    entryPath,
    byteSize: stat.size,
    tempDir,
  }
}

/** Resolve the on-disk bundle path for a promptId without rebuilding. Used by
 *  api-routes when serving `/preview/:id/bundle.js`. */
export function bundlePathFor(promptId: string, rootDir?: string): string {
  return path.join(resolvePreviewDir(promptId, rootDir), "bundle.js")
}
