/**
 * DSCandidateRanker — Surface 3 Owner Co-pilot: surface components built
 * in consumer repos that should be promoted into the Dash design system.
 *
 * Scan recent runs (default last 50) for generated component files whose
 * path/name does NOT match an existing registry entry. The more times the
 * same pattern appears across DIFFERENT projects, the higher the promotion
 * priority — that's the cross-repo reusability signal.
 *
 * Scoring formula:
 *
 *   score = (crossRepoCount * 10)
 *         + min(complexityHint, 5)
 *         + domainNeutralityBonus
 *
 * Where:
 *   crossRepoCount      — distinct project IDs that produced this candidate
 *   complexityHint      — heuristic 0..5 based on file path depth + filename
 *   domainNeutralityBonus — +5 when the name contains no domain word
 *                           (mitra, driver, payment, kyc, etc.); +2 otherwise
 *
 * Sprint 3B MVP scope: shape + interface + heuristic. Real reusability
 * scoring (AST similarity, prop overlap, theme audit) deferred. Returns
 * the top N candidates sorted DESC by score.
 *
 * Coordination with S3A: route `/api/owner/ds-candidates` returns the
 * ranked list ready for table render — UI does not re-sort.
 */

import type { Run } from "../../daemon/state/types.js"
import { introspectRepo } from "../../skills/repo-introspector.js"

export interface DSCandidate {
  /** Component name parsed from the generated file path. */
  componentName: string
  /** Sample repo paths where the pattern surfaced. */
  occurrences: Array<{ runId: string; project: string; path: string }>
  /** Distinct project ids the pattern touched. */
  crossRepoCount: number
  /** Heuristic 0..5 based on path depth + filename signals. */
  complexity: number
  /** True when no domain keyword is present (more broadly reusable). */
  domainNeutral: boolean
  /** Total score (sort key). */
  score: number
  /** Suggested target layer in the Dash DS registry. */
  suggestedLayer: "ui" | "blocks" | "patterns"
  /** One-liner explanation surfaced in the dashboard. */
  rationale: string
}

export interface DSCandidateRankerOptions {
  /**
   * Optional repo introspector — swap in a mock during tests. The real
   * implementation lives in `src/skills/repo-introspector.ts` and is what
   * production callers should use. Currently we only USE it lazily when
   * the caller wants to filter out known-DS names; the MVP set is
   * sufficient with the static `KNOWN_REGISTRY_NAMES` list below.
   */
  introspector?: typeof introspectRepo
  /** Override the default known-DS name set (test seam). */
  knownRegistryNames?: Set<string>
  /** Cap the candidate list. Default 10. */
  topN?: number
  /** Cap how many recent runs to scan. Default 50. */
  maxRuns?: number
}

/**
 * Hard-coded sample of the Dash DS registry. The full list lives at
 * `apps/docs/registry.json`; keeping a small in-process set avoids a
 * 200KB JSON read on every Owner Dashboard refresh. Update when major
 * atoms ship — false positives are only "we suggested a name that
 * already exists", which the Promote action will catch anyway.
 */
const KNOWN_REGISTRY_NAMES = new Set<string>([
  "button",
  "input",
  "modal",
  "card",
  "badge",
  "avatar",
  "select",
  "checkbox",
  "radio",
  "switch",
  "tabs",
  "table",
  "tooltip",
  "popover",
  "dropdown",
  "menu",
  "drawer",
  "dialog",
  "alert",
  "toast",
  "progress",
  "spinner",
  "skeleton",
  "breadcrumb",
  "pagination",
  "stepper",
  "accordion",
  "calendar",
  "datepicker",
  "timepicker",
  "form",
  "label",
  "textarea",
  "slider",
  "rating",
  "tag",
  "chip",
  "divider",
  "icon",
])

// Dash-domain keywords that flag a component as Layer 3 (product-specific).
// Keep this list tight — generic UI words ("tile", "card", "panel") must NOT
// appear here or every reusable atom gets misclassified as a domain block.
const DOMAIN_WORDS = [
  "mitra",
  "driver",
  "kurir",
  "payment",
  "kyc",
  "suspend",
  "dispatch",
  "polygon",
  "incentive",
  "payroll",
]

