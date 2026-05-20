/**
 * diff-renderer — vanilla line-by-line diff rendering for `dash sync`
 * prompts. Two modes:
 *
 *   - renderPreview(local, remote, { maxLines })  → short snippet for the
 *     inline "[y/N/d/s]" prompt (default 20 changed lines).
 *   - renderFull(local, remote)                    → full unified-style diff
 *     when the user hits "d" at the prompt.
 *
 * Intentionally no external diff lib — string LCS would be heavy; a
 * naive line-by-line scan is fine for the ~200 LOC component files Dash
 * ships. Result is colored via kleur.
 */
import kleur from "kleur"

export type DiffOpts = {
  maxLines?: number
  context?: number
}

type DiffLine =
  | { kind: "same"; text: string }
  | { kind: "add"; text: string }
  | { kind: "del"; text: string }

function computeDiff(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n")
  const bLines = b.split("\n")
  const out: DiffLine[] = []
  const max = Math.max(aLines.length, bLines.length)
  for (let i = 0; i < max; i++) {
    const la = aLines[i]
    const lb = bLines[i]
    if (la === lb) {
      if (la !== undefined) out.push({ kind: "same", text: la })
      continue
    }
    if (la !== undefined && lb === undefined) {
      out.push({ kind: "del", text: la })
    } else if (la === undefined && lb !== undefined) {
      out.push({ kind: "add", text: lb })
    } else {
      out.push({ kind: "del", text: la! })
      out.push({ kind: "add", text: lb! })
    }
  }
  return out
}

function paintLine(line: DiffLine): string {
  switch (line.kind) {
    case "same":
      return kleur.dim(`  ${line.text}`)
    case "add":
      return kleur.green(`+ ${line.text}`)
    case "del":
      return kleur.red(`- ${line.text}`)
  }
}

/**
 * Compact preview: only changed lines (no context), capped at maxLines.
 */
export function renderPreview(
  local: string,
  remote: string,
  opts: DiffOpts = {},
): string {
  const maxLines = opts.maxLines ?? 20
  const all = computeDiff(local, remote)
  const changes = all.filter((l) => l.kind !== "same")
  const shown = changes.slice(0, maxLines).map(paintLine)
  const omitted = changes.length - shown.length
  if (omitted > 0) {
    shown.push(kleur.dim(`  … ${omitted} more line(s) — press "d" for full diff`))
  }
  if (shown.length === 0) {
    return kleur.dim("  (no line-level diff — likely whitespace or EOL change)")
  }
  return shown.join("\n")
}

/**
 * Full unified-ish diff with N lines of context around each hunk.
 */
export function renderFull(local: string, remote: string, opts: DiffOpts = {}): string {
  const context = opts.context ?? 3
  const lines = computeDiff(local, remote)
  // Mark which "same" lines are within `context` of a change.
  const keep = new Array<boolean>(lines.length).fill(false)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].kind === "same") continue
    for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) {
      keep[j] = true
    }
  }
  const out: string[] = []
  let lastShown = -2
  for (let i = 0; i < lines.length; i++) {
    if (!keep[i]) continue
    if (i - lastShown > 1) out.push(kleur.dim("  …"))
    out.push(paintLine(lines[i]))
    lastShown = i
  }
  if (out.length === 0) {
    return kleur.dim("  (no diff)")
  }
  return out.join("\n")
}

/** Public helper for testing / consumers that want raw diff lines. */
export function diffLines(a: string, b: string): DiffLine[] {
  return computeDiff(a, b)
}
