/**
 * Parses Claude's markdown response into structured file blocks + explanation.
 *
 * Supported fence headers (Sprint 2B adds the `mode=` variants):
 *
 *   1. Legacy new-file:
 *        ```<lang> [path/to/file.tsx]
 *        <content>
 *        ```
 *
 *   2. New-file (explicit mode):
 *        ```mode=new-file [path/to/file.tsx]
 *        <content>
 *        ```
 *      Optional language suffix is allowed:
 *        ```mode=new-file:tsx [path/to/file.tsx]
 *
 *   3. Patch (Sprint 2B):
 *        ```mode=patch [path/to/existing-file.tsx]
 *        @@ -45,3 +45,8 @@
 *           existing line
 *        +  new line
 *           existing line
 *        ```
 *
 * The bracketed path is the canonical signal. Code blocks without a
 * bracketed path are treated as inline examples and ignored (kept in
 * `explanation`).
 *
 * Pure function. Safe to run on adversarial input — never throws.
 */

import type {
  ParsedFile,
  ParsedPatch,
  ParsedResponse,
} from "./types.js"

/**
 * Matches either:
 *   - ```<lang> [path]              (legacy)
 *   - ```mode=new-file[:lang] [path] (Sprint 2B explicit)
 *   - ```mode=patch[:lang] [path]    (Sprint 2B patch)
 *
 * Group 1 = the raw header token (e.g. "tsx" or "mode=patch:tsx").
 * Group 2 = bracketed path.
 * Group 3 = inner content.
 */
// Header path is wrapped in [ … ]. The path itself may contain brackets
// (Next.js dynamic segments like `driver/[slug]/components/Foo.jsx`), so we
// greedily match up to the LAST `]` before the end-of-line, not the first.
// `[^\n]+` + greedy `\]` lets inner `[slug]` brackets survive while the final
// `]` on the line closes the wrapper.
const FILE_BLOCK_RE = /```([a-zA-Z0-9_=+:.-]*)\s+\[([^\n]+)\]\s*\n([\s\S]*?)```/g

interface HeaderInfo {
  mode: "new-file" | "patch"
  language: string
}

/**
 * Classify the raw fence header token into a mode + language. Falls back
 * to "new-file" + the header itself as the language when the header is a
 * plain language hint (legacy contract).
 */
export function parseFenceHeader(header: string): HeaderInfo {
  const trimmed = (header ?? "").trim()
  if (!trimmed) return { mode: "new-file", language: "text" }

  if (trimmed.toLowerCase().startsWith("mode=")) {
    // mode=patch | mode=new-file | mode=patch:tsx | mode=new-file:diff
    const body = trimmed.slice("mode=".length)
    const colon = body.indexOf(":")
    const modeToken = (colon >= 0 ? body.slice(0, colon) : body).toLowerCase()
    const lang = colon >= 0 ? body.slice(colon + 1).trim() : ""
    if (modeToken === "patch") {
      return { mode: "patch", language: lang || "diff" }
    }
    // Anything else under mode=… falls back to new-file.
    return { mode: "new-file", language: lang || "text" }
  }

  return { mode: "new-file", language: trimmed }
}

export function parseResponse(rawText: string): ParsedResponse {
  if (typeof rawText !== "string" || rawText.length === 0) {
    return { files: [], patches: [], explanation: "" }
  }

  const files: ParsedFile[] = []
  const patches: ParsedPatch[] = []
  const matches: Array<{ start: number; end: number }> = []
  let m: RegExpExecArray | null
  FILE_BLOCK_RE.lastIndex = 0
  while ((m = FILE_BLOCK_RE.exec(rawText)) !== null) {
    const rawHeader = m[1]
    const rawPath = normalizeModelPath(m[2].trim())
    const content = m[3].replace(/^\n+|\n+$/g, "")
    if (!isSafePath(rawPath)) continue
    const { mode, language } = parseFenceHeader(rawHeader)
    if (mode === "patch") {
      patches.push({
        kind: "patch",
        path: rawPath,
        language: language || "diff",
        patchContent: content,
      })
    } else {
      files.push({
        kind: "file",
        language: language || "text",
        path: rawPath,
        content,
      })
    }
    matches.push({ start: m.index, end: m.index + m[0].length })
  }

  // Build explanation = text outside the file blocks, collapsed whitespace.
  const explanation = stripRanges(rawText, matches).replace(/\n{3,}/g, "\n\n").trim()

  return { files, patches, explanation }
}

/**
 * Reject path traversal + absolute paths. We only allow forward-slash-separated
 * relative paths so callers can safely `path.join(repoRoot, file.path)`.
 */
/**
 * Normalize a model-emitted path to a repo-relative form.
 *
 * The model is given CURRENT FILE STATE with ABSOLUTE paths (e.g.
 * `/Users/…/next-backoffice-web/src/pages/driver/[slug]/components/Foo.jsx`),
 * so it faithfully echoes them back in the patch header. But `isSafePath`
 * rejects absolute paths (they'd break `path.join(repoRoot, …)`), which
 * silently dropped every patch → "no parseable file blocks" → empty preview.
 *
 * We strip everything up to and including a recognised repo-root segment so
 * the path becomes relative (e.g. `src/pages/driver/[slug]/components/Foo.jsx`).
 * Falls back to the basename-anchored `src/…` slice, else the trimmed input.
 */
export function normalizeModelPath(p: string): string {
  if (!p) return p
  let s = p.trim().replace(/\\/g, "/")
  // Absolute or repo-prefixed → keep from the first `src/` (or app/pages/lib).
  const anchor = s.match(/(?:^|\/)((?:src|app|pages|components|lib|public)\/.+)$/)
  if (anchor) return anchor[1]
  // Absolute path without a known anchor → take the last 3 segments so it
  // stays relative + safe rather than being dropped wholesale.
  if (s.startsWith("/")) {
    const parts = s.split("/").filter(Boolean)
    s = parts.slice(-3).join("/")
  }
  return s
}

export function isSafePath(p: string): boolean {
  if (!p || p.length > 512) return false
  if (p.startsWith("/") || p.startsWith("\\")) return false
  if (p.includes("..")) return false
  if (/[<>:"|?*\x00-\x1f]/.test(p)) return false
  return true
}

function stripRanges(s: string, ranges: Array<{ start: number; end: number }>): string {
  if (ranges.length === 0) return s
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  let out = ""
  let cursor = 0
  for (const r of sorted) {
    out += s.slice(cursor, r.start)
    cursor = r.end
  }
  out += s.slice(cursor)
  return out
}

/**
 * Extract the assistant text from an Anthropic `messages.create` response.
 * Concats all text blocks (vision blocks etc. are dropped).
 */
export function extractText(response: {
  content: Array<{ type: string; text?: string }>
}): string {
  if (!response?.content) return ""
  return response.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
}
