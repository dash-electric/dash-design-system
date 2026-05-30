/**
 * `dashkit sync` — scan consumer repo for installed @dash items, compare each
 * against the latest registry version, and update those that drifted.
 *
 * Flags:
 *   dashkit sync                  interactive — list outdated, prompt per item
 *   dashkit sync --check          report only, no install
 *   dashkit sync --all            auto-update all outdated (no prompt)
 *   dashkit sync --json           machine-readable output (no prompts, no writes)
 *   dashkit sync <name...>        update only the listed components
 *   dashkit sync --auto-upgrade   only apply patch bumps (skip minor + major)
 *   dashkit sync --dry-run        preview without writing
 *
 * Bump classification reads the `@dash version` header injected by
 * `dashkit add`. When the header is missing or unparsable, sync falls back to
 * a checksum compare and labels the bump "unknown" — still safe to upgrade
 * but the user is informed.
 *
 * Update flow:
 *   - Show ≤20-line preview diff per file.
 *   - Prompt: [y]es / [N]o / [d]iff full / [s]kip.
 *   - On "y", back up existing files into `.dash-backup/<timestamp>/` before
 *     overwriting. Atomic per-file (tmp + rename).
 *
 * Side-effect free under --check / --json / --dry-run.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import ora from "ora"
import prompts from "prompts"
import {
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
  resolveTargetPath,
} from "../lib/components-json.js"
import { fetchRegistryItem } from "../lib/registry-fetch.js"
import { collectInfo } from "./info.js"
import {
  classifyBump,
  formatSemVer,
  parseDashHeader,
  sha256,
  stripUpdatedStamp,
  type BumpType,
  type SemVer,
} from "../lib/component-version.js"
import { renderFull, renderPreview } from "../lib/diff-renderer.js"
import { resolveTheme } from "../lib/theme-resolver.js"
import type { RegistryItem, ComponentsJson } from "../lib/schema.js"
import type { InfoSnapshot } from "./info.js"

export type SyncOpts = {
  /** Restrict sync to these component names (positional args). */
  names?: string[]
  all?: boolean
  check?: boolean
  dryRun?: boolean
  json?: boolean
  autoUpgrade?: boolean
  registryUrl?: string
  token?: string
  noCache?: boolean
  cwd?: string
  /** Layer-2 theme override (`ride` | `logistic` | …). */
  theme?: string
  /** Inject a pre-built snapshot (testing). */
  _snapshot?: InfoSnapshot
  /** Inject a fetcher (testing) to avoid network. */
  _fetchItem?: (name: string) => Promise<RegistryItem>
  /**
   * Inject a stdin-style answer queue (testing). Each prompt consumes one
   * answer in order. Valid values: "y" | "n" | "d" | "s".
   */
  _answers?: Array<"y" | "n" | "d" | "s">
}

export type SyncItemStatus =
  | "up-to-date"
  | "drift"
  | "missing-local"
  | "fetch-failed"

export type SyncItemReport = {
  name: string
  type: string
  status: SyncItemStatus
  localVersion: string
  remoteVersion: string
  bump: BumpType
  /** SHA prefix when version parse failed. */
  localChecksum?: string
  remoteChecksum?: string
  updated?: string | null
  /** Files that differ (relative to cwd). Only populated for `drift`. */
  changedFiles: string[]
  error?: string
}

export type SyncReport = {
  cwd: string
  registryUrl: string
  total: number
  drift: number
  upToDate: number
  failed: number
  updated: number
  skipped: number
  dryRun: boolean
  check: boolean
  backupDir: string | null
  items: SyncItemReport[]
}

type CompareResult = {
  status: SyncItemStatus
  changed: string[]
  localVersion: SemVer | null
  remoteVersion: SemVer | null
  localRaw: string | null
  remoteRaw: string | null
  localChecksum: string
  remoteChecksum: string
  updated: string | null
}

function readFirstExistingFile(
  item: RegistryItem,
  cwd: string,
  config: ComponentsJson | null,
): { content: string; relPath: string } | null {
  if (!item.files?.length) return null
  for (const f of item.files) {
    const target = resolveTargetPath(f, config, cwd)
    if (fs.existsSync(target)) {
      return {
        content: fs.readFileSync(target, "utf-8"),
        relPath: path.relative(cwd, target),
      }
    }
  }
  return null
}

