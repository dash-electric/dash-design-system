/**
 * Milestone 3 — PRD SYNTHESIS stage.
 *
 * The synthesis stage turns the CLARIFY output (prompt + answers + optional
 * `PrdSeed`) plus the loaded design contract + domain glossary into a single
 * authoritative `DashPRD` artifact. Code-gen builds from this spec instead of
 * a one-sentence summary, so scope, non-goals, acceptance criteria, surfaces,
 * and data policy are all explicit BEFORE a line of code is generated.
 *
 * Two paths, mirroring the rest of the chain:
 *   - MODEL-BACKED — when an `anthropic` client is provided, one call is
 *     seeded with the prdSeed + answers + design contract + truncated glossary
 *     and instructed to emit the `DashPRD` JSON. Parsed with a tolerant
 *     extractor; any failure silently degrades to the fallback.
 *   - STRUCTURED-SUMMARY FALLBACK — deterministic build from prdSeed + answers
 *     + the classification surfaces. Never throws; always yields a valid PRD.
 *
 * Persistence mirrors `writeIntakeSnapshot` exactly: resolve run dir → mkdir
 * recursive → write `<runDir>/prd.json` pretty-printed.
 */

import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { DEFAULT_RUNS_ROOT, resolveRunDir } from "../runs/artifact-store.js"
import { extractText } from "./response-parser.js"
import type { ClarificationAnswer } from "../clarification/types.js"
import type { AnthropicLike, DashPRD, PrdSeed } from "./types.js"

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

export interface SynthesizePrdClassification {
  /** Detected project/scenario mode (e.g. "update_existing", "fe_only"). */
  scenario: string
  /** Repo slug the change targets (e.g. "backoffice", "portal-v2"). */
  repoSlug: string
  /** Confidence 0..1 from the classifier. */
  confidence: number
  /** Files the classifier surfaced as in-play (drives surfaces in fallback). */
  affectedFiles?: { fe: string[]; be: string[]; db: string[] } | null
}

export interface SynthesizePrdInput {
  /** The (possibly clarified) user prompt. */
  prompt: string
  /** Run/prompt id this PRD belongs to. */
  promptId: string
  /** Clarification answers keyed by question id. */
  answers?: Record<string, ClarificationAnswer>
  /** Seed emitted by the model-backed clarify stage (if it ran). */
  prdSeed?: PrdSeed
  classification: SynthesizePrdClassification
  /** Design contract text from design-loader (design.md). */
  designContract: string
  /** Domain glossary text (already truncated by ds-catalog-loader). */
  glossary: string
  /** When present, synthesis is model-backed; otherwise deterministic. */
  anthropic?: AnthropicLike
  /** Model id for the synthesis call (resolved by the chain's modelForStep). */
  model?: string
  /** Override the language detection. Optional — falls back to prompt heuristic. */
  lang?: "id" | "en"
  /** CEO framing mode carried from clarify. Defaults to "HOLD". */
  ceoMode?: string
}

const PRD_MAX_TOKENS = 2000

// ---------------------------------------------------------------------------
// Language + small helpers
// ---------------------------------------------------------------------------

/**
 * Lightweight ID-vs-EN heuristic — counts a handful of high-signal Indonesian
 * stopwords. The model-backed path overrides this via `lang`; this is only
 * the deterministic fallback's guess.
 */
export function detectLang(prompt: string): "id" | "en" {
  const p = ` ${prompt.toLowerCase()} `
  const idMarkers = [
    " tambah",
    " tambahin",
    " buat",
    " buatkan",
    " halaman",
    " tombol",
    " dengan",
    " untuk",
    " yang",
    " dan ",
    " atau ",
    " mitra",
    " pengguna",
    " tampilkan",
    " ubah",
    " hapus",
  ]
  const hits = idMarkers.reduce((n, m) => (p.includes(m) ? n + 1 : n), 0)
  return hits >= 1 ? "id" : "en"
}

