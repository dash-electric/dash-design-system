/**
 * Existing file reader — Phase C / Sprint 2A.
 *
 * Reads files surfaced by PathResolver and returns size-capped, prompt-safe
 * content. Used by the skill chain to inject `## CURRENT FILE STATE` into the
 * system prompt so the model edits the existing file instead of generating
 * an orphan greenfield page.
 *
 * Hard constraints:
 *   - Never throw on missing / unreadable files. Return null for that file.
 *   - Cap content size (default 12KB). Large files keep first 200 lines, a
 *     truncation marker, then the last 100 lines — enough for the model to
 *     anchor structure + imports + final exports.
 *   - Skip junk dirs (node_modules / dist / .next / .git / build). Path
 *     resolver already avoids them, but this is a second-line guard.
 *   - Zero new npm deps.
 */

import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { PathResolver, createPathResolverForRepo } from "./path-resolver.js"
import type {
  ExistingFileContent,
  ExistingFilesContext,
  PathResolution,
  RepoContextPack,
  RepoSurface,
} from "./types.js"

// ---------------------------------------------------------------------------
// Caps
// ---------------------------------------------------------------------------

const DEFAULT_MAX_BYTES = 12 * 1024 // 12KB
const DEFAULT_HEAD_LINES = 200
const DEFAULT_TAIL_LINES = 100
const DEFAULT_TOP_N = 3
const ABSOLUTE_MAX_BYTES = 256 * 1024 // hard read ceiling — never read >256KB

const FORBIDDEN_PATH_SEGMENTS = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "build",
  ".turbo",
  ".cache",
]

// ---------------------------------------------------------------------------
// Reader options
// ---------------------------------------------------------------------------

export interface ReadExistingFileOptions {
  /** Max bytes to keep in `content`. Default 12KB. */
  maxBytes?: number
  /** Head lines retained when truncating. Default 200. */
  headLines?: number
  /** Tail lines retained when truncating. Default 100. */
  tailLines?: number
}

// ---------------------------------------------------------------------------
// Single-file read
// ---------------------------------------------------------------------------

/**
 * Read a file from disk + truncate if it's too large for the prompt.
 *
 * Never throws. Missing / unreadable / forbidden-path → returns null.
 */
export async function readExistingFile(
  filePath: string,
  opts: ReadExistingFileOptions = {},
): Promise<ExistingFileContent | null> {
  if (!filePath) return null
  if (containsForbiddenSegment(filePath)) return null

  const maxBytes = clampPositive(opts.maxBytes, DEFAULT_MAX_BYTES, ABSOLUTE_MAX_BYTES)
  const headLines = clampPositive(opts.headLines, DEFAULT_HEAD_LINES, 5000)
  const tailLines = clampPositive(opts.tailLines, DEFAULT_TAIL_LINES, 5000)

  let fullSize: number
  try {
    const s = await stat(filePath)
    if (!s.isFile()) return null
    fullSize = s.size
  } catch {
    return null
  }

  // Read up to ABSOLUTE_MAX_BYTES — we never load gigantic generated files
  // into memory even when the caller asks for a huge maxBytes.
  let raw: string
  try {
    raw = await readFile(filePath, "utf-8")
  } catch {
    return null
  }

  const language = detectLanguage(filePath)
  const byteSize = Buffer.byteLength(raw, "utf-8")

  if (byteSize <= maxBytes) {
    return {
      filePath,
      language,
      content: raw,
      truncated: false,
      fullSize,
    }
  }

  // Truncate by lines first (line-level truncation preserves the model's
  // ability to anchor imports + exports). If even the truncated form
  // exceeds maxBytes, scale head + tail down proportionally so we keep
  // both ends visible to the model instead of shaving off the tail.
  const lines = raw.split("\n")
  let truncatedContent: string
  if (lines.length > headLines + tailLines) {
    truncatedContent = buildHeadTailWithinBudget(lines, headLines, tailLines, maxBytes)
  } else {
    // Few long lines — single long line case. Hard byte-cap with a marker.
    if (Buffer.byteLength(raw, "utf-8") > maxBytes) {
      truncatedContent =
        raw.slice(0, maxBytes) + "\n// ...[truncated: file exceeded byte budget]..."
    } else {
      truncatedContent = raw
    }
  }

  return {
    filePath,
    language,
    content: truncatedContent,
    truncated: true,
    fullSize,
  }
}

// ---------------------------------------------------------------------------
// Batch read for chain
// ---------------------------------------------------------------------------

export interface LoadFilesForPromptOptions extends ReadExistingFileOptions {
  /** Read at most this many files. Default 3. */
  topN?: number
}

/**
 * Batch-read the top-N candidate files surfaced by PathResolver.
 *
 * Files are read in parallel. Null reads (missing / forbidden) are dropped
 * from the output silently — the caller can still see the resolution in
 * ExistingFilesContext.resolutions if it wants to surface the gap.
 */
