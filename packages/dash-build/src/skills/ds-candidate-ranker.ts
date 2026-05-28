/**
 * Tier 6 — DSCandidateRanker (content-based).
 *
 * Complement to `src/owner/ai/ds-candidate-ranker.ts` (which ranks by FILE
 * NAMES across runs). This module scans the actual generated source code
 * of completed runs for inline JSX patterns that look like DS atoms but
 * were rolled raw (`<div className="...">`). The output is a short list of
 * candidate components to promote into `@dash/ui`.
 *
 * Why both rankers?
 *   - Name ranker = "this run produced a file called MetricCard.tsx"
 *   - Content ranker (this file) = "this run wrote 17 inline badge-shaped
 *     divs that should be `<Badge>`"
 *
 * Both signals are useful: the name signal needs at least one well-named
 * file (LLM doesn't always cooperate), and the content signal catches the
 * inline-pattern slop that the foundation scorer already penalises.
 *
 * Surface: `GET /api/ds-candidates` (Owner Co-pilot Tier 6 panel).
 *
 * Heuristics
 * ──────────
 * For each artifact file (.tsx/.jsx) we scan for `<div className="..."`
 * occurrences whose class string matches one of a small set of high-signal
 * DS shapes (Badge, Card, Tabs, EmptyState, MetricCard, TabBar). Each match
 * collapses to a normalised "shape signature" so similar inline patterns
 * cluster. The top 3 clusters surface with:
 *   - suggested DS atom name
 *   - tone variants observed (success / warning / error / info)
 *   - up to 3 representative sample usages
 *   - rough effort estimate (small/medium/large) based on shape complexity
 *
 * Stability
 * ─────────
 * The ranker is deterministic given the same input: clusters sort by
 * occurrence count DESC, then by name ASC for tie-breaks. Tests pin both
 * the cluster shapes and the resulting order on a synthetic corpus.
 */

import { readdir, readFile, stat } from "node:fs/promises"
import { join } from "node:path"

/** Generated artifact the ranker scans. */
export interface RankerArtifact {
  /** Run id (used for sample-citation in the dashboard). */
  runId: string
  /** Project id — surfaces "seen across N projects" reusability hint. */
  projectId: string
  /** Repo-relative path to the artifact. */
  path: string
  /** Raw source text. */
  content: string
}

export type ToneVariant = "success" | "warning" | "error" | "info" | "neutral"

export type CandidateEffort = "small" | "medium" | "large"

export interface CandidateSample {
  runId: string
  projectId: string
  path: string
  /** Trimmed snippet of the matching JSX (≤120 chars). */
  snippet: string
}

export interface DSCandidate {
  /** Proposed atom name (PascalCase). */
  name: string
  /** Atom shape we matched against. */
  shape: "Badge" | "Card" | "Tabs" | "EmptyState" | "MetricCard" | "TabBar"
  /** Total inline occurrences across all artifacts. */
  occurrences: number
  /** Distinct projects in which the pattern appeared. */
  crossRepoCount: number
  /** Distinct tone variants observed (`success`, `warning`, …). */
  variants: ToneVariant[]
  /** Up to 3 representative sample usages. */
  samples: CandidateSample[]
  /** Rough cost-to-add-to-DS estimate. */
  effort: CandidateEffort
  /** Short rationale shown in the panel. */
  rationale: string
}

export interface DSCandidateRankerOptions {
  /** Cap the output list. Default 3. */
  topN?: number
  /** Cap how many samples per candidate. Default 3. */
  samplesPerCandidate?: number
}

interface ShapeRule {
  name: DSCandidate["shape"]
  /** Required class fragments — ALL must appear in the className. */
  required: RegExp[]
  /**
   * Optional class fragments — any presence contributes a `+1` complexity
   * point. Used purely for the effort estimate.
   */
  optional: RegExp[]
  /**
   * Minimum class fragments before this shape "wins". Higher = stricter
   * (Card/EmptyState/MetricCard sit on multiple decorators; Badge is a
   * single pill).
   */
  minScore: number
}

/**
 * Ordered most-specific first — first rule that matches wins. EmptyState and
 * MetricCard must run before Card because they both build on card-like base
 * classes, and we want the more descriptive name to surface in the dashboard.
 */
