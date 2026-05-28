/**
 * Composes the generation system prompt from PRD eval + design context + Skill v4 context.
 *
 * Output format is a strict markdown contract — the model is told exactly how to
 * frame each generated file (```<lang> [path/to/file]```) so `response-parser`
 * can extract files deterministically.
 */

import type {
  DashTheme,
  DesignContext,
  ExistingFileContent,
  ExistingFilesContext,
  IntakeContext,
  PRDEval,
  RepoContextPack,
  RepoIntrospection,
  RepoSurface,
  SkillContext,
} from "./types.js"
import type { EndpointEntry } from "../intake/be-endpoint-catalog.js"
import type { TableSchema } from "../intake/db-schema-reader.js"
import { describeOutputMode, type OutputMode } from "./output-mode-detector.js"

export interface ComposeInput {
  prd: PRDEval
  design: DesignContext
  skill: SkillContext
  repoContext: RepoContextPack
  /** Optional Layer A repo introspection (real Prisma/enums/endpoints/components). */
  introspection?: RepoIntrospection | null
  /** Optional Phase C — existing files + path resolutions for the user's
   *  prompt. S2B consumes this to inject `## CURRENT FILE STATE` and switch
   *  the model into patch/edit mode instead of greenfield. */
  existingFiles?: ExistingFilesContext | null
  /** Sprint 2B — output mode hint (new-file / patch / mixed). When omitted,
   *  defaults to "mixed" so the model can decide per file based on whether
   *  the target path appears in CURRENT FILE STATE. */
  outputMode?: OutputMode
  /** BE-aware intake context, passed through from the orchestrator. When
   *  present, the composer injects scenario-aware BE/DB blocks + audit-trail
   *  block. Absent = legacy callers (tests, direct chain invocation) — the
   *  composer falls back to today's behaviour. */
  intake?: IntakeContext
}

/** Top-level banned imports embedded verbatim in the system prompt. */
export const BANNED_IMPORTS: readonly string[] = [
  "react-hook-form",
  "zod",
  "@hookform/resolvers",
  "@tanstack/react-query",
  "swr",
] as const

interface InferRepoContextInput {
  prompt: string
  selectedRepo?: string | null
  detectedRepo?: string | null
  detectedLayer?: "ride" | "logistic" | "shared" | null
  repoPath?: string | null
}

function normalizeSignal(...values: Array<string | null | undefined>): string {
  return values.filter(Boolean).join(" ").toLowerCase()
}

function trellisSlug(signal: string): `trellis-${string}` | null {
  const match = signal.match(/\btrellis[-_/]([a-z0-9-]+)\b/i)
  if (!match?.[1]) return null
  return `trellis-${match[1]}` as `trellis-${string}`
}

function inferRepoSlug(signal: string): RepoSurface {
  const trellis = trellisSlug(signal)
  if (trellis) return trellis
  if (signal.includes("portal-v2") || signal.includes("next-portal-v2")) return "portal-v2"
  if (signal.includes("backoffice") || signal.includes("next-backoffice")) return "backoffice"
  if (signal.includes("basecamp")) return "basecamp"
  if (signal.includes("react-fleet") || signal.includes("fleet")) return "react-fleet"
  if (signal.includes("dash-travel-fe") || signal.includes("travel")) return "dash-travel-fe"
  if (signal.includes("dash-marketplace") || signal.includes("marketplace")) return "dash-marketplace"
  if (signal.includes("shared")) return "shared"
  return "unknown"
}

function themeForRepo(repoSlug: RepoSurface, detectedLayer?: "ride" | "logistic" | "shared" | null): DashTheme {
  if (repoSlug.startsWith("trellis-")) return repoSlug as `trellis-${string}`
  if (repoSlug === "react-fleet") return "logistic"
  if (repoSlug === "dash-travel-fe") return "travel"
  if (repoSlug === "dash-marketplace") return "marketplace"
  if (repoSlug === "backoffice" || repoSlug === "portal-v2" || repoSlug === "basecamp") return "ride"
  return detectedLayer ?? "shared"
}

