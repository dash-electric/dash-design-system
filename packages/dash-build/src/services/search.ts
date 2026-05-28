/**
 * Cross-corpus search service — Open WebUI-style full-text search over runs,
 * projects, and generated files (Tier 3 / PR #10 adoption).
 *
 * Scope (intentionally narrow so the surface stays predictable):
 *
 *   - Run prompt text + summary (run.json on disk + in-memory Run records).
 *   - Project names (state.json via the Store).
 *   - File contents shipped by a run (.tsx / .ts / .css / .md under
 *     `<runId>/files/`). Larger binary blobs are skipped.
 *
 * Ranking is a deliberately simple lexical score so the UI can show useful
 * results without pulling a full search index dependency. Score buckets:
 *
 *   prefix match    → 3
 *   exact-word hit  → 2
 *   substring hit   → 1
 *
 * Per-field hits stack so a query that prefix-matches the label AND appears
 * in the snippet ranks above one that only appears in the snippet.
 *
 * Results are de-duplicated by `{type, id}` and capped via `limit` (caller
 * default 20). The runs index walks at most `MAX_RUNS_SCANNED` artifact
 * dirs so a long-running workspace with thousands of runs stays responsive.
 */

import { existsSync } from "node:fs"
import { readFile, readdir, stat } from "node:fs/promises"
import { join } from "node:path"

import type { Store } from "../daemon/state/store.js"
import type { Project, Run } from "../daemon/state/types.js"
import { DEFAULT_RUNS_ROOT, resolveRunDir } from "../runs/artifact-store.js"

export type SearchResultType = "run" | "project" | "file"

export interface SearchResult {
  type: SearchResultType
  /** Stable id for dedupe — runId for runs/files, projectId for projects. */
  id: string
  /** Short label shown in the result row (≤ 80 chars). */
  label: string
  /** Excerpt around the first hit (≤ 160 chars), or null when not available. */
  snippet: string | null
  score: number
  /** ISO 8601 of the underlying record's last update, when available. */
  timestamp: string | null
  /** Only set for `run` + `file` rows so the UI can route to /workspace/:id. */
  runId?: string
  /** Only set for `file` rows — relative path inside the run's files/ dir. */
  path?: string
}

export interface SearchOptions {
  query: string
  limit?: number
  /** Override the on-disk runs root (test-only). */
  runsRoot?: string
}

/** Cap how many run dirs we scan per request — protects against runaway IO. */
const MAX_RUNS_SCANNED = 200

/** Cap how many files per run we open — protects against bundled vendor dumps. */
const MAX_FILES_PER_RUN = 40

/** Max file bytes to scan; files above this are skipped silently. */
const MAX_FILE_BYTES = 256 * 1024

/** File extensions we actually scan for content matches. */
const SCANNABLE_EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".css", ".md"])

/** Snippet window radius around the first hit. */
const SNIPPET_RADIUS = 60

function clampLabel(value: string, max = 80): string {
  if (value.length <= max) return value
  return value.slice(0, max - 1) + "…"
}

function makeSnippet(haystack: string, needle: string): string | null {
  if (!haystack) return null
  const lower = haystack.toLowerCase()
  const idx = lower.indexOf(needle)
  if (idx < 0) return null
  const start = Math.max(0, idx - SNIPPET_RADIUS)
  const end = Math.min(haystack.length, idx + needle.length + SNIPPET_RADIUS)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < haystack.length ? "…" : ""
  // Collapse internal whitespace so the snippet stays single-line in the UI.
  const slice = haystack.slice(start, end).replace(/\s+/g, " ").trim()
  return clampLabel(prefix + slice + suffix, 160)
}

/**
 * Score a single field against the query. Returns 0 when no hit.
 *
 * Buckets stack additively for the multi-field case (caller sums field
 * scores into the result.score) so we don't have to special-case "label hit
 * AND snippet hit" upstream.
 */