function compareItem(
  item: RegistryItem,
  cwd: string,
  config: ComponentsJson | null,
): CompareResult {
  const changed: string[] = []
  let anyExists = false
  let localContent = ""
  let remoteContent = ""

  if (item.files?.length) {
    for (const f of item.files) {
      const target = resolveTargetPath(f, config, cwd)
      const remote = f.content ?? ""
      if (!fs.existsSync(target)) {
        changed.push(path.relative(cwd, target))
        remoteContent ||= remote
        continue
      }
      anyExists = true
      const local = fs.readFileSync(target, "utf-8")
      localContent ||= local
      remoteContent ||= remote
      // Ignore the volatile `@dash updated <date>` line — only real code
      // differences (or `@dash version` bumps) count as drift.
      if (stripUpdatedStamp(local) !== stripUpdatedStamp(remote)) {
        changed.push(path.relative(cwd, target))
      }
    }
  }

  const localHeader = localContent ? parseDashHeader(localContent) : null
  const remoteHeader = remoteContent ? parseDashHeader(remoteContent) : null

  const status: SyncItemStatus = !anyExists
    ? "missing-local"
    : changed.length === 0
      ? "up-to-date"
      : "drift"

  return {
    status,
    changed,
    localVersion: localHeader?.version ?? null,
    remoteVersion: remoteHeader?.version ?? null,
    localRaw: localContent,
    remoteRaw: remoteContent,
    localChecksum: localContent ? sha256(localContent) : "",
    remoteChecksum: remoteContent ? sha256(remoteContent) : "",
    updated: remoteHeader?.updated ?? null,
  }
}

/**
 * Build the sync report without applying any changes. Pure read.
 */
export async function planSync(opts: SyncOpts): Promise<{
  report: SyncReport
  fetched: Map<string, RegistryItem>
}> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ??
    config?.registries?.["@dash"]?.url ??
    DEFAULT_REGISTRY_URL

  const snap =
    opts._snapshot ??
    (await collectInfo({
      cwd,
      registry: registryUrl,
      token: opts.token,
    }))

  let installed = snap.dash.installedItems
  if (opts.names?.length) {
    const wanted = new Set(opts.names)
    installed = installed.filter((i) => wanted.has(i.name))
  }

  const fetched = new Map<string, RegistryItem>()
  const items: SyncItemReport[] = []

  for (const inst of installed) {
    let remote: RegistryItem
    try {
      remote = opts._fetchItem
        ? await opts._fetchItem(inst.name)
        : await fetchRegistryItem(inst.name, {
            registryUrl,
            token: opts.token,
            noCache: opts.noCache,
            cwd,
          })
      fetched.set(inst.name, remote)
    } catch (err) {
      items.push({
        name: inst.name,
        type: inst.type,
        status: "fetch-failed",
        localVersion: "?",
        remoteVersion: "?",
        bump: "unknown",
        changedFiles: [],
        error: (err as Error).message,
      })
      continue
    }
    const cmp = compareItem(remote, cwd, config)
    const bump =
      cmp.status === "up-to-date"
        ? "none"
        : classifyBump(cmp.localVersion, cmp.remoteVersion)

    items.push({
      name: inst.name,
      type: inst.type,
      status: cmp.status,
      localVersion: formatSemVer(cmp.localVersion),
      remoteVersion: formatSemVer(cmp.remoteVersion),
      bump,
      localChecksum: cmp.localChecksum,
      remoteChecksum: cmp.remoteChecksum,
      updated: cmp.updated,
      changedFiles: cmp.changed,
    })
  }

  const report: SyncReport = {
    cwd,
    registryUrl,
    total: items.length,
    drift: items.filter((i) => i.status === "drift").length,
    upToDate: items.filter((i) => i.status === "up-to-date").length,
    failed: items.filter((i) => i.status === "fetch-failed").length,
    updated: 0,
    skipped: 0,
    dryRun: Boolean(opts.dryRun),
    check: Boolean(opts.check),
    backupDir: null,
    items,
  }

  return { report, fetched }
}

