/**
 * Slack webhook notifier. POSTs a single text payload — keeps the message
 * surface minimal so we don't drift into Block Kit complexity.
 *
 * Disabled (no-op) when `slackWebhookUrl` is null OR `dryRun` is true.
 * Returns `{ delivered: boolean }` so the pipeline can log behaviour.
 */
import type { GapEntry } from "./gap-queue.js"
import type { WorkerConfig } from "./config.js"
import type { FetchLike } from "./pr-creator.js"
import type { PipelineOutcome } from "./types.js"

export type SlackNotifierDeps = {
  fetch?: FetchLike
}

export type SlackPayload = { text: string }

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

/** Build the canonical Slack message text for a pipeline outcome. */
export function buildSlackPayload(
  outcome: PipelineOutcome,
  blockName: string | null,
): SlackPayload {
  if (outcome.kind === "vendored") {
    const lines = [
      "🤖 *Hermes Block Vendored*",
      `gap: ${outcome.gap.description} (${shortId(outcome.gap.id)})`,
      `repo: ${outcome.gap.repo ?? "(unknown)"}`,
      `score: ${outcome.score}/100`,
      outcome.pr.url ? `PR: ${outcome.pr.url}` : "PR: (stubbed)",
      blockName ? `install: dash add ${blockName}` : "",
    ].filter(Boolean)
    return { text: lines.join("\n") }
  }

  if (outcome.kind === "needs-review") {
    const lines = [
      "⚠️ *Hermes Needs Review*",
      `gap: ${outcome.gap.description} (${shortId(outcome.gap.id)})`,
      `repo: ${outcome.gap.repo ?? "(unknown)"}`,
      `score: ${outcome.score}/100`,
      `reason: ${outcome.reason}`,
      outcome.pr.url ? `draft PR: ${outcome.pr.url}` : "draft PR: (stubbed)",
    ]
    return { text: lines.join("\n") }
  }

  if (outcome.kind === "failed") {
    return {
      text: [
        "🔥 *Hermes Failed*",
        `gap: ${outcome.gap.description} (${shortId(outcome.gap.id)})`,
        `repo: ${outcome.gap.repo ?? "(unknown)"}`,
        outcome.score === null ? "score: n/a" : `score: ${outcome.score}/100`,
        `reason: ${outcome.reason}`,
      ].join("\n"),
    }
  }

  return {
    text: `⏭️ Hermes skipped ${shortId(outcome.gap.id)} — ${outcome.reason}`,
  }
}

/**
 * Send a Slack notification. Never throws.
 */
export async function notifySlack(
  payload: SlackPayload,
  config: WorkerConfig,
  deps: SlackNotifierDeps = {},
): Promise<{ delivered: boolean }> {
  if (!config.slackWebhookUrl || config.dryRun) {
    return { delivered: false }
  }
  const fetchImpl = deps.fetch ?? (globalThis.fetch as FetchLike | undefined)
  if (!fetchImpl) return { delivered: false }
  try {
    const resp = await fetchImpl(config.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return { delivered: resp.ok }
  } catch {
    return { delivered: false }
  }
}
