/**
 * Cold-load preview initial blob — picks the "main" component source from a
 * persisted run artifact on disk so the workspace template can inject it via
 *
 *   <script>window.__DASH_PREVIEW_INIT = {…}</script>
 *
 * BEFORE the client-side `preview-mount.js` runs. Without this, a direct
 * navigation to `/workspace/:runId` (no fresh prompt) sits at the placeholder
 * forever because the SSE `component:updated` event only fires during the
 * active orchestrator run.
 *
 * Scope (kept narrow, on purpose):
 *   - Only new-file artifacts are supported. Patch-only artifacts need the
 *     sandbox clone (which the route handler doesn't have access to), so we
 *     skip and leave the placeholder visible. The SSE flow still works on
 *     subsequent live runs.
 *   - Failures are silent: missing dir, malformed run.json, no UI file, or a
 *     banned-import gate hit all return `null`. The page renders normally
 *     and the user just sees the placeholder.
 *
 * Spec: ties to docs/specs/component-preview-architecture-2026-05-28.md
 */

import { existsSync } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import {
  DEFAULT_RUNS_ROOT,
  readIntakeSnapshot,
  resolveRunDir,
} from "../runs/artifact-store.js"
import {
  detectBannedImports,
  detectDashDsImports,
} from "../services/component-preview.js"

export interface PreviewInitialBlob {
  /** Stable id the client script matches against `data-component-id`. */
  componentId: string
  /** Raw TSX/JSX source ready to feed Sandpack. */
  componentSource: string
  /** Context-map fields shown in the panel footer. */
  contextMap: {
    landsAt: string | null
    uses: string[]
    be: string[]
    audit: string | null
  }
}

interface DiscoveredFile {
  /** Path RELATIVE to `<runDir>/files/`, using forward slashes. */
  path: string
  content: string
}

/**
 * Walk `<runDir>/files/` recursively, returning every .tsx / .jsx file with
 * its source. Returns an empty array when the dir doesn't exist.
 */
async function readUiFiles(filesDir: string): Promise<DiscoveredFile[]> {
  if (!existsSync(filesDir)) return []
  const out: DiscoveredFile[] = []
  async function walk(dir: string): Promise<void> {
    let entries: import("node:fs").Dirent[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
        continue
      }
      if (!/\.(tsx|jsx)$/.test(entry.name)) continue
      let content: string
      try {
        content = await readFile(abs, "utf8")
      } catch {
        continue
      }
      const rel = relative(filesDir, abs).split(sep).join("/")
      out.push({ path: rel, content })
    }
  }
  await walk(filesDir)
  return out
}

/**
 * Pick the "main" generated component file. Mirrors
 * `pickComponentSource` in src/pipeline/orchestrator.ts:
 *
 *   1. `preview.tsx`  (canonical Dash Build canvas)
 *   2. First .tsx with `export default`
 *   3. First .tsx / .jsx
 *
 * Returns null when none match.
 */
function pickComponentFile(files: DiscoveredFile[]): DiscoveredFile | null {
  if (files.length === 0) return null
  const preview = files.find((f) => f.path.endsWith("preview.tsx"))
  if (preview) return preview
  const withDefault = files.find((f) => /export\s+default/.test(f.content))
  if (withDefault) return withDefault
  return files[0] ?? null
}

/**
 * Read a persisted run artifact and assemble the initial-preview blob the
 * workspace template injects on cold load. Returns null when:
 *   - runId is empty
 *   - the run dir doesn't exist (still processing / failed / unknown id)
 *   - no .tsx / .jsx file lives under <runDir>/files/ (patch-only output)
 *   - the picked source trips the ban-list (we never mount broken code)
 *
 * `root` override exists for tests; production callers should omit it.
 */
/**
 * Resolve a possibly-truncated runId to an actual on-disk run dir. The display
 * badge shows ~8 chars (`prm_20cb`) but the persisted dir uses the full
 * 12-char slice (`prm_20cb094a-ac2`). When users copy the badge into the URL
 * bar we need to walk the runs root and find the unique prefix match.
 *
 * Returns the canonical runId when:
 *   - Exact dir exists → returns input as-is
 *   - Exactly one dir starts with the prefix → returns that dir name
 * Returns null when:
 *   - No dir matches → unknown / not-yet-persisted run
 *   - Multiple dirs match → ambiguous, refuse to guess
 */
async function resolveRunIdPrefix(
  runId: string,
  root: string,
): Promise<string | null> {
  const exact = resolveRunDir(runId, root)
  if (existsSync(exact)) return runId
  if (!existsSync(root)) return null
  let entries: string[]
  try {
    entries = await readdir(root)
  } catch {
    return null
  }
  const matches = entries.filter((name) => name.startsWith(runId))
  if (matches.length === 1) return matches[0]!
  return null
}

export async function loadInitialPreview(
  runId: string | null | undefined,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<PreviewInitialBlob | null> {
  if (!runId) return null
  const resolvedId = await resolveRunIdPrefix(runId, root)
  if (!resolvedId) return null
  const runDir = resolveRunDir(resolvedId, root)
  if (!existsSync(runDir)) return null

  const files = await readUiFiles(join(runDir, "files"))
  const picked = pickComponentFile(files)
  if (!picked) return null

  // Trust-boundary gate: refuse to ship banned imports out the wire even
  // for cold load. The orchestrator validates BEFORE persistence, so this is
  // a defense-in-depth check for stale / hand-edited artifacts.
  if (detectBannedImports(picked.content).length > 0) return null

  // Best-effort: read the intake snapshot the orchestrator persisted so the
  // workspace cold-load surfaces BE endpoints + audit reason in the context
  // map. Missing/malformed snapshot → degrade to empty be/null audit (matches
  // legacy behaviour).
  const intake = await readIntakeSnapshot(resolvedId, root).catch(() => null)
  const be = intake
    ? intake.beEndpoints
        .slice(0, 20)
        .map((ep) => `${ep.method} ${ep.path}`)
    : []
  const audit = intake && intake.audit.detected
    ? intake.audit.reasonsCode.join(", ") || "audit required"
    : null

  return {
    componentId: resolvedId,
    componentSource: picked.content,
    contextMap: {
      landsAt: picked.path,
      uses: detectDashDsImports(picked.content),
      be,
      audit,
    },
  }
}

/**
 * Serialise a blob into a `<script>window.__DASH_PREVIEW_INIT = …</script>`
 * tag safe for inline injection into SSR HTML. JSON is HTML-escaped against
 * `</script>` breakouts, and JS line-terminator chars (U+2028/U+2029) are
 * re-encoded so the script parses cleanly when the page is delivered as
 * text/html.
 *
 * Returns an empty string when blob is null — caller can interpolate the
 * result unconditionally.
 */
export function renderInitialPreviewScript(
  blob: PreviewInitialBlob | null,
): string {
  if (!blob) return ""
  // String.fromCharCode keeps these chars out of the TS source itself; a
  // literal U+2028/U+2029 in source is also a JS line terminator and trips
  // the lexer when it appears inside a regex literal.
  const LS = String.fromCharCode(0x2028)
  const PS = String.fromCharCode(0x2029)
  const safeJson = JSON.stringify(blob)
    .replace(/<\/(script)/gi, "<\\/$1")
    .split(LS)
    .join("\\u2028")
    .split(PS)
    .join("\\u2029")
  return `<script>window.__DASH_PREVIEW_INIT = ${safeJson};</script>`
}
