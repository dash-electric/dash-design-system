/**
 * Component Preview Service
 * ---------------------------------------------------------------------------
 * Browser-resident component playground powered by Sandpack
 * (`@codesandbox/sandpack-react`). Given a generated component source string
 * + optional deps + mock data, build the Sandpack `files` map by merging
 * the user code with the pre-shipped `preview-template/` scaffold.
 *
 * The daemon NEVER spins up a node process for component previews — the
 * actual bundling happens in the browser inside Sandpack's iframe.
 *
 * Trust boundary: this service validates the user-supplied source for banned
 * imports (Dash external-library policy) BEFORE it ships the source out the
 * wire. A failing source short-circuits with a typed error response.
 *
 * Spec: docs/specs/component-preview-architecture-2026-05-28.md
 */

import { promises as fs, readFileSync, readdirSync, statSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ComponentPreviewRequest {
  /** Raw TSX / JSX source of the generated component. Must `export default`. */
  componentSource: string
  /**
   * Extra runtime deps the component imports beyond `react` / `react-dom`.
   * Strings like `@dash/kit` or `clsx`. Versions are resolved by the service.
   */
  dependencies?: string[]
  /** Optional mock fixture overrides. Merged into the default template mocks. */
  mockData?: Record<string, unknown>
  /** Stable id for the calling prompt — used to derive `previewId`. */
  promptId?: string
}

/**
 * Patch-mode preview request. Instead of receiving a finished component source,
 * the service reads `targetFilePath` from `repoPath`, applies the unified-diff
 * `diff` body in-memory, and renders the RESULTING source via Sandpack.
 *
 * Either `originalSource` (already in memory) or `repoPath` must be present.
 * When both are absent the request fails with `original_source_required`.
 */
export interface ComponentPreviewPatchRequest {
  mode: "patch"
  /** Path inside the repo the patch applies to (e.g. "src/foo.tsx"). */
  targetFilePath: string
  /** Unified-diff body. May or may not include the `--- a/` / `+++ b/` header. */
  diff: string
  /** Sandbox clone root. When set, originalSource is read from
   *  `<repoPath>/<targetFilePath>`. Prefer this for the orchestrator path. */
  repoPath?: string
  /** Pre-loaded original file contents — bypasses disk read. Set by tests
   *  and the SSE emitter when source is already in hand. */
  originalSource?: string
  dependencies?: string[]
  mockData?: Record<string, unknown>
  promptId?: string
}

export interface SandpackFile {
  code: string
  hidden?: boolean
  active?: boolean
  readOnly?: boolean
}

export interface SandpackBundle {
  files: Record<string, SandpackFile>
  dependencies: Record<string, string>
  /** Sandpack `react-ts` template — matches Dash production stack. */
  template: "react-ts"
  entry: string
}

export interface BannedImportFinding {
  import: string
  line: number
  severity: "high"
}

export interface ComponentPreviewResponse {
  ok: true
  previewId: string
  sandpack: SandpackBundle
  warnings: string[]
}

export interface ComponentPreviewError {
  ok: false
  error:
    | "component_source_required"
    | "banned_import"
    | "payload_too_large"
    | "template_read_failed"
    | "original_source_required"
    | "patch_apply_failed"
    | "target_file_read_failed"
  message: string
  details?: BannedImportFinding[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Mirror of `BANNED_IMPORTS` from `skills/prompt-composer.ts`. We re-declare
 * here so the service stays self-contained and we can independently bump the
 * preview policy if needed.
 *
 * Carve-out: `zod` is allowed inside `packages/registry-schema/**` per the
 * repo cardinal rule. The preview only renders UI components — the carve-out
 * does not apply.
 */
export const BANNED_PREVIEW_IMPORTS: readonly string[] = [
  "react-hook-form",
  "@hookform/resolvers",
  "@tanstack/react-query",
  "swr",
  "zod",
] as const

/** Hard cap on inbound source — defensive guard. */
export const MAX_SOURCE_BYTES = 256 * 1024

/** Dash DS imports auto-aliased to `@dash/kit` registry. */
const DASH_DS_PREFIX = "@dash/"

/** Template directory — relative to this file. */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Depth differs between bundled + source mode:
//   - tsup bundles into single `dist/daemon.js`     → __dirname = <pkg>/dist/
//     → `../preview-template` resolves to <pkg>/preview-template/
//   - vitest runs `src/services/component-preview.ts` → __dirname = <pkg>/src/services/
//     → `../../preview-template` resolves to <pkg>/preview-template/
// Probe both; pick whichever has the canonical App.tsx.
const TEMPLATE_CANDIDATES = [
  resolve(__dirname, "..", "preview-template"),
  resolve(__dirname, "..", "..", "preview-template"),
  resolve(__dirname, "..", "..", "..", "preview-template"),
]
const TEMPLATE_DIR = (() => {
  for (const candidate of TEMPLATE_CANDIDATES) {
    try {
      readFileSync(resolve(candidate, "App.tsx"), "utf8")
      return candidate
    } catch {
      // try next
    }
  }
  // Fall back to first candidate so the existing error path keeps the same
  // shape (caller surfaces "Failed to read preview template at <path>").
  return TEMPLATE_CANDIDATES[0]!
})()

/**
 * `@dash/kit` source bundle directory — populated at build time by
 * `scripts/copy-dash-ui-to-template.mjs`. Each `.tsx` here is shipped into
 * the Sandpack files map under `/node_modules/@dash/kit/<file>` so that bare
 * `import { Badge } from "@dash/kit"` specifiers resolve to local source code
 * INSIDE the iframe — no CDN round-trip required (`@dash/kit` is not on npm).
 *
 * Probed lazily — if the directory is missing (developer skipped `pnpm build`)
 * we degrade gracefully: the bundle is omitted from `files`, the dependency
 * map still includes `@dash/kit` as a warning trigger, and the iframe surfaces
 * a "module not found" error for the user to act on.
 */
const DASH_UI_BUNDLE_DIR = resolve(TEMPLATE_DIR, "dash-ui")

// ---------------------------------------------------------------------------
// Template cache
// ---------------------------------------------------------------------------

interface TemplateBlob {
  appTsx: string
  indexTsx: string
  placeholderTsx: string
  tokensCss: string
  indexHtml: string
  defaultMocks: Record<string, unknown>
}

let templateCache: TemplateBlob | null = null

async function loadTemplate(): Promise<TemplateBlob> {
  if (templateCache) return templateCache
  try {
    const [appTsx, indexTsx, placeholderTsx, tokensCss, indexHtml, mocksRaw] =
      await Promise.all([
        fs.readFile(join(TEMPLATE_DIR, "App.tsx"), "utf8"),
        fs.readFile(join(TEMPLATE_DIR, "index.tsx"), "utf8"),
        fs.readFile(join(TEMPLATE_DIR, "Component.tsx.placeholder"), "utf8"),
        fs.readFile(join(TEMPLATE_DIR, "dash-tokens.css"), "utf8"),
        fs.readFile(join(TEMPLATE_DIR, "index.html"), "utf8"),
        fs.readFile(join(TEMPLATE_DIR, "mocks.json"), "utf8"),
      ])
    const defaultMocks = JSON.parse(mocksRaw) as Record<string, unknown>
    templateCache = {
      appTsx,
      indexTsx,
      placeholderTsx,
      tokensCss,
      indexHtml,
      defaultMocks,
    }
    return templateCache
  } catch (err) {
    throw new Error(
      `Failed to read preview template at ${TEMPLATE_DIR}: ${(err as Error).message}`,
    )
  }
}

/** Test-only — clears cached template so fixtures can hot-swap. */
export function __clearTemplateCacheForTests(): void {
  templateCache = null
  dashUiBundleCache = null
}

// ---------------------------------------------------------------------------
// @dash/kit local bundle — built by `scripts/copy-dash-ui-to-template.mjs`.
// ---------------------------------------------------------------------------

interface DashUiBundle {
  /** Sandpack files map keyed by absolute virtual path
   *  (`/node_modules/@dash/kit/badge.tsx`, …). Empty when the directory is
   *  missing on disk (script not run yet). */
  files: Record<string, SandpackFile>
  /** Bundle present + non-empty → safe to mark `@dash/kit` as resolvable. */
  available: boolean
  /** Diagnostic — atom count shipped. */
  atomCount: number
}

let dashUiBundleCache: DashUiBundle | null = null

function loadDashUiBundle(): DashUiBundle {
  if (dashUiBundleCache) return dashUiBundleCache

  const files: Record<string, SandpackFile> = {}
  let atomCount = 0

  const dirExists = (() => {
    try {
      const s = statSync(DASH_UI_BUNDLE_DIR)
      return s.isDirectory()
    } catch {
      return false
    }
  })()

  if (!dirExists) {
    dashUiBundleCache = { files, available: false, atomCount: 0 }
    return dashUiBundleCache
  }

  // 1. Synthetic `package.json` so Sandpack resolves `@dash/kit` → index.tsx.
  files["/node_modules/@dash/kit/package.json"] = {
    code: JSON.stringify(
      {
        name: "@dash/kit",
        version: "0.0.0-preview",
        main: "./index.tsx",
        module: "./index.tsx",
        types: "./index.tsx",
      },
      null,
      2,
    ),
    hidden: true,
    readOnly: true,
  }

  // 2. Recurse the bundle dir + emit every `.tsx` / `.ts` / `.json` as a
  //    hidden, read-only Sandpack file.
  const walk = (dir: string, virtualPrefix: string): void => {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const abs = join(dir, entry)
      let s
      try {
        s = statSync(abs)
      } catch {
        continue
      }
      if (s.isDirectory()) {
        walk(abs, `${virtualPrefix}/${entry}`)
        continue
      }
      if (!/\.(tsx|ts|json)$/.test(entry)) continue
      try {
        const code = readFileSync(abs, "utf8")
        files[`${virtualPrefix}/${entry}`] = {
          code,
          hidden: true,
          readOnly: true,
        }
        if (entry.endsWith(".tsx")) atomCount += 1
      } catch {
        // skip
      }
    }
  }
  walk(DASH_UI_BUNDLE_DIR, "/node_modules/@dash/kit")

  dashUiBundleCache = {
    files,
    available: atomCount > 0,
    atomCount,
  }
  return dashUiBundleCache
}

/** Test-only inspector for the bundle metadata. */
export function __inspectDashUiBundleForTests(): DashUiBundle {
  return loadDashUiBundle()
}

// Eager sync-load probe at module import to fail fast in dev. Best-effort.
function probeTemplateSync(): void {
  try {
    readFileSync(join(TEMPLATE_DIR, "App.tsx"), "utf8")
  } catch {
    /* surfaced lazily on first request */
  }
}
probeTemplateSync()

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Scan `source` for banned import statements. Returns a finding per banned
 * package; empty array means clean.
 *
 * Heuristic: match `import ... from '<pkg>'` and `require('<pkg>')`. Ignores
 * matches inside line/block comments by stripping common comment forms first.
 */
export function detectBannedImports(source: string): BannedImportFinding[] {
  const stripped = stripComments(source)
  const lines = stripped.split(/\r?\n/)
  const findings: BannedImportFinding[] = []
  const importRe =
    /(?:import\s[^"']*from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    let match: RegExpExecArray | null
    importRe.lastIndex = 0
    while ((match = importRe.exec(line)) !== null) {
      const spec = match[1]!
      if (BANNED_PREVIEW_IMPORTS.includes(spec)) {
        findings.push({ import: spec, line: i + 1, severity: "high" })
      }
    }
  }
  return findings
}

function stripComments(source: string): string {
  // Block comments first, then line comments. Naive — does not handle
  // comment-inside-string edge cases but good enough for banned-import scan.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
}

/**
 * Detect Dash DS / local-registry import specifiers. Used to surface the
 * package list back to the caller (e.g. so the daemon can hint about missing
 * deps in the consumer repo).
 */
export function detectDashDsImports(source: string): string[] {
  const stripped = stripComments(source)
  const importRe = /import\s[^"']*from\s+["']([^"']+)["']/g
  const out = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = importRe.exec(stripped)) !== null) {
    const spec = match[1]!
    if (spec.startsWith(DASH_DS_PREFIX)) {
      // Capture the top-level package (e.g. `@dash/kit` from `@dash/kit/button`).
      const parts = spec.split("/")
      const pkg = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec
      out.add(pkg)
    }
  }
  return Array.from(out)
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Build a Sandpack config bundle from a generated component source.
 *
 * Returns either a success response (with merged `files` / `dependencies`
 * ready to drop into Sandpack) or a typed error response.
 */
export async function renderComponentPreview(
  req: ComponentPreviewRequest,
): Promise<ComponentPreviewResponse | ComponentPreviewError> {
  // 1. Validate input
  if (!req.componentSource || req.componentSource.trim().length === 0) {
    return {
      ok: false,
      error: "component_source_required",
      message: "componentSource is required and must be non-empty.",
    }
  }

  const byteLen = Buffer.byteLength(req.componentSource, "utf8")
  if (byteLen > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      error: "payload_too_large",
      message: `componentSource is ${byteLen}B; max is ${MAX_SOURCE_BYTES}B.`,
    }
  }

  // 2. Ban-list gate
  const banned = detectBannedImports(req.componentSource)
  if (banned.length > 0) {
    return {
      ok: false,
      error: "banned_import",
      message: `Banned imports detected: ${banned.map((b) => b.import).join(", ")}`,
      details: banned,
    }
  }

  // 3. Load template scaffold
  let template: TemplateBlob
  try {
    template = await loadTemplate()
  } catch (err) {
    return {
      ok: false,
      error: "template_read_failed",
      message: (err as Error).message,
    }
  }

  // 4. Merge mocks (default + override)
  const mergedMocks = {
    ...template.defaultMocks,
    ...(req.mockData ?? {}),
  }

  // 5. Resolve dependencies — merge declared deps with auto-detected Dash DS.
  //    `@dash/kit` is intentionally kept in the dependency map even when the
  //    local bundle resolves it — Sandpack still surfaces it under "deps"
  //    diagnostics and downstream callers (tests, dashboard) rely on the
  //    package name appearing there.
  const dashDsImports = detectDashDsImports(req.componentSource)
  const declaredDeps = new Set([...(req.dependencies ?? []), ...dashDsImports])
  const dashUiBundle = loadDashUiBundle()

  // ICON-SANDPACK-FIX (2026-05-29): the @dash/kit source bundle we ship into the
  // iframe contains 22 atoms (Badge, Alert, Button, …) that import icons from
  // `@remixicon/react`. That specifier is NOT a `@dash/*` package, so it never
  // appeared in the resolved deps → Sandpack couldn't fetch it → every DS icon
  // rendered as a broken box ("belang"). Whenever the @dash/kit bundle is
  // present (or the component imports remixicon directly), force the icon
  // package into the dependency map so esm.sh resolves it in-iframe.
  const usesRemixIcon =
    dashUiBundle.available ||
    dashDsImports.includes("@dash/kit") ||
    /@remixicon\/react/.test(req.componentSource)
  if (usesRemixIcon) declaredDeps.add("@remixicon/react")

  const dependencies = resolveDependencyVersions(declaredDeps)

  // 6. Build Sandpack files map. `/index.tsx` and `/App.tsx` are template-
  //    owned and read-only to prevent the user clobbering them. `/Component.tsx`
  //    is the active editable file. `/dash-tokens.css` + `/mocks.json` hidden
  //    from the file tree.
  //
  //    NOTE (2026-05-28): we DO NOT ship `/public/index.html` anymore — the
  //    `react-ts` template ignores it and Sandpack leaks the raw HTML/JSX
  //    comments into the iframe content. Tailwind CDN + Plus Jakarta Sans +
  //    Dash token preset are injected at runtime from `index.tsx` via
  //    document.head.appendChild on first mount (idempotent via id checks).
  const files: Record<string, SandpackFile> = {
    "/index.tsx": { code: template.indexTsx, hidden: true, readOnly: true },
    "/App.tsx": { code: template.appTsx, hidden: true, readOnly: true },
    "/Component.tsx": { code: req.componentSource, active: true },
    "/dash-tokens.css": {
      code: template.tokensCss,
      hidden: true,
      readOnly: true,
    },
    "/mocks.json": {
      code: JSON.stringify(mergedMocks, null, 2),
      hidden: true,
      readOnly: true,
    },
    // 6a. Ship the local `@dash/kit` source bundle. Sandpack's in-iframe
    //     resolver walks `node_modules/<pkg>/package.json` first, so a bare
    //     specifier like `import { Badge } from "@dash/kit"` is satisfied by
    //     the synthetic package.json + `index.tsx` barrel below. When the
    //     bundle directory is missing (prebuild script not run yet) this is
    //     a no-op and the legacy "not on npm" warning still fires.
    ...dashUiBundle.files,
  }

  const warnings: string[] = []
  if (!/export\s+default/.test(req.componentSource)) {
    warnings.push(
      "Component does not appear to `export default` — Sandpack may fail to mount.",
    )
  }
  // Dash DS imports won't resolve via Sandpack's npm CDN until @dash/kit ships
  // to npm or a self-hosted ESM proxy. Sub-task 1 of Tier 0 Phase C ships a
  // local source bundle at `/node_modules/@dash/kit/*` — when that bundle is
  // present we DON'T emit the legacy "not on npm" warning for `@dash/kit`
  // (the import resolves locally). We still warn for any other unresolvable
  // `@dash/*` package (e.g. `@dash/registry-schema`).
  const unresolvableDashImports = Array.from(declaredDeps).filter((d) => {
    if (!DASH_DS_UNRESOLVABLE.includes(d)) return false
    if (d === "@dash/kit" && dashUiBundle.available) return false
    return true
  })
  if (unresolvableDashImports.length > 0) {
    warnings.push(
      `Dash DS package(s) not yet published to npm: ${unresolvableDashImports.join(", ")}. ` +
        "Component will render with Tailwind utilities + Layer 0 tokens only.",
    )
  }
  if (declaredDeps.has("@dash/kit") && !dashUiBundle.available) {
    warnings.push(
      "@dash/kit local bundle missing from preview-template/dash-ui/. " +
        "Run `pnpm --filter @dash/build copy-dash-ui` (or `pnpm build`) to ship the atoms.",
    )
  }

  return {
    ok: true,
    previewId: computePreviewId(req.componentSource, req.promptId),
    sandpack: {
      files,
      dependencies,
      template: "react-ts",
      entry: "/index.tsx",
    },
    warnings,
  }
}

// ---------------------------------------------------------------------------
// Dependency resolution
// ---------------------------------------------------------------------------

/**
 * Map a package name → semver range. Versions pinned here are the same the
 * Dash production repos run; bump alongside platform upgrades.
 *
 * Unknown packages default to `latest`. Sandpack's npm proxy will resolve.
 *
 * `@dash/kit` is the sovereign Dash registry source and is NOT published to
 * npm — Sandpack's CDN proxy will 404 on import. We declare it as `latest`
 * so the bundler attempts resolution (and the warning surfaces in the
 * `warnings` array), but the real DS-bundle plumbing lives in the iframe
 * `index.html` (Tailwind CDN + dash-tokens.css). When/if `@dash/kit` is
 * published to npm or proxied through a self-hosted ESM CDN, drop the
 * warning and bump the version here.
 */
const VERSION_MAP: Record<string, string> = {
  react: "^18.3.0",
  "react-dom": "^18.3.0",
  clsx: "^2.1.0",
  "tailwind-merge": "^2.5.0",
  "@dash/kit": "latest",
  "@dash/registry-schema": "latest",
  // Icon set. Pinned to the version apps/docs depends on so Sandpack's esm.sh
  // resolve matches what the @dash/kit atoms were authored against. Without this
  // entry the iframe couldn't resolve the icons imported transitively by 22
  // @dash/kit atoms (Badge, Alert, Button, …) → glyphs rendered as broken boxes
  // ("belang"). See ICON-SANDPACK-FIX note below.
  "@remixicon/react": "^4.9.0",
}

/** Packages that look like Dash DS imports but won't resolve on npm yet.
 *  Surfaced as warnings so the UI can hint "DS bundle not yet on npm — using
 *  Tailwind utility fallback". */
const DASH_DS_UNRESOLVABLE: readonly string[] = [
  "@dash/kit",
  "@dash/registry-schema",
] as const

function resolveDependencyVersions(
  packages: Iterable<string>,
): Record<string, string> {
  const out: Record<string, string> = {
    react: VERSION_MAP.react!,
    "react-dom": VERSION_MAP["react-dom"]!,
  }
  for (const pkg of packages) {
    if (!pkg || out[pkg]) continue
    out[pkg] = VERSION_MAP[pkg] ?? "latest"
  }
  return out
}

// ---------------------------------------------------------------------------
// Patch-mode preview
// ---------------------------------------------------------------------------

/**
 * Apply a unified-diff body against an in-memory source string.
 *
 * Hand-rolled to avoid pulling `diff` / `parse-diff` into the daemon bundle.
 * Supports the unified-diff subset the model actually emits:
 *   - Standard `@@ -<a>,<b> +<c>,<d> @@` hunk headers
 *   - `+` / `-` / ` ` line markers
 *   - Optional `--- a/<path>` / `+++ b/<path>` preamble (ignored)
 *   - `\ No newline at end of file` trailing markers (ignored)
 *
 * NOT supported:
 *   - Multi-file diffs (only the first/single file is consumed)
 *   - Binary patches
 *   - Fuzz / context drift recovery — caller must hand us a clean diff
 *
 * Returns `{ ok: true, result }` or `{ ok: false, reason }`. Caller wraps the
 * failure into the `patch_apply_failed` preview error.
 */
export function applyUnifiedDiff(
  original: string,
  diff: string,
): { ok: true; result: string } | { ok: false; reason: string } {
  if (typeof original !== "string") {
    return { ok: false, reason: "original source is not a string" }
  }
  if (typeof diff !== "string" || diff.trim().length === 0) {
    return { ok: false, reason: "diff body is empty" }
  }

  // Preserve trailing newline behaviour — split on \n but remember whether
  // the original ended with one so we can re-attach correctly.
  const originalHadTrailingNewline = original.endsWith("\n")
  const originalLines = originalHadTrailingNewline
    ? original.slice(0, -1).split("\n")
    : original.split("\n")

  // Output is mutable copy we splice into per hunk.
  const out = [...originalLines]
  // Cumulative offset between original and out indices (positive = out longer).
  let offset = 0

  const diffLines = diff.split(/\r?\n/)
  const hunkHeaderRe = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/
  let i = 0
  let appliedAnyHunk = false

  while (i < diffLines.length) {
    const headerMatch = hunkHeaderRe.exec(diffLines[i]!)
    if (!headerMatch) {
      i += 1
      continue
    }
    const oldStart = parseInt(headerMatch[1]!, 10)
    const oldCount = headerMatch[2] !== undefined ? parseInt(headerMatch[2], 10) : 1
    // Note: newStart / newCount are part of the spec but we don't need them —
    // we splice based on oldStart + offset and let the +/- markers drive
    // additions/deletions.
    i += 1

    // Collect hunk body — lines starting with ' ', '+', '-' until next '@@'
    // or EOF or a non-conforming line.
    const hunk: string[] = []
    while (i < diffLines.length) {
      const line = diffLines[i]!
      if (line.startsWith("@@")) break
      if (line.startsWith("\\")) {
        // "\ No newline at end of file" — skip silently.
        i += 1
        continue
      }
      if (
        line.startsWith(" ") ||
        line.startsWith("+") ||
        line.startsWith("-")
      ) {
        hunk.push(line)
        i += 1
        continue
      }
      if (line.length === 0) {
        // Trailing blank line from split — skip silently (not a context line).
        // A real empty context line would be encoded as a single space (" ").
        i += 1
        continue
      }
      // Unexpected leading char — stop collecting and let the outer loop
      // resync on the next `@@`.
      break
    }

    // Apply this hunk. `cursor` walks the out array starting at the
    // (1-indexed) oldStart + offset → 0-indexed splice position.
    let cursor = oldStart - 1 + offset
    if (cursor < 0 || cursor > out.length) {
      return {
        ok: false,
        reason: `hunk cursor out of bounds at line ${oldStart} (offset ${offset}, out.length ${out.length})`,
      }
    }

    for (const hl of hunk) {
      const marker = hl.charAt(0)
      const content = hl.slice(1)
      if (marker === " ") {
        // Context line — must match the existing line at cursor.
        const expected = content
        if (out[cursor] !== expected) {
          return {
            ok: false,
            reason:
              `context mismatch at line ${cursor + 1}: ` +
              `expected ${JSON.stringify(expected)}, got ${JSON.stringify(out[cursor] ?? null)}`,
          }
        }
        cursor += 1
      } else if (marker === "-") {
        if (out[cursor] !== content) {
          return {
            ok: false,
            reason:
              `deletion mismatch at line ${cursor + 1}: ` +
              `expected ${JSON.stringify(content)}, got ${JSON.stringify(out[cursor] ?? null)}`,
          }
        }
        out.splice(cursor, 1)
        offset -= 1
        // cursor stays — the next iteration looks at the shifted line.
      } else if (marker === "+") {
        out.splice(cursor, 0, content)
        offset += 1
        cursor += 1
      }
    }
    void oldCount // silence unused — present for spec adherence
    appliedAnyHunk = true
  }

  if (!appliedAnyHunk) {
    return { ok: false, reason: "diff contained no recognizable @@ hunks" }
  }

  const joined = out.join("\n")
  return {
    ok: true,
    result: originalHadTrailingNewline && !joined.endsWith("\n") ? joined + "\n" : joined,
  }
}

/**
 * Render a patch-mode preview. Reads the original file, applies the diff,
 * then routes through `renderComponentPreview` so banned-import gating /
 * dependency resolution / Sandpack scaffolding all reuse the same code path.
 *
 * Errors:
 *   - `original_source_required`   — neither originalSource nor repoPath given
 *   - `target_file_read_failed`    — repoPath provided but disk read failed
 *   - `patch_apply_failed`         — diff body was malformed / context drift
 *   - downstream errors (banned_import / payload_too_large) pass through.
 */
export async function renderComponentPreviewFromPatch(
  req: ComponentPreviewPatchRequest,
): Promise<ComponentPreviewResponse | ComponentPreviewError> {
  let originalSource = req.originalSource
  if (originalSource === undefined && req.repoPath) {
    try {
      originalSource = await fs.readFile(
        join(req.repoPath, req.targetFilePath),
        "utf8",
      )
    } catch (err) {
      return {
        ok: false,
        error: "target_file_read_failed",
        message:
          `Could not read ${req.targetFilePath} from ${req.repoPath}: ` +
          (err as Error).message,
      }
    }
  }
  if (originalSource === undefined) {
    return {
      ok: false,
      error: "original_source_required",
      message:
        "renderComponentPreviewFromPatch requires either `originalSource` or `repoPath`.",
    }
  }

  const applied = applyUnifiedDiff(originalSource, req.diff)
  if (!applied.ok) {
    return {
      ok: false,
      error: "patch_apply_failed",
      message: `Failed to apply diff to ${req.targetFilePath}: ${applied.reason}`,
    }
  }

  return renderComponentPreview({
    componentSource: applied.result,
    dependencies: req.dependencies,
    mockData: req.mockData,
    promptId: req.promptId,
  })
}

// ---------------------------------------------------------------------------
// Stable preview id
// ---------------------------------------------------------------------------

function computePreviewId(source: string, promptId?: string): string {
  const hash = createHash("sha256")
    .update(promptId ?? "anon")
    .update("\0")
    .update(source)
    .digest("hex")
    .slice(0, 12)
  return `preview_${hash}`
}
