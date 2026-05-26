/**
 * Design context loader.
 *
 * Loads the global Dash design contract + Layer 0 foundation +
 * Layered Architecture rules from the dash-ds repo so they can be spliced
 * into the generation system prompt. Reads:
 *
 *   - design.md                                                      (global cross-repo design contract)
 *   - apps/docs/registry/dash/foundation/rules/cardinal-rules.md   (CR-1..CR-8)
 *   - apps/docs/registry/dash/foundation/voice/voice-rules.md      (formal Anda)
 *   - apps/docs/registry/dash/foundation/manifest.json             (tokens + brand)
 *   - ARCHITECTURE.md                                               (decision tree)
 *
 * Resilient: every file is independently optional. If `foundation/` doesn't
 * exist (e.g. shallow clone), the loader still returns a DesignContext with
 * empty strings + a `missingSources` list. Never throws.
 */

import { promises as fs, existsSync } from "node:fs"
import path from "node:path"
import type { DesignContext, FoundationManifest } from "./types.js"

function hasDashFoundation(dir: string): boolean {
  return existsSync(path.join(dir, "apps", "docs", "registry", "dash", "foundation"))
}

function findFoundationRoot(startDir: string): string | null {
  let cur = path.resolve(startDir)
  for (let i = 0; i < 12; i++) {
    if (hasDashFoundation(cur)) return cur
    const parent = path.dirname(cur)
    if (parent === cur) break
    cur = parent
  }
  return null
}

/** Walk up until we hit the dash-ds foundation; fall back gracefully. */
export function findRepoRoot(startDir: string): string {
  let cur = path.resolve(startDir)
  let firstGitRoot: string | null = null

  for (let i = 0; i < 12; i++) {
    if (hasDashFoundation(cur)) return cur
    if (!firstGitRoot && existsSync(path.join(cur, ".git"))) firstGitRoot = cur
    const parent = path.dirname(cur)
    if (parent === cur) break
    cur = parent
  }

  const envRoot = process.env.DASH_DS_ROOT
  if (envRoot && hasDashFoundation(path.resolve(envRoot))) return path.resolve(envRoot)

  const cwdRoot = findFoundationRoot(process.cwd())
  if (cwdRoot) return cwdRoot

  return firstGitRoot ?? startDir
}

async function tryReadText(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8")
  } catch {
    return null
  }
}

async function tryReadJson<T>(p: string): Promise<T | null> {
  const txt = await tryReadText(p)
  if (!txt) return null
  try {
    return JSON.parse(txt) as T
  } catch {
    return null
  }
}

export interface LoadDesignOpts {
  /** Repo root override. Defaults to walking up from cwd. */
  repoRoot?: string
  /** cwd to start search from (used when `repoRoot` is not provided). */
  cwd?: string
}

const FALLBACK_LAYERED = `# Layered Architecture (fallback summary)

Layer 0 — Brand foundation (locked tokens, voice, cardinal rules).
Layer 1 — Common primitives (atom components consuming Layer 0 tokens).
Layer 2 — Product / tenant theme (accent + voice + density overrides).
Layer 3 — Workflow blocks (composites scoped to a product, e.g. ride-dispatch-board).

Decision:
  - Atom reusable across products → Layer 1.
  - Composite tied to one product workflow → Layer 3 (registry theme: <product>).
  - Brand / voice / density tweak → Layer 2 manifest, NEVER touch Layer 1 source.
  - Type ramp / spacing / motion / token tier → Layer 0 RFC required. Stop and ask.
`

export async function loadDesignContext(
  opts: LoadDesignOpts = {},
): Promise<DesignContext> {
  const cwd = opts.cwd ?? process.cwd()
  const repoRoot = opts.repoRoot ?? findRepoRoot(cwd)
  const foundationDir = path.join(repoRoot, "apps", "docs", "registry", "dash", "foundation")

  const loaded: string[] = []
  const missing: string[] = []

  const cardinalPath = path.join(foundationDir, "rules", "cardinal-rules.md")
  const voicePath = path.join(foundationDir, "voice", "voice-rules.md")
  const manifestPath = path.join(foundationDir, "manifest.json")
  const layeredPath = path.join(repoRoot, "ARCHITECTURE.md")
  const designContractPath = path.join(repoRoot, "design.md")

  const [designContract, cardinalRules, voiceRules, layered, manifest] = await Promise.all([
    tryReadText(designContractPath),
    tryReadText(cardinalPath),
    tryReadText(voicePath),
    tryReadText(layeredPath),
    tryReadJson<FoundationManifest>(manifestPath),
  ])

  for (const [val, p] of [
    [designContract, designContractPath],
    [cardinalRules, cardinalPath],
    [voiceRules, voicePath],
    [layered, layeredPath],
    [manifest, manifestPath],
  ] as const) {
    if (val) loaded.push(p)
    else missing.push(p)
  }

  return {
    designContract: designContract ?? "",
    cardinalRules: cardinalRules ?? "",
    voiceRules: voiceRules ?? "",
    manifest,
    layeredArchitecture: layered ?? FALLBACK_LAYERED,
    loadedSources: loaded,
    missingSources: missing,
  }
}