function answersToLines(answers: Record<string, ClarificationAnswer> | undefined): string[] {
  if (!answers) return []
  const out: string[] = []
  for (const [id, val] of Object.entries(answers)) {
    if (val === undefined || val === null) continue
    const rendered = Array.isArray(val) ? val.join(", ") : String(val)
    if (rendered.trim().length === 0) continue
    out.push(`${id}: ${rendered}`)
  }
  return out
}

function firstLine(prompt: string): string {
  const head = prompt.trim().split(/\n+/)[0]?.trim() ?? ""
  return head.slice(0, 200)
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const t = v.trim()
    if (t.length === 0) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}

/**
 * Map a classifier scenario + repo to the conservative P0 data source. New
 * generated FE surfaces stay on mock data (P0 policy); explicit DB scenarios
 * surface postgres so the spec records the intent.
 */
function inferDataSource(
  scenario: string,
): DashPRD["data"]["source"] {
  if (scenario === "extend_fe_be_db") return "postgres"
  if (scenario === "extend_fe_be" || scenario === "update_existing") return "api"
  // fe_only / new_product / unknown — P0_MOCK_DATA_ONLY default.
  return "mock"
}

/** Infer surface kind from a file path / route hint. */
function inferSurfaceKind(path: string): DashPRD["surfaces"][number]["kind"] {
  const p = path.toLowerCase()
  if (/\bapi\b|route\.(t|j)s|endpoint|controller|handler/.test(p)) return "endpoint"
  if (/modal|dialog|drawer/.test(p)) return "modal"
  if (/page\.(t|j)sx?|\/pages?\/|index\.(t|j)sx?/.test(p)) return "page"
  return "component"
}

// ---------------------------------------------------------------------------
// Deterministic fallback
// ---------------------------------------------------------------------------

function fallbackSurfaces(
  input: SynthesizePrdInput,
): DashPRD["surfaces"] {
  const repo = input.classification.repoSlug || "unknown"
  const seedSurfaces = input.prdSeed?.surfaces ?? []
  const affected = input.classification.affectedFiles
  const fePaths = affected?.fe ?? []
  const bePaths = affected?.be ?? []

  const surfaces: DashPRD["surfaces"] = []
  for (const route of dedupe(seedSurfaces)) {
    surfaces.push({ route, repo, kind: inferSurfaceKind(route) })
  }
  for (const fp of dedupe(fePaths)) {
    surfaces.push({ route: fp, repo, kind: inferSurfaceKind(fp) })
  }
  for (const bp of dedupe(bePaths)) {
    surfaces.push({ route: bp, repo, kind: "endpoint" })
  }
  // Always carry at least one surface so the spec is never empty.
  if (surfaces.length === 0) {
    surfaces.push({ route: "(to be resolved)", repo, kind: "component" })
  }
  return surfaces.slice(0, 12)
}

/**
 * Build a valid `DashPRD` deterministically from prdSeed + answers + the
 * classification surfaces. This is the no-model path and the guaranteed
 * fallback when a model call fails.
 */
export function fallbackPrd(input: SynthesizePrdInput): DashPRD {
  const lang = input.lang ?? detectLang(input.prompt)
  const seed = input.prdSeed
  const answerLines = answersToLines(input.answers)

  const problem = (seed?.problem ?? firstLine(input.prompt)) || firstLine(input.prompt)
  const wedge = seed?.wedge?.trim()
  const users = dedupe([
    ...(seed?.user ? [seed.user] : []),
  ])
  if (users.length === 0) {
    // Default persona for Dash internal tooling.
    users.push(
      input.classification.repoSlug === "portal-v2"
        ? "Dash portal user"
        : "Dash internal ops user",
    )
  }

  const scope = dedupe([
    firstLine(input.prompt),
    ...(wedge ? [`Narrowest wedge: ${wedge}`] : []),
    ...answerLines,
  ])

  const nonGoals = dedupe([
    "No backend/schema changes beyond what the scenario requires (P0 additive-only).",
    "No live data wiring in preview — mock fixtures only.",
  ])

  const acceptanceCriteria = dedupe([
    `The requested change is reachable in the ${input.classification.repoSlug} surface.`,
    "Generated UI uses Dash DS registry components, semantic tokens (no raw hex).",
    "Loading / empty / error states are explicit.",
    ...(seed?.risks ?? []).map((r) => `Mitigated: ${r}`),
  ])

  const sources = dedupe([
    "prompt",
    ...(seed ? ["prdSeed"] : []),
    ...(answerLines.length > 0 ? ["clarification-answers"] : []),
    ...(input.designContract.trim().length > 0 ? ["design.md"] : []),
    ...(input.glossary.trim().length > 0 ? ["dash-domain-glossary"] : []),
    "fallback",
  ])

  return {
    version: 1,
    promptId: input.promptId,
    problem,
    users,
    scope,
    nonGoals,
    acceptanceCriteria,
    surfaces: fallbackSurfaces(input),
    data: {
      entities: [],
      source: inferDataSource(input.classification.scenario),
      notes:
        input.classification.scenario === "fe_only"
          ? "Pure FE change — inline mock data only."
          : "Data source inferred from scenario; confirm exact entities before BE work.",
    },
    ceoMode: input.ceoMode ?? "HOLD",
    lang,
    sources,
  }
}

