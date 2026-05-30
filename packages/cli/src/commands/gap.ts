/**
 * `dashkit gap report` — log DS coverage gaps users hit while building features.
 *
 * Wave 4 Agent M (decoupled). A user encounters something the DS doesn't ship
 * (e.g. no image-editor) → runs `dashkit gap report "image editor missing"` →
 * structured entry lands in `~/.dash/gap-queue.json`. Wave 4 dashboard
 * (separate session) will read the queue and surface backlog to the DS
 * maintainer.
 *
 * No network. No code generation. Purely additive local-state recorder.
 *
 * Modes (mutually exclusive):
 *   - log     : default if <description> given. Append entry.
 *   - --list  : print queue as a table.
 *   - --clear : wipe queue (interactive confirm).
 *   - --export: write queue JSON to a path.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import prompts from "prompts"
import {
  appendGap,
  clearQueue,
  defaultQueuePath,
  readQueue,
  writeQueue,
  type GapEntry,
  type GapSeverity,
} from "../lib/gap-queue.js"
import { collectInfo } from "./info.js"

export type GapReportOpts = {
  description?: string
  severity?: string
  repo?: string
  prompt?: string
  list?: boolean
  clear?: boolean
  export?: string
  json?: boolean
  /** Override queue path (tests). */
  queuePath?: string
  /** Override cwd for repo auto-detection (tests). */
  cwd?: string
  /** Skip the interactive confirm on --clear (tests / scripted use). */
  yes?: boolean
  /** Skip interactive severity prompt; defaults to medium when missing. */
  nonInteractive?: boolean
}

const VALID_SEVERITIES: ReadonlySet<GapSeverity> = new Set([
  "low",
  "medium",
  "high",
])

function isSeverity(v: string | undefined): v is GapSeverity {
  return typeof v === "string" && VALID_SEVERITIES.has(v as GapSeverity)
}

function severityColor(sev: GapSeverity): (s: string) => string {
  if (sev === "high") return (s) => kleur.red().bold(s)
  if (sev === "medium") return (s) => kleur.yellow(s)
  return (s) => kleur.dim(s)
}

function shortId(id: string): string {
  // UUIDs are 36 chars; trim to first 8 for a compact table column.
  return id.length > 8 ? id.slice(0, 8) : id
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + "…"
}

function age(createdAt: string): string {
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return "?"
  const diff = Math.max(0, Date.now() - t)
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  return `${day}d`
}

/**
 * Detect current repo. Best-effort via `dashkit info` machinery (reads package.json
 * name from CWD). Falls back to basename(cwd). Returns null on total failure so
 * the entry stays useful even when run outside a project.
 */
async function detectRepo(cwd: string): Promise<string | null> {
  // Try package.json name first — cheapest + most precise.
  try {
    const pkgFile = path.join(cwd, "package.json")
    if (fs.existsSync(pkgFile)) {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8")) as {
        name?: string
      }
      if (typeof pkg.name === "string" && pkg.name.length > 0) {
        return pkg.name
      }
    }
  } catch {
    /* fall through */
  }
  // Fall back to `dashkit info` (skip network — we just want framework/root).
  try {
    const snap = await collectInfo({ cwd, _index: null })
    const base = path.basename(snap.project.rootPath)
    return base || null
  } catch {
    return path.basename(cwd) || null
  }
}

async function runLogMode(opts: GapReportOpts): Promise<void> {
  const description = (opts.description ?? "").trim()
  if (!description) {
    console.error(
      kleur.red("✗ description is required. Usage: dashkit gap report \"<description>\""),
    )
    process.exitCode = 2
    return
  }

  // Severity: flag wins; else interactive prompt unless --nonInteractive; else
  // default to medium.
  let severity: GapSeverity
  if (opts.severity) {
    if (!isSeverity(opts.severity)) {
      console.error(
        kleur.red(
          `✗ invalid --severity "${opts.severity}". expected: low | medium | high`,
        ),
      )
      process.exitCode = 2
      return
    }
    severity = opts.severity
  } else if (opts.nonInteractive || !process.stdin.isTTY) {
    severity = "medium"
  } else {
    const ans = await prompts({
      type: "select",
      name: "sev",
      message: "Severity?",
      choices: [
        { title: "medium  (default)", value: "medium" },
        { title: "high    (blocking)", value: "high" },
        { title: "low     (nice-to-have)", value: "low" },
      ],
      initial: 0,
    })
    severity = isSeverity(ans.sev) ? ans.sev : "medium"
  }

  const cwd = opts.cwd ?? process.cwd()
  const repo = opts.repo ?? (await detectRepo(cwd))
  const promptText = opts.prompt ?? null

  const queuePath = opts.queuePath ?? defaultQueuePath()
  const entry = appendGap(
    {
      description,
      severity,
      repo,
      prompt: promptText,
    },
    queuePath,
  )

  const total = readQueue(queuePath).entries.length

  if (opts.json) {
    process.stdout.write(
      JSON.stringify({ entry, queueSize: total, queuePath }, null, 2) + "\n",
    )
    return
  }

  console.log()
  console.log(
    kleur.green("✓ Gap logged") +
      kleur.dim(` (queue: ${total} entr${total === 1 ? "y" : "ies"} pending)`),
  )
  console.log()
  console.log(kleur.dim("  id        ") + shortId(entry.id))
  console.log(kleur.dim("  severity  ") + severityColor(severity)(severity))
  console.log(kleur.dim("  repo      ") + (entry.repo ?? kleur.dim("(unknown)")))
  console.log(
    kleur.dim("  desc      ") + truncate(entry.description, 80),
  )
  if (entry.prompt) {
    console.log(kleur.dim("  prompt    ") + truncate(entry.prompt, 80))
  }
  console.log(kleur.dim(`\n  queue → ${queuePath}\n`))
}

