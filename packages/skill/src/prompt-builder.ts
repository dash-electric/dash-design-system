/**
 * Composes captured project context + Dash AI rules into a single AI prompt
 * append.
 *
 * v1 (legacy) — `buildPrompt` truncates rules at 8K chars, glossary deferred.
 * v2 — priority-pinned blocks + per-repo scoped section + compressed global
 *      rules summary. Default for `buildPrompt` when `schemaVersion: 2` is
 *      requested via opts. v1 path preserved for backward compat.
 */
import type { DashInfoSnapshot } from "./info-collector.js"
import {
  parseRules,
  extractLineRange,
  type ParsedRules,
  type RuleSection,
} from "./lib/rules-parser.js"

export type PromptInputs = {
  snapshot: DashInfoSnapshot | null
  aiRules: string | null
  glossary: Record<string, string> | null
}

export type BuiltPrompt = {
  systemAppend: string
  metadata: {
    schemaVersion: number
    builtAt: string
    sources: string[]
    notes?: string
    /** v2-only: which pinned blocks were resolved into the prompt. */
    pinned?: string[]
    /** v2-only: detected repo stack used to scope per-repo section. */
    detectedRepoStack?: string | null
    /** v2-only: rendered char budget (systemAppend.length). */
    charCount?: number
  }
}

export type BuildPromptOpts = {
  /** Force a schema version. Defaults to 2. */
  version?: 1 | 2
  /** Hard char budget for v2. Default 7000. */
  charBudget?: number
}

// ---------------------------------------------------------------------------
// Shared rendering helpers (kept from v1 — DO NOT clobber, user-modified)
// ---------------------------------------------------------------------------

const RULES_MAX_CHARS_V1 = 8000

export function renderSnapshotBlock(snap: DashInfoSnapshot): string {
  const installedCount = snap.dash.installedItems.length
  const stackParts = [
    snap.project.framework,
    snap.project.typescript ? "typescript" : "javascript",
    snap.project.packageManager,
  ]
  const lines = [
    `- project root: ${snap.project.rootPath}`,
    `- framework: ${snap.project.framework}`,
    `- stack: ${stackParts.join(" / ")}`,
    `- installed @dash components: ${installedCount}`,
  ]
  if (snap.detectedRepoStack) {
    lines.push(`- detected repo stack: ${snap.detectedRepoStack}`)
  }
  if (installedCount > 0) {
    const preview = snap.dash.installedItems
      .slice(0, 10)
      .map((i) => `${i.name} (${i.type})`)
      .join(", ")
    const suffix = installedCount > 10 ? `, +${installedCount - 10} more` : ""
    lines.push(`- components: ${preview}${suffix}`)
  }
  if (snap.customHooks.length > 0) {
    lines.push(`- custom hooks: ${snap.customHooks.slice(0, 12).join(", ")}`)
  }
  if (snap.apiBaseUrl) {
    lines.push(`- api base url: ${snap.apiBaseUrl}`)
  }
  return lines.join("\n")
}

export function truncateRules(rules: string): string {
  if (rules.length <= RULES_MAX_CHARS_V1) return rules
  return `${rules.slice(0, RULES_MAX_CHARS_V1)}\n\n[...truncated, original length ${rules.length} chars]`
}

// ---------------------------------------------------------------------------
// v1 — legacy
// ---------------------------------------------------------------------------

export function composeV1Prompt(inputs: PromptInputs): BuiltPrompt {
  const sources: string[] = []
  const parts: string[] = ["# Dash project context"]

  if (inputs.snapshot) {
    parts.push("", renderSnapshotBlock(inputs.snapshot))
    sources.push("dash-info")
  } else {
    parts.push(
      "",
      "no Dash context detected — running outside a Dash repo.",
    )
  }

  if (inputs.aiRules && inputs.aiRules.trim().length > 0) {
    parts.push("", "## Dash AI rules", "", truncateRules(inputs.aiRules))
    sources.push("dash-ai-rules")
  }

  const notes =
    inputs.glossary !== null
      ? "glossary input ignored in v1 (deferred to v2)"
      : "glossary injection deferred to v2"

  return {
    systemAppend: parts.join("\n"),
    metadata: {
      schemaVersion: 1,
      builtAt: new Date().toISOString(),
      sources,
      notes,
    },
  }
}

