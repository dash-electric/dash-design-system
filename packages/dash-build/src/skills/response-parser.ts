/**
 * Parses Claude's markdown response into structured file blocks + explanation.
 *
 * Expected format (enforced by `prompt-composer`):
 *
 *   ```<lang> [path/to/file.tsx]
 *   <content>
 *   ```
 *
 * The bracketed path is the canonical signal. Code blocks without a bracketed
 * path are treated as inline examples and ignored (kept in `explanation`).
 *
 * Pure function. Safe to run on adversarial input — never throws.
 */

import type { ParsedFile, ParsedResponse } from "./types.js"

const FILE_BLOCK_RE = /```([a-zA-Z0-9_+-]*)\s+\[([^\]\n]+)\]\s*\n([\s\S]*?)```/g

export function parseResponse(rawText: string): ParsedResponse {
  if (typeof rawText !== "string" || rawText.length === 0) {
    return { files: [], explanation: "" }
  }

  const files: ParsedFile[] = []
  const matches: Array<{ start: number; end: number }> = []
  let m: RegExpExecArray | null
  FILE_BLOCK_RE.lastIndex = 0
  while ((m = FILE_BLOCK_RE.exec(rawText)) !== null) {
    const language = m[1].trim() || "text"
    const rawPath = m[2].trim()
    const content = m[3].replace(/^\n+|\n+$/g, "")
    if (!isSafePath(rawPath)) continue
    files.push({ language, path: rawPath, content })
    matches.push({ start: m.index, end: m.index + m[0].length })
  }

  // Build explanation = text outside the file blocks, collapsed whitespace.
  const explanation = stripRanges(rawText, matches).replace(/\n{3,}/g, "\n\n").trim()

  return { files, explanation }
}

/**
 * Reject path traversal + absolute paths. We only allow forward-slash-separated
 * relative paths so callers can safely `path.join(repoRoot, file.path)`.
 */
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