export function scoreField(field: string, query: string): number {
  if (!field || !query) return 0
  const lowerField = field.toLowerCase()
  const lowerQuery = query.toLowerCase()
  if (lowerField.startsWith(lowerQuery)) return 3
  // Word boundary — \b doesn't handle every Unicode case but we're scoring
  // mostly ASCII identifiers + prompt text, which is fine.
  const wordRe = new RegExp(`\\b${escapeRegex(lowerQuery)}\\b`)
  if (wordRe.test(lowerField)) return 2
  if (lowerField.includes(lowerQuery)) return 1
  return 0
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Normalise the raw query string. Strips outer whitespace and lowercases
 * once so callers don't pay the cost per-field.
 */
function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase()
}

function projectResults(projects: Project[], query: string): SearchResult[] {
  const out: SearchResult[] = []
  for (const p of projects) {
    const labelScore = scoreField(p.name, query)
    const themeScore = scoreField(p.theme ?? "", query)
    const repoScore = scoreField(p.repoFullName ?? "", query)
    const total = labelScore + themeScore + repoScore
    if (total <= 0) continue
    out.push({
      type: "project",
      id: p.id,
      label: clampLabel(p.name || p.id),
      snippet:
        makeSnippet(p.repoFullName ?? "", query) ??
        makeSnippet(p.theme ?? "", query),
      score: total,
      timestamp: p.createdAt ?? null,
    })
  }
  return out
}

interface RunIndexEntry {
  runId: string
  prompt: string
  summary: string
  updatedAt: string | null
  artifactDir: string | null
}

/**
 * Build a small in-memory index of runs from the Store plus a best-effort
 * read of `runs/<id>/run.json` for prompts that have a persisted summary.
 *
 * Returns at most `MAX_RUNS_SCANNED` entries — runs are ordered by Store
 * insertion (most-recent first when the Store maintains that order).
 */
async function buildRunIndex(
  store: Store,
  runsRoot: string,
): Promise<RunIndexEntry[]> {
  // Pull runs across every project/thread so search isn't scoped to the
  // active workspace. The Store doesn't expose a flat list, so we walk
  // projects → threads → runs once.
  const entries: RunIndexEntry[] = []
  const projects = store.getProjects()
  outer: for (const project of projects) {
    const threads = store.getThreads(project.id)
    for (const thread of threads) {
      const runs = store.getRuns(thread.id)
      for (const run of runs) {
        entries.push(runEntryFromMemory(run))
        if (entries.length >= MAX_RUNS_SCANNED) break outer
      }
    }
  }

  // Best-effort enrichment — read run.json for any entry that doesn't have
  // a summary baked into the in-memory record. We do this serially so the
  // total IO is bounded by MAX_RUNS_SCANNED.
  for (const entry of entries) {
    if (entry.summary) continue
    const dir = entry.artifactDir ?? resolveRunDir(entry.runId, runsRoot)
    const summary = await readRunSummaryText(dir)
    if (summary) entry.summary = summary
  }
  return entries
}

function runEntryFromMemory(run: Run): RunIndexEntry {
  return {
    runId: run.id,
    prompt: run.prompt ?? "",
    summary: "",
    updatedAt: run.updatedAt ?? run.createdAt ?? null,
    artifactDir: run.artifactDir ?? null,
  }
}

async function readRunSummaryText(runDir: string): Promise<string> {
  if (!existsSync(runDir)) return ""
  try {
    const raw = await readFile(join(runDir, "run.json"), "utf8")
    const parsed = JSON.parse(raw) as { explanation?: unknown; prompt?: unknown }
    const parts: string[] = []
    if (typeof parsed.explanation === "string") parts.push(parsed.explanation)
    if (typeof parsed.prompt === "string") parts.push(parsed.prompt)
    return parts.join("\n")
  } catch {
    return ""
  }
}

function runResults(entries: RunIndexEntry[], query: string): SearchResult[] {
  const out: SearchResult[] = []
  for (const entry of entries) {
    const promptScore = scoreField(entry.prompt, query)
    const summaryScore = scoreField(entry.summary, query)
    const total = promptScore + summaryScore
    if (total <= 0) continue
    out.push({
      type: "run",
      id: entry.runId,
      label: clampLabel(entry.prompt || entry.runId),
      snippet:
        makeSnippet(entry.prompt, query) ?? makeSnippet(entry.summary, query),
      score: total,
      timestamp: entry.updatedAt,
      runId: entry.runId,
    })
  }
  return out
}

