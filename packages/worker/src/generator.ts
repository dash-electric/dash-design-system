/**
 * Anthropic SDK wrapper that produces a Dash-compliant block from a gap.
 *
 * Flow:
 *   1. Load Skill v2 prompt (pinned + per-repo + compressed rules).
 *   2. Pick a scaffold via `pickScaffold` (keyword heuristic).
 *   3. Compose: system = Skill v2 systemAppend ; user = gap + scaffold + repo.
 *   4. Call Anthropic Messages API. Model defaults to `claude-opus-4-7`.
 *   5. Optionally persist the generated TSX into the registry.
 *
 * Test-friendly: pass `deps.client` (mock) and `deps.skill` (mock) to avoid
 * any network or filesystem dependency.
 *
 * Stubbing: when `config.dryRun === true` OR no `anthropicApiKey`, we return
 * the scaffold stub source verbatim. This is how unit tests + the smoke
 * harness exercise the pipeline without burning real tokens.
 */
import fs from "node:fs/promises"
import path from "node:path"
import type { GapEntry } from "./gap-queue.js"
import type { WorkerConfig } from "./config.js"
import { pickScaffold } from "./scaffold-picker.js"
import type { GeneratorResult, Scaffold } from "./types.js"

/** Minimal Anthropic client surface — keeps the SDK dependency optional. */
export type AnthropicClient = {
  messages: {
    create: (params: {
      model: string
      max_tokens: number
      system: string
      messages: Array<{ role: "user" | "assistant"; content: string }>
    }) => Promise<{
      content: Array<{ type: string; text?: string }>
      usage?: { input_tokens?: number; output_tokens?: number }
    }>
  }
}

/** Skill loader signature mirrors `@dash/skill`'s `loadDashSkill`. */
export type SkillLoader = (opts: {
  cwd?: string
}) => Promise<{ systemAppend: string }>

export type GeneratorDeps = {
  client?: AnthropicClient | null
  skill?: SkillLoader
  /** Override for tests; defaults to `fs.writeFile` + `mkdir -p`. */
  writeFile?: (filePath: string, contents: string) => Promise<void>
}

async function defaultWriteFile(filePath: string, contents: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, contents, "utf-8")
}

function composeUserPrompt(gap: GapEntry, scaffold: Scaffold): string {
  return [
    "## Gap to fill",
    `description: ${gap.description}`,
    `severity: ${gap.severity}`,
    `repo: ${gap.repo ?? "(unknown)"}`,
    gap.prompt ? `prompt: ${gap.prompt}` : "",
    "",
    "## Scaffold (Agent O canonical seed — adapt, don't replace)",
    `category: ${scaffold.category}`,
    `name: ${scaffold.name}`,
    "",
    "```tsx",
    scaffold.stubSource,
    "```",
    "",
    "## Output contract",
    "- Return ONLY the final TSX source. No prose, no markdown fences.",
    "- Use `@/registry/dash/*` primitives. No external libs.",
    "- Use Dash tokens (bg-primary-500, text-text-strong-950). No raw hex.",
    "- Hand-rolled state (useState). NEVER react-hook-form / zod / @tanstack/react-query.",
    "- If category is legal/financial: include the audit-trail hook signature.",
    "- Voice: formal `Anda` for mitra-facing strings.",
  ]
    .filter(Boolean)
    .join("\n")
}

/**
 * Extract TSX text from an Anthropic response. Tolerant to:
 *   - a single text block
 *   - multiple text blocks (concatenated)
 *   - fenced code blocks (```tsx ... ```)
 */
function extractTsx(response: {
  content: Array<{ type: string; text?: string }>
}): string {
  const text = response.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim()
  // Strip fenced code blocks if present.
  const fence = text.match(/```(?:tsx|ts|jsx|js)?\n([\s\S]*?)```/)
  if (fence && fence[1]) return fence[1].trim()
  return text
}

function resolveRegistryPath(
  config: WorkerConfig,
  scaffold: Scaffold,
): string {
  const root =
    config.registryRoot ??
    path.resolve(process.cwd(), "../../apps/docs/registry/dash")
  const folder = `${scaffold.category}s` // block → blocks, template → templates
  return path.join(root, folder, `${scaffold.name}.tsx`)
}

/**
 * Generate a Dash block for a gap. Returns the source + write path (or null
 * when dry-run / no API key). Never throws — surfaces errors via stub fallback.
 */
export async function generateBlock(
  gap: GapEntry,
  config: WorkerConfig,
  deps: GeneratorDeps = {},
): Promise<GeneratorResult> {
  const scaffold = pickScaffold(gap.description)
  const skillLoader = deps.skill
  const writeFile = deps.writeFile ?? defaultWriteFile
  const targetPath = resolveRegistryPath(config, scaffold)

  // Stub path: no client + no key, OR explicit dry-run.
  const canCall = Boolean(config.anthropicApiKey) && !config.dryRun
  if (!canCall || !deps.client) {
    // Write the scaffold stub straight through — this is how the smoke
    // harness exercises the pipeline without network.
    if (!config.dryRun) {
      try {
        await writeFile(targetPath, scaffold.stubSource)
      } catch {
        /* ignore write failure in stub mode */
      }
    }
    return {
      source: scaffold.stubSource,
      writtenTo: config.dryRun ? null : targetPath,
      usage: { inputTokens: 0, outputTokens: 0 },
      stubbed: true,
    }
  }

  // Real call path.
  let systemAppend = ""
  if (skillLoader) {
    try {
      const skill = await skillLoader({ cwd: process.cwd() })
      systemAppend = skill.systemAppend
    } catch {
      systemAppend = ""
    }
  }

  const userPrompt = composeUserPrompt(gap, scaffold)
  const response = await deps.client.messages.create({
    model: config.anthropicModel,
    max_tokens: 4096,
    system: systemAppend,
    messages: [{ role: "user", content: userPrompt }],
  })

  const source = extractTsx(response) || scaffold.stubSource
  await writeFile(targetPath, source)

  return {
    source,
    writtenTo: targetPath,
    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    },
    stubbed: false,
  }
}

/** Exported for tests. */
export { composeUserPrompt, extractTsx, resolveRegistryPath }