const SHAPE_RULES: ShapeRule[] = [
  {
    name: "EmptyState",
    required: [/\bflex(?:-col)?\b/, /\bitems-center\b/, /\btext-center\b/],
    optional: [/\bpy-\d+\b/, /\bgap-\d+\b/, /\bjustify-center\b/],
    minScore: 3,
  },
  {
    name: "MetricCard",
    required: [/\brounded(-\w+)?\b/, /\bp-\d+\b/, /\b(border|shadow)\b/],
    optional: [/\bbg-bg-/, /\btext-text-/, /\bflex(?:-col)?\b/],
    minScore: 3,
  },
  {
    name: "TabBar",
    required: [/\bflex\b/, /\bborder-b\b/, /\b(gap|space-x)-\d+\b/],
    optional: [/\btext-text-/, /\bpx-\d+\b/, /\bpy-\d+\b/],
    minScore: 3,
  },
  {
    name: "Tabs",
    required: [/\binline-flex\b/, /\bgap-\d+\b/],
    optional: [/\brounded\b/, /\bpx-\d+\b/],
    minScore: 2,
  },
  {
    name: "Card",
    required: [/\brounded(-\w+)?\b/, /\b(border|shadow)\b/],
    optional: [/\bp-\d+\b/, /\bbg-bg-/],
    minScore: 2,
  },
  {
    name: "Badge",
    required: [
      /\b(inline-flex|inline-block)\b/,
      /\brounded-full\b/,
      /\b(px-\d+|py-\d+)\b/,
    ],
    optional: [/\btext-xs\b/, /\bfont-(medium|semibold)\b/],
    minScore: 3,
  },
]

const TONE_PATTERNS: Array<{ tone: ToneVariant; rx: RegExp }> = [
  { tone: "success", rx: /\b(bg|text|border)-(success|green|emerald)/i },
  { tone: "warning", rx: /\b(bg|text|border)-(warning|amber|yellow)/i },
  { tone: "error", rx: /\b(bg|text|border)-(error|red|rose|danger)/i },
  { tone: "info", rx: /\b(bg|text|border)-(info|blue|sky|cyan)/i },
]

const DIV_RE = /<div\s+([^>]*)>/g
const CLASSNAME_RE = /className=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})/

interface RawMatch {
  shape: DSCandidate["shape"]
  classNames: string
  tone: ToneVariant
  complexity: number
  artifact: RankerArtifact
  snippet: string
}

export class DSCandidateRanker {
  private readonly topN: number
  private readonly samplesPerCandidate: number

  constructor(opts: DSCandidateRankerOptions = {}) {
    this.topN = opts.topN ?? 3
    this.samplesPerCandidate = opts.samplesPerCandidate ?? 3
  }

  /**
   * Rank candidates from a collection of artifacts.
   *
   * The artifact list is treated as already filtered (caller is expected to
   * have skipped non-TSX/JSX files). We do not crawl the filesystem here —
   * see `loadArtifactsFromRunDirs` for the helper that does.
   */
  rank(artifacts: RankerArtifact[]): DSCandidate[] {
    const matches: RawMatch[] = []
    for (const artifact of artifacts) {
      matches.push(...this.scanArtifact(artifact))
    }

    // Cluster by shape. Cross-repo and variant info aggregate across the
    // cluster so the dashboard does not need to re-aggregate.
    const buckets = new Map<DSCandidate["shape"], RawMatch[]>()
    for (const m of matches) {
      const list = buckets.get(m.shape) ?? []
      list.push(m)
      buckets.set(m.shape, list)
    }

    const candidates: DSCandidate[] = []
    for (const [shape, group] of buckets) {
      candidates.push(this.buildCandidate(shape, group))
    }

    return candidates
      .sort((a, b) => {
        if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences
        return a.name.localeCompare(b.name)
      })
      .slice(0, this.topN)
  }

  private scanArtifact(artifact: RankerArtifact): RawMatch[] {
    if (!isJsxSource(artifact.path)) return []
    const out: RawMatch[] = []
    let match: RegExpExecArray | null
    DIV_RE.lastIndex = 0
    while ((match = DIV_RE.exec(artifact.content)) !== null) {
      const attrs = match[1]
      const classes = extractClassName(attrs)
      if (!classes) continue
      const shape = classifyShape(classes)
      if (!shape) continue
      const tone = detectTone(classes)
      const complexity = countClassFragments(classes)
      const snippet = clampSnippet(
        artifact.content.slice(match.index, match.index + 160),
      )
      out.push({
        shape: shape.name,
        classNames: classes,
        tone,
        complexity,
        artifact,
        snippet,
      })
    }
    return out
  }

  private buildCandidate(
    shape: DSCandidate["shape"],
    group: RawMatch[],
  ): DSCandidate {
    const occurrences = group.length
    const projects = new Set(group.map((m) => m.artifact.projectId))
    const variants = uniqueTones(group.map((m) => m.tone))
    const samples = pickSamples(group, this.samplesPerCandidate)
    const avgComplexity =
      group.reduce((sum, m) => sum + m.complexity, 0) /
      Math.max(1, group.length)
    const effort: CandidateEffort =
      avgComplexity >= 6 ? "large" : avgComplexity >= 4 ? "medium" : "small"

    return {
      name: shape,
      shape,
      occurrences,
      crossRepoCount: projects.size,
      variants,
      samples,
      effort,
      rationale: explainCandidate({
        shape,
        occurrences,
        projects: projects.size,
        variants,
        effort,
      }),
    }
  }
}

