/**
 * Claude Code CLI subprocess auth path (Path B).
 *
 * ToS reasoning (recap from runner.ts header):
 *   Anthropic banned reusing Claude Code's public OAuth client_id in
 *   third-party apps (Consumer ToS, Feb 2026, enforced April 4 2026).
 *   Dash Build no longer mints subscription OAuth tokens itself.
 *
 *   This subprocess path is ToS-safe because:
 *     - The user installs + logs in to the OFFICIAL Claude Code CLI
 *       (`npm i -g @anthropic-ai/claude-code` + `claude login`).
 *     - Claude Code manages its own auth state on disk.
 *     - Dash Build only spawns `claude -p <prompt>` and reads stdout.
 *     - No third-party app extracts, reuses, or stores the subscription
 *       token. Token never leaves Claude Code's process.
 */

export {
  ClaudeCliRunner,
  type ClaudeCliRunnerOptions,
  type ClaudeCliCompletionRequest,
  type ClaudeCliCompletionResponse,
} from "./runner.js"