// ---------------------------------------------------------------------------
// v2 — priority-pinned + per-repo scoped + compressed
// ---------------------------------------------------------------------------

/**
 * Pinned blocks — ALWAYS included regardless of budget. Order matters: these
 * appear at the top of the prompt so the AI sees them first.
 *
 * `contentLines` matches the canonical `dash-ai-rules.md` line ranges per
 * the Skill v2 brief. Tolerant to drift: parser falls back to slug lookup
 * if the line range is empty.
 */
export type PinnedBlock = {
  id: string
  title: string
  contentLines: [number, number]
  /** Slug fallback if line range produces empty content. */
  fallbackSlug?: string
  rationale: string
}

export const PINNED_BLOCKS: PinnedBlock[] = [
  {
    id: "refuse-list",
    title: "Banned Imports (NEVER suggest these)",
    contentLines: [573, 612],
    fallbackSlug: "anti-patterns",
    rationale:
      "Per-repo banned libs — AI defaults to these without explicit refuse",
  },
  {
    id: "envelope-discriminator",
    title: "BE Envelope Discrimination",
    contentLines: [615, 642],
    fallbackSlug: "per-service-api-envelope-discrimination",
    rationale:
      "Critical BE pattern — wrong envelope = runtime crash",
  },
  {
    id: "audit-trail-mandatory",
    title: "Audit Trail Rule",
    contentLines: [833, 873],
    fallbackSlug: "audit-trail",
    rationale:
      "Legal/financial fields MUST log original + edited + editor + reason",
  },
  {
    id: "external-lib-policy",
    title: "External Library Policy",
    contentLines: [876, 924],
    fallbackSlug: "external-library-policy",
    rationale:
      "Pragmatic + wrapped approach — prevents AI defaulting to popular libs",
  },
]

const PER_REPO_PARENT_SLUG = "per-repo-stack-mandates"
const GLOBAL_SUMMARY_BULLETS = [
  "ALWAYS prefer `@dash/*` primitives over hand-rolled equivalents.",
  "REFUSE banned libs (see pinned list) — redirect to native useState / Jotai / Zustand per repo.",
  "Match the per-service API envelope EXACTLY — class name is NOT a signal (see pinned table).",
  "Audit log inserts go BEFORE the UPDATE on legal/financial fields, inside a transaction.",
  "External libs require: MIT/Apache/BSD-3, <30KB gz, ≤6mo maintained, wrapped via `src/lib-wrappers/`.",
  "Bahasa-first copy; voice = 'kamu' in portal-v2 unless a feature explicitly overrides to 'Anda'.",
  "OpenTofu (`tofu`) not Terraform. Cloud Run only (no K8s). Region `asia-southeast2`. Secrets via Secret Manager.",
  "State machines (Delivery 26 / Maintenance 9 / Repossession 7 / Vehicle 6×6 / Incident 4 / Order 5) NEVER bypass.",
]

function resolvePinnedBlock(
  block: PinnedBlock,
  parsed: ParsedRules,
): { title: string; body: string } | null {
  const [s, e] = block.contentLines
  let body = extractLineRange(parsed, s, e)
  if (!body.trim() && block.fallbackSlug) {
    const sec = parsed.byId.get(block.fallbackSlug)
    if (sec) body = sec.body
  }
  if (!body.trim()) return null
  return { title: block.title, body }
}

function renderPinnedBlocks(parsed: ParsedRules): {
  rendered: string
  resolvedIds: string[]
} {
  const chunks: string[] = ["## Pinned rules (must obey — never truncated)"]
  const resolvedIds: string[] = []
  for (const block of PINNED_BLOCKS) {
    const resolved = resolvePinnedBlock(block, parsed)
    if (!resolved) continue
    chunks.push(
      "",
      `### [PIN:${block.id}] ${resolved.title}`,
      "",
      resolved.body.trim(),
    )
    resolvedIds.push(block.id)
  }
  return { rendered: chunks.join("\n"), resolvedIds }
}

function renderPerRepoSection(
  parsed: ParsedRules,
  stack: string,
): string | null {
  const parent = parsed.byId.get(PER_REPO_PARENT_SLUG)
  if (!parent) return null
  const child = parent.children.find((c: RuleSection) => c.id === stack)
  if (!child) return null
  return [
    `## Per-repo mandate — \`${stack}\``,
    "",
    child.body.trim(),
  ].join("\n")
}