// ---------------------------------------------------------------------------
// Model-backed synthesis
// ---------------------------------------------------------------------------

const SYNTH_SYSTEM = `You are the PRD synthesizer for Dash Build (internal tooling for PT Dash Elektrik Indonesia).
Turn the user's (already-clarified) prompt + clarification answers + the seed scaffold
into ONE authoritative product spec. This is Dash internal ops / portal tooling — frame
acceptance criteria around "smallest version that gets greenlit", not external market fit.

RULES:
- Be concrete. Scope and non-goals must be explicit so code-gen does not invent extra surfaces.
- Mirror the user's language: if the prompt is Indonesian, write the spec in Indonesian.
- Respect the P0 data policy: prefer mock data unless the scenario clearly requires api/postgres.
- Use the design contract + domain glossary below only to ground entity/surface names; do not copy them.

Return ONLY JSON matching exactly:
{"problem":string,"users":string[],"scope":string[],"nonGoals":string[],"acceptanceCriteria":string[],"surfaces":[{"route":string,"repo":string,"kind":"page"|"modal"|"component"|"endpoint"}],"data":{"entities":string[],"source":"api"|"mock"|"postgres"|"none","notes":string},"lang":"id"|"en"}`

/** Pull the first balanced `{ … }` JSON object out of arbitrary model text. */
export function extractFirstJsonObject(text: string): unknown | null {
  const start = text.indexOf("{")
  if (start < 0) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inStr) {
      if (esc) esc = false
      else if (ch === "\\") esc = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) {
        const slice = text.slice(start, i + 1)
        try {
          return JSON.parse(slice)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
}

function coerceModelPrd(
  raw: unknown,
  input: SynthesizePrdInput,
): DashPRD | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const problem = typeof o.problem === "string" ? o.problem.trim() : ""
  if (problem.length === 0) return null // a PRD with no problem is useless — fall back

  const repo = input.classification.repoSlug || "unknown"
  const surfacesRaw = Array.isArray(o.surfaces) ? o.surfaces : []
  const surfaces: DashPRD["surfaces"] = []
  for (const s of surfacesRaw) {
    if (!s || typeof s !== "object") continue
    const so = s as Record<string, unknown>
    const route = typeof so.route === "string" ? so.route.trim() : ""
    if (route.length === 0) continue
    const kind = ["page", "modal", "component", "endpoint"].includes(
      so.kind as string,
    )
      ? (so.kind as DashPRD["surfaces"][number]["kind"])
      : inferSurfaceKind(route)
    surfaces.push({
      route,
      repo: typeof so.repo === "string" && so.repo.trim() ? so.repo.trim() : repo,
      kind,
    })
  }

  const dataRaw =
    o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : {}
  const source = ["api", "mock", "postgres", "none"].includes(
    dataRaw.source as string,
  )
    ? (dataRaw.source as DashPRD["data"]["source"])
    : inferDataSource(input.classification.scenario)

  const lang: "id" | "en" =
    o.lang === "id" || o.lang === "en"
      ? (o.lang as "id" | "en")
      : (input.lang ?? detectLang(input.prompt))

  const users = asStringArray(o.users)
  const sources = dedupe([
    "prompt",
    ...(input.prdSeed ? ["prdSeed"] : []),
    ...(input.answers && Object.keys(input.answers).length > 0
      ? ["clarification-answers"]
      : []),
    ...(input.designContract.trim().length > 0 ? ["design.md"] : []),
    ...(input.glossary.trim().length > 0 ? ["dash-domain-glossary"] : []),
    "model",
  ])

  return {
    version: 1,
    promptId: input.promptId,
    problem,
    users:
      users.length > 0
        ? users
        : [
            repo === "portal-v2"
              ? "Dash portal user"
              : "Dash internal ops user",
          ],
    scope: asStringArray(o.scope),
    nonGoals: asStringArray(o.nonGoals),
    acceptanceCriteria: asStringArray(o.acceptanceCriteria),
    surfaces: surfaces.length > 0 ? surfaces.slice(0, 12) : fallbackSurfaces(input),
    data: {
      entities: asStringArray(dataRaw.entities),
      source,
      notes: typeof dataRaw.notes === "string" ? dataRaw.notes : "",
    },
    ceoMode: input.ceoMode ?? "HOLD",
    lang,
    sources,
  }
}

