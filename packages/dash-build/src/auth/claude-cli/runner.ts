/**
 * ClaudeCliRunner — wraps the official `claude` (Claude Code) CLI as a
 * subprocess for non-interactive generation. ToS-safe path B for Dash Build.
 *
 * Why subprocess (not OAuth):
 *   Anthropic Consumer ToS (Feb 2026, enforced April 4 2026) banned reusing
 *   Claude Code's public OAuth client_id in third-party apps. Dash Build no
 *   longer mints subscription tokens itself. Instead, the user runs the
 *   official Claude Code CLI (`claude login` once) and Dash Build spawns
 *   `claude -p "<prompt>"` per generation. The auth token never leaves
 *   Claude Code's own keychain/config — Dash Build only reads stdout.
 *
 * Invocation:
 *   `claude -p <prompt> --output-format text`
 *
 *   `-p` / `--print` puts Claude Code in non-interactive print-and-exit mode.
 *   `--output-format text` ensures stdout is plain text (no JSON envelope).
 *
 * Lifecycle:
 *   spawn → stream stdout chunks → onToken(chunk) → aggregate → resolve
 *   stderr is captured and only surfaced if the exit code is non-zero or
 *   the process is signal-killed.
 *
 *   Default timeout: 120s. Caller can pass an AbortSignal for cancellation.
 */

import { spawn } from "node:child_process"
import { performance } from "node:perf_hooks"

export interface ClaudeCliCompletionRequest {
  /** The full user prompt with skill chain injected. */
  prompt: string
  /** Working directory for `claude`. Defaults to process.cwd(). */
  cwd?: string
  /** Abort the subprocess. */
  signal?: AbortSignal
  /** Streaming callback per stdout chunk (string, not Buffer). */
  onToken?: (chunk: string) => void
  /** Override the default 120s timeout. */
  timeoutMs?: number
}

export interface ClaudeCliCompletionResponse {
  /** Full assistant message (aggregated stdout). */
  content: string
  /** Subprocess exit code (0 = success). */
  exitCode: number
  /** Wall-clock duration in milliseconds. */
  durationMs: number
}

export interface ClaudeCliRunnerOptions {
  /** Binary name or absolute path. Defaults to "claude" (PATH-resolved). */
  binary?: string
  /** Args prepended to every invocation (after the binary, before `-p`). */
  defaultArgs?: string[]
}

const DEFAULT_TIMEOUT_MS = 120_000

export class ClaudeCliRunner {
  private readonly binary: string
  private readonly defaultArgs: string[]

  constructor(opts: ClaudeCliRunnerOptions = {}) {
    this.binary = opts.binary ?? "claude"
    this.defaultArgs = opts.defaultArgs ?? []
  }

  /**
   * Probe the CLI by running `claude --version`. Resolves with
   * `{ installed: false, version: null }` on any error (ENOENT, non-zero
   * exit, timeout) — never rejects.
   */
  async probe(): Promise<{ installed: boolean; version: string | null }> {
    return new Promise((resolve) => {
      let stdout = ""
      let settled = false
      const settle = (result: { installed: boolean; version: string | null }) => {
        if (settled) return
        settled = true
        resolve(result)
      }

      let child: ReturnType<typeof spawn>
      try {
        child = spawn(this.binary, [...this.defaultArgs, "--version"], {
          stdio: ["ignore", "pipe", "pipe"],
        })
      } catch {
        settle({ installed: false, version: null })
        return
      }

      const probeTimeout = setTimeout(() => {
        try {
          child.kill("SIGKILL")
        } catch {
          /* ignore */
        }
        settle({ installed: false, version: null })
      }, 5_000)

      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8")
      })
      child.on("error", () => {
        clearTimeout(probeTimeout)
        settle({ installed: false, version: null })
      })
      child.on("close", (code) => {
        clearTimeout(probeTimeout)
        if (code === 0) {
          const trimmed = stdout.trim()
          settle({ installed: true, version: trimmed || null })
        } else {
          settle({ installed: false, version: null })
        }
      })
    })
  }

  /**
   * Run `claude -p <prompt> --output-format text` and stream stdout.
   *
   * Rejects on:
   *   - ENOENT / spawn failure ("Claude CLI not found")
   *   - Non-zero exit code (error message includes stderr)
   *   - Abort signal fired
   *   - Timeout
   */
  async complete(
    req: ClaudeCliCompletionRequest,
  ): Promise<ClaudeCliCompletionResponse> {
    const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const startedAt = performance.now()

    return new Promise<ClaudeCliCompletionResponse>((resolve, reject) => {
      const args = [...this.defaultArgs, "-p", "--output-format", "text", req.prompt]

      let child: ReturnType<typeof spawn>
      try {
        child = spawn(this.binary, args, {
          cwd: req.cwd ?? process.cwd(),
          stdio: ["ignore", "pipe", "pipe"],
        })
      } catch (err) {
        reject(
          new Error(
            `Failed to spawn Claude CLI (${this.binary}): ${(err as Error).message}`,
          ),
        )
        return
      }

      let stdout = ""
      let stderr = ""
      let settled = false

      const cleanupAbort = () => {
        if (req.signal) req.signal.removeEventListener("abort", onAbort)
      }

      const settleResolve = (value: ClaudeCliCompletionResponse) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        cleanupAbort()
        resolve(value)
      }
      const settleReject = (err: Error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        cleanupAbort()
        reject(err)
      }

      const onAbort = () => {
        try {
          child.kill("SIGTERM")
        } catch {
          /* ignore */
        }
        settleReject(new Error("Claude CLI aborted via signal"))
      }

      if (req.signal) {
        if (req.signal.aborted) {
          try {
            child.kill("SIGTERM")
          } catch {
            /* ignore */
          }
          settleReject(new Error("Claude CLI aborted via signal"))
          return
        }
        req.signal.addEventListener("abort", onAbort, { once: true })
      }

      const timer = setTimeout(() => {
        try {
          child.kill("SIGKILL")
        } catch {
          /* ignore */
        }
        settleReject(
          new Error(
            `Claude CLI timed out after ${timeoutMs}ms (binary=${this.binary})`,
          ),
        )
      }, timeoutMs)

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8")
        stdout += text
        if (req.onToken) {
          try {
            req.onToken(text)
          } catch {
            /* swallow — onToken must never break the subprocess */
          }
        }
      })

      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8")
      })

      child.on("error", (err) => {
        const msg = (err as NodeJS.ErrnoException).code === "ENOENT"
          ? `Claude CLI not found on PATH (binary=${this.binary}). Install: npm i -g @anthropic-ai/claude-code, then run \`claude login\`.`
          : `Claude CLI spawn error: ${err.message}`
        settleReject(new Error(msg))
      })

      child.on("close", (code, signal) => {
        const durationMs = Math.round(performance.now() - startedAt)
        if (code === 0) {
          settleResolve({
            content: stdout,
            exitCode: 0,
            durationMs,
          })
          return
        }
        const exitCode = typeof code === "number" ? code : -1
        const stderrTrimmed = stderr.trim()
        const sigPart = signal ? ` signal=${signal}` : ""
        settleReject(
          new Error(
            `Claude CLI exited with code ${exitCode}${sigPart}: ${
              stderrTrimmed || "(no stderr)"
            }`,
          ),
        )
      })
    })
  }
}
