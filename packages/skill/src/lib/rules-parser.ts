/**
 * Parses `dash-ai-rules.md` into a structured tree so v2 builder can do
 * selective injection. Two layers of headings matter:
 *   - `## ` — top-level section (e.g. "Per-repo stack mandates")
 *   - `### ` — sub-section (e.g. "next-portal-v2-web")
 *
 * Lines are kept verbatim (Markdown preserved). The tree carries enough
 * metadata to:
 *   1. Look up a section by id (slug of title)
 *   2. Pull a verbatim range (line-based) for "pinned" blocks even when no
 *      heading exists (e.g. envelope-discriminator table rows).
 *
 * No dependencies. Pure functions.
 */

export type RuleSection = {
  /** Slug — lowercased, non-alnum → '-' */
  id: string
  /** Raw title text (without leading `#`). */
  title: string
  /** Heading depth (2 or 3). */
  depth: 2 | 3
  /** 1-based first line of this section (the heading line itself). */
  startLine: number
  /** 1-based last line BEFORE the next sibling/parent heading. */
  endLine: number
  /** Verbatim body, joined with `\n` (heading included). */
  body: string
  /** Child `###` sections nested under a `##` parent. */
  children: RuleSection[]
}

export type ParsedRules = {
  /** All raw lines, 1-indexed (lines[0] is empty placeholder). */
  lines: string[]
  /** Top-level `##` sections in document order. */
  sections: RuleSection[]
  /** Flat lookup `id → section` (both depths). */
  byId: Map<string, RuleSection>
}

export function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/**
 * Parse the rules markdown text. Returns the full tree.
 */
export function parseRules(text: string): ParsedRules {
  const rawLines = text.split(/\r?\n/)
  // 1-indexed lines for human-friendly line numbers
  const lines: string[] = ["", ...rawLines]
  const byId = new Map<string, RuleSection>()

  type Marker = { depth: 2 | 3; title: string; lineNo: number }
  const markers: Marker[] = []
  for (let i = 1; i < lines.length; i++) {
    const ln = lines[i]
    const m2 = /^## (?!#)(.+)$/.exec(ln)
    if (m2) {
      markers.push({ depth: 2, title: m2[1].trim(), lineNo: i })
      continue
    }
    const m3 = /^### (?!#)(.+)$/.exec(ln)
    if (m3) {
      markers.push({ depth: 3, title: m3[1].trim(), lineNo: i })
    }
  }

  function buildBody(startLine: number, endLine: number): string {
    return lines.slice(startLine, endLine + 1).join("\n")
  }

  const sections: RuleSection[] = []
  // Walk markers: each `##` opens a section that ends at the next `##` or EOF.
  // `###` markers inside become children.
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i]
    if (m.depth !== 2) continue
    // Find end of this ## section.
    let endLine = lines.length - 1
    for (let j = i + 1; j < markers.length; j++) {
      if (markers[j].depth === 2) {
        endLine = markers[j].lineNo - 1
        break
      }
    }
    const section: RuleSection = {
      id: slugifyHeading(m.title),
      title: m.title,
      depth: 2,
      startLine: m.lineNo,
      endLine,
      body: buildBody(m.lineNo, endLine),
      children: [],
    }
    // Pull child `###` sections that fall between (lineNo, endLine].
    for (let j = i + 1; j < markers.length; j++) {
      const c = markers[j]
      if (c.lineNo > endLine) break
      if (c.depth !== 3) continue
      let cEnd = endLine
      for (let k = j + 1; k < markers.length; k++) {
        const next = markers[k]
        if (next.lineNo > endLine) break
        if (next.depth === 3 || next.depth === 2) {
          cEnd = next.lineNo - 1
          break
        }
      }
      const child: RuleSection = {
        id: slugifyHeading(c.title),
        title: c.title,
        depth: 3,
        startLine: c.lineNo,
        endLine: cEnd,
        body: buildBody(c.lineNo, cEnd),
        children: [],
      }
      section.children.push(child)
      // Index children too — first wins on collision (e.g. "Rules", "Rule for AI" appear multiple times)
      if (!byId.has(child.id)) byId.set(child.id, child)
    }
    sections.push(section)
    if (!byId.has(section.id)) byId.set(section.id, section)
  }

  return { lines, sections, byId }
}

/**
 * Extract a verbatim line range (inclusive, 1-based) from parsed rules.
 * Returns "" if out of bounds.
 */
export function extractLineRange(
  parsed: ParsedRules,
  startLine: number,
  endLine: number,
): string {
  const s = Math.max(1, startLine)
  const e = Math.min(parsed.lines.length - 1, endLine)
  if (s > e) return ""
  return parsed.lines.slice(s, e + 1).join("\n")
}

/**
 * Look up a child `###` section by its slug, scoped to a parent `##` slug.
 * Returns null if not found. Useful for per-repo scoping where multiple `##`
 * sections may have a child with the same slug (e.g. "rules").
 */
export function findChildSection(
  parsed: ParsedRules,
  parentSlug: string,
  childSlug: string,
): RuleSection | null {
  const parent = parsed.byId.get(parentSlug)
  if (!parent) return null
  for (const c of parent.children) {
    if (c.id === childSlug) return c
  }
  return null
}
