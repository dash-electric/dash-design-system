/**
 * Restart-safe persistence for Run artifacts (P1.0 slice).
 *
 * Layout: <root>/<runId>/
 *   ├── run.json       — summary: prompt, repo/branch, validation, file index
 *   ├── context.json   — frozen RepoContextPack (if available)
 *   └── files/<path>   — generated file contents
 *
 * The on-disk run dir is separate from the preview bundle dir
 * (~/.dash-build/preview/<id>) so cleanup of one does not erase the other.
 */

import { existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join, resolve, sep } from "node:path"
import type {
  IntakeContext,
  ParsedFile,
  ParsedPatch,
  RepoContextPack,
  ValidationResult,
} from "../skills/types.js"

export const DEFAULT_RUNS_ROOT = join(homedir(), ".dash-build", "runs")

function sanitize(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]/g, "_")
}

export function resolveRunDir(runId: string, root: string = DEFAULT_RUNS_ROOT): string {
  return join(root, sanitize(runId))
}

export interface RunArtifactPayload {
  runId: string
  prompt: string
  repo: string | null
  branch: string | null
  generatedAt: string
  files: ParsedFile[]
  /**
   * Sprint 2B / Tier 2 #4 — patches against existing files. Persisted to
   * `<runDir>/patches.json` so the workspace Diff tab can render them on
   * cold load without going back through the orchestrator.
   */
  patches?: ParsedPatch[]
  validation: ValidationResult
  explanation: string
  contextPack?: RepoContextPack
  /**
   * Tier 0 #0O — auth path the run used (`codex-cli`, `byo-key`, `none`).
   * Persisted to `run.json` so a user inspecting the on-disk artifact can
   * see whether Codex CLI or BYO key powered the generation. Optional for
   * back-compat with the stub provider used in unit tests.
   */
  providerMode?: "codex-cli" | "byo-key" | "none" | null
}

/**
 * Surfaced intake snapshot persisted at `<runDir>/intake.json`. Mirrors the
 * shape consumed by `loadInitialPreview` (`contextMap.be` / `audit`) plus a
 * compact list of FE patterns the chain matched on. Keeping the shape narrow
 * keeps the on-disk JSON readable for ops debugging without bloating disk.
 */
export interface IntakeSnapshot {
  scenario: string
  beEndpoints: Array<{ method: string; path: string; file: string }>
  dbSchema: { tables: string[]; prismaPath?: string | null }
  fePatterns: Array<{ name: string; path: string; excerpt?: string }>
  audit: {
    detected: boolean
    reasonsCode: string[]
    requiredFields: string[]
  }
}

/**
 * Project an IntakeContext into the compact on-disk snapshot. Lives here
 * (next to writeRunArtifacts) so any consumer reaching for the snapshot stays
 * in lockstep with the writer.
 */
export function snapshotFromIntake(intake: IntakeContext): IntakeSnapshot {
  const prismaPath =
    intake.dbCatalog.tables.find((t) => t.source === "prisma")?.filePath ?? null
  return {
    scenario: intake.classification.scenario,
    beEndpoints: intake.beCatalog.endpoints.slice(0, 50).map((ep) => ({
      method: ep.method,
      path: ep.path,
      file: ep.filePath,
    })),
    dbSchema: {
      tables: intake.dbCatalog.tables.map((t) => t.name),
      prismaPath,
    },
    fePatterns: (intake.classification.affectedFiles?.fe ?? [])
      .slice(0, 30)
      .map((p) => ({
        name: p.split(/[\\/]/).pop() ?? p,
        path: p,
      })),
    audit: {
      detected: intake.auditTrail.required,
      reasonsCode: intake.auditTrail.required
        ? [intake.auditTrail.pattern]
        : [],
      requiredFields: intake.auditTrail.fieldsToLog,
    },
  }
}