function audienceForRepo(repoSlug: RepoSurface): string {
  if (repoSlug === "backoffice" || repoSlug === "basecamp") return "internal ops/backoffice users"
  if (repoSlug === "portal-v2") return "client/web portal users"
  if (repoSlug === "react-fleet") return "logistics fleet operations users"
  if (repoSlug === "dash-travel-fe") return "travel product users"
  if (repoSlug === "dash-marketplace") return "marketplace product users"
  if (repoSlug.startsWith("trellis-")) return "tenant-specific Trellis users"
  return "shared Dash users"
}

function surfaceForRepo(repoSlug: RepoSurface): string {
  if (repoSlug === "unknown") return "unresolved Dash surface"
  if (repoSlug === "shared") return "shared Dash design-system surface"
  return repoSlug
}

function asksForNavOrRoute(prompt: string): boolean {
  return /\b(page|screen|tab|nav|navigation|menu|sidebar|route|reachable|link|entry)\b/i.test(prompt)
}

interface RepoShellProfile {
  defaultRoute: string
  navItems: string[]
  routeHints: Array<{
    route: string
    navLabel: string
    keywords: string[]
  }>
}

const REPO_SHELL_PROFILES: Partial<Record<RepoSurface, RepoShellProfile>> = {
  "portal-v2": {
    defaultRoute: "/en/deliveries",
    navItems: ["Home", "Trips", "Payments", "Support", "Users", "Billing"],
    routeHints: [
      { route: "/en/deliveries", navLabel: "Trips", keywords: ["delivery", "deliveries", "trip", "trips", "ride", "order"] },
      { route: "/en/billing", navLabel: "Billing", keywords: ["billing", "payment", "invoice", "statement", "tagihan"] },
      { route: "/en/users", navLabel: "Users", keywords: ["user", "users", "staff", "member", "admin"] },
      { route: "/en/support", navLabel: "Support", keywords: ["support", "ticket", "help", "issue"] },
    ],
  },
  backoffice: {
    defaultRoute: "/delivery",
    navItems: ["Dashboard", "Mitra", "Orders", "Payroll", "Audit", "Broadcast", "Pitstop"],
    routeHints: [
      { route: "/delivery", navLabel: "Orders", keywords: ["delivery", "deliveries", "order", "orders", "ride", "trip"] },
      { route: "/provider", navLabel: "Mitra", keywords: ["mitra", "provider", "driver", "courier", "performance"] },
      { route: "/payroll", navLabel: "Payroll", keywords: ["payroll", "payout", "salary", "komisi", "finance"] },
      { route: "/broadcast", navLabel: "Broadcast", keywords: ["broadcast", "campaign", "announcement", "message"] },
      { route: "/pitstop", navLabel: "Pitstop", keywords: ["pitstop", "maintenance", "vehicle", "inspection"] },
      { route: "/audit", navLabel: "Audit", keywords: ["audit", "compliance", "kyc", "approval", "review"] },
    ],
  },
  basecamp: {
    defaultRoute: "/",
    navItems: ["Dashboard", "Tasks", "Projects", "Reports"],
    routeHints: [
      { route: "/tasks", navLabel: "Tasks", keywords: ["task", "tasks", "work"] },
      { route: "/projects", navLabel: "Projects", keywords: ["project", "projects"] },
      { route: "/reports", navLabel: "Reports", keywords: ["report", "reports", "analytics"] },
    ],
  },
  "react-fleet": {
    defaultRoute: "/",
    navItems: ["Fleet", "Routes", "Drivers", "Maintenance"],
    routeHints: [
      { route: "/routes", navLabel: "Routes", keywords: ["route", "routes", "trip", "dispatch"] },
      { route: "/drivers", navLabel: "Drivers", keywords: ["driver", "drivers", "courier"] },
      { route: "/maintenance", navLabel: "Maintenance", keywords: ["maintenance", "vehicle", "inspection"] },
    ],
  },
}

function shellProfileFor(repoSlug: RepoSurface): RepoShellProfile | null {
  return REPO_SHELL_PROFILES[repoSlug] ?? null
}

function inferTargetRoute(
  prompt: string,
  profile: RepoShellProfile | null,
): { targetRoute: string | null; targetNavLabel: string | null } {
  if (!profile) return { targetRoute: null, targetNavLabel: null }
  const signal = prompt.toLowerCase()
  const matched = profile.routeHints.find((hint) =>
    hint.keywords.some((keyword) => signal.includes(keyword)),
  )
  if (matched) {
    return { targetRoute: matched.route, targetNavLabel: matched.navLabel }
  }
  return {
    targetRoute: profile.defaultRoute,
    targetNavLabel: profile.navItems[0] ?? null,
  }
}

