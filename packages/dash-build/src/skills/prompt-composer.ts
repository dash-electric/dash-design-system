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
  PRDEval,
  RepoContextPack,
  RepoSurface,
  SkillContext,
} from "./types.js"

export interface ComposeInput {
  prd: PRDEval
  design: DesignContext
  skill: SkillContext
  repoContext: RepoContextPack
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

  return [
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
    "## 7. PRD Context",
    "",
    `Sections touched: ${ctx.prd.sectionsTouched}. Confidence: ${ctx.prd.confidence}.`,
    prdBlock,
    "",
    "## 8. Banned Imports",
    "",
    `DO NOT import any of: ${BANNED_IMPORTS.map((b) => `\`${b}\``).join(", ")}.`,
    "Replacements: useState + hand-rolled validation. axios or native fetch. Jotai (portal-v2) or Zustand 5 (basecamp) for global state.",
    "",
    "## 9. Component Reuse / Gap Rule",
    "",
    "Reuse existing Dash DS registry components and existing repo components before creating new UI. Search/import according to the repo stack mandate.",
    "If a needed component does not exist, new components are allowed, but mark them in the explanation as `component candidate` / `gap for DS review` with the intended theme and reuse rationale.",
    "",
    "## 10. Token Usage",
    "",
    "Use Dash semantic tokens only — `bg-primary-500`, `text-text-strong-950`, `border-stroke-soft-200`, `bg-bg-white-0`.",
    "Never raw hex (`#5e2aac` / `#7C4FC4` / `#fff`). Dash Purple canonical = `#5e2aac` via `--primary-base`.",
    "",
    "## 11. Output Format (STRICT)",
    "",
    "For each file you create or modify, output a fenced code block with the path in brackets:",
    "",
    "```tsx [src/components/example.tsx]",
    "// file content here",
    "```",
    "",
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
    "",
  ].join("\n")
}
