/**
 * GitOps — subprocess git wrapper (Phase D2).
 *
 * Thin async wrapper around `git <args>` via `child_process.spawn` (NOT
 * `exec` / shell — args are passed as an argv array, no injection risk).
 *
 * Shared by:
 *   - D1 Workspace (clone, checkout, fetch)
 *   - D2 BranchManager / Publisher (cherry-pick, format-patch, push)
 *   - D3 stale sweeper (log inspection, branch delete)
 *
 * Every error throws `GitOpsError` with a kind classification so callers
 * can surface user-friendly messages without parsing stderr text.
 */

import { spawn } from "node:child_process"
import { readdir } from "node:fs/promises"
import { isAbsolute, join } from "node:path"

export type GitOpsErrorKind = "conflict" | "auth" | "not_found" | "unknown"

export class GitOpsError extends Error {
  readonly kind: GitOpsErrorKind
  readonly code: number
  readonly stderr: string
  readonly args: string[]

  constructor(opts: {
    message: string
    kind: GitOpsErrorKind
    code: number
    stderr: string
    args: string[]
  }) {
    super(opts.message)
    this.name = "GitOpsError"
    this.kind = opts.kind
    this.code = opts.code
    this.stderr = opts.stderr
    this.args = opts.args
  }
}

export interface GitRunResult {
  stdout: string
  stderr: string
  code: number
}

export interface GitStatus {
  clean: boolean
  branch: string
  ahead: number
  behind: number
  untracked: string[]
  modified: string[]
}

export interface GitLogEntry {
  sha: string
  message: string
  author: string
  date: string
}

export interface CherryPickResult {
  ok: boolean
  conflict?: boolean
  error?: string
}

export interface ApplyResult {
  ok: boolean
  conflict?: boolean
  error?: string
}

export interface CheckoutOptions {
  create?: boolean
  from?: string
}

export interface CommitOptions {
  addAll?: boolean
  allowEmpty?: boolean
}

export interface PushOptions {
  setUpstream?: boolean
  force?: boolean
  /** Push as a refspec (e.g. local:remote). */
  refspec?: string
  remote?: string
}

export interface DeleteBranchOptions {
  force?: boolean
  remote?: boolean
}

export interface LogOptions {
  format?: string
  max?: number
}

export interface DiffOptions {
  nameOnly?: boolean
  stat?: boolean
}

export interface GitOpsOptions {
  /**
   * Optional environment overrides applied to every git invocation. Tests
   * inject `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` so commits are reproducible
   * without touching the operator's global gitconfig.
   */
  env?: Record<string, string>
  /** Override the `git` executable path (default = "git" in $PATH). */
  gitBin?: string
}

function classifyStderr(stderr: string): GitOpsErrorKind {
  const s = stderr.toLowerCase()
  if (
    s.includes("conflict") ||
    s.includes("could not apply") ||
    s.includes("patch failed") ||
    s.includes("patch does not apply")
  ) {
    return "conflict"
  }
  if (
    s.includes("authentication failed") ||
    s.includes("permission denied") ||
    s.includes("could not read username") ||
    s.includes("403") ||
    s.includes("401")
  ) {
    return "auth"
  }
  if (
    s.includes("not found") ||
    s.includes("does not exist") ||
    s.includes("unknown revision") ||
    s.includes("pathspec") ||
    s.includes("no such")
  ) {
    return "not_found"
  }
  return "unknown"
}

/**
 * GitOps — instantiated per working directory.
 *
 * ```ts
 * const git = new GitOps("/path/to/repo")
 * await git.fetch("origin")
 * await git.checkout("feature/x", { create: true, from: "origin/main" })
 * const sha = await git.commit("feat: thing", { addAll: true })
 * ```
 */
export class GitOps {
  readonly workdir: string
  private readonly env: Record<string, string>
  private readonly gitBin: string

  constructor(workdir: string, opts: GitOpsOptions = {}) {
    this.workdir = workdir
    this.env = opts.env ?? {}
    this.gitBin = opts.gitBin ?? "git"
  }