/**
 * Convenience loader — walks a list of runDir paths and returns every
 * `.tsx`/`.jsx` artifact found under `<runDir>/files/`. Used by the API
 * route to feed `rank()` from disk-persisted artifacts without forcing the
 * caller to know the on-disk layout.
 *
 * Failures (missing dir, unreadable file) are SILENTLY skipped — the
 * ranker is a best-effort surface and one broken run should not blank the
 * whole panel.
 */
export async function loadArtifactsFromRunDirs(
  runDirs: Array<{ runId: string; projectId: string; runDir: string }>,
): Promise<RankerArtifact[]> {
  const out: RankerArtifact[] = []
  for (const { runId, projectId, runDir } of runDirs) {
    const filesRoot = join(runDir, "files")
    try {
      const found = await walk(filesRoot)
      for (const file of found) {
        if (!isJsxSource(file)) continue
        try {
          const content = await readFile(file, "utf8")
          out.push({
            runId,
            projectId,
            path: file.slice(filesRoot.length + 1),
            content,
          })
        } catch {
          // skip unreadable file
        }
      }
    } catch {
      // skip runs whose files dir is missing
    }
  }
  return out
}

async function walk(root: string): Promise<string[]> {
  const out: string[] = []
  async function visit(dir: string): Promise<void> {
    let names: string[]
    try {
      names = await readdir(dir)
    } catch {
      return
    }
    for (const name of names) {
      const full = join(dir, name)
      let entry: Awaited<ReturnType<typeof stat>>
      try {
        entry = await stat(full)
      } catch {
        continue
      }
      if (entry.isDirectory()) {
        await visit(full)
      } else if (entry.isFile()) {
        out.push(full)
      }
    }
  }
  try {
    await stat(root)
  } catch {
    return out
  }
  await visit(root)
  return out
}

// ──────────────────────────────────────────────────────────────────────────
// Internals (exported for unit-test reach where it materially helps)
// ──────────────────────────────────────────────────────────────────────────

export function isJsxSource(path: string): boolean {
  return /\.(tsx|jsx)$/i.test(path)
}

export function extractClassName(attrs: string): string | null {
  const m = attrs.match(CLASSNAME_RE)
  if (!m) return null
  return (m[1] ?? m[2] ?? m[3] ?? "").trim() || null
}

export function classifyShape(classes: string): ShapeRule | null {
  for (const rule of SHAPE_RULES) {
    let score = 0
    let allRequired = true
    for (const rx of rule.required) {
      if (rx.test(classes)) score += 1
      else allRequired = false
    }
    if (!allRequired) continue
    for (const rx of rule.optional) {
      if (rx.test(classes)) score += 1
    }
    if (score >= rule.minScore) return rule
  }
  return null
}

export function detectTone(classes: string): ToneVariant {
  for (const { tone, rx } of TONE_PATTERNS) {
    if (rx.test(classes)) return tone
  }
  return "neutral"
}

export function countClassFragments(classes: string): number {
  return classes.split(/\s+/).filter(Boolean).length
}

function clampSnippet(raw: string): string {
  const oneLine = raw.replace(/\s+/g, " ").trim()
  if (oneLine.length <= 120) return oneLine
  return `${oneLine.slice(0, 117)}...`
}

function uniqueTones(tones: ToneVariant[]): ToneVariant[] {
  const order: ToneVariant[] = ["success", "warning", "error", "info", "neutral"]
  const seen = new Set(tones)
  return order.filter((t) => seen.has(t))
}

function pickSamples(group: RawMatch[], cap: number): CandidateSample[] {
  // Prefer one sample per distinct tone, then top up by occurrence order.
  const out: CandidateSample[] = []
  const seenTone = new Set<ToneVariant>()
  for (const m of group) {
    if (seenTone.has(m.tone)) continue
    seenTone.add(m.tone)
    out.push(toSample(m))
    if (out.length >= cap) return out
  }
  for (const m of group) {
    if (out.find((s) => s.path === m.artifact.path && s.snippet === m.snippet)) {
      continue
    }
    out.push(toSample(m))
    if (out.length >= cap) break
  }
  return out
}

function toSample(m: RawMatch): CandidateSample {
  return {
    runId: m.artifact.runId,
    projectId: m.artifact.projectId,
    path: m.artifact.path,
    snippet: m.snippet,
  }
}

function explainCandidate(info: {
  shape: DSCandidate["shape"]
  occurrences: number
  projects: number
  variants: ToneVariant[]
  effort: CandidateEffort
}): string {
  const variantPart =
    info.variants.length > 1
      ? `${info.variants.length} tone variants observed`
      : "single tone observed"
  return (
    `Inline ${info.shape}-shaped div appeared ${info.occurrences}× ` +
    `across ${info.projects} project(s); ${variantPart}; ` +
    `effort to add to @dash/ui: ${info.effort}.`
  )
}
