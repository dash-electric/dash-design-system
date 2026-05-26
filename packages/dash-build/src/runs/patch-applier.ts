/**
 * PatchApplier — Sprint 2B (Phase C).
 *
 * Applies a unified-diff patch (emitted by the model as `mode=patch`) to a
 * file inside the sandbox clone. Uses `git apply` via the existing GitOps
 * helper — ZERO new npm deps (no jsdiff / @babel/parser).
 *
 * Flow per patch:
 *   1. write the unified-diff body to a temp file under <clone>/.dash-build/patches/
 *   2. run `git apply --check` against the workspace (dry run, mutates nothing)
 *   3. if check passes → `git apply` for real
 *   4. return ApplyOutcome to caller
 *
 * The orchestrator (S2B step 6) walks every ParsedPatch in order. The first
 * failure triggers an all-or-nothing rollback so the workspace never ends up
 * in a half-applied state.
 *
 * Safety:
 *   - The patch path is bracketed inside the fence — the applier itself
 *     trusts the path string but the response-parser already vetted it via
 *     isSafePath() so we cannot escape the workspace via "../../etc/passwd".
 *   - We do not invoke any shell — GitOps spawns git via argv.
 */

import { mkdir, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, resolve, sep } from "node:path"
import { GitOps } from "./git-ops.js"

export interface ApplyOutcome {
  /** True when the patch landed cleanly. */
  ok: boolean
  /** True when `git apply --check` rejected because of context drift. */
  conflict?: boolean
  /** True when the target file does not exist on disk yet. */
  missingTarget?: boolean
  /** Absolute path to the patch file (kept on disk for forensic review). */
  patchPath?: string
  /** Human-readable failure cause when `ok === false`. */
  error?: string
}

export interface PatchApplierOptions {
  /** Workspace root where patches apply (clone path or repo root). */
  workspaceDir: string
  /** Pre-built GitOps. Tests inject one with deterministic author env. */
  gitOps?: GitOps
  /**
   * Override the patch-staging directory. Defaults to
   * `<workspaceDir>/.dash-build/patches/inbox/` so artefacts collect in one
   * place and can be cleaned up by the run-level patch sweeper.
   */
  patchStagingDir?: string
}

function safeJoin(root: string, p: string): string | null {
  if (!p || p.includes("\0")) return null
  const joined = resolve(root, p)
  const baseResolved = resolve(root)
  if (joined !== baseResolved && !joined.startsWith(baseResolved + sep)) {
    return null
  }
  return joined
}

/**
 * Basic unified-diff sniff. We don't fully parse — `git apply --check` does
 * the real work — but we reject obvious garbage (no `@@` hunk header at all,
 * no `+`/`-` markers) early so the caller gets a fast, clear failure mode.
 *
 * Exported for the validator (Sprint 2B step 5).
 */
export function looksLikeUnifiedDiff(content: string): boolean {
  if (typeof content !== "string" || content.length === 0) return false
  // Must contain at least one hunk header.
  if (!/@@\s+-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s+@@/.test(content)) return false
  // Must contain at least one +/- line (additions or deletions).
  const hasChange = content
    .split("\n")
    .some((line) => /^[+-](?![+-])/.test(line))
  return hasChange
}

/**
 * Build a single-file unified diff suitable for `git apply` when the model
 * emitted a patch body without the `--- a/<path>` / `+++ b/<path>` header
 * (very common — the fence already bracketed the path).
 *
 * If the body already has those headers, return as-is.
 */
export function ensureDiffHeader(filePath: string, body: string): string {
  if (/^---\s/m.test(body) && /^\+\+\+\s/m.test(body)) {
    return body.endsWith("\n") ? body : body + "\n"
  }
  // git apply tolerates `a/` + `b/` prefixes when run without --no-prefix.
  const header = `--- a/${filePath}\n+++ b/${filePath}\n`
  const tail = body.endsWith("\n") ? body : body + "\n"
  return header + tail
}

/**
 * PatchApplier — instantiated per workspace.
 *
 * ```ts
 * const applier = new PatchApplier({ workspaceDir: workspace.clonePath })
 * const r = await applier.applyPatch("src/x.tsx", patchBody)
 * if (!r.ok) { ... rollback ... }
 * ```
 */
export class PatchApplier {
  private readonly workspaceDir: string
  private readonly gitOps: GitOps
  private readonly stagingDir: string

  constructor(opts: PatchApplierOptions) {
    this.workspaceDir = opts.workspaceDir
    this.gitOps = opts.gitOps ?? new GitOps(opts.workspaceDir)
    this.stagingDir =
      opts.patchStagingDir ??
      join(opts.workspaceDir, ".dash-build", "patches", "inbox")
  }

  /**
   * Apply a single unified-diff patch to `filePath` inside the workspace.
   *
   * - Writes the body to a deterministic file under the staging dir.
   * - Runs `git apply --check` first (dry run).
   * - On success, runs `git apply` to mutate the working tree.
   * - On conflict / invalid patch, leaves the working tree untouched.
   */
  async applyPatch(filePath: string, patchContent: string): Promise<ApplyOutcome> {
    if (typeof patchContent !== "string" || patchContent.length === 0) {
      return { ok: false, error: "empty patch body" }
    }
    if (!looksLikeUnifiedDiff(patchContent)) {
      return {
        ok: false,
        error: "patch body is not a recognizable unified diff (no @@ hunk header or no +/- lines)",
      }
    }

    const resolvedTarget = safeJoin(this.workspaceDir, filePath)
    if (!resolvedTarget) {
      return { ok: false, error: `unsafe target path: ${filePath}` }
    }
    if (!existsSync(resolvedTarget)) {
      return {
        ok: false,
        missingTarget: true,
        error: `target file does not exist in workspace: ${filePath}`,
      }
    }

    // Stage the patch on disk so `git apply` can read it and we keep a
    // forensic copy if something fails downstream.
    await mkdir(this.stagingDir, { recursive: true })
    const stableName = filePath.replace(/[^A-Za-z0-9._-]/g, "_") + "." + Date.now() + ".patch"
    const patchPath = join(this.stagingDir, stableName)
    const body = ensureDiffHeader(filePath, patchContent)
    await writeFile(patchPath, body, "utf8")

    // 1. Dry-run validate.
    const check = await this.gitOps.apply(patchPath, { check: true })
    if (!check.ok) {
      return {
        ok: false,
        conflict: Boolean(check.conflict),
        patchPath,
        error: check.error ?? "git apply --check rejected the patch",
      }
    }

    // 2. For real.
    const real = await this.gitOps.apply(patchPath)
    if (!real.ok) {
      return {
        ok: false,
        conflict: Boolean(real.conflict),
        patchPath,
        error: real.error ?? "git apply failed after passing --check",
      }
    }

    return { ok: true, patchPath }
  }

  /**
   * Best-effort cleanup of the staging directory. Safe to call multiple
   * times — silently no-ops when the dir is missing.
   */
  async cleanupStaging(): Promise<void> {
    await rm(this.stagingDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
