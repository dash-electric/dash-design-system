/**
 * Cold-load preview initial blob — picks the "main" component source from a
 * persisted run artifact on disk so the workspace template can inject it via
 *
 *   <script>window.__DASH_PREVIEW_INIT = {…}</script>
 *
 * BEFORE the client-side `preview-mount.js` runs. Without this, a direct
 * navigation to `/workspace/:runId` (no fresh prompt) sits at the placeholder
 * forever because the SSE `component:updated` event only fires during the
 * active orchestrator run.
 *
 * Scope (kept narrow, on purpose):
 *   - Only new-file artifacts are supported. Patch-only artifacts need the
 *     sandbox clone (which the route handler doesn't have access to), so we
 *     skip and leave the placeholder visible. The SSE flow still works on
 *     subsequent live runs.
 *   - Failures are silent: missing dir, malformed run.json, no UI file, or a
 *     banned-import gate hit all return `null`. The page renders normally
 *     and the user just sees the placeholder.
 *
 * Spec: ties to docs/specs/component-preview-architecture-2026-05-28.md
 */

import { existsSync } from "node:fs"
import { readFile, readdir, stat } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import {
  DEFAULT_RUNS_ROOT,
  readIntakeSnapshot,
  readRunPatches,
  resolveRunDir,
  type IntakeSnapshot,
} from "../runs/artifact-store.js"
import {
  detectBannedImports,
  detectDashDsImports,
} from "../services/component-preview.js"
import type {
  AuditSnapshot,
  BeImpactSnapshot,
  DiffSnapshotEntry,
  FileSnapshotEntry,
  ValidationSnapshot,
} from "./templates/components/preview-panel.js"

export interface PreviewInitialBlob {
  /** Stable id the client script matches against `data-component-id`. */
  componentId: string
  /** Raw TSX/JSX source ready to feed Sandpack. */
  componentSource: string
  /** Context-map fields shown in the panel footer. */
  contextMap: {
    landsAt: string | null
    uses: string[]
    be: string[]
    audit: string | null
  }
  /**
   * Tier 2 #4 — Diff tab cold-load payload. Mixes persisted patches with a
   * synthetic "+++ new file" entry for the picked component file so the
   * Diff tab is meaningful for both patch-mode and greenfield runs.
   * Optional so older callers / tests that construct blobs inline still
   * compile — workspace.ts coerces `undefined` to `null`.
   */
  diffSnapshot?: DiffSnapshotEntry[]
  /**
   * Tier 2 #4a — BE Impact cold-load payload. Derived from
   * `<runDir>/intake.json`. Optional so older blobs still typecheck.
   */
  beImpactSnapshot?: BeImpactSnapshot
  /**
   * Tier 2 #4b — Audit cold-load payload. Mixes intake.audit (prompt-time
   * CR-3 trigger) with validator events from events.jsonl (post-generation
   * outcome). Optional so older blobs still typecheck.
   */
  auditSnapshot?: AuditSnapshot
  /**
   * Tier 2 #4c — Files cold-load payload. Listing of `<runDir>/files/`
   * walked alphabetically with directories first.
   */
  filesSnapshot?: FileSnapshotEntry[]
  /**
   * Tier 2 #7 — Validation cold-load payload. Aggregates validator findings
   * from events.jsonl so the Diff tab surfaces validator outcomes inline
   * (rule ids hit, severity counts, pass/fail).
   */
  validationSnapshot?: ValidationSnapshot
}

interface DiscoveredFile {
  /** Path RELATIVE to `<runDir>/files/`, using forward slashes. */
  path: string
  content: string
  size: number
}

// ---------------------------------------------------------------------------
// Tier 2 #4a / #4b / #4c / #7 — snapshot builders.
//
// These all degrade gracefully: any read failure returns `null` / an empty
// snapshot, never throws. Cold-load is best-effort; an in-flight or partially
// persisted run still renders the placeholder. The Sandpack mount and SSE
// flow are unaffected.
// ---------------------------------------------------------------------------

/**
 * Required-endpoint inference per scenario. Mirrors the orchestrator's
 * scenario-classifier vocabulary (`extend_fe_be`, `new_feature_fe_be`,
 * `fe_only`, `bugfix_existing`). Kept narrow on purpose — we surface the
 * most useful prompt-time hint without trying to be an exhaustive planner.
 */
