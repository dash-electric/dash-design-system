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