function renderGlobalSummary(): string {
  return [
    "## Global rules summary",
    "",
    ...GLOBAL_SUMMARY_BULLETS.map((b) => `- ${b}`),
  ].join("\n")
}

function renderGlossaryNote(
  glossary: Record<string, string> | null,
): string | null {
  if (!glossary || Object.keys(glossary).length === 0) return null
  // Glossary still NOT injected (v1 convention preserved). Just note the count.
  return `## Glossary\n\n[glossary input received — ${Object.keys(glossary).length} entries — injection deferred; surface terms only when relevant]`
}

export function composeV2Prompt(
  inputs: PromptInputs,
  opts: { charBudget?: number } = {},
): BuiltPrompt {
  const charBudget = opts.charBudget ?? 7000
  const sources: string[] = []
  const sections: string[] = ["# Dash project context"]
  const pinnedIds: string[] = []
  let detectedStack: string | null = null

  // 1. Snapshot (cheap, always include)
  if (inputs.snapshot) {
    sections.push("", renderSnapshotBlock(inputs.snapshot))
    sources.push("dash-info")
    detectedStack = inputs.snapshot.detectedRepoStack ?? null
  } else {
    sections.push("", "no Dash context detected — running outside a Dash repo.")
  }

  // 2. Pinned blocks (ALWAYS — never truncated)
  if (inputs.aiRules && inputs.aiRules.trim().length > 0) {
    const parsed = parseRules(inputs.aiRules)
    const { rendered, resolvedIds } = renderPinnedBlocks(parsed)
    if (resolvedIds.length > 0) {
      sections.push("", rendered)
      sources.push("dash-ai-rules:pinned")
      pinnedIds.push(...resolvedIds)
    }

    // 3. Per-repo scoped section
    if (detectedStack) {
      const repoSection = renderPerRepoSection(parsed, detectedStack)
      if (repoSection) {
        sections.push("", repoSection)
        sources.push("dash-ai-rules:repo-scoped")
      }
    }
  }

  // 4. Global rules summary (compressed)
  sections.push("", renderGlobalSummary())
  if (inputs.aiRules && inputs.aiRules.trim().length > 0) {
    sources.push("dash-ai-rules:summary")
  }

  // 5. Glossary note (still deferred from real injection per v1 convention)
  const glossaryNote = renderGlossaryNote(inputs.glossary)
  if (glossaryNote) {
    sections.push("", glossaryNote)
  }

  // Budget guard. Drop summary FIRST when over (pinned + scoped have priority).
  let systemAppend = sections.join("\n")
  let overflowNote: string | null = null
  if (systemAppend.length > charBudget) {
    // Remove the global summary block (always at the trailing tail, before optional glossary)
    const idx = sections.findIndex((s) => s.startsWith("## Global rules summary"))
    if (idx >= 0) {
      sections.splice(idx, 1)
      // Also drop the leading blank inserted right before it
      if (idx > 0 && sections[idx - 1] === "") sections.splice(idx - 1, 1)
      overflowNote = "dropped global summary to stay under budget"
      systemAppend = sections.join("\n")
    }
  }

  const notes: string[] = []
  if (inputs.glossary !== null) {
    notes.push("glossary input received; injection deferred (terms surfaced only when relevant)")
  } else {
    notes.push("no glossary input")
  }
  if (overflowNote) notes.push(overflowNote)

  return {
    systemAppend,
    metadata: {
      schemaVersion: 2,
      builtAt: new Date().toISOString(),
      sources,
      notes: notes.join("; "),
      pinned: pinnedIds,
      detectedRepoStack: detectedStack,
      charCount: systemAppend.length,
    },
  }
}

// ---------------------------------------------------------------------------
// Public dispatcher — defaults to v2; v1 reachable via opts.version === 1.
// ---------------------------------------------------------------------------

export function buildPrompt(
  inputs: PromptInputs,
  opts: BuildPromptOpts = {},
): BuiltPrompt {
  const version = opts.version ?? 2
  if (version === 1) return composeV1Prompt(inputs)
  return composeV2Prompt(inputs, { charBudget: opts.charBudget })
}