function inferRequiredEndpoints(
  scenario: string | null,
  existing: Array<{ method: string; path: string }>,
): Array<{ description: string; scenario?: string }> {
  if (!scenario) return []
  const lower = scenario.toLowerCase()
  const out: Array<{ description: string; scenario?: string }> = []
  if (lower.includes("extend") || lower.includes("aggregate")) {
    const sample = existing[0]
    if (sample) {
      out.push({
        description: `${sample.method} ${sample.path}/aggregate (extend existing endpoint)`,
        scenario,
      })
    } else {
      out.push({
        description: "New aggregate endpoint to back the extended FE view",
        scenario,
      })
    }
  }
  if (lower.includes("new_feature") || lower.includes("new-feature")) {
    out.push({
      description: "New BE route + handler for the feature surface",
      scenario,
    })
  }
  return out
}

function buildBeImpactSnapshot(
  intake: IntakeSnapshot | null,
): BeImpactSnapshot | null {
  if (!intake) return null
  const existing = intake.beEndpoints.slice(0, 30).map((ep) => ({
    method: ep.method,
    path: ep.path,
    file: ep.file,
  }))
  const dbTables = (intake.dbSchema.tables ?? []).map((name) => ({ name }))
  const requiredEndpoints = inferRequiredEndpoints(
    intake.scenario ?? null,
    existing,
  )
  return {
    scenario: intake.scenario ?? null,
    existingEndpoints: existing,
    dbTables,
    requiredEndpoints,
  }
}

/**
 * Walk additions of a unified diff and pull out tokens that look like audit
 * call sites. Mirrors the regex in skills/validator.ts so the UI surface and
 * the validator stay aligned without sharing state.
 */