export async function writeIntakeSnapshot(
  runId: string,
  snapshot: IntakeSnapshot,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<string> {
  const runDir = resolveRunDir(runId, root)
  await mkdir(runDir, { recursive: true })
  const file = join(runDir, "intake.json")
  await writeFile(file, JSON.stringify(snapshot, null, 2), "utf8")
  return file
}

export async function readIntakeSnapshot(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<IntakeSnapshot | null> {
  const file = join(resolveRunDir(runId, root), "intake.json")
  if (!existsSync(file)) return null
  try {
    return JSON.parse(await readFile(file, "utf8")) as IntakeSnapshot
  } catch {
    return null
  }
}

export interface RunArtifactWriteResult {
  runDir: string
  contextPackRef: string | null
  fileCount: number
}

function safeRelative(filePath: string, base: string): string | null {
  if (filePath.includes("\0")) return null
  const joined = resolve(base, filePath)
  const baseResolved = resolve(base)
  if (joined !== baseResolved && !joined.startsWith(baseResolved + sep)) {
    return null
  }
  return joined
}

export async function writeRunArtifacts(
  payload: RunArtifactPayload,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<RunArtifactWriteResult> {
  const runDir = resolveRunDir(payload.runId, root)
  await mkdir(runDir, { recursive: true })

  await writeFile(
    join(runDir, "run.json"),
    JSON.stringify(
      {
        runId: payload.runId,
        prompt: payload.prompt,
        repo: payload.repo,
        branch: payload.branch,
        generatedAt: payload.generatedAt,
        explanation: payload.explanation,
        validation: payload.validation,
        fileCount: payload.files.length,
        providerMode: payload.providerMode ?? null,
      },
      null,
      2,
    ),
    "utf8",
  )

  let contextPackRef: string | null = null
  if (payload.contextPack) {
    const contextPath = join(runDir, "context.json")
    await writeFile(contextPath, JSON.stringify(payload.contextPack, null, 2), "utf8")
    contextPackRef = contextPath
  }

  const filesDir = join(runDir, "files")
  await mkdir(filesDir, { recursive: true })
  let writtenCount = 0
  for (const file of payload.files) {
    const dest = safeRelative(file.path, filesDir)
    if (!dest) continue
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, file.content, "utf8")
    writtenCount += 1
  }

  // Tier 2 #4 — persist patches alongside files so the Diff tab can render
  // them on cold load. Empty / missing patch list intentionally writes
  // nothing so existing run dirs stay byte-stable.
  if (payload.patches && payload.patches.length > 0) {
    await writeFile(
      join(runDir, "patches.json"),
      JSON.stringify(
        payload.patches.map((p) => ({
          kind: "patch",
          path: p.path,
          language: p.language,
          patchContent: p.patchContent,
        })),
        null,
        2,
      ),
      "utf8",
    )
  }

  return { runDir, contextPackRef, fileCount: writtenCount }
}

/**
 * Read patches persisted by `writeRunArtifacts`. Returns an empty array when
 * the file is missing or malformed — callers should treat that as "no diff
 * available" rather than an error.
 */
export async function readRunPatches(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<ParsedPatch[]> {
  const file = join(resolveRunDir(runId, root), "patches.json")
  if (!existsSync(file)) return []
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as unknown
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (e): e is ParsedPatch =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as ParsedPatch).path === "string" &&
          typeof (e as ParsedPatch).patchContent === "string",
      )
      .map((e) => ({
        kind: "patch" as const,
        path: e.path,
        language: typeof e.language === "string" ? e.language : "diff",
        patchContent: e.patchContent,
      }))
  } catch {
    return []
  }
}

