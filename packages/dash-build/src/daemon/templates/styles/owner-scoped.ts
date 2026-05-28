/**
 * Tier 6 — Owner Dashboard scoped CSS module.
 *
 * The full `DASHBOARD_CSS` bundle in `styles/dashboard.ts` ships every
 * surface stylesheet together (Build home, workspace, owner panels,
 * Lovable shell). For deployments that mount `/owner` standalone we only
 * need the slice that styles the Owner page.
 *
 * `extractOwnerScopedCss` parses `DASHBOARD_CSS` for the well-known
 * `=== Sprint 3 Owner ===` block + downstream Owner panel markers and
 * returns a CSS string that depends only on Layer 0 tokens (already
 * declared elsewhere). The dashboard layout layer prepends the token
 * declarations when this slice is rendered standalone.
 *
 * Markers are part of the dashboard.ts contract (used elsewhere by tests),
 * so the extractor is intentionally tolerant — if a marker shifts the slice
 * just empties out rather than throws. Callers always treat the result as
 * "best effort".
 */

import { DASHBOARD_CSS } from "./dashboard.js"

const MARKERS = [
  "/* === Sprint 3 Owner === */",
  "/* === Branch Queue table === */",
  "/* === Activity Feed === */",
  "/* === Cost Card === */",
  "/* === DS Candidate Queue === */",
]

/**
 * Return a CSS string with ONLY the rules under the Owner-scoped markers.
 * The next non-Owner marker (e.g. Lovable shell, Sidebar) terminates the
 * slice. Whitespace + comment ordering is preserved.
 */
export function extractOwnerScopedCss(source: string = DASHBOARD_CSS): string {
  const slices: string[] = []
  for (const marker of MARKERS) {
    const start = source.indexOf(marker)
    if (start < 0) continue
    const next = nextMarkerAfter(source, start + marker.length)
    const end = next < 0 ? source.length : next
    slices.push(source.slice(start, end))
  }
  return slices.join("\n\n").trim()
}

/**
 * Tokens-only declarations bundle. When the Owner surface is mounted on a
 * subdomain WITHOUT the rest of Dash Build the consumer needs the Layer 0
 * tokens too — pull them out of DASHBOARD_CSS via the `:root` selector.
 */
export function extractTokenRootCss(source: string = DASHBOARD_CSS): string {
  const start = source.indexOf(":root")
  if (start < 0) return ""
  const open = source.indexOf("{", start)
  if (open < 0) return ""
  let depth = 1
  let i = open + 1
  while (i < source.length && depth > 0) {
    const c = source.charAt(i)
    if (c === "{") depth += 1
    else if (c === "}") depth -= 1
    i += 1
  }
  if (depth !== 0) return ""
  return source.slice(start, i)
}

/** Compose the standalone Owner CSS bundle (tokens + scoped slice). */
export function renderOwnerStandaloneCss(): string {
  const tokens = extractTokenRootCss()
  const scoped = extractOwnerScopedCss()
  return [tokens, "/* === Owner standalone slice === */", scoped]
    .filter(Boolean)
    .join("\n\n")
}

function nextMarkerAfter(source: string, from: number): number {
  // Find the next `/* === ... === */` marker that is NOT in our owner set.
  const re = /\/\*\s*===\s*[^=]+===\s*\*\//g
  re.lastIndex = from
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    if (!MARKERS.includes(match[0])) return match.index
  }
  return -1
}