const AUDIT_CALL_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bauditLog\s*\.\s*create\s*\(/, label: "auditLog.create(...)" },
  { re: /\bwriteAuditLog\s*\(/, label: "writeAuditLog(...)" },
  { re: /\blogAudit\s*\(/, label: "logAudit(...)" },
  { re: /\baudit\s*\.\s*(?:create|log)\s*\(/, label: "audit.create(...)" },
  { re: /\baudit_log\s*\.\s*create\s*\(/, label: "audit_log.create(...)" },
]

function detectAuditCallsInFiles(files: DiscoveredFile[]): string[] {
  const hits = new Set<string>()
  for (const file of files) {
    for (const { re, label } of AUDIT_CALL_PATTERNS) {
      if (re.test(file.content)) hits.add(label)
    }
  }
  return Array.from(hits)
}

function buildAuditSnapshot(
  intake: IntakeSnapshot | null,
  files: DiscoveredFile[],
  validationEvents: ValidationEvent[],
): AuditSnapshot | null {
  // No intake snapshot AND no validation events means we don't have enough
  // signal — fall back to placeholder.
  if (!intake && validationEvents.length === 0) return null

  const detected = intake?.audit.detected ?? false
  const sensitiveFields = intake?.audit.requiredFields ?? []
  const pattern = intake?.audit.reasonsCode[0] ?? null
  const auditCalls = detectAuditCallsInFiles(files)

  // Map validator findings related to CR-3 / audit into the checklist.
  const auditChecks: AuditSnapshot["validatorChecks"] = []
  for (const ev of validationEvents) {
    for (const check of ev.checks) {
      if (
        check.ruleId.includes("CR-3") ||
        check.ruleId === "DS-COVERAGE" ||
        check.ruleId === "STACK-MANDATE"
      ) {
        auditChecks.push({
          ruleId: check.ruleId,
          status: check.status,
          message: check.message,
        })
      }
    }
  }

  // Derive status.
  // - `pass`     — intake said audit not required OR (required AND audit call found)
  // - `missing`  — required AND no audit call AND output has files
  // - `required` — required AND no files yet (in-flight) OR ambiguous
  let status: "pass" | "required" | "missing"
  if (!detected) {
    status = "pass"
  } else if (auditCalls.length > 0) {
    status = "pass"
  } else if (files.length > 0) {
    status = "missing"
  } else {
    status = "required"
  }

  const reason = intake?.audit.detected
    ? `CR-3 triggered by ${pattern ?? "sensitive field"} bucket`
    : "No CR-3 sensitive keywords found"

  return {
    status,
    reason,
    pattern,
    sensitiveFields,
    auditCalls,
    validatorChecks: auditChecks,
  }
}

function buildFilesSnapshot(
  metas: DiscoveredFileMeta[],
): FileSnapshotEntry[] {
  return metas
    .map((f) => {
      const dot = f.path.lastIndexOf(".")
      const type = dot >= 0 ? f.path.slice(dot + 1).toLowerCase() : ""
      return { path: f.path, size: f.size, type }
    })
    .sort((a, b) => {
      const aHasDir = a.path.includes("/")
      const bHasDir = b.path.includes("/")
      if (aHasDir !== bHasDir) return aHasDir ? -1 : 1
      return a.path.localeCompare(b.path)
    })
}

// ---------------------------------------------------------------------------
// events.jsonl reader for AOP validation events
// ---------------------------------------------------------------------------

interface ValidationCheck {
  ruleId: string
  status: "pass" | "warn" | "fail"
  message?: string
  severity?: "high" | "medium" | "low"
  file?: string | null
}

interface ValidationEvent {
  checks: ValidationCheck[]
  /** Whether overall outcome was pass. */
  passed: boolean
  /** Optional score 0-100. */
  score: number | null
  warnings: string[]
}

/**
 * Read the persisted AOP events.jsonl and project every `validate` event into
 * a flat ValidationEvent[]. Missing / malformed file → empty list.
 *
 * The AOP validate envelope is:
 *   { type: "validate", payload: { checks: [{name, status, durationMs, output}], overall, scope } }
 *
 * We also accept a legacy/alternate shape where checks carry { ruleId, severity,
 * message, file } so the orchestrator can surface the rich validator output it
 * already computes. Both shapes are merged.
 */
async function readValidationEvents(
  runDir: string,
): Promise<ValidationEvent[]> {
  const file = join(runDir, "events.jsonl")
  if (!existsSync(file)) return []
  let raw: string
  try {
    raw = await readFile(file, "utf8")
  } catch {
    return []
  }
  const out: ValidationEvent[] = []
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let evt: unknown
    try {
      evt = JSON.parse(trimmed)
    } catch {
      continue
    }
    if (!evt || typeof evt !== "object") continue
    const e = evt as { type?: string; payload?: unknown }
    if (e.type !== "validate") continue
    const payload = (e.payload ?? {}) as {
      checks?: Array<{
        name?: string
        ruleId?: string
        status?: string
        message?: string
        output?: string
        severity?: string
        file?: string | null
      }>
      overall?: string
      score?: number
      warnings?: string[]
    }
    const checks: ValidationCheck[] = []
    for (const c of payload.checks ?? []) {
      const ruleId = c.ruleId ?? c.name ?? "unknown"
      const status = (c.status === "fail" || c.status === "warn" || c.status === "pass"
        ? c.status
        : c.status === "skip"
          ? "warn"
          : "pass") as "pass" | "warn" | "fail"
      checks.push({
        ruleId,
        status,
        message: c.message ?? c.output,
        severity:
          c.severity === "high" || c.severity === "medium" || c.severity === "low"
            ? c.severity
            : undefined,
        file: c.file ?? null,
      })
    }
    out.push({
      checks,
      passed: payload.overall === "pass",
      score: typeof payload.score === "number" ? payload.score : null,
      warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
    })
  }
  return out
}

function buildValidationSnapshot(
  events: ValidationEvent[],
): ValidationSnapshot | null {
  if (events.length === 0) return null
  // Use the LATEST validate event as the canonical outcome — earlier events
  // are retries / partial passes that the user already past.
  const latest = events[events.length - 1]!
  const findings = latest.checks
    .filter((c) => c.status !== "pass")
    .map((c) => ({
      ruleId: c.ruleId,
      severity: (c.severity ?? (c.status === "fail" ? "high" : "low")) as
        | "high"
        | "medium"
        | "low",
      message: c.message ?? `${c.ruleId} ${c.status}`,
      file: c.file ?? null,
    }))
  const counts = { high: 0, medium: 0, low: 0 }
  for (const f of findings) counts[f.severity] += 1
  // rule-id histogram
  const ruleMap = new Map<string, number>()
  for (const f of findings) {
    ruleMap.set(f.ruleId, (ruleMap.get(f.ruleId) ?? 0) + 1)
  }
  const rulesHit = Array.from(ruleMap.entries())
    .map(([ruleId, count]) => ({ ruleId, count }))
    .sort((a, b) => b.count - a.count || a.ruleId.localeCompare(b.ruleId))
  return {
    passed: latest.passed,
    score: latest.score ?? (latest.passed ? 100 : 60),
    counts,
    findings,
    rulesHit,
    warnings: latest.warnings,
  }
}

/**
 * Walk `<runDir>/files/` recursively, returning every .tsx / .jsx file with
 * its source. Returns an empty array when the dir doesn't exist.
 */
async function readUiFiles(filesDir: string): Promise<DiscoveredFile[]> {
  if (!existsSync(filesDir)) return []
  const out: DiscoveredFile[] = []
  async function walk(dir: string): Promise<void> {
    let entries: import("node:fs").Dirent[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
        continue
      }
      if (!/\.(tsx|jsx)$/.test(entry.name)) continue
      let content: string
      try {
        content = await readFile(abs, "utf8")
      } catch {
        continue
      }
      let size = 0
      try {
        size = Buffer.byteLength(content, "utf8")
      } catch {
        size = content.length
      }
      const rel = relative(filesDir, abs).split(sep).join("/")
      out.push({ path: rel, content, size })
    }
  }
  await walk(filesDir)
  return out
}

interface DiscoveredFileMeta {
  /** Path RELATIVE to `<runDir>/files/`, using forward slashes. */
  path: string
  size: number
}

/**
 * Walk `<runDir>/files/` recursively for ALL file types — used by the Files
 * tab. Returns size + path metadata, not content. Returns an empty array
 * when the dir doesn't exist.
 */
async function readAllFilesMeta(filesDir: string): Promise<DiscoveredFileMeta[]> {
  if (!existsSync(filesDir)) return []
  const out: DiscoveredFileMeta[] = []
  async function walk(dir: string): Promise<void> {
    let entries: import("node:fs").Dirent[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
        continue
      }
      let size = 0
      try {
        const st = await stat(abs)
        size = st.size
      } catch {
        continue
      }
      const rel = relative(filesDir, abs).split(sep).join("/")
      out.push({ path: rel, size })
    }
  }
  await walk(filesDir)
  return out
}