interface FileHit {
  runId: string
  path: string
  content: string
  updatedAt: string | null
}

/**
 * Walk `<runDir>/files/` and collect candidate text files. Caps total files
 * read at MAX_FILES_PER_RUN to keep search latency bounded.
 */
async function collectFilesForRun(entry: RunIndexEntry): Promise<FileHit[]> {
  const filesDir = entry.artifactDir
    ? join(entry.artifactDir, "files")
    : null
  if (!filesDir || !existsSync(filesDir)) return []
  const out: FileHit[] = []
  let scanned = 0
  async function walk(dir: string, rel: string): Promise<void> {
    if (scanned >= MAX_FILES_PER_RUN) return
    let dirents
    try {
      dirents = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const dirent of dirents) {
      if (scanned >= MAX_FILES_PER_RUN) return
      const full = join(dir, dirent.name)
      const relPath = rel ? `${rel}/${dirent.name}` : dirent.name
      if (dirent.isDirectory()) {
        await walk(full, relPath)
        continue
      }
      const dot = dirent.name.lastIndexOf(".")
      if (dot < 0) continue
      const ext = dirent.name.slice(dot).toLowerCase()
      if (!SCANNABLE_EXTS.has(ext)) continue
      let info
      try {
        info = await stat(full)
      } catch {
        continue
      }
      if (info.size > MAX_FILE_BYTES) continue
      let content
      try {
        content = await readFile(full, "utf8")
      } catch {
        continue
      }
      out.push({
        runId: entry.runId,
        path: relPath,
        content,
        updatedAt: info.mtime.toISOString(),
      })
      scanned += 1
    }
  }
  await walk(filesDir, "")
  return out
}

function fileResults(hits: FileHit[], query: string): SearchResult[] {
  const out: SearchResult[] = []
  for (const hit of hits) {
    const pathScore = scoreField(hit.path, query)
    const contentScore = scoreField(hit.content, query)
    const total = pathScore + contentScore
    if (total <= 0) continue
    out.push({
      type: "file",
      // Composite id keeps dedupe stable per (run, path).
      id: `${hit.runId}:${hit.path}`,
      label: clampLabel(hit.path),
      snippet: makeSnippet(hit.content, query) ?? null,
      score: total,
      timestamp: hit.updatedAt,
      runId: hit.runId,
      path: hit.path,
    })
  }
  return out
}

function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  const out: SearchResult[] = []
  for (const r of results) {
    const key = `${r.type}:${r.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(r)
  }
  return out
}

/**
 * Public search entry-point. Always resolves with a result list (never
 * throws) so the daemon route can hand the array straight to the client.
 */
export async function searchAll(
  store: Store,
  options: SearchOptions,
): Promise<SearchResult[]> {
  const query = normalizeQuery(options.query ?? "")
  if (query.length === 0) return []
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100))
  const runsRoot = options.runsRoot ?? DEFAULT_RUNS_ROOT

  const projects = store.getProjects()
  const runEntries = await buildRunIndex(store, runsRoot)

  // File scan is the heaviest step — only do it for runs that already have
  // an on-disk artifact dir, and serially to keep request pressure low.
  const fileHits: FileHit[] = []
  for (const entry of runEntries) {
    if (!entry.artifactDir) continue
    const hits = await collectFilesForRun(entry)
    for (const hit of hits) fileHits.push(hit)
  }

  const merged: SearchResult[] = [
    ...projectResults(projects, query),
    ...runResults(runEntries, query),
    ...fileResults(fileHits, query),
  ]

  merged.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // Stable tiebreak: most-recent timestamp first, then shorter label.
    const aTs = a.timestamp ? Date.parse(a.timestamp) : 0
    const bTs = b.timestamp ? Date.parse(b.timestamp) : 0
    if (bTs !== aTs) return bTs - aTs
    return a.label.length - b.label.length
  })
  return dedupeResults(merged).slice(0, limit)
}

// ── Test helpers ──────────────────────────────────────────────────────────

export const __testing = {
  scoreField,
  makeSnippet,
  normalizeQuery,
  MAX_RUNS_SCANNED,
  MAX_FILES_PER_RUN,
  MAX_FILE_BYTES,
}