  /**
   * Execute `git <args>` in the working directory. Never throws on non-zero
   * exit — caller decides via the `code` field. Use the convenience methods
   * for typed error handling.
   */
  async run(args: string[]): Promise<GitRunResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.gitBin, args, {
        cwd: this.workdir,
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME ?? "Dash Build",
          GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL ?? "dash-build@local",
          GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME ?? "Dash Build",
          GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL ?? "dash-build@local",
          ...this.env,
        },
        stdio: ["ignore", "pipe", "pipe"],
      })
      let stdout = ""
      let stderr = ""
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8")
      })
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8")
      })
      child.on("error", (err) => reject(err))
      child.on("close", (code) => {
        resolve({ stdout, stderr, code: code ?? -1 })
      })
    })
  }

  /** Run + throw GitOpsError on non-zero exit. */
  private async runOrThrow(args: string[]): Promise<GitRunResult> {
    const result = await this.run(args)
    if (result.code !== 0) {
      throw new GitOpsError({
        message: `git ${args.join(" ")} failed: ${result.stderr.trim() || result.stdout.trim()}`,
        kind: classifyStderr(result.stderr + "\n" + result.stdout),
        code: result.code,
        stderr: result.stderr,
        args,
      })
    }
    return result
  }

  // ── Convenience methods ────────────────────────────────────────────────

  async status(): Promise<GitStatus> {
    const { stdout } = await this.runOrThrow(["status", "--porcelain=v2", "--branch"])
    const lines = stdout.split("\n")
    let branch = ""
    let ahead = 0
    let behind = 0
    const untracked: string[] = []
    const modified: string[] = []
    for (const line of lines) {
      if (line.startsWith("# branch.head ")) {
        branch = line.slice("# branch.head ".length).trim()
      } else if (line.startsWith("# branch.ab ")) {
        // "# branch.ab +N -M"
        const parts = line.slice("# branch.ab ".length).trim().split(/\s+/)
        for (const p of parts) {
          if (p.startsWith("+")) ahead = Number(p.slice(1)) || 0
          if (p.startsWith("-")) behind = Number(p.slice(1)) || 0
        }
      } else if (line.startsWith("? ")) {
        untracked.push(line.slice(2).trim())
      } else if (line.startsWith("1 ") || line.startsWith("2 ")) {
        // tracked changes — porcelain v2 format: "1 XY ... <path>"
        const parts = line.split(" ")
        const path = parts[parts.length - 1]
        if (path) modified.push(path)
      }
    }
    return {
      clean: untracked.length === 0 && modified.length === 0,
      branch: branch === "(detached)" ? "" : branch,
      ahead,
      behind,
      untracked,
      modified,
    }
  }

  async fetch(remote: string = "origin"): Promise<void> {
    await this.runOrThrow(["fetch", remote, "--prune"])
  }

  async currentBranch(): Promise<string> {
    const { stdout } = await this.runOrThrow(["rev-parse", "--abbrev-ref", "HEAD"])
    return stdout.trim()
  }

  async checkout(branch: string, opts: CheckoutOptions = {}): Promise<void> {
    const args = ["checkout"]
    if (opts.create) args.push("-b")
    args.push(branch)
    if (opts.from) args.push(opts.from)
    await this.runOrThrow(args)
  }

  async commit(message: string, opts: CommitOptions = {}): Promise<string> {
    if (opts.addAll) {
      await this.runOrThrow(["add", "-A"])
    }
    const args = ["commit", "-m", message]
    if (opts.allowEmpty) args.push("--allow-empty")
    await this.runOrThrow(args)
    const { stdout } = await this.runOrThrow(["rev-parse", "HEAD"])
    return stdout.trim()
  }

  async cherryPick(sha: string): Promise<CherryPickResult> {
    const result = await this.run(["cherry-pick", sha])
    if (result.code === 0) return { ok: true }
    // Abort the in-progress cherry-pick so the working tree is clean again.
    const blob = result.stderr + "\n" + result.stdout
    const kind = classifyStderr(blob)
    if (kind === "conflict") {
      await this.run(["cherry-pick", "--abort"])
      return { ok: false, conflict: true, error: blob.trim() }
    }
    return { ok: false, error: blob.trim() }
  }

  async push(branch: string, opts: PushOptions = {}): Promise<void> {
    const args = ["push"]
    if (opts.force) args.push("--force")
    if (opts.setUpstream) args.push("--set-upstream")
    args.push(opts.remote ?? "origin")
    args.push(opts.refspec ?? branch)
    await this.runOrThrow(args)
  }

  async deleteBranch(
    branch: string,
    opts: DeleteBranchOptions = {},
  ): Promise<void> {
    if (opts.remote) {
      await this.runOrThrow(["push", "origin", "--delete", branch])
      return
    }
    const flag = opts.force ? "-D" : "-d"
    await this.runOrThrow(["branch", flag, branch])
  }

  async log(range?: string, opts: LogOptions = {}): Promise<GitLogEntry[]> {
    // Use NUL-delimited records to avoid choking on commit messages with
    // embedded newlines.
    const fmt = opts.format ?? "%H%x1f%an%x1f%aI%x1f%s%x00"
    const args = ["log", `--pretty=format:${fmt}`]
    if (opts.max) args.push(`-n`, String(opts.max))
    if (range) args.push(range)
    const { stdout } = await this.runOrThrow(args)
    const records = stdout
      .split("\x00")
      .map((r) => r.replace(/^\n+/, ""))
      .filter((r) => r.length > 0)
    return records.map((r) => {
      const [sha = "", author = "", date = "", message = ""] = r.split("\x1f")
      return { sha, author, date, message }
    })
  }

  async diff(range?: string, opts: DiffOptions = {}): Promise<string> {
    const args = ["diff"]
    if (opts.nameOnly) args.push("--name-only")
    if (opts.stat) args.push("--stat")
    if (range) args.push(range)
    const { stdout } = await this.runOrThrow(args)
    return stdout
  }

  /**
   * Generate one `.patch` file per commit into `outputDir` using
   * `git format-patch <SHA>^..<SHA>` per commit. We do not pass the
   * SHAs as a multi-arg list because `git format-patch <A> <B>` treats
   * them as start refs, not exact commits — which produces patches for
   * the wrong range. Instead we generate `<sha>^..<sha>` per commit so
   * each patch corresponds 1:1 to the requested SHA.
   *
   * Returns absolute paths to the generated patches.
   */
  async formatPatch(commits: string[], outputDir: string): Promise<string[]> {
    if (commits.length === 0) return []
    const outputs: string[] = []
    for (const sha of commits) {
      const args = ["format-patch", "-o", outputDir, "-1", sha]
      const { stdout } = await this.runOrThrow(args)
      const inlineLines = stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      if (inlineLines.length > 0) {
        outputs.push(
          ...inlineLines.map((l) => (isAbsolute(l) ? l : join(this.workdir, l))),
        )
      }
    }
    if (outputs.length > 0) return outputs
    // Fallback: enumerate the directory in case the git build suppressed
    // stdout (older versions on some platforms).
    const entries = await readdir(outputDir).catch(() => [] as string[])
    return entries
      .filter((f) => f.endsWith(".patch"))
      .sort()
      .map((f) => join(outputDir, f))
  }

  /**
   * Apply a patch file. `check: true` performs `--check` only (no mutation).
   */
  async apply(patchPath: string, opts: { check?: boolean } = {}): Promise<ApplyResult> {
    const args = ["apply"]
    if (opts.check) args.push("--check")
    args.push(patchPath)
    const result = await this.run(args)
    if (result.code === 0) return { ok: true }
    const blob = result.stderr + "\n" + result.stdout
    const kind = classifyStderr(blob)
    return {
      ok: false,
      conflict: kind === "conflict",
      error: blob.trim(),
    }
  }

  /**
   * Return commit SHAs reachable from `head` but not from `base`,
   * EXCLUDING any SHAs in `exclude` (e.g. the preview-shim commit).
   *
   * Implemented via `git rev-list base..head ^<sha1> ^<sha2>...`.
   */
  async revListExclude(
    base: string,
    head: string,
    exclude: string[],
  ): Promise<string[]> {
    const args = ["rev-list", "--reverse", `${base}..${head}`]
    for (const sha of exclude) {
      args.push(`^${sha}`)
    }
    const { stdout } = await this.runOrThrow(args)
    return stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  }
}