/**
 * Pick the "main" generated component file. Mirrors
 * `pickComponentSource` in src/pipeline/orchestrator.ts:
 *
 *   1. `preview.tsx`  (canonical Dash Build canvas)
 *   2. First .tsx with `export default`
 *   3. First .tsx / .jsx
 *
 * Returns null when none match.
 */
function pickComponentFile(files: DiscoveredFile[]): DiscoveredFile | null {
  if (files.length === 0) return null
  const preview = files.find((f) => f.path.endsWith("preview.tsx"))
  if (preview) return preview
  const withDefault = files.find((f) => /export\s+default/.test(f.content))
  if (withDefault) return withDefault
  return files[0] ?? null
}

/**
 * Read a persisted run artifact and assemble the initial-preview blob the
 * workspace template injects on cold load. Returns null when:
 *   - runId is empty
 *   - the run dir doesn't exist (still processing / failed / unknown id)
 *   - no .tsx / .jsx file lives under <runDir>/files/ (patch-only output)
 *   - the picked source trips the ban-list (we never mount broken code)
 *
 * `root` override exists for tests; production callers should omit it.
 */
/**
 * Resolve a possibly-truncated runId to an actual on-disk run dir. The display
 * badge shows ~8 chars (`prm_20cb`) but the persisted dir uses the full
 * 12-char slice (`prm_20cb094a-ac2`). When users copy the badge into the URL
 * bar we need to walk the runs root and find the unique prefix match.
 *
 * Returns the canonical runId when:
 *   - Exact dir exists → returns input as-is
 *   - Exactly one dir starts with the prefix → returns that dir name
 * Returns null when:
 *   - No dir matches → unknown / not-yet-persisted run
 *   - Multiple dirs match → ambiguous, refuse to guess
 */
async function resolveRunIdPrefix(
  runId: string,
  root: string,
): Promise<string | null> {
  const exact = resolveRunDir(runId, root)
  if (existsSync(exact)) return runId
  if (!existsSync(root)) return null
  let entries: string[]
  try {
    entries = await readdir(root)
  } catch {
    return null
  }
  const matches = entries.filter((name) => name.startsWith(runId))
  if (matches.length === 1) return matches[0]!
  return null
}