function runListMode(opts: GapReportOpts): void {
  const queuePath = opts.queuePath ?? defaultQueuePath()
  const queue = readQueue(queuePath)

  if (opts.json) {
    process.stdout.write(JSON.stringify(queue, null, 2) + "\n")
    return
  }

  console.log()
  console.log(kleur.bold().cyan(`Dash Gap Queue`))
  console.log(kleur.dim(`  ${queuePath}\n`))

  if (queue.entries.length === 0) {
    console.log(
      kleur.dim(
        `  No gaps logged. Use 'dashkit gap report "description"' to add.`,
      ),
    )
    console.log()
    return
  }

  // Simple aligned table: id | sev | repo | age | desc
  const rows = queue.entries.map((e) => ({
    id: shortId(e.id),
    sev: e.severity,
    repo: e.repo ?? "(unknown)",
    age: age(e.created_at),
    desc: truncate(e.description, 60),
  }))
  const widths = {
    id: Math.max(8, ...rows.map((r) => r.id.length)),
    sev: Math.max(6, ...rows.map((r) => r.sev.length)),
    repo: Math.max(8, ...rows.map((r) => r.repo.length)),
    age: Math.max(3, ...rows.map((r) => r.age.length)),
  }

  const header =
    kleur.dim("  ") +
    [
      kleur.bold("id".padEnd(widths.id)),
      kleur.bold("sev".padEnd(widths.sev)),
      kleur.bold("repo".padEnd(widths.repo)),
      kleur.bold("age".padEnd(widths.age)),
      kleur.bold("description"),
    ].join("  ")
  console.log(header)

  for (const r of rows) {
    const sev = r.sev as GapSeverity
    console.log(
      "  " +
        [
          r.id.padEnd(widths.id),
          severityColor(sev)(r.sev.padEnd(widths.sev)),
          r.repo.padEnd(widths.repo),
          kleur.dim(r.age.padEnd(widths.age)),
          r.desc,
        ].join("  "),
    )
  }
  console.log()
  console.log(
    kleur.dim(
      `  ${queue.entries.length} entr${queue.entries.length === 1 ? "y" : "ies"} pending`,
    ),
  )
  console.log()
}

async function runClearMode(opts: GapReportOpts): Promise<void> {
  const queuePath = opts.queuePath ?? defaultQueuePath()
  const queue = readQueue(queuePath)
  const n = queue.entries.length

  if (n === 0) {
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ cleared: 0, queuePath }, null, 2) + "\n",
      )
      return
    }
    console.log(kleur.dim("Queue already empty."))
    return
  }

  let proceed = Boolean(opts.yes) || opts.json === true
  if (!proceed) {
    if (!process.stdin.isTTY) {
      console.error(
        kleur.red(
          "✗ refusing to clear without confirmation in non-TTY. pass --yes.",
        ),
      )
      process.exitCode = 1
      return
    }
    const ans = await prompts({
      type: "confirm",
      name: "ok",
      message: `Clear ${n} pending gap${n === 1 ? "" : "s"}?`,
      initial: false,
    })
    proceed = Boolean(ans.ok)
  }

  if (!proceed) {
    console.log(kleur.dim("Aborted."))
    return
  }

  const cleared = clearQueue(queuePath)
  if (opts.json) {
    process.stdout.write(
      JSON.stringify({ cleared, queuePath }, null, 2) + "\n",
    )
    return
  }
  console.log(kleur.green(`✓ Queue cleared (${cleared} removed)`))
}