// Match TSX/JSX component files anywhere under a `components/` directory.
const COMPONENT_FILE_RE =
  /(?:^|\/)src\/components\/([A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?)\.(tsx|jsx)$/i

export class DSCandidateRanker {
  private readonly introspector: typeof introspectRepo | undefined
  private readonly known: Set<string>
  private readonly topN: number
  private readonly maxRuns: number

  constructor(opts: DSCandidateRankerOptions = {}) {
    this.introspector = opts.introspector
    this.known = opts.knownRegistryNames ?? KNOWN_REGISTRY_NAMES
    this.topN = opts.topN ?? 10
    this.maxRuns = opts.maxRuns ?? 50
  }

  /**
   * Scan runs for candidate components. Returns the ranked top-N list.
   */
  async detectCandidates(runs: Run[]): Promise<DSCandidate[]> {
    const window = runs.slice(0, this.maxRuns)
    const byName = new Map<string, DSCandidate>()

    for (const run of window) {
      if (!run.artifactDir) continue
      const files = filesFromRun(run)
      for (const filePath of files) {
        const match = filePath.match(COMPONENT_FILE_RE)
        if (!match) continue
        const rawName = match[1].split("/").pop() ?? match[1]
        const normalized = normalizeName(rawName)
        if (this.known.has(normalized)) continue

        const existing = byName.get(normalized)
        const occurrence = {
          runId: run.id,
          project: run.projectId,
          path: filePath,
        }
        if (existing) {
          existing.occurrences.push(occurrence)
        } else {
          byName.set(normalized, {
            componentName: rawName,
            occurrences: [occurrence],
            crossRepoCount: 0,
            complexity: 0,
            domainNeutral: false,
            score: 0,
            suggestedLayer: "ui",
            rationale: "",
          })
        }
      }
    }

    const candidates = Array.from(byName.values())
    for (const c of candidates) {
      c.crossRepoCount = countDistinctProjects(c)
      c.complexity = estimateComplexity(c)
      c.domainNeutral = isDomainNeutral(c.componentName)
      c.suggestedLayer = suggestLayer(c)
      c.score = computeScore(c)
      c.rationale = explain(c)
    }

    return this.rankByReusability(candidates).slice(0, this.topN)
  }

  /**
   * Sort candidates DESC by score. Kept public so callers can rerank a
   * curated list (e.g. after a manual "ignore" toggle).
   */
  rankByReusability(candidates: DSCandidate[]): DSCandidate[] {
    return candidates.slice().sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Tie-break — alphabetical for deterministic UI ordering.
      return a.componentName.localeCompare(b.componentName)
    })
  }
}

/**
 * Sprint 3B note: until we wire generated-file metadata into Run we read
 * the file list from artifactDir's name OR fall back to the run prompt
 * for a regex match. This is intentionally permissive — the goal of the
 * dashboard tile is "show me what looks like a candidate", not a contract.
 */
function filesFromRun(run: Run): string[] {
  // The artifact-store writes generated files under <runDir>/files/<path>,
  // but listing the dir is async. For the snapshot view we use the prompt
  // text as a fallback signal — it almost always names the component(s)
  // it asked for.
  const prompt = run.prompt ?? ""
  const out: string[] = []
  const re = /src\/components\/[A-Za-z0-9_/-]+\.(tsx|jsx)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(prompt)) !== null) {
    out.push(m[0])
  }
  return out
}

function normalizeName(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toLowerCase()
}

function countDistinctProjects(c: DSCandidate): number {
  return new Set(c.occurrences.map((o) => o.project)).size
}

function estimateComplexity(c: DSCandidate): number {
  // More path depth = more composition = higher complexity. Capped at 5.
  const avgDepth =
    c.occurrences.reduce((acc, o) => acc + o.path.split("/").length, 0) /
    Math.max(1, c.occurrences.length)
  return Math.min(5, Math.round(avgDepth - 2))
}

function isDomainNeutral(name: string): boolean {
  const lower = name.toLowerCase()
  return !DOMAIN_WORDS.some((w) => lower.includes(w))
}

function suggestLayer(c: DSCandidate): "ui" | "blocks" | "patterns" {
  if (!isDomainNeutral(c.componentName)) return "blocks"
  if (c.crossRepoCount >= 3) return "ui"
  return "patterns"
}

function computeScore(c: DSCandidate): number {
  return (
    c.crossRepoCount * 10 +
    Math.min(c.complexity, 5) +
    (c.domainNeutral ? 5 : 2)
  )
}

function explain(c: DSCandidate): string {
  const parts: string[] = []
  parts.push(`Seen across ${c.crossRepoCount} project(s)`)
  if (c.domainNeutral) {
    parts.push("domain-neutral name")
  } else {
    parts.push("domain-specific — likely Layer 3 block")
  }
  parts.push(`suggest → registry/dash/${c.suggestedLayer}/`)
  return parts.join(" · ")
}
