/**
 * `dash feedback` — Wave 5 pilot signal capture.
 *
 * Subcommands:
 *   - log "<text>"  : append a free-text entry, auto-detect user via git
 *   - log --json    : read a single FeedbackEntry-shaped JSON from stdin
 *   - sync          : POST pending entries to the admin pilot API
 *   - list          : print entries in a compact table
 *
 * Mirrors the `dash gap` shape so users who learned one already know the
 * other. JSONL on disk (`~/.dash/feedback-log.jsonl`) so appends are
 * effectively atomic and the dashboard can tail-stream.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import {
  appendFeedback,
  defaultLogPath,
  detectPe,
  readLog,
  writeLog,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  type FeedbackCategory,
  type FeedbackEntry,
  type FeedbackSeverity,
  type FeedbackContext,
} from "../lib/feedback-log.js"

export type FeedbackLogOpts = {
  text?: string
  category?: string
  severity?: string
  pilot?: string
  pe?: string
  command?: string
  component?: string
  repo?: string
  json?: boolean
  /** Override log path (tests). */
  logPath?: string
  /** Override cwd for user auto-detection (tests). */
  cwd?: string
  /** Stdin payload as a string (tests); production reads from process.stdin. */
  stdinPayload?: string
}

function isCategory(v: string | undefined): v is FeedbackCategory {
  return typeof v === "string" && VALID_CATEGORIES.has(v as FeedbackCategory)
}

function isSeverity(v: string | undefined): v is FeedbackSeverity {
  return typeof v === "string" && VALID_SEVERITIES.has(v as FeedbackSeverity)
}

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + "…"
}

function categoryColor(cat: FeedbackCategory): (s: string) => string {
  if (cat === "bug") return (s) => kleur.red().bold(s)
  if (cat === "drift") return (s) => kleur.magenta(s)
  if (cat === "missing") return (s) => kleur.yellow(s)
  if (cat === "praise") return (s) => kleur.green(s)
  if (cat === "ux") return (s) => kleur.cyan(s)
  return (s) => kleur.dim(s)
}

async function readStdinIfPiped(override?: string): Promise<string | null> {
  if (typeof override === "string") return override
  if (process.stdin.isTTY) return null
  return await new Promise<string>((resolve) => {
    const chunks: Buffer[] = []
    process.stdin.on("data", (c) => chunks.push(Buffer.from(c)))
    process.stdin.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf-8")),
    )
    process.stdin.on("error", () => resolve(""))
  })
}