export function inferRepoContextPack(input: InferRepoContextInput): RepoContextPack {
  const selectedRepo = input.selectedRepo ?? input.detectedRepo ?? null
  const signal = normalizeSignal(selectedRepo, input.detectedRepo, input.repoPath, input.prompt)
  const repoSlug = inferRepoSlug(signal)
  const theme = themeForRepo(repoSlug, input.detectedLayer)
  const requiresNavOrRoute = asksForNavOrRoute(input.prompt)
  const existingShell = repoSlug !== "unknown" || Boolean(selectedRepo)
  const shellProfile = shellProfileFor(repoSlug)
  const { targetRoute, targetNavLabel } = inferTargetRoute(input.prompt, shellProfile)
  const ambiguity =
    repoSlug === "unknown"
      ? "Repo/theme could not be resolved from selected repo or prompt; defaulting to shared."
      : null
  const routeLine = targetRoute
    ? `Target route: ${targetRoute}${targetNavLabel ? ` via "${targetNavLabel}" navigation` : ""}.`
    : "Target route could not be inferred; keep route/nav changes explicit in TODOs."
  const integrationContract = existingShell
    ? `${routeLine} Preserve the selected repo shell and add only the smallest page/nav/block changes needed for the prompt.`
    : `${routeLine} No selected repo shell is available; keep production files scoped and surface ambiguity.`

  return {
    selectedRepo,
    repoSlug,
    theme,
    audience: audienceForRepo(repoSlug),
    surface: surfaceForRepo(repoSlug),
    existingShell,
    requiresNavOrRoute,
    defaultRoute: shellProfile?.defaultRoute ?? null,
    targetRoute,
    targetNavLabel,
    existingNavItems: shellProfile?.navItems ?? [],
    routeRequirement: requiresNavOrRoute
      ? `Include the production route/page file and the matching navigation, tab, menu, or sidebar entry in the existing repo shell. ${routeLine} If the exact nav registry is unknown, create a clearly marked TODO/gap instead of a floating standalone page.`
      : null,
    integrationContract,
    dataPolicy: "mock-data-only",
    ambiguity,
  }
}

function renderRepoContext(ctx: RepoContextPack): string {
  return [
    `Selected repo: ${ctx.selectedRepo ?? "(none provided)"}`,
    `Inferred surface: ${ctx.surface}`,
    `Inferred audience: ${ctx.audience}`,
    `Theme metadata: ${ctx.theme}`,
    `Known shell nav: ${ctx.existingNavItems.length ? ctx.existingNavItems.join(", ") : "(unknown)"}`,
    `Default route: ${ctx.defaultRoute ?? "(unknown)"}`,
    `Target route: ${ctx.targetRoute ?? "(not inferred)"}`,
    `Target nav label: ${ctx.targetNavLabel ?? "(not inferred)"}`,
    `Existing shell constraint: ${ctx.existingShell ? "Integrate into the selected repo's existing app shell, route conventions, layout, and navigation. Do not generate a standalone app except for preview.tsx." : "No concrete repo shell was selected; keep production files narrowly scoped and surface repo ambiguity in the explanation."}`,
    `Integration contract: ${ctx.integrationContract}`,
    `P0 data policy: ${ctx.dataPolicy}. Use inline mock data / fixtures only; do not wire live endpoints, database schemas, or real fetch integration. If the prompt supplies an explicit API contract, document it as a TODO/gap and keep a mock adapter for generated code.`,
    ctx.requiresNavOrRoute && ctx.routeRequirement
      ? `Route/nav requirement: ${ctx.routeRequirement}`
      : "Route/nav requirement: Not requested by prompt; avoid unrelated routing or navigation changes.",
    ctx.ambiguity ? `Context ambiguity: ${ctx.ambiguity}` : "Context ambiguity: none inferred.",
  ].join("\n")
}

function hasAnyIntrospection(intr: RepoIntrospection | null | undefined): intr is RepoIntrospection {
  if (!intr) return false
  return (
    intr.prismaModels.length > 0 ||
    intr.prismaEnums.length > 0 ||
    intr.feEnums.length > 0 ||
    intr.endpointSignatures.length > 0 ||
    intr.reusableComponents.length > 0
  )
}

