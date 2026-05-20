/**
 * component-version — parse + compare `@dash version X.Y.Z` header comments
 * stamped onto installed component files. Used by `dash sync` to detect drift
 * and classify bump severity (patch / minor / major).
 *
 * Header convention (injected by `dash add` on first write):
 *
 *   /**
 *    * @dash version 1.2.0
 *    * @dash source registry/dash/ui/button.tsx
 *    * @dash updated 2026-05-20
 *    *\/
 *
 * If the header is missing or unparsable, callers fall back to checksum
 * compare — see `sync.ts`.
 */
import crypto from "node:crypto"

export type SemVer = { major: number; minor: number; patch: number }

export type BumpType = "patch" | "minor" | "major" | "none" | "unknown"

export type DashHeader = {
  version: SemVer | null
  rawVersion: string | null
  source: string | null
  updated: string | null
  theme: string | null
}

const VERSION_RE = /@dash\s+version\s+(\d+)\.(\d+)\.(\d+)/i
const SOURCE_RE = /@dash\s+source\s+(\S+)/i
const UPDATED_RE = /@dash\s+updated\s+(\S+)/i
const THEME_RE = /@dash\s+theme\s+(\S+)/i

export function parseSemVer(raw: string): SemVer | null {
  const m = raw.match(/(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  }
}

export function formatSemVer(v: SemVer | null): string {
  if (!v) return "0.0.0"
  return `${v.major}.${v.minor}.${v.patch}`
}

export function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}

/**
 * Classify the bump direction from `local` -> `remote`. Returns "none" when
 * equal, "unknown" when either side is missing.
 */
export function classifyBump(
  local: SemVer | null,
  remote: SemVer | null,
): BumpType {
  if (!local || !remote) return "unknown"
  if (compareSemVer(local, remote) === 0) return "none"
  if (remote.major > local.major) return "major"
  if (remote.minor > local.minor) return "minor"
  if (remote.patch > local.patch) return "patch"
  // remote < local (consumer ahead of registry) — treat as "none" to skip
  return "none"
}

export function parseDashHeader(content: string): DashHeader {
  // Header is expected in the first ~30 lines; bail early on huge files.
  const head = content.split("\n").slice(0, 60).join("\n")
  const vm = head.match(VERSION_RE)
  const sm = head.match(SOURCE_RE)
  const um = head.match(UPDATED_RE)
  const tm = head.match(THEME_RE)
  const rawVersion = vm ? `${vm[1]}.${vm[2]}.${vm[3]}` : null
  return {
    version: rawVersion ? parseSemVer(rawVersion) : null,
    rawVersion,
    source: sm?.[1] ?? null,
    updated: um?.[1] ?? null,
    theme: tm?.[1] ?? null,
  }
}

/**
 * Build a header block to prepend onto a component file at install time.
 * Idempotent — callers should check `hasDashHeader` first.
 */
export function buildDashHeader(args: {
  version: string
  source: string
  updated?: string
  /** Optional Layer-2 theme stamp (`ride` | `logistic` | …). */
  theme?: string
}): string {
  const updated = args.updated ?? new Date().toISOString().slice(0, 10)
  const lines = [
    "/**",
    ` * @dash version ${args.version}`,
    ` * @dash source ${args.source}`,
    ` * @dash updated ${updated}`,
  ]
  if (args.theme) lines.push(` * @dash theme ${args.theme}`)
  lines.push(" */", "")
  return lines.join("\n")
}

export function hasDashHeader(content: string): boolean {
  return VERSION_RE.test(content.split("\n").slice(0, 60).join("\n"))
}

/**
 * Inject the header at the top of a file. Preserves a leading "use client"
 * (or "use server") directive — those must remain the first statement for
 * the React Server Components runtime.
 */
export function injectDashHeader(content: string, header: string): string {
  if (hasDashHeader(content)) return content
  const lines = content.split("\n")
  // Look for a leading directive within the first 3 non-empty lines.
  let directiveIdx = -1
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const t = lines[i].trim()
    if (t === "") continue
    if (/^["'](use client|use server|use strict)["']\s*;?$/.test(t)) {
      directiveIdx = i
    }
    break
  }
  if (directiveIdx === -1) {
    return header + content
  }
  const before = lines.slice(0, directiveIdx + 1).join("\n")
  const after = lines.slice(directiveIdx + 1).join("\n")
  return `${before}\n\n${header}${after}`
}

export function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12)
}

/**
 * Strip the volatile `@dash updated <date>` line for drift comparison.
 * Two files that differ only in their updated stamp are considered equal
 * — only `@dash version` changes count as semantic drift.
 */
export function stripUpdatedStamp(content: string): string {
  return content.replace(/^[ \t]*\*?\s*@dash\s+updated\s+\S+.*$\n?/gim, "")
}