/** `dash feedback log`. */
export async function runFeedbackLog(opts: FeedbackLogOpts): Promise<void> {
  const logPath = opts.logPath ?? defaultLogPath()
  const cwd = opts.cwd ?? process.cwd()
  const pilot = opts.pilot ?? "wave-5"
  const pe = opts.pe ?? detectPe(cwd)

  let text = (opts.text ?? "").trim()
  let category: FeedbackCategory = isCategory(opts.category)
    ? opts.category
    : "other"
  let severity: FeedbackSeverity | undefined = isSeverity(opts.severity)
    ? opts.severity
    : undefined
  let context: FeedbackContext | undefined = undefined
  if (opts.command || opts.component || opts.repo) {
    context = {
      ...(opts.command ? { command: opts.command } : {}),
      ...(opts.component ? { component: opts.component } : {}),
      ...(opts.repo ? { repo: opts.repo } : {}),
    }
  }

  // `--json` mode: read a structured payload from stdin and merge over
  // flag defaults. Text on the payload wins over positional text.
  if (opts.json) {
    const raw = await readStdinIfPiped(opts.stdinPayload)
    if (!raw || !raw.trim()) {
      console.error(
        kleur.red("✗ --json requires a JSON payload on stdin. Got empty input."),
      )
      process.exitCode = 2
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(kleur.red(`✗ invalid JSON on stdin: ${msg}`))
      process.exitCode = 2
      return
    }
    if (!parsed || typeof parsed !== "object") {
      console.error(kleur.red("✗ stdin JSON must be an object"))
      process.exitCode = 2
      return
    }
    const p = parsed as Partial<FeedbackEntry>
    if (typeof p.text === "string" && p.text.trim().length > 0) {
      text = p.text.trim()
    }
    if (isCategory(p.category as string | undefined)) {
      category = p.category as FeedbackCategory
    }
    if (isSeverity(p.severity as string | undefined)) {
      severity = p.severity as FeedbackSeverity
    }
    if (p.context && typeof p.context === "object") {
      context = { ...(context ?? {}), ...(p.context as FeedbackContext) }
    }
  }

  if (!text) {
    console.error(
      kleur.red(
        '✗ feedback text is required. Usage: dash feedback log "<text>"',
      ),
    )
    process.exitCode = 2
    return
  }

  const entry = appendFeedback(
    { text, category, pe, pilot, severity, context },
    logPath,
  )

  if (opts.json) {
    process.stdout.write(
      JSON.stringify({ entry, logPath }, null, 2) + "\n",
    )
    return
  }

  console.log()
  console.log(
    kleur.green("✓ Feedback logged") +
      kleur.dim(`  (${entry.pilot} · ${entry.pe})`),
  )
  console.log()
  console.log(kleur.dim("  id        ") + shortId(entry.id))
  console.log(kleur.dim("  category  ") + categoryColor(entry.category)(entry.category))
  if (entry.severity) {
    console.log(kleur.dim("  severity  ") + entry.severity)
  }
  console.log(kleur.dim("  text      ") + truncate(entry.text, 80))
  if (entry.context?.command) {
    console.log(kleur.dim("  command   ") + entry.context.command)
  }
  if (entry.context?.component) {
    console.log(kleur.dim("  component ") + entry.context.component)
  }
  if (entry.context?.repo) {
    console.log(kleur.dim("  repo      ") + entry.context.repo)
  }
  console.log(kleur.dim(`\n  log → ${logPath}\n`))
}

export type FeedbackListOpts = {
  json?: boolean
  pilot?: string
  pe?: string
  category?: string
  logPath?: string
}

export function runFeedbackList(opts: FeedbackListOpts): void {
  const logPath = opts.logPath ?? defaultLogPath()
  let entries = readLog(logPath)
  if (opts.pilot) entries = entries.filter((e) => e.pilot === opts.pilot)
  if (opts.pe) entries = entries.filter((e) => e.pe === opts.pe)
  if (opts.category && isCategory(opts.category)) {
    const cat = opts.category
    entries = entries.filter((e) => e.category === cat)
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ entries, logPath }, null, 2) + "\n")
    return
  }

  console.log()
  console.log(kleur.bold().cyan("Dash Feedback Log"))
  console.log(kleur.dim(`  ${logPath}\n`))

  if (entries.length === 0) {
    console.log(
      kleur.dim(
        '  No feedback logged. Use `dash feedback log "description"` to add.',
      ),
    )
    console.log()
    return
  }

  const rows = entries.map((e) => ({
    id: shortId(e.id),
    cat: e.category,
    pe: truncate(e.pe, 14),
    when: e.timestamp.slice(5, 16).replace("T", " "),
    text: truncate(e.text, 60),
  }))
  const widths = {
    id: Math.max(8, ...rows.map((r) => r.id.length)),
    cat: Math.max(7, ...rows.map((r) => r.cat.length)),
    pe: Math.max(4, ...rows.map((r) => r.pe.length)),
    when: 11,
  }

  const header =
    kleur.dim("  ") +
    [
      kleur.bold("id".padEnd(widths.id)),
      kleur.bold("cat".padEnd(widths.cat)),
      kleur.bold("pe".padEnd(widths.pe)),
      kleur.bold("when".padEnd(widths.when)),
      kleur.bold("text"),
    ].join("  ")
  console.log(header)

  for (const r of rows) {
    const cat = r.cat as FeedbackCategory
    console.log(
      "  " +
        [
          r.id.padEnd(widths.id),
          categoryColor(cat)(r.cat.padEnd(widths.cat)),
          r.pe.padEnd(widths.pe),
          kleur.dim(r.when.padEnd(widths.when)),
          r.text,
        ].join("  "),
    )
  }
  const pending = entries.filter((e) => e.status === "pending").length
  console.log()
  console.log(
    kleur.dim(
      `  ${entries.length} entr${entries.length === 1 ? "y" : "ies"} · ${pending} pending sync`,
    ),
  )
  console.log()
}

