/**
 * GitHub PR creator. Uses the REST API directly (no Octokit dep) to keep
 * the install footprint minimal and to make mocking trivial in tests.
 *
 * Branch convention: `hermes/<gap-id-short>` (8-char id slice).
 * PR title: `feat(dash): vendored <name> via Hermes`
 * Body includes: gap description, score breakdown, audit summary, install hint.
 *
 * Modes:
 *   - real    : config.githubToken present + !dryRun → live API call
 *   - dryRun  : returns a stubbed PrResult — useful for smoke + unit tests
 *
 * Failure mode: never throws. Returns { url: null, ... stubbed: true } if the
 * API rejects so the pipeline can downgrade to needs-review without crashing.
 */
import type { GapEntry } from "./gap-queue.js"
import type { WorkerConfig } from "./config.js"
import type { PrResult, ValidationResult } from "./types.js"

export type FetchLike = (
  url: string,
  init?: {
    method?: string
    headers?: Record<string, string>
    body?: string
  },
) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
  text: () => Promise<string>
}>

export type PrCreatorDeps = {
  /** Override `fetch` for tests. */
  fetch?: FetchLike
}

export type PrInput = {
  gap: GapEntry
  blockName: string
  blockPath: string
  validation: ValidationResult
  draft: boolean
}

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

export function buildPrTitle(input: PrInput): string {
  return `feat(dash): vendored ${input.blockName} via Hermes`
}

export function buildPrBody(input: PrInput): string {
  const { gap, blockName, blockPath, validation } = input
  const criteriaLines = validation.criteria
    .map(
      (c) =>
        `- ${c.passed ? "✓" : "✗"} **${c.id}** (+${c.weight}) — ${c.note ?? ""}`,
    )
    .join("\n")
  const gates =
    `- typecheck: ${validation.typecheckPassed ? "passed" : "FAILED"}\n` +
    `- tests: ${validation.testsPassed ? "passed" : "FAILED"}\n` +
    `- audit: ${validation.auditClean ? "clean" : "FAILED"}`
  return [
    "## Hermes auto-vendored block",
    "",
    `**gap:** \`${gap.description}\` (\`${shortId(gap.id)}\`)`,
    `**repo:** \`${gap.repo ?? "(unknown)"}\``,
    `**block:** \`${blockName}\``,
    `**path:** \`${blockPath}\``,
    `**foundation score:** ${validation.score} / 100`,
    "",
    "### Score breakdown",
    criteriaLines,
    "",
    "### Validation gates",
    gates,
    "",
    "### Install",
    "```",
    `dashkit add ${blockName}`,
    "```",
    "",
    input.draft
      ? "_Opened in draft because score is in the review band — please review before merge._"
      : "_Opened ready-to-merge — score above auto-merge threshold._",
  ].join("\n")
}

export function buildBranchName(gap: GapEntry): string {
  return `hermes/${shortId(gap.id)}`
}

function stubResult(draft: boolean): PrResult {
  return { url: null, number: null, draft, stubbed: true }
}

/**
 * Create a PR via GitHub REST. Returns a stub result when `dryRun` or token
 * missing. Never throws.
 */
export async function createPr(
  input: PrInput,
  config: WorkerConfig,
  deps: PrCreatorDeps = {},
): Promise<PrResult> {
  if (config.dryRun || !config.githubToken) {
    return stubResult(input.draft)
  }

  const fetchImpl = deps.fetch ?? (globalThis.fetch as FetchLike | undefined)
  if (!fetchImpl) return stubResult(input.draft)

  const branch = buildBranchName(input.gap)
  const title = buildPrTitle(input)
  const body = buildPrBody(input)
  const url = `https://api.github.com/repos/${config.githubRepo}/pulls`

  let resp
  try {
    resp = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        head: branch,
        base: "main",
        body,
        draft: input.draft,
      }),
    })
  } catch {
    return stubResult(input.draft)
  }

  if (!resp.ok) return stubResult(input.draft)

  try {
    const json = (await resp.json()) as { html_url?: string; number?: number }
    return {
      url: typeof json.html_url === "string" ? json.html_url : null,
      number: typeof json.number === "number" ? json.number : null,
      draft: input.draft,
      stubbed: false,
    }
  } catch {
    return stubResult(input.draft)
  }
}
