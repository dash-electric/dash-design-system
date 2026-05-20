/**
 * Wraps @dash/skill v4 (`loadDashSkill`) for the build-time skill chain.
 *
 * Why a wrapper:
 *   - Normalises shape (we only need systemAppend + sources + detectedRepoStack).
 *   - Forces v4 freshness cache on by default (every prompt re-checks fingerprint).
 *   - Degrades to an empty context when @dash/skill throws (broken cache, missing
 *     CLI, non-Dash repo).
 */

import { loadDashSkill } from "@dash/skill"
import type { SkillContext } from "./types.js"

export interface LoadSkillOpts {
  /** Repo root the user is generating against. */
  repoPath: string
  /** Force re-scan of `dash info --json` even when fingerprint matches. */
  forceRefresh?: boolean
}

export async function loadSkillContext(opts: LoadSkillOpts): Promise<SkillContext> {
  try {
    const result = await loadDashSkill({
      cwd: opts.repoPath,
      version: 2, // priority-pinned + per-repo scoped is the build daemon's sweet spot
      forceRefresh: opts.forceRefresh,
    })

    return {
      systemAppend: result.systemAppend ?? "",
      sources: result.metadata?.sources ?? [],
      detectedRepoStack: result.metadata?.detectedRepoStack ?? null,
      schemaVersion: result.metadata?.schemaVersion ?? 2,
    }
  } catch {
    return {
      systemAppend: "",
      sources: [],
      detectedRepoStack: null,
      schemaVersion: 0,
    }
  }
}
