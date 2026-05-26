/**
 * Output mode detector — Sprint 2B (Phase C).
 *
 * Phase C goal: when the user prompt edits an EXISTING route/file (e.g.
 * "tambah filter di /provider yang existing"), Dash Build must instruct the
 * model to OUTPUT A PATCH against the current file content rather than
 * regenerating the file from scratch. Patch mode preserves surrounding code
 * (imports, helpers, unrelated UI) and avoids hallucinated rewrites.
 *
 * Heuristic flow:
 *   - Edit-intent keywords + ExistingFilesContext has confident path matches
 *       → "patch"
 *   - Create-intent keywords + no confident path matches
 *       → "new-file"
 *   - Anything else (no resolutions, or mixed signal)
 *       → "mixed" (let the model decide per file via prompt instructions)
 *
 * Pure function. Safe to import from prompt-composer and chain without
 * touching disk or running git.
 *
 * Constraint per Sprint 2B: ZERO new npm deps. Pure regex + string ops.
 */

import type { ExistingFileContent, ExistingFilesContext } from "./types.js"

export type OutputMode = "new-file" | "patch" | "mixed"

/** Words that signal "edit something that already exists". */
const EDIT_VERBS = [
  // English
  "edit",
  "modify",
  "update",
  "change",
  "tweak",
  "adjust",
  "patch",
  "fix",
  "rename",
  "refactor",
  "replace",
  "remove",
  "delete",
  "extend",
  // Bahasa
  "ubah",
  "ganti",
  "tambah", // "tambah X di /route" = edit existing route
  "tambahkan",
  "perbaiki",
  "hapus",
  "edit",
  "pindah",
  "pindahkan",
  "rapikan",
] as const

/** Words that signal "create something brand new". */
const CREATE_VERBS = [
  // English
  "create",
  "new",
  "build",
  "make",
  "generate",
  "scaffold",
  "bootstrap",
  "spin",
  // Bahasa
  "bikin",
  "buat",
  "baru",
] as const

/** Phrases that strongly imply editing an EXISTING surface. */
const EXISTING_HINTS = [
  /\bexisting\b/i,
  /\byang\s+(sudah\s+)?ada\b/i, // "yang ada", "yang sudah ada"
  /\byang\s+existing\b/i,
  /\bdi\s+(halaman|page|route|file)\b/i,
  /\bsudah\s+ada\b/i,
] as const

/** Minimum confidence on a path resolution before we trust it as "this is the file". */
const PATH_CONFIDENCE_THRESHOLD = 0.5

interface DetectInput {
  prompt: string
  existingFiles?: ExistingFilesContext | null
}

/**
 * Tokenize prompt to lowercase words (alphanumeric + dash + slash). Cheap, no
 * dep, used to make verb matching word-boundary safe so "creates" doesn't
 * accidentally match "create".
 */
function wordSet(prompt: string): Set<string> {
  const out = new Set<string>()
  const matches = prompt.toLowerCase().match(/[a-z0-9_/-]+/g) ?? []
  for (const m of matches) out.add(m)
  return out
}

function hasAnyVerb(words: Set<string>, verbs: readonly string[]): boolean {
  for (const v of verbs) {
    if (words.has(v)) return true
  }
  return false
}

function hasExistingHint(prompt: string): boolean {
  for (const re of EXISTING_HINTS) {
    if (re.test(prompt)) return true
  }
  return false
}

/**
 * Detect the output mode for a generation request.
 *
 *   - "patch"     — model MUST emit unified diffs against files in
 *                   ExistingFilesContext. Used when prompt has edit intent
 *                   and the path-resolver surfaced at least one confident
 *                   match.
 *   - "new-file"  — model MUST emit full file bodies. Used when prompt has
 *                   create intent and no confident path match exists.
 *   - "mixed"     — let the model decide per file based on whether each
 *                   target path appears in CURRENT FILE STATE.
 */
export function detectOutputMode(input: DetectInput): OutputMode {
  const prompt = input.prompt ?? ""
  const words = wordSet(prompt)
  const editIntent = hasAnyVerb(words, EDIT_VERBS) || hasExistingHint(prompt)
  const createIntent = hasAnyVerb(words, CREATE_VERBS)

  const resolutions = input.existingFiles?.resolutions ?? []
  const files = input.existingFiles?.files ?? []
  const hasConfidentResolution = resolutions.some(
    (r) => r.confidence >= PATH_CONFIDENCE_THRESHOLD,
  )
  const hasAnyFile = files.length > 0

  // Strong patch signal: edit intent + a real existing file was read.
  if (editIntent && hasAnyFile) {
    // If the prompt also screams "new" loudly, drop to mixed so the model
    // can split — e.g. "edit /provider and create a new modal".
    if (createIntent && !hasExistingHint(prompt)) {
      return "mixed"
    }
    return "patch"
  }

  // Pure create intent with no confident path matches.
  if (createIntent && !hasConfidentResolution) {
    return "new-file"
  }

  // Edit intent but no files surfaced — model has nothing to patch against,
  // so fall back to mixed and let it ask for paths or emit new files.
  if (editIntent && !hasAnyFile) {
    return hasConfidentResolution ? "patch" : "mixed"
  }

  // Nothing decisive — be permissive.
  return "mixed"
}

/**
 * Per-file heuristic: should THIS file be edited (patch) rather than
 * recreated? Used by the validator + orchestrator when iterating through
 * parsed output. A file should be patched when:
 *
 *   1. It's part of the ExistingFilesContext (the model was shown its
 *      current content), AND
 *   2. The prompt mentions either editing OR the file's route/path.
 *
 * Pure — no I/O. Safe to call inside hot paths.
 */
export function shouldEditExisting(
  file: ExistingFileContent,
  prompt: string,
): boolean {
  if (!file) return false
  const promptLc = prompt.toLowerCase()
  const pathLc = file.filePath.toLowerCase()
  const words = wordSet(prompt)
  const editIntent = hasAnyVerb(words, EDIT_VERBS) || hasExistingHint(prompt)
  if (!editIntent) return false
  // If the prompt explicitly mentions the file's path/basename, it's a
  // strong patch signal even without an EDIT_VERBS hit.
  const basename = pathLc.split("/").pop() ?? ""
  if (basename && promptLc.includes(basename)) return true
  // Otherwise rely on the global edit intent.
  return true
}

/**
 * Render a one-line instruction the prompt-composer can drop into the
 * "OUTPUT FORMAT" section so the model has unambiguous orders.
 */
export function describeOutputMode(mode: OutputMode): string {
  switch (mode) {
    case "patch":
      return "Output mode = PATCH. Every file you touch MUST use ```mode=patch [path]``` with a valid unified diff against the CURRENT FILE STATE shown above. Do NOT regenerate full file bodies for files listed in CURRENT FILE STATE."
    case "new-file":
      return "Output mode = NEW-FILE. Emit complete file bodies via ```mode=new-file [path]```. No CURRENT FILE STATE was injected — there is nothing to patch."
    case "mixed":
    default:
      return "Output mode = MIXED. For each file: if the path appears in CURRENT FILE STATE, use ```mode=patch [path]``` with a unified diff; otherwise use ```mode=new-file [path]``` with the full file body."
  }
}