export async function loadFilesForPrompt(
  resolutions: PathResolution[],
  opts: LoadFilesForPromptOptions = {},
): Promise<ExistingFileContent[]> {
  if (!resolutions || resolutions.length === 0) return []
  const topN = clampPositive(opts.topN, DEFAULT_TOP_N, 10)
  // Already sorted by confidence desc by PathResolver, but defensive sort
  // here in case caller mutated it.
  const top = [...resolutions]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topN)

  // De-dupe by filePath in case multiple routes resolved to the same file.
  const seen = new Set<string>()
  const deduped = top.filter((r) => {
    if (seen.has(r.filePath)) return false
    seen.add(r.filePath)
    return true
  })

  const reads = await Promise.all(
    deduped.map((r) => readExistingFile(r.filePath, opts).catch(() => null)),
  )
  return reads.filter((f): f is ExistingFileContent => f !== null)
}

// ---------------------------------------------------------------------------
// Chain entry point — used by chain.ts
// ---------------------------------------------------------------------------

export interface LoadExistingFilesContextInput {
  prompt: string
  contextPack: RepoContextPack
  /** Optional override for repo root on disk (used by tests). */
  repoRoot?: string | null
  /** Override Dash workspace root used to derive repoRoot when not given. */
  dashRoot?: string
  /** Reader cap overrides. */
  reader?: LoadFilesForPromptOptions
}

/**
 * One-shot factory called by `generateWithSkillChain` to assemble the full
 * existing-files context for the current prompt. Returns an empty (but
 * present) ExistingFilesContext when nothing was found — caller can rely on
 * the shape and skip a null check.
 */
export async function loadExistingFilesContext(
  input: LoadExistingFilesContextInput,
): Promise<ExistingFilesContext> {
  const empty: ExistingFilesContext = { resolutions: [], files: [] }
  if (!input.prompt || !input.contextPack) return empty

  const resolver = resolverFor(input.contextPack.repoSlug, {
    repoRoot: input.repoRoot,
    dashRoot: input.dashRoot,
  })
  if (!resolver) return empty

  let resolutions: PathResolution[] = []
  try {
    resolutions = await resolver.resolveFromPrompt(input.prompt, input.contextPack)
  } catch {
    return empty
  }
  if (resolutions.length === 0) return empty

  let files: ExistingFileContent[] = []
  try {
    files = await loadFilesForPrompt(resolutions, input.reader)
  } catch {
    files = []
  }
  return { resolutions, files }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolverFor(
  repoSlug: RepoSurface | string,
  opts: { repoRoot?: string | null; dashRoot?: string } = {},
): PathResolver | null {
  if (opts.repoRoot) return new PathResolver(repoSlug, opts.repoRoot)
  return createPathResolverForRepo(repoSlug, { dashRoot: opts.dashRoot })
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, "")
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "css":
    case "scss":
    case "json":
    case "md":
    case "html":
      return ext
    case "mjs":
      return "js"
    case "cjs":
      return "js"
    default:
      return "unknown"
  }
}

function containsForbiddenSegment(filePath: string): boolean {
  const norm = filePath.split(path.sep)
  for (const seg of norm) {
    if (FORBIDDEN_PATH_SEGMENTS.includes(seg)) return true
  }
  return false
}

function clampPositive(value: number | undefined, fallback: number, max: number): number {
  if (value === undefined || value === null) return fallback
  if (!Number.isFinite(value)) return fallback
  if (value <= 0) return fallback
  return Math.min(value, max)
}

/**
 * Build a head + truncation marker + tail string that fits inside `maxBytes`.
 * If the requested head/tail counts overflow, scale BOTH ends down
 * proportionally so the model still sees both anchors (imports + exports).
 *
 * Guarantees:
 *   - At least 1 head line + 1 tail line whenever possible.
 *   - Truncation marker always included.
 *   - Final byte length ≤ maxBytes (with a small slack for the marker text).
 */
function buildHeadTailWithinBudget(
  lines: string[],
  headLines: number,
  tailLines: number,
  maxBytes: number,
): string {
  const renderMarker = (skipped: number) =>
    `\n\n// ...[truncated ${skipped} lines]...\n\n`

  let head = headLines
  let tail = tailLines

  for (let attempt = 0; attempt < 20; attempt++) {
    head = Math.max(1, head)
    tail = Math.max(1, tail)
    if (head + tail >= lines.length) {
      // No truncation needed — return full file.
      return lines.join("\n")
    }
    const headStr = lines.slice(0, head).join("\n")
    const tailStr = lines.slice(-tail).join("\n")
    const skipped = lines.length - head - tail
    const candidate = `${headStr}${renderMarker(skipped)}${tailStr}`
    if (Buffer.byteLength(candidate, "utf-8") <= maxBytes) return candidate

    // Scale both ends down by ~30%
    head = Math.floor(head * 0.7)
    tail = Math.floor(tail * 0.7)
    if (head <= 1 && tail <= 1) break
  }

  // Last resort: 1 head line + 1 tail line + marker; hard byte-cap.
  const headStr = lines[0] ?? ""
  const tailStr = lines[lines.length - 1] ?? ""
  const skipped = Math.max(0, lines.length - 2)
  let candidate = `${headStr}${renderMarker(skipped)}${tailStr}`
  if (Buffer.byteLength(candidate, "utf-8") > maxBytes) {
    candidate =
      candidate.slice(0, maxBytes) + "\n// ...[truncated: file exceeded byte budget]..."
  }
  return candidate
}
