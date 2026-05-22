/**
 * Pipeline error handling — classification + degrade modes.
 *
 * The orchestrator wraps every external call (OpenAI/Codex, GitHub, filesystem,
 * skill chain) so a single transient failure cannot crash the daemon. Errors
 * are classified so the worker can decide whether to retry or fail-fast.
 */

export type PipelineErrorKind =
  | "auth-missing-openai"
  | "auth-missing-github"
  | "skill-chain-failed"
  | "generation-failed"
  | "validation-failed"
  | "submit-failed"
  | "transient"
  | "unknown"

export class PipelineError extends Error {
  constructor(
    public kind: PipelineErrorKind,
    message: string,
    public cause?: unknown,
  ) {
    super(message)
    this.name = "PipelineError"
  }
}

export function classify(err: unknown): PipelineError {
  if (err instanceof PipelineError) return err
  const msg = err instanceof Error ? err.message : String(err)

  if (
    /openai.*not.*connect/i.test(msg) ||
    /codex.*not.*(logged|auth)/i.test(msg) ||
    /not.*authenticated/i.test(msg)
  ) {
    return new PipelineError("auth-missing-openai", msg, err)
  }
  if (/github.*not.*connect/i.test(msg) || /install.*github.*app/i.test(msg)) {
    return new PipelineError("auth-missing-github", msg, err)
  }
  if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed/i.test(msg)) {
    return new PipelineError("transient", msg, err)
  }
  return new PipelineError("unknown", msg, err)
}

/** True when the worker should retry instead of marking the prompt failed. */
export function shouldRetry(err: PipelineError, attempts: number): boolean {
  if (attempts >= 3) return false
  return err.kind === "transient"
}

/** A human-readable summary string for the prompt error field. */
export function describe(err: PipelineError): string {
  switch (err.kind) {
    case "auth-missing-openai":
      return "OpenAI not connected — run `codex login --device-auth` or save an API key in dashboard settings."
    case "auth-missing-github":
      return "GitHub App not installed — open the dashboard and install the Dash Build App."
    case "skill-chain-failed":
      return `Skill chain failed: ${err.message}`
    case "generation-failed":
      return `Generation failed: ${err.message}`
    case "validation-failed":
      return `Validation failed: ${err.message}`
    case "submit-failed":
      return `PR submission failed: ${err.message}`
    case "transient":
      return `Transient error: ${err.message}`
    default:
      return err.message || "Unknown error"
  }
}