function runExportMode(opts: GapReportOpts): void {
  const target = opts.export
  if (!target) {
    console.error(kleur.red("✗ --export requires a path argument"))
    process.exitCode = 2
    return
  }
  const queuePath = opts.queuePath ?? defaultQueuePath()
  const queue = readQueue(queuePath)
  const absTarget = path.resolve(opts.cwd ?? process.cwd(), target)

  try {
    fs.mkdirSync(path.dirname(absTarget), { recursive: true })
    fs.writeFileSync(absTarget, JSON.stringify(queue, null, 2) + "\n", "utf-8")
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(kleur.red(`✗ failed to write ${absTarget}: ${msg}`))
    process.exitCode = 1
    return
  }

  if (opts.json) {
    process.stdout.write(
      JSON.stringify(
        { exported: queue.entries.length, path: absTarget },
        null,
        2,
      ) + "\n",
    )
    return
  }
  console.log(
    kleur.green(
      `✓ Exported ${queue.entries.length} gap${queue.entries.length === 1 ? "" : "s"} to ${absTarget}`,
    ),
  )
}

/**
 * Dispatcher for `dashkit gap report`. Resolves mode from flags, runs it. Modes
 * are mutually exclusive; if more than one is passed we error with exit 2.
 */
export async function runGapReport(opts: GapReportOpts): Promise<void> {
  const modeFlags = [
    Boolean(opts.list),
    Boolean(opts.clear),
    typeof opts.export === "string",
  ].filter(Boolean).length

  if (modeFlags > 1) {
    console.error(
      kleur.red("✗ --list, --clear, and --export are mutually exclusive"),
    )
    process.exitCode = 2
    return
  }

  if (opts.list) return runListMode(opts)
  if (opts.clear) return runClearMode(opts)
  if (typeof opts.export === "string") return runExportMode(opts)
  return runLogMode(opts)
}

// ─────────────────────────────────────────────────────────────────────────
// `dashkit gap sync` — push local queue to dashboard API
// ─────────────────────────────────────────────────────────────────────────

export type GapSyncOpts = {
  /** Override dashboard URL. Defaults to DASH_DASHBOARD_URL env. */
  url?: string
  /** Bearer token. Defaults to DASH_CEO_TOKEN env. */
  token?: string
  /** Skip the upload step and just print what would be sent. */
  dryRun?: boolean
  /** JSON output (for scripted use). */
  json?: boolean
  /** Override queue path (tests). */
  queuePath?: string
}

/**
 * POST pending entries to `<url>/api/dashboard/requests` in a single bulk call.
 *
 * On success, flips each entry's local status from "pending" to "synced" so
 * subsequent runs are no-ops. Already-synced entries are skipped.
 *
 * The dashboard endpoint is idempotent on `id` — replaying a sync that
 * partially succeeded is safe.
 */
export async function runGapSync(opts: GapSyncOpts): Promise<void> {
  const queuePath = opts.queuePath ?? defaultQueuePath()
  const url = opts.url ?? process.env.DASH_DASHBOARD_URL
  const token = opts.token ?? process.env.DASH_CEO_TOKEN

  if (!url) {
    console.error(
      kleur.red(
        "✗ dashboard URL not configured. Set --url or DASH_DASHBOARD_URL.",
      ),
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

  const queue = readQueue(queuePath)
  const pending = queue.entries.filter((e) => e.status === "pending")

  if (pending.length === 0) {
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ synced: 0, skipped: queue.entries.length }, null, 2) +
          "\n",
      )
      return
    }
    console.log(
      kleur.dim(
        `Nothing to sync (${queue.entries.length} total, all already synced).`,
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
      console.log(`  ${shortId(e.id)}  ${e.severity}  ${truncate(e.description, 60)}`)
    }
    return
  }

  const endpoint = url.replace(/\/$/, "") + "/api/dashboard/requests"
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
      // Conflict (entries already exist server-side) is tolerable — bump
      // statuses locally so we don't retry forever.
      console.log(
        kleur.yellow(
          `! server reported conflict (${res.status}). Marking local entries synced anyway.`,
        ),
      )
    } else {
      console.error(
        kleur.red(`✗ dashboard rejected sync (${res.status}): ${detail.slice(0, 200)}`),
      )
      process.exitCode = 1
      return
    }
  }

  // Mark local entries as synced.
  const syncedIds = new Set(pending.map((e) => e.id))
  for (const e of queue.entries) {
    if (syncedIds.has(e.id)) e.status = "synced"
  }
  writeQueue(queue, queuePath)

  if (opts.json) {
    process.stdout.write(
      JSON.stringify({ synced: pending.length, endpoint }, null, 2) + "\n",
    )
    return
  }
  console.log(
    kleur.green(`✓ Synced ${pending.length} gap${pending.length === 1 ? "" : "s"} to ${endpoint}`),
  )
}

/** Re-export for the dispatcher in index.ts. */
export { GAP_QUEUE_SCHEMA_VERSION } from "../lib/gap-queue.js"

/** Exposed for tests. */
export type { GapEntry, GapSeverity }
