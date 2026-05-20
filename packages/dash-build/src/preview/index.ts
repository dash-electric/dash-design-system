/**
 * Public surface for the sandboxed preview module.
 *
 * Consumed by:
 *  - Daemon router → handlePreviewRoute
 *  - Agent E pipeline → bundleForPreview(after parse)
 *  - Agent H (PR pipeline) → reuses tempDir from BundleResult to upload
 *    artefacts before opening the PR.
 */

export {
  bundleForPreview,
  bundlePathFor,
  findEntry,
} from "./bundler.js"
export {
  prepareTempDir,
  cleanupOne,
  cleanupOld,
  resolvePreviewDir,
  sanitize,
  DEFAULT_PREVIEW_ROOT,
} from "./temp-dir.js"
export { renderShell } from "./shell-renderer.js"
export { buildCsp } from "./csp.js"
export { handlePreviewRoute } from "./api-routes.js"
export type {
  BundleInput,
  BundleResult,
  EsbuildLike,
  EsbuildBuildOptions,
  EsbuildBuildResult,
  ShellRenderInput,
} from "./types.js"
export {
  BundleError,
  BundleTooLargeError,
  EsbuildMissingError,
} from "./types.js"
