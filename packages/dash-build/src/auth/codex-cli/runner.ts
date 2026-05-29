import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { performance } from "node:perf_hooks"

export interface CodexCliProbeResult {
  installed: boolean
  authenticated: boolean
  version: string | null
  statusLine: string | null
}

export interface CodexCliCompletionRequest {
  prompt: string
  cwd?: string
  signal?: AbortSignal
  onToken?: (chunk: string) => void
  timeoutMs?: number
  model?: string
}

export interface CodexCliCompletionResponse {
  content: string
  exitCode: number
  durationMs: number
}

export interface CodexCliDeviceAuthSession {
  verificationUrl: string
  code: string
  child: ReturnType<typeof spawn>
  stdout: string
  stderr: string
  completed: boolean
  success: boolean
  error: string | null
}

export interface CodexCliRunnerOptions {
  binary?: string
  defaultArgs?: string[]
}

// Default Codex CLI wall-clock budget. Lowered from 600s → 240s on 2026-05-29:
// a single `codex exec` that hasn't produced output in 4 minutes is almost
// always a stalled login / cold binary / runaway reasoning loop, not healthy
// progress — and a 10-minute hang reads as a frozen UI to the user. Override
// with DASH_BUILD_CODEX_TIMEOUT_MS for slow networks or huge prompts.
const DEFAULT_TIMEOUT_MS = Number(process.env.DASH_BUILD_CODEX_TIMEOUT_MS ?? 240_000)

/**
 * Soft prompt-size budget (chars). Past this, the composed system prompt is
 * large enough that Codex latency climbs sharply and timeout risk spikes. We
 * don't truncate (that would corrupt context) — we emit a single stderr warn
 * so operators can see "prompt was XXL" in logs when a timeout follows.
 */
const PROMPT_SIZE_WARN_CHARS = 60_000

export class CodexCliRunner {
  private readonly binary: string
  private readonly defaultArgs: string[]

  constructor(opts: CodexCliRunnerOptions = {}) {
    this.binary = opts.binary ?? "codex"
    this.defaultArgs = opts.defaultArgs ?? []
  }

  async probe(): Promise<CodexCliProbeResult> {
    const version = await this.runProbe(["--version"])
    if (!version.ok) {
      return {
        installed: false,
        authenticated: false,
        version: null,
        statusLine: null,
      }
    }

    const login = await this.runProbe(["login", "status"])
    const loginText = `${login.stdout}\n${login.stderr}`.trim()
    return {
      installed: true,
      authenticated: /logged in/i.test(loginText),
      version: version.stdout.trim() || null,
      statusLine: loginText || null,
    }
  }