export async function readRunSummary(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<unknown | null> {
  const file = join(resolveRunDir(runId, root), "run.json")
  if (!existsSync(file)) return null
  try {
    return JSON.parse(await readFile(file, "utf8"))
  } catch {
    return null
  }
}

export async function removeRunArtifacts(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<boolean> {
  const dir = resolveRunDir(runId, root)
  if (!existsSync(dir)) return false
  await rm(dir, { recursive: true, force: true })
  return true
}

// ---------------------------------------------------------------------------
// Open WebUI #A4 — A/B variant persistence.
//
// When the user opts in to dual-variant mode (variantCount=2), the orchestrator
// runs the skill chain twice in parallel with slight temperature variation and
// persists each output to `<runDir>/variants/<variantId>/files/*`. A sibling
// `variants.json` records the active winner + the metadata list the UI uses
// to render the split-view comparison.
//
// Layout when variants are persisted:
//   <runDir>/
//     ├── run.json
//     ├── files/                   ← canonical "winner" copy (always present)
//     ├── variants.json            ← { active, list: [{id, summary, score, ...}] }
//     └── variants/
//         ├── a/
//         │   ├── files/<path>
//         │   ├── component-source.txt   ← pre-picked source for cold-load
//         │   └── meta.json              ← validation + explanation excerpt
//         └── b/ …
//
// `variantId` is always a single lowercase letter ('a' / 'b'). Future versions
// could expand to {a,b,c,d} for parallel n-of-many; for now we cap at 2 to
// keep parallel LLM cost predictable.
// ---------------------------------------------------------------------------

const VARIANT_ID_RE = /^[a-z]$/

function sanitizeVariantId(id: string): string {
  if (!VARIANT_ID_RE.test(id)) {
    throw new Error(
      `invalid variantId "${id}" — expected single lowercase letter (a..z)`,
    )
  }
  return id
}

export interface VariantMetaSummary {
  /** Single-letter variant id (e.g. 'a', 'b'). */
  id: string
  /** Short human-readable summary surfaced to the UI (≤120 chars). */
  summary: string
  /** Validator score (0-100). */
  score: number
  /** Whether the validator passed for this variant. */
  passed: boolean
  /** File count generated for this variant. */
  fileCount: number
  /** Picked entry component path relative to `files/`. */
  componentPath: string | null
  /** Temperature used for this variant's LLM call (for debugging). */
  temperature: number | null
}

export interface VariantsManifest {
  /** The variant currently selected as canonical (mirrors `<runDir>/files/`). */
  active: string
  /** All variants persisted for this run. */
  list: VariantMetaSummary[]
  /** ISO timestamp when the manifest was last written. */
  updatedAt: string
}

export interface WriteVariantInput {
  runId: string
  variantId: string
  files: ParsedFile[]
  /** Picked main component source for cold-load (already chosen by caller). */
  componentSource: string | null
  componentPath: string | null
  /** Validator + explanation for the variant — persisted to meta.json. */
  meta: {
    score: number
    passed: boolean
    explanation: string
    temperature: number | null
  }
}

export interface WriteVariantResult {
  variantDir: string
  fileCount: number
}

export function resolveVariantDir(
  runId: string,
  variantId: string,
  root: string = DEFAULT_RUNS_ROOT,
): string {
  return join(resolveRunDir(runId, root), "variants", sanitizeVariantId(variantId))
}

/**
 * Persist one variant's output to `<runDir>/variants/<id>/`. Writes:
 *   - files/<path>           — every parsed file
 *   - component-source.txt   — pre-picked main component source (cold-load)
 *   - meta.json              — validation summary + explanation
 *
 * Files outside the variant dir (path traversal) are silently skipped, same
 * guarantee as `writeRunArtifacts`.
 */
export async function writeVariantArtifacts(
  input: WriteVariantInput,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<WriteVariantResult> {
  const variantDir = resolveVariantDir(input.runId, input.variantId, root)
  await mkdir(variantDir, { recursive: true })

  const filesDir = join(variantDir, "files")
  await mkdir(filesDir, { recursive: true })
  let writtenCount = 0
  for (const file of input.files) {
    const dest = safeRelative(file.path, filesDir)
    if (!dest) continue
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, file.content, "utf8")
    writtenCount += 1
  }

  if (input.componentSource !== null) {
    await writeFile(
      join(variantDir, "component-source.txt"),
      input.componentSource,
      "utf8",
    )
  }

  await writeFile(
    join(variantDir, "meta.json"),
    JSON.stringify(
      {
        variantId: sanitizeVariantId(input.variantId),
        componentPath: input.componentPath,
        score: input.meta.score,
        passed: input.meta.passed,
        explanation: input.meta.explanation,
        temperature: input.meta.temperature,
      },
      null,
      2,
    ),
    "utf8",
  )

  return { variantDir, fileCount: writtenCount }
}

/**
 * Read one variant's meta.json. Returns null when the dir doesn't exist or
 * the meta is malformed.
 */
export async function readVariantMeta(
  runId: string,
  variantId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<{
  variantId: string
  componentPath: string | null
  score: number
  passed: boolean
  explanation: string
  temperature: number | null
} | null> {
  const file = join(resolveVariantDir(runId, variantId, root), "meta.json")
  if (!existsSync(file)) return null
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>
    return {
      variantId: typeof raw.variantId === "string" ? raw.variantId : variantId,
      componentPath:
        typeof raw.componentPath === "string" ? raw.componentPath : null,
      score: typeof raw.score === "number" ? raw.score : 0,
      passed: raw.passed === true,
      explanation: typeof raw.explanation === "string" ? raw.explanation : "",
      temperature:
        typeof raw.temperature === "number" ? raw.temperature : null,
    }
  } catch {
    return null
  }
}

/**
 * Read the persisted variant component source for cold-load. Returns null when
 * the file is missing.
 */
export async function readVariantComponentSource(
  runId: string,
  variantId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<string | null> {
  const file = join(
    resolveVariantDir(runId, variantId, root),
    "component-source.txt",
  )
  if (!existsSync(file)) return null
  try {
    return await readFile(file, "utf8")
  } catch {
    return null
  }
}

/**
 * Write the variants manifest. Idempotent — overwrites the previous file.
 */
export async function writeVariantsManifest(
  runId: string,
  manifest: Omit<VariantsManifest, "updatedAt"> & { updatedAt?: string },
  root: string = DEFAULT_RUNS_ROOT,
): Promise<string> {
  const runDir = resolveRunDir(runId, root)
  await mkdir(runDir, { recursive: true })
  const file = join(runDir, "variants.json")
  const payload: VariantsManifest = {
    active: sanitizeVariantId(manifest.active),
    list: manifest.list.map((entry) => ({
      ...entry,
      id: sanitizeVariantId(entry.id),
    })),
    updatedAt: manifest.updatedAt ?? new Date().toISOString(),
  }
  await writeFile(file, JSON.stringify(payload, null, 2), "utf8")
  return file
}

/**
 * Read the variants manifest. Returns null when missing / malformed so the
 * caller can fall back to single-variant cold-load semantics.
 */
export async function readVariantsManifest(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<VariantsManifest | null> {
  const file = join(resolveRunDir(runId, root), "variants.json")
  if (!existsSync(file)) return null
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>
    if (typeof raw.active !== "string" || !Array.isArray(raw.list)) return null
    const list: VariantMetaSummary[] = []
    for (const entry of raw.list) {
      if (!entry || typeof entry !== "object") continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== "string" || !VARIANT_ID_RE.test(e.id)) continue
      list.push({
        id: e.id,
        summary: typeof e.summary === "string" ? e.summary : "",
        score: typeof e.score === "number" ? e.score : 0,
        passed: e.passed === true,
        fileCount: typeof e.fileCount === "number" ? e.fileCount : 0,
        componentPath:
          typeof e.componentPath === "string" ? e.componentPath : null,
        temperature:
          typeof e.temperature === "number" ? e.temperature : null,
      })
    }
    if (list.length === 0) return null
    if (!VARIANT_ID_RE.test(raw.active)) return null
    return {
      active: raw.active,
      list,
      updatedAt:
        typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

/**
 * Promote one variant to the canonical `<runDir>/files/` location. Copies
 * (overwrites) the variant's files over the top-level files dir, so the
 * existing single-variant cold-load reads + downstream PR creation see the
 * picked winner without code changes.
 */
export async function promoteVariantToCanonical(
  runId: string,
  variantId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<{ promoted: boolean; fileCount: number }> {
  const variantDir = resolveVariantDir(runId, variantId, root)
  const variantFilesDir = join(variantDir, "files")
  if (!existsSync(variantFilesDir)) return { promoted: false, fileCount: 0 }
  const runDir = resolveRunDir(runId, root)
  const targetFilesDir = join(runDir, "files")
  // Wipe + recreate canonical files dir so stale loser-files don't linger.
  await rm(targetFilesDir, { recursive: true, force: true })
  await mkdir(targetFilesDir, { recursive: true })

  // Walk variant files dir recursively and copy contents over.
  const { readdir, copyFile } = await import("node:fs/promises")
  let count = 0
  async function walk(srcDir: string, destDir: string): Promise<void> {
    let entries: import("node:fs").Dirent[]
    try {
      entries = await readdir(srcDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const srcPath = join(srcDir, entry.name)
      const destPath = join(destDir, entry.name)
      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true })
        await walk(srcPath, destPath)
        continue
      }
      await copyFile(srcPath, destPath)
      count += 1
    }
  }
  await walk(variantFilesDir, targetFilesDir)
  return { promoted: true, fileCount: count }
}