/**
 * Copy an existing target into the timestamped backup tree before we
 * overwrite it. Mirrors the relative path under `cwd/.dash-backup/<ts>/`.
 */
function backupFile(target: string, cwd: string, backupDir: string): void {
  if (!fs.existsSync(target)) return
  const rel = path.relative(cwd, target)
  const dest = path.join(backupDir, rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(target, dest)
}

function atomicWrite(target: string, content: string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`
  fs.writeFileSync(tmp, content, "utf-8")
  fs.renameSync(tmp, target)
}

function applyUpdate(
  remote: RegistryItem,
  cwd: string,
  config: ComponentsJson | null,
  backupDir: string,
  dryRun: boolean,
): number {
  if (!remote.files?.length) return 0
  let written = 0
  for (const f of remote.files) {
    const target = resolveTargetPath(f, config, cwd)
    const content = f.content ?? ""
    if (dryRun) {
      console.log(
        kleur.dim(`  · [dry-run] would write ${path.relative(cwd, target)}`),
      )
      written++
      continue
    }
    backupFile(target, cwd, backupDir)
    atomicWrite(target, content)
    console.log(kleur.green(`  ↻ ${path.relative(cwd, target)}`))
    written++
  }
  return written
}

function bumpLabel(bump: BumpType): string {
  switch (bump) {
    case "major":
      return kleur.red().bold("major")
    case "minor":
      return kleur.yellow("minor")
    case "patch":
      return kleur.green("patch")
    case "none":
      return kleur.dim("none")
    case "unknown":
      return kleur.dim("unknown")
  }
}

function statusGlyph(status: SyncItemStatus): string {
  switch (status) {
    case "up-to-date":
      return kleur.green("✓")
    case "drift":
      return kleur.yellow("△")
    case "missing-local":
      return kleur.dim("?")
    case "fetch-failed":
      return kleur.red("✗")
  }
}

function printTable(report: SyncReport): void {
  console.log(kleur.bold().cyan(`\nDash sync`))
  console.log(
    kleur.dim(
      `  registry: ${report.registryUrl}\n  scanned: ${report.total} item(s)\n`,
    ),
  )
  if (report.total === 0) {
    console.log(
      kleur.dim(
        "  No installed @dash items detected. Run `dashkit add` first.",
      ),
    )
    return
  }
  console.log(
    kleur.dim(
      `  ${"".padEnd(2)} ${"name".padEnd(28)} ${"local".padEnd(10)} ${"upstream".padEnd(10)} ${"bump".padEnd(8)} ${"updated".padEnd(12)}`,
    ),
  )
  for (const item of report.items) {
    const upd = item.updated ?? "—"
    const line = `  ${statusGlyph(item.status)} ${item.name.padEnd(28)} ${item.localVersion.padEnd(10)} ${item.remoteVersion.padEnd(10)} ${bumpLabel(item.bump).padEnd(8 + 9 /* color codes */)} ${kleur.dim(upd.padEnd(12))}`
    console.log(line)
    if (item.status === "fetch-failed" && item.error) {
      console.log(kleur.red(`      ${item.error}`))
    }
  }
  console.log(
    kleur.bold().dim(
      `\n  ${report.upToDate} up-to-date · ${report.drift} drifted · ${report.failed} failed`,
    ),
  )
}

type PromptAnswer = "y" | "n" | "d" | "s"

async function askPerItem(
  item: SyncItemReport,
  injected?: PromptAnswer,
): Promise<PromptAnswer> {
  if (injected) return injected
  const ans = await prompts({
    type: "text",
    name: "v",
    message: `Update ${kleur.cyan(item.name)} ${item.localVersion} → ${item.remoteVersion} [${bumpLabel(item.bump)}]? (y/N/d=diff/s=skip)`,
    initial: "n",
    validate: (v: string) =>
      ["y", "n", "d", "s", ""].includes(v.toLowerCase().trim())
        ? true
        : "expected y / n / d / s",
  })
  const raw = String(ans.v ?? "n").toLowerCase().trim()
  if (raw === "" || raw === "n") return "n"
  if (raw === "y" || raw === "d" || raw === "s") return raw as PromptAnswer
  return "n"
}

export async function runSync(opts: SyncOpts): Promise<SyncReport> {
  const cwd = opts.cwd ?? process.cwd()
  const spinner = opts.json
    ? null
    : ora("Scanning installed @dash items").start()
  const { report, fetched } = await planSync(opts)
  spinner?.succeed(`Scanned ${report.total} item(s)`)

  // Theme drift warning: if a local file's `@dash theme` header doesn't match
  // the active theme, surface it so the user notices cross-theme installs.
  if (!opts.json && !opts.check) {
    const config = readComponentsJson(cwd)
    const active = resolveTheme({
      cliFlag: opts.theme,
      componentsJson: config,
    })
    for (const item of report.items) {
      if (item.status === "fetch-failed") continue
      const remote = fetched.get(item.name)
      const localFile = remote ? readFirstExistingFile(remote, cwd, config) : null
      if (!localFile) continue
      const header = parseDashHeader(localFile.content)
      if (header.theme && header.theme !== active.name) {
        console.log(
          kleur.yellow(
            `! ${item.name}: local theme "${header.theme}" != active "${active.name}"`,
          ),
        )
      }
    }
  }

  // JSON path: machine output only, no writes.
  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n")
    return report
  }

  printTable(report)

  // --check: report only.
  if (opts.check) {
    return report
  }

  const driftedItems = report.items.filter((i) => i.status === "drift")
  if (driftedItems.length === 0) {
    console.log(kleur.green(`\n✓ All components current`))
    return report
  }

  const config = readComponentsJson(cwd)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupDir = path.join(cwd, ".dash-backup", timestamp)
  report.backupDir = path.relative(cwd, backupDir)
  let backupCreated = false

  const answerQueue = opts._answers ? [...opts._answers] : null
  const consumeAnswer = (): PromptAnswer | undefined => answerQueue?.shift()

  for (const item of driftedItems) {
    const remote = fetched.get(item.name)
    if (!remote) continue

    // --auto-upgrade: only apply patches.
    if (opts.autoUpgrade && item.bump !== "patch") {
      report.skipped++
      console.log(
        kleur.dim(
          `  · ${item.name} skipped (${item.bump} — auto-upgrade is patch-only)`,
        ),
      )
      continue
    }

    let decision: PromptAnswer | "y-auto" = opts.all ? "y-auto" : "n"

    if (!opts.all) {
      // Loop allowing user to press "d" then re-prompt.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // Show short preview before prompting (only first time / not after y/n/s).
        const local = readFirstExistingFile(remote, cwd, config)
        const remoteContent = remote.files?.[0]?.content ?? ""
        if (local) {
          console.log(
            kleur.bold(`\n△ ${item.name} ${item.localVersion} → ${item.remoteVersion} (${item.bump})`),
          )
          console.log(renderPreview(local.content, remoteContent, { maxLines: 20 }))
        }
        const answer = await askPerItem(item, consumeAnswer())
        if (answer === "d") {
          if (local) {
            console.log(kleur.bold(`\n— full diff: ${item.name} —`))
            console.log(renderFull(local.content, remoteContent, { context: 3 }))
          } else {
            console.log(kleur.dim("  (no local copy to diff against)"))
          }
          // Loop again to re-ask y/n/s.
          continue
        }
        decision = answer
        break
      }
    }

    if (decision === "n" || decision === "s") {
      report.skipped++
      console.log(kleur.dim(`  · ${item.name} skipped`))
      continue
    }

    // Create backup root lazily — only when we actually write.
    if (!backupCreated && !opts.dryRun) {
      fs.mkdirSync(backupDir, { recursive: true })
      backupCreated = true
      console.log(kleur.dim(`  backup: ${path.relative(cwd, backupDir)}`))
    }

    const written = applyUpdate(remote, cwd, config, backupDir, Boolean(opts.dryRun))
    if (written > 0) report.updated++
  }

  if (!backupCreated) {
    report.backupDir = null
  }

  console.log(
    kleur.bold().green(
      `\n✓ Sync complete — ${report.updated} updated, ${report.skipped} skipped`,
    ),
  )
  if (opts.dryRun) {
    console.log(kleur.yellow(`(dry-run — no changes applied)`))
  }
  return report
}