  async complete(
    req: CodexCliCompletionRequest,
  ): Promise<CodexCliCompletionResponse> {
    const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const startedAt = performance.now()

    if (req.prompt.length > PROMPT_SIZE_WARN_CHARS) {
      // eslint-disable-next-line no-console
      console.warn(
        `[codex-cli] large prompt: ${req.prompt.length} chars ` +
          `(>${PROMPT_SIZE_WARN_CHARS}). Latency + timeout risk elevated. ` +
          `If this run times out, trim context (introspection / existing files / ` +
          `DS catalog) or raise DASH_BUILD_CODEX_TIMEOUT_MS.`,
      )
    }
    const outFile = path.join(
      tmpdir(),
      `dash-build-codex-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`,
    )

    return new Promise<CodexCliCompletionResponse>((resolve, reject) => {
      const args = [
        "exec",
        ...this.defaultArgs,
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--color",
        "never",
        "-o",
        outFile,
      ]

      if (req.model) {
        args.push("-m", req.model)
      }

      args.push("-")

      let child: ReturnType<typeof spawn>
      try {
        child = spawn(this.binary, args, {
          cwd: req.cwd ?? process.cwd(),
          stdio: ["pipe", "pipe", "pipe"],
        })
      } catch (err) {
        reject(
          new Error(
            `Failed to spawn Codex CLI (${this.binary}): ${(err as Error).message}`,
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

      const settleResolve = async (exitCode: number) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        cleanupAbort()
        try {
          const content = await fs.readFile(outFile, "utf8")
          resolve({
            content,
            exitCode,
            durationMs: Math.round(performance.now() - startedAt),
          })
        } catch (err) {
          reject(
            new Error(
              `Codex CLI completed but no final message was written: ${(err as Error).message}`,
            ),
          )
        } finally {
          void fs.rm(outFile, { force: true }).catch(() => {})
        }
      }

      const settleReject = (err: Error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        cleanupAbort()
        void fs.rm(outFile, { force: true }).catch(() => {})
        reject(err)
      }

      const onAbort = () => {
        try {
          child.kill("SIGTERM")
        } catch {
          /* ignore */
        }
        settleReject(new Error("Codex CLI aborted via signal"))
      }

      if (req.signal) {
        if (req.signal.aborted) {
          try {
            child.kill("SIGTERM")
          } catch {
            /* ignore */
          }
          settleReject(new Error("Codex CLI aborted via signal"))
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
            `Codex CLI timed out after ${timeoutMs}ms (binary=${this.binary})`,
          ),
        )
      }, timeoutMs)

      child.stdin?.write(req.prompt)
      child.stdin?.end()

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8")
        stdout += text
        if (req.onToken) {
          try {
            req.onToken(text)
          } catch {
            /* swallow */
          }
        }
      })

      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8")
      })

      child.on("error", (err) => {
        const msg = (err as NodeJS.ErrnoException).code === "ENOENT"
          ? "Codex CLI not found on PATH. Install Codex and run `codex login --device-auth`."
          : `Codex CLI spawn error: ${err.message}`
        settleReject(new Error(msg))
      })

      child.on("close", (code, signal) => {
        if (code === 0) {
          void settleResolve(0)
          return
        }
        const exitCode = typeof code === "number" ? code : -1
        const sigPart = signal ? ` signal=${signal}` : ""
        settleReject(
          new Error(
            `Codex CLI exited with code ${exitCode}${sigPart}: ${
              stderr.trim() || stdout.trim() || "(no output)"
            }`,
          ),
        )
      })
    })
  }

  async startDeviceAuth(): Promise<CodexCliDeviceAuthSession> {
    return await new Promise<CodexCliDeviceAuthSession>((resolve, reject) => {
      let child: ReturnType<typeof spawn>
      const shell = process.env.SHELL || "/bin/zsh"
      try {
        child = spawn(shell, ["-lc", `${this.binary} login --device-auth`], {
          cwd: process.cwd(),
          stdio: ["ignore", "pipe", "pipe"],
        })
      } catch (err) {
        reject(
          new Error(
            `Failed to spawn Codex login (${this.binary}): ${(err as Error).message}`,
          ),
        )
        return
      }

      const session: CodexCliDeviceAuthSession = {
        verificationUrl: "",
        code: "",
        child,
        stdout: "",
        stderr: "",
        completed: false,
        success: false,
        error: null,
      }

      const maybeResolve = () => {
        const urlMatch = session.stdout.match(/https:\/\/auth\.openai\.com\/codex\/device/i)
        const codeMatch = session.stdout.match(/\b([A-Z0-9]{4,}-[A-Z0-9]{4,})\b/)
        if (!session.verificationUrl && urlMatch) {
          session.verificationUrl = urlMatch[0]
        }
        if (!session.code && codeMatch) {
          session.code = codeMatch[1]
        }
        if (session.verificationUrl && session.code) {
          resolve(session)
          resolved = true
        }
      }

      let resolved = false

      child.stdout?.on("data", (chunk: Buffer) => {
        session.stdout += chunk.toString("utf8")
        if (!resolved) maybeResolve()
      })

      child.stderr?.on("data", (chunk: Buffer) => {
        session.stderr += chunk.toString("utf8")
      })

      child.on("error", (err) => {
        session.completed = true
        session.success = false
        session.error = (err as Error).message
        if (!resolved) {
          reject(
            new Error(
              (err as NodeJS.ErrnoException).code === "ENOENT"
                ? "Codex CLI not found on PATH. Install Codex first."
                : `Codex CLI login error: ${(err as Error).message}`,
            ),
          )
          return
        }
      })

      child.on("close", (code, signal) => {
        session.completed = true
        session.success = code === 0
        session.error =
          code === 0
            ? null
            : `Codex login exited with code ${code ?? -1}${signal ? ` signal=${signal}` : ""}`
        if (!resolved) {
          reject(
            new Error(
              session.error ?? "Codex login exited before returning device code",
            ),
          )
        }
      })
    })
  }

  private async runProbe(args: string[]): Promise<{
    ok: boolean
    stdout: string
    stderr: string
  }> {
    return new Promise((resolve) => {
      let stdout = ""
      let stderr = ""
      let settled = false

      const settle = (result: { ok: boolean; stdout: string; stderr: string }) => {
        if (settled) return
        settled = true
        resolve(result)
      }

      let child: ReturnType<typeof spawn>
      try {
        child = spawn(this.binary, [...this.defaultArgs, ...args], {
          stdio: ["ignore", "pipe", "pipe"],
        })
      } catch {
        settle({ ok: false, stdout: "", stderr: "" })
        return
      }

      const timer = setTimeout(() => {
        try {
          child.kill("SIGKILL")
        } catch {
          /* ignore */
        }
        settle({ ok: false, stdout, stderr })
      }, 5_000)

      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8")
      })
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8")
      })
      child.on("error", () => {
        clearTimeout(timer)
        settle({ ok: false, stdout, stderr })
      })
      child.on("close", (code) => {
        clearTimeout(timer)
        settle({ ok: code === 0, stdout, stderr })
      })
    })
  }
}