export type FeedbackSyncOpts = {
  url?: string
  token?: string
  dryRun?: boolean
  json?: boolean
  logPath?: string
}

/**
 * POST pending entries to `<url>/api/admin/pilot/feedback`. Mirrors the gap
 * sync semantics: idempotent on `id`, status flips to "synced" locally on
 * success so reruns are no-ops.
 */
export async function runFeedbackSync(opts: FeedbackSyncOpts): Promise<void> {
  const logPath = opts.logPath ?? defaultLogPath()
  const url = opts.url ?? process.env.DASH_DASHBOARD_URL
  const token = opts.token ?? process.env.DASH_CEO_TOKEN

  if (!url) {
    console.error(
      kleur.red("✗ dashboard URL not configured. Set --url or DASH_DASHBOARD_URL."),
    )
    process.exitCode = 2
    return
  }
  if (!token) {
    console.error(
      kleur.red("✗ bearer token not configured. Set --token or DASH_CEO_TOKEN."),
    )
    process.exitCode = 2
    return
  }

  const entries = readLog(logPath)
  const pending = entries.filter((e) => e.status === "pending")

  if (pending.length === 0) {
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ synced: 0, skipped: entries.length }, null, 2) + "\n",
      )
      return
    }
    console.log(
      kleur.dim(
        `Nothing to sync (${entries.length} total, all already synced).`,
      ),
    )
    return
  }

  if (opts.dryRun) {
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ wouldSync: pending.length, entries: pending }, null, 2) +
          "\n",
      )
      return
    }
    console.log(kleur.dim(`Would sync ${pending.length} entries to ${url}`))
    for (const e of pending) {
      console.log(`  ${shortId(e.id)}  ${e.category}  ${truncate(e.text, 60)}`)
    }
    return
  }

  const endpoint = url.replace(/\/$/, "") + "/api/admin/pilot/feedback"
  let res: Response
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entries: pending }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(kleur.red(`✗ network error contacting ${endpoint}: ${msg}`))
    process.exitCode = 1
    return
  }

  if (!res.ok) {
    let detail = ""
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
    if (res.status === 409 || res.status === 200) {
      console.log(
        kleur.yellow(
          `! server reported conflict (${res.status}). Marking local entries synced anyway.`,
        ),
      )
    } else {
      console.error(
        kleur.red(`✗ pilot endpoint rejected sync (${res.status}): ${detail.slice(0, 200)}`),
      )
      process.exitCode = 1
      return
    }
  }

  const syncedIds = new Set(pending.map((e) => e.id))
  for (const e of entries) {
    if (syncedIds.has(e.id)) e.status = "synced"
  }
  writeLog(entries, logPath)

  if (opts.json) {
    process.stdout.write(
      JSON.stringify({ synced: pending.length, endpoint }, null, 2) + "\n",
    )
    return
  }
  console.log(
    kleur.green(
      `✓ Synced ${pending.length} feedback entr${pending.length === 1 ? "y" : "ies"} to ${endpoint}`,
    ),
  )
}

// Re-export schema for tests / dashboard.
export { FEEDBACK_LOG_SCHEMA_VERSION } from "../lib/feedback-log.js"
export type { FeedbackEntry, FeedbackCategory, FeedbackSeverity }

/** Tiny path helper for code that wants to inspect default location without importing the lib. */
export function feedbackLogPath(): string {
  return defaultLogPath()
}

// Keep an unused import alive if tree-shaking gets aggressive in build.
void fs
void path
