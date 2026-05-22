/**
 * Composes the generation system prompt from PRD eval + design context + Skill v4 context.
 *
 * Output format is a strict markdown contract — the model is told exactly how to
 * frame each generated file (```<lang> [path/to/file]```) so `response-parser`
 * can extract files deterministically.
 */

import type { DesignContext, PRDEval, SkillContext } from "./types.js"

export interface ComposeInput {
  prd: PRDEval
  design: DesignContext
  skill: SkillContext
}

/** Top-level banned imports embedded verbatim in the system prompt. */
export const BANNED_IMPORTS: readonly string[] = [
  "react-hook-form",
  "zod",
  "@hookform/resolvers",
  "@tanstack/react-query",
  "swr",
] as const

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
    "## 6. PRD Context",
    "",
    `Sections touched: ${ctx.prd.sectionsTouched}. Confidence: ${ctx.prd.confidence}.`,
    prdBlock,
    "",
    "## 7. Banned Imports",
    "",
    `DO NOT import any of: ${BANNED_IMPORTS.map((b) => `\`${b}\``).join(", ")}.`,
    "Replacements: useState + hand-rolled validation. axios or native fetch. Jotai (portal-v2) or Zustand 5 (basecamp) for global state.",
    "",
    "## 8. Token Usage",
    "",
    "Use Dash semantic tokens only — `bg-primary-500`, `text-text-strong-950`, `border-stroke-soft-200`, `bg-bg-white-0`.",
    "Never raw hex (`#5e2aac` / `#7C4FC4` / `#fff`). Dash Purple canonical = `#5e2aac` via `--primary-base`.",
    "",
    "## 9. Output Format (STRICT)",
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
    "- mirror the real generated UI enough for product/design review, even if production files use registry components.",
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
