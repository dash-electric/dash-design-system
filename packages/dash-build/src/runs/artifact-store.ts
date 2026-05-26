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
  ParsedFile,
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
  validation: ValidationResult
  explanation: string
  contextPack?: RepoContextPack
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

  return { runDir, contextPackRef, fileCount: writtenCount }
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