function buildUserMessage(input: SynthesizePrdInput): string {
  const parts: string[] = []
  parts.push(`PROMPT:\n${input.prompt}`)
  const answerLines = answersToLines(input.answers)
  if (answerLines.length > 0) {
    parts.push(`\nCLARIFICATION ANSWERS:\n${answerLines.map((l) => `- ${l}`).join("\n")}`)
  }
  if (input.prdSeed) {
    parts.push(`\nSEED (from clarify):\n${JSON.stringify(input.prdSeed, null, 2)}`)
  }
  parts.push(
    `\nCLASSIFICATION:\n${JSON.stringify(
      {
        scenario: input.classification.scenario,
        repoSlug: input.classification.repoSlug,
        confidence: input.classification.confidence,
      },
      null,
      2,
    )}`,
  )
  if (input.designContract.trim().length > 0) {
    parts.push(`\nDESIGN CONTRACT (ground entities/surfaces, do not copy):\n${input.designContract.slice(0, 4000)}`)
  }
  if (input.glossary.trim().length > 0) {
    parts.push(`\nDOMAIN GLOSSARY (ground entity names):\n${input.glossary.slice(0, 6000)}`)
  }
  return parts.join("\n")
}

/**
 * Synthesize a `DashPRD`. Model-backed when `input.anthropic` is provided;
 * deterministic structured-summary fallback otherwise. NEVER throws — any
 * model/parse failure degrades to the deterministic fallback.
 */
export async function synthesizePrd(input: SynthesizePrdInput): Promise<DashPRD> {
  if (!input.anthropic) {
    return fallbackPrd(input)
  }
  try {
    const system = [
      SYNTH_SYSTEM,
      "",
      "Design contract + glossary follow in the user message.",
    ].join("\n")
    const res = await input.anthropic.messages.create({
      model: input.model ?? "",
      max_tokens: PRD_MAX_TOKENS,
      system,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    })
    const text = extractText(res)
    const parsed = extractFirstJsonObject(text)
    const prd = coerceModelPrd(parsed, input)
    return prd ?? fallbackPrd(input)
  } catch {
    return fallbackPrd(input)
  }
}

// ---------------------------------------------------------------------------
// Persistence — mirrors writeIntakeSnapshot exactly.
// ---------------------------------------------------------------------------

/**
 * Persist a `DashPRD` to `<runDir>/prd.json`. Mirrors `writeIntakeSnapshot`:
 * resolve run dir → mkdir recursive → write pretty-printed JSON. Returns the
 * absolute path written.
 */
export async function writePrdSnapshot(
  runId: string,
  prd: DashPRD,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<string> {
  const runDir = resolveRunDir(runId, root)
  await mkdir(runDir, { recursive: true })
  const file = join(runDir, "prd.json")
  await writeFile(file, JSON.stringify(prd, null, 2), "utf8")
  return file
}