export async function loadInitialPreview(
  runId: string | null | undefined,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<PreviewInitialBlob | null> {
  if (!runId) return null
  const resolvedId = await resolveRunIdPrefix(runId, root)
  if (!resolvedId) return null
  const runDir = resolveRunDir(resolvedId, root)
  if (!existsSync(runDir)) return null

  const files = await readUiFiles(join(runDir, "files"))
  const picked = pickComponentFile(files)
  if (!picked) return null

  // Trust-boundary gate: refuse to ship banned imports out the wire even
  // for cold load. The orchestrator validates BEFORE persistence, so this is
  // a defense-in-depth check for stale / hand-edited artifacts.
  if (detectBannedImports(picked.content).length > 0) return null

  // Best-effort: read the intake snapshot the orchestrator persisted so the
  // workspace cold-load surfaces BE endpoints + audit reason in the context
  // map. Missing/malformed snapshot → degrade to empty be/null audit (matches
  // legacy behaviour).
  const intake = await readIntakeSnapshot(resolvedId, root).catch(() => null)
  const be = intake
    ? intake.beEndpoints
        .slice(0, 20)
        .map((ep) => `${ep.method} ${ep.path}`)
    : []
  const audit = intake && intake.audit.detected
    ? intake.audit.reasonsCode.join(", ") || "audit required"
    : null

  // Tier 2 #4 — load persisted patches (kind=patch) and synthesise a
  // new-file entry for the picked component so the Diff tab has a body to
  // render on cold load. Patches go first so users see the more interesting
  // surgical edits at the top of the list.
  const patches = await readRunPatches(resolvedId, root).catch(() => [])
  const diffSnapshot: DiffSnapshotEntry[] = []
  for (const patch of patches) {
    diffSnapshot.push({
      path: patch.path,
      kind: "patch",
      body: patch.patchContent,
    })
  }
  diffSnapshot.push({
    path: picked.path,
    kind: "new-file",
    body: picked.content,
  })

  // Tier 2 #4a / #4b / #4c / #7 — additional cold-load snapshots. Each is
  // best-effort: a missing intake / events file / file list yields `undefined`
  // so the workspace template renders the placeholder for that tab instead.
  const validationEvents = await readValidationEvents(runDir).catch(() => [])
  const allMetas = await readAllFilesMeta(join(runDir, "files")).catch(() => [])

  const beImpactSnapshot = buildBeImpactSnapshot(intake) ?? undefined
  const auditSnapshot =
    buildAuditSnapshot(intake, files, validationEvents) ?? undefined
  const filesSnapshot =
    allMetas.length > 0 ? buildFilesSnapshot(allMetas) : undefined
  const validationSnapshot =
    buildValidationSnapshot(validationEvents) ?? undefined

  return {
    componentId: resolvedId,
    componentSource: picked.content,
    contextMap: {
      landsAt: picked.path,
      uses: detectDashDsImports(picked.content),
      be,
      audit,
    },
    diffSnapshot,
    beImpactSnapshot,
    auditSnapshot,
    filesSnapshot,
    validationSnapshot,
  }
}

/**
 * Serialise a blob into a `<script>window.__DASH_PREVIEW_INIT = …</script>`
 * tag safe for inline injection into SSR HTML. JSON is HTML-escaped against
 * `</script>` breakouts, and JS line-terminator chars (U+2028/U+2029) are
 * re-encoded so the script parses cleanly when the page is delivered as
 * text/html.
 *
 * Returns an empty string when blob is null — caller can interpolate the
 * result unconditionally.
 */
export function renderInitialPreviewScript(
  blob: PreviewInitialBlob | null,
): string {
  if (!blob) return ""
  // String.fromCharCode keeps these chars out of the TS source itself; a
  // literal U+2028/U+2029 in source is also a JS line terminator and trips
  // the lexer when it appears inside a regex literal.
  const LS = String.fromCharCode(0x2028)
  const PS = String.fromCharCode(0x2029)
  const safeJson = JSON.stringify(blob)
    .replace(/<\/(script)/gi, "<\\/$1")
    .split(LS)
    .join("\\u2028")
    .split(PS)
    .join("\\u2029")
  return `<script>window.__DASH_PREVIEW_INIT = ${safeJson};</script>`
}