function renderIntrospection(intr: RepoIntrospection): string {
  const lines: string[] = []
  lines.push(`Source repo slug: ${intr.repoSlug}`)
  lines.push(`Parsed sources: ${intr.sources.length}. Missing sources: ${intr.missingSources.length}.`)

  // Prisma models (top 30 inline with field name+type, rest as name+count)
  if (intr.prismaModels.length > 0) {
    lines.push("")
    lines.push(`Real Prisma models for repo ${intr.repoSlug}:`)
    const inlineLimit = 30
    const head = intr.prismaModels.slice(0, inlineLimit)
    const tail = intr.prismaModels.slice(inlineLimit)
    for (const model of head) {
      const fieldSummary = model.fields
        .slice(0, 25)
        .map((f) => `${f.name}: ${f.type}${f.isList ? "[]" : ""}${f.optional ? "?" : ""}`)
        .join(", ")
      const extra = model.fields.length > 25 ? ` …(+${model.fields.length - 25} more fields)` : ""
      lines.push(`- ${model.name} (${model.fields.length} fields): ${fieldSummary}${extra}`)
    }
    for (const model of tail) {
      lines.push(`- ${model.name} (${model.fields.length} fields)`)
    }
  }

  // Prisma enums
  if (intr.prismaEnums.length > 0) {
    lines.push("")
    lines.push("Real Prisma enums:")
    for (const e of intr.prismaEnums) {
      lines.push(`- ${e.name}: ${e.values.join(", ")}`)
    }
  }

  // FE enums
  if (intr.feEnums.length > 0) {
    lines.push("")
    lines.push("Real FE enums:")
    for (const e of intr.feEnums) {
      const vals = e.values.slice(0, 30).join(", ")
      const more = e.values.length > 30 ? ` …(+${e.values.length - 30} more)` : ""
      lines.push(`- ${e.name}: ${vals}${more}`)
    }
  }

  // Endpoints (cap rendered to 50 most relevant — keep prompt budget)
  if (intr.endpointSignatures.length > 0) {
    lines.push("")
    lines.push("Real existing endpoints (subset):")
    const cap = 50
    for (const e of intr.endpointSignatures.slice(0, cap)) {
      lines.push(`- ${e.method} ${e.path} → ${e.functionName}(...)`)
    }
    if (intr.endpointSignatures.length > cap) {
      lines.push(`- …(+${intr.endpointSignatures.length - cap} more endpoint signatures truncated)`)
    }
  }

  // Components (cap rendered to 50)
  if (intr.reusableComponents.length > 0) {
    lines.push("")
    lines.push("Reusable existing components (consider before creating new):")
    const cap = 50
    for (const c of intr.reusableComponents.slice(0, cap)) {
      lines.push(`- ${c.name} (import: ${c.importPath})`)
    }
    if (intr.reusableComponents.length > cap) {
      lines.push(`- …(+${intr.reusableComponents.length - cap} more components truncated)`)
    }
  }

  lines.push("")
  lines.push(
    "WHEN generating code, use these EXACT field names + enum values + import paths from above. Do NOT invent alternates. If you need a field/enum/endpoint not listed, mark it as TODO and explain why it's missing.",
  )
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Sprint 2B — CURRENT FILE STATE renderer + output-mode-aware fence helpers
// ---------------------------------------------------------------------------

function hasAnyExistingFiles(ctx: ExistingFilesContext | null | undefined): ctx is ExistingFilesContext {
  if (!ctx) return false
  return Array.isArray(ctx.files) && ctx.files.length > 0
}

/** Prepend line numbers — helps the model anchor unified-diff hunks. */
function numberLines(content: string): string {
  const lines = content.split("\n")
  const width = String(lines.length).length
  return lines
    .map((line, idx) => `${String(idx + 1).padStart(width, " ")}\t${line}`)
    .join("\n")
}

function renderExistingFile(file: ExistingFileContent): string {
  const lang = file.language || "text"
  const truncated = file.truncated ? "yes" : "no"
  return [
    `File: ${file.filePath}`,
    `Language: ${lang}`,
    `Size: ${file.fullSize} bytes`,
    `Content (truncated? ${truncated}):`,
    "```" + lang,
    numberLines(file.content),
    "```",
  ].join("\n")
}

function renderExistingFiles(ctx: ExistingFilesContext): string {
  const lines: string[] = []
  lines.push(
    `Path resolver surfaced ${ctx.files.length} existing file(s) from the selected repo. These are the REAL current contents on disk.`,
    "",
    "RULES:",
    "- If you modify any file listed below, you MUST output it as a PATCH (mode=patch) — NOT a full file body.",
    "- The unified-diff hunk MUST match the surrounding context (the numbered lines above show the exact current state).",
    "- Do NOT rewrite or recreate these files from scratch — that loses unrelated code.",
    "",
  )
  if (ctx.resolutions.length > 0) {
    lines.push("Path resolutions (sorted by confidence):")
    for (const r of ctx.resolutions.slice(0, 10)) {
      lines.push(
        `- ${r.filePath} (route ${r.route}, confidence ${r.confidence.toFixed(2)}): ${r.reason}`,
      )
    }
    lines.push("")
  }
  for (const file of ctx.files) {
    lines.push(renderExistingFile(file))
    lines.push("")
  }
  return lines.join("\n").trimEnd()
}

// ---------------------------------------------------------------------------
// Intake renderers — BE catalog summary + DB tables + scenario hint + audit
// trail block. Render only what matters for the detected scenario so prompt
// budget stays tight on FE-only changes.
// ---------------------------------------------------------------------------

function renderEndpointList(endpoints: EndpointEntry[], cap = 25): string[] {
  const lines: string[] = []
  for (const ep of endpoints.slice(0, cap)) {
    lines.push(`- ${ep.method} ${ep.path}  →  ${ep.handlerExport}() (${ep.framework}, ${ep.filePath})`)
  }
  if (endpoints.length > cap) {
    lines.push(`- …(+${endpoints.length - cap} more endpoints truncated)`)
  }
  return lines
}

function renderTableList(tables: TableSchema[], cap = 20): string[] {
  const lines: string[] = []
  for (const t of tables.slice(0, cap)) {
    const cols = t.columns
      .slice(0, 12)
      .map((c) => `${c.name}: ${c.type}${c.nullable ? "?" : ""}`)
      .join(", ")
    const extra = t.columns.length > 12 ? ` …(+${t.columns.length - 12} more cols)` : ""
    lines.push(`- ${t.name} (${t.source}): ${cols}${extra}`)
  }
  if (tables.length > cap) {
    lines.push(`- …(+${tables.length - cap} more tables truncated)`)
  }
  return lines
}

function renderIntakeBlocks(intake: IntakeContext): string[] {
  const scenario = intake.classification.scenario
  const lines: string[] = []
  lines.push(`Detected scenario: ${scenario} (confidence ${intake.classification.confidence.toFixed(2)}).`)
  lines.push(`Reasoning: ${intake.classification.reasoning}`)
  lines.push("")

  // Affected files surfaced by the classifier — always render when present so
  // the model knows which paths are in play (regardless of scenario).
  const aff = intake.classification.affectedFiles
  if (aff) {
    const feLines = aff.fe.length > 0 ? aff.fe.map((p) => `  - ${p}`).join("\n") : "  - (none)"
    const beLines = aff.be.length > 0 ? aff.be.map((p) => `  - ${p}`).join("\n") : "  - (none)"
    const dbLines = aff.db.length > 0 ? aff.db.map((p) => `  - ${p}`).join("\n") : "  - (none)"
    lines.push("Affected files (per classifier):")
    lines.push(`FE:\n${feLines}`)
    lines.push(`BE:\n${beLines}`)
    lines.push(`DB:\n${dbLines}`)
    lines.push("")
  }

  switch (scenario) {
    case "fe_only":
      lines.push(
        "BE/DB context intentionally omitted — pure FE change. Do not add fetch calls, new endpoints, or schema migrations.",
      )
      break
    case "update_existing": {
      const matchedBe = filterEndpointsByAffected(intake)
      if (matchedBe.length > 0) {
        lines.push("Existing endpoints relevant to this update (use the SAME handler signatures, do NOT invent new ones):")
        lines.push(...renderEndpointList(matchedBe))
        lines.push("")
      }
      const matchedDb = filterTablesByAffected(intake)
      if (matchedDb.length > 0) {
        lines.push("Existing tables relevant to this update (use the SAME column names, do NOT add fields silently):")
        lines.push(...renderTableList(matchedDb))
        lines.push("")
      }
      break
    }
    case "extend_fe_be": {
      lines.push(
        `Full BE catalog (${intake.beCatalog.totalEndpoints} endpoints, framework=${intake.beCatalog.framework}). A NEW endpoint is expected — do NOT duplicate paths below.`,
      )
      if (intake.beCatalog.endpoints.length > 0) {
        lines.push(...renderEndpointList(intake.beCatalog.endpoints))
        lines.push("")
      }
      break
    }
    case "extend_fe_be_db": {
      lines.push(
        `Full BE catalog (${intake.beCatalog.totalEndpoints} endpoints, framework=${intake.beCatalog.framework}).`,
      )
      if (intake.beCatalog.endpoints.length > 0) {
        lines.push(...renderEndpointList(intake.beCatalog.endpoints))
        lines.push("")
      }
      lines.push(
        `Full DB catalog (${intake.dbCatalog.tables.length} tables, source=${intake.dbCatalog.source}). New schema additions are expected — surface the migration as a TODO or generate a Prisma/Drizzle/SQL stub.`,
      )
      if (intake.dbCatalog.tables.length > 0) {
        lines.push(...renderTableList(intake.dbCatalog.tables))
        lines.push("")
      }
      break
    }
    case "new_product": {
      lines.push(
        "EXISTING SURFACE — DO NOT DUPLICATE. The catalogs below represent endpoints and tables that already ship. If the new product needs similar primitives, reuse instead of re-creating.",
      )
      if (intake.beCatalog.endpoints.length > 0) {
        lines.push("Existing endpoints:")
        lines.push(...renderEndpointList(intake.beCatalog.endpoints, 40))
        lines.push("")
      }
      if (intake.dbCatalog.tables.length > 0) {
        lines.push("Existing tables:")
        lines.push(...renderTableList(intake.dbCatalog.tables, 40))
        lines.push("")
      }
      break
    }
    default:
      break
  }
  return lines
}

/** When the classifier surfaced affected paths, narrow the catalog to those. */
function filterEndpointsByAffected(intake: IntakeContext): EndpointEntry[] {
  const targets = new Set(intake.classification.affectedFiles?.be ?? [])
  if (targets.size === 0) return []
  return intake.beCatalog.endpoints.filter((e) => targets.has(e.filePath))
}

function filterTablesByAffected(intake: IntakeContext): TableSchema[] {
  const targets = new Set(intake.classification.affectedFiles?.db ?? [])
  if (targets.size === 0) return []
  return intake.dbCatalog.tables.filter((t) => targets.has(t.filePath))
}

function renderAuditTrailBlock(intake: IntakeContext): string[] {
  const at = intake.auditTrail
  if (!at.required) return []
  return [
    "AUDIT TRAIL REQUIRED (CR-3)",
    `Pattern : ${at.pattern}`,
    `Reason  : ${at.reason}`,
    `Fields to log: ${at.fieldsToLog.join(", ")}`,
    "",
    "You MUST reference a Dash DS audit-bearing block. Do NOT emit raw inline-edit.",
    "Options:",
    "  - import { InlineEditWithAudit } from '@dash/blocks/inline-edit-with-audit'",
    "  - import { ImageEditorWithAudit } from '@dash/blocks/image-editor-with-audit'",
    "Pair the edit with an audit_log insert in the same transaction (or TODO if the BE table is missing).",
  ]
}

/** Render the Sprint 2B output-format section. */
function renderOutputFormatSection(
  ctx: ComposeInput,
  hasExisting: boolean,
  outputMode: OutputMode,
): string[] {
  const lines: string[] = []
  lines.push(
    "Output format: for EACH file, choose either NEW-FILE mode or PATCH mode and use the matching fence header.",
    "",
    "NEW-FILE mode — use when creating a brand-new file (the path does NOT appear in CURRENT FILE STATE):",
    "",
    "```mode=new-file [path/to/file.tsx]",
    "// full file content",
    "```",
    "",
    "PATCH mode — REQUIRED when editing a file listed in CURRENT FILE STATE:",
    "",
    "```mode=patch [path/to/existing-file.tsx]",
    "@@ -45,3 +45,8 @@",
    "   existing line",
    "+  new line 1",
    "+  new line 2",
    "   existing line",
    "```",
    "",
    "Patch rules:",
    "- Emit a VALID unified diff. Each hunk header `@@ -<oldStart>,<oldLen> +<newStart>,<newLen> @@` MUST be present.",
    "- Context lines start with a single space, additions with `+`, deletions with `-`.",
    "- Multiple hunks per file are fine. Do NOT include a `diff --git` header — the path bracketed in the fence is the canonical signal.",
    "- The hunk context MUST match the CURRENT FILE STATE above (line numbers shown for reference only — the diff itself uses standard unified-diff offsets).",
    "",
    "Routing rules:",
    "- If a file appears in CURRENT FILE STATE, the output MUST be mode=patch.",
    "- If a file does NOT appear in CURRENT FILE STATE, default to mode=new-file unless the user explicitly says to edit it.",
    "- Legacy ```<lang> [path]``` fences without `mode=` are still accepted and treated as NEW-FILE for backward compatibility.",
    "",
    describeOutputMode(outputMode),
    "",
  )
  if (!hasExisting) {
    lines.push(
      "(No CURRENT FILE STATE was injected for this prompt — there are no existing files to patch. Default every block to mode=new-file.)",
      "",
    )
  }
  lines.push(
    "ALWAYS include a first file named `preview.tsx` when the request creates or changes UI.",
    "`preview.tsx` is the canvas artifact shown to the user before publish. It must be self-contained:",
    "- export a default React component;",
    "- use mock data inline;",
    "- avoid `@/`, repo aliases, app router imports, server components, filesystem imports, and external Dash repo components;",
    "- use only React plus plain CSS/Tailwind-like utility classes that can run in the sandbox;",
    "- use Dash semantic tokens / CSS variables only; do not use raw hex values in className, style objects, CSS strings, or token fallbacks;",
    "- mirror the generated route/content surface enough for product/design review, even if production files use registry components;",
    "- style all controls, tables, filters, cards, badges, and empty/loading/error states explicitly; never leave browser-default buttons, inputs, or tables in the preview;",
    ctx.repoContext.existingShell
      ? `- do not generate a standalone app shell, sidebar, topbar, or duplicate navigation in preview.tsx. Dash Build wraps preview.tsx with the selected repo shell (${ctx.repoContext.existingNavItems.join(", ") || "known repo nav"}), active nav "${ctx.repoContext.targetNavLabel ?? "the target nav"}", and route ${ctx.repoContext.targetRoute ?? ctx.repoContext.defaultRoute ?? "the target route"}. Render only the feature/page content that belongs inside that route slot.`
      : "- render a compact Dash shell around the generated surface and clearly label any repo ambiguity.",
    "",
    "Multiple files = multiple fenced blocks. After all code blocks, write a short",
    "plain-text explanation (2-5 sentences) covering: design decisions, any banned-",
    "import replacements, voice/audit considerations, and follow-up TODOs.",
    "",
    "If the prompt requires audit trail (legal/financial fields per CR-2), include",
    "an `audit_log` insert in the same transaction and surface a TODO if the backend",
    "table doesn't yet exist.",
  )
  return lines
}

export function composeSystemPrompt(ctx: ComposeInput): string {
  const cardinalBlock =
    ctx.design.cardinalRules.trim() ||
    `CR-1 Additive only · CR-2 Audit trail · CR-3 Banned libs (${BANNED_IMPORTS.join(
      ", ",
    )}) · CR-4 Voice formal Anda · CR-5 Tokens not hex · CR-6 Use registry · CR-7 dash sync · CR-8 Audit UI`

  const voiceBlock =
    ctx.design.voiceRules.trim() ||
    `Default mitra-facing voice = formal "Anda". No slang, no -in/-nya/-dong/-sih particles. Legal/financial flows MUST stay formal.`

  const skillBlock =
    ctx.skill.systemAppend.trim() ||
    `(No per-repo Skill context available — assume vanilla Next 14 App Router + TS unless prompt says otherwise.)`

  const prdBlock = ctx.prd.summary.trim() || "(prompt scope inferred from raw user input)"
  const designContractBlock =
    ctx.design.designContract.trim() ||
    "Use the global Dash product character: operational density, semantic tokens, registry-first components, no card-inside-card layouts, explicit loading/empty/error/success states, and repo-specific implementation patterns."

  const hasIntro = hasAnyIntrospection(ctx.introspection)
  const hasExisting = hasAnyExistingFiles(ctx.existingFiles)
  const outputMode: OutputMode = ctx.outputMode ?? (hasExisting ? "patch" : "new-file")

  // Section numbering — flows through both optional sections so the markdown
  // tree stays consistent even when one (or both) are absent.
  let n = 6
  const sectionNum = (): number => ++n // post-increment style: increment then read
  // Reset to a known anchor — start at 7 for the first conditional section.
  n = 6

  const out: string[] = [
    "# Dash Build — System Prompt",
    "",
    "You are generating code for the Dash platform (PT Dash Elektrik Indonesia).",
    "Follow ALL rules below STRICTLY. When a rule conflicts with the user prompt,",
    "the rule wins — explain the conflict in your explanation block.",
    "",
    "## 1. Global Design Contract",
    "",
    designContractBlock,
    "",
    "## 2. Cardinal Rules (NEVER violate)",
    "",
    cardinalBlock,
    "",
    "## 3. Voice Rules",
    "",
    voiceBlock,
    "",
    "## 4. Layered Architecture Decision Tree",
    "",
    ctx.design.layeredArchitecture.trim(),
    "",
    "## 5. Per-Repo Stack Mandate",
    "",
    skillBlock,
    "",
    "## 6. Repo Context Pack",
    "",
    renderRepoContext(ctx.repoContext),
    "",
  ]

  if (hasIntro) {
    out.push(
      `## ${sectionNum()}. Repo Introspection (REAL schema, do not hallucinate)`,
      "",
      renderIntrospection(ctx.introspection as RepoIntrospection),
      "",
    )
  }

  if (hasExisting) {
    out.push(
      `## ${sectionNum()}. CURRENT FILE STATE (do NOT recreate, EDIT)`,
      "",
      renderExistingFiles(ctx.existingFiles as ExistingFilesContext),
      "",
    )
  }

  // ── BE-aware intake blocks (only render when orchestrator passed intake) ──
  if (ctx.intake) {
    const blocks = renderIntakeBlocks(ctx.intake)
    if (blocks.length > 0) {
      out.push(
        `## ${sectionNum()}. BE/DB Intake (scenario-aware)`,
        "",
        ...blocks,
        "",
      )
    }
    const auditBlock = renderAuditTrailBlock(ctx.intake)
    if (auditBlock.length > 0) {
      out.push(
        `## ${sectionNum()}. Audit Trail Enforcement (CR-3)`,
        "",
        ...auditBlock,
        "",
      )
    }
  }

  out.push(
    `## ${sectionNum()}. PRD Context`,
    "",
    `Sections touched: ${ctx.prd.sectionsTouched}. Confidence: ${ctx.prd.confidence}.`,
    prdBlock,
    "",
    `## ${sectionNum()}. Banned Imports`,
    "",
    `DO NOT import any of: ${BANNED_IMPORTS.map((b) => `\`${b}\``).join(", ")}.`,
    "Replacements: useState + hand-rolled validation. axios or native fetch. Jotai (portal-v2) or Zustand 5 (basecamp) for global state.",
    "",
    `## ${sectionNum()}. Component Reuse / Gap Rule`,
    "",
    "Reuse existing Dash DS registry components and existing repo components before creating new UI. Search/import according to the repo stack mandate.",
    "If a needed component does not exist, new components are allowed, but mark them in the explanation as `component candidate` / `gap for DS review` with the intended theme and reuse rationale.",
    "",
    `## ${sectionNum()}. Token Usage`,
    "",
    "Use Dash semantic tokens only — `bg-primary-500`, `text-text-strong-950`, `border-stroke-soft-200`, `bg-bg-white-0`.",
    "Never raw hex (`#5e2aac` / `#7C4FC4` / `#fff`). Dash Purple canonical = `#5e2aac` via `--primary-base`.",
    "",
    `## ${sectionNum()}. Output Format (STRICT)`,
    "",
    ...renderOutputFormatSection(ctx, hasExisting, outputMode),
    "",
  )

  return out.join("\n")
}
